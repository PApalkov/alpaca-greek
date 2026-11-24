import { useState } from "react";
import { PageHeader } from "../components/ui";
import { today } from "../lib/dates";
import { isDue } from "../lib/leitner";
import { useMistakes } from "../lib/mistakes";
import { useProgress } from "../lib/progress";
import { href } from "../lib/router";
import { shuffle } from "../lib/random";
import { Session } from "./practice/Session";

/** The personal error bank: every mistake found by an AI review, practised as "fix it" exercises. */
export function MistakesPage() {
  const { mistakes } = useMistakes();
  const { items } = useProgress();
  const on = today();
  const due = mistakes.filter((m) => {
    const s = items.get(`g:${m.id}`);
    return !s || isDue(s, on);
  }).length;

  return (
    <>
      <PageHeader
        title="Мои ошибки"
        subtitle="Ошибки из проверок ИИ: эссе, разговоров и своих текстов. Каждая — упражнение «исправь», они приходят в разминку по графику"
        back={href("course")}
        backLabel="Курс"
        actions={
          mistakes.length > 0 && (
            <a className="btn btn-primary" href={href("mistakes", "practice")}>
              Тренировать{due > 0 && <span className="count">{due}</span>}
            </a>
          )
        }
      />
      {mistakes.length === 0 ? (
        <p className="muted">
          Пока пусто. Ошибки появятся после первой проверки ИИ: в заданиях курса или в разделе «Свой текст на проверку»
        </p>
      ) : (
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Было</th>
                <th>Стало</th>
                <th>Правило</th>
              </tr>
            </thead>
            <tbody>
              {[...mistakes].reverse().map((m) => (
                <tr key={m.id}>
                  <td className="el bad-text">{m.wrong}</td>
                  <td className="el">{m.right}</td>
                  <td className="small">
                    {m.rule}
                    <div className="muted tiny">{m.source}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/** Practice round over personal mistakes: due and new first, 15 at a time. */
export function MistakesPractice() {
  const { items: personal } = useMistakes();
  const { items } = useProgress();
  const pick = () => {
    const on = today();
    const state = (id: string) => items.get(`g:${id}`);
    const due = personal.filter((q) => !state(q.id) || isDue(state(q.id)!, on));
    const rest = personal.filter((q) => !due.includes(q));
    return [...shuffle(due), ...shuffle(rest)].slice(0, 15);
  };
  const [round, setRound] = useState(() => ({ n: 0, items: pick() }));
  return <Session key={round.n} items={round.items} exitHref={href("mistakes")} title="Мои ошибки" onRestart={() => setRound({ n: round.n + 1, items: pick() })} />;
}
