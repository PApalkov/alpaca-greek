import { useEffect, useState } from "react";
import { Alpaca } from "../../components/Alpaca";
import { Scene } from "../../components/Scene";
import { StepMenuContext } from "../../components/StepMenu";
import { plural } from "../../components/ui";
import { go, href } from "../../lib/router";
import { wordKey } from "../../data/words";
import { useProgress } from "../../lib/progress";
import { LESSON, lessonEpoch, lessonNumber, lessonWords, practiceItems } from "../../program";
import type { Step } from "../../program/types";
import { Session } from "../practice/Session";
import { Flashcards } from "../words/Review";
import { EssayStep, GrammarStep, SpeakStep, StepFrame, TextStep, WordsStep, WriteStep } from "./LessonBlock";
import { useCourse } from "./useLesson";

type Part = { kind: "warm-words" } | { kind: "warm-items" } | { kind: "step"; index: number } | { kind: "finish" };

const STEP_LABEL: Record<Step["kind"], string> = {
  words: "Новые слова",
  dialogue: "Диалог",
  reading: "Текст",
  grammar: "Грамматика",
  practice: "Практика",
  write: "Письмо",
  essay: "Сочинение (проверка ИИ)",
  speak: "Разговор с ИИ",
};

function partLabel(part: Part, steps: Step[]): string {
  if (part.kind === "warm-words") return "Разминка: слова";
  if (part.kind === "warm-items") return "Разминка: упражнения";
  if (part.kind === "finish") return "Итог урока";
  const step = steps[part.index];
  const title = "title" in step && step.title ? step.title : "";
  return title && step.kind !== "words" ? `${STEP_LABEL[step.kind]}: ${title}` : STEP_LABEL[step.kind];
}

/**
 * One lesson as a single flow: warm-up (due cards and exercises from earlier lessons), then the
 * lesson's own steps, then the finish screen. Leaving mid-lesson remembers the step. The «Шаги» menu
 * opens any step in any order (grammar before the words, writing first…); the lesson is complete
 * when the finish screen is reached.
 */
export function LessonPlayer({ id }: { id: string }) {
  const lesson = LESSON.get(id);
  const { course, warmupWords, warmupItems, complete, setResume, saveWriting } = useCourse();
  // Snapshot when the lesson opens: answering changes what is due.
  const [warm] = useState(() => ({ words: warmupWords, items: warmupItems }));
  const [resumeAt] = useState(() => (course.resume?.id === id ? Math.min(course.resume.step, (lesson?.steps.length ?? 1) - 1) : 0));
  const [parts] = useState<Part[]>(() => {
    if (!lesson) return [];
    const steps: Part[] = lesson.steps.map((_, index) => ({ kind: "step" as const, index }));
    const warmup: Part[] = resumeAt > 0 ? [] : [...(warm.words.length ? [{ kind: "warm-words" as const }] : []), ...(warm.items.length ? [{ kind: "warm-items" as const }] : [])];
    return [...warmup, ...steps, { kind: "finish" }];
  });
  // Resuming: the steps before the remembered one count as done.
  const [pos, setPos] = useState(() => parts.findIndex((p) => p.kind === "step" && p.index === resumeAt));
  const [done, setDone] = useState(() => new Set(parts.flatMap((p, i) => (p.kind === "step" && p.index < resumeAt ? [i] : []))));
  const [words] = useState(() => (lesson ? lessonWords(lesson) : []));

  useEffect(() => {
    if (!lesson) go("course");
  }, [lesson]);
  if (!lesson) return null;

  const part = parts[pos];
  const exit = href();
  const frame = { exit, index: pos, total: parts.length, title: `Урок ${lessonNumber(id)} · ${lesson.title}` };
  const open = (to: number) => {
    const target = parts[to];
    if (target?.kind === "step") setResume(id, target.index);
    setPos(to);
    window.scrollTo(0, 0);
  };
  // «Дальше» marks this part done and opens the next part after it that is not done yet; skipped
  // earlier parts stay open in the menu. The finish screen is always last.
  const next = () => {
    const nowDone = new Set(done).add(pos);
    setDone(nowDone);
    const following = parts.findIndex((_, i) => i > pos && !nowDone.has(i));
    open(following >= 0 ? following : parts.length - 1);
  };
  const pause = () => {
    if (part.kind === "step") setResume(id, part.index + 1);
    go();
  };

  const menu = {
    steps: parts.filter((p) => p.kind !== "finish").map((p) => ({ label: partLabel(p, lesson.steps), done: done.has(parts.indexOf(p)) })),
    current: Math.min(pos, parts.length - 2),
    jump: open,
  };
  return <StepMenuContext.Provider value={part.kind === "finish" ? null : menu}>{screen()}</StepMenuContext.Provider>;

  function screen() {
  if (!lesson) return null;
  if (part.kind === "warm-words")
    return <Flashcards words={warm.words} record exit={exit} title={`${frame.title} · разминка: слова`} onDone={next} />;
  if (part.kind === "warm-items")
    return <Session items={warm.items} exitHref={exit} title={`${frame.title} · разминка`} next={{ label: "Дальше: новый материал", onClick: next, pause }} />;
  if (part.kind === "finish") return <Finish lessonId={id} newWords={words.length} wordKeys={words.map(wordKey)} onComplete={complete} />;

  const step = lesson.steps[part.index];
  switch (step.kind) {
    case "words":
      return <WordsStep frame={frame} words={words} onDone={next} />;
    case "dialogue":
    case "reading":
      return <TextStep key={part.index} frame={frame} step={step} onDone={next} />;
    case "grammar":
      return <GrammarStep key={part.index} frame={frame} step={step} onDone={next} />;
    case "practice":
      return (
        <Session
          key={part.index}
          items={practiceItems(lesson, part.index)}
          exitHref={exit}
          title={`${frame.title} · ${step.title}`}
          next={{ label: "Дальше", onClick: next, pause }}
        />
      );
    case "write":
      return <WriteStep frame={frame} step={step} saved={course.writing[id] ?? ""} onSave={(t) => saveWriting(id, t)} onDone={next} />;
    case "essay": {
      const key = `${id}#${part.index}`;
      return (
        <EssayStep
          key={part.index}
          frame={frame}
          step={step}
          level={lessonEpoch(id)?.level ?? "A1"}
          lessonTitle={`Урок ${lessonNumber(id)} · ${lesson.title}`}
          reviewKey={key}
          saved={course.writing[key] ?? ""}
          onSave={(t) => saveWriting(key, t)}
          onDone={next}
        />
      );
    }
    case "speak":
      return <SpeakStep key={part.index} frame={frame} step={step} level={lessonEpoch(id)?.level ?? "A1"} reviewKey={`${id}#${part.index}`} onDone={next} />;
  }
  }
}

function Finish({ lessonId, newWords, wordKeys, onComplete }: { lessonId: string; newWords: number; wordKeys: string[]; onComplete: (id: string) => void }) {
  const lesson = LESSON.get(lessonId)!;
  const { introduce } = useProgress();
  // Recorded as soon as the finish screen shows, even if the page is closed right after. Words
  // skipped through the step menu still go into the box (words already there are left alone).
  useEffect(() => {
    introduce(wordKeys);
    onComplete(lessonId);
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <StepFrame
      exit={href()}
      index={1}
      total={1}
      title={`Урок ${lessonNumber(lessonId)} · ${lesson.title}`}
      label="Урок пройден"
      actions={
        <a className="btn btn-primary" href={href()}>
          Готово
        </a>
      }
    >
      <div className="finish-art">
        <Scene variant={lesson.scene} height={200} />
        <span className="finish-alpaca">
          <Alpaca size={72} mood="happy" />
        </span>
      </div>
      <h2 className="lesson-title el">{lesson.title}</h2>
      <p className="lead-ru">{lesson.goal}</p>
      <p className="muted">
        {newWords > 0 && `${newWords} ${plural(newWords, "новое слово", "новых слова", "новых слов")} в коробке: первое повторение завтра, в разминке. `}
        Ошибки из практики тоже вернутся в разминке.
      </p>
    </StepFrame>
  );
}
