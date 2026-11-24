import { questionKey, type Item } from "../../grammar/questions";
import { today } from "../../lib/dates";
import { isDue } from "../../lib/leitner";
import { EMPTY_COURSE, WARMUP_ITEMS, WARMUP_WORDS, type CourseState } from "../../lib/lesson";
import { useMistakes } from "../../lib/mistakes";
import { useProgress } from "../../lib/progress";
import { LESSON, LESSON_ITEMS } from "../../program";
import { useContent } from "../../program/useContent";
import type { Lesson } from "../../program/types";
import { dueWords } from "../words/wordStats";

/** Course progress: the current lesson, finished lessons, resume point, and the daily warm-up. */
export function useCourse() {
  const { items, meta, setMeta } = useProgress();
  const { items: personal } = useMistakes();
  const { lessons } = useContent();
  const course: CourseState = { ...EMPTY_COURSE, ...(meta.course as Partial<CourseState> | undefined) };
  const on = today();

  const save = (patch: Partial<CourseState>) => setMeta("course", { ...course, ...patch });

  const firstOpen = lessons.find((l) => !course.done[l.id]);
  const current: Lesson | undefined = (course.current && LESSON.get(course.current)) || firstOpen;
  const doneToday = Object.entries(course.done).filter(([, d]) => d === on).map(([id]) => LESSON.get(id)!).filter(Boolean);

  const warmupWords = dueWords(items, on).slice(0, WARMUP_WORDS);
  // Due exercises from earlier lessons and the learner's own mistakes from AI reviews.
  const warmupItems: Item[] = [...LESSON_ITEMS.values(), ...personal]
    .filter((q) => {
      const s = items.get(questionKey(q));
      return s && isDue(s, on);
    })
    .sort((a, b) => items.get(questionKey(a))!.box - items.get(questionKey(b))!.box)
    .slice(0, WARMUP_ITEMS);

  /** Mark finished and move the "current" pointer to the next lesson. */
  const complete = (id: string) => {
    const i = lessons.findIndex((l) => l.id === id);
    const next = lessons.slice(i + 1).find((l) => !course.done[l.id]);
    save({ done: { ...course.done, [id]: on }, current: next?.id, resume: undefined });
  };

  return {
    course,
    current,
    doneToday,
    warmupWords,
    warmupItems,
    complete,
    setCurrent: (id: string) => save({ current: id, resume: undefined }),
    setResume: (id: string, step: number) => save({ resume: { id, step } }),
    saveWriting: (id: string, text: string) => save({ writing: { ...course.writing, [id]: text } }),
  };
}
