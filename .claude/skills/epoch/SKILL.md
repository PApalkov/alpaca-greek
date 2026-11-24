---
name: epoch
description: Write the next epoch («раздел», 20 lessons) of the Alpaca Greek course and take it all the way to release quality — generation by a background agent, validation, an independent review by a Greek teacher agent, verified fixes, final checks. Use for "generate/write epoch N", "review epoch N", "apply the review of epoch N", "next раздел".
---

# Epoch pipeline

The owner's bar: the course must really teach Greek to a real A2. No AI slop, no errors on our side. Every epoch therefore goes through **generate → validate → independent review → verify and apply → final checks** before it is called done. Phases can be run alone (`review 3`, `apply 3`).

Read `CLAUDE.md` (rules of the repo) and skim `docs/LESSON_PROMPT.md` (the authoring spec) before starting.

## 0. Which epoch

- The argument names it (`3`, `e3`). Otherwise take the first `CURRICULUM` epoch in `src/program/curriculum.ts` that has no `src/program/epochN.ts`.
- A partly written epoch (fewer lessons than planned) is finished by appending, never by rewriting: progress is positional.
- Start from a clean `git status`, so the epoch's changes are reviewable as one diff.

## 1. Generate (background agent)

This is long work: epoch 2 took one agent about 50 minutes. Spawn a `general-purpose` agent in the background; do not write the lessons inline. Give it this brief, with N filled in:

```text
Write epoch eN of the Alpaca Greek course as src/program/epochN.ts (EPOCH_N), following
docs/LESSON_PROMPT.md exactly; read everything its «Read first» lists, including all written
epochs and every file in docs/reviews/ (what earlier reviewers found wrong — do not repeat it).
Write lessons 1–10, run `npm run validate:program`, `npm run typecheck` and `npm run test:answers`,
do the prompt's self-review pass, then write 11–20 and repeat. Aim for zero validator warnings.
You may refine eN entries in src/program/curriculum.ts (say so), add lasting character facts to
«The people» in docs/LESSON_PROMPT.md, and add new names to NAMES in scripts/validate-program.mjs.
Do not edit epoch files other than epochN.ts, src/data/words.json, or app code. If something
outside your files needs changing (a validator false positive, a checker variant), describe it
in your report instead of working around it. Report: a table of lessons (type, title, new words,
grammar, text genre), curriculum changes, self-review fixes, and the Greek lines you are least
sure of, for the reviewer to check.
```

While it runs, do not touch `epochN.ts`. When it reports, relay the summary to the owner. If the agent asks for an edit it was not allowed to make, put that question to the owner. Do not do it on the agent's behalf.

## 2. Validate

`npm run typecheck && npm run validate:program && npm run test:answers`. Zero errors is required. Explain every warning that remains: known false positives are listed in `CLAUDE.md`.

## 3. Independent review (separate agent, Fable)

Spawn a fresh agent with `model: "fable"` in the background. Independence matters: give it the files, not the author's reasoning, and **do not** let it read `docs/reviews/`. Brief:

```text
You are a professional teacher of Modern Greek to Russian speakers and an examiner for the
Ελληνομάθεια certificate (A1/A2). Review src/program/epochN.ts (epoch N, level <level>, 20 lessons)
of the Alpaca Greek course as an independent reviewer. The course is for Russian speakers living in
Larnaca who want to really reach A2; the owner's standard is "full and effective, with no errors on
our side, not AI slop".
Context (read-only): src/program/curriculum.ts, src/program/types.ts, docs/LESSON_PROMPT.md (rules
and character facts; check the content against them and say where a rule is pedagogically wrong),
all earlier src/program/epoch*.ts (what the learner knows; continuity), src/lib/greek.ts
(checkAnswer: strict stress; automatic variants are listed in its doc comment; every other correct
variant must be in `accept`), src/grammar/questions.ts (build and spot mechanics), src/data/words.json.
Do NOT read docs/reviews/. You may run npm run validate:program and read-only scripts; verify traps
with checkAnswer.
Review lesson by lesson as the learner, then as an editor: Greek correctness and naturalness
(Standard Greek, not Cypriot), Russian, typed exercises (every correct answer accepted, solvable,
only taught material, spot wrong in every reading, build with one order), pedagogy (grammar notes
true and sufficient, A2 exam coverage, practice/test weight, real varied texts), continuity,
mechanics. Explicitly verify these lines the author flagged: <paste the author's list>.
Write docs/reviews/epochN-review.md: Verdict + top 5; counts by severity (error / trap / weak / nit);
issues by lesson located as lNN s[n] ex[n] (0-based) with the exact current text and a concrete
replacement in TS syntax; systemic observations; recommended changes to LESSON_PROMPT.md.
Fixes must be in place or appended at the end of a step — never delete or reorder lessons, steps or
exercises. Touch no file except the review. Reply with the verdict, counts and top problems.
```

## 4. Verify and apply (main session)

- **Read the whole review and verify before applying.** Reviewers can be wrong. Run `checkAnswer` on claimed traps, check claimed contradictions in the text, and keep the epoch's own facts consistent: a fix in one lesson can contradict another, as with l15 vs l20 in epoch 1.
- **Back up first:** copy `epochN.ts` to the scratchpad.
- **Apply with one Python patch script in the scratchpad.** Use a `rep(old, new, tag)` helper that asserts each anchor occurs exactly once, plus `after(anchor, added)` for appends. Run it once. Nothing is written unless every anchor matches.
- **Positional rule:** change exercises in place or append them at the end of a step. Dialogue and reading lines, word lists, titles and scenes are free to edit.
- **Systemic findings go to code, not hand edits.** An answer variant that will recur goes into `checkAnswer` (`src/lib/greek.ts`), with new cases in `scripts/check-answers.mjs`. An authoring rule goes into `docs/LESSON_PROMPT.md`.
- **Record the outcome in the review:** add a «Status: applied» section to `docs/reviews/epochN-review.md` listing deviations from the reviewer's fixes and why.
- **Give every lesson a fitting cover.** `scene` should match where its story happens (12 scenes, see `LESSON_PROMPT.md` «Fields»), and no two lessons in a row share one.

## 5. Final checks

```sh
npm run typecheck && npm run validate:program && npm run test:answers
npm run build && npm run smoke -- eN     # opens every lesson of the epoch in headless Chrome
```

Then report to the owner: lessons, review verdict and counts, what was fixed, what was left and why. Commit and push only when the owner asks: a push to `main` deploys to GitHub Pages.
