import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  CullingMatchState,
  CullingPieceColor,
} from '../types/cullingGame';
import { createInitialCullingMatch } from '../game/cullingEngine';
import { CullingMatchView } from './CullingMatchView';
import { useAuth } from '../context/AuthContext';
import { ModeArtPanel } from './ModeArtPanel';
import {
  Swords,
  Bot,
  Users,
  BookOpen,
  ArrowLeft,
  Clock,
  Sparkles,
  Copy,
  Check,
  Plus,
  KeyRound,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const CullingTheoryView = lazy(() => import('./CullingTheoryView'));

interface CullingModeEntryProps {
  onBack: () => void;
}

interface PublicChallenge {
  code: string;
  hostDisplayName: string;
  hostUserId: string;
  timeControl: 120 | 300;
  preferredSide: 'white' | 'black' | 'random';
  createdAt: number;
}

export const CullingModeEntry: React.FC<CullingModeEntryProps> = ({ onBack }) => {
  const { user, token } = useAuth();

  const [activeMatch, setActiveMatch] = useState<CullingMatchState | null>(null);
  const activeMatchRef = useRef<CullingMatchState | null>(null);
  activeMatchRef.current = activeMatch;

  const [isBotMatch, setIsBotMatch] = useState(false);
  const [userColor, setUserColor] = useState<CullingPieceColor>('white');
  const [showTheory, setShowTheory] = useState(false);

  // Common setup state
  const [selectedSide, setSelectedSide] = useState<'white' | 'black' | 'random'>('random');
  const [timeControl, setTimeControl] = useState<120 | 300>(300);

  // Direct Challenge Multiplayer state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [hostedCode, setHostedCode] = useState<string | null>(null);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [isJoiningChallenge, setIsJoiningChallenge] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [publicChallenges, setPublicChallenges] = useState<PublicChallenge[]>([]);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize single robust WebSocket connection for Culling Mode
  useEffect(() => {
    let isMounted = true;

    const connectSocket = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      setSocket(ws);

      ws.onopen = () => {
        if (token) {
          ws.send(JSON.stringify({ type: 'auth', token }));
        }
        if (activeMatchRef.current) {
          ws.send(
            JSON.stringify({
              type: 'culling:resync',
              matchId: activeMatchRef.current.id,
              userId: user?.id,
            })
          );
        } else {
          ws.send(JSON.stringify({ type: 'culling:list_challenges' }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'culling:challenge_created') {
            setHostedCode(msg.code);
            setIsCreatingChallenge(false);
            setStatusMessage('Waiting for opponent to join...');
            setErrorMessage(null);
          } else if (msg.type === 'culling:challenges_list') {
            setPublicChallenges(msg.challenges || []);
          } else if (msg.type === 'culling:challenge_cancelled') {
            setHostedCode(null);
            setIsCreatingChallenge(false);
            setStatusMessage(null);
          } else if (msg.type === 'culling:match_started' && msg.match) {
            const match: CullingMatchState = msg.match;
            const assignedColor: CullingPieceColor =
              msg.yourColor || (match.whitePlayer.userId === user?.id ? 'white' : 'black');

            setStatusMessage('Opponent joined! Launching game...');
            setIsJoiningChallenge(false);
            setIsCreatingChallenge(false);
            setHostedCode(null);

            setTimeout(() => {
              setIsBotMatch(false);
              setUserColor(assignedColor);
              setActiveMatch(match);
              setStatusMessage(null);
            }, 300);
          } else if (msg.type === 'culling:error') {
            setErrorMessage(msg.message || 'Operation failed');
            setIsJoiningChallenge(false);
            setIsCreatingChallenge(false);
            setStatusMessage(null);
          }
        } catch (err) {
          console.error('Socket message parse error:', err);
        }
      };

      ws.onerror = () => {
        setIsJoiningChallenge(false);
        setIsCreatingChallenge(false);
      };

      ws.onclose = () => {
        setIsJoiningChallenge(false);
        setIsCreatingChallenge(false);
        wsRef.current = null;
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(connectSocket, 3000);
        }
      };
    };

    connectSocket();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !activeMatchRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, user?.id]);

  // Start Bot Match
  const handleStartBotMatch = () => {
    const chosenSide: CullingPieceColor =
      selectedSide === 'random'
        ? Math.random() < 0.5
          ? 'white'
          : 'black'
        : selectedSide;

    const matchId = `bot_${Date.now()}`;
    const newMatch = createInitialCullingMatch(
      matchId,
      {
        userId: chosenSide === 'white' ? user?.id || 'player' : 'culling_bot',
        username: chosenSide === 'white' ? user?.username || 'Player' : 'Grandmaster Bot',
        displayName: chosenSide === 'white' ? user?.displayName || 'Player (White)' : 'Grandmaster Bot',
      },
      {
        userId: chosenSide === 'black' ? user?.id || 'player' : 'culling_bot',
        username: chosenSide === 'black' ? user?.username || 'Player' : 'Grandmaster Bot',
        displayName: chosenSide === 'black' ? user?.displayName || 'Player (Black)' : 'Grandmaster Bot',
      },
      timeControl
    );

    setIsBotMatch(true);
    setUserColor(chosenSide);
    setActiveMatch(newMatch);
  };

  // Create Direct Challenge Room
  const handleCreateChallenge = () => {
    setErrorMessage(null);
    setStatusMessage('Creating challenge room...');
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setErrorMessage('Connecting to game server...');
      return;
    }
    setIsCreatingChallenge(true);

    wsRef.current.send(
      JSON.stringify({
        type: 'culling:create_challenge',
        userId: user?.id,
        displayName: user?.displayName || user?.username,
        timeControl,
        preferredSide: selectedSide,
      })
    );
  };

  // Cancel Hosted Challenge
  const handleCancelChallenge = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && hostedCode) {
      wsRef.current.send(
        JSON.stringify({
          type: 'culling:cancel_challenge',
          code: hostedCode,
          userId: user?.id,
        })
      );
    }
    setHostedCode(null);
    setStatusMessage(null);
  };

  // Join Challenge with Code
  const handleJoinChallenge = (codeToJoin?: string) => {
    const targetCode = (codeToJoin || joinCodeInput).trim().toUpperCase();
    if (!targetCode) {
      setErrorMessage('Please enter a room code.');
      return;
    }

    if (hostedCode && targetCode === hostedCode) {
      setErrorMessage('You cannot join your own room code.');
      return;
    }

    setErrorMessage(null);
    setIsJoiningChallenge(true);
    setStatusMessage('Connecting to room...');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'culling:join_challenge',
          code: targetCode,
          userId: user?.id,
          displayName: user?.displayName || user?.username,
        })
      );
    } else {
      setErrorMessage('Disconnected from server. Reconnecting...');
      setIsJoiningChallenge(false);
      setStatusMessage(null);
    }
  };

  const handleCopyCode = () => {
    if (hostedCode) {
      navigator.clipboard.writeText(hostedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const refreshChallenges = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'culling:list_challenges' }));
    }
  };

  // Fullscreen Pre-Game Theory Book Modal/View
  if (showTheory) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-xs font-bold gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span>Loading Culling Theory Book...</span>
          </div>
        }
      >
        <CullingTheoryView onBack={() => setShowTheory(false)} />
      </Suspense>
    );
  }

  // If a match is active, render CullingMatchView
  if (activeMatch) {
    return (
      <CullingMatchView
        initialMatch={activeMatch}
        isBotMatch={isBotMatch}
        userColor={userColor}
        onExit={() => {
          setActiveMatch(null);
          refreshChallenges();
        }}
        socket={wsRef.current}
        onPlaySimilarBot={() => {
          setActiveMatch(null);
          handleStartBotMatch();
        }}
        onPlayMultiplayer={() => {
          setActiveMatch(null);
          handleCreateChallenge();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0e14] text-black dark:text-white flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="px-4 sm:px-6 py-3 border-b-3 border-black dark:border-white bg-white dark:bg-[#0f172a] sticky top-0 z-40 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1e293b] hover:bg-neutral-100 dark:hover:bg-slate-700 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black uppercase cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-500" />
          <h1 className="text-base sm:text-lg font-black uppercase tracking-wider">
            Culling Game Mode
          </h1>
        </div>

        <button
          onClick={() => setShowTheory(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
        >
          <BookOpen className="w-4 h-4 text-white" />
          <span>Theory Book</span>
        </button>
      </header>

      {/* Main Mode Lobby */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 flex flex-col items-center justify-center gap-5">
        {/* Error Banner */}
        {errorMessage && (
          <div className="w-full bg-red-600 text-white border-2 border-black p-3 font-bold text-xs uppercase flex items-center justify-between shadow-[3px_3px_0px_#000] animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-red-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Status / Transition Banner */}
        {statusMessage && (
          <div className="w-full bg-amber-400 text-black border-2 border-black p-3 font-black text-xs uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000] animate-in fade-in">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Main Banner Card */}
        <div className="w-full bg-white dark:bg-[#0f172a] border-4 border-black dark:border-white shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] rounded-2xl flex flex-col md:flex-row overflow-hidden">
          {/* Mobile Hero Banner (160px, md:hidden) */}
          <div className="md:hidden relative h-40 w-full shrink-0 overflow-hidden bg-black select-none border-b-3 border-black dark:border-white">
            <img
              src="/assets/aistudio/image_9087d774.png"
              alt="Culling Game Battlefield"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center filter brightness-105 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-red-600 text-white border border-white shadow-[1px_1px_0px_#fff]">
                88-SQUARE CROSS GRID
              </span>
              <span className="text-[10px] font-mono font-bold text-white/90 bg-black/70 px-2 py-0.5 border border-white/20">
                SORCERER DUEL • 1V1 & BOT
              </span>
            </div>
          </div>

          <ModeArtPanel
            modeKey="culling-game"
            title="Culling Game"
            subtitle="88-Square Cross Battlefield"
          />

          <div className="flex-1 p-4 sm:p-7 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            88 Playable Cross-Board Squares • Direct Challenge Multiplayer
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
            Culling Game Battlegrounds
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-300 font-bold max-w-2xl mx-auto mb-4">
            Balanced Sorcerer combat on an 88-square cross grid. Challenge a friend directly via Room Code, join open player challenges, or clash against the Grandmaster Bot.
          </p>

          {/* Prominent Red Pre-Game Theory Book Gate */}
          <div className="mb-6 p-3 bg-red-600/10 border-2 border-red-600 dark:border-red-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase text-red-600 dark:text-red-400 block">
                  New to Culling Game Mode?
                </span>
                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                  Read complete piece movesets, 5-turn King immunity laws, and master tactical tips.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowTheory(true)}
              className="w-full sm:w-auto min-h-[44px] md:min-h-0 px-4 py-2.5 sm:py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
            >
              📖 Read the Theory Book First
            </button>
          </div>

          {/* Time Control & Allegiance Global Defaults */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 pb-4 border-b-2 border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Time Control:
              </span>
              <button
                onClick={() => setTimeControl(120)}
                className={`min-h-[44px] md:min-h-0 px-3 py-2 md:py-1 border-2 border-black font-black text-xs uppercase cursor-pointer transition-transform flex items-center justify-center ${
                  timeControl === 120
                    ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white dark:bg-[#1e293b] text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Blitz (2m)
              </button>
              <button
                onClick={() => setTimeControl(300)}
                className={`min-h-[44px] md:min-h-0 px-3 py-2 md:py-1 border-2 border-black font-black text-xs uppercase cursor-pointer transition-transform flex items-center justify-center ${
                  timeControl === 300
                    ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white dark:bg-[#1e293b] text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Rapid (5m)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Allegiance:
              </span>
              <div className="inline-flex gap-1">
                <button
                  onClick={() => setSelectedSide('white')}
                  className={`min-h-[44px] md:min-h-0 px-3 py-2 md:py-1 font-black text-xs uppercase border-2 border-black cursor-pointer flex items-center justify-center ${
                    selectedSide === 'white'
                      ? 'bg-white text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-neutral-200 dark:bg-slate-800 text-neutral-500'
                  }`}
                >
                  White
                </button>
                <button
                  onClick={() => setSelectedSide('black')}
                  className={`min-h-[44px] md:min-h-0 px-3 py-2 md:py-1 font-black text-xs uppercase border-2 border-black cursor-pointer flex items-center justify-center ${
                    selectedSide === 'black'
                      ? 'bg-black text-white shadow-[2px_2px_0px_#000] dark:border-white'
                      : 'bg-neutral-200 dark:bg-slate-800 text-neutral-500'
                  }`}
                >
                  Black
                </button>
                <button
                  onClick={() => setSelectedSide('random')}
                  className={`min-h-[44px] md:min-h-0 px-3 py-2 md:py-1 font-black text-xs uppercase border-2 border-black cursor-pointer flex items-center justify-center ${
                    selectedSide === 'random'
                      ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-neutral-200 dark:bg-slate-800 text-neutral-500'
                  }`}
                >
                  Random
                </button>
              </div>
            </div>
          </div>

          {/* Two Game Sections: Direct Challenge Multiplayer & Play vs Bot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-left">
            {/* DIRECT CHALLENGE MULTIPLAYER */}
            <div className="bg-neutral-100 dark:bg-[#1e293b] p-5 border-3 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black uppercase">Direct Challenge</h3>
                      <p className="text-xs text-neutral-600 dark:text-slate-400 font-bold">
                        1v1 Room Code Battles & Open Lobby
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={refreshChallenges}
                    className="p-1.5 hover:bg-neutral-200 dark:hover:bg-slate-700 border border-black/40 cursor-pointer"
                    title="Refresh Open Challenges"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* If user is currently hosting a challenge room */}
                {hostedCode ? (
                  <div className="bg-amber-400 text-black p-4 border-2 border-black shadow-[3px_3px_0px_#000] mb-4 text-center animate-in fade-in">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider block mb-1">
                      Waiting for Opponent to Join…
                    </span>
                    <div className="flex items-center justify-center gap-2 my-2">
                      <span className="text-2xl font-mono font-black tracking-widest bg-black text-amber-400 px-3 py-1 border-2 border-black">
                        {hostedCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
                        title="Copy Room Code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-bold mt-1">
                      Send this Room Code to your opponent. The game begins the second they join!
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        onClick={handleCancelChallenge}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase border border-black cursor-pointer"
                      >
                        Cancel Challenge
                      </button>
                      <button
                        onClick={() => setShowTheory(true)}
                        className="px-3 py-1 bg-black text-white hover:bg-neutral-800 font-black text-[11px] uppercase border border-black cursor-pointer"
                      >
                        📖 Read Codex While Waiting
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Create Room Button Row */}
                    <div className="mb-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleCreateChallenge}
                        disabled={isCreatingChallenge}
                        className="flex-1 min-h-[44px] md:min-h-0 py-3 md:py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                      >
                        {isCreatingChallenge ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>Create Direct Room</span>
                      </button>

                      <button
                        onClick={() => setShowTheory(true)}
                        className="min-h-[44px] md:min-h-0 py-3 md:py-2.5 px-3.5 md:px-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap"
                        title="Read theory before creating"
                      >
                        <span>📖 Codex</span>
                      </button>
                    </div>

                    {/* Join with Room Code Input */}
                    <div className="bg-white dark:bg-[#0f172a] p-3 border-2 border-black dark:border-white mb-4 shadow-[2px_2px_0px_#000]">
                      <label className="text-[10px] font-mono font-black uppercase text-neutral-500 block mb-1">
                        Have an Invite Code?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. CULL77"
                          value={joinCodeInput}
                          onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleJoinChallenge()}
                          className="flex-1 px-2.5 py-1.5 bg-neutral-100 dark:bg-[#1e293b] border-2 border-black dark:border-white font-mono text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400"
                          maxLength={8}
                        />
                        <button
                          onClick={() => handleJoinChallenge()}
                          disabled={isJoiningChallenge || !joinCodeInput.trim()}
                          className="min-h-[44px] md:min-h-0 px-3.5 py-2 md:py-1.5 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
                        >
                          {isJoiningChallenge ? (
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
                        <span className="text-[10px] font-mono font-black uppercase text-neutral-500">
                          Waiting Rivals ({publicChallenges.length})
                        </span>
                      </div>

                      <div className="max-h-32 overflow-y-auto space-y-1.5">
                        {publicChallenges.length === 0 ? (
                          <div className="text-[11px] text-neutral-400 py-3 text-center font-bold border border-dashed border-black/20 dark:border-white/20">
                            No open challenges right now. Create one above!
                          </div>
                        ) : (
                          publicChallenges.map((c) => (
                            <div
                              key={c.code}
                              className="p-2 bg-white dark:bg-[#0f172a] border border-black/30 dark:border-white/30 flex items-center justify-between text-xs font-bold"
                            >
                              <div>
                                <div className="font-black truncate max-w-[150px]">
                                  {c.hostDisplayName}
                                </div>
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  Code: {c.code} • {c.timeControl / 60}m • {c.preferredSide.toUpperCase()}
                                </div>
                              </div>
                              <button
                                onClick={() => handleJoinChallenge(c.code)}
                                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] uppercase border border-black cursor-pointer shadow-[1px_1px_0px_#000]"
                              >
                                Fight
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* PLAY VS GRANDMASTER BOT */}
            <div className="bg-neutral-100 dark:bg-[#1e293b] p-5 border-3 border-black dark:border-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase">Play vs Bot</h3>
                    <p className="text-xs text-neutral-600 dark:text-slate-400 font-bold">
                      Grandmaster 2-ply Minimax Engine
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-3 border-2 border-black dark:border-white my-3 text-xs font-bold space-y-1.5 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Solo Training</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-slate-400 font-semibold">
                    Master symmetrical Sorcerer techniques against an intelligent bot. No wait time, instant turn responses.
                  </p>
                </div>

                <div className="text-[11px] font-mono font-bold text-neutral-500 my-2">
                  Configured: {timeControl / 60}m timer • Side: {selectedSide.toUpperCase()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={handleStartBotMatch}
                  className="flex-1 min-h-[44px] md:min-h-0 py-3.5 md:py-3 bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span>Play vs Bot</span>
                </button>

                <button
                  onClick={() => setShowTheory(true)}
                  className="min-h-[44px] md:min-h-0 py-3.5 md:py-3 px-3.5 md:px-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap"
                  title="Read Theory Book"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Theory Book</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </div>
  );
};
