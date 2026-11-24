/** Local calendar dates as "YYYY-MM-DD" strings: easy to compare, store and show. */
export type DateStr = string;

export function today(): DateStr {
  return toDateStr(new Date());
}

export function toDateStr(d: Date): DateStr {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(date: DateStr, days: number): DateStr {
  const [y, m, d] = date.split("-").map(Number);
  return toDateStr(new Date(y, m - 1, d + days));
}
