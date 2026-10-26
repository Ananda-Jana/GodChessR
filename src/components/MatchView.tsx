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
import { reportGameEnd } from '../chest/reportGameEnd';
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
  Maximize2,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePredictor } from '../predictor/PredictorContext';
import { PredictorPanel } from './PredictorPanel';
import { extractStandardMetrics, observeStandardMove } from '../predictor/adapters/standardAdapter';
import { TrophyRoomModal } from './TrophyRoomModal';
import type { AchievementCard } from '../predictor/types';
import { LiveAnnouncer } from './LiveAnnouncer';
import { useModalFocus } from '../utils/useModalFocus';
import { ObserverBot } from '../punisher/ObserverBot';
import { PunisherBotId } from '../punisher/punisherBot';

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
  activePunisherBotId?: PunisherBotId | null;
}

export const MatchView: React.FC<MatchViewProps> = (props) => {
  const { user } = useAuth();
  const { activeMatch: socketMatch } = useSocket();
  const resolvedMatch = props.overrideMatch || socketMatch;

  if (!user || !resolvedMatch) return null;

  return <MatchViewContent {...props} user={user} activeMatch={resolvedMatch} />;
};

interface MatchViewContentProps extends MatchViewProps {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  activeMatch: MatchState;
}

const MatchViewContent: React.FC<MatchViewContentProps> = ({
  onOpenRules,
  onExit,
  customOnRoll,
  customOnMove,
  customOnResign,
  customOnExpand,
  customOnCraftPlace,
  customOnCraftCancel,
  isBotMatch = false,
  isBotThinking = false,
  activePunisherBotId = null,
  user,
  activeMatch,
}) => {
  const {
    rollDice: socketRoll,
    makeMove: socketMove,
    resignMatch: socketResign,
    expandBoard: socketExpand,
    craftPiece: socketCraft,
    cancelCraft: socketCancelCraft,
  } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const resignModalRef = useModalFocus(showResignConfirm, () => setShowResignConfirm(false), false);

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

  // Responsive viewport tracker (< 768px mobile vs >= 768px desktop)
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const handleMq = () => setIsMobileViewport(mq.matches);
    handleMq();
    mq.addEventListener('change', handleMq);
    return () => mq.removeEventListener('change', handleMq);
  }, []);



  // Mobile Collapsible Bottom Sheet State (Collapsed by default)
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<'log' | 'info'>('log');
  const [mobileGameOverMinimized, setMobileGameOverMinimized] = useState(false);

  const logBtnRef = useRef<HTMLButtonElement>(null);
  const infoBtnRef = useRef<HTMLButtonElement>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const sheetCloseBtnRef = useRef<HTMLButtonElement>(null);
  const lastSheetTriggerRef = useRef<'log' | 'info'>('log');
  const touchStartYRef = useRef<number | null>(null);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
    requestAnimationFrame(() => {
      if (lastSheetTriggerRef.current === 'info' && infoBtnRef.current) {
        infoBtnRef.current.focus();
      } else {
        logBtnRef.current?.focus();
      }
    });
  }, []);

  // Focus trap + Escape handling for Mobile Bottom Sheet
  useEffect(() => {
    if (!isSheetOpen || !isMobileViewport) return;

    requestAnimationFrame(() => {
      sheetCloseBtnRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSheet();
        return;
      }
      if (e.key === 'Tab' && sheetContainerRef.current) {
        const focusable = sheetContainerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSheetOpen, isMobileViewport, closeSheet]);

  // Live Game Message Feed State & Scroll-Aware Refs
  const [moveLogMessages, setMoveLogMessages] = useState<
    Array<{ text: string; actor: string; san: string; isMine: boolean; timestamp: number }>
  >([]);
  const lastProcessedMoveIndexRef = useRef<number>(0);
  const currentMatchIdRef = useRef<string>(activeMatch?.id || '');

  const desktopHistoryRef = useRef<HTMLDivElement | null>(null);
  const desktopLogRef = useRef<HTMLDivElement | null>(null);
  const desktopLogScrolledUpRef = useRef(false);

  const mobileSheetLogRef = useRef<HTMLDivElement | null>(null);
  const mobileSheetScrolledUpRef = useRef(false);

  const isWhite = activeMatch.whitePlayer.userId === user.id;
  const myColor: PieceColor = isWhite ? 'white' : 'black';
  const opponent = isWhite ? activeMatch.blackPlayer : activeMatch.whitePlayer;
  const isMyTurn = activeMatch.turn === myColor;
  const isGameOver = activeMatch.status === 'completed';
  const isDicePhaseActive = activeMatch.diceActive !== false;

  const [shouldShake, setShouldShake] = useState(false);
  const totalCapturesCount =
    (activeMatch.capturedByWhite?.length || 0) + (activeMatch.capturedByBlack?.length || 0);
  const prevCapturesCountRef = useRef(totalCapturesCount);

  useEffect(() => {
    setMobileGameOverMinimized(false);
  }, [activeMatch.id, isGameOver]);

  // Trigger board shake on capture (respects prefers-reduced-motion via CSS)
  useEffect(() => {
    if (totalCapturesCount > prevCapturesCountRef.current) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 400);
      prevCapturesCountRef.current = totalCapturesCount;
      return () => clearTimeout(timer);
    }
    prevCapturesCountRef.current = totalCapturesCount;
  }, [totalCapturesCount]);

  // ARIA Live Announcements: polite for moves/turns/phase, assertive for check/checkmate
  const [politeAnnouncement, setPoliteAnnouncement] = useState('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState('');
  const lastMoveLenRef = useRef(activeMatch.moveHistory.length);
  const lastInCheckRef = useRef(activeMatch.inCheck);
  const lastDiceActiveRef = useRef(isDicePhaseActive);

  useEffect(() => {
    if (isGameOver && activeMatch.result) {
      const winner = activeMatch.result.winner;
      const reason = (activeMatch.result.reason || 'completion').replace(/_/g, ' ');
      setAssertiveAnnouncement(
        `Game over. ${winner === 'draw' ? 'Draw' : `${winner} wins`} by ${reason}.`
      );
      return;
    }

    if (activeMatch.inCheck && activeMatch.inCheck !== lastInCheckRef.current) {
      setAssertiveAnnouncement(
        `Check! ${activeMatch.inCheck === 'white' ? 'White' : 'Black'} King is under attack.`
      );
      lastInCheckRef.current = activeMatch.inCheck;
    } else if (!activeMatch.inCheck) {
      lastInCheckRef.current = null;
    }

    if (activeMatch.moveHistory.length > lastMoveLenRef.current) {
      const latest = activeMatch.moveHistory[activeMatch.moveHistory.length - 1];
      if (latest) {
        const who = latest.piece.color === myColor ? 'You' : isBotMatch ? 'Bot' : 'Opponent';
        const pieceLabel = PIECE_NAMES[latest.piece.type] || latest.piece.type;
        const sq = posToNotation(latest.to).toUpperCase();
        const nextTurnLabel = activeMatch.turn === 'white' ? "White's turn" : "Black's turn";
        const phaseNote =
          lastDiceActiveRef.current && !isDicePhaseActive
            ? ' Normal chess — dice phase over.'
            : '';
        setPoliteAnnouncement(`${who} moved ${pieceLabel} to ${sq}. ${nextTurnLabel}.${phaseNote}`);
      }
      lastMoveLenRef.current = activeMatch.moveHistory.length;
    } else if (activeMatch.moveHistory.length < lastMoveLenRef.current) {
      lastMoveLenRef.current = activeMatch.moveHistory.length;
    }

    lastDiceActiveRef.current = isDicePhaseActive;
  }, [
    activeMatch.moveHistory,
    activeMatch.turn,
    activeMatch.inCheck,
    isDicePhaseActive,
    isGameOver,
    activeMatch.result,
    myColor,
    isBotMatch,
  ]);

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

  const { observeMoveAction, finalizeMatch, latestMatchCards } = usePredictor();
  const [earnedMatchCards, setEarnedMatchCards] = useState<AchievementCard[]>([]);
  const displayMatchCards = earnedMatchCards.length > 0 ? earnedMatchCards : latestMatchCards;
  const [isMatchTrophyRoomOpen, setIsMatchTrophyRoomOpen] = useState(false);
  const [selectedTrophyCard, setSelectedTrophyCard] = useState<AchievementCard | null>(null);
  const hasFinalizedRef = useRef(false);

  const standardMetrics = useMemo(
    () => extractStandardMetrics(activeMatch, myColor),
    [activeMatch, myColor]
  );

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
      const outcome =
        activeMatch.result.winner === myColor
          ? 'win'
          : activeMatch.result.winner === 'draw'
          ? 'draw'
          : 'loss';
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
      try {
        const mode = activePunisherBotId ? 'punisher' : !isBotMatch ? 'multiplayer' : activeMatch.gameMode === 'crafted' ? 'crafted' : 'standard';
        const myMoves = activeMatch.moveHistory.filter((m) => m.piece.color === myColor).length;
        const isResigned = activeMatch.result?.reason === 'resignation' && activeMatch.result.winner !== myColor;
        reportGameEnd({ matchId: activeMatch.id, mode, result: outcome, moves: myMoves, isTraining: false, userId: user.id, resigned: isResigned });
      } catch {}
    }
  }, [
    activeMatch?.status,
    activeMatch?.result,
    activeMatch,
    myColor,
    isBotMatch,
    opponent.displayName,
    finalizeMatch,
  ]);

  useEffect(() => {
    if (isGameOver) {
      if (isCheckmate) {
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

  const lastMove =
    activeMatch.moveHistory.length > 0
      ? activeMatch.moveHistory[activeMatch.moveHistory.length - 1]
      : undefined;

  // Synchronize move log messages consecutively from activeMatch.moveHistory
  useEffect(() => {
    if (!activeMatch) return;

    if (currentMatchIdRef.current !== activeMatch.id) {
      currentMatchIdRef.current = activeMatch.id;
      lastProcessedMoveIndexRef.current = 0;
      desktopLogScrolledUpRef.current = false;
      mobileSheetScrolledUpRef.current = false;
      setMoveLogMessages([]);
    }

    const moves = activeMatch.moveHistory;
    if (!moves) return;

    if (moves.length < lastProcessedMoveIndexRef.current) {
      lastProcessedMoveIndexRef.current = 0;
      setMoveLogMessages([]);
    }

    if (moves.length > lastProcessedMoveIndexRef.current) {
      const newItems: Array<{
        text: string;
        actor: string;
        san: string;
        isMine: boolean;
        timestamp: number;
      }> = [];
      for (let i = lastProcessedMoveIndexRef.current; i < moves.length; i++) {
        const m = moves[i];
        const isMyMove = m.piece.color === myColor;
        const playerLabel = isMyMove ? 'YOU' : isBotMatch ? 'BOT' : 'OPP';
        const pieceName = PIECE_NAMES[m.piece.type] || m.piece.type;
        const squareName = posToNotation(m.to).toUpperCase();
        newItems.push({
          text: `${isMyMove ? 'You' : isBotMatch ? 'Bot' : 'Opponent'} moved ${pieceName} to ${squareName}`,
          actor: playerLabel,
          san: m.san || `${pieceName[0]}${posToNotation(m.from)}→${posToNotation(m.to)}`,
          isMine: isMyMove,
          timestamp: m.timestamp,
        });
      }
      lastProcessedMoveIndexRef.current = moves.length;
      setMoveLogMessages((prev) => [...prev, ...newItems].slice(-200));
    }
  }, [activeMatch?.id, activeMatch?.moveHistory, myColor, isBotMatch]);

  // Auto-scroll desktop left-column move history
  useEffect(() => {
    if (desktopHistoryRef.current) {
      desktopHistoryRef.current.scrollTop = desktopHistoryRef.current.scrollHeight;
    }
  }, [activeMatch?.moveHistory.length]);

  // Auto-scroll desktop live move log unless user scrolled up
  useEffect(() => {
    const el = desktopLogRef.current;
    if (el && !desktopLogScrolledUpRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [moveLogMessages]);

  // Auto-scroll mobile sheet move log unless user scrolled up
  useEffect(() => {
    if (!isSheetOpen || sheetTab !== 'log') return;
    const el = mobileSheetLogRef.current;
    if (el && !mobileSheetScrolledUpRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [moveLogMessages, isSheetOpen, sheetTab]);

  // Board dimensions, Prince status, and active piece counts
  const currentHeight = activeMatch.board.length;
  const currentWidth = activeMatch.board[0]?.length ?? 8;

  let princeSpecialUsed = false;
  let whitePiecesCount = 0;
  let blackPiecesCount = 0;
  const activeTurnPieceTypesSet = new Set<PieceType>();

  for (let y = 0; y < currentHeight; y++) {
    const rowLen = activeMatch.board[y]?.length ?? 0;
    for (let x = 0; x < rowLen; x++) {
      const p = activeMatch.board[y][x];
      if (!p) continue;
      if (p.color === 'white') whitePiecesCount++;
      else if (p.color === 'black') blackPiecesCount++;
      if (p.color === activeMatch.turn) activeTurnPieceTypesSet.add(p.type);
      if (p.type === 'prince' && p.color === myColor) {
        princeSpecialUsed = Boolean(p.princeSpecialUsed || p.hasMoved);
      }
    }
  }
  const activeTurnPieceTypes = Array.from(activeTurnPieceTypesSet);

  const candidateSquares = useMemo(() => {
    return getCandidateCraftingSquares(activeMatch.board, myColor, craftingSelectedPiece);
  }, [activeMatch.board, myColor, craftingSelectedPiece]);

  const handleMakeMove = (from: Position, to: Position) => {
    makeMove(from, to);
  };

  const handleConfirmResign = () => {
    try {
      const mode = activePunisherBotId ? 'punisher' : !isBotMatch ? 'multiplayer' : activeMatch.gameMode === 'crafted' ? 'crafted' : 'standard';
      const myMoves = activeMatch.moveHistory.filter((m) => m.piece.color === myColor).length;
      reportGameEnd({ matchId: activeMatch.id, mode, result: 'loss', moves: myMoves, isTraining: false, userId: user?.id, resigned: true });
    } catch {}
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
  const [displayWhiteTime, setDisplayWhiteTime] = useState<number>(
    activeMatch.whiteTimeRemaining ?? defaultTime
  );
  const [displayBlackTime, setDisplayBlackTime] = useState<number>(
    activeMatch.blackTimeRemaining ?? defaultTime
  );

  useEffect(() => {
    setDisplayWhiteTime(activeMatch.whiteTimeRemaining ?? defaultTime);
    setDisplayBlackTime(activeMatch.blackTimeRemaining ?? defaultTime);
  }, [activeMatch.whiteTimeRemaining, activeMatch.blackTimeRemaining, defaultTime]);

  useEffect(() => {
    if (isGameOver || Boolean(activeMatch.pausedForAction)) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const needsDice = activeMatch.diceActive !== false && activeMatch.inCheck !== activeMatch.turn;
      const hasUnrolledDice = !activeMatch.dice || activeMatch.dice.isConsumed;

      let elapsed = 0;
      const graceLimitSec = DICE_GRACE_WINDOW_MS / 1000;
      if (needsDice && hasUnrolledDice) {
        const rawElapsed = Math.max(0, (now - (activeMatch.lastTurnStartTime || now)) / 1000);
        elapsed = Math.max(0, rawElapsed - graceLimitSec);
      } else if (needsDice && activeMatch.dice && !activeMatch.dice.isConsumed) {
        const rollTime = activeMatch.dice.rolledAt || activeMatch.lastTurnStartTime || now;
        const preRollElapsed = Math.max(0, (rollTime - (activeMatch.lastTurnStartTime || now)) / 1000);
        const preRollPenalty = Math.max(0, preRollElapsed - graceLimitSec);
        const postRollElapsed = Math.max(0, (now - rollTime) / 1000);
        elapsed = preRollPenalty + postRollElapsed;
      } else {
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
    isBotMatch,
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

  const pieceDiff = Math.abs(whitePiecesCount - blackPiecesCount);
  const hasMajorPieceAdvantage = pieceDiff > 7;
  const pieceLeader: PieceColor | null = hasMajorPieceAdvantage
    ? whitePiecesCount > blackPiecesCount
      ? 'white'
      : 'black'
    : null;

  const myPiecesCount = myColor === 'white' ? whitePiecesCount : blackPiecesCount;
  const opponentPiecesCount = myColor === 'white' ? blackPiecesCount : whitePiecesCount;
  const humanPieceLead = myPiecesCount - opponentPiecesCount;
  const hasBotPieceAdvantage = isBotMatch ? humanPieceLead >= 3 : hasMajorPieceAdvantage;

  const myMaterialDiff = isWhite
    ? whitePiecesCount - blackPiecesCount
    : blackPiecesCount - whitePiecesCount;
  const oppMaterialDiff = -myMaterialDiff;

  // One-line last move preview for Mobile Bottom Bar LOG button
  const lastMoveOneLinePreview = useMemo(() => {
    if (moveLogMessages.length === 0) return 'No moves yet';
    const latest = moveLogMessages[moveLogMessages.length - 1];
    return `${latest.actor}: ${latest.san}`;
  }, [moveLogMessages]);

  // Mode-valid mobile bottom bar action flags
  const hasActiveCraftAction =
    activeMatch.craftingAllowed !== false &&
    !isGameOver &&
    ((activeMatch.pausedForAction?.type === 'crafting' &&
      activeMatch.pausedForAction.player === myColor) ||
      Boolean(activeMatch.craftingLocked?.[myColor]));

  const hasActiveExpandAction =
    !isGameOver &&
    activeMatch.pausedForAction?.type === 'expansion' &&
    activeMatch.pausedForAction.player === myColor;

  const renderMoveLogRows = (emptyLabel: string) =>
    moveLogMessages.length === 0 ? (
      <div className="py-6 text-center text-xs font-mono font-bold uppercase text-neutral-500">
        {emptyLabel}
      </div>
    ) : (
      moveLogMessages.map((item, idx) => (
        <div
          key={idx}
          className="py-1.5 flex items-center justify-between gap-2 font-mono text-xs font-bold"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] text-neutral-500 tabular-nums shrink-0">#{idx + 1}</span>
            <span
              className={`text-[10px] px-1 border shrink-0 font-black ${
                item.isMine
                  ? 'bg-emerald-500 text-black border-black'
                  : 'bg-neutral-800 text-white border-white/60'
              }`}
            >
              {item.actor}
            </span>
            <span className="truncate text-black dark:text-neutral-200">{item.text}</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black shrink-0">
            {item.san}
          </span>
        </div>
      ))
    );

  // Desktop Live Move Log (placed BELOW DiceRoller with sensible max height & internal scroll)
  const renderDesktopLiveMoveLog = () => (
    <div className="w-full flex flex-col gap-2 bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-3 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff]">
      <div className="flex items-center justify-between pb-1.5 border-b border-black/15 dark:border-white/15">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 font-mono flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          Live Move Log
          {isBotMatch && <span className="text-neutral-500 font-bold">· vs Bot</span>}
        </h4>
        <span className="text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 tabular-nums">
          {moveLogMessages.length} {moveLogMessages.length === 1 ? 'move' : 'moves'}
        </span>
      </div>
      <div
        ref={desktopLogRef}
        onScroll={() => {
          const el = desktopLogRef.current;
          if (!el) return;
          desktopLogScrolledUpRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > 28;
        }}
        className="h-[136px] max-h-[168px] overflow-y-auto overflow-x-hidden flex flex-col divide-y divide-black/10 dark:divide-white/10 pr-1"
      >
        {renderMoveLogRows('Awaiting opening move...')}
      </div>
    </div>
  );

  return (
    <div className={`${isGameOver ? 'min-h-[100dvh] h-auto overflow-y-auto' : 'h-[100dvh] max-h-[100dvh] overflow-hidden'} bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans`}>
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          20% { transform: translate(-2px, 0px) rotate(0.5deg); }
          40% { transform: translate(2px, -1px) rotate(-0.5deg); }
          60% { transform: translate(-2px, 1px) rotate(0deg); }
          80% { transform: translate(1px, -1px) rotate(0.5deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        .animate-shake {
          animation: shake 0.35s;
          animation-iteration-count: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-shake {
            animation: none;
          }
        }
      `}</style>

      {/* ZONE 1: Slim Top Header & Status Bar (48px fixed height on mobile, full header on desktop) */}
      <header className="h-12 md:h-14 shrink-0 px-1.5 sm:px-6 border-b-3 md:border-b-4 border-black dark:border-white bg-white dark:bg-[#0a0a0c] z-40 flex items-center justify-between gap-1 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onExit}
            aria-label="Return to Dashboard"
            className="min-w-[44px] min-h-[44px] w-11 h-11 shrink-0 flex items-center justify-center border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-transform duration-100 motion-reduce:transition-none cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="hidden sm:block border border-black dark:border-white p-0.5 bg-neutral-100 dark:bg-neutral-900 shrink-0">
              <AvatarDisplay avatarId={opponent.avatarId} size="sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[11px] sm:text-xs font-black uppercase truncate max-w-[100px] min-[360px]:max-w-[140px] sm:max-w-[240px]">
                  vs {opponent.displayName}
                </span>
                <span
                  title={`Your material difference: ${myMaterialDiff >= 0 ? `+${myMaterialDiff}` : myMaterialDiff}`}
                  className="text-[10px] font-mono font-black px-1 py-0.5 border border-black dark:border-white leading-none shrink-0 tabular-nums bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                >
                  {myMaterialDiff >= 0 ? `+${myMaterialDiff}` : myMaterialDiff}
                </span>
              </div>
              <span className="hidden md:block text-[10px] font-mono text-neutral-500 uppercase">
                You play {isWhite ? 'White' : 'Black'} · Opp {oppMaterialDiff >= 0 ? `+${oppMaterialDiff}` : oppMaterialDiff}
              </span>
            </div>
          </div>
        </div>

        {/* Clocks & Turn Status */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* White Clock */}
          <div
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-mono font-black border-2 border-black dark:border-white tabular-nums ${
              activeMatch.turn === 'white' && !isGameOver
                ? displayWhiteTime <= 10
                  ? 'bg-red-600 text-white'
                  : 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-neutral-100 dark:bg-[#141416]'
            }`}
            title="White Clock"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white border border-black shrink-0" aria-hidden="true" />
            <span>{formatClock(displayWhiteTime)}</span>
          </div>

          {/* Turn Status */}
          {!isGameOver ? (
            <div
              className={`px-1.5 sm:px-3 py-1 border-2 border-black dark:border-white text-[10px] sm:text-xs font-black uppercase flex items-center gap-1.5 ${
                isMyTurn
                  ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`hidden sm:inline-block w-2 h-2 ${
                  activeMatch.turn === 'white' ? 'bg-white border border-black' : 'bg-black border border-white'
                }`}
              />
              <span className="hidden md:inline whitespace-nowrap">
                {isMyTurn
                  ? activeMatch.gameMode === 'classic'
                    ? 'Your Turn (Traditional Chess)'
                    : !isDicePhaseActive
                    ? 'Your Turn (Normal Chess)'
                    : 'Your Turn'
                  : isBotThinking
                  ? 'Bot Thinking...'
                  : `${activeMatch.turn === 'white' ? 'White' : 'Black'}’s Turn`}
              </span>
              <span className="md:hidden whitespace-nowrap">
                {activeMatch.inCheck ? 'CHK' : isMyTurn ? 'YOU' : 'OPP'}
              </span>
            </div>
          ) : (
            <span className="px-2 sm:px-3 py-1 border-2 border-black dark:border-white text-[10px] sm:text-xs font-black uppercase bg-amber-400 text-black whitespace-nowrap">
              OVER
            </span>
          )}

          {/* Black Clock */}
          <div
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-mono font-black border-2 border-black dark:border-white tabular-nums ${
              activeMatch.turn === 'black' && !isGameOver
                ? displayBlackTime <= 10
                  ? 'bg-red-600 text-white'
                  : 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-neutral-100 dark:bg-[#141416]'
            }`}
            title="Black Clock"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-black border border-white shrink-0" aria-hidden="true" />
            <span>{formatClock(displayBlackTime)}</span>
          </div>
        </div>

        {/* Desktop Header Actions (Moved to Bottom Bar / Sheet on Mobile < 768px) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="min-w-[44px] min-h-[44px] px-2.5 flex items-center justify-center border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black dark:hover:text-black text-xs font-black uppercase gap-1.5 cursor-pointer shadow-[2px_2px_0px_var(--shadow)] whitespace-nowrap"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Board`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-black" aria-hidden="true" />
            )}
            <span>{theme === 'dark' ? 'Light Board' : 'Dark Board'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            className="min-w-[44px] min-h-[44px] px-2.5 flex items-center justify-center border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black dark:hover:text-black text-xs font-black uppercase gap-1.5 cursor-pointer shadow-[2px_2px_0px_var(--shadow)] whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>Rules</span>
          </button>

          {!isGameOver && (
            <button
              type="button"
              onClick={() => setShowResignConfirm(true)}
              className="min-w-[44px] min-h-[44px] px-2.5 flex items-center justify-center border-2 border-black dark:border-white bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase gap-1.5 cursor-pointer shadow-[2px_2px_0px_var(--shadow)] whitespace-nowrap"
            >
              <Flag className="w-4 h-4" aria-hidden="true" />
              <span>Resign</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN WORKSPACE: Fixed 3-zone column on mobile (<768px), 3-col grid on desktop (>=768px) */}
      <main className={`flex-1 min-h-0 w-full mx-auto flex flex-col md:grid md:grid-cols-[1fr_320px] lg:grid-cols-[300px_1fr_320px] ${
        isGameOver
          ? 'min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-56px)] h-auto overflow-y-auto'
          : 'h-[calc(100dvh-48px)] md:h-[calc(100dvh-56px)] overflow-hidden'
      } gap-0 md:gap-6 p-0 md:p-6 max-w-[1600px]`}>
        {/* Desktop Left Column (300px on lg:) */}
        <div className="hidden lg:flex flex-col gap-4 overflow-y-auto pr-1">
          {activePunisherBotId && (
            <ObserverBot
              variant="desktop"
              botId={activePunisherBotId}
              match={activeMatch}
              isThinking={isBotThinking}
            />
          )}
          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" aria-hidden="true" />
                Clocks ({activeMatch.timeControl === 120 ? '2m' : '5m'})
              </h4>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                {activeMatch.gameMode === 'classic'
                  ? 'FIDE Timeout'
                  : isBotMatch
                  ? '≥3 rule active'
                  : '>7 rule active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div
                className={`p-2 border-2 border-black dark:border-white ${
                  activeMatch.turn === 'white' && !isGameOver
                    ? 'bg-amber-400 text-black'
                    : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="w-2 h-2 bg-white border border-black" aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase">White</span>
                </div>
                <span className="text-lg font-mono font-black block tabular-nums">
                  {formatClock(displayWhiteTime)}
                </span>
                <span className="text-[10px] font-bold uppercase block mt-0.5 tabular-nums">
                  {whitePiecesCount} pieces
                </span>
              </div>

              <div
                className={`p-2 border-2 border-black dark:border-white ${
                  activeMatch.turn === 'black' && !isGameOver
                    ? 'bg-amber-400 text-black'
                    : 'bg-neutral-100 dark:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="w-2 h-2 bg-black border border-white" aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase">Black</span>
                </div>
                <span className="text-lg font-mono font-black block tabular-nums">
                  {formatClock(displayBlackTime)}
                </span>
                <span className="text-[10px] font-bold uppercase block mt-0.5 tabular-nums">
                  {blackPiecesCount} pieces
                </span>
              </div>
            </div>

            {activeMatch.gameMode === 'classic' ? (
              <div className="pt-2 border-t-2 border-black dark:border-white">
                <p className="text-[10px] text-neutral-500 font-bold uppercase leading-tight">
                  * Traditional Chess: If your timer expires, you lose. No piece-lead exceptions.
                </p>
              </div>
            ) : (
              <div className="pt-2 border-t-2 border-black dark:border-white">
                <div className="flex items-center justify-between text-xs mb-1 font-bold">
                  <span className="uppercase">{isBotMatch ? 'Human Piece Lead:' : 'Piece Diff:'}</span>
                  <span className="font-mono font-black tabular-nums">
                    {isBotMatch
                      ? `${humanPieceLead >= 0 ? '+' : ''}${humanPieceLead} (needs ≥ 3)`
                      : `${pieceDiff} ${hasMajorPieceAdvantage ? '(> 7)' : '(≤ 7)'}`}
                  </span>
                </div>
                {isBotMatch ? (
                  hasBotPieceAdvantage ? (
                    <div className="p-2 bg-amber-400 text-black border-2 border-black text-[11px] font-bold leading-tight flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>
                        <strong>You lead by {humanPieceLead} pieces (≥3).</strong> Timeout awards win to you!
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-neutral-500 font-bold uppercase leading-tight">
                      * If your timer expires, you lose unless you lead by ≥ 3 pieces (current lead: {humanPieceLead}).
                    </p>
                  )
                ) : hasMajorPieceAdvantage ? (
                  <div className="p-2 bg-amber-400 text-black border-2 border-black text-[11px] font-bold leading-tight flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <strong>
                        {pieceLeader === 'white' ? 'White' : 'Black'} leads by {pieceDiff} pieces (&gt;7).
                      </strong>{' '}
                      Timeout awards win to leader!
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-neutral-500 font-bold uppercase leading-tight">
                    * If timer expires, timed-out player loses.
                  </p>
                )}
              </div>
            )}
          </div>

          {activeMatch.gameMode !== 'classic' && (
            <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff]">
              <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" aria-hidden="true" />
                2-Pawn Draw Target
              </h4>
              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex items-center justify-between">
                  <span>Your Pawns:</span>
                  <span className="font-mono font-black text-amber-500 tabular-nums">
                    {myPawnsEndRank} / 2
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Opponent Pawns:</span>
                  <span className="font-mono text-neutral-500 tabular-nums">
                    {oppPawnsEndRank} / 2
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white h-3 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full origin-left transition-transform duration-200 motion-reduce:transition-none"
                    style={{ transform: `scaleX(${Math.min(1, myPawnsEndRank / 2)})` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" aria-hidden="true" />
                Captures
              </h4>
              <span className="text-[10px] font-mono font-black uppercase text-amber-500 tabular-nums">
                {activeMatch.gameMode === 'classic'
                  ? 'Traditional'
                  : !isDicePhaseActive
                  ? 'Normal Chess'
                  : `${Math.max(0, 3 - totalCapturesCount)} left`}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">
                  By White:
                </span>
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
                <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">
                  By Black:
                </span>
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

          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] flex flex-col max-h-[300px]">
            <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-500" aria-hidden="true" />
              History ({activeMatch.moveHistory.length})
            </h4>
            <div
              ref={desktopHistoryRef}
              className="overflow-y-auto flex-1 divide-y divide-black/20 dark:divide-white/20 text-xs font-mono pr-1"
            >
              {activeMatch.moveHistory.map((m, idx) => (
                <div key={idx} className="py-1 flex items-center justify-between">
                  <span className="text-neutral-500 w-6 tabular-nums">#{idx + 1}</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">{m.san}</span>
                  <span className="text-[10px] text-neutral-500 tabular-nums">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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

        {/* ZONE 2 (Mobile Middle) & Center Column (Desktop) */}
        <div
          className={`flex-1 min-h-0 w-full flex flex-col items-center relative px-0 py-0 md:p-0 ${
            isGameOver ? 'overflow-y-auto justify-start py-2' : 'overflow-hidden justify-center'
          }`}
        >
          {/* Mobile Punisher Bot Observer (Dedicated top rectangular box pushing board slightly below without overflow) */}
          {activePunisherBotId && (
            <div className="md:hidden w-full px-2 pt-1 pb-1 shrink-0 max-w-[500px]">
              <ObserverBot
                variant="mobile"
                botId={activePunisherBotId}
                match={activeMatch}
                isThinking={isBotThinking}
              />
            </div>
          )}
          {/* Tablet (768px - 1023px) compact status card */}
          {activeMatch.gameMode !== 'classic' && (
            <div className="hidden md:flex lg:hidden w-full flex-col gap-1 bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-2.5 text-xs font-bold">
              <div className="flex items-center justify-between">
                <span className="uppercase text-neutral-500">2-Pawn Draw:</span>
                <span className="font-mono font-black text-amber-500 tabular-nums">
                  You: {myPawnsEndRank}/2 · Opp: {oppPawnsEndRank}/2
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-black/20 dark:border-white/20 text-[11px]">
                <span className="tabular-nums">
                  Pieces: {whitePiecesCount}W vs {blackPiecesCount}B (Diff: {pieceDiff})
                </span>
                {isBotMatch
                  ? hasBotPieceAdvantage && (
                      <span className="text-amber-500 font-black uppercase">
                        ≥3 Rule (You lead by {humanPieceLead})
                      </span>
                    )
                  : hasMajorPieceAdvantage && (
                      <span className="text-amber-500 font-black uppercase">
                        &gt;7 Rule ({pieceLeader === 'white' ? 'White' : 'Black'} leads)
                      </span>
                    )}
              </div>
            </div>
          )}

          {/* Desktop Locked Crafting Banner (Non-reflowing overlay on mobile if triggered) */}
          {activeMatch.craftingAllowed !== false && activeMatch.craftingLocked?.[myColor] && !isGameOver && (
            <div className="hidden md:flex w-full bg-amber-400 text-black border-3 border-black p-3 items-center justify-between gap-3 shadow-[3px_3px_0px_#000]">
              <span className="text-xs sm:text-sm font-black uppercase tracking-tight">
                Craft ready — resolve check first
              </span>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-black text-amber-400">
                Check Active
              </span>
            </div>
          )}

          {/* Desktop Crafting Deployment Placement Banner (Handled in Dice Stage on mobile to prevent board resize) */}
          {isPlacingCraftPiece && (
            <div className="hidden md:flex w-full bg-red-600 text-white p-3 border-3 border-black dark:border-white shadow-[4px_4px_0px_#000] items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    Deploying {CRAFTABLE_MAP[craftingSelectedPiece]?.name}:
                  </span>
                  <span className="text-[11px] font-mono opacity-95 block">
                    Click any highlighted safe square in your home zone. Unsafe squares are hashed red.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPlacingCraftPiece(false)}
                  className="min-h-[40px] px-3 bg-black text-white hover:bg-neutral-800 text-[10px] font-black uppercase tracking-wider border-2 border-white cursor-pointer"
                >
                  Change Piece
                </button>
                <button
                  type="button"
                  onClick={handleCraftCancel}
                  className="min-h-[40px] px-3 bg-neutral-900 text-white hover:bg-black text-[10px] font-black uppercase tracking-wider border-2 border-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Desktop Game Over Banner (Overlay on mobile so board never moves or resizes) */}
          {isGameOver && activeMatch.result && showEndGameNotice && (
            <div
              className={`hidden md:flex w-full p-4 border-4 border-black dark:border-white shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] flex-col gap-2.5 max-h-[85dvh] overflow-y-auto shrink-0 mb-3 ${
                isPlayerDefeated
                  ? 'bg-red-600 text-white'
                  : activeMatch.result.winner === 'draw'
                  ? 'bg-amber-400 text-black'
                  : 'bg-emerald-500 text-black'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-black text-white flex items-center justify-center border-2 border-white shrink-0">
                    {activeMatch.result.winner === 'draw' ? (
                      <Crown className="w-6 h-6 text-amber-400" aria-hidden="true" />
                    ) : isPlayerDefeated ? (
                      <AlertTriangle className="w-6 h-6 text-red-500" aria-hidden="true" />
                    ) : (
                      <Trophy className="w-6 h-6 text-emerald-400" aria-hidden="true" />
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
                        (isPlayerDefeated ? 'Defeated by Checkmate!' : 'Checkmate Victory!')}
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
                    type="button"
                    onClick={() => {
                      if (displayMatchCards.length > 0) setSelectedTrophyCard(displayMatchCards[0]);
                      setIsMatchTrophyRoomOpen(true);
                    }}
                    className="min-h-[44px] px-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4 text-black" aria-hidden="true" />
                    Trophy Room
                  </button>
                  <button
                    type="button"
                    onClick={onExit}
                    className="min-h-[44px] px-4 bg-black hover:bg-neutral-900 text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-white shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>

              {displayMatchCards.length > 0 && (
                <div className="mt-2 pt-2 border-t border-black/20 dark:border-white/20">
                  <div className="text-[11px] font-black uppercase mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    Earned Achievement Badges
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {displayMatchCards.map((card) => (
                      <button
                        type="button"
                        key={card.id}
                        onClick={() => {
                          setSelectedTrophyCard(card);
                          setIsMatchTrophyRoomOpen(true);
                        }}
                        className="p-2 bg-black text-left border-2 border-amber-400 cursor-pointer flex items-center gap-2 shadow-[2px_2px_0px_#000] transition-transform duration-100 hover:scale-[1.02]"
                      >
                        <span className="text-xl" aria-hidden="true">
                          {card.motifSymbol}
                        </span>
                        <div>
                          <div className="font-extrabold text-xs text-white uppercase">{card.title}</div>
                          <div className="text-[10px] text-amber-300 font-mono tabular-nums">
                            Rating: {card.predictedRating}
                          </div>
                        </div>
                      </button>
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

          {/* Single Mounted ChessBoard Instance (Zero reflow on mobile, 820px max on desktop) */}
          <div
            className={`w-full max-w-[100vw] ${
              activePunisherBotId
                ? 'w-[min(calc(100vw-8px),calc(100dvh-270px-env(safe-area-inset-bottom,0px)),520px)] md:w-[min(calc(100vw-16px),calc(100dvh-224px-env(safe-area-inset-bottom,0px)),520px)]'
                : 'md:w-[min(calc(100vw-16px),calc(100dvh-224px-env(safe-area-inset-bottom,0px)),520px)]'
            } lg:w-[min(calc(100dvh-140px),calc(100%-48px),820px)] aspect-square flex justify-center items-center shrink-0 relative ${shouldShake ? 'animate-shake' : ''}`}
          >
            <ChessBoard
              board={activeMatch.board}
              turn={activeMatch.turn}
              myColor={myColor}
              dice={activeMatch.dice}
              lastMove={lastMove}
              inCheck={activeMatch.inCheck}
              isInteractive={
                !isGameOver && !Boolean(activeMatch.pausedForAction) && !isPlacingCraftPiece
              }
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
              boardPalette={isBotMatch ? 'crimson' : 'default'}
            />
          </div>

          {/* Mobile Non-Reflowing Game Over Overlay Card (Dismissible to inspect board) */}
          {isMobileViewport && isGameOver && activeMatch.result && showEndGameNotice && !mobileGameOverMinimized && (
            <div
              role="region"
              aria-label="Match result"
              className={`absolute bottom-2 left-2 right-2 z-30 p-3 border-3 border-black dark:border-white shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] flex flex-col gap-2 max-h-[80dvh] overflow-y-auto ${
                isPlayerDefeated
                  ? 'bg-red-600 text-white'
                  : activeMatch.result.winner === 'draw'
                  ? 'bg-amber-400 text-black'
                  : 'bg-emerald-500 text-black'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase leading-tight">
                    {activeMatch.result.winner === 'draw'
                      ? 'GAME DRAWN!'
                      : isPlayerDefeated
                      ? 'DEFEATED!'
                      : 'VICTORY!'}
                  </h3>
                  <p className="text-[11px] font-bold uppercase leading-tight">
                    {(activeMatch.result.reason || '').replace(/_/g, ' ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileGameOverMinimized(true)}
                  aria-label="Hide result overlay to inspect board"
                  className="min-w-[44px] min-h-[44px] px-2 bg-black text-white border-2 border-white text-[10px] font-black uppercase cursor-pointer shrink-0"
                >
                  BOARD
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (displayMatchCards.length > 0) setSelectedTrophyCard(displayMatchCards[0]);
                    setIsMatchTrophyRoomOpen(true);
                  }}
                  className="flex-1 min-h-[44px] px-2 bg-amber-400 text-black font-black text-xs uppercase border-2 border-black cursor-pointer flex items-center justify-center gap-1"
                >
                  <Trophy className="w-4 h-4 shrink-0" aria-hidden="true" />
                  TROPHIES
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="flex-1 min-h-[44px] px-2 bg-black text-white font-black text-xs uppercase border-2 border-white cursor-pointer"
                >
                  EXIT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ZONE 3 (Mobile Only): Fixed-Height 104px Dice Stage Directly Under the Board */}
        <div className="md:hidden h-[104px] min-h-[104px] max-h-[104px] w-full px-1.5 pb-1 shrink-0 flex items-stretch">
          {isPlacingCraftPiece ? (
            <div className="w-full h-full bg-red-600 text-white border-3 border-black dark:border-white px-2.5 py-2 shadow-[3px_3px_0px_#000] flex items-center justify-between gap-2 overflow-hidden">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black uppercase block truncate">
                  DEPLOY {CRAFTABLE_MAP[craftingSelectedPiece]?.name}
                </span>
                <span className="text-[10px] font-mono block leading-tight">
                  Tap highlighted safe square in home zone
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPlacingCraftPiece(false)}
                  className="min-h-[44px] px-2.5 bg-black text-white border-2 border-white text-[10px] font-black uppercase cursor-pointer"
                >
                  CHANGE
                </button>
                <button
                  type="button"
                  onClick={handleCraftCancel}
                  className="min-h-[44px] px-2.5 bg-neutral-900 text-white border-2 border-white text-[10px] font-black uppercase cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            isMobileViewport && (
              <DiceRoller
                variant="stage"
                dice={activeMatch.dice}
                isMyTurn={isMyTurn}
                myColor={myColor}
                onRoll={rollDice}
                disabled={isGameOver}
                isInCheck={activeMatch.inCheck === myColor}
                turnStartTime={activeMatch.lastTurnStartTime}
                diceActive={isDicePhaseActive}
                activeTurnColor={activeMatch.turn}
                isBotMatch={isBotMatch}
                isBotThinking={isBotThinking}
                isGameOver={isGameOver}
                availablePieceTypes={activeTurnPieceTypes}
                gameMode={activeMatch.gameMode}
              />
            )
          )}
        </div>

        {/* Desktop Right Side Column (320px): Dice Roller ABOVE, Live Move Log BELOW */}
        <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-1">
          <PredictorPanel
            metrics={standardMetrics}
            modeLabel={
              activeMatch.gameMode === 'classic'
                ? 'Traditional Chess'
                : activeMatch.gameMode === 'crafted'
                ? 'Crafted Chess'
                : 'Mugen Chess'
            }
          />

          {/* Swapped Order: 1. Dice Roller (or Post-Dice Status Panel) ABOVE */}
          {!isMobileViewport && (
            <DiceRoller
              variant="panel"
              dice={activeMatch.dice}
              isMyTurn={isMyTurn}
              myColor={myColor}
              onRoll={rollDice}
              disabled={isGameOver}
              isInCheck={activeMatch.inCheck === myColor}
              turnStartTime={activeMatch.lastTurnStartTime}
              diceActive={isDicePhaseActive}
              activeTurnColor={activeMatch.turn}
              isBotMatch={isBotMatch}
              isBotThinking={isBotThinking}
              isGameOver={isGameOver}
              availablePieceTypes={activeTurnPieceTypes}
              gameMode={activeMatch.gameMode}
            />
          )}

          {/* Swapped Order: 2. Live Move Log BELOW with fixed max-height & internal scroll */}
          {renderDesktopLiveMoveLog()}

          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-3 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] text-xs font-bold flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase text-neutral-500">Match Rules:</span>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span>{activeMatch.timeControl === 120 ? '2m Blitz' : '5m Rapid'}</span>
              <span aria-hidden="true">·</span>
              <span>{activeMatch.moveSuggestions === 'excluded' ? 'No Hints' : 'Hints On'}</span>
              {activeMatch.craftingAllowed !== false && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black">Crafting On</span>
                </>
              )}
            </div>
          </div>

          {activeMatch.gameMode !== 'classic' && (
            <PrinceRulesCard myColor={myColor} princeSpecialUsed={princeSpecialUsed} />
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM SHEET BACKDROP & COLLAPSIBLE SHEET (Slides over Dice Stage without resizing board) */}
      {isMobileViewport && isSheetOpen && (
        <div
          onClick={closeSheet}
          aria-hidden="true"
          className="md:hidden fixed inset-0 bottom-[calc(52px+env(safe-area-inset-bottom))] z-30 bg-black/60 transition-opacity duration-200 motion-reduce:transition-none"
        />
      )}

      {isMobileViewport && (
        <div
          id="mobile-match-sheet"
          ref={sheetContainerRef}
          role="dialog"
          aria-modal={isSheetOpen ? 'true' : undefined}
          aria-label={sheetTab === 'log' ? 'Live Move Log' : 'Match Info and Predictor'}
          aria-hidden={!isSheetOpen}
          className={`md:hidden fixed left-0 right-0 bottom-[calc(52px+env(safe-area-inset-bottom))] z-40 max-h-[50dvh] flex flex-col bg-white dark:bg-[#0a0a0c] border-t-3 border-x-3 border-black dark:border-white shadow-[0_-4px_0px_#000000] dark:shadow-[0_-4px_0px_#ffffff] transition-[transform,opacity] duration-200 motion-reduce:transition-none ${
            isSheetOpen
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          {/* Drag Handle + Sheet Tab Bar + Close Button */}
          <div
            onTouchStart={(e) => {
              touchStartYRef.current = e.touches[0]?.clientY ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchStartYRef.current === null) return;
              const deltaY = (e.changedTouches[0]?.clientY ?? touchStartYRef.current) - touchStartYRef.current;
              touchStartYRef.current = null;
              if (deltaY > 40) closeSheet();
            }}
            className="shrink-0 flex flex-col border-b-2 border-black dark:border-white bg-neutral-100 dark:bg-[#141416]"
          >
            <div className="w-full py-1.5 flex justify-center">
              <div className="w-12 h-1.5 bg-black dark:bg-white" aria-hidden="true" />
            </div>

            <div className="px-2 pb-1.5 flex items-center justify-between gap-2">
              <div role="tablist" aria-label="Match sheet sections" className="flex items-center gap-1.5">
                <button
                  type="button"
                  role="tab"
                  tabIndex={isSheetOpen ? 0 : -1}
                  aria-selected={sheetTab === 'log'}
                  onClick={() => setSheetTab('log')}
                  className={`min-h-[44px] px-3 border-2 border-black dark:border-white text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    sheetTab === 'log'
                      ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white dark:bg-[#0a0a0c] text-black dark:text-white'
                  }`}
                >
                  <History className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>LOG ({moveLogMessages.length})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  tabIndex={isSheetOpen ? 0 : -1}
                  aria-selected={sheetTab === 'info'}
                  onClick={() => setSheetTab('info')}
                  className={`min-h-[44px] px-3 border-2 border-black dark:border-white text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    sheetTab === 'info'
                      ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white dark:bg-[#0a0a0c] text-black dark:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>INFO</span>
                </button>
              </div>

              <button
                ref={sheetCloseBtnRef}
                type="button"
                tabIndex={isSheetOpen ? 0 : -1}
                onClick={closeSheet}
                aria-label="Close panel"
                className="min-h-[44px] min-w-[44px] px-2.5 border-2 border-black dark:border-white bg-white dark:bg-[#0a0a0c] text-black dark:text-white text-xs font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>CLOSE</span>
              </button>
            </div>
          </div>

          {/* Internal Scrollable Body */}
          {sheetTab === 'log' ? (
            <div
              ref={mobileSheetLogRef}
              onScroll={() => {
                const el = mobileSheetLogRef.current;
                if (!el) return;
                mobileSheetScrolledUpRef.current =
                  el.scrollHeight - el.scrollTop - el.clientHeight > 32;
              }}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 divide-y divide-black/15 dark:divide-white/15"
            >
              {renderMoveLogRows('No moves recorded yet.')}
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-3 text-xs">
              {/* Board Theme Switcher */}
              <div className="flex items-center justify-between gap-2 p-2.5 border-2 border-black dark:border-white bg-neutral-100 dark:bg-[#141416]">
                <span className="font-black uppercase">Board Appearance</span>
                <button
                  type="button"
                  tabIndex={isSheetOpen ? 0 : -1}
                  onClick={toggleTheme}
                  className="min-h-[44px] px-3 border-2 border-black dark:border-white bg-amber-400 text-black font-black uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Moon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{theme === 'dark' ? 'Light Board' : 'Dark Board'}</span>
                </button>
              </div>

              {/* Predictor Panel (Moved into Sheet INFO tab on Mobile) */}
              <PredictorPanel
                metrics={standardMetrics}
                modeLabel={activeMatch.gameMode === 'crafted' ? 'Crafted Chess' : 'Standard Chess'}
              />

              {/* Captures & Match Trackers */}
              <div className="p-3 border-2 border-black dark:border-white space-y-2">
                <div className="flex items-center justify-between font-black uppercase">
                  <span>Captures ({totalCapturesCount})</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">
                    {!isDicePhaseActive ? 'Normal Chess' : `${Math.max(0, 3 - totalCapturesCount)} to Normal Chess`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] font-bold uppercase text-neutral-500 mr-1">By W:</span>
                  {activeMatch.capturedByWhite.length === 0 ? (
                    <span className="text-[10px] font-mono text-neutral-400">None</span>
                  ) : (
                    activeMatch.capturedByWhite.map((p, i) => (
                      <div key={i} className="w-4 h-4">
                        <ChessPiece type={p.type} color="black" theme={activeMatch.pieceTheme || 'classic'} />
                      </div>
                    ))
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] font-bold uppercase text-neutral-500 mr-1">By B:</span>
                  {activeMatch.capturedByBlack.length === 0 ? (
                    <span className="text-[10px] font-mono text-neutral-400">None</span>
                  ) : (
                    activeMatch.capturedByBlack.map((p, i) => (
                      <div key={i} className="w-4 h-4">
                        <ChessPiece type={p.type} color="white" theme={activeMatch.pieceTheme || 'classic'} />
                      </div>
                    ))
                  )}
                </div>
                {activeMatch.gameMode !== 'classic' ? (
                  <div className="pt-2 border-t border-black/20 dark:border-white/20 flex items-center justify-between font-mono font-bold">
                    <span>2-Pawn Draw: You {myPawnsEndRank}/2 · Opp {oppPawnsEndRank}/2</span>
                    <span>
                      {isBotMatch ? `Lead ${humanPieceLead >= 0 ? `+${humanPieceLead}` : humanPieceLead} (≥3)` : `Diff ${pieceDiff} (>7)`}
                    </span>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-black/20 dark:border-white/20 flex items-center justify-between font-mono font-bold">
                    <span>Traditional Rules: Checkmate / Resignation</span>
                    <span>FIDE Timeout</span>
                  </div>
                )}
              </div>

              {activeMatch.gameMode !== 'classic' && (
                <PrinceRulesCard myColor={myColor} princeSpecialUsed={princeSpecialUsed} />
              )}
            </div>
          )}
        </div>
      )}

      {/* ZONE 4 (Mobile Only): Modern Brutalist Bottom Navigation Bar (52px + safe-area-inset-bottom) */}
      <nav
        role="navigation"
        aria-label="Match actions"
        className="md:hidden shrink-0 w-full bg-white dark:bg-[#0a0a0c] border-t-3 border-black dark:border-white px-1.5 pt-1 pb-[calc(4px+env(safe-area-inset-bottom))] z-40 flex items-center gap-1"
      >
        {/* LOG Button with 1-Line Last Move Preview */}
        <button
          ref={logBtnRef}
          type="button"
          aria-expanded={isSheetOpen && sheetTab === 'log'}
          aria-controls="mobile-match-sheet"
          onClick={() => {
            if (isSheetOpen && sheetTab === 'log') {
              closeSheet();
            } else {
              lastSheetTriggerRef.current = 'log';
              setSheetTab('log');
              setIsSheetOpen(true);
            }
          }}
          className={`flex-[1.6] min-w-[44px] min-h-[44px] px-2 border-2 border-black dark:border-white flex flex-col items-start justify-center overflow-hidden cursor-pointer transition-transform duration-100 motion-reduce:transition-none ${
            isSheetOpen && sheetTab === 'log'
              ? 'bg-amber-400 text-black'
              : 'bg-neutral-100 dark:bg-[#141416] text-black dark:text-white'
          }`}
        >
          <span className="text-[10px] font-black uppercase flex items-center gap-1 leading-none whitespace-nowrap">
            <History className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            LOG ({moveLogMessages.length})
          </span>
          <span className="text-[10px] font-mono font-bold truncate w-full text-left leading-tight mt-0.5 opacity-90">
            {lastMoveOneLinePreview}
          </span>
        </button>

        {/* INFO Tab Button (Predictor, Captures, Board Theme, Prince Rules) */}
        <button
          ref={infoBtnRef}
          type="button"
          aria-expanded={isSheetOpen && sheetTab === 'info'}
          aria-controls="mobile-match-sheet"
          onClick={() => {
            if (isSheetOpen && sheetTab === 'info') {
              closeSheet();
            } else {
              lastSheetTriggerRef.current = 'info';
              setSheetTab('info');
              setIsSheetOpen(true);
            }
          }}
          className={`flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-black dark:border-white flex flex-col items-center justify-center cursor-pointer transition-transform duration-100 motion-reduce:transition-none ${
            isSheetOpen && sheetTab === 'info'
              ? 'bg-amber-400 text-black'
              : 'bg-neutral-100 dark:bg-[#141416] text-black dark:text-white'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
            INFO
          </span>
        </button>

        {/* Mode-Valid CRAFT Action (Shown only when crafting is enabled and active/locked) */}
        {hasActiveCraftAction && (
          <button
            type="button"
            disabled={Boolean(activeMatch.craftingLocked?.[myColor])}
            onClick={() => setIsPlacingCraftPiece(false)}
            className={`flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-black dark:border-white flex flex-col items-center justify-center ${
              activeMatch.craftingLocked?.[myColor]
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-amber-400 text-black cursor-pointer'
            }`}
          >
            <Hammer className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
              {activeMatch.craftingLocked?.[myColor] ? 'LOCKED' : 'CRAFT'}
            </span>
          </button>
        )}

        {/* Mode-Valid EXPAND Action (Shown only when board expansion choice is pending) */}
        {hasActiveExpandAction && (
          <button
            type="button"
            onClick={() => onExpand(myColor === 'white' ? 'bottom' : 'top')}
            title="Expand back rank"
            className="flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-black dark:border-white bg-amber-400 text-black flex flex-col items-center justify-center cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
              EXPAND
            </span>
          </button>
        )}

        {/* RULES Button */}
        <button
          type="button"
          onClick={onOpenRules}
          className="flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-black dark:border-white bg-neutral-100 dark:bg-[#141416] text-black dark:text-white flex flex-col items-center justify-center cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
            RULES
          </span>
        </button>

        {/* RESIGN (Active Match) or RESULT/EXIT (Completed Match) */}
        {!isGameOver ? (
          <button
            type="button"
            onClick={() => setShowResignConfirm(true)}
            className="flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-black dark:border-white bg-red-600 hover:bg-red-500 text-white flex flex-col items-center justify-center cursor-pointer"
          >
            <Flag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
              RESIGN
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (mobileGameOverMinimized) {
                setMobileGameOverMinimized(false);
              } else {
                onExit();
              }
            }}
            className="flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-black dark:border-white bg-amber-400 text-black flex flex-col items-center justify-center cursor-pointer"
          >
            <Trophy className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
              {mobileGameOverMinimized ? 'RESULT' : 'EXIT'}
            </span>
          </button>
        )}
      </nav>

      {/* Resign Confirmation Modal (Preserves existing confirmation safeguard) */}
      {showResignConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div
            ref={resignModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="resign-modal-title"
            className="bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white p-6 max-w-sm w-full shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] text-black dark:text-white flex flex-col gap-4"
          >
            <h3
              id="resign-modal-title"
              className="text-base font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <Flag className="w-5 h-5" aria-hidden="true" />
              Resign Game?
            </h3>
            <p className="text-xs font-bold leading-relaxed">
              Are you sure you want to resign? Your opponent will be awarded the victory.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleConfirmResign}
                className="flex-1 min-h-[44px] px-3 bg-red-600 hover:bg-red-500 font-black text-xs uppercase text-white border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                Yes, Resign
              </button>
              <button
                type="button"
                onClick={() => setShowResignConfirm(false)}
                className="flex-1 min-h-[44px] px-4 bg-neutral-200 dark:bg-neutral-800 font-black text-xs uppercase border-2 border-black dark:border-white cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
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
      <LiveAnnouncer message={politeAnnouncement} type="polite" />
      <LiveAnnouncer message={assertiveAnnouncement} type="assertive" />
    </div>
  );
};
