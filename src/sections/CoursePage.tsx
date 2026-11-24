import { CheckIcon } from "../components/Icons";
import { PageHeader } from "../components/ui";
import { useMistakes } from "../lib/mistakes";
import { href } from "../lib/router";
import { CURRICULUM } from "../program";
import { useAllEpochs } from "../program/useContent";
import type { LessonType } from "../program/types";
import { useCourse } from "./lesson/useLesson";

export const TYPE_LABEL: Record<LessonType, string> = { core: "урок", practice: "практикум", task: "задание · ИИ", test: "тест" };

/** The whole road to A2: written epochs with their lessons, planned epochs as an outline. */
export function CoursePage() {
  const { course, current } = useCourse();
  const { mistakes } = useMistakes();
  // The course map shows every written epoch, so it loads them all; the outline shows until they arrive.
  const { epochs: EPOCHS } = useAllEpochs();
  const writingFor = (id: string) => Object.entries(course.writing).filter(([k]) => k === id || k.startsWith(`${id}#`)).map(([, t]) => t).filter(Boolean);
  return (
    <>
      <PageHeader
        title="Курс"
        subtitle="Восемь эпох по 20 уроков до экзамена Ελληνομάθεια A2. Один урок в день: слова, диалог, грамматика, практика; задания и тесты проверяет ИИ"
        actions={
          <>
            <a className="btn" href={href("mistakes")}>
              Мои ошибки{mistakes.length > 0 && <span className="count">{mistakes.length}</span>}
            </a>
            <a className="btn" href={href("write")}>
              Свой текст на проверку
            </a>
          </>
        }
      />
      {CURRICULUM.map((plan) => {
        const epoch = EPOCHS.find((e) => e.id === plan.id);
        const done = epoch ? epoch.lessons.filter((l) => course.done[l.id]).length : 0;
        // A partly written epoch: written lessons, then the rest of the plan.
        const planned = epoch ? plan.lessons.slice(epoch.lessons.length) : plan.lessons;
        return (
          <section key={plan.id} className={`epoch ${epoch ? "" : "planned"}`}>
            <header className="epoch-head">
              <span className="epoch-level">{plan.level}</span>
              <div>
                <h2 className="el">{plan.title}</h2>
                <p className="muted small">
                  {plan.titleRu} · {plan.summary}
                </p>
              </div>
              <span className="muted small tabular">
                {epoch ? `${done}/${plan.lessons.length}${planned.length ? ` · готово ${epoch.lessons.length}` : ""}` : "готовится"}
              </span>
            </header>
            <ol className="epoch-lessons">
              {epoch &&
                epoch.lessons.map((l, li) => {
                    const isDone = !!course.done[l.id];
                    const isCurrent = current?.id === l.id;
                    const texts = writingFor(l.id);
                    return (
                      <li key={l.id}>
                        <a className={`epoch-lesson ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`} href={href("lesson", l.id)}>
                          <span className="task-mark">{isDone ? <CheckIcon size={14} /> : li + 1}</span>
                          <span className="task-text">
                            <strong className="el">{l.title}</strong>
                            <span className="muted small">{l.titleRu}</span>
                          </span>
                          {(l.type ?? "core") !== "core" && <span className={`type-badge ${l.type}`}>{TYPE_LABEL[l.type!]}</span>}
                        </a>
                        {texts.map((t, i) => (
                          <p key={i} className="writing-saved el">
                            {t}
                          </p>
                        ))}
                      </li>
                    );
                  })}
              {planned.map((l, i) => (
                    <li key={`plan-${i}`}>
                      <div className="epoch-lesson planned">
                        <span className="task-mark">{(epoch?.lessons.length ?? 0) + i + 1}</span>
                        <span className="task-text">
                          <strong className="el">{l.title}</strong>
                          <span className="muted small">
                            {l.theme} · {l.grammar}
                          </span>
                        </span>
                        {l.type !== "core" && <span className={`type-badge ${l.type}`}>{TYPE_LABEL[l.type]}</span>}
                      </div>
                    </li>
                  ))}
            </ol>
          </section>
        );
      })}
    </>
  );
}
