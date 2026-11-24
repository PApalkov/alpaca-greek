import { useId, type ReactNode } from "react";
import { MASCOT } from "./Alpaca";

/** Lesson covers: real places of Larnaca and Cyprus. Pick the one that fits the lesson's story. */
export const SCENES = ["village", "harbor", "temple", "grove", "promenade", "market", "beach", "lake", "church", "night", "home", "mountain"] as const;
export type SceneVariant = (typeof SCENES)[number];

const C = {
  white: "#ffffff",
  wall: "#f7f3ec",
  shade: "#dfe6ef",
  dome: "#2f6fd6",
  sea: "#3d8ee8",
  seaDeep: "#2a6fc9",
  hillFar: "#9fcf8a",
  field: "#8fd06f",
  fieldDark: "#5fa84a",
  olive: "#5f8f3e",
  oliveLight: "#86b55a",
  trunk: "#7a5236",
  palm: "#3f8f4a",
  palmLight: "#5aa957",
  sand: "#efd9a9",
  stone: "#e7cf9f",
  stoneShade: "#d2b47c",
  sun: "#ffe08a",
  orange: "#ff8a1f",
  tomato: "#e8463a",
  pink: "#f58fa8",
  bougainvillea: "#e0479e",
  terracotta: "#d9824f",
};

type Sky = "day" | "sunset" | "night" | "dawn";
type Ground = "field" | "sand" | "paving" | "balcony" | "nightPaving";
type Look = { sky: Sky; sea: boolean; ground: Ground; alpacaX: number; flip?: boolean };

const LOOK: Record<SceneVariant, Look> = {
  village: { sky: "day", sea: true, ground: "field", alpacaX: 255 },
  harbor: { sky: "day", sea: true, ground: "field", alpacaX: 255 },
  temple: { sky: "day", sea: true, ground: "field", alpacaX: 128, flip: true },
  grove: { sky: "sunset", sea: false, ground: "field", alpacaX: 255 },
  promenade: { sky: "day", sea: true, ground: "paving", alpacaX: 255 },
  market: { sky: "day", sea: false, ground: "paving", alpacaX: 255 },
  beach: { sky: "day", sea: true, ground: "sand", alpacaX: 255 },
  lake: { sky: "dawn", sea: false, ground: "sand", alpacaX: 255 },
  church: { sky: "day", sea: false, ground: "paving", alpacaX: 128, flip: true },
  night: { sky: "night", sea: true, ground: "nightPaving", alpacaX: 255 },
  home: { sky: "day", sea: true, ground: "balcony", alpacaX: 255 },
  mountain: { sky: "day", sea: false, ground: "field", alpacaX: 255 },
};

const SKY: Record<Sky, [string, string, string]> = {
  day: ["#4f86f7", "#8fc2ff", "#dff0ff"],
  sunset: ["#ffb35c", "#ffd89a", "#fff1cf"],
  night: ["#0d1a45", "#23377f", "#4d61ab"],
  dawn: ["#f6a6b6", "#fcd3c6", "#fff0de"],
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

function Pine({ x, y, s = 1, c = "#2f6b3f" }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
      <rect x="-1.5" y="-6" width="3" height="6" fill={C.trunk} />
      <path d="M0 -44 L12 -22 H-12 Z" />
      <path d="M0 -34 L15 -6 H-15 Z" />
    </g>
  );
}

function Palm({ x, y, s = 1, lean = 1 }: { x: number; y: number; s?: number; lean?: number }) {
  const top = { x: 6 * lean, y: -80 };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-3 0 Q${-6 * lean} -40 ${top.x - 2} ${top.y} L${top.x + 2} ${top.y} Q${-1 * lean} -40 3 0 Z`} fill="#a07650" />
      <g stroke="#8a6040" strokeWidth="1.2">
        {[-14, -28, -42, -56, -70].map((yy) => (
          <path key={yy} d={`M${-3 + (yy / -80) * top.x} ${yy} h6`} />
        ))}
      </g>
      {[-170, -135, -100, -70, -35, -5, 20].map((a, i) => (
        <path
          key={a}
          d="M0 0 Q16 -9 34 5 Q17 -2 0 0 Z"
          transform={`translate(${top.x} ${top.y}) rotate(${a})`}
          fill={i % 2 ? C.palm : C.palmLight}
        />
      ))}
    </g>
  );
}

function House({ x, y, w = 34, h = 26, dome = false, door = true, lit = false }: { x: number; y: number; w?: number; h?: number; dome?: boolean; door?: boolean; lit?: boolean }) {
  const win = lit ? "#ffd86b" : C.dome;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y={-h} width={w} height={h} fill={lit ? "#c9cfe6" : C.wall} />
      <rect x={w - 7} y={-h} width="7" height={h} fill={lit ? "#9aa3c8" : C.shade} />
      {dome ? (
        <>
          <rect x={w / 2 - 9} y={-h - 6} width="18" height="6" fill={lit ? "#c9cfe6" : C.wall} />
          <path d={`M${w / 2 - 11} ${-h - 6} Q${w / 2} ${-h - 26} ${w / 2 + 11} ${-h - 6} Z`} fill={C.dome} />
          <rect x={w / 2 - 0.8} y={-h - 30} width="1.6" height="7" fill={C.dome} />
        </>
      ) : (
        <rect x="-2" y={-h - 3} width={w + 4} height="3" fill={lit ? "#dfe3f3" : C.white} />
      )}
      <rect x="5" y={-h + 7} width="6" height="7" rx="1" fill={win} />
      {door && <path d={`M${w / 2 - 4} 0 V${-10} Q${w / 2} ${-14} ${w / 2 + 4} ${-10} V0 Z`} fill={win} />}
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

function Boat({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-30 0 L30 0 L22 12 L-22 12 Z" fill={C.white} />
      <path d="M-30 0 L30 0 L28 4 L-28 4 Z" fill={C.orange} />
      <rect x="-1" y="-40" width="2" height="40" fill={C.trunk} />
      <path d="M2 -38 L26 -4 L2 -4 Z" fill={C.white} />
      <path d="M-2 -32 L-20 -4 L-2 -4 Z" fill="#ffe2c4" />
    </g>
  );
}

function Umbrella({ x, y, c = C.dome, s = 1 }: { x: number; y: number; c?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-1.2" y="-44" width="2.4" height="44" fill="#6b5240" />
      <path d="M-30 -40 Q0 -64 30 -40 Z" fill={c} />
      <path d="M0 -58 Q-6 -50 -11 -40 H-3 Z M0 -58 Q6 -50 11 -40 H3 Z" fill={C.white} />
      <path d="M-30 -40 Q-25 -36 -20 -40 Q-15 -36 -10 -40 Q-5 -36 0 -40 Q5 -36 10 -40 Q15 -36 20 -40 Q25 -36 30 -40 Z" fill={c} />
    </g>
  );
}

function CafeTable({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="-20" rx="13" ry="3.5" fill={C.white} />
      <rect x="-1.2" y="-20" width="2.4" height="20" fill="#6b5240" />
      <path d="M-22 0 V-16 H-16 V-10 H-11 V0 M22 0 V-16 H16 V-10 H11 V0" stroke="#3e5d8f" strokeWidth="2" fill="none" />
      <rect x="-4" y="-27" width="5" height="6" rx="1" fill={C.white} stroke="#c9b9a2" strokeWidth="0.8" />
    </g>
  );
}

function Stall({ x, y, c, fruit }: { x: number; y: number; c: string; fruit: string[] }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-34" y="-52" width="3" height="52" fill="#7a5236" />
      <rect x="31" y="-52" width="3" height="52" fill="#7a5236" />
      <path d="M-40 -60 H40 L44 -48 H-44 Z" fill={c} />
      {[-30, -10, 10, 30].map((sx) => (
        <path key={sx} d={`M${sx - 5} -60 H${sx + 5} L${sx + 5.5} -48 H${sx - 5.5} Z`} fill={C.white} />
      ))}
      <path d="M-44 -48 Q-39 -42 -33 -48 Q-28 -42 -22 -48 Q-17 -42 -11 -48 Q-6 -42 0 -48 Q6 -42 11 -48 Q17 -42 22 -48 Q28 -42 33 -48 Q39 -42 44 -48 Z" fill={c} />
      <rect x="-32" y="-26" width="64" height="20" fill="#b7864f" />
      <rect x="-32" y="-26" width="64" height="4" fill="#9c6e3c" />
      {fruit.map((f, i) => (
        <g key={i} fill={f}>
          {[0, 1, 2, 3].map((k) => (
            <circle key={k} cx={-24 + i * 16 + (k % 2) * 6} cy={-29 - Math.floor(k / 2) * 5} r="3.6" />
          ))}
        </g>
      ))}
    </g>
  );
}

function Flamingo({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0 V-22 M3 -10 L-3 -16 L2 -22" stroke="#d9667f" strokeWidth="1.6" fill="none" />
      <ellipse cx="2" cy="-28" rx="10" ry="6.5" fill={C.pink} />
      <path d="M-8 -30 Q-12 -27 -9 -24" fill={C.pink} />
      <path d="M10 -30 Q16 -44 8 -50 Q2 -54 6 -59" stroke={C.pink} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="7" cy="-59" r="3" fill={C.pink} />
      <path d="M9 -60 L14 -57 L10 -55 Z" fill="#2b2b2b" />
    </g>
  );
}

function Lamp({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="-54" r="14" fill="#ffe08a" opacity="0.16" />
      <rect x="-1.5" y="-50" width="3" height="50" fill="#1b2347" />
      <path d="M-6 -50 H6 L4 -58 H-4 Z" fill="#1b2347" />
      <circle cx="0" cy="-54" r="3.5" fill="#ffe08a" />
    </g>
  );
}

/** Agios Lazaros, Larnaca: stone church with an arcade and a tall bell tower. */
function Church({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="-48" width="120" height="48" fill={C.stone} />
      <path d="M-4 -48 L60 -66 L124 -48 Z" fill={C.stoneShade} />
      {[10, 34, 58, 82, 106].map((ax) => (
        <path key={ax} d={`M${ax - 7} 0 V-18 Q${ax} -28 ${ax + 7} -18 V0 Z`} fill="#b8955d" />
      ))}
      <rect x="0" y="-26" width="120" height="3" fill={C.stoneShade} />
      <g transform="translate(-30 0)">
        <rect x="0" y="-104" width="26" height="104" fill={C.stone} />
        <rect x="20" y="-104" width="6" height="104" fill={C.stoneShade} />
        {[-92, -70, -48].map((ty) => (
          <g key={ty}>
            <rect x="-2" y={ty - 3} width="30" height="3" fill={C.stoneShade} />
            <path d={`M8 ${ty + 14} V${ty + 4} Q13 ${ty - 2} 18 ${ty + 4} V${ty + 14} Z`} fill="#8e6c3f" />
          </g>
        ))}
        <path d="M2 -104 Q13 -124 24 -104 Z" fill={C.stoneShade} />
        <path d="M13 -122 V-132 M9 -128 H17" stroke="#8e6c3f" strokeWidth="2" />
      </g>
    </g>
  );
}

/** Hala Sultan Tekke on the salt lake: low mosque with a dome and a slim minaret. */
function Tekke({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="-22" width="54" height="22" fill="#efe2c6" />
      <rect x="44" y="-22" width="10" height="22" fill="#dccaa3" />
      <path d="M12 -22 Q27 -44 42 -22 Z" fill="#cdb88b" />
      <rect x="58" y="-58" width="5" height="58" fill="#efe2c6" />
      <path d="M57 -58 L60.5 -70 L64 -58 Z" fill="#cdb88b" />
      <rect x="56.5" y="-46" width="8" height="2.5" fill="#dccaa3" />
      {[8, 22, 36].map((wx) => (
        <path key={wx} d={`M${wx} -4 V-12 Q${wx + 3} -16 ${wx + 6} -12 V-4 Z`} fill="#a88b5a" />
      ))}
    </g>
  );
}

function Pot({ x, y, flower }: { x: number; y: number; flower: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-11 -18 H11 L8 0 H-8 Z" fill={C.terracotta} />
      <rect x="-12" y="-21" width="24" height="4" fill="#c06f40" />
      <g fill="#4f9a45">
        <ellipse cx="-5" cy="-26" rx="5" ry="3" transform="rotate(-30 -5 -26)" />
        <ellipse cx="5" cy="-27" rx="5" ry="3" transform="rotate(30 5 -27)" />
      </g>
      <g fill={flower}>
        <circle cx="-6" cy="-32" r="4" />
        <circle cx="4" cy="-35" r="4.5" />
        <circle cx="0" cy="-28" r="3.5" />
      </g>
    </g>
  );
}

/** Side-view alpaca in the mascot's style: laurel, sunglasses, meander bandana. */
export function StandingAlpaca({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  const M = MASCOT;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={M.ink} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
      {/* legs */}
      <g fill={M.fleece}>
        <rect x="-30" y="-24" width="9" height="24" rx="4" />
        <rect x="-16" y="-24" width="9" height="24" rx="4" />
        <rect x="8" y="-24" width="9" height="24" rx="4" />
        <rect x="22" y="-24" width="9" height="24" rx="4" />
      </g>
      {/* body, tail */}
      <ellipse cx="0" cy="-36" rx="38" ry="22" fill={M.fleece} />
      <circle cx="-38" cy="-44" r="7" fill={M.fleece} />
      <path d="M-20 -24 Q0 -18 20 -24" fill="none" stroke={M.shade} strokeWidth="3" />
      {/* neck and head */}
      <path d="M22 -48 Q26 -82 30 -96 L46 -94 Q42 -70 40 -40 Z" fill={M.fleece} />
      <ellipse cx="32" cy="-124" rx="4.5" ry="10" transform="rotate(-12 32 -124)" fill={M.fleece} />
      <ellipse cx="44" cy="-125" rx="4.5" ry="10" transform="rotate(10 44 -125)" fill={M.fleece} />
      <ellipse cx="40" cy="-104" rx="16" ry="14" fill={M.fleece} />
      <ellipse cx="54" cy="-98" rx="10" ry="8" fill={M.fleece} />
      <g fill={M.fleece}>
        <circle cx="31" cy="-114" r="7.5" />
        <circle cx="40" cy="-117" r="7.5" />
        <circle cx="25" cy="-104" r="6.5" />
      </g>
      <g stroke="none">
        <ellipse cx="32" cy="-127" rx="1.8" ry="5" transform="rotate(-12 32 -127)" fill={M.ear} />
        <ellipse cx="44" cy="-128" rx="1.8" ry="5" transform="rotate(10 44 -128)" fill={M.ear} />
        <ellipse cx="29" cy="-104" rx="4" ry="9" fill={M.fleece} />
        <ellipse cx="34" cy="-112" rx="7" ry="5" fill={M.fleece} />
        <ellipse cx="48" cy="-99" rx="7" ry="5.5" fill={M.fleece} />
      </g>
      {/* laurel */}
      <path d="M25 -112 Q37 -124 50 -114" fill="none" stroke={M.laurelDark} strokeWidth="1.4" />
      <g stroke="none">
        {[
          [28, -116, -60],
          [33, -120, -30],
          [39, -122, 0],
          [45, -120, 30],
          [49, -116, 60],
        ].map(([lx, ly, a], i) => (
          <ellipse key={i} cx={lx} cy={ly} rx="3.8" ry="1.7" transform={`rotate(${a} ${lx} ${ly})`} fill={i % 2 ? M.laurel : M.laurelDark} />
        ))}
      </g>
      {/* sunglasses, nose, smile */}
      <path d="M40 -108 H55 Q55 -100 47.5 -99 Q40 -100 40 -108 Z" fill={M.glass} strokeWidth="1.4" />
      <path d="M33 -107 H57" fill="none" strokeWidth="2" />
      <path d="M44 -104 l3 -2" stroke={M.glint} strokeWidth="1.4" />
      <circle cx="61" cy="-100" r="1.8" fill={M.ink} stroke="none" />
      <path d="M52 -93 q4 3 8 -1" fill="none" strokeWidth="1.8" />
      {/* bandana */}
      <path d="M24 -66 L44 -70 L44 -61 L24 -57 Z" fill={M.blue} strokeWidth="1.8" />
      <path d="M25 -61.5 L43 -65.5" stroke={M.white} strokeWidth="1.6" />
      <path d="M30 -58 L40 -60 L34 -46 Z" fill={M.blue} strokeWidth="1.8" />
      <path d="M24 -63 L12 -66 L15 -58 Z" fill={M.blue} strokeWidth="1.6" />
    </g>
  );
}

function Midground({ variant }: { variant: SceneVariant }): ReactNode {
  switch (variant) {
    case "village":
      return (
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
      );
    case "harbor":
      return (
        <>
          <path d="M0 170 Q60 140 130 160 L130 200 H0 Z" fill={C.hillFar} />
          <House x={18} y={176} w={28} h={20} />
          <House x={50} y={170} w={32} h={24} dome />
          <House x={86} y={176} w={28} h={20} />
          <Boat x={230} y={200} />
          <Boat x={320} y={214} />
        </>
      );
    case "temple":
      return (
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
      );
    case "grove":
      return (
        <>
          <path d="M0 170 Q100 130 200 160 Q300 120 390 150 V240 H0 Z" fill={C.hillFar} />
          <OliveTree x={60} y={190} s={0.8} />
          <OliveTree x={150} y={180} s={0.7} />
          <OliveTree x={330} y={186} s={0.8} />
        </>
      );
    case "promenade":
      return (
        <>
          <Boat x={300} y={196} s={0.6} />
          {[30, 130, 345].map((px, i) => (
            <Palm key={px} x={px} y={238} s={0.95} lean={i % 2 ? -1 : 1} />
          ))}
          <Umbrella x={70} y={252} c={C.dome} />
          <Umbrella x={170} y={256} c={C.orange} />
          <CafeTable x={70} y={258} />
          <CafeTable x={170} y={262} />
        </>
      );
    case "market":
      return (
        <>
          <path d="M0 196 Q90 150 200 170 Q300 140 390 166 V236 H0 Z" fill={C.hillFar} />
          <House x={10} y={200} w={34} h={24} />
          <House x={48} y={196} w={30} h={28} dome />
          <House x={150} y={198} w={36} h={24} />
          <House x={190} y={194} w={32} h={28} />
          <House x={330} y={198} w={40} h={26} />
          <Stall x={70} y={262} c={C.dome} fruit={[C.tomato, C.orange, "#8bc34a", C.tomato]} />
          <Stall x={168} y={262} c={C.orange} fruit={["#ffd54a", C.tomato, "#7cb342", C.orange]} />
        </>
      );
    case "beach":
      return (
        <>
          <Boat x={250} y={190} s={0.55} />
          <Umbrella x={60} y={262} c={C.dome} s={1.1} />
          <Umbrella x={168} y={258} c={C.orange} s={1.05} />
          <g fill={C.white} stroke="#c9b9a2" strokeWidth="1">
            <path d="M40 262 L84 262 L92 252 L88 250 L80 258 L44 258 Z" />
            <path d="M150 260 L192 260 L200 250 L196 248 L188 256 L154 256 Z" />
          </g>
          <circle cx="118" cy="258" r="7" fill="#ff5a5a" />
          <path d="M111 258 H125 M118 251 V265" stroke={C.white} strokeWidth="2" />
        </>
      );
    case "lake":
      return (
        <>
          <path d="M0 176 Q120 156 240 170 Q320 160 390 172 V184 H0 Z" fill="#c8b9a6" />
          <path d="M0 182 H390 V236 H0 Z" fill="#dbe9f2" />
          <g stroke="#ffffff" strokeWidth="2" opacity="0.7" strokeLinecap="round">
            <path d="M160 200 h30 M230 214 h24 M120 222 h20" />
          </g>
          <Palm x={30} y={186} s={0.7} />
          <Palm x={118} y={186} s={0.75} lean={-1} />
          <Tekke x={50} y={186} />
          <Flamingo x={150} y={214} s={0.9} />
          <Flamingo x={178} y={222} s={1} flip />
          <Flamingo x={212} y={208} s={0.8} />
          <Flamingo x={126} y={226} s={0.7} flip />
        </>
      );
    case "church":
      return (
        <>
          <path d="M0 186 Q120 160 240 176 Q320 166 390 180 V236 H0 Z" fill={C.hillFar} />
          <House x={12} y={210} w={36} h={24} />
          <House x={340} y={208} w={40} h={26} />
          <Church x={200} y={236} />
          <Palm x={350} y={240} s={0.9} lean={-1} />
        </>
      );
    case "night":
      return (
        <>
          <path d="M0 172 Q70 146 150 166 L150 190 H0 Z" fill="#2d3f6e" />
          <House x={14} y={178} w={28} h={20} lit />
          <House x={46} y={172} w={32} h={24} dome lit />
          <House x={84} y={178} w={30} h={20} lit />
          <g stroke="#ffd86b" strokeWidth="2" opacity="0.55" strokeLinecap="round">
            <path d="M30 200 h14 M66 206 h20 M100 198 h12" />
          </g>
          <Palm x={160} y={238} s={0.95} />
          <Lamp x={106} y={240} />
          <Lamp x={204} y={240} />
          <Lamp x={350} y={240} />
        </>
      );
    case "home":
      return (
        <>
          <House x={20} y={198} w={30} h={20} />
          <House x={54} y={194} w={34} h={26} dome />
          <House x={300} y={196} w={36} h={22} />
          <House x={340} y={200} w={34} h={24} />
          {/* railing */}
          <rect x="0" y="198" width="390" height="5" fill={C.white} />
          <g fill={C.white}>
            {Array.from({ length: 28 }, (_, i) => (
              <rect key={i} x={4 + i * 14} y="203" width="3" height="33" />
            ))}
          </g>
          {/* bougainvillea over the top */}
          <g>
            {[
              [10, 12, 22],
              [40, 6, 18],
              [70, 18, 16],
              [24, 40, 16],
              [96, 4, 14],
              [54, 34, 12],
            ].map(([bx, by, r], i) => (
              <circle key={i} cx={bx} cy={by} r={r} fill={i % 2 ? C.bougainvillea : "#f06db5"} />
            ))}
            <path d="M0 0 Q30 30 60 20 M40 0 Q60 30 90 10" stroke="#4f9a45" strokeWidth="3" fill="none" />
          </g>
          <Pot x={40} y={262} flower={C.tomato} />
          <Pot x={78} y={262} flower={C.bougainvillea} />
          <Pot x={200} y={262} flower="#ffd54a" />
        </>
      );
    case "mountain":
      return (
        <>
          <path d="M0 196 L70 120 L130 170 L200 100 L280 166 L330 128 L390 176 V236 H0 Z" fill="#9db9cf" />
          <path d="M184 116 L200 100 L216 116 L208 112 L200 118 L192 112 Z" fill={C.white} />
          <path d="M0 214 L60 166 L140 204 L230 150 L320 200 L390 172 V236 H0 Z" fill="#6f9a7d" />
          {[30, 70, 110, 170, 250, 290, 350].map((px, i) => (
            <Pine key={px} x={px} y={222 + (i % 3) * 6} s={0.9 + (i % 2) * 0.2} />
          ))}
          <House x={196} y={206} w={30} h={22} />
          <House x={228} y={202} w={26} h={20} />
        </>
      );
  }
}

/** Flat illustrated Cyprus scenes used as lesson covers and page headers. */
export function Scene({ variant = "village", height = 300, className = "" }: { variant?: SceneVariant; height?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const look = LOOK[variant] ?? LOOK.village;
  const [s0, s1, s2] = SKY[look.sky];
  const night = look.sky === "night";
  const field = look.ground === "field";
  return (
    <svg className={`scene ${className}`} viewBox="0 0 390 300" preserveAspectRatio="xMidYMax slice" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s0} />
          <stop offset="0.55" stopColor={s1} />
          <stop offset="1" stopColor={s2} />
        </linearGradient>
        <linearGradient id={`sea${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#1d3a7a" : C.sea} />
          <stop offset="1" stopColor={night ? "#14295c" : C.seaDeep} />
        </linearGradient>
        <linearGradient id={`field${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.field} />
          <stop offset="1" stopColor={C.fieldDark} />
        </linearGradient>
      </defs>
      <rect width="390" height="300" fill={`url(#sky${id})`} />

      {night ? (
        <>
          <g fill="#fff6d5">
            {[[40, 40], [90, 80], [150, 30], [210, 70], [250, 24], [340, 60], [370, 110], [120, 120]].map(([sx, sy]) => (
              <circle key={`${sx}-${sy}`} cx={sx} cy={sy} r="1.6" />
            ))}
          </g>
          <circle cx="300" cy="74" r="30" fill="#fff4cc" opacity="0.12" />
          <path d="M296 52 A22 22 0 1 0 320 84 A18 18 0 1 1 296 52 Z" fill="#fff4cc" />
        </>
      ) : (
        <>
          <circle cx="300" cy={look.sky === "dawn" ? 118 : 78} r="34" fill={look.sky === "dawn" ? "#fff2c9" : "#fff3b0"} opacity="0.45" />
          <circle cx="300" cy={look.sky === "dawn" ? 118 : 78} r="22" fill={look.sky === "dawn" ? "#ffe3a8" : C.sun} />
          <Cloud x={70} y={70} />
          <Cloud x={220} y={48} s={0.7} />
          {variant !== "home" && <Cloud x={350} y={120} s={0.8} />}
        </>
      )}

      {look.sea && (
        <>
          <rect x="0" y="176" width="390" height="60" fill={`url(#sea${id})`} />
          <g stroke={night ? "#ffd86b" : "#fff"} strokeWidth="2" strokeLinecap="round" opacity={night ? 0.35 : 0.5}>
            <path d="M40 196 h18 M120 206 h26 M250 192 h20 M320 210 h16" />
          </g>
        </>
      )}

      <Midground variant={variant} />

      {/* foreground */}
      {field && (
        <>
          <path d="M0 236 Q120 214 220 230 Q320 244 390 226 V300 H0 Z" fill={`url(#field${id})`} />
          <path d="M150 300 Q190 260 250 238 Q262 236 270 240 Q220 266 210 300 Z" fill={C.sand} opacity="0.85" />
          <Cypress x={28} y={252} s={1.1} />
          {variant !== "temple" && <OliveTree x={110} y={262} s={1.1} />}
          {variant !== "grove" && variant !== "mountain" && <OliveTree x={360} y={266} s={0.9} />}
        </>
      )}
      {look.ground === "sand" && <path d="M0 232 Q120 222 220 230 Q320 238 390 228 V300 H0 Z" fill="#f3dfb0" />}
      {(look.ground === "paving" || look.ground === "nightPaving") && (
        <>
          <path d="M0 236 H390 V300 H0 Z" fill={night ? "#3b4a7a" : "#ecdfc8"} />
          <g stroke={night ? "#2e3b66" : "#dccaa8"} strokeWidth="1.5">
            <path d="M0 252 H390 M0 272 H390 M40 236 L20 300 M120 236 L110 300 M200 236 L200 300 M280 236 L290 300 M360 236 L380 300" />
          </g>
        </>
      )}
      {look.ground === "balcony" && (
        <>
          <path d="M0 236 H390 V300 H0 Z" fill={C.terracotta} />
          <g stroke="#c06f40" strokeWidth="1.5">
            <path d="M0 254 H390 M0 276 H390 M30 236 L20 300 M90 236 L84 300 M150 236 L148 300 M210 236 L212 300 M270 236 L276 300 M330 236 L340 300" />
          </g>
        </>
      )}
      {/* kept above the bottom ~45 units, which the overlapping card covers */}
      <StandingAlpaca x={look.alpacaX} y={262} s={0.95} flip={look.flip} />
    </svg>
  );
}
