import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CheckIcon } from "./Icons";

export type StepEntry = { label: string; done: boolean };

/** Set by the lesson player: the lesson's parts, so any focus screen inside it can jump between them. */
export const StepMenuContext = createContext<{ steps: StepEntry[]; current: number; jump: (index: number) => void } | null>(null);

/** «Шаги» button in the focus header: the lesson's contents, any part can be opened in any order. */
export function StepMenu() {
  const nav = useContext(StepMenuContext);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      // Keep the screen underneath (cards, exercises) from reacting to keys while the menu is open.
      e.stopPropagation();
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  if (!nav) return null;
  return (
    <div className="step-menu" ref={ref}>
      <button className="btn btn-quiet btn-small" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}>
        Шаги <span className="step-menu-count tabular">{nav.current + 1}/{nav.steps.length}</span>
      </button>
      {open && (
        <ol className="step-menu-list" role="menu">
          {nav.steps.map((s, i) => (
            <li key={i}>
              <button
                role="menuitem"
                className={`step-menu-item${i === nav.current ? " current" : ""}`}
                onClick={() => {
                  setOpen(false);
                  if (i !== nav.current) nav.jump(i);
                }}
              >
                <span className={`step-menu-mark${s.done ? " done" : ""}`}>{s.done ? <CheckIcon size={14} /> : i + 1}</span>
                <span>{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
