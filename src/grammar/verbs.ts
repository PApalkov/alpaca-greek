/** Present tense (ενεστώτας) of the verbs from the homework and the first weeks of cards. */
export const PERSONS = ["εγώ", "εσύ", "αυτός", "εμείς", "εσείς", "αυτοί"] as const;
export const PERSON_RU = ["я", "ты", "он / она", "мы", "вы", "они"] as const;

export type VerbGroup = "A" | "B" | "irr";

export interface Verb {
  key: string;
  ru: string;
  group: VerbGroup;
  /** Six present forms in PERSONS order. */
  forms: string[];
  /** Also accepted when typing, per person (e.g. 3pl -ουνε). */
  alt?: Partial<Record<number, string[]>>;
}

const A_ENDINGS = ["ω", "εις", "ει", "ουμε", "ετε", "ουν"];
const B_ENDINGS = ["άω", "άς", "άει", "άμε", "άτε", "άνε"];

/** Group A (-ω, stress on the stem): γράφω → γράφεις … γράφουν. */
function a(key: string, ru: string): Verb {
  const stem = key.slice(0, -1);
  return { key, ru, group: "A", forms: A_ENDINGS.map((e) => stem + e), alt: { 5: [stem + "ουνε"] } };
}

/** Group B (-άω, stress on the ending): μιλάω → μιλάς … μιλάνε. */
function b(key: string, ru: string): Verb {
  const stem = key.slice(0, -2);
  return {
    key,
    ru,
    group: "B",
    forms: B_ENDINGS.map((e) => stem + e),
    alt: { 0: [stem + "ώ"], 3: [stem + "ούμε"], 5: [stem + "ούν", stem + "ούνε"] },
  };
}

const irr = (key: string, ru: string, forms: string, alt?: Verb["alt"]): Verb => ({ key, ru, group: "irr", forms: forms.split(" "), alt });

export const VERBS: Verb[] = [
  a("έχω", "иметь"),
  a("θέλω", "хотеть"),
  a("βλέπω", "видеть"),
  a("ξέρω", "знать"),
  a("μένω", "жить (где-то)"),
  a("πίνω", "пить"),
  a("δίνω", "давать"),
  a("κάνω", "делать"),
  a("γράφω", "писать"),
  a("ψάχνω", "искать"),
  a("παίρνω", "брать"),
  a("ανοίγω", "открывать"),
  a("περιμένω", "ждать"),
  a("πληρώνω", "платить"),
  a("αγοράζω", "покупать"),
  a("διαβάζω", "читать"),
  a("δουλεύω", "работать"),
  a("μαθαίνω", "учить"),
  a("πηγαίνω", "идти, ехать"),
  a("καταλαβαίνω", "понимать"),
  b("μιλάω", "говорить"),
  b("αγαπάω", "любить"),
  b("ρωτάω", "спрашивать"),
  b("απαντάω", "отвечать"),
  b("ξυπνάω", "просыпаться"),
  irr("είμαι", "быть", "είμαι είσαι είναι είμαστε είστε είναι", { 4: ["είσαστε"] }),
  irr("έρχομαι", "приходить", "έρχομαι έρχεσαι έρχεται ερχόμαστε έρχεστε έρχονται"),
  irr("πάω", "идти, ехать", "πάω πας πάει πάμε πάτε πάνε", { 5: ["πάν"] }),
  irr("τρώω", "есть (кушать)", "τρώω τρως τρώει τρώμε τρώτε τρώνε", { 5: ["τρων"] }),
  irr("λέω", "говорить, сказать", "λέω λες λέει λέμε λέτε λένε", { 5: ["λεν"] }),
  irr("ακούω", "слушать, слышать", "ακούω ακούς ακούει ακούμε ακούτε ακούνε", { 5: ["ακούν"] }),
];

export const VERB_RULES = {
  A: "Группа A (-ω, ударение на основе): -ω, -εις, -ει, -ουμε, -ετε, -ουν(ε)",
  B: "Группа B (-άω, ударение на окончании): -άω, -άς, -άει, -άμε, -άτε, -άνε",
  irr: "Неправильный глагол: формы нужно запомнить",
} as const;
