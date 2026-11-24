import { useState } from "react";
import { parseAiReply, useMistakes, type Review } from "../lib/mistakes";
import { chatLinks } from "../program/aiPrompts";

/**
 * The AI review loop: copy the ready prompt (or open ChatGPT / Claude with it), then paste the
 * reply back. The app keeps the reply and the score, and turns the listed mistakes into exercises.
 */
export function AiReview({
  prompt,
  reviewKey,
  review,
  disabled,
  onSend,
  chat = false,
}: {
  prompt: string;
  reviewKey: string;
  /** What is being reviewed (saved together with the reply). */
  review: Omit<Review, "reply" | "score" | "date">;
  disabled?: boolean;
  /** Called before the prompt leaves the app, e.g. to save the text. */
  onSend?: () => void;
  /** A conversation (role-play) rather than a text to check. */
  chat?: boolean;
}) {
  const { reviews, saveReview } = useMistakes();
  const saved = reviews[reviewKey];
  const [copied, setCopied] = useState(false);
  const [reply, setReply] = useState("");
  const [editing, setEditing] = useState(!saved?.reply);
  const [result, setResult] = useState<{ added: number; parsed: boolean } | null>(null);

  const copy = async () => {
    onSend?.();
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const save = () => {
    const parsed = parseAiReply(reply);
    const added = saveReview(reviewKey, { ...review, reply, date: new Date().toISOString().slice(0, 10) }, parsed);
    setResult({ added, parsed: !!parsed });
    setEditing(false);
    setReply("");
  };

  return (
    <section className="ai-review">
      <div className="ai-step">
        <span className="ai-num">1</span>
        <div>
          <strong>{chat ? "Начни разговор с ИИ" : "Отправь на проверку ИИ"}</strong>
          <p className="muted small">
            {chat
              ? "Запрос уже готов: в нём роль, ситуация, твои цели и твой уровень. В конце ИИ даст разбор"
              : "Запрос уже готов: в нём задание, твой уровень, критерии экзамена и формат ответа"}
          </p>
          <div className="row wrap">
            <button className="btn btn-primary" onClick={copy} disabled={disabled}>
              {copied ? "Скопировано ✓" : "Скопировать запрос"}
            </button>
            {chatLinks(prompt).map((l) => (
              <a
                key={l.name}
                className={`btn ${disabled ? "disabled" : ""}`}
                href={disabled ? undefined : l.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  onSend?.();
                  void navigator.clipboard?.writeText(prompt).catch(() => undefined);
                }}
              >
                Открыть в {l.name}
              </a>
            ))}
          </div>
          {!chatLinks(prompt)[0].prefilled && (
            <p className="small warn-text">Запрос длинный: чат откроется пустым — вставь запрос из буфера (⌘V)</p>
          )}
          <details className="prompt-preview">
            <summary>Показать запрос</summary>
            <pre>{prompt}</pre>
          </details>
        </div>
      </div>

      <div className="ai-step">
        <span className="ai-num">2</span>
        <div>
          <strong>{chat ? "Вставь разбор ИИ сюда" : "Вставь ответ ИИ сюда"}</strong>
          <p className="muted small">Ошибки из ответа станут личными упражнениями «Исправь свою ошибку» и вернутся в разминке</p>
          {saved?.reply && !editing ? (
            <div className="review-saved">
              <p>
                Разбор сохранён {saved.date}
                {saved.score !== undefined && (
                  <>
                    {" "}
                    · оценка <strong>{saved.score} / 20</strong>
                  </>
                )}
              </p>
              {result && (
                <p className="small">
                  {result.parsed
                    ? result.added
                      ? `Добавлено ошибок в «Мои ошибки»: ${result.added}`
                      : "Новых ошибок нет — отлично"
                    : "Не нашёл блок с ошибками в конце ответа: ответ сохранён, но упражнения не созданы. Попроси ИИ добавить json-блок из запроса"}
                </p>
              )}
              <button className="link-btn" onClick={() => setEditing(true)}>
                Вставить новый ответ
              </button>
            </div>
          ) : (
            <>
              <textarea className="paste" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Вставь весь ответ ИИ, включая блок json в конце" rows={5} />
              <div className="row">
                <button className="btn" onClick={save} disabled={!reply.trim()}>
                  Сохранить разбор
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** Words in a Greek text, for essay length limits. */
export const countWords = (text: string) => text.split(/\s+/).filter((w) => /[Ͱ-Ͽἀ-῿]/.test(w)).length;
