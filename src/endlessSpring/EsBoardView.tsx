import React, { useState, useEffect, useRef } from 'react';
import {
  EsGameState,
  EsMove,
  EsPiece,
  EsPosition,
} from './EsTypes';
import {
  esChebyshevDistance,
  esGetLegalMovesForPiece,
  esGetPieceAt,
  esIsPlayableSquare,
  esIsSamePos,
} from './EsRules';
import { EsPieceRenderer } from './EsPieceRenderer';

export interface EsBoardViewProps {
  state: EsGameState;
  onMove: (move: EsMove) => void;
  onSelectPiece?: (piece: EsPiece | null) => void;
}

export const EsBoardView: React.FC<EsBoardViewProps> = ({
  state,
  onMove,
  onSelectPiece,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [boardDimensions, setBoardDimensions] = useState<{ width: number; height: number }>({
    width: 320,
    height: 320,
  });

  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [focusedPos, setFocusedPos] = useState<EsPosition>({ x: 0, y: 0 });

  const { board, pieces, gameId, stageOrAct } = state;
  const cols = board.width;
  const rows = board.height;

  // ResizeObserver for responsive non-scrolling board sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setBoardDimensions({ width, height });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selectedPiece = pieces.find((p) => p.id === selectedPieceId) || null;

  useEffect(() => {
    onSelectPiece?.(selectedPiece);
  }, [selectedPiece, onSelectPiece]);

  // Selected piece legal destinations
  const legalDests = selectedPiece && selectedPiece.side === state.turn
    ? esGetLegalMovesForPiece(state, selectedPiece)
    : [];

  // Compute cell size
  const maxDim = Math.max(cols, rows);
  const availableMin = Math.min(boardDimensions.width, boardDimensions.height);
  const rawCellSize = Math.floor(availableMin / maxDim);
  const cellSize = Math.max(rawCellSize, 30);
  const computedBoardWidth = cellSize * cols;
  const computedBoardHeight = cellSize * rows;

  // CSS transform scale factor if available space is smaller than minimum cell size constraint
  const scale =
    availableMin < maxDim * 30
      ? Math.max(0.6, availableMin / (maxDim * 30))
      : 1;

  // Board colors based on game theme
  const getThemePalette = () => {
    switch (gameId) {
      case 1:
        return { light: '#c9a66b', dark: '#b58f55', border: '#78562d' };
      case 2:
        return { light: '#6b7280', dark: '#4b5563', border: '#374151' };
      case 3:
        if (stageOrAct === 1) return { light: '#0d9488', dark: '#0f766e', border: '#115e59' };
        if (stageOrAct === 2) return { light: '#b45309', dark: '#92400e', border: '#78350f' };
        return { light: '#ea580c', dark: '#c2410c', border: '#9a3412' };
      case 4:
        if (stageOrAct === 1) return { light: '#f43f5e', dark: '#e11d48', border: '#be123c' };
        if (stageOrAct === 2) return { light: '#059669', dark: '#047857', border: '#065f46' };
        return { light: '#991b1b', dark: '#7f1d1d', border: '#450a0a' };
      case 5:
        if (stageOrAct === 1) return { light: '#d9a441', dark: '#b45309', border: '#78350f' };
        if (stageOrAct === 2) return { light: '#57534e', dark: '#44403c', border: '#292524' };
        return { light: '#b3261e', dark: '#7f1d1d', border: '#450a0a' };
    }
  };

  const palette = getThemePalette();

  const handleSquareClick = (pos: EsPosition) => {
    if (state.outcome !== 'ongoing') return;
    if (state.turn !== 'A') return; // Can only act on player's turn

    // If clicking a legal destination of the selected piece
    if (selectedPiece && legalDests.some((d) => esIsSamePos(d, pos))) {
      const captured = esGetPieceAt(pieces, pos);
      onMove({
        pieceId: selectedPiece.id,
        from: selectedPiece.pos,
        to: pos,
        capturedPieceId: captured?.id,
      });
      setSelectedPieceId(null);
      return;
    }

    // If clicking on an owned piece -> select it
    const clickedPiece = esGetPieceAt(pieces, pos);
    if (clickedPiece && clickedPiece.side === 'A') {
      if (selectedPieceId === clickedPiece.id) {
        setSelectedPieceId(null); // Toggle off
      } else {
        setSelectedPieceId(clickedPiece.id);
      }
      return;
    }

    // Otherwise deselect
    setSelectedPieceId(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, pos: EsPosition) => {
    let nx = pos.x;
    let ny = pos.y;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        ny = Math.min(rows - 1, pos.y + 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        ny = Math.max(0, pos.y - 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nx = Math.max(0, pos.x - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        nx = Math.min(cols - 1, pos.x + 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSquareClick(pos);
        return;
      case 'Escape':
        e.preventDefault();
        setSelectedPieceId(null);
        return;
      default:
        return;
    }

    setFocusedPos({ x: nx, y: ny });
    const targetEl = document.getElementById(`es-cell-${nx}-${ny}`);
    targetEl?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-1 md:p-3 select-none touch-manipulation overflow-hidden"
      style={{ touchAction: 'manipulation' }}
    >
      <div
        className="relative shadow-2xl transition-transform duration-150"
        style={{
          width: computedBoardWidth,
          height: computedBoardHeight,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'center center',
        }}
      >
        {/* Shadow Line Overlay for Game 1 */}
        {gameId === 1 && state.shadowLineS !== undefined && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-black/45 pointer-events-none transition-all duration-200 z-10 border-r-2 border-amber-400/60"
            style={{ width: `${state.shadowLineS * cellSize}px` }}
          >
            <div className="absolute top-1 left-1.5 text-[9px] font-mono uppercase text-amber-200 tracking-wider font-bold">
              Shadow (x &lt; {state.shadowLineS})
            </div>
          </div>
        )}

        {/* Board Grid: Render row by row from top (y = rows - 1) to bottom (y = 0) */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: rows }).map((_, rIdx) => {
            const y = rows - 1 - rIdx;
            const isFloodedRow = state.floodedRows?.includes(y);

            return Array.from({ length: cols }).map((_, x) => {
              const pos = { x, y };
              const isPlayable = esIsPlayableSquare(board, pos);
              const piece = esGetPieceAt(pieces, pos);
              const isSelected = selectedPiece && esIsSamePos(selectedPiece.pos, pos);
              const isLegalDest = legalDests.some((d) => esIsSamePos(d, pos));
              const isCaptureTarget = isLegalDest && piece && piece.side !== selectedPiece?.side;

              const isSmoke = state.smokeSquares?.some((s) => esIsSamePos(s, pos));
              const isFire = state.fireSquares?.some((f) => esIsSamePos(f, pos));
              const specialTile = state.specialTiles?.find((t) => esIsSamePos(t.pos, pos));
              const isCrowdToken = state.crowdTokens?.some((t) => esIsSamePos(t, pos));

              const isSquareDark = (x + y) % 2 === 1;
              const squareBg = isSquareDark ? palette.dark : palette.light;

              if (!isPlayable) {
                return (
                  <div
                    key={`void-${x}-${y}`}
                    className="w-full h-full bg-neutral-950/80 border border-white/5 flex items-center justify-center opacity-40"
                  />
                );
              }

              return (
                <button
                  id={`es-cell-${x}-${y}`}
                  key={`cell-${x}-${y}`}
                  type="button"
                  tabIndex={focusedPos.x === x && focusedPos.y === y ? 0 : -1}
                  onClick={() => handleSquareClick(pos)}
                  onKeyDown={(e) => handleKeyDown(e, pos)}
                  aria-label={`Square ${x},${y}${piece ? `, ${piece.side} ${piece.type}` : ''}`}
                  className={`relative w-full h-full flex items-center justify-center p-0.5 border border-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors cursor-pointer ${
                    isSelected ? 'ring-2 ring-amber-400 z-20' : ''
                  }`}
                  style={{ backgroundColor: squareBg }}
                >
                  {/* Smoke / Fire overlay */}
                  {isFire && (
                    <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center z-15 pointer-events-none animate-pulse">
                      <span className="text-sm">🔥</span>
                    </div>
                  )}
                  {isSmoke && !isFire && (
                    <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center z-15 pointer-events-none">
                      <span className="text-xs">💨</span>
                    </div>
                  )}

                  {/* Flooded Row tint */}
                  {isFloodedRow && (
                    <div className="absolute inset-0 bg-blue-500/40 pointer-events-none z-10 border-b border-blue-300/40 flex items-end justify-center">
                      <span className="text-[9px] text-blue-200">〰️</span>
                    </div>
                  )}

                  {/* Special Tile Markers */}
                  {specialTile && !specialTile.collected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 z-5">
                      {specialTile.type === 'notebook' && <span className="text-xs">📓</span>}
                      {specialTile.type === 'slip' && <span className="text-xs">🏷️</span>}
                      {specialTile.type === 'exit' && (
                        <div className="w-4/5 h-4/5 border-2 border-emerald-400 border-dashed rounded flex items-center justify-center text-[10px] font-black text-emerald-300">
                          EXIT
                        </div>
                      )}
                      {specialTile.type === 'passage' && (
                        <div className="w-full h-full border border-sky-400 bg-sky-500/20 flex items-center justify-center text-[9px] font-black text-sky-200">
                          GATE
                        </div>
                      )}
                      {specialTile.type === 'red_door' && (
                        <div className="w-4/5 h-4/5 border-2 border-red-500 bg-red-600/40 flex items-center justify-center text-[9px] font-black text-red-200">
                          DOOR
                        </div>
                      )}
                      {specialTile.type === 'shrine' && (
                        <div className="w-4/5 h-4/5 border-2 border-amber-400 bg-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-200">
                          ⛩️
                        </div>
                      )}
                      {specialTile.type === 'paper' && <span className="text-xs">📜</span>}
                      {specialTile.type === 'stair' && (
                        <div className="w-4/5 h-4/5 border-2 border-yellow-400 bg-yellow-500/30 flex items-center justify-center text-[9px] font-bold text-yellow-200">
                          STAIR
                        </div>
                      )}
                    </div>
                  )}

                  {/* Crowd Token for Game 4 Act 1 */}
                  {isCrowdToken && (
                    <div className="w-3/4 h-3/4 rounded-full bg-slate-800 border-2 border-slate-500 flex items-center justify-center shadow-md z-10">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    </div>
                  )}

                  {/* Piece Render */}
                  {piece && (
                    <div className={`relative w-full h-full flex items-center justify-center z-15 ${isSelected ? 'scale-110 transition-transform' : ''}`}>
                      <EsPieceRenderer
                        type={piece.type}
                        side={piece.side}
                        isRealFootman={piece.isRealFootman}
                        className="w-4/5 h-4/5 drop-shadow-md"
                      />
                      {/* Frozen badge for stillness */}
                      {piece.frozenRounds && piece.frozenRounds > 0 && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-cyan-400 rounded-full border border-black" title="Stillness: Frozen for this turn" />
                      )}
                    </div>
                  )}

                  {/* Legal Move Indicators (42% dot, capture ring) */}
                  {isLegalDest && !isCaptureTarget && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="w-[42%] h-[42%] rounded-full bg-black/35 border border-white/60 shadow-sm" />
                    </div>
                  )}
                  {isCaptureTarget && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="w-[78%] h-[78%] rounded-full border-3 border-red-500 animate-pulse" />
                    </div>
                  )}
                </button>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};
