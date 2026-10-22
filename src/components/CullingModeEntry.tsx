import React, { useState, useEffect, useRef } from 'react';
import {
  CullingMatchState,
  CullingPieceColor,
} from '../types/cullingGame';
import { createInitialCullingMatch } from '../game/cullingEngine';
import { CullingMatchView } from './CullingMatchView';
import { CullingRulesModal } from './CullingRulesModal';
import { useAuth } from '../context/AuthContext';
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
  const [isBotMatch, setIsBotMatch] = useState(false);
  const [userColor, setUserColor] = useState<CullingPieceColor>('white');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Common setup state
  const [selectedSide, setSelectedSide] = useState<'white' | 'black' | 'random'>('random');
  const [timeControl, setTimeControl] = useState<120 | 300>(300);

  // Direct Challenge Multiplayer state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [hostedCode, setHostedCode] = useState<string | null>(null);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [isJoiningChallenge, setIsJoiningChallenge] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [publicChallenges, setPublicChallenges] = useState<PublicChallenge[]>([]);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize and maintain WebSocket connection for Direct Challenges
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
      // Request list of open direct challenges
      ws.send(JSON.stringify({ type: 'culling:list_challenges' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'culling:challenge_created') {
          setHostedCode(msg.code);
          setIsCreatingChallenge(false);
          setErrorMessage(null);
        } else if (msg.type === 'culling:challenges_list') {
          setPublicChallenges(msg.challenges || []);
        } else if (msg.type === 'culling:challenge_cancelled') {
          setHostedCode(null);
          setIsCreatingChallenge(false);
        } else if (msg.type === 'culling:match_started' && msg.match) {
          const match: CullingMatchState = msg.match;
          const mySide: CullingPieceColor =
            match.whitePlayer.userId === user?.id ? 'white' : 'black';
          setIsBotMatch(false);
          setUserColor(mySide);
          setActiveMatch(match);
          setSocket(ws);
          setHostedCode(null);
          setIsJoiningChallenge(false);
          setIsCreatingChallenge(false);
        } else if (msg.type === 'culling:error') {
          setErrorMessage(msg.message || 'Operation failed');
          setIsJoiningChallenge(false);
          setIsCreatingChallenge(false);
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
    };

    return () => {
      if (!activeMatch) {
        ws.close();
      }
    };
  }, [token, user?.id, activeMatch]);

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
  };

  // Join Challenge with Code
  const handleJoinChallenge = (codeToJoin?: string) => {
    const targetCode = (codeToJoin || joinCodeInput).trim().toUpperCase();
    if (!targetCode) {
      setErrorMessage('Please enter a challenge room code.');
      return;
    }

    setErrorMessage(null);
    setIsJoiningChallenge(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'culling:join_challenge',
          code: targetCode,
          userId: user?.id,
        })
      );
    } else {
      setErrorMessage('Disconnected from server. Reconnecting...');
      setIsJoiningChallenge(false);
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

  // If a match is active, render CullingMatchView
  if (activeMatch) {
    return (
      <CullingMatchView
        initialMatch={activeMatch}
        isBotMatch={isBotMatch}
        userColor={userColor}
        onExit={() => {
          setActiveMatch(null);
          if (socket) socket.close();
        }}
        socket={socket}
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
          onClick={() => setIsRulesOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1e293b] hover:bg-neutral-100 dark:hover:bg-slate-700 border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs font-black uppercase cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>Rules Codex</span>
        </button>
      </header>

      {/* Main Mode Lobby */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 flex flex-col items-center justify-center gap-5">
        {/* Error Banner */}
        {errorMessage && (
          <div className="w-full bg-red-600 text-white border-2 border-black p-3 font-bold text-xs uppercase flex items-center justify-between shadow-[3px_3px_0px_#000] animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
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

        {/* Main Banner Card */}
        <div className="w-full bg-white dark:bg-[#0f172a] border-4 border-black dark:border-white shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] rounded-2xl p-5 sm:p-7 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            88 Playable Cross-Board Squares • Direct Challenge Multiplayer
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
            Culling Game Battlegrounds
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-300 font-bold max-w-2xl mx-auto mb-5">
            Balanced Sorcerer combat on an 88-square cross grid. Challenge a friend directly via Room Code, join open player challenges, or clash against the Grandmaster Bot.
          </p>

          {/* Time Control & Allegiance Global Defaults */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6 pb-4 border-b-2 border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Time Control:
              </span>
              <button
                onClick={() => setTimeControl(120)}
                className={`px-3 py-1 border-2 border-black font-black text-xs uppercase cursor-pointer transition-transform ${
                  timeControl === 120
                    ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white dark:bg-[#1e293b] text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Blitz (2m)
              </button>
              <button
                onClick={() => setTimeControl(300)}
                className={`px-3 py-1 border-2 border-black font-black text-xs uppercase cursor-pointer transition-transform ${
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
                  className={`px-2.5 py-1 font-black text-xs uppercase border-2 border-black cursor-pointer ${
                    selectedSide === 'white'
                      ? 'bg-white text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-neutral-200 dark:bg-slate-800 text-neutral-500'
                  }`}
                >
                  White
                </button>
                <button
                  onClick={() => setSelectedSide('black')}
                  className={`px-2.5 py-1 font-black text-xs uppercase border-2 border-black cursor-pointer ${
                    selectedSide === 'black'
                      ? 'bg-black text-white shadow-[2px_2px_0px_#000] dark:border-white'
                      : 'bg-neutral-200 dark:bg-slate-800 text-neutral-500'
                  }`}
                >
                  Black
                </button>
                <button
                  onClick={() => setSelectedSide('random')}
                  className={`px-2.5 py-1 font-black text-xs uppercase border-2 border-black cursor-pointer ${
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
                  <div className="bg-amber-400 text-black p-4 border-2 border-black shadow-[3px_3px_0px_#000] mb-4 text-center">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider block mb-1">
                      Waiting for Opponent to Join
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
                    <button
                      onClick={handleCancelChallenge}
                      className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase border border-black cursor-pointer"
                    >
                      Cancel Challenge
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Create Room Button */}
                    <div className="mb-4">
                      <button
                        onClick={handleCreateChallenge}
                        disabled={isCreatingChallenge}
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                      >
                        {isCreatingChallenge ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>Create Direct Challenge Room</span>
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
                          className="px-3 py-1.5 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
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

              <button
                onClick={handleStartBotMatch}
                className="w-full py-3 bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 mt-4"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Play vs Bot</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Rules Modal */}
      <CullingRulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
};
