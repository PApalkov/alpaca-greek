import { useState } from "react";
import { PageHeader, ProgressBar, plural } from "../../components/ui";
import { days, wordKey } from "../../data/words";
import { today } from "../../lib/dates";
import { LEARNED_BOX } from "../../lib/leitner";
import { useProgress } from "../../lib/progress";
import { href } from "../../lib/router";
import { ActiveDay } from "./ActiveDay";
import { activeDay, dayStatus, dueWords, wordCounts, type DayStatus } from "./wordStats";

const FILTERS: [DayStatus | "all", string][] = [
  ["all", "Все"],
  ["learning", "Учу"],
  ["new", "Новые"],
  ["learned", "Выучены"],
];

export function WordsHome() {
  const { items, meta } = useProgress();
  const due = dueWords(items, today()).length;
  const next = activeDay(items, meta);
  const counts = wordCounts(items);
  const [filter, setFilter] = useState<DayStatus | "all">("all");

  const shown = days
    .map((d) => ({ ...d, status: dayStatus(d.words, items) }))
    .filter((d) => filter === "all" || d.status === filter);

  return (
    <>
      <PageHeader
        title="Слова"
        subtitle={`Выучено ${counts.learned} из ${counts.total}, в работе ${counts.learning}`}
        actions={
          <>
            {next && (
              <a className="btn" href={href("words", "learn", next.day)}>
                Новый день {next.day}
              </a>
            )}
            <a className="btn btn-primary" href={href("words", "review")}>
              Повторить{due > 0 && <span className="count">{due}</span>}
            </a>
          </>
        }
      />

      <ActiveDay />

      <section>
        <div className="section-head">
          <h2 className="section-title">План по дням</h2>
          <div className="segmented" role="tablist">
            {FILTERS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? "active" : ""} onClick={() => setFilter(k)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="day-grid">
          {shown.map((d) => {
            const started = d.words.filter((w) => items.has(wordKey(w))).length;
            const learned = d.words.filter((w) => (items.get(wordKey(w))?.box ?? 0) >= LEARNED_BOX).length;
            return (
              <a key={d.day} className={`day-card ${d.status} ${next?.day === d.day ? "active" : ""}`} href={href("words", "day", d.day)}>
                <span className="day-num tabular">{d.day}</span>
                <span className="day-topic">{d.topic}</span>
                <span className="muted tiny">
                  {d.words.length} {plural(d.words.length, "слово", "слова", "слов")}
                </span>
                <ProgressBar value={learned + (started - learned) / 3} max={d.words.length} tone="good" />
              </a>
            );
          })}
          {shown.length === 0 && <p className="muted">Здесь пока пусто</p>}
        </div>
      </section>
    </>
  );
}
