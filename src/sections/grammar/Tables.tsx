import { useState } from "react";
import { PageHeader, SpeakButton } from "../../components/ui";
import { GENDER_LABEL, NOUNS, withArticle, type Gender, type Slot } from "../../grammar/nouns";
import { href } from "../../lib/router";

const CASES: [string, Slot, Slot][] = [
  ["Им.", "nomSg", "nomPl"],
  ["Вин.", "accSg", "accPl"],
  ["Род.", "genSg", "genPl"],
];

export function Tables() {
  const [g, setG] = useState<Gender | "all">("all");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = NOUNS.filter((x) => (g === "all" || x.g === g) && (!query || x.key.toLowerCase().includes(query) || x.ru.includes(query)));

  return (
    <>
      <PageHeader title="Таблицы склонения" subtitle={`${NOUNS.length} существительных из домашних заданий`} back={href("grammar")} backLabel="Грамматика" />
      <div className="toolbar">
        <div className="segmented" role="tablist">
          {(["all", "m", "f", "n"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={g === k} className={g === k ? "active" : ""} onClick={() => setG(k)}>
              {k === "all" ? "Все" : GENDER_LABEL[k]}
            </button>
          ))}
        </div>
        <input className="search" placeholder="Поиск по-гречески или по-русски" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="noun-grid">
        {list.map((x) => (
          <article key={x.key} className="panel noun">
            <header className="row-between">
              <div>
                <strong className="el">{withArticle(x, "nomSg")}</strong>
                <div className="muted small">
                  {x.ru} · {GENDER_LABEL[x.g]}
                </div>
              </div>
              <SpeakButton text={withArticle(x, "nomSg")!} size={18} />
            </header>
            <table className="paradigm">
              <thead>
                <tr>
                  <th />
                  <th>Ед. ч.</th>
                  <th>Мн. ч.</th>
                </tr>
              </thead>
              <tbody>
                {CASES.map(([label, sg, pl]) => (
                  <tr key={label}>
                    <th>{label}</th>
                    <td className="el">{withArticle(x, sg) ?? "—"}</td>
                    <td className="el">{withArticle(x, pl) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ))}
      </div>
    </>
  );
}
