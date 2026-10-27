import React from 'react';
import {
  CraftPiece,
  CraftPieceColor,
  CraftPosition,
  CraftMove,
} from './craftGameTypes';
import { CraftGamePiece } from './CraftGamePieces';

interface CraftGameBoardProps {
  board: (CraftPiece | null)[][];
  selectedPos: CraftPosition | null;
  legalMoves: CraftMove[];
  lastMove?: CraftMove;
  inCheck: CraftPieceColor | null;
  turn: CraftPieceColor;
  playerColor: CraftPieceColor;
  isInteractive: boolean;
  width: number;
  height: number;
  onSelectSquare: (pos: CraftPosition) => void;
}

export const CraftGameBoard: React.FC<CraftGameBoardProps> = ({
  board,
  selectedPos,
  legalMoves,
  lastMove,
  inCheck,
  turn,
  playerColor,
  isInteractive,
  width,
  height,
  onSelectSquare,
}) => {
  // Destination lookup map
  const legalTargetMap = new Map<string, CraftMove>();
  legalMoves.forEach((m) => {
    legalTargetMap.set(`${m.to.x},${m.to.y}`, m);
  });

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      <div
        className="relative border-4 border-black dark:border-white shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] bg-black overflow-hidden"
        style={{
          width: '100%',
          maxWidth:
            height === 1
              ? '600px'
              : height === 2
              ? '640px'
              : width <= 4
              ? '340px'
              : 'min(92vw, 560px)',
          aspectRatio: `${width} / ${height}`,
        }}
      >
        <div
          className="grid w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: height }).map((_, y) =>
            Array.from({ length: width }).map((_, x) => {
              const piece = board[y]?.[x];
              const isLight = (x + y) % 2 === 0;
              const isSelected = selectedPos?.x === x && selectedPos?.y === y;
              const legalMove = legalTargetMap.get(`${x},${y}`);
              const isCapture = Boolean(legalMove?.captured);
              const isLastMoveFrom = lastMove?.from.x === x && lastMove?.from.y === y;
              const isLastMoveTo = lastMove?.to.x === x && lastMove?.to.y === y;
              const isKingChecked =
                piece?.type === 'king' && piece?.color === inCheck;

              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  disabled={!isInteractive}
                  onClick={() => onSelectSquare({ x, y })}
                  className={`relative flex items-center justify-center p-1 sm:p-2 cursor-pointer transition-all duration-150 outline-none
                    ${isLight ? 'bg-[#cbd5e1]' : 'bg-[#334155]'}
                    ${isSelected ? '!bg-amber-400/90 ring-4 ring-amber-300 ring-inset z-20' : ''}
                    ${isLastMoveFrom || isLastMoveTo ? 'after:absolute after:inset-0 after:bg-amber-500/20' : ''}
                    ${isKingChecked ? 'ring-4 ring-red-600 ring-inset bg-red-600/30 animate-pulse z-20' : ''}
                    hover:brightness-105 active:scale-95
                  `}
                  aria-label={`Square ${x},${y} ${piece ? `${piece.color} ${piece.type}` : 'empty'}`}
                >
                  {/* Square Coordinate Indicators */}
                  {x === 0 && height > 2 && (
                    <span className="absolute top-0.5 left-1 text-[8px] font-black uppercase text-black/40 dark:text-white/40 pointer-events-none">
                      {height - y}
                    </span>
                  )}
                  {y === height - 1 && height > 2 && (
                    <span className="absolute bottom-0.5 right-1 text-[8px] font-black uppercase text-black/40 dark:text-white/40 pointer-events-none">
                      {String.fromCharCode(97 + x)}
                    </span>
                  )}

                  {/* Piece */}
                  {piece && (
                    <div
                      className={`relative z-10 w-full h-full flex items-center justify-center transition-transform duration-100 ${
                        isSelected ? 'scale-110 drop-shadow-lg' : ''
                      }`}
                    >
                      <CraftGamePiece type={piece.type} color={piece.color} />
                    </div>
                  )}

                  {/* Legal Move Dot on Empty Square */}
                  {legalMove && !piece && (
                    <div className="absolute z-20 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-400 border border-black shadow-[0_0_8px_#fbbf24] animate-pulse" />
                  )}

                  {/* Legal Capture Ring on Occupied Square */}
                  {legalMove && piece && (
                    <div className="absolute inset-0 z-20 border-4 border-red-500 bg-red-500/20 animate-pulse pointer-events-none" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
