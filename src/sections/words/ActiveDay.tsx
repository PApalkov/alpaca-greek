import { useState } from "react";
import { days, wordKey } from "../../data/words";
import { useProgress } from "../../lib/progress";
import { activeDay } from "./wordStats";

/**
 * "Активный день": which plan day the new words come from. Set it by hand when the phone and the Mac
 * are at different days (progress is stored per device). Earlier days not started on this device can
 * be marked as started: their words go to box 1 with reviews spread over two weeks.
 */
export function ActiveDay({ compact = false }: { compact?: boolean }) {
  const { items, meta, setMeta, introduce } = useProgress();
  const current = activeDay(items, meta);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(current?.day ?? 1));
  const [markEarlier, setMarkEarlier] = useState(true);

  const target = Number(value);
  const valid = days.some((d) => d.day === target);
  const missing = valid ? days.filter((d) => d.day < target).flatMap((d) => d.words).filter((w) => !items.has(wordKey(w))).length : 0;

  const save = () => {
    if (!valid) return;
    setMeta("activeDay", target);
    if (markEarlier && missing > 0) introduce(days.filter((d) => d.day < target).flatMap((d) => d.words.map(wordKey)), 14);
    setEditing(false);
  };

  if (!editing)
    return (
      <div className={`active-day ${compact ? "compact" : ""}`}>
        <span>
          <span className="muted">День плана</span> <strong className="tabular">{current?.day ?? "—"}</strong>
          {current && <span className="muted"> · {current.topic}</span>}
        </span>
        <button
          className="link-btn"
          onClick={() => {
            setValue(String(current?.day ?? 1));
            setEditing(true);
          }}
        >
          Изменить
        </button>
      </div>
    );

  return (
    <div className="active-day editing">
      <label className="field-label" htmlFor="active-day">
        С какого дня брать новые слова
      </label>
      <div className="row">
        <input id="active-day" type="number" min={1} max={days.length} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        <button className="btn btn-primary" onClick={save} disabled={!valid}>
          Сохранить
        </button>
        <button className="btn btn-quiet" onClick={() => setEditing(false)}>
          Отмена
        </button>
      </div>
      {valid && missing > 0 && (
        <label className="check">
          <input type="checkbox" checked={markEarlier} onChange={(e) => setMarkEarlier(e.target.checked)} />
          <span>
            Отметить дни 1–{target - 1} как начатые на этом устройстве ({missing} слов в отделение 1, повторения распределятся на 2 недели)
          </span>
        </label>
      )}
      <p className="muted tiny">Прогресс хранится отдельно на каждом устройстве. Если на телефоне и на Mac разные дни — выставь здесь нужный</p>
    </div>
  );
}
