import { useSyncExternalStore } from "react";
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

// ---------- choices of this device (not of the learner's progress): kept in localStorage ----------

function deviceSetting(key: string) {
  const listeners = new Set<() => void>();
  const read = () => {
    try {
      return localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  };
  const write = (value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage blocked: the choice lasts until the page closes.
    }
    listeners.forEach((cb) => cb());
  };
  const subscribe = (cb: () => void) => (listeners.add(cb), () => void listeners.delete(cb));
  /** The stored value, or "" while nothing has been chosen. */
  const use = () => useSyncExternalStore(subscribe, read, () => "");
  return { use, write };
}

const keypadSetting = deviceSetting("alpaca.keypad");

/**
 * Whether the app's own Greek keypad replaces the system keyboard on touch screens. Off by default:
 * the phone's own keyboard (Greek or with a Greek layout added) is better when it exists.
 */
export function useKeypad(): [on: boolean, set: (on: boolean) => void, chosen: boolean] {
  const value = keypadSetting.use();
  return [value === "on", (on) => keypadSetting.write(on ? "on" : "off"), value !== ""];
}

const sidebarSetting = deviceSetting("alpaca.sidebar");

/** The desktop side menu folded to icons. */
export function useSidebarCollapsed(): [collapsed: boolean, set: (collapsed: boolean) => void] {
  const value = sidebarSetting.use();
  return [value === "collapsed", (c) => sidebarSetting.write(c ? "collapsed" : "open")];
}

export const isTouch = () => typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
