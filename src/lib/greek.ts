/** Greek text helpers: answer checking and typing Greek on a Latin keyboard. */
import { words } from "../data/words";

const stripMarks = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");

/** Lowercase, single spaces, no end punctuation, final sigma fixed. */
export function normalizeAnswer(s: string): string {
  return s
    .normalize("NFC")
    .toLocaleLowerCase("el")
    .replace(/[.,;!?·…"«»]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/σ(?=\s|$)/g, "ς");
}

export type Verdict = "correct" | "accent" | "wrong";

/**
 * Strict: stress is part of the answer. "accent" means only the stress marks differ.
 * Variants every answer gets for free (so lesson authors do not have to list them):
 * an optional subject pronoun for 1st/2nd person verbs (Εγώ δεν καταλαβαίνω, Πού δουλεύεις εσύ;)
 * and standard doublets (μία/μια, μιλά/μιλάει, μιλούμε/μιλάμε, -ουνε/-ουν, καινούργιος, εφτά, οχτώ, εννιά).
 */
export function checkAnswer(input: string, answers: string[]): Verdict {
  const got = normalizeAnswer(input);
  const all = answers.flatMap((a) => withPronounVariants(normalizeAnswer(a)));
  if (all.some((a) => canon(a) === canon(got))) return "correct";
  if (all.some((a) => canonPlain(stripMarks(a)) === canonPlain(stripMarks(got)))) return "accent";
  return "wrong";
}

// ---------- verb person, from the deck's verbs (dictionary form: 1st person singular) ----------

type Person = "εγώ" | "εσύ" | "εμείς" | "εσείς";

const IRREGULAR: Record<string, Record<Person, string[]>> = {
  είμαι: { εγώ: ["είμαι"], εσύ: ["είσαι"], εμείς: ["είμαστε"], εσείς: ["είστε", "είσαστε"] },
  πάω: { εγώ: ["πάω"], εσύ: ["πας"], εμείς: ["πάμε"], εσείς: ["πάτε"] },
  τρώω: { εγώ: ["τρώω"], εσύ: ["τρως"], εμείς: ["τρώμε"], εσείς: ["τρώτε"] },
  λέω: { εγώ: ["λέω"], εσύ: ["λες"], εμείς: ["λέμε"], εσείς: ["λέτε"] },
  ακούω: { εγώ: ["ακούω"], εσύ: ["ακούς"], εμείς: ["ακούμε"], εσείς: ["ακούτε"] },
  ζω: { εγώ: ["ζω"], εσύ: ["ζεις"], εμείς: ["ζούμε"], εσείς: ["ζείτε"] },
};

let personOf: Map<string, Person> | null = null;
/** Plain (unaccented) verb form → person, for 1st/2nd person present forms of the deck's verbs. */
function verbPersons(): Map<string, Person> {
  if (personOf) return personOf;
  personOf = new Map();
  const add = (form: string, p: Person) => personOf!.set(stripMarks(form), p);
  const lemmas = words
    .flatMap((w) => w.el.split(" / "))
    .map((x) => x.trim())
    .filter((x) => /^[^\s,()]+(ω|ώ|μαι)$/.test(x) && !["εγώ", "εδώ"].includes(x));
  for (const lemma of lemmas) {
    const l = stripMarks(lemma);
    const irr = IRREGULAR[lemma];
    if (irr) {
      for (const [p, forms] of Object.entries(irr) as [Person, string[]][]) forms.forEach((f) => add(f, p));
    } else if (l.endsWith("αμαι")) {
      const st = l.slice(0, -4);
      [["αμαι", "εγώ"], ["ασαι", "εσύ"], ["ομαστε", "εμείς"], ["αστε", "εσείς"]].forEach(([e, p]) => add(st + e, p as Person));
    } else if (l.endsWith("ομαι")) {
      const st = l.slice(0, -4);
      [["ομαι", "εγώ"], ["εσαι", "εσύ"], ["ομαστε", "εμείς"], ["εστε", "εσείς"]].forEach(([e, p]) => add(st + e, p as Person));
    } else if (l.endsWith("αω")) {
      const st = l.slice(0, -2);
      [["αω", "εγώ"], ["ω", "εγώ"], ["ας", "εσύ"], ["αμε", "εμείς"], ["ουμε", "εμείς"], ["ατε", "εσείς"]].forEach(([e, p]) => add(st + e, p as Person));
    } else if (lemma.endsWith("ώ")) {
      const st = l.slice(0, -1);
      [["ω", "εγώ"], ["εις", "εσύ"], ["ουμε", "εμείς"], ["ειτε", "εσείς"]].forEach(([e, p]) => add(st + e, p as Person));
    } else if (l.endsWith("ω")) {
      const st = l.slice(0, -1);
      [["ω", "εγώ"], ["εις", "εσύ"], ["ουμε", "εμείς"], ["ετε", "εσείς"]].forEach(([e, p]) => add(st + e, p as Person));
    }
  }
  return personOf;
}

const PRONOUNS = ["εγώ", "εσύ", "εμείς", "εσείς", "αυτός", "αυτή", "αυτό", "αυτοί", "αυτές", "αυτά"];

/**
 * A sentence whose first verb is in the 1st/2nd person may also have the subject pronoun, at the
 * start, right after the verb or at the end; a sentence that starts with that pronoun may also drop it.
 */
function withPronounVariants(answer: string): string[] {
  const tokens = answer.split(" ");
  const plainTokens = tokens.map(stripMarks);
  const persons = verbPersons();
  const out = [answer];
  if (PRONOUNS.includes(tokens[0]) && tokens.length > 1) {
    const verb = plainTokens.slice(1).map((t) => persons.get(t)).find(Boolean);
    if (verb === tokens[0]) out.push(tokens.slice(1).join(" "));
    return out;
  }
  if (tokens.some((t) => PRONOUNS.includes(t))) return out;
  const i = plainTokens.findIndex((t) => persons.has(t));
  if (i < 0) return out;
  const p = persons.get(plainTokens[i])!;
  out.push(`${p} ${answer}`);
  out.push([...tokens.slice(0, i + 1), p, ...tokens.slice(i + 1)].join(" "));
  out.push(`${answer} ${p}`);
  return out;
}

// ---------- doublets: both spellings are standard ----------

const DOUBLETS: [RegExp, string][] = [
  [/(^| )μια(?= |$)/g, "$1μία"],
  [/καινούργι/g, "καινούρι"],
  [/(^| )(δεκα)?εφτά(?= |$)/g, "$1$2επτά"],
  [/(^| )(δεκα)?οχτώ(?= |$)/g, "$1$2οκτώ"],
  [/(^| )(δεκα)?εννιά(?= |$)/g, "$1$2εννέα"],
  [/ούνε(?= |$)/g, "ούν"],
  [/ουνε(?= |$)/g, "ουν"],
];

let bStems: string[] | null = null;
/** Stems of -άω verbs (μιλ, αγαπ…): their 3rd person forms have two standard spellings. */
function verbStemsB(): string[] {
  bStems ??= words
    .flatMap((w) => w.el.split(" / "))
    .map((x) => x.trim())
    .filter((x) => /^[^\s,()]+άω$/.test(x))
    .map((x) => x.slice(0, -2));
  return bStems;
}

function canonB(token: string, plain: boolean): string {
  for (const stem0 of verbStemsB()) {
    const stem = plain ? stripMarks(stem0) : stem0;
    if (!token.startsWith(stem)) continue;
    const end = token.slice(stem.length);
    const a = (x: string) => (plain ? stripMarks(x) : x);
    if (end === a("ά")) return stem + a("άει");
    if (end === a("ούμε")) return stem + a("άμε");
    if ([a("ούν"), a("ούνε"), a("άν")].includes(end)) return stem + a("άνε");
  }
  return token;
}

const canon = (s: string) => DOUBLETS.reduce((x, [re, to]) => x.replace(re, to), s).split(" ").map((t) => canonB(t, false)).join(" ");
const canonPlain = (s: string) =>
  DOUBLETS.reduce((x, [re, to]) => x.replace(new RegExp(stripMarks(re.source), "g"), stripMarks(to)), s)
    .split(" ")
    .map((t) => canonB(t, true))
    .join(" ");

/** Standard Greek keyboard layout on top of QWERTY (as on macOS and iOS). */
export const LATIN_TO_GREEK: Record<string, string> = {
  a: "α", b: "β", g: "γ", d: "δ", e: "ε", z: "ζ", h: "η", u: "θ", i: "ι", k: "κ", l: "λ", m: "μ",
  n: "ν", j: "ξ", o: "ο", p: "π", r: "ρ", s: "σ", t: "τ", y: "υ", f: "φ", x: "χ", c: "ψ", v: "ω", w: "ς",
};

const TONOS: Record<string, string> = { α: "ά", ε: "έ", η: "ή", ι: "ί", ο: "ό", υ: "ύ", ω: "ώ", Α: "Ά", Ε: "Έ", Η: "Ή", Ι: "Ί", Ο: "Ό", Υ: "Ύ", Ω: "Ώ" };

export function withTonos(vowel: string): string {
  return TONOS[vowel] ?? vowel;
}

export function latinToGreek(ch: string): string | null {
  const g = LATIN_TO_GREEK[ch.toLowerCase()];
  if (!g) return null;
  return ch === ch.toLowerCase() ? g : g.toUpperCase();
}

/** Final σ → ς at the end of every word, as Greek keyboards do. */
export function fixFinalSigma(s: string): string {
  return s.replace(/σ(?=$|[\s.,;!?])/g, "ς");
}
