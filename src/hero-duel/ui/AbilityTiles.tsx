import React, { memo, useEffect, useId, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 *  Hero Duel – ability tiles                                          *
 *  Tile look traced from the Clash of Clans equipment tiles:          *
 *   - purple vertical gradient, lighter top-left                      *
 *   - dark outer edge + light lavender bevel ring                     *
 *   - big centred icon with soft drop shadow                          *
 *   - rarity badge bottom-left: E = epic, L = legendary (peach)        *
 *  Nine abilities, one per hero. Icons are hand-drawn inline SVG.     *
 * ------------------------------------------------------------------ */

export type AbilityId =
  | "royalMeteor"
  | "curseSeal"
  | "toxicFlask"
  | "rallyBanner"
  | "phaseDaggers"
  | "jetBoots"
  | "bastionShield"
  | "spikyBall"
  | "seismicSlam";

export type Rarity = "epic" | "legendary";

export type AbilityState = "locked" | "ready" | "cooldown" | "active";

export interface AbilityDef {
  id: AbilityId;
  hero: string;
  name: string;
  cooldownMs: number;
  rarity: Rarity;
}

export const ABILITIES: AbilityDef[] = [
  { id: "royalMeteor", hero: "MugenKING", name: "Royal Meteor", cooldownMs: 7000, rarity: "legendary" },
  { id: "curseSeal", hero: "Malevolent Shrine Priest", name: "Curse Seal", cooldownMs: 7000, rarity: "legendary" },
  { id: "toxicFlask", hero: "Dr. Methanogenic", name: "Toxic Flask", cooldownMs: 7000, rarity: "epic" },
  { id: "rallyBanner", hero: "Captain Englland", name: "Rally Banner", cooldownMs: 7000, rarity: "epic" },
  { id: "phaseDaggers", hero: "AJX", name: "Phase Daggers", cooldownMs: 7000, rarity: "epic" },
  { id: "jetBoots", hero: "Yjkstra", name: "Rocket Jet Pack", cooldownMs: 7000, rarity: "epic" },
  { id: "bastionShield", hero: "Ironclad Warden", name: "Bastion Barrier", cooldownMs: 7000, rarity: "legendary" },
  { id: "spikyBall", hero: "BlackMonkey", name: "Spiky Ball", cooldownMs: 7000, rarity: "epic" },
  { id: "seismicSlam", hero: "Party King Kong", name: "Seismic Slam", cooldownMs: 7000, rarity: "epic" },
];

/* ------------------------------ icons ------------------------------ */
/* every icon is drawn in a 100 x 100 box; u = unique id prefix        */

type IconProps = { u: string };

const MeteorIcon = ({ u }: IconProps) => (
  <>
    <defs>
      <linearGradient id={`${u}-tail`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffd34a" stopOpacity="0" />
        <stop offset=".45" stopColor="#ffb52e" />
        <stop offset="1" stopColor="#ef4d1c" />
      </linearGradient>
      <linearGradient id={`${u}-core`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff6c2" stopOpacity="0" />
        <stop offset="1" stopColor="#fff2a0" />
      </linearGradient>
      <radialGradient id={`${u}-rock`} cx=".35" cy=".3" r=".8">
        <stop offset="0" stopColor="#8a5b3d" />
        <stop offset=".6" stopColor="#4b2c1d" />
        <stop offset="1" stopColor="#22110b" />
      </radialGradient>
    </defs>
    <path d="M10 10 C34 20 66 34 80 50 L50 80 C34 66 20 34 10 10 Z" fill={`url(#${u}-tail)`} />
    <path d="M10 10 C30 24 54 40 68 52 L52 68 C40 54 24 30 10 10 Z" fill={`url(#${u}-core)`} />
    <path d="M52 52 L66 42 L83 51 L88 68 L77 83 L58 86 L45 75 Z" fill={`url(#${u}-rock)`} stroke="#1a0b06" strokeWidth="3" strokeLinejoin="round" />
    <path d="M60 50 L66 62 L62 74 M70 60 L80 64 M66 62 L74 74" stroke="#ff9a2e" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    <path d="M56 56 Q62 49 70 47" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".45" />
    <circle cx="26" cy="44" r="3" fill="#ffd34a" />
    <circle cx="44" cy="22" r="2.4" fill="#fff0a0" />
    <circle cx="16" cy="30" r="2" fill="#ff9a2e" />
  </>
);

const CurseSealIcon = ({ u }: IconProps) => (
  <>
    <defs>
      <radialGradient id={`${u}-aura`} cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#d58bff" stopOpacity=".95" />
        <stop offset="1" stopColor="#7a2cc8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${u}-paper`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff2c2" />
        <stop offset="1" stopColor="#ecd48e" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill={`url(#${u}-aura)`} />
    <path d="M50 4 V12" stroke="#7a1a22" strokeWidth="4" strokeLinecap="round" />
    <rect x="31" y="12" width="38" height="78" rx="4" fill={`url(#${u}-paper)`} stroke="#6a3c10" strokeWidth="3" />
    <rect x="31" y="12" width="38" height="9" rx="3" fill="#b3202c" />
    <circle cx="50" cy="38" r="9" fill="none" stroke="#c4202e" strokeWidth="3.4" />
    <path d="M50 29 V47 M41 38 H59" stroke="#c4202e" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 58 H60 M42 66 H58 M50 58 V80 M43 76 L50 82 L57 76" stroke="#c4202e" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M31 90 l-3 8 M42 90 v8 M58 90 v8 M69 90 l3 8" stroke="#b3202c" strokeWidth="3" strokeLinecap="round" />
    <path d="M18 30 q-8 10 0 22 M82 30 q8 10 0 22" stroke="#e6b3ff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
  </>
);

const FlaskIcon = ({ u }: IconProps) => (
  <>
    <defs>
      <clipPath id={`${u}-clip`}>
        <circle cx="50" cy="68" r="22" />
      </clipPath>
      <linearGradient id={`${u}-liq`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c8ff5a" />
        <stop offset="1" stopColor="#2fae3a" />
      </linearGradient>
    </defs>
    <g fill="#9bea4a" opacity=".85" stroke="#4a9a1a" strokeWidth="2">
      <circle cx="42" cy="12" r="8" />
      <circle cx="56" cy="8" r="9" />
      <circle cx="68" cy="16" r="7" />
      <circle cx="52" cy="20" r="7" />
    </g>
    <rect x="43" y="22" width="14" height="22" rx="3" fill="#d8f4ff" stroke="#3b6a86" strokeWidth="3" />
    <rect x="40" y="19" width="20" height="6" rx="3" fill="#8a5a2a" stroke="#4a2c0e" strokeWidth="2" />
    <circle cx="50" cy="68" r="22" fill="#d8f4ff" fillOpacity=".55" />
    <g clipPath={`url(#${u}-clip)`}>
      <path d="M26 62 Q38 56 50 62 T74 62 V96 H26 Z" fill={`url(#${u}-liq)`} />
    </g>
    <circle cx="50" cy="68" r="22" fill="none" stroke="#3b6a86" strokeWidth="3.4" />
    <circle cx="43" cy="72" r="3.4" fill="#eaffb0" />
    <circle cx="56" cy="78" r="2.6" fill="#eaffb0" />
    <circle cx="52" cy="66" r="2" fill="#eaffb0" />
    <path d="M34 56 Q37 50 43 48" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity=".8" />
  </>
);

const BannerIcon = ({ u }: IconProps) => (
  <>
    <defs>
      <linearGradient id={`${u}-flag`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff5a4a" />
        <stop offset="1" stopColor="#a8142a" />
      </linearGradient>
      <linearGradient id={`${u}-gold`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe27a" />
        <stop offset="1" stopColor="#d79a1c" />
      </linearGradient>
    </defs>
    <ellipse cx="30" cy="92" rx="20" ry="6" fill="#3a2a1a" opacity=".45" />
    <path d="M14 92 Q30 76 46 92 Z" fill="#7a7f8c" stroke="#3a3e48" strokeWidth="2.4" />
    <rect x="27" y="14" width="6" height="78" rx="3" fill="#7a4e24" stroke="#3e2410" strokeWidth="2" />
    <path d="M30 2 L37 16 H23 Z" fill={`url(#${u}-gold)`} stroke="#8a5a0c" strokeWidth="2" strokeLinejoin="round" />
    <path d="M33 18 C50 10 64 26 88 18 L81 37 L88 56 C64 64 50 48 33 56 Z" fill={`url(#${u}-flag)`} stroke="#5a0a18" strokeWidth="3" strokeLinejoin="round" />
    <path d="M47 30 L60 40 L47 50" fill="none" stroke={`url(#${u}-gold)`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M62 30 L74 40 L62 50" fill="none" stroke={`url(#${u}-gold)`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
  </>
);

const DaggerBlade = ({ u }: IconProps) => (
  <>
    <path d="M50 4 L59 54 L50 62 L41 54 Z" fill={`url(#${u}-blade)`} stroke="#14343f" strokeWidth="2.6" strokeLinejoin="round" />
    <path d="M50 8 V58" stroke="#ffffff" strokeWidth="2" opacity=".8" />
    <rect x="35" y="60" width="30" height="7" rx="3.5" fill="#e8b33a" stroke="#7a520a" strokeWidth="2.4" />
    <rect x="46" y="67" width="8" height="19" rx="3" fill="#2b2f3b" stroke="#12141a" strokeWidth="2" />
    <circle cx="50" cy="90" r="5" fill="#e8b33a" stroke="#7a520a" strokeWidth="2.4" />
  </>
);

const PhaseDaggersIcon = ({ u }: IconProps) => (
  <>
    <defs>
      <linearGradient id={`${u}-blade`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#bff6ff" />
        <stop offset=".5" stopColor="#5fd8ff" />
        <stop offset="1" stopColor="#2a8fd0" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="50" rx="44" ry="44" fill="none" stroke="#5fd8ff" strokeWidth="2.4" strokeDasharray="6 7" opacity=".7" />
    <g transform="rotate(38 50 50)">
      <DaggerBlade u={u} />
    </g>
    <g transform="rotate(-38 50 50)">
      <DaggerBlade u={u} />
    </g>
    <g opacity=".85">
      <rect x="8" y="30" width="22" height="4" fill="#ff4fd8" />
      <rect x="70" y="62" width="22" height="4" fill="#5fd8ff" />
      <rect x="14" y="70" width="14" height="3" fill="#5fd8ff" />
      <rect x="74" y="24" width="14" height="3" fill="#ff4fd8" />
    </g>
  </>
);

const JetBootsIcon = ({ u }: IconProps) => (
  <>
    <defs>
      <linearGradient id={`${u}-boot`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7a8090" />
        <stop offset="1" stopColor="#2c2f3a" />
      </linearGradient>
      <linearGradient id={`${u}-fire`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff2a0" />
        <stop offset=".5" stopColor="#ffa52e" />
        <stop offset="1" stopColor="#ef4d1c" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M30 78 Q36 96 42 78 Z M46 78 Q52 100 58 78 Z M62 78 Q68 94 74 78 Z" fill={`url(#${u}-fire)`} />
    <path d="M28 6 H60 V44 L84 52 C92 56 92 68 84 70 H22 C16 70 14 66 14 60 V20 C14 12 20 6 28 6 Z" fill={`url(#${u}-boot)`} stroke="#14161c" strokeWidth="3.4" strokeLinejoin="round" />
    <rect x="14" y="66" width="76" height="12" rx="5" fill="#3a3e4c" stroke="#14161c" strokeWidth="3" />
    <rect x="12" y="20" width="20" height="8" rx="3" fill="#c9cfdb" stroke="#14161c" strokeWidth="2.4" />
    <rect x="12" y="36" width="20" height="8" rx="3" fill="#c9cfdb" stroke="#14161c" strokeWidth="2.4" />
    <path d="M70 4 L58 24 H68 L60 44 L82 18 H72 Z" fill="#5fd8ff" stroke="#e9fbff" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M10 48 l8 -6 l-3 8 l8 -2" stroke="#5fd8ff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
);

const ShieldIcon = ({ u }: IconProps) => (
  <>
    <defs>
      <linearGradient id={`${u}-rim`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffe27a" />
        <stop offset="1" stopColor="#c98a14" />
      </linearGradient>
      <linearGradient id={`${u}-glass`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fdcff" />
        <stop offset="1" stopColor="#2a6fd6" />
      </linearGradient>
    </defs>
    <path d="M50 4 L88 17 V48 C88 72 70 87 50 96 C30 87 12 72 12 48 V17 Z" fill={`url(#${u}-rim)`} stroke="#7a520a" strokeWidth="3.4" strokeLinejoin="round" />
    <path d="M50 14 L78 24 V48 C78 66 65 77 50 85 C35 77 22 66 22 48 V24 Z" fill={`url(#${u}-glass)`} stroke="#7a520a" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M26 30 L50 20 V32 L30 44 Z" fill="#fff" opacity=".35" />
    <path d="M50 38 L60 44 V56 L50 64 L40 56 V44 Z" fill="#fff2a0" stroke="#7a520a" strokeWidth="2.4" strokeLinejoin="round" />
    <circle cx="50" cy="10" r="4" fill="#5fd8ff" stroke="#7a520a" strokeWidth="2" />
  </>
);

const SpikyBallIcon = ({ u }: IconProps) => {
  const spikes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI * 2) / 12;
    const b = 0.2;
    const p = (r: number, ang: number) => `${(50 + r * Math.cos(ang)).toFixed(1)},${(50 + r * Math.sin(ang)).toFixed(1)}`;
    return `${p(22, a - b)} ${p(46, a)} ${p(22, a + b)}`;
  });
  return (
    <>
      <defs>
        <radialGradient id={`${u}-orb`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#f2f5fb" />
          <stop offset=".55" stopColor="#9aa3b6" />
          <stop offset="1" stopColor="#4a5164" />
        </radialGradient>
      </defs>
      {spikes.map((pts, i) => (
        <polygon key={i} points={pts} fill="#262933" stroke="#0e1015" strokeWidth="2" strokeLinejoin="round" />
      ))}
      <circle cx="50" cy="50" r="23" fill={`url(#${u}-orb)`} stroke="#0e1015" strokeWidth="3.4" />
      <ellipse cx="42" cy="41" rx="7" ry="4.6" fill="#fff" opacity=".8" transform="rotate(-30 42 41)" />
      <circle cx="50" cy="50" r="6" fill="#d9304a" stroke="#0e1015" strokeWidth="2.4" />
    </>
  );
};

const SlamIcon = ({ u }: IconProps) => (
  <>
    <defs>
      <linearGradient id={`${u}-fist`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8d93a4" />
        <stop offset="1" stopColor="#3a3e4c" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="86" rx="42" ry="9" fill="none" stroke="#ff9a2e" strokeWidth="3" opacity=".85" />
    <path d="M50 80 L30 70 M50 80 L70 70 M50 80 L18 82 M50 80 L82 82 M50 80 L40 92 M50 80 L62 92" stroke="#2b1a14" strokeWidth="3.6" strokeLinecap="round" />
    <path d="M50 80 L30 70 M50 80 L70 70 M50 80 L18 82 M50 80 L82 82" stroke="#ff9a2e" strokeWidth="1.6" strokeLinecap="round" />
    <polygon points="14,66 22,58 28,68 18,72" fill="#6a4a34" stroke="#2b1a14" strokeWidth="2" />
    <polygon points="76,60 86,56 90,66 80,70" fill="#6a4a34" stroke="#2b1a14" strokeWidth="2" />
    <rect x="28" y="6" width="44" height="12" rx="5" fill="#c9a24a" stroke="#5a3a0a" strokeWidth="2.6" />
    <path d="M26 16 H74 V44 Q74 52 66 52 H34 Q26 52 26 44 Z" fill={`url(#${u}-fist)`} stroke="#14161c" strokeWidth="3.4" strokeLinejoin="round" />
    <g fill="#5a6072" stroke="#14161c" strokeWidth="2.6">
      <rect x="26" y="46" width="12" height="20" rx="6" />
      <rect x="38" y="48" width="12" height="22" rx="6" />
      <rect x="50" y="48" width="12" height="22" rx="6" />
      <rect x="62" y="46" width="12" height="20" rx="6" />
    </g>
    <g fill="#ff9a2e">
      <circle cx="32" cy="48" r="2.4" />
      <circle cx="44" cy="50" r="2.4" />
      <circle cx="56" cy="50" r="2.4" />
      <circle cx="68" cy="48" r="2.4" />
    </g>
    <path d="M40 24 L50 36 L60 24" stroke="#ff9a2e" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
);

const ICONS: Record<AbilityId, (p: IconProps) => React.ReactElement> = {
  royalMeteor: MeteorIcon,
  curseSeal: CurseSealIcon,
  toxicFlask: FlaskIcon,
  rallyBanner: BannerIcon,
  phaseDaggers: PhaseDaggersIcon,
  jetBoots: JetBootsIcon,
  bastionShield: ShieldIcon,
  spikyBall: SpikyBallIcon,
  seismicSlam: SlamIcon,
};

export const AbilityIcon = memo(function AbilityIcon({ id }: { id: AbilityId }) {
  const u = "ab" + useId().replace(/[^a-zA-Z0-9]/g, "") + id;
  const Icon = ICONS[id];
  return (
    <svg className="ab-icon" viewBox="0 0 100 100" aria-hidden="true">
      <Icon u={u} />
    </svg>
  );
});

/* ------------------------------ styles ------------------------------ */

const CSS = `
.ab-tile{
  position:relative; width:var(--s,100px); height:var(--s,100px);
  border-radius:calc(var(--s,100px) * .2);
  background:
    radial-gradient(120% 90% at 22% 12%, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(165deg,#b866e6 0%,#9338c9 52%,#6e239f 100%);
  box-shadow:
    0 0 0 2px #4a1670,
    inset 0 0 0 calc(var(--s,100px) * .03) #d6a0f4,
    inset 0 0 0 calc(var(--s,100px) * .05) rgba(70,12,110,.38),
    inset 0 calc(var(--s,100px) * -.09) calc(var(--s,100px) * .12) rgba(40,0,70,.38),
    0 4px 0 #3a1058, 0 8px 12px rgba(0,0,0,.38);
  display:grid; place-items:center; padding:0; border:0; color:inherit;
  touch-action:manipulation; user-select:none; -webkit-user-select:none;
  -webkit-tap-highlight-color:transparent; cursor:pointer; contain:layout paint;
  transition:transform .08s ease-out;
}
.ab-tile:active:not([data-state="locked"]){ transform:translateY(2px) scale(.97); }
.ab-tile:focus-visible{ outline:3px solid #fff; outline-offset:3px; }
.ab-icon{ width:82%; height:82%; filter:drop-shadow(0 3px 2px rgba(0,0,0,.45)); pointer-events:none; }
.ab-lvl{
  position:absolute; left:calc(var(--s,100px) * .05); bottom:calc(var(--s,100px) * .05);
  min-width:calc(var(--s,100px) * .27); height:calc(var(--s,100px) * .27);
  padding:0 calc(var(--s,100px) * .05); box-sizing:border-box;
  border-radius:calc(var(--s,100px) * .09);
  background:linear-gradient(#34323c,#1c1b22); border:2px solid #4c4958;
  color:#fff; font:800 calc(var(--s,100px) * .16)/calc(var(--s,100px) * .23) system-ui,sans-serif;
  text-align:center; text-shadow:0 1px 0 #000; pointer-events:none;
}
.ab-lvl.max{ background:linear-gradient(#ffe0b3,#f1b46c); border-color:#c9822e; text-shadow:0 1px 1px #8a4a10,0 0 2px #8a4a10; }
.ab-tile[data-state="locked"]{ filter:grayscale(1) brightness(.55); cursor:not-allowed; }
.ab-tile[data-state="ready"]{ animation:ab-glow 1.6s ease-in-out infinite; }
.ab-tile[data-state="active"]{ transform:scale(1.06); box-shadow:0 0 0 3px #fff, 0 0 18px 4px rgba(255,255,255,.7), 0 4px 0 #3a1058; }
.ab-tile[data-state="cooldown"] .ab-icon{ opacity:.45; }
.ab-cd{
  position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background:conic-gradient(from 0deg, rgba(10,0,25,.62) calc(var(--p) * 1turn), rgba(0,0,0,0) 0);
  animation:ab-sweep var(--cd-ms) linear forwards; animation-delay:var(--cd-delay,0ms);
}
.ab-sec{
  position:absolute; inset:0; display:grid; place-items:center; pointer-events:none;
  color:#fff; font:900 calc(var(--s,100px) * .38)/1 system-ui,sans-serif;
  text-shadow:0 2px 0 #2a0a45,0 0 8px rgba(0,0,0,.7);
}
.ab-lock{ position:absolute; inset:0; display:grid; place-items:center; pointer-events:none; }
.ab-lock svg{ width:34%; height:34%; filter:drop-shadow(0 2px 2px rgba(0,0,0,.6)); }
@property --p{ syntax:'<number>'; inherits:false; initial-value:1; }
@keyframes ab-sweep{ from{ --p:1 } to{ --p:0 } }
@keyframes ab-glow{
  0%,100%{ box-shadow:0 0 0 2px #4a1670, inset 0 0 0 3px #d6a0f4, inset 0 0 0 5px rgba(70,12,110,.38), inset 0 -9px 12px rgba(40,0,70,.38), 0 4px 0 #3a1058, 0 8px 12px rgba(0,0,0,.38); }
  50%{ box-shadow:0 0 0 2px #4a1670, inset 0 0 0 3px #f0c8ff, inset 0 0 0 5px rgba(70,12,110,.38), inset 0 -9px 12px rgba(40,0,70,.38), 0 4px 0 #3a1058, 0 0 16px 3px rgba(214,140,255,.65); }
}
@media (prefers-reduced-motion: reduce){ .ab-tile[data-state="ready"]{ animation:none; } }
`;

let styleInjected = false;
function useAbilityStyles() {
  useEffect(() => {
    if (styleInjected || typeof document === "undefined") return;
    const el = document.createElement("style");
    el.setAttribute("data-ability-tiles", "");
    el.textContent = CSS;
    document.head.appendChild(el);
    styleInjected = true;
  }, []);
}

/* ------------------------------ tile ------------------------------- */

export interface AbilityTileProps {
  ability: AbilityId;
  rarity?: Rarity;
  state?: AbilityState;
  /** total cooldown length in ms */
  cooldownMs?: number;
  /** ms left when the cooldown state starts; the sweep runs itself in CSS */
  remainingMs?: number;
  /** whole seconds shown in the centre; the parent updates it once a second */
  secondsLeft?: number;
  size?: number;
  onActivate?: () => void;
}

export const AbilityTile = memo(function AbilityTile({
  ability,
  rarity = "epic",
  state = "ready",
  cooldownMs = 7000,
  remainingMs,
  secondsLeft,
  size = 100,
  onActivate,
}: AbilityTileProps) {
  useAbilityStyles();
  const def = ABILITIES.find((a) => a.id === ability);
  const left = remainingMs ?? cooldownMs;
  const style = {
    "--s": `${size}px`,
    "--cd-ms": `${cooldownMs}ms`,
    "--cd-delay": `${-(cooldownMs - left)}ms`,
  } as React.CSSProperties;

  return (
    <button
      type="button"
      className="ab-tile"
      data-state={state}
      style={style}
      aria-label={`${def?.name ?? ability}, ${rarity}`}
      aria-disabled={state === "locked" || state === "cooldown"}
      onPointerDown={(e) => {
        if (state !== "ready") return;
        e.preventDefault();
        onActivate?.();
      }}
    >
      <AbilityIcon id={ability} />
      {state === "cooldown" && (
        <>
          <span className="ab-cd" />
          <span className="ab-sec">{secondsLeft ?? Math.ceil(left / 1000)}</span>
        </>
      )}
      {state === "locked" && (
        <span className="ab-lock">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="10" width="16" height="12" rx="3" fill="#e8e8f0" stroke="#222" strokeWidth="1.6" />
            <path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" fill="none" stroke="#e8e8f0" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.8" fill="#222" />
          </svg>
        </span>
      )}
      <span className={"ab-lvl" + (rarity === "legendary" ? " max" : "")}>{rarity === "legendary" ? "L" : "E"}</span>
    </button>
  );
});

/* ------------------------- demo sheet (default) ------------------------- */

export default function AbilitySheet() {
  // one local ticker only while something is cooling down
  const [cd, setCd] = useState<Partial<Record<AbilityId, number>>>({});
  const endAt = useRef<Partial<Record<AbilityId, number>>>({});

  useEffect(() => {
    if (!Object.keys(cd).length) return;
    const t = setInterval(() => {
      const now = performance.now();
      setCd((prev) => {
        const next: typeof prev = {};
        for (const k of Object.keys(prev) as AbilityId[]) {
          const left = (endAt.current[k] ?? 0) - now;
          if (left > 0) next[k] = Math.ceil(left / 1000);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cd]);

  const start = (def: AbilityDef) => {
    endAt.current[def.id] = performance.now() + def.cooldownMs;
    setCd((p) => ({ ...p, [def.id]: Math.ceil(def.cooldownMs / 1000) }));
  };

  return (
    <div
      style={{
        background: "#8fb04a",
        padding: 28,
        display: "grid",
        gridTemplateColumns: "repeat(3, 150px)",
        gap: 26,
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      {ABILITIES.map((a, i) => {
        const locked = a.id === "spikyBall";
        const secs = cd[a.id];
        const state: AbilityState = locked ? "locked" : secs ? "cooldown" : "ready";
        return (
          <div key={a.id} style={{ display: "grid", justifyItems: "center", gap: 8 }}>
            <AbilityTile
              ability={a.id}
              rarity={a.rarity}
              state={state}
              cooldownMs={a.cooldownMs}
              secondsLeft={secs}
              size={110}
              onActivate={() => start(a)}
            />
            <div style={{ textAlign: "center", color: "#1d2a08", lineHeight: 1.2 }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>
                {i + 1}. {a.hero}
              </div>
              <div style={{ fontSize: 12 }}>{a.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
