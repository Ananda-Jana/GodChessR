/**
 * 3dchesspieces.tsx
 * ---------------------------------------------------------------------------
 * Hand-drawn, hard-coded 3D-looking cat chess pieces (pure SVG inside TSX).
 * Camera is a steep top-down view, light comes from the upper-left, so every
 * piece has a glossy highlight top-left, a dark rim bottom-right and a long
 * blurred cast shadow thrown to the right.
 *
 * Origin (0,0) of every piece = centre of its board cell (cell = 100 units).
 * Pieces grow "upwards" (negative y) because the camera is slightly tilted.
 *
 * Pieces : pawn, rook, knight, bishop, queen, king
 * Teams  : "orange" (light side)  |  "red" (dark side)
 *
 * Usage inside an <svg>:
 *   <PieceDefs />                         // once per <svg>
 *   <PieceShadow type="king" x={50} y={50} />
 *   <Piece3D type="king" team="orange" x={50} y={50} />
 * Or stand-alone:
 *   <Piece3DStandalone type="king" team="red" size={160} />
 */
import React from "react";

export type Team = "orange" | "red";
export type PieceType = "pawn" | "king" | "queen" | "rook" | "bishop" | "knight";

export const PIECE_TYPES: PieceType[] = ["pawn", "rook", "knight", "bishop", "queen", "king"];

/* ----------------------------- colour palettes ---------------------------- */
type Stops = [number, string][];
interface Palette {
  dome: Stops; // glossy head / dome
  crown: Stops; // king crown metal
  fur: Stops; // king face fur
  hood: Stops; // knight hood
  face: Stops; // knight face
  body: Stops; // knight body
  ridge: string; // crown ridges
  brow: string; // eyebrows
  iris: string; // king eye
  pupil: string;
  bishopEye: string;
  mask: string; // bishop face mask
  mustache: Stops;
  patch: string; // knight eye patches
}

const PALETTE: Record<Team, Palette> = {
  orange: {
    dome: [[0, "#ffe2ae"], [0.45, "#f2a851"], [1, "#b3621d"]],
    crown: [[0, "#fff1c8"], [0.5, "#f8c76e"], [1, "#c07a2c"]],
    fur: [[0, "#ffb867"], [0.6, "#e07a22"], [1, "#b45a12"]],
    hood: [[0, "#f4c9bb"], [0.55, "#d98f8c"], [1, "#a85a5a"]],
    face: [[0, "#ffffff"], [0.6, "#f6e8d0"], [1, "#dcc3a0"]],
    body: [[0, "#fff2d9"], [0.55, "#f1d5a6"], [1, "#c9a06c"]],
    ridge: "#b87326",
    brow: "#7a3a10",
    iris: "#f4f0e6",
    pupil: "#2a1408",
    bishopEye: "#3a1a08",
    mask: "#7a3c14",
    mustache: [[0, "#ffffff"], [1, "#f3ece4"]],
    patch: "#1b1514",
  },
  red: {
    dome: [[0, "#c8694a"], [0.45, "#8d3025"], [1, "#431310"]],
    crown: [[0, "#c44c48"], [0.5, "#8d202c"], [1, "#470a14"]],
    fur: [[0, "#8a6a60"], [0.6, "#5a3f3a"], [1, "#3a2623"]],
    hood: [[0, "#9a4a46"], [0.55, "#6a2a2c"], [1, "#3a1416"]],
    face: [[0, "#d9c8c0"], [0.6, "#a98f86"], [1, "#6e5650"]],
    body: [[0, "#a46a56"], [0.55, "#7a3f32"], [1, "#4a211b"]],
    ridge: "#2c050c",
    brow: "#1d0508",
    iris: "#b8f060",
    pupil: "#0c1a04",
    bishopEye: "#ffc247",
    mask: "#2e0f0c",
    mustache: [[0, "#f4eeea"], [1, "#cfc4be"]],
    patch: "#0d0808",
  },
};

const P = "c3d-"; // id prefix

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
      <stop key={i} offset={o} stopColor={c} />
    ))}
  </radialGradient>
);

/** All gradients + blur filters. Render ONCE inside every <svg> that uses pieces. */
export const PieceDefs: React.FC = () => (
  <defs>
    {(["orange", "red"] as Team[]).map((t) => {
      const p = PALETTE[t];
      return (
        <React.Fragment key={t}>
          <RG id={`${P}${t}-dome`} stops={p.dome} />
          <RG id={`${P}${t}-crown`} stops={p.crown} cy={0.4} fy={0.18} />
          <RG id={`${P}${t}-fur`} stops={p.fur} />
          <RG id={`${P}${t}-hood`} stops={p.hood} />
          <RG id={`${P}${t}-face`} stops={p.face} />
          <RG id={`${P}${t}-body`} stops={p.body} />
          <linearGradient id={`${P}${t}-must`} x1="0" y1="0" x2="0" y2="1">
            {p.mustache.map(([o, c], i) => (
              <stop key={i} offset={o} stopColor={c} />
            ))}
          </linearGradient>
        </React.Fragment>
      );
    })}
    <RG id={`${P}gem`} stops={[[0, "#ffd3e8"], [0.5, "#f0539a"], [1, "#9a1558"]]} />
    <RG id={`${P}paw`} stops={[[0, "#ffffff"], [0.7, "#efe6de"], [1, "#cfc2b8"]]} />
    <RG id={`${P}scarf`} stops={[[0, "#ff9cc4"], [0.6, "#e0518c"], [1, "#a8205c"]]} />
    <RG id={`${P}ear`} stops={[[0, "#ffc2da"], [0.6, "#ee6ea2"], [1, "#b8306c"]]} />
    <RG id={`${P}gold`} stops={[[0, "#ffe6a8"], [0.6, "#e9a947"], [1, "#9a5d1c"]]} />
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

const OUTLINE = "rgba(0,0,0,0.28)";

const Gem: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="4" rx="10" ry="5.2" fill={`url(#${P}gold)`} stroke={OUTLINE} strokeWidth="0.8" />
    <circle r="7.6" fill={`url(#${P}gem)`} stroke="#7a1048" strokeWidth="0.8" />
    <ellipse cx="-2.6" cy="-3" rx="2.8" ry="1.9" fill="#fff" opacity="0.85" />
  </g>
);

const Paw: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 8.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${r / 8.5})`}>
    <circle r="8.5" fill={`url(#${P}paw)`} stroke={OUTLINE} strokeWidth="0.9" />
    <ellipse cx="0" cy="2.6" rx="3.2" ry="2.6" fill="#f06aa0" />
    <circle cx="-3.9" cy="-1.5" r="1.6" fill="#f06aa0" />
    <circle cx="0" cy="-3.2" r="1.6" fill="#f06aa0" />
    <circle cx="3.9" cy="-1.5" r="1.6" fill="#f06aa0" />
  </g>
);

/* --------------------------------- shadows -------------------------------- */
// cast shadow (offset to the right, light is upper-left) – drawn on the board
const SHADOW: Record<PieceType, { dx: number; dy: number; rx: number; ry: number; o: number }> = {
  pawn: { dx: 30, dy: -10, rx: 24, ry: 32, o: 0.7 },
  knight: { dx: 32, dy: -14, rx: 26, ry: 36, o: 0.72 },
  bishop: { dx: 36, dy: -16, rx: 28, ry: 40, o: 0.74 },
  king: { dx: 44, dy: -24, rx: 34, ry: 48, o: 0.78 },
  queen: { dx: 42, dy: -22, rx: 32, ry: 46, o: 0.77 },
  rook: { dx: 32, dy: -12, rx: 28, ry: 34, o: 0.72 },
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
      <ellipse cx={s.dx * 0.35} cy={8} rx={s.rx * 1.05} ry={s.ry * 0.5} fill="#000" opacity="0.55" filter={`url(#${P}blurM)`} />
    </g>
  );
};

/* ---------------------------------- PAWN ---------------------------------- */
const Pawn: React.FC<{ team: Team }> = ({ team }) => (
  <g>
    {/* little body under the head */}
    <ellipse cx="0" cy="6" rx="21" ry="14" fill={`url(#${P}${team}-body)`} stroke={OUTLINE} strokeWidth="1" />
    {/* pink scarf */}
    <path
      d="M-23 8 Q0 26 23 8 Q25 20 0 25 Q-25 20 -23 8Z"
      fill={`url(#${P}scarf)`}
      stroke="#8a1c52"
      strokeWidth="0.9"
    />
    {/* paws */}
    <Paw x={-25} y={-8} />
    <Paw x={25} y={-8} />
    {/* dome head (back of the head, seen from above) */}
    <ellipse cx="0" cy="-22" rx="26" ry="29" fill={`url(#${P}${team}-dome)`} stroke={OUTLINE} strokeWidth="1.2" />
    {/* specular highlights */}
    <ellipse cx="-9" cy="-38" rx="8.5" ry="5" fill="#fff" opacity="0.5" transform="rotate(-28 -9 -38)" />
    <ellipse cx="-15" cy="-26" rx="2.4" ry="5" fill="#fff" opacity="0.22" transform="rotate(12 -15 -26)" />
    {/* rim shading bottom-right */}
    <path d="M14 -2 Q30 -20 20 -40" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />
  </g>
);

/* ---------------------------------- KING ---------------------------------- */
const King: React.FC<{ team: Team }> = ({ team }) => {
  const p = PALETTE[team];
  return (
    <g transform="translate(0 -22) scale(1.1)">
      {/* ears */}
      <ellipse cx="-43" cy="9" rx="9" ry="12.5" transform="rotate(-18 -43 9)" fill={`url(#${P}ear)`} stroke={OUTLINE} strokeWidth="1" />
      <ellipse cx="43" cy="9" rx="9" ry="12.5" transform="rotate(18 43 9)" fill={`url(#${P}ear)`} stroke={OUTLINE} strokeWidth="1" />
      {/* face fur */}
      <ellipse cx="0" cy="26" rx="38" ry="26" fill={`url(#${P}${team}-fur)`} stroke={OUTLINE} strokeWidth="1.2" />
      {/* crown dome */}
      <path
        d="M-45 9 C-48 -28 -24 -50 0 -50 C24 -50 48 -28 45 9 C22 18 -22 18 -45 9Z"
        fill={`url(#${P}${team}-crown)`}
        stroke={OUTLINE}
        strokeWidth="1.4"
      />
      {/* crown ridges */}
      <g fill="none" stroke={p.ridge} strokeOpacity="0.65" strokeWidth="2.6" strokeLinecap="round">
        <path d="M0 -44 L0 15" />
        <path d="M-5 -43 C-18 -26 -24 -8 -26 12" />
        <path d="M5 -43 C18 -26 24 -8 26 12" />
        <path d="M-8 -45 C-30 -34 -40 -16 -42 8" />
        <path d="M8 -45 C30 -34 40 -16 42 8" />
      </g>
      <g fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.6" strokeLinecap="round">
        <path d="M-3 -42 C-14 -26 -19 -8 -21 12" />
        <path d="M-6 -44 C-26 -34 -36 -16 -38 8" />
      </g>
      {/* brow band */}
      <path
        d="M-45 9 C-22 18 22 18 45 9 L44 15 C22 26 -22 26 -44 15Z"
        fill={p.ridge}
        fillOpacity="0.55"
      />
      <path d="M-45 9 C-22 18 22 18 45 9" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" />
      {/* crown gloss */}
      <ellipse cx="-20" cy="-30" rx="8" ry="15" fill="#fff" opacity="0.36" transform="rotate(28 -20 -30)" />
      {/* gem */}
      <Gem x={0} y={-47} s={1.05} />

      {/* ----- angry face ----- */}
      {/* eyes */}
      <g transform="translate(-16 27) rotate(15)">
        <ellipse rx="8.5" ry="4.8" fill={p.iris} stroke="#000" strokeOpacity="0.5" strokeWidth="1" />
        <ellipse rx="2.5" ry="4" fill={p.pupil} />
        <circle cx="-1.2" cy="-1.4" r="0.9" fill="#fff" />
      </g>
      <g transform="translate(16 27) rotate(-15)">
        <ellipse rx="8.5" ry="4.8" fill={p.iris} stroke="#000" strokeOpacity="0.5" strokeWidth="1" />
        <ellipse rx="2.5" ry="4" fill={p.pupil} />
        <circle cx="-1.2" cy="-1.4" r="0.9" fill="#fff" />
      </g>
      {/* brows */}
      <path d="M-28 19 L-8 25" stroke={p.brow} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M28 19 L8 25" stroke={p.brow} strokeWidth="3.4" strokeLinecap="round" />
      {/* nose */}
      <path d="M-4.5 33 Q0 31.5 4.5 33 L0 38.5Z" fill="#f06a9c" stroke="#8a1c52" strokeWidth="0.7" />
      {/* mustache */}
      <ellipse cx="-12" cy="42" rx="13.5" ry="8" transform="rotate(14 -12 42)" fill={`url(#${P}${team}-must)`} stroke="rgba(0,0,0,0.22)" strokeWidth="0.9" />
      <ellipse cx="12" cy="42" rx="13.5" ry="8" transform="rotate(-14 12 42)" fill={`url(#${P}${team}-must)`} stroke="rgba(0,0,0,0.22)" strokeWidth="0.9" />
      <ellipse cx="0" cy="51" rx="9" ry="5.5" fill={`url(#${P}${team}-must)`} stroke="rgba(0,0,0,0.22)" strokeWidth="0.9" />
      <path d="M0 38.5 L0 43" stroke="#000" strokeOpacity="0.35" strokeWidth="1" />
    </g>
  );
};

/* --------------------------------- BISHOP --------------------------------- */
const Bishop: React.FC<{ team: Team }> = ({ team }) => {
  const p = PALETTE[team];
  return (
    <g transform="translate(0 -6)">
      {/* body bottom collar */}
      <ellipse cx="0" cy="24" rx="24" ry="8" fill={`url(#${P}${team}-body)`} stroke={OUTLINE} strokeWidth="1" />
      {/* dome */}
      <ellipse cx="0" cy="-8" rx="29" ry="37" fill={`url(#${P}${team}-dome)`} stroke={OUTLINE} strokeWidth="1.3" />
      {/* face mask */}
      <path
        d="M-22 6 C-20 -2 20 -2 22 6 C26 22 12 30 0 30 C-12 30 -26 22 -22 6Z"
        fill={p.mask}
        opacity="0.92"
      />
      {/* ears bumps */}
      <ellipse cx="-24" cy="-18" rx="5" ry="7" transform="rotate(-20 -24 -18)" fill={`url(#${P}ear)`} stroke={OUTLINE} strokeWidth="0.8" />
      <ellipse cx="24" cy="-18" rx="5" ry="7" transform="rotate(20 24 -18)" fill={`url(#${P}ear)`} stroke={OUTLINE} strokeWidth="0.8" />
      {/* eyes */}
      <g transform="translate(-9.5 12) rotate(16)">
        <ellipse rx="5.6" ry="3.2" fill={p.bishopEye} />
        <ellipse rx="1.3" ry="2.6" fill="#120805" />
      </g>
      <g transform="translate(9.5 12) rotate(-16)">
        <ellipse rx="5.6" ry="3.2" fill={p.bishopEye} />
        <ellipse rx="1.3" ry="2.6" fill="#120805" />
      </g>
      <path d="M-17 5.5 L-5 9.5" stroke="#120805" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M17 5.5 L5 9.5" stroke="#120805" strokeWidth="2.6" strokeLinecap="round" />
      {/* nose + mouth */}
      <path d="M-3 18 Q0 17 3 18 L0 21.5Z" fill="#f06a9c" />
      <path d="M-5 24 Q0 27 5 24" fill="none" stroke="#f0a050" strokeWidth="1.4" strokeLinecap="round" />
      {/* gloss */}
      <ellipse cx="-12" cy="-30" rx="8" ry="12" fill="#fff" opacity="0.38" transform="rotate(24 -12 -30)" />
      <path d="M18 -26 Q31 -6 22 10" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="5" strokeLinecap="round" />
      {/* gem */}
      <Gem x={0} y={-46} s={1.05} />
    </g>
  );
};

/* --------------------------------- KNIGHT --------------------------------- */
const Knight: React.FC<{ team: Team }> = ({ team }) => {
  const p = PALETTE[team];
  return (
    <g transform="translate(0 -4)">
      {/* body */}
      <ellipse cx="0" cy="17" rx="24" ry="16" fill={`url(#${P}${team}-body)`} stroke={OUTLINE} strokeWidth="1" />
      {/* scarf */}
      <path d="M-18 14 Q0 28 18 14 Q18 24 0 27 Q-18 24 -18 14Z" fill={`url(#${P}scarf)`} stroke="#8a1c52" strokeWidth="0.8" />
      <Paw x={-14} y={22} r={6.2} />
      <Paw x={14} y={22} r={6.2} />
      {/* hood ears */}
      <path d="M-31 -22 L-26 -53 L-6 -40 Z" fill={`url(#${P}${team}-hood)`} stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round" />
      <path d="M31 -22 L26 -53 L6 -40 Z" fill={`url(#${P}${team}-hood)`} stroke={OUTLINE} strokeWidth="1" strokeLinejoin="round" />
      <path d="M-26 -28 L-23 -46 L-12 -38 Z" fill={`url(#${P}ear)`} />
      <path d="M26 -28 L23 -46 L12 -38 Z" fill={`url(#${P}ear)`} />
      {/* hood */}
      <ellipse cx="0" cy="-12" rx="32" ry="36" fill={`url(#${P}${team}-hood)`} stroke={OUTLINE} strokeWidth="1.3" />
      {/* inner face */}
      <ellipse cx="0" cy="-9" rx="24" ry="28" fill={`url(#${P}${team}-face)`} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
      {/* forehead mark */}
      <path d="M-3.5 -34 L3.5 -34 L0 -27Z" fill="#f06a9c" opacity="0.9" />
      {/* eye patches */}
      <ellipse cx="-10.5" cy="-8" rx="6.6" ry="9" transform="rotate(20 -10.5 -8)" fill={p.patch} />
      <ellipse cx="10.5" cy="-8" rx="6.6" ry="9" transform="rotate(-20 10.5 -8)" fill={p.patch} />
      {/* eyes */}
      <ellipse cx="-10" cy="-8" rx="2.8" ry="3.5" fill="#fff" />
      <circle cx="-9.6" cy="-7.4" r="1.5" fill="#111" />
      <ellipse cx="10" cy="-8" rx="2.8" ry="3.5" fill="#fff" />
      <circle cx="9.6" cy="-7.4" r="1.5" fill="#111" />
      {/* nose + mouth */}
      <path d="M-3.2 2.5 Q0 1.2 3.2 2.5 L0 6Z" fill="#f06a9c" stroke="#8a1c52" strokeWidth="0.6" />
      <path d="M-5 8.5 Q-2.5 11 0 8 Q2.5 11 5 8.5" fill="none" stroke="#6a3a30" strokeWidth="1.1" strokeLinecap="round" />
      {/* gloss */}
      <ellipse cx="-17" cy="-32" rx="6" ry="10" fill="#fff" opacity="0.3" transform="rotate(30 -17 -32)" />
      <path d="M22 -34 Q36 -12 24 12" fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
};


/* ---------------------------------- ROOK ---------------------------------- */
const Rook: React.FC<{ team: Team }> = ({ team }) => {
  const p = PALETTE[team];
  return (
    <g transform="translate(0 -2)">
      {/* base collar */}
      <ellipse cx="0" cy="20" rx="29" ry="10" fill={`url(#${P}${team}-body)`} stroke={OUTLINE} strokeWidth="1" />
      {/* tower body */}
      <path d="M-27 -24 L-27 14 Q0 30 27 14 L27 -24 Z" fill={`url(#${P}${team}-dome)`} stroke={OUTLINE} strokeWidth="1.3" />
      {/* brick lines */}
      <g fill="none" stroke={p.ridge} strokeOpacity="0.3" strokeWidth="1.4">
        <path d="M-27 -10 Q0 4 27 -10" />
        <path d="M-27 4 Q0 18 27 4" />
        <path d="M-9 -16 L-9 -4 M12 -14 L12 -2 M-17 -2 L-17 10 M3 0 L3 12 M20 2 L20 12" />
      </g>
      {/* crenellated top: back merlons, hollow, rim, front merlons */}
      <ellipse cx="0" cy="-26" rx="29" ry="11" fill={`url(#${P}${team}-crown)`} stroke={OUTLINE} strokeWidth="1.2" />
      <ellipse cx="0" cy="-28" rx="22" ry="7.5" fill={p.ridge} opacity="0.7" />
      {[-21, -7, 7, 21].map((mx) => (
        <g key={mx}>
          <rect x={mx - 6} y={-47} width="12" height="19" rx="2.5" fill={`url(#${P}${team}-crown)`} stroke={OUTLINE} strokeWidth="1" />
          <rect x={mx - 6} y={-47} width="12" height="4" rx="2" fill="#fff" opacity="0.28" />
        </g>
      ))}
      {/* cat face on the tower */}
      <ellipse cx="0" cy="-2" rx="21" ry="16" fill={`url(#${P}${team}-fur)`} stroke={OUTLINE} strokeWidth="1" />
      <g transform="translate(-10 -6) rotate(14)">
        <ellipse rx="6.4" ry="3.8" fill={p.iris} stroke="#000" strokeOpacity="0.5" strokeWidth="0.9" />
        <ellipse rx="1.9" ry="3.2" fill={p.pupil} />
      </g>
      <g transform="translate(10 -6) rotate(-14)">
        <ellipse rx="6.4" ry="3.8" fill={p.iris} stroke="#000" strokeOpacity="0.5" strokeWidth="0.9" />
        <ellipse rx="1.9" ry="3.2" fill={p.pupil} />
      </g>
      <path d="M-19 -13 L-5 -9" stroke={p.brow} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M19 -13 L5 -9" stroke={p.brow} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M-3.5 0 Q0 -1.2 3.5 0 L0 4Z" fill="#f06a9c" stroke="#8a1c52" strokeWidth="0.6" />
      <ellipse cx="-7" cy="8" rx="8" ry="4.6" transform="rotate(12 -7 8)" fill={`url(#${P}${team}-must)`} stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />
      <ellipse cx="7" cy="8" rx="8" ry="4.6" transform="rotate(-12 7 8)" fill={`url(#${P}${team}-must)`} stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />
      {/* paws at the foot */}
      <Paw x={-21} y={21} r={6.2} />
      <Paw x={21} y={21} r={6.2} />
      {/* gloss + rim shade */}
      <ellipse cx="-19" cy="-12" rx="3" ry="14" fill="#fff" opacity="0.28" />
      <path d="M22 -20 Q27 0 20 14" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
};

/* ---------------------------------- QUEEN --------------------------------- */
const Queen: React.FC<{ team: Team }> = ({ team }) => {
  const p = PALETTE[team];
  return (
    <g transform="translate(0 -20) scale(1.06)">
      {/* ears */}
      <ellipse cx="-41" cy="10" rx="8.5" ry="12" transform="rotate(-18 -41 10)" fill={`url(#${P}ear)`} stroke={OUTLINE} strokeWidth="1" />
      <ellipse cx="41" cy="10" rx="8.5" ry="12" transform="rotate(18 41 10)" fill={`url(#${P}ear)`} stroke={OUTLINE} strokeWidth="1" />
      {/* face fur */}
      <ellipse cx="0" cy="26" rx="36" ry="25" fill={`url(#${P}${team}-fur)`} stroke={OUTLINE} strokeWidth="1.2" />
      {/* spiked crown */}
      <path
        d="M-42 10 L-45 -27 L-31 -9 L-22 -41 L-10 -14 L0 -52 L10 -14 L22 -41 L31 -9 L45 -27 L42 10 Q0 21 -42 10Z"
        fill={`url(#${P}${team}-crown)`}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <g fill="none" stroke={p.ridge} strokeOpacity="0.6" strokeWidth="2.2" strokeLinecap="round">
        <path d="M0 -46 L0 14" />
        <path d="M-10 -14 L-8 14" />
        <path d="M10 -14 L8 14" />
        <path d="M-31 -9 L-26 12" />
        <path d="M31 -9 L26 12" />
      </g>
      <path d="M-4 -44 L-12 -16 M-24 -36 L-33 -12" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.6" strokeLinecap="round" />
      {/* brow band */}
      <path d="M-42 10 Q0 21 42 10 L41 16 Q0 28 -41 16Z" fill={p.ridge} fillOpacity="0.55" />
      <path d="M-42 10 Q0 21 42 10" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" />
      {/* jewels on the spike tips */}
      <Gem x={0} y={-52} s={1} />
      {[[-45, -29], [-22, -43], [22, -43], [45, -29]].map(([gx, gy]) => (
        <circle key={`${gx}`} cx={gx} cy={gy} r="3.8" fill={`url(#${P}gem)`} stroke="#7a1048" strokeWidth="0.7" />
      ))}
      <ellipse cx="-18" cy="-24" rx="5" ry="11" fill="#fff" opacity="0.32" transform="rotate(22 -18 -24)" />
      {/* face: softer than the king */}
      <circle cx="-25" cy="37" r="5.5" fill="#ff7fb0" opacity="0.35" />
      <circle cx="25" cy="37" r="5.5" fill="#ff7fb0" opacity="0.35" />
      <g transform="translate(-15 28) rotate(8)">
        <ellipse rx="7.4" ry="4.8" fill={p.iris} stroke="#000" strokeOpacity="0.5" strokeWidth="1" />
        <ellipse rx="2.3" ry="4" fill={p.pupil} />
        <circle cx="-1.2" cy="-1.4" r="0.9" fill="#fff" />
        <path d="M-7 -1 L-11 -5 M-6 -3 L-8 -8" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <g transform="translate(15 28) rotate(-8)">
        <ellipse rx="7.4" ry="4.8" fill={p.iris} stroke="#000" strokeOpacity="0.5" strokeWidth="1" />
        <ellipse rx="2.3" ry="4" fill={p.pupil} />
        <circle cx="-1.2" cy="-1.4" r="0.9" fill="#fff" />
        <path d="M7 -1 L11 -5 M6 -3 L8 -8" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <path d="M-25 20 Q-15 15 -7 21" fill="none" stroke={p.brow} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M25 20 Q15 15 7 21" fill="none" stroke={p.brow} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="0" cy="43" rx="13" ry="7.5" fill={`url(#${P}${team}-must)`} stroke="rgba(0,0,0,0.22)" strokeWidth="0.9" />
      <path d="M-4.5 35 Q0 33.5 4.5 35 L0 40Z" fill="#f06a9c" stroke="#8a1c52" strokeWidth="0.7" />
      <path d="M-5 45 Q0 49 5 45" fill="none" stroke="#6a3a30" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
};

/* ------------------------------- public API -------------------------------- */
export interface Piece3DProps {
  type: PieceType;
  team: Team;
  /** centre of the cell, in the parent <svg> coordinate space */
  x?: number;
  y?: number;
  /** optional scale, 1 = cell size 100 */
  scale?: number;
}

/** The piece itself (no shadow). */
export const Piece3D: React.FC<Piece3DProps> = ({ type, team, x = 0, y = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {type === "pawn" && <Pawn team={team} />}
    {type === "king" && <King team={team} />}
    {type === "queen" && <Queen team={team} />}
    {type === "rook" && <Rook team={team} />}
    {type === "bishop" && <Bishop team={team} />}
    {type === "knight" && <Knight team={team} />}
  </g>
);

/** One piece in its own <svg>, with defs + shadow. */
export const Piece3DStandalone: React.FC<{
  type: PieceType;
  team: Team;
  size?: number;
  background?: string;
}> = ({ type, team, size = 160, background = "#1b1c21" }) => (
  <svg width={size} height={size} viewBox="-70 -100 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="-70" y="-100" width="200" height="200" fill={background} />
    <PieceDefs />
    <PieceShadow type={type} />
    <Piece3D type={type} team={team} />
  </svg>
);

export default Piece3D;
