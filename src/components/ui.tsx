import type { ReactNode } from "react";
import { canSpeak, speak } from "../lib/speech";
import { BackIcon, SpeakerIcon } from "./Icons";

export function PageHeader({
  title,
  subtitle,
  back,
  backLabel = "Назад",
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      {back && (
        <a className="back-link" href={back}>
          <BackIcon size={16} /> {backLabel}
        </a>
      )}
      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </header>
  );
}

export function SpeakButton({ text, size = 20 }: { text: string; size?: number }) {
  if (!canSpeak) return null;
  return (
    <button
      type="button"
      className="icon-btn speak"
      aria-label="Произнести"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
    >
      <SpeakerIcon size={size} />
    </button>
  );
}

export function ProgressBar({ value, max, tone = "accent" }: { value: number; max: number; tone?: "accent" | "good" }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`bar-fill ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value tabular">{value}</span>
      {note && <span className="stat-note">{note}</span>}
    </div>
  );
}

export const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);

/** Russian plural: plural(5, "слово", "слова", "слов") → "слов". */
export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
