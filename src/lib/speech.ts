/** Greek text-to-speech through the browser (iOS and macOS ship a Greek voice). */
let voice: SpeechSynthesisVoice | null | undefined;

function greekVoice(): SpeechSynthesisVoice | null {
  if (voice !== undefined) return voice;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null; // not loaded yet, try again next time
  voice = voices.find((v) => v.lang.toLowerCase().startsWith("el")) ?? null;
  return voice;
}

export const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text: string, rate = 0.9) {
  if (!canSpeak) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "el-GR";
  u.rate = rate;
  const v = greekVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

/** Read several lines one after another; `onLine` reports which line is being read (-1 at the end). */
export function speakAll(lines: string[], onLine?: (i: number) => void) {
  if (!canSpeak) return;
  speechSynthesis.cancel();
  const v = greekVoice();
  lines.forEach((text, i) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "el-GR";
    u.rate = 0.9;
    if (v) u.voice = v;
    u.onstart = () => onLine?.(i);
    if (i === lines.length - 1) u.onend = () => onLine?.(-1);
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak) speechSynthesis.cancel();
}
