import { useEffect, useState, type ReactNode } from "react";
import { AiReview, countWords } from "../../components/AiReview";
import { GreekInput } from "../../components/GreekInput";
import { SpeakerIcon } from "../../components/Icons";
import { SpeakButton } from "../../components/ui";
import { wordKey, type Word } from "../../data/words";
import { fixFinalSigma } from "../../lib/greek";
import { useProgress } from "../../lib/progress";
import { speak, speakAll, stopSpeaking } from "../../lib/speech";
import { essayPrompt, speakPrompt } from "../../program/aiPrompts";
import type { Step, WriteHint } from "../../program/types";
import { Rules } from "../grammar/TopicView";
import { FocusTop } from "../practice/Session";
import { WordDetails } from "../words/WordCard";

/** The frame every lesson step shares: lesson progress on top, content, actions at the bottom. */
export function StepFrame({
  exit,
  index,
  total,
  title,
  label,
  children,
  actions,
}: {
  exit: string;
  index: number;
  total: number;
  title: string;
  label: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="focus lesson">
      <FocusTop exitHref={exit} value={index} max={total} label={`${index + 1} / ${total}`} title={title} />
      <div className="focus-body">
        <span className="step-label">{label}</span>
        {children}
      </div>
      <div className="focus-actions">{actions}</div>
    </div>
  );
}

type Frame = { exit: string; index: number; total: number; title: string };

/** New words, one card at a time; at the end they go into box 1 of the Leitner box. */
export function WordsStep({ frame, words, onDone }: { frame: Frame; words: Word[]; onDone: () => void }) {
  const { introduce } = useProgress();
  const [i, setI] = useState(0);
  const w = words[i];
  const last = i === words.length - 1;
  const finish = () => {
    introduce(words.map(wordKey));
    onDone();
  };

  useEffect(() => {
    const t = setTimeout(() => w && speak(w.el), 250);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") (last ? finish() : setI(i + 1));
      if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  });

  if (!w) return null;
  return (
    <StepFrame
      {...frame}
      label={`Новые слова · ${i + 1} из ${words.length}`}
      actions={
        <>
          <button className="btn btn-quiet" disabled={i === 0} onClick={() => setI(i - 1)}>
            Назад
          </button>
          <button className="btn btn-primary" onClick={last ? finish : () => setI(i + 1)}>
            {last ? "Дальше: в контексте" : "Следующее слово"} <kbd>→</kbd>
          </button>
        </>
      }
    >
      <div className="word-hero" key={i}>
        <div className="row">
          <p className="word-big el">{w.el}</p>
          <SpeakButton text={w.el} size={26} />
        </div>
        <p className="muted big-tr">[{w.tr}]</p>
        <WordDetails word={w} />
      </div>
    </StepFrame>
  );
}

/** A dialogue or a reading text: Greek first, translation on tap; can be played aloud as a whole. */
export function TextStep({ frame, step, onDone }: { frame: Frame; step: Extract<Step, { kind: "dialogue" | "reading" }>; onDone: () => void }) {
  const lines = step.kind === "dialogue" ? step.lines : step.text.map((t) => ({ who: "", ...t }));
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [all, setAll] = useState(false);
  const [playing, setPlaying] = useState(-1);
  // Listening comprehension: the text appears only after listening (or on request).
  const [hidden, setHidden] = useState(!!step.listenFirst);
  useEffect(() => stopSpeaking, []);
  const playAll = () =>
    speakAll(
      lines.map((l) => l.el),
      (i) => {
        setPlaying(i);
        if (i === -1) setHidden(false);
      },
    );

  const toggle = (i: number) => setShown((s) => new Set(s.has(i) ? [...s].filter((x) => x !== i) : [...s, i]));
  return (
    <StepFrame
      {...frame}
      label={step.listenFirst ? "Аудирование" : step.kind === "dialogue" ? "Диалог" : "Текст"}
      actions={
        <button className="btn btn-primary" onClick={onDone}>
          Дальше
        </button>
      }
    >
      <h2 className="step-title">{step.title}</h2>
      <div className="row wrap">
        <button className={`btn ${hidden ? "btn-primary" : ""}`} onClick={playAll}>
          <SpeakerIcon size={18} /> {hidden ? "Слушать" : "Прослушать всё"}
        </button>
        {hidden ? (
          <button className="btn btn-quiet" onClick={() => setHidden(false)}>
            Показать текст
          </button>
        ) : (
          <button className="btn btn-quiet" onClick={() => setAll((a) => !a)}>
            {all ? "Скрыть перевод" : "Показать перевод"}
          </button>
        )}
      </div>
      <p className="muted small">
        {hidden ? "Сначала послушай без текста, можно несколько раз. Текст появится после прослушивания" : "Сначала прочитай сам, перевод — по нажатию на строку"}
      </p>
      {!hidden && <div className={`text-lines ${step.kind}`}>
        {lines.map((l, i) => (
          <div key={i} className={`text-line ${playing === i ? "playing" : ""}`} onClick={() => toggle(i)}>
            {l.who && <span className="who">{l.who}</span>}
            <div className="line-body">
              <div className="row">
                <span className="el line-el">{l.el}</span>
                <SpeakButton text={l.el} size={18} />
              </div>
              {(all || shown.has(i)) && <span className="muted line-ru">{l.ru}</span>}
            </div>
          </div>
        ))}
      </div>}
    </StepFrame>
  );
}

export function GrammarStep({ frame, step, onDone }: { frame: Frame; step: Extract<Step, { kind: "grammar" }>; onDone: () => void }) {
  return (
    <StepFrame
      {...frame}
      label="Грамматика"
      actions={
        <button className="btn btn-primary" onClick={onDone}>
          Понятно, к практике
        </button>
      }
    >
      <h2 className="step-title">{step.title}</h2>
      <div className="rules lesson-rules">
        <Rules blocks={step.blocks} />
      </div>
    </StepFrame>
  );
}

const plain = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("el").replace(/ς/g, "σ");
const hintMet = (h: WriteHint, text: string) => !!h.check?.some((c) => plain(text).includes(plain(c)));

/** Free writing about yourself: a checklist that ticks itself, then a model text to compare with. */
export function WriteStep({
  frame,
  step,
  saved,
  onSave,
  onDone,
}: {
  frame: Frame;
  step: Extract<Step, { kind: "write" }>;
  saved: string;
  onSave: (text: string) => void;
  onDone: () => void;
}) {
  const [text, setText] = useState(saved);
  const [compared, setCompared] = useState(false);
  const compare = () => {
    const t = fixFinalSigma(text);
    setText(t);
    onSave(t);
    setCompared(true);
  };
  return (
    <StepFrame
      {...frame}
      label="Письмо"
      actions={
        compared ? (
          <button className="btn btn-primary" onClick={onDone}>
            Закончить урок
          </button>
        ) : (
          <>
            <button className="btn btn-quiet" onClick={onDone}>
              Пропустить
            </button>
            <button className="btn btn-primary" onClick={compare} disabled={!text.trim()}>
              Сравнить с образцом
            </button>
          </>
        )
      }
    >
      <h2 className="step-title">{step.task}</h2>
      <ul className="checklist">
        {step.hints.map((h) => (
          <li key={h.text} className={hintMet(h, text) ? "met" : ""}>
            <span className="tick" aria-hidden="true" />
            {h.text}
          </li>
        ))}
      </ul>
      <GreekInput value={text} onChange={setText} onSubmit={compare} multiline autoFocus placeholder="Пиши по-гречески, по предложению на строку" disabled={compared} />
      {compared && (
        <section className="panel model">
          <h3 className="panel-title">Образец</h3>
          {step.model.map((m, i) => (
            <div key={i} className="row">
              <span className="el model-line">{m}</span>
              <SpeakButton text={m} size={16} />
            </div>
          ))}
          <p className="muted small">Сравни со своим текстом: артикли, окончания, ударения. Текст сохранён в разделе «Курс»</p>
        </section>
      )}
    </StepFrame>
  );
}

/** A longer text for AI review: the task, its requirements, a word counter, then the review loop. */
export function EssayStep({
  frame,
  step,
  level,
  lessonTitle,
  reviewKey,
  saved,
  onSave,
  onDone,
}: {
  frame: Frame;
  step: Extract<Step, { kind: "essay" }>;
  level: string;
  lessonTitle: string;
  reviewKey: string;
  saved: string;
  onSave: (text: string) => void;
  onDone: () => void;
}) {
  const [text, setText] = useState(saved);
  const n = countWords(text);
  const [min, max] = step.words;
  const prompt = essayPrompt({ level, task: step.task, requirements: step.requirements, words: step.words, text, title: lessonTitle });
  return (
    <StepFrame
      {...frame}
      label="Эссе · проверка ИИ"
      actions={
        <button
          className="btn btn-primary"
          onClick={() => {
            onSave(fixFinalSigma(text));
            onDone();
          }}
        >
          Дальше
        </button>
      }
    >
      <h2 className="step-title">{step.task}</h2>
      <ul className="checklist plain">
        {step.requirements.map((r) => (
          <li key={r}>
            <span className="tick" aria-hidden="true" />
            {r}
          </li>
        ))}
      </ul>
      <GreekInput value={text} onChange={setText} onSubmit={() => onSave(fixFinalSigma(text))} multiline autoFocus placeholder="Пиши по-гречески. Можно сохранить и вернуться позже" />
      <p className={`small word-count ${n < min ? "muted" : n > max ? "bad-text" : "good-text"}`}>
        {n} слов · нужно {min}–{max}
      </p>
      <AiReview prompt={prompt} reviewKey={reviewKey} review={{ kind: "essay", title: lessonTitle, text }} disabled={n < Math.min(min, 10)} onSend={() => onSave(fixFinalSigma(text))} />
    </StepFrame>
  );
}

/** Role-play with an AI by voice or text; the AI's final review is pasted back like an essay review. */
export function SpeakStep({
  frame,
  step,
  level,
  reviewKey,
  onDone,
}: {
  frame: Frame;
  step: Extract<Step, { kind: "speak" }>;
  level: string;
  reviewKey: string;
  onDone: () => void;
}) {
  const prompt = speakPrompt({ level, title: step.title, scenario: step.scenario, aiRole: step.aiRole, goals: step.goals });
  return (
    <StepFrame
      {...frame}
      label="Разговор · ролевая игра с ИИ"
      actions={
        <button className="btn btn-primary" onClick={onDone}>
          Дальше
        </button>
      }
    >
      <h2 className="step-title">{step.title}</h2>
      <p className="lead-ru">{step.scenario}</p>
      <p className="muted">ИИ играет роль: {step.aiRole}</p>
      <ul className="checklist plain">
        {step.goals.map((g) => (
          <li key={g}>
            <span className="tick" aria-hidden="true" />
            {g}
          </li>
        ))}
      </ul>
      <p className="muted small">
        Лучше голосом: вставь запрос в приложение ChatGPT или Claude на телефоне и включи голосовой режим. Говори сам, не подглядывай в
        текст. Чтобы закончить, скажи «τέλος» — ИИ даст разбор
      </p>
      <AiReview chat prompt={prompt} reviewKey={reviewKey} review={{ kind: "speak", title: step.title, text: "" }} />
    </StepFrame>
  );
}
