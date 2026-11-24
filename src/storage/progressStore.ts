import type { DateStr } from "../lib/dates";
import type { ItemState } from "../lib/leitner";

export interface DayActivity {
  date: DateStr;
  answers: number;
  correct: number;
}

/**
 * Everything the app remembers about the learner. UI code talks only to this interface,
 * so the backing store can change (IndexedDB today; Capacitor SQLite or a sync backend later).
 */
export interface ProgressStore {
  loadItems(): Promise<ItemState[]>;
  saveItems(items: ItemState[]): Promise<void>;
  loadMeta(): Promise<Record<string, unknown>>;
  saveMeta(key: string, value: unknown): Promise<void>;
  loadActivity(): Promise<DayActivity[]>;
  saveActivity(day: DayActivity): Promise<void>;
  exportAll(): Promise<string>;
  importAll(json: string): Promise<void>;
  clear(): Promise<void>;
}

export interface ProgressBackup {
  app: "alpaca-greek";
  version: 1;
  exportedAt: string;
  items: ItemState[];
  meta: Record<string, unknown>;
  activity: DayActivity[];
}
