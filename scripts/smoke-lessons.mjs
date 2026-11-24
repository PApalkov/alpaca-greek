// Opens lessons of the built app in headless Chrome and reports runtime errors:
//   npm run build && npm run smoke -- e2        (one epoch; default: every written epoch)
// Starts its own `vite preview` and Chrome (CHROME=/path/to/chrome to override). Exit code 1 on errors.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const only = process.argv[2];
const PORT = 4179;
const DEBUG = 9339;
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Lesson ids straight from the content, through Vite (same loader as the validator).
const { createServer } = await import(resolve(root, "node_modules/vite/dist/node/index.js"));
const vite = await createServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const { WRITTEN_EPOCHS, loadEpochs, loadedEpochs } = await vite.ssrLoadModule("/src/program/index.ts");
await loadEpochs(WRITTEN_EPOCHS);
const ids = loadedEpochs().filter((e) => !only || e.id === only).flatMap((e) => e.lessons.map((l) => l.id));
await vite.close();
if (!ids.length) throw new Error(`no lessons for "${only}"`);

const preview = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], { cwd: root, stdio: "ignore" });
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${DEBUG}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "alpaca-smoke-"))}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
const stop = () => (preview.kill(), chrome.kill());

try {
  let page;
  for (let i = 0; i < 40 && !page; i++) {
    await sleep(250);
    try {
      page = (await (await fetch(`http://127.0.0.1:${DEBUG}/json/list`)).json()).find((t) => t.type === "page");
    } catch {}
  }
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) break;
    } catch {}
    await sleep(250);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params.exceptionDetails.exception?.description?.split("\n")[0]);
    if (msg.id && pending.has(msg.id)) (pending.get(msg.id)(msg), pending.delete(msg.id));
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
  await send("Runtime.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width: 400, height: 820, deviceScaleFactor: 1, mobile: true });

  let bad = 0;
  for (const lessonId of ids) {
    const before = errors.length;
    // about:blank first: a hash-only change would not reload the page.
    await send("Page.navigate", { url: "about:blank" });
    await sleep(150);
    await send("Page.navigate", { url: `http://localhost:${PORT}/#/lesson/${lessonId}` });
    let title;
    for (let i = 0; i < 40 && !title; i++) {
      await sleep(250);
      title = await ev("document.querySelector('.focus-title')?.textContent");
    }
    const steps = await ev("(document.querySelector('.step-menu > button') ? 1 : 0)");
    const ok = title && steps && errors.length === before;
    if (!ok) bad++;
    console.log(ok ? "ok  " : "FAIL", lessonId, "·", title ?? "(did not open)", errors.slice(before).join(" | "));
  }
  ws.close();
  console.log(bad ? `${bad} of ${ids.length} lessons failed` : `all ${ids.length} lessons open without errors`);
  process.exitCode = bad ? 1 : 0;
} finally {
  stop();
}
