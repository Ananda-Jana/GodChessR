import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CullingMatchState,
  CullingPos,
  CullingPieceColor,
  CullingPieceType,
  CullingMove,
  CULLING_ROSTER,
  posToCullingSquare,
} from '../types/cullingGame';
import { CullingBoard } from './CullingBoard';
import { CullingPiece as CullingPieceComponent } from './CullingPiece';
import { CullingRulesModal } from './CullingRulesModal';
import { executeCullingMove, resignCullingMatch, handleCullingTimeout } from '../game/cullingEngine';
import { getBestCullingBotMove } from '../game/cullingBot';
import {
  BookOpen,
  Flag,
  RotateCw,
  Clock,
  Swords,
  Trophy,
  ArrowLeft,
  Bot,
  Users,
  Info,
  X,
  AlertTriangle,
  Zap,
  Sparkles,
  Shield,
  Send,
} from 'lucide-react';

interface CullingMatchViewProps {
  initialMatch: CullingMatchState;
  isBotMatch: boolean;
  userColor: CullingPieceColor;
  onExit: () => void;
  socket?: WebSocket | null;
  onPlaySimilarBot?: () => void;
  onPlayMultiplayer?: () => void;
}

interface AbilityPopup {
  id: string;
  turn: number;
  casterName: string;
  casterType: CullingPieceType;
  color: CullingPieceColor;
  abilityName: string;
  targetSquare: string;
  isPlayer: boolean;
  timestamp: number;
}

export const CullingMatchView: React.FC<CullingMatchViewProps> = ({
  initialMatch,
  isBotMatch,
  userColor,
  onExit,
  socket,
  onPlaySimilarBot,
  onPlayMultiplayer,
}) => {
  const [match, setMatch] = useState<CullingMatchState>(initialMatch);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [flipped, setFlipped] = useState(userColor === 'black');

  // Inspected piece floating toast state (shows piece name & moniker for Culling Game)
  const [inspectedPiece, setInspectedPiece] = useState<{
    name: string;
    role: string;
    type: CullingPieceType;
    team: CullingPieceColor;
  } | null>(null);

  // Red GameOver modal visibility state
  const [showGameOverModal, setShowGameOverModal] = useState(match.status === 'completed');

  // Ability pop-up notifications stack (Blue for player, Purple for opponent)
  const [abilityPopups, setAbilityPopups] = useState<AbilityPopup[]>([]);
  const processedMovesRef = useRef<number>(initialMatch.history.length);

  const moveLogEndRef = useRef<HTMLDivElement | null>(null);
  const stepLogEndRef = useRef<HTMLDivElement | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // When match completes, trigger prominent red modal
  useEffect(() => {
    if (match.status === 'completed') {
      setShowGameOverModal(true);
    }
  }, [match.status]);

  // Inspect piece function for Culling pieces
  const handleInspectPiece = useCallback((pieceType: string, pieceColor?: CullingPieceColor) => {
    const charInfo = CULLING_ROSTER[pieceType as CullingPieceType];
    if (charInfo) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setInspectedPiece({
        name: charInfo.name,
        role: charInfo.role,
        type: charInfo.type,
        team: pieceColor || charInfo.team,
      });

      // Auto dismiss after 3.8s
      toastTimeoutRef.current = setTimeout(() => {
        setInspectedPiece(null);
      }, 3800);
    }
  }, []);

  // Monitor move history to spawn ability popups & narrative steps
  useEffect(() => {
    if (match.history.length > processedMovesRef.current) {
      const newMoves = match.history.slice(processedMovesRef.current);
      processedMovesRef.current = match.history.length;
      for (const m of newMoves) {
        const isSpecial =
          Boolean(m.isSpecialAbility) ||
          Boolean(m.specialAbilityName) ||
          (Boolean(m.actionType) && m.actionType !== 'move');

        if (isSpecial) {
          const charInfo = CULLING_ROSTER[m.piece.type];
          const isPlayer = m.piece.color === userColor;
          const popupId = `popup_${Date.now()}_${Math.random()}`;

          let abilityName = m.specialAbilityName;
          if (!abilityName) {
            if (m.actionType === 'teleport') {
              abilityName = m.piece.color === 'white' ? 'Limitless Teleport' : 'Cleave Dash';
            } else if (m.actionType === 'pierce_shoot') {
              abilityName = 'Straight Rush';
            } else if (m.actionType === 'construct_strike') {
              abilityName = 'Construct Armor Strike';
            } else if (m.actionType === 'chain_rush') {
              abilityName = 'Mach 3 Acceleration';
            } else if (m.actionType === 'frost_freeze') {
              abilityName = 'Glacial Ice Strike';
            } else {
              abilityName = 'Sorcery Technique';
            }
          }

          const newPopup: AbilityPopup = {
            id: popupId,
            turn: match.turnCount,
            casterName: charInfo ? charInfo.name : m.piece.type,
            casterType: m.piece.type,
            color: m.piece.color,
            abilityName,
            targetSquare: posToCullingSquare(m.to),
            isPlayer,
            timestamp: Date.now(),
          };

          setAbilityPopups((prev) => [newPopup, ...prev.slice(0, 3)]);

          // Auto-dismiss popup after 4.5 seconds
          setTimeout(() => {
            setAbilityPopups((prev) => prev.filter((p) => p.id !== popupId));
          }, 4500);
        }
      }
    }
  }, [match.history, userColor]);

  // Auto-scroll logs
  useEffect(() => {
    moveLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    stepLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [match.history.length]);

  // Synchronize state from multiplayer socket
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'culling:state' && msg.match) {
          setMatch(msg.match);
        }
      } catch (err) {
        console.error('Socket message parse error:', err);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket]);

  // Reliable Grandmaster Bot runner
  const runBotTurn = useCallback((currentMatch: CullingMatchState, botColor: CullingPieceColor) => {
    if (currentMatch.status !== 'active') return;
    if (botTimerRef.current) clearTimeout(botTimerRef.current);

    setIsBotThinking(true);

    botTimerRef.current = setTimeout(() => {
      setMatch((prev) => {
        if (prev.status !== 'active' || prev.turn !== botColor) {
          setIsBotThinking(false);
          return prev;
        }

        const bestMove = getBestCullingBotMove(prev, botColor, 2);
        setIsBotThinking(false);

        if (bestMove) {
          const res = executeCullingMove(prev, bestMove.from, bestMove.to, bestMove.actionType);
          if (res.success) {
            // Check if bonus turn was earned
            if (res.state.status === 'active' && res.state.turn === botColor) {
              setTimeout(() => runBotTurn(res.state, botColor), 500);
            }
            return res.state;
          }
        }
        return prev;
      });
    }, 550);
  }, []);

  // Trigger bot move on initial game start if bot plays White
  useEffect(() => {
    if (isBotMatch && match.status === 'active') {
      const botColor: CullingPieceColor = userColor === 'white' ? 'black' : 'white';
      if (match.turn === botColor) {
        runBotTurn(match, botColor);
      }
    }
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  // Authoritative clock ticks every second
  useEffect(() => {
    if (match.status !== 'active') return;

    const timer = setInterval(() => {
      setMatch((prev) => {
        if (prev.status !== 'active') return prev;

        // Check if paused by rulebook
        if (prev.rulebookPausedUntil && Date.now() < prev.rulebookPausedUntil) {
          return prev;
        }

        if (prev.turn === 'white') {
          const nextTime = Math.max(0, prev.whiteTimeRemaining - 1);
          if (nextTime <= 0) {
            return handleCullingTimeout(prev, 'white');
          }
          return { ...prev, whiteTimeRemaining: nextTime };
        } else {
          const nextTime = Math.max(0, prev.blackTimeRemaining - 1);
          if (nextTime <= 0) {
            return handleCullingTimeout(prev, 'black');
          }
          return { ...prev, blackTimeRemaining: nextTime };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [match.status]);

  // Handle local or multiplayer move execution
  const handleMove = (from: CullingPos, to: CullingPos, actionType?: string) => {
    if (match.status !== 'active') return;

    if (isBotMatch) {
      if (match.turn !== userColor || isBotThinking) return;

      const res = executeCullingMove(match, from, to, actionType as any);
      if (res.success) {
        const nextState = res.state;
        setMatch(nextState);

        const botColor: CullingPieceColor = userColor === 'white' ? 'black' : 'white';
        if (nextState.status === 'active' && nextState.turn === botColor) {
          runBotTurn(nextState, botColor);
        }
      }
    } else if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'culling:move',
          matchId: match.id,
          from,
          to,
          actionType: actionType || 'move',
        })
      );
    }
  };

  // Resignation
  const handleResign = () => {
    if (match.status !== 'active') return;
    if (isBotMatch) {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      setIsBotThinking(false);
      setMatch(resignCullingMatch(match, userColor));
    } else if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'culling:resign',
          matchId: match.id,
          color: userColor,
        })
      );
    }
  };

  // Opening the rulebook pauses clock for exactly 8 seconds
  const handleOpenRules = () => {
    const pauseUntil = Date.now() + 8000;
    setMatch((prev) => ({ ...prev, rulebookPausedUntil: pauseUntil }));
    setIsRulesOpen(true);

    if (!isBotMatch && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'culling:rules_open',
          matchId: match.id,
        })
      );
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Captured pieces derived from move history
  const capturedByWhite = useMemo(() => {
    return match.history
      .filter((m) => m.captured && m.piece.color === 'white')
      .map((m) => m.captured!);
  }, [match.history]);

  const capturedByBlack = useMemo(() => {
    return match.history
      .filter((m) => m.captured && m.piece.color === 'black')
      .map((m) => m.captured!);
  }, [match.history]);

  // Human-readable narrative steps stating exactly who is moving which piece
  const narrativeSteps = useMemo(() => {
    return match.history.map((m, idx) => {
      const charInfo = CULLING_ROSTER[m.piece.type];
      const charName = charInfo ? charInfo.name : m.piece.type;
      const teamLabel = m.piece.color === 'white' ? 'White' : 'Black';
      const dest = posToCullingSquare(m.to);

      let actionDesc = '';
      if (m.captured) {
        const capInfo = CULLING_ROSTER[m.captured.type];
        const capName = capInfo ? capInfo.name : m.captured.type;
        actionDesc = `captured ${capName} on ${dest}`;
      } else if (m.isSpecialAbility || m.specialAbilityName) {
        actionDesc = `unleashed ${m.specialAbilityName || 'Special Technique'} to ${dest}`;
      } else {
        actionDesc = `moved to ${dest}`;
      }

      return {
        index: idx + 1,
        team: teamLabel,
        color: m.piece.color,
        name: charName,
        type: m.piece.type,
        dest,
        text: `${teamLabel} ${charName} ${actionDesc}`,
        san: m.san,
      };
    });
  }, [match.history]);

  const isUserWinner = match.winner === userColor;
  const isMatchDraw =
    (match.winner as unknown as string) === 'draw' ||
    (match.status === 'completed' && match.winner === null);

  const opponentColor: CullingPieceColor = userColor === 'white' ? 'black' : 'white';
  const opponentTime =
    opponentColor === 'white' ? match.whiteTimeRemaining : match.blackTimeRemaining;
  const playerTime =
    userColor === 'white' ? match.whiteTimeRemaining : match.blackTimeRemaining;

  const opponentCaptured = opponentColor === 'white' ? capturedByWhite : capturedByBlack;
  const playerCaptured = userColor === 'white' ? capturedByWhite : capturedByBlack;

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-[#0a0e14] text-black dark:text-white flex flex-col font-sans select-none relative">
      {/* Floating Piece Name Toast Banner (Shown on sidebar/mobile/board piece click) */}
      {inspectedPiece && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200 max-w-sm w-[90%]">
          <div className="bg-neutral-900 text-white border-3 border-amber-400 shadow-[5px_5px_0px_#f59e0b] px-3.5 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 shrink-0 bg-neutral-950 border border-neutral-700 flex items-center justify-center p-1">
                <CullingPieceComponent type={inspectedPiece.type} color={inspectedPiece.team} />
              </div>
              <div className="truncate">
                <div className="text-xs sm:text-sm font-black uppercase tracking-wide text-amber-400 truncate">
                  {inspectedPiece.name}
                </div>
                <div className="text-[10px] sm:text-[11px] text-neutral-300 font-bold truncate">
                  {inspectedPiece.role}
                </div>
              </div>
            </div>
            <button
              onClick={() => setInspectedPiece(null)}
              className="p-1 text-neutral-400 hover:text-white cursor-pointer transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Prominent Red Game-Over Modal Overlay */}
      {showGameOverModal && match.status === 'completed' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-red-600 text-white border-4 border-black dark:border-white shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] p-6 sm:p-7 max-w-md w-full relative">
            <button
              onClick={() => setShowGameOverModal(false)}
              className="absolute top-3 right-3 p-1 text-white hover:bg-red-700 border-2 border-white/80 cursor-pointer"
              title="Close modal to inspect board"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white text-red-600 border-3 border-black flex items-center justify-center mb-3 shadow-[3px_3px_0px_#000]">
                {isMatchDraw ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : isUserWinner ? (
                  <Trophy className="w-8 h-8" />
                ) : (
                  <Swords className="w-8 h-8" />
                )}
              </div>

              <span className="text-xs font-mono font-black uppercase tracking-widest text-red-100 mb-1">
                Match Concluded
              </span>

              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
                {isMatchDraw
                  ? 'Stalemate / Draw'
                  : isUserWinner
                  ? 'Glorious Victory!'
                  : 'Sorcery Defeat'}
              </h2>

              <p className="text-sm font-bold text-red-100 bg-red-700/80 border border-red-500/80 px-3 py-2 mb-4 w-full">
                {match.winReason ||
                  (match.winner
                    ? `${match.winner.toUpperCase()} KING EXECUTED DOMAIN VICTORY`
                    : 'Game finished')}
              </p>

              <div className="text-[11px] font-bold text-red-100/90 mb-5">
                {match.winner === 'white'
                  ? 'Satoru Gojo & Protagonists stand supreme.'
                  : match.winner === 'black'
                  ? 'Ryomen Sukuna & Antagonists seized the Culling Game.'
                  : 'Neither King fell in combat.'}
              </div>

              <div className="flex flex-col gap-2.5 w-full">
                {onPlaySimilarBot && (
                  <button
                    onClick={() => {
                      setShowGameOverModal(false);
                      onPlaySimilarBot();
                    }}
                    className="w-full py-2.5 bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    Play Again vs Similar Bot
                  </button>
                )}
                {onPlayMultiplayer && (
                  <button
                    onClick={() => {
                      setShowGameOverModal(false);
                      onPlayMultiplayer();
                    }}
                    className="w-full py-2.5 bg-white hover:bg-neutral-100 text-red-700 font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    Direct Challenge Multiplayer
                  </button>
                )}
                <button
                  onClick={() => setShowGameOverModal(false)}
                  className="w-full py-2 bg-red-800 hover:bg-red-700 text-white font-black text-xs uppercase border-2 border-white/60 cursor-pointer"
                >
                  Inspect Fallen King & Board
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar (Ultra-compact to maximize vertical board area) */}
      <header className="px-3 sm:px-5 py-1.5 border-b-2 sm:border-b-3 border-black dark:border-white bg-white dark:bg-[#0f172a] shrink-0 flex items-center justify-between gap-2.5 z-20">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onExit}
            className="p-1.5 bg-white dark:bg-[#1e293b] hover:bg-neutral-100 dark:hover:bg-slate-700 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            title="Exit to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-500" />
            <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider">
              Culling Game Mode
            </h1>
            <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 font-black uppercase border border-black shadow-[1px_1px_0px_#000]">
              {isBotMatch ? 'vs Bot' : 'Direct Challenge'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleOpenRules}
            className="px-2 py-1 bg-white dark:bg-[#1e293b] hover:bg-neutral-100 dark:hover:bg-slate-700 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black uppercase flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            title="Pauses timer for 8s"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={() => setFlipped((prev) => !prev)}
            className="p-1.5 bg-white dark:bg-[#1e293b] hover:bg-neutral-100 dark:hover:bg-slate-700 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            title="Flip Board"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResign}
            disabled={match.status !== 'active'}
            className="px-2 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black uppercase flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resign</span>
          </button>
        </div>
      </header>

      {/* Main Single-Screen Ergonomic Game Body (Fits in one desktop screen without vertical scrolling) */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-1 sm:p-2 lg:p-2.5 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-2.5 lg:gap-4 overflow-y-auto lg:overflow-hidden">
        {/* LEFT COLUMN: Step Announcements Box + Special Ability Pop-up Stack + Roster */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-2 shrink-0 h-auto lg:h-full lg:overflow-hidden">
          {/* 1. Live Step Announcement Box (Stating exactly who is moving which piece) */}
          <div className="bg-neutral-100 dark:bg-[#0f172a] border-2 sm:border-3 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] flex flex-col h-44 sm:h-48 lg:h-52 shrink-0 overflow-hidden">
            <div className="px-2.5 py-1.5 bg-neutral-200 dark:bg-[#1e293b] border-b-2 border-black dark:border-white flex items-center justify-between text-[11px] font-black uppercase">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Send className="w-3.5 h-3.5" />
                Step Announcements
              </span>
              <span className="font-mono text-[9px] bg-black text-white px-1.5 py-0.2">
                T{match.turnCount}
              </span>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-1.5 text-xs font-mono">
              {narrativeSteps.length === 0 ? (
                <div className="text-neutral-400 dark:text-slate-500 text-center py-6 text-xs font-bold">
                  Game commenced. Waiting for first step...
                </div>
              ) : (
                narrativeSteps.map((step) => (
                  <div
                    key={`step-${step.index}`}
                    onClick={() => handleInspectPiece(step.type, step.color)}
                    className="p-1.5 bg-white dark:bg-[#1e293b] border border-black/20 dark:border-white/20 hover:border-amber-400 cursor-pointer transition-colors flex items-start gap-1.5 text-[11px] leading-tight"
                  >
                    <span className="text-amber-500 font-black shrink-0">#{step.index}</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {step.text}
                    </span>
                  </div>
                ))
              )}
              <div ref={stepLogEndRef} />
            </div>
          </div>

          {/* 2. Special Ability Pop-up Stack (Blue for Player, Purple for Opponent) */}
          <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto">
            {abilityPopups.length > 0 ? (
              abilityPopups.map((popup) => (
                <div
                  key={popup.id}
                  className={`p-2.5 border-2 animate-in slide-in-from-left duration-200 shadow-[3px_3px_0px_rgba(0,0,0,0.5)] flex flex-col gap-1 relative ${
                    popup.isPlayer
                      ? 'bg-blue-950/95 border-blue-400 text-blue-100 shadow-[4px_4px_0px_#3b82f6]'
                      : 'bg-purple-950/95 border-purple-400 text-purple-100 shadow-[4px_4px_0px_#a855f7]'
                  }`}
                >
                  <button
                    onClick={() =>
                      setAbilityPopups((prev) => prev.filter((p) => p.id !== popup.id))
                    }
                    className="absolute top-1.5 right-1.5 p-0.5 text-neutral-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 tracking-wider ${
                        popup.isPlayer
                          ? 'bg-blue-500 text-white font-bold'
                          : 'bg-purple-500 text-white font-bold'
                      }`}
                    >
                      {popup.isPlayer ? 'Your Power Activated' : 'Opponent Power Activated'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-6 h-6 shrink-0 bg-neutral-900 border border-neutral-600 flex items-center justify-center p-0.5">
                      <CullingPieceComponent type={popup.casterType} color={popup.color} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black uppercase tracking-wide truncate">
                        {popup.casterName}
                      </div>
                      <div className="text-[10px] font-bold opacity-90 truncate flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        {popup.abilityName} → {popup.targetSquare}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 bg-neutral-100 dark:bg-[#0f172a] border border-dashed border-black/25 dark:border-white/25 text-[10px] text-neutral-400 text-center font-bold">
                Special technique notifications appear here (Blue for yours, Purple for opponent)
              </div>
            )}
          </div>

          {/* 3. Sorcerer Character Roster (Quick Info on Click) */}
          <div className="p-2 bg-neutral-100 dark:bg-[#0f172a] border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] shrink-0">
            <div className="flex items-center justify-between mb-1 text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-300">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-500" />
                Tap Piece for Moniker
              </span>
              <span className="text-neutral-400 font-mono text-[9px]">16 Pieces</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {Object.keys(CULLING_ROSTER).map((key) => {
                const info = CULLING_ROSTER[key as CullingPieceType];
                return (
                  <button
                    key={key}
                    onClick={() => handleInspectPiece(key, info.team)}
                    className="w-7 h-7 p-1 bg-white dark:bg-[#1e293b] hover:bg-amber-400/20 hover:border-amber-400 border border-black/30 dark:border-white/30 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    title={`${info.name} (${info.role})`}
                  >
                    <CullingPieceComponent type={info.type} color={info.team} />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Maximized Board & Compact Top/Bottom Status Trays (No Player Names) */}
        <section className="flex-1 flex flex-col items-center justify-center gap-1 shrink-0 h-full max-h-full">
          {/* Opponent Slim Status Tray (No Player Name to Maximize Board Height) */}
          <div
            className={`w-full max-w-[min(calc(100vh-135px),640px)] px-3 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] flex items-center justify-between transition-colors shrink-0 ${
              match.turn === opponentColor
                ? 'bg-amber-400 text-black'
                : 'bg-neutral-100 dark:bg-[#0f172a] text-black dark:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-black uppercase px-1.5 py-0.2 border border-black shadow-[1px_1px_0px_#000] ${
                  opponentColor === 'white' ? 'bg-white text-black' : 'bg-black text-white'
                }`}
              >
                {opponentColor.toUpperCase()} (OPPONENT)
              </span>

              {/* Captured piece tray for opponent */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-[200px]">
                {opponentCaptured.length === 0 ? (
                  <span className="text-[10px] font-bold opacity-75">
                    {match.turn === opponentColor
                      ? isBotThinking
                        ? 'Thinking...'
                        : 'To Move'
                      : 'Waiting'}
                  </span>
                ) : (
                  opponentCaptured.slice(-6).map((p, idx) => (
                    <button
                      key={`opp-cap-${idx}`}
                      onClick={() => handleInspectPiece(p.type, p.color)}
                      className="w-4 h-4 p-0.5 bg-neutral-200 dark:bg-neutral-800 border border-black/40 hover:scale-125 transition-transform cursor-pointer"
                      title="Inspect captured piece"
                    >
                      <CullingPieceComponent type={p.type} color={p.color} />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white dark:bg-black px-2 py-0.5 border border-black dark:border-white shadow-[1px_1px_0px_#000] dark:shadow-[1px_1px_0px_#fff]">
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="font-mono text-xs font-black">{formatTime(opponentTime)}</span>
            </div>
          </div>

          {/* Maximized 10x10 Cross Board Grid */}
          <div className="flex items-center justify-center shrink-0">
            <CullingBoard
              match={match}
              myColor={userColor}
              isInteractive={match.status === 'active' && match.turn === userColor && !isBotThinking}
              onMove={handleMove}
              flipped={flipped}
              onPieceClick={(piece) =>
                handleInspectPiece(piece.type, piece.color as CullingPieceColor)
              }
            />
          </div>

          {/* Player Slim Status Tray (No Player Name to Maximize Board Height) */}
          <div
            className={`w-full max-w-[min(calc(100vh-135px),640px)] px-3 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] flex items-center justify-between transition-colors shrink-0 ${
              match.turn === userColor
                ? 'bg-amber-400 text-black'
                : 'bg-neutral-100 dark:bg-[#0f172a] text-black dark:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-black uppercase px-1.5 py-0.2 border border-black shadow-[1px_1px_0px_#000] ${
                  userColor === 'white' ? 'bg-white text-black' : 'bg-black text-white'
                }`}
              >
                {userColor.toUpperCase()} (YOU)
              </span>

              {/* Captured piece tray for player */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-[200px]">
                {playerCaptured.length === 0 ? (
                  <span className="text-[10px] font-bold opacity-75">
                    {match.turn === userColor ? 'Your Turn to Strike' : 'Opponent Turn'}
                  </span>
                ) : (
                  playerCaptured.slice(-6).map((p, idx) => (
                    <button
                      key={`plyr-cap-${idx}`}
                      onClick={() => handleInspectPiece(p.type, p.color)}
                      className="w-4 h-4 p-0.5 bg-neutral-200 dark:bg-neutral-800 border border-black/40 hover:scale-125 transition-transform cursor-pointer"
                      title="Inspect captured piece"
                    >
                      <CullingPieceComponent type={p.type} color={p.color} />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white dark:bg-black px-2 py-0.5 border border-black dark:border-white shadow-[1px_1px_0px_#000] dark:shadow-[1px_1px_0px_#fff]">
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="font-mono text-xs font-black">{formatTime(playerTime)}</span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Red Conclusion Banner / Match Status + SAN Technique Log + Match Actions */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-2 shrink-0 h-auto lg:h-full lg:overflow-hidden">
          {/* Red Game Conclusion Sidebar Banner */}
          {match.status === 'completed' && (
            <div className="p-3 bg-red-600 text-white border-3 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] animate-in fade-in duration-150 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-black text-xs uppercase">
                  <Trophy className="w-4 h-4 text-white" />
                  <span>Match Concluded</span>
                </div>
                <button
                  onClick={() => setShowGameOverModal(true)}
                  className="text-[9px] bg-black text-white px-2 py-0.5 font-bold uppercase border border-white cursor-pointer hover:bg-neutral-800"
                >
                  View Modal
                </button>
              </div>
              <p className="text-[11px] font-bold mb-2 text-red-100">
                {match.winReason || `${match.winner?.toUpperCase()} achieved victory!`}
              </p>
              <div className="flex gap-2">
                {onPlaySimilarBot && (
                  <button
                    onClick={onPlaySimilarBot}
                    className="flex-1 py-1.5 bg-black hover:bg-neutral-800 text-white font-black text-[10px] uppercase border border-white cursor-pointer"
                  >
                    Vs Bot
                  </button>
                )}
                {onPlayMultiplayer && (
                  <button
                    onClick={onPlayMultiplayer}
                    className="flex-1 py-1.5 bg-white hover:bg-neutral-100 text-red-700 font-black text-[10px] uppercase border border-black cursor-pointer"
                  >
                    Challenge
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Turn & Status Card */}
          <div className="p-2.5 bg-neutral-100 dark:bg-[#0f172a] border-2 sm:border-3 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Turn {match.turnCount}
              </span>
              <div className="text-xs sm:text-sm font-black uppercase text-amber-500">
                {match.turn === 'white' ? "White's Turn" : "Black's Turn"}
              </div>
            </div>
            {match.turnCount <= 5 && (
              <span className="text-[9px] bg-sky-500 text-white px-1.5 py-0.5 font-bold uppercase border border-black shadow-[1px_1px_0px_#000]">
                Infinity Shield (T{match.turnCount}/5)
              </span>
            )}
          </div>

          {/* Standard Technique SAN History Log */}
          <div className="bg-white dark:bg-[#0f172a] border-2 sm:border-3 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] flex flex-col flex-1 min-h-[140px] max-h-[220px] lg:max-h-none overflow-hidden">
            <div className="p-2 bg-neutral-200 dark:bg-[#1e293b] border-b-2 border-black dark:border-white flex items-center justify-between text-[11px] font-black uppercase shrink-0">
              <span>SAN Move Notation ({match.history.length})</span>
              <span className="text-[9px] font-mono text-neutral-500">Max 200</span>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-1 text-xs font-mono">
              {match.history.length === 0 ? (
                <div className="text-neutral-400 dark:text-slate-500 text-center py-6 font-bold text-xs">
                  Moves will record here in algebraic format.
                </div>
              ) : (
                match.history.map((m, idx) => {
                  const charInfo = CULLING_ROSTER[m.piece.type];
                  return (
                    <div
                      key={`san-move-${idx}`}
                      onClick={() => handleInspectPiece(m.piece.type, m.piece.color)}
                      className="p-1 bg-neutral-100 dark:bg-[#1e293b] border border-black/15 dark:border-white/15 flex items-center justify-between hover:border-amber-400 cursor-pointer transition-colors"
                      title="Inspect piece details"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-neutral-400 w-4 text-[10px]">{idx + 1}.</span>
                        <span className="font-bold truncate text-[11px]">
                          {charInfo ? charInfo.name : m.piece.type}
                        </span>
                      </div>
                      <span className="text-amber-500 dark:text-amber-400 font-bold shrink-0 text-xs">
                        {m.san}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={moveLogEndRef} />
            </div>
          </div>

          {/* Quick Match Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onPlaySimilarBot && (
              <button
                onClick={onPlaySimilarBot}
                className="flex-1 py-2 bg-neutral-100 dark:bg-[#0f172a] hover:bg-neutral-200 dark:hover:bg-slate-800 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black uppercase flex items-center justify-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <Bot className="w-3.5 h-3.5 text-amber-500" />
                <span>Vs Bot</span>
              </button>
            )}
            {onPlayMultiplayer && (
              <button
                onClick={onPlayMultiplayer}
                className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase flex items-center justify-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Direct Challenge</span>
              </button>
            )}
          </div>
        </aside>
      </main>

      {/* Rules Modal */}
      <CullingRulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
};
