import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRoseRoom, RoseChatMessage } from './useRoseRoom';
import { useAuth } from '../context/AuthContext';
import { ChessPiece } from '../components/ChessPiece';
import { getLegalMovesForSquare } from '../game/engine';
import { createInitialRoseMatch, applyRoseMove, applyRoseSummon } from './roseRules';
import {
  getBestRoseBotMove,
  getBotSummonChoice,
  getRandomBotReaction,
  getRandomBotMessage,
} from './roseBot';
import type { RoseMatchState, RoseRole, RoseSeat } from './types';
import type { PieceColor, Position } from '../types/game';
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

export const RoseParadiseView: React.FC<RoseParadiseViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  
  // Custom multiplayer room hook
  const {
    match: socketMatch,
    myColor: socketMyColor,
    myRole: socketMyRole,
    publicRooms,
    hostedCode,
    isWaitingForPartner,
    error: socketError,
    pendingMove: socketPendingMove,
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

  // Initial Romantic Rulebook Modal (pops up on game start, untimed)
  const [showRulebook, setShowRulebook] = useState(false);
  const [hasShownRulebookOnce, setHasShownRulebookOnce] = useState(false);

  // Summon selection & placement mode
  const [isSummonModalOpen, setIsSummonModalOpen] = useState(false);
  const [summoningUnit, setSummoningUnit] = useState<'priest' | 'communist' | 'supremeRook' | null>(null);

  // Active match selection (bot match takes precedence if active, else socket match)
  const activeMatch = isBotMatch ? botMatch : socketMatch;

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

      // 1. Bot Summon Check (if 3 petals available and summonsUsed < 2)
      if (botSeat && botSeat.petals >= 3 && botSeat.summonsUsed < 2) {
        const summonChoice = getBotSummonChoice(state, botColor);
        if (summonChoice) {
          const summonRes = applyRoseSummon(state, botSeat.userId, summonChoice.pieceType, summonChoice.pos);
          if (summonRes.success && summonRes.state) {
            state = summonRes.state;
            const summonMsg = getRandomBotMessage('summon');
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
          }
        }
      }

      // 2. Bot Move Decision using Minimax & heuristics
      const bestMove = getBestRoseBotMove(state, botColor);
      if (bestMove) {
        const res = applyRoseMove(state, bestMove.from, bestMove.to);
        if (res.success && res.state) {
          state = res.state;
          if (state.status === 'completed') {
            sounds.playGameOver();
            const overMsg = getRandomBotMessage('gameOver');
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
          } else if (bestMove.captured) {
            sounds.playCapture();
            const capMsg = getRandomBotMessage('capture');
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
            // 35% chance of random sweet message
            if (Math.random() < 0.35) {
              const sweetMsg = getRandomBotMessage('randomTurn');
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

          // Trigger bot random reaction emoji
          if (Math.random() < 0.5) {
            const rx = getRandomBotReaction();
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
  }, []);

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
      username: botRoleChoice === 'boyfriend' ? 'Prince Romeo' : 'Princess Juliet',
      displayName: botRoleChoice === 'boyfriend' ? 'Prince Romeo (Bot)' : 'Princess Juliet (Bot)',
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

    const matchId = `rose_bot_${Date.now()}`;
    const initialMatch = createInitialRoseMatch(matchId, 'BOT-ROOM', userSeat, 0, true);
    initialMatch.status = 'active';

    if (userColor === 'white') {
      initialMatch.whiteSeat = userSeat;
      initialMatch.blackSeat = botSeat;
    } else {
      initialMatch.whiteSeat = botSeat;
      initialMatch.blackSeat = userSeat;
    }

    setBotPlayerRole(botRoleChoice);
    setBotUserRole(userRoleChoice);
    setBotMatch(initialMatch);
    setIsBotMatch(true);
    setBotLocalChat([
      {
        id: `bot_welcome_${Date.now()}`,
        senderUserId: 'usr_bot',
        senderDisplayName: botSeat.displayName,
        text: getRandomBotMessage('start'),
        timestamp: Date.now(),
      },
    ]);
    sounds.playChallenge();
  };

  // ==================== BOARD CLICK LOGIC ====================
  const handleSquareClick = (x: number, y: number) => {
    if (!activeMatch || activeMatch.status !== 'active' || !isMyTurn) return;

    // 1. Summon Placement Mode
    if (summoningUnit) {
      const isHomeRow = effectiveMyColor === 'white' ? y <= 1 : y >= 6;
      const pieceOnSquare = activeMatch.board[y][x];
      if (isHomeRow && !pieceOnSquare) {
        if (isBotMatch) {
          const res = applyRoseSummon(activeMatch, user?.id || 'usr_human', summoningUnit, { x, y });
          if (res.success && res.state) {
            setBotMatch(res.state);
            sounds.playAbility();
          }
        } else {
          socketSendSummon(summoningUnit, { x, y });
        }
        setSummoningUnit(null);
        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }
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
            if (res.state.status === 'completed') {
              sounds.playGameOver();
            } else if (res.state.lastMove && activeMatch.board[y][x]) {
              sounds.playCapture();
              const reactMsg = getRandomBotMessage('playerCaptured');
              setBotLocalChat((prev) => [
                ...prev.slice(-30),
                {
                  id: `bot_cap_react_${Date.now()}`,
                  senderUserId: 'usr_bot',
                  senderDisplayName: opponentSeat?.displayName || 'Bot Partner',
                  text: reactMsg,
                  timestamp: Date.now(),
                },
              ]);
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

    // 3. Piece Selection Click: CRITICAL FIX -> pass activeMatch.board to getLegalMovesForSquare!
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
      // Bot sends playful reply back
      setTimeout(() => {
        setBotLocalChat((prev) => [
          ...prev.slice(-30),
          {
            id: `bot_reply_${Date.now()}`,
            senderUserId: 'usr_bot',
            senderDisplayName: opponentSeat?.displayName || 'Bot Partner',
            text: "Reading your sweet message with a warm smile! ❤️",
            timestamp: Date.now(),
          },
        ]);
      }, 1000);
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
    <div className="rose-theme min-h-screen flex flex-col p-3 sm:p-6 select-none relative overflow-x-hidden">
      {/* Subtle Ambient Glass Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glass-particle" style={{ left: '15%', top: '100%', animationDelay: '0s' }} />
        <div className="glass-particle" style={{ left: '42%', top: '100%', animationDelay: '4s' }} />
        <div className="glass-particle" style={{ left: '72%', top: '100%', animationDelay: '2s' }} />
        <div className="glass-particle" style={{ left: '88%', top: '100%', animationDelay: '7s' }} />
      </div>

      {/* Floating Live Reactions */}
      {reactions.map((r) => (
        <div
          key={r.id}
          className="fixed pointer-events-none z-50 text-4xl animate-bounce"
          style={{
            bottom: '22%',
            left: `${28 + (Math.random() * 44)}%`,
            filter: 'drop-shadow(0 4px 14px rgba(34, 211, 238, 0.6))',
          }}
        >
          {r.text}
        </div>
      ))}

      {/* Top Header - Clean Glass Navbar */}
      <header className="flex items-center justify-between z-10 pb-4 border-b border-slate-700/60 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isBotMatch) {
                setIsBotMatch(false);
                setBotMatch(null);
              }
              if (socketMatch) socketClearMatch();
              onBack();
            }}
            className="glass-button py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-cyan-400" />
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-100">
              Rose Paradise
            </span>
            {isBotMatch && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-bold text-cyan-300">
                vs {botPlayerRole === 'boyfriend' ? 'Bot Boyfriend' : 'Bot Girlfriend'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRulebook(true)}
            className="glass-button py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer border-cyan-500/40 text-cyan-200 hover:text-cyan-100"
          >
            <BookOpen className="w-3.5 h-3.5" /> Rules
          </button>
          {activeMatch && activeMatch.status === 'active' && (
            <button
              onClick={() => {
                if (window.confirm('Do you lovingly concede this match to your partner?')) {
                  if (isBotMatch) {
                    const finished = { ...activeMatch, status: 'completed' as const, winner: botPlayerRole, winReason: 'Player lovingly conceded to bot.' };
                    setBotMatch(finished);
                  } else {
                    socketResignMatch();
                  }
                }
              }}
              className="py-2 px-3 text-xs font-semibold rounded-lg border border-red-500/50 bg-red-950/40 text-red-300 hover:bg-red-900/50 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" /> Concede
            </button>
          )}
        </div>
      </header>

      {socketError && (
        <div className="z-10 mb-4 p-3 glass-card border-red-500/60 bg-red-950/50 text-red-200 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <span>⚠️ {socketError}</span>
          <button onClick={() => refreshRooms()} className="text-xs underline hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* ==================== 1. LOBBY VIEW ==================== */}
      {!activeMatch && (
        <div className="z-10 max-w-5xl mx-auto w-full flex flex-col gap-8 my-auto py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" /> Untimed Couples Chess
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
              Play peacefully with no timers or countdown pressure. Create a custom room code for your partner, or play solo against an affectionate AI bot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* BOX 1: Create Custom Multiplayer Room (Shows Code in Same Box!) */}
            <div className="glass-card p-6 flex flex-col justify-between gap-5 border-slate-700/80">
              <div>
                <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-cyan-400" /> 1. Create Room Code
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Generate a custom room code for your human partner.
                </p>

                {!hostedCode ? (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Choose Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('boyfriend')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          selectedRole === 'boyfriend'
                            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        👑 Boyfriend (White)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('girlfriend')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          selectedRole === 'girlfriend'
                            ? 'bg-rose-950/80 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        👸 Girlfriend (Black)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => createRoom(selectedRole)}
                      className="w-full glass-button-primary py-3 text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Generate Room Code
                    </button>
                  </div>
                ) : (
                  /* CODE SHOWN RIGHT IN THE SAME BOX! */
                  <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                    <div className="p-3.5 glass-card-focus bg-slate-900/80 border-cyan-400">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-1">
                        Your Custom Room Code
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-white">
                          {hostedCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(hostedCode)}
                          className="glass-button py-1.5 px-3 text-xs flex items-center gap-1 cursor-pointer border-cyan-500/50 text-cyan-200"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedCode ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 glass-card bg-slate-900/50 border-slate-700 text-xs text-slate-300 flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                      <span>Waiting for partner to enter this code in their window...</span>
                    </div>

                    <button
                      onClick={() => cancelRoom()}
                      className="glass-button py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancel Code
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 italic">
                The game board opens instantaneously the moment your partner joins.
              </div>
            </div>

            {/* BOX 2: Join with Room Code */}
            <div className="glass-card p-6 flex flex-col justify-between gap-5 border-slate-700/80">
              <div>
                <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
                  <span>🗝️</span> 2. Enter Partner's Code
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Enter the code generated by your partner:
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (joinCodeInput.trim()) joinRoom(joinCodeInput.trim());
                  }}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="text"
                    placeholder="ROSE-XXXXXX"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900/80 border border-slate-700 px-4 py-3 text-white font-mono font-bold uppercase tracking-widest text-sm rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!joinCodeInput.trim()}
                    className={`glass-button py-3 text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer border-slate-600 ${
                      !joinCodeInput.trim() ? 'opacity-40 cursor-not-allowed' : 'hover:border-cyan-400'
                    }`}
                  >
                    Enter Paradise
                  </button>
                </form>
              </div>

              <div className="p-3 glass-card bg-slate-900/40 border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero lag, zero countdown: joins directly into the duel.</span>
              </div>
            </div>

            {/* BOX 3: Play vs Romantic Bot Companion */}
            <div className="glass-card p-6 flex flex-col justify-between gap-5 border-cyan-500/40">
              <div>
                <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" /> 3. Play vs AI Partner
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Play solo against an affectionate AI bot who chats, sends emojis, and summons units.
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => handleStartBotMatch('boyfriend')}
                    className="glass-button py-3 px-3.5 text-xs font-bold text-slate-200 hover:text-white border-slate-700 hover:border-cyan-400 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">👑 Play vs Bot Boyfriend</span>
                    <span className="text-[10px] text-cyan-400 font-semibold">You as Queen (Black)</span>
                  </button>

                  <button
                    onClick={() => handleStartBotMatch('girlfriend')}
                    className="glass-button py-3 px-3.5 text-xs font-bold text-slate-200 hover:text-white border-slate-700 hover:border-rose-400 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">👸 Play vs Bot Girlfriend</span>
                    <span className="text-[10px] text-rose-400 font-semibold">You as Prince (White)</span>
                  </button>
                </div>
              </div>

              <div className="p-3 glass-card bg-slate-900/40 border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Bot sends sweet in-game chat messages and reacts to your moves!</span>
              </div>
            </div>
          </div>

          {/* Open Rose Rooms Lobby Table */}
          <div className="glass-card p-6 border-slate-700/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-200">
                  Open Waiting Rooms ({publicRooms.length})
                </h3>
              </div>
              <button
                onClick={() => refreshRooms()}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh List
              </button>
            </div>

            {publicRooms.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-700/60 rounded-xl text-slate-400 text-xs">
                No open rooms right now. Click "Generate Room Code" above to invite your partner!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {publicRooms.map((room) => (
                  <div
                    key={room.code}
                    className="p-3.5 glass-card border-slate-700 hover:border-cyan-400 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-100">{room.hostDisplayName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Role: {room.hostRole === 'boyfriend' ? '👑 Boyfriend' : '👸 Girlfriend'}</span>
                        <span>·</span>
                        <span className="font-mono text-cyan-300">{room.code}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => joinRoom(room.code)}
                      className="glass-button-primary py-2 px-3 text-xs font-bold cursor-pointer shrink-0"
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

      {/* ==================== 2. ACTIVE MATCH VIEW (GLASSMORPHIC THEME) ==================== */}
      {activeMatch && (
        <div className="z-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6 items-start justify-center flex-1">
          {/* Left Sidebar: Partner Info & In-Game Love Chat Box */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            {/* Partner Info Box */}
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Partner</span>
                <span className="text-xs font-bold text-cyan-300">
                  {opponentSeat?.role === 'boyfriend' ? '👑 Boyfriend' : '👸 Girlfriend'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-200">
                  {opponentSeat?.displayName?.slice(0, 2).toUpperCase() || 'P2'}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-100">{opponentSeat?.displayName || 'Partner'}</div>
                  <div className="text-xs text-slate-400">
                    {activeMatch.turn === opponentSeat?.color ? '⏳ Thinking with love...' : 'Waiting'}
                  </div>
                </div>
              </div>

              {/* Petal Meter */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400">Petals Harvested:</span>
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
            <div className="glass-card p-3 flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Send Reaction
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {['❤️', '🌹', '✨', '💍', '🥰', '😉', '😅', '⏳'].map((emo) => (
                  <button
                    key={emo}
                    onClick={() => handleSendReaction(emo)}
                    className="p-2 glass-button text-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Game Romantic Chat Box */}
            <div className="glass-card p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Love Messages
              </div>

              <div className="h-44 overflow-y-auto flex flex-col gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                {chatMessages.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic text-center my-auto">
                    Say something sweet to your partner...
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col p-2 rounded-xl ${
                        msg.senderUserId === (user?.id || 'usr_human')
                          ? 'bg-cyan-950/50 border border-cyan-500/30 ml-3'
                          : 'bg-slate-800/60 border border-slate-700 mr-3'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-cyan-300">{msg.senderDisplayName}</span>
                      <span className="text-slate-100 text-xs break-words">{msg.text}</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Type a sweet message..."
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  className="flex-1 bg-slate-900/80 border border-slate-700 px-3 py-1.5 text-xs text-white rounded-lg focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!chatInputText.trim()}
                  className="px-3 py-1.5 glass-button-primary disabled:opacity-40 text-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Center: Glass Chess Board from Reference Image */}
          <div className="flex flex-col items-center gap-3 flex-1 w-full max-w-[540px]">
            {/* Turn Banner with Complete Clarity */}
            <div className="w-full px-4 py-2.5 glass-card flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isMyTurn ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse' : 'bg-slate-500'}`} />
                <span className={isMyTurn ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                  {isMyTurn
                    ? `👉 Your Turn · ${effectiveMyColor === 'white' ? 'White' : 'Black'} to move (You)`
                    : `Partner is thinking... · ${effectiveMyColor === 'white' ? 'Black' : 'White'} to move`}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Untimed · Move {activeMatch.turnCount}
              </div>
            </div>

            {/* Summon Placement Mode Banner */}
            {summoningUnit && (
              <div className="w-full p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-200 text-xs font-semibold flex items-center justify-between animate-pulse">
                <span>Select an empty square in your home 2 ranks to place your summon!</span>
                <button
                  onClick={() => setSummoningUnit(null)}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-400 text-[10px] uppercase cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Glass Board Tray (Curved bevel and coordinate gutters like in reference image) */}
            <div className="w-full glass-board-tray p-3 sm:p-4 flex flex-col items-center">
              {/* Board Files Top (A - H) */}
              <div className="w-full grid grid-cols-8 text-center text-[10px] font-bold text-slate-400 mb-1">
                {fileLabels.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>

              {/* 8x8 Board Container with Strict 1:1 Aspect Ratio Squares */}
              <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl border border-slate-600/60 grid grid-cols-8 grid-rows-8">
                {displayYIndices.map((y, rowIdx) =>
                  displayXIndices.map((x, colIdx) => {
                    const piece = activeMatch.board[y][x];
                    const isSelected = selectedSquare?.x === x && selectedSquare?.y === y;
                    const isLegalDest = legalDestinations.some((d) => d.x === x && d.y === y);
                    const isDark = (x + y) % 2 === 1;

                    // Highlight home rows if placing summon
                    const isHomeRow = effectiveMyColor === 'white' ? y <= 1 : y >= 6;
                    const canSummonHere = summoningUnit && isHomeRow && !piece;

                    return (
                      <div
                        key={`${x}-${y}`}
                        onClick={() => handleSquareClick(x, y)}
                        className={`aspect-square w-full h-full flex items-center justify-center relative cursor-pointer select-none transition-colors ${
                          canSummonHere
                            ? 'bg-cyan-900/60 ring-2 ring-cyan-400'
                            : isDark
                            ? 'bg-[#738294]'
                            : 'bg-[#eaedf1]'
                        } ${isSelected ? 'ring-3 ring-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.8)] z-10' : ''}`}
                      >
                        {/* Legal Move Glow Dot from Reference Image */}
                        {isLegalDest && !piece && (
                          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400/90 shadow-[0_0_10px_#22d3ee] animate-pulse z-20" />
                        )}
                        {/* Legal Capture Ring Indicator */}
                        {isLegalDest && piece && (
                          <div className="absolute inset-1 rounded-lg border-2 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)] pointer-events-none z-20" />
                        )}
                        {canSummonHere && (
                          <div className="text-xs animate-bounce z-20">🌹</div>
                        )}
                        {piece && <ChessPiece type={piece.type} color={piece.color} />}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Board Files Bottom (A - H) */}
              <div className="w-full grid grid-cols-8 text-center text-[10px] font-bold text-slate-400 mt-1">
                {fileLabels.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: My Status, Petals & Summoning */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  You ({mySeat?.role === 'boyfriend' ? '👑 Boyfriend' : '👸 Girlfriend'})
                </span>
                <span className="text-xs font-bold text-cyan-300 uppercase">{effectiveMyColor}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/90 border border-cyan-400 flex items-center justify-center font-bold text-white shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  {user.displayName?.slice(0, 2).toUpperCase() || 'YOU'}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-100">{user.displayName || 'You'}</div>
                  <div className="text-xs text-slate-400">
                    {isMyTurn ? '👉 Your Move' : 'Waiting for partner'}
                  </div>
                </div>
              </div>

              {/* Petal Meter & Summon Action */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Petals:</span>
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
                  disabled={!isMyTurn || (mySeat?.petals || 0) < 3 || (mySeat?.summonsUsed || 0) >= 2}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    (mySeat?.petals || 0) < 3 || !isMyTurn
                      ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                      : 'cursor-pointer glass-button-primary text-white'
                  }`}
                >
                  ⚡ Summon (3 🌹)
                </button>
              </div>
            </div>

            {/* Game Over Banner */}
            {activeMatch.status === 'completed' && (
              <div className="glass-card p-6 border-cyan-400/80 text-center flex flex-col gap-4 shadow-2xl">
                <Trophy className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {activeMatch.winner === 'draw' ? 'Match Drawn in Harmony!' : `${activeMatch.winner} Triumphs!`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{activeMatch.winReason}</p>
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
                  className="glass-button-primary py-3 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Return to Lobby & Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 3. ROMANTIC RULEBOOK MODAL (POPUP ON START, UNTIMED) ==================== */}
      {showRulebook && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-lg w-full p-6 sm:p-7 flex flex-col gap-5 border-cyan-500/50 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
                  Rose Paradise · Couples Rules
                </h3>
              </div>
              <button
                onClick={() => setShowRulebook(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-200">
              <div className="p-3.5 glass-card bg-slate-900/60 border-slate-700">
                <div className="font-bold text-cyan-300 uppercase mb-1 flex items-center gap-1.5">
                  <span>👑</span> 1. Boyfriend (Prince) & Girlfriend (Queen)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Prince moves 1 square in any direction like a King, and has the royal privilege to leap over 1 adjacent friendly piece to safety! The Queen retains full diagonal and straight mobility. White always moves first.
                </p>
              </div>

              <div className="p-3.5 glass-card bg-slate-900/60 border-slate-700">
                <div className="font-bold text-rose-300 uppercase mb-1 flex items-center gap-1.5">
                  <span>🌹</span> 2. Petals of Passion & Love Link
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Earn Petals by capturing opposing pieces, delivering checks, or bringing your Prince and Queen adjacent on the board to trigger a romantic <strong>Love Link</strong> (+1 Petal, max once per 4 moves).
                </p>
              </div>

              <div className="p-3.5 glass-card bg-slate-900/60 border-slate-700">
                <div className="font-bold text-cyan-300 uppercase mb-1 flex items-center gap-1.5">
                  <span>⚡</span> 3. Summoning Reinforcements (3 🌹)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Spend 3 Petals to summon a loyal ally into your home 2 ranks:
                  <br />• <strong>Cupid (Priest)</strong>: Bishop movement with charming reach.
                  <br />• <strong>Thorn Guard (Communist)</strong>: Jumps like a Knight, attacks orthogonally.
                  <br />• <strong>Rose Tower (Supreme Rook)</strong>: Unyielding fortress rook.
                </p>
              </div>

              <div className="p-3.5 glass-card bg-slate-900/60 border-cyan-500/30">
                <div className="font-bold text-emerald-300 uppercase mb-1 flex items-center gap-1.5">
                  <span>🕊️</span> 4. Untimed Love
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  There is no ticking clock and no time limit. Deliberate together and play as long as you want because it is your love!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRulebook(false)}
              className="glass-button-primary py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer text-center"
            >
              Let's Play 🌹
            </button>
          </div>
        </div>
      )}

      {/* ==================== 4. SUMMON UNIT SELECTOR MODAL ==================== */}
      {isSummonModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass-card max-w-md w-full p-6 flex flex-col gap-4 border-cyan-500/50">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" /> Summon Reinforcement
            </h3>
            <p className="text-xs text-slate-300">
              Select an ally unit to summon using 3 Petals. Then click an empty square in your home 2 ranks to place it:
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'priest' as const, label: 'Cupid', role: 'Priest', desc: 'Bishop + Ranged' },
                { type: 'communist' as const, label: 'Thorn Guard', role: 'Knight Hybrid', desc: 'Knight Jump' },
                { type: 'supremeRook' as const, label: 'Rose Tower', role: 'Supreme Rook', desc: 'Fortress' },
              ].map((s) => (
                <button
                  key={s.type}
                  onClick={() => {
                    setSummoningUnit(s.type);
                    setIsSummonModalOpen(false);
                  }}
                  className="p-3.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:border-cyan-400 hover:bg-slate-800 text-center cursor-pointer transition-all flex flex-col items-center gap-1"
                >
                  <span className="font-bold text-xs text-cyan-200">{s.label}</span>
                  <span className="text-[10px] text-slate-400">{s.role}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsSummonModalOpen(false)}
              className="glass-button py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
