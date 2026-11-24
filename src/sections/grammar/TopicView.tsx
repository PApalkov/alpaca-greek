import { PageHeader, Stat, pct } from "../../components/ui";
import { TOPIC, questionKey, type Item, type RuleBlock } from "../../grammar/questions";
import { today } from "../../lib/dates";
import { useProgress } from "../../lib/progress";
import { href } from "../../lib/router";
import { topicQuestions, topicStats } from "./topicStats";

/** The correct Greek for any item kind, for "most frequent mistakes" lists. */
export function itemAnswer(q: Item): string {
  switch (q.kind) {
    case "choice":
      return q.say ?? q.answer;
    case "build":
      return q.answer;
    case "spot":
      return q.fix;
    case "translate":
      return q.answers[0];
    case "listen":
      return q.el;
    case "choose":
      return q.answer;
  }
}

export function Rules({ blocks }: { blocks: RuleBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.kind === "p" ? (
          <p key={i}>{b.text}</p>
        ) : b.kind === "ex" ? (
          <p key={i} className="example">
            <span className="el">{b.el}</span> <span className="muted">— {b.ru}</span>
          </p>
        ) : (
          <div key={i} className="table-wrap">
            <table>
              <thead>
                <tr>{b.head.map((h, k) => <th key={k}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {b.rows.map((r, j) => (
                  <tr key={j}>{r.map((c, k) => <td key={k} className={k > 0 ? "el" : ""}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      )}
    </>
  );
}

export function TopicView({ id }: { id: string }) {
  const { items } = useProgress();
  const t = TOPIC.get(id);
  if (!t) return <PageHeader title="Нет такой темы" back={href("grammar")} />;
  const on = today();
  const s = topicStats(t, items, on);
  const hardest = topicQuestions(t)
    .map((q) => ({ q, st: items.get(questionKey(q)) }))
    .filter((x) => x.st && x.st.seen > x.st.correct)
    .sort((a, b) => b.st!.seen - b.st!.correct - (a.st!.seen - a.st!.correct))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title={t.title}
        subtitle={<span className="el">{t.subtitle}</span>}
        back={href("grammar")}
        backLabel="Грамматика"
        actions={
          <a className="btn btn-primary" href={href("grammar", t.id, "drill")}>
            Тренировать · 10
          </a>
        }
      />
      <div className="stats-grid">
        <Stat label="Пройдено" value={`${s.seen}/${s.total}`} />
        <Stat label="Уверенно" value={s.solid} note="верно 2+ раза подряд" />
        <Stat label="Точность" value={pct(s.accuracy)} />
        <Stat label="К повтору" value={s.due} />
      </div>
      <div className={hardest.length ? "two-col" : "rules-col"}>
        <div className="stack">
          {t.rules.map((r) => (
            <section key={r.title} className="panel rules">
              <h2 className="panel-title">{r.title}</h2>
              <Rules blocks={r.blocks} />
            </section>
          ))}
        </div>
        {hardest.length > 0 && (
          <aside className="panel">
            <h2 className="panel-title">Чаще всего ошибаешься</h2>
            {hardest.map(({ q, st }) => (
              <div key={q.id} className="review-row">
                <div className="el">{itemAnswer(q)}</div>
                <div className="muted tiny">
                  ошибок {st!.seen - st!.correct} из {st!.seen}
                </div>
              </div>
            ))}
          </aside>
        )}
      </div>
    </>
  );
}
