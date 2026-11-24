# Prompt: write the next lessons of the course

Paste one of these into a new Claude Code session opened in this repository.

**Write a whole new epoch** (replace `e2` and `EPOCH_2`):

```text
Write epoch e2 of the Alpaca Greek course as src/program/epoch2.ts (EPOCH_2), following
docs/LESSON_PROMPT.md exactly. Read the files it lists first. Write lessons 1–10, run
`npm run validate:program` and `npm run typecheck`, do the self-review pass from the prompt,
then write 11–20 and repeat. Show me the list of lessons with their type, new words and grammar,
and the self-review findings you fixed.
```

**Finish a partly written epoch** (adjust the epoch and the lesson range):

```text
Write lessons 11–20 of epoch e2 of the Alpaca Greek course, appending them to EPOCH_2 in
src/program/epoch2.ts, following docs/LESSON_PROMPT.md exactly. Read the files it lists first.
Do not change lessons 1–10. Then run `npm run validate:program` and `npm run typecheck`,
do the self-review pass from the prompt, fix every finding, and show me the list of new lessons
with their type, new words and grammar.
```

An epoch has 20 lessons. If one session cannot fit them all, write lessons 1–10 first, validate and self-review them, and append 11–20 in the next session with the second prompt.

---

## What you are writing

Alpaca Greek is a course for a Russian speaker who lives in Cyprus (Larnaca) and learns Standard Modern Greek. The goal is a **real A2**, confirmed by the **Ελληνομάθεια A2** exam of the Κέντρο Ελληνικής Γλώσσας. The course has 8 epochs × 20 lessons, one lesson a day of about 35–45 minutes.

- A **core** lesson is one organic flow. The new words appear in a dialogue, the grammar is what that dialogue used, the practice drills exactly those words and that grammar, and the lesson ends with writing about the learner's own life. Words, grammar and writing are never separate topics.
- Everything a human teacher would usually review (essays, letters, spoken role-plays) is reviewed by an **AI**. The app builds the review prompt and turns the AI's corrections into personal exercises. You write the task; you do not write the review.
- The learner **types** every answer. The app lowercases and strips punctuation, then compares with `answer` and `accept` exactly, stress marks included. There is no human in the loop: an answer you did not list is wrong. Read the section «Typed exercises» before writing a single exercise.

## Read first

1. `src/program/types.ts`: the format (Lesson, LessonType, Step, Exercise).
2. `src/program/curriculum.ts`: the plan. Every lesson has a `type`, a theme, a grammar point (or what is practised or tested) and a «can do» goal. Follow it, including the type of each lesson. You may refine a lesson's details; if you do, update its curriculum entry to match and mention it in your summary.
3. `src/program/epoch1.ts` and every other written epoch: the vocabulary and grammar the learner already has, and the characters. For style, lessons 16–19 of epoch 1 are the reference; `docs/reviews/epoch1-review.md` lists what was wrong with the rest and why.
4. `src/data/words.json`: the card deck (1286 words; `el` is the exact Greek, `day` is its place in the deck plan; days 193+ are A2 topics).
5. `src/program/aiPrompts.ts`: what the AI receives for `essay` and `speak` steps, so you know how much the task text must say.

## Output

- **A new epoch:** create `src/program/epochN.ts` exporting `EPOCH_N: Epoch` (`id`, `level`, `title`, `titleRu`, `summary` from the curriculum). The app finds `epoch*.ts` files by themselves and loads each epoch on demand; nothing needs registering.
- **A partly written epoch:** append the missing lessons to its `lessons` array. Never edit, reorder or remove lessons that already exist: progress is stored by position (lesson ids, step and exercise indexes).
- Lesson ids are `eN-lNN` and match the position in the curriculum (`e1-l11` is the 11th lesson of epoch 1).
- Run `npm run validate:program` and `npm run typecheck`. Both must pass. Fix warnings too unless there is a good reason. The validator checks structure, not language: the self-review pass below is what checks the language.

## The people

Characters are persistent. Use these facts and never contradict them; invent a new name (not a new biography for an old name) when a scene needs someone else.

- **Πάβελ** — the learner. 35, from Russia, lives alone in a flat in the centre of Larnaca, works from home at the computer (IT), learns Greek at a language school. One brother (28) and his parents, all in Russia; **no sister**. Mobile 99 45 28 36. Do not give him a wife, children or a job in Cyprus: dialogues ask him about Russia and his life here, not about a family you invented.
- **Άννα** — Greek from Athens, 32, works in a bank in the centre of Larnaca, lives in Limassol with her son. Big family in Greece (brother in Athens with a daughter, two sisters in Thessaloniki, father a teacher, mother in a bank). Pavel's friend. Greek is her native language: she never *learns* Greek. No husband is ever mentioned; do not invent one.
- **Νίκος** — Cypriot from Larnaca, 35, works in the καφετέρια «Θάλασσα» in the centre, lives in the centre with Μαρία and their daughter (6). Two brothers in Nicosia, one sister in Larnaca. Mobile 96 73 15 40.
- **Μαρία** — Greek from Athens, Nikos's wife, works in a taverna by the sea.
- **Ελένη** — Greek from Athens, 30, Pavel's Greek teacher (the «Δασκάλα» in class scenes from e1-l07 on). Moves next door to Pavel in e1-l12 and greets him as her student. Teaches in the evening. Two brothers and a sister.
- **Κάτια** — Russian, Pavel's classmate from e1-l13 (they learn Greek together with Ελένη). Lives with Ελένη, works evenings in a taverna on Φοινικούδες, does not eat fish. Brother (18) and parents in Russia.
- **Γιώργος** — Cypriot, 34, Nikos's friend, works at Larnaca airport, married, two children. Pavel met him at the «Θάλασσα» in e1-l15.
- **Αντρέας and Σοφία** — neighbours from Limassol (Αντρέας 28, works in a bank; Σοφία a teacher), son 5, daughter 2; Σοφία's mother is Russian, so she learns Russian.
- Roles without a biography: Σερβιτόρος, Πωλήτρια, Ταξιτζής, Γιατρός, and one-off people with a new name.

**Who knows whom.** Everyone above knows Pavel by the end of epoch 1, so nobody introduces themselves to him again, and nobody asks him what they already know (Anna knows where he is from). A scene where Pavel meets someone needs a new person. When a scene adds a lasting fact (a new job, a move, a pet), add it to this list in the same change.

Places are real: Λάρνακα (Φοινικούδες, the centre, the airport), Λεμεσός, Λευκωσία, Αγία Νάπα; prices in euro; Cypriot mobile numbers start with 99/96/97 and have 8 digits; shops close early on Wednesday and Saturday afternoons; the language is Standard Greek even when the setting is Cypriot.

## Lesson types

Set `type` on every lesson as the curriculum says (`core` is the default when omitted).

### core: new material (12 per epoch)

1. `{ kind: "words" }`: 8–12 new words in `words` (exact `el` from the deck). Words missing from the deck go to `extraWords` with `tr` (Russian-letter transcription with a stress mark, as in the deck) and `ru`. Every new word appears **at least twice** in the lesson: in the text, and in an exercise answer or the write model.
2. `dialogue` (8–12 lines; in A2 epochs up to 16) or `reading` (6–12 sentences). Use most of the new words and show the grammar point several times. See «Texts» for what makes it real.
3. `grammar`: one point, explained in short Russian sentences (no final periods in `p` blocks). Give a table, examples taken from the dialogue, and the typical mistake of a Russian speaker. If the practice needs a form the table does not show (a plural ending, a stress shift), add it to the table.
4. `practice`: 14–18 exercises using only this lesson's words plus earlier vocabulary:
   - 5–7 `gap`: one `___`; the answer is short; `hint` says what to put («хотеть: мы», «3: средний род»), never the answer. Add `— перевод` to the prompt when the meaning is not obvious. Use `options` only when choosing is the point (ο / η / το).
   - 4–5 `translate`: Russian → Greek, up to 8 words in A1 and up to 14 in A2. Follow the `accept` policy below.
   - 2 `listen` (sentences from the lesson's own text), 1 `build` (4–8 words; `extra` holds 2 wrong forms that are not in the answer), 2 `spot` (one may be a correct sentence: no brackets, and `fix` is identical).
5. `write`: a short personal task (3–6 sentences) with `hints` (lowercase `check` keywords without accents, for example `"μενω"`) and a `model` in Pavel's voice that is true to his persona. In A2 epochs a core lesson may end with a short `essay` (60–90 words) instead.

### practice: no new grammar, harder work (4 per epoch, before each task)

Practice days must feel like the hardest days of the week.

- No `words` step. At most 5 `extraWords`, only if a text really needs them.
- One long text: `reading` of at least 120 words in A1 (150–300 in A2), and one listening text: a `dialogue` or `reading` with `listenFirst: true`, 6–10 lines. Each is followed by its own `practice` step, so its comprehension questions refer to it. The two texts are different genres (see «Texts»).
- 18–25 exercises in total:
  - 5–8 `choose`: comprehension of the text before them; 3–4 options; questions and options may be in Russian (A1) or in simple Greek (A2), like the exam. Distractors are details that *are* in the text about someone or something else, never absurd options («Ничего», «Не сказал»).
  - Transformations with `gap` and `translate`: change the person, number, tense or case («Перепиши во мн. ч.», «Скажи то же в прошедшем»), with the source sentence in the prompt: `"Μένω με τη φίλη μου. → Η Κάτια ___ με τη φίλη της."`.
  - 2–3 `listen` sentences built from the text.
  - 3–4 `translate` of longer sentences that together make a short paragraph.
  - 2–3 `spot`.
- Optionally finish with a `write`.

### task: AI-reviewed work (3–4 per epoch)

- A short `reading` that works as a model (how such a letter, message or story looks): with the opening and closing a real one has (`Γεια σου, Πάβελ!` … `Φιλιά, Ελένη`), then 3–5 `choose` questions in a `practice` step, plus 3–5 `gap` / `translate` that rehearse the exact phrases the essay needs (not lesson-2 gaps).
- An `essay` step:
  - `task`: in Russian, concrete, about the learner's real life, naming the addressee and the situation.
  - `requirements`: what must be in it — content points, grammar to use («используй аорист», «минимум три союза: όταν, επειδή, αλλά»), the register (informal/formal letter) and the opening/closing formula.
  - `words`: the length from the curriculum.
- A `speak` step:
  - `title`.
  - `scenario`: who, where, what happens, in 2–3 Russian sentences, with one complication (the shop has no small size; the taxi is late).
  - `aiRole`: who the AI plays, with the facts it needs: «продавщица на рынке в Ларнаке, помидоры по 2 € за кило, сдачи с 50 € нет».
  - `goals`: 3–5 things the learner must do in the conversation (ask the price, bargain, pay by card…).
- Optionally a short `practice` (6–10 exercises) with the language needed for the task, before the essay.

### test: exam format (the last lesson of each epoch, and the mock exams)

Follow the four parts of Ελληνομάθεια, scaled to the epoch's level:

1. **Reading:** a `reading` (A1: 80–150 words, A2: 150–300 words) in an exam genre: a notice, a menu or price list, an advert, a short message, a form, a short article. Not a personal letter if the epoch already had one. Then `practice` with 6–8 `choose`.
2. **Listening:** a `dialogue` or `reading` with `listenFirst: true`, then `practice` with 5–8 `choose`.
3. **Language use:** `practice` with 12–15 exercises that cover **every core lesson of the epoch at least once** (list the lessons against the items before you finish); include one connected mini-cloze (3–4 gaps in consecutive sentences of one short text).
4. **Writing:** one or two `essay` steps (a short message and a longer text, like the exam), with requirements that name the epoch's grammar. In A1 the short one may be a form (όνομα, ηλικία, πόλη, τηλέφωνο) followed by a message.
5. **Speaking:** a `speak` step: introduce yourself, describe something, then a role-play from the epoch's themes.

No `words` step in a test.

## Texts: dialogues and readings

The texts are what the learner remembers. They must read as something that happened in Larnaca, not as a grammar display.

- **One genre per text, and never the same genre twice in a row** across the epoch: a conversation at a counter, a phone call, a WhatsApp exchange, a note on the fridge, a menu, a shop sign, a timetable, an advert, a form, a short story about a neighbour, a letter. An epoch with twenty texts has at least eight genres.
- **At most two self-presentation texts per epoch** («Με λένε … Είμαι από … Μένω … Δουλεύω … Η οικογένειά μου …»). Epoch 1 had five; the learner needs other shapes. **Each unit (core×3 + practice + task) has at least one functional non-dialogue text**: a form, a notice, a timetable, a price list, an advert, a note, a message thread.
- **Every text has a reason to exist**: someone wants something (a bigger phone, milk and bread, to not speak Russian today). The reader can answer «what did they want, did they get it?».
- **One imperfection per dialogue**: a hesitation (Ε… να δω), a check (Μόνο αυτά; · Με γάλα;), a correction (Α, όχι, συγγνώμη), a number or a price, a real place. Without it the dialogue is a form-drill.
- **Rotate the closings and openers.** Not every dialogue ends with Ωραία! / Εντάξει! / Τα λέμε! / Καλή όρεξη!. Do not use the same final line twice in an epoch. Rotate with Έγινε, Μάλιστα, Τέλεια, Πάμε, Καλά, Τέλος πάντων, Άντε, or simply end on the content.
- **Untaught words in texts** are allowed only as transparent fixed phrases (Ορίστε, Εμπρός;, Κανένα πρόβλημα, Φιλιά) or as the 1–2 words a scene cannot do without, at most 3 per text, each glossed by the Russian line. They are never typed answers.
- **Untaught grammar** may appear only inside a fixed phrase the learner hears whole (Τι θέλετε; in lesson 5) and never as an exercise answer.
- **Recycling**: every text reuses at least three words from the two previous lessons and one structure from the previous unit. A practice text reuses something from every core lesson of its unit.
- **Russian lines** are translations a Russian would say, not glosses: «Ты где?» for Πού είσαι;, «Беру!» for Το παίρνω!. A Russian line may not explain the gender in brackets («А это (она)?»): if the Greek needs that, the Greek line is wrong.

Good (e1-l19): `Πάω στο σούπερ μάρκετ. Θέλεις κάτι; — Ναι, ευχαριστώ! Ένα γάλα και ψωμί, παρακαλώ. — Εντάξει. Μόνο αυτά; — Και δύο μήλα για τα παιδιά.`
Bad (e1-l06): `Δουλεύω στο σπίτι. Η δουλειά μου είναι εκεί.` — says nothing; nobody says it.
Bad (e1-l13): `Το σπίτι μας είναι μικρό, αλλά η κουζίνα μας είναι μεγάλη.` in a text about Nikos's house — a sentence inserted only to show μας.

## Typed exercises

### Designing a Russian prompt for `translate`

The Russian sentence must have **one** natural Greek rendering, up to the variants you list. Before writing it, ask: could a good learner translate this differently and be right?

- Tense: Russian perfective future («приедешь») has no A1 Greek equivalent; use present-meaning sentences in A1 («Когда ты приезжаешь?» → `Πότε έρχεσαι;`).
- Articles: Russian has none. If both «Έχω τα κλειδιά» and «Έχω κλειδιά» fit, list both, or make the sentence specific («свои ключи» → `τα κλειδιά μου`).
- Idioms: «Как ты?» is both `Πώς είσαι;` and `Τι κάνεις;` — list both or ask for «Как дела?».
- Word order: Greek adverb and object order is free-ish. Use the neutral order as `answer` (`να μιλάω καλά ελληνικά`, not `ελληνικά καλά`) and list the marked one in `accept`.
- Numbers, names and places remove ambiguity; prefer them.

### `accept` policy (enumerate, do not guess)

**The answer checker (`checkAnswer` in `src/lib/greek.ts`) already accepts these on its own; do not list them:**

- the subject pronoun of a 1st/2nd-person verb, at the start, right after the verb or at the end, added or dropped (`Μένω…` = `Εγώ μένω…` = `Μένω εγώ…`; `Πού δουλεύεις;` = `Εσύ πού δουλεύεις;`). This works for verbs in the deck; 3rd-person pronouns (`αυτός`, `αυτή`) are **not** automatic;
- `μία` / `μια`, `-ουν` / `-ουνε`, the -άω doublets (`μιλάει` / `μιλά`, `μιλάμε` / `μιλούμε`, `μιλάνε` / `μιλούν` / `μιλάν`), `καινούριος` / `καινούργιος`, `επτά` / `εφτά`, `οκτώ` / `οχτώ`, `εννέα` / `εννιά` (also in δεκα-).

Everything else is yours. For every `translate` and typed `gap`, go down this list and add each variant that applies:

1. **Subject pronoun** for the 3rd person: if the Russian has «он / она / они», accept the form with `αυτός / αυτή / αυτοί` (`Είναι από την Κύπρο.` / `Αυτή είναι από την Κύπρο.`).
2. *(automatic: μία / μια)*
3. *(automatic: 3rd plural doublets)*
4. **Final ν**: `answer` always writes `δεν`, `την`, `στην`, `τον`, `στον` (ν kept before vowels and κ, π, τ, μπ, ντ, γκ, τσ, τζ, ξ, ψ; `τον`/`στον` keep it always). Accept `δε` / `τη` / `στη` **only** before the other consonants (`δε βλέπω`, `τη Ρωσία`). Never accept `δε καταλαβαίνω`, `δε τρώω`, `τη Κύπρο`: those are the mistakes the course teaches against.
5. **Optional words**: `χρονών` after an age, `παρακαλώ` at the end of an order, `κι` for `και` before a vowel.
6. **Order**: time words first or last (`Αύριο θέλουμε…` / `Θέλουμε… αύριο`); «а я — в Ларнаке» with `και εγώ` / `κι εγώ` / `αλλά εγώ μένω`.
7. **Two taught phrasings** of one meaning (`Είναι καλή ταβέρνα;` / `Είναι μια καλή ταβέρνα;`).

What is **not** accepted: a less-taught synonym (όμορφος for ωραίος in A1), a different tense, Cypriot forms (εν, τζαι, έσσω).

### `gap`

- The answer is one form; the hint names the slot (`"быть: вы"`, `"артикль: вин. мн."`). If two forms fit the slot (`επειδή` / `γιατί`, `είστε` / `είσαστε`), list them in `accept`.
- Everything the learner needs is in the prompt or the hint; never rely on a dialogue line they may not remember.
- A transformation gap shows its source: `"Έχω ένα παιδί. → Έχω δύο ___."`.
- `options` only when choosing is the point (articles); the app records an answer chosen from options as «hinted».

### `build`

One sentence per build: tiles keep their capitals, so a second sentence gives itself away (`Τα` in `Χαίρω πολύ! Τα λέμε!`). Tiles must assemble in exactly one natural order. Do not use a sentence whose adverb or object can move (`Μιλάμε λίγο ελληνικά` is borderline; `Θέλεις να δουλεύεις εδώ;` is fine). `extra` tiles are wrong *forms* of answer words (ένας for έναν, τη for την), not unrelated words.

### `spot`

The bracketed part must make the sentence **ungrammatical in every reading**, not just wrong for the Russian line. `Θέλω να [πάει] στη θάλασσα` is a correct sentence («хочу, чтобы он пошёл»): not a spot item. `Θέλω [πάω] στη θάλασσα` (no να) is. The `explain` names the rule in one line.

### `listen`

Sentences taken from this lesson's text, 3–8 words, with a stress or spelling point in them (double accent, final ς, ει/οι). Numbers and phone numbers are good dictations.

### `choose`

Only comprehension. The question is answerable from the text and not from common sense; distractors are facts from the text about someone else. Ask about details (who, how old, what time, how much, why), not «what is the text about».

## Vocabulary discipline

`npm run validate:program` warns about the rules below. It matches word stems, so an irregular form can slip past it: it is a safety net, not a substitute for the self-review. What it checks:

- every typed word (gap, translate, build, listen) is taught in this or an earlier lesson. Names are skipped only if they are in `NAMES` in `scripts/validate-program.mjs`: **add each new character or place there** (a capital letter alone does not make a word a name: `Σάββατο` and `Κύπρο` are words to teach);
- every new word is in the lesson's dialogue or reading **and** in an exercise or the write model (grammar notes, hints and the word card do not count);
- the longest text of a practice lesson has at least 120 words, of a test at least 80.

Rules:

- A word may be a **typed answer** (gap, translate, build, listen) only if it is in `words` or `extraWords` of this or an earlier lesson. Check every answer against the taught set; in epoch 1, `βλέπω`, `περιμένω`, `γυναίκα`, `έρχεσαι`, `μεγάλη` were typed answers before they were taught — do not repeat that.
- A new word that is used nowhere in its lesson is a bug (epoch 1 had `η πόλη`, `το όνομα`, `κακός`, `κολυμπάω`, `γράφω`). If the lesson cannot use a planned word twice, move it to a later lesson.
- Prefer deck words with low `day` numbers; an A1 lesson should not introduce a day-145 word (`κολυμπάω`) while day-20 words (το πρωί, το βράδυ, η μέρα) are still untaught but used.
- Each lesson's `write` model and essay requirements use only taught words, and are true to «The people»: the model is what the learner copies (epoch 1 had `γονείς`, `Μόσχα`, `κουζίνα` in models, and a model that gave Pavel a sister).

## Language rules

- Standard Modern Greek (Κοινή), not Cypriot dialect. Monotonic accents; every word of two or more syllables has a stress mark; monosyllables have none except πού, πώς, ή, and the enclitic second accent (η οικογένειά μου, ο γείτονάς μου).
- Final ν as in the `accept` policy above. Final `ς`. The question mark is `;`.
- **No Latin letters inside Greek text** (o/ο, a/α, v/ν and x/χ look the same; the validator checks).
- Grammar appears in the order of the curriculum. Before a form is taught, it may appear in a dialogue only as a fixed phrase, and never as an exercise answer.
- Every Greek sentence must be natural and correct. Check each one twice: articles agree with gender and case, stress moves where it should (`δάσκαλος → δασκάλου`, `άνθρωποι → ανθρώπους`), verb endings match the person and tense, and the sentence is something a native would say in that situation (`αλλά όχι ακριβό`, not `αλλά δεν θέλω ένα ακριβό`).
- Russian text is natural Russian. Comprehension questions test understanding of the text, not knowledge of the world.

## Fields

- `title`: a Greek phrase the learner will be able to say (for a test: `Τεστ A1.2`).
- `titleRu`: its translation.
- `goal`: begins with «Сможешь: …» and names a concrete situation («заказать два кофе и попросить счёт»), not a grammar label.
- `scene`: one of `village` (white houses, blue domes), `harbor` (sea, boats), `temple` (columns on a hill), `grove` (olive trees, sunset). Vary them.

## Do not

- Edit, reorder or remove existing lessons, steps or exercises. New material goes at the end.
- Edit `src/data/words.json` or the review prompts in `aiPrompts.ts`.
- Add exercise kinds, step kinds or fields: the app renders only what `types.ts` defines. If something is truly missing, describe it in your summary instead.
- Give a recurring character a new biography, or the learner a family.

## Self-review pass (after the validator passes, before you report)

Re-read every lesson you wrote as the learner, in order, and fix what you find. Report what you changed.

1. **Characters**: every fact about every named person matches «The people», including write models, essay requirements, speak roles and phone numbers. Nobody is introduced to Pavel twice; nobody asks what they already know.
2. **Genres**: list the genre of each text; no genre twice in a row; the test reading is not another personal letter.
3. **Taught-before-typed**: for every typed answer, every word is taught by now. For every new word, find its two uses.
4. **`accept` walk**: for every `translate` and typed `gap`, go through the seven-point policy. Delete any `δε`/`τη` before κ, π, τ, μπ, ντ, γκ, τσ, τζ, ξ, ψ.
5. **Spot**: each bracketed part is ungrammatical in every reading.
6. **Build**: only one natural order; `extra` are wrong forms of answer words.
7. **Naturalness**: read each Greek line aloud as a Larnaca local; rewrite anything you would not say. Read each Russian line as a Russian; rewrite glosses.
8. **Tics**: count Ωραία! / Εντάξει! / Τα λέμε! at line ends; keep each at most twice per ten lessons.
9. **Practice and test weight**: count the words of each practice and test reading (≥ 120 and 80–150 in A1); a listening text with its own questions; 18–25 exercises; write down the test's language items against the core lessons they check, and include the mini-cloze.
10. **Hints and prompts** never contain the answer; comprehension distractors come from the text.

## Final checklist

- [ ] Every lesson's `type` matches the curriculum; ids `eN-lNN` follow the plan positions
- [ ] core: words → dialogue/reading → grammar → practice → write; every new word used twice
- [ ] practice: long text (≥ 120 words) and listening text, each with its own comprehension practice; 18–25 exercises
- [ ] task: model text with a real opening and closing → rehearsal exercises → essay and speak with concrete requirements, goals and a complication
- [ ] test: reading in an exam genre, listening, language use covering every core lesson, writing, speaking
- [ ] Exercises use only vocabulary and grammar the learner already has; `accept` policy applied to every typed item
- [ ] Characters and places match «The people»
- [ ] `npm run validate:program` passes
- [ ] `npm run typecheck` passes
- [ ] Self-review pass done; findings fixed and listed
- [ ] Summary for the user: each lesson's type, title, new words and grammar, plus anything you changed in the curriculum
