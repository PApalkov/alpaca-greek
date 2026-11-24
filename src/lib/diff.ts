import { normalizeAnswer } from "./greek";

/** One character of the learner's answer, compared with the expected one. */
export interface Mark {
  ch: string;
  /** ok: right; accent: right letter, wrong or missing stress; wrong: not in the answer; missing: a letter is absent here. */
  kind: "ok" | "accent" | "wrong" | "missing";
}

const base = (c: string) => c.normalize("NFD").replace(/\p{M}/gu, "");

/** Letters aligned by longest common subsequence (ignoring stress), so one typo does not mark the rest. */
function align(a: string[], b: string[]) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) dp[i][j] = base(a[i]) === base(b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (base(a[i]) === base(b[j])) (pairs.push([i, j]), i++, j++);
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { pairs, score: dp[0][0] };
}

/** Marks for the typed text against the closest of the accepted answers (case and punctuation ignored). */
export function diffMarks(typed: string, answers: string[]): Mark[] {
  const a = [...normalizeAnswer(typed)];
  let best = { target: [...normalizeAnswer(answers[0])], ...align(a, [...normalizeAnswer(answers[0])]) };
  for (const ans of answers.slice(1)) {
    const t = [...normalizeAnswer(ans)];
    const r = align(a, t);
    if (r.score - Math.abs(t.length - a.length) > best.score - Math.abs(best.target.length - a.length)) best = { target: t, ...r };
  }
  const marks: Mark[] = [];
  let ti = 0;
  let pi = 0;
  a.forEach((ch, i) => {
    const pair = best.pairs[pi];
    if (pair && pair[0] === i) {
      // Letters of the answer skipped before this one are missing here.
      if (pair[1] > ti) marks.push({ ch: "", kind: "missing" });
      marks.push({ ch, kind: ch === best.target[pair[1]] ? "ok" : "accent" });
      ti = pair[1] + 1;
      pi++;
    } else marks.push({ ch, kind: "wrong" });
  });
  if (ti < best.target.length) marks.push({ ch: "", kind: "missing" });
  return marks;
}
