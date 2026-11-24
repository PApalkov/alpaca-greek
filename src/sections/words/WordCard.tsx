import type { Word } from "../../data/words";
import { SpeakButton } from "../../components/ui";

export function WordDetails({ word, showTranslation = true }: { word: Word; showTranslation?: boolean }) {
  return (
    <div className="word-details">
      {showTranslation && <div className="ru big">{word.ru}</div>}
      {word.past && (
        <div className="past">
          <span className="tag">прош.</span> {word.past}
        </div>
      )}
      <ol className="examples">
        {word.ex.map((e, i) => (
          <li key={i}>
            <div className="row el">
              <span>{e.el}</span>
              <SpeakButton text={e.el} size={16} />
            </div>
            <div className="muted">{e.ru}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
