import { days, wordKey } from "../../data/words";
import { LEARNED_BOX } from "../../lib/leitner";
import { useProgress } from "../../lib/progress";
import { href } from "../../lib/router";
import { PageHeader, SpeakButton } from "../../components/ui";
import { WordDetails } from "./WordCard";

export function DayView({ day }: { day: number }) {
  const { items } = useProgress();
  const d = days.find((x) => x.day === day);
  if (!d) return <PageHeader title="Нет такого дня" back={href("words")} />;
  const prev = days.find((x) => x.day === day - 1);
  const next = days.find((x) => x.day === day + 1);

  return (
    <>
      <PageHeader
        title={`День ${d.day}`}
        subtitle={d.topic}
        back={href("words")}
        backLabel="Слова"
        actions={
          <a className="btn btn-primary" href={href("words", "learn", d.day)}>
            Учить этот день
          </a>
        }
      />
      <div className="word-grid">
        {d.words.map((w) => {
          const s = items.get(wordKey(w));
          return (
            <article key={w.id} className="panel word-item">
              <header className="row-between">
                <div>
                  <div className="el word-el">{w.el}</div>
                  <div className="muted small">[{w.tr}]</div>
                </div>
                <div className="row">
                  {s && <span className={`badge ${s.box >= LEARNED_BOX ? "good" : ""}`}>{s.box >= LEARNED_BOX ? "выучено" : `отд. ${s.box}`}</span>}
                  <SpeakButton text={w.el} />
                </div>
              </header>
              <WordDetails word={w} />
            </article>
          );
        })}
      </div>
      <nav className="pager">
        {prev ? <a className="btn" href={href("words", "day", prev.day)}>← День {prev.day}</a> : <span />}
        {next ? <a className="btn" href={href("words", "day", next.day)}>День {next.day} →</a> : <span />}
      </nav>
    </>
  );
}
