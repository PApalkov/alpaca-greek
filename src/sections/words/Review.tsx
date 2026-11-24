import { useEffect, useMemo, useState } from "react";
import { Alpaca } from "../../components/Alpaca";
import { GreekInput } from "../../components/GreekInput";
import { Marks, useTypedAnswer } from "../../components/TypedAnswer";
import { SpeakButton, plural } from "../../components/ui";
import { days, wordKey, type Word } from "../../data/words";
import { today } from "../../lib/dates";
import type { Verdict } from "../../lib/greek";
import { useProgress } from "../../lib/progress";
import { shouldRequeue, usePracticeSettings } from "../../lib/settings";
import { href } from "../../lib/router";
import { shuffle } from "../../lib/random";
import { speak } from "../../lib/speech";
import { FocusTop } from "../practice/Session";
import { WordDetails } from "./WordCard";
import { dueWords } from "./wordStats";

type Direction = "el" | "ru" | "mix";

interface Card {
  word: Word;
  reverse: boolean;
  retry: boolean;
}

/** In the daily lesson: continue to the next block, or stop here (both count the block as done). */
export interface NextStep {
  label: string;
  onClick: () => void;
  pause: () => void;
}

function Done({ title, text, exit, next }: { title: string; text: string; exit: string; next?: NextStep }) {
  return (
    <div className="focus">
      <FocusTop exitHref={exit} value={1} max={1} label="Итог" />
      <div className="focus-body summary">
        <Alpaca size={88} mood="happy" />
        <div>
          <h2>{title}</h2>
          <p className="muted">{text}</p>
        </div>
        <div className="actions">
          {next ? (
            <button className="btn" onClick={next.pause}>Сделать перерыв</button>
          ) : (
            <a className="btn" href={exit}>Готово</a>
          )}
          {next && (
            <button className="btn btn-primary" onClick={next.onClick} autoFocus>
              {next.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** All the Greek spellings a typed answer may match: "αυτός, αυτή, αυτό" accepts each part too. */
const variants = (el: string) => [el, ...el.split(/[,/]/).map((s) => s.trim()).filter(Boolean)];

/**
 * Word cards. Russian→Greek: type the word, it is checked automatically (a second attempt with the
 * mistakes highlighted, and "засчитать" for a valid spelling the checker does not know).
 * Greek→Russian: recall, reveal, grade yourself. Forgotten cards come back as the settings say.
 */
export function Flashcards({
  words,
  record,
  exit,
  title,
  onDone,
}: {
  words: Word[];
  record: boolean;
  exit: string;
  title?: string;
  onDone: (stats: { ok: number; bad: number }) => void;
}) {
  const { answer, meta } = useProgress();
  const { repeatMistakes } = usePracticeSettings();
  const direction = (meta.wordDirection as Direction) ?? "mix";
  const [queue, setQueue] = useState<Card[]>(() =>
    words.map((word) => ({ word, reverse: direction === "ru" || (direction === "mix" && Math.random() < 0.5), retry: false })),
  );
  const [pos, setPos] = useState(0);
  const [open, setOpen] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [retried, setRetried] = useState(false);
  const [stats, setStats] = useState({ ok: 0, bad: 0 });

  const card = queue[pos];
  const w = card?.word;

  const show = () => {
    setOpen(true);
    if (w) speak(w.el);
  };
  const typed = useTypedAnswer(w ? variants(w.el) : [], (v, r) => {
    setVerdict(v);
    setRetried(r);
    show();
  });
  const reveal = () => {
    if (open || !w) return;
    if (!card.reverse) return show();
    if (typed.text.trim()) typed.submit();
    else typed.giveUp();
  };
  const known = verdict === "correct" && !retried;

  const grade = (ok: boolean) => {
    if (!open) return;
    const nextStats = card.retry ? stats : ok ? { ...stats, ok: stats.ok + 1 } : { ...stats, bad: stats.bad + 1 };
    if (!card.retry && record) answer(wordKey(w), ok);
    setStats(nextStats);
    const nextQueue = ok || !shouldRequeue(repeatMistakes, card.retry) ? queue : [...queue, { ...card, retry: true }];
    setQueue(nextQueue);
    setOpen(false);
    typed.reset();
    setVerdict(null);
    setRetried(false);
    if (pos + 1 >= nextQueue.length) onDone(nextStats);
    else setPos(pos + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (!open && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        reveal();
      } else if (open && card.reverse && e.key === "Enter") {
        e.preventDefault();
        grade(known);
      } else if (open && !card.reverse && e.key === "1") grade(false);
      else if (open && !card.reverse && (e.key === "2" || e.key === "Enter")) grade(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!w) return null;
  return (
    <div className="focus">
      <FocusTop exitHref={exit} value={pos} max={queue.length} label={`${pos + 1} / ${queue.length}`} title={title} />
      <div className="focus-body" key={pos}>
        <div className="task">
          <span className="task-label">
            {card.reverse ? "Напиши по-гречески" : "Вспомни перевод"}
            {card.retry && <span className="badge">ещё раз</span>}
          </span>
          <p className="task-hint">
            День {w.day} · {w.topic}
          </p>
        </div>
        {card.reverse ? (
          <p className="prompt ru">{w.ru}</p>
        ) : (
          <div className="row">
            <p className="prompt el">{w.el}</p>
            <SpeakButton text={w.el} />
          </div>
        )}

        {card.reverse && !open && typed.marks && <Marks marks={typed.marks} />}
        {card.reverse && !open && (
          <GreekInput key={`${pos}-${typed.retrying}`} value={typed.text} onChange={typed.setText} onSubmit={reveal} placeholder="Слово с артиклем" autoFocus />
        )}

        {open && (
          <div className="reveal">
            {card.reverse && (
              <>
                <span className={`badge ${known ? "good" : verdict === "correct" || verdict === "accent" ? "warn" : "bad"}`}>
                  {known
                    ? "Верно"
                    : verdict === "correct"
                      ? "Верно со второй попытки — повторим ещё"
                      : verdict === "accent"
                        ? `Ошибка в ударении: ${typed.text}`
                        : typed.text.trim()
                          ? `Ты написал: ${typed.text}`
                          : "Без ответа"}
                </span>
                <div className="row">
                  <p className="prompt el">{w.el}</p>
                  <SpeakButton text={w.el} />
                </div>
              </>
            )}
            <p className="muted">[{w.tr}]</p>
            <WordDetails word={w} showTranslation={!card.reverse} />
          </div>
        )}
      </div>

      <div className="focus-actions">
        {!open ? (
          <>
            {card.reverse && (
              <button className="btn btn-quiet" onClick={typed.giveUp}>
                {typed.retrying ? "Показать ответ" : "Не знаю"}
              </button>
            )}
            <button className="btn btn-primary wide" onClick={reveal}>
              {card.reverse ? (typed.retrying ? "Проверить ещё раз" : "Проверить") : "Показать перевод"} <kbd>Enter</kbd>
            </button>
          </>
        ) : card.reverse ? (
          verdict === "correct" ? (
            <button className="btn btn-primary" onClick={() => grade(known)}>
              Дальше <kbd>Enter</kbd>
            </button>
          ) : (
            <>
              <button className="btn btn-quiet" onClick={() => grade(true)}>
                Мой вариант тоже верный
              </button>
              <button className="btn btn-primary" onClick={() => grade(false)}>
                Дальше <kbd>Enter</kbd>
              </button>
            </>
          )
        ) : (
          <>
            <button className="btn btn-quiet" onClick={() => grade(false)}>
              Не помню <kbd>1</kbd>
            </button>
            <button className="btn btn-primary" onClick={() => grade(true)}>
              Помню <kbd>2</kbd>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Due words, capped so one session stays short; the rest wait for the next one. */
export function Review({ limit, title, next }: { limit?: number; title?: string; next?: NextStep }) {
  const { items } = useProgress();
  // Snapshot the queue once: answering moves words out of "due" while the session runs.
  const [queue] = useState(() => dueWords(items, today()).slice(0, limit));
  const [result, setResult] = useState<{ ok: number; bad: number } | null>(null);
  const exit = next ? href() : href("words");

  if (queue.length === 0) return <Done title="На сегодня всё повторено" text="Слова вернутся, когда подойдёт их срок" exit={exit} next={next} />;
  if (result)
    return (
      <Done
        title={`Повторено: ${result.ok + result.bad}`}
        text={result.bad ? `С первого раза не получилось: ${result.bad}. Эти слова вернулись в отделение 1` : "Всё с первого раза"}
        exit={exit}
        next={next}
      />
    );
  return <Flashcards words={queue} record exit={exit} title={title} onDone={setResult} />;
}

/**
 * New day: read each card (examples, audio), put them into box 1, then an unrecorded self-check.
 * Learning the active day moves the active day forward.
 */
export function LearnDay({ day, title, next }: { day: number; title?: string; next?: NextStep }) {
  const { introduce, meta, setMeta } = useProgress();
  const d = days.find((x) => x.day === day);
  const [step, setStep] = useState<"intro" | "check" | "done">("intro");
  const [i, setI] = useState(0);
  const practice = useMemo(() => shuffle(d?.words ?? []), [d]);
  const exit = next ? href() : href("words");

  const finishIntro = () => {
    if (!d) return;
    introduce(d.words.map(wordKey));
    const active = typeof meta.activeDay === "number" ? meta.activeDay : 0;
    if (day >= active && days.some((x) => x.day === day + 1)) setMeta("activeDay", day + 1);
    setStep("check");
  };

  useEffect(() => {
    if (step !== "intro" || !d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") (i === d.words.length - 1 ? finishIntro() : setI(i + 1));
      if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!d) return <Done title="Нет такого дня" text="" exit={exit} next={next} />;
  if (step === "check") return <Flashcards words={practice} record={false} exit={exit} title={title ? `${title}: проверка` : undefined} onDone={() => setStep("done")} />;
  if (step === "done")
    return <Done title={`День ${day}: слова в отделении 1`} text="Первое повторение завтра. Вечером прочитай примеры вслух ещё раз" exit={exit} next={next} />;

  const w = d.words[i];
  const last = i === d.words.length - 1;
  return (
    <div className="focus">
      <FocusTop exitHref={exit} value={i + 1} max={d.words.length} label={`${i + 1} / ${d.words.length}`} title={title} />
      <div className="focus-body" key={i}>
        <div className="task">
          <span className="task-label">Новое слово</span>
          <p className="task-hint">
            День {day} · {d.topic} · {d.words.length} {plural(d.words.length, "слово", "слова", "слов")}
          </p>
        </div>
        <div className="row">
          <p className="prompt el">{w.el}</p>
          <SpeakButton text={w.el} />
        </div>
        <p className="muted">[{w.tr}]</p>
        <WordDetails word={w} />
      </div>
      <div className="focus-actions">
        <button className="btn btn-quiet" disabled={i === 0} onClick={() => setI(i - 1)}>
          Назад
        </button>
        {last ? (
          <button className="btn btn-primary" onClick={finishIntro}>
            Проверить себя
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setI(i + 1)}>
            Дальше <kbd>→</kbd>
          </button>
        )}
      </div>
    </div>
  );
}
