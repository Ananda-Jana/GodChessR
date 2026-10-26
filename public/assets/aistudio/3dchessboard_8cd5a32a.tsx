/**
 * 3dchessboard.tsx
 * ---------------------------------------------------------------------------
 * 8 x 8 3D board in the FIDE starting position.
 *  - orange cats = White (bottom, ranks 1-2)
 *  - red cats    = Black (top, ranks 7-8)
 *  - a1 (bottom-left) is a dark square, h1 (bottom-right) is a light square.
 *
 * Coordinates: 1 cell = 100 units, (0,0) = top-left corner of the a8 square.
 * Column c = 0..7 -> files a..h ; row r = 0..7 -> ranks 8..1.
 */
import React from "react";
import {
  PieceDefs,
  PieceShadow,
  Piece3D,
  type PieceType,
  type Team,
} from "./3dchesspieces";

/* ------------------------------ board colours ------------------------------ */
const BG = "#1b1c21";
const TRAY_TOP = "#2c2e35";
const TRAY_EDGE = "#121317"; // thick side of the board
const LIGHT = "#2f3138";
const DARK = "#1e1f24";

const N = 8; // squares per side
const SIZE = N * 100;

// rounded tray outline (inset by 8; a 16-wide round-joined stroke gives the rim)
const TRAY_OUTLINE = `M0 0 L${SIZE} 0 L${SIZE} ${SIZE} L0 ${SIZE} Z`;

/* ------------------------------- hard-coded cells -------------------------- */
// (c + r) even = light square, odd = dark square  (a8 light, a1 dark, h1 light)
const CELLS: { c: number; r: number; light: boolean }[] = [];
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) CELLS.push({ c, r, light: (c + r) % 2 === 0 });

/* ------------------------------- hard-coded pieces ------------------------- */
export interface PlacedPiece {
  type: PieceType;
  team: Team;
  c: number; // 0..7  (a..h)
  r: number; // 0..7  (rank 8..1)
}

export const FIDE_START: PlacedPiece[] = [
  // ---- Black / red : rank 8 (row 0) ----
  { type: "rook",   team: "red", c: 0, r: 0 },
  { type: "knight", team: "red", c: 1, r: 0 },
  { type: "bishop", team: "red", c: 2, r: 0 },
  { type: "queen",  team: "red", c: 3, r: 0 },
  { type: "king",   team: "red", c: 4, r: 0 },
  { type: "bishop", team: "red", c: 5, r: 0 },
  { type: "knight", team: "red", c: 6, r: 0 },
  { type: "rook",   team: "red", c: 7, r: 0 },
  // ---- Black / red : rank 7 (row 1) ----
  { type: "pawn", team: "red", c: 0, r: 1 },
  { type: "pawn", team: "red", c: 1, r: 1 },
  { type: "pawn", team: "red", c: 2, r: 1 },
  { type: "pawn", team: "red", c: 3, r: 1 },
  { type: "pawn", team: "red", c: 4, r: 1 },
  { type: "pawn", team: "red", c: 5, r: 1 },
  { type: "pawn", team: "red", c: 6, r: 1 },
  { type: "pawn", team: "red", c: 7, r: 1 },
  // ---- White / orange : rank 2 (row 6) ----
  { type: "pawn", team: "orange", c: 0, r: 6 },
  { type: "pawn", team: "orange", c: 1, r: 6 },
  { type: "pawn", team: "orange", c: 2, r: 6 },
  { type: "pawn", team: "orange", c: 3, r: 6 },
  { type: "pawn", team: "orange", c: 4, r: 6 },
  { type: "pawn", team: "orange", c: 5, r: 6 },
  { type: "pawn", team: "orange", c: 6, r: 6 },
  { type: "pawn", team: "orange", c: 7, r: 6 },
  // ---- White / orange : rank 1 (row 7) ----
  { type: "rook",   team: "orange", c: 0, r: 7 },
  { type: "knight", team: "orange", c: 1, r: 7 },
  { type: "bishop", team: "orange", c: 2, r: 7 },
  { type: "queen",  team: "orange", c: 3, r: 7 },
  { type: "king",   team: "orange", c: 4, r: 7 },
  { type: "bishop", team: "orange", c: 5, r: 7 },
  { type: "knight", team: "orange", c: 6, r: 7 },
  { type: "rook",   team: "orange", c: 7, r: 7 },
];

const cx = (c: number) => 50 + 100 * c;
const cy = (r: number) => 50 + 100 * r;

/* -------------------------------- component -------------------------------- */
export interface ChessBoard3DProps {
  pieces?: PlacedPiece[];
  /** paint the dark page background behind the board */
  background?: boolean;
  width?: number;
}

export const ChessBoard3D: React.FC<ChessBoard3DProps> = ({
  pieces = FIDE_START,
  background = true,
  width = 900,
}) => {
  // room above for tall crowns, to the right for cast shadows, below for the drop shadow
  const VB = { x: -50, y: -110, w: SIZE + 100, h: SIZE + 210 };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={(width * VB.h) / VB.w}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      role="img"
      aria-label="3D cat chess board, FIDE starting position"
    >
      <PieceDefs />
      <defs>
        <filter id="c3d-boardShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <linearGradient id="c3d-cellL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#363841" />
          <stop offset="1" stopColor={LIGHT} />
        </linearGradient>
        <linearGradient id="c3d-cellD" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#25262c" />
          <stop offset="1" stopColor={DARK} />
        </linearGradient>
      </defs>

      {background && <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill={BG} />}

      {/* drop shadow of the whole board on the page */}
      <g transform="translate(10 18)" opacity="0.75" filter="url(#c3d-boardShadow)">
        <path d={TRAY_OUTLINE} fill="#000" stroke="#000" strokeWidth="16" strokeLinejoin="round" />
      </g>

      {/* thick front edge (3D thickness) */}
      <path
        d={TRAY_OUTLINE}
        transform="translate(0 8)"
        fill={TRAY_EDGE}
        stroke={TRAY_EDGE}
        strokeWidth="16"
        strokeLinejoin="round"
      />

      {/* tray top face + rim highlight */}
      <path d={TRAY_OUTLINE} fill={TRAY_TOP} stroke={TRAY_TOP} strokeWidth="16" strokeLinejoin="round" />
      <path
        d={TRAY_OUTLINE}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.07"
        strokeWidth="17"
        strokeLinejoin="round"
      />

      {/* squares */}
      {CELLS.map(({ c, r, light }) => (
        <rect
          key={`${c}-${r}`}
          x={c * 100}
          y={r * 100}
          width="100"
          height="100"
          fill={light ? "url(#c3d-cellL)" : "url(#c3d-cellD)"}
        />
      ))}
      {CELLS.filter((q) => q.light).map(({ c, r }) => (
        <path
          key={`h-${c}-${r}`}
          d={`M${c * 100 + 1} ${r * 100 + 99} L${c * 100 + 1} ${r * 100 + 1} L${c * 100 + 99} ${r * 100 + 1}`}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.05"
          strokeWidth="1.5"
        />
      ))}

      {/* all cast shadows first, so no shadow ever darkens a neighbouring piece */}
      {pieces.map((p, i) => (
        <PieceShadow key={`s${i}`} type={p.type} x={cx(p.c)} y={cy(p.r)} />
      ))}

      {/* pieces, painted back-to-front (top rows first) */}
      {[...pieces]
        .sort((a, b) => a.r - b.r || a.c - b.c)
        .map((p, i) => (
          <Piece3D key={`p${i}`} type={p.type} team={p.team} x={cx(p.c)} y={cy(p.r)} />
        ))}
    </svg>
  );
};

export default ChessBoard3D;
