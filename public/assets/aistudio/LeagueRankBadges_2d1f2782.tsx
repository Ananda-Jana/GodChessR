/**
 * LeagueRankBadges.tsx  (minimal redesign)
 * ---------------------------------------------------------------
 * 11 league rank badges, flat and geometric. No gradients, no gloss,
 * no shadows, no wings or floral shapes. Each rank is built from:
 *   a chess piece  +  a frame shape  +  small tier pips.
 *
 * Piece families:  Chrome = pawn, Hashira = knight, Mugen = bishop,
 *                  Iron Regent = rook, Conqueror = queen,
 *                  Duke Killer = king, Supreme Deity = king + halo.
 *
 * TWO SETS
 *   set="solid"  colored plate with a dark chess piece
 *   set="line"   monoline outline version of the same design
 *
 * USAGE
 *   import LeagueRankShowcase, { RankBadge, RANKS } from './LeagueRankBadges';
 *   <LeagueRankShowcase />
 *   <RankBadge rankId="mugen_2" size={64} set="line" />
 *
 * Your own art later: pass `artUrl` and the image replaces the SVG.
 */
import React, { useState } from 'react';

/* ------------------------------ types ------------------------------ */
export type RankId =
  | 'rusted_chrome' | 'shiny_chrome' | 'metal_hashira_1' | 'metal_hashira_2'
  | 'mugen_1' | 'mugen_2' | 'mugen_3' | 'iron_regent' | 'conqueror'
  | 'duke_killer' | 'supreme_deity';

export type BadgeSet = 'solid' | 'line';
type PieceKind = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
type FrameKind = 'circle' | 'ring' | 'hex' | 'hexRing' | 'diamond' | 'diamondRing' | 'shield' | 'shieldRing' | 'octagonRing' | 'sun';

export interface RankVisual {
  id: RankId;
  name: string;
  tier: number;
  minTrophies: number;
  color: string;
  piece: PieceKind;
  frame: FrameKind;
  pips: number;
  halo?: boolean;
  artUrl?: string;
}

/* ------------------------------ ranks ------------------------------ */
export const RANKS: RankVisual[] = [
  { id: 'rusted_chrome',   name: 'Rusted Chrome',    tier: 1,  minTrophies: 0,    color: '#C0693B', piece: 'pawn',   frame: 'circle',      pips: 0 },
  { id: 'shiny_chrome',    name: 'Shiny Chrome',     tier: 2,  minTrophies: 200,  color: '#C5D0DE', piece: 'pawn',   frame: 'ring',        pips: 0 },
  { id: 'metal_hashira_1', name: 'Metal Hashira I',  tier: 3,  minTrophies: 400,  color: '#2DB9A7', piece: 'knight', frame: 'hex',         pips: 1 },
  { id: 'metal_hashira_2', name: 'Metal Hashira II', tier: 4,  minTrophies: 650,  color: '#E3B24C', piece: 'knight', frame: 'hexRing',     pips: 2 },
  { id: 'mugen_1',         name: 'Mugen I',          tier: 5,  minTrophies: 900,  color: '#8E72F2', piece: 'bishop', frame: 'diamond',     pips: 1 },
  { id: 'mugen_2',         name: 'Mugen II',         tier: 6,  minTrophies: 1200, color: '#D957D0', piece: 'bishop', frame: 'diamond',     pips: 2 },
  { id: 'mugen_3',         name: 'Mugen III',        tier: 7,  minTrophies: 1550, color: '#4F82FF', piece: 'bishop', frame: 'diamondRing', pips: 3 },
  { id: 'iron_regent',     name: 'Iron Regent',      tier: 8,  minTrophies: 1950, color: '#9AA4B6', piece: 'rook',   frame: 'shield',      pips: 0 },
  { id: 'conqueror',       name: 'Conqueror',        tier: 9,  minTrophies: 2400, color: '#F4A62A', piece: 'queen',  frame: 'octagonRing', pips: 0 },
  { id: 'duke_killer',     name: 'Duke Killer',      tier: 10, minTrophies: 2900, color: '#E5384F', piece: 'king',   frame: 'shieldRing',  pips: 0 },
  { id: 'supreme_deity',   name: 'Supreme Deity',    tier: 11, minTrophies: 3500, color: '#F3D060', piece: 'king',   frame: 'sun',         pips: 0, halo: true },
];

export const getRankVisual = (id: RankId): RankVisual =>
  RANKS.find((r) => r.id === id) ?? RANKS[0];

/* ------------------------- geometry helpers ------------------------ */
const INK = '#0C0B14';
const f2 = (n: number) => n.toFixed(2);
const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
const polyPts = (cx: number, cy: number, r: number, n: number, rot: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    return `${f2(cx + r * Math.cos(a))},${f2(cy + r * Math.sin(a))}`;
  }).join(' ');

/* ------------------------------ pieces ----------------------------- */
/* Drawn on a 64 x 64 grid, baseline at y = 55. Parts are separate
   closed shapes with small gaps, which reads cleanly in both sets. */
interface Detail { kind: 'line' | 'dot'; d?: string; cx?: number; cy?: number; r?: number }
interface PieceDef { parts: string[]; details?: Detail[]; cy: number }

const BASE = rr(16, 50, 32, 5, 1.5);

const PIECES: Record<PieceKind, PieceDef> = {
  pawn: {
    cy: 33.25,
    parts: [
      circ(32, 19, 7.5),
      rr(23, 29, 18, 4, 2),
      'M26.5 35H37.5C37.5 41 42 44 44 48.5H20C22 44 26.5 41 26.5 35Z',
      BASE,
    ],
  },
  rook: {
    cy: 32.5,
    parts: [
      'M20 10H26V15H29.5V10H34.5V15H38V10H44V22.5H20Z',
      'M24 25H40L38 41H26Z',
      'M22 43.5H42L44 48.5H20Z',
      BASE,
    ],
  },
  bishop: {
    cy: 30.35,
    parts: [
      circ(32, 8.5, 2.8),
      'M32 13C40.5 19 42.5 26 40 32C39 34.5 36.5 35 35.5 35H28.5C27.5 35 25 34.5 24 32C21.5 26 23.5 19 32 13Z',
      rr(24, 37.5, 16, 3.5, 1.75),
      'M27 43H37C37 45.5 40 46.5 42 48.5H22C24 46.5 27 45.5 27 43Z',
      BASE,
    ],
    details: [{ kind: 'line', d: 'M31 20.5L37.5 27.5' }],
  },
  queen: {
    cy: 30.1,
    parts: [
      circ(19, 12.4, 2.2), circ(25.5, 9.4, 2.2), circ(32, 7.4, 2.2), circ(38.5, 9.4, 2.2), circ(45, 12.4, 2.2),
      'M17.5 34L19 16L22.5 26L25.5 13L29 26L32 11L35 26L38.5 13L41.5 26L45 16L46.5 34Z',
      rr(22, 36.5, 20, 3.5, 1.75),
      'M25 42H39C39 45 41.5 46.5 43 48.5H21C22.5 46.5 25 45 25 42Z',
      BASE,
    ],
  },
  king: {
    cy: 30,
    parts: [
      'M30.5 5H33.5V8.5H38V11.5H33.5V16H30.5V11.5H26V8.5H30.5Z',
      'M21 33C21 24 25 18.5 32 18.5C39 18.5 43 24 43 33Z',
      rr(21, 35.5, 22, 3.5, 1.75),
      'M26 41.5H38C38 44.5 41.5 46 44 48.5H20C22.5 46 26 44.5 26 41.5Z',
      BASE,
    ],
  },
  knight: {
    cy: 32,
    parts: [
      'M19 48.5C19.5 41 24 38 27 34.2C25.5 35.4 22 38 18.8 37C15.6 36 14 33.4 15.4 30.8C18.2 25.4 24 18.4 33 14.6L34.6 8.4L40.4 12.8C47.5 17.6 51 29 48.4 41C48 44 47.8 46.5 47.6 48.5Z',
      BASE,
    ],
    details: [{ kind: 'dot', cx: 31, cy: 22.5, r: 1.7 }],
  },
};

/* ------------------------------ frames ----------------------------- */
const SHIELD = 'M22 20L64 10L106 20V62C106 90 86 108 64 120C42 108 22 90 22 62Z';
interface FrameDef { outer: React.ReactNode; inner?: React.ReactNode; pieceScale: number }

/* each frame returns shapes as functions of paint so both sets share geometry */
type Paint = { fill?: string; stroke?: string; sw?: number; op?: number };
const shapeFor = (kind: FrameKind, inset = 0): React.ReactElement | null => null;

function frameShape(kind: FrameKind, p: Paint, scale = 1): React.ReactElement {
  const t = scale === 1 ? undefined : `translate(64 64) scale(${scale}) translate(-64 -64)`;
  const common = { fill: p.fill ?? 'none', stroke: p.stroke ?? 'none', strokeWidth: p.sw, opacity: p.op, strokeLinejoin: 'round' as const, transform: t, vectorEffect: 'non-scaling-stroke' as const };
  switch (kind) {
    case 'circle': case 'ring': case 'sun':
      return <circle cx="64" cy="64" r={kind === 'sun' ? 50 : 54} {...common} />;
    case 'hex': case 'hexRing':
      return <polygon points={polyPts(64, 64, 54, 6, -90)} {...common} />;
    case 'diamond': case 'diamondRing':
      return <polygon points={polyPts(64, 64, 52, 4, -90)} {...common} />;
    case 'octagonRing':
      return <polygon points={polyPts(64, 64, 55, 8, -67.5)} {...common} />;
    case 'shield': case 'shieldRing':
      return <path d={SHIELD} {...common} />;
  }
}
const hasInnerRing = (k: FrameKind) => k === 'ring' || k === 'hexRing' || k === 'diamondRing' || k === 'shieldRing' || k === 'octagonRing';
const pieceScaleFor = (k: FrameKind) => (k === 'diamond' || k === 'diamondRing' ? 0.98 : k === 'shield' || k === 'shieldRing' ? 1.05 : 1.12);
const pieceShiftY = (k: FrameKind) => (k === 'shield' || k === 'shieldRing' ? 2 : 0);

/* ------------------------------ badge ------------------------------ */
export interface RankBadgeProps {
  rankId: RankId;
  size?: number;
  set?: BadgeSet;
  artUrl?: string;
  className?: string;
}

export const RankBadge = ({ rankId, size = 128, set = 'solid', artUrl, className }: RankBadgeProps) => {
  const r = getRankVisual(rankId);
  const art = artUrl ?? r.artUrl;
  const solid = set === 'solid';
  const c = r.color;
  const piece = PIECES[r.piece];
  const s = pieceScaleFor(r.frame);
  const ty = 64 - piece.cy * s + pieceShiftY(r.frame);
  const tx = 64 - 32 * s;

  const glyphPaint = solid
    ? { fill: INK }
    : { fill: 'none', stroke: c, strokeWidth: 2.4, strokeLinejoin: 'round' as const };
  const detailStroke = solid ? c : c;

  return (
    <svg viewBox="0 0 128 128" width={size} height={size} className={className}
      role="img" aria-label={`${r.name} rank badge, ${set} set`} style={{ display: 'block', overflow: 'visible' }}>
      {art ? (
        <image href={art} x="4" y="4" width="120" height="120" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <>
          {/* sun ticks (Supreme Deity) */}
          {r.frame === 'sun' &&
            Array.from({ length: 24 }, (_, i) => {
              const a = (i * 15 * Math.PI) / 180;
              const long = i % 2 === 0;
              const r1 = 56, r2 = long ? 63 : 60;
              return <line key={i} x1={f2(64 + r1 * Math.cos(a))} y1={f2(64 + r1 * Math.sin(a))} x2={f2(64 + r2 * Math.cos(a))} y2={f2(64 + r2 * Math.sin(a))}
                stroke={c} strokeWidth={2.4} strokeLinecap="round" />;
            })}

          {/* plate */}
          {solid
            ? frameShape(r.frame, { fill: c, stroke: c, sw: 3 })
            : frameShape(r.frame, { fill: c, stroke: c, sw: 3.2 })}
          {!solid && frameShape(r.frame, { fill: '#0B0A12', stroke: 'none' }, 0.985)}
          {!solid && frameShape(r.frame, { fill: c, stroke: 'none', op: 0.09 }, 0.985)}
          {hasInnerRing(r.frame) &&
            frameShape(r.frame, { stroke: solid ? INK : c, sw: solid ? 2 : 1.6, op: solid ? 0.45 : 0.55 }, 0.86)}

          {/* halo */}
          {r.halo && <ellipse cx="64" cy={f2(64 - (piece.cy - 5) * s - 9)} rx="19" ry="5" fill="none" stroke={solid ? INK : '#A78BFA'} strokeWidth={2.6} />}

          {/* piece */}
          <g transform={`translate(${f2(tx)} ${f2(ty)}) scale(${s})`}>
            {piece.parts.map((d, i) => <path key={i} d={d} {...glyphPaint} vectorEffect={solid ? undefined : 'non-scaling-stroke'} />)}
            {piece.details?.map((dt, i) =>
              dt.kind === 'line'
                ? <path key={`d${i}`} d={dt.d} fill="none" stroke={detailStroke} strokeWidth={2.2} strokeLinecap="round" vectorEffect={solid ? undefined : 'non-scaling-stroke'} />
                : <circle key={`d${i}`} cx={dt.cx} cy={dt.cy} r={dt.r} fill={solid ? c : c} />)}
          </g>

          {/* tier pips */}
          {r.pips > 0 &&
            Array.from({ length: r.pips }, (_, i) => (
              <circle key={i} cx={64 + (i - (r.pips - 1) / 2) * 10} cy={103} r={2.8} fill={solid ? INK : c} />
            ))}
        </>
      )}
    </svg>
  );
};

/* ------------------------------ showcase --------------------------- */
const PAGE_CSS = `
.lr-page{background:#0B0A12;color:#EDEAF7;min-height:100vh;padding:clamp(28px,6vw,64px) 18px 72px;
  font-family:Inter,"SF Pro Text",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.lr-wrap{max-width:1040px;margin:0 auto}
.lr-head{display:flex;flex-wrap:wrap;gap:20px;align-items:end;justify-content:space-between;margin-bottom:32px}
.lr-head h1{margin:0 0 8px;font-size:clamp(26px,4.4vw,38px);font-weight:650;letter-spacing:-.02em}
.lr-head p{margin:0;max-width:54ch;color:#A29EBD;font-size:15px;line-height:1.55}
.lr-seg{display:inline-flex;padding:4px;border-radius:12px;background:#15131F;border:1px solid #26233A}
.lr-seg button{appearance:none;border:0;background:transparent;color:#A29EBD;font:600 14px/1 inherit;font-family:inherit;
  padding:11px 18px;border-radius:9px;cursor:pointer;min-height:44px}
.lr-seg button[aria-pressed="true"]{background:#2A2644;color:#fff}
.lr-seg button:focus-visible{outline:2px solid #8E72F2;outline-offset:2px}
.lr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:12px}
.lr-card{display:flex;flex-direction:column;align-items:center;padding:24px 12px 20px;border-radius:14px;
  background:#12101B;border:1px solid #22203A}
.lr-name{margin:14px 0 3px;font-size:16px;font-weight:600;text-align:center}
.lr-min{font-size:13px;color:#8F8BAA}
.lr-strip{margin-top:36px;padding:20px;border-radius:14px;background:#12101B;border:1px solid #22203A}
.lr-strip h2{margin:0 0 14px;font-size:14px;font-weight:600;color:#A29EBD}
.lr-strip-row{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-bottom:12px}
@media (max-width:520px){.lr-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.lr-card{padding:18px 8px 16px}}
`;

export default function LeagueRankShowcase() {
  const [set, setSet] = useState<BadgeSet>('solid');
  return (
    <main className="lr-page">
      <style>{PAGE_CSS}</style>
      <div className="lr-wrap">
        <header className="lr-head">
          <div>
            <h1>League ranks</h1>
            <p>Everyone starts at Rusted Chrome with 0 trophies. Each family borrows a chess piece, from pawn up to king.</p>
          </div>
          <div className="lr-seg" role="group" aria-label="Badge set">
            <button type="button" aria-pressed={set === 'solid'} onClick={() => setSet('solid')}>Solid</button>
            <button type="button" aria-pressed={set === 'line'} onClick={() => setSet('line')}>Line</button>
          </div>
        </header>

        <section className="lr-grid">
          {RANKS.map((r) => (
            <article key={r.id} className="lr-card">
              <RankBadge rankId={r.id} size={112} set={set} />
              <div className="lr-name">{r.name}</div>
              <div className="lr-min">{r.minTrophies === 0 ? 'Starting rank' : `${r.minTrophies.toLocaleString()}+ trophies`}</div>
            </article>
          ))}
        </section>

        <section className="lr-strip" aria-label="Small size check">
          <h2>How they look at small sizes</h2>
          {(['solid', 'line'] as BadgeSet[]).map((s) => (
            <div className="lr-strip-row" key={s}>
              {RANKS.map((r) => <RankBadge key={r.id} rankId={r.id} size={40} set={s} />)}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
