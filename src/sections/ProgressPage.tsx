import { useRef, useState } from "react";
import { PageHeader, ProgressBar, Stat, pct, plural } from "../components/ui";
import { GROUP_TITLE, TOPICS } from "../grammar/questions";
import { addDays, today } from "../lib/dates";
import { BOX_INTERVAL_DAYS } from "../lib/leitner";
import { useProgress } from "../lib/progress";
import { useKeypad, usePracticeSettings, type RepeatMistakes } from "../lib/settings";
import { href } from "../lib/router";
import { store } from "../storage";
import { topicStats } from "./grammar/topicStats";
import { wordCounts } from "./words/wordStats";

type Direction = "el" | "ru" | "mix";
const DIRECTIONS: [Direction, string][] = [
  ["el", "Греческий → русский"],
  ["mix", "Вперемешку"],
  ["ru", "Русский → греческий"],
];

const REPEAT: [RepeatMistakes, string][] = [
  ["none", "Нет"],
  ["once", "Один раз"],
  ["until", "Пока не отвечу верно"],
];

const DAYS = 28;

export function ProgressPage() {
  const { items, activity, meta, setMeta, reload } = useProgress();
  const practice = usePracticeSettings();
  const [keypad, setKeypad] = useKeypad();
  const counts = wordCounts(items);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const on = today();

  const days = Array.from({ length: DAYS }, (_, i) => addDays(on, i - DAYS + 1)).map(
    (d) => activity.find((a) => a.date === d) ?? { date: d, answers: 0, correct: 0 },
  );
  const peak = Math.max(20, ...days.map((d) => d.answers));
  const total = activity.reduce((n, a) => n + a.answers, 0);
  const right = activity.reduce((n, a) => n + a.correct, 0);
  const activeDays = days.filter((d) => d.answers > 0).length;
  const direction = (meta.wordDirection as Direction) ?? "mix";

  const exportFile = async () => {
    const blob = new Blob([await store.exportAll()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `alpaca-greek-${on}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importFile = async (file: File) => {
    try {
      await store.importAll(await file.text());
      await reload();
      setMsg("Прогресс восстановлен из файла");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Не получилось прочитать файл");
    }
  };
  const reset = async () => {
    if (!confirm("Стереть весь прогресс на этом устройстве? Сначала лучше сохранить резервную копию")) return;
    await store.clear();
    await reload();
    setMsg("Прогресс стёрт");
  };

  return (
    <>
      <PageHeader title="Статистика и настройки" subtitle="Что уже закрепилось, где больше всего ошибок, и как устроена практика" />

      <section className="panel">
        <h2 className="panel-title">Практика</h2>
        <div className="settings">
          <label className="setting">
            <span>
              <strong>Вторая попытка</strong>
              <span className="muted small">После ошибки в написанном ответе подсветить неверные буквы и дать исправить. Ответ со второй попытки засчитывается, но слово вернётся раньше</span>
            </span>
            <input type="checkbox" className="switch" checked={practice.secondChance} onChange={(e) => practice.update({ secondChance: e.target.checked })} />
          </label>
          <div className="setting">
            <span>
              <strong>Повторять ошибки в конце раунда</strong>
              <span className="muted small">Слова и задания с ошибкой — в любом случае вернутся в следующих занятиях</span>
            </span>
            <div className="segmented">
              {REPEAT.map(([k, label]) => (
                <button key={k} className={practice.repeatMistakes === k ? "active" : ""} onClick={() => practice.update({ repeatMistakes: k })}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="setting">
            <span>
              <strong>Греческая клавиатура приложения</strong>
              <span className="muted small">Для телефона без греческой раскладки: в ответах вместо системной клавиатуры — своя, с ударением. Настройка этого устройства</span>
            </span>
            <input type="checkbox" className="switch" checked={keypad} onChange={(e) => setKeypad(e.target.checked)} />
          </label>
        </div>
      </section>

      <div className="stats-grid">
        <Stat label="Ответов всего" value={total} />
        <Stat label="Точность" value={pct(total ? right / total : null)} />
        <Stat label={`Дней с занятиями из ${DAYS}`} value={activeDays} />
        <Stat label="Слов выучено" value={counts.learned} note={`в работе ${counts.learning}`} />
      </div>

      <section className="panel">
        <div className="section-head">
          <h2 className="panel-title">Ответы за {DAYS} дней</h2>
          <span className="legend">
            <i className="dot good" /> верно <i className="dot bad" /> ошибки
          </span>
        </div>
        <div className="chart" style={{ gridTemplateColumns: `repeat(${DAYS}, 1fr)` }}>
          {days.map((d) => (
            <div key={d.date} className="chart-col" title={`${d.date}: ${d.correct} из ${d.answers}`}>
              <div className="chart-stack" style={{ height: `${(d.answers / peak) * 100}%` }}>
                <div className="chart-bad" style={{ flex: d.answers - d.correct }} />
                <div className="chart-good" style={{ flex: d.correct }} />
              </div>
            </div>
          ))}
        </div>
        <div className="chart-axis muted tiny">
          <span>{days[0].date.slice(5).split("-").reverse().join(".")}</span>
          <span>сегодня</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Грамматика по темам</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Тема</th>
                <th className="num">Пройдено</th>
                <th className="num">Уверенно</th>
                <th className="num">Точность</th>
                <th className="num">К повтору</th>
              </tr>
            </thead>
            <tbody>
              {TOPICS.map((t) => {
                const s = topicStats(t, items, on);
                return (
                  <tr key={t.id}>
                    <td>
                      <a className="text-link" href={href("grammar", t.id)}>{t.title}</a>
                      <div className="muted tiny">{GROUP_TITLE[t.group]}</div>
                    </td>
                    <td className="num">
                      {s.seen}/{s.total}
                      <ProgressBar value={s.seen} max={s.total} />
                    </td>
                    <td className="num">{s.solid}</td>
                    <td className={`num ${s.accuracy !== null && s.accuracy < 0.7 ? "bad-text" : ""}`}>{pct(s.accuracy)}</td>
                    <td className="num">{s.due}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Слова в коробке Лейтнера</h2>
        <div className="boxes">
          {counts.boxes.map((n, i) => (
            <div key={i} className={`box ${i === 5 ? "learned" : ""}`}>
              <span className="box-num tabular">{n}</span>
              <span className="muted tiny">{i === 5 ? "выучено" : `отд. ${i + 1} · раз в ${BOX_INTERVAL_DAYS[i + 1]} дн.`}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="two-col even">
        <section className="panel">
          <h2 className="panel-title">Карточки слов</h2>
          <p className="muted small">В каком направлении спрашивать при повторении</p>
          <div className="segmented">
            {DIRECTIONS.map(([k, label]) => (
              <button key={k} className={direction === k ? "active" : ""} onClick={() => setMeta("wordDirection", k)}>
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Резервная копия</h2>
          <p className="muted small">
            Прогресс хранится только на этом устройстве ({total} {plural(total, "ответ", "ответа", "ответов")}). Сохрани файл, чтобы перенести его или не потерять
          </p>
          <div className="row wrap">
            <button className="btn btn-small" onClick={exportFile}>Сохранить файл</button>
            <button className="btn btn-small" onClick={() => fileRef.current?.click()}>Загрузить</button>
            <button className="btn btn-small btn-danger" onClick={reset}>Стереть всё</button>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
          {msg && <p className="small">{msg}</p>}
        </section>
      </div>

      <section className="panel subtle">
        <h2 className="panel-title">Установить как приложение</h2>
        <p className="muted small">
          iPhone: Safari → «Поделиться» → «На экран Домой». Mac: Safari → «Файл» → «Добавить в Dock». Установленное приложение работает без интернета, а iOS не стирает его данные
        </p>
      </section>
    </>
  );
}
