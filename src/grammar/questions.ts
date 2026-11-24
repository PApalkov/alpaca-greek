import { shuffle } from "../lib/random";
import {
  GENDER_LABEL,
  NOUN,
  NOUNS,
  SLOTS,
  SLOT_LABEL,
  article,
  form,
  hasPlural,
  needsN,
  withArticle,
  withSe,
  type Noun,
  type Slot,
} from "./nouns";
import { BUILDS, SPOTS } from "./practice";
import { BLANK, SENTENCES, blanks } from "./sentences";
import { PERSONS, PERSON_RU, VERBS, VERB_RULES } from "./verbs";

/** Gap-fill, answered by typing; `options` are only a hint. */
export interface Question {
  kind: "choice";
  /** Stable id: progress is stored under `g:<id>`. */
  id: string;
  /** Greek line; "___" marks the gap when there is one. */
  prompt: string;
  /** What to do / translation, in Russian. */
  hint: string;
  options: string[];
  answer: string;
  /** Other spellings accepted when typing. */
  accept?: string[];
  explain?: string;
  /** Full correct Greek to read aloud after answering. */
  say?: string;
}

/** Put the Greek sentence together from word tiles (with a few wrong forms mixed in). */
export interface BuildItem {
  kind: "build";
  id: string;
  ru: string;
  answer: string;
  /** Correct word order, as shown on tiles. */
  words: string[];
  /** All tiles, shuffled, including distractors. */
  tiles: string[];
  explain: string;
}

/** Tap the wrong word, or say the sentence is correct. */
export interface SpotItem {
  kind: "spot";
  id: string;
  ru: string;
  words: string[];
  /** Indexes of wrong words; empty when the sentence is correct. */
  wrong: number[];
  fix: string;
  explain: string;
}

/** Translate a Russian sentence by typing the Greek one (or, with `label`, fix a wrong Greek phrase). */
export interface TranslateItem {
  kind: "translate";
  id: string;
  /** The prompt: a Russian sentence, or the wrong Greek phrase for "fix it" items. */
  ru: string;
  answers: string[];
  explain?: string;
  /** Task line instead of «Переведи на греческий». */
  label?: string;
}

/** The text a comprehension question is about (shown again, or only played for listening). */
export interface TextContext {
  title: string;
  lines: string[];
  listenOnly: boolean;
}

/** Comprehension question: choose the answer. */
export interface ChooseItem {
  kind: "choose";
  id: string;
  question: string;
  options: string[];
  answer: string;
  explain?: string;
  context?: TextContext;
}

/** Dictation: hear the Greek, type it. */
export interface ListenItem {
  kind: "listen";
  id: string;
  el: string;
  ru: string;
}

export type Item = Question | BuildItem | SpotItem | TranslateItem | ListenItem | ChooseItem;

const learnable = NOUNS.filter((x) => !x.name);

// ---------- distractors ----------

const strip = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");

/** The form with the stress left where it was in the nominative: "άνθρωπους", "δωμάτιου". */
function stressTrap(noun: Noun, slot: Slot): string | null {
  const base = noun.forms[0]!;
  const f = form(noun, slot);
  if (!f || slot === "nomSg") return null;
  const chars = [...base];
  const at = chars.findIndex((c) => c !== strip(c));
  const plain = [...strip(f)];
  // Only when the nominative stress is not final (so it can "stay behind") and the stems match up to it.
  const isVowel = (c: string | undefined) => !!c && /[αεηιουω]/.test(c);
  if (at < 0 || at > plain.length - 4 || isVowel(plain[at + 1])) return null;
  if (strip(base).slice(0, at + 1) !== plain.slice(0, at + 1).join("")) return null;
  plain[at] = (plain[at] + "́").normalize("NFC");
  const trap = plain.join("");
  return trap === f ? null : trap;
}

const OTHER_GENDER_ARTICLE: Partial<Record<Slot, string[]>> = {
  accSg: ["τον", "την", "το"],
  genSg: ["του", "της"],
  nomPl: ["οι", "τα"],
  accPl: ["τους", "τις", "τα"],
};

function nounOptions(noun: Noun, slot: Slot): string[] {
  const answer = withArticle(noun, slot)!;
  const f = form(noun, slot)!;
  const plural = slot.endsWith("Pl");
  const paradigm = shuffle(SLOTS.map((s) => withArticle(noun, s)).filter((x): x is string => !!x));
  const sameNumber = paradigm.filter((x) => SLOTS.some((s) => s.endsWith(plural ? "Pl" : "Sg") && withArticle(noun, s) === x));
  const trap = stressTrap(noun, slot);
  const wrongArticle = shuffle(OTHER_GENDER_ARTICLE[slot] ?? []).map((a) => `${a} ${f}`);
  const pool = [trap && `${article(noun.g, slot, f)} ${trap}`, ...sameNumber, ...wrongArticle, ...paradigm];
  const out = [answer];
  for (const p of pool) if (p && !out.includes(p) && out.length < 4) out.push(p);
  return shuffle(out);
}

function seOptions(noun: Noun, slot: "accSg" | "accPl"): string[] {
  const answer = withSe(noun, slot)!;
  const f = form(noun, slot)!;
  const twin = answer.startsWith("στην ") ? `στη ${f}` : answer.startsWith("στη ") ? `στην ${f}` : null;
  const pool = [twin, ...shuffle(["στον", "στην", "στο", "στους", "στις", "στα"].map((a) => `${a} ${f}`))];
  const out = [answer];
  for (const p of pool) if (p && !out.includes(p) && out.length < 4) out.push(p);
  return shuffle(out);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- question sets per topic ----------

const ENDING_HINT: Record<string, string> = {
  m: "-ος, -ας, -ης — мужской род",
  f: "-α, -η — женский род",
  n: "-ο, -ι, -μα — средний род",
};

function genderQuestions(): Question[] {
  return learnable.map((x) => ({
    kind: "choice" as const,
    id: `gender.${x.key}`,
    prompt: `___ ${x.key}`,
    hint: `${x.ru} — какой артикль?`,
    options: ["ο", "η", "το"],
    answer: withArticle(x, "nomSg")!.split(" ")[0],
    explain: `${withArticle(x, "nomSg")} — ${GENDER_LABEL[x.g]}. ${ENDING_HINT[x.g]}`,
    say: withArticle(x, "nomSg")!,
  }));
}

function formQuestion(topic: string, x: Noun, from: Slot, to: Slot, explain: string): Question {
  return {
    kind: "choice",
    id: `${topic}.${x.key}.${to}`,
    prompt: `${withArticle(x, from)} → ?`,
    hint: `${x.ru}: ${SLOT_LABEL[to]}`,
    options: nounOptions(x, to),
    answer: withArticle(x, to)!,
    explain,
    say: withArticle(x, to)!,
  };
}

const PLURAL_RULE: Record<string, string> = {
  m: "м. р.: -ος → -οι; -ας, -ης → -ες",
  f: "ж. р.: -α, -η → -ες; -ση, -ξη → -εις",
  n: "ср. р.: -ο → -α; -ι → -ια; -μα → -ματα",
};

function pluralQuestions(): Question[] {
  return learnable.filter(hasPlural).map((x) => formQuestion("plural", x, "nomSg", "nomPl", PLURAL_RULE[x.g]));
}

const ACC_RULE: Record<string, string> = {
  m: "Мужской: меняются артикль и окончание (-ος → -ο, -ας/-ης теряют -ς; мн. -οι → -ους)",
  f: "Женский: меняется только артикль (τη/την, τις)",
  n: "Средний: не меняется ничего",
};

function accusativeQuestions(): Question[] {
  const qs: Question[] = [];
  for (const x of NOUNS) {
    if (form(x, "accSg")) qs.push(formQuestion("acc", x, "nomSg", "accSg", ACC_RULE[x.g]));
    if (form(x, "accPl")) qs.push(formQuestion("acc", x, "nomPl", "accPl", ACC_RULE[x.g]));
    if (x.g === "f") {
      const f = form(x, "accSg")!;
      const a = needsN(f) ? "την" : "τη";
      qs.push({
        kind: "choice",
        id: `acc.n.${x.key}`,
        prompt: `Βλέπω ___ ${f}.`,
        hint: `τη или την? (${x.ru})`,
        options: ["τη", "την"],
        answer: a,
        explain: needsN(f)
          ? "την: слово начинается с гласной или с κ, π, τ, μπ, ντ, γκ, ξ, ψ"
          : "τη: перед остальными согласными ν не пишем",
        say: `Βλέπω ${a} ${f}.`,
      });
    }
  }
  return qs;
}

const GEN_RULE: Record<string, string> = {
  m: "м. р.: -ος → -ου; -ας, -ης → убираем -ς. Мн.: των … -ων",
  f: "ж. р.: добавляем -ς (της … -ς). Мн.: των … -ών, ударение на конце",
  n: "ср. р.: -ο → -ου; -ι → -ιού; -μα → -ματος. Мн.: των … -ων",
};

function genitiveQuestions(): Question[] {
  const qs: Question[] = [];
  for (const x of NOUNS) {
    if (form(x, "genSg")) qs.push(formQuestion("gen", x, "nomSg", "genSg", GEN_RULE[x.g]));
    if (form(x, "genPl")) qs.push(formQuestion("gen", x, "nomPl", "genPl", GEN_RULE[x.g]));
  }
  return qs;
}

function sentenceQuestions(): Question[] {
  const qs: Question[] = [];
  SENTENCES.forEach((sent, si) => {
    const bs = blanks(sent);
    const filled = bs.map((b) => {
      const x = NOUN.get(b.noun)!;
      return b.se ? withSe(x, b.slot as "accSg" | "accPl")! : withArticle(x, b.slot)!;
    });
    const render = (gap: number | null) => {
      let i = 0;
      const line = sent.el.replace(BLANK, () => {
        const k = i++;
        return k === gap ? "___" : filled[k];
      });
      return line.startsWith("___") ? line : cap(line);
    };
    bs.forEach((b, bi) => {
      const x = NOUN.get(b.noun)!;
      const atStart = sent.el.startsWith("{") && bi === 0;
      const fix = (o: string) => (atStart ? cap(o) : o);
      const options = b.se ? seOptions(x, b.slot as "accSg" | "accPl") : nounOptions(x, b.slot);
      qs.push({
        kind: "choice",
        id: `sent.${si}.${bi}`,
        prompt: render(bi),
        hint: `${sent.ru} (${x.forms[0]})`,
        options: options.map(fix),
        answer: fix(filled[bi]),
            explain: sent.why[bi] ?? sent.why[0],
        say: render(null),
      });
    });
  });
  return qs;
}

function verbQuestions(): Question[] {
  const qs: Question[] = [];
  for (const v of VERBS) {
    v.forms.forEach((f, p) => {
      const others = shuffle([...new Set(v.forms.filter((o) => o !== f))]).slice(0, 3);
      qs.push({
        kind: "choice",
        id: `verb.${v.key}.${p}`,
        prompt: `${PERSONS[p]} ___`,
        hint: `${v.key} — ${v.ru}: ${PERSON_RU[p]}`,
        options: shuffle([f, ...others]),
        answer: f,
        accept: v.alt?.[p],
            explain: VERB_RULES[v.group],
        say: `${PERSONS[p]} ${f}`,
      });
    });
  }
  return qs;
}

const ARTICLE_WORDS = ["ο", "η", "το", "τον", "τη", "την", "του", "της", "οι", "τα", "τους", "τις", "των", "στο", "στον", "στη", "στην", "στους", "στις", "στα"];
export const tokenize = (s: string) => s.replace(/[.,;!?]/g, "").split(/\s+/).filter(Boolean);
const lower = (s: string) => s.toLocaleLowerCase("el");
const PROPER = new Set(NOUNS.filter((x) => x.name).flatMap((x) => x.forms.filter((f): f is string => !!f)));

/** Tiles keep capitals only for names; the first word of the sentence is lowercased. */
const tileForm = (w: string) => (PROPER.has(w) ? w : lower(w));

/** Tile words of a sentence: names keep their capital (known names, or capitalized after the first word). */
export function sentenceTiles(sentence: string): string[] {
  return tokenize(sentence).map((w, i) => (PROPER.has(w) || (i > 0 && w !== lower(w)) ? w : lower(w)));
}

/** Wrong-case and wrong-article versions of words in the answer. */
export function buildDistractors(words: string[]): string[] {
  const set = new Set(words.map(lower));
  const pool: string[] = [];
  for (const w of words) {
    const l = lower(w);
    if (ARTICLE_WORDS.includes(l)) {
      pool.push(...ARTICLE_WORDS.filter((a) => a !== l && a.startsWith("σ") === l.startsWith("σ")));
      continue;
    }
    const noun = NOUNS.find((x) => x.forms.some((f) => f && lower(f) === l));
    if (noun) pool.push(...noun.forms.filter((f): f is string => !!f && lower(f) !== l).map(tileForm));
    const trap = noun && SLOTS.map((s) => (form(noun, s) && lower(form(noun, s)!) === l ? stressTrap(noun, s) : null)).find(Boolean);
    if (trap) pool.unshift(trap);
  }
  const out: string[] = [];
  for (const p of shuffle(pool)) if (!set.has(lower(p)) && !out.includes(p) && out.length < 3) out.push(p);
  return out;
}

function buildItems(): BuildItem[] {
  return BUILDS.map((b, i) => {
    const words = tokenize(b.el).map(tileForm);
    return {
      kind: "build",
      id: `build.${i}`,
      ru: b.ru,
      answer: b.el,
      words,
      tiles: shuffle([...words, ...buildDistractors(words)]),
      explain: b.why,
    };
  });
}

/** "Βλέπω [ο φίλο]." → words and the indexes of the bracketed (wrong) ones. */
export function parseSpot(el: string): { words: string[]; wrong: number[] } {
  const words: string[] = [];
  const wrong: number[] = [];
  let inside = false;
  for (const raw of el.split(/\s+/)) {
    if (raw.startsWith("[")) inside = true;
    if (inside) wrong.push(words.length);
    if (raw.includes("]")) inside = false;
    words.push(raw.replace(/[[\]]/g, ""));
  }
  return { words, wrong };
}

function spotItems(): SpotItem[] {
  return SPOTS.map((s, i) => ({ kind: "spot", id: `spot.${i}`, ru: s.ru, ...parseSpot(s.el), fix: s.fix, explain: s.why }));
}

// ---------- topics ----------

export type RuleBlock =
  | { kind: "p"; text: string }
  | { kind: "ex"; el: string; ru: string }
  | { kind: "table"; head: string[]; rows: string[][] };

export type TopicGroup = "nouns" | "sentences" | "verbs";

export const GROUP_TITLE: Record<TopicGroup, string> = {
  nouns: "Существительные",
  sentences: "Предложения",
  verbs: "Глаголы",
};

export interface Topic {
  id: string;
  group: TopicGroup;
  title: string;
  subtitle: string;
  rules: { title: string; blocks: RuleBlock[] }[];
  questions: () => Item[];
}

export const TOPICS: Topic[] = [
  {
    id: "gender",
    group: "nouns",
    title: "Род и артикль",
    subtitle: "ο, η или το",
    questions: genderQuestions,
    rules: [
      {
        title: "Род видно по артиклю и окончанию",
        blocks: [
          { kind: "table", head: ["Род", "Артикль", "Окончания", "Пример"], rows: [
            ["мужской", "ο / ένας", "-ος, -ας, -ης", "ο φίλος, ο ταμίας, ο πωλητής"],
            ["женский", "η / μία", "-α, -η", "η σαλάτα, η τιμή"],
            ["средний", "το / ένα", "-ο, -ι, -μα", "το νερό, το παιδί, το μάθημα"],
          ] },
          { kind: "p", text: "Учите слово сразу с артиклем: от рода зависят и артикль, и окончания во всех падежах" },
        ],
      },
    ],
  },
  {
    id: "plural",
    group: "nouns",
    title: "Множественное число",
    subtitle: "οι φίλοι, τα παιδιά",
    questions: pluralQuestions,
    rules: [
      {
        title: "Артикль οι для м. и ж. рода, τα для среднего",
        blocks: [
          { kind: "table", head: ["Ед. ч.", "Мн. ч.", "Пример"], rows: [
            ["м. -ος", "-οι", "ο φίλος → οι φίλοι"],
            ["м. -ας, -ης", "-ες", "ο ταμίας → οι ταμίες"],
            ["ж. -α, -η", "-ες", "η τσάντα → οι τσάντες"],
            ["ж. -ση, -ξη", "-εις", "η απόδειξη → οι αποδείξεις"],
            ["ср. -ο", "-α", "το νερό → τα νερά"],
            ["ср. -ι", "-ια", "το παιδί → τα παιδιά"],
            ["ср. -μα", "-ματα", "το μάθημα → τα μαθήματα"],
          ] },
          { kind: "p", text: "У слов на ударное -ί ударение уходит на конец (παιδιά), у слов на -μα сдвигается вправо (μαθήματα)" },
        ],
      },
    ],
  },
  {
    id: "acc",
    group: "nouns",
    title: "Винительный падеж",
    subtitle: "Βλέπω τον φίλο",
    questions: accusativeQuestions,
    rules: [
      {
        title: "Когда: вижу кого? что? и после σε, από, με, για",
        blocks: [
          { kind: "table", head: ["", "м.", "ж.", "ср."], rows: [
            ["Им. ед.", "ο", "η", "το"],
            ["Вин. ед.", "τον", "τη / την", "το"],
            ["Им. мн.", "οι", "οι", "τα"],
            ["Вин. мн.", "τους", "τις", "τα"],
          ] },
          { kind: "ex", el: "Βλέπω τον φίλο.", ru: "Я вижу друга." },
        ],
      },
      {
        title: "Окончание меняется только у мужского рода",
        blocks: [
          { kind: "p", text: "Ед. ч.: убираем последнюю -ς: ο φίλος → τον φίλο, ο ταμίας → τον ταμία, ο πωλητής → τον πωλητή" },
          { kind: "p", text: "Мн. ч.: -οι → -ους (οι φίλοι → τους φίλους), а -ες остаётся (τους πωλητές)" },
          { kind: "p", text: "Женский — только артикль: την τσάντα, τις τσάντες. Средний не меняется: το παιδί, τα παιδιά" },
        ],
      },
      {
        title: "Три мелочи",
        blocks: [
          { kind: "p", text: "την перед гласной и κ, π, τ, μπ, ντ, γκ, ξ, ψ: την Αθήνα, την κάρτα. Иначе τη: τη Λάρνακα, τη σαλάτα" },
          { kind: "p", text: "σε + артикль пишется слитно: στον, στη(ν), στο, στους, στις, στα" },
          { kind: "p", text: "Ударение на 3-м слоге с конца в форме на -ους сдвигается: ο άνθρωπος → τους ανθρώπους" },
        ],
      },
    ],
  },
  {
    id: "gen",
    group: "nouns",
    title: "Родительный падеж",
    subtitle: "το σπίτι του φίλου",
    questions: genitiveQuestions,
    rules: [
      {
        title: "Отвечает на вопрос «чей?»",
        blocks: [
          { kind: "p", text: "Если два существительных стоят рядом, второе — в родительном падеже. Порядок как в русском" },
          { kind: "ex", el: "το όνομα της γυναίκας", ru: "имя женщины" },
          { kind: "table", head: ["", "м.", "ж.", "ср."], rows: [
            ["Род. ед.", "του", "της", "του"],
            ["Род. мн.", "των", "των", "των"],
            ["Неопр.", "ενός", "μιας", "ενός"],
          ] },
        ],
      },
      {
        title: "Единственное число",
        blocks: [
          { kind: "p", text: "м. -ος → -ου: ο φίλος → του φίλου; ударение с 3-го слога с конца уходит на 2-й: του δασκάλου" },
          { kind: "p", text: "м. -ας, -ης → убираем -ς: του πατέρα, του μαθητή" },
          { kind: "p", text: "ж. -α, -η → добавляем -ς: της γυναίκας, της αδερφής. В мужском -ς уходит, в женском приходит" },
          { kind: "p", text: "ср. -ο → -ου, -ι → -ιού, -μα → -ματος: του βιβλίου, του παιδιού, του μαθήματος" },
        ],
      },
      {
        title: "Множественное число: των … -ων у всех родов",
        blocks: [
          { kind: "table", head: ["Слово", "Род. мн."], rows: [
            ["м. -ος, ср. -ο", "как в род. ед.: των δασκάλων, των θεάτρων"],
            ["м. -ης", "на конце: των μαθητών"],
            ["ж. -α, -η", "на конце: των γυναικών, των αδερφών"],
            ["ср. -ι", "-ιών: των παιδιών"],
            ["ср. -μα", "-μάτων: των μαθημάτων"],
            ["м. -ας", "на 2-м слоге с конца: των πατέρων, των γειτόνων"],
          ] },
        ],
      },
    ],
  },
  {
    id: "sent",
    group: "sentences",
    title: "Падеж в предложении",
    subtitle: "Им., вин. или род.?",
    questions: sentenceQuestions,
    rules: [
      {
        title: "Перед ответом задай вопрос",
        blocks: [
          { kind: "table", head: ["Падеж", "Вопрос", "Когда"], rows: [
            ["Именительный", "кто? что?", "кто делает; после είναι и μου αρέσει"],
            ["Винительный", "кого? что?", "после глагола; после σε, από, με, για"],
            ["Родительный", "чей?", "второе существительное"],
          ] },
          { kind: "ex", el: "Ο φίλος μένει εδώ.", ru: "Друг живёт здесь. (им.)" },
          { kind: "ex", el: "Βλέπω τον φίλο.", ru: "Я вижу друга. (вин.)" },
          { kind: "ex", el: "Ξέρω το σπίτι του φίλου.", ru: "Я знаю дом друга. (род.)" },
          { kind: "p", text: "Μου αρέσει η σαλάτα — салат здесь подлежащее, как в русском «мне нравится салат»" },
        ],
      },
    ],
  },
  {
    id: "build",
    group: "sentences",
    title: "Собери предложение",
    subtitle: "перевод с русского",
    questions: buildItems,
    rules: [
      {
        title: "Сначала глагол, потом кого? что? и чей?",
        blocks: [
          { kind: "p", text: "Порядок слов как в русском: Βλέπω τον φίλο του Πέτρου — вижу друга Петроса" },
          { kind: "p", text: "Среди плиток есть лишние: та же форма в другом падеже или с другим артиклем. Перед выбором спроси себя: кто? кого? чей?" },
          { kind: "p", text: "Притяжательные μου, σου, του… ставятся после слова: ο φίλος μου" },
        ],
      },
    ],
  },
  {
    id: "spot",
    group: "sentences",
    title: "Найди ошибку",
    subtitle: "или скажи, что всё верно",
    questions: spotItems,
    rules: [
      {
        title: "Проверяй по порядку",
        blocks: [
          { kind: "p", text: "Род: артикль совпадает с родом слова? (ο ταμίας, но η τσάντα)" },
          { kind: "p", text: "Падеж: кто? — им., кого? что? и после предлога — вин., чей? — род." },
          { kind: "p", text: "Форма: τη/την, στη/στην, ударение в -ους и -ου, -ς в род. падеже" },
        ],
      },
    ],
  },
  {
    id: "present",
    group: "verbs",
    title: "Настоящее время",
    subtitle: "γράφω, μιλάω, είμαι",
    questions: verbQuestions,
    rules: [
      {
        title: "Окончание показывает лицо, местоимение обычно не нужно",
        blocks: [
          { kind: "table", head: ["", "A: γράφω", "B: μιλάω", "είμαι"], rows: [
            ["я", "γράφω", "μιλάω", "είμαι"],
            ["ты", "γράφεις", "μιλάς", "είσαι"],
            ["он, она", "γράφει", "μιλάει", "είναι"],
            ["мы", "γράφουμε", "μιλάμε", "είμαστε"],
            ["вы", "γράφετε", "μιλάτε", "είστε"],
            ["они", "γράφουν(ε)", "μιλάνε", "είναι"],
          ] },
          { kind: "p", text: "Группа A — ударение на основе, группа B — на окончании. В разговоре чаще μιλάω, в книгах μιλώ" },
          { kind: "p", text: "Неправильные: πάω, τρώω, λέω, ακούω — короткие формы: πας, τρως, λες, ακούς" },
          { kind: "ex", el: "Μιλάμε ελληνικά.", ru: "Мы говорим по-гречески." },
        ],
      },
    ],
  },
];

export const TOPIC = new Map(TOPICS.map((t) => [t.id, t]));

export const questionKey = (q: Item) => `g:${q.id}`;
