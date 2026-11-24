import { useState } from "react";
import { TOPIC } from "../../grammar/questions";
import { today } from "../../lib/dates";
import { useProgress } from "../../lib/progress";
import { href } from "../../lib/router";
import { Session } from "../practice/Session";
import { pickMixed, pickSession } from "./topicStats";

/** One topic, 10 items. */
export function Drill({ id }: { id: string }) {
  const { items } = useProgress();
  const t = TOPIC.get(id)!;
  const [round, setRound] = useState(() => ({ n: 0, items: pickSession(t, items, today()) }));
  return (
    <Session
      key={round.n}
      items={round.items}
      exitHref={href("grammar", id)}
      onRestart={() => setRound({ n: round.n + 1, items: pickSession(t, items, today()) })}
    />
  );
}

/** Mixed practice across all grammar topics, weakest and due items first. */
export function MixedPractice() {
  const { items } = useProgress();
  const [round, setRound] = useState(() => ({ n: 0, items: pickMixed(items, today()) }));
  return (
    <Session
      key={round.n}
      items={round.items}
      exitHref={href("grammar")}
      onRestart={() => setRound({ n: round.n + 1, items: pickMixed(items, today()) })}
    />
  );
}
