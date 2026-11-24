import type { DateStr } from "./dates";

/** Course progress, stored in meta under "course". */
export interface CourseState {
  /** Lesson chosen by hand ("текущий урок"), e.g. to line up the phone and the Mac. */
  current?: string;
  /** Finished lessons → date of finishing. */
  done: Record<string, DateStr>;
  /** Where an unfinished lesson was left: lesson id and step index. */
  resume?: { id: string; step: number };
  /** The learner's own texts from writing steps, by lesson id. */
  writing: Record<string, string>;
}

export const EMPTY_COURSE: CourseState = { done: {}, writing: {} };

/** Daily warm-up before the new lesson: due cards and due exercises from earlier lessons. */
export const WARMUP_WORDS = 15;
export const WARMUP_ITEMS = 8;
