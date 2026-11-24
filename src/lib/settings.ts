import { useProgress } from "./progress";

/** What happens to a mistake within a round: forgotten, shown once more at the end, or repeated until right. */
export type RepeatMistakes = "none" | "once" | "until";

export interface PracticeSettings {
  /** After a wrong typed answer: highlight the mistakes and let the learner fix them once. */
  secondChance: boolean;
  repeatMistakes: RepeatMistakes;
}

export const DEFAULT_SETTINGS: PracticeSettings = { secondChance: true, repeatMistakes: "once" };

export function usePracticeSettings() {
  const { meta, setMeta } = useProgress();
  const settings: PracticeSettings = { ...DEFAULT_SETTINGS, ...(meta.practice as Partial<PracticeSettings> | undefined) };
  const update = (patch: Partial<PracticeSettings>) => setMeta("practice", { ...settings, ...patch });
  return { ...settings, update };
}

/** Should a wrong answer go back into the queue? `alreadyRetry`: this card is itself a repeat. */
export function shouldRequeue(mode: RepeatMistakes, alreadyRetry: boolean) {
  return mode === "until" || (mode === "once" && !alreadyRetry);
}
