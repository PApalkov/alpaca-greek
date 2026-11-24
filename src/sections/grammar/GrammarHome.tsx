import { PageHeader, ProgressBar, pct } from "../../components/ui";
import { GROUP_TITLE, TOPICS, type TopicGroup } from "../../grammar/questions";
import { today } from "../../lib/dates";
import { useProgress } from "../../lib/progress";
import { href } from "../../lib/router";
import { grammarDue, topicStats } from "./topicStats";

const KIND_NOTE: Record<string, string> = {
  gender: "выбор",
  plural: "выбор → ввод",
  acc: "выбор → ввод",
  gen: "выбор → ввод",
  sent: "выбор → ввод",
  build: "сборка фразы",
  spot: "поиск ошибки",
  present: "выбор → ввод",
};

export function GrammarHome() {
  const { items } = useProgress();
  const on = today();
  const due = grammarDue(items, on);
  const groups = (Object.keys(GROUP_TITLE) as TopicGroup[]).map((g) => ({ g, topics: TOPICS.filter((t) => t.group === g) }));

  return (
    <>
      <PageHeader
        title="Грамматика"
        subtitle="Сначала выбираешь из вариантов, а когда форма закрепилась — пишешь её сам"
        actions={
          <a className="btn btn-primary" href={href("practice")}>
            Смешанная практика{due > 0 && <span className="count">{due}</span>}
          </a>
        }
      />

      {groups.map(({ g, topics }) => (
        <section key={g}>
          <h2 className="section-title">{GROUP_TITLE[g]}</h2>
          <div className="topic-list">
            {topics.map((t) => {
              const s = topicStats(t, items, on);
              return (
                <div key={t.id} className="topic-row">
                  <a className="topic-main" href={href("grammar", t.id)}>
                    <span className="topic-title">
                      <strong>{t.title}</strong>
                      {s.due > 0 && <span className="count">{s.due}</span>}
                    </span>
                    <span className="muted small">
                      <span className="el">{t.subtitle}</span> · {KIND_NOTE[t.id]}
                    </span>
                  </a>
                  <div className="topic-meter">
                    <ProgressBar value={s.solid} max={s.total} tone="good" />
                    <span className="muted tiny tabular">
                      {s.solid}/{s.total} · {pct(s.accuracy)}
                    </span>
                  </div>
                  <a className="btn btn-small" href={href("grammar", t.id, "drill")}>
                    Тренировать
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <a className="topic-row link-row" href={href("mistakes")}>
        <span className="topic-main">
          <strong>Мои ошибки</strong>
          <span className="muted small">ошибки из проверок ИИ: эссе, разговоров и своих текстов — как упражнения «исправь»</span>
        </span>
      </a>

      <a className="topic-row link-row" href={href("grammar", "tables")}>
        <span className="topic-main">
          <strong>Таблицы склонения</strong>
          <span className="muted small">все существительные из домашних заданий, по родам</span>
        </span>
      </a>
    </>
  );
}
