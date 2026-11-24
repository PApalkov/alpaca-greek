import { TOPICS, questionKey, type Item, type Topic } from "../../grammar/questions";
import type { DateStr } from "../../lib/dates";
import { isDue, type ItemState } from "../../lib/leitner";
import { shuffle } from "../../lib/random";

const cache = new Map<string, Item[]>();

/** Items are generated once per topic and cached. */
export function topicQuestions(t: Topic): Item[] {
  if (!cache.has(t.id)) cache.set(t.id, t.questions());
  return cache.get(t.id)!;
}

export interface TopicStats {
  total: number;
  seen: number;
  /** Box 3+: answered right several times in a row. */
  solid: number;
  due: number;
  /** Share of correct answers over all attempts, 0..1; null before the first attempt. */
  accuracy: number | null;
}

export function topicStats(t: Topic, items: Map<string, ItemState>, on: DateStr): TopicStats {
  let seen = 0;
  let solid = 0;
  let due = 0;
  let tries = 0;
  let right = 0;
  for (const q of topicQuestions(t)) {
    const s = items.get(questionKey(q));
    if (!s) continue;
    seen++;
    tries += s.seen;
    right += s.correct;
    if (s.box >= 3) solid++;
    if (isDue(s, on)) due++;
  }
  return { total: topicQuestions(t).length, seen, solid, due, accuracy: tries ? right / tries : null };
}

/** Due first (weakest box first), then unseen, then the longest-unpracticed. */
function rank(qs: Item[], items: Map<string, ItemState>, on: DateStr): Item[] {
  const state = (q: Item) => items.get(questionKey(q));
  const due = qs.filter((q) => state(q) && isDue(state(q)!, on)).sort((a, b) => state(a)!.box - state(b)!.box);
  const fresh = qs.filter((q) => !state(q));
  const rest = qs
    .filter((q) => state(q) && !isDue(state(q)!, on))
    .sort((a, b) => state(a)!.last.localeCompare(state(b)!.last) || state(a)!.box - state(b)!.box);
  return [...due, ...fresh, ...rest];
}

const reshuffle = (q: Item): Item =>
  q.kind === "choice" ? { ...q, options: shuffle(q.options) } : q.kind === "build" ? { ...q, tiles: shuffle(q.tiles) } : q;

export function pickSession(t: Topic, items: Map<string, ItemState>, on: DateStr, size = 10): Item[] {
  return rank(shuffle(topicQuestions(t)), items, on).slice(0, size).map(reshuffle);
}

/**
 * Mixed practice across all grammar: everything due, topped up with new and weak items from
 * topics already started (or the first topics, for a fresh start), interleaved by topic.
 */
export function pickMixed(items: Map<string, ItemState>, on: DateStr, size = 15): Item[] {
  const started = TOPICS.filter((t) => topicStats(t, items, on).seen > 0);
  const pool = (started.length ? started : TOPICS.slice(0, 3)).map((t) => rank(shuffle(topicQuestions(t)), items, on));
  const due = TOPICS.flatMap((t) => topicQuestions(t).filter((q) => items.get(questionKey(q)) && isDue(items.get(questionKey(q))!, on)));
  const out = [...shuffle(due)].slice(0, size);
  for (let i = 0; out.length < size && pool.some((p) => p.length > i); i++) {
    for (const p of pool) if (p[i] && !out.includes(p[i]) && out.length < size) out.push(p[i]);
  }
  return out.map(reshuffle);
}

/** A set of topics, interleaved: due items first, then new and weak ones. Used by the daily lesson. */
export function pickFromTopics(ids: string[], items: Map<string, ItemState>, on: DateStr, size: number): Item[] {
  const lists = TOPICS.filter((t) => ids.includes(t.id)).map((t) => rank(shuffle(topicQuestions(t)), items, on));
  const out: Item[] = [];
  for (let i = 0; out.length < size && lists.some((l) => l.length > i); i++) {
    for (const l of shuffle(lists)) if (l[i] && out.length < size) out.push(l[i]);
  }
  // Due items of all listed topics go first, whatever topic they came from.
  const isDueItem = (q: Item) => {
    const s = items.get(questionKey(q));
    return !!s && isDue(s, on);
  };
  return [...out.filter(isDueItem), ...out.filter((q) => !isDueItem(q))].map(reshuffle);
}

export function grammarDue(items: Map<string, ItemState>, on: DateStr): number {
  return TOPICS.reduce((n, t) => n + topicStats(t, items, on).due, 0);
}
