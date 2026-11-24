import { wordByEl, type Word } from "../data/words";
import { buildDistractors, parseSpot, sentenceTiles, type Item, type TextContext } from "../grammar/questions";
import { shuffle } from "../lib/random";
import { CURRICULUM } from "./curriculum";
import type { Epoch, Exercise, Lesson, LessonWord } from "./types";

export { CURRICULUM };

/**
 * Epochs are loaded on demand: every `epochN.ts` becomes its own chunk, imported only when the
 * learner needs it (the current and started epochs at startup, the rest when the course map opens).
 * The service worker still pre-caches all chunks, so the course works offline.
 */
const MODULES = import.meta.glob<Record<string, unknown>>("./epoch*.ts");

const epochIdOfPath = (path: string) => `e${path.match(/epoch(\d+)\.ts$/)![1]}`;

/** Ids of the written epochs, in order — known without loading their content. */
export const WRITTEN_EPOCHS: string[] = Object.keys(MODULES)
  .map(epochIdOfPath)
  .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

const PATH_OF = new Map(Object.keys(MODULES).map((p) => [epochIdOfPath(p), p]));

/** "e2-l05" → "e2". */
export const epochIdOf = (lessonId: string) => lessonId.split("-")[0];

// Indexes over the loaded epochs; filled by loadEpochs().
const loaded = new Map<string, Epoch>();
export const LESSON = new Map<string, Lesson>();
export const LESSON_ITEMS = new Map<string, Item>();
export const EXTRA_WORDS: Word[] = [];

export const loadedEpochs = (): Epoch[] => WRITTEN_EPOCHS.map((id) => loaded.get(id)).filter((e): e is Epoch => !!e);
export const loadedLessons = (): Lesson[] => loadedEpochs().flatMap((e) => e.lessons);
export const isLoaded = (epochId: string) => loaded.has(epochId);
export const lessonEpoch = (id: string) => loaded.get(epochIdOf(id));
/** Number of the lesson within its epoch (e2-l05 → 5). */
export const lessonNumber = (id: string) => (lessonEpoch(id)?.lessons.findIndex((l) => l.id === id) ?? -1) + 1;

let version = 0;
const listeners = new Set<() => void>();
export const subscribeContent = (fn: () => void) => (listeners.add(fn), () => listeners.delete(fn));
export const contentVersion = () => version;

const pending = new Map<string, Promise<void>>();

/** Loads the given epochs (unknown or already loaded ids are skipped) and indexes their lessons. */
export async function loadEpochs(ids: string[]): Promise<void> {
  await Promise.all(
    ids
      .filter((id) => PATH_OF.has(id) && !loaded.has(id))
      .map((id) => {
        if (!pending.has(id))
          pending.set(
            id,
            MODULES[PATH_OF.get(id)!]().then((mod) => {
              const epoch = Object.values(mod).find((v): v is Epoch => !!v && typeof v === "object" && "lessons" in v);
              if (!epoch) throw new Error(`${id}: no Epoch export`);
              index(epoch);
              loaded.set(id, epoch);
              version++;
              listeners.forEach((fn) => fn());
            }),
          );
        return pending.get(id)!;
      }),
  );
}

/** Course-only words become cards too, so they are reviewed with the deck. */
function extraWord(w: LessonWord, lesson: Lesson): Word {
  return { id: 0, key: `v:${w.el}`, day: 0, topic: lesson.titleRu, el: w.el, tr: w.tr, ru: w.ru, ex: w.example ? [w.example] : [] };
}

/** All new words of a lesson as cards: deck words (with their examples) and course-only words. */
export function lessonWords(lesson: Lesson): Word[] {
  const deck = lesson.words.map((el) => wordByEl.get(el)).filter((w): w is Word => !!w);
  return [...deck, ...(lesson.extraWords ?? []).map((w) => extraWord(w, lesson))];
}

/** The nearest dialogue or reading before a step: what its comprehension questions are about. */
function textBefore(lesson: Lesson, stepIndex: number): TextContext | undefined {
  for (let i = stepIndex - 1; i >= 0; i--) {
    const s = lesson.steps[i];
    if (s.kind === "dialogue") return { title: s.title, lines: s.lines.map((l) => `${l.who}: ${l.el}`), listenOnly: !!s.listenFirst };
    if (s.kind === "reading") return { title: s.title, lines: s.text.map((t) => t.el), listenOnly: !!s.listenFirst };
  }
  return undefined;
}

/** Turns a lesson exercise into a practice item. Ids are positional: `lesson.<lessonId>.<step>.<n>`. */
export function exerciseItem(ex: Exercise, id: string, context?: TextContext): Item {
  switch (ex.kind) {
    case "gap":
      return {
        kind: "choice",
        id,
        prompt: ex.prompt,
        hint: ex.hint,
        options: ex.options ? shuffle(ex.options) : [],
        answer: ex.answer,
        accept: ex.accept,
        explain: ex.explain,
        say: ex.prompt.includes("___") && !/[а-яё]/i.test(ex.prompt.split("—")[0]) ? ex.prompt.split(" — ")[0].replace("___", ex.answer) : undefined,
      };
    case "translate":
      return { kind: "translate", id, ru: ex.ru, answers: [ex.answer, ...(ex.accept ?? [])], explain: ex.explain };
    case "listen":
      return { kind: "listen", id, el: ex.el, ru: ex.ru };
    case "build": {
      const words = sentenceTiles(ex.answer);
      return {
        kind: "build",
        id,
        ru: ex.ru,
        answer: ex.answer,
        words,
        tiles: shuffle([...words, ...(ex.extra ?? buildDistractors(words))]),
        explain: ex.explain ?? "",
      };
    }
    case "spot":
      return { kind: "spot", id, ru: ex.ru, ...parseSpot(ex.el), fix: ex.fix, explain: ex.explain };
    case "choose":
      return { kind: "choose", id, question: ex.question, options: shuffle(ex.options), answer: ex.answer, explain: ex.explain, context };
  }
}

/** Adds an epoch's lessons, practice items (for the warm-up) and course-only words to the indexes. */
function index(epoch: Epoch) {
  for (const lesson of epoch.lessons) {
    LESSON.set(lesson.id, lesson);
    EXTRA_WORDS.push(...(lesson.extraWords ?? []).map((w) => extraWord(w, lesson)));
    lesson.steps.forEach((step, si) => {
      if (step.kind !== "practice") return;
      const context = textBefore(lesson, si);
      step.exercises.forEach((ex, ei) => {
        const id = `lesson.${lesson.id}.${si}.${ei}`;
        LESSON_ITEMS.set(id, exerciseItem(ex, id, context));
      });
    });
  }
}

export function practiceItems(lesson: Lesson, stepIndex: number): Item[] {
  const step = lesson.steps[stepIndex];
  if (step.kind !== "practice") return [];
  return step.exercises.map((_, ei) => LESSON_ITEMS.get(`lesson.${lesson.id}.${stepIndex}.${ei}`)!).map((q) =>
    q.kind === "choice" || q.kind === "choose" ? { ...q, options: shuffle(q.options) } : q.kind === "build" ? { ...q, tiles: shuffle(q.tiles) } : q,
  );
}
