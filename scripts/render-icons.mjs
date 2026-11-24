// Renders the brand badge (AlpacaBadge in src/components/Alpaca.tsx) into the favicon and app icons:
//   npm run render:icons
// Writes public/favicon.svg, scripts/icon.svg and the PNGs (192, 512, maskable 512, apple-touch 180)
// through headless Chrome (CHROME=/path/to/chrome to override).
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEBUG = 9338;
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { createServer } = await import(resolve(root, "node_modules/vite/dist/node/index.js"));
const vite = await createServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
// React itself is loaded natively: Vite's SSR runner cannot evaluate its CommonJS build.
const req = createRequire(resolve(root, "package.json"));
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");
const { AlpacaBadge } = await vite.ssrLoadModule("/src/components/Alpaca.tsx");
await vite.close();

const svg = (size) =>
  renderToStaticMarkup(React.createElement(AlpacaBadge, { size }))
    .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(/ aria-hidden="true" class="alpaca-badge"/, "");
writeFileSync(resolve(root, "public/favicon.svg"), svg(64));
writeFileSync(resolve(root, "scripts/icon.svg"), svg(512));

const dir = mkdtempSync(join(tmpdir(), "alpaca-icons-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${DEBUG}`, `--user-data-dir=${dir}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
try {
  let page;
  for (let i = 0; i < 40 && !page; i++) {
    await sleep(250);
    try {
      page = (await (await fetch(`http://127.0.0.1:${DEBUG}/json/list`)).json()).find((t) => t.type === "page");
    } catch {}
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) (pending.get(msg.id)(msg), pending.delete(msg.id));
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

  // [file, size, badge share]: the maskable icon keeps the badge inside the 80% safe zone.
  for (const [file, size, scale] of [["icon-512.png", 512, 0.96], ["icon-192.png", 192, 0.96], ["apple-touch-icon.png", 180, 0.92], ["icon-maskable-512.png", 512, 0.76]]) {
    const html = join(dir, "icon.html");
    writeFileSync(html, `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;background:#ffffff;display:flex;align-items:center;justify-content:center">${svg(Math.round(size * scale))}</body></html>`);
    await send("Emulation.setDeviceMetricsOverride", { width: size, height: size, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: "file://" + html });
    await sleep(500);
    const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
    writeFileSync(resolve(root, "public", file), Buffer.from(shot.result.data, "base64"));
    console.log("wrote public/" + file);
  }
  ws.close();
} finally {
  chrome.kill();
}
