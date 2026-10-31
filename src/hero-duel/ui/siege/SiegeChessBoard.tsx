import React, { useState, useEffect } from 'react';
import { SiegeState, SiegeHeroInstance, Coord } from '../../engine/siege/siegeTypes';
import { ShrineStructure } from '../../components/ShrineStructure';
import { HeroPiece, heroIdToPieceType } from '../../art/heroAvatarHelper';
import { ChessPiece } from '../../../components/ChessPiece';
import { getValidHeroMoves } from '../../engine/siege/siegeSim';
import { Check } from 'lucide-react';

interface SiegeChessBoardProps {
  state: SiegeState;
  selectedHero: SiegeHeroInstance | null;
  queuedMoves: Record<string, Coord>;
  heldHeroIds: Set<string>;
  interactive: boolean;
  onSelectHero: (hero: SiegeHeroInstance) => void;
  onCellClick: (pos: Coord) => void;
}

export const SiegeChessBoard: React.FC<SiegeChessBoardProps> = ({
  state,
  selectedHero,
  queuedMoves,
  heldHeroIds,
  interactive,
  onSelectHero,
  onCellClick,
}) => {
  const [windowDimensions, setWindowDimensions] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 375,
    h: typeof window !== 'undefined' ? window.innerHeight : 667,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const COLS = 8;
  const ROWS = 8;

  // Responsive board calculation to fit mobile without overflow
  const rawCellSize = Math.floor(
    Math.min(
      (windowDimensions.w - 32) / COLS,
      (windowDimensions.h * 0.52) / ROWS
    )
  );
  const clampedCell = Math.max(36, Math.min(68, rawCellSize));
  const boardSize = clampedCell * 8;

  // Compute highlights for currently selected hero
  const validMoves = selectedHero && interactive
    ? getValidHeroMoves(selectedHero, state)
    : { moves: [], attacks: [], shrines: [] };

  const moveSet = new Set(validMoves.moves.map((c) => `${c.x},${c.y}`));
  const attackSet = new Set(validMoves.attacks.map((c) => `${c.x},${c.y}`));
  const shrineSet = new Set(validMoves.shrines.map((c) => `${c.x},${c.y}`));

  // 2x2 Shrine references
  const shrineLeft = state.shrines.find((s) => s.id === 's-left');
  const shrineRight = state.shrines.find((s) => s.id === 's-right');

  const colLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="flex flex-col items-center justify-center select-none w-full max-w-[min(92vw,calc(100dvh-165px),500px)] my-auto">
      {/* Outer Board Tray matching ChessBoard theme */}
      <div
        className="relative w-full aspect-square board-edge-mobile p-0 sm:p-2 border-0 sm:border-4 transition-colors soft-board-tray rounded-none sm:rounded-2xl shadow-2xl bg-[#1c080d] border-[#BC1434]/60"
      >
        {/* Dynamic Board Grid */}
        <div
          className="grid w-full h-full board-grid-mobile soft-board-grid rounded-none sm:rounded-xl overflow-hidden border-0 sm:border sm:border-[#BC1434]/40 relative"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: ROWS }).map((_, y) =>
            Array.from({ length: COLS }).map((_, x) => {
              // Standard alternating chessboard squares
              const isLight = (x + y) % 2 === 1;
              const key = `${x},${y}`;

              const hero = state.heroes.find((h) => h.isAlive && h.pos.x === x && h.pos.y === y);
              const pawn = state.pawns.find((p) => p.isAlive && p.pos.x === x && p.pos.y === y);

              const isSelected = selectedHero && hero?.instanceId === selectedHero.instanceId;
              const isMoveTarget = moveSet.has(key);
              const isAttackTarget = attackSet.has(key);
              const isShrineTarget = shrineSet.has(key);

              // Is this cell queued by ANY hero?
              const queuedHeroId = Object.keys(queuedMoves).find(
                (id) => queuedMoves[id]?.x === x && queuedMoves[id]?.y === y
              );

              // Damage flash on this cell
              const flash = state.damageFlashes.find((f) => f.pos.x === x && f.pos.y === y);

              // Demon Slayer Crimson & Ivory Parchment from attached ChessBoard
              const isShrineSquare = (y === 3 || y === 4) && ((x === 1 || x === 2) || (x === 5 || x === 6));

              // All 4 shrine squares have ONLY ONE Cream color. Other squares alternate cream and crimson.
              let squareBg = isShrineSquare
                ? 'bg-[#F2EFE4]'
                : isLight
                ? 'bg-[#F2EFE4]'
                : 'bg-[#BC1434]';

              if (isSelected) {
                squareBg = `${squareBg} ring-3 ring-inset ring-amber-400 brightness-105 z-20`;
              }

              const coordColor = (isShrineSquare || isLight) ? 'text-[#BC1434]/80' : 'text-[#F2EFE4]/85';

              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  disabled={!interactive}
                  onClick={() => onCellClick({ x, y })}
                  className={`relative flex items-center justify-center focus:outline-none border-0 p-0 transition-all duration-200 ${squareBg} ${
                    interactive ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  aria-label={`Square ${colLabels[x]}${8 - y}`}
                >
                  {/* File/Rank Coordinate Labels on edges */}
                  {x === 0 && (
                    <span className={`absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-black font-mono pointer-events-none select-none z-10 ${coordColor}`}>
                      {8 - y}
                    </span>
                  )}
                  {y === 7 && (
                    <span className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-black font-mono pointer-events-none select-none z-10 ${coordColor}`}>
                      {colLabels[x]}
                    </span>
                  )}

                  {/* Move Destination Dot indicator from ChessBoard (40-45% of square) */}
                  {isMoveTarget && (
                    <div className="absolute w-[42%] h-[42%] bg-amber-400 border-2 border-black/40 rounded-full soft-move-dot shadow-sm pointer-events-none flex items-center justify-center z-10 animate-pulse">
                      <div className="w-full h-full border border-white/30 rounded-full" />
                    </div>
                  )}

                  {/* High-contrast ring attack/capture target indicator from ChessBoard */}
                  {isAttackTarget && (
                    <div className="absolute inset-1.5 sm:inset-2 rounded-full border-4 border-red-500 bg-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.4)] pointer-events-none flex items-center justify-center z-10 animate-pulse">
                      <div className="absolute inset-0 border-2 border-black/20 rounded-full" />
                    </div>
                  )}

                  {/* Shrine target indicator - NO CIRCLE around shrine, clean soft highlight */}
                  {isShrineTarget && (
                    <div className="absolute inset-1 rounded-sm border-2 border-amber-400/90 bg-amber-400/20 pointer-events-none z-10 animate-pulse" />
                  )}

                  {/* Queued Move Destination Badge */}
                  {queuedHeroId && (
                    <div className="absolute top-1 right-1 z-30 bg-emerald-500 text-white rounded-full p-0.5 shadow-md animate-bounce">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Red Damage Flash Overlay (300ms) */}
                  {flash && (
                    <div className="absolute inset-0 z-40 bg-red-600/70 animate-ping pointer-events-none" />
                  )}

                  {/* Hero Piece - No background disk, pure piece sitting directly on chess square */}
                  {hero && (
                    <div
                      onClick={(e) => {
                        if (interactive && hero.team === 1) {
                          e.stopPropagation();
                          onSelectHero(hero);
                        }
                      }}
                      className={`w-full h-full flex flex-col items-center justify-center relative z-20 transition-all duration-300 ${
                        isSelected
                          ? 'scale-110 drop-shadow-[0_0_10px_#FFD700]'
                          : 'hover:scale-105'
                      }`}
                    >
                      {/* SVG Piece Graphic */}
                      <div className="w-[86%] h-[86%] flex items-center justify-center relative drop-shadow-md">
                        <HeroPiece
                          type={heroIdToPieceType(hero.heroId)}
                          color={hero.team === 1 ? 'white' : 'black'}
                          className="w-full h-full"
                        />

                        {/* Queued or Held Status Tag */}
                        {hero.team === 1 && (queuedMoves[hero.instanceId] || heldHeroIds.has(hero.instanceId)) && (
                          <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[8px] font-black rounded px-1 leading-tight shadow-md z-30">
                            {heldHeroIds.has(hero.instanceId) ? 'HOLD' : '✓'}
                          </span>
                        )}
                      </div>

                      {/* Clean Slim HP Bar underneath piece - Only shown after first hit (hp < maxHp) */}
                      {hero.hp < hero.maxHp && (
                        <div className="w-3/4 h-1 bg-black/80 rounded-full overflow-hidden absolute bottom-0.5 sm:bottom-1 z-30 pointer-events-none border border-black/40 shadow-sm">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${(hero.hp / hero.maxHp) * 100}%`,
                              backgroundColor: hero.team === 1 ? '#a855f7' : '#f97316',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pawn Piece - Pure chess piece directly on square without background box */}
                  {!hero && pawn && (
                    <div className="w-full h-full flex flex-col items-center justify-center relative z-20 pointer-events-none">
                      <div className="w-[72%] h-[72%] flex items-center justify-center drop-shadow-md">
                        <ChessPiece type="pawn" color={pawn.team === 1 ? 'white' : 'black'} />
                      </div>
                      {/* Pawn HP Bar - Only shown after first hit (hp < maxHp) */}
                      {pawn.hp < pawn.maxHp && (
                        <div className="w-3/5 h-0.5 bg-black/80 rounded-full overflow-hidden absolute bottom-0.5 sm:bottom-1 z-30 border border-black/40 shadow-sm">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${(pawn.hp / pawn.maxHp) * 100}%`,
                              backgroundColor: pawn.team === 1 ? '#a855f7' : '#f97316',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })
          )}

          {/* 2x2 Left Shrine Overlay (Rows 3..4, Cols 1..2) */}
          {shrineLeft && (
            <div
              className="absolute pointer-events-none z-10 flex items-center justify-center overflow-visible"
              style={{
                left: `12.5%`,
                top: `37.5%`,
                width: `25%`,
                height: `25%`,
              }}
            >
              <ShrineStructure
                owner={
                  shrineLeft.owner === 1 ? 'player' : shrineLeft.owner === 2 ? 'enemy' : 'neutral'
                }
                captureProgress={shrineLeft.occupierTeam ? 100 : 0}
                contested={shrineLeft.isContested}
                size={clampedCell * 1.84}
              />
            </div>
          )}

          {/* 2x2 Right Shrine Overlay (Rows 3..4, Cols 5..6) */}
          {shrineRight && (
            <div
              className="absolute pointer-events-none z-10 flex items-center justify-center overflow-visible"
              style={{
                left: `62.5%`,
                top: `37.5%`,
                width: `25%`,
                height: `25%`,
              }}
            >
              <ShrineStructure
                owner={
                  shrineRight.owner === 1 ? 'player' : shrineRight.owner === 2 ? 'enemy' : 'neutral'
                }
                captureProgress={shrineRight.occupierTeam ? 100 : 0}
                contested={shrineRight.isContested}
                size={clampedCell * 1.84}
              />
            </div>
          )}

          {/* Floating Combat Damage Numbers */}
          {state.floatingNumbers.map((fn) => (
            <div
              key={fn.id}
              className="absolute font-black text-xs sm:text-sm animate-bounce pointer-events-none z-40 transition-all duration-300"
              style={{
                left: `${(fn.pos.x / COLS) * 100 + 3}%`,
                top: `${(fn.pos.y / ROWS) * 100 + 2}%`,
                color: fn.color,
                textShadow: '0px 2px 4px rgba(0,0,0,0.9)',
              }}
            >
              {fn.text}
            </div>
          ))}

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

      {/* Legend Under Board */}
      <div className="flex items-center justify-center gap-4 text-[11px] font-mono font-bold text-neutral-300 mt-2 bg-[#0f172a] px-3.5 py-1 rounded-full border border-slate-700/70 shadow">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block border border-black/40" /> Move
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block border border-black/40" /> Attack
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block border border-black/40" /> Shrine
        </span>
      </div>
    </div>
  );
};
