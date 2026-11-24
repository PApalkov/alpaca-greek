import { addDays, type DateStr } from "./dates";

/**
 * The same 5-box Leitner system as the paper cards:
 * box 1 every day, 2 every other day, 3 every 4 days, 4 weekly, 5 every two weeks.
 * A correct answer in box 5 makes the item learned (box 6), checked again in two months.
 */
export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 7, 14, 60] as const;
export const LEARNED_BOX = 6;

export interface ItemState {
  key: string;
  box: number; // 1..6
  due: DateStr;
  seen: number;
  correct: number;
  last: DateStr;
}

export function introduce(key: string, on: DateStr): ItemState {
  return { key, box: 1, due: addDays(on, BOX_INTERVAL_DAYS[1]), seen: 0, correct: 0, last: on };
}

export function answer(prev: ItemState | undefined, key: string, ok: boolean, on: DateStr): ItemState {
  const base = prev ?? { ...introduce(key, on), box: 0 };
  const box = ok ? Math.min(base.box + 1, LEARNED_BOX) : 1;
  return {
    key,
    box,
    due: addDays(on, BOX_INTERVAL_DAYS[box]),
    seen: base.seen + 1,
    correct: base.correct + (ok ? 1 : 0),
    last: on,
  };
}

export function isDue(s: ItemState, on: DateStr): boolean {
  return s.due <= on;
}
