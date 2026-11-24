import { useId } from "react";

export type AlpacaMood = "calm" | "happy" | "sad" | "think";

/** Mascot palette: cream fleece, navy ink, Aegean bandana, olive laurel. */
export const MASCOT = {
  ink: "#16357a",
  fleece: "#fff8ec",
  shade: "#efd8bd",
  ear: "#f59c8f",
  blush: "#f7b3a6",
  laurel: "#8c9a2e",
  laurelDark: "#66771c",
  glass: "#12275a",
  glint: "#6d8fd8",
  blue: "#1f63c6",
  white: "#ffffff",
};

/** Points along a quadratic curve, with the tangent angle, for leaves and meander keys. */
function along(p0: number[], p1: number[], p2: number[], n: number, from = 0.06, to = 0.94) {
  return Array.from({ length: n }, (_, i) => {
    const t = from + ((to - from) * i) / Math.max(1, n - 1);
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
    const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
  });
}

/** Head, ears and neck: drawn once as a white halo, once as the ink outline, once as fleece. */
const SILHOUETTE = (
  <>
    <path d="M41 32 C34 18 36 6 43 2 C51 6 53 18 51 30 Z" />
    <path d="M70 30 C69 16 76 5 84 4 C89 10 86 22 80 32 Z" />
    <path d="M40 64 C38 82 36 100 33 122 L90 122 C88 100 84 82 80 66 Z" />
    <ellipse cx="60" cy="50" rx="26" ry="22" />
    <path d="M68 52 Q93 45 98 58 Q98 69 85 70 Q73 70 68 62 Z" />
    <circle cx="42" cy="36" r="10" />
    <circle cx="52" cy="27" r="11" />
    <circle cx="64" cy="25" r="11" />
    <circle cx="76" cy="29" r="10" />
    <circle cx="84" cy="38" r="7" />
    <circle cx="35" cy="48" r="9" />
    <circle cx="36" cy="61" r="9" />
    <circle cx="37" cy="76" r="7" />
    <circle cx="35" cy="90" r="7" />
    <circle cx="84" cy="79" r="5" />
  </>
);

/** Bandana tails, knot and front point (the band itself is drawn on top of the neck). */
const BANDANA_BACK = (
  <>
    <path d="M34 89 L9 81 Q15 91 11 100 Z" />
    <path d="M34 95 L14 111 Q23 109 28 115 Z" />
    <path d="M48 101 L78 101 L64 121 Z" />
  </>
);

function Laurel() {
  const leaves = along([33, 40], [55, 18], [84, 31], 8);
  return (
    <g>
      <path d="M33 40 Q55 18 84 31" fill="none" stroke={MASCOT.laurelDark} strokeWidth="1.6" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.x}
          cy={l.y}
          rx="5.4"
          ry="2.3"
          transform={`rotate(${l.a + (i % 2 ? 36 : -36)} ${l.x} ${l.y}) translate(${i % 2 ? 3.2 : -3.2} 0)`}
          fill={i % 2 ? MASCOT.laurel : MASCOT.laurelDark}
          stroke={MASCOT.ink}
          strokeWidth="0.6"
        />
      ))}
    </g>
  );
}

function Bandana() {
  const keys = along([36, 91], [62, 105], [87, 91], 8, 0.1, 0.9);
  return (
    <g stroke={MASCOT.ink} strokeWidth="2.2" strokeLinejoin="round">
      <g fill={MASCOT.blue}>{BANDANA_BACK}</g>
      <path d="M22 86 L30 89 M20 104 L27 99 M56 106 H70" stroke={MASCOT.white} strokeWidth="2" strokeLinecap="round" />
      <path d="M37 84 Q62 98 86 84 L88 96 Q62 112 35 96 Z" fill={MASCOT.blue} />
      <path d="M36.2 88.4 Q62 102.6 87 88.6 L87.6 93.6 Q62 107.8 35.6 93.6 Z" fill={MASCOT.white} stroke="none" />
      {keys.map((k, i) => (
        <path
          key={i}
          d="M-2.2 1.6 V-1.4 H2 V0.9 H0 V0"
          transform={`translate(${k.x} ${k.y + 0.2}) rotate(${k.a})`}
          fill="none"
          strokeWidth="0.9"
          strokeLinecap="square"
        />
      ))}
      <circle cx="35" cy="92" r="5" fill={MASCOT.blue} />
    </g>
  );
}

/**
 * The Alpaca Greek mascot, after the brand badge: a cream alpaca in a laurel wreath, navy sunglasses
 * and a blue meander bandana. Mood shows in the brows and the mouth; the sunglasses stay on.
 */
export function Alpaca({ size = 96, mood = "calm" }: { size?: number; mood?: AlpacaMood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 124" aria-hidden="true" className="alpaca">
      <AlpacaArt mood={mood} />
    </svg>
  );
}

/** The mascot's drawing in a 120×124 box, for use inside other SVGs. */
export function AlpacaArt({ mood = "calm" }: { mood?: AlpacaMood }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* sticker halo and outline */}
      <g fill={MASCOT.white} stroke={MASCOT.white} strokeWidth="11">
        {SILHOUETTE}
        {BANDANA_BACK}
      </g>
      <g fill={MASCOT.ink} stroke={MASCOT.ink} strokeWidth="6">{SILHOUETTE}</g>
      <g fill={MASCOT.fleece}>{SILHOUETTE}</g>

      {/* ears, fleece shading */}
      <path d="M43.5 24 C40 16 41 9 44 6 C48 9 49 16 48.5 24 Z" fill={MASCOT.ear} />
      <path d="M74 24 C74 16 78 9 82.5 8 C84 13 82 19 78.5 25 Z" fill={MASCOT.ear} />
      <path d="M40 70 Q37 88 37 106 Q41 92 45 72 Z" fill={MASCOT.shade} opacity="0.7" />
      <g fill="none" stroke={MASCOT.shade} strokeWidth="2.6">
        <path d="M48 112 q5 -4 10 0" />
        <path d="M70 112 q5 -4 10 0" />
        <path d="M38 52 q3 -4 7 -3" />
      </g>

      <Laurel />

      {/* brows above the glasses */}
      {mood === "sad" && (
        <g stroke={MASCOT.ink} strokeWidth="2" fill="none">
          <path d="M51 38.5 L60 40.5" />
          <path d="M86 38 L76 40.5" />
        </g>
      )}
      {mood === "think" && (
        <g stroke={MASCOT.ink} strokeWidth="2" fill="none">
          <path d="M51 40 Q55 38.5 60 40" />
          <path d="M75 37.5 Q80 34 87 36.5" />
        </g>
      )}

      {/* sunglasses */}
      <g stroke={MASCOT.ink} strokeWidth="1.6">
        <path d="M50 44 L38 41" fill="none" strokeWidth="2.4" />
        <path d="M49 43 H65 Q65 54.5 57 55.5 Q49 54.5 49 43 Z" fill={MASCOT.glass} />
        <path d="M68 43 H90 Q90 57 79 58 Q68 57 68 43 Z" fill={MASCOT.glass} />
        <path d="M47.5 43.5 H92" fill="none" strokeWidth="2.8" />
      </g>
      <g stroke={MASCOT.glint} strokeWidth="1.8" fill="none">
        <path d="M52.5 48 l4 -2.6" />
        <path d="M72.5 48.5 l5 -3.2" />
      </g>

      {/* nose and mouth */}
      <path d="M89.5 55.5 q3 -1.8 5 0.4 q-0.9 3 -2.5 3 q-1.8 -0.2 -2.5 -3.4 Z" fill={MASCOT.ink} />
      <g stroke={MASCOT.ink} strokeWidth="2.2" fill="none">
        <path d="M92 58.8 v2.6" />
        {mood === "happy" ? (
          <path d="M82 61.5 Q87.5 68.5 93 61.5" />
        ) : mood === "sad" ? (
          <path d="M84 65.5 Q88.5 61.5 93 65" />
        ) : (
          <path d="M84 62.5 Q88.5 66.5 93 62" />
        )}
      </g>
      {mood !== "sad" && <ellipse cx="75" cy="63" rx="3.6" ry="2.1" fill={MASCOT.blush} />}

      <Bandana />
    </g>
  );
}

/** The round brand badge: meander ring, Aegean view, the mascot in front. Used for the app icon. */
export function AlpacaBadge({ size = 120 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className="alpaca-badge">
      <BadgeArt id={id} />
    </svg>
  );
}

export function BadgeArt({ id }: { id: string }) {
  const keys = Array.from({ length: 26 }, (_, i) => (i * 360) / 26);
  return (
    <g>
      <defs>
        <clipPath id={`clip${id}`}>
          <circle cx="60" cy="60" r="46.5" />
        </clipPath>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f9cf0" />
          <stop offset="1" stopColor="#bfe3ff" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="59" fill={MASCOT.white} />
      <circle cx="60" cy="60" r="56.5" fill={MASCOT.white} stroke={MASCOT.blue} strokeWidth="2.4" />
      <g stroke={MASCOT.blue} strokeWidth="1.5" fill="none" strokeLinecap="square">
        {keys.map((a) => (
          <path key={a} d="M54.8 12 V6.6 H64.2 V10.4 H58.6 V8.6" transform={`rotate(${a} 60 60)`} />
        ))}
      </g>
      <circle cx="60" cy="60" r="47.5" fill={`url(#sky${id})`} stroke={MASCOT.blue} strokeWidth="2.4" />
      <g clipPath={`url(#clip${id})`}>
        <path d="M0 70 H120 V120 H0 Z" fill="#2c7fd8" />
        <path d="M0 74 Q30 68 52 74 V120 H0 Z" fill="#3f8fe0" />
        <g fill="#ffffff" stroke="#c9dcf2" strokeWidth="0.6">
          <rect x="80" y="58" width="16" height="16" />
          <rect x="94" y="50" width="14" height="24" />
          <rect x="74" y="66" width="12" height="10" />
        </g>
        <path d="M95 50 Q101 39 107 50 Z" fill={MASCOT.blue} />
        <path d="M101 37 V41 M99.5 38.5 H102.5" stroke={MASCOT.blue} strokeWidth="1" />
        <rect x="83" y="62" width="3" height="5" rx="1.5" fill={MASCOT.blue} />
        <rect x="99" y="58" width="3" height="5" rx="1.5" fill={MASCOT.blue} />
        <g fill="#f4efe6" stroke="#9aa3ad" strokeWidth="0.6">
          <rect x="17" y="46" width="9" height="30" />
          <path d="M14 46 H29 V42 H14 Z" />
          <circle cx="15" cy="43.5" r="2" />
          <circle cx="28" cy="43.5" r="2" />
        </g>
        <path d="M60 70 L60 58 L66 69 Z" fill="#ffffff" />
        <path d="M54 70 H67 L65 73 H56 Z" fill="#ffffff" />
        <g fill="#ffffff" opacity="0.9">
          <ellipse cx="30" cy="27" rx="8" ry="3.5" />
          <circle cx="27" cy="24.5" r="3.6" />
          <circle cx="32" cy="23.5" r="4" />
          <ellipse cx="92" cy="31" rx="7" ry="3" />
          <circle cx="94" cy="28.5" r="3.4" />
        </g>
        <g transform="translate(20 22) scale(0.8)">
          <AlpacaArt mood="happy" />
        </g>
      </g>
    </g>
  );
}
