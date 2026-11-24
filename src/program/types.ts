/**
 * Course format. A core lesson is a single flow: new words → the words in a dialogue → the grammar the
 * dialogue used → practice built from exactly those words and that grammar → writing about yourself.
 * Practice, task and test lessons add longer texts, comprehension, essays and speaking that are
 * reviewed by an AI (see docs/AI_REVIEW.md). Lessons are generated in separate sessions with
 * docs/LESSON_PROMPT.md and checked with `npm run validate:program`.
 */

import type { SceneVariant } from "../components/Scene";
import type { RuleBlock } from "../grammar/questions";

/**
 * core: new words and one grammar point · practice: no new grammar, longer and harder tasks ·
 * task: a big piece of work (essay, role-play) reviewed by AI · test: exam format (Ελληνομάθεια).
 */
export type LessonType = "core" | "practice" | "task" | "test";

/** A word that is not in the card deck (src/data/words.json). Deck words are referenced by their exact `el`. */
export interface LessonWord {
  el: string;
  tr: string;
  ru: string;
  example?: { el: string; ru: string };
}

export type Exercise =
  /** Type the missing part. `prompt` contains "___". `options` (optional) are shown only as a hint. */
  | { kind: "gap"; prompt: string; answer: string; accept?: string[]; hint: string; explain?: string; options?: string[] }
  /** Translate a Russian sentence into Greek by typing it. List every natural variant in `accept`. */
  | { kind: "translate"; ru: string; answer: string; accept?: string[]; explain?: string }
  /** Assemble the Greek sentence from tiles; `extra` are wrong forms mixed in (auto-generated when omitted). */
  | { kind: "build"; ru: string; answer: string; extra?: string[]; explain?: string }
  /** Dictation: the app reads `el` aloud, the learner types it. */
  | { kind: "listen"; el: string; ru: string }
  /** Find the mistake: the wrong part in [brackets]; no brackets = the sentence is correct. */
  | { kind: "spot"; el: string; fix: string; ru: string; explain: string }
  /** Comprehension of the step's text (reading, listening): pick the answer. Only for understanding, never for producing forms. */
  | { kind: "choose"; question: string; options: string[]; answer: string; explain?: string };

export interface DialogueLine {
  who: string;
  el: string;
  ru: string;
}

export interface WriteHint {
  text: string;
  /** Ticked automatically when the text contains one of these (accents and case ignored). */
  check?: string[];
}

export type Step =
  | { kind: "words"; title?: string }
  /** `listenFirst`: the text is hidden until the learner has listened to it (listening comprehension). */
  | { kind: "dialogue"; title: string; lines: DialogueLine[]; listenFirst?: boolean }
  | { kind: "reading"; title: string; text: { el: string; ru: string }[]; listenFirst?: boolean }
  | { kind: "grammar"; title: string; blocks: RuleBlock[] }
  | { kind: "practice"; title: string; exercises: Exercise[] }
  /** Short guided writing, self-checked against a model. */
  | { kind: "write"; task: string; hints: WriteHint[]; model: string[] }
  /** A longer text reviewed by an AI with a ready prompt; its mistakes become personal exercises. */
  | { kind: "essay"; task: string; requirements: string[]; words: [number, number] }
  /** Role-play with an AI (by voice or text) with a ready prompt; the AI corrects at the end. */
  | { kind: "speak"; title: string; scenario: string; aiRole: string; goals: string[] };

export interface Lesson {
  /** Stable id, e.g. "e1-l03". Progress is stored under it: never rename. */
  id: string;
  /** Default "core". */
  type?: LessonType;
  /** Greek title, a phrase the learner will be able to say. */
  title: string;
  titleRu: string;
  /** "Сможешь: …" — what the learner can do after the lesson. */
  goal: string;
  scene: SceneVariant;
  /** New deck words, by their exact `el` in words.json. */
  words: string[];
  /** New words that are not in the deck. */
  extraWords?: LessonWord[];
  steps: Step[];
}

export interface Epoch {
  id: string;
  level: string;
  title: string;
  titleRu: string;
  summary: string;
  lessons: Lesson[];
}

/** Outline of an epoch that is not written yet: the input for docs/LESSON_PROMPT.md. */
export interface EpochPlan {
  id: string;
  level: string;
  title: string;
  titleRu: string;
  summary: string;
  lessons: LessonPlan[];
}

export interface LessonPlan {
  title: string;
  type: LessonType;
  theme: string;
  /** Grammar point (core), what is practised (practice), or the task/test content. */
  grammar: string;
  can: string;
}
