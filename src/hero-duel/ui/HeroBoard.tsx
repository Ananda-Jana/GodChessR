import React from 'react';
import { HeroDuelState, Coord, HeroInstance } from '../types/heroDuelTypes';
import { HeroPieceSvg } from '../art/heroPieceSvg';
import { StatusBadge } from '../art/statusIcons';
import { BOARD_COLS, BOARD_ROWS } from '../config/boardConfig';

interface HeroBoardProps {
  matchState: HeroDuelState;
  selectedCoord: Coord | null;
  legalMoves: Coord[];
  activeTargetMode: boolean;
  activeTargets: Coord[];
  onSelectSquare: (coord: Coord) => void;
  isFlipped?: boolean;
}

export const HeroBoard: React.FC<HeroBoardProps> = ({
  matchState,
  selectedCoord,
  legalMoves,
  activeTargetMode,
  activeTargets,
  onSelectSquare,
  isFlipped = false,
}) => {
  const colIndices = isFlipped ? [6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6];
  // Standard chess convention: row 0 is bottom for Team 1 (rank 1), row 7 is top (rank 8)
  const rowIndices = isFlipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <div className="w-full flex flex-col items-center justify-center p-1 sm:p-2 select-none">
      <div className="hd-board-grid">
        {rowIndices.map((y) =>
          colIndices.map((x) => {
            const isLight = (x + y) % 2 === 0;
            const coord: Coord = { x, y };

            const isSelected = selectedCoord ? selectedCoord.x === x && selectedCoord.y === y : false;
            const isLegalMove = legalMoves.some((m) => m.x === x && m.y === y);
            const isTarget = activeTargetMode && activeTargets.some((t) => t.x === x && t.y === y);

            const occupant = matchState.heroes.find(
              (h) => h.isAlive && h.pos.x === x && h.pos.y === y
            );

            // Active battlefield zones
            const zone = matchState.zones.find(
              (z) => z.duration > 0 && z.coords.some((c) => c.x === x && c.y === y)
            );

            return (
              <button
                key={`${x}-${y}`}
                type="button"
                onClick={() => onSelectSquare(coord)}
                className={`hd-square ${isLight ? 'hd-square-light' : 'hd-square-dark'} ${
                  isSelected ? 'hd-square-selected' : ''
                } cursor-pointer focus:outline-none`}
                aria-label={`Square ${colLabels[x]}${y + 1}`}
              >
                {/* Zone Atmospheric Overlay */}
                {zone && (
                  <div
                    className={`absolute inset-0 pointer-events-none opacity-40 ${
                      zone.type === 'gas'
                        ? 'bg-emerald-500'
                        : zone.type === 'shrine'
                        ? 'bg-purple-600'
                        : zone.type === 'banner'
                        ? 'bg-amber-400'
                        : 'bg-neutral-800'
                    }`}
                  />
                )}

                {/* Move Destination Dot */}
                {isLegalMove && !occupant && <div className="hd-move-dot" />}

                {/* Capture Ring on Occupied Square */}
                {isLegalMove && occupant && <div className="hd-capture-ring" />}

                {/* Active Target Ring */}
                {isTarget && <div className="hd-ability-target-ring" />}

                {/* Hero Piece on Square */}
                {occupant && (
                  <div className="relative w-[85%] h-[85%] flex items-center justify-center z-10 transition-transform active:scale-95">
                    <HeroPieceSvg
                      heroId={occupant.heroId}
                      team={occupant.team}
                      isCaptain={occupant.isCaptain}
                    />

                    {/* Status Badges */}
                    {occupant.statuses.length > 0 && (
                      <div className="absolute -top-1 -right-1 flex flex-col gap-0.5 z-20">
                        {occupant.statuses.map((s, idx) => (
                          <StatusBadge key={idx} status={s.type} duration={s.duration} />
                        ))}
                      </div>
                    )}

                    {/* Cooldown Number Indicator */}
                    {occupant.currentCooldown > 0 && (
                      <span className="absolute bottom-0 right-0 bg-neutral-900 text-amber-400 border border-amber-400 text-[8px] font-mono font-bold px-1 rounded-full z-20">
                        {occupant.currentCooldown}
                      </span>
                    )}
                  </div>
                )}

                {/* Rank & File Corner Notation */}
                {x === colIndices[0] && (
                  <span
                    className={`absolute top-0.5 left-1 text-[9px] font-mono font-bold pointer-events-none opacity-60 ${
                      isLight ? 'text-black' : 'text-white'
                    }`}
                  >
                    {y + 1}
                  </span>
                )}
                {y === rowIndices[rowIndices.length - 1] && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[9px] font-mono font-bold pointer-events-none opacity-60 ${
                      isLight ? 'text-black' : 'text-white'
                    }`}
                  >
                    {colLabels[x]}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
