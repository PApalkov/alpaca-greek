import { DexieProgressStore } from "./dexieStore";
import type { ProgressStore } from "./progressStore";

export const store: ProgressStore = new DexieProgressStore();

/** Ask the browser not to evict our data (matters most for Safari on iOS). */
export async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    // Not supported: data still lives in IndexedDB, just without the eviction guarantee.
  }
}

export type { ProgressStore, DayActivity } from "./progressStore";
