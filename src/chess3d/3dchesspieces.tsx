/**
 * 3dchesspieces.tsx
 * ---------------------------------------------------------------------------
 * Hand-drawn, hard-coded 3D-looking classic (Staunton-style) chess pieces,
 * pure SVG inside TSX. Chunky, glossy and cute, but they read as real chess
 * pieces: pawn, rook, knight, bishop, queen and a king wearing the Spanish
 * royal crown (gold band, leaf fleurons, arches, red velvet cap, orb + cross).
 *
 * Camera is a steep top-down view, light comes from the upper-left, so every
 * piece has a glossy highlight top-left, a darker rim bottom-right and a long
 * blurred cast shadow thrown to the right.
 *
 * Origin (0,0) of every piece = centre of its board cell (cell = 100 units).
 * Pieces grow "upwards" (negative y) because the camera is slightly tilted.
 *
 * Pieces : pawn, rook, knight, bishop, queen, king
 * Teams  : "white" | "black"
 *          (legacy "orange" -> white and "red" -> black are still accepted)
 *
 * Usage inside an <svg>:
 *   <PieceDefs />                         // once per <svg>
 *   <PieceShadow type="king" x={50} y={50} />
 *   <Piece3D type="king" team="white" x={50} y={50} />
 * Or stand-alone:
 *   <Piece3DStandalone type="king" team="black" size={160} />
 */
import React from "react";
 
export type Team = "white" | "black" | "orange" | "red";
export type LegacyTeam = "orange" | "red";
export type PieceType = "pawn" | "king" | "queen" | "rook" | "bishop" | "knight";

export const PIECE_TYPES: PieceType[] = ["pawn", "rook", "knight", "bishop", "queen", "king"];

export const normTeam = (t: Team | LegacyTeam): "white" | "black" => (t === "black" || t === "red" ? "black" : "white");

/* ----------------------------- colour palettes ---------------------------- */
type Stops = [number, string][];
interface Palette {
  side: Stops; // horizontal gradient for cylindrical sides (light on the left)
  top: Stops; // flat top faces
  dome: Stops; // spheres / domes
  line: string; // outline colour
  hollow: string; // recessed areas (rook top, slits, windows)
}

const BASE_PALETTE: Record<"white" | "black", Palette> = {
  white: {
    side: [[0, "#e6dfd1"], [0.26, "#ffffff"], [0.62, "#ece5d8"], [1, "#b2a893"]],
    top: [[0, "#ffffff"], [0.6, "#f5efe3"], [1, "#d9d0bd"]],
    dome: [[0, "#ffffff"], [0.5, "#efe8da"], [1, "#a69c86"]],
    line: "rgba(70,56,30,0.5)",
    hollow: "#a99f8a",
  },
  black: {
    side: [[0, "#262830"], [0.26, "#666b7c"], [0.62, "#2a2c35"], [1, "#07080b"]],
    top: [[0, "#7a8094"], [0.6, "#40434f"], [1, "#22242c"]],
    dome: [[0, "#8a91a8"], [0.45, "#363944"], [1, "#07080b"]],
    line: "rgba(0,0,0,0.75)",
    hollow: "#050507",
  },
};

const PALETTE: Record<Team, Palette> = {
  white: BASE_PALETTE.white,
  black: BASE_PALETTE.black,
  orange: BASE_PALETTE.white,
  red: BASE_PALETTE.black,
};
 
const P = "c3d-"; // id prefix
const GOLD_LINE = "rgba(110,62,12,0.6)";
const K = 0.34; // vertical squash of horizontal circles (camera tilt)
 
/* -------------------------------- helpers --------------------------------- */
const RG: React.FC<{
  id: string;
  stops: Stops;
  cx?: number;
  cy?: number;
  r?: number;
  fx?: number;
  fy?: number;
}> = ({ id, stops, cx = 0.5, cy = 0.5, r = 0.68, fx = 0.34, fy = 0.26 }) => (
  <radialGradient id={id} cx={cx} cy={cy} r={r} fx={fx} fy={fy}>
    {stops.map(([o, c], i) => (
      <stop key={i} offset={o} stopColor={c} stopOpacity="1" />
    ))}
  </radialGradient>
);
 
const LG: React.FC<{ id: string; stops: Stops }> = ({ id, stops }) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
    {stops.map(([o, c], i) => (
      <stop key={i} offset={o} stopColor={c} stopOpacity="1" />
    ))}
  </linearGradient>
);
 
/** All gradients + blur filters. Render ONCE inside every <svg> that uses pieces. */
export const PieceDefs: React.FC = () => (
  <defs>
    {(["white", "black", "orange", "red"] as Team[]).map((t) => {
      const p = PALETTE[t];
      return (
        <React.Fragment key={t}>
          <LG id={`${P}${t}-side`} stops={p.side} />
          <RG id={`${P}${t}-top`} stops={p.top} cx={0.4} cy={0.4} r={0.75} fx={0.3} fy={0.3} />
          <RG id={`${P}${t}-dome`} stops={p.dome} />
        </React.Fragment>
      );
    })}
    {/* gold */}
    <LG id={`${P}g-side`} stops={[[0, "#c58a2e"], [0.26, "#ffeaa6"], [0.6, "#e9a947"], [1, "#8a4f14"]]} />
    <RG id={`${P}g-top`} stops={[[0, "#fff3c4"], [0.6, "#f2c25e"], [1, "#c9892c"]]} cx={0.4} cy={0.4} r={0.75} fx={0.3} fy={0.3} />
    <RG id={`${P}g-dome`} stops={[[0, "#fff6cf"], [0.45, "#f0b94f"], [1, "#965a1a"]]} />
    {/* royal red velvet cap, ruby, pearl */}
    <RG id={`${P}velvet`} stops={[[0, "#f0574e"], [0.5, "#c01f2f"], [1, "#6a0a17"]]} cx={0.4} cy={0.35} r={0.8} fx={0.3} fy={0.25} />
    <RG id={`${P}ruby`} stops={[[0, "#ffc1c8"], [0.45, "#e0283c"], [1, "#7a0b1c"]]} />
    <RG id={`${P}sapphire`} stops={[[0, "#c9e2ff"], [0.45, "#2f78e0"], [1, "#12306e"]]} />
    <RG id={`${P}pearl`} stops={[[0, "#ffffff"], [0.6, "#f1ece4"], [1, "#b9b0a2"]]} />
    {/* blur filters for shadows */}
    <filter id={`${P}blurL`} x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    <filter id={`${P}blurM`} x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
    <filter id={`${P}blurS`} x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
  </defs>
);
 
/**
 * A lathe-turned ring / cylinder / cone seen from above.
 * y0 = centre of the top ellipse, y1 = centre of the bottom ellipse,
 * r0 = top radius, r1 = bottom radius.
 */
const Band: React.FC<{
  team: Team;
  y0: number;
  y1: number;
  r0: number;
  r1: number;
  metal?: boolean;
}> = ({ team, y0, y1, r0, r1, metal = false }) => {
  const normT = normTeam(team);
  const solidSide = metal ? "#c58a2e" : normT === "white" ? "#ece5d8" : "#2a2c35";
  const solidTop = metal ? "#f2c25e" : normT === "white" ? "#f5efe3" : "#40434f";
  const line = metal ? GOLD_LINE : PALETTE[team].line;
  const side = metal ? `url(#${P}g-side)` : `url(#${P}${team}-side)`;
  const top = metal ? `url(#${P}g-top)` : `url(#${P}${team}-top)`;
  const d = `M ${-r0} ${y0} L ${-r1} ${y1} A ${r1} ${r1 * K} 0 0 0 ${r1} ${y1} L ${r0} ${y0} A ${r0} ${r0 * K} 0 0 0 ${-r0} ${y0} Z`;
  return (
    <g>
      <path d={d} fill={solidSide} stroke={line} strokeWidth="1.1" strokeLinejoin="round" />
      <path d={d} fill={side} stroke={line} strokeWidth="1.1" strokeLinejoin="round" />
      <ellipse cx="0" cy={y0} rx={r0} ry={r0 * K} fill={solidTop} stroke={line} strokeWidth="1" />
      <ellipse cx="0" cy={y0} rx={r0} ry={r0 * K} fill={top} stroke={line} strokeWidth="1" />
      {/* glossy vertical highlight on the left */}
      <path
        d={`M ${-r0 * 0.55} ${y0 + r0 * K * 0.84} L ${-r1 * 0.55} ${y1 + r1 * K * 0.84}`}
        stroke="#fff"
        strokeOpacity={metal ? 0.55 : 0.5}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};
 
/** Glossy sphere / egg. */
const Blob: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
  fill: string;
  stroke: string;
  solidFallback?: string;
}> = ({ cx, cy, rx, ry = rx, fill, stroke, solidFallback }) => (
  <g transform={`translate(${cx} ${cy})`}>
    {solidFallback && <ellipse rx={rx} ry={ry} fill={solidFallback} stroke={stroke} strokeWidth="1.1" />}
    <ellipse rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth="1.1" />
    {/* rim shade bottom-right */}
    <path
      d={`M ${rx * 0.8} ${-ry * 0.3} A ${rx * 0.86} ${ry * 0.86} 0 0 1 ${rx * 0.05} ${ry * 0.86}`}
      fill="none"
      stroke="#000"
      strokeOpacity="0.14"
      strokeWidth={Math.max(1.4, rx * 0.17)}
      strokeLinecap="round"
    />
    {/* specular highlight top-left */}
    <ellipse
      cx={-rx * 0.36}
      cy={-ry * 0.42}
      rx={rx * 0.3}
      ry={ry * 0.17}
      fill="#fff"
      opacity="0.75"
      transform={`rotate(-35 ${-rx * 0.36} ${-ry * 0.42})`}
    />
  </g>
);
 
const Gold: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <Blob cx={cx} cy={cy} rx={r} fill={`url(#${P}g-dome)`} stroke={GOLD_LINE} />
);
 
/** The shared chunky plinth every piece stands on. r = foot radius. */
const Plinth: React.FC<{ team: Team; r: number }> = ({ team, r }) => (
  <g>
    <Band team={team} y0={14} y1={23} r0={r * 0.96} r1={r} />
    <Band team={team} y0={8} y1={14} r0={r * 0.78} r1={r * 0.86} metal />
  </g>
);
 
/* --------------------------------- shadows -------------------------------- */
// cast shadow (offset to the right, light is upper-left) – drawn on the board
const SHADOW: Record<PieceType, { dx: number; dy: number; rx: number; ry: number; o: number }> = {
  pawn: { dx: 28, dy: -6, rx: 22, ry: 28, o: 0.66 },
  knight: { dx: 32, dy: -10, rx: 25, ry: 34, o: 0.7 },
  bishop: { dx: 34, dy: -12, rx: 25, ry: 38, o: 0.72 },
  king: { dx: 40, dy: -16, rx: 30, ry: 44, o: 0.76 },
  queen: { dx: 38, dy: -14, rx: 28, ry: 40, o: 0.74 },
  rook: { dx: 30, dy: -8, rx: 26, ry: 32, o: 0.7 },
};
 
/** Soft cast shadow + contact shadow. Draw BEFORE the piece (ideally all shadows first). */
export const PieceShadow: React.FC<{ type: PieceType; x?: number; y?: number }> = ({
  type,
  x = 0,
  y = 0,
}) => {
  const s = SHADOW[type];
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <ellipse cx={s.dx} cy={s.dy} rx={s.rx} ry={s.ry} fill="#000" opacity={s.o} filter={`url(#${P}blurL)`} />
      <ellipse cx={s.dx * 0.3} cy={16} rx={s.rx * 1.1} ry={s.ry * 0.38} fill="#000" opacity="0.55" filter={`url(#${P}blurM)`} />
    </g>
  );
};
 
/* ---------------------------------- PAWN ---------------------------------- */
const Pawn: React.FC<{ team: Team }> = ({ team }) => {
  const line = PALETTE[team].line;
  return (
    <g>
      <Plinth team={team} r={26} />
      {/* stem */}
      <Band team={team} y0={-6} y1={8} r0={9} r1={14} />
      {/* collar */}
      <Band team={team} y0={-13} y1={-6} r0={15} r1={15} />
      {/* round head */}
      <Blob cx={0} cy={-27} rx={15.5} fill={`url(#${P}${team}-dome)`} stroke={line} />
    </g>
  );
};
 
/* ---------------------------------- ROOK ---------------------------------- */
const Merlon: React.FC<{ team: Team; x: number; y: number }> = ({ team, x, y }) => {
  const line = PALETTE[team].line;
  return (
    <g>
      <rect x={x - 5.8} y={y - 11} width="11.6" height="11" rx="1.6" fill={`url(#${P}${team}-side)`} stroke={line} strokeWidth="1" />
      <ellipse cx={x} cy={y - 11} rx="5.8" ry="2.4" fill={`url(#${P}${team}-top)`} stroke={line} strokeWidth="0.9" />
      <path d={`M ${x - 3} ${y - 8} L ${x - 3} ${y - 2}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
};
 
const Rook: React.FC<{ team: Team }> = ({ team }) => {
  const p = PALETTE[team];
  const rimY = -33;
  const mer = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: Math.cos(a) * 19.5, y: rimY + Math.sin(a) * 19.5 * K, key: deg };
  };
  const back = [270, 210, 330].map(mer);
  const front = [150, 30, 90].map(mer);
  return (
    <g>
      <Plinth team={team} r={28} />
      {/* tower body */}
      <Band team={team} y0={-22} y1={8} r0={18} r1={21} />
      {/* arched window */}
      <path d="M -4.2 -2 L -4.2 -12 A 4.2 4.2 0 0 1 4.2 -12 L 4.2 -2 Z" fill={p.hollow} stroke={p.line} strokeWidth="0.8" opacity="0.9" />
      <path d="M -4.2 -2 L 4.2 -2" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.2" />
      {/* gold belt */}
      <Band team={team} y0={-24} y1={-20} r0={19.5} r1={19.5} metal />
      {/* top platform */}
      <Band team={team} y0={rimY} y1={-24} r0={24} r1={19.5} />
      {/* hollow top */}
      <ellipse cx="0" cy={rimY} rx="18.5" ry={18.5 * K} fill={p.hollow} stroke={p.line} strokeWidth="0.9" />
      <ellipse cx="0" cy={rimY + 1.6} rx="15" ry={15 * K} fill="#000" opacity="0.18" />
      {/* battlements */}
      {back.map((m) => (
        <Merlon key={m.key} team={team} x={m.x} y={m.y} />
      ))}
      {front.map((m) => (
        <Merlon key={m.key} team={team} x={m.x} y={m.y} />
      ))}
    </g>
  );
};
 
/* --------------------------------- KNIGHT --------------------------------- */
const HORSE =
  "M -17 9 C -23 -2 -21 -13 -17 -20 C -23 -22 -30 -24 -35 -27 C -40 -29 -43 -34 -41 -39 C -39 -45 -31 -50 -24 -56 C -20 -60 -16 -66 -12 -73 L -4 -64 C 8 -60 18 -44 21 -28 C 24 -14 24 -2 21 9 A 19 6.5 0 0 1 -17 9 Z";
const MANE =
  "M -9 -64 L -4 -64 C 8 -60 18 -44 21 -28 C 23 -20 23.5 -10 22.5 -2 L 12 -2 C 13 -10 12 -17 9 -26 C 6 -40 -1 -52 -9 -58 Z";
 
const Knight: React.FC<{ team: Team }> = ({ team }) => {
  const p = PALETTE[team];
  return (
    <g transform="scale(0.92) translate(0 2)">
      <Plinth team={team} r={27} />
      {/* far ear */}
      <path d="M -6 -64 L 0 -77 L 6 -61 Z" fill={`url(#${P}${team}-side)`} stroke={p.line} strokeWidth="1" strokeLinejoin="round" />
      {/* head + neck */}
      <path d={HORSE} fill={`url(#${P}${team}-side)`} stroke={p.line} strokeWidth="1.3" strokeLinejoin="round" />
      {/* inner ear */}
      <path d="M -19 -61 C -17 -64 -15 -67 -13 -69 L -9 -64 Z" fill="#000" opacity="0.2" />
      {/* golden mane */}
      <path d={MANE} fill={`url(#${P}g-side)`} stroke={GOLD_LINE} strokeWidth="1" strokeLinejoin="round" />
      <g fill="none" stroke="#7a4410" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round">
        <path d="M -4 -58 Q 3 -57 8 -61" />
        <path d="M 2 -48 Q 9 -46 14 -50" />
        <path d="M 6 -37 Q 13 -35 18 -39" />
        <path d="M 9 -26 Q 16 -24 21 -27" />
        <path d="M 10 -15 Q 17 -13 22 -16" />
        <path d="M 11 -5 Q 17 -3 22.5 -6" />
      </g>
      {/* eye */}
      <ellipse cx="-27" cy="-47" rx="3.3" ry="3.9" fill="#15110d" />
      <circle cx="-28" cy="-48.6" r="1.3" fill="#fff" />
      {/* nostril + mouth */}
      <ellipse cx="-38" cy="-37" rx="1.5" ry="2.3" transform="rotate(-20 -38 -37)" fill={p.hollow} />
      <path d="M -36 -31 Q -30 -28 -24 -27" fill="none" stroke={p.hollow} strokeWidth="1.1" strokeLinecap="round" />
      {/* cheek line */}
      <path d="M -17 -38 Q -12 -44 -13 -52" fill="none" stroke={p.hollow} strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />
      {/* gloss */}
      <path d="M -37 -43 C -33 -49 -29 -52 -25 -56" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M -14 -30 C -16 -14 -14 -3 -12 5" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      {/* rim shade under the jaw */}
      <path d="M -17 -20 C -21 -13 -22 -4 -17 9" fill="none" stroke="#000" strokeOpacity="0.14" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
};
 
/* --------------------------------- BISHOP --------------------------------- */
const Bishop: React.FC<{ team: Team }> = ({ team }) => {
  const p = PALETTE[team];
  return (
    <g>
      <Plinth team={team} r={27} />
      {/* tapered body */}
      <Band team={team} y0={-20} y1={8} r0={10} r1={17} />
      {/* gold collar */}
      <Band team={team} y0={-27} y1={-20} r0={16} r1={16} metal />
      {/* neck */}
      <Band team={team} y0={-31} y1={-27} r0={11} r1={12} />
      {/* mitre head */}
      <Blob cx={0} cy={-47} rx={15} ry={19} fill={`url(#${P}${team}-dome)`} stroke={p.line} />
      {/* diagonal mitre slit */}
      <path d="M -6 -60 Q 4 -51 10 -39" fill="none" stroke={p.hollow} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M -4.2 -61.5 Q 5.5 -52.5 11.6 -40.5" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.1" strokeLinecap="round" />
      {/* golden finial */}
      <Gold cx={0} cy={-69} r={5.6} />
    </g>
  );
};
 
/* ---------------------------------- QUEEN --------------------------------- */
const Queen: React.FC<{ team: Team }> = ({ team }) => {
  const p = PALETTE[team];
  const rimY = -54;
  const orb = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: Math.cos(a) * 22, y: rimY + Math.sin(a) * 22 * K, key: deg };
  };
  const back = [202, 247, 292, 337].map(orb);
  const front = [157, 112, 67, 22].map(orb);
  return (
    <g>
      <Plinth team={team} r={29} />
      {/* long body */}
      <Band team={team} y0={-32} y1={8} r0={11} r1={19} />
      {/* gold collar */}
      <Band team={team} y0={-38} y1={-31} r0={18} r1={18} metal />
      {/* flared crown cup */}
      <Band team={team} y0={rimY} y1={-38} r0={25} r1={14} />
      {/* recessed crown interior */}
      <ellipse cx="0" cy={rimY} rx="20.5" ry={20.5 * K} fill={p.hollow} stroke={p.line} strokeWidth="0.9" />
      <ellipse cx="0" cy={rimY + 1.5} rx="16" ry={16 * K} fill="#000" opacity="0.16" />
      {/* coronet balls: back, centre jewel, front */}
      {back.map((o) => (
        <Gold key={o.key} cx={o.x} cy={o.y} r={4.2} />
      ))}
      <Gold cx={0} cy={rimY - 4} r={7.4} />
      {front.map((o) => (
        <Gold key={o.key} cx={o.x} cy={o.y} r={4.4} />
      ))}
    </g>
  );
};
 
/* ---------------------------------- KING ---------------------------------- */
/** A single acanthus leaf of the Spanish crown (gold, pearl tipped). */
const Leaf: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path
      d="M -3.8 0 Q -4.2 -7 0 -12.5 Q 4.2 -7 3.8 0 Z"
      fill={`url(#${P}g-side)`}
      stroke={GOLD_LINE}
      strokeWidth="0.9"
      strokeLinejoin="round"
    />
    <path d="M 0 -1 L 0 -9" stroke="#7a4410" strokeOpacity="0.4" strokeWidth="0.9" strokeLinecap="round" />
    <circle cx="0" cy="-13.4" r="1.9" fill={`url(#${P}pearl)`} stroke="rgba(90,70,40,0.5)" strokeWidth="0.6" />
  </g>
);
 
const King: React.FC<{ team: Team }> = ({ team }) => {
  const rimY = -54; // centre of the crown's top rim
  const R = 22; // radius where arches start
  const H = 28; // arch height
  const apexY = rimY - H;
 
  // leaves around the crown rim
  const leafAngles = [200, 235, 270, 305, 340, 20, 55, 90, 125, 160];
  const leaf = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: Math.cos(a) * 24, y: rimY + Math.sin(a) * 24 * K, rot: Math.cos(a) * 12, sin: Math.sin(a), key: deg };
  };
  const leaves = leafAngles.map(leaf);
  const backLeaves = leaves.filter((l) => l.sin < 0);
  const frontLeaves = leaves.filter((l) => l.sin >= 0);
 
  // five visible arches (eight in total on the real crown)
  const arches = [-90, -45, 0, 45, 90].map((deg) => {
    const a = (deg * Math.PI) / 180;
    const x0 = R * Math.sin(a);
    const y0 = rimY + R * K * Math.cos(a);
    return { d: `M ${x0} ${y0} C ${x0} ${y0 - H * 0.6} ${x0 * 0.45} ${apexY} 0 ${apexY}`, key: deg };
  });
 
  // gems set into the crown band (front half)
  const bandMid = (rimY + -37) / 2;
  const gems = [30, 60, 90, 120, 150].map((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const rr = 23.5;
    return {
      x: Math.cos(a) * rr,
      y: bandMid + Math.sin(a) * rr * K + 1.5,
      w: Math.max(0.45, Math.sin(a)),
      kind: i % 2 === 0 ? "ruby" : "sapphire",
      key: deg,
    };
  });
 
  return (
    <g transform="scale(0.8) translate(0 4)">
      <Plinth team={team} r={33} />
      {/* long body */}
      <Band team={team} y0={-28} y1={8} r0={13} r1={22} />
      {/* gold collar */}
      <Band team={team} y0={-35} y1={-27} r0={20} r1={20} metal />
 
      {/* ===== Spanish royal crown ===== */}
      {/* gold band */}
      <Band team={team} y0={rimY} y1={-37} r0={26} r1={21} metal />
      {/* band gems + pearl studs */}
      {gems.map((g) => (
        <g key={g.key}>
          <ellipse
            cx={g.x}
            cy={g.y}
            rx={3.6 * g.w}
            ry={4.2}
            fill={`url(#${P}${g.kind})`}
            stroke="rgba(90,40,10,0.7)"
            strokeWidth="0.8"
          />
          <ellipse cx={g.x - 1 * g.w} cy={g.y - 1.6} rx={1.1 * g.w} ry={0.8} fill="#fff" opacity="0.8" />
        </g>
      ))}
      {[15, 45, 75, 105, 135, 165].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={Math.cos(a) * 23.5}
            cy={bandMid + Math.sin(a) * 23.5 * K + 1.5}
            r={1.7}
            fill={`url(#${P}pearl)`}
            stroke="rgba(90,70,40,0.5)"
            strokeWidth="0.5"
          />
        );
      })}
 
      {/* back leaves */}
      {backLeaves.map((l) => (
        <Leaf key={l.key} x={l.x} y={l.y} rot={l.rot} />
      ))}
 
      {/* red velvet cap */}
      <path
        d={`M ${-R} ${rimY} C ${-R} ${rimY - 20} -11 ${apexY} 0 ${apexY} C 11 ${apexY} ${R} ${rimY - 20} ${R} ${rimY} A ${R} ${R * K} 0 0 1 ${-R} ${rimY} Z`}
        fill={`url(#${P}velvet)`}
        stroke="rgba(60,0,10,0.7)"
        strokeWidth="1"
      />
      {/* velvet sheen */}
      <path d={`M -14 ${rimY - 4} C -15 ${rimY - 16} -9 ${apexY + 5} -3 ${apexY + 3}`} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2.6" strokeLinecap="round" />
 
      {/* arches */}
      {arches.map((a) => (
        <g key={a.key} fill="none" strokeLinecap="round">
          <path d={a.d} stroke="rgba(110,62,12,0.9)" strokeWidth="5.6" />
          <path d={a.d} stroke="#f2bd55" strokeWidth="3.8" />
          <path d={a.d} stroke="#fff6cf" strokeOpacity="0.7" strokeWidth="1.1" transform="translate(-0.8 -0.6)" />
        </g>
      ))}
 
      {/* front leaves */}
      {frontLeaves.map((l) => (
        <Leaf key={l.key} x={l.x} y={l.y} rot={l.rot} />
      ))}
 
      {/* orb + cross on top */}
      <Gold cx={0} cy={apexY - 3} r={7} />
      <path d={`M -6.5 ${apexY - 3} Q 0 ${apexY - 0.5} 6.5 ${apexY - 3}`} fill="none" stroke={GOLD_LINE} strokeWidth="1" />
      <g>
        <rect x="-2.1" y={apexY - 27} width="4.2" height="19" rx="1.4" fill={`url(#${P}g-side)`} stroke={GOLD_LINE} strokeWidth="0.9" />
        <rect x="-6.4" y={apexY - 22} width="12.8" height="4.2" rx="1.4" fill={`url(#${P}g-side)`} stroke={GOLD_LINE} strokeWidth="0.9" />
        <circle cx="0" cy={apexY - 20} r="1.5" fill={`url(#${P}ruby)`} />
      </g>
    </g>
  );
};
 
/* ------------------------------- public API -------------------------------- */
export interface Piece3DProps {
  type: PieceType;
  team: Team | LegacyTeam;
  /** centre of the cell, in the parent <svg> coordinate space */
  x?: number;
  y?: number;
  /** optional scale, 1 = cell size 100 */
  scale?: number;
}
 
/** The piece itself (no shadow). */
export const Piece3D: React.FC<Piece3DProps> = ({ type, team: rawTeam, x = 0, y = 0, scale = 1 }) => {
  const team = normTeam(rawTeam);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity="1" style={{ opacity: 1 }}>
      {type === "pawn" && <Pawn team={team} />}
      {type === "king" && <King team={team} />}
      {type === "queen" && <Queen team={team} />}
      {type === "rook" && <Rook team={team} />}
      {type === "bishop" && <Bishop team={team} />}
      {type === "knight" && <Knight team={team} />}
    </g>
  );
};
 
/** One piece in its own <svg>, with defs + shadow. */
export const Piece3DStandalone: React.FC<{
  type: PieceType;
  team: Team | LegacyTeam;
  size?: number;
  background?: string;
}> = ({ type, team, size = 160, background = "#bfae8c" }) => (
  <svg width={size} height={size} viewBox="-70 -105 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="-70" y="-105" width="200" height="200" fill={background} />
    <PieceDefs />
    <PieceShadow type={type} />
    <Piece3D type={type} team={team} />
  </svg>
);
 
export default Piece3D;
 