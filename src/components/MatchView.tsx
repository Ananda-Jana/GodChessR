import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ChessBoard, PIECE_NAMES } from './ChessBoard';
import { DiceRoller } from './DiceRoller';
import { PrinceRulesCard } from './PrinceRulesCard';
import { AvatarDisplay } from './Avatars';
import { ChessPiece } from './ChessPiece';
import {
  PieceColor,
  Position,
  MatchState,
  Move,
  ExpansionSide,
  PieceType,
  DICE_GRACE_WINDOW_MS,
} from '../types/game';
import {
  getCandidateCraftingSquares,
  findKingPosition,
  getCheckmateGrids,
  posToNotation,
} from '../game/engine';
import { CRAFTABLE_MAP } from '../game/craftables';
import {
  ArrowLeft,
  Flag,
  BookOpen,
  Trophy,
  History,
  Shield,
  Layers,
  Crown,
  Clock,
  AlertTriangle,
  Sparkles,
  Sun,
  Moon,
  Hammer,
  Download,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePredictor } from '../predictor/PredictorContext';
import { PredictorPanel } from './PredictorPanel';
import { extractStandardMetrics, observeStandardMove } from '../predictor/adapters/standardAdapter';
import { downloadCardAsPng } from '../predictor/canvasCardRenderer';
import { TrophyRoomModal } from './TrophyRoomModal';
import type { AchievementCard } from '../predictor/types';

const ExpansionModal = React.lazy(() => import('./ExpansionModal'));
const CraftingModal = React.lazy(() => import('./CraftingModal'));

interface MatchViewProps {
  onOpenRules: () => void;
  onExit: () => void;
  overrideMatch?: MatchState;
  customOnRoll?: () => void;
  customOnMove?: (from: Position, to: Position) => void;
  customOnResign?: () => void;
  customOnExpand?: (side: ExpansionSide) => void;
  customOnCraftPlace?: (pieceType: PieceType, position: Position) => void;
  customOnCraftCancel?: () => void;
  isBotMatch?: boolean;
  isBotThinking?: boolean;
}

export const MatchView: React.FC<MatchViewProps> = ({
  onOpenRules,
  onExit,
  overrideMatch,
  customOnRoll,
  customOnMove,
  customOnResign,
  customOnExpand,
  customOnCraftPlace,
  customOnCraftCancel,
  isBotMatch = false,
  isBotThinking = false,
}) => {
  const { user } = useAuth();
  const {
    activeMatch: socketMatch,
    rollDice: socketRoll,
    makeMove: socketMove,
    resignMatch: socketResign,
    expandBoard: socketExpand,
    craftPiece: socketCraft,
    cancelCraft: socketCancelCraft,
  } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const activeMatch = overrideMatch || socketMatch;
  const rollDice = customOnRoll || socketRoll;
  const makeMove = customOnMove || socketMove;
  const resignMatch = customOnResign || socketResign;
  const onExpand = customOnExpand || socketExpand;
  const onCraftPlace = customOnCraftPlace || socketCraft;

  const [craftingSelectedPiece, setCraftingSelectedPiece] = useState<PieceType>('communist');
  const [isPlacingCraftPiece, setIsPlacingCraftPiece] = useState(false);

  const handleCraftCancel = () => {
    setIsPlacingCraftPiece(false);
    if (customOnCraftCancel) {
      customOnCraftCancel();
    } else if (socketCancelCraft) {
      socketCancelCraft();
    }
  };

  // Feature 2: Live Game Message Feed State & Synchronized Refs
  const [moveLogMessages, setMoveLogMessages] = useState<Array<{ text: string; color: 'green' | 'red' }>>([]);
  const feedContainersRef = useRef<(HTMLDivElement | null)[]>([]);
  const lastProcessedMoveIndexRef = useRef<number>(0);
  const currentMatchIdRef = useRef<string>(activeMatch?.id || '');

  const registerFeedContainer = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      if (!feedContainersRef.current.includes(el)) {
        feedContainersRef.current.push(el);
      }
    } else {
      feedContainersRef.current = feedContainersRef.current.filter((c) => c && c.isConnected);
    }
  }, []);

  if (!user || !activeMatch) return null;

  const isWhite = activeMatch.whitePlayer.userId === user.id;
  const myColor: PieceColor = isWhite ? 'white' : 'black';
  const opponent = isWhite ? activeMatch.blackPlayer : activeMatch.whitePlayer;
  const isMyTurn = activeMatch.turn === myColor;
  const isGameOver = activeMatch.status === 'completed';

  const isCheckmate = activeMatch.result?.reason === 'checkmate';
  const defeatedColor =
    activeMatch.result?.winner === 'white'
      ? 'black'
      : activeMatch.result?.winner === 'black'
      ? 'white'
      : null;
  const isPlayerDefeated = defeatedColor === myColor;

  const checkmateGrids = useMemo(() => {
    if (isGameOver && isCheckmate && defeatedColor) {
      return getCheckmateGrids(activeMatch.board, defeatedColor);
    }
    return [];
  }, [activeMatch.board, isGameOver, isCheckmate, defeatedColor]);

  const defeatedKingPos = useMemo(() => {
    if (isGameOver && isCheckmate && defeatedColor) {
      return findKingPosition(activeMatch.board, defeatedColor);
    }
    return null;
  }, [activeMatch.board, isGameOver, isCheckmate, defeatedColor]);

  const [showEndGameNotice, setShowEndGameNotice] = useState(!isCheckmate);

  const { observeMoveAction, finalizeMatch } = usePredictor();
  const [earnedMatchCards, setEarnedMatchCards] = useState<AchievementCard[]>([]);
  const [isMatchTrophyRoomOpen, setIsMatchTrophyRoomOpen] = useState(false);
  const [selectedTrophyCard, setSelectedTrophyCard] = useState<AchievementCard | null>(null);
  const hasFinalizedRef = useRef(false);

  // Real-time predictor move observation
  useEffect(() => {
    if (activeMatch && activeMatch.moveHistory.length > 0) {
      const metrics = extractStandardMetrics(activeMatch, myColor);
      const action = observeStandardMove(activeMatch, myColor);
      if (action) {
        observeMoveAction(action, metrics);
      }
    }
  }, [activeMatch?.moveHistory.length, myColor, activeMatch, observeMoveAction]);

  // Predictor match finalization
  useEffect(() => {
    if (activeMatch && activeMatch.status === 'completed' && activeMatch.result && !hasFinalizedRef.current) {
      hasFinalizedRef.current = true;
      const metrics = extractStandardMetrics(activeMatch, myColor);
      const outcome = activeMatch.result.winner === myColor ? 'win' : activeMatch.result.winner === 'draw' ? 'draw' : 'loss';
      const cards = finalizeMatch(
        activeMatch.id,
        activeMatch.gameMode === 'crafted' ? 'crafted' : 'standard',
        myColor,
        outcome,
        metrics,
        opponent.displayName,
        isBotMatch ? 'grandmaster' : 'pvp_human'
      );
      setEarnedMatchCards(cards);
    }
  }, [activeMatch?.status, activeMatch?.result, activeMatch, myColor, isBotMatch, opponent.displayName, finalizeMatch]);

  useEffect(() => {
    if (isGameOver) {
      if (isCheckmate) {
        // Allow player to see King fall off and inspect red grids on the board first
        const timer = setTimeout(() => {
          setShowEndGameNotice(true);
        }, 1100);
        return () => clearTimeout(timer);
      } else {
        setShowEndGameNotice(true);
      }
    } else {
      setShowEndGameNotice(false);
    }
  }, [isGameOver, isCheckmate]);

  // Last move
  const lastMove =
    activeMatch.moveHistory.length > 0
      ? activeMatch.moveHistory[activeMatch.moveHistory.length - 1]
      : undefined;

  // Synchronize move log messages consecutively from active match moveHistory
  useEffect(() => {
    if (!activeMatch) return;

    if (currentMatchIdRef.current !== activeMatch.id) {
      currentMatchIdRef.current = activeMatch.id;
      lastProcessedMoveIndexRef.current = 0;
      setMoveLogMessages([]);
    }

    const moves = activeMatch.moveHistory;
    if (!moves) return;

    if (moves.length < lastProcessedMoveIndexRef.current) {
      lastProcessedMoveIndexRef.current = 0;
      setMoveLogMessages([]);
    }

    if (moves.length > lastProcessedMoveIndexRef.current) {
      const newItems: Array<{ text: string; color: 'green' | 'red' }> = [];
      for (let i = lastProcessedMoveIndexRef.current; i < moves.length; i++) {
        const m = moves[i];
        const isMyMove = m.piece.color === myColor;
        const playerLabel = isMyMove ? 'You' : (isBotMatch ? 'Bot' : 'Opponent');
        const pieceName = PIECE_NAMES[m.piece.type] || m.piece.type;
        const squareName = posToNotation(m.to).toUpperCase();
        newItems.push({
          text: `${playerLabel} moved ${pieceName} to ${squareName}`,
          color: isMyMove ? 'green' : 'red',
        });
      }
      lastProcessedMoveIndexRef.current = moves.length;
      setMoveLogMessages((prev) => [...prev, ...newItems].slice(-200));
    }
  }, [activeMatch?.id, activeMatch?.moveHistory, myColor, isBotMatch]);

  // Instant snap-to-bottom auto-scroll on new messages
  // Pre-fill last 3 slots with placeholders when fewer than 3 moves have occurred
  const renderedMoveItems = useMemo(() => {
    const list: Array<{ text: string; color: 'green' | 'red' | 'muted' }> = [];
    if (moveLogMessages.length < 3) {
      const placeholdersNeeded = 3 - moveLogMessages.length;
      for (let i = 0; i < placeholdersNeeded; i++) {
        list.push({ text: '· · · awaiting move', color: 'muted' });
      }
      for (const m of moveLogMessages) {
        list.push(m);
      }
    } else {
      for (const m of moveLogMessages) {
        list.push(m);
      }
    }
    return list;
  }, [moveLogMessages]);

  // Ensure scroll position across all mounted feed containers: snap to bottom when moves > 3, keep at top (0) when <= 3
  useEffect(() => {
    feedContainersRef.current = feedContainersRef.current.filter((c) => c && c.isConnected);
    feedContainersRef.current.forEach((el) => {
      if (el) {
        if (moveLogMessages.length > 3) {
          el.scrollTop = el.scrollHeight;
        } else {
          el.scrollTop = 0;
        }
      }
    });
  }, [moveLogMessages, renderedMoveItems]);

  // Authoritative 3-message live feed component
  const renderLiveMoveFeed = (extraClassName?: string) => (
    <div
      className={`w-full flex flex-col gap-1.5 bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-3 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] relative z-20 ${
        extraClassName || ''
      }`}
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-black/15 dark:border-white/15">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black inline-block" />
          Live Move Log
          {isBotMatch && (
            <span className="text-[9px] px-1 py-0.5 bg-amber-400 text-black font-black uppercase border border-black leading-none">
              vs Bot
            </span>
          )}
        </h4>
        <span className="text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400">
          {moveLogMessages.length} {moveLogMessages.length === 1 ? 'move' : 'moves'}
        </span>
      </div>
      <div
        ref={registerFeedContainer}
        className="h-[80px] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col justify-start divide-y divide-black/5 dark:divide-white/5"
      >
        {renderedMoveItems.map((item, idx) => (
          <div
            key={idx}
            className="h-[26px] min-h-[26px] flex items-center px-1 font-mono text-[11px] sm:text-xs font-bold bg-transparent whitespace-nowrap overflow-hidden text-ellipsis"
            style={{
              color:
                item.color === 'green'
                  ? '#22c55e'
                  : item.color === 'red'
                  ? '#ef4444'
                  : undefined,
            }}
          >
            <span
              className={
                item.color === 'green'
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : item.color === 'red'
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-neutral-400 dark:text-neutral-500 select-none'
              }
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Determine if Prince's special 3x1 first move has been consumed
  let princeSpecialUsed = false;
  const currentHeight = activeMatch.board.length;
  const currentWidth = activeMatch.board[0]?.length ?? 8;
  for (let y = 0; y < currentHeight; y++) {
    for (let x = 0; x < currentWidth; x++) {
      const p = activeMatch.board[y][x];
      if (p && p.type === 'prince' && p.color === myColor) {
        princeSpecialUsed = Boolean(p.princeSpecialUsed || p.hasMoved);
      }
    }
  }

  // Candidate crafting squares for home zone deployment
  const candidateSquares = useMemo(() => {
    return getCandidateCraftingSquares(activeMatch.board, myColor, craftingSelectedPiece);
  }, [activeMatch.board, myColor, craftingSelectedPiece]);

  const handleMakeMove = (from: Position, to: Position) => {
    makeMove(from, to);
  };

  const handleConfirmResign = () => {
    resignMatch();
    setShowResignConfirm(false);
  };

  const myPawnsEndRank = isWhite
    ? activeMatch.whitePawnsReachedEndRank
    : activeMatch.blackPawnsReachedEndRank;
  const oppPawnsEndRank = isWhite
    ? activeMatch.blackPawnsReachedEndRank
    : activeMatch.whitePawnsReachedEndRank;

  // Live Clocks (5m or 2m) with 3s dice grace window
  const defaultTime = activeMatch.timeControl || 300;
  const [displayWhiteTime, setDisplayWhiteTime] = useState<number>(activeMatch.whiteTimeRemaining ?? defaultTime);
  const [displayBlackTime, setDisplayBlackTime] = useState<number>(activeMatch.blackTimeRemaining ?? defaultTime);

  useEffect(() => {
    setDisplayWhiteTime(activeMatch.whiteTimeRemaining ?? defaultTime);
    setDisplayBlackTime(activeMatch.blackTimeRemaining ?? defaultTime);
  }, [activeMatch.whiteTimeRemaining, activeMatch.blackTimeRemaining, defaultTime]);

  useEffect(() => {
    if (isGameOver || Boolean(activeMatch.pausedForAction)) return;
    // For bot matches, the authoritative timer in App.tsx decrements whiteTimeRemaining / blackTimeRemaining
    // every second, so we do not subtract elapsed time again here.
    if (isBotMatch) {
      setDisplayWhiteTime(activeMatch.whiteTimeRemaining ?? defaultTime);
      setDisplayBlackTime(activeMatch.blackTimeRemaining ?? defaultTime);
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      const needsDice = activeMatch.diceActive !== false && activeMatch.inCheck !== activeMatch.turn;
      const hasUnrolledDice = !activeMatch.dice || activeMatch.dice.isConsumed;

      let elapsed = 0;
      const graceLimitSec = DICE_GRACE_WINDOW_MS / 1000;
      if (needsDice && hasUnrolledDice) {
        // Player needs to roll dice: grace window is paused
        const rawElapsed = Math.max(0, (now - (activeMatch.lastTurnStartTime || now)) / 1000);
        elapsed = Math.max(0, rawElapsed - graceLimitSec);
      } else if (needsDice && activeMatch.dice && !activeMatch.dice.isConsumed) {
        // Dice was rolled: penalty incurred before roll (if player took > grace window) + elapsed since roll
        const rollTime = activeMatch.dice.rolledAt || activeMatch.lastTurnStartTime || now;
        const preRollElapsed = Math.max(0, (rollTime - (activeMatch.lastTurnStartTime || now)) / 1000);
        const preRollPenalty = Math.max(0, preRollElapsed - graceLimitSec);
        const postRollElapsed = Math.max(0, (now - rollTime) / 1000);
        elapsed = preRollPenalty + postRollElapsed;
      } else {
        // Standard chess move (dice disabled after 3 captures or King in check)
        elapsed = Math.max(0, (now - (activeMatch.lastTurnStartTime || now)) / 1000);
      }

      if (activeMatch.turn === 'white') {
        const remaining = Math.max(0, (activeMatch.whiteTimeRemaining ?? defaultTime) - elapsed);
        setDisplayWhiteTime(remaining);
      } else {
        const remaining = Math.max(0, (activeMatch.blackTimeRemaining ?? defaultTime) - elapsed);
        setDisplayBlackTime(remaining);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [
    isGameOver,
    activeMatch.pausedForAction,
    activeMatch.turn,
    activeMatch.lastTurnStartTime,
    activeMatch.whiteTimeRemaining,
    activeMatch.blackTimeRemaining,
    activeMatch.dice,
    activeMatch.diceActive,
    activeMatch.inCheck,
    defaultTime,
  ]);

  function formatClock(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  }

  // Active Pieces Count & 7-Piece Advantage Tracker
  let whitePiecesCount = 0;
  let blackPiecesCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = activeMatch.board[r][c];
      if (p) {
        if (p.color === 'white') whitePiecesCount++;
        else if (p.color === 'black') blackPiecesCount++;
      }
    }
  }
  const pieceDiff = Math.abs(whitePiecesCount - blackPiecesCount);
  const hasMajorPieceAdvantage = pieceDiff > 7;
  const pieceLeader: PieceColor | null =
    hasMajorPieceAdvantage ? (whitePiecesCount > blackPiecesCount ? 'white' : 'black') : null;

  // Bot Match: Human piece lead rule (>= 3 pieces to win on timeout)
  const myPiecesCount = myColor === 'white' ? whitePiecesCount : blackPiecesCount;
  const opponentPiecesCount = myColor === 'white' ? blackPiecesCount : whitePiecesCount;
  const humanPieceLead = myPiecesCount - opponentPiecesCount;
  const hasBotPieceAdvantage = isBotMatch ? humanPieceLead >= 3 : hasMajorPieceAdvantage;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans">
      {/* Top Header HUD */}
      <header className="px-4 sm:px-6 py-3 border-b-4 border-black dark:border-white bg-white dark:bg-[#0a0a0c] sticky top-0 z-40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-1.5 border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="border border-black dark:border-white p-0.5 bg-neutral-100 dark:bg-neutral-900">
              <AvatarDisplay avatarId={opponent.avatarId} size="sm" />
            </div>
            <div>
              <span className="text-xs font-black uppercase block">vs {opponent.displayName}</span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                {isWhite ? 'White' : 'Black'}
              </span>
            </div>
          </div>
        </div>

        {/* Clocks & Turn HUD Banner */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* White Clock Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-black border-2 border-black dark:border-white transition-all ${
              activeMatch.turn === 'white' && !isGameOver
                ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-neutral-100 dark:bg-[#141416]'
            } ${
              displayWhiteTime <= 10 && !isGameOver && activeMatch.turn === 'white'
                ? 'bg-red-500 text-white animate-pulse'
                : ''
            }`}
            title="White Clock"
          >
            <span className="w-2.5 h-2.5 bg-white border border-black" />
            <span>{formatClock(displayWhiteTime)}</span>
          </div>

          {/* Turn Banner */}
          {!isGameOver ? (
            <div
              className={`px-3 py-1 border-2 border-black dark:border-white text-xs font-black uppercase flex items-center gap-2 ${
                isMyTurn
                  ? 'bg-amber-400 text-black animate-pulse shadow-[2px_2px_0px_#000]'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div
                className={`w-2 h-2 ${
                  activeMatch.turn === 'white' ? 'bg-white border border-black' : 'bg-black border border-white'
                }`}
              />
              <span className="hidden sm:inline">
                {isMyTurn
                  ? (activeMatch.diceActive === false ? 'Your Turn (Normal Chess)' : 'Your Turn')
                  : isBotThinking
                  ? 'Bot Thinking...'
                  : `${activeMatch.turn === 'white' ? 'White' : 'Black'}’s Turn`}
              </span>
            </div>
          ) : (
            <span className="px-3 py-1 border-2 border-black dark:border-white text-xs font-black uppercase bg-purple-500 text-white">
              Completed
            </span>
          )}

          {/* Black Clock Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-black border-2 border-black dark:border-white transition-all ${
              activeMatch.turn === 'black' && !isGameOver
                ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-neutral-100 dark:bg-[#141416]'
            } ${
              displayBlackTime <= 10 && !isGameOver && activeMatch.turn === 'black'
                ? 'bg-red-500 text-white animate-pulse'
                : ''
            }`}
            title="Black Clock"
          >
            <span className="w-2.5 h-2.5 bg-black border border-white" />
            <span>{formatClock(displayBlackTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:px-2.5 sm:py-1.5 border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black dark:hover:text-black text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_var(--shadow)]"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Board`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-black" />
            )}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light Board' : 'Dark Board'}</span>
          </button>

          <button
            onClick={onOpenRules}
            className="p-1.5 sm:px-2.5 sm:py-1.5 border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black dark:hover:text-black text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_var(--shadow)]"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {!isGameOver && (
            <button
              onClick={() => setShowResignConfirm(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 border-2 border-black dark:border-white bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_var(--shadow)]"
            >
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Resign</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Arena Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop 3 cols) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
          {/* Match Timer & Piece Advantage Status Card */}
          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Clocks ({activeMatch.timeControl === 120 ? '2m' : '5m'})
              </h4>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                {isBotMatch ? '≥3 rule active' : '>7 rule active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div
                className={`p-2 border-2 border-black dark:border-white ${
                  activeMatch.turn === 'white' && !isGameOver ? 'bg-amber-400 text-black' : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="w-2 h-2 bg-white border border-black" />
                  <span className="text-[10px] font-black uppercase">White</span>
                </div>
                <span className="text-lg font-mono font-black block">
                  {formatClock(displayWhiteTime)}
                </span>
                <span className="text-[10px] font-bold uppercase block mt-0.5">
                  {whitePiecesCount} pieces
                </span>
              </div>

              <div
                className={`p-2 border-2 border-black dark:border-white ${
                  activeMatch.turn === 'black' && !isGameOver ? 'bg-amber-400 text-black' : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="w-2 h-2 bg-black border border-white" />
                  <span className="text-[10px] font-black uppercase">Black</span>
                </div>
                <span className="text-lg font-mono font-black block">
                  {formatClock(displayBlackTime)}
                </span>
                <span className="text-[10px] font-bold uppercase block mt-0.5">
                  {blackPiecesCount} pieces
                </span>
              </div>
            </div>

            {/* Piece count difference info */}
            <div className="pt-2 border-t-2 border-black dark:border-white">
              <div className="flex items-center justify-between text-xs mb-1 font-bold">
                <span className="uppercase">{isBotMatch ? 'Human Piece Lead:' : 'Piece Diff:'}</span>
                <span className="font-mono font-black">
                  {isBotMatch
                    ? `${humanPieceLead >= 0 ? '+' : ''}${humanPieceLead} (needs ≥ 3)`
                    : `${pieceDiff} ${hasMajorPieceAdvantage ? '(> 7)' : '(≤ 7)'}`}
                </span>
              </div>
              {isBotMatch ? (
                hasBotPieceAdvantage ? (
                  <div className="p-2 bg-amber-400 text-black border-2 border-black text-[11px] font-bold leading-tight flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>You lead by {humanPieceLead} pieces (≥3).</strong>{' '}
                      Timeout awards win to you!
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-neutral-500 font-bold uppercase leading-tight">
                    * If your timer expires, you lose unless you lead by ≥ 3 pieces (current lead: {humanPieceLead}).
                  </p>
                )
              ) : hasMajorPieceAdvantage ? (
                <div className="p-2 bg-amber-400 text-black border-2 border-black text-[11px] font-bold leading-tight flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>{pieceLeader === 'white' ? 'White' : 'Black'} leads by {pieceDiff} pieces (&gt;7).</strong>{' '}
                    Timeout awards win to leader!
                  </span>
                </div>
              ) : (
                <p className="text-[10px] text-neutral-500 font-bold uppercase leading-tight">
                  * If timer expires, timed-out player loses.
                </p>
              )}
            </div>
          </div>

          {/* Pawn Draw Target Tracker */}
          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff]">
            <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-500" />
              2-Pawn Draw Target
            </h4>
            <div className="space-y-1.5 text-xs font-bold">
              <div className="flex items-center justify-between">
                <span>Your Pawns:</span>
                <span className="font-mono font-black text-amber-500">{myPawnsEndRank} / 2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Opponent Pawns:</span>
                <span className="font-mono text-neutral-500">{oppPawnsEndRank} / 2</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white h-3">
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${(myPawnsEndRank / 2) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Captured Pieces Bar */}
          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" />
                Captures
              </h4>
              <span className="text-[10px] font-mono font-black uppercase text-amber-500">
                {activeMatch.diceActive === false
                  ? 'Normal Chess'
                  : `${Math.max(0, 3 - ((activeMatch.capturedByWhite?.length || 0) + (activeMatch.capturedByBlack?.length || 0)))} left`}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">By White:</span>
                <div className="flex flex-wrap gap-1 min-h-[22px]">
                  {activeMatch.capturedByWhite.map((p, i) => (
                    <div key={i} className="w-5 h-5">
                      <ChessPiece type={p.type} color="black" theme={activeMatch.pieceTheme || 'classic'} />
                    </div>
                  ))}
                  {activeMatch.capturedByWhite.length === 0 && (
                    <span className="text-[10px] font-mono text-neutral-400">None</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">By Black:</span>
                <div className="flex flex-wrap gap-1 min-h-[22px]">
                  {activeMatch.capturedByBlack.map((p, i) => (
                    <div key={i} className="w-5 h-5">
                      <ChessPiece type={p.type} color="white" theme={activeMatch.pieceTheme || 'classic'} />
                    </div>
                  ))}
                  {activeMatch.capturedByBlack.length === 0 && (
                    <span className="text-[10px] font-mono text-neutral-400">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Move History */}
          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] flex flex-col max-h-[300px]">
            <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-500" />
              History ({activeMatch.moveHistory.length})
            </h4>
            <div className="overflow-y-auto flex-1 divide-y divide-black/20 dark:divide-white/20 text-xs font-mono pr-1">
              {activeMatch.moveHistory.map((m, idx) => (
                <div key={idx} className="py-1 flex items-center justify-between">
                  <span className="text-neutral-500 w-6">#{idx + 1}</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">{m.san}</span>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {activeMatch.moveHistory.length === 0 && (
                <div className="py-3 text-center text-neutral-500 text-[10px] uppercase font-bold">
                  No moves yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column: The 8x8 Chessboard */}
        <div className="col-span-1 md:col-span-7 lg:col-span-5 flex flex-col items-center gap-4">
          {/* Mobile 3-Message Live Move Log Feed (Always visible above the board on mobile screens) */}
          <div className="md:hidden w-full">
            {renderLiveMoveFeed()}
          </div>

          {/* Mobile compact banner */}
          <div className="flex lg:hidden w-full flex-col gap-1 bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-2.5 text-xs font-bold">
            <div className="flex items-center justify-between">
              <span className="uppercase text-neutral-500">2-Pawn Draw:</span>
              <span className="font-mono font-black text-amber-500">
                You: {myPawnsEndRank}/2 · Opp: {oppPawnsEndRank}/2
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-black/20 dark:border-white/20 text-[11px]">
              <span>
                Pieces: {whitePiecesCount}W vs {blackPiecesCount}B (Diff: {pieceDiff})
              </span>
              {isBotMatch ? (
                hasBotPieceAdvantage && (
                  <span className="text-amber-500 font-black uppercase flex items-center gap-1">
                    ≥3 Rule (You lead by {humanPieceLead})
                  </span>
                )
              ) : (
                hasMajorPieceAdvantage && (
                  <span className="text-amber-500 font-black uppercase flex items-center gap-1">
                    &gt;7 Rule ({pieceLeader === 'white' ? 'White' : 'Black'} leads)
                  </span>
                )
              )}
            </div>
          </div>

          {/* PART B: Locked Crafting Warning Banner directly above board */}
          {activeMatch.craftingAllowed !== false && activeMatch.craftingLocked?.[myColor] && !isGameOver && (
            <div className="w-full bg-amber-500/15 dark:bg-amber-400/10 border-2 border-amber-500/60 rounded-xl p-3 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in duration-200 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="text-base select-none">⚡</span>
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  Craft ready: resolve the check first
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                Check Active
              </span>
            </div>
          )}

          {/* Crafting Deployment Placement Banner */}
          {isPlacingCraftPiece && (
            <div className="w-full bg-red-600 text-white p-2.5 sm:p-3 border-3 border-black shadow-[4px_4px_0px_#000] flex items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    Deploying {CRAFTABLE_MAP[craftingSelectedPiece]?.name}:
                  </span>
                  <span className="text-[11px] font-mono opacity-90 block">
                    Click any highlighted safe square in your home zone (yellow/orange ring). Unsafe squares are hashed red.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlacingCraftPiece(false)}
                  className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] font-black uppercase tracking-wider border border-white cursor-pointer flex-shrink-0"
                >
                  Change Piece
                </button>
                <button
                  onClick={handleCraftCancel}
                  className="px-2.5 py-1 bg-neutral-900 text-white hover:bg-black text-[10px] font-black uppercase tracking-wider border border-red-300 cursor-pointer flex-shrink-0"
                >
                  Cancel Crafting
                </button>
              </div>
            </div>
          )}

          {/* Game Over Banner OUTSIDE the board - Board remains 100% visible and accessible */}
          {isGameOver && activeMatch.result && showEndGameNotice && (
            <div
              className={`w-full p-4 border-4 border-black dark:border-white shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-3 duration-300 ${
                isPlayerDefeated
                  ? 'bg-red-600 text-white'
                  : activeMatch.result.winner === 'draw'
                  ? 'bg-amber-400 text-black'
                  : 'bg-emerald-500 text-black'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-black text-white flex items-center justify-center border-2 border-white shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                    {activeMatch.result.winner === 'draw' ? (
                      <Crown className="w-6 h-6 text-amber-400" />
                    ) : isPlayerDefeated ? (
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    ) : (
                      <Trophy className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                      {activeMatch.result.winner === 'draw'
                        ? 'Game Drawn!'
                        : isPlayerDefeated
                        ? 'YOU ARE DEFEATED!'
                        : 'VICTORY!'}
                    </h3>
                    <p className="text-xs font-black uppercase opacity-95">
                      {activeMatch.result.reason === 'checkmate' &&
                        (isPlayerDefeated
                          ? 'Defeated by Checkmate! (Red squares highlight mating attack · King toppled)'
                          : 'Checkmate Victory! (Red squares highlight mating attack · King toppled)')}
                      {activeMatch.result.reason === 'two_pawns_end_rank_draw' &&
                        'Draw: Two Pawns reached opponent’s end rank!'}
                      {activeMatch.result.reason === 'resignation' &&
                        (isPlayerDefeated ? 'You Resigned.' : 'Opponent Resigned.')}
                      {activeMatch.result.reason === 'stalemate' && 'Game ended in Stalemate.'}
                      {activeMatch.result.reason === 'timeout' && 'Game won on Time (Timeout).'}
                      {activeMatch.result.reason === 'timeout_piece_advantage' &&
                        (isBotMatch
                          ? 'Victory by Timeout with 3+ Piece Advantage!'
                          : 'Victory by Timeout with 7+ Piece Advantage!')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsMatchTrophyRoomOpen(true)}
                    className="w-full sm:w-auto py-2 px-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4 text-black" />
                    Trophy Room
                  </button>
                  <button
                    onClick={onExit}
                    className="w-full sm:w-auto py-2 px-4 bg-black hover:bg-neutral-900 text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-white shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>

              {earnedMatchCards.length > 0 && (
                <div className="mt-2 pt-2 border-t border-black/20 dark:border-white/20">
                  <div className="text-[11px] font-black uppercase text-black dark:text-white mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Earned Achievement Badges (Click badge to inspect & download)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {earnedMatchCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => {
                          setSelectedTrophyCard(card);
                          setIsMatchTrophyRoomOpen(true);
                        }}
                        className="p-2 bg-black/70 hover:bg-black border-2 border-amber-400 cursor-pointer flex items-center gap-2 shadow-[2px_2px_0px_#000] hover:scale-105 transition-all"
                      >
                        <span className="text-xl">{card.motifSymbol}</span>
                        <div>
                          <div className="font-extrabold text-xs text-white uppercase">{card.title}</div>
                          <div className="text-[10px] text-amber-300 font-mono">Rating: {card.predictedRating}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMatch.result.explanation && (
                <p className="text-[11px] font-bold border-t border-black/20 dark:border-white/20 pt-1.5 opacity-90 font-mono">
                  {activeMatch.result.explanation}
                </p>
              )}
            </div>
          )}

          <ChessBoard
            board={activeMatch.board}
            turn={activeMatch.turn}
            myColor={myColor}
            dice={activeMatch.dice}
            lastMove={lastMove}
            inCheck={activeMatch.inCheck}
            isInteractive={!isGameOver && !Boolean(activeMatch.pausedForAction) && !isPlacingCraftPiece}
            onMove={handleMakeMove}
            flipped={!isWhite}
            showMoveSuggestions={activeMatch.moveSuggestions !== 'excluded'}
            diceActive={activeMatch.diceActive ?? true}
            craftingPlacementMode={isPlacingCraftPiece}
            craftCandidateSquares={candidateSquares.validSquares}
            craftAttackedSquares={candidateSquares.attackedSquares}
            onSelectCraftSquare={(pos) => {
              onCraftPlace(craftingSelectedPiece, pos);
              setIsPlacingCraftPiece(false);
            }}
            checkmateGrids={checkmateGrids}
            defeatedKingPos={defeatedKingPos}
            pieceTheme={activeMatch.pieceTheme || 'classic'}
          />
        </div>

        {/* Right Column: Predictor, Move Log, Dice Roller & Prince Rules Panel */}
        <div className="col-span-1 md:col-span-5 lg:col-span-4 flex flex-col gap-4">
          {/* Universal Live Skill Predictor Side Panel */}
          <PredictorPanel
            metrics={extractStandardMetrics(activeMatch, myColor)}
            modeLabel={activeMatch.gameMode === 'crafted' ? 'Crafted Chess' : 'Standard Chess'}
          />
          {/* Permanent 3-Message Live Game Message Feed Panel (Always visible directly above dice roller on all devices) */}
          {renderLiveMoveFeed()}

          {activeMatch.diceActive !== false ? (
            <DiceRoller
              dice={activeMatch.dice}
              isMyTurn={isMyTurn}
              myColor={myColor}
              onRoll={rollDice}
              disabled={isGameOver}
              isInCheck={activeMatch.inCheck === myColor}
              turnStartTime={activeMatch.lastTurnStartTime}
            />
          ) : (
            <div className="bg-amber-400 text-black border-4 border-black p-4 flex flex-col items-center text-center gap-2 shadow-[4px_4px_0px_#000]">
              <div className="w-10 h-10 bg-black text-amber-400 flex items-center justify-center border-2 border-black font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase">
                  Dice Removed — Normal Chess Begins
                </h4>
                <p className="text-xs font-bold leading-tight">
                  3 captures reached! Dice and category limitations are permanently disabled. Any legal move is valid.
                </p>
              </div>
            </div>
          )}

          {/* Match Settings Info Badge */}
          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-3 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] text-xs font-bold flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase text-neutral-500">Match Rules:</span>
            <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
              <span className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 border border-black dark:border-white">
                ⏱️ {activeMatch.timeControl === 120 ? '2m' : '5m'}
              </span>
              <span className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 border border-black dark:border-white">
                💡 {activeMatch.moveSuggestions === 'excluded' ? 'No Hints' : 'Hints'}
              </span>
              {activeMatch.craftingAllowed !== false && (
                <span className="px-1.5 py-0.5 bg-amber-400 text-black font-black border border-black dark:border-white">
                  🔨 Crafting On
                </span>
              )}
            </div>
          </div>

          {/* Persistent Prince Rules Explanation Panel */}
          <PrinceRulesCard
            myColor={myColor}
            princeSpecialUsed={princeSpecialUsed}
          />
        </div>
      </main>

      {/* Resign Confirmation Modal */}
      {showResignConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none">
          <div className="bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white p-6 max-w-sm w-full shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] text-black dark:text-white flex flex-col gap-4">
            <h3 className="text-base font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Resign Game?
            </h3>
            <p className="text-xs font-bold leading-relaxed">
              Are you sure you want to resign? Your opponent will be awarded the victory.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleConfirmResign}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-500 font-black text-xs uppercase text-white border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Yes, Resign
              </button>
              <button
                onClick={() => setShowResignConfirm(false)}
                className="py-2.5 px-4 bg-neutral-200 dark:bg-neutral-800 font-black text-xs uppercase border-2 border-black dark:border-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Mechanic 1: Board Expansion Modal */}
      {activeMatch.pausedForAction?.type === 'expansion' &&
        activeMatch.pausedForAction.player === myColor && (
          <React.Suspense fallback={null}>
            <ExpansionModal
              playerColor={myColor}
              boardWidth={activeMatch.boardWidth ?? activeMatch.board[0]?.length ?? 8}
              boardHeight={activeMatch.boardHeight ?? activeMatch.board?.length ?? 8}
              expiresAt={activeMatch.pausedForAction.expiresAt}
              onExpand={(side) => onExpand(side)}
            />
          </React.Suspense>
        )}

      {/* Mechanic 2: Crafting Modal */}
      {activeMatch.craftingAllowed !== false &&
        activeMatch.pausedForAction?.type === 'crafting' &&
        activeMatch.pausedForAction.player === myColor &&
        !isPlacingCraftPiece && (
          <React.Suspense fallback={null}>
            <CraftingModal
              playerColor={myColor}
              expiresAt={activeMatch.pausedForAction.expiresAt}
              hasValidSquares={candidateSquares.validSquares.length > 0}
              onConfirmPiece={(pieceType) => {
                setCraftingSelectedPiece(pieceType);
                setIsPlacingCraftPiece(true);
              }}
              onCancel={handleCraftCancel}
              onAutoPick={() => {
                if (candidateSquares.validSquares.length > 0) {
                  onCraftPlace('communist', candidateSquares.validSquares[0]);
                } else {
                  handleCraftCancel();
                }
              }}
            />
          </React.Suspense>
        )}

      <TrophyRoomModal
        isOpen={isMatchTrophyRoomOpen}
        onClose={() => setIsMatchTrophyRoomOpen(false)}
        initialSelectedCard={selectedTrophyCard}
      />
    </div>
  );
};
