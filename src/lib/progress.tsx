import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { store, requestPersistentStorage, type DayActivity } from "../storage";
import { addDays, today } from "./dates";
import { answer as leitnerAnswer, introduce, type ItemState } from "./leitner";

interface Progress {
  ready: boolean;
  items: Map<string, ItemState>;
  meta: Record<string, unknown>;
  activity: DayActivity[];
  /** Record an answer for an item (creating it if new). */
  answer(key: string, ok: boolean): void;
  /** Put items into box 1 without answering, spreading their first review over `spreadDays`. */
  introduce(keys: string[], spreadDays?: number): void;
  setMeta(key: string, value: unknown): void;
  reload(): Promise<void>;
}

const ProgressContext = createContext<Progress | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState(new Map<string, ItemState>());
  const [meta, setMetaState] = useState<Record<string, unknown>>({});
  const [activity, setActivity] = useState<DayActivity[]>([]);

  const reload = useCallback(async () => {
    const [i, m, a] = await Promise.all([store.loadItems(), store.loadMeta(), store.loadActivity()]);
    setItems(new Map(i.map((s) => [s.key, s])));
    setMetaState(m);
    setActivity(a);
    setReady(true);
  }, []);

  useEffect(() => {
    void requestPersistentStorage();
    void reload();
  }, [reload]);

  const answer = useCallback((key: string, ok: boolean) => {
    const on = today();
    setItems((prev) => {
      const next = leitnerAnswer(prev.get(key), key, ok, on);
      void store.saveItems([next]);
      return new Map(prev).set(key, next);
    });
    setActivity((prev) => {
      const last = prev.at(-1);
      const day = last?.date === on ? { ...last } : { date: on, answers: 0, correct: 0 };
      day.answers += 1;
      day.correct += ok ? 1 : 0;
      void store.saveActivity(day);
      return last?.date === on ? [...prev.slice(0, -1), day] : [...prev, day];
    });
  }, []);

  const introduceKeys = useCallback((keys: string[], spreadDays = 1) => {
    const on = today();
    setItems((prev) => {
      // New words: first review tomorrow. Catching up (spreadDays > 1): reviews spread from today on.
      const fresh = keys
        .filter((k) => !prev.has(k))
        .map((k, i) => ({ ...introduce(k, on), due: addDays(on, spreadDays > 1 ? Math.floor((i * spreadDays) / keys.length) : 1) }));
      void store.saveItems(fresh);
      const next = new Map(prev);
      fresh.forEach((s) => next.set(s.key, s));
      return next;
    });
  }, []);

  const setMeta = useCallback((key: string, value: unknown) => {
    setMetaState((prev) => ({ ...prev, [key]: value }));
    void store.saveMeta(key, value);
  }, []);

  const value = useMemo(
    () => ({ ready, items, meta, activity, answer, introduce: introduceKeys, setMeta, reload }),
    [ready, items, meta, activity, answer, introduceKeys, setMeta, reload],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Progress {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress outside ProgressProvider");
  return ctx;
}

/** Consecutive days with at least one answer, ending today or yesterday. */
export function streak(activity: DayActivity[]): number {
  const days = new Set(activity.filter((a) => a.answers > 0).map((a) => a.date));
  let d = today();
  if (!days.has(d)) d = addDays(d, -1);
  let n = 0;
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}
