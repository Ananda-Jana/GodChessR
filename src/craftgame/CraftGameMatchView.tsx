import React, { useState, useEffect, useRef } from 'react';
import {
  CraftMatchState,
  CraftPosition,
  CraftMove,
  CraftPieceColor,
  CraftPieceType,
  CraftPiece,
} from './craftGameTypes';
import { CraftGameBoard } from './CraftGameBoard';
import { CraftGamePiece } from './CraftGamePieces';
import {
  applyMoveToBoard,
  getLegalMovesForSquare,
  getAllLegalMoves,
  isKingInCheck,
  cloneBoard,
} from './CraftGameEngine';
import { getNextBotMove } from './CraftGameBotBridge';
import { makePiece } from './craftGameVariants';
import {
  ArrowLeft,
  RotateCcw,
  Swords,
  Crown,
  Trophy,
  AlertTriangle,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
} from 'lucide-react';

interface CraftGameMatchViewProps {
  initialState: CraftMatchState;
  onExit: () => void;
}

const CUSTOMIZABLE_PIECE_TYPES: CraftPieceType[] = [
  'rook',
  'knight',
  'bishop',
  'queen',
  'prince',
  'supremeRook',
  'priest',
  'communist',
];

export const CraftGameMatchView: React.FC<CraftGameMatchViewProps> = ({
  initialState,
  onExit,
}) => {
  const [match, setMatch] = useState<CraftMatchState>(initialState);
  const [selectedPos, setSelectedPos] = useState<CraftPosition | null>(null);
  const [legalMoves, setLegalMoves] = useState<CraftMove[]>([]);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    variant,
    board,
    turn,
    playerColor,
    botLevel,
    moveHistory,
    capturedWhite,
    capturedBlack,
    status,
    winner,
    winReason,
    inCheck,
    lastMove,
    isBotThinking,
  } = match;

  const botColor: CraftPieceColor = playerColor === 'white' ? 'black' : 'white';
  const isPlayerTurn = turn === playerColor && status === 'playing';

  // Cleanup bot timers on unmount
  useEffect(() => {
    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
      }
    };
  }, []);

  // Bot Turn Automation
  useEffect(() => {
    if (turn !== botColor || status !== 'playing') return;

    let isCancelled = false;

    setMatch((prev) => ({ ...prev, isBotThinking: true }));

    (async () => {
      try {
        const botMove = await getNextBotMove(
          board,
          botColor,
          botLevel,
          variant,
          moveHistory
        );

        if (isCancelled) return;

        if (!botMove) {
          // No legal moves for bot
          const kingChecked = isKingInCheck(board, botColor, variant);
          setMatch((prev) => ({
            ...prev,
            status: kingChecked ? 'checkmate' : 'draw',
            winner: kingChecked ? playerColor : 'draw',
            winReason: kingChecked ? 'Checkmate — Bot is defeated!' : 'Stalemate — No legal moves',
            isBotThinking: false,
          }));
          return;
        }

        // Apply bot move
        const newBoard = applyMoveToBoard(board, botMove);
        const nextCapturedWhite = [...capturedWhite];
        const nextCapturedBlack = [...capturedBlack];
        if (botMove.captured) {
          if (botMove.captured.color === 'white') {
            nextCapturedWhite.push(botMove.captured);
          } else {
            nextCapturedBlack.push(botMove.captured);
          }
        }

        // Check King capture win
        if (botMove.captured?.type === 'king') {
          setMatch((prev) => ({
            ...prev,
            board: newBoard,
            lastMove: botMove,
            moveHistory: [...prev.moveHistory, botMove],
            capturedWhite: nextCapturedWhite,
            capturedBlack: nextCapturedBlack,
            status: 'win-capture',
            winner: botColor,
            winReason: 'King eliminated by Bot!',
            isBotThinking: false,
          }));
          return;
        }

        // Check if player is checkmated or stalemated
        const playerMoves = getAllLegalMoves(newBoard, playerColor, variant);
        const playerChecked = isKingInCheck(newBoard, playerColor, variant);

        if (playerMoves.length === 0) {
          setMatch((prev) => ({
            ...prev,
            board: newBoard,
            lastMove: botMove,
            moveHistory: [...prev.moveHistory, botMove],
            capturedWhite: nextCapturedWhite,
            capturedBlack: nextCapturedBlack,
            status: playerChecked ? 'checkmate' : 'draw',
            winner: playerChecked ? botColor : 'draw',
            winReason: playerChecked ? 'Checkmate — Bot wins!' : 'Stalemate — Draw',
            inCheck: playerChecked ? playerColor : null,
            isBotThinking: false,
          }));
          return;
        }

        // Normal turn transition back to player
        setMatch((prev) => ({
          ...prev,
          board: newBoard,
          turn: playerColor,
          lastMove: botMove,
          moveHistory: [...prev.moveHistory, botMove],
          capturedWhite: nextCapturedWhite,
          capturedBlack: nextCapturedBlack,
          inCheck: playerChecked ? playerColor : null,
          isBotThinking: false,
        }));
      } catch (err) {
        console.error('[CraftGameMatchView] Error executing bot move:', err);
        setMatch((prev) => ({ ...prev, isBotThinking: false }));
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [turn, status, botColor, board, botLevel, variant, moveHistory, capturedWhite, capturedBlack, playerColor]);

  // Player Square Selection & Move Dispatch
  const handleSelectSquare = (pos: CraftPosition) => {
    if (!isPlayerTurn) return;

    // Check if clicked square is a destination in legal moves
    const candidateMove = legalMoves.find(
      (m) => m.to.x === pos.x && m.to.y === pos.y
    );

    if (candidateMove && selectedPos) {
      // Execute Player Move
      const newBoard = applyMoveToBoard(board, candidateMove);
      const nextCapturedWhite = [...capturedWhite];
      const nextCapturedBlack = [...capturedBlack];
      if (candidateMove.captured) {
        if (candidateMove.captured.color === 'white') {
          nextCapturedWhite.push(candidateMove.captured);
        } else {
          nextCapturedBlack.push(candidateMove.captured);
        }
      }

      setSelectedPos(null);
      setLegalMoves([]);

      // King Capture Win
      if (candidateMove.captured?.type === 'king') {
        setMatch((prev) => ({
          ...prev,
          board: newBoard,
          lastMove: candidateMove,
          moveHistory: [...prev.moveHistory, candidateMove],
          capturedWhite: nextCapturedWhite,
          capturedBlack: nextCapturedBlack,
          status: 'win-capture',
          winner: playerColor,
          winReason: 'Enemy King captured! Decisive Victory!',
        }));
        return;
      }

      // Checkmate or Stalemate on Bot
      const botMoves = getAllLegalMoves(newBoard, botColor, variant);
      const botChecked = isKingInCheck(newBoard, botColor, variant);

      if (botMoves.length === 0) {
        setMatch((prev) => ({
          ...prev,
          board: newBoard,
          lastMove: candidateMove,
          moveHistory: [...prev.moveHistory, candidateMove],
          capturedWhite: nextCapturedWhite,
          capturedBlack: nextCapturedBlack,
          status: botChecked ? 'checkmate' : 'draw',
          winner: botChecked ? playerColor : 'draw',
          winReason: botChecked ? 'Checkmate — Flawless Victory!' : 'Stalemate — Draw',
          inCheck: botChecked ? botColor : null,
        }));
        return;
      }

      // Normal turn handover to Bot
      setMatch((prev) => ({
        ...prev,
        board: newBoard,
        turn: botColor,
        lastMove: candidateMove,
        moveHistory: [...prev.moveHistory, candidateMove],
        capturedWhite: nextCapturedWhite,
        capturedBlack: nextCapturedBlack,
        inCheck: botChecked ? botColor : null,
      }));
      return;
    }

    // Select Player Piece
    const clickedPiece = board[pos.y]?.[pos.x];
    if (clickedPiece && clickedPiece.color === playerColor) {
      const moves = getLegalMovesForSquare(board, pos, variant);
      setSelectedPos(pos);
      setLegalMoves(moves);
    } else {
      setSelectedPos(null);
      setLegalMoves([]);
    }
  };

  // Open Canvas Setup: Cycle piece on click
  const handleSetupSquareClick = (pos: CraftPosition) => {
    if (status !== 'setup') return;
    const playerBackRank = playerColor === 'white' ? variant.height - 1 : 0;
    if (pos.y !== playerBackRank) return;

    const curr = board[pos.y][pos.x];
    if (curr?.type === 'king') return; // Keep king safe

    const currentIdx = curr ? CUSTOMIZABLE_PIECE_TYPES.indexOf(curr.type) : -1;
    const nextIdx = (currentIdx + 1) % CUSTOMIZABLE_PIECE_TYPES.length;
    const nextType = CUSTOMIZABLE_PIECE_TYPES[nextIdx];

    const newBoard = cloneBoard(board);
    newBoard[pos.y][pos.x] = makePiece(nextType, playerColor);
    setMatch((prev) => ({ ...prev, board: newBoard }));
  };

  const handleStartSetupMatch = () => {
    setMatch((prev) => ({ ...prev, status: 'playing' }));
  };

  const handleRestart = () => {
    setSelectedPos(null);
    setLegalMoves([]);
    setMatch({
      ...initialState,
      board: variant.initialBoard(),
      turn: 'white',
      moveHistory: [],
      capturedWhite: [],
      capturedBlack: [],
      status: variant.allowCustomSetup ? 'setup' : 'playing',
      winner: null,
      winReason: null,
      inCheck: null,
      lastMove: undefined,
      isBotThinking: false,
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0a0f] text-white overflow-y-auto select-none">
      {/* Top Header Bar */}
      <header className="shrink-0 h-13 sm:h-14 px-2.5 sm:px-4 bg-[#12121a] border-b-2 border-white/20 flex items-center justify-between z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onExit}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 rounded-lg cursor-pointer transition-colors shrink-0"
            title="Return to Custom Lane Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 truncate">
                {variant.name}
              </span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 bg-white/10 border border-white/20 font-black uppercase shrink-0">
                {variant.badge}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-mono block truncate">
              {variant.width}×{variant.height} GRID • {variant.winCondition}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Bot Level Badge */}
          <span
            className={`text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border flex items-center gap-1 ${
              botLevel === 'punisher'
                ? 'bg-red-950 text-red-300 border-red-500'
                : botLevel === 'tactician'
                ? 'bg-amber-950 text-amber-300 border-amber-500'
                : 'bg-emerald-950 text-emerald-300 border-emerald-500'
            }`}
          >
            <Bot className="w-3 h-3" />
            {botLevel.toUpperCase()} BOT
          </span>

          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg cursor-pointer transition-colors"
            title="Reset Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Playing Area */}
      <div className="flex-1 flex flex-col items-center justify-between p-2 sm:p-4 max-w-4xl mx-auto w-full gap-2 sm:gap-3">
        {/* Opponent (Bot) Card */}
        <div className="w-full max-w-xl flex items-center justify-between p-2 sm:p-2.5 bg-black/60 border-2 border-white/20 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={variant.avatar}
                alt={botLevel}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white">
                  {botLevel.toUpperCase()} BOT
                </span>
                <span className="text-[9px] text-zinc-400 font-mono uppercase">
                  ({botColor})
                </span>
              </div>
              <div className="flex items-center gap-1 h-5 overflow-hidden">
                {botColor === 'white'
                  ? capturedBlack.map((p) => (
                      <div key={p.id} className="w-4 h-4">
                        <CraftGamePiece type={p.type} color="black" />
                      </div>
                    ))
                  : capturedWhite.map((p) => (
                      <div key={p.id} className="w-4 h-4">
                        <CraftGamePiece type={p.type} color="white" />
                      </div>
                    ))}
              </div>
            </div>
          </div>

          <div>
            {isBotThinking ? (
              <span className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" /> Thinking...
              </span>
            ) : turn === botColor && status === 'playing' ? (
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Calculating
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                Waiting
              </span>
            )}
          </div>
        </div>

        {/* Status Alerts (In Check) */}
        {inCheck && status === 'playing' && (
          <div className="w-full max-w-xl py-1 px-3 bg-red-600/90 text-white text-xs font-black uppercase flex items-center justify-center gap-2 rounded-lg border border-red-400 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            {inCheck === playerColor ? 'Warning! Your King is in CHECK!' : 'Bot King is in CHECK!'}
          </div>
        )}

        {/* Central Board */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0 py-2">
          <CraftGameBoard
            board={board}
            selectedPos={selectedPos}
            legalMoves={legalMoves}
            lastMove={lastMove}
            inCheck={inCheck}
            turn={turn}
            playerColor={playerColor}
            isInteractive={isPlayerTurn || status === 'setup'}
            width={variant.width}
            height={variant.height}
            onSelectSquare={
              status === 'setup' ? handleSetupSquareClick : handleSelectSquare
            }
          />
        </div>

        {/* Open Canvas Laboratory Custom Setup Drawer */}
        {status === 'setup' && variant.allowCustomSetup && (
          <div className="w-full max-w-xl p-3 bg-zinc-900/95 border-2 border-amber-400 rounded-xl flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-amber-400 block">
                  🛠️ Back-Rank Officer Laboratory
                </span>
                <span className="text-[10px] text-zinc-400">
                  Click any square on your back rank to cycle officers (Prince, Supreme Rook, Priest, Communist)!
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartSetupMatch}
                className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-lg border border-black cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                Start Match
              </button>
            </div>
          </div>
        )}

        {/* Player Card */}
        <div className="w-full max-w-xl flex items-center justify-between p-2 sm:p-2.5 bg-black/60 border-2 border-white/20 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-400 border border-black flex items-center justify-center text-black font-black shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-black uppercase text-white">
                  YOU
                </span>
                <span className="text-[9px] text-amber-400 font-mono uppercase">
                  ({playerColor})
                </span>
              </div>
              <div className="flex items-center gap-1 h-5 overflow-hidden">
                {playerColor === 'white'
                  ? capturedBlack.map((p) => (
                      <div key={p.id} className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                        <CraftGamePiece type={p.type} color="black" />
                      </div>
                    ))
                  : capturedWhite.map((p) => (
                      <div key={p.id} className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                        <CraftGamePiece type={p.type} color="white" />
                      </div>
                    ))}
              </div>
            </div>
          </div>

          <div>
            {isPlayerTurn ? (
              <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400 flex items-center gap-1">
                Your Turn
              </span>
            ) : status === 'playing' ? (
              <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase">
                Opponent Turn
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase">
                Game Over
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Game Over Modal Banner */}
      {status !== 'playing' && status !== 'setup' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12121a] border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_#ffffff] flex flex-col items-center text-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-black ${
                winner === playerColor
                  ? 'bg-amber-400 text-black'
                  : winner === 'draw'
                  ? 'bg-zinc-700 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {winner === playerColor ? (
                <Trophy className="w-9 h-9" />
              ) : winner === 'draw' ? (
                <RotateCcw className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-black uppercase text-white tracking-wide">
                {winner === playerColor
                  ? '🏆 VICTORY!'
                  : winner === 'draw'
                  ? '🤝 DRAW'
                  : '💀 DEFEAT'}
              </h3>
              <p className="text-xs font-bold text-amber-400 mt-1 uppercase">
                {winReason}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                {moveHistory.length} Total Moves • {variant.name}
              </p>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black cursor-pointer shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={onExit}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase border-2 border-white/20 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
