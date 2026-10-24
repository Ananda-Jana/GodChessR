import React, { useState, useEffect } from 'react';
import { Piece, Position, Move, PieceColor, DiceState, PieceType, PieceTheme } from '../types/game';
import { ChessPiece } from './ChessPiece';
import { getLegalMovesForSquare, getDiceEligibleMoves, getAllLegalMoves } from '../game/engine';
import { useTheme } from '../context/ThemeContext';

export const PIECE_NAMES: Record<PieceType, string> = {
  pawn: 'Pawn',
  knight: 'Knight',
  bishop: 'Bishop',
  rook: 'Rook',
  queen: 'Queen',
  king: 'King',
  prince: 'Prince',
  communist: 'Communist',
  supremeRook: 'Supreme Rook',
  priest: 'Priest',
};

interface ChessBoardProps {
  board: (Piece | null)[][];
  turn: PieceColor;
  myColor: PieceColor;
  dice: DiceState | null;
  lastMove?: Move;
  inCheck: PieceColor | null;
  isInteractive: boolean;
  onMove: (from: Position, to: Position) => void;
  flipped?: boolean;
  showMoveSuggestions?: boolean;
  diceActive?: boolean;
  craftingPlacementMode?: boolean;
  craftCandidateSquares?: Position[];
  craftAttackedSquares?: Position[];
  onSelectCraftSquare?: (pos: Position) => void;
  checkmateGrids?: Position[];
  defeatedKingPos?: Position | null;
  pieceTheme?: PieceTheme;
  boardPalette?: 'default' | 'crimson';
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  turn,
  myColor,
  dice,
  lastMove,
  inCheck,
  isInteractive,
  onMove,
  flipped = false,
  showMoveSuggestions = true,
  diceActive = true,
  craftingPlacementMode = false,
  craftCandidateSquares = [],
  craftAttackedSquares = [],
  onSelectCraftSquare,
  checkmateGrids = [],
  defeatedKingPos = null,
  pieceTheme = 'classic',
  boardPalette = 'default',
}) => {
  const { theme } = useTheme();
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [focusedPos, setFocusedPos] = useState<Position>({ x: 0, y: 0 });

  // Derive selected piece and its display name from current selection
  const selectedPiece = selectedPos ? board[selectedPos.y]?.[selectedPos.x] : null;
  const selectedPieceName = selectedPiece ? PIECE_NAMES[selectedPiece.type] : null;

  // Clear selection if turn shifts or board interaction is disabled
  useEffect(() => {
    if (turn !== myColor || !isInteractive) {
      setSelectedPos(null);
    }
  }, [turn, myColor, isInteractive]);

  // Sync focused position with selected position or last move
  useEffect(() => {
    if (selectedPos) {
      setFocusedPos(selectedPos);
    } else if (lastMove) {
      setFocusedPos(lastMove.to);
    }
  }, [selectedPos, lastMove]);

  // Compute eligible pieces for current roll, normal chess (diceActive=false), or check escape
  const isDiceActive = diceActive ?? true;
  const isMyTurn = turn === myColor;
  const isPlayerInCheck = inCheck === turn;
  const hasDiceRolled = dice && !dice.isConsumed;

  const { eligibleMoves } =
    isMyTurn && (!isDiceActive || hasDiceRolled || isPlayerInCheck)
      ? (!isDiceActive || isPlayerInCheck)
        ? { eligibleMoves: getAllLegalMoves(board, turn) }
        : getDiceEligibleMoves(board, turn, dice, inCheck)
      : { eligibleMoves: [] };

  // Set of square keys "x,y" that have eligible pieces
  const eligibleSquares = new Set<string>();
  if (isMyTurn && (!isDiceActive || hasDiceRolled || isPlayerInCheck)) {
    for (const m of eligibleMoves) {
      eligibleSquares.add(`${m.from.x},${m.from.y}`);
    }
  }

  // Legal moves for currently selected piece
  const selectedLegalMoves: Move[] = selectedPos
    ? eligibleMoves.filter(
        (m) => m.from.x === selectedPos.x && m.from.y === selectedPos.y
      )
    : [];

  const handleSquareClick = (x: number, y: number) => {
    setFocusedPos({ x, y });
    if (craftingPlacementMode) {
      const isValid = craftCandidateSquares.some((p) => p.x === x && p.y === y);
      if (isValid && onSelectCraftSquare) {
        onSelectCraftSquare({ x, y });
      }
      return;
    }

    if (!isInteractive || !isMyTurn || (isDiceActive && !hasDiceRolled && !isPlayerInCheck)) return;

    // If already clicked a piece and clicked on a valid destination
    if (selectedPos) {
      const targetMove = selectedLegalMoves.find((m) => m.to.x === x && m.to.y === y);
      if (targetMove) {
        onMove(selectedPos, { x, y });
        setSelectedPos(null);
        return;
      }
    }

    // Otherwise, select piece if it is friendly and has eligible moves
    const piece = board[y][x];
    if (piece && piece.color === myColor) {
      if (eligibleSquares.has(`${x},${y}`)) {
        setSelectedPos({ x, y });
      } else {
        setSelectedPos(null);
      }
    } else {
      setSelectedPos(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, x: number, y: number) => {
    let nextX = x;
    let nextY = y;

    switch (e.key) {
      case 'ArrowUp':
        nextY = flipped ? Math.min(boardHeight - 1, y + 1) : Math.max(0, y - 1);
        break;
      case 'ArrowDown':
        nextY = flipped ? Math.max(0, y - 1) : Math.min(boardHeight - 1, y + 1);
        break;
      case 'ArrowLeft':
        nextX = flipped ? Math.min(boardWidth - 1, x + 1) : Math.max(0, x - 1);
        break;
      case 'ArrowRight':
        nextX = flipped ? Math.max(0, x - 1) : Math.min(boardWidth - 1, x + 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSquareClick(x, y);
        return;
      default:
        return;
    }

    if (nextX !== x || nextY !== y) {
      e.preventDefault();
      setFocusedPos({ x: nextX, y: nextY });
      const nextBtn = document.querySelector(`[data-pos="${nextX},${nextY}"]`) as HTMLButtonElement;
      nextBtn?.focus();
    }
  };

  const boardHeight = board.length;
  const boardWidth = board[0]?.length ?? 8;

  // Display ranks and files based on perspective and dynamic board size
  const displayYIndices = flipped
    ? Array.from({ length: boardHeight }, (_, i) => i)
    : Array.from({ length: boardHeight }, (_, i) => boardHeight - 1 - i);
  const displayXIndices = flipped
    ? Array.from({ length: boardWidth }, (_, i) => boardWidth - 1 - i)
    : Array.from({ length: boardWidth }, (_, i) => i);

  const isThemeLight = theme === 'light';

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[540px]">
      <div
        className={`relative w-full p-2 sm:p-2.5 border-4 transition-colors soft-board-tray rounded-2xl shadow-xl ${
          isThemeLight
            ? 'bg-slate-200/90 border-slate-300'
            : 'bg-[#0f172a] border-slate-700/70'
        }`}
        style={{ aspectRatio: `${boardWidth} / ${boardHeight}` }}
      >
        {/* Dynamic Board Grid */}
        <div
          className={`grid w-full h-full soft-board-grid rounded-xl overflow-hidden ${
            isThemeLight ? 'border border-slate-300/80' : 'border border-slate-700/60'
          }`}
          style={{
            gridTemplateColumns: `repeat(${boardWidth}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${boardHeight}, minmax(0, 1fr))`,
          }}
        >
          {displayYIndices.map((y) =>
            displayXIndices.map((x) => {
              const piece = board[y][x];
              const isLight = (x + y) % 2 === 1;
              const isSelected = selectedPos?.x === x && selectedPos?.y === y;
              const isEligiblePiece = eligibleSquares.has(`${x},${y}`);

              const targetMove = selectedLegalMoves.find((m) => m.to.x === x && m.to.y === y);
              const isTargetMove = Boolean(targetMove);
              const isCaptureTarget = isTargetMove && Boolean(piece);

              const isLastMoveFrom = lastMove?.from.x === x && lastMove?.from.y === y;
              const isLastMoveTo = lastMove?.to.x === x && lastMove?.to.y === y;

              const isKingInCheckSquare =
                inCheck && piece?.type === 'king' && piece.color === inCheck;

              const isCraftCandidate =
                craftingPlacementMode && craftCandidateSquares.some((p) => p.x === x && p.y === y);
              const isCraftAttacked =
                craftingPlacementMode && craftAttackedSquares.some((p) => p.x === x && p.y === y);
              const isCheckmateGrid = checkmateGrids.some((p) => p.x === x && p.y === y);
              const isDefeatedKing = Boolean(
                defeatedKingPos && defeatedKingPos.x === x && defeatedKingPos.y === y
              );

              const isCrimsonPalette = boardPalette === 'crimson';
              const crimsonBaseBg = isLight ? 'bg-[#F2EFE4]' : 'bg-[#BC1434]';

              // Soft low-contrast square palette with optional cream/crimson bot match palette
              let squareBg = isCrimsonPalette
                ? crimsonBaseBg
                : isThemeLight
                  ? isLight ? 'bg-white' : 'bg-[#d8e0f0]'
                  : isLight ? 'bg-[#2b3c5a]' : 'bg-[#101726]';

              if (isLastMoveFrom || isLastMoveTo) {
                squareBg = isCrimsonPalette
                  ? `${crimsonBaseBg} ring-2 ring-inset ring-amber-400/90`
                  : isThemeLight
                    ? 'bg-amber-300/35'
                    : 'bg-amber-400/20';
              }
              if (isSelected) {
                squareBg = isCrimsonPalette
                  ? `${crimsonBaseBg} ring-3 ring-inset ring-amber-400 brightness-105`
                  : 'bg-amber-400/40 ring-2 ring-inset ring-amber-400/80';
              }
              if (isKingInCheckSquare) {
                squareBg = 'bg-red-600/80 ring-2 ring-inset ring-red-500';
              }

              if (isCraftCandidate) {
                squareBg = isCrimsonPalette
                  ? `${crimsonBaseBg} ring-2 ring-inset ring-amber-400`
                  : 'bg-amber-400/35 ring-2 ring-inset ring-amber-400';
              } else if (isCraftAttacked) {
                squareBg = isCrimsonPalette
                  ? `${crimsonBaseBg} ring-1 ring-inset ring-red-950/70 cursor-not-allowed`
                  : isThemeLight
                    ? 'bg-red-200/80 ring-1 ring-inset ring-red-500 cursor-not-allowed'
                    : 'bg-red-950/70 ring-1 ring-inset ring-red-500 cursor-not-allowed';
              }

              // All grids used for checkmate are made entirely red
              if (isCheckmateGrid) {
                squareBg = 'bg-red-600 ring-2 ring-inset ring-red-400 shadow-[inset_0_0_12px_rgba(0,0,0,0.6)] animate-pulse';
              }

              const coordColor = isCrimsonPalette
                ? isLight ? 'text-[#BC1434]/80' : 'text-[#F2EFE4]/85'
                : isThemeLight
                  ? isLight ? 'text-slate-400' : 'text-slate-500'
                  : isLight ? 'text-slate-400' : 'text-slate-500';

              const isFocused = focusedPos.x === x && focusedPos.y === y;

              return (
                <button
                  key={`${x}-${y}`}
                  data-pos={`${x},${y}`}
                  onClick={() => handleSquareClick(x, y)}
                  onKeyDown={(e) => handleKeyDown(e, x, y)}
                  tabIndex={isFocused ? 0 : -1}
                  className={`relative flex items-center justify-center p-0.5 sm:p-1 ${
                    isCraftAttacked ? 'cursor-not-allowed' : 'cursor-pointer'
                  } ${squareBg} focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:z-50`}
                  title={
                    isCheckmateGrid
                      ? 'Checkmate grid'
                      : isCraftCandidate
                      ? 'Safe placement square'
                      : isCraftAttacked
                      ? 'Unsafe square: attacked by enemy'
                      : undefined
                  }
                >
                  {/* Red Hatch Pattern Overlay for Unsafe Crafting Squares */}
                  {isCraftAttacked && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-40 bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_2px,transparent_2px,transparent_6px)]"
                    />
                  )}

                  {/* File/Rank Coordinate Labels on edges */}
                  {x === displayXIndices[0] && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-black font-mono pointer-events-none select-none ${
                        isCheckmateGrid ? 'text-white font-black' : coordColor
                      }`}
                    >
                      {y + 1}
                    </span>
                  )}
                  {y === displayYIndices[displayYIndices.length - 1] && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-black font-mono pointer-events-none select-none ${
                        isCheckmateGrid ? 'text-white font-black' : coordColor
                      }`}
                    >
                      {String.fromCharCode('a'.charCodeAt(0) + x)}
                    </span>
                  )}

                  {/* Piece Graphic */}
                  {piece && (
                    <div
                      className={`w-full h-full flex items-center justify-center relative transition-all duration-700 ease-out ${
                        isDefeatedKing
                          ? 'transform rotate-90 translate-y-2 origin-bottom-right drop-shadow-lg z-20'
                          : ''
                      } ${
                        isEligiblePiece && !isSelected
                          ? 'after:absolute after:bottom-1 after:w-2.5 after:h-2.5 after:bg-amber-400 after:border after:border-black'
                          : ''
                      }`}
                    >
                      <div className="w-full h-full z-10 flex items-center justify-center">
                        <ChessPiece type={piece.type} color={piece.color} theme={pieceTheme} />
                      </div>
                    </div>
                  )}

                  {/* Enlarged dot legal move destination indicator (40-45% of square) */}
                  {showMoveSuggestions && isTargetMove && !isCaptureTarget && (
                    <div className="absolute w-[42%] h-[42%] bg-amber-400 border-2 border-black/40 rounded-full soft-move-dot shadow-sm pointer-events-none flex items-center justify-center">
                      <div className="w-full h-full border border-white/30 rounded-full" />
                    </div>
                  )}

                  {/* High-contrast ring capture target indicator (Shape differentiation) */}
                  {showMoveSuggestions && isCaptureTarget && (
                    <div className="absolute inset-2 rounded-full border-4 border-red-500 bg-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.4)] pointer-events-none flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-black/20 rounded-full" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Feature 1: Piece Name Tooltip on Click/Select */}
        {selectedPieceName && (
          <div
            className="absolute bottom-2 left-2 z-30 pointer-events-none select-none max-w-[90px] sm:max-w-[100px] truncate px-2 py-0.5 rounded bg-black/80 dark:bg-neutral-950/85 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold tracking-tight shadow-md animate-in fade-in duration-100"
            title={selectedPieceName}
          >
            {selectedPieceName}
          </div>
        )}
      </div>
    </div>
  );
};
