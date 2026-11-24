import { useState } from "react";
import { diffMarks, type Mark } from "../lib/diff";
import { checkAnswer, fixFinalSigma, type Verdict } from "../lib/greek";
import { usePracticeSettings } from "../lib/settings";

/**
 * A typed answer with an optional second attempt: the first miss highlights the wrong letters
 * (without showing the answer) and keeps the text for fixing; the second miss is final.
 * `onFinal(verdict, retried)`: retried = it took the second attempt.
 */
export function useTypedAnswer(answers: string[], onFinal: (verdict: Verdict, retried: boolean) => void) {
  const { secondChance } = usePracticeSettings();
  const [text, setText] = useState("");
  const [marks, setMarks] = useState<Mark[] | null>(null);
  const retrying = marks !== null;

  const submit = () => {
    if (!text.trim()) return;
    const typed = fixFinalSigma(text);
    setText(typed);
    const verdict = checkAnswer(typed, answers);
    if (verdict !== "correct" && secondChance && !retrying) {
      setMarks(diffMarks(typed, answers));
      return;
    }
    onFinal(verdict, retrying);
  };

  /** For components that reuse one field for many questions. */
  const reset = () => {
    setText("");
    setMarks(null);
  };

  return { text, setText, submit, giveUp: () => onFinal("wrong", retrying), reset, marks, retrying };
}

/** The learner's previous attempt with the mistakes highlighted. */
export function Marks({ marks }: { marks: Mark[] }) {
  const accentOnly = marks.every((m) => m.kind === "ok" || m.kind === "accent");
  return (
    <div className="marks-box" role="status">
      <p className="marks el" aria-label="Твой ответ с ошибками">
        {marks.map((m, i) =>
          m.kind === "missing" ? (
            <span key={i} className="mark-missing" title="здесь не хватает буквы">
              ‸
            </span>
          ) : (
            <span key={i} className={`mark-${m.kind}`}>
              {m.ch}
            </span>
          ),
        )}
      </p>
      <p className="small">
        {accentOnly ? "Почти: проверь ударение (подчёркнуто)." : "Красным — лишнее или неверное, ‸ — здесь не хватает буквы."} Исправь и проверь ещё раз
      </p>
    </div>
  );
}
