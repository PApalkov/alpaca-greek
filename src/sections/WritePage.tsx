import { useState } from "react";
import { AiReview, countWords } from "../components/AiReview";
import { GreekInput } from "../components/GreekInput";
import { PageHeader } from "../components/ui";
import { fixFinalSigma } from "../lib/greek";
import { useMistakes } from "../lib/mistakes";
import { href } from "../lib/router";
import { lessonEpoch } from "../program";
import { freePrompt } from "../program/aiPrompts";
import { useCourse } from "./lesson/useLesson";

/** Any text of the learner's own (homework, a message, a diary entry) reviewed by an AI. */
export function WritePage() {
  const { current } = useCourse();
  const { reviews } = useMistakes();
  const level = (current && lessonEpoch(current.id)?.level) ?? "A2";
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  // A new key per text, so earlier reviews stay in the list below.
  const [key, setKey] = useState(() => `free.${Date.now()}`);
  const past = Object.entries(reviews)
    .filter(([, r]) => r.kind === "free")
    .sort(([a], [b]) => b.localeCompare(a));

  return (
    <>
      <PageHeader
        title="Свой текст на проверку"
        subtitle="Домашнее задание, сообщение, дневник — что угодно по-гречески. ИИ проверит по критериям экзамена, а ошибки станут твоими упражнениями"
        back={href("course")}
        backLabel="Курс"
      />
      <section className="panel stack">
        <input className="search" placeholder="Тема или задание (необязательно)" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <GreekInput value={text} onChange={setText} onSubmit={() => setText(fixFinalSigma(text))} multiline placeholder="Пиши по-гречески" />
        <p className="muted small">
          {countWords(text)} слов · уровень для проверки: {level}
        </p>
        <AiReview
          key={key}
          prompt={freePrompt({ level, topic, text })}
          reviewKey={key}
          review={{ kind: "free", title: topic.trim() || "Свой текст", text }}
          disabled={countWords(text) < 5}
        />
        <button
          className="link-btn"
          onClick={() => {
            setText("");
            setTopic("");
            setKey(`free.${Date.now()}`);
          }}
        >
          Начать новый текст
        </button>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="section-title">Проверенные тексты</h2>
          <div className="stack">
            {past.map(([k, r]) => (
              <details key={k} className="panel">
                <summary>
                  <strong>{r.title}</strong> <span className="muted small">· {r.date}{r.score !== undefined && ` · ${r.score}/20`}</span>
                </summary>
                <p className="el writing-saved">{r.text}</p>
                {r.reply && <pre className="reply">{r.reply}</pre>}
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
