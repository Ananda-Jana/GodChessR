/**
 * 3dchessboard.tsx
 * ---------------------------------------------------------------------------
 * Interactive 8 x 8 3D board in standard FIDE layout.
 *  - orange cats = White (bottom, ranks 1-2)
 *  - red cats    = Black (top, ranks 7-8)
 *  - a1 (bottom-left) is a dark square, h1 (bottom-right) is a light square.
 *
 * Coordinates: 1 cell = 100 units, (0,0) = top-left corner of the a8 square.
 * Column c = 0..7 -> files a..h ; row r = 0..7 -> ranks 8..1.
 */
import React from 'react';
import {
  PieceDefs,
  PieceShadow,
  Piece3D,
} from './3dchesspieces';
import type { PlacedPiece, Position3D } from './types';

/* ------------------------------ board colours ------------------------------ */
const BG = '#1b1c21';
const TRAY_TOP = '#2c2e35';
const TRAY_EDGE = '#121317'; // thick side of the board
const LIGHT = '#2f3138';
const DARK = '#1e1f24';

const N = 8; // 8x8 squares
const SIZE = N * 100;

// rounded tray outline
const TRAY_OUTLINE = `M0 0 L${SIZE} 0 L${SIZE} ${SIZE} L0 ${SIZE} Z`;

/* ------------------------------- hard-coded cells -------------------------- */
// (c + r) even = light square, odd = dark square  (a8 light, a1 dark, h1 light)
const CELLS: { c: number; r: number; light: boolean }[] = [];
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    CELLS.push({ c, r, light: (c + r) % 2 === 0 });
  }
}

const cx = (c: number) => 50 + 100 * c;
const cy = (r: number) => 50 + 100 * r;

export interface ChessBoard3DProps {
  pieces?: PlacedPiece[];
  background?: boolean;
  width?: number | string;
  className?: string;
  selectedPos?: Position3D | null;
  validMoves?: Position3D[];
  lastMove?: { from: Position3D; to: Position3D } | null;
  inCheckPos?: Position3D | null;
  onSquareClick?: (c: number, r: number) => void;
  flipped?: boolean;
}

export const ChessBoard3D: React.FC<ChessBoard3DProps> = ({
  pieces = [],
  background = true,
  width = '100%',
  className = '',
  selectedPos = null,
  validMoves = [],
  lastMove = null,
  inCheckPos = null,
  onSquareClick,
  flipped = false,
}) => {
  // Map coordinates according to flip setting
  const getRenderC = (c: number) => (flipped ? 7 - c : c);
  const getRenderR = (r: number) => (flipped ? 7 - r : r);
  const getLogicalC = (rc: number) => (flipped ? 7 - rc : rc);
  const getLogicalR = (rr: number) => (flipped ? 7 - rr : rr);

  // Viewbox has room above for tall crowns, to the right for cast shadows, below for drop shadow
  const VB = { x: -50, y: -110, w: SIZE + 100, h: SIZE + 210 };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height="100%"
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      role="img"
      aria-label="3D cat chess board, FIDE 8x8 grid"
      className={`select-none touch-none filter drop-shadow-2xl mx-auto block ${
        className || 'w-full h-full max-h-[82vh]'
      }`}
    >
      <PieceDefs />
      <defs>
        <filter id="c3d-boardShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <linearGradient id="c3d-cellL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#363841" stopOpacity="1" />
          <stop offset="1" stopColor={LIGHT} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="c3d-cellD" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#25262c" stopOpacity="1" />
          <stop offset="1" stopColor={DARK} stopOpacity="1" />
        </linearGradient>
      </defs>

      {background && <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill={BG} rx={16} />}

      {/* Drop shadow of the whole board on the page */}
      <g transform="translate(10 18)" opacity="0.75" filter="url(#c3d-boardShadow)">
        <path d={TRAY_OUTLINE} fill="#000" stroke="#000" strokeWidth="16" strokeLinejoin="round" />
      </g>

      {/* Thick front edge (3D thickness) */}
      <path
        d={TRAY_OUTLINE}
        transform="translate(0 8)"
        fill={TRAY_EDGE}
        stroke={TRAY_EDGE}
        strokeWidth="16"
        strokeLinejoin="round"
      />

      {/* Tray top face + rim highlight */}
      <path d={TRAY_OUTLINE} fill={TRAY_TOP} stroke={TRAY_TOP} strokeWidth="16" strokeLinejoin="round" />
      <path
        d={TRAY_OUTLINE}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.08"
        strokeWidth="17"
        strokeLinejoin="round"
      />

      {/* 8x8 Board Squares (Render solid fallback rect first, then gradient overlay) */}
      {CELLS.map(({ c: rc, r: rr, light }) => (
        <g key={`sq-${rc}-${rr}`}>
          <rect
            x={rc * 100}
            y={rr * 100}
            width="100"
            height="100"
            fill={light ? LIGHT : DARK}
          />
          <rect
            x={rc * 100}
            y={rr * 100}
            width="100"
            height="100"
            fill={light ? 'url(#c3d-cellL)' : 'url(#c3d-cellD)'}
          />
        </g>
      ))}

      {/* Light square subtle inner highlights */}
      {CELLS.filter((q) => q.light).map(({ c: rc, r: rr }) => (
        <path
          key={`h-${rc}-${rr}`}
          d={`M${rc * 100 + 1} ${rr * 100 + 99} L${rc * 100 + 1} ${rr * 100 + 1} L${rc * 100 + 99} ${rr * 100 + 1}`}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.05"
          strokeWidth="1.5"
        />
      ))}

      {/* Last Move Indicator Squares */}
      {lastMove && (
        <>
          <rect
            x={getRenderC(lastMove.from.c) * 100}
            y={getRenderR(lastMove.from.r) * 100}
            width="100"
            height="100"
            fill="#38bdf8"
            fillOpacity="0.16"
          />
          <rect
            x={getRenderC(lastMove.to.c) * 100}
            y={getRenderR(lastMove.to.r) * 100}
            width="100"
            height="100"
            fill="#38bdf8"
            fillOpacity="0.22"
          />
        </>
      )}

      {/* In-Check King Square Alert */}
      {inCheckPos && (
        <rect
          x={getRenderC(inCheckPos.c) * 100}
          y={getRenderR(inCheckPos.r) * 100}
          width="100"
          height="100"
          fill="#ef4444"
          fillOpacity="0.38"
          stroke="#ef4444"
          strokeWidth="2"
        />
      )}

      {/* Selected Piece Square Highlight */}
      {selectedPos && (
        <rect
          x={getRenderC(selectedPos.c) * 100}
          y={getRenderR(selectedPos.r) * 100}
          width="100"
          height="100"
          fill="#f59e0b"
          fillOpacity="0.28"
          stroke="#f59e0b"
          strokeWidth="3.5"
          rx="4"
        />
      )}

      {/* Rank & File Corner Notation (Small subtle labels on edge) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const fileLabel = String.fromCharCode(97 + (flipped ? 7 - i : i));
        const rankLabel = (flipped ? i + 1 : 8 - i).toString();
        return (
          <React.Fragment key={`not-${i}`}>
            <text
              x={i * 100 + 6}
              y={SIZE - 6}
              fill="#ffffff"
              fillOpacity="0.3"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
              pointerEvents="none"
            >
              {fileLabel}
            </text>
            <text
              x={SIZE - 15}
              y={i * 100 + 18}
              fill="#ffffff"
              fillOpacity="0.3"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
              pointerEvents="none"
            >
              {rankLabel}
            </text>
          </React.Fragment>
        );
      })}

      {/* All cast shadows first (light from upper-left, offset to right) */}
      {pieces.map((p) => (
        <PieceShadow
          key={`shadow-${p.id}`}
          type={p.type}
          x={cx(getRenderC(p.c))}
          y={cy(getRenderR(p.r))}
        />
      ))}

      {/* Pieces painted back-to-front (top rows first, by render row) */}
      {[...pieces]
        .sort((a, b) => getRenderR(a.r) - getRenderR(b.r) || getRenderC(a.c) - getRenderC(b.c))
        .map((p) => {
          const rc = getRenderC(p.c);
          const rr = getRenderR(p.r);
          const isSelected = selectedPos?.c === p.c && selectedPos?.r === p.r;
          return (
            <g
              key={`piece-${p.id}`}
              transform={isSelected ? `translate(0, -10)` : undefined}
              className="transition-transform duration-150"
            >
              <Piece3D type={p.type} team={p.team} x={cx(rc)} y={cy(rr)} />
            </g>
          );
        })}

      {/* Valid Move Target Indicators (rendered on top of pieces for crisp clarity) */}
      {validMoves.map((vm) => {
        const rc = getRenderC(vm.c);
        const rr = getRenderR(vm.r);
        const isCapture = pieces.some((p) => p.c === vm.c && p.r === vm.r);

        if (isCapture) {
          return (
            <g key={`move-target-${vm.c}-${vm.r}`} pointerEvents="none">
              <circle
                cx={cx(rc)}
                cy={cy(rr)}
                r="38"
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                strokeDasharray="9 4"
                strokeOpacity="0.95"
              />
              <circle cx={cx(rc)} cy={cy(rr)} r="8" fill="#ef4444" fillOpacity="0.8" />
            </g>
          );
        }

        return (
          <circle
            key={`move-target-${vm.c}-${vm.r}`}
            cx={cx(rc)}
            cy={cy(rr)}
            r="12"
            fill="#38bdf8"
            fillOpacity="0.85"
            pointerEvents="none"
          />
        );
      })}

      {/* Clickable Overlay Squares (Intercepts touch/click reliably) */}
      {CELLS.map(({ c: rc, r: rr }) => {
        const logicalC = getLogicalC(rc);
        const logicalR = getLogicalR(rr);
        return (
          <rect
            key={`click-${rc}-${rr}`}
            x={rc * 100}
            y={rr * 100}
            width="100"
            height="100"
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onSquareClick?.(logicalC, logicalR)}
          />
        );
      })}
    </svg>
  );
};

export default ChessBoard3D;
