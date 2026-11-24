import { days, wordKey, words, type Word } from "../../data/words";
import type { DateStr } from "../../lib/dates";
import { LEARNED_BOX, isDue, type ItemState } from "../../lib/leitner";
import { EXTRA_WORDS } from "../../program";

export type DayStatus = "new" | "learning" | "learned";

export function dayStatus(dayWords: Word[], items: Map<string, ItemState>): DayStatus {
  const states = dayWords.map((w) => items.get(wordKey(w)));
  if (states.every((s) => !s)) return "new";
  if (states.every((s) => s && s.box >= LEARNED_BOX)) return "learned";
  return "learning";
}

/** Due cards: the deck plus course-only words. */
export function dueWords(items: Map<string, ItemState>, on: DateStr): Word[] {
  return [...words, ...EXTRA_WORDS]
    .map((w) => ({ w, s: items.get(wordKey(w)) }))
    .filter((x): x is { w: Word; s: ItemState } => !!x.s && isDue(x.s, on))
    .sort((a, b) => a.s.box - b.s.box || a.s.due.localeCompare(b.s.due))
    .map((x) => x.w);
}

/** First day in the plan with no introduced words yet. */
export function firstUnstartedDay(items: Map<string, ItemState>) {
  return days.find((d) => d.words.every((w) => !items.has(wordKey(w))));
}

/**
 * The plan day whose new words come next. Set by hand ("активный день") when devices are not in sync,
 * advanced automatically after a day is learned; otherwise the first day not started yet.
 */
export function activeDay(items: Map<string, ItemState>, meta: Record<string, unknown>) {
  const set = typeof meta.activeDay === "number" ? days.find((d) => d.day === meta.activeDay) : undefined;
  return set ?? firstUnstartedDay(items);
}
export function wordCounts(items: Map<string, ItemState>) {
  let learning = 0;
  let learned = 0;
  const boxes = [0, 0, 0, 0, 0, 0];
  for (const w of words) {
    const s = items.get(wordKey(w));
    if (!s) continue;
    boxes[s.box - 1]++;
    if (s.box >= LEARNED_BOX) learned++;
    else learning++;
  }
  return { learning, learned, total: words.length, boxes };
}
