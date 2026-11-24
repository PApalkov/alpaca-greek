import { useState } from "react";
import { Alpaca } from "../components/Alpaca";
import { ArrowIcon } from "../components/Icons";
import { Scene } from "../components/Scene";
import { plural } from "../components/ui";
import { href } from "../lib/router";
import { lessonEpoch, lessonNumber } from "../program";
import { useAllEpochs } from "../program/useContent";
import type { Lesson } from "../program/types";
import { useCourse } from "./lesson/useLesson";

const dateLabel = () => new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

const STEP_NAMES: Record<string, string> = {
  words: "Слова",
  dialogue: "Диалог",
  reading: "Текст",
  grammar: "Грамматика",
  practice: "Практика",
  write: "Письмо",
  essay: "Эссе · ИИ",
  speak: "Разговор · ИИ",
};

const TYPE_TITLE: Record<string, string> = { core: "Урок", practice: "Практикум", task: "Задание", test: "Тест" };

/** About 25 minutes: words 45 s each, practice 35 s per exercise, the rest fixed. */
function estimate(lesson: Lesson, warmup: number) {
  const words = lesson.words.length + (lesson.extraWords?.length ?? 0);
  const ex = lesson.steps.reduce((n, s) => n + (s.kind === "practice" ? s.exercises.length : 0), 0);
  const fixed = lesson.steps.reduce(
    (n, s) => n + (s.kind === "write" ? 5 : s.kind === "grammar" ? 3 : s.kind === "dialogue" || s.kind === "reading" ? 4 : s.kind === "essay" ? 25 : s.kind === "speak" ? 15 : 0),
    0,
  );
  return Math.round((words * 45 + ex * 35) / 60 + fixed + warmup);
}

/** Today: one lesson that mixes words, grammar and writing. Everything else is in the menu. */
export function Home() {
  const { course, current, doneToday, warmupWords, warmupItems, setCurrent } = useCourse();
  const [picking, setPicking] = useState(false);
  // The lesson picker lists every written epoch: load them only when it opens.
  const { epochs: EPOCHS } = useAllEpochs(picking);
  const warmup = warmupWords.length + warmupItems.length;
  const warmupMin = Math.round((warmupWords.length * 10 + warmupItems.length * 30) / 60);

  if (!current)
    return (
      <div className="today">
        <Alpaca size={96} mood="happy" />
        <h1>Все уроки пройдены</h1>
        <p className="page-subtitle">Новый раздел появится, когда его сгенерируют. Пока — повторение в разделе «Слова» и «Грамматика»</p>
      </div>
    );

  const epoch = lessonEpoch(current.id)!;
  const resuming = course.resume?.id === current.id;
  const finishedToday = doneToday.length > 0;
  const kinds = [...new Set(current.steps.map((s) => s.kind))];

  return (
    <div className="today">
      <p className="muted today-date">{dateLabel()}</p>

      {finishedToday && (
        <div className="done-banner">
          <Alpaca size={44} mood="happy" />
          <div>
            <strong>Сегодняшний урок пройден: {doneToday.map((l) => l.title).join(", ")}</strong>
            <p className="muted small">Следующий лучше завтра: новое запоминается после сна. Но если хочется — можно продолжить</p>
          </div>
        </div>
      )}

      <article className="lesson-card">
        <div className="lesson-art">
          <Scene variant={current.scene} height={240} />
        </div>
        <div className="lesson-body">
          <p className="lesson-meta">
            {TYPE_TITLE[current.type ?? "core"]} {lessonNumber(current.id)} · {epoch.titleRu} · {epoch.level}
          </p>
          <h1 className="lesson-title el">{current.title}</h1>
          <p className="lesson-sub">{current.titleRu}</p>
          <p className="lead-ru">{current.goal}</p>

          <ol className="lesson-steps">
            {warmup > 0 && !resuming && <li>Разминка · {warmup}</li>}
            {kinds.map((k) => (
              <li key={k}>{STEP_NAMES[k]}</li>
            ))}
          </ol>

          <a className={`btn btn-large ${finishedToday ? "" : "btn-primary"}`} href={href("lesson", current.id)}>
            {resuming ? "Продолжить урок" : finishedToday ? "Начать следующий урок" : "Начать урок"} <ArrowIcon size={18} />
          </a>
          <p className="muted small">
            примерно {estimate(current, resuming ? 0 : warmupMin)} мин
            {warmup > 0 && !resuming && ` · в разминке ${warmupWords.length} ${plural(warmupWords.length, "слово", "слова", "слов")} и ${warmupItems.length} ${plural(warmupItems.length, "задание", "задания", "заданий")} из прошлых уроков`}
          </p>
        </div>
      </article>

      <div className="active-day compact">
        {picking ? (
          <label className="row wrap">
            <span className="muted">Текущий урок</span>
            <select
              value={current.id}
              onChange={(e) => {
                setCurrent(e.target.value);
                setPicking(false);
              }}
            >
              {EPOCHS.map((e) => (
                <optgroup key={e.id} label={`${e.level} · ${e.titleRu}`}>
                  {e.lessons.map((l, i) => (
                    <option key={l.id} value={l.id}>
                      {i + 1}. {l.title}
                      {course.done[l.id] ? " ✓" : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        ) : (
          <span>
            <span className="muted">Раздел {epoch.level}, урок</span> <strong className="tabular">{lessonNumber(current.id)}</strong>
            <span className="muted"> из {epoch.lessons.length}</span>
          </span>
        )}
        <button className="link-btn" onClick={() => setPicking((p) => !p)}>
          {picking ? "Отмена" : "Изменить"}
        </button>
      </div>
    </div>
  );
}
