import { useEffect, useSyncExternalStore } from "react";
import type { ItemState } from "../lib/leitner";
import type { CourseState } from "../lib/lesson";
import { CURRICULUM } from "./curriculum";
import { WRITTEN_EPOCHS, contentVersion, epochIdOf, isLoaded, loadEpochs, loadedEpochs, loadedLessons, subscribeContent } from ".";

/** The loaded part of the course; re-renders when more epochs arrive. */
export function useContent() {
  useSyncExternalStore(subscribeContent, contentVersion);
  return { epochs: loadedEpochs(), lessons: loadedLessons() };
}

/** Loads all written epochs (course map, lesson picker). */
export function useAllEpochs(active = true) {
  useEffect(() => {
    if (active) void loadEpochs(WRITTEN_EPOCHS);
  }, [active]);
  return useContent();
}

/**
 * Epochs needed right now: every epoch the learner has started (their exercises come back in the
 * warm-up), the current one, and the next written one (so finishing an epoch moves on smoothly).
 */
export function neededEpochs(course: Partial<CourseState> | undefined, items: Map<string, ItemState>, route: string[]): string[] {
  const started = new Set<string>();
  for (const id of Object.keys(course?.done ?? {})) started.add(epochIdOf(id));
  if (course?.current) started.add(epochIdOf(course.current));
  if (course?.resume) started.add(epochIdOf(course.resume.id));
  for (const key of items.keys()) {
    const m = key.match(/^g:lesson\.(e\d+)-/);
    if (m) started.add(m[1]);
  }
  if (route[0] === "lesson" && route[1]) started.add(epochIdOf(route[1]));

  // The first written epoch not fully done according to the plan, and the one after the last started.
  const doneIn = (e: string) => Object.keys(course?.done ?? {}).filter((id) => epochIdOf(id) === e).length;
  const planned = (e: string) => CURRICULUM.find((p) => p.id === e)?.lessons.length ?? 0;
  const open = WRITTEN_EPOCHS.find((e) => doneIn(e) < planned(e));
  if (open) started.add(open);
  const lastStarted = Math.max(-1, ...[...started].map((e) => WRITTEN_EPOCHS.indexOf(e)));
  if (WRITTEN_EPOCHS[lastStarted + 1]) started.add(WRITTEN_EPOCHS[lastStarted + 1]);

  return WRITTEN_EPOCHS.filter((e) => started.has(e));
}

export const allLoaded = (ids: string[]) => ids.every(isLoaded);
