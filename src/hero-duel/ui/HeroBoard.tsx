import React from 'react';
import { HeroDuelState, Coord } from '../types/heroDuelTypes';
import { HeroPiece, heroIdToPieceType } from '../art/heroAvatarHelper';
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

  const colLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  const selectedHero = selectedCoord
    ? matchState.heroes.find(
        (h) => h.isAlive && h.pos.x === selectedCoord.x && h.pos.y === selectedCoord.y
      )
    : null;

  return (
    <div className="w-full flex flex-col items-center justify-center select-none max-w-[100vw] md:max-w-[540px] my-1">
      {/* Outer Board Tray matching ChessBoard theme */}
      <div
        className="relative w-full board-edge-mobile p-0 md:p-2 sm:md:p-2.5 border-0 md:border-4 transition-colors soft-board-tray rounded-none md:rounded-2xl shadow-none md:shadow-xl bg-[#0f172a] border-slate-700/70"
        style={{ aspectRatio: `${BOARD_COLS} / ${BOARD_ROWS}` }}
      >
        {/* Board Grid */}
        <div
          className="grid w-full h-full board-grid-mobile soft-board-grid rounded-none md:rounded-xl overflow-hidden border-0 md:border md:border-slate-700/60 relative"
          style={{
            gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${BOARD_ROWS}, minmax(0, 1fr))`,
          }}
        >
          {rowIndices.map((y) =>
            colIndices.map((x) => {
              const isLight = (x + y) % 2 === 1;
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

              // Low-contrast square palette from ChessBoard
              let squareBg = isLight ? 'bg-[#2b3c5a]' : 'bg-[#101726]';

              if (isSelected) {
                squareBg = `${squareBg} ring-3 ring-inset ring-amber-400 brightness-105 z-20`;
              }

              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  onClick={() => onSelectSquare(coord)}
                  className={`relative flex items-center justify-center focus:outline-none border-0 p-0 transition-colors cursor-pointer ${squareBg}`}
                  aria-label={`Square ${colLabels[x]}${y + 1}`}
                >
                  {/* File/Rank Coordinate Labels on edges */}
                  {x === colIndices[0] && (
                    <span className="absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-black font-mono text-slate-400 pointer-events-none select-none z-10">
                      {y + 1}
                    </span>
                  )}
                  {y === rowIndices[rowIndices.length - 1] && (
                    <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-black font-mono text-slate-400 pointer-events-none select-none z-10">
                      {colLabels[x]}
                    </span>
                  )}

                  {/* Zone Atmospheric Overlay */}
                  {zone && (
                    <div
                      className={`absolute inset-0 pointer-events-none opacity-35 ${
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

                  {/* Move Destination Dot indicator from ChessBoard (40-45% of square) */}
                  {isLegalMove && !occupant && (
                    <div className="absolute w-[42%] h-[42%] bg-amber-400 border-2 border-black/40 rounded-full soft-move-dot shadow-sm pointer-events-none flex items-center justify-center z-10 animate-pulse">
                      <div className="w-full h-full border border-white/30 rounded-full" />
                    </div>
                  )}

                  {/* High-contrast Capture Ring on Occupied Square */}
                  {isLegalMove && occupant && (
                    <div className="absolute inset-1.5 sm:inset-2 rounded-full border-4 border-red-500 bg-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.4)] pointer-events-none flex items-center justify-center z-10 animate-pulse">
                      <div className="absolute inset-0 border-2 border-black/20 rounded-full" />
                    </div>
                  )}

                  {/* Active Target Ring */}
                  {isTarget && (
                    <div className="absolute inset-1.5 sm:inset-2 rounded-lg border-3 border-dashed border-sky-400 bg-sky-400/20 shadow-[0_0_8px_rgba(56,189,248,0.4)] pointer-events-none z-10 animate-pulse" />
                  )}

                  {/* Hero Piece on Square - NO background disc, pure piece graphic directly on square */}
                  {occupant && (
                    <div className="w-full h-full flex flex-col items-center justify-center relative z-20 transition-transform active:scale-95 drop-shadow-md">
                      <div className="w-[86%] h-[86%] flex items-center justify-center relative">
                        <HeroPiece
                          type={heroIdToPieceType(occupant.heroId)}
                          color={occupant.team === 1 ? 'white' : 'black'}
                          className="w-full h-full"
                        />

                        {/* Status Badges */}
                        {occupant.statuses.length > 0 && (
                          <div className="absolute -top-1 -right-1 flex flex-col gap-0.5 z-30">
                            {occupant.statuses.map((s, idx) => (
                              <StatusBadge key={idx} status={s.type} duration={s.duration} />
                            ))}
                          </div>
                        )}

                        {/* Cooldown Number Indicator */}
                        {occupant.currentCooldown > 0 && (
                          <span className="absolute bottom-0 right-0 bg-neutral-900 text-amber-400 border border-amber-400 text-[8px] font-mono font-bold px-1 rounded-full z-30 shadow">
                            {occupant.currentCooldown}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })
          )}

          {/* Piece Name Tooltip from ChessBoard theme */}
          {selectedHero && (
            <div
              className="absolute bottom-2 left-2 z-30 pointer-events-none select-none max-w-[120px] truncate px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold tracking-tight shadow-md animate-in fade-in duration-100 border border-white/10"
              title={selectedHero.name}
            >
              {selectedHero.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
