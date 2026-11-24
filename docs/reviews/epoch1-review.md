# Epoch 1 (A1.1) — content review

Reviewed: `src/program/epoch1.ts` (20 lessons, 301 exercises) against `types.ts`, `curriculum.ts`, the checker (`lib/greek.ts`, `Session.tsx`), the deck (`words.json`) and `docs/LESSON_PROMPT.md`. Reviewer stance: Modern Greek teacher / Ελληνομάθεια examiner, Russian-speaking adult learner in Larnaca, typed answers with strict stress.

Indexes below are 0-based: `steps[n]` is the step index inside the lesson, `ex[n]` the exercise index inside that practice step (the same numbers the app stores progress under).

## Status

Applied to `src/program/epoch1.ts` on 2026-11-24, all except two: #11 is solved differently (τρία is now used in a lesson 5 gap; δύο τσάγια stays), and #36 needed no separate change. Fixes were applied without moving saved progress: existing exercises are corrected in place, new exercises are appended at the end of their step, and lesson 10's listening part sits after its practice step. The validator's new vocabulary checks found eight more cases of a word typed before it is taught (κέντρο, θάλασσα, πάω, πρωί, βράδυ, μπορώ, σινεμά, μήλα) and three unused new words (παρακαλώ in l02, τρεις in l05, εκεί in l06); these are fixed too. The coverage gaps in §9 go to the next generation sessions through the prompt.

## Verdict

The epoch is usable and mostly correct Greek. Grammar explanations are short, accurate and well targeted at a Russian speaker (είμαι vs έχω for age, no infinitive, second stress before μου, τη/την rule). Exercises are varied, the hints are clear, and lessons 11–20 are noticeably tighter than 1–10 (better `accept` lists, more natural dialogue lines, l19 is the best lesson in the epoch). The dialogues are not embarrassing; some lines are genuinely how people talk in Larnaca (Εμπρός; · Ο Νίκος είμαι · Θέλεις κάτι; · Μόνο αυτά; · Εντάξει, το παίρνω!).

It is not yet professional. The five problems that matter most:

1. **The recurring characters are not persistent.** Μαρία is a Greek from Athens (l03), Νίκος's wife with a six-year-old (l13), and then a Russian with her family in Russia living with Ελένη and working in a taverna (l14). Άννα is Greek with a son (l08) and Russian with a daughter (l20). Ελένη lives in Limassol and works in a bank (l06), then is a 30-year-old teacher from Athens (l14, l15). The learner notices this; it reads as generated, not written.
2. **The same text four times.** l10, l14, l15 and l20 are all "a letter about myself" opening with Γεια σου! Με λένε X και είμαι … χρονών, and l08/l13/l19 are first-person self-descriptions of the same shape. The exam reads notices, adverts, menus, messages, forms; the epoch never does.
3. **Words required before they are taught, and new words never used.** `βλέπω` (taught l18) is a typed answer in l16; `περιμένω`, `έρχεσαι`, `γυναίκα`, `μεγάλη` are typed answers without ever being new words. Meanwhile `η πόλη`, `το όνομα`, `κακός`, `κολυμπάω`, `γράφω` are "new words" that never appear in their lesson.
4. **`accept` lists are uneven, and four of them accept a form the course itself teaches as wrong** (`Δε καταλαβαίνω`, `Δε τρώω`, `δε τρως`: ν is kept before κ and τ). "Как ты?" rejects `Τι κάνεις;`, the phrase the learner was taught for it.
5. **Practice lessons under-deliver on their own spec.** l10 has no listening text and no comprehension questions; readings are 60–105 words against 120–300; the test's language part skips half the core lessons and its reading is one more personal letter.

Counts: **10 errors · 9 auto-check traps · 21 weak · 18 nits** (58 issues).

## Issues by lesson

Severity: **error** (wrong Greek/Russian/content or a rule of the course broken) · **trap** (a correct learner answer is marked wrong, or an "error" the learner must tap is not an error) · **weak** (correct but poor pedagogy or unnatural) · **nit**.

### e1-l01 Το αλφάβητο

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 1 | steps[1] table row `γκ, γγ` | nit | Example `συγγνώμη` is pronounced [siɣˈnomi], not with [ŋg]; it contradicts the "в середине — нг" it illustrates | Example: `αγγλικά` (англика́); keep συγγνώμη in the words of l02 as an extra word with its real transcription `сигно́ми` |
| 2 | steps[1] | nit | Missing the one σ rule a Russian needs: σ before β, γ, δ, λ, μ, ν, ρ sounds [z] (κόσμος, Σμύρνη) | Add a `p` block: «σ перед β, γ, δ, λ, μ, ν, ρ читается как з: κόσμος — ко́змос» |

### e1-l02 Γεια σου! Πώς σε λένε;

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 3 | steps[3] ex[8] translate «Хорошо, спасибо.» | trap | `Είμαι καλά, ευχαριστώ.` (the deck's own example for καλά) is rejected | `accept: ["Ευχαριστώ, καλά.", "Είμαι καλά, ευχαριστώ.", "Καλά, ευχαριστώ, εσύ;"]` |
| 4 | steps[1] line 3 `Εσένα;` | nit | Used in the dialogue, explained nowhere | Add to grammar: `{ kind: "p", text: "Εσένα; — А тебя? (ответная реплика после Με λένε …)" }` |

### e1-l03 Είμαι από τη Ρωσία

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 5 | `words` | weak | The conjugation table needs εμείς, εσείς, αυτοί/αυτές/αυτά, and the exercises use Εμείς/Εσείς/Αυτοί, but they are not new words (deck d3 has them) | `words: [..., "εμείς", "εσείς", "αυτοί, αυτές, αυτά"]` (check the exact `el` of the plural pronouns in the deck) |
| 6 | steps[3] ex[7] translate «Откуда ты?» | trap | `Εσύ από πού είσαι;` rejected | `accept: ["Εσύ από πού είσαι;"]` |
| 7 | steps[2] | nit | `την Κύπρο` appears with no note that η Κύπρος → την Κύπρο (feminine in -ος) | Add `{ kind: "p", text: "η Κύπρος — женский род на -ος: от την Κύπρο" }` |

### e1-l04 Τι είναι αυτό;

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 8 | steps[1] lines 4–5 `Και αυτή; — Αυτή είναι μια σαλάτα` | weak | Nobody points at an unknown dish and says αυτή: the gender is unknown until the noun is. Textbook-robotic, and the Russian «А это (она)?» shows it | `{ who: "Άννα", el: "Και αυτό εδώ;", ru: "А вот это?" }, { who: "Σερβιτόρος", el: "Μια σαλάτα, χωριάτικη.", ru: "Салат, деревенский." }` and move the αυτός/αυτή/αυτό agreement to the grammar `ex`: `Αυτή η σαλάτα είναι χωριάτικη.` |

### e1-l05 Ένας καφές, παρακαλώ

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 9 | steps[1] lines 5→6 | weak | The order is confirmed and the next line is already «Τον λογαριασμό». Real sequence: the waiter brings, they eat, then the bill | Insert `{ who: "Σερβιτόρος", el: "Ορίστε, ο καφές και το τσάι. Καλή όρεξη!", ru: "Пожалуйста, кофе и чай. Приятного аппетита!" }, { who: "Πάβελ", el: "Ευχαριστώ! … Τον λογαριασμό, παρακαλώ.", ru: "Спасибо! … Счёт, пожалуйста." }` (ορίστε as an extra word: `{ el: "ορίστε", tr: "ори́стэ", ru: "вот, пожалуйста (протягивая)" }`) |
| 10 | steps[3] ex[2] hint «одну воду» | nit | Not Russian | `hint: "вода: средний род"` |
| 11 | `words` δύο, τρεις/τρία | nit | New numbers used once (`δύο τσάγια`, with an untaught plural) | Add `{ kind: "translate", ru: "Два кофе, пожалуйста.", answer: "Δύο καφέδες, παρακαλώ." }` only if καφέδες is shown in grammar; otherwise drop δύο/τρεις to l11 where they are drilled |

### e1-l06 Μένω στη Λάρνακα

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 12 | steps[1] line 5 `Δουλεύω στο σπίτι. Η δουλειά μου είναι εκεί.` | weak | «Моя работа там» points nowhere; no native says this | `el: "Δουλεύω από το σπίτι, στον υπολογιστή. Η δουλειά μου είναι στη Ρωσία.", ru: "Я работаю из дома, за компьютером. Моя работа в России."` (it is also true for the learner) |
| 13 | steps[1] speaker Ελένη | weak | Ελένη lives in Limassol and works in a bank here; in l12–l15 she is a teacher who has just moved to Larnaca (see systemic §1) | Speaker → `Άννα` throughout the dialogue (Anna works in a bank in every other lesson) |
| 14 | `words` η πόλη | weak | Never used in the lesson | Add a gap: `{ kind: "gap", prompt: "Η Λάρνακα είναι μια μικρή ___. — город", answer: "πόλη", hint: "город" }` and use it in the write model: «Η Λάρνακα είναι μικρή πόλη, αλλά ωραία» |
| 15 | steps[3] | nit | 12 exercises, one listen, one spot (spec 14–18) | Add `{ kind: "listen", el: "Πού μένεις τώρα;", ru: "Где ты сейчас живёшь?" }` and `{ kind: "spot", el: "Εμείς [μένει] στη Λάρνακα.", fix: "Εμείς μένουμε στη Λάρνακα.", ru: "Мы живём в Ларнаке.", explain: "Мы — μένουμε" }` |

### e1-l07 Μιλάς ελληνικά;

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 16 | steps[3] ex[4] gap `___ καταλαβαίνω`, `accept: ["Δε"]` | error | ν is kept before κ (the rule the course teaches in l03). `Δε καταλαβαίνω` is a spelling mistake | Remove `accept` |
| 17 | steps[3] ex[7] translate, `accept: ["Δε καταλαβαίνω."]` | error | Same | Remove `accept` |

### e1-l08 Η οικογένειά μου

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 18 | steps[3] ex[6] translate «Моя семья большая.» | trap | `μεγάλη` is a new word of l17; here it has only been seen once in the reading, yet must be typed with the right stress | `{ kind: "translate", ru: "Моя семья в России.", answer: "Η οικογένειά μου είναι στη Ρωσία." }` (keep «Η οικογένειά μου είναι μεγάλη» as the `listen` it already is in l10) |
| 19 | steps[3] ex[8] translate «Мои дети живут здесь.» | trap | `μένουνε` rejected although the table shows `μένουν(ε)` | `accept: ["Τα παιδιά μου μένουνε εδώ."]` |
| 20 | steps[2] plural table | weak | Only -ος/-ας/-η/-ί. The most frequent patterns (-α → -ες, -ο → -α) are missing, and l16 then assumes οι κάρτες, οι τσάντες, τα βιβλία, τα τετράδια | Add rows `["η σαλάτα", "οι σαλάτες"], ["το πιάτο", "τα πιάτα"], ["το σπίτι", "τα σπίτια"]` and a gap `{ kind: "gap", prompt: "το πιάτο → τα ___", answer: "πιάτα", hint: "мн. ч." }` |

### e1-l09 Στην ταβέρνα

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 21 | steps[3] ex[6] translate, `accept: ["Δε τρώω κρέας."]` | error | ν is kept before τ | Remove `accept` |

### e1-l10 Επανάληψη (practice)

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 22 | whole lesson | weak | A practice lesson with no `listenFirst` text and no `choose` questions; the reading is ~60 words. It is a core-size review, not a practicum | Add after steps[0] a 6-line `dialogue` with `listenFirst: true` (Pavel orders at Nikos's καφετέρια, pays, Nikos asks where he lives) and a practice step with 3–4 `choose` + 2 `listen`; or accept this lesson as "light review" and say so in the curriculum entry |
| 23 | steps[2] ex[1] translate «Я живу в Ларнаке, но работаю в Лимасоле.» | trap | Pronoun variant rejected | `accept: ["Εγώ μένω στη Λάρνακα, αλλά δουλεύω στη Λεμεσό."]` |
| 24 | steps[2] ex[13] translate «Мой брат… а я — в Ларнаке.» | nit | `κι εγώ` variants (taught two lessons later, but common) | Add `"Ο αδερφός μου μένει στην Αθήνα κι εγώ στη Λάρνακα."` to `accept` |

### e1-l11 Πόσων χρονών είσαι;

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 25 | steps[1] line 5 | weak | The dialogue gives the real learner two children (son 10, daughter 6). Nothing in the brief says so; the learner then reads invented facts about himself | Ask about someone else: `{ who: "Δασκάλα", el: "Έχεις οικογένεια εδώ;", ru: "У тебя здесь есть семья?" }, { who: "Πάβελ", el: "Όχι, η οικογένειά μου είναι στη Ρωσία. Ο αδερφός μου είναι είκοσι οκτώ χρονών.", ru: "Нет, моя семья в России. Брату двадцать восемь лет." }` — and fix the learner persona in the prompt (systemic §1) |
| 26 | steps[3] | nit | The curriculum promises a phone number; it is only in the `write` model | Add `{ kind: "listen", el: "Εννιά, εννιά, τέσσερα, πέντε, δύο, οκτώ.", ru: "99 45 28." }` |
| 27 | steps[4] model `εξήντα` | nit | Deck day 175, not taught | `"Η μαμά μου είναι σαράντα οκτώ."` |
| 28 | steps[2] table 13–14 | nit | Only neuter forms, no note that 13/14 agree like 3/4 (δεκατρείς αδερφές) | Row text: `"13 δεκατρία (δεκατρείς)"`, `"14 δεκατέσσερα (δεκατέσσερις)"` |

### e1-l12 Πού; Πότε; Γιατί;

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 29 | steps[3] ex[7] translate «Как ты?» | trap | `Τι κάνεις;` — the phrase taught in l02 for exactly this — is rejected | `accept: ["Τι κάνεις;"]` |
| 30 | steps[3] ex[9] translate, `accept: ["Γιατί δε τρως κρέας;"]` | error | ν is kept before τ | Remove `accept` |
| 31 | steps[1] line 2 `Ποιος είσαι εσύ;` | nit | Blunt («Ты кто такой?»); neighbours say it with εσύ first | `el: "Εσύ ποιος είσαι;", ru: "А ты кто?"` |

### e1-l13 Ο φίλος μου κι εγώ

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 32 | steps[1] text[6] `Το σπίτι μας είναι μικρό, αλλά η κουζίνα μας είναι μεγάλη.` | error | Whose «our»? The text is about Nikos's house; Pavel lives alone in a flat (l06). A sentence inserted only to show μας | `{ el: "Η Άννα και εγώ μαθαίνουμε ελληνικά μαζί. Η δασκάλα μας είναι η Ελένη.", ru: "Мы с Анной вместе учим греческий. Наша учительница — Элени." }` |
| 33 | steps[3] ex[15] spot `Η Μαρία δουλεύει με την κόρη [του].` | trap | The sentence is grammatical (with *his* daughter). A spot item must contain a form error, not a meaning that only the Russian line rules out | `{ kind: "spot", el: "Η Μαρία δουλεύει με [η κόρη] της.", fix: "Η Μαρία δουλεύει με την κόρη της.", ru: "Мария работает со своей дочерью.", explain: "После με — винительный: την κόρη" }` |
| 34 | `words` το όνομα | weak | Never used (and it is the natural place for the second-stress rule) | Add `{ kind: "gap", prompt: "Το όνομά ___ είναι Μαρία. — её", answer: "της", hint: "её" }` and in the reading replace text[2] with `{ el: "Η γυναίκα του είναι η Μαρία. Το όνομά της μου αρέσει πολύ.", ru: "Его жена — Мария. Мне очень нравится её имя." }` → simpler: `"Το όνομά της είναι Μαρία."` |
| 35 | `words` | weak | `η γυναίκα`, `ο άντρας` (deck d81) are used here, in l19 and l20, and typed in l19 ex[12], but are never new words | `words: [..., "η γυναίκα", "ο άντρας"]` |
| 36 | steps[4] model `με τον άντρα της` | nit | Resolved by #35 | — |

### e1-l14 Πρακτική: διαβάζω και ακούω (practice)

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 37 | steps[0] whole letter | error | Μαρία contradicts l03 (Greek, from Athens) and l13 (Nikos's wife, daughter of six): here she is Russian, single, living with Ελένη, working in a taverna | Rename the writer to a new Russian friend: `Κάτια` in the title («Письмо от Кати»), text[10] `"Φιλιά, Κάτια"`, every `choose` question («Где живёт Катя?» …) and steps[1] ex[6] `"Η Κάτια ___ με τη φίλη της."` |
| 38 | steps[1] ex[11] translate «Когда ты приедешь на Кипр?» → `Πότε έρχεσαι στην Κύπρο;` | error | έρχομαι is an -ομαι verb (curriculum: e2-l03). Required as a typed answer before it is taught; the Russian future also invites `θα έρθεις` | Make it a dictation: `{ kind: "listen", el: "Πότε έρχεσαι στην Κύπρο;", ru: "Когда ты приедешь на Кипр?" }` |
| 39 | steps[1] ex[12] translate «Утром я пью кофе и читаю.» | nit | `έναν καφέ` variant rejected | `accept: ["Το πρωί πίνω έναν καφέ και διαβάζω."]` |
| 40 | steps[0] | weak | ~95 words against the 120–300 of the spec | Add three sentences about the taverna (what people eat, when it opens: numbers and food recycled) |

### e1-l15 Ένα γράμμα για μένα (task)

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 41 | steps[0] model letter | weak | A model for a letter should show the shape of a letter: address line, opening, closing. It has neither (l14 did better with «Φιλιά, Μαρία»). The last line «Ποιος είσαι;» is not how a letter ends | text[0] → `"Γεια σου, Πάβελ!"`, last line → `{ el: "Εσύ; Από πού είσαι και τι κάνεις στη Λάρνακα; Γράψε μου!", ru: "А ты? Откуда ты и что делаешь в Ларнаке? Напиши мне!" }, { el: "Φιλιά, Ελένη", ru: "Целую, Элени" }` and add to essay `requirements`: «Начни с Γεια σου, Ελένη! и закончи Φιλιά / Τα λέμε + имя» |
| 42 | steps[1] ex[3–5] gaps | weak | `Με`, `τη`, `και` are lesson-2 difficulty in lesson 15 | Replace with gaps that prepare the essay: `{ kind: "gap", prompt: "Είμαι τριάντα πέντε ___. — лет", answer: "χρονών", hint: "возраст" }, { kind: "gap", prompt: "Μαθαίνω ελληνικά ___ μένω εδώ. — потому что", answer: "επειδή", accept: ["γιατί"], hint: "потому что" }, { kind: "gap", prompt: "Η οικογένειά ___ είναι στη Ρωσία. — моя", answer: "μου", hint: "моя" }` |

### e1-l16 Τι έχεις στην τσάντα σου;

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 43 | `words` vs steps[3] ex[3], ex[8], ex[13] | error | `βλέπω` is typed (gap, translate, build) here but is a new word of l18 | `words: [..., "βλέπω"]` here and remove `"βλέπω"` from l18 `words` (l18 still uses it freely) |
| 44 | steps[3] ex[9] translate «Мы ждём друзей.» → `Περιμένουμε τους φίλους.` | error | περιμένω (deck d11) is never taught in the epoch | Either `words: [..., "περιμένω"]` (it is used in ex[2] and ex[14] too, and in l20) or change the three items to βλέπω: `ru: "Мы видим друзей.", answer: "Βλέπουμε τους φίλους.", accept: ["Βλέπουμε τους φίλους μας.", "Εμείς βλέπουμε τους φίλους."]` |
| 45 | steps[2] | weak | The table shows only the article change; the learner must form κάρτες, τσάντες, βιβλία, τετράδια, κλειδιά without ever having seen -α → -ες / -ο → -α (see #20) | Add `{ kind: "p", text: "Мн. ч. вещей из урока: η κάρτα → οι κάρτες, η τσάντα → οι τσάντες, το βιβλίο → τα βιβλία, το κλειδί → τα κλειδιά, το πορτοφόλι → τα πορτοφόλια" }` |

### e1-l17 Είναι μεγάλο;

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 46 | steps[4] model `αλλά δεν θέλω ένα ακριβό` | weak | Unnatural; a native says «αλλά όχι ακριβό» | `"Θέλω ένα καινούριο τραπέζι, αλλά όχι ακριβό."` |
| 47 | `words` κακός | nit | Never used | Add `{ kind: "gap", prompt: "Ο καφές εδώ είναι ___. — плохой", answer: "κακός", hint: "плохой: м. р." }` |
| 48 | steps[3] ex[5] prompt «— красивый» for Η Λάρνακα | nit | The Russian cue is masculine while the answer must be feminine; the hint carries the load | Prompt cue `"— красивая"` (keep the dictionary form in `hint`) |

### e1-l18 Τι θέλεις να κάνεις;

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 49 | steps[1] line 5 and steps[3] ex[10] `θέλω να μιλάω ελληνικά καλά` | weak | Marked word order used as the primary; the neutral order is `να μιλάω καλά ελληνικά` | Dialogue: `el: "Ξέρεις, θέλω να μιλάω καλά ελληνικά."`; ex[10]: `answer: "Θέλω να μιλάω καλά ελληνικά.", accept: ["Θέλω να μιλάω ελληνικά καλά.", "Θέλω να μιλάω καλά τα ελληνικά."]`; same swap in steps[3] ex[3] prompt («Θέλουμε να ___ καλά ελληνικά.») |
| 50 | steps[3] ex[14] spot `Θέλω να [πάει] στη θάλασσα.` | trap | Grammatical («хочу, чтобы он пошёл»), and the grammar step itself teaches `Θέλω να πάμε`. The explain «оба глагола в одном лице» contradicts it | `{ kind: "spot", el: "Θέλω [πάω] στη θάλασσα.", fix: "Θέλω να πάω στη θάλασσα.", ru: "Я хочу пойти на море.", explain: "После θέλω обязательно να: θέλω να πάω" }` |
| 51 | `words` κολυμπάω, γράφω | weak | Neither appears anywhere in the lesson (κολυμπάω is deck day 145) | Dialogue line 1 → `"Θέλω να πάω στη θάλασσα και να κολυμπάω. Εσύ;"`; add `{ kind: "gap", prompt: "Θέλω να ___ ένα γράμμα στη μαμά μου. — написать", answer: "γράφω", hint: "писать: я" }` or drop γράφω to e2 |

### e1-l19 Πρακτική: όλα μαζί (practice)

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 52 | steps[1] ex[12] translate «Он живёт здесь с женой и детьми.» | trap | `γυναίκα` must be typed with stress; never a new word (fixed by #35) | `accept` also `"Μένει εδώ με τη γυναίκα του και τα δύο παιδιά τους."` |
| 53 | steps[0] | nit | ~105 words; the best text of the epoch, slightly short of spec | Two more sentences (what Andreas does on Saturday; the car) |

### e1-l20 Τεστ A1.1 (test)

| # | Where | Severity | Problem | Fix |
|---|---|---|---|---|
| 54 | steps[0] reading | error | Άννα is Greek with a son in l08; here Russian with a husband and a daughter who speaks Russian | Writer → `Νατάσα` (title «Наташа пишет о себе», every question «…Наташе/Наташа», essay task «ответь Наташе») |
| 55 | steps[0] genre | weak | The fifth personal letter of the epoch. Ελληνομάθεια A1 reads notices, menus, adverts, short messages | Replace with a café notice + short message: a menu board (`ΚΑΦΕΤΕΡΙΑ «ΘΑΛΑΣΣΑ» · Καφές 2 € · Τσάι 1,50 € · Χωριάτικη σαλάτα 6 € · Ανοιχτά 8–22`) and Nikos's message «Πάβελ, το βράδυ τρώμε στην ταβέρνα, στις οκτώ. Έλα με την Άννα!» with questions on prices, hours, who comes, when |
| 56 | steps[4] Part 3 | weak | 13 items, nothing from l02 (greetings/σου–σας), l04 (ένας/μία/ένα), l11 (numbers), l13 (του/της), l18 (θέλω να) beyond one translate; no connected cloze | Add: `{ kind: "gap", prompt: "Πώς ___ λένε; — Как вас зовут?", answer: "σας", hint: "вежливо" }, { kind: "gap", prompt: "Είναι ___ σαλάτα.", answer: "μία", accept: ["μια"], hint: "один салат" }, { kind: "gap", prompt: "Ο Νίκος μένει με τη γυναίκα ___. — его", answer: "του", hint: "его" }, { kind: "translate", ru: "Сколько лет твоему брату?", answer: "Πόσων χρονών είναι ο αδερφός σου;" }, { kind: "spot", el: "Θέλω [πάω] στο σινεμά.", fix: "Θέλω να πάω στο σινεμά.", ru: "Я хочу пойти в кино.", explain: "После θέλω обязательно να" }` |
| 57 | steps[1], steps[3] `choose` distractors | weak | «Ничего», «Совсем не говорит», «Её просит дочка», «Не сказал» are not exam distractors; the exam uses true/false and details that *are* in the text about someone else | Distractors from the text: for «Где работает муж Анны?» → «В кафе в центре» (that is Anna), «В банке»; for «Что ест утром» → «Рыбу с овощами» (dinner), «Салат» |
| 58 | steps[5] essay | nit | The exam's A1 writing part 1 is a form (name, age, address, phone) | Add a requirement: «В начале заполни анкету: Όνομα / Ηλικία / Πόλη / Τηλέφωνο» |

## Systemic issues (what the generation process should change)

### 1. No character bible, no learner persona

Each lesson invents its cast from scratch. The prompt names the characters but gives them no facts, so every session re-rolls them. Fixes above (#13, #25, #37, #54) make the written epoch consistent with this bible, which should go into the prompt and be the only source of truth:

- **Πάβελ**: 35, from Russia, lives alone in a flat in the centre of Larnaca, works from home (IT), learns Greek at a language school. Family (brother, parents) in Russia. No wife or children are ever asserted; dialogues ask him about his family in Russia instead.
- **Άννα**: Greek from Athens, 32, works in a bank in the centre of Larnaca, lives in Limassol, big family in Greece (brother in Athens, two sisters in Thessaloniki, a son). Pavel's friend.
- **Νίκος**: Cypriot from Larnaca, 35, works in the καφετέρια «Θάλασσα» in the centre, married to Μαρία, daughter of six, two brothers and a sister.
- **Μαρία**: Greek from Athens, Nikos's wife, works in the taverna by the sea.
- **Ελένη**: Greek from Athens, 30, Pavel's Greek teacher (the «Δασκάλα» of l07/l11), just moved to Larnaca next door to Pavel.
- **Αντρέας and Σοφία**: neighbours from Limassol (l19), son 5, daughter 2; Σοφία's mother is Russian.
- New names only for one-off roles (Πωλήτρια, Σερβιτόρος, Κάτια, Νατάσα).

### 2. One text shape

Seven of the eleven texts are «Με λένε X, είμαι από …, μένω …, δουλεύω …, η οικογένειά μου …». The exam and real life are notices, menus, price lists, timetables, adverts, WhatsApp messages, name badges, forms, a landlord's note on the door. The prompt should require a genre per text and forbid two texts of the same genre in a row.

### 3. Vocabulary discipline is not checked

The validator checks that `words` exist in the deck; nothing checks that a new word is *used* or that a typed answer uses only taught words. Rules for the prompt: every new word appears at least twice in its lesson (text + exercise or model); a word may be a typed answer only if it is a new word of this or an earlier lesson, or an `extraWord`; words in texts that are not taught are allowed only as transparent fixed phrases (Ορίστε, Εμπρός;, Κανένα πρόβλημα) and at most 3 per text. Recommend extending `validate-program.mjs` with exactly this check (the script in this review's scratch run found the forms in minutes).

### 4. `accept` policy is implicit

Four `accept` entries are wrong (δε before κ/τ), while obvious variants are missing (Τι κάνεις; for «Как ты?», Εσύ … for a Russian sentence with a pronoun, μένουνε). The prompt must state the policy, not «list every natural variant»: ν policy (write δεν/την always in answers; accept δε/τη only where the rule drops ν; never accept the opposite), pronoun policy (a Russian sentence with a subject pronoun accepts both with and without the Greek pronoun), order policy, μια/μία, «Как ты?» → both idioms. See the new section in `LESSON_PROMPT.md`.

### 5. Spot items that are not errors

Two spot items (#33, #50) mark a word that yields a grammatical sentence with another meaning. Since the learner taps a word and can only see the Russian line, the bracketed part must be ungrammatical in any reading.

### 6. Practice and test lessons are lighter than core lessons

l10 has no listening; readings are 60–105 words; the test language part skips half the epoch and its reading is a letter again. For a learner who does one lesson a day, practice days should feel like the hardest days. The prompt now sets minimums and a coverage requirement for the test.

### 7. Dialogue tics

Every second dialogue ends with Ωραία! / Εντάξει! / Τα λέμε!; most lines are statement–question pairs with nothing in between (no hesitation, no «Α, ναι», no numbers, no prices, no misunderstanding). l16–l19 show the way: Α, ναι! · Μόνο αυτά; · Δεν είναι φτηνό… Αλλά είναι καλό. The prompt now asks for one «imperfection» per dialogue and bans the same closing line twice in an epoch.

### 8. Things the app shows that the author does not control

The words step shows the deck card with its examples; for `θέλω` (day 7) the second example is «Ήθελα να έρθω, αλλά ήμουν άρρωστος» (past tense, lesson 5). Not a content bug, but the deck's second examples are often A2; consider showing only the first example in epochs 1–4.

### 9. Coverage gaps for A1.1

Not errors, but a good A1.1 would include before the test: `συγγνώμη`, `δεν πειράζει`, `τι κάνετε;` as words (they are used); `κύριε / κυρία` and the vocative of names (Νίκο!) in context; numbers 11–20 drilled, not only tabled; prices with ευρώ (πόσο κάνει; appears once); a second pronunciation drill after lesson 1 (stress shift ο δάσκαλος → η οικογένειά μου, σ → з, double accents); «Δεν ξέρω / Δεν θέλω / Δεν έχω» as fixed answers; reading a form (όνομα, επώνυμο, διεύθυνση, τηλέφωνο). All of these are A1-exam material.

## What is good (keep doing it)

- Grammar notes written for a Russian speaker: είμαι not έχω for age; «нет инфинитива»; second stress; the τη/την list. Short and right.
- Hints that name the slot («хотеть: мы», «3: средний род») instead of hinting the answer.
- Dictations built from the lesson's own dialogue lines.
- l19: coherent, local, warm, and every sentence recycles something.
- Phone numbers that look Cypriot (99 …), euro prices, Λεμεσός, Λευκωσία would be next.
