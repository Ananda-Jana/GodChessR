import React, { useState } from 'react';
import {
  CullingPos,
  CullingPieceColor,
  CullingMove,
  CullingMatchState,
  isValidCullingPos,
  posToCullingSquare,
} from '../types/cullingGame';
import { CullingPiece as CullingPieceComponent } from './CullingPiece';
import { getLegalMovesForSquare } from '../game/cullingEngine';

interface CullingBoardProps {
  match: CullingMatchState;
  myColor: CullingPieceColor;
  isInteractive: boolean;
  onMove: (from: CullingPos, to: CullingPos, actionType?: string) => void;
  flipped?: boolean;
  onPieceClick?: (piece: { type: string; color: string }) => void;
}

export const CullingBoard: React.FC<CullingBoardProps> = ({
  match,
  myColor,
  isInteractive,
  onMove,
  flipped = false,
  onPieceClick,
}) => {
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
    if (!isValidCullingPos(x, y)) return;

    const clickedPiece = match.board[y][x];

    // Trigger piece name inspection callback if piece clicked
    if (clickedPiece && onPieceClick) {
      onPieceClick(clickedPiece);
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
        return;
      }
    }

    // Select piece if it belongs to current active player and match's turn
    if (clickedPiece && clickedPiece.color === match.turn && clickedPiece.color === myColor) {
      setSelectedPos({ x, y });
    } else {
      setSelectedPos(null);
    }
  };

  // 10x10 rows.
  // If not flipped: rank 9 (top arm) is row 0 of display, rank 0 (bottom arm) is row 9.
  const rowIndices = flipped
    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    : [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

  const colIndices = flipped
    ? [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div
      className="relative p-1.5 sm:p-2.5 rounded-xl border-3 sm:border-4 border-black dark:border-white shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] select-none max-w-full overflow-hidden"
      style={{ backgroundColor: '#f01e2c' }}
    >
      {/* 10x10 Cross-Shaped Board Grid: Maximize Screen Fill */}
      <div className="grid grid-cols-10 grid-rows-10 border-2 border-black/40 dark:border-white/20 bg-transparent w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] md:w-[490px] md:h-[490px] lg:w-[min(calc(100vh-135px),640px)] lg:h-[min(calc(100vh-135px),640px)] aspect-square">
        {rowIndices.map((y) =>
          colIndices.map((x) => {
            const isPlayable = isValidCullingPos(x, y);
            const piece = isPlayable ? match.board[y][x] : null;

            if (!isPlayable) {
              return (
                <div
                  key={`cell-${x}-${y}`}
                  className="w-full h-full aspect-square bg-[#0a0e14]/90 pointer-events-none"
                />
              );
            }

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
            // Dark squares: Fully transparent with Gaussian backdrop blur revealing rich red background
            let squareBg = 'transparent';
            let backdropStyle: React.CSSProperties = {};

            if (isDark) {
              squareBg = isLastMoveDst
                ? 'rgba(245, 158, 11, 0.22)'
                : isLastMoveSrc
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(45, 10, 15, 0.15)';
              backdropStyle = {
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              };
            } else {
              squareBg = isLastMoveDst
                ? '#e6dec8'
                : isLastMoveSrc
                ? '#ede8d9'
                : '#F2EFE4';
            }

            const squareLabel = posToCullingSquare({ x, y });

            return (
              <div
                key={`cell-${x}-${y}`}
                onClick={() => handleSquareClick(x, y)}
                style={{ backgroundColor: squareBg, ...backdropStyle }}
                className={`relative w-full h-full aspect-square flex items-center justify-center cursor-pointer transition-all duration-75 border border-black/10 dark:border-white/10 ${
                  isSelected ? 'ring-2 sm:ring-3 ring-amber-400 z-20 brightness-105' : ''
                } ${isCheckSquare ? 'ring-2 sm:ring-3 ring-red-600 bg-red-600/35 animate-pulse z-10' : ''}`}
                title={squareLabel}
              >
                {/* Coordinate label */}
                <span
                  className={`absolute bottom-0.5 right-0.5 text-[6px] sm:text-[8px] font-mono font-bold pointer-events-none select-none ${
                    isDark ? 'text-red-200/50' : 'text-neutral-700/60'
                  }`}
                >
                  {squareLabel}
                </span>

                {/* Scaled-up Piece Component */}
                {piece && (
                  <div
                    className={`w-[94%] h-[94%] flex items-center justify-center z-10 transition-transform duration-700 ease-out ${
                      isDefeatedKing
                        ? 'transform rotate-90 translate-y-2 origin-bottom-right drop-shadow-xl z-20 opacity-80'
                        : ''
                    }`}
                  >
                    <CullingPieceComponent type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Status effects */}
                {piece?.isRestricted && (
                  <div className="absolute inset-0 bg-sky-500/25 border-2 border-sky-400 flex items-center justify-center z-20 pointer-events-none">
                    <span className="text-[9px]">❄️</span>
                  </div>
                )}

                {piece?.contractShield && (
                  <div className="absolute inset-0 border-2 border-amber-400 rounded-sm z-20 pointer-events-none animate-pulse" />
                )}

                {/* Legal Move Indicators */}
                {legalMove && (
                  <div
                    className={`absolute z-30 pointer-events-none flex items-center justify-center ${
                      legalMove.actionType === 'shoot' || legalMove.actionType === 'pierce_shoot'
                        ? 'w-full h-full border-2 sm:border-3 border-red-500 bg-red-500/20 rounded-full animate-pulse'
                        : legalMove.actionType === 'teleport'
                        ? 'w-full h-full border-2 border-amber-400 bg-amber-400/20'
                        : legalMove.actionType === 'swap'
                        ? 'w-full h-full border-2 border-purple-400 bg-purple-400/20'
                        : piece
                        ? 'w-full h-full border-2 sm:border-3 border-amber-400 rounded-full bg-amber-400/20'
                        : 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-amber-400 rounded-full shadow-[0_0_6px_#f59e0b]'
                    }`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
