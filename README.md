# Alpaca Greek

A Greek course for Russian speakers, from zero to a real A2 (the Ελληνομάθεια A2 exam), in daily lessons of about 35–45 minutes. Essays, letters and spoken role-plays are reviewed by an AI. It also has a word deck (Leitner box) and targeted grammar drills. It is a PWA that works offline and installs on iPhone and Mac, and it is ready to wrap with Capacitor for the App Store later.

## Run

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ (the service worker works here, not in dev)
```

Checks: `npm run typecheck`, `npm run validate:program` (course content), `npm run test:answers` (answer checker), `npm run smoke -- e2` (opens every lesson of an epoch in headless Chrome; run `npm run build` first).

**Deploy:** every push to `main` builds and publishes to GitHub Pages (`.github/workflows/deploy.yml`): https://papalkov.github.io/alpaca-greek/. Install on a device: open that URL in Safari, then **Share → Add to Home Screen** on iPhone, or **File → Add to Dock** on Mac. Progress lives in the browser of each device (IndexedDB), so keep the URL stable.

## Sections

- **Сегодня** — the current lesson of the course. One lesson is a single flow:
  1. Warm-up: due cards and due exercises from earlier lessons
  2. New words (from the deck, so they enter the Leitner box)
  3. A dialogue or text that uses those words
  4. The grammar that the dialogue used
  5. Practice with only those words and that grammar: typed gaps, translation, dictation, sentence building, finding the mistake
  6. Writing about yourself, with a self-ticking checklist and a model text

  Leaving mid-lesson remembers the step. «Шаги» in the lesson header opens any step in any order. «Изменить» sets the current lesson by hand, for example when the phone and the Mac are at different lessons.
- **Курс** — 8 epochs («разделы» in the UI) × 20 lessons to A2 (`src/program/curriculum.ts`), about 150 hours with warm-ups and AI tasks. Every epoch has four units: three core lessons, a practice lesson (long texts, listening comprehension, transformations, translation), and a task (an essay and a role-play reviewed by AI). The last lesson is a test in the Ελληνομάθεια format. The page shows written lessons, done marks, your texts, and the outline of what is not written yet.
- **AI review** ([docs/AI_REVIEW.md](docs/AI_REVIEW.md)) — essay and speaking steps, plus «Свой текст на проверку» for any text, build a ready prompt for ChatGPT or Claude (copy it, or open the chat with it). You paste the answer back: the app saves the score, and every mistake becomes a personal «Исправь свою ошибку» exercise in the Leitner box («Мои ошибки», and the warm-up).
- **Слова** — the full deck, separate from the course: 1286 words in 216 days from `greek_cards.pdf`, each with transcription, past tense and two examples. Learning a day puts its cards into box 1. Reviews follow the same 5-box Leitner intervals as the paper cards (1, 2, 4, 7, 14 days), and a correct answer from box 5 marks the word as learned. Russian→Greek cards ask you to type the word. «День плана» sets which deck day comes next.
- **Грамматика** — eight topics in three groups:
  - **Nouns:** gender, plural, accusative, genitive.
  - **Sentences:** case in a sentence, building a sentence from word tiles, and finding the mistake.
  - **Verbs:** present tense (groups A and B, plus irregular verbs).

  Each topic has a cheat sheet and 10-item drills, and the same Leitner boxes decide what comes back. Answers are typed; «Показать варианты» is a hint, and a hinted answer is not counted as known. Typing is strict about stress: «Почти: ударение» counts as a mistake. Wrong options are the mistakes the homework warns about: wrong article, wrong case, a stress that did not move (`τους άνθρωπους`), and `τη/την`. **Практика** mixes due and weak items from every topic. A wrong answer comes back once at the end of the round.
- **Статистика** — answers over 28 days, accuracy per topic, card direction, and JSON backup and restore.

## Writing the next epochs

Epochs 1–2 (A1.1, A1.2) are written and reviewed (`src/program/epoch1.ts`, `epoch2.ts`); epochs 3–8 are planned in `curriculum.ts`. Ask Claude Code «generate epoch 3»: the project skill [`.claude/skills/epoch`](.claude/skills/epoch/SKILL.md) runs the whole pipeline. It generates with a background agent following [`docs/LESSON_PROMPT.md`](docs/LESSON_PROMPT.md) (lesson types, task sizes, exam-format tests, language rules, character facts, checklist). Then it validates, runs an independent review by a Greek-teacher agent (`docs/reviews/`) and applies verified fixes. The checks:

```sh
npm run validate:program   # types match the plan, deck words exist, exercises are solvable, no Latin letters in Greek
npm run typecheck
```

Lesson, step and exercise positions are progress keys: once an epoch is in use, add material at the end and never reorder.

## Typing Greek

You don't need a Greek keyboard. In answer fields, Latin keys type Greek letters using the standard Greek layout (a→α, h→η, u→θ, c→ψ, v→ω, j→ξ). Press `;` and then a vowel to add stress, or `;` twice for the Greek question mark. Final σ becomes ς automatically. Touch screens use the phone's own keyboard. For a phone without a Greek layout, the αβγ button (or the setting in Статистика) switches to the app's Greek keypad, and the device remembers the choice. Practice shortcuts: `1`–`4` choose an option, `Enter` checks and moves on, and `Space` reveals a word card.

## Code map

| Path | What |
| --- | --- |
| `src/program/` | The course: `types.ts` (format), `curriculum.ts` (road to A2), `epochN.ts` (lessons, loaded lazily per epoch), `index.ts` (exercise → item conversion) |
| `src/sections/lesson/` | Lesson player, step screens (words, text, grammar, practice, write, essay, speak), course progress |
| `src/program/aiPrompts.ts` | Review prompts for essays, role-plays and free texts |
| `src/lib/mistakes.ts` | Reads the AI reply, the personal error bank |
| `scripts/validate-program.mjs` | Content checks for the course |
| `src/data/words.json` | Word deck, generated by `scripts/extract_cards.py` |
| `src/grammar/nouns.ts` | Noun tables (6 forms each) and article rules (`τη/την`, `στη/στην`) |
| `src/grammar/sentences.ts` | Homework sentences with `{noun:slot}` gaps |
| `src/grammar/practice.ts` | "Find the mistake" and "build the sentence" items |
| `src/grammar/verbs.ts` | Present tense: group A, group B, irregular |
| `src/grammar/questions.ts` | Item types (choice / build / spot / translate / listen), topics, cheat sheets |
| `src/sections/practice/Session.tsx` | The practice engine for every exercise type |
| `src/components/GreekInput.tsx` | Greek input: Latin→Greek mapping, accent key, on-screen keypad |
| `src/lib/greek.ts` | Answer checking (strict about stress, reports accent-only mistakes) |
| `src/lib/leitner.ts` | Box intervals and scheduling |
| `src/storage/` | `ProgressStore` interface + IndexedDB (Dexie) implementation |
| `src/components/Alpaca.tsx` | The mascot (laurel, sunglasses, meander bandana; moods: calm, happy, sad, think) and the round brand badge |
| `src/components/Scene.tsx` | 12 lesson covers (Larnaca and Cyprus places), chosen per lesson by `scene` |
| `src/components/StepMenu.tsx` | «Шаги»: the lesson contents in the focus header |
| `src/lib/settings.ts` | Practice settings (in progress) and device settings (keypad, side menu; in localStorage) |
| `.claude/skills/epoch/` | The epoch pipeline skill for Claude Code |
| `docs/reviews/` | Independent reviews of each epoch, with what was applied |

To add a grammar topic, add nouns or sentences and a `Topic` entry in `questions.ts`. Question ids are stored in progress, so append new sentences at the end instead of inserting them in the middle.

## Updating the word deck

```sh
python3 -m pip install pypdf
npm run extract:cards -- ~/Desktop/Греческий/greek_cards.pdf
```

## Storage and native apps

All progress goes through `ProgressStore` (`src/storage/progressStore.ts`). Today that is IndexedDB, and the app calls `navigator.storage.persist()` so that Safari keeps the data. For a Capacitor build, add another implementation backed by `@capacitor-community/sqlite` or `@capacitor/preferences` and switch it in `src/storage/index.ts`. Cross-device sync, for example through Supabase, would be another implementation of the same interface.

## Icons

The source is `AlpacaBadge` in `src/components/Alpaca.tsx`. After changing it, run `npm run render:icons` (it needs Google Chrome). That rewrites `public/favicon.svg`, `scripts/icon.svg` and the PNG icons, including a maskable one with the badge inside the safe zone. iPhones keep the icon from when the app was added to the home screen.
