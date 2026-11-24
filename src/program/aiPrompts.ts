/**
 * Ready prompts for ChatGPT or Claude: everything a human teacher would review (essays, letters,
 * spoken role-plays) is reviewed by an AI. Instructions are in English so the chat links stay short
 * (Cyrillic triples in a URL); the AI answers in Russian. Every prompt ends with the same JSON block,
 * which the app reads back to save the score and turn each mistake into a personal exercise
 * (see docs/AI_REVIEW.md).
 */

const LEARNER =
  "The learner is a Russian-speaking adult living in Larnaca, Cyprus, learning Standard Modern Greek (not Cypriot dialect) on a course to level A2, preparing for the Ελληνομάθεια exam (Centre for the Greek Language).";

const JSON_TAIL = `At the very end, add this block exactly (a program reads it):
\`\`\`json
{"score": <total 0-20>, "errors": [{"wrong": "<short fragment with the mistake, 1-6 words, as the learner wrote it>", "right": "<corrected fragment>", "rule": "<the rule in Russian, one sentence>"}]}
\`\`\`
Up to 10 most important mistakes in "errors"; leave out purely stylistic ones.`;

export function essayPrompt(p: { level: string; task: string; requirements: string[]; words: [number, number]; text: string; title?: string }) {
  return `You are an experienced teacher of Modern Greek and an Ελληνομάθεια examiner. ${LEARNER} Current level: ${p.level}.

Review the learner's writing.
${p.title ? `Lesson: ${p.title}\n` : ""}Task (in Russian): ${p.task}
Requirements:
${p.requirements.map((r) => `- ${r}`).join("\n")}
- Length: ${p.words[0]}-${p.words[1]} words

Learner's text:
"""
${p.text.trim()}
"""

Answer in Russian, in this order:
1. The whole corrected text (monotonic accents), every correction in bold.
2. Mistakes as a table "было → стало → правило": grammar first (cases, articles, endings, tenses, stress), then vocabulary.
3. A score by the Ελληνομάθεια writing criteria for ${p.level}: task completion, vocabulary, grammar, coherence and spelling, 0-5 each, total out of 20. Do not take points off for things above ${p.level}.
4. What went well: 2-3 points.
5. What to revise: 3 concrete topics with examples.
6. How a native speaker would say it: rewrite 2 of my sentences more naturally, staying within ${p.level}.

${JSON_TAIL}`;
}

export function speakPrompt(p: { level: string; title: string; scenario: string; aiRole: string; goals: string[] }) {
  return `Let's practise speaking Modern Greek. ${LEARNER} Current level: ${p.level}.

Role-play "${p.title}" (the details are in Russian).
You are: ${p.aiRole}
Situation: ${p.scenario}
My goals in the conversation:
${p.goals.map((g) => `- ${g}`).join("\n")}

Rules:
- Speak only Greek, in simple ${p.level} sentences, 1-2 sentences at a time, then wait for my answer.
- Do not correct me during the conversation; keep it going (ask again only if you cannot understand me). If I switch to Russian, give me the Greek phrase I need.
- When the goals are done or I say "τέλος", step out of the role and give a review in Russian: my mistakes as "было → стало → правило", scores 0-5 for task completion, vocabulary, grammar and fluency, total out of 20, and 3 tips.

${JSON_TAIL}

Start with the first line of your role.`;
}

export function freePrompt(p: { level: string; topic: string; text: string }) {
  return essayPrompt({
    level: p.level,
    task: p.topic.trim() || "свободный текст ученика",
    requirements: ["Free topic: judge how clear and correct it is for the level"],
    words: [30, 400],
    text: p.text,
  });
}

/** Longer links are often refused by the sites; then the chat opens empty and the copied prompt is pasted. */
const MAX_URL = 8000;

/** Chat links that open with the prompt already typed in when it fits in a URL (it is always copied too). */
export function chatLinks(prompt: string) {
  const q = encodeURIComponent(prompt);
  const fits = q.length < MAX_URL;
  return [
    { name: "ChatGPT", url: fits ? `https://chatgpt.com/?q=${q}` : "https://chatgpt.com/", prefilled: fits },
    { name: "Claude", url: fits ? `https://claude.ai/new?q=${q}` : "https://claude.ai/new", prefilled: fits },
  ];
}
