import type { TranslateItem } from "../grammar/questions";
import { today, type DateStr } from "./dates";
import { useProgress } from "./progress";

/** One mistake found by an AI review; it becomes a personal "fix it" exercise. */
export interface Mistake {
  id: string;
  wrong: string;
  right: string;
  rule: string;
  /** Where it came from, e.g. the lesson title. */
  source: string;
  date: DateStr;
}

/** A saved AI review of an essay, a role-play or a free text; stored in meta "reviews" by key. */
export interface Review {
  kind: "essay" | "speak" | "free";
  title: string;
  text: string;
  reply?: string;
  score?: number;
  date: DateStr;
}

export interface ParsedReply {
  score?: number;
  errors: { wrong: string; right: string; rule: string }[];
}

/** Reads the JSON block at the end of an AI reply (```json … ``` or the last {...} with "errors"). */
export function parseAiReply(reply: string): ParsedReply | null {
  const fenced = [...reply.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map((m) => m[1]);
  const bare = reply.lastIndexOf('{"score"') >= 0 ? [reply.slice(reply.lastIndexOf('{"score"'))] : [];
  for (const candidate of [...fenced.reverse(), ...bare]) {
    try {
      const end = candidate.lastIndexOf("}");
      const data = JSON.parse(candidate.slice(candidate.indexOf("{"), end + 1));
      if (!Array.isArray(data.errors)) continue;
      const errors = data.errors
        .filter((e: unknown): e is { wrong: string; right: string; rule?: string } => !!e && typeof (e as { wrong?: unknown }).wrong === "string" && typeof (e as { right?: unknown }).right === "string")
        .map((e: { wrong: string; right: string; rule?: string }) => ({ wrong: e.wrong.trim(), right: e.right.trim(), rule: (e.rule ?? "").trim() }))
        .filter((e: { wrong: string; right: string }) => e.wrong && e.right && e.wrong !== e.right);
      return { score: typeof data.score === "number" ? data.score : undefined, errors };
    } catch {
      // not this block
    }
  }
  return null;
}

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return (h >>> 0).toString(36);
}

export const mistakeId = (wrong: string, right: string) => `my.${hash(`${wrong}→${right}`)}`;

export function mistakeItem(m: Mistake): TranslateItem {
  return { kind: "translate", id: m.id, ru: m.wrong, answers: [m.right], explain: m.rule, label: "Исправь свою ошибку" };
}

/** Personal mistakes and saved reviews. New mistakes enter the Leitner box: first practice tomorrow. */
export function useMistakes() {
  const { meta, setMeta, introduce } = useProgress();
  const mistakes = (meta.mistakes as Mistake[] | undefined) ?? [];
  const reviews = (meta.reviews as Record<string, Review> | undefined) ?? {};

  const saveReview = (key: string, review: Review, parsed: ParsedReply | null) => {
    setMeta("reviews", { ...reviews, [key]: { ...review, score: parsed?.score ?? review.score } });
    if (!parsed) return 0;
    const known = new Set(mistakes.map((m) => m.id));
    const added: Mistake[] = [];
    for (const e of parsed.errors) {
      const id = mistakeId(e.wrong, e.right);
      if (known.has(id)) continue;
      known.add(id);
      added.push({ ...e, id, source: review.title, date: today() });
    }
    if (added.length) {
      setMeta("mistakes", [...mistakes, ...added]);
      introduce(added.map((m) => `g:${m.id}`));
    }
    return added.length;
  };

  return { mistakes, reviews, saveReview, items: mistakes.map(mistakeItem) };
}
