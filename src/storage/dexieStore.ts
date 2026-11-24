import Dexie, { type Table } from "dexie";
import type { ItemState } from "../lib/leitner";
import type { DayActivity, ProgressBackup, ProgressStore } from "./progressStore";

class AlpacaDb extends Dexie {
  items!: Table<ItemState, string>;
  meta!: Table<{ key: string; value: unknown }, string>;
  activity!: Table<DayActivity, string>;

  constructor() {
    super("alpaca-greek");
    this.version(1).stores({ items: "key, due, box", meta: "key", activity: "date" });
  }
}

export class DexieProgressStore implements ProgressStore {
  private db = new AlpacaDb();

  loadItems() {
    return this.db.items.toArray();
  }

  async saveItems(items: ItemState[]) {
    await this.db.items.bulkPut(items);
  }

  async loadMeta() {
    const rows = await this.db.meta.toArray();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async saveMeta(key: string, value: unknown) {
    await this.db.meta.put({ key, value });
  }

  loadActivity() {
    return this.db.activity.orderBy("date").toArray();
  }

  async saveActivity(day: DayActivity) {
    await this.db.activity.put(day);
  }

  async exportAll() {
    const backup: ProgressBackup = {
      app: "alpaca-greek",
      version: 1,
      exportedAt: new Date().toISOString(),
      items: await this.loadItems(),
      meta: await this.loadMeta(),
      activity: await this.loadActivity(),
    };
    return JSON.stringify(backup);
  }

  async importAll(json: string) {
    const data = JSON.parse(json) as ProgressBackup;
    if (data.app !== "alpaca-greek" || data.version !== 1) throw new Error("Это не файл прогресса Alpaca Greek");
    await this.db.transaction("rw", this.db.items, this.db.meta, this.db.activity, async () => {
      await this.clear();
      await this.db.items.bulkPut(data.items);
      await this.db.meta.bulkPut(Object.entries(data.meta).map(([key, value]) => ({ key, value })));
      await this.db.activity.bulkPut(data.activity);
    });
  }

  async clear() {
    await Promise.all([this.db.items.clear(), this.db.meta.clear(), this.db.activity.clear()]);
  }
}
