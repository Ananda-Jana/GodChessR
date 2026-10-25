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
import {
  executeCullingMove,
  resignCullingMatch,
  handleCullingTimeout,
  getLegalMovesForSquare,
} from '../game/cullingEngine';
import { getBestCullingBotMove } from '../game/cullingBot';
import { sounds } from '../utils/audio';
import { RulebookWindow } from './rulebook/RulebookWindow';

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
  Send,
  Search,
  ChevronDown,
  Download,
  Sparkles,
  FileText,
} from 'lucide-react';
import { usePredictor } from '../predictor/PredictorContext';
import { PredictorPanel } from './PredictorPanel';
import { extractCullingMetrics, observeCullingMove } from '../predictor/adapters/cullingAdapter';
import { downloadCardAsPng } from '../predictor/canvasCardRenderer';
import { TrophyRoomModal } from './TrophyRoomModal';
import type { AchievementCard } from '../predictor/types';
import { LiveAnnouncer } from './LiveAnnouncer';

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

type MobileActiveTab = 'abilities' | 'logs' | 'inspector' | 'roster' | null;

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

  // Selected piece data for inspector & valid move derivations
  const [selectedPieceData, setSelectedPieceData] = useState<{
    type: CullingPieceType;
    color: CullingPieceColor;
    pos?: CullingPos;
  } | null>(null);

  // Inspected piece floating toast state
  const [inspectedPiece, setInspectedPiece] = useState<{
    name: string;
    role: string;
    type: CullingPieceType;
    team: CullingPieceColor;
  } | null>(null);

  // Red GameOver modal visibility state
  const [showGameOverModal, setShowGameOverModal] = useState(match.status === 'completed');

  // Mobile active tab bottom sheet
  const [mobileTab, setMobileTab] = useState<MobileActiveTab>(null);
  const [inspectorSubTab, setInspectorSubTab] = useState<'stats' | 'lore' | 'buffs'>('stats');

  // Ability pop-up notifications stack
  const [abilityPopups, setAbilityPopups] = useState<AbilityPopup[]>([]);
  const processedMovesRef = useRef<number>(initialMatch.history.length);

  const moveLogEndRef = useRef<HTMLDivElement | null>(null);
  const mobileMoveLogEndRef = useRef<HTMLDivElement | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const boardStageRef = useRef<HTMLElement | null>(null);
  const [boardDimension, setBoardDimension] = useState<number>(() => {
    if (typeof window === 'undefined') return 520;
    if (window.innerWidth >= 1024) {
      const sidebars = window.innerWidth >= 1280 ? 640 : 576;
      const availW = Math.min(window.innerWidth, 1640) - sidebars - 48;
      const availH = window.innerHeight - 64;
      return Math.max(240, Math.floor(Math.min(availW, availH, 1200)));
    }
    const isMobile = window.innerWidth < 768;
    return Math.max(240, Math.floor(Math.min(isMobile ? window.innerWidth : window.innerWidth - 16, window.innerHeight - 140, 540)));
  });

  useEffect(() => {
    const el = boardStageRef.current;
    if (!el) return;

    const updateBoardSize = (width: number, height: number) => {
      const isMobile = window.innerWidth < 768;
      const available = isMobile
        ? Math.floor(Math.min(width, height))
        : Math.floor(Math.min(width - 8, height - 8));
      if (available > 120) {
        setBoardDimension(Math.min(available, 1200));
      }
    };

    const rect = el.getBoundingClientRect();
    updateBoardSize(rect.width, rect.height);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateBoardSize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isRulesOpen]);

  const { observeMoveAction, finalizeMatch, latestMatchCards } = usePredictor();
  const [earnedCullingCards, setEarnedCullingCards] = useState<AchievementCard[]>([]);
  const displayCullingCards = earnedCullingCards.length > 0 ? earnedCullingCards : latestMatchCards;
  const [isCullingTrophyRoomOpen, setIsCullingTrophyRoomOpen] = useState(false);
  const [selectedCullingCard, setSelectedCullingCard] = useState<AchievementCard | null>(null);
  const hasCullingFinalizedRef = useRef(false);

  // Real-time Culling move tracking
  useEffect(() => {
    if (match && match.history.length > 0) {
      const metrics = extractCullingMetrics(match, userColor);
      const action = observeCullingMove(match, userColor);
      if (action) {
        observeMoveAction(action, metrics);
      }
    }
  }, [match?.history.length, userColor, match, observeMoveAction]);

  // Culling match finalization
  useEffect(() => {
    if (match && match.status === 'completed' && !hasCullingFinalizedRef.current) {
      hasCullingFinalizedRef.current = true;
      const metrics = extractCullingMetrics(match, userColor);
      const outcome = match.winner === userColor ? 'win' : match.winner === null ? 'draw' : 'loss';
      const opponentName = userColor === 'white' ? match.blackPlayer.displayName : match.whitePlayer.displayName;
      const cards = finalizeMatch(
        match.id,
        'culling',
        userColor,
        outcome,
        metrics,
        opponentName,
        isBotMatch ? 'grandmaster' : 'pvp_human'
      );
      setEarnedCullingCards(cards);
    }
  }, [match?.status, match, userColor, isBotMatch, finalizeMatch]);

  // When match completes, trigger red modal and game-over audio
  useEffect(() => {
    if (match.status === 'completed') {
      setShowGameOverModal(true);
      sounds.playGameOver();
    }
  }, [match.status]);

  // ARIA Live Announcements
  const [announcement, setAnnouncement] = useState('');
  const lastTurnRef = useRef(match.turn);
  const lastInCheckRef = useRef(match.inCheck);

  useEffect(() => {
    if (match.status === 'completed' && match.winner !== undefined) {
      const winner = match.winner;
      const reason = match.winReason || 'Game Finished';
      setAnnouncement(`Game over. ${winner === null ? 'It is a draw' : `${winner} wins`}. ${reason}.`);
      return;
    }

    if (match.turn !== lastTurnRef.current) {
      const turnLabel = match.turn === 'white' ? "White's turn" : "Black's turn";
      setAnnouncement(turnLabel);
      lastTurnRef.current = match.turn;
    }

    if (match.inCheck && match.inCheck !== lastInCheckRef.current) {
      setAnnouncement(prev => `Check! ${prev}`);
      lastInCheckRef.current = match.inCheck;
    } else if (!match.inCheck) {
      lastInCheckRef.current = null;
    }
  }, [match.turn, match.inCheck, match.status, match.winner, match.winReason]);

  // Audio warning on check
  useEffect(() => {
    if (match.inCheck && match.status === 'active') {
      sounds.playCheck();
    }
  }, [match.inCheck, match.status]);

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

  // Monitor move history to spawn ability popups & trigger ability sounds
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
          sounds.playAbility();
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
    mobileMoveLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [match.history.length, mobileTab]);

  // Synchronize state from multiplayer socket
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if ((msg.type === 'culling:state' || msg.type === 'culling:moved') && msg.match) {
          setMatch(msg.match);
          if (msg.match.lastMove?.captured) {
            sounds.playCapture();
          } else {
            sounds.playMove();
          }
        } else if (msg.type === 'culling:clock') {
          setMatch((prev) => {
            if (prev.status !== 'active') return prev;
            return {
              ...prev,
              whiteTimeRemaining: msg.whiteTimeRemaining,
              blackTimeRemaining: msg.blackTimeRemaining,
            };
          });
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
            const executedMove = res.state.lastMove;
            if (executedMove?.captured) {
              sounds.playCapture();
            } else if (executedMove?.isSpecialAbility || executedMove?.actionType !== 'move') {
              sounds.playAbility();
            } else {
              sounds.playMove();
            }

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
        const executedMove = res.state.lastMove;
        if (executedMove?.captured) {
          sounds.playCapture();
        } else if (executedMove?.isSpecialAbility || executedMove?.actionType !== 'move') {
          sounds.playAbility();
        } else {
          sounds.playMove();
        }

        const nextState = res.state;
        setMatch(nextState);

        const botColor: CullingPieceColor = userColor === 'white' ? 'black' : 'white';
        if (nextState.status === 'active' && nextState.turn === botColor) {
          runBotTurn(nextState, botColor);
        }
      }
    } else if (socket && socket.readyState === WebSocket.OPEN) {
      sounds.playMove();
      const activeUserId = userColor === 'white' ? match.whitePlayer.userId : match.blackPlayer.userId;
      socket.send(
        JSON.stringify({
          type: 'culling:move',
          matchId: match.id,
          from,
          to,
          actionType: actionType || 'move',
          userId: activeUserId,
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

  const handleOpenRules = () => {
    setIsRulesOpen(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Last moved piece
  const lastMovedPiece = match.lastMove ? match.lastMove.piece : null;

  // Derive valid moves for the currently selected piece
  const selectedLegalMoves = useMemo(() => {
    if (!selectedPieceData?.pos) return [];
    return getLegalMovesForSquare(match, selectedPieceData.pos);
  }, [selectedPieceData, match]);

  // Human-readable narrative steps
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

  return (
    <div
      className={`w-screen bg-neutral-950 text-white flex flex-col font-sans relative ${
        isRulesOpen
          ? 'min-h-[100dvh] overflow-y-auto touch-auto select-text'
          : 'h-[100dvh] max-h-[100dvh] overflow-hidden touch-manipulation lg:touch-auto select-none lg:select-auto'
      }`}
    >
      {/* Inspected piece toast banner */}
      {inspectedPiece && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-sm w-[92%] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="bg-neutral-900 text-white border-2 border-amber-400 shadow-[4px_4px_0px_#f59e0b] px-3 py-2 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 shrink-0 bg-black border border-neutral-700 flex items-center justify-center p-0.5">
                <CullingPieceComponent type={inspectedPiece.type} color={inspectedPiece.team} />
              </div>
              <div className="truncate">
                <div className="text-xs font-black uppercase tracking-wide text-amber-400 truncate">
                  {inspectedPiece.name}
                </div>
                <div className="text-[10px] text-neutral-300 font-bold truncate">
                  {inspectedPiece.role}
                </div>
              </div>
            </div>
            <button
              onClick={() => setInspectedPiece(null)}
              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Prominent Red Game-Over Modal */}
      {showGameOverModal && match.status === 'completed' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-red-600 text-white border-4 border-white shadow-[8px_8px_0px_#000] p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowGameOverModal(false)}
              className="absolute top-3 right-3 p-1 text-white hover:bg-red-700 border-2 border-white cursor-pointer"
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
                Domain Climax
              </span>
              <h2 className="text-2xl font-black uppercase text-white mb-2">
                {isMatchDraw ? 'Stalemate / Draw' : isUserWinner ? 'Glorious Victory!' : 'Domain Defeat'}
              </h2>
              <p className="text-xs font-bold text-red-100 bg-red-700/80 border border-red-500 px-3 py-1.5 mb-4 w-full">
                {match.winReason || 'Game Finished'}
              </p>
              {displayCullingCards.length > 0 && (
                <div className="w-full bg-[#0f172a] border-2 border-amber-400 p-2.5 mb-4 text-left">
                  <div className="text-[10px] font-black uppercase text-amber-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Earned Culling Badges (Click badge to inspect & download)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {displayCullingCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => {
                          setSelectedCullingCard(card);
                          setIsCullingTrophyRoomOpen(true);
                        }}
                        className="p-2 bg-black/80 hover:bg-black border-2 border-amber-400 cursor-pointer flex items-center gap-2 shadow-[2px_2px_0px_#000] hover:scale-105 transition-all"
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

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => {
                    if (displayCullingCards.length > 0) {
                      setSelectedCullingCard(displayCullingCards[0]);
                    }
                    setIsCullingTrophyRoomOpen(true);
                  }}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 text-black" />
                  View Session Trophy Room
                </button>
                {onPlaySimilarBot && (
                  <button
                    onClick={() => {
                      setShowGameOverModal(false);
                      onPlaySimilarBot();
                    }}
                    className="w-full py-2 bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase border-2 border-white shadow-[2px_2px_0px_#000] cursor-pointer"
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
                    className="w-full py-2 bg-white hover:bg-neutral-100 text-red-700 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    Direct Challenge Multiplayer
                  </button>
                )}
                <button
                  onClick={() => setShowGameOverModal(false)}
                  className="w-full py-1.5 bg-red-800 hover:bg-red-700 text-white font-bold text-xs uppercase border border-white/60 cursor-pointer"
                >
                  Inspect Final Board
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT PINNED TOP HUD (Zero Jitter, Solid Anchor) */}
      <header className="px-2.5 sm:px-4 py-1.5 border-b-2 border-neutral-800 bg-[#0c1017] shrink-0 flex items-center justify-between gap-1.5 z-20 h-12">
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onExit}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 shadow-[1px_1px_0px_#fff] cursor-pointer"
            title="Exit"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-200" />
          </button>
          <div className="hidden sm:flex items-center gap-1">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider">Culling</span>
          </div>
        </div>

        {/* Center: Live Timers & Turn Indicator */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Opponent Timer Chip */}
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 border text-[11px] font-mono transition-colors ${
              match.turn === opponentColor
                ? 'bg-amber-400 text-black border-amber-300 font-black shadow-[0_0_8px_#f59e0b]'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800'
            }`}
          >
            <span className="text-[9px] uppercase font-bold opacity-80">
              {opponentColor === 'white' ? 'W' : 'B'}
            </span>
            <Clock className="w-3 h-3" />
            <span>{formatTime(opponentTime)}</span>
          </div>

          {/* Turn Badge / Check Alert */}
          <div
            className={`px-2 py-0.5 border text-[10px] font-black uppercase tracking-wider shrink-0 ${
              match.inCheck
                ? 'bg-red-600 text-white border-white animate-pulse shadow-[0_0_10px_#ef4444]'
                : match.turn === userColor
                ? 'bg-amber-500 text-black border-black font-black'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700'
            }`}
          >
            {match.inCheck
              ? `${match.inCheck.toUpperCase()} IN CHECK!`
              : match.turn === userColor
              ? 'YOUR TURN'
              : 'OPPONENT TURN'}
          </div>

          {/* Player Timer Chip */}
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 border text-[11px] font-mono transition-colors ${
              match.turn === userColor
                ? 'bg-amber-400 text-black border-amber-300 font-black shadow-[0_0_8px_#f59e0b]'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800'
            }`}
          >
            <span className="text-[9px] uppercase font-bold opacity-80">
              {userColor === 'white' ? 'W' : 'B'} (YOU)
            </span>
            <Clock className="w-3 h-3" />
            <span>{formatTime(playerTime)}</span>
          </div>
        </div>

        {/* Right: Quick Utility Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setFlipped((prev) => !prev)}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 cursor-pointer"
            title="Flip Board"
          >
            <RotateCw className="w-3.5 h-3.5 text-neutral-300" />
          </button>
          <button
            onClick={handleOpenRules}
            className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] uppercase border border-black cursor-pointer hidden sm:flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3" />
            <span>Theory</span>
          </button>
          <button
            onClick={handleOpenRules}
            className="p-1.5 bg-amber-500 text-black border border-black cursor-pointer sm:hidden"
            title="Theory Book"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResign}
            disabled={match.status !== 'active'}
            className="p-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white border border-neutral-800 cursor-pointer"
            title="Resign"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Mobile-Only 1-Line Predictor Bar */}
      <div className="lg:hidden shrink-0 w-full border-b border-neutral-800">
        <PredictorPanel
          metrics={extractCullingMetrics(match, userColor)}
          modeLabel="Culling Game"
        />
      </div>

      {/* MAIN VIEWPORT: ROCK-SOLID BOARD (Fitted Square Center Stage) */}
      <main className="flex-1 min-h-0 w-full max-w-[1640px] mx-auto px-0 pt-0 pb-[60px] md:px-1 md:pt-1 lg:px-3 lg:py-2 flex flex-row items-center lg:items-stretch justify-between gap-0 lg:gap-3 overflow-hidden relative">
        {/* DESKTOP-ONLY LEFT SIDEBAR: Predictor, Logs, Abilities & Roster */}
        <aside className="hidden lg:flex w-72 xl:w-80 flex-col gap-2 shrink-0 h-full min-h-0 overflow-hidden">
          {/* Universal Live Skill Predictor Panel */}
          <PredictorPanel
            metrics={extractCullingMetrics(match, userColor)}
            modeLabel="Culling Game"
          />

          {/* 1. Step Announcements Box */}
          <div className="bg-[#0f172a] border-2 border-white/20 shadow-[2px_2px_0px_#000] flex flex-col h-44 shrink-0 overflow-hidden">
            <div className="px-2.5 py-1 bg-[#1e293b] border-b border-white/20 flex items-center justify-between text-[11px] font-black uppercase text-amber-400">
              <span className="flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />
                Step Announcements
              </span>
              <span className="font-mono text-[9px] bg-black text-white px-1.5 py-0.2">
                T{match.turnCount}
              </span>
            </div>
            <div className="flex-1 p-2 overflow-y-auto space-y-1 text-xs font-mono">
              {narrativeSteps.length === 0 ? (
                <div className="text-neutral-500 text-center py-6 text-xs">Waiting for first step...</div>
              ) : (
                narrativeSteps.map((step) => (
                  <div
                    key={`step-${step.index}`}
                    onClick={() => handleInspectPiece(step.type, step.color)}
                    className="p-1 bg-[#1e293b]/70 border border-white/10 hover:border-amber-400 cursor-pointer flex items-start gap-1 text-[11px]"
                  >
                    <span className="text-amber-500 font-bold shrink-0">#{step.index}</span>
                    <span className="text-neutral-200">{step.text}</span>
                  </div>
                ))
              )}
              <div ref={moveLogEndRef} />
            </div>
          </div>

          {/* 2. Special Ability Stack */}
          <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-y-auto">
            {abilityPopups.length > 0 ? (
              abilityPopups.map((popup) => (
                <div
                  key={popup.id}
                  className={`p-2 border-2 animate-in slide-in-from-left duration-150 ${
                    popup.isPlayer
                      ? 'bg-blue-950/95 border-blue-400 text-blue-100 shadow-[3px_3px_0px_#3b82f6]'
                      : 'bg-purple-950/95 border-purple-400 text-purple-100 shadow-[3px_3px_0px_#a855f7]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-black uppercase">
                    <span className={popup.isPlayer ? 'text-blue-400' : 'text-purple-400'}>
                      {popup.isPlayer ? 'Your Power' : 'Opponent Power'}
                    </span>
                    <button
                      onClick={() => setAbilityPopups((prev) => prev.filter((p) => p.id !== popup.id))}
                      className="cursor-pointer text-neutral-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 shrink-0 bg-neutral-900 border border-neutral-700 flex items-center justify-center p-0.5">
                      <CullingPieceComponent type={popup.casterType} color={popup.color} />
                    </div>
                    <div className="min-w-0 text-xs truncate">
                      <div className="font-black uppercase truncate">{popup.casterName}</div>
                      <div className="text-[10px] text-amber-300 font-bold truncate">
                        {popup.abilityName} → {popup.targetSquare}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-[#0f172a] border border-dashed border-white/20 text-[10px] text-neutral-500 text-center font-bold">
                Special abilities and domain techniques appear here
              </div>
            )}
          </div>

          {/* 3. Character Roster Quick Monograph */}
          <div className="p-2 bg-[#0f172a] border border-white/20 shrink-0">
            <div className="flex items-center justify-between mb-1 text-[10px] font-black uppercase text-neutral-400">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-400" />
                Tap Piece for Moniker
              </span>
              <span className="font-mono text-[9px]">16 Pieces</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {Object.keys(CULLING_ROSTER).map((key) => {
                const info = CULLING_ROSTER[key as CullingPieceType];
                return (
                  <button
                    key={key}
                    onClick={() => handleInspectPiece(key, info.team)}
                    className="w-7 h-7 p-0.5 bg-[#1e293b] hover:border-amber-400 border border-white/20 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                    title={`${info.name} (${info.role})`}
                  >
                    <CullingPieceComponent type={info.type} color={info.team} />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: FULLY IMMOBILE ROCK-SOLID SQUARE BOARD */}
        <section
          ref={boardStageRef}
          className="flex-1 min-w-0 min-h-0 h-full flex items-center justify-center overflow-hidden relative touch-manipulation"
        >
          <div
            style={{
              width: `${boardDimension}px`,
              height: `${boardDimension}px`,
            }}
            className="relative flex items-center justify-center shrink-0 aspect-square"
          >
            <CullingBoard
              match={match}
              myColor={userColor}
              isInteractive={match.status === 'active' && match.turn === userColor && !isBotThinking}
              onMove={handleMove}
              flipped={flipped}
              maxDimension={boardDimension}
              onPieceClick={(piece) => {
                setSelectedPieceData({
                  type: piece.type as CullingPieceType,
                  color: piece.color as CullingPieceColor,
                  pos: piece.pos,
                });
                handleInspectPiece(piece.type, piece.color as CullingPieceColor);
              }}
            />
          </div>
        </section>

        {/* DESKTOP-ONLY RIGHT SIDEBAR: Active Piece Inspector + Valid Moves + SAN History */}
        <aside className="hidden lg:flex w-72 xl:w-80 flex-col gap-2 shrink-0 h-full min-h-0 overflow-hidden">
          {/* Active Piece Inspector (Big Box, similar to Rose Paradise) */}
          <div className="bg-[#0f172a] p-4 border-2 border-white/20 shadow-[4px_4px_0px_#000] flex flex-col shrink-0">
            <div className="flex items-center justify-between border-b-2 border-white/10 pb-2 mb-3">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Active Piece Inspector
              </span>
              <span className="text-[10px] font-mono text-neutral-400">Combat State</span>
            </div>

            {(() => {
              const targetPiece = (selectedPieceData && selectedPieceData.pos && match.board[selectedPieceData.pos.y] && match.board[selectedPieceData.pos.y][selectedPieceData.pos.x])
                || (match.lastMove ? match.lastMove.piece : null);

              const isSelectedByMe = selectedPieceData && selectedPieceData.color === userColor;
              const isLastMoveMine = match.lastMove && match.lastMove.piece.color === userColor;
              const isMine = isSelectedByMe || (match.lastMove && !selectedPieceData && isLastMoveMine);

              if (!targetPiece) {
                return (
                  <div className="py-6 text-center text-neutral-400 text-xs font-mono">
                    Click any piece on the board to inspect.
                  </div>
                );
              }

              const charInfo = CULLING_ROSTER[targetPiece.type];
              const pieceName = charInfo ? charInfo.name : targetPiece.type.toUpperCase();
              const pieceRole = charInfo ? charInfo.role : targetPiece.color;
              
              const actionMsg = isMine
                ? `You are moving the ${pieceName}`
                : `Opponent (${targetPiece.color === 'white' ? 'White' : 'Black'}) is moving the ${pieceName}`;

              return (
                <div className="flex flex-col items-center gap-3 py-1">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-950 border-3 border-amber-400 p-2 flex items-center justify-center shadow-[4px_4px_0px_#f59e0b]">
                    <CullingPieceComponent type={targetPiece.type} color={targetPiece.color} />
                  </div>
                  <div className="text-center w-full">
                    <div className="font-black text-sm uppercase text-white truncate">{pieceName}</div>
                    <div className="text-[11px] text-neutral-300 font-bold uppercase mt-0.5">{pieceRole}</div>
                    <div className="text-xs text-amber-300 font-mono mt-1 font-bold leading-relaxed">
                      {actionMsg}!
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Selected Piece Valid Moves Box */}
          <div className="bg-[#0f172a] p-3 border-2 border-white/20 shadow-[2px_2px_0px_#000] flex flex-col flex-1 min-h-0 overflow-hidden">
            <span className="text-[10px] font-black uppercase text-neutral-400 mb-1.5">
              Valid Destinations {selectedPieceData ? `(${selectedPieceData.type})` : ''}
            </span>
            {selectedPieceData ? (
              <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto border border-white/10 bg-black/40 p-2 text-xs">
                  {selectedLegalMoves.length === 0 ? (
                    <div className="text-neutral-500 text-[11px] py-2 text-center">
                      {match.turn !== userColor ? 'Not your turn' : 'No legal moves available'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {selectedLegalMoves.map((m, idx) => (
                        <div
                          key={`valid-${idx}`}
                          className="px-1.5 py-1 bg-[#1e293b] border border-white/20 text-center font-mono text-[11px] font-bold"
                        >
                          {posToCullingSquare(m.to)}
                          {m.actionType && m.actionType !== 'move' && (
                            <span className="block text-[8px] text-amber-400 uppercase font-sans">
                              {m.actionType}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-neutral-500 text-xs font-mono">
                Click a piece on the board to view its valid destinations
              </div>
            )}
          </div>

          {/* Algebraic SAN Move History */}
          <div className="bg-[#0f172a] border border-white/20 p-2 shrink-0 h-32 flex flex-col overflow-hidden">
            <span className="text-[10px] font-black uppercase text-neutral-400 mb-1">
              SAN Notation History ({match.history.length})
            </span>
            <div className="flex-1 overflow-y-auto space-y-0.5 text-xs font-mono">
              {match.history.length === 0 ? (
                <div className="text-neutral-500 text-center py-4 text-xs">No moves logged</div>
              ) : (
                match.history.map((m, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] px-1 py-0.5 hover:bg-white/5">
                    <span className="text-neutral-500">{idx + 1}.</span>
                    <span className="font-bold text-neutral-300">{CULLING_ROSTER[m.piece.type]?.name}</span>
                    <span className="text-amber-400 font-bold">{m.san}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* MOBILE-ONLY SLIDE-UP BOTTOM SHEET (Overlaid, Zero Board Shift) */}
      {mobileTab && (
        <div className="lg:hidden fixed bottom-14 left-0 right-0 max-h-[46dvh] z-40 bg-[#0c1017]/98 backdrop-blur-md border-t-3 border-amber-400 shadow-[0_-8px_30px_rgba(0,0,0,0.85)] flex flex-col animate-in slide-in-from-bottom-5 duration-150">
          {/* Drawer Header with Title and Close Button */}
          <div className="px-3 py-1.5 bg-[#161d2b] border-b border-neutral-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400">
              {mobileTab === 'abilities' && <Zap className="w-3.5 h-3.5" />}
              {mobileTab === 'logs' && <FileText className="w-3.5 h-3.5" />}
              {mobileTab === 'inspector' && <Search className="w-3.5 h-3.5" />}
              {mobileTab === 'roster' && <Users className="w-3.5 h-3.5" />}
              <span>
                {mobileTab === 'abilities'
                  ? 'Special Abilities Feed'
                  : mobileTab === 'logs'
                  ? 'Steps & SAN Notation'
                  : mobileTab === 'inspector'
                  ? 'Piece Inspector'
                  : 'Sorcerer Roster'}
              </span>
            </div>
            <button
              onClick={() => setMobileTab(null)}
              className="p-1 text-neutral-300 hover:text-white cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-3 text-xs">
            {/* 1. Abilities Tab */}
            {mobileTab === 'abilities' && (
              <div className="space-y-2">
                {abilityPopups.length > 0 ? (
                  abilityPopups.map((popup) => (
                    <div
                      key={popup.id}
                      className={`p-2 border-2 ${
                        popup.isPlayer
                          ? 'bg-blue-950/95 border-blue-400 text-blue-100'
                          : 'bg-purple-950/95 border-purple-400 text-purple-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 shrink-0 bg-neutral-900 border border-neutral-700 flex items-center justify-center p-0.5">
                          <CullingPieceComponent type={popup.casterType} color={popup.color} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-black uppercase truncate">{popup.casterName}</div>
                          <div className="text-[10px] text-amber-300 font-bold truncate">
                            {popup.abilityName} → {popup.targetSquare}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-neutral-400 text-xs">
                    No active abilities in the current queue. Techniques trigger during combat!
                  </div>
                )}
              </div>
            )}

            {/* 2. Logs & Moves Tab */}
            {mobileTab === 'logs' && (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-black uppercase text-amber-400 mb-1">
                    Live Step Announcements
                  </div>
                  <div className="space-y-1 font-mono text-[11px] max-h-36 overflow-y-auto">
                    {narrativeSteps.map((step) => (
                      <div
                        key={`m-step-${step.index}`}
                        onClick={() => handleInspectPiece(step.type, step.color)}
                        className="p-1 bg-[#161d2b] border border-neutral-700 flex items-start gap-1"
                      >
                        <span className="text-amber-500 font-bold">#{step.index}</span>
                        <span>{step.text}</span>
                      </div>
                    ))}
                    <div ref={mobileMoveLogEndRef} />
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase text-amber-400 mb-1">
                    Algebraic SAN History
                  </div>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                    {match.history.map((m, i) => (
                      <div key={`m-san-${i}`} className="p-1 bg-[#161d2b] border border-neutral-700 flex justify-between">
                        <span className="text-neutral-500">{i + 1}.</span>
                        <span className="text-amber-400 font-bold">{m.san}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Mobile Inspector Tab (Full-Width Single-Column Tabbed Card Drawer) */}
            {mobileTab === 'inspector' && (
              <div className="flex flex-col gap-2.5">
                {/* Inspector Sub-Tabs */}
                <div className="flex items-center gap-1 bg-[#161d2b] p-1 border border-neutral-700">
                  <button
                    type="button"
                    onClick={() => setInspectorSubTab('stats')}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase transition-all ${
                      inspectorSubTab === 'stats'
                        ? 'bg-amber-400 text-black shadow-[1px_1px_0px_#000]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Piece Stats
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorSubTab('lore')}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase transition-all ${
                      inspectorSubTab === 'lore'
                        ? 'bg-amber-400 text-black shadow-[1px_1px_0px_#000]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Technique Lore
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorSubTab('buffs')}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase transition-all ${
                      inspectorSubTab === 'buffs'
                        ? 'bg-amber-400 text-black shadow-[1px_1px_0px_#000]'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Buffs &amp; Domain
                  </button>
                </div>

                {/* Sub-Tab 1: Piece Stats */}
                {inspectorSubTab === 'stats' && (
                  <div className="flex flex-col gap-2 bg-[#161d2b] border border-neutral-700 p-3">
                    {selectedPieceData ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-neutral-950 border-2 border-amber-400 p-1 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#f59e0b]">
                            <CullingPieceComponent
                              type={selectedPieceData.type}
                              color={selectedPieceData.color}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-black uppercase text-amber-400 block truncate">
                              {CULLING_ROSTER[selectedPieceData.type]?.name || selectedPieceData.type}
                            </span>
                            <span className="text-xs text-neutral-300 font-bold uppercase block truncate">
                              {CULLING_ROSTER[selectedPieceData.type]?.role || selectedPieceData.color}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 block">
                              Team: {selectedPieceData.color.toUpperCase()} · Pos: {selectedPieceData.pos ? posToCullingSquare(selectedPieceData.pos) : 'Unknown'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-700">
                          <span className="text-[10px] font-black uppercase text-amber-400 block mb-1">
                            Legal Destinations ({selectedLegalMoves.length})
                          </span>
                          {selectedLegalMoves.length === 0 ? (
                            <span className="text-[11px] text-neutral-400 font-mono block">
                              {match.turn !== userColor ? 'Not your turn' : 'No legal destinations from this square'}
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {selectedLegalMoves.map((m, idx) => (
                                <span
                                  key={`mob-move-${idx}`}
                                  className="px-2 py-1 bg-neutral-900 border border-neutral-600 font-mono text-xs font-bold text-amber-300"
                                >
                                  {posToCullingSquare(m.to)}
                                  {m.actionType && m.actionType !== 'move' && ` (${m.actionType})`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : lastMovedPiece ? (
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-neutral-950 border-2 border-white/60 p-1 flex items-center justify-center shrink-0">
                          <CullingPieceComponent type={lastMovedPiece.type} color={lastMovedPiece.color} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black uppercase text-neutral-400 block">
                            Opponent's Last Move
                          </span>
                          <span className="text-sm font-black uppercase text-white block truncate">
                            {CULLING_ROSTER[lastMovedPiece.type]?.name}
                          </span>
                          <span className="text-[11px] font-mono text-amber-400 block">
                            {match.lastMove ? `Moved to ${posToCullingSquare(match.lastMove.to)}` : ''}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-neutral-400 font-mono text-xs">
                        Tap any piece on the board to inspect full stats and legal moves
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Tab 2: Technique Lore */}
                {inspectorSubTab === 'lore' && (
                  <div className="bg-[#161d2b] border border-neutral-700 p-3 space-y-2">
                    {selectedPieceData ? (
                      <div>
                        <span className="text-xs font-black uppercase text-amber-400 block">
                          {CULLING_ROSTER[selectedPieceData.type]?.name}: Innate Technique
                        </span>
                        <p className="text-[11px] font-mono text-neutral-300 mt-1 leading-relaxed">
                          {CULLING_ROSTER[selectedPieceData.type]?.role}. Armed with unique 500 CE movement vectors. When Cursed Energy surges, specialized techniques unlock devastating tactical line-of-sight strikes.
                        </p>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-neutral-400 font-mono text-xs">
                        Tap a sorcerer to read their cursed lore and innate technique profile
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Tab 3: Buffs & Domain */}
                {inspectorSubTab === 'buffs' && (
                  <div className="bg-[#161d2b] border border-neutral-700 p-3 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between border-b border-neutral-700 pb-1.5">
                      <span className="text-neutral-400 uppercase font-black text-[10px]">Cursed Energy Level:</span>
                      <span className="text-amber-400 font-black">120 / 150 CE</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-700 pb-1.5">
                      <span className="text-neutral-400 uppercase font-black text-[10px]">Colony Rule Change:</span>
                      <span className="text-purple-400 font-black">{match.history.length * 5} / 100 Points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 uppercase font-black text-[10px]">Domain Barrier:</span>
                      <span className="text-emerald-400 font-black">Normal Geometry Active</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Roster Tab */}
            {mobileTab === 'roster' && (
              <div>
                <div className="text-[10px] font-black uppercase text-neutral-400 mb-2">
                  Tap any sorcerer to view moniker
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(CULLING_ROSTER).map((key) => {
                    const info = CULLING_ROSTER[key as CullingPieceType];
                    return (
                      <button
                        key={`mob-roster-${key}`}
                        onClick={() => handleInspectPiece(key, info.team)}
                        className="p-1.5 bg-[#161d2b] border border-neutral-700 hover:border-amber-400 flex flex-col items-center text-center cursor-pointer active:scale-95 transition-transform"
                      >
                        <div className="w-8 h-8 mb-1">
                          <CullingPieceComponent type={info.type} color={info.team} />
                        </div>
                        <span className="text-[9px] font-bold uppercase truncate w-full">
                          {info.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE-ONLY FIXED BOTTOM TAB BAR (Quick Thumb Navigation) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0c1017] border-t-2 border-neutral-800 z-30 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.5)]">
        {/* Tab 1: Abilities */}
        <button
          onClick={() => setMobileTab((prev) => (prev === 'abilities' ? null : 'abilities'))}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors relative ${
            mobileTab === 'abilities' ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-tight">Powers</span>
          {abilityPopups.length > 0 && (
            <span className="absolute top-1.5 right-1/4 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          )}
        </button>

        {/* Tab 2: Logs & Notation */}
        <button
          onClick={() => setMobileTab((prev) => (prev === 'logs' ? null : 'logs'))}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            mobileTab === 'logs' ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-tight">Logs</span>
        </button>

        {/* Tab 3: Piece Inspector */}
        <button
          onClick={() => setMobileTab((prev) => (prev === 'inspector' ? null : 'inspector'))}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            mobileTab === 'inspector' ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-tight">Inspector</span>
        </button>

        {/* Tab 4: Roster */}
        <button
          onClick={() => setMobileTab((prev) => (prev === 'roster' ? null : 'roster'))}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            mobileTab === 'roster' ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-tight">Roster</span>
        </button>
      </nav>

      {/* Full-screen Theory & Rulebook Window */}
      <RulebookWindow
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        initialMode="culling"
      />

      <TrophyRoomModal
        isOpen={isCullingTrophyRoomOpen}
        onClose={() => setIsCullingTrophyRoomOpen(false)}
        initialSelectedCard={selectedCullingCard}
      />
      <LiveAnnouncer
        message={announcement}
        type={Boolean(match.inCheck || match.status === 'completed') ? 'assertive' : 'polite'}
      />
    </div>
  );
};
