// Answer-checker tests: `npm run test:answers`. Each case: what the learner typed, the accepted answers,
// the expected verdict. Add a case whenever checkAnswer learns a new variant or a review finds a trap.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { createServer } = await import(resolve(root, "node_modules/vite/dist/node/index.js"));
const server = await createServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const { checkAnswer } = await server.ssrLoadModule("/src/lib/greek.ts");
await server.close();

const cases = [
  ["Ξυπνώ νωρίς.", ["Ξυπνάω νωρίς."], "correct"],
  ["Ξυπνω νωρις.", ["Ξυπνάω νωρίς."], "accent"],
  ["Έχουμε έξι αυγά", ["Έχουμε έξι αβγά"], "correct"],
  ["Κάνει εφτακόσια ευρώ", ["Κάνει επτακόσια ευρώ"], "correct"],
  ["Έρχομαι την Δευτέρα", ["Έρχομαι τη Δευτέρα"], "correct"],
  ["Μένω στην Λεμεσό", ["Μένω στη Λεμεσό"], "correct"],
  ["Δεν βλέπω", ["Δε βλέπω"], "correct"],
  ["Δε βλέπω", ["Δεν βλέπω"], "correct"],
  ["Δε καταλαβαίνω", ["Δεν καταλαβαίνω"], "wrong"],
  ["Είμαι από τη Κύπρο", ["Είμαι από την Κύπρο"], "wrong"],
  ["Δε μπορώ", ["Δεν μπορώ"], "wrong"],
  ["Μένω στη Μόσχα", ["Μένω στην Μόσχα"], "correct"],
  ["Θέλω μια σαλάτα.", ["Θέλω μία σαλάτα."], "correct"],
  ["Θέλω μία σαλάτα.", ["Θέλω μια σαλάτα."], "correct"],
  ["Θελω μια σαλατα.", ["Θέλω μία σαλάτα."], "accent"],
  ["Η μιαμία", ["Η μιαμία"], "correct"],
  ["Μιλάς ρωσικά εσύ;", ["Μιλάς ρωσικά;"], "correct"],
  // [input, answers, expected]
  ["Εγώ δεν καταλαβαίνω.", ["Δεν καταλαβαίνω."], "correct"],
  ["Δεν καταλαβαίνω εγώ", ["Δεν καταλαβαίνω."], "correct"],
  ["Εσύ πού δουλεύεις;", ["Πού δουλεύεις;"], "correct"],
  ["Πού δουλεύεις εσύ;", ["Πού δουλεύεις;"], "correct"],
  ["Από πού είσαι εσύ;", ["Από πού είσαι;"], "correct"],
  ["Μένω στη Λάρνακα", ["Εγώ μένω στη Λάρνακα."], "correct"],
  ["Εμείς μένουμε σε διαμέρισμα", ["Μένουμε σε διαμέρισμα."], "correct"],
  ["Εσύ μένω στη Λάρνακα", ["Μένω στη Λάρνακα."], "wrong"],
  ["Εγώ μένει στη Λάρνακα", ["Μένει στη Λάρνακα."], "wrong"],
  ["Η Άννα μιλά αγγλικά", ["Η Άννα μιλάει αγγλικά."], "correct"],
  ["μιλά", ["μιλάει"], "correct"],
  ["μιλουμε", ["μιλάμε"], "accent"],
  ["Μιλούμε ελληνικά", ["Μιλάμε ελληνικά."], "correct"],
  ["Αυτοί αγαπούν την Κύπρο", ["Αυτοί αγαπάνε την Κύπρο."], "correct"],
  ["μένουνε", ["μένουν"], "correct"],
  ["Έχω ένα καινούργιο κινητό", ["Έχω ένα καινούριο κινητό."], "correct"],
  ["εφτά", ["επτά"], "correct"],
  ["δεκαοχτώ", ["δεκαοκτώ"], "correct"],
  ["Εγώ είμαι σαράντα χρονών", ["Είμαι σαράντα χρονών."], "correct"],
  ["Εσύ πόσων χρονών είσαι;", ["Πόσων χρονών είσαι;"], "correct"],
  ["Θελω να μιλαω", ["Θέλω να μιλάω."], "accent"],
  ["Δε καταλαβαίνω", ["Δεν καταλαβαίνω."], "wrong"],
  ["τους άνθρωπους", ["τους ανθρώπους"], "accent"],
  ["Το παιδιά", ["Τα παιδιά"], "wrong"],
  ["Εσύ τι θέλεις να κάνεις σήμερα;", ["Τι θέλεις να κάνεις σήμερα;"], "correct"],
  ["Εγώ θέλω να πάω στη θάλασσα", ["Θέλω να πάω στη θάλασσα."], "correct"],
];

let fail = 0;
for (const [input, answers, want] of cases) {
  const got = checkAnswer(input, answers);
  if (got !== want) {
    fail++;
    console.log("FAIL", input.padEnd(36), "→", got, `(want ${want})`);
  }
}
console.log(fail ? `${fail} of ${cases.length} failed` : `all ${cases.length} passed`);
process.exit(fail ? 1 : 0);
