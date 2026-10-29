import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRoseRoom, RoseChatMessage } from './useRoseRoom';
import { useAuth } from '../context/AuthContext';
import { ChessPiece } from './ChessPiece';
import { getLegalMovesForSquare } from '../game/engine';
import {
  createInitialRoseMatch,
  applyRoseMove,
  applyRoseSummon,
  getValidRoseSummonSquares,
  getRoseCheckDetails,
} from './roseRules';
import {
  getBestRoseBotMove,
  getBotSummonChoice,
  getRandomBotReaction,
  getRandomBotMessage,
} from './roseBot';
import type { RoseMatchState, RoseRole, RoseSeat, RoseSummonPieceType } from './types';
import type { PieceColor } from '../types/game';
import { sounds } from '../utils/audio';
import { reportGameEnd, triggerChestModalNow } from '../chest/reportGameEnd';
import {
  Heart,
  Sparkles,
  Copy,
  ArrowLeft,
  BookOpen,
  Trophy,
  Check,
  RefreshCw,
  Users,
  Zap,
  Flag,
  X,
  Send,
  MessageSquare,
  Bot,
  Crown,
  Download,
  Loader2,
  ShieldAlert,
  Plus,
  KeyRound,
  Gift,
} from 'lucide-react';
import './rose.css';
import { usePredictor } from '../predictor/PredictorContext';
import { PredictorPanel } from '../components/PredictorPanel';
import { extractRoseMetrics, observeRoseMove } from '../predictor/adapters/roseAdapter';
import { downloadCardAsPng } from '../predictor/canvasCardRenderer';
import { TrophyRoomModal } from '../components/TrophyRoomModal';
import { RulebookWindow } from '../components/rulebook/RulebookWindow';
import type { AchievementCard } from '../predictor/types';

interface RoseParadiseViewProps {
  onBack: () => void;
}

const SUMMON_CATALOG: { type: RoseSummonPieceType; name: string; role: string; desc: string }[] = [
  { type: 'queen', name: 'Queen 👑', role: 'Royal Empress', desc: 'Omnidirectional straight & diagonal' },
  { type: 'rook', name: 'Rook 🏰', role: 'Castle Tower', desc: 'Orthogonal straight paths' },
  { type: 'bishop', name: 'Bishop ⛪', role: 'Royal Cleric', desc: 'Long-range diagonal diagonals' },
  { type: 'knight', name: 'Knight ♞', role: 'Valiant Cavalier', desc: '2x1 leaping jumps' },
  { type: 'priest', name: 'Cupid Priest 🏹', role: 'Angel of Hearts', desc: 'Bishop diagonal + ranged charming' },
  { type: 'communist', name: 'Thorn Guard 🌹', role: 'Iron Rose', desc: 'Knight hop + orthogonal strikes' },
  { type: 'supremeRook', name: 'Rose Tower 🛡️', role: 'Bastion Fortress', desc: 'Unstoppable fortress rook' },
  { type: 'pawn', name: 'Pawn ♟️', role: 'Loyal Footman', desc: 'Advance 1 step & diagonal capture' },
];

const PIECE_DISPLAY_NAMES: Record<string, string> = {
  pawn: 'Loyal Footman (Pawn)',
  knight: 'Valiant Cavalier (Knight)',
  bishop: 'Royal Cleric (Bishop)',
  rook: 'Castle Tower (Rook)',
  queen: 'Royal Empress (Queen)',
  king: 'Royal Sovereign (King)',
  prince: 'Prince',
  communist: 'Thorn Guard (Communist)',
  supremeRook: 'Rose Tower (Supreme Rook)',
  priest: 'Cupid Priest',
  culling_gojo: 'Gojo Satoru',
  culling_sukuna: 'Ryomen Sukuna',
  culling_yuji: 'Itadori Yuji',
  culling_kenjaku: 'Kenjaku',
  culling_panda: 'Panda',
  culling_nanami: 'Kento Nanami',
  culling_maki: 'Maki Zenin',
  culling_hakari: 'Kinji Hakari',
  culling_uraume: 'Uraume',
  culling_yorozu: 'Yorozu',
  culling_reggie: 'Reggie Star',
  culling_naoya: 'Naoya Zenin',
  culling_kurourushi: 'Kurourushi',
};

export const RoseParadiseView: React.FC<RoseParadiseViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  
  // Custom multiplayer room hook
  const {
    match: socketMatch,
    myColor: socketMyColor,
    publicRooms,
    hostedCode,
    isCreatingChallenge,
    isJoiningChallenge,
    isQueueing,
    joiningCode,
    statusMessage,
    error: socketError,
    setError: setSocketError,
    reactions: socketReactions,
    chatMessages: socketChatMessages,
    createRoom,
    joinQueue,
    cancelQueue,
    joinRoom,
    cancelRoom,
    sendMove: socketSendMove,
    sendSummon: socketSendSummon,
    sendReaction: socketSendReaction,
    sendChat: socketSendChat,
    resignMatch: socketResignMatch,
    clearMatch: socketClearMatch,
    refreshRooms,
  } = useRoseRoom();

  // Local Bot Match State (for playing against Bot Boyfriend or Girlfriend)
  const [isBotMatch, setIsBotMatch] = useState(false);
  const [botMatch, setBotMatch] = useState<RoseMatchState | null>(null);
  const [botPlayerRole, setBotPlayerRole] = useState<RoseRole>('boyfriend');
  const [botUserRole, setBotUserRole] = useState<RoseRole>('girlfriend');
  const [botLocalChat, setBotLocalChat] = useState<RoseChatMessage[]>([]);
  const [botLocalReactions, setBotLocalReactions] = useState<{ id: string; text: string }[]>([]);
  const isBotThinkingRef = useRef(false);

  // Common UI State
  const [selectedRole, setSelectedRole] = useState<RoseRole>('boyfriend');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [selectedSquare, setSelectedSquare] = useState<{ x: number; y: number } | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<{ x: number; y: number }[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [chatInputText, setChatInputText] = useState('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Lovingly Concede Confirmation Modal (replaces browser confirm)
  const [showConcedeConfirm, setShowConcedeConfirm] = useState(false);

  // Initial Romantic Rulebook Modal (pops up on game start, untimed)
  const [showRulebook, setShowRulebook] = useState(false);
  const [isAutoTriggeredRulebook, setIsAutoTriggeredRulebook] = useState(false);
  const [rulebookSubTab, setRulebookSubTab] = useState<'movement_book' | 'overview'>('movement_book');
  const [hasShownRulebookOnce, setHasShownRulebookOnce] = useState(false);

  // Summon selection & placement mode
  const [isSummonModalOpen, setIsSummonModalOpen] = useState(false);
  const [summoningUnit, setSummoningUnit] = useState<RoseSummonPieceType | null>(null);

  // Active match selection (bot match takes precedence if active, else socket match)
  const activeMatch = isBotMatch ? botMatch : socketMatch;

  const handleConcedeMatch = () => {
    setShowConcedeConfirm(false);
    if (activeMatch) {
      try {
        const myMoves = activeMatch.history ? activeMatch.history.filter((h) => h.piece.color === effectiveMyColor).length : 0;
        reportGameEnd({ matchId: activeMatch.id, mode: 'rose', result: 'loss', moves: myMoves, isTraining: false, userId: user?.id, resigned: true });
      } catch {}
    }
    if (isBotMatch && botMatch) {
      const opponentRoleName = botPlayerRole === 'boyfriend' ? 'Boyfriend Bot' : 'Girlfriend Bot';
      const finished: RoseMatchState = {
        ...botMatch,
        status: 'completed',
        winner: botPlayerRole,
        winReason: `You lovingly conceded to ${opponentRoleName}.`,
      };
      setBotMatch(finished);
      sounds.playGameOver();
      const concedeMsg = getRandomBotMessage('concede', botPlayerRole);
      setBotLocalChat((prev) => [
        ...prev.slice(-30),
        {
          id: `bot_concede_${Date.now()}`,
          senderUserId: 'usr_bot',
          senderDisplayName: opponentRoleName,
          text: concedeMsg,
          timestamp: Date.now(),
        },
      ]);
    } else {
      socketResignMatch();
      sounds.playGameOver();
    }
  };

  // Automatically pop open Rulebook modal once when match becomes active
  useEffect(() => {
    if (activeMatch && activeMatch.status === 'active' && !hasShownRulebookOnce) {
      setIsAutoTriggeredRulebook(true);
      setShowRulebook(true);
      setHasShownRulebookOnce(true);
    }
  }, [activeMatch?.status, hasShownRulebookOnce]);

  // Determine user colors and seats
  const effectiveMyColor: PieceColor = isBotMatch
    ? (botUserRole === 'boyfriend' ? 'white' : 'black')
    : (socketMyColor || (socketMatch?.whiteSeat?.userId === user?.id ? 'white' : 'black'));

  const mySeat = activeMatch ? (effectiveMyColor === 'white' ? activeMatch.whiteSeat : activeMatch.blackSeat) : null;
  const opponentSeat = activeMatch ? (effectiveMyColor === 'white' ? activeMatch.blackSeat : activeMatch.whiteSeat) : null;
  const isMyTurn = activeMatch?.status === 'active' && activeMatch.turn === effectiveMyColor;

  const reactions = isBotMatch ? botLocalReactions : socketReactions;
  const chatMessages = isBotMatch ? botLocalChat : socketChatMessages;

  // Calculate valid summon squares anywhere on board
  const validSummonSquares = useMemo(() => {
    if (!summoningUnit || !activeMatch || !isMyTurn) return [];
    return getValidRoseSummonSquares(activeMatch.board, effectiveMyColor, summoningUnit);
  }, [summoningUnit, activeMatch?.board, isMyTurn, effectiveMyColor]);

  // Compute check details for check & ray path highlighting
  const checkDetails = useMemo(() => {
    if (!activeMatch) return { inCheck: false, kingPos: null, attackerPositions: [], rayPositions: [] };
    return getRoseCheckDetails(activeMatch.board, effectiveMyColor);
  }, [activeMatch?.board, effectiveMyColor]);

  const isInCheck = checkDetails.inCheck;

  const { observeMoveAction, finalizeMatch, latestMatchCards } = usePredictor();
  const [earnedRoseCards, setEarnedRoseCards] = useState<AchievementCard[]>([]);
  const displayRoseCards = earnedRoseCards.length > 0 ? earnedRoseCards : latestMatchCards;
  const [isRoseTrophyRoomOpen, setIsRoseTrophyRoomOpen] = useState(false);
  const [selectedRoseCard, setSelectedRoseCard] = useState<AchievementCard | null>(null);
  const hasRoseFinalizedRef = useRef(false);

  // Real-time Rose move tracking
  useEffect(() => {
    if (activeMatch && activeMatch.history && activeMatch.history.length > 0) {
      const metrics = extractRoseMetrics(activeMatch, effectiveMyColor);
      const action = observeRoseMove(activeMatch, effectiveMyColor);
      if (action) {
        observeMoveAction(action, metrics);
      }
    }
  }, [activeMatch?.history?.length, effectiveMyColor, activeMatch, observeMoveAction]);

  // Rose match finalization
  useEffect(() => {
    if (activeMatch && activeMatch.status === 'completed' && !hasRoseFinalizedRef.current) {
      hasRoseFinalizedRef.current = true;
      const metrics = extractRoseMetrics(activeMatch, effectiveMyColor);
      const outcome = activeMatch.winner === mySeat?.role ? 'win' : activeMatch.winner === 'draw' ? 'draw' : 'loss';
      const opponentName = opponentSeat?.displayName || 'Partner';
      const cards = finalizeMatch(
        activeMatch.id,
        'rose',
        effectiveMyColor,
        outcome,
        metrics,
        opponentName,
        'couples_partner'
      );
      setEarnedRoseCards(cards);
      try {
        const myMoves = activeMatch.history ? activeMatch.history.filter((h) => h.piece.color === effectiveMyColor).length : 0;
        const isResigned = Boolean(activeMatch.winReason?.toLowerCase().includes('conceded') || activeMatch.winReason?.toLowerCase().includes('resign'));
        reportGameEnd({ matchId: activeMatch.id, mode: 'rose', result: outcome, moves: myMoves, isTraining: false, userId: user?.id, resigned: isResigned });
      } catch {}
    }
  }, [activeMatch?.status, activeMatch, effectiveMyColor, mySeat?.role, opponentSeat?.displayName, finalizeMatch]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ==================== BOT OPPONENT TURN RUNNER ====================
  const runBotTurn = useCallback((currentMatch: RoseMatchState, botColor: PieceColor) => {
    if (currentMatch.status !== 'active' || isBotThinkingRef.current) return;
    isBotThinkingRef.current = true;

    setTimeout(() => {
      let state = { ...currentMatch };
      const botSeat = botColor === 'white' ? state.whiteSeat : state.blackSeat;

      // 1. Bot Summon Check: if bot has 3 petals and summonsUsed < 2, perform tactical summon
      if (botSeat && botSeat.petals >= 3 && botSeat.summonsUsed < 2) {
        const summonChoice = getBotSummonChoice(state, botColor);
        if (summonChoice) {
          const summonRes = applyRoseSummon(state, botSeat.userId, summonChoice.pieceType, summonChoice.pos);
          if (summonRes.success && summonRes.state) {
            setBotMatch(summonRes.state);
            sounds.playAbility();
            const summonMsg = getRandomBotMessage('summon', botPlayerRole);
            setBotLocalChat((prev) => [
              ...prev.slice(-30),
              {
                id: `bot_chat_${Date.now()}`,
                senderUserId: botSeat.userId,
                senderDisplayName: botSeat.displayName,
                text: summonMsg,
                timestamp: Date.now(),
              },
            ]);
            const rx = getRandomBotReaction(botPlayerRole, 'summon');
            const rxId = `rx_${Date.now()}`;
            setBotLocalReactions((prev) => [...prev.slice(-8), { id: rxId, text: rx }]);
            setTimeout(() => {
              setBotLocalReactions((prev) => prev.filter((r) => r.id !== rxId));
            }, 3500);
            isBotThinkingRef.current = false;
            return; // CRITICAL: Summon consumes the bot's turn!
          }
        }
      }

      // 2. Bot Move Decision using Minimax & heuristics
      const bestMove = getBestRoseBotMove(state, botColor);
      if (bestMove) {
        const res = applyRoseMove(state, bestMove.from, bestMove.to);
        if (res.success && res.state) {
          state = res.state;
          const opponentColor: PieceColor = botColor === 'white' ? 'black' : 'white';
          if (state.status === 'completed') {
            sounds.playGameOver();
            const overMsg = getRandomBotMessage('gameOverWin', botPlayerRole);
            setBotLocalChat((prev) => [
              ...prev.slice(-30),
              {
                id: `bot_chat_${Date.now()}`,
                senderUserId: botSeat?.userId || 'bot',
                senderDisplayName: botSeat?.displayName || 'Bot Partner',
                text: overMsg,
                timestamp: Date.now(),
              },
            ]);
          } else if (state.inCheck === opponentColor) {
            sounds.playCheck();
            const checkMsg = getRandomBotMessage('check', botPlayerRole);
            setBotLocalChat((prev) => [
              ...prev.slice(-30),
              {
                id: `bot_chat_${Date.now()}`,
                senderUserId: botSeat?.userId || 'bot',
                senderDisplayName: botSeat?.displayName || 'Bot Partner',
                text: checkMsg,
                timestamp: Date.now(),
              },
            ]);
          } else if (bestMove.captured) {
            sounds.playCapture();
            const capMsg = getRandomBotMessage('capture', botPlayerRole);
            setBotLocalChat((prev) => [
              ...prev.slice(-30),
              {
                id: `bot_chat_${Date.now()}`,
                senderUserId: botSeat?.userId || 'bot',
                senderDisplayName: botSeat?.displayName || 'Bot Partner',
                text: capMsg,
                timestamp: Date.now(),
              },
            ]);
          } else {
            sounds.playMove();
            // 45% chance of sweet banter message
            if (Math.random() < 0.45) {
              const sweetMsg = getRandomBotMessage('randomTurn', botPlayerRole);
              setBotLocalChat((prev) => [
                ...prev.slice(-30),
                {
                  id: `bot_chat_${Date.now()}`,
                  senderUserId: botSeat?.userId || 'bot',
                  senderDisplayName: botSeat?.displayName || 'Bot Partner',
                  text: sweetMsg,
                  timestamp: Date.now(),
                },
              ]);
            }
          }

          // Trigger bot reaction emoji
          if (Math.random() < 0.6) {
            const rx = getRandomBotReaction(botPlayerRole);
            const rxId = `rx_${Date.now()}`;
            setBotLocalReactions((prev) => [...prev.slice(-8), { id: rxId, text: rx }]);
            setTimeout(() => {
              setBotLocalReactions((prev) => prev.filter((r) => r.id !== rxId));
            }, 3500);
          }
        }
      }

      setBotMatch(state);
      isBotThinkingRef.current = false;
    }, 700);
  }, [botPlayerRole]);

  // Trigger bot turn if active match is on bot's turn
  useEffect(() => {
    if (isBotMatch && botMatch && botMatch.status === 'active') {
      const botColor: PieceColor = effectiveMyColor === 'white' ? 'black' : 'white';
      if (botMatch.turn === botColor) {
        runBotTurn(botMatch, botColor);
      }
    }
  }, [isBotMatch, botMatch?.turn, botMatch?.status, effectiveMyColor, runBotTurn]);

  // Start vs-Bot match
  const handleStartBotMatch = (botRoleChoice: RoseRole) => {
    const userRoleChoice: RoseRole = botRoleChoice === 'boyfriend' ? 'girlfriend' : 'boyfriend';
    const userColor: PieceColor = userRoleChoice === 'boyfriend' ? 'white' : 'black';
    const botColor: PieceColor = userColor === 'white' ? 'black' : 'white';

    const userSeat: RoseSeat = {
      userId: user?.id || 'usr_human',
      username: user?.username || 'You',
      displayName: user?.displayName || 'You',
      avatarId: user?.avatarId,
      role: userRoleChoice,
      color: userColor,
      petals: 0,
      summonsUsed: 0,
      lastLoveLinkTurn: 0,
      resumeToken: 'tok_user',
      isConnected: true,
      lastSeen: Date.now(),
    };

    const botSeat: RoseSeat = {
      userId: 'usr_bot',
      username: botRoleChoice === 'boyfriend' ? 'bot_boyfriend' : 'bot_girlfriend',
      displayName: botRoleChoice === 'boyfriend' ? 'Boyfriend Bot 👑' : 'Girlfriend Bot 👸',
      avatarId: botRoleChoice === 'boyfriend' ? 'avatar_prince' : 'avatar_queen',
      role: botRoleChoice,
      color: botColor,
      petals: 0,
      summonsUsed: 0,
      lastLoveLinkTurn: 0,
      resumeToken: 'tok_bot',
      isConnected: true,
      lastSeen: Date.now(),
    };

    const initialMatch = createInitialRoseMatch(
      `rose_bot_${Date.now()}`,
      'ROSE-BOT-SOLO',
      userSeat,
      0, // Untimed
      true
    );

    // Seat both players
    if (userColor === 'white') {
      initialMatch.whiteSeat = userSeat;
      initialMatch.blackSeat = botSeat;
    } else {
      initialMatch.whiteSeat = botSeat;
      initialMatch.blackSeat = userSeat;
    }
    initialMatch.status = 'active';

    setBotPlayerRole(botRoleChoice);
    setBotUserRole(userRoleChoice);
    setBotMatch(initialMatch);
    setIsBotMatch(true);
    setBotLocalChat([
      {
        id: `bot_welcome_${Date.now()}`,
        senderUserId: 'usr_bot',
        senderDisplayName: botSeat.displayName,
        text: getRandomBotMessage('start', botRoleChoice),
        timestamp: Date.now(),
      },
    ]);
    sounds.playChallenge();
  };

  // ==================== BOARD CLICK LOGIC ====================
  const handleSquareClick = (x: number, y: number) => {
    if (!activeMatch || activeMatch.status !== 'active' || !isMyTurn) return;

    // 1. Summon Placement Mode: Anywhere on the board that does not give direct check
    if (summoningUnit) {
      const isValid = validSummonSquares.some((sq) => sq.x === x && sq.y === y);
      if (isValid) {
        if (isBotMatch) {
          const res = applyRoseSummon(activeMatch, user?.id || 'usr_human', summoningUnit, { x, y });
          if (res.success && res.state) {
            setBotMatch(res.state);
            sounds.playAbility();
            const botName = opponentSeat?.displayName || (botPlayerRole === 'boyfriend' ? 'Boyfriend Bot 👑' : 'Girlfriend Bot 👸');
            const summonReact = getRandomBotMessage('playerSummon', botPlayerRole);
            setBotLocalChat((prev) => [
              ...prev.slice(-30),
              {
                id: `bot_summon_react_${Date.now()}`,
                senderUserId: 'usr_bot',
                senderDisplayName: botName,
                text: summonReact,
                timestamp: Date.now(),
              },
            ]);
            const rx = getRandomBotReaction(botPlayerRole, 'playerSummon');
            const rxId = `rx_${Date.now()}`;
            setBotLocalReactions((prev) => [...prev.slice(-8), { id: rxId, text: rx }]);
            setTimeout(() => {
              setBotLocalReactions((prev) => prev.filter((r) => r.id !== rxId));
            }, 3500);
          }
        } else {
          socketSendSummon(summoningUnit, { x, y });
          sounds.playAbility();
        }
        setSummoningUnit(null);
        setSelectedSquare(null);
        setLegalDestinations([]);
      }
      return;
    }

    const piece = activeMatch.board[y][x];

    // 2. Destination move click
    if (selectedSquare) {
      if (selectedSquare.x === x && selectedSquare.y === y) {
        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }
      const isLegal = legalDestinations.some((d) => d.x === x && d.y === y);
      if (isLegal) {
        if (isBotMatch) {
          const res = applyRoseMove(activeMatch, selectedSquare, { x, y });
          if (res.success && res.state) {
            setBotMatch(res.state);
            const botSeat = opponentSeat;
            const botName = botSeat?.displayName || (botPlayerRole === 'boyfriend' ? 'Boyfriend Bot 👑' : 'Girlfriend Bot 👸');
            const botColor: PieceColor = effectiveMyColor === 'white' ? 'black' : 'white';

            if (res.state.status === 'completed') {
              sounds.playGameOver();
              const loseMsg = getRandomBotMessage('gameOverLose', botPlayerRole);
              setBotLocalChat((prev) => [
                ...prev.slice(-30),
                {
                  id: `bot_lose_react_${Date.now()}`,
                  senderUserId: 'usr_bot',
                  senderDisplayName: botName,
                  text: loseMsg,
                  timestamp: Date.now(),
                },
              ]);
            } else if (res.state.inCheck === botColor) {
              sounds.playCheck();
              const checkReactMsg = getRandomBotMessage('botInCheck', botPlayerRole);
              setBotLocalChat((prev) => [
                ...prev.slice(-30),
                {
                  id: `bot_check_react_${Date.now()}`,
                  senderUserId: 'usr_bot',
                  senderDisplayName: botName,
                  text: checkReactMsg,
                  timestamp: Date.now(),
                },
              ]);
              const rx = getRandomBotReaction(botPlayerRole, 'botInCheck');
              const rxId = `rx_${Date.now()}`;
              setBotLocalReactions((prev) => [...prev.slice(-8), { id: rxId, text: rx }]);
              setTimeout(() => {
                setBotLocalReactions((prev) => prev.filter((r) => r.id !== rxId));
              }, 3500);
            } else if (res.state.lastMove && activeMatch.board[y][x]) {
              sounds.playCapture();
              const reactMsg = getRandomBotMessage('playerCaptured', botPlayerRole);
              setBotLocalChat((prev) => [
                ...prev.slice(-30),
                {
                  id: `bot_cap_react_${Date.now()}`,
                  senderUserId: 'usr_bot',
                  senderDisplayName: botName,
                  text: reactMsg,
                  timestamp: Date.now(),
                },
              ]);
              if (Math.random() < 0.6) {
                const rx = getRandomBotReaction(botPlayerRole, 'playerCaptured');
                const rxId = `rx_${Date.now()}`;
                setBotLocalReactions((prev) => [...prev.slice(-8), { id: rxId, text: rx }]);
                setTimeout(() => {
                  setBotLocalReactions((prev) => prev.filter((r) => r.id !== rxId));
                }, 3500);
              }
            } else {
              sounds.playMove();
            }
          }
        } else {
          socketSendMove(selectedSquare, { x, y });
        }
        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }
    }

    // 3. Piece Selection Click: pass activeMatch.board to getLegalMovesForSquare!
    if (piece && piece.color === effectiveMyColor) {
      setSelectedSquare({ x, y });
      const moves = getLegalMovesForSquare(activeMatch.board, { x, y });
      setLegalDestinations(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalDestinations([]);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    if (isBotMatch) {
      setBotLocalChat((prev) => [
        ...prev.slice(-30),
        {
          id: `usr_msg_${Date.now()}`,
          senderUserId: user?.id || 'usr_human',
          senderDisplayName: user?.displayName || 'You',
          text: chatInputText.trim(),
          timestamp: Date.now(),
        },
      ]);
      // Bot sends playful customized reply back
      setTimeout(() => {
        const replyText = getRandomBotMessage('replyToChat', botPlayerRole);
        const botName = opponentSeat?.displayName || (botPlayerRole === 'boyfriend' ? 'Boyfriend Bot 👑' : 'Girlfriend Bot 👸');
        setBotLocalChat((prev) => [
          ...prev.slice(-30),
          {
            id: `bot_reply_${Date.now()}`,
            senderUserId: 'usr_bot',
            senderDisplayName: botName,
            text: replyText,
            timestamp: Date.now(),
          },
        ]);
        const rx = getRandomBotReaction(botPlayerRole, 'replyToChat');
        const rxId = `rx_${Date.now()}`;
        setBotLocalReactions((prev) => [...prev.slice(-8), { id: rxId, text: rx }]);
        setTimeout(() => {
          setBotLocalReactions((prev) => prev.filter((r) => r.id !== rxId));
        }, 3500);
      }, 750);
    } else {
      socketSendChat(chatInputText.trim());
    }
    setChatInputText('');
  };

  const handleSendReaction = (emo: string) => {
    if (isBotMatch) {
      const rxId = `rx_${Date.now()}`;
      setBotLocalReactions((prev) => [...prev.slice(-8), { id: rxId, text: emo }]);
      setTimeout(() => {
        setBotLocalReactions((prev) => prev.filter((r) => r.id !== rxId));
      }, 3500);

      // Bot playfully responds with a reaction and occasional sweet reply
      setTimeout(() => {
        const botRx = getRandomBotReaction(botPlayerRole, 'replyToReaction');
        const botRxId = `bot_rx_${Date.now()}`;
        setBotLocalReactions((prev) => [...prev.slice(-8), { id: botRxId, text: botRx }]);
        setTimeout(() => {
          setBotLocalReactions((prev) => prev.filter((r) => r.id !== botRxId));
        }, 3500);

        if (Math.random() < 0.65) {
          const replyText = getRandomBotMessage('replyToReaction', botPlayerRole);
          const botName = opponentSeat?.displayName || (botPlayerRole === 'boyfriend' ? 'Boyfriend Bot 👑' : 'Girlfriend Bot 👸');
          setBotLocalChat((prev) => [
            ...prev.slice(-30),
            {
              id: `bot_emo_reply_${Date.now()}`,
              senderUserId: 'usr_bot',
              senderDisplayName: botName,
              text: replyText,
              timestamp: Date.now(),
            },
          ]);
        }
      }, 700);
    } else {
      socketSendReaction(emo);
    }
  };

  // True Chessboard Perspective Mapping:
  // If player is White:
  //   Bottom rank of screen is y=0 (White), Top is y=7 (Black). Ranks: [7, 6, 5, 4, 3, 2, 1, 0]. Files: [0, 1, 2, 3, 4, 5, 6, 7]
  // If player is Black:
  //   Bottom rank of screen is y=7 (Black), Top is y=0 (White). Ranks: [0, 1, 2, 3, 4, 5, 6, 7]. Files: [7, 6, 5, 4, 3, 2, 1, 0]
  const displayYIndices = effectiveMyColor === 'black'
    ? [0, 1, 2, 3, 4, 5, 6, 7]
    : [7, 6, 5, 4, 3, 2, 1, 0];

  const displayXIndices = effectiveMyColor === 'black'
    ? [7, 6, 5, 4, 3, 2, 1, 0]
    : [0, 1, 2, 3, 4, 5, 6, 7];

  const fileLabels = effectiveMyColor === 'black'
    ? ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']
    : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className={`rose-theme ${activeMatch && activeMatch.status !== 'completed' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden md:px-4 md:py-2' : 'min-h-screen overflow-y-auto md:p-6'} flex flex-col p-1 sm:p-3 select-none bg-black text-white font-mono`}>
      {/* Floating Live Reactions */}
      {reactions.map((r) => (
        <div
          key={r.id}
          className="fixed pointer-events-none z-50 text-4xl animate-bounce"
          style={{
            left: `${25 + Math.random() * 50}%`,
            top: `${30 + Math.random() * 40}%`,
          }}
        >
          {r.text}
        </div>
      ))}

      {/* ==================== BRUTALIST TOP NAVIGATION ==================== */}
      <header className={`z-10 w-full flex items-center justify-between border-b-3 md:border-b-4 border-white ${activeMatch ? 'h-12 md:h-12 px-2 md:px-4 mb-1 md:mb-2 shrink-0' : 'max-w-6xl mx-auto pb-4 mb-4'}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              if (activeMatch) {
                if (isBotMatch) {
                  setIsBotMatch(false);
                  setBotMatch(null);
                } else {
                  socketClearMatch();
                }
              } else {
                onBack();
              }
            }}
            className="brutal-button px-2.5 sm:px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer hover:bg-white hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{activeMatch ? 'Leave Match' : 'Main Menu'}</span>
            <span className="sm:hidden">{activeMatch ? 'Leave' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-xl">🌹</span>
            <span className="text-xs sm:text-base font-black tracking-tight uppercase truncate max-w-[120px] sm:max-w-none">
              Rose Paradise
            </span>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-amber-400 text-black font-black uppercase border border-white">
              Couples
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              setIsAutoTriggeredRulebook(false);
              setRulebookSubTab('overview');
              setShowRulebook(true);
            }}
            className="brutal-button px-2.5 sm:px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer text-amber-300 border-amber-300 shadow-[2px_2px_0px_#fbbf24] hover:bg-amber-300 hover:text-black"
          >
            <BookOpen className="w-3.5 h-3.5" /> <span className="hidden sm:inline font-black">Rules</span>
          </button>

          {activeMatch && activeMatch.status === 'active' && (
            <button
              onClick={() => setShowConcedeConfirm(true)}
              className="hidden sm:flex brutal-button px-3 py-1.5 text-xs font-black uppercase items-center gap-1.5 cursor-pointer text-red-400 border-red-400 shadow-[2px_2px_0px_#f43f5e] hover:bg-red-400 hover:text-black"
            >
              <Flag className="w-3.5 h-3.5" /> Concede
            </button>
          )}
        </div>
      </header>

      {statusMessage && (
        <div className="z-10 max-w-5xl mx-auto w-full px-2 mb-3">
          <div className="p-3 bg-amber-400 text-black border-2 border-black font-black text-xs uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000] animate-in fade-in">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {socketError && (
        <div className="z-10 max-w-5xl mx-auto w-full px-2 mb-3">
          <div className="p-3 brutal-card border-red-500 bg-red-950 text-red-200 text-xs sm:text-sm font-black uppercase flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>⚠️ {socketError}</span>
            </div>
            <button onClick={() => setSocketError(null)} className="text-xs underline hover:text-white cursor-pointer">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ==================== 1. LOBBY VIEW (CULLING MULTIPLAYER LOGIC & ROOM GENERATION) ==================== */}
      {!activeMatch && (
        <div className="z-10 max-w-5xl mx-auto w-full flex flex-col gap-6 my-auto py-4">
          {/* Small Banner featuring attached image asset /assets/aistudio/image_0ba7d09e.png optimized for desktop and mobile */}
          <div className="flex justify-center px-2">
            <div className="relative overflow-hidden rounded-xl border-2 sm:border-3 border-rose-500 shadow-[4px_4px_0px_#f43f5e] bg-gradient-to-r from-rose-950 via-black to-rose-950 p-2.5 sm:p-3.5 flex items-center gap-3 sm:gap-4 max-w-md sm:max-w-lg w-full">
              <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 border-2 border-rose-400 overflow-hidden shadow-[2px_2px_0px_#000]">
                <img
                  src="/assets/aistudio/image_0ba7d09e.png"
                  alt="Rose Paradise Emblem"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="text-[10px] sm:text-xs font-mono font-black uppercase text-rose-300 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>Official Rose Paradigm Garden</span>
                </div>
                <div className="text-xs sm:text-sm font-black uppercase text-white truncate">
                  Couples 1v1 · Harmony & Summons
                </div>
                <div className="text-[10px] text-neutral-300 font-mono hidden sm:block mt-0.5">
                  Tactical romantic combat with petals, heart links, and sacred summons.
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Untimed Couples Chess • Direct Room Code Multiplayer
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase flex items-center justify-center gap-2">
              🌹 Rose Paradise Battlegrounds
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl mx-auto font-mono">
              NO TIMERS · NO PRESSURE. Create a custom room code for your partner, join waiting challenges, or play solo against an affectionate AI bot.
            </p>
          </div>

          {/* Prominent Red/Rose Pre-Game Rules Book Gate */}
          <div className="p-3.5 bg-rose-950/60 border-2 border-rose-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-[3px_3px_0px_#f43f5e]">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase text-rose-400 block">
                  New to Rose Paradise / Rose Paradigm Mode?
                </span>
                <span className="text-[11px] font-bold text-neutral-300 font-mono">
                  Read complete couples rules, petal gain mechanics, and Cupid Priest/Thorn Guard summon abilities.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAutoTriggeredRulebook(false);
                setRulebookSubTab('movement_book');
                setShowRulebook(true);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase border-2 border-white shadow-[3px_3px_0px_#fff] cursor-pointer whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>📖 Read Movement & Ability Book</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-left items-stretch">
            {/* DIRECT CHALLENGE MULTIPLAYER */}
            <div className="brutal-card p-5 border-3 border-white shadow-[6px_6px_0px_#fff] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b-2 border-neutral-800 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400 border-2 border-white flex items-center justify-center text-black shadow-[2px_2px_0px_#fff]">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black uppercase text-white">Direct Challenge</h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        1v1 Room Code Battles & Open Lobby
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => refreshRooms()}
                    className="p-1.5 hover:bg-neutral-800 border border-neutral-600 text-neutral-300 hover:text-white cursor-pointer"
                    title="Refresh Open Challenges"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* If user is currently searching in matchmaking queue */}
                {isQueueing ? (
                  <div className="bg-rose-950 text-white p-4 border-2 border-rose-400 shadow-[3px_3px_0px_#f43f5e] mb-4 text-center animate-in fade-in">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                      <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-300">
                        Searching for Partner in Queue...
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-300 my-2">
                      Looking for another Rose Paradise player... The match starts as soon as a partner is found!
                    </p>
                    <button
                      type="button"
                      onClick={() => cancelQueue()}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase border border-white cursor-pointer mt-1"
                    >
                      Cancel Search
                    </button>
                  </div>
                ) : hostedCode ? (
                  <div className="bg-amber-400 text-black p-4 border-2 border-black shadow-[3px_3px_0px_#000] mb-4 text-center animate-in fade-in">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider block mb-1">
                      Waiting for Partner to Join…
                    </span>
                    <div className="flex items-center justify-center gap-2 my-2">
                      <span className="text-xl sm:text-2xl font-mono font-black tracking-widest bg-black text-amber-400 px-3 py-1 border-2 border-black">
                        {hostedCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(hostedCode)}
                        className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
                        title="Copy Room Code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-bold mt-1">
                      Send this Room Code to your partner. The duel begins the second they join!
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => cancelRoom()}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase border border-black cursor-pointer"
                      >
                        Cancel Challenge
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoTriggeredRulebook(false);
                          setRulebookSubTab('movement_book');
                          setShowRulebook(true);
                        }}
                        className="px-3 py-1 bg-black text-white hover:bg-neutral-800 font-black text-[11px] uppercase border border-black cursor-pointer"
                      >
                        📖 Read Codex While Waiting
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Role Picker */}
                    <div className="mb-4">
                      <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                        Choose Your Role
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRole('boyfriend')}
                          className={`p-2.5 border-2 font-black text-xs uppercase transition-all cursor-pointer ${
                            selectedRole === 'boyfriend'
                              ? 'bg-amber-400 text-black border-white shadow-[2px_2px_0px_#fff]'
                              : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                          }`}
                        >
                          👑 Boyfriend (White)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRole('girlfriend')}
                          className={`p-2.5 border-2 font-black text-xs uppercase transition-all cursor-pointer ${
                            selectedRole === 'girlfriend'
                              ? 'bg-rose-500 text-white border-white shadow-[2px_2px_0px_#fff]'
                              : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                          }`}
                        >
                          👸 Girlfriend (Black)
                        </button>
                      </div>
                    </div>

                    {/* Create Room & Quick Match Button Row */}
                    <div className="mb-4 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => createRoom(selectedRole)}
                        disabled={isCreatingChallenge || isQueueing}
                        className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-white shadow-[3px_3px_0px_#fff] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5"
                      >
                        {isCreatingChallenge ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>Create Direct Room</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => joinQueue(selectedRole)}
                        disabled={isCreatingChallenge || isQueueing}
                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase border-2 border-white shadow-[3px_3px_0px_#f43f5e] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5"
                      >
                        {isQueueing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                        <span>Quick Match</span>
                      </button>
                    </div>

                    {/* Join with Room Code Input */}
                    <div className="bg-neutral-950 p-3 border-2 border-white mb-4 shadow-[2px_2px_0px_#fff]">
                      <label className="text-[10px] font-mono font-black uppercase text-neutral-400 block mb-1">
                        Have a Partner's Invite Code?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. ROSE8X2 or 8X2"
                          value={joinCodeInput}
                          maxLength={10}
                          onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && joinCodeInput.trim() && !isJoiningChallenge) {
                              joinRoom(joinCodeInput.trim());
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-neutral-900 border-2 border-neutral-600 font-mono text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (joinCodeInput.trim() && !isJoiningChallenge) joinRoom(joinCodeInput.trim());
                          }}
                          disabled={isJoiningChallenge || !joinCodeInput.trim()}
                          className="px-3 py-1.5 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-black text-xs uppercase border-2 border-white shadow-[2px_2px_0px_#fff] flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                        >
                          {isJoiningChallenge && (!joiningCode || joiningCode === joinCodeInput.trim().toUpperCase()) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <KeyRound className="w-3.5 h-3.5" />
                          )}
                          <span>Join</span>
                        </button>
                      </div>
                    </div>

                    {/* Open Direct Challenges List */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-black uppercase text-neutral-400">
                          Waiting Partners ({publicRooms.length})
                        </span>
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1.5">
                        {publicRooms.length === 0 ? (
                          <div className="text-[11px] text-neutral-500 py-3 text-center font-mono border border-dashed border-neutral-800">
                            No open rooms right now. Create one above!
                          </div>
                        ) : (
                          publicRooms.map((room) => {
                            const isThisJoining = isJoiningChallenge && (joiningCode === room.code || joiningCode === room.code.replace(/[\s-]/g, ''));
                            return (
                              <div
                                key={room.code}
                                className="p-2.5 bg-neutral-950 border border-neutral-700 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="font-black text-white truncate max-w-[150px]">
                                    {room.hostDisplayName}
                                  </div>
                                  <div className="text-[10px] text-neutral-400 font-mono">
                                    Role: {room.hostRole === 'boyfriend' ? '👑 Boyfriend' : '👸 Girlfriend'} • Code: {room.code}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => joinRoom(room.code)}
                                  disabled={isJoiningChallenge}
                                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-75 text-black font-black text-[10px] uppercase border border-white cursor-pointer shadow-[1px_1px_0px_#fff] flex items-center gap-1"
                                >
                                  {isThisJoining ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span>Joining...</span>
                                    </>
                                  ) : (
                                    <span>Join</span>
                                  )}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* PLAY VS AI BOT */}
            <div className="brutal-card p-5 border-3 border-amber-400 shadow-[6px_6px_0px_#fbbf24] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3 border-b-2 border-neutral-800 pb-2">
                  <div className="w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#fff]">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-amber-300">Play vs AI Bot</h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      Affectionate Couples Chess Engine
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-950 p-3 border-2 border-amber-400/50 my-3 text-xs font-bold space-y-1.5 shadow-[2px_2px_0px_#fbbf24]">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Solo Play</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Play solo against an affectionate AI bot with sweet chats & emoji reactions! No wait time, instant turn responses.
                  </p>
                </div>

                <div className="text-[11px] font-mono text-neutral-400 my-2">
                  Untimed Couples Chess • Choose your bot partner below
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleStartBotMatch('boyfriend')}
                  className="w-full py-2.5 px-4 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-wider border-2 border-white shadow-[3px_3px_0px_#fff] flex items-center justify-between cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span className="flex items-center gap-1.5">
                    <span>👑</span>
                    <span>Play vs Boyfriend Bot (White)</span>
                  </span>
                  <span>⚔️</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartBotMatch('girlfriend')}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white shadow-[3px_3px_0px_#f43f5e] flex items-center justify-between cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span className="flex items-center gap-1.5">
                    <span>👸</span>
                    <span>Play vs Girlfriend Bot (Black)</span>
                  </span>
                  <span>🌹</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. ACTIVE MATCH VIEW (PROPER BRUTALISM) ==================== */}
      {activeMatch && (
        <>
          <main className={`flex-1 min-h-0 w-full mx-auto flex flex-col md:grid md:grid-rows-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[280px_minmax(0,1fr)_300px] ${
            activeMatch.status === 'completed'
              ? 'min-h-[calc(100dvh-48px)] h-auto overflow-y-auto'
              : 'h-[calc(100dvh-48px)] md:h-auto overflow-hidden'
          } gap-4 md:gap-4 lg:gap-5 p-1 md:px-3 md:py-1 max-w-[1600px]`}>
            {/* Left Sidebar (Desktop Only): Predictor, Partner Info & In-Game Love Chat Box */}
            <div className="hidden lg:flex lg:min-h-0 flex-col gap-4 overflow-y-auto pr-1">
              {/* Live Skill Predictor Panel */}
              <PredictorPanel
                metrics={extractRoseMetrics(activeMatch, effectiveMyColor)}
                modeLabel="Rose Paradise"
              />

              {/* Partner Info Box */}
              <div className="brutal-card p-4 flex flex-col gap-3 border-3 border-white shadow-[4px_4px_0px_#fff]">
                <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-2">
                  <span className="text-xs font-black uppercase text-neutral-400">Partner</span>
                  <span className="text-xs font-black uppercase text-amber-400">
                    {opponentSeat?.role === 'boyfriend' ? '👑 Boyfriend' : '👸 Girlfriend'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 border-2 border-white flex items-center justify-center font-black text-white shadow-[2px_2px_0px_#fff]">
                    {opponentSeat?.displayName?.slice(0, 2).toUpperCase() || 'P2'}
                  </div>
                  <div>
                    <div className="font-black text-sm text-white">{opponentSeat?.displayName || 'Partner'}</div>
                    <div className="text-xs text-neutral-400 font-mono">
                      {activeMatch.turn === opponentSeat?.color ? '⏳ Thinking with love...' : 'Waiting'}
                    </div>
                  </div>
                </div>

                {/* Petal Meter */}
                <div className="flex items-center justify-between pt-2 border-t-2 border-neutral-800">
                  <span className="text-[11px] font-black uppercase text-neutral-300">Petals Harvested:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((p) => (
                      <span
                        key={p}
                        className={`text-base transition-opacity ${
                          (opponentSeat?.petals || 0) >= p ? 'opacity-100 drop-shadow-[0_0_8px_#f43f5e]' : 'opacity-20'
                        }`}
                      >
                        🌹
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Reactions Palette */}
              <div className="brutal-card p-3 flex flex-col gap-2 border-3 border-rose-400/80 shadow-[4px_4px_0px_#f43f5e] bg-[#12050c]">
                <span className="text-[11px] font-black uppercase text-rose-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Send Reaction
                  </span>
                  <span className="text-[9px] font-mono opacity-70">Tap an emoji</span>
                </span>
                <div className="grid grid-cols-6 gap-1">
                  {['❤️', '🌹', '✨', '💍', '🥰', '😉', '💖', '👑', '🥺', '💅', '🧋', '⚔️'].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => handleSendReaction(emo)}
                      className="p-1.5 bg-neutral-950/80 hover:bg-rose-950 border border-rose-500/40 hover:border-rose-400 text-base cursor-pointer flex items-center justify-center transition-all hover:scale-110 active:scale-95 rounded"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Game Romantic Chat Box - Highlighted with Radiant Rose Glow */}
              <div className="brutal-card p-3.5 flex flex-col gap-2.5 border-3 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.35),4px_4px_0px_#f43f5e] bg-gradient-to-b from-[#180710] to-[#0a0307]">
                <div className="flex items-center justify-between border-b-2 border-rose-500/40 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-rose-300 tracking-wide">
                    <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                    <span>Love Messages & Banter</span>
                  </div>
                  <div className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-rose-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    <span>LIVE</span>
                  </div>
                </div>

                {/* Quick Message Suggestion Chips */}
                <div className="flex flex-wrap gap-1">
                  {[
                    '❤️ Love you',
                    '🌹 Good move!',
                    '😉 Cute!',
                    '🙈 Oops!',
                    '👑 Queen power!',
                    '🧋 Boba date later?',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setChatInputText(chip)}
                      className="px-2 py-0.5 text-[10px] font-bold bg-rose-950/80 hover:bg-rose-900 border border-rose-400/60 hover:border-rose-300 text-rose-200 rounded cursor-pointer transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="h-44 overflow-y-auto flex flex-col gap-2 p-2 bg-[#0c0308] border-2 border-rose-500/50 text-xs font-mono rounded">
                  {chatMessages.length === 0 ? (
                    <div className="text-[11px] text-rose-300/60 italic text-center my-auto flex flex-col items-center gap-1">
                      <Heart className="w-4 h-4 text-rose-500/50" />
                      <span>Say something sweet or playful to your partner...</span>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderUserId === (user?.id || 'usr_human');
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col p-2 border-2 rounded ${
                            isMe
                              ? 'bg-[#220916] border-rose-400 text-rose-100 ml-3 shadow-[1px_1px_0px_#f43f5e]'
                              : 'bg-[#150720] border-fuchsia-400 text-fuchsia-100 mr-3 shadow-[1px_1px_0px_#d946ef]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-[10px] font-black uppercase ${
                                isMe ? 'text-rose-300' : 'text-fuchsia-300'
                              }`}
                            >
                              {msg.senderDisplayName}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="text-white text-xs break-words">{msg.text}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Type a sweet or cheeky message..."
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    className="flex-1 bg-[#13040c] border-2 border-rose-400/80 focus:border-rose-300 px-3 py-1.5 text-xs text-white placeholder-rose-300/40 focus:outline-none focus:ring-1 focus:ring-rose-400 rounded-sm"
                  />
                  <button
                    type="submit"
                    disabled={!chatInputText.trim()}
                    className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-white disabled:opacity-40 text-xs font-black uppercase cursor-pointer border-2 border-white shadow-[2px_2px_0px_#000] flex items-center justify-center transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Center: Brutalist Chess Board (Tier 2 & Desktop Center) */}
            <div className={`flex-1 min-h-0 w-full flex flex-col items-center relative px-0 py-1 md:px-2 md:pt-1 md:pb-3 ${
              activeMatch.status === 'completed' ? 'overflow-y-auto justify-start' : 'overflow-hidden justify-center'
            }`}>
              {/* Turn Banner - Desktop / Tablet */}
              <div className={`hidden md:flex shrink-0 w-full ${summoningUnit ? 'md:w-[min(calc(100dvh-260px),calc(100%-24px),760px)]' : 'md:w-[min(calc(100dvh-208px),calc(100%-24px),760px)]'} px-4 py-2 border-3 border-white shadow-[4px_4px_0px_#fff] items-center justify-between text-xs font-black uppercase mb-2 ${isMyTurn ? 'bg-amber-400 text-black' : 'bg-black text-white'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 ${isMyTurn ? 'bg-black animate-ping' : 'bg-neutral-500'}`} />
                  <span>
                    {isMyTurn
                      ? `👉 YOUR TURN · ${effectiveMyColor === 'white' ? 'White' : 'Black'} TO MOVE (YOU)`
                      : `PARTNER'S TURN · ${effectiveMyColor === 'white' ? 'Black' : 'White'} TO MOVE`}
                  </span>
                </div>
                <div className="text-[11px] font-mono">
                  Move {activeMatch.turnCount}
                </div>
              </div>

              {/* Desktop Universal Summon Placement Mode Banner */}
              {summoningUnit && (
                <div className="hidden md:flex shrink-0 w-full md:w-[min(calc(100dvh-260px),calc(100%-24px),760px)] p-2.5 bg-amber-400 text-black border-3 border-white shadow-[4px_4px_0px_#fff] font-black uppercase text-xs items-center justify-between mb-2">
                  <span>⚡ SUMMON {summoningUnit.toUpperCase()}: Click any highlighted square on the board!</span>
                  <button
                    onClick={() => setSummoningUnit(null)}
                    className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] uppercase font-black cursor-pointer border border-white"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Brutalist Board Tray - Sacred Square Container */}
              <div
                className={`w-full max-w-[100vw] ${summoningUnit ? 'md:w-[min(calc(100dvh-260px),calc(100%-24px),760px)]' : 'md:w-[min(calc(100dvh-208px),calc(100%-24px),760px)]'} aspect-square md:aspect-auto brutal-board-tray board-edge-mobile p-0 md:p-3 border-0 md:border-4 border-white shadow-none md:shadow-[8px_8px_0px_#fff] flex flex-col items-center justify-center shrink-0`}
                style={{ backgroundColor: '#e11d48' }}
              >
                {/* Board Files Top (A - H) - Desktop Only */}
                <div className="hidden md:grid w-full grid-cols-8 text-center text-[10px] sm:text-xs font-black text-white mb-0.5">
                  {fileLabels.map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </div>

                {/* 8x8 Board Container with Strict 1:1 Aspect Ratio Squares */}
                <div className="w-full aspect-square board-grid-mobile border-0 md:border-3 border-white grid grid-cols-8 grid-rows-8 bg-black/40">
                  {displayYIndices.map((y) =>
                    displayXIndices.map((x) => {
                      const piece = activeMatch.board[y][x];
                      const isSelected = selectedSquare?.x === x && selectedSquare?.y === y;
                      const isLegalDest = legalDestinations.some((d) => d.x === x && d.y === y);
                      const isDark = (x + y) % 2 === 1;

                      // Highlight ANY square that is a valid summon square
                      const canSummonHere = summoningUnit && validSummonSquares.some((sq) => sq.x === x && sq.y === y);

                      // Check and ray path highlighting
                      const isKingInCheckSquare = checkDetails.kingPos && checkDetails.kingPos.x === x && checkDetails.kingPos.y === y && checkDetails.inCheck;
                      const isAttackerSquare = checkDetails.attackerPositions.some(ap => ap.x === x && ap.y === y);
                      const isRaySquare = checkDetails.rayPositions.some(rp => rp.x === x && rp.y === y);

                      let squareBg = isDark ? 'rgba(40, 5, 12, 0.5)' : '#F2EFE4';
                      let squareRing = '';

                      if (canSummonHere) {
                        squareBg = 'rgba(251, 191, 36, 0.5)';
                        squareRing = 'ring-4 ring-amber-400 z-10';
                      } else if (isKingInCheckSquare) {
                        squareBg = 'rgba(239, 68, 68, 0.7)';
                        squareRing = 'ring-4 ring-red-600 animate-pulse z-20';
                      } else if (isAttackerSquare) {
                        squareBg = 'rgba(239, 68, 68, 0.5)';
                        squareRing = 'ring-2 ring-red-500 z-15';
                      } else if (isRaySquare) {
                        squareBg = 'rgba(239, 68, 68, 0.25)';
                      } else if (isSelected) {
                        squareBg = 'rgba(251, 191, 36, 0.35)';
                        squareRing = 'ring-4 ring-amber-400 z-20';
                      }

                      return (
                        <div
                          key={`${x}-${y}`}
                          onClick={() => handleSquareClick(x, y)}
                          style={{
                            backgroundColor: squareBg,
                            backdropFilter: isDark ? 'blur(3px)' : undefined,
                            WebkitBackdropFilter: isDark ? 'blur(3px)' : undefined,
                          }}
                          className={`aspect-square w-full h-full flex items-center justify-center relative cursor-pointer select-none transition-colors border border-black/20 ${squareRing}`}
                        >
                          {/* Legal Move Dot */}
                          {isLegalDest && !piece && (
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-400 border-2 border-black shadow-[1px_1px_0px_#000] z-20" />
                          )}
                          {/* Legal Capture Indicator */}
                          {isLegalDest && piece && (
                            <div className="absolute inset-1 border-3 border-red-500 bg-red-500/30 pointer-events-none z-20" />
                          )}
                          {canSummonHere && (
                            <div className="text-xs font-black animate-bounce z-20">🌹</div>
                          )}
                          {isKingInCheckSquare && (
                            <div className="absolute top-0.5 right-0.5 text-[8px] sm:text-[9px] bg-red-600 text-white px-1 font-black uppercase z-20">CHECK</div>
                          )}
                          {piece && <ChessPiece type={piece.type} color={piece.color} />}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Board Files Bottom (A - H) - Desktop Only */}
                <div className="hidden md:grid w-full grid-cols-8 text-center text-[10px] sm:text-xs font-black text-white mt-0.5">
                  {fileLabels.map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </div>
              </div>

              {/* Tier 3: Mobile Fixed 100px Rose Stage Directly Under Board */}
              <div className="md:hidden h-[100px] min-h-[100px] max-h-[100px] w-full px-1.5 pb-1 shrink-0 flex items-stretch mt-1">
                {activeMatch.status === 'completed' ? (
                  <div className="w-full h-full bg-[#1e0712] border-3 border-amber-400 shadow-[3px_3px_0px_#fbbf24] p-1.5 flex flex-col justify-between gap-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px] font-black uppercase text-amber-300 truncate">
                          {activeMatch.winner === 'draw' ? 'Match Drawn!' : `${activeMatch.winner} Wins!`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => triggerChestModalNow(user?.id)}
                          className="px-2.5 py-1 bg-black hover:bg-neutral-900 text-amber-400 font-black text-[10px] uppercase border-2 border-amber-400 shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Gift className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>OPEN CHEST</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (displayRoseCards.length > 0) {
                              setSelectedRoseCard(displayRoseCards[0]);
                            }
                            setIsRoseTrophyRoomOpen(true);
                          }}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Trophy className="w-3 h-3 text-black shrink-0" />
                          <span>Trophy Room</span>
                        </button>
                      </div>
                    </div>

                    {displayRoseCards.length > 0 ? (
                      <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-h-0">
                        {displayRoseCards.map((card) => (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => {
                              setSelectedRoseCard(card);
                              setIsRoseTrophyRoomOpen(true);
                            }}
                            className="h-full px-2 py-0.5 bg-black/85 border border-rose-400 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-transform text-left"
                          >
                            <span className="text-sm leading-none shrink-0">{card.motifSymbol}</span>
                            <div className="leading-tight">
                              <div className="text-[10px] font-black text-white uppercase whitespace-nowrap">
                                {card.title}
                              </div>
                              <div className="text-[9px] text-rose-300 font-mono whitespace-nowrap">
                                R:{card.predictedRating}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-rose-200 font-mono truncate my-auto">
                        {activeMatch.winReason || 'Match completed — view badges in Trophy Room'}
                      </div>
                    )}
                  </div>
                ) : summoningUnit ? (
                  <div className="w-full h-full bg-amber-400 text-black border-3 border-white shadow-[3px_3px_0px_#fff] p-2 flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-black uppercase block truncate">
                        ⚡ SUMMON {summoningUnit.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono block leading-tight">
                        Tap highlighted square on board
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSummoningUnit(null)}
                      className="min-h-[44px] px-3 bg-black text-white hover:bg-neutral-800 text-[10px] uppercase font-black cursor-pointer border border-white shrink-0"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#14060e] border-3 border-white shadow-[3px_3px_0px_#fff] p-2 flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase truncate">
                        <span className={`w-2.5 h-2.5 shrink-0 ${isMyTurn ? 'bg-amber-400 animate-ping' : 'bg-neutral-500'}`} />
                        <span className="truncate text-white">
                          {isMyTurn ? '👉 YOUR TURN TO MOVE' : "PARTNER'S TURN"}
                        </span>
                      </div>
                      <div className="text-[10px] text-rose-300 font-mono mt-0.5 truncate">
                        {isInCheck ? '⚠️ King in Check!' : `Move ${activeMatch.turnCount} · Petals: ${mySeat?.petals || 0}/3 🌹`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsSummonModalOpen(true)}
                        disabled={!isMyTurn || (mySeat?.petals || 0) < 3 || (mySeat?.summonsUsed || 0) >= 2 || isInCheck}
                        className={`min-h-[44px] px-2.5 text-[10px] font-black uppercase border-2 border-white transition-all ${
                          (mySeat?.petals || 0) < 3 || !isMyTurn || isInCheck
                            ? 'opacity-40 cursor-not-allowed bg-neutral-900 text-neutral-500'
                            : 'cursor-pointer bg-rose-600 hover:bg-rose-500 text-white shadow-[2px_2px_0px_#fff]'
                        }`}
                      >
                        SUMMON (3🌹)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: My Status, Petals & Summoning (Desktop) */}
            <div className="hidden md:flex md:min-h-0 flex-col gap-4 overflow-y-auto pr-1">
              <div className="brutal-card p-4 flex flex-col gap-3 border-3 border-white shadow-[4px_4px_0px_#fff]">
                <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-2">
                  <span className="text-xs font-black uppercase text-neutral-400">
                    You ({mySeat?.role === 'boyfriend' ? '👑 Boyfriend' : '👸 Girlfriend'})
                  </span>
                  <span className="text-xs font-black text-amber-400 uppercase">{effectiveMyColor}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-400 text-black border-2 border-white flex items-center justify-center font-black shadow-[2px_2px_0px_#fff]">
                    {user.displayName?.slice(0, 2).toUpperCase() || 'YOU'}
                  </div>
                  <div>
                    <div className="font-black text-sm text-white">{user.displayName || 'You'}</div>
                    <div className="text-xs text-neutral-400 font-mono">
                      {isInCheck ? '⚠️ KING IN CHECK!' : isMyTurn ? '👉 YOUR MOVE' : 'WAITING FOR PARTNER'}
                    </div>
                  </div>
                </div>

                {/* Petal Meter & Summon Action */}
                <div className="flex items-center justify-between pt-2.5 border-t-2 border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black uppercase text-neutral-300">Petals:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((p) => (
                        <span
                          key={p}
                          className={`text-base transition-opacity ${
                            (mySeat?.petals || 0) >= p ? 'opacity-100 drop-shadow-[0_0_8px_#f43f5e]' : 'opacity-20'
                          }`}
                        >
                          🌹
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSummonModalOpen(true)}
                    disabled={!isMyTurn || (mySeat?.petals || 0) < 3 || (mySeat?.summonsUsed || 0) >= 2 || isInCheck}
                    title={isInCheck ? 'Cannot summon while King is in check! Escape check first.' : undefined}
                    className={`px-3 py-1.5 text-xs font-black uppercase transition-all ${
                      (mySeat?.petals || 0) < 3 || !isMyTurn || isInCheck
                        ? 'opacity-40 cursor-not-allowed bg-neutral-900 border-2 border-neutral-700 text-neutral-500'
                        : 'cursor-pointer brutal-button-rose text-white'
                    }`}
                  >
                    {isInCheck ? '⚠️ Check Active' : (mySeat?.petals || 0) < 3 ? 'Summon (3 🌹)' : '⚡ Summon (3 🌹)'}
                  </button>
                </div>
              </div>

              {/* Active Piece Inspector */}
              <div className="brutal-card p-4 flex flex-col gap-3 border-3 border-white shadow-[4px_4px_0px_#fff]">
                <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-2">
                  <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Piece Inspector
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Activity</span>
                </div>

                {(() => {
                  const targetPiece = (selectedSquare && activeMatch.board[selectedSquare.y][selectedSquare.x]) 
                    || (activeMatch.lastMove ? activeMatch.lastMove.piece : null);
                  
                  const isSelectedByMe = selectedSquare && activeMatch.board[selectedSquare.y][selectedSquare.x]?.color === effectiveMyColor;
                  const isLastMoveMine = activeMatch.lastMove && activeMatch.lastMove.piece.color === effectiveMyColor;

                  const isMine = isSelectedByMe || (activeMatch.lastMove && !selectedSquare && isLastMoveMine);

                  const opponentRole = opponentSeat?.role || (effectiveMyColor === 'white' ? 'girlfriend' : 'boyfriend');
                  const opponentName = opponentSeat?.displayName || (opponentRole === 'boyfriend' ? 'Boyfriend Bot 👑' : 'Girlfriend Bot 👸');

                  if (!targetPiece) {
                    return (
                      <div className="py-6 text-center text-neutral-500 text-xs font-mono">
                        Click any piece on the board to inspect.
                      </div>
                    );
                  }

                  const pieceName = PIECE_DISPLAY_NAMES[targetPiece.type] || targetPiece.type.toUpperCase();
                  let actionMsg = '';
                  if (isMine) {
                    actionMsg = `You are moving the ${pieceName}`;
                  } else {
                    const roleLabel = opponentRole === 'boyfriend' ? 'boyfriend' : 'girlfriend';
                    actionMsg = `Your ${roleLabel} (${opponentName}) is moving the ${pieceName}`;
                  }

                  return (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-950 border-3 border-amber-400 p-2 flex items-center justify-center shadow-[4px_4px_0px_#fbbf24]">
                        <ChessPiece type={targetPiece.type} color={targetPiece.color} className="w-full h-full" />
                      </div>
                      <div className="text-center">
                        <div className="font-black text-sm uppercase text-white">{pieceName}</div>
                        <div className="text-xs text-amber-300 font-mono mt-1 font-bold leading-relaxed">
                          {actionMsg}!
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Game Over Banner */}
              {activeMatch.status === 'completed' && (
                <div className="brutal-card p-6 border-3 border-amber-400 text-center flex flex-col gap-4 shadow-[6px_6px_0px_#fbbf24] max-h-[85dvh] overflow-y-auto my-2">
                  <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                  <div>
                    <h3 className="text-lg font-black uppercase">
                      {activeMatch.winner === 'draw' ? 'Match Drawn in Harmony!' : `${activeMatch.winner} Triumphs!`}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 font-mono">{activeMatch.winReason}</p>
                  </div>

                  {earnedRoseCards.length > 0 && (
                    <div className="w-full bg-[#1e0712] border-2 border-rose-400 p-3 text-left my-1">
                      <div className="text-[11px] font-black uppercase text-rose-300 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Earned Rose Badges (Click badge to inspect & download)
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {displayRoseCards.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => {
                              setSelectedRoseCard(card);
                              setIsRoseTrophyRoomOpen(true);
                            }}
                            className="p-2 bg-black/80 hover:bg-black border-2 border-rose-400 cursor-pointer flex items-center gap-2 shadow-[2px_2px_0px_#000] hover:scale-105 transition-all"
                          >
                            <span className="text-xl">{card.motifSymbol}</span>
                            <div>
                              <div className="font-extrabold text-xs text-white uppercase">{card.title}</div>
                              <div className="text-[10px] text-rose-300 font-mono">Rating: {card.predictedRating}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      onClick={() => {
                        if (displayRoseCards.length > 0) {
                          setSelectedRoseCard(displayRoseCards[0]);
                        }
                        setIsRoseTrophyRoomOpen(true);
                      }}
                      className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trophy className="w-4 h-4 text-black" />
                      Session Trophy Room
                    </button>
                    <button
                      onClick={() => {
                        if (isBotMatch) {
                          setIsBotMatch(false);
                          setBotMatch(null);
                        } else {
                          socketClearMatch();
                        }
                      }}
                      className="flex-1 brutal-button-primary py-3 px-4 text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      Return to Lobby
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* MOBILE 50dvh SLIDE-UP LOVE CHAT SHEET */}
          {isMobileChatOpen && (
            <div
              onClick={() => setIsMobileChatOpen(false)}
              aria-hidden="true"
              className="md:hidden fixed inset-0 bottom-[calc(52px+env(safe-area-inset-bottom))] z-30 bg-black/60 transition-opacity"
            />
          )}

          <div
            role="dialog"
            aria-label="Love Chat and Reactions"
            className={`md:hidden fixed left-0 right-0 bottom-[calc(52px+env(safe-area-inset-bottom))] z-40 max-h-[50dvh] flex flex-col bg-[#0c0308] border-t-3 border-x-3 border-white shadow-[0_-4px_0px_#fff] transition-[transform,opacity] duration-200 motion-reduce:transition-none ${
              isMobileChatOpen
                ? 'translate-y-0 opacity-100 pointer-events-auto'
                : 'translate-y-full opacity-0 pointer-events-none'
            }`}
          >
            {/* Sheet Header */}
            <div className="shrink-0 p-2 border-b-2 border-white flex items-center justify-between bg-[#150720]">
              <span className="text-xs font-black uppercase text-rose-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500" />
                Whispers of Love ({chatMessages.length})
              </span>
              <button
                type="button"
                onClick={() => setIsMobileChatOpen(false)}
                className="min-h-[40px] px-2.5 border-2 border-white bg-black text-white text-xs font-black uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Quick Reactions Chips */}
            <div className="p-2 border-b border-rose-500/30 flex items-center gap-1.5 overflow-x-auto shrink-0 bg-[#0c0308]">
              {['❤️ Love you', '🌹 Good move!', '😉 Cute!', '🙈 Oops!', '👑 Queen power!', '🧋 Boba date?'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setChatInputText(chip);
                  }}
                  className="px-2.5 py-1 text-xs bg-rose-950/80 border border-rose-400 text-rose-200 shrink-0 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Quick Reaction Emojis */}
            <div className="p-2 border-b border-rose-500/30 flex items-center gap-2 overflow-x-auto shrink-0 bg-[#12050c]">
              {['❤️', '🌹', '✨', '💍', '🥰', '😉', '💖', '👑', '🥺', '💅', '🧋', '⚔️'].map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => handleSendReaction(emo)}
                  className="text-lg p-1 hover:scale-125 transition-transform shrink-0 cursor-pointer"
                >
                  {emo}
                </button>
              ))}
            </div>

            {/* Messages List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 flex flex-col gap-2 font-mono text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-[11px] text-rose-300/60 italic text-center my-auto">
                  Say something sweet or playful to your partner...
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderUserId === (user?.id || 'usr_human');
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col p-2 border-2 ${
                        isMe
                          ? 'bg-[#220916] border-rose-400 text-rose-100 ml-3'
                          : 'bg-[#150720] border-fuchsia-400 text-fuchsia-100 mr-3'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[10px] font-black uppercase ${isMe ? 'text-rose-300' : 'text-fuchsia-300'}`}>
                          {msg.senderDisplayName}
                        </span>
                        <span className="text-[9px] text-neutral-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-white text-xs break-words">{msg.text}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Form */}
            <form onSubmit={handleSendChat} className="p-2 border-t-2 border-white flex gap-1.5 bg-[#150720] shrink-0">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                className="flex-1 bg-black border-2 border-white px-2 py-1.5 text-xs text-white placeholder-rose-300/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="px-3 py-1.5 bg-rose-500 text-white disabled:opacity-40 text-xs font-black uppercase cursor-pointer border-2 border-white"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* TIER 4: MOBILE BOTTOM NAVIGATION BAR (52px + safe-area-inset-bottom) */}
          <nav
            role="navigation"
            aria-label="Match actions"
            className="md:hidden shrink-0 w-full bg-[#0c0308] border-t-3 border-white px-1.5 pt-1 pb-[calc(4px+env(safe-area-inset-bottom))] z-40 flex items-center gap-1"
          >
            <button
              type="button"
              onClick={() => setIsSummonModalOpen(true)}
              disabled={!isMyTurn || (mySeat?.petals || 0) < 3 || (mySeat?.summonsUsed || 0) >= 2 || isInCheck}
              className={`flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-white flex flex-col items-center justify-center ${
                (mySeat?.petals || 0) >= 3 && isMyTurn && !isInCheck
                  ? 'bg-rose-600 text-white cursor-pointer shadow-[2px_2px_0px_#fff]'
                  : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
                SUMMON ({mySeat?.petals || 0}/3)
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileChatOpen(!isMobileChatOpen);
              }}
              className={`flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-white flex flex-col items-center justify-center cursor-pointer ${
                isMobileChatOpen ? 'bg-amber-400 text-black' : 'bg-neutral-900 text-white'
              }`}
            >
              <Heart className="w-4 h-4 shrink-0 text-rose-400 fill-rose-500" />
              <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
                CHAT ({chatMessages.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSendReaction('🌹');
              }}
              className="flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-white bg-neutral-900 text-white flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="text-sm leading-none">🌹</span>
              <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
                BLESSING
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowConcedeConfirm(true)}
              className="flex-1 min-w-[44px] min-h-[44px] px-1.5 border-2 border-white bg-red-700 hover:bg-red-600 text-white flex flex-col items-center justify-center cursor-pointer"
            >
              <Flag className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-black uppercase leading-none mt-0.5 whitespace-nowrap">
                CONCEDE
              </span>
            </button>
          </nav>
        </>
      )}

      {/* ==================== 3. COMPREHENSIVE RULEBOOK & TACTICAL CODEX ==================== */}
      <RulebookWindow
        isOpen={showRulebook}
        onClose={() => setShowRulebook(false)}
        initialMode="rose"
        initialSubTab={rulebookSubTab}
        isModal={isAutoTriggeredRulebook}
      />

      {/* ==================== 4. MULTIPLE SUMMON PIECE SELECTOR (PROPER BRUTALISM) ==================== */}
      {isSummonModalOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="brutal-card max-w-xl w-full p-6 flex flex-col gap-4 border-4 border-amber-400 shadow-[8px_8px_0px_#fbbf24]">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <h3 className="text-base sm:text-lg font-black uppercase text-amber-400 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Summon Reinforcements (3 🌹)
              </h3>
              <button
                onClick={() => setIsSummonModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 font-mono">
              Choose an ally to summon. You can place it on <strong>any empty square anywhere on the board</strong> that does not immediately deliver check!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SUMMON_CATALOG.map((s) => (
                <button
                  key={s.type}
                  onClick={() => {
                    setSummoningUnit(s.type);
                    setIsSummonModalOpen(false);
                  }}
                  className="p-3 bg-neutral-950 border-2 border-white hover:border-amber-400 hover:bg-neutral-900 text-left cursor-pointer transition-all flex flex-col justify-between gap-1 shadow-[3px_3px_0px_#fff] hover:shadow-[3px_3px_0px_#fbbf24]"
                >
                  <div>
                    <span className="font-black text-xs text-amber-300 block">{s.name}</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">{s.role}</span>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-mono leading-tight">{s.desc}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsSummonModalOpen(false)}
              className="brutal-button py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lovingly Concede Confirmation Modal */}
      {showConcedeConfirm && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="brutal-card max-w-sm w-full p-6 flex flex-col gap-4 border-4 border-rose-500 shadow-[8px_8px_0px_#f43f5e] bg-[#14060e] text-white">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider border-b-2 border-rose-500/40 pb-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              <span>Lovingly Concede Match?</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-black uppercase text-white">Surrender to your partner?</h3>
              <p className="text-xs text-rose-200/80 font-mono leading-relaxed">
                Are you sure you want to gracefully concede this match to {isBotMatch ? (botPlayerRole === 'boyfriend' ? 'Boyfriend Bot 👑' : 'Girlfriend Bot 👸') : (opponentSeat?.displayName || 'your partner')}?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleConcedeMatch}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <Flag className="w-4 h-4" /> Yes, Concede
              </button>
              <button
                type="button"
                onClick={() => setShowConcedeConfirm(false)}
                className="py-2.5 px-4 bg-neutral-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider border-2 border-neutral-500 cursor-pointer transition-colors"
              >
                Keep Playing
              </button>
            </div>
          </div>
        </div>
      )}

      <TrophyRoomModal
        isOpen={isRoseTrophyRoomOpen}
        onClose={() => setIsRoseTrophyRoomOpen(false)}
        initialSelectedCard={selectedRoseCard}
      />
    </div>
  );
};
