import raw from "./words.json";

export interface Word {
  id: number;
  day: number;
  topic: string;
  el: string;
  tr: string;
  ru: string;
  past?: string;
  ex: { el: string; ru: string }[];
  /** Progress key for words that are not in the deck (course-only words): "v:<el>". */
  key?: string;
}

/** Daily word plan from greek_cards.pdf (regenerate with `npm run extract:cards -- <pdf>`). */
export const words: Word[] = raw as Word[];

export const wordKey = (w: Word) => w.key ?? `w:${w.id}`;

export const wordByEl = new Map(words.map((w) => [w.el, w]));

export const days: { day: number; topic: string; words: Word[] }[] = [];
for (const w of words) {
  const last = days.at(-1);
  if (last?.day === w.day) last.words.push(w);
  else days.push({ day: w.day, topic: w.topic, words: [w] });
}

