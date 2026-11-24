import { useEffect, useState } from "react";
import { Alpaca } from "../../components/Alpaca";
import { GreekInput } from "../../components/GreekInput";
import { Marks, useTypedAnswer } from "../../components/TypedAnswer";
import { CloseIcon, SpeakerIcon } from "../../components/Icons";
import { ProgressBar, SpeakButton } from "../../components/ui";
import { questionKey, type BuildItem, type ChooseItem, type Item, type ListenItem, type Question, type SpotItem, type TranslateItem } from "../../grammar/questions";
import { normalizeAnswer, type Verdict } from "../../lib/greek";
import { useProgress } from "../../lib/progress";
import { shouldRequeue, usePracticeSettings } from "../../lib/settings";
import { speak, speakAll } from "../../lib/speech";

interface Result {
  verdict: Verdict;
  /** Correct answer to show (Greek). */
  answer: string;
  explain?: string;
  say?: string;
  /** Answered after looking at the options: shown as right, recorded as not known yet. */
  hinted?: boolean;
  /** Right only on the second attempt: also recorded as not known yet. */
  retried?: boolean;
  /** What the learner typed (for the feedback line). */
  typed?: string;
}

interface Entry {
  item: Item;
  retry: boolean;
}

const isKnown = (r: Result) => r.verdict === "correct" && !r.hinted && !r.retried;

export function Session({
  items,
  exitHref,
  title,
  onRestart,
  next: nextStep,
}: {
  items: Item[];
  exitHref: string;
  /** Shown above the progress, e.g. the lesson block. */
  title?: string;
  onRestart?: () => void;
  /** In the daily lesson: continue to the next block or take a break. */
  next?: { label: string; onClick: () => void; pause: () => void };
}) {
  const { answer } = useProgress();
  const { repeatMistakes } = usePracticeSettings();
  const [queue, setQueue] = useState<Entry[]>(() => items.map((item) => ({ item, retry: false })));
  const [pos, setPos] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [mistakes, setMistakes] = useState<{ item: Item; result: Result }[]>([]);

  const entry = queue[pos];

  const report = (r: Result) => {
    setResult(r);
    const ok = isKnown(r);
    if (!entry.retry) {
      answer(questionKey(entry.item), ok);
      if (!ok) setMistakes((m) => [...m, { item: entry.item, result: r }]);
    }
    // A mistake comes back at the end of the round (not recorded again), as the settings say.
    if (!ok && shouldRequeue(repeatMistakes, entry.retry)) setQueue((q) => [...q, { item: entry.item, retry: true }]);
    if (r.say) speak(r.say);
  };

  const next = () => {
    setResult(null);
    setPos((p) => p + 1);
  };

  if (pos >= queue.length) {
    const first = items.length;
    const right = first - mistakes.length;
    return (
      <div className="focus">
        <FocusTop exitHref={exitHref} value={1} max={1} label="Итог" title={title} />
        <div className="focus-body summary">
          <Alpaca size={88} mood={mistakes.length === 0 ? "happy" : "calm"} />
          <div>
            <div className="summary-score">
              {right}
              <span>/{first}</span>
            </div>
            <p className="muted">
              {mistakes.length === 0
                ? "Без ошибок. Эти задания вернутся позже, когда начнут забываться"
                : "Ошибки вернутся в следующих тренировках раньше остальных"}
            </p>
          </div>
          {mistakes.length > 0 && (
            <section className="panel">
              <h3 className="panel-title">Разбор ошибок</h3>
              {mistakes.map(({ item, result: r }) => (
                <div key={item.id} className="review-row">
                  <div className="el">{r.answer}</div>
                  {r.explain && <div className="muted small">{r.explain}</div>}
                </div>
              ))}
            </section>
          )}
          <div className="actions">
            {nextStep ? (
              <button className="btn" onClick={nextStep.pause}>Сделать перерыв</button>
            ) : (
              <a className="btn" href={exitHref}>Готово</a>
            )}
            {nextStep ? (
              <button className="btn btn-primary" onClick={nextStep.onClick} autoFocus>
                {nextStep.label}
              </button>
            ) : (
              onRestart && <button className="btn btn-primary" onClick={onRestart}>Ещё раунд</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="focus">
      <FocusTop exitHref={exitHref} value={pos} max={queue.length} label={`${pos + 1} / ${queue.length}`} title={title} />
      <div className="focus-body" key={pos}>
        {entry.retry && <span className="badge">ещё раз</span>}
        {entry.item.kind === "choice" && <ChoiceView q={entry.item} result={result} onResult={report} />}
        {entry.item.kind === "build" && <BuildView q={entry.item} result={result} onResult={report} />}
        {entry.item.kind === "spot" && <SpotView q={entry.item} result={result} onResult={report} />}
        {entry.item.kind === "translate" && <TranslateView q={entry.item} result={result} onResult={report} />}
        {entry.item.kind === "listen" && <ListenView q={entry.item} result={result} onResult={report} />}
        {entry.item.kind === "choose" && <ChooseView q={entry.item} result={result} onResult={report} />}
      </div>
      {result && <Feedback result={result} onNext={next} />}
    </div>
  );
}

export function FocusTop({ exitHref, value, max, label, title }: { exitHref: string; value: number; max: number; label: string; title?: string }) {
  return (
    <header className="focus-top">
      <a className="icon-btn" href={exitHref} aria-label="Закончить">
        <CloseIcon />
      </a>
      <div className="focus-progress">
        {title && <span className="focus-title">{title}</span>}
        <ProgressBar value={value} max={max} />
      </div>
      <span className="muted small tabular">{label}</span>
    </header>
  );
}

function Feedback({ result, onNext }: { result: Result; onNext: () => void }) {
  const ok = result.verdict === "correct";
  const label = ok
    ? result.hinted
      ? "Верно, но с подсказкой — повторим ещё"
      : result.retried
        ? "Верно со второй попытки — повторим ещё"
        : "Верно"
    : result.verdict === "accent"
      ? "Почти: ударение"
      : "Правильный ответ";
  return (
    <div className={`feedback ${isKnown(result) ? "ok" : ok ? "warn" : "bad"}`} role="status">
      <div className="feedback-inner">
        <div className="feedback-text">
          <strong>{label}</strong>
          {!ok && (
            <div className="row el answer-line">
              {result.answer}
              {result.say && <SpeakButton text={result.say} size={18} />}
            </div>
          )}
          {!ok && result.typed && (
            <div className="small explain">
              Ты написал: <span className="el">{result.typed}</span>
            </div>
          )}
          {result.explain && <div className="small explain">{result.explain}</div>}
        </div>
        <button className="btn btn-primary" onClick={onNext} autoFocus>
          Дальше <kbd>Enter</kbd>
        </button>
      </div>
    </div>
  );
}

function Prompt({ text, filled, state }: { text: string; filled?: string; state?: "ok" | "bad" }) {
  const parts = text.split("___");
  return (
    <div className="prompt el">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <span className={`gap ${state ?? ""}`}>{filled ?? " "}</span>}
        </span>
      ))}
    </div>
  );
}

/**
 * Gap-fill answered by typing: recall works better than recognition. "Показать варианты" turns the
 * question into multiple choice as a hint; a hinted answer is not counted as known.
 */
function ChoiceView({ q, result, onResult }: { q: Question; result: Result | null; onResult: (r: Result) => void }) {
  const [typing, setTyping] = useState(true);
  const [chosen, setChosen] = useState<string | null>(null);

  const finish = (verdict: Verdict, extra: Partial<Result> = {}) =>
    onResult({ verdict, answer: q.say ?? q.answer, explain: q.explain, say: q.say, ...extra });
  const typed = useTypedAnswer([q.answer, ...(q.accept ?? [])], (verdict, retried) => finish(verdict, { retried, typed: typed.text }));

  const choose = (o: string) => {
    if (result) return;
    setChosen(o);
    finish(o === q.answer ? "correct" : "wrong", { hinted: true });
  };

  useEffect(() => {
    if (typing || result) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) choose(q.options[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const state = result ? (result.verdict === "correct" ? "ok" : "bad") : undefined;
  return (
    <>
      <div className="task">
        <span className="task-label">{typing ? "Напиши" : "Выбери"}</span>
        <p className="task-hint">{q.hint}</p>
      </div>
      <Prompt text={q.prompt} filled={result ? q.answer : typing ? typed.text || undefined : chosen ?? undefined} state={state} />
      {typing ? (
        <div className="answer-zone">
          {typed.marks && !result && <Marks marks={typed.marks} />}
          <GreekInput key={typed.retrying ? "retry" : "first"} value={typed.text} onChange={typed.setText} onSubmit={typed.submit} disabled={!!result} autoFocus />
          {!result && (
            <div className="actions">
              <button className="btn btn-quiet" onClick={typed.giveUp}>{typed.retrying ? "Показать ответ" : "Не знаю"}</button>
              {q.options.length > 1 && !typed.retrying && (
                <button className="btn btn-quiet" onClick={() => setTyping(false)}>Показать варианты</button>
              )}
              <button className="btn btn-primary" onClick={typed.submit} disabled={!typed.text.trim()}>
                {typed.retrying ? "Проверить ещё раз" : "Проверить"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`options ${q.options.length <= 3 ? "three" : ""}`}>
          {q.options.map((o, i) => {
            const s = !result ? "" : o === q.answer ? "ok" : o === chosen ? "bad" : "dim";
            return (
              <button key={o} className={`option el ${s}`} onClick={() => choose(o)} disabled={!!result}>
                <kbd>{i + 1}</kbd>
                <span>{o}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

function BuildView({ q, result, onResult }: { q: BuildItem; result: Result | null; onResult: (r: Result) => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const sentence = picked.map((i) => q.tiles[i]);

  const check = () => {
    if (result || picked.length === 0) return;
    const ok = normalizeAnswer(sentence.join(" ")) === normalizeAnswer(q.words.join(" "));
    onResult({ verdict: ok ? "correct" : "wrong", answer: q.answer, explain: q.explain, say: q.answer });
  };

  const state = result ? (result.verdict === "correct" ? "ok" : "bad") : "";
  return (
    <>
      <div className="task">
        <span className="task-label">Переведи на греческий</span>
        <p className="prompt ru">{q.ru}</p>
      </div>
      <div className={`build-line ${state}`} aria-label="Твоё предложение">
        {picked.length === 0 && <span className="muted">Нажимай на слова по порядку</span>}
        {picked.map((ti, i) => (
          <button key={`${ti}-${i}`} className="tile el" disabled={!!result} onClick={() => setPicked((p) => p.filter((x) => x !== ti))}>
            {q.tiles[ti]}
          </button>
        ))}
      </div>
      <div className="tile-bank">
        {q.tiles.map((t, i) => (
          <button
            key={i}
            className={`tile el ${picked.includes(i) ? "used" : ""}`}
            disabled={!!result || picked.includes(i)}
            onClick={() => setPicked((p) => [...p, i])}
          >
            {t}
          </button>
        ))}
      </div>
      {!result && (
        <div className="actions">
          <button className="btn btn-quiet" onClick={() => setPicked([])} disabled={!picked.length}>
            Сбросить
          </button>
          <button className="btn btn-primary" onClick={check} disabled={!picked.length}>
            Проверить
          </button>
        </div>
      )}
    </>
  );
}

function SpotView({ q, result, onResult }: { q: SpotItem; result: Result | null; onResult: (r: Result) => void }) {
  const [tapped, setTapped] = useState<number | "none" | null>(null);
  const correctSentence = q.wrong.length === 0;

  const finish = (choice: number | "none") => {
    if (result) return;
    setTapped(choice);
    const ok = choice === "none" ? correctSentence : q.wrong.includes(choice);
    onResult({ verdict: ok ? "correct" : "wrong", answer: q.fix, explain: q.explain, say: q.fix });
  };

  return (
    <>
      <div className="task">
        <span className="task-label">Найди ошибку</span>
        <p className="task-hint">{q.ru} Нажми на неверное слово или выбери «Всё верно»</p>
      </div>
      <div className="spot-line el">
        {q.words.map((w, i) => {
          const s = !result ? "" : q.wrong.includes(i) ? "bad" : tapped === i ? "miss" : "";
          return (
            <button key={i} className={`spot-word ${s}`} disabled={!!result} onClick={() => finish(i)}>
              {w}
            </button>
          );
        })}
      </div>
      {result && !correctSentence && (
        <p className="fix-line">
          <span className="muted small">Правильно:</span> <span className="el">{q.fix}</span>
        </p>
      )}
      {!result && (
        <div className="actions">
          <button className="btn btn-primary" onClick={() => finish("none")}>
            Всё верно
          </button>
        </div>
      )}
    </>
  );
}

/** Write the whole sentence in Greek. Strict about stress; punctuation and capitals are ignored. */
function TranslateView({ q, result, onResult }: { q: TranslateItem; result: Result | null; onResult: (r: Result) => void }) {
  const typed = useTypedAnswer(q.answers, (verdict, retried) =>
    onResult({ verdict, retried, typed: typed.text, answer: q.answers[0], explain: q.explain, say: q.answers[0] }),
  );
  return (
    <>
      <div className="task">
        <span className="task-label">{q.label ?? "Переведи на греческий"}</span>
      </div>
      <p className={`prompt ${q.label ? "el" : "ru"}`}>{q.ru}</p>
      <TypedZone typed={typed} result={result} placeholder="Напиши фразу по-гречески" giveUpLabel="Не знаю" />
    </>
  );
}

/** Dictation: the phrase is read aloud (again on demand, or slower), the learner types it. */
function ListenView({ q, result, onResult }: { q: ListenItem; result: Result | null; onResult: (r: Result) => void }) {
  useEffect(() => {
    const t = setTimeout(() => speak(q.el), 300);
    return () => clearTimeout(t);
  }, [q.el]);
  const typed = useTypedAnswer([q.el], (verdict, retried) => onResult({ verdict, retried, typed: typed.text, answer: q.el, explain: q.ru }));
  return (
    <>
      <div className="task">
        <span className="task-label">Диктант</span>
        <p className="task-hint">Послушай и напиши, что услышал</p>
      </div>
      <div className="listen-row">
        <button className="listen-btn" onClick={() => speak(q.el)} aria-label="Прослушать">
          <SpeakerIcon size={32} />
        </button>
        <button className="btn btn-quiet" onClick={() => speak(q.el, 0.6)}>
          Медленнее
        </button>
      </div>
      {result && <p className="prompt el">{q.el}</p>}
      <TypedZone typed={typed} result={result} giveUpLabel="Не разобрал" />
    </>
  );
}

/** Input + actions for a typed answer, with the highlighted first attempt when retrying. */
function TypedZone({
  typed,
  result,
  placeholder,
  giveUpLabel,
}: {
  typed: ReturnType<typeof useTypedAnswer>;
  result: Result | null;
  placeholder?: string;
  giveUpLabel: string;
}) {
  return (
    <div className="answer-zone">
      {typed.marks && !result && <Marks marks={typed.marks} />}
      <GreekInput key={typed.retrying ? "retry" : "first"} value={typed.text} onChange={typed.setText} onSubmit={typed.submit} disabled={!!result} autoFocus placeholder={placeholder} />
      {!result && (
        <div className="actions">
          <button className="btn btn-quiet" onClick={typed.giveUp}>
            {typed.retrying ? "Показать ответ" : giveUpLabel}
          </button>
          <button className="btn btn-primary" onClick={typed.submit} disabled={!typed.text.trim()}>
            {typed.retrying ? "Проверить ещё раз" : "Проверить"}
          </button>
        </div>
      )}
    </div>
  );
}

/** Comprehension of a text: the text can be read again, or (listening) only played again. */
function ChooseView({ q, result, onResult }: { q: ChooseItem; result: Result | null; onResult: (r: Result) => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);
  const choose = (o: string) => {
    if (result) return;
    setChosen(o);
    onResult({ verdict: o === q.answer ? "correct" : "wrong", answer: q.answer, explain: q.explain });
  };
  useEffect(() => {
    if (result) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) choose(q.options[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <>
      <div className="task">
        <span className="task-label">{q.context?.listenOnly ? "Аудирование" : "Понимание текста"}</span>
        {q.context && <p className="task-hint">{q.context.title}</p>}
      </div>
      {q.context && (
        <div className="row wrap">
          <button className="btn" onClick={() => speakAll(q.context!.lines.map((l) => l.replace(/^[^:]{1,20}: /, "")))}>
            <SpeakerIcon size={18} /> Прослушать текст
          </button>
          {(!q.context.listenOnly || result) && (
            <button className="btn btn-quiet" onClick={() => setShowText((v) => !v)}>
              {showText ? "Скрыть текст" : "Показать текст"}
            </button>
          )}
        </div>
      )}
      {showText && q.context && (
        <div className="context-text el">
          {q.context.lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      )}
      <p className="prompt question">{q.question}</p>
      <div className="options">
        {q.options.map((o, i) => {
          const s = !result ? "" : o === q.answer ? "ok" : o === chosen ? "bad" : "dim";
          return (
            <button key={o} className={`option ${s}`} onClick={() => choose(o)} disabled={!!result}>
              <kbd>{i + 1}</kbd>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
