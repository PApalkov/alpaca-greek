import { useId } from "react";

export type SceneVariant = "village" | "harbor" | "temple" | "grove";

const C = {
  cocoa: "#4a3426",
  fleece: "#fffaf2",
  fleeceHi: "#fffdf8",
  muzzle: "#f1dfc8",
  blush: "#f4b6a0",
  aegean: "#2457a6",
  white: "#ffffff",
  wall: "#f7f3ec",
  shade: "#dfe6ef",
  dome: "#2f6fd6",
  sea: "#3d8ee8",
  seaDeep: "#2a6fc9",
  hillFar: "#9fcf8a",
  hill: "#7fbf63",
  field: "#8fd06f",
  fieldDark: "#5fa84a",
  olive: "#5f8f3e",
  oliveLight: "#86b55a",
  trunk: "#7a5236",
  sand: "#efd9a9",
  sun: "#ffe08a",
  orange: "#ff8a1f",
};

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity="0.95">
      <ellipse cx="0" cy="0" rx="26" ry="11" />
      <circle cx="-10" cy="-8" r="11" />
      <circle cx="8" cy="-11" r="14" />
      <circle cx="22" cy="-3" r="9" />
    </g>
  );
}

function OliveTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-3 0 Q-5 -18 -1 -30 L3 -30 Q1 -16 4 0 Z" fill={C.trunk} />
      <ellipse cx="0" cy="-38" rx="22" ry="14" fill={C.olive} />
      <ellipse cx="-12" cy="-44" rx="12" ry="9" fill={C.oliveLight} />
      <ellipse cx="10" cy="-47" rx="13" ry="9" fill={C.oliveLight} />
      <ellipse cx="2" cy="-34" rx="10" ry="6" fill={C.olive} opacity="0.7" />
    </g>
  );
}

function Cypress({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-1.5" y="-6" width="3" height="6" fill={C.trunk} />
      <path d="M0 -62 Q11 -30 7 -6 L-7 -6 Q-11 -30 0 -62 Z" fill="#3f7a3a" />
      <path d="M0 -62 Q5 -34 3 -8" stroke="#5c9a4c" strokeWidth="3" fill="none" />
    </g>
  );
}

function House({ x, y, w = 34, h = 26, dome = false, door = true }: { x: number; y: number; w?: number; h?: number; dome?: boolean; door?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y={-h} width={w} height={h} fill={C.wall} />
      <rect x={w - 7} y={-h} width="7" height={h} fill={C.shade} />
      {dome ? (
        <>
          <rect x={w / 2 - 9} y={-h - 6} width="18" height="6" fill={C.wall} />
          <path d={`M${w / 2 - 11} ${-h - 6} Q${w / 2} ${-h - 26} ${w / 2 + 11} ${-h - 6} Z`} fill={C.dome} />
          <rect x={w / 2 - 0.8} y={-h - 30} width="1.6" height="7" fill={C.dome} />
        </>
      ) : (
        <rect x="-2" y={-h - 3} width={w + 4} height="3" fill={C.white} />
      )}
      <rect x="5" y={-h + 7} width="6" height="7" rx="1" fill={C.dome} />
      {door && <path d={`M${w / 2 - 4} 0 V${-10} Q${w / 2} ${-14} ${w / 2 + 4} ${-10} V0 Z`} fill={C.dome} />}
    </g>
  );
}

function Column({ x, y, h = 70 }: { x: number; y: number; h?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-9" y="-6" width="18" height="6" fill="#efe7d8" />
      <rect x="-6" y={-h} width="12" height={h - 6} fill="#fbf6ec" />
      <rect x="-6" y={-h} width="3" height={h - 6} fill="#e6dccb" />
      <rect x="1" y={-h} width="2" height={h - 6} fill="#efe7d8" />
      <rect x="-9" y={-h - 6} width="18" height="6" fill="#efe7d8" />
    </g>
  );
}

function Boat({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-30 0 L30 0 L22 12 L-22 12 Z" fill={C.white} />
      <path d="M-30 0 L30 0 L28 4 L-28 4 Z" fill={C.orange} />
      <rect x="-1" y="-40" width="2" height="40" fill={C.trunk} />
      <path d="M2 -38 L26 -4 L2 -4 Z" fill={C.white} />
      <path d="M-2 -32 L-20 -4 L-2 -4 Z" fill="#ffe2c4" />
    </g>
  );
}

/** Side-view alpaca in an Aegean saddle blanket, for the illustrated scenes. */
export function StandingAlpaca({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={C.cocoa} strokeWidth="2.5" strokeLinejoin="round">
      {/* legs */}
      <g fill={C.fleece}>
        <rect x="-30" y="-24" width="9" height="24" rx="4" />
        <rect x="-16" y="-24" width="9" height="24" rx="4" />
        <rect x="8" y="-24" width="9" height="24" rx="4" />
        <rect x="22" y="-24" width="9" height="24" rx="4" />
      </g>
      {/* body */}
      <ellipse cx="0" cy="-36" rx="38" ry="22" fill={C.fleece} />
      <path d="M-36 -38 q-10 -2 -10 8" fill="none" />
      {/* blanket */}
      <path d="M-14 -56 Q2 -60 16 -56 L18 -28 Q2 -24 -14 -28 Z" fill={C.aegean} />
      <path d="M-10 -36 v-4 h4 v2 h-2 M-1 -36 v-4 h4 v2 h-2 M8 -36 v-4 h4 v2 h-2" stroke="#fff" strokeWidth="1.4" fill="none" />
      {/* neck */}
      <path d="M22 -48 Q26 -82 30 -96 L46 -94 Q42 -70 40 -40 Z" fill={C.fleece} />
      {/* head */}
      <ellipse cx="40" cy="-104" rx="16" ry="14" fill={C.fleece} />
      <ellipse cx="54" cy="-98" rx="9" ry="7.5" fill={C.muzzle} />
      <ellipse cx="32" cy="-122" rx="4" ry="9" transform="rotate(-12 32 -122)" fill={C.fleece} />
      <ellipse cx="44" cy="-123" rx="4" ry="9" transform="rotate(10 44 -123)" fill={C.fleece} />
      <g fill={C.fleeceHi}>
        <circle cx="32" cy="-113" r="7" />
        <circle cx="40" cy="-116" r="7" />
        <circle cx="26" cy="-104" r="6" />
      </g>
      <circle cx="46" cy="-106" r="2.4" fill={C.cocoa} stroke="none" />
      <circle cx="44" cy="-100" r="3" fill={C.blush} stroke="none" />
      <path d="M53 -94 q3 2 6 0" fill="none" strokeWidth="2" strokeLinecap="round" />
      {/* tail */}
      <circle cx="-38" cy="-44" r="7" fill={C.fleeceHi} />
    </g>
  );
}

/** Flat illustrated Greek landscapes used as page headers and card art. */
export function Scene({ variant = "village", height = 300, className = "" }: { variant?: SceneVariant; height?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`scene ${className}`} viewBox="0 0 390 300" preserveAspectRatio="xMidYMax slice" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={variant === "grove" ? "#ffb35c" : "#4f86f7"} />
          <stop offset="0.55" stopColor={variant === "grove" ? "#ffd89a" : "#8fc2ff"} />
          <stop offset="1" stopColor={variant === "grove" ? "#fff1cf" : "#dff0ff"} />
        </linearGradient>
        <linearGradient id={`sea${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sea} />
          <stop offset="1" stopColor={C.seaDeep} />
        </linearGradient>
        <linearGradient id={`field${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.field} />
          <stop offset="1" stopColor={C.fieldDark} />
        </linearGradient>
      </defs>
      <rect width="390" height="300" fill={`url(#sky${id})`} />
      <circle cx="300" cy="78" r="34" fill={C.sun} opacity="0.55" />
      <circle cx="300" cy="78" r="22" fill={C.sun} />
      <Cloud x={70} y={70} />
      <Cloud x={220} y={48} s={0.7} />
      <Cloud x={350} y={120} s={0.8} />

      {variant !== "grove" && <rect x="0" y="176" width="390" height="60" fill={`url(#sea${id})`} />}
      {variant !== "grove" && (
        <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5">
          <path d="M40 196 h18 M120 206 h26 M250 192 h20 M320 210 h16" />
        </g>
      )}

      {variant === "village" && (
        <>
          <path d="M150 190 Q230 120 330 140 Q370 150 390 170 V240 H150 Z" fill={C.sand} />
          <House x={196} y={176} w={30} h={22} />
          <House x={228} y={168} w={36} h={28} dome />
          <House x={268} y={166} w={30} h={24} />
          <House x={300} y={174} w={32} h={22} />
          <House x={214} y={200} w={34} h={24} />
          <House x={252} y={198} w={40} h={26} />
          <House x={296} y={204} w={30} h={24} dome />
          <House x={330} y={200} w={36} h={26} />
        </>
      )}
      {variant === "harbor" && (
        <>
          <path d="M0 170 Q60 140 130 160 L130 200 H0 Z" fill={C.hillFar} />
          <House x={18} y={176} w={28} h={20} />
          <House x={50} y={170} w={32} h={24} dome />
          <House x={86} y={176} w={28} h={20} />
          <Boat x={230} y={200} />
          <Boat x={320} y={214} />
        </>
      )}
      {variant === "temple" && (
        <>
          <path d="M120 186 Q200 130 300 150 Q360 160 390 180 V240 H120 Z" fill={C.sand} />
          <g transform="translate(168 0)">
            <rect x="0" y="176" width="150" height="8" fill="#e6dccb" />
            <rect x="6" y="170" width="138" height="6" fill="#efe7d8" />
            {[18, 46, 74, 102, 130].map((cx) => (
              <Column key={cx} x={cx} y={170} h={58} />
            ))}
            <rect x="4" y="100" width="142" height="8" fill="#efe7d8" />
            <path d="M0 100 L75 76 L150 100 Z" fill="#fbf6ec" />
            <path d="M14 98 L75 80 L136 98 Z" fill="#efe7d8" />
          </g>
        </>
      )}
      {variant === "grove" && (
        <>
          <path d="M0 170 Q100 130 200 160 Q300 120 390 150 V240 H0 Z" fill={C.hillFar} />
          <OliveTree x={60} y={190} s={0.8} />
          <OliveTree x={150} y={180} s={0.7} />
          <OliveTree x={330} y={186} s={0.8} />
        </>
      )}

      {/* foreground */}
      <path d="M0 236 Q120 214 220 230 Q320 244 390 226 V300 H0 Z" fill={`url(#field${id})`} />
      <path d="M150 300 Q190 260 250 238 Q262 236 270 240 Q220 266 210 300 Z" fill={C.sand} opacity="0.85" />
      <Cypress x={28} y={252} s={1.1} />
      <OliveTree x={110} y={262} s={1.1} />
      {variant !== "grove" && <OliveTree x={360} y={266} s={0.9} />}
      {/* kept above the bottom ~45 units, which the overlapping card covers */}
      <StandingAlpaca x={variant === "temple" ? 92 : 270} y={262} s={0.95} flip={variant === "temple"} />
    </svg>
  );
}
