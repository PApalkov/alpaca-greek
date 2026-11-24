# Alpaca Greek: notes for Claude

A PWA course of Standard Modern Greek for Russian speakers in Cyprus, from zero to a real A2 (the Ελληνομάθεια exam). The owner learns Greek in Larnaca and uses the app daily on an iPhone and a Mac. The README describes the features and the code map. This file records how to work here and why things are the way they are.

## The bar

The goal is that people really learn the language. Content must be complete and correct, with "no errors on our side" and no AI slop. Every new epoch therefore gets an independent review by a separate agent acting as a Greek teacher and examiner, and the review's verified findings are applied before the epoch counts as done. Use the project skill `/epoch` («generate epoch 3», «review epoch 3»): `.claude/skills/epoch/SKILL.md`.

## Commands

```sh
npm run dev | build | preview
npm run typecheck
npm run validate:program   # course content: structure, taught-before-typed, word use, text length
npm run test:answers       # answer checker cases (scripts/check-answers.mjs)
npm run smoke -- e2        # every lesson of an epoch in headless Chrome (build first)
npm run render:icons       # favicon + app icons from AlpacaBadge (needs Chrome)
```

## Deploy and git

- A push to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`, about 40 s): https://papalkov.github.io/alpaca-greek/. The repo is public.
- Commit and push only when the owner asks. When they say "commit and push" or "deploy", wait for the Pages run (`gh run list`) and confirm the live bundle before reporting.
- Progress is stored per device in IndexedDB on that origin. Never change the URL or the storage keys casually.

## Rules that are easy to break

- **Progress is positional.** Lesson ids, step indexes and exercise indexes are Leitner keys (`g:lesson.<id>.<step>.<ex>`). Never insert, delete or reorder lessons, steps or exercises in a written epoch: change in place or append at the end of a step. Dialogue and reading lines, word lists, titles and `scene` are safe to edit.
- **Content is data:** `src/program/epochN.ts`. Epochs are found by `import.meta.glob` and loaded lazily, one chunk each, so nothing needs registering.
- **Answers are typed and checked strictly**, stress included (`src/lib/greek.ts`). Variants that will recur belong in `checkAnswer`, not in hand-written `accept` lists: subject pronouns, μία/μια, -ουν/-ουνε, -άω doublets, καινούργιος, αβγό, εφτά/οχτώ/εννιά and -κόσια, and a kept ν where it is not needed. Add a case to `scripts/check-answers.mjs` for every new variant.
- **Russian UI.** An epoch is «раздел» to the learner (ενότητα in Greek titles), never «эпоха». No gamification (no points, stars or coins); the owner removed them on purpose.
- **Characters and facts** live in «The people» in `docs/LESSON_PROMPT.md`. Every lesson, model text and role-play must match them, and every lasting new fact is added there.
- **Design:** a modern tech-app look (Inter, neutral surfaces, Aegean-blue accent, light and dark theme, adaptive: sidebar on desktop, tab bar on phone, full-screen focus mode for lessons). This app does **not** use the inDrive design system from the owner's global instructions; they chose this style for it. The mascot follows the owner's reference badge: cream alpaca, laurel wreath, navy sunglasses, blue meander bandana, thick navy outline with a white sticker halo (`Alpaca.tsx`). Lesson covers are 12 Cyprus scenes (`Scene.tsx`). On narrow cards only about x 70–320 of the 390-wide art is visible.

## How to edit content safely

- **Many edits to an epoch:** write one Python script in the scratchpad with a `rep(old, new)` helper that asserts each anchor occurs exactly once (plus `after()` for appends), back up the file first, and run the script once. Then run typecheck, validate, `test:answers`, build and smoke.
- **Before applying a reviewer's fix,** check it against the other lessons. Fixes have contradicted each other before; for example, an essay addressee who had already met Pavel.

## Browser testing (Chrome DevTools Protocol)

- `npm run smoke` handles its own setup. For custom checks, drive headless Chrome over CDP against `npx vite preview`.
- The service worker and HTTP cache serve stale bundles. Clear them with `Storage.clearDataForOrigin` (`service_workers,cache_storage`) and `Network.setCacheDisabled`.
- Hash-only navigation does not reload the page: navigate to `about:blank` first.
- On a fresh headless profile, IndexedDB setup can be slow. Wait for `.loading` to disappear.

## Working with the owner

- Communicates in English and Russian. Wants a short status line during long work and a "ping" when long jobs finish.
- No destructive shell commands: no `rm`, no `sed -i`, no long chained commands. Use Edit and Write, and ask before deleting anything.
- Never read or reuse credentials or tokens. `gh` authenticating itself is fine.
- They often ask for features mid-task. Finish the current change cleanly, then take the new one.

## Open items

- **Validator false positives:** 6 warnings on -ομαι/-άμαι forms in e2 (έρχεται, κοιμούνται…), because `stem()` cuts έρχομαι to ερχο-. Proposed fix in `stem()`: `if ((x.endsWith("ομαι") || x.endsWith("αμαι")) && x.length > 6) return x.slice(0, -4);`. Not applied yet; it is waiting for the owner's OK.
- **Vocabulary debt for epoch 3:** `το σχολείο`, `η τράπεζα` (used in texts, never taught).
- **Offered but not done:**
  - lazy-loading the 530 KB word deck;
  - push reminders (declined for now: they need a small server, since iOS PWAs only get Web Push from the home-screen app);
  - a Capacitor build for the App Store;
  - cross-device sync behind `ProgressStore`.
- **Deck source:** `~/Desktop/Греческий/greek_cards.pdf` (`npm run extract:cards`). The owner's grammar homework PDFs are in `~/Desktop/Греческий/ДЗ/`.
