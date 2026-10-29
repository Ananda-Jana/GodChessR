import React, { useState } from 'react';
import {
  CullingPos,
  CullingPieceColor,
  CullingMove,
  CullingMatchState,
  CullingBoardSize,
  isValidCullingPos,
  posToCullingSquare,
} from '../types/cullingGame';
import { CullingPiece as CullingPieceComponent } from './CullingPiece';
import { getLegalMovesForSquare } from '../game/cullingEngine';
import { sounds } from '../utils/audio';

interface CullingBoardProps {
  match: CullingMatchState;
  myColor: CullingPieceColor;
  isInteractive: boolean;
  onMove: (from: CullingPos, to: CullingPos, actionType?: string) => void;
  flipped?: boolean;
  onPieceClick?: (piece: { type: string; color: string; pos?: CullingPos }) => void;
  pulseGuide?: { from?: CullingPos; to?: CullingPos };
  maxDimension?: number;
  boardSize?: CullingBoardSize;
}

export const CullingBoard: React.FC<CullingBoardProps> = ({
  match,
  myColor,
  isInteractive,
  onMove,
  flipped = false,
  onPieceClick,
  pulseGuide,
  maxDimension,
  boardSize,
}) => {
  const dim = match.board.length;
  const activeBoardSize: CullingBoardSize =
    boardSize || match.boardSize || (dim === 10 ? '10x10' : dim === 8 ? '8x8' : '7x7');
  const maxIdx = dim - 1;

  const [selectedPos, setSelectedPos] = useState<CullingPos | null>(null);

  const selectedMoves: CullingMove[] = selectedPos
    ? getLegalMovesForSquare(match, selectedPos)
    : [];

  // Determine defeated color when match is finished
  const defeatedColor: CullingPieceColor | null =
    match.status === 'completed'
      ? match.winner === 'white'
        ? 'black'
        : match.winner === 'black'
        ? 'white'
        : null
      : null;

  const handleSquareClick = (x: number, y: number) => {
    if (!isValidCullingPos(x, y, activeBoardSize)) return;

    const clickedPiece = match.board[y]?.[x];

    // Trigger piece name inspection callback if piece clicked
    if (clickedPiece && onPieceClick) {
      onPieceClick({ type: clickedPiece.type, color: clickedPiece.color, pos: { x, y } });
    }

    if (!isInteractive) return;

    // If already selected a piece, check if click is on a legal destination
    if (selectedPos) {
      const matchingMove = selectedMoves.find((m) => m.to.x === x && m.to.y === y);
      if (matchingMove) {
        onMove(selectedPos, { x, y }, matchingMove.actionType);
        setSelectedPos(null);
        return;
      }
      // If clicking on same selected piece, deselect
      if (selectedPos.x === x && selectedPos.y === y) {
        setSelectedPos(null);
        sounds.playSelect();
        return;
      }
    }

    // Select piece if it belongs to current active player and match's turn
    if (clickedPiece && clickedPiece.color === match.turn && clickedPiece.color === myColor) {
      setSelectedPos({ x, y });
      sounds.playSelect();
    } else {
      setSelectedPos(null);
    }
  };

  const rowIndices = flipped
    ? Array.from({ length: dim }, (_, i) => i)
    : Array.from({ length: dim }, (_, i) => maxIdx - i);

  const colIndices = flipped
    ? Array.from({ length: dim }, (_, i) => maxIdx - i)
    : Array.from({ length: dim }, (_, i) => i);

  return (
    <div
      className={`relative aspect-square board-edge-mobile p-0 md:p-2 rounded-none md:rounded-xl border-0 md:border-4 border-black dark:border-white shadow-none md:shadow-[4px_4px_0px_#000000] dark:md:shadow-[4px_4px_0px_#ffffff] select-none touch-manipulation max-w-full max-h-full overflow-hidden shrink-0 flex items-center justify-center ${
        maxDimension
          ? ''
          : 'w-full md:w-[min(calc(100vw-16px),calc(100dvh-200px-env(safe-area-inset-bottom,0px)),540px)] lg:w-[min(calc(100dvh-64px),calc(100vw-680px),1200px)]'
      }`}
      style={{
        backgroundColor: '#e11d48',
        ...(maxDimension
          ? {
              width: `${maxDimension}px`,
              height: `${maxDimension}px`,
              maxWidth: '100%',
              maxHeight: '100%',
            }
          : {}),
      }}
    >
      {/* Board Grid: Anchored to Viewport */}
      <div
        className={`grid ${
          dim === 10
            ? 'grid-cols-10 grid-rows-10'
            : dim === 8
            ? 'grid-cols-8 grid-rows-8'
            : 'grid-cols-7 grid-rows-7'
        } board-grid-mobile border-0 md:border-2 border-black/40 dark:border-white/20 bg-transparent aspect-square touch-manipulation select-none max-w-full max-h-full w-full h-full`}
        style={maxDimension ? { maxWidth: `${maxDimension}px`, maxHeight: `${maxDimension}px` } : undefined}
      >
        {rowIndices.map((y) =>
          colIndices.map((x) => {
            const piece = match.board[y][x];

            const isSelected = selectedPos?.x === x && selectedPos?.y === y;
            const legalMove = selectedMoves.find((m) => m.to.x === x && m.to.y === y);
            const isLastMoveSrc = match.lastMove?.from.x === x && match.lastMove?.from.y === y;
            const isLastMoveDst = match.lastMove?.to.x === x && match.lastMove?.to.y === y;
            const isCheckSquare =
              match.inCheck &&
              piece &&
              piece.color === match.inCheck &&
              (piece.type === 'culling_gojo' || piece.type === 'culling_sukuna');

            // Defeated King topples over upon match conclusion
            const isDefeatedKing = Boolean(
              defeatedColor &&
                piece &&
                piece.color === defeatedColor &&
                (piece.type === 'culling_gojo' || piece.type === 'culling_sukuna')
            );

            const isDark = (x + y) % 2 === 0;

            // Light squares: Crisp, opaque off-white (#F2EFE4)
            // Dark squares: Fully transparent with Gaussian backdrop blur revealing rich crimson background
            let squareBg = 'transparent';
            let backdropStyle: React.CSSProperties = {};

            if (isDark) {
              squareBg = isLastMoveDst
                ? 'rgba(245, 158, 11, 0.3)'
                : isLastMoveSrc
                ? 'rgba(245, 158, 11, 0.16)'
                : 'rgba(40, 5, 12, 0.2)';
              backdropStyle = {
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              };
            } else {
              squareBg = isLastMoveDst
                ? '#fde68a'
                : isLastMoveSrc
                ? '#fef3c7'
                : '#F2EFE4';
            }

            const squareLabel = posToCullingSquare({ x, y }, activeBoardSize);
            const isGuideFrom = pulseGuide?.from && pulseGuide.from.x === x && pulseGuide.from.y === y;
            const isGuideTo = pulseGuide?.to && pulseGuide.to.x === x && pulseGuide.to.y === y;

            return (
              <div
                key={`cell-${x}-${y}`}
                onClick={() => handleSquareClick(x, y)}
                style={{ backgroundColor: squareBg, ...backdropStyle }}
                className={`relative w-full h-full aspect-square flex items-center justify-center cursor-pointer border border-black/15 dark:border-white/10 transition-colors duration-150 ${
                  isSelected
                    ? 'ring-2 sm:ring-3 ring-amber-400 z-20 shadow-[0_0_12px_#f59e0b] brightness-110'
                    : ''
                } ${
                  isCheckSquare
                    ? 'ring-3 ring-red-600 bg-red-600/40 animate-pulse z-20 shadow-[0_0_20px_#ef4444]'
                    : ''
                } ${
                  isGuideFrom
                    ? 'ring-3 ring-amber-400 bg-amber-400/40 animate-pulse z-30 shadow-[0_0_18px_#f59e0b]'
                    : ''
                } ${
                  isGuideTo
                    ? 'ring-3 ring-amber-400 border-2 border-dashed border-amber-300 bg-amber-400/25 animate-pulse z-30 shadow-[0_0_18px_#f59e0b]'
                    : ''
                }`}
                title={squareLabel}
              >
                {/* Last move indicator dot trail */}
                {isLastMoveDst && !piece && (
                  <div className="absolute w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] pointer-events-none" />
                )}

                {/* Coordinate label */}
                <span
                  className={`absolute bottom-0.5 right-0.5 text-[6px] sm:text-[7.5px] font-mono font-bold pointer-events-none select-none ${
                    isDark ? 'text-rose-200/60' : 'text-neutral-700/60'
                  }`}
                >
                  {squareLabel}
                </span>

                {/* Cursed Aura domain glow under checked king */}
                {isCheckSquare && (
                  <div className="absolute inset-0 rounded-sm bg-radial from-red-600/60 via-red-600/20 to-transparent animate-ping pointer-events-none z-10" />
                )}

                {/* Piece Component (Zero Layout Shift) */}
                {piece && (
                  <div
                    className={`w-[92%] h-[92%] flex items-center justify-center z-10 transition-transform duration-200 ease-out ${
                      isDefeatedKing
                        ? 'transform rotate-90 translate-y-1.5 origin-bottom-right drop-shadow-xl z-20 opacity-80'
                        : isSelected
                        ? 'scale-105 drop-shadow-[0_4px_6px_rgba(245,158,11,0.4)]'
                        : ''
                    }`}
                  >
                    <CullingPieceComponent type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Status effects */}
                {piece?.isRestricted && (
                  <div className="absolute inset-0 bg-sky-500/25 border-2 border-sky-400 flex items-center justify-center z-20 pointer-events-none">
                    <span className="text-[10px] sm:text-xs">❄️</span>
                  </div>
                )}

                {piece?.contractShield && (
                  <div className="absolute inset-0 border-2 border-amber-400 rounded-sm z-20 pointer-events-none animate-pulse shadow-[0_0_8px_#f59e0b]" />
                )}

                {/* Legal Move Indicators (Enlarged for high visibility) */}
                {legalMove && (
                  <div
                    className={`absolute z-30 pointer-events-none flex items-center justify-center ${
                      legalMove.actionType === 'shoot' || legalMove.actionType === 'pierce_shoot'
                        ? 'w-full h-full border-3 sm:border-4 border-red-600 bg-red-600/30 rounded-full animate-pulse shadow-[0_0_12px_#ef4444]'
                        : legalMove.actionType === 'teleport'
                        ? 'w-full h-full border-2 border-amber-400 bg-amber-400/25 shadow-[0_0_10px_#f59e0b]'
                        : legalMove.actionType === 'swap'
                        ? 'w-full h-full border-2 border-purple-400 bg-purple-400/25 shadow-[0_0_10px_#a855f7]'
                        : piece
                        ? 'w-full h-full border-3 sm:border-4 border-amber-500 rounded-full bg-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : 'w-[38%] h-[38%] bg-amber-400 border-2 border-black/40 rounded-full shadow-[0_0_8px_#f59e0b]'
                    }`}
                  >
                    {piece && (
                      <div className="absolute inset-0 border-2 border-white/30 rounded-full" />
                    )}
                    {!piece && (
                      <div className="w-full h-full border border-white/20 rounded-full" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
