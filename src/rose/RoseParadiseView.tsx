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
} from 'lucide-react';
import './rose.css';

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
    error: socketError,
    reactions: socketReactions,
    chatMessages: socketChatMessages,
    createRoom,
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

  // Lovingly Concede Confirmation Modal (replaces browser confirm)
  const [showConcedeConfirm, setShowConcedeConfirm] = useState(false);

  // Initial Romantic Rulebook Modal (pops up on game start, untimed)
  const [showRulebook, setShowRulebook] = useState(false);
  const [hasShownRulebookOnce, setHasShownRulebookOnce] = useState(false);

  // Summon selection & placement mode
  const [isSummonModalOpen, setIsSummonModalOpen] = useState(false);
  const [summoningUnit, setSummoningUnit] = useState<RoseSummonPieceType | null>(null);

  // Active match selection (bot match takes precedence if active, else socket match)
  const activeMatch = isBotMatch ? botMatch : socketMatch;

  const handleConcedeMatch = () => {
    setShowConcedeConfirm(false);
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
    <div className="rose-theme min-h-screen flex flex-col p-3 sm:p-6 select-none bg-black text-white font-mono">
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
      <header className="z-10 max-w-6xl mx-auto w-full flex items-center justify-between pb-4 mb-4 border-b-4 border-white">
        <div className="flex items-center gap-3">
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
            className="brutal-button px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer hover:bg-white hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" />
            {activeMatch ? 'Leave Match' : 'Main Menu'}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🌹</span>
            <span className="text-sm sm:text-base font-black tracking-tight uppercase">
              Rose Paradise
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-amber-400 text-black font-black uppercase border border-white">
              Untimed Couples
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRulebook(true)}
            className="brutal-button px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer text-amber-300 border-amber-300 shadow-[3px_3px_0px_#fbbf24] hover:bg-amber-300 hover:text-black"
          >
            <BookOpen className="w-3.5 h-3.5" /> Rules
          </button>

          {activeMatch && activeMatch.status === 'active' && (
            <button
              onClick={() => setShowConcedeConfirm(true)}
              className="brutal-button px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer text-red-400 border-red-400 shadow-[3px_3px_0px_#f43f5e] hover:bg-red-400 hover:text-black"
            >
              <Flag className="w-3.5 h-3.5" /> Concede
            </button>
          )}
        </div>
      </header>

      {socketError && (
        <div className="z-10 mb-4 p-3 brutal-card border-red-500 bg-red-950 text-red-200 text-xs sm:text-sm font-black uppercase flex items-center justify-between">
          <span>⚠️ {socketError}</span>
          <button onClick={() => refreshRooms()} className="text-xs underline hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* ==================== 1. LOBBY VIEW (PROPER BRUTALISM) ==================== */}
      {!activeMatch && (
        <div className="z-10 max-w-5xl mx-auto w-full flex flex-col gap-8 my-auto py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" /> Untimed Couples Chess
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-lg mx-auto font-mono">
              NO TIMERS · NO PRESSURE. Create a custom room code for your partner, or play solo against an affectionate AI bot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* BOX 1: Create Custom Multiplayer Room (Shows Code in Same Box!) */}
            <div className="brutal-card p-6 flex flex-col justify-between gap-5 border-3 border-white shadow-[6px_6px_0px_#fff]">
              <div>
                <h2 className="text-base font-black uppercase mb-1 flex items-center gap-2 text-amber-400">
                  <Crown className="w-4 h-4" /> 1. Create Room Code
                </h2>
                <p className="text-xs text-neutral-400 mb-4 font-mono">
                  Generate a custom room code for your human partner.
                </p>

                {!hostedCode ? (
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-2">
                      Choose Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('boyfriend')}
                        className={`p-3 border-2 font-black text-xs uppercase transition-all cursor-pointer ${
                          selectedRole === 'boyfriend'
                            ? 'bg-amber-400 text-black border-white shadow-[3px_3px_0px_#fff]'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        👑 Boyfriend (White)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('girlfriend')}
                        className={`p-3 border-2 font-black text-xs uppercase transition-all cursor-pointer ${
                          selectedRole === 'girlfriend'
                            ? 'bg-rose-500 text-white border-white shadow-[3px_3px_0px_#fff]'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        👸 Girlfriend (Black)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => createRoom(selectedRole)}
                      className="w-full brutal-button-primary py-3 text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer"
                    >
                      Generate Room Code
                    </button>
                  </div>
                ) : (
                  /* CODE SHOWN RIGHT IN THE SAME BOX! */
                  <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                    <div className="p-3.5 bg-neutral-950 border-2 border-amber-400 shadow-[3px_3px_0px_#fbbf24]">
                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-300 mb-1">
                        Your Custom Room Code
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-white">
                          {hostedCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(hostedCode)}
                          className="brutal-button py-1.5 px-3 text-xs flex items-center gap-1 cursor-pointer border-amber-400 text-amber-300"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedCode ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 border-2 border-dashed border-neutral-700 text-xs text-neutral-400 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-amber-400 animate-ping shrink-0" />
                      <span>Waiting for partner to enter this code on their device...</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => cancelRoom()}
                      className="text-xs text-red-400 hover:text-red-300 underline font-black uppercase text-center cursor-pointer"
                    >
                      Cancel Room
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-neutral-500 font-mono">
                • Private & untimed couples game<br />
                • Room starts instantly once joined
              </div>
            </div>

            {/* BOX 2: Join with Partner's Code */}
            <div className="brutal-card p-6 flex flex-col justify-between gap-5 border-3 border-white shadow-[6px_6px_0px_#fff]">
              <div>
                <h2 className="text-base font-black uppercase mb-1 flex items-center gap-2 text-white">
                  <Heart className="w-4 h-4 text-rose-500" /> 2. Join Partner
                </h2>
                <p className="text-xs text-neutral-400 mb-4 font-mono">
                  Enter your partner's 6-character room code to join instantly.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (joinCodeInput.trim()) joinRoom(joinCodeInput.trim());
                  }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-2">
                      Room Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ROSE-A1B2C3"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-950 border-2 border-white px-3.5 py-2.5 font-mono text-sm tracking-wider uppercase text-white focus:outline-none focus:border-amber-400 shadow-[2px_2px_0px_#fff]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!joinCodeInput.trim()}
                    className="w-full brutal-button-primary py-3 text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Join Room Now
                  </button>
                </form>
              </div>

              <div className="text-[11px] text-neutral-500 font-mono">
                Your role will complement your partner's choice automatically.
              </div>
            </div>

            {/* BOX 3: Play vs AI Bot (Boyfriend or Girlfriend Bot) */}
            <div className="brutal-card p-6 flex flex-col justify-between gap-5 border-3 border-amber-400 shadow-[6px_6px_0px_#fbbf24]">
              <div>
                <h2 className="text-base font-black uppercase mb-1 flex items-center gap-2 text-amber-300">
                  <Bot className="w-4 h-4" /> 3. Play vs AI Bot
                </h2>
                <p className="text-xs text-neutral-400 mb-4 font-mono">
                  Play solo against an affectionate AI bot with sweet chats & emoji reactions!
                </p>

                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => handleStartBotMatch('boyfriend')}
                    className="w-full brutal-button py-3 px-4 text-xs font-black uppercase flex items-center justify-between cursor-pointer border-white hover:bg-white hover:text-black"
                  >
                    <span>Play vs Boyfriend Bot (White)</span>
                    <span>👑</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartBotMatch('girlfriend')}
                    className="w-full brutal-button py-3 px-4 text-xs font-black uppercase flex items-center justify-between cursor-pointer border-rose-500 text-rose-300 shadow-[3px_3px_0px_#f43f5e] hover:bg-rose-500 hover:text-white"
                  >
                    <span>Play vs Girlfriend Bot (Black)</span>
                    <span>👸</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Full tactical summons, sweet chats & emojis!</span>
              </div>
            </div>
          </div>

          {/* Open Rose Rooms Lobby Table */}
          <div className="brutal-card p-6 border-3 border-white shadow-[6px_6px_0px_#fff]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                  Open Waiting Rooms ({publicRooms.length})
                </h3>
              </div>
              <button
                onClick={() => refreshRooms()}
                className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer font-black uppercase"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh List
              </button>
            </div>

            {publicRooms.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-neutral-700 text-neutral-400 text-xs font-mono">
                No open rooms right now. Click "Generate Room Code" above to invite your partner!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {publicRooms.map((room) => (
                  <div
                    key={room.code}
                    className="p-3.5 bg-neutral-950 border-2 border-neutral-700 hover:border-amber-400 transition-colors flex items-center justify-between gap-3 shadow-[3px_3px_0px_#fff]"
                  >
                    <div>
                      <div className="font-black text-sm text-white">{room.hostDisplayName}</div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5 font-mono">
                        <span>Role: {room.hostRole === 'boyfriend' ? '👑 Boyfriend' : '👸 Girlfriend'}</span>
                        <span>·</span>
                        <span className="font-mono text-amber-300">{room.code}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => joinRoom(room.code)}
                      className="brutal-button-primary py-1.5 px-3 text-xs font-black uppercase cursor-pointer shrink-0"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 2. ACTIVE MATCH VIEW (PROPER BRUTALISM) ==================== */}
      {activeMatch && (
        <div className="z-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6 items-start justify-center flex-1">
          {/* Left Sidebar: Partner Info & In-Game Love Chat Box */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
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

          {/* Center: Brutalist Chess Board */}
          <div className="flex flex-col items-center gap-3 flex-1 w-full max-w-[540px]">
            {/* Turn Banner with Complete Clarity */}
            <div className={`w-full px-4 py-2.5 brutal-card border-3 border-white shadow-[4px_4px_0px_#fff] flex items-center justify-between text-xs font-black uppercase ${isMyTurn ? 'bg-amber-400 text-black' : 'bg-black text-white'}`}>
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

            {/* Universal Summon Placement Mode Banner */}
            {summoningUnit && (
              <div className="w-full p-3 bg-amber-400 text-black border-3 border-white shadow-[4px_4px_0px_#fff] font-black uppercase text-xs flex items-center justify-between animate-pulse">
                <span>⚡ SUMMON {summoningUnit.toUpperCase()}: Click any highlighted square on the board!</span>
                <button
                  onClick={() => setSummoningUnit(null)}
                  className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 text-[10px] uppercase font-black cursor-pointer border border-white"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Brutalist Board Tray */}
            <div className="w-full brutal-board-tray p-3 sm:p-4 border-4 border-white shadow-[8px_8px_0px_#fff] flex flex-col items-center" style={{ backgroundColor: '#e11d48' }}>
              {/* Board Files Top (A - H) */}
              <div className="w-full grid grid-cols-8 text-center text-xs font-black text-white mb-1">
                {fileLabels.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>

              {/* 8x8 Board Container with Strict 1:1 Aspect Ratio Squares */}
              <div className="w-full aspect-square border-3 border-white grid grid-cols-8 grid-rows-8 bg-black/40">
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
                          <div className="w-4 h-4 bg-amber-400 border-2 border-black shadow-[1px_1px_0px_#000] z-20" />
                        )}
                        {/* Legal Capture Indicator */}
                        {isLegalDest && piece && (
                          <div className="absolute inset-1 border-3 border-red-500 bg-red-500/30 pointer-events-none z-20" />
                        )}
                        {canSummonHere && (
                          <div className="text-xs font-black animate-bounce z-20">🌹</div>
                        )}
                        {isKingInCheckSquare && (
                          <div className="absolute top-0.5 right-0.5 text-[9px] bg-red-600 text-white px-1 font-black uppercase z-20">CHECK</div>
                        )}
                        {piece && <ChessPiece type={piece.type} color={piece.color} />}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Board Files Bottom (A - H) */}
              <div className="w-full grid grid-cols-8 text-center text-xs font-black text-white mt-1">
                {fileLabels.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: My Status, Petals & Summoning */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
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

            {/* Active Piece Inspector (Right Sidebar Bottom Portion) */}
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
              <div className="brutal-card p-6 border-3 border-amber-400 text-center flex flex-col gap-4 shadow-[6px_6px_0px_#fbbf24]">
                <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                <div>
                  <h3 className="text-lg font-black uppercase">
                    {activeMatch.winner === 'draw' ? 'Match Drawn in Harmony!' : `${activeMatch.winner} Triumphs!`}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">{activeMatch.winReason}</p>
                </div>
                <button
                  onClick={() => {
                    if (isBotMatch) {
                      setIsBotMatch(false);
                      setBotMatch(null);
                    } else {
                      socketClearMatch();
                    }
                  }}
                  className="brutal-button-primary py-3 px-4 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Return to Lobby & Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 3. ROMANTIC RULEBOOK MODAL (PROPER BRUTALISM) ==================== */}
      {showRulebook && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="brutal-card max-w-lg w-full p-6 sm:p-7 flex flex-col gap-5 border-4 border-white shadow-[8px_8px_0px_#fff] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-white pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                  Rose Paradise · Couples Rules
                </h3>
              </div>
              <button
                onClick={() => setShowRulebook(false)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs sm:text-sm text-neutral-200">
              <div className="p-3.5 bg-neutral-950 border-2 border-white">
                <div className="font-black text-amber-300 uppercase mb-1 flex items-center gap-1.5">
                  <span>👑</span> 1. Boyfriend (Prince) & Girlfriend (Queen)
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                  The Prince moves 1 square in any direction like a King, with the royal privilege to leap over 1 adjacent friendly piece to safety! The Queen retains full diagonal and straight mobility. White always moves first.
                </p>
              </div>

              <div className="p-3.5 bg-neutral-950 border-2 border-rose-500 shadow-[3px_3px_0px_#f43f5e]">
                <div className="font-black text-rose-300 uppercase mb-1 flex items-center gap-1.5">
                  <span>🌹</span> 2. Petals of Passion & Love Link
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                  Earn Petals by capturing pieces, delivering checks, or bringing your Prince and Queen adjacent on the board to trigger a <strong>Love Link</strong> (+1 Petal, max once per 4 moves).
                </p>
              </div>

              <div className="p-3.5 bg-neutral-950 border-2 border-white">
                <div className="font-black text-amber-300 uppercase mb-1 flex items-center gap-1.5">
                  <span>⚡</span> 3. Summoning Reinforcements (3 🌹)
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                  Spend 3 Petals to summon ANY piece (Queen, Rook, Bishop, Knight, Cupid Priest, Thorn Guard, Rose Tower, or Pawn) on <strong>ANY empty square anywhere on the board</strong>! The only restriction is that the initial placement cannot deliver direct check to the opponent's king.
                </p>
              </div>

              <div className="p-3.5 bg-neutral-950 border-2 border-emerald-400 shadow-[3px_3px_0px_#34d399]">
                <div className="font-black text-emerald-300 uppercase mb-1 flex items-center gap-1.5">
                  <span>🕊️</span> 4. Untimed Love
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                  There is no timer and no ticking clock. Deliberate together and play as long as you want because it is your love!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRulebook(false)}
              className="brutal-button-primary py-3 px-4 text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer text-center"
            >
              Let's Play 🌹
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
};
