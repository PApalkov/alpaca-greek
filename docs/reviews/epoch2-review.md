# Epoch 2 (A1.2 «Η μέρα μου») — independent review

Reviewer: Modern Greek teacher / Ελληνομάθεια A1–A2 examiner, reading as the Russian-speaking learner in Larnaca first and as an editor second. Scope: `src/program/epoch2.ts`, all 20 lessons, checked against `curriculum.ts`, `types.ts`, `docs/LESSON_PROMPT.md`, `epoch1.ts`, `src/lib/greek.ts` (`checkAnswer`), `src/grammar/questions.ts`, `src/data/words.json`. `npm run validate:program` passes (6 warnings, all false positives on -ομαι conjugation forms). Positions are 0-based: `lNN s[step] ex[exercise]`, `line[n]` for dialogue lines, `text[n]` for reading sentences, `blocks[n]` for grammar.

## Status: applied

- **Errors, traps and weak items:** all applied in place, or appended at the end of a step. Deviations:
  - **μαγαζί / κλειστός:** taught in l07 (a dialogue line plus an appended gap), not as `extraWords` of l09. The validator requires a words step for new words, and inserting a step into a practice lesson would shift progress.
  - **μέχρι:** moved from l16's words to l02, with an appended gap.
  - **ο μήνας:** the appended l11 translate uses 500, because εξακόσια is not on a word list.
  - **l07 dialogue:** Maria's added line uses `Πας στο σούπερ μάρκετ;` (no untaught imperative).
- **Nits left as they are:**
  - l03 has 13 dialogue lines;
  - the first visit in l11;
  - the deck day of λουλούδι;
  - the l16 write model and ex8 (their Russian imperfectives justify them).
- **Systemic 1–3:** done in `checkAnswer`.
  - 1st-person -ώ is now a doublet (ξυπνώ = ξυπνάω), as are -κόσια (εφτακόσια = επτακόσια) and αβγό / αυγό.
  - Final ν: a kept ν where it is not required is tolerated (`την Δευτέρα`). A missing required ν stays wrong.
- **Systemic 4:** the future rule is in LESSON_PROMPT. The AI essay prompt now tells the reviewer that at A1 θα + present is the only future taught.
- **Systemic 5:** μήνας, μαγαζί and κλειστός are now taught. σχολείο and τράπεζα are listed as debt for epoch 3.
- **LESSON_PROMPT.md:** all 8 recommended changes applied. Ρένα, Θεσσαλονίκη, Μακένζι and Νάπα were added to `NAMES`.

## Verdict

This is a solid, mostly professional epoch: the texts are real (a broken laptop, a WhatsApp shopping list, flat ads, a note for the neighbour watering the plants), the characters stay consistent with «The people» to a degree epoch 1 did not reach (Pavel's working hours, the Monday/Wednesday 18:30 lessons, the Thursday club, Katya's taverna days and her no-fish rule, the café menu prices from e1-l20 all line up across lessons), practice days are genuinely heavier, and the test covers every core lesson with a real mini-cloze. The Greek is Standard, not Cypriot, and almost all of it would pass for what a native says in Larnaca. The problems are concentrated in a few places: two factual slips in grammar notes, one internal contradiction (the ad and the agent disagree about the bed), one typed answer built on a collocation never taught, a handful of `accept` traps, and three lines whose Greek is grammatical but not what a native would say. None of it needs restructuring; everything can be fixed in place.

Top 5 problems:

1. **l19 s1 ex15** — the only correct answer is «θα κάνουμε βόλτα», but «κάνω βόλτα» is never taught; the course has taught «πάω για βόλτα» (l17, l19 text). A learner who writes `Το βράδυ θα πάμε για βόλτα στην παραλία` is told they are wrong (verified against `checkAnswer`).
2. **l14 s0 text[4] vs s2 line[6]** — the first ad promises «καινούριο κρεβάτι», the agent on the phone says «Το κρεβάτι είναι παλιό». Nobody remarks on it, and both comprehension sets ask about exactly this detail.
3. **l16 s2 blocks[2]** — «У είμαι, έχω, ξέρω, μπορώ будущее только такое» is false for μπορώ (θα μπορέσω exists and is the usual form). **l07 s2 blocks[5]** — «λίγο, πολύ — с тем, что не считают, среднего рода» teaches a false rule (λίγη ζάχαρη, πολλή ζέστη, πολύς κόσμος).
4. **l15 s0 text[7]** — Eleni writes «ο Πάβελ … μαθαίνει ελληνικά μαζί μου!», which reads as «learns Greek together with me» — exactly the biography error the prompt forbids for Eleni, and the Russian line («учит греческий у меня») translates what the Greek does not say.
5. **Unnatural lines flagged by the author and confirmed here**: l17 «Η Ελένη ίσως έρχεται κι αυτή» (natives say ίσως έρθει / ίσως και η Ελένη), l18 «Κι εγώ φέρνω ένα γλυκό» at the moment of handing it over (natives say έφερα; the Russian «принесла» shows the mismatch), l16 «Το πρωί θα καθαρίζω και το απόγευμα θα μαγειρεύω» for a one-off Saturday (natives say θα καθαρίσω / θα μαγειρέψω).

## Counts by severity

| Severity | Count |
|---|---|
| error | 7 |
| trap | 9 |
| weak | 14 |
| nit | 12 |
| **total** | **42** |

## Issues by lesson

### l01 Τι ώρα είναι;

- **weak** `l01 s1 line[10]` «Έντεκα και σαράντα… όχι, δώδεκα παρά είκοσι.» + `s2 blocks[2]`. «Έντεκα και σαράντα» is perfectly normal Greek (the digital reading, extremely common on Cyprus); the «όχι» frames it as a mistake and the grammar note («После половины — παρά») makes it a rule. A learner will later be «corrected» by natives who say και σαράντα. Keep the dialogue joke but soften it, and tell the truth in the note:
  ```ts
  { who: "Πάβελ", el: "Έντεκα και σαράντα… ε, δώδεκα παρά είκοσι. Γιατί;", ru: "Одиннадцать сорок… то есть без двадцати двенадцать. А что?" },
  ```
  ```ts
  { kind: "p", text: "До половины — και («и»): έξι και δέκα. После половины обычно παρά («без») и следующий час: επτά παρά είκοσι — это 6:40. Как на цифровых часах тоже говорят: έξι και σαράντα" },
  ```
- **weak** `l01 s3 ex14` spot `Είναι [τρία] και δέκα.` — as a price («Πόσο είναι; — Είναι τρία και δέκα», 3,10 €) the sentence is grammatical, so the bracketed part is not wrong in every reading. Anchor it to the clock:
  ```ts
  { kind: "spot", el: "Τι ώρα είναι; Είναι [τρία] και δέκα.", fix: "Τι ώρα είναι; Είναι τρεις και δέκα.", ru: "Который час? Десять минут четвёртого.", explain: "Часы — η ώρα (ж. р.): τρεις, а не τρία" },
  ```
- **nit** `l01 s2` the table has no «μισή» standing alone (Είναι δωδεκάμισι / τρεισήμισι) although `s3 ex9` accepts «τεσσερισήμισι». Add one row: `["4:30", "τέσσερις και μισή = τεσσερισήμισι"]`.
- Verified as correct and natural: «τεσσερισήμισι» (ΛΚΝ spelling), «στη μία», «Μπορείς [στις μία];» (ungrammatical in every reading), «Η Άννα είμαι», «Στις δώδεκα έχω συνάντηση».

### l02 Η εβδομάδα μου

- **weak** `l02 s2 blocks[3]` teaches «από τη Δευτέρα μέχρι την Παρασκευή» and the reading uses μέχρι three times, but μέχρι is a new word only in l16. It is a day-25 deck word that A1 timetables cannot do without. Add it here and keep l16's entry (duplicates are harmless to the validator):
  ```ts
  words: ["η Δευτέρα", "η Τρίτη", "η Τετάρτη", "η Πέμπτη", "η Παρασκευή", "η Κυριακή", "η εβδομάδα", "πάντα", "συχνά", "μερικές φορές", "ποτέ", "μέχρι"],
  ```
- **nit** `l02 s0` the reading has three untaught words (μάθημα, μέχρι, ταινίες) — at the limit; with μέχρι added above it is two.
- Verified: «Πόσο συχνά μιλάτε ελληνικά;» has one natural order; «[Ποτέ πίνω] κρασί» is ungrammatical; the form genre is exactly what the A1 exam uses; the Thursday-19:00 club here matches l05, l04's write model and l20.

### l03 Ξυπνάω στις επτά

- **trap (systemic, see below)** `l03 s3 ex7` «Я встаю рано.» → `Ξυπνάω νωρίς.` A learner who writes `Ξυπνώ νωρίς` (the contracted 1st person the deck's own -άω doublet rule implies) is rejected: `checkAnswer` canonicalises μιλά/μιλούμε/μιλούν but not 1st-sg -ώ. Until the checker is extended, add `accept: ["Ξυπνώ νωρίς."]`.
- **nit** title/titleRu «Ξυπνάω στις επτά — Я встаю в семь» and `s3 ex0` «Во сколько ты встаёшь?» while the hint correctly says «просыпаться». ξυπνάω = просыпаться; «встаю» is σηκώνομαι, which is also the more useful -ομαι verb for a routine and is absent from the epoch. Either change titleRu to «Я просыпаюсь в семь» or (better) add `σηκώνομαι` to `words` and one line: `{ who: "Πάβελ", el: "Δεν πειράζει. Εγώ ξυπνάω στις επτά, αλλά σηκώνομαι στις επτά και τέταρτο.", ru: "Ничего страшного. Я просыпаюсь в семь, а встаю в четверть восьмого." }`.
- **nit** `l03 s1 line[5]` «…και μετά έρχομαι εδώ» — grammatical, slightly odd for «come back home» (γυρίζω is what a native says, but it is untaught). Acceptable; if touched: «και μετά κάθομαι εδώ, στον υπολογιστή».
- **nit** 13 dialogue lines against the 8–12 rule.
- Verified: table and «ερχόσαστε / καθόσαστε / κοιμόσαστε» note are correct; spot items «[κάθω]», «[έρχομαστε]» are ungrammatical; build has one order.

### l04 Πρακτική: μια μέρα

- **nit** `l04 s1 ex0–5` fine; `ex1` distractor «Она работает в кафе «Таласса»» is good (Nikos's fact). No issues of substance. 23 exercises, two genres (story + voice message), transformations with source sentences, paragraph-building translations: this is what a practice day should look like.
- Verified: all arithmetic and times consistent (Nikos finishes at 16:00 here, in l07 and l16; Pavel comes at 8:30 as in l03); Anna's message continues l01 (laptop) and sets up l05's role-play.

### l05 Μια συνηθισμένη μέρα

- **nit** `l05 s2 requirements[2]` «Глаголы на -ομαι / -άμαι: минимум три из ξυπνάω, ετοιμάζομαι…» — ξυπνάω is not an -ομαι verb. Replace with `"Глаголы распорядка: минимум три из ετοιμάζομαι, κάθομαι, έρχομαι, κοιμάμαι (и ξυπνάω)"`.
- Verified: Katya's letter matches her biography (works Tue/Thu/Fri/Sat evenings, no fish, brother and parents in Russia, lessons Mon/Wed 18:30); the speak role gives the AI concrete constraints and a forced first refusal.

### l06 Πόσο κάνει;

- **trap** `l06 s3 ex10` «Кофе стоит два евро пятьдесят.» — the most common spoken form «δύο πενήντα» (no και) is missing. Add to `accept`: `"Ο καφές κάνει δύο πενήντα.", "Ο καφές κοστίζει δύο πενήντα."`.
- **nit** `l06 s2 blocks[0]` lists εφτακόσια / οχτακόσια; l19 text uses επτακόσια. Both are standard, but `checkAnswer`'s doublet rule does not cover -κόσια (verified: `επτακόσια` ≠ `εφτακόσια`). Not typed in e2; see systemic note.
- Verified (author's flags): «Καλά, παίρνω αυτόν» is fine as a contrastive choice between two machines; «σήμερα έχει έκπτωση εκατό ευρώ» is exactly how a Cypriot salesman says it; the arithmetic 590 + 29,80 = 619,80 and the «Α, όχι, συγγνώμη» correction are the kind of imperfection the prompt asks for; the write model's «Το κινητό μου κάνει εκατό ευρώ» matches e1-l17.

### l07 Στο σούπερ μάρκετ

- **error** `l07 s2 blocks[5]` «λίγο, πολύ — с тем, что не считают, среднего рода: λίγο γάλα, πολύ νερό» — false rule. λίγος/πολύς agree with the noun: λίγη ζάχαρη, λίγο τυρί, πολλή ζέστη, πολύς κόσμος (and l08 itself says «με πολύ κόσμο», accusative of πολύς). A learner who follows the note will write «λίγο ζάχαρη». Replace:
  ```ts
  { kind: "p", text: "λίγο / πολύ перед существительным согласуются с ним: λίγο γάλα, λίγο τυρί, но λίγη ζάχαρη, πολλή ζέστη, πολύς κόσμος. Пока пользуйся ими со словами среднего рода (γάλα, νερό, λάδι, τυρί); все формы — в эпохе 4. Ответ «немного» — просто Λίγο" },
  ```
- **nit** `l07 s3 ex3` «Έχουμε έξι ___.» answer `αβγά` — the spelling αυγά is equally standard (Μπαμπινιώτης) and is what the learner sees in every Cypriot supermarket. Add `accept: ["αυγά"]`.
- Verified: «ένα κιλό ντομάτες», «μισό κιλό τυρί», «τρία ευρώ το κιλό», «Τίποτα άλλο;» all native; build has one order; both spots ungrammatical.

### l08 Μου αρέσει η θάλασσα

- **weak** `l08 s1 line[7]` «Στην Αθήνα πάω κάθε εβδομάδα.» — Eleni lives in Larnaca now, so a present-tense habit «in Athens I go every week» is wrong in meaning (a native would say πήγαινα, untaught). Replace with something true in the present:
  ```ts
  { who: "Ελένη", el: "Και εμένα! Και μου αρέσει η λαϊκή το Σάββατο. Στην Αθήνα η λαϊκή μας είναι πολύ μεγάλη!", ru: "И мне! А ещё мне нравится рынок по субботам. В Афинах наш рынок огромный!" },
  ```
- **nit** `l08 s1 line[6]` «Μου αρέσει η βόλτα εδώ το βράδυ» — understandable, slightly bookish (natives: μου αρέσει να κάνω βόλτα, untaught). Acceptable at A1.
- Verified (author's flags): «Στην Αθήνα δεν έχει ήλιο;», «στον Νίκο» (= at Nikos's place; στου Νίκου is the other native option), «το παγωτό σοκολάτα» — all natural. «Στην Ελένη αρέσει η Λάρνακα» in the grammar is grammatical and said. Spot «[Μου δεν] αρέσει» ungrammatical.

### l09 Πρακτική: ψώνια

- **trap** `l09 s1 ex14` «Килограмм помидоров стоит евро пятьдесят.» — add the spoken «ένα πενήντα»: `"Ένα κιλό ντομάτες κάνει ένα πενήντα.", "Ένα κιλό ντομάτες κοστίζει ένα πενήντα."`.
- **weak** `l09 s0 text[4]` «πάει για ψωμί νωρίς, στις επτά, επειδή την Τετάρτη το απόγευμα τα μαγαζιά είναι κλειστά» — the reason does not explain «στις επτά» (closed in the afternoon ⇒ go in the morning, not at 7). Also κλειστός / το μαγαζί are used in three texts (l09, l19, l20) and never taught, although they are day-51/53 deck words and shop hours are a staple A1 reading. Rewrite the sentence and add both as `extraWords` of this practice lesson (allowed: ≤ 5):
  ```ts
  { el: "Την Τετάρτη η Σοφία κάνει τα ψώνια το πρωί, επειδή την Τετάρτη το απόγευμα τα μαγαζιά είναι κλειστά.", ru: "В среду София ходит за покупками утром, потому что в среду после обеда магазины закрыты." },
  ```
  ```ts
  extraWords: [
    { el: "το μαγαζί", tr: "то магази́", ru: "магазин", example: { el: "Τα μαγαζιά είναι κλειστά.", ru: "Магазины закрыты." } },
    { el: "κλειστός, κλειστή, κλειστό", tr: "клисто́с", ru: "закрытый", example: { el: "Την Κυριακή η σχολή είναι κλειστή.", ru: "В воскресенье школа закрыта." } },
  ],
  ```
  (then `s1 ex4` choose option «В среду она ездит в супермаркет» still works as a distractor.)
- **nit** `l09 s1 ex5` distractor «Там рынок» is not a fact from the text; use «Там дёшево» and «Там много народу» (both in the text about other things).
- Verified: 9,20 € and 40,80 € arithmetic; halloumi 9 €/kg matches l10's role; Sofia's mother in Limassol is consistent with «The people».

### l10 Στη λαϊκή

- **nit** `l10 s1 ex6` «Ты любишь рыбу?» — `Σου αρέσουν τα ψάρια;` is equally natural; add to `accept`.
- Verified: the essay sets up the Saturday dinner that l15, l16 and l18 continue — good arc. Role-play has prices, a missing item and a change problem.

### l11 Ένα ωραίο σπίτι

- **nit** `l11 s1 line[0]` «Έλα, Πάβελ! Αυτό είναι το διαμέρισμά μας» — Eleni has been Pavel's next-door neighbour since e1-l12, so a first visit now is a stretch but not a contradiction.
- **weak** `l11` nowhere teaches «ο μήνας / τον μήνα», yet «650 € τον μήνα» appears in l14 (×3), l15, l19, l20. Add `"ο μήνας"` to `words` here and one line to the dialogue (it fits the flat talk):
  ```ts
  { who: "Κάτια", el: "Και δεν είναι ακριβό: εξακόσια ευρώ τον μήνα.", ru: "И недорого: шестьсот евро в месяц." },
  ```
- Verified: table (τον μεγάλο καναπέ / τη μεγάλη κουζίνα / στο μεγάλο σαλόνι), «Τι ωραίο σαλόνι!», «έναν καινούριο καναπέ, έναν μεγάλο» all native; «Μόνο το πρωί, στις έξι, έχει φασαρία: τα παιδιά!» ties back to l03 — nice.

### l12 Οι καινούριοι γείτονες

- **error (continuity bookkeeping)** Κώστας and Ρένα are new lasting characters (a couple, two daughters, from Nicosia / Thessaloniki, neighbours of Pavel and Sofia). The prompt requires adding them to «The people» and to `NAMES` in the validator in the same change; neither was done (Ρένα is missing from `NAMES`). See «Changes to LESSON_PROMPT.md».
- **nit** `l12 s3 ex8` accept «Είναι μικρή και ξανθιά» for «невысокая» — μικρή means small/young, not short; drop it so the learner is not taught a wrong equivalence.
- Verified (author's flag): «Πώς είναι;» for looks and character is exactly what Sofia would ask. Table and the -ος/-α rule («гласная перед -ος → -α; ξανθιά») are correct; «τους ανθρώπους» stress shift shown; «Τα παιδιά είναι [ήσυχοι]» ungrammatical.

### l13 Πού είναι το κλειδί;

- **trap** `l13 s3 ex7` «Я ищу ключ.» — `Ψάχνω για το κλειδί` is as standard as `Ψάχνω το κλειδί`. Add `"Ψάχνω για το κλειδί.", "Ψάχνω για το κλειδί μου."` to `accept`.
- **nit** `l13 s0 text[7]` «Στη Ρωσία έχω το κινητό μου: 99 45 28 36.» — meaning is «I'll have my (Cypriot) mobile with me»; the Greek says «in Russia I have my phone». Better: `"Το κινητό μου είναι μαζί μου: 99 45 28 36."`, ru «Мобильный со мной: 99 45 28 36».
- **nit** `το λουλούδι` is a day-207 (A2-topic) word chosen for an A1 lesson; it is the right word for the note, so acceptable, but note the prompt's day-number rule.
- Verified (author's flags): «Θέλουν λίγο νερό κάθε δύο μέρες» and «για εσένα» are natural; both spots are ungrammatical; the 8-digit phone dictation with «οχτώ» is handled by the doublet rule.

### l14 Πρακτική: το σπίτι μου

- **error** `l14 s0 text[4]` «Ήσυχο, με καινούριο κρεβάτι, καναπέ και τραπέζι.» contradicts `s2 line[6]` «Ο καναπές ναι. Το κρεβάτι είναι παλιό, αλλά καλό.» for the same flat (centre, next to Φοινικούδες, 650 €). Both question sets test this detail (`s1 ex4` «Новая кровать, диван и стол», `s3 ex2` «Кровать»). Fix the ad and its question:
  ```ts
  { el: "Ήσυχο, με καινούριο καναπέ και τραπέζι. Η θάλασσα είναι πέντε λεπτά από εδώ.", ru: "Тихая, с новым диваном и столом. До моря пять минут." },
  ```
  ```ts
  { kind: "choose", question: "Что есть в первой квартире?", options: ["Новый диван и стол", "Две ванные", "Лифт"], answer: "Новый диван и стол" },
  ```
  (Alternatively keep the ad and make Pavel notice: «Παλιό; Η αγγελία λέει καινούριο!» — but αγγελία is untaught.)
- **trap** `l14 s1 ex15` «В старой квартире нет балкона.» — the Russian starts with «в квартире», and l13 just taught impersonal έχει for «есть/нет»: `Στο παλιό διαμέρισμα δεν έχει μπαλκόνι` is what a good learner writes. Add it to `accept`.
- **nit** `l14 s1 ex3` distractor «В любое время» is not from the text; use «Только утром» and «После шести».
- **nit** four untaught words in the ad text (όροφος, ασανσέρ, μήνα, φοιτητές) against the «at most 3» rule; with ο μήνας taught in l11 (above) it is three.
- Verified (author's flags): «Μακένζι» is the Greek-Cypriot press spelling; «1ος όροφος» is exactly how ads write it; «Μπορούμε σήμερα το απόγευμα;», «Μάλιστα», «Το όνομά σας;» all native.

### l15 Ψάχνω διαμέρισμα

- **error** `l15 s0 text[7]` «Δίπλα μένει ο Πάβελ, από τη Ρωσία: μαθαίνει ελληνικά μαζί μου!» — «μαθαίνει μαζί μου» means «learns together with me», i.e. Eleni is a fellow learner, which «The people» forbids; the Russian («учит греческий у меня») is a translation of the intended meaning, not of the Greek. Replace:
  ```ts
  { el: "Οι γείτονες είναι πολύ φιλικοί. Δίπλα μένει ο Πάβελ, από τη Ρωσία: κάνει μάθημα μαζί μου!", ru: "Соседи очень приветливые. Рядом живёт Павел из России: он ходит ко мне на уроки!" },
  ```
- **weak** `l15 s3 speak scenario` — in the same lesson Pavel describes his own flat (essay) and views another one (speak) with no reason given; «The people» says he lives in a flat in the centre. One clause fixes it: `"Твоя квартира дорогая, и ты смотришь другую в центре Ларнаки: …"`.
- Verified (author's flags): «αδερφούλα» and «πληρώνουμε μισά μισά» are natural; Eleni has a sister per «The people»; the flat (two bedrooms, Katya in the small room, old sofa) matches l11.

### l16 Τι θα κάνεις αύριο;

- **error** `l16 s2 blocks[2]` «У είμαι, έχω, ξέρω, μπορώ будущее только такое: θα είμαι, θα έχω, θα μπορώ» — μπορώ has θα μπορέσω, and that is the usual future («Θα μπορέσεις αύριο;»). Replace:
  ```ts
  { kind: "p", text: "У είμαι, έχω, ξέρω будущее только такое: θα είμαι, θα έχω, θα ξέρω. Θα κάνω — «сделаю» и «буду делать», θα πάω — «пойду, поеду»" },
  ```
- **weak** `l16 s1 line[3]` «Το πρωί θα καθαρίζω και το απόγευμα θα μαγειρεύω.» — for one Saturday a native says θα καθαρίσω / θα μαγειρέψω; the imperfective is natural only with explicit duration. Keep the grammar point but make the context carry it (and use the new word μέχρι twice):
  ```ts
  { who: "Πάβελ", el: "Το Σάββατο θα είμαι όλη μέρα στο σπίτι. Το πρωί θα καθαρίζω μέχρι τις δώδεκα και μετά θα μαγειρεύω μέχρι το βράδυ.", ru: "В субботу буду весь день дома. Утром до двенадцати буду убираться, а потом до вечера — готовить." },
  ```
  The same applies, more mildly, to `s4 model[0–1]` and `s3 ex8`; the Russian imperfectives («буду убираться») justify those, leave them.
- **On the author's question (θα + present first):** sound as a first step *if* every example is a state (θα είμαι, θα έχω), a duration (όλη μέρα, μέχρι τις τέσσερις) or a habit (κάθε πρωί, από τη Δευτέρα), which the lesson already states in `blocks[4]`. «Θα τρώμε και θα πίνουμε όλη μέρα», «θα πηγαίνω στο γυμναστήριο κάθε πρωί», «θα δουλεύω μέχρι τις τέσσερις», «θα δουλεύει στην ταβέρνα» are all natural. The risk is the AI reviewer «correcting» θα καθαρίζω to θα καθαρίσω in essays; `aiPrompts.ts` is out of scope here, but the e2 review prompt should be told that only the continuous future is taught.
- **trap** `l16 s3 ex13` build `Θα δουλεύω όλη μέρα.` — «Όλη μέρα θα δουλεύω» is an equally natural order (the tiles lowercase the first word, so it can be assembled). Replace with a sentence whose order is fixed:
  ```ts
  { kind: "build", ru: "Марии не будет с нами.", answer: "Η Μαρία δεν θα είναι μαζί μας.", extra: ["είμαι", "τη"] },
  ```
- **weak** `l16 s3 ex4` accepts «θα πάω στο γυμναστήριο κάθε πρωί» — perfective with a habitual adverbial is wrong, and the hint says «регулярно». Drop `accept: ["πάω"]`.
- **nit** `extraWords` «η Λευκωσία» — already in `NAMES`, used in e1-l10 and e2-l12; harmless.

### l17 Πάμε για καφέ;

- **weak** `l17 s1 line[9]` «Στις έντεκα. Η Ελένη ίσως έρχεται κι αυτή.» — ίσως + present indicative for a future event is not what a native says (ίσως έρθει / ίσως να έρθει, both untaught). The natural taught-grammar version is elliptical:
  ```ts
  { who: "Κάτια", el: "Στις έντεκα. Ίσως και η Ελένη.", ru: "В одиннадцать. Может, и Элени." },
  ```
- Verified: the Wednesday timeline (tomorrow Thu and Friday are Katya's work days) matches l05; «Έχει μια καινούρια ταινία» is acceptable (παίζει is the idiom, untaught); build has one order; both spots ungrammatical.

### l18 Έλα στο σπίτι μου!

- **weak** `l18 s1 line[3]` «Κι εγώ φέρνω ένα γλυκό. Είναι από την Αθήνα!» and `line[4]` «Κι εγώ φέρνω ένα μπουκάλι κρασί» — at the door, handing it over, a native says έφερα (aorist, untaught). The present works only as a performative with the dative («σου φέρνω»), which also matches the Russian better:
  ```ts
  { who: "Ελένη", el: "Κι εγώ σου φέρνω ένα γλυκό από την Αθήνα!", ru: "А я тебе принесла сладкое из Афин!" },
  { who: "Νίκος", el: "Κι εγώ σου φέρνω ένα μπουκάλι κρασί από τη Λευκωσία.", ru: "А я тебе — бутылку вина из Никосии." },
  ```
  and `s3 ex5` gap, whose prompt «принесла» with hint «(настоящее)» is a contortion, should move to a planning context where the present is the right tense:
  ```ts
  { kind: "gap", prompt: "Τι φέρνουμε το Σάββατο; — Εγώ ___ ένα γλυκό. — приношу / принесу", answer: "φέρνω", hint: "приносить: я" },
  ```
- **trap** `l18 s3 ex13` build `Πάρε μια καρέκλα, σε παρακαλώ.` — «Σε παρακαλώ, πάρε μια καρέκλα» is just as natural. Replace:
  ```ts
  { kind: "build", ru: "Возьми бокалы с кухни.", answer: "Πάρε τα ποτήρια από την κουζίνα.", extra: ["πάρτε", "τους"] },
  ```
- Verified (author's flag): «Καλώς σε βρήκαμε!» is the correct reply (σε because one host); «Καλώς ήρθατε! Ελάτε, ελάτε!», «κάθισε εδώ, στον καναπέ», «πάρτε σαλάτα και ψωμί, παιδιά», «στην υγειά μας» all native; «[Καθίσε]» is a real stress error; the dinner guests match l16.

### l19 Πρακτική: εποχή 2

- **error + trap** `l19 s1 ex15` «Вечером мы будем гулять по пляжу.» answer `Το βράδυ θα κάνουμε βόλτα στην παραλία.` — «κάνω βόλτα» is never taught (grep of e1+e2: only «πάω για βόλτα», l17 build and this lesson's own text «πηγαίνετε για βόλτα»). The taught rendering is rejected (verified). Make it the answer and keep the native alternative:
  ```ts
  {
    kind: "translate",
    ru: "Вечером мы будем гулять по пляжу.",
    answer: "Το βράδυ θα πάμε για βόλτα στην παραλία.",
    accept: ["Θα πάμε για βόλτα στην παραλία το βράδυ.", "Το βράδυ θα κάνουμε βόλτα στην παραλία.", "Θα κάνουμε βόλτα στην παραλία το βράδυ.", "Το βράδυ θα πηγαίνουμε για βόλτα στην παραλία."],
  },
  ```
- **weak** `l19 s2 line[2]` «Έλα στη Λεμεσό το βράδυ! Θα μαγειρεύω για φίλους.» — same aspect issue as l16 (θα μαγειρέψω). Taught alternative that is fully natural: `"Έλα στη Λεμεσό το βράδυ! Θα έχω φίλους για φαγητό."`, ru «Приезжай вечером в Лимасол! У меня будут друзья на ужин».
- **nit** `l19 s1 ex5` distractor «Очень занятые» is not from the text; use «Очень тихие» and «Очень дорогие» (both said of other things in the text).
- Verified: the article is a genuine guide genre with real places and prices consistent with l09/l14; Anna's call matches l17 (Sunday morning at the sea with Katya) and Katya's no-fish fact; 24 exercises.

### l20 Τεστ A1.2

- **weak** `l20 s4 ex13` «Το μεσημέρι θα ___ σε μια ταβέρνα. — мы будем есть» answer `τρώμε` — «θα τρώμε σε μια ταβέρνα» for one lunch is the l16 problem again, now in the test. Change the slot to a state:
  ```ts
  { kind: "gap", prompt: "Το μεσημέρι θα ___ σε μια ταβέρνα. — мы будем", answer: "είμαστε", hint: "быть: мы" },
  ```
- **nit** `l20 s0 text[2–3]` «A1», «A2» in Latin letters inside Greek text (the validator let it through). Harmless for reading; for TTS consider «Α1» with Greek alpha.
- Verified (author's flag): «Θα δουλεύεις όλη μέρα σήμερα;» is natural (duration). Coverage of language use against core lessons: l01 (ex0, ex11), l02 (ex1), l03 (ex2), l06 (ex3), l07 (ex4, ex12), l08 (ex5), l11 (ex6), l12 (ex7), l13 (ex8), l16 (ex13), l17 (ex10), l18 (ex9) — all 12 core lessons; ex10–13 form the connected mini-cloze. Reading is a notice (not another letter), 6 + 6 choose, two essays with epoch grammar, speaking with a complication. Prices (2,50 € coffee with milk) match e1-l20's menu; Giorgos's airport job, wife and two children match «The people».

## Systemic observations

1. **1st-person -ώ is not a recognised doublet.** `checkAnswer` canonicalises μιλά/μιλάει, μιλούμε/μιλάμε, μιλούν/μιλάνε but not ξυπνώ/ξυπνάω, so every translate whose answer starts with a 1st-sg -άω verb silently rejects the contracted form (verified: `Ξυπνώ νωρίς.` → wrong). Fix in `canonB`: `if (end === a("ώ")) return stem + a("άω");` — then the prompt's doublet list should mention it. Until then, add `accept` entries lesson by lesson (l03 ex7 in this epoch).
2. **-κόσια doublets.** επτακόσια/εφτακόσια, οκτακόσια/οχτακόσια, εννιακόσια/εννεακόσια are not covered by `DOUBLETS` (the regex only allows a `δεκα` prefix). Not typed in e2, but l06 teaches one spelling and l19 uses the other; extend the regex before e3 prices.
3. **Final ν before δ, λ, μ, ν, ρ, σ, ζ, θ, φ, χ, β, γ.** Every answer in e2 writes τη Δευτέρα / στη Λεμεσό / τη μεγάλη, and «την Δευτέρα» is rejected. That is the school rule, and l02 makes it a teaching point, so it is defensible; but keeping ν is tolerated by most modern grammars and never penalised at A1/A2. Decide once: either accept «την / στην» before those consonants in `accept` everywhere except l02's ν-gaps, or state explicitly in LESSON_PROMPT that the course grades it as a mistake.
4. **Imperfective future in one-off contexts.** Five places (l16 line[3], l16 model, l19 Anna's call, l20 ex13, l16 ex8) use θα + present where a native uses the perfective. The grammar note is honest about it; the texts should not model it. Rule for authors: θα + present only with a state verb, a duration phrase (όλη μέρα, μέχρι…) or a frequency phrase (κάθε…, από τη Δευτέρα).
5. **Taught vocabulary vs. used vocabulary.** Words used in 3+ texts without ever being taught: ο μήνας (τον μήνα, 6×), κλειστός/τα μαγαζιά (3 texts), το σχολείο (e1-l15, e2-l04), η τράπεζα (since e1-l06). The validator cannot see this because it only checks typed answers. Suggested homes: ο μήνας → l11, κλειστός + μαγαζί → l09 extraWords (above), σχολείο and τράπεζα → e3-l03 (directions).
6. **Russian is consistently natural** — translations, not glosses («Беру этот», «Привет-привет!», «Жаль, но ничего», «Мои дети тихими не бывают никогда»). Hints never leak answers. Comprehension questions are answerable only from the text; the few weak distractors are listed above (l09 ex5, l14 ex3, l19 ex5, l10 ex3 «В воскресенье»).
7. **Genres**: phone call, form, stairwell talk, story + voice message, letter, shop counter, WhatsApp, promenade talk, story + counter, message, house visit, balcony talk, note, ads + phone, letter, café talk, chat, hosting, article + phone, notice + café. Eleven genres, no self-presentation text, no two identical genres in a row except l11→l12 (two face-to-face conversations). Closings rotate (Ωραία!/Εντάξει!/Τα λέμε! at line end: 2 occurrences in 20 lessons).
8. **Continuity is the epoch's strength**: Pavel 9–18 at the computer, coffee at 8:30 at Nikos's, lessons Mon/Wed 18:30, club Thu 19:00, Nikos 6:00–16:00 and Sundays off, Maria evenings, Katya Tue/Thu/Fri/Sat 19–24, the Saturday dinner thread (l10 → l15 → l16 → l18), the laptop thread (l01 → l04 → l05). These are now facts and must go into «The people» so epoch 3 does not contradict them.
9. **Practice/test weight**: l04 23, l09 25, l14 24, l19 24 exercises; readings all ≥ 120 words; each practice has two genres with their own comprehension; the test's language part has 14 items. Core practices have 16–17 items with the required 2 listen / 1 build / 2 spot. Build items have one order except the two listed (l16, l18). Spot items are ungrammatical in every reading except l01 ex14 (price reading).

## Changes to LESSON_PROMPT.md

1. **«The people» — add the new facts this epoch established** (the prompt itself requires it in the same change):
   - Πάβελ: works 9:00–18:00; coffee at «Θάλασσα» at 8:30 almost every morning; Greek lessons Monday and Wednesday 18:30–20:00, conversation club Thursday 19:00 at «Θάλασσα» (run by Ελένη); bought a new laptop (590 €) in e2-l06; shopping once a week, Friday evening; flat: living room with an old sofa, big table, two chairs, small balcony.
   - Νίκος: wakes at 6, works 7:45–16:00, Sunday off; Μαρία works evenings (17:00–24:00), sleeps in the morning; daughter at school 7:45–14:00.
   - Ελένη and Κάτια: two-bedroom flat next to Pavel, Katya in the small room, rent 600 € split; Katya works Tue/Thu/Fri/Sat 19:00–24:00, sleeps until 10.
   - Άννα: finishes 16:30, lunch break 13:00–14:00; was at Pavel's for dinner in e2-l18.
   - **Κώστας and Ρένα** — new neighbours (e2-l12): young couple, two small daughters; Κώστας from Nicosia, tall, dark; Ρένα from Thessaloniki, short, blonde. Add Ρένα (and Θεσσαλονίκη, Μακένζι, Αγία Νάπα) to `NAMES` in `scripts/validate-program.mjs`.
2. **Doublets paragraph**: once `canonB` is extended, list «1st person -ώ / -άω (ξυπνώ / ξυπνάω)» and «-κόσια (εφτακόσια / επτακόσια)» among the automatic variants; until then, instruct authors to list them in `accept`.
3. **Final ν rule**: say explicitly what happens to «την Δευτέρα / στην Λεμεσό»: either «accept (not a mistake, but `answer` writes τη)» or «reject (the course teaches the school rule)». Today the policy text only covers the opposite case.
4. **Future tense rule for A1 epochs**: add under «Language rules»: «θα + present appears only with a state verb (είμαι, έχω, ξέρω, μένω), a duration (όλη μέρα, μέχρι τις…) or a frequency (κάθε…, από τη Δευτέρα). Never model it for a single completed action (θα καθαρίζω το Σάββατο); use θα είμαι / θα έχω / θα πάω / θα κάνω instead until epoch 6». Also tell the AI-review prompt for A1 essays that only the continuous future has been taught.
5. **Spot rule**: add the price-reading case as an example: «Είναι [τρία] και δέκα» is a grammatical price; anchor clock items with «Τι ώρα είναι;».
6. **Build rule**: add «no sentence-initial adverbial that can move (όλη μέρα, σε παρακαλώ, το βράδυ)» to the list of things that make a build ambiguous.
7. **Vocabulary discipline**: add a line that words appearing in three or more texts must be taught (the validator only checks typed answers), and name the current debt: ο μήνας, κλειστός, το μαγαζί, το σχολείο, η τράπεζα.
8. **Minor**: in «core» step 3, note that «Типичная ошибка» must be a real learner error, not a false rule (l07's λίγο/πολύ note and l16's μπορώ note are what happens otherwise); require the author to verify every «only this form exists» claim against the deck or a dictionary.
