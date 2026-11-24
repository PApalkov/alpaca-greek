// Checks the course content in src/program: `npm run validate:program`.
// Exit code 1 on errors; warnings are printed but do not fail.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { createServer } = await import(resolve(root, "node_modules/vite/dist/node/index.js"));
const server = await createServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "error" });

const { WRITTEN_EPOCHS, loadEpochs, loadedEpochs, CURRICULUM, LESSON_ITEMS } = await server.ssrLoadModule("/src/program/index.ts");
await loadEpochs(WRITTEN_EPOCHS);
const EPOCHS = loadedEpochs();
const { wordByEl } = await server.ssrLoadModule("/src/data/words.ts");
const { normalizeAnswer } = await server.ssrLoadModule("/src/lib/greek.ts");

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// Keep in sync with SCENES in src/components/Scene.tsx.
const SCENES = ["village", "harbor", "temple", "grove", "promenade", "market", "beach", "lake", "church", "night", "home", "mountain"];
const LATIN = /[A-Za-z]/;
const GREEK = /[Ͱ-Ͽἀ-῿]/;
const plain = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("el");

/** Greek strings must not hide Latin look-alikes (o, a, v, x, p…). */
function greekOnly(where, s) {
  if (typeof s !== "string" || !s.trim()) return err(where, "empty Greek text");
  // Level codes (A1, A2.3) are allowed; any other Latin letter is probably a look-alike typo.
  if (LATIN.test(s.replace(/\b[AB][12](\.\d)?\b/g, ""))) err(where, `Latin letters inside Greek text: "${s}"`);
  if (!GREEK.test(s)) err(where, `no Greek letters: "${s}"`);
}

const ids = new Set();
const seenWords = new Map();

for (const epoch of EPOCHS) {
  const plan = CURRICULUM.find((p) => p.id === epoch.id);
  if (!plan) err(epoch.id, "epoch is not in src/program/curriculum.ts");
  else if (plan.lessons.length !== epoch.lessons.length) warn(epoch.id, `${epoch.lessons.length} of ${plan.lessons.length} planned lessons written`);

  epoch.lessons.forEach((lesson, li) => {
    const at = lesson.id ?? `${epoch.id}[${li}]`;
    const expected = `${epoch.id}-l${String(li + 1).padStart(2, "0")}`;
    if (lesson.id !== expected) err(at, `id should be "${expected}"`);
    if (ids.has(lesson.id)) err(at, "duplicate lesson id");
    ids.add(lesson.id);
    if (!SCENES.includes(lesson.scene)) err(at, `scene must be one of ${SCENES.join(", ")}`);
    greekOnly(`${at}.title`, lesson.title);
    if (!lesson.goal?.startsWith("Сможешь:")) warn(at, 'goal should start with "Сможешь:"');

    for (const el of lesson.words) {
      if (!wordByEl.has(el)) err(at, `word "${el}" is not in the deck (exact "el" from src/data/words.json), move it to extraWords`);
      if (seenWords.has(el)) warn(at, `word "${el}" is already new in ${seenWords.get(el)}`);
      seenWords.set(el, lesson.id);
    }
    for (const w of lesson.extraWords ?? []) {
      greekOnly(`${at}.extraWords`, w.el);
      if (wordByEl.has(w.el)) err(at, `extra word "${w.el}" is in the deck: put it in "words" instead`);
      if (!w.tr || !w.ru) err(at, `extra word "${w.el}" needs tr and ru`);
    }

    const kinds = lesson.steps.map((s) => s.kind);
    const type = lesson.type ?? "core";
    const planned = plan?.lessons[li];
    if (planned && planned.type !== type) err(at, `type "${type}" but the curriculum plans "${planned.type}"`);
    const hasWords = lesson.words.length + (lesson.extraWords?.length ?? 0) > 0;
    if (hasWords && !kinds.includes("words")) err(at, 'has new words but no { kind: "words" } step');
    const hasText = kinds.includes("dialogue") || kinds.includes("reading");
    const exercises = lesson.steps.reduce((n, s) => n + (s.kind === "practice" ? s.exercises.length : 0), 0);
    if (type === "core") {
      if (!kinds.includes("practice")) err(at, "core lesson without practice");
      if (!kinds.includes("grammar") && li > 0) warn(at, "core lesson without a grammar step");
      if (!hasText && li > 0) warn(at, "core lesson without dialogue or reading");
      if (!kinds.includes("write") && !kinds.includes("essay")) warn(at, "core lesson without writing");
    }
    if (type === "practice") {
      if (exercises < 15) warn(at, `practice lesson has ${exercises} exercises (aim for 18–25)`);
      if (!hasText) err(at, "practice lesson needs a long reading or listening text");
    }
    if (type === "task" && !kinds.includes("essay") && !kinds.includes("speak")) err(at, "task lesson needs an essay or a speak step");
    if (type === "test") {
      for (const k of ["reading", "practice", "essay", "speak"]) if (!kinds.includes(k)) err(at, `test lesson needs a "${k}" step`);
      if (!lesson.steps.some((s) => (s.kind === "reading" || s.kind === "dialogue") && s.listenFirst)) err(at, "test lesson needs a listening text (listenFirst)");
    }

    lesson.steps.forEach((step, si) => {
      const sat = `${at}.steps[${si}]`;
      if (step.kind === "dialogue") step.lines.forEach((l, i) => (greekOnly(`${sat}.lines[${i}]`, l.el), l.ru || err(sat, "line without ru")));
      if (step.kind === "reading") step.text.forEach((l, i) => (greekOnly(`${sat}.text[${i}]`, l.el), l.ru || err(sat, "line without ru")));
      if (step.kind === "essay") {
        if (!step.task || !step.requirements?.length) err(sat, "essay needs task and requirements");
        if (!(step.words?.[0] > 0 && step.words[1] > step.words[0])) err(sat, "essay words must be [min, max]");
      }
      if (step.kind === "speak" && (!step.scenario || !step.aiRole || !step.goals?.length)) err(sat, "speak needs scenario, aiRole and goals");
      if (step.kind === "write") {
        step.model.forEach((m, i) => greekOnly(`${sat}.model[${i}]`, m));
        for (const h of step.hints) for (const c of h.check ?? []) if (c !== plain(c)) warn(sat, `hint check "${c}" should be lowercase without accents: "${plain(c)}"`);
      }
      if (step.kind !== "practice") return;
      // Comprehension steps after a text are short by design; a core lesson's practice is not.
      if (type === "core" && step.exercises.length < 12) warn(sat, `only ${step.exercises.length} exercises (aim for 14–18)`);
      step.exercises.forEach((ex, ei) => {
        const eat = `${sat}.exercises[${ei}] (${ex.kind})`;
        const item = LESSON_ITEMS.get(`lesson.${lesson.id}.${si}.${ei}`);
        if (!item) return err(eat, "not converted to an item");
        switch (ex.kind) {
          case "gap":
            if ((ex.prompt.match(/___/g) ?? []).length !== 1) err(eat, 'prompt must contain exactly one "___"');
            greekOnly(`${eat}.answer`, ex.answer);
            if (ex.options && !ex.options.includes(ex.answer)) err(eat, "options do not include the answer");
            if (!ex.hint) err(eat, "hint is required");
            break;
          case "translate":
            greekOnly(`${eat}.answer`, ex.answer);
            (ex.accept ?? []).forEach((a) => greekOnly(`${eat}.accept`, a));
            if (GREEK.test(ex.ru)) warn(eat, "ru prompt contains Greek");
            break;
          case "listen":
            greekOnly(`${eat}.el`, ex.el);
            break;
          case "build": {
            greekOnly(`${eat}.answer`, ex.answer);
            const pool = [...item.tiles];
            for (const w of item.words) {
              const i = pool.indexOf(w);
              if (i < 0) err(eat, `tile "${w}" missing`);
              else pool.splice(i, 1);
            }
            const answerWords = item.words.map((w) => normalizeAnswer(w));
            for (const x of ex.extra ?? []) if (answerWords.includes(normalizeAnswer(x))) err(eat, `extra tile "${x}" is also in the answer`);
            if (item.words.length > 9) warn(eat, `${item.words.length} tiles: long for a beginner`);
            break;
          }
          case "spot": {
            greekOnly(`${eat}.el`, ex.el);
            greekOnly(`${eat}.fix`, ex.fix);
            const bracketed = /\[.+\]/.test(ex.el);
            const bare = ex.el.replace(/[[\]]/g, "");
            if (bracketed && bare === ex.fix) err(eat, "marked wrong part, but fix equals the sentence");
            if (!bracketed && bare !== ex.fix) err(eat, "no [wrong part] marked, but fix differs");
            break;
          }
          case "choose":
            if (!ex.options?.includes(ex.answer)) err(eat, "options do not include the answer");
            if ((ex.options?.length ?? 0) < 3) warn(eat, "fewer than 3 options");
            if (new Set(ex.options).size !== ex.options.length) err(eat, "duplicate options");
            if (!item.context) err(eat, "comprehension question without a dialogue/reading step before it");
            break;
          default:
            err(eat, "unknown exercise kind");
        }
      });
    });
  });
}

// ---------- vocabulary discipline (warnings; stem matching is approximate for an inflected language) ----------
const strip = (w) => plain(w).replace(/ς/g, "σ").replace(/[^\p{L}]/gu, "");
/**
 * Cuts at most 3 letters of ending. Short words stay almost whole (γεια → γει, ναι → ναι, not γε, να),
 * longer ones keep at least 4 letters; verbs lose -ω or -άω (έχω → εχ, μιλάω → μιλ).
 */
const stem = (w) => {
  const x = strip(w);
  if (x.endsWith("αω") && x.length > 4) return x.slice(0, -2);
  if (x.endsWith("ω") && x.length > 2) return x.slice(0, Math.min(x.length - 1, Math.max(3, x.length - 3)));
  if (x.length <= 3) return x;
  return x.slice(0, x.length === 4 ? 3 : Math.max(4, x.length - 3));
};
/** Forms a stem cannot reach: irregular verbs. */
const IRREGULAR = {
  είμαι: ["εισαι", "ειναι", "ειμαστε", "ειστε", "εισαστε"],
  "πάω": ["πασ", "παει", "παμε", "πατε", "πανε"],
  "λέω": ["λεσ", "λεει", "λεμε", "λετε", "λενε"],
  "τρώω": ["τρωσ", "τρωει", "τρωμε", "τρωτε", "τρωνε"],
};
/**
 * People and places of the course that are not deck words. A capitalised word in mid-sentence is
 * checked like any other word unless it is here; add new characters and places as they appear.
 */
const NAMES = new Set(
  "Πάβελ Άννα Νίκος Μαρία Ελένη Κάτια Γιώργος Αντρέας Σοφία Λένα Κώστας Δασκάλα Σερβιτόρος Πωλήτρια Λάρνακα Λεμεσός Λευκωσία Αθήνα Μόσχα Φοινικούδες Θάλασσα"
    .split(" ")
    .map(stem),
);
const isName = (token) => [...NAMES].some((n) => strip(token).startsWith(n));
/** "ο φίλος / η φίλη" → ["φίλος", "φίλη"]; "τρεις, τρία" → both; "πάω / πηγαίνω" → both. */
const lemmas = (el) =>
  el
    .replace(/\(.*?\)/g, " ")
    .split(/[\/,;]/)
    .map((x) => x.trim().split(/\s+/).filter((t) => !["ο", "η", "το", "οι", "τα"].includes(t)))
    .flat()
    .filter(Boolean);
const FUNCTION_WORDS = new Set(
  "ο η το οι τα τον την τη του της των τους τις στο στη στην στον στα στους στις σε με για από και κι αλλά να δεν δε θα μου σου μας σας ένας μία μια ένα έναν ή όχι ναι"
    .split(" ")
    .map(strip),
);
const taughtStems = [];
for (const epoch of EPOCHS) {
  for (const lesson of epoch.lessons) {
    const ownLemmas = [...lesson.words.flatMap(lemmas), ...(lesson.extraWords ?? []).flatMap((w) => lemmas(w.el))];
    const own = [...ownLemmas.map(stem), ...ownLemmas.flatMap((l) => (IRREGULAR[l] ?? []).map(strip))].filter((x) => x.length >= 2);
    taughtStems.push(...own);
    const isTaught = (token) => FUNCTION_WORDS.has(strip(token)) || taughtStems.some((st) => strip(token).startsWith(st));

    // Every new word is met twice in its lesson: in the dialogue/reading and in an exercise.
    // Only Greek the learner reads or types counts (not grammar notes, hints or the word card).
    const tokensOf = (strings) => new Set(strings.join(" ").split(/[\s/]+/).map(strip).filter(Boolean));
    const textTokens = tokensOf(lesson.steps.flatMap((st) => (st.kind === "dialogue" ? st.lines : st.kind === "reading" ? st.text : []).map((l) => l.el)));
    const exerciseTokens = tokensOf(
      lesson.steps.flatMap((st) => [
        ...(st.kind === "practice" ? st.exercises.flatMap((ex) => [ex.prompt, ex.answer, ex.el, ex.fix, ...(ex.extra ?? [])].filter(Boolean)) : []),
        ...(st.kind === "write" ? st.model : []),
      ]),
    );
    const uses = (tokens, el) => lemmas(el).some((l) => {
      const st = stem(l);
      return [...tokens].some((t) => t.startsWith(st));
    });
    for (const el of [...lesson.words, ...(lesson.extraWords ?? []).map((w) => w.el)]) {
      // (The alphabet lesson has no text: nothing to check there.)
      if (textTokens.size && !uses(textTokens, el)) warn(lesson.id, `new word "${el}" is not in the lesson's dialogue or reading`);
      if (!uses(exerciseTokens, el)) warn(lesson.id, `new word "${el}" is not in any exercise or write model`);
    }

    // Practice and test texts are long enough to be real reading.
    const longest = Math.max(0, ...lesson.steps.filter((st) => st.kind === "reading" || st.kind === "dialogue").map((st) => (st.kind === "reading" ? st.text : st.lines).reduce((n, l) => n + l.el.split(/\s+/).filter((t) => GREEK.test(t)).length, 0)));
    const type = lesson.type ?? "core";
    if (type === "practice" && longest < 120) warn(lesson.id, `longest text has ${longest} words (practice: at least 120)`);
    if (type === "test" && longest < 80) warn(lesson.id, `longest text has ${longest} words (test: 80–150)`);

    // Typed answers use only taught words; names from NAMES are skipped.
    lesson.steps.forEach((st, si) => {
      if (st.kind !== "practice") return;
      st.exercises.forEach((ex, ei) => {
        const typed = ex.kind === "gap" || ex.kind === "translate" || ex.kind === "build" ? ex.answer : ex.kind === "listen" ? ex.el : null;
        if (!typed) return;
        const unknown = typed
          .split(/\s+/)
          // Single letters and digraphs (the alphabet lesson) and names are not words to check.
          .filter((t) => /[\u0370-\u03FF\u1F00-\u1FFF]/.test(t) && strip(t).length > 2 && !isName(t))
          .filter((t) => !isTaught(t));
        if (unknown.length) warn(`${lesson.id}.steps[${si}].exercises[${ei}] (${ex.kind})`, `typed answer has words not taught yet: ${unknown.join(", ")}`);
      });
    });
  }
}

await server.close();

const count = EPOCHS.reduce((n, e) => n + e.lessons.length, 0);
console.log(`${EPOCHS.length} epoch(s), ${count} lessons, ${LESSON_ITEMS.size} exercises`);
for (const w of warnings) console.log("  warning", w);
for (const e of errors) console.log("  ERROR  ", e);
console.log(errors.length ? `\n${errors.length} error(s)` : "\nOK");
process.exit(errors.length ? 1 : 0);
