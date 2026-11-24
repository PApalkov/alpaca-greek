export type AlpacaMood = "calm" | "happy" | "sad" | "think";

/** The Alpaca Greek mascot: a fluffy alpaca in an Aegean-blue scarf with a meander stripe. */
export function Alpaca({ size = 96, mood = "calm" }: { size?: number; mood?: AlpacaMood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className="alpaca">
      {/* neck */}
      <path d="M40 88 Q40 120 44 120 L76 120 Q80 120 80 88 Z" fill="var(--fleece)" stroke="var(--cocoa)" strokeWidth="3" />
      {/* ears */}
      <ellipse cx="36" cy="30" rx="7" ry="15" transform="rotate(-18 36 30)" fill="var(--fleece)" stroke="var(--cocoa)" strokeWidth="3" />
      <ellipse cx="84" cy="30" rx="7" ry="15" transform="rotate(18 84 30)" fill="var(--fleece)" stroke="var(--cocoa)" strokeWidth="3" />
      <ellipse cx="36" cy="31" rx="3" ry="9" transform="rotate(-18 36 31)" fill="var(--blush)" />
      <ellipse cx="84" cy="31" rx="3" ry="9" transform="rotate(18 84 31)" fill="var(--blush)" />
      {/* head */}
      <ellipse cx="60" cy="62" rx="27" ry="30" fill="var(--fleece)" stroke="var(--cocoa)" strokeWidth="3" />
      {/* fluffy top */}
      <g fill="var(--fleece-hi)" stroke="var(--cocoa)" strokeWidth="3">
        <circle cx="44" cy="40" r="10" />
        <circle cx="76" cy="40" r="10" />
        <circle cx="52" cy="31" r="11" />
        <circle cx="68" cy="31" r="11" />
        <circle cx="60" cy="38" r="11" />
      </g>
      <path d="M38 44 Q60 54 82 44" fill="var(--fleece-hi)" />
      {/* eyes */}
      {mood === "happy" ? (
        <g fill="none" stroke="var(--cocoa)" strokeWidth="3" strokeLinecap="round">
          <path d="M44 63 Q49 57 54 63" />
          <path d="M66 63 Q71 57 76 63" />
        </g>
      ) : mood === "sad" ? (
        <g>
          <circle cx="49" cy="63" r="3.6" fill="var(--cocoa)" />
          <circle cx="71" cy="63" r="3.6" fill="var(--cocoa)" />
          <path d="M43 56 L53 58 M77 56 L67 58" stroke="var(--cocoa)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx="49" cy="62" r="4" fill="var(--cocoa)" />
          <circle cx="71" cy={mood === "think" ? 60 : 62} r="4" fill="var(--cocoa)" />
          <circle cx="50.4" cy="60.6" r="1.3" fill="#fff" />
          <circle cx="72.4" cy={mood === "think" ? 58.6 : 60.6} r="1.3" fill="#fff" />
        </g>
      )}
      <circle cx="41" cy="72" r="5" fill="var(--blush)" />
      <circle cx="79" cy="72" r="5" fill="var(--blush)" />
      {/* muzzle */}
      <ellipse cx="60" cy="80" rx="15" ry="11" fill="var(--muzzle)" stroke="var(--cocoa)" strokeWidth="3" />
      <path d="M55 75 Q57 77 55 78 M65 75 Q63 77 65 78" stroke="var(--cocoa)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {mood === "sad" ? (
        <path d="M54 86 Q60 82 66 86" stroke="var(--cocoa)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M54 83 Q57 87 60 84 Q63 87 66 83" stroke="var(--cocoa)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {/* scarf with meander */}
      <path d="M38 96 Q60 106 82 96 L82 108 Q60 118 38 108 Z" fill="var(--aegean)" stroke="var(--cocoa)" strokeWidth="3" strokeLinejoin="round" />
      <path
        d="M44 106 v-4 h4 v2 h-2 M52 108 v-4 h4 v2 h-2 M60 109 v-4 h4 v2 h-2 M68 108 v-4 h4 v2 h-2"
        stroke="#fff"
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  );
}
