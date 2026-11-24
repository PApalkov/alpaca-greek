# Epoch 1 — independent review (round 2)

Reviewer: Modern Greek teacher / Ελληνομάθεια examiner, reading as the learner would, lesson by lesson, with the checker's rules (`normalizeAnswer`, `sentenceTiles`, `parseSpot`) open beside the content. The earlier review in this folder was not read.

Conventions: `lNN` = `e1-lNN`; `s[n]` = `steps[n]`, `ex[n]` = `exercises[n]`, both 0-based. Severity: **error** (wrong Greek/Russian, contradicts the character bible or the taught set) · **trap** (a correct answer the checker rejects, or an item that is not uniquely solvable) · **weak** (works, but a professional editor would rewrite it) · **nit**. Every fix changes content in place or appends at the end of a step; nothing is deleted or reordered.

## Status: applied

- All E, T, W and N items are applied, with these deviations:
  - **W16:** the third translate (`Εσύ; Γράψε μου!`, an untaught imperative) was dropped.
  - **E14:** the essay addressee is Γιώργος «вы виделись один раз в кафе», because after the l15 fix Pavel has already met him.
  - **N24:** the closing-hours line would contradict «Ανοιχτά κάθε μέρα». The test reading instead gained a line about the taverna and one about Γιώργος, plus a `choose` about who will be there. It now has 87 words.
  - **W22:** the cloze gaps say «Письмо Кати» in the prompt.
- **Systemic trap:** fixed in code instead of by hand. `checkAnswer` now accepts the 1st/2nd-person subject pronoun (at the start, after the verb or at the end), as well as `μία/μια`, `-ουν/-ουνε`, the -άω doublets, `καινούργιος`, `εφτά/οχτώ/εννιά`. Time-word order variants were added by hand.
- **Validator:** the observation 4 rules are in `scripts/validate-program.mjs`:
  - min stem length;
  - a `NAMES` list;
  - a new word counts as used only when it is in the text and in an exercise or model;
  - minimum reading length for practice and test lessons.

  The stricter check found about 30 more one-use words. The texts of l02–l18 were extended to use them, and epoch 1 now validates with zero warnings.
- **`LESSON_PROMPT.md`:** updated with the character facts and the who-knows-whom rule, the genre cap, the automatic accept variants, the one-sentence build rule, and the self-review additions.

---

## Verdict

**Close to professional A1.1 material, not there yet.** The Greek is correct almost everywhere (I found no agreement, stress or final‑ν mistakes in the typed answers), the Russian is natural, the exercise design is sound, and the second half (l16–l19) reads like real Larnaca. What stops it being release‑quality is not the language but the editing: the character bible is contradicted in eight places that any reader notices (Pavel is given a sister twice, Nikos signs with Pavel's phone number, Anna — a Greek from Athens — learns Greek with Pavel, Katya asks Anna «when are you coming to Cyprus»), the `accept` policy in `LESSON_PROMPT.md` was written but not applied (≈30 translate items reject the pronoun variant the prompt says must be accepted), the first practice lesson (l10) is a 53‑word text where 120 are required, and the test is missing the mini‑cloze and never checks lesson 9. The validator passes only because its stem matcher is too loose to catch any of this.

### Top 5 remaining problems

1. **Continuity errors against the character bible** (l06 ex, l08/l10/l13 write models, l13 reading, l14 letter, l20 message, l12/l15 Eleni timeline). Fixing these is mechanical; leaving them makes the course look machine‑written.
2. **`accept` policy not applied.** Pronoun variants (`Εγώ δεν καταλαβαίνω`, `Εσύ πού δουλεύεις;`), time‑word order (`Πίνω καφέ το πρωί`), spelling doublets (`καινούργιος`, `μιλά`) are rejected across the epoch. For a learner typing every answer, this is the single biggest source of false «wrong».
3. **Practice/test weight.** l10 reading is 53 words (needs ≥120) and recycles core‑level items verbatim; l14 is 112 words; the test reading is 64 words (80–150), has no connected cloze and does not cover l09.
4. **Vocabulary discipline slips.** `γείτονάς` and `Σάββατο` are typed answers before they are taught (l19); several write models use untaught words (`γονείς`, `Μόσχα`, `κουζίνα`, `τραπέζι`); eight new words never appear in their lesson's text.
5. **The same text shape five times.** «Με λένε X. Είμαι από… Μένω… Δουλεύω… Μιλάω… Η οικογένειά μου…» is the reading of l08, l10, l14, l15 and the essay of l15 and l20. The exam needs it once; the learner needs other genres (a form, a WhatsApp thread, a note, a timetable).

---

## Counts by severity

| Severity | Count |
|---|---|
| error | 14 (E1–E14; 10 continuity/bible, 4 vocabulary discipline) |
| auto-check trap | 18 entries (T1–T18), plus the systemic pronoun/order table covering ~30 translate items |
| weak | 22 (W1–W22) |
| nit | 24 (N1–N24) |

---

## Issues by lesson

### l01 · Το αλφάβητο

- **N1 · nit · s[3] ex[8], ex[9].** Hints `"две буквы, как в μπίρα"` / `"как в ντομάτα"` contain the answer. Acceptable in an alphabet lesson; if you want them honest: `hint: "две буквы"` for both (the table above already shows μπίρα/ντομάτα).
- **N2 · nit · s[0] table row Η η.** Example `"η"` is the bare article; the learner cannot read it as a word. Use `["Η η", "и", "ναι, ήλιος"]` → better `"μένει"` (uses a taught stem): `["Η η", "и", "μένει"]`.

### l02 · Γεια σου! Πώς σε λένε;

- **W1 · weak · s[1] dialogue.** No reason to exist: meet, ask name, «see you» after one exchange. For lesson 2 with no verbs this is tolerable, but line 7 ends on `Τα λέμε!`, which is also the closing of l14 (the prompt forbids repeating a closing). In place:
  ```ts
  { who: "Νίκος", el: "Καλά, ευχαριστώ. Εσύ;", ru: "Хорошо, спасибо. А ты?" },
  { who: "Άννα", el: "Καλά! Γεια σου, Νίκο!", ru: "Хорошо! Пока, Никос!" },
  ```
  (lines 6 and 7; `Γεια σου` as «пока» is in the word card).
- **N3 · nit · s[3] ex[11] build.** `extra: ["καλά"]` — one tile, and not a wrong form of an answer word. Use `extra: ["πολλή", "λέει"]`.
- **N4 · nit.** `καληνύχτα` and `επίσης` are never typed or heard in an exercise. Append to s[3]: `{ kind: "translate", ru: "Спокойной ночи!", answer: "Καληνύχτα!" }` and `{ kind: "listen", el: "Επίσης! Τι κάνεις;", ru: "Взаимно! Как дела?" }`.

### l03 · Είμαι από τη Ρωσία

- **W2 · weak · s[1] dialogue lines 3–5.** «Και τώρα είσαι εδώ, στην Κύπρο;» — asking someone standing in front of you whether they are here. Natives would ask whether she *lives* here, but `μένω` is l06. Minimal honest version: line 3 → `{ who: "Πάβελ", el: "Και τώρα; Είσαι από την Αθήνα, αλλά είσαι εδώ, στην Κύπρο!", ru: "А сейчас? Ты из Афин, но ты здесь, на Кипре!" }` (`αλλά` is l06 — glossed, allowed as 1 of 3 untaught words). Otherwise leave; it is a lesson‑3 text.
- **T1 · trap · s[3] ex[7].** `Από πού είσαι εσύ;` is at least as natural as `Εσύ από πού είσαι;`. `accept: ["Εσύ από πού είσαι;", "Από πού είσαι εσύ;"]`.
- **N5 · nit · s[2] block 4.** The ν‑rule list omits τσ, τζ (the prompt's own list has them): `"…перед κ, π, τ, μπ, ντ, γκ, τσ, τζ, ξ, ψ (την Ελλάδα, την Κύπρο), иначе τη (τη Ρωσία)"`.

### l04 · Τι είναι αυτό;

- **W3 · weak · s[1] dialogue.** Άννα, a Greek from Athens, asks a waiter «what is this?» and is told «it is the menu»; «Αυτό είναι ένα τυρί» (natives: `Είναι τυρί, χαλούμι`); the waiter adds a glass of water nobody ordered. This is the «grammar display» the prompt warns about. Same eight lines, same words, with the foreigner asking and a reason for the water:
  ```ts
  { who: "Πάβελ", el: "Άννα, ο κατάλογος… Τι είναι αυτό;", ru: "Анна, меню… Что это?" },
  { who: "Άννα", el: "Είναι ένα τυρί, χαλούμι.", ru: "Это сыр, халлуми." },
  { who: "Πάβελ", el: "Και αυτό;", ru: "А это?" },
  { who: "Άννα", el: "Μια σαλάτα, χωριάτικη.", ru: "Салат, деревенский." },
  { who: "Πάβελ", el: "Και αυτό εδώ;", ru: "А вот это?" },
  { who: "Άννα", el: "Ένα ποτήρι νερό. Θέλεις;", ru: "Стакан воды. Хочешь?" },
  { who: "Πάβελ", el: "Ναι! Και ένα ψωμί, παρακαλώ.", ru: "Да! И хлеб, пожалуйста." },
  { who: "Σερβιτόρος", el: "Ένα ψωμί και ένα ποτήρι νερό.", ru: "Хлеб и стакан воды." },
  ```
  (`θέλεις` is l05: a fixed phrase glossed by the Russian line, like `Τι θέλετε;` in l05.)
- **N6 · nit.** `η καφετέρια` and `το πιάτο` appear only in an article gap / grammar table, never in the text. The rewrite above keeps that; if you want them in the text, line 0 → `"Άννα, είμαστε σε μια καφετέρια, αλλά τι είναι αυτό;"` is too much for l04 — leave it.

### l05 · Ένας καφές, παρακαλώ

- **W4 · weak · s[1] line 6.** «Καλή όρεξη!» while serving only coffee and tea; the salad is never served. `{ who: "Σερβιτόρος", el: "Ορίστε, ο καφές, το τσάι και η σαλάτα. Καλή όρεξη!", ru: "Пожалуйста: кофе, чай и салат. Приятного аппетита!" }`.
- **T2 · trap · s[3] ex[8].** `accept` lacks `"Εγώ θέλω τσάι."` (pronoun + no article, both already accepted separately). Add it.
- **N7 · nit.** `ο σερβιτόρος` exists only as a speaker label; `εντάξει` only in the dialogue. Append to s[3]: `{ kind: "listen", el: "Ο σερβιτόρος λέει: εντάξει!", ru: "Официант говорит: хорошо!" }` — or simpler `{ kind: "translate", ru: "Хорошо! Два чая, пожалуйста.", answer: "Εντάξει! Δύο τσάγια, παρακαλώ." }` is not safe (τσάγια untaught). Use the listen.

### l06 · Μένω στη Λάρνακα

- **E1 · error · s[3] ex[1].** `"Ο Νίκος ___ στη Λεμεσό."` — Nikos is a Cypriot from Larnaca who works in the centre; l13 says his house is in the centre. Replace: `{ kind: "gap", prompt: "Η Άννα ___ στη Λεμεσό.", answer: "μένει", hint: "жить: она" }`.
- **W5 · weak · s[1] title.** «Соседи» — Anna lives in Limassol; she is not a neighbour. `title: "После работы, в кафе"`.
- **T3 · trap · s[3] ex[7].** `"Где ты работаешь?"` rejects the pronoun forms the policy requires: `accept: ["Εσύ πού δουλεύεις;", "Πού δουλεύεις εσύ;"]`. ex[8]: add `"Εμείς μένουμε σε διαμέρισμα."`.
- **N8 · nit · s[3] ex[9] listen.** `Δουλεύω στο σπίτι.` is not in the text (the text says `από το σπίτι`); dictations should come from the text: `{ kind: "listen", el: "Δουλεύω από το σπίτι.", ru: "Я работаю из дома." }`.
- **N9 · nit.** `η δουλειά` is heard once and never produced. Append `{ kind: "gap", prompt: "Η ___ μου είναι στη Ρωσία. — работа", answer: "δουλειά", hint: "работа" }`.

### l07 · Μιλάς ελληνικά;

- **T4 · trap · s[3] ex[2] (and l20 s[4] ex[3]).** `"Η Άννα ___ αγγλικά."` accepts only `μιλάει`; the grammar step itself says `μιλώ, μιλούν` «это то же самое», and `μιλά` is the form the learner meets in every book and sign. `accept: ["μιλά"]` in both places. Likewise ex[1] `μιλάμε` → `accept: ["μιλούμε"]`, and l18 s[3] ex[3].
- **T5 · trap · s[3] ex[7], ex[8].** `"Я не понимаю."` lacks `"Εγώ δεν καταλαβαίνω."`; `"Ты знаешь греческий?"` lacks `"Εσύ ξέρεις ελληνικά;"`, `"Ξέρεις ελληνικά εσύ;"`. Add.
- **W6 · weak · s[3] ex[3].** `"Αυτοί ___ τη θάλασσα."` — `θάλασσα` (l12) and the accusative article (l09) are both untaught here; the learner is asked to conjugate inside a sentence they cannot read. In place: `{ kind: "gap", prompt: "Αυτοί ___ την Κύπρο.", answer: "αγαπάνε", accept: ["αγαπούν", "αγαπάν"], hint: "любить: они" }` (`την Κύπρο` is in l03).
- **W7 · weak · s[3] ex[11] build.** `Μιλάμε λίγο ελληνικά.` — the prompt names this exact sentence as «borderline»: `Μιλάμε ελληνικά λίγο` is a possible order and the checker accepts one order only. Replace: `{ kind: "build", ru: "Ты знаешь греческий и английский?", answer: "Ξέρεις ελληνικά και αγγλικά;", extra: ["ξέρω", "ρωσικά"] }`.

### l08 · Η οικογένειά μου

- **E2 · error · s[4] write model.** `"Έχω μία αδερφή.", "Η αδερφή μου μένει στη Μόσχα.", "Οι γονείς μου μένουν στη Ρωσία."` — Pavel has a brother and parents (bible; l11 dialogue: «Ο αδερφός μου είναι είκοσι οκτώ χρονών»). `γονείς` and `Μόσχα` are untaught. Replace: `model: ["Η οικογένειά μου είναι μικρή.", "Έχω έναν αδερφό.", "Ο αδερφός μου μένει στη Ρωσία.", "Ο μπαμπάς μου και η μαμά μου μένουν εκεί."]`.
- **T6 · trap · s[3] ex[7].** `"У меня есть брат и сестра."` — `Έχω αδερφό και αδερφή.` (no article, the most native way to list family) is rejected, as is the pronoun form. `accept: ["Έχω έναν αδερφό και μια αδερφή.", "Έχω αδερφό και αδερφή.", "Εγώ έχω έναν αδερφό και μία αδερφή.", "Εγώ έχω έναν αδερφό και μια αδερφή."]`.
- **N10 · nit.** `η κόρη` and `η μητέρα` appear only in the table. Append `{ kind: "gap", prompt: "η κόρη → οι ___", answer: "κόρες", hint: "мн. ч." }` and `{ kind: "translate", ru: "Моя мать в Афинах.", answer: "Η μητέρα μου είναι στην Αθήνα.", accept: ["Η μαμά μου είναι στην Αθήνα."] }`.

### l09 · Στην ταβέρνα

- **W8 · weak · s[4] write model.** Pavel's model orders fish — the same lesson's dialogue has Pavel say «Εγώ δεν τρώω ψάρι»; the model also uses `Το πρωί` (l12). Replace: `model: ["Τρώω ψωμί με τυρί και πίνω καφέ με γάλα.", "Στην ταβέρνα θέλω το κρέας με λαχανικά και μια σαλάτα.", "Δεν πίνω κρασί, πίνω νερό."]`.
- **W9 · weak · s[1] line 1.** «Τι είναι νόστιμο σήμερα;» is understandable but not what people say; `{ who: "Άννα", el: "Ευχαριστώ. Τι έχετε νόστιμο σήμερα;", ru: "Спасибо. Что у вас сегодня вкусного?" }` (`έχετε` is l08).
- **T7 · trap · s[3] ex[6].** Add `accept: ["Εγώ δεν τρώω κρέας."]`.
- **N11 · nit.** `η ταβέρνα` and `το φαγητό` are not in the text. Line 7 → `{ who: "Σερβιτόρος", el: "Ωραία. Το φαγητό έρχεται. Καλή όρεξη!", ru: "Отлично. Еда сейчас будет. Приятного аппетита!" }` is one more untaught verb; simpler: line 0 → `{ who: "Σερβιτόρος", el: "Καλησπέρα! Καλώς ήρθατε στην ταβέρνα «Θάλασσα». Ορίστε ο κατάλογος.", ru: "Добрый вечер! Добро пожаловать в таверну «Таласса». Вот меню." }` — note the bible says Maria works in a taverna by the sea and Nikos in the café «Θάλασσα»; keep the taverna unnamed: `"Καλησπέρα! Ορίστε ο κατάλογος. Το φαγητό σήμερα είναι πολύ καλό."` / `"Добрый вечер! Вот меню. Еда сегодня очень хорошая."` (uses `καλό` before l17; glossed).

### l10 · Επανάληψη: αυτός είμαι εγώ (practice)

- **E3 · error · s[5] write model.** `"Η οικογένειά μου είναι μικρή: έχω μία αδερφή."` — brother, not sister (see E2). `"Η οικογένειά μου είναι μικρή: έχω έναν αδερφό."`.
- **W10 · weak · s[0] reading.** 53 words where the practice rule says ≥120; written as a letter to Pavel in which Nikos introduces himself («Εσύ; Από πού είσαι;») although they have known each other since l03; a married father with a 6‑year‑old presents himself as a man who eats out with friends every evening. Replace in place (title, text), 138 words, only l01–l09 vocabulary plus `μικρό`, `Σάββατο`, `το πρωί/το βράδυ` as glossed items:
  ```ts
  {
    kind: "reading",
    title: "Никос написал о себе для твоей группы",
    text: [
      { el: "Γεια σας! Με λένε Νίκο.", ru: "Здравствуйте! Меня зовут Никос." },
      { el: "Είμαι από την Κύπρο, από τη Λάρνακα, και μένω εδώ, στο κέντρο.", ru: "Я с Кипра, из Ларнаки, и живу здесь, в центре." },
      { el: "Μένω σε ένα μικρό διαμέρισμα με τη Μαρία και την κόρη μου.", ru: "Я живу в маленькой квартире с Марией и дочкой." },
      { el: "Η Μαρία είναι από την Αθήνα και δουλεύει σε μια ταβέρνα εδώ, στη Λάρνακα.", ru: "Мария из Афин, она работает в таверне здесь, в Ларнаке." },
      { el: "Εγώ δουλεύω σε μια καφετέρια στο κέντρο, στη «Θάλασσα».", ru: "Я работаю в кафе в центре, в «Талассе»." },
      { el: "Μιλάω ελληνικά, αγγλικά και λίγο ρωσικά.", ru: "Я говорю по-гречески, по-английски и немного по-русски." },
      { el: "Στην καφετέρια μιλάω αγγλικά, αλλά στο σπίτι μιλάμε ελληνικά.", ru: "В кафе я говорю по-английски, а дома мы говорим по-гречески." },
      { el: "Η οικογένειά μου είναι μεγάλη: έχω δύο αδερφούς και μία αδερφή.", ru: "Моя семья большая: у меня два брата и сестра." },
      { el: "Οι αδερφοί μου μένουν στη Λευκωσία και η αδερφή μου μένει εδώ, στη Λάρνακα.", ru: "Братья живут в Никосии, а сестра здесь, в Ларнаке." },
      { el: "Το πρωί πίνω έναν καφέ χωρίς ζάχαρη και τρώω ψωμί με τυρί.", ru: "Утром я пью кофе без сахара и ем хлеб с сыром." },
      { el: "Το βράδυ τρώμε στο σπίτι: ψάρι με λαχανικά και σαλάτα. Το ψάρι είναι πολύ νόστιμο!", ru: "Вечером мы едим дома: рыбу с овощами и салат. Рыба очень вкусная!" },
      { el: "Το Σάββατο τρώω με τους φίλους μου στην ταβέρνα και πίνουμε λίγο κρασί.", ru: "В субботу я ужинаю с друзьями в таверне, и мы пьём немного вина." },
      { el: "Και εσύ; Από πού είσαι και τι κάνεις στη Λάρνακα;", ru: "А ты? Откуда ты и чем занимаешься в Ларнаке?" },
    ],
  },
  ```
  Every existing exercise of s[2] still has its source in this text (ex[6] «με τους φίλους μου», ex[8]–[9] and ex[16] listens, ex[10] build). Then s[5] `task` → `"Напиши такой же текст о себе для группы: 5–6 предложений — имя, откуда ты, где живёшь и работаешь, какие языки знаешь, о семье и о еде"` and model line 0 → `"Γεια σας! Με λένε Πάβελ."`.
- **W11 · weak · s[2].** Not harder than a core lesson: ex[0] is l03's `"Откуда ты?"` verbatim (and, unlike l03, rejects `Εσύ από πού είσαι;` — **T8 · trap**: add `accept: ["Εσύ από πού είσαι;", "Από πού είσαι εσύ;"]`). Append two transformations at the end of s[2]:
  ```ts
  { kind: "gap", prompt: "Έχω δύο αδερφούς. → Η Άννα ___ έναν αδερφό.", answer: "έχει", hint: "иметь: она" },
  { kind: "gap", prompt: "Μένω στη Λάρνακα. → Εσείς πού ___;", answer: "μένετε", hint: "жить: вы" },
  { kind: "translate", ru: "Мария работает в таверне, а Никос — в кафе.", answer: "Η Μαρία δουλεύει σε μια ταβέρνα και ο Νίκος σε μια καφετέρια.", accept: ["Η Μαρία δουλεύει σε μια ταβέρνα, και ο Νίκος σε μια καφετέρια.", "Η Μαρία δουλεύει σε μια ταβέρνα και ο Νίκος δουλεύει σε μια καφετέρια.", "Η Μαρία δουλεύει σε ταβέρνα και ο Νίκος σε καφετέρια."] },
  ```
- **T9 · trap · s[2] ex[2], ex[3].** `"Ты говоришь по-русски?"` → add `"Εσύ μιλάς ρωσικά;"`, `"Μιλάς ρωσικά εσύ;"`; `"Я хочу салат и воду."` → add `"Εγώ θέλω μία σαλάτα και ένα νερό."`, `"Εγώ θέλω μια σαλάτα και ένα νερό."`.
- **N12 · nit · s[4] ex[3].** «Где живёт Павел?» is answerable without listening (the learner is Pavel). Append instead a question that needs the audio: `{ kind: "choose", question: "О чём Никос спрашивает Павла в конце?", options: ["Где он сейчас живёт", "Откуда он", "Сколько ему лет"], answer: "Где он сейчас живёт" }`. Only 4 `choose` for the listening (rule 5–8) — this makes 5.
- **N13 · nit · s[3] line 4 vs l20 menu.** «Τρία ευρώ» for coffee with milk + water; the l20 menu of the same café has 2,50 + 1,00. In l20 s[0] line 3: `{ el: "Μπίρα 4 € · Κρασί 5 € · Νερό 0,50 €", ru: "Пиво 4 € · Вино 5 € · Вода 0,50 €" }` («Что дешевле всего?» still → Вода).

### l11 · Πόσων χρονών είσαι;

- **E4 · error · s[4] write model.** `"Η μαμά μου είναι σαράντα οκτώ."` — a 48‑year‑old mother of a 35‑year‑old. Numbers above 40 are untaught, so use a friend: `model: ["Είμαι τριάντα πέντε χρονών.", "Ο αδερφός μου είναι είκοσι οκτώ χρονών.", "Η Άννα είναι τριάντα δύο.", "Το κινητό μου είναι εννιά, εννιά, τέσσερα, πέντε, δύο, οκτώ, τρία, έξι."]` (Anna is 32 in the bible and in l20).
- **W12 · weak · s[1] title/line 0.** «Первый урок в языковой школе» — but l07 already had Pavel on the course with the Δασκάλα, who now asks his name as if for the first time. Retitle and give the question a reason: `title: "В языковой школе: список группы"`, line 0 → `{ who: "Δασκάλα", el: "Καλημέρα! Για την τάξη: πώς σε λένε;", ru: "Доброе утро! Для списка группы: как тебя зовут?" }`.
- **T10 · trap · s[3] ex[7], ex[8], ex[10].** Pronoun forms: `"Εσύ πόσων χρονών είσαι;"`; `"Εγώ είμαι σαράντα χρονών."`, `"Εγώ είμαι σαράντα."`; `"Εγώ έχω τρία παιδιά."`.
- **N14 · nit · s[3] ex[12] listen, ex[4] gap.** «Η κόρη μου…», «Ο γιος μου…» in a lesson where Pavel writes about himself and has no children. ex[12] → `{ kind: "listen", el: "Η κόρη τους είναι έξι χρονών.", ru: "Их дочке шесть лет." }` (also pre‑teaches l13's line); ex[4] → `prompt: "Ο γιος της είναι ___ χρονών. — 7 лет"` (της is read, not typed).
- **N15 · nit · s[3] ex[13] build.** `extra: ["τρεις", "έχω"]` — `έχω` is not a wrong form of an answer word; `extra: ["τρεις", "είσαι"]`.

### l12 · Πού; Πότε; Γιατί;

- **E5 · error · s[1] dialogue (continuity).** Eleni is Pavel's teacher (bible; l07/l11 Δασκάλα; l13 «Η δασκάλα μας είναι η Ελένη») and has just moved next door. Here she does not know him («Εσύ ποιος είσαι;» — which also sounds rude), and in l15 she introduces herself a third time. Rewrite lines 0–3 so she recognises him; everything the exercises use stays (`Πώς είσαι;`, `ποιος`, `γιατί/επειδή`, `πότε`, `πόσο`):
  ```ts
  { who: "Ελένη", el: "Καλησπέρα, Πάβελ! Εγώ είμαι, η Ελένη. Μένω εδώ τώρα!", ru: "Добрый вечер, Павел! Это я, Элени. Я теперь живу здесь!" },
  { who: "Πάβελ", el: "Ελένη! Η δασκάλα μου! Πώς είσαι;", ru: "Элени! Моя учительница! Как ты?" },
  { who: "Ελένη", el: "Καλά, ευχαριστώ. Ποιος μένει εδώ; Εσύ;", ru: "Хорошо, спасибо. Кто здесь живёт — ты?" },
  { who: "Πάβελ", el: "Ναι, εγώ! Εδώ, στο κέντρο.", ru: "Да, я! Здесь, в центре." },
  ```
- **W13 · weak · s[1] lines 7–8.** «Πόσο κάνει ο καφές εκεί;» comes from nowhere (why would she ask the price of coffee at the beach?). Give it a reason in line 7: `{ who: "Πάβελ", el: "Σήμερα δουλεύω, αλλά αύριο το πρωί πάω. Έλα κι εσύ! Πίνουμε και καφέ εκεί.", ru: "Сегодня работаю, а завтра утром иду. Приходи и ты! Там и кофе попьём." }`.
- **T11 · trap · s[3] ex[8]–ex[11].** Pronoun forms: `"Εσύ πότε δουλεύεις;"`; `"Εσύ γιατί δεν τρως κρέας;"`; `"Εσύ πόσες αδερφές έχεις;"`; `"Εσύ γιατί είσαι εδώ;"`, `"Γιατί είσαι εσύ εδώ;"`.
- **N16 · nit · s[3] ex[17], ex[18].** The prompt shape `"Πότε πίνεις καφέ; — ___. — утром"` makes the app read aloud only `Πότε πίνεις καφέ;` (the `say` logic takes the text before the first «—»), so the learner never hears the answer. Harmless; if you care: `prompt: "Πίνω καφέ ___. — утром"` / `"Τρώμε στην ταβέρνα ___. — вечером"` with `answer: "το πρωί"` / `"το βράδυ"`.

### l13 · Ο φίλος μου κι εγώ

- **E6 · error · s[1] line 6.** «Η Άννα και εγώ μαθαίνουμε ελληνικά μαζί. Η δασκάλα μας είναι η Ελένη.» — Anna is Greek, from Athens. Replace with Katya (Russian, introduced here and confirmed in l14, where she learns Greek and lives with Eleni): `{ el: "Η φίλη μου η Κάτια και εγώ μαθαίνουμε ελληνικά μαζί. Η δασκάλα μας είναι η Ελένη.", ru: "Мы с моей подругой Катей вместе учим греческий. Наша учительница — Элени." }`.
- **E7 · error · s[4] write model.** `"Μένει στη Λεμεσό με τον άντρα της.", "Τα παιδιά τους είναι μικρά."` — the bible gives Anna one son and no husband. `model: ["Η φίλη μου είναι η Άννα.", "Μένει στη Λεμεσό με τον γιο της.", "Ο γιος της είναι μικρός.", "Το Σάββατο τρώμε μαζί στην ταβέρνα."]`.
- **E8 · error (vocabulary) · `words`.** `Σάββατο` is read here and typed in l19 s[1] ex[13] without ever being taught; it is a deck word (day 17). Add it to this lesson: `words: ["σου", "του / της", "μας", "σας", "τους", "ο φίλος / η φίλη", "η γυναίκα", "ο άντρας", "το όνομα", "μαζί", "το αυτοκίνητο", "το Σάββατο"]` (the reading and the model use it twice).
- **T12 · trap · s[3] ex[7].** «Это моя подруга Анна.» → also `"Αυτή είναι η Άννα, η φίλη μου."`, `"Είναι η Άννα, η φίλη μου."`. Add to `accept`.
- **W14 · weak · s[3] ex[15] spot.** «Η Μαρία δουλεύει με την κόρη της» — Maria works with her six‑year‑old. `{ kind: "spot", el: "Η Μαρία πάει στη θάλασσα με [η κόρη] της.", fix: "Η Μαρία πάει στη θάλασσα με την κόρη της.", ru: "Мария идёт на море с дочкой.", explain: "После με — винительный: την κόρη" }`.

### l14 · Πρακτική: διαβάζω και ακούω (practice)

- **E9 · error · s[0] line 0 / line 12.** The letter is addressed to Anna and ends «Πότε έρχεσαι στην Κύπρο;» — Anna lives in Limassol and works in Larnaca. Make the addressee a friend in Russia: line 0 → `{ el: "Γεια σου, Λένα!", ru: "Привет, Лена!" }`. (No comprehension question depends on the addressee.)
- **W15 · weak · s[0].** 112 words (rule ≥120) and four untaught words (`άνθρωποι`, `πατάτες`, `διαβάζω`, `έρχεσαι`). Lengthen two lines: line 3 → `{ el: "Εγώ δουλεύω σε μια ταβέρνα στη θάλασσα, στις Φοινικούδες.", ru: "Я работаю в таверне у моря, на Финикудес." }`; line 6 → `{ el: "Το ψάρι μας είναι πολύ νόστιμο, αλλά εγώ δεν τρώω ψάρι!", ru: "Рыба у нас очень вкусная, но я рыбу не ем!" }` → 121 words.
- **T13 · trap · s[1] ex[12].** «Утром я пью кофе.» — time words may go last (policy item 6): `accept: ["Το πρωί πίνω έναν καφέ.", "Πίνω καφέ το πρωί.", "Πίνω έναν καφέ το πρωί.", "Εγώ το πρωί πίνω καφέ.", "Το πρωί εγώ πίνω καφέ."]`.
- **N17 · nit · s[1]/s[3].** Only one `spot` in the whole lesson (rule 2–3). Append to s[3]: `{ kind: "spot", el: "Είμαι στην καφετέρια με [ο Πάβελ].", fix: "Είμαι στην καφετέρια με τον Πάβελ.", ru: "Я в кафе с Павлом.", explain: "После με — винительный: τον Πάβελ" }`.

### l15 · Ένα γράμμα για μένα (task)

- **E10 · error · s[0], s[2], s[3] (continuity).** Eleni «introduces herself» to Pavel by letter and the role‑play says «вы знакомитесь» — after l07/l11 (teacher), l12 (neighbour) and l13 («our teacher»). Reframe the letter as the teacher's sample for the group, and give the role‑play a new partner with a complication (the prompt requires one; none is present):
  - s[0] `title: "Образец: Элени написала о себе для группы"`; line 0 → `{ el: "Γεια σας, παιδιά!", ru: "Привет всем!" }`; line 7 → `{ el: "Εσείς; Από πού είστε και τι κάνετε στη Λάρνακα; Γράψτε μου!", ru: "А вы? Откуда вы и чем занимаетесь в Ларнаке? Напишите мне!" }`.
  - s[2] `task: "Элени показала группе своё письмо-образец и просит написать ей такое же. Напиши письмо о себе"`.
  - s[3]:
    ```ts
    {
      kind: "speak",
      title: "Знакомство в кафе",
      scenario: "Ты сидишь в кафе «Θάλασσα» в Ларнаке. Никос знакомит тебя со своим другом Йоргосом и уходит работать; вы разговариваете о себе. Осложнение: один раз Йоргос говорит слишком быстро — скажи, что не понял (Δεν καταλαβαίνω. Πώς;), и попроси повторить.",
      aiRole: "Γιώργος, 34 года, киприот из Ларнаки, работает в аэропорту, женат, двое детей; дружелюбный и разговорчивый; один раз произносит длинную фразу очень быстро, а когда его просят повторить — говорит медленно и просто",
      goals: [
        "Поздороваться и представиться",
        "Сказать, откуда ты, сколько тебе лет и где живёшь",
        "Спросить Йоргоса о работе и семье",
        "Объяснить, почему ты учишь греческий (επειδή …)",
        "Один раз переспросить и попрощаться: Τα λέμε!",
      ],
    },
    ```
- **W16 · weak · s[1] ex[3]–ex[5].** The «rehearsal» gaps are lesson‑2 gaps (`χρονών`, `επειδή`, `μου`), not the phrases the letter needs. Append:
  ```ts
  { kind: "translate", ru: "Я из России, но сейчас живу в Ларнаке.", answer: "Είμαι από τη Ρωσία, αλλά τώρα μένω στη Λάρνακα.", accept: ["Εγώ είμαι από τη Ρωσία, αλλά τώρα μένω στη Λάρνακα."] },
  { kind: "translate", ru: "Я учу греческий, потому что живу здесь.", answer: "Μαθαίνω ελληνικά επειδή μένω εδώ.", accept: ["Μαθαίνω ελληνικά, επειδή μένω εδώ.", "Μαθαίνω ελληνικά γιατί μένω εδώ.", "Μαθαίνω ελληνικά, γιατί μένω εδώ.", "Εγώ μαθαίνω ελληνικά επειδή μένω εδώ."] },
  { kind: "translate", ru: "А ты? Напиши мне!", answer: "Εσύ; Γράψε μου!" },
  ```
  (`Γράψε μου` is a fixed phrase from the model; if you prefer not to type an untaught imperative, drop the third item.)
- **N18 · nit · s[1] ex[1].** Options «Учительницей / Официанткой / В банке» are not parallel. `options: ["Учительницей", "Официанткой", "Продавщицей"]`.

### l16 · Τι έχεις στην τσάντα σου;

- **W17 · weak · s[1] line 0.** `περιμένω` is a new word that is never in the text (it appears only in exercises); and the scene reads as a couple leaving home (Anna knows where Pavel's cards are). One change fixes both: `{ who: "Άννα", el: "Πάβελ, πάμε! Ο Νίκος περιμένει. Έχεις τα κλειδιά;", ru: "Павел, пошли! Никос ждёт. Ключи у тебя?" }`.
- **T14 · trap · s[3] ex[9].** «Мы ждём друзей.» — `Περιμένουμε φίλους.` (indefinite, the natural reading of the Russian) is rejected. `accept: ["Περιμένουμε τους φίλους μας.", "Εμείς περιμένουμε τους φίλους.", "Εμείς περιμένουμε τους φίλους μας.", "Περιμένουμε φίλους."]`. ex[8]: add `"Εγώ δεν βλέπω τα γυαλιά μου."`; ex[10]: add `"Εγώ παίρνω τα βιβλία και τα τετράδια."`.
- **N19 · nit · s[1] line 3 ru.** «Не вижу карт!» reads as «maps». `ru: "Не вижу карты!"`.
- **N20 · nit.** `τα λεφτά`, `το τετράδιο` are not in the text (model/grammar only). Line 5 → `{ who: "Πάβελ", el: "Α, ναι! Παίρνω τις κάρτες, τα γυαλιά μου και λίγα λεφτά.", ru: "А, точно! Беру карты, очки и немного денег." }`.

### l17 · Είναι μεγάλο;

- **T15 · trap · s[3] ex[1], ex[7] (and l19 s[1] ex[11]).** `καινούργιος` is an equally standard spelling (both are in the Triantafyllidis dictionary; signs in Larnaca use both). ex[1] `accept: ["καινούργια"]`; ex[7] add `"Έχω ένα καινούργιο κινητό."`, `"Έχω καινούργιο κινητό."`, `"Εγώ έχω ένα καινούριο κινητό."`.
- **W18 · weak · s[4] write model.** `κουζίνα`, `τραπέζι` are untaught (rule: models use taught words only). `model: ["Το διαμέρισμά μου είναι μικρό, αλλά ωραίο.", "Είναι στο κέντρο, και η θάλασσα είναι εδώ.", "Θέλω έναν καινούριο υπολογιστή, αλλά όχι ακριβό."]`.
- **W19 · weak · s[2] block 2.** «После гласной или некоторых согласных в женском роде -α» — «некоторых согласных» is not a rule the learner can apply. `{ kind: "p", text: "Если перед -ος стоит гласная или ι (ωραίος, καινούριος, παλιός), в женском роде окончание -α: ωραία, καινούρια, παλιά" }`.
- **N21 · nit · s[1] line 3 ru.** «Είναι λίγο μικρό» → «Он маловат.» (the Russian drops `λίγο`).
- **N22 · nit · s[1] line 8.** Anna's line is a bolt‑on to show the feminine; acceptable, but «πολύ παλιά» after Pavel's «πολύ παλιό» is the same sentence twice. `{ who: "Άννα", el: "Και εγώ θέλω μια καινούρια τσάντα. Αυτή εδώ είναι ωραία και φτηνή!", ru: "А я хочу новую сумку. Вот эта красивая и дешёвая!" }` (uses `φτηνή`, which the exercises test).

### l18 · Τι θέλεις να κάνεις;

- **T16 · trap · s[3] ex[9].** «Завтра мы хотим пойти на море.» — four natural orders, one accepted. `accept: ["Θέλουμε να πάμε στη θάλασσα αύριο.", "Θέλουμε αύριο να πάμε στη θάλασσα.", "Θέλουμε να πάμε αύριο στη θάλασσα.", "Αύριο εμείς θέλουμε να πάμε στη θάλασσα.", "Εμείς αύριο θέλουμε να πάμε στη θάλασσα."]`. ex[7]: add `"Εσύ τι θέλεις να κάνεις σήμερα;"`; ex[10]: add `"Εγώ θέλω να μιλάω καλά ελληνικά."`; ex[3]: `accept: ["μιλούμε"]`.
- **W20 · weak · s[1] line 7.** «Εντάξει! Και κάθε μέρα διαβάζω και γράφω λίγο στα ελληνικά.» is not a reply, it is where `διαβάζω/γράφω` were parked. `{ who: "Πάβελ", el: "Εντάξει! Κάθε μέρα διαβάζω και γράφω λίγο, αλλά δεν μιλάω!", ru: "Договорились! Я каждый день немного читаю и пишу, а вот не говорю!" }` — now it answers Nikos.
- **N23 · nit · s[1] line 2 ru.** «Но завтра хочу, чтобы мы вместе пошли в кино.» is a gloss. `ru: "А завтра давай вместе в кино."`.

### l19 · Πρακτική: όλα μαζί (practice)

- **E11 · error (vocabulary) · s[1] ex[11].** The typed answer `Ο Αντρέας είναι ο καινούριος γείτονάς μου.` uses `γείτονας`, taught nowhere (no `words`, no `extraWords`), with the enclitic double accent on top. The validator missed it because its stem for `γεια` is `γε`. Keep the neighbour in the reading (glossed) and type a taught word:
  `{ kind: "translate", ru: "Андреас — мой новый друг.", answer: "Ο Αντρέας είναι ο καινούριος φίλος μου.", accept: ["Ο Αντρέας είναι ο καινούριος μου φίλος.", "Ο Αντρέας είναι ο καινούργιος φίλος μου.", "Ο Αντρέας είναι ο καινούργιος μου φίλος."] }`.
  (Alternative if you want the word taught: `extraWords: [{ el: "ο γείτονας", tr: "о йи́тонас", ru: "сосед", example: { el: "Ο Αντρέας είναι ο γείτονάς μου.", ru: "Андреас — мой сосед." } }]` on l19 and keep the item with `accept: ["Ο Αντρέας είναι ο καινούριος μου γείτονας.", "Ο Αντρέας είναι ο καινούργιος γείτονάς μου."]`; note the deck already has `ο γείτονας` at day 68, so this duplicates a card.)
- **E12 · error (vocabulary) · s[1] ex[13].** `Σάββατο` typed before taught — fixed by E8 (add to l13 `words`). Also add `accept: ["Το Σάββατο θέλουμε να πάμε στη θάλασσα μαζί.", "Εμείς το Σάββατο θέλουμε να πάμε μαζί στη θάλασσα."]`.
- **W21 · weak · s[1] ex[14] spot.** «Η Σοφία είναι [δάσκαλος]» — in real Greek, -ος profession nouns are used for women (η γιατρός, η δικηγόρος), and `η δάσκαλος` is heard; the item is not «ungrammatical in every reading» as the spot rule demands. Replace with an unarguable one: `{ kind: "spot", el: "Η Σοφία [είσαι] δασκάλα.", fix: "Η Σοφία είναι δασκάλα.", ru: "София — учительница.", explain: "Она — είναι" }` — or, to keep the gender point, `{ kind: "spot", el: "Η Σοφία είναι [καλός] δασκάλα.", fix: "Η Σοφία είναι καλή δασκάλα.", ru: "София — хорошая учительница.", explain: "δασκάλα — женский род: καλή" }`.
- **T17 · trap · s[1] ex[12].** Add `"Μένει εδώ με τη γυναίκα του και με τα παιδιά του."` to `accept`.

### l20 · Τεστ A1.1 (test)

- **E13 · error · s[0] line 9.** «Το κινητό μου είναι 99 45 28 36» — that is Pavel's number (l11 dialogue and model). `{ el: "Το κινητό μου είναι 96 73 15 40. Τα λέμε, Νίκος", ru: "Мой мобильный — 96 73 15 40. До встречи, Никос" }`.
- **E14 · error · s[5] essay req[2].** «Коротко о себе для Анны: откуда ты, где живёшь и работаешь…» — Anna is Pavel's friend; she knows. `"Коротко о себе для Йоргоса, друга Никоса, который тоже придёт и тебя не знает: откуда ты, где живёшь и работаешь, какие языки знаешь и почему учишь греческий (επειδή …)"` (Γιώργος from the l15 fix).
- **W22 · weak · s[4] language part.** (a) No core lesson 9 item (accusative article τον/την/το, τρώω/πίνω). (b) No connected mini‑cloze (prompt, test rule 3). (c) ex[17] is l18's spot almost verbatim. Replace ex[17] in place and append at the end of s[4]:
  ```ts
  // ex[17] in place
  { kind: "spot", el: "Αύριο θέλουμε [πάμε] στη θάλασσα.", fix: "Αύριο θέλουμε να πάμε στη θάλασσα.", ru: "Завтра мы хотим пойти на море.", explain: "После θέλω обязательно να" },
  // appended
  { kind: "gap", prompt: "Θέλω ___ κατάλογο, παρακαλώ.", answer: "τον", hint: "артикль: кого? что? (м. р.)" },
  { kind: "translate", ru: "Я не ем рыбу.", answer: "Δεν τρώω ψάρι.", accept: ["Εγώ δεν τρώω ψάρι."] },
  { kind: "gap", prompt: "Με λένε Κάτια. ___ από τη Ρωσία, αλλά τώρα μένω στη Λάρνακα.", answer: "Είμαι", hint: "быть: я" },
  { kind: "gap", prompt: "Μένω με τη φίλη μου ___ Ελένη.", answer: "την", hint: "артикль: вин. ж. р., перед гласной" },
  { kind: "gap", prompt: "Το πρωί πίνω καφέ και το βράδυ ___ στην ταβέρνα.", answer: "δουλεύω", hint: "работать: я" },
  { kind: "gap", prompt: "Μαθαίνω ελληνικά, ___ δεν μιλάω πολύ καλά.", answer: "αλλά", hint: "но" },
  ```
  The last four gaps are one connected text (Katya's letter, which the learner has read).
- **T18 · trap · s[4] ex[3], ex[9].** `accept: ["μιλά"]`; `"Εγώ είμαι τριάντα χρονών."`, `"Εγώ είμαι τριάντα."`.
- **N24 · nit · s[0].** 64 words (test rule 80–150). The menu lines are dense; one more real line makes it a proper notice: after line 4 → `{ el: "Τετάρτη και Σάββατο το απόγευμα: κλειστά", ru: "В среду и субботу после обеда: закрыто" }` — this is the Cypriot closing‑hours fact the bible mentions, and it gives a seventh `choose` with a real distractor: append to s[1] `{ kind: "choose", question: "Когда кафе закрыто?", options: ["В среду и субботу после обеда", "Каждый день после 22:00", "В воскресенье"], answer: "В среду и субботу после обеда" }`. (Comprehension only; `Τετάρτη`, `απόγευμα`, `κλειστά` are glossed, never typed.)

---

## Systemic trap: pronoun / order variants (policy items 1 and 6)

The prompt's `accept` policy says: every translate whose verb is 1st/2nd person accepts the pronoun form, and time words may stand first or last. The policy was applied in l03, l06 (two items), l09, l13 and l18 only. Full list of items that currently reject a correct answer (in addition to the lesson entries above):

| Item | Add to `accept` |
|---|---|
| l03 s[3] ex[7] | `Από πού είσαι εσύ;` |
| l05 s[3] ex[8] | `Εγώ θέλω τσάι.` |
| l06 s[3] ex[7] | `Εσύ πού δουλεύεις;` · `Πού δουλεύεις εσύ;` |
| l06 s[3] ex[8] | `Εμείς μένουμε σε διαμέρισμα.` |
| l07 s[3] ex[7] | `Εγώ δεν καταλαβαίνω.` |
| l07 s[3] ex[8] | `Εσύ ξέρεις ελληνικά;` · `Ξέρεις ελληνικά εσύ;` |
| l08 s[3] ex[7] | `Εγώ έχω έναν αδερφό και μία αδερφή.` · `Εγώ έχω έναν αδερφό και μια αδερφή.` · `Έχω αδερφό και αδερφή.` |
| l09 s[3] ex[6] | `Εγώ δεν τρώω κρέας.` |
| l10 s[2] ex[0] | `Εσύ από πού είσαι;` · `Από πού είσαι εσύ;` |
| l10 s[2] ex[2] | `Εσύ μιλάς ρωσικά;` · `Μιλάς ρωσικά εσύ;` |
| l10 s[2] ex[3] | `Εγώ θέλω μία σαλάτα και ένα νερό.` · `Εγώ θέλω μια σαλάτα και ένα νερό.` |
| l11 s[3] ex[7] | `Εσύ πόσων χρονών είσαι;` |
| l11 s[3] ex[8] | `Εγώ είμαι σαράντα χρονών.` · `Εγώ είμαι σαράντα.` |
| l11 s[3] ex[10] | `Εγώ έχω τρία παιδιά.` |
| l12 s[3] ex[8] | `Εσύ πότε δουλεύεις;` |
| l12 s[3] ex[9] | `Εσύ γιατί δεν τρως κρέας;` |
| l12 s[3] ex[10] | `Εσύ πόσες αδερφές έχεις;` |
| l12 s[3] ex[11] | `Εσύ γιατί είσαι εδώ;` · `Γιατί είσαι εσύ εδώ;` |
| l14 s[1] ex[12] | `Πίνω καφέ το πρωί.` · `Πίνω έναν καφέ το πρωί.` · `Εγώ το πρωί πίνω καφέ.` · `Το πρωί εγώ πίνω καφέ.` |
| l16 s[3] ex[7] | `Εγώ έχω τα κλειδιά και το πορτοφόλι.` |
| l16 s[3] ex[8] | `Εγώ δεν βλέπω τα γυαλιά μου.` |
| l16 s[3] ex[9] | `Εμείς περιμένουμε τους φίλους μας.` · `Περιμένουμε φίλους.` |
| l16 s[3] ex[10] | `Εγώ παίρνω τα βιβλία και τα τετράδια.` |
| l17 s[3] ex[7] | `Εγώ έχω ένα καινούριο κινητό.` · `Έχω ένα καινούργιο κινητό.` · `Έχω καινούργιο κινητό.` |
| l17 s[3] ex[10] | `Είναι καλή αυτή η ταβέρνα;` |
| l18 s[3] ex[7] | `Εσύ τι θέλεις να κάνεις σήμερα;` |
| l18 s[3] ex[9] | `Θέλουμε αύριο να πάμε στη θάλασσα.` · `Θέλουμε να πάμε αύριο στη θάλασσα.` · `Αύριο εμείς θέλουμε να πάμε στη θάλασσα.` · `Εμείς αύριο θέλουμε να πάμε στη θάλασσα.` |
| l18 s[3] ex[10] | `Εγώ θέλω να μιλάω καλά ελληνικά.` |
| l19 s[1] ex[13] | `Το Σάββατο θέλουμε να πάμε στη θάλασσα μαζί.` · `Εμείς το Σάββατο θέλουμε να πάμε μαζί στη θάλασσα.` |
| l20 s[4] ex[9] | `Εγώ είμαι τριάντα χρονών.` · `Εγώ είμαι τριάντα.` |

A more robust alternative, which the owner may prefer over 30 edits: have `exerciseItem` (src/program/index.ts, case `"translate"`) generate the pronoun variant automatically — if an accepted answer starts with a 1st/2nd‑person verb form, also accept it prefixed with `εγώ/εσύ/εμείς/εσείς`, and vice versa strip a leading pronoun. That is a code change, out of scope here, but it is the only way the policy will survive seven more epochs.

Related doublets to accept systematically: `μιλάει/μιλά`, `μιλάμε/μιλούμε`, `αγαπάνε/αγαπούν/αγαπάν`, `καινούριος/καινούργιος`, `επτά/εφτά`, `οκτώ/οχτώ`, `εννέα/εννιά` (the last three are handled where they occur).

---

## Systemic observations

1. **Character bible — add a timeline and fixed data.** The contradictions above all come from facts the bible does not state or states loosely. Add to «The people»: *Pavel: one brother (28), parents in Russia, no sister; phone 99 45 28 36.* *Anna: Greek — never a Greek learner; one son (give him an age); no husband is mentioned, do not invent one.* *Nikos: lives in Larnaca centre with Maria and the daughter; phone 96 73 15 40.* *Eleni: is the Δασκάλα from l07 on; moves next door in l12; from l13 the learner's group includes Κάτια (Russian, lives with Eleni, works in a taverna).* *Γιώργος: Nikos's friend (l15), works at the airport.* A one‑line «who has met whom by which lesson» list would have prevented l10, l12 and l15.

2. **The «Με λένε … Είμαι από … Μένω … Δουλεύω … Μιλάω … Η οικογένειά μου …» template** is the reading of l08, l10, l14, l15 and the model for the writes of l10 and the essays of l15 and l20. The exam does need one such text; four is filler. The prompt's genre list (a form, a WhatsApp exchange, a fridge note, a timetable, an advert) is unused except for the test menu. For epoch 2 the prompt should cap «self‑presentation» texts at two per epoch and require at least one non‑dialogue functional genre per unit.

3. **Tics.** Lines beginning with `Ωραία` ×6, `Εντάξει` ×7, `Τα λέμε` ×8 across 20 lessons; `Καλή όρεξη!` closes both l09 and l20 (the prompt forbids a repeated closing). Rotate with `Έγινε`, `Μάλιστα`, `Καλά`, `Τέλεια`, `Πάμε`.

4. **The validator's vocabulary check is not a safety net.** `stem()` reduces a 4‑letter word to 2 letters (`γεια → γε`, `ναι → να`, `και → κα`, `εδώ → εδ`), so `startsWith` marks nearly every token as taught; and any capitalised mid‑sentence token is skipped as a name, so `Σάββατο`, `Κύπρο`, `Ρωσία` are never checked. Suggested rules (scripts/validate-program.mjs): minimum stem length 4 (3 for verbs ending in -ω), a maintained list of proper names instead of «capital = name», and a word count check for practice readings (≥120) and test readings (≥80). With those rules the current epoch produces the warnings this review lists by hand (l19 γείτονας/Σάββατο, l10 53 words).

5. **Practice lessons are only partly «the hardest days».** l14 and l19 are good (transformations with the source sentence, distractors taken from the text). l10 is a core lesson with the words step removed. The appended items above help; the pattern to carry forward is l19 s[1] ex[6]–ex[10].

6. **Write models and essays.** Several models use untaught words (l08 `γονείς`, `Μόσχα`; l09 `Το πρωί`; l17 `κουζίνα`, `τραπέζι`; l03 `στην` before l06 is a fixed phrase — fine). The models are what the learner copies; they must be inside the taught set and inside the bible.

7. **New words used once.** `καληνύχτα`, `επίσης` (l02), `αυτοί/αυτές/αυτά` (l03), `η καφετέρια`, `το πιάτο` (l04), `ο σερβιτόρος`, `εντάξει` (l05), `η δουλειά` (l06), `η κόρη`, `η μητέρα` (l08), `η ταβέρνα`, `το φαγητό` (l09), `περιμένω`, `τα λεφτά`, `το τετράδιο` (l16), `κακός` (l17) are each missing one of the two required uses (text or exercise). Fixes are given per lesson; the validator does not catch these because `plainText.includes(stem)` matches the word card example or a Russian hint.

8. **Mechanics worth knowing when writing builds.** `sentenceTiles` keeps a capital on any capitalised word after the first, so a two‑sentence build (`Χαίρω πολύ! Τα λέμε!`) shows `Τα` with a capital — a free hint about where the second sentence starts. Keep builds to one sentence.

9. **A1.1 coverage** is appropriate for Ελληνομάθεια A1 part 1: alphabet, greetings, είμαι/έχω, A and B verbs, articles in nom./acc. sg. and pl., possessives, numbers to 40, question words, adjectives, θέλω να. Nothing from the plan is missing; `πόσο κάνει` and prices are pre‑taught in texts before e2, which is fine.

---

## Changes I would make to `docs/LESSON_PROMPT.md`

- **«The people»**: add the fixed data and the timeline from observation 1; add the sentence «A Greek character never learns Greek; a Russian one (Κάτια) can», and the two phone numbers.
- **«Texts»**: add «at most two self‑presentation texts (Με λένε… Είμαι από…) per epoch» and «each unit has at least one functional text that is not a dialogue: a form, a message thread, a note, a timetable, a notice, a menu».
- **«accept policy»**: make item 1 concrete with the exact mechanical rule («for every translate whose answer begins with a 1st/2nd person verb, add the εγώ/εσύ/εμείς/εσείς variant; for every answer that begins with σήμερα/αύριο/το πρωί/το βράδυ/κάθε…, add the variant with the time word last»), and add a short doublet list (`μιλά`, `μιλούμε`, `-άν/-άνε/-ούν`, `καινούργιος`).
- **«spot»**: add «do not use gender‑of‑profession items (δάσκαλος for a woman is tolerated in speech); use case, person, article and να errors».
- **«Vocabulary discipline»**: say explicitly that `write.model` and `essay.requirements` are checked against the taught set and the bible, and that a new word's two uses must be in the *text* and in an *exercise answer or the model* (not in a hint, not in the word card example).
- **«practice»**: add «the reading is ≥120 words — count them; a practice lesson's translate items must not repeat a core lesson's item verbatim».
- **«test»**: keep the coverage table but require it in the summary («lesson → item index») and name the cloze as a separate required block of 3–4 consecutive gaps.
- **«Self‑review pass»**: add «every phone number, age, place and family fact in the epoch is checked against the bible, with the lesson id listed», and «count the words of every practice and test reading».
