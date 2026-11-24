import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { latinToGreek, withTonos } from "../lib/greek";
import { isTouch, useKeypad } from "../lib/settings";

const ROWS = [
  ["ς", "ε", "ρ", "τ", "υ", "θ", "ι", "ο", "π"],
  ["α", "σ", "δ", "φ", "γ", "η", "ξ", "κ", "λ"],
  ["ζ", "χ", "ψ", "ω", "β", "ν", "μ"],
];

/**
 * Text field for Greek answers. On a physical keyboard Latin keys type Greek (standard layout,
 * ";" then a vowel for the accent, ";" twice for the Greek question mark). On touch screens the
 * system keyboard is used; «αβγ» switches to the app's Greek keypad for phones without a Greek
 * layout, and the choice is remembered on the device.
 * `multiline`: a text area for writing tasks (Enter starts a new line, ⌘/Ctrl+Enter submits).
 */
export function GreekInput({
  value,
  onChange,
  onSubmit,
  disabled,
  autoFocus,
  multiline = false,
  placeholder = "Напиши по-гречески",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  // Ref + state: the ref is read by key handlers (fast typing can beat a re-render), the state drives the UI.
  const accentRef = useRef(false);
  const [deadAccent, setDeadAccentState] = useState(false);
  const setDeadAccent = (v: boolean | ((prev: boolean) => boolean)) => {
    accentRef.current = typeof v === "function" ? v(accentRef.current) : v;
    setDeadAccentState(accentRef.current);
  };
  const [touch] = useState(isTouch);
  const [keypad, setKeypad, keypadChosen] = useKeypad();
  const pad = touch && keypad;

  useEffect(() => {
    if (autoFocus && !touch) ref.current?.focus();
  }, [autoFocus, touch]);

  // Latest text, so consecutive keystrokes before a re-render build on each other.
  const valueRef = useRef(value);
  valueRef.current = value;

  const insert = (text: string) => {
    const el = ref.current;
    const current = valueRef.current;
    let start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    let before = current.slice(0, start);
    // A word ends: σ becomes final ς, as on a Greek keyboard.
    if (/^[\s.,;!?·]/.test(text) && before.endsWith("σ")) before = before.slice(0, -1) + "ς";
    start = before.length;
    const next = before + text + current.slice(end);
    valueRef.current = next;
    onChange(next);
    if (el) {
      // Keep the DOM and caret in step immediately; React re-renders with the same value.
      el.value = next;
      el.setSelectionRange(start + text.length, start + text.length);
    }
  };

  const typeLetter = (g: string) => {
    insert(accentRef.current ? withTonos(g) : g);
    setDeadAccent(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || e.nativeEvent.isComposing) return;
    if (e.key === ";" || e.key === "'") {
      e.preventDefault();
      // Pressed twice: the Greek question mark ";" itself.
      if (accentRef.current) {
        setDeadAccent(false);
        insert(";");
      } else setDeadAccent(true);
      return;
    }
    if (e.key === " " || e.key === "." || e.key === "," || e.key === "!") {
      e.preventDefault();
      insert(e.key);
      return;
    }
    if (e.key.length === 1) {
      const g = latinToGreek(e.key);
      if (g) {
        e.preventDefault();
        typeLetter(g);
      }
    }
  };

  const backspace = () => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    if (start !== end) {
      onChange(value.slice(0, start) + value.slice(end));
      return;
    }
    if (start === 0) return;
    onChange(value.slice(0, start - 1) + value.slice(start));
    requestAnimationFrame(() => el?.setSelectionRange(start - 1, start - 1));
  };

  return (
    <div className="greek-input">
      <div className={`field ${deadAccent ? "accent-armed" : ""}`}>
        {multiline ? (
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            inputMode={pad ? "none" : "text"}
            lang="el"
            rows={6}
            autoCapitalize="sentences"
            autoCorrect="off"
            spellCheck={false}
            placeholder={placeholder}
            aria-label="Текст по-гречески"
          />
        ) : (
          <input
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            inputMode={pad ? "none" : "text"}
            lang="el"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            aria-label="Ответ по-гречески"
          />
        )}
        {touch && (
          <button
            type="button"
            className="field-toggle"
            onClick={() => setKeypad(!keypad)}
            aria-pressed={pad}
            title={pad ? "Клавиатура телефона" : "Греческая клавиатура приложения"}
          >
            αβγ
          </button>
        )}
      </div>
      {touch && !keypadChosen && !disabled && <p className="hint-line">Нет греческой раскладки в телефоне? Нажми αβγ — откроется клавиатура приложения</p>}
      {!touch && (
        <p className="hint-line">
          Латинские клавиши печатают греческие буквы · <kbd>;</kbd> и гласная — ударение · <kbd>;</kbd><kbd>;</kbd> — знак вопроса · {multiline ? <><kbd>⌘</kbd><kbd>Enter</kbd> — готово</> : <><kbd>Enter</kbd> — проверить</>}
        </p>
      )}
      {pad && !disabled && (
        <div className="keypad" role="group" aria-label="Греческая клавиатура">
          {ROWS.map((row, i) => (
            <div key={i} className="keypad-row">
              {i === 2 && (
                <button type="button" className={`key wide ${deadAccent ? "on" : ""}`} onClick={() => setDeadAccent((d) => !d)} aria-label="Ударение">
                  ΄
                </button>
              )}
              {row.map((k) => (
                <button key={k} type="button" className="key" onClick={() => typeLetter(k)}>
                  {k}
                </button>
              ))}
              {i === 2 && (
                <button type="button" className="key wide" onClick={backspace} aria-label="Стереть">
                  ⌫
                </button>
              )}
            </div>
          ))}
          <div className="keypad-row">
            {[".", ",", ";"].map((k) => (
              <button key={k} type="button" className="key" onClick={() => insert(k)}>
                {k}
              </button>
            ))}
            <button type="button" className="key space" onClick={() => insert(" ")}>
              пробел
            </button>
            {multiline && (
              <button type="button" className="key wide" onClick={() => insert("\n")} aria-label="Новая строка">
                ↵
              </button>
            )}
            <button type="button" className="key wide primary" onClick={onSubmit}>
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
