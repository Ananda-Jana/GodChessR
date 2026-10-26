import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Flag,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  Users,
  Crown,
  Sparkles,
  Cpu,
  Activity,
  Repeat,
  Radio,
  Terminal,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChessBoard3D } from './3dchessboard';
import { Piece3DStandalone, type PieceType, type Team } from './3dchesspieces';
import {
  execute3dMove,
  getLegalMoves,
  posToNotation,
  createInitialMatchState,
} from './chess3dEngine';
import { getBest3dBotMove, PUNISHER_BOTS, type PunisherBotId } from './chess3dBot';
import type { Chess3dMatchState, Position3D, TimeControl3D } from './types';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/audio';

interface Chess3dArcadeViewProps {
  initialState?: Chess3dMatchState;
  botId?: PunisherBotId;
  playerTeam?: Team;
  timeControl?: TimeControl3D;
  roomCode?: string;
  onExit: () => void;
}

interface BotTransmission {
  id: string;
  text: string;
  type: 'think' | 'taunt' | 'eval';
  timestamp: string;
}

export const Chess3dArcadeView: React.FC<Chess3dArcadeViewProps> = ({
  initialState,
  botId = 'chrome-reaper',
  playerTeam = 'orange',
  timeControl = '5m',
  roomCode,
  onExit,
}) => {
  const { user } = useAuth();
  const [match, setMatch] = useState<Chess3dMatchState>(() => {
    if (initialState) return initialState;
    const botConfig = PUNISHER_BOTS[botId];
    const humanPlayer = {
      userId: user?.id || 'player_1',
      displayName: user?.displayName || 'Commander',
      avatarId: user?.avatarId || 'avatar_prince',
      team: playerTeam,
    };
    const botPlayer = {
      userId: `bot_${botId}`,
      displayName: botConfig?.name || 'Chrome Reaper',
      avatarId: 'avatar_bot',
      team: (playerTeam === 'orange' ? 'red' : 'orange') as Team,
      isBot: true,
      botId,
    };

    const whitePlayer = playerTeam === 'orange' ? humanPlayer : botPlayer;
    const blackPlayer = playerTeam === 'red' ? humanPlayer : botPlayer;

    return createInitialMatchState(
      `3d_${Date.now()}`,
      whitePlayer,
      blackPlayer,
      timeControl,
      roomCode ? 'multiplayer' : 'bot'
    );
  });

  const [selectedPos, setSelectedPos] = useState<Position3D | null>(null);
  const [validMoves, setValidMoves] = useState<Position3D[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position3D; to: Position3D } | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [flipped, setFlipped] = useState<boolean>(playerTeam === 'red' || playerTeam === 'black');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [mobileNotationOpen, setMobileNotationOpen] = useState(false);

  // Dedicated Bot Telemetry & Speech State
  const botConfig = PUNISHER_BOTS[botId];
  const [botStatusText, setBotStatusText] = useState('STANDBY • MONITORING 3D GRID');
  const [botQuote, setBotQuote] = useState(
    `Tactical core online. Prepare your position, Commander.`
  );
  const [botTelemetry, setBotTelemetry] = useState({
    depth: botConfig?.depth || 3,
    nodes: 1240,
    evalScore: '0.00',
  });
  const [transmissions, setTransmissions] = useState<BotTransmission[]>([
    {
      id: 'init-1',
      text: `${botConfig?.name || 'Bot'} initialized. Difficulty rating: ${botConfig?.rating || 'Elite'}.`,
      type: 'eval',
      timestamp: '00:00',
    },
  ]);

  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const notationScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll notation log
  useEffect(() => {
    if (notationScrollRef.current) {
      notationScrollRef.current.scrollTop = notationScrollRef.current.scrollHeight;
    }
  }, [match.moveHistory.length]);

  // Push bot transmission
  const addTransmission = useCallback((text: string, type: 'think' | 'taunt' | 'eval') => {
    const d = new Date();
    const timestamp = `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    setTransmissions((prev) => [
      { id: `t_${Date.now()}_${Math.random()}`, text, type, timestamp },
      ...prev.slice(0, 7),
    ]);
  }, []);

  // Bot Turn Runner
  const runBotTurn = useCallback(
    (currentMatch: Chess3dMatchState) => {
      if (currentMatch.status !== 'active') return;

      setIsBotThinking(true);
      setBotStatusText(`COMPUTING DEPTH ${botConfig?.depth || 3}-PLY...`);
      const estimatedNodes = Math.floor(1800 + Math.random() * 2400);
      setBotTelemetry((prev) => ({
        ...prev,
        nodes: estimatedNodes,
        evalScore: (Math.random() * 0.8 - 0.4).toFixed(2),
      }));

      // Personality thinking quotes
      const thinkQuotes = [
        `Evaluating ${estimatedNodes.toLocaleString()} topological variations...`,
        `Analyzing tactical vectors against your central flank...`,
        `Depth traversal active. Calculating pawn structure weaknesses...`,
        `Synthesizing 3D piece geometries. Counter-strike ready.`,
      ];
      setBotQuote(thinkQuotes[Math.floor(Math.random() * thinkQuotes.length)]);

      const chosenMove = getBest3dBotMove(currentMatch, botId);
      const delay = Math.floor(400 + Math.random() * 550);

      botTimeoutRef.current = setTimeout(() => {
        if (!chosenMove) {
          setIsBotThinking(false);
          setBotStatusText('STANDBY • WAITING FOR OPPONENT');
          return;
        }

        const res = execute3dMove(
          currentMatch,
          chosenMove.from,
          chosenMove.to,
          chosenMove.promotion || 'queen'
        );

        if (res.success) {
          setMatch(res.state);

          const fromSquare = posToNotation(chosenMove.from);
          const toSquare = posToNotation(chosenMove.to);
          const isCheck = !!res.state.inCheck;
          const isCapture = !!res.state.lastMove?.captured;

          let speech = `Relocated piece from ${fromSquare} to ${toSquare}.`;
          if (isCheck) {
            speech = `CHECK! Your King's quadrant is compromised.`;
          } else if (isCapture) {
            speech = `Capture executed on ${toSquare}. Material converted.`;
          }

          setBotQuote(speech);
          addTransmission(speech, isCheck ? 'taunt' : isCapture ? 'eval' : 'think');

          if (!isMuted) {
            if (res.state.status === 'checkmate' || res.state.status === 'timeout') {
              sounds.playGameOver();
            } else if (res.state.lastMove?.captured) {
              sounds.playCapture();
            } else {
              sounds.playMove();
            }
          }
        }
        setIsBotThinking(false);
        setBotStatusText('STANDBY • WAITING FOR COMMANDER');
      }, delay);
    },
    [botId, botConfig, isMuted, addTransmission]
  );

  // Trigger bot turn if active turn belongs to the bot in bot mode
  useEffect(() => {
    if (match.mode === 'bot' && match.status === 'active') {
      const isOpponentTurn = match.turn !== playerTeam;
      if (isOpponentTurn && !isBotThinking) {
        runBotTurn(match);
      }
    }
  }, [match, playerTeam, isBotThinking, runBotTurn]);

  // Digital clock countdown timer
  useEffect(() => {
    if (match.status !== 'active' || match.timeControl === 'untimed') return;

    const timer = setInterval(() => {
      setMatch((prev) => {
        if (prev.status !== 'active') return prev;

        if (prev.turn === 'orange') {
          const newWhiteTime = Math.max(0, prev.whiteTimeRemainingMs - 1000);
          if (newWhiteTime === 0) {
            if (!isMuted) sounds.playGameOver();
            return {
              ...prev,
              whiteTimeRemainingMs: 0,
              status: 'timeout',
              winner: 'red',
              winReason: 'White ran out of time',
            };
          }
          return { ...prev, whiteTimeRemainingMs: newWhiteTime };
        } else {
          const newBlackTime = Math.max(0, prev.blackTimeRemainingMs - 1000);
          if (newBlackTime === 0) {
            if (!isMuted) sounds.playGameOver();
            return {
              ...prev,
              blackTimeRemainingMs: 0,
              status: 'timeout',
              winner: 'orange',
              winReason: 'Black ran out of time',
            };
          }
          return { ...prev, blackTimeRemainingMs: newBlackTime };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [match.status, match.timeControl, isMuted]);

  // Multiplayer WebSocket Handshake
  useEffect(() => {
    if (match.mode !== 'multiplayer') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (roomCode) {
        ws.send(JSON.stringify({ type: '3d:join_room', code: roomCode }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === '3d:move_executed' || data.type === '3d:match_start') {
          setMatch(data.match);
          if (!isMuted) {
            if (data.match.lastMove?.captured) sounds.playCapture();
            else sounds.playMove();
          }
        } else if (data.type === '3d:game_over') {
          setMatch(data.match);
          if (!isMuted) sounds.playGameOver();
        } else if (data.type === '3d:error') {
          setErrorNotice(data.message);
          setTimeout(() => setErrorNotice(null), 3000);
        }
      } catch {}
    };

    return () => {
      ws.close();
    };
  }, [match.mode, roomCode, isMuted]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    };
  }, []);

  // Format digital clock mm:ss
  const formatTime = (ms: number) => {
    if (match.timeControl === 'untimed') return '∞';
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Square Click
  const handleSquareClick = (c: number, r: number) => {
    if (match.status !== 'active') return;
    if (match.mode === 'bot' && match.turn !== playerTeam) return;

    // Selection
    const clickedPiece = match.pieces.find((p) => p.c === c && p.r === r);
    if (clickedPiece && clickedPiece.team === match.turn) {
      setSelectedPos({ c, r });
      const legals = getLegalMoves(match.pieces, clickedPiece, match.enPassantTarget);
      setValidMoves(legals.map((m) => m.to));
      return;
    }

    // Move execution
    if (selectedPos) {
      const selectedPiece = match.pieces.find((p) => p.c === selectedPos.c && p.r === selectedPos.r);
      if (!selectedPiece) {
        setSelectedPos(null);
        setValidMoves([]);
        return;
      }

      const isValid = validMoves.some((vm) => vm.c === c && vm.r === r);
      if (isValid) {
        const isPromotion =
          selectedPiece.type === 'pawn' && (r === 0 || r === 7);

        if (isPromotion) {
          setPendingPromotion({ from: selectedPos, to: { c, r } });
          return;
        }

        executeMove(selectedPos, { c, r });
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  };

  const executeMove = (from: Position3D, to: Position3D, promo: PieceType = 'queen') => {
    if (match.mode === 'multiplayer' && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: '3d:make_move',
          code: roomCode || match.roomCode,
          from,
          to,
          promotion: promo,
        })
      );
      setSelectedPos(null);
      setValidMoves([]);
      setPendingPromotion(null);
      return;
    }

    const res = execute3dMove(match, from, to, promo);
    if (res.success) {
      setMatch(res.state);
      setSelectedPos(null);
      setValidMoves([]);
      setPendingPromotion(null);

      // User move telemetry comment
      const fromNotation = posToNotation(from);
      const toNotation = posToNotation(to);
      addTransmission(`Player moved ${fromNotation} → ${toNotation}`, 'think');

      if (!isMuted) {
        if (res.state.status === 'checkmate' || res.state.status === 'timeout') {
          sounds.playGameOver();
        } else if (res.state.lastMove?.captured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }
      }
    } else {
      setErrorNotice(res.error || 'Invalid move');
      setTimeout(() => setErrorNotice(null), 2500);
    }
  };

  const handleResign = () => {
    if (match.status !== 'active') return;
    if (match.mode === 'multiplayer' && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: '3d:resign',
          code: roomCode || match.roomCode,
        })
      );
      return;
    }

    const winningTeam: Team = playerTeam === 'orange' ? 'red' : 'orange';
    setMatch((prev) => ({
      ...prev,
      status: 'resigned',
      winner: winningTeam,
      winReason: `${playerTeam === 'orange' ? 'White' : 'Black'} resigned.`,
    }));
    addTransmission(`Resignation verified. Match concluded.`, 'taunt');
    if (!isMuted) sounds.playGameOver();
  };

  const restartMatch = () => {
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    setIsBotThinking(false);
    setSelectedPos(null);
    setValidMoves([]);
    setPendingPromotion(null);

    const botCfg = PUNISHER_BOTS[botId];
    const humanPlayer = {
      userId: user?.id || 'player_1',
      displayName: user?.displayName || 'Commander',
      avatarId: user?.avatarId || 'avatar_prince',
      team: playerTeam,
    };
    const botPlayer = {
      userId: `bot_${botId}`,
      displayName: botCfg?.name || 'Chrome Reaper',
      avatarId: 'avatar_bot',
      team: (playerTeam === 'orange' ? 'red' : 'orange') as Team,
      isBot: true,
      botId,
    };

    setMatch(
      createInitialMatchState(
        `3d_${Date.now()}`,
        playerTeam === 'orange' ? humanPlayer : botPlayer,
        playerTeam === 'red' ? humanPlayer : botPlayer,
        timeControl,
        'bot'
      )
    );
    setBotQuote(`Tactical reset accepted. New 3D engagement initiated.`);
    addTransmission(`Board reset to starting FIDE coordinates.`, 'eval');
  };

  const opponentInfo = playerTeam === 'orange' ? match.blackPlayer : match.whitePlayer;
  const selfInfo = playerTeam === 'orange' ? match.whitePlayer : match.blackPlayer;

  const inCheckPos = match.inCheck
    ? match.pieces.find((p) => p.type === 'king' && p.team === match.inCheck)
    : null;

  return (
    <div className="h-screen max-h-screen w-full bg-[#0a0b0e] text-slate-100 flex flex-col justify-between selection:bg-blue-500/30 overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <header className="h-13 sm:h-14 px-3 sm:px-6 bg-[#121317] border-b border-[#29212F] flex items-center justify-between gap-3 shrink-0 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="py-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-[#29212F] text-xs font-black uppercase text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-sm shadow-blue-500" />
            <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              3D Annihilatic Chess Arcade
            </h1>
          </div>
        </div>

        {/* Status / Room details / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Turn Indicator Pill */}
          <div className="px-2.5 py-1 bg-neutral-900 border border-[#29212F] rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                match.turn === 'orange' ? 'bg-amber-400' : 'bg-red-400'
              } ${match.status === 'active' ? 'animate-ping' : ''}`}
            />
            <span className="hidden md:inline text-neutral-400">TURN:</span>
            <span className="text-white uppercase font-black">
              {match.turn === playerTeam ? 'YOU' : opponentInfo.displayName.split(' ')[0]}
            </span>
          </div>

          {roomCode && (
            <div className="px-2.5 py-1 bg-blue-950/40 border border-blue-500/40 rounded-lg text-xs font-mono font-bold text-blue-300 hidden sm:block">
              Room: {roomCode}
            </div>
          )}

          <button
            type="button"
            onClick={() => setFlipped(!flipped)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-[#29212F] text-xs font-black uppercase text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer transition-all"
            title="Flip Board View"
          >
            <Repeat className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline text-[11px]">Flip</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-neutral-900 border border-[#29212F] text-neutral-400 hover:text-white cursor-pointer transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>

          {match.status === 'active' && (
            <button
              type="button"
              onClick={handleResign}
              className="py-1.5 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-700/50 rounded-lg text-xs font-black uppercase text-red-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resign</span>
            </button>
          )}

          {match.status !== 'active' && match.mode === 'bot' && (
            <button
              type="button"
              onClick={restartMatch}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 border border-blue-400 rounded-lg text-xs font-black uppercase text-white flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-900/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Rematch
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (lg:grid): Left Sidebar + Maximized Center Board + Right Sidebar */}
      {/* ========================================================================= */}
      <main className="hidden lg:grid lg:grid-cols-[280px_1fr_330px] xl:grid-cols-[300px_1fr_350px] flex-1 min-h-0 w-full max-w-[1920px] mx-auto p-3 gap-3 overflow-hidden">
        {/* LEFT SIDEBAR: Match Status, Opponent Profile, Player Profile, Game Controls */}
        <section className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
          {/* Match Info Badge */}
          <div className="p-3 bg-[#141519] border border-[#29212F] rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                {match.mode === 'bot' ? 'Punisher Bot Protocol' : 'Multiplayer Room'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300">
              {match.timeControl}
            </span>
          </div>

          {/* Opponent Card */}
          <div
            className={`p-3.5 bg-[#141519] border rounded-xl flex flex-col gap-2.5 transition-all shadow-md ${
              match.turn === opponentInfo.team && match.status === 'active'
                ? 'border-blue-500/70 ring-1 ring-blue-500/30 shadow-blue-950/30'
                : 'border-[#29212F]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-[#29212F] flex items-center justify-center text-blue-400 shrink-0 font-bold shadow-inner">
                  {opponentInfo.isBot ? <Bot className="w-5 h-5 text-blue-400" /> : <Users className="w-5 h-5" />}
                </div>
                <div className="truncate">
                  <div className="text-xs font-black uppercase text-white truncate flex items-center gap-1.5">
                    {opponentInfo.displayName}
                    {opponentInfo.isBot && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 border border-blue-500/40 text-blue-300">
                        BOT
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    {opponentInfo.team === 'orange' ? 'White Pieces' : 'Black Pieces'}
                  </div>
                </div>
              </div>

              {/* Opponent Digital Clock */}
              <div
                className={`px-3 py-1.5 rounded-lg border font-mono text-sm font-black transition-colors shrink-0 ${
                  match.turn === opponentInfo.team && match.status === 'active'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-200 animate-pulse shadow-sm shadow-blue-500/40'
                    : 'bg-neutral-900 border-[#29212F] text-neutral-300'
                }`}
              >
                {formatTime(
                  opponentInfo.team === 'orange'
                    ? match.whiteTimeRemainingMs
                    : match.blackTimeRemainingMs
                )}
              </div>
            </div>

            {/* Captured Pieces by Opponent */}
            <div className="pt-2 border-t border-[#29212F]/60 flex items-center gap-1 flex-wrap min-h-7 text-xs">
              <span className="text-[9px] uppercase font-bold text-neutral-500 mr-1">Captured:</span>
              {(opponentInfo.team === 'orange' ? match.capturedRed : match.capturedOrange).length === 0 ? (
                <span className="text-[10px] text-neutral-600 italic">None</span>
              ) : (
                (opponentInfo.team === 'orange' ? match.capturedRed : match.capturedOrange).map(
                  (type, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-neutral-900 text-[9px] uppercase font-mono font-bold text-neutral-300 border border-white/5"
                    >
                      {type}
                    </span>
                  )
                )
              )}
            </div>
          </div>

          {/* Player Card */}
          <div
            className={`p-3.5 bg-[#141519] border rounded-xl flex flex-col gap-2.5 transition-all shadow-md ${
              match.turn === selfInfo.team && match.status === 'active'
                ? 'border-blue-500/70 ring-1 ring-blue-500/30 shadow-blue-950/30'
                : 'border-[#29212F]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-[#29212F] flex items-center justify-center text-amber-400 shrink-0 font-bold shadow-inner">
                  {selfInfo.displayName.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-black uppercase text-white truncate">
                    {selfInfo.displayName} (You)
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    {selfInfo.team === 'orange' ? 'White Pieces' : 'Black Pieces'}
                  </div>
                </div>
              </div>

              {/* Self Digital Clock */}
              <div
                className={`px-3 py-1.5 rounded-lg border font-mono text-sm font-black transition-colors shrink-0 ${
                  match.turn === selfInfo.team && match.status === 'active'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-200 animate-pulse shadow-sm shadow-blue-500/40'
                    : 'bg-neutral-900 border-[#29212F] text-neutral-300'
                }`}
              >
                {formatTime(
                  selfInfo.team === 'orange'
                    ? match.whiteTimeRemainingMs
                    : match.blackTimeRemainingMs
                )}
              </div>
            </div>

            {/* Captured Pieces by Player */}
            <div className="pt-2 border-t border-[#29212F]/60 flex items-center gap-1 flex-wrap min-h-7 text-xs">
              <span className="text-[9px] uppercase font-bold text-neutral-500 mr-1">Captured:</span>
              {(selfInfo.team === 'orange' ? match.capturedRed : match.capturedOrange).length === 0 ? (
                <span className="text-[10px] text-neutral-600 italic">None</span>
              ) : (
                (selfInfo.team === 'orange' ? match.capturedRed : match.capturedOrange).map(
                  (type, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-neutral-900 text-[9px] uppercase font-mono font-bold text-neutral-300 border border-white/5"
                    >
                      {type}
                    </span>
                  )
                )
              )}
            </div>
          </div>

          {/* In-Check Alert Banner (Rigid Height) */}
          <div
            className={`p-2.5 rounded-xl border text-xs font-black uppercase flex items-center gap-2 transition-all min-h-[42px] ${
              match.inCheck
                ? 'bg-red-950/40 border-red-500 text-red-200 animate-pulse'
                : 'bg-neutral-950/40 border-white/5 text-neutral-500'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${match.inCheck ? 'text-red-400' : 'text-neutral-600'}`} />
            <span>
              {match.inCheck
                ? `CHECK! ${match.inCheck === 'orange' ? 'White' : 'Black'} King under threat!`
                : 'King positions safe'}
            </span>
          </div>

          {/* Quick Info Box */}
          <div className="mt-auto p-3 bg-neutral-900/60 border border-[#29212F] rounded-xl text-[11px] text-neutral-400 space-y-1">
            <div className="font-bold text-neutral-300 uppercase">FIDE 3D Chess Rules:</div>
            <div>• Click piece to highlight legal moves</div>
            <div>• Full castling, en passant, promotion supported</div>
            <div>• Centered 3D Staunton cat pieces</div>
          </div>
        </section>

        {/* CENTER COLUMN: MAXIMIZED 3D CHESS BOARD (Fills available screen space, absolutely static) */}
        <section className="flex-1 h-full min-h-0 flex items-center justify-center relative p-1 overflow-hidden">
          {/* Rigid aspect-ratio board wrapper that maximizes size without ever moving or jumping */}
          <div className="w-full h-full max-w-[min(calc(100vh-84px),880px)] max-h-[calc(100vh-84px)] aspect-[1000/1110] relative flex items-center justify-center shrink-0">
            <ChessBoard3D
              pieces={match.pieces}
              background={true}
              width="100%"
              className="w-full h-full object-contain block mx-auto"
              selectedPos={selectedPos}
              validMoves={validMoves}
              lastMove={match.lastMove}
              inCheckPos={inCheckPos ? { c: inCheckPos.c, r: inCheckPos.r } : null}
              onSquareClick={handleSquareClick}
              flipped={flipped}
            />

            {/* Game Over Modal / Result Overlay (Absolute, does not cause layout shift) */}
            {match.status !== 'active' && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 z-30">
                <div className="w-14 h-14 rounded-full bg-blue-600/30 border border-blue-500/60 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
                  <Crown className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-wide">
                  {match.status === 'checkmate'
                    ? `${match.winner === 'orange' ? 'White' : 'Black'} Victorious!`
                    : match.status === 'timeout'
                    ? 'Time Out Victory!'
                    : match.status === 'resigned'
                    ? 'Victory by Resignation'
                    : 'Draw!'}
                </h3>
                <p className="text-xs text-neutral-300 font-mono mt-1 max-w-sm">
                  {match.winReason || 'Game concluded according to FIDE rules.'}
                </p>

                <div className="mt-6 flex gap-3">
                  {match.mode === 'bot' && (
                    <button
                      type="button"
                      onClick={restartMatch}
                      className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/30 cursor-pointer transition-all active:scale-95"
                    >
                      Play Again
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onExit}
                    className="py-2.5 px-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-[#29212F] font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                  >
                    Exit Arcade
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT SIDEBAR: DEDICATED BOT TELEMETRY/MESSAGES BOX + NOTATION LOG */}
        <section className="flex flex-col gap-3 h-full overflow-hidden pl-1">
          {/* ========================================================================= */}
          {/* DEDICATED BOX FOR BOT CALCULATION, COMPUTING STATE & MESSAGES (FIXED HEIGHT) */}
          {/* ========================================================================= */}
          <div className="h-[250px] shrink-0 p-3 bg-[#141519] border border-[#29212F] rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden">
            {/* Ambient blue corner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top header of dedicated box */}
            <div className="flex items-center justify-between border-b border-[#29212F] pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  {isBotThinking && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  )}
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-white">
                  {opponentInfo.displayName} Core
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBotThinking ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
                <span className="text-[10px] font-mono font-bold text-neutral-400">
                  {isBotThinking ? 'COMPUTING' : 'READY'}
                </span>
              </div>
            </div>

            {/* Live computing waveform / telemetry indicators */}
            <div className="py-1.5 flex items-center justify-between text-[10px] font-mono shrink-0">
              <div className="flex items-center gap-1 text-blue-300 font-bold">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>{botStatusText}</span>
              </div>
              {/* Telemetry Audio/Computing bars */}
              <div className="flex items-center gap-0.5 h-3">
                {[40, 75, 55, 90, 60, 80, 45].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: isBotThinking ? `${h}%` : '25%' }}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isBotThinking ? 'bg-blue-400 animate-pulse' : 'bg-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bot Speech / Active Quote Box (Fixed size) */}
            <div className="p-2.5 bg-[#0d0e12] border border-blue-500/20 rounded-lg flex items-start gap-2 min-h-[64px] max-h-[64px] overflow-hidden shrink-0">
              <Terminal className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-100 font-mono leading-tight line-clamp-3 italic">
                "{botQuote}"
              </p>
            </div>

            {/* Live Telemetry Stats Row */}
            <div className="pt-2 border-t border-[#29212F] grid grid-cols-3 gap-1 text-center shrink-0">
              <div className="p-1 rounded bg-neutral-900/60 border border-white/5">
                <div className="text-[8px] uppercase text-neutral-500 font-bold">Depth</div>
                <div className="text-[11px] font-mono font-black text-white">{botTelemetry.depth}-ply</div>
              </div>
              <div className="p-1 rounded bg-neutral-900/60 border border-white/5">
                <div className="text-[8px] uppercase text-neutral-500 font-bold">Nodes</div>
                <div className="text-[11px] font-mono font-black text-blue-300">
                  {isBotThinking ? botTelemetry.nodes.toLocaleString() : 'Idle'}
                </div>
              </div>
              <div className="p-1 rounded bg-neutral-900/60 border border-white/5">
                <div className="text-[8px] uppercase text-neutral-500 font-bold">Eval Score</div>
                <div className="text-[11px] font-mono font-black text-amber-300">{botTelemetry.evalScore}</div>
              </div>
            </div>

            {errorNotice && (
              <div className="absolute inset-x-2 bottom-2 p-1.5 bg-red-950 border border-red-500/50 rounded text-center text-[10px] font-bold text-red-200 z-10 animate-in fade-in">
                {errorNotice}
              </div>
            )}
          </div>

          {/* NOTATION LOG & MOVE HISTORY (Fills remaining right column height) */}
          <div className="flex-1 min-h-0 p-3 bg-[#141519] border border-[#29212F] rounded-xl flex flex-col shadow-md overflow-hidden">
            <div className="text-[11px] font-black uppercase text-neutral-300 flex items-center justify-between border-b border-[#29212F] pb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Move Notation Log</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">{match.moveHistory.length} moves</span>
            </div>

            <div ref={notationScrollRef} className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1 mt-2">
              {match.moveHistory.length === 0 ? (
                <div className="text-neutral-500 italic py-6 text-center text-[11px]">
                  FIDE match started. First move awaits...
                </div>
              ) : (
                Array.from({ length: Math.ceil(match.moveHistory.length / 2) }).map((_, i) => {
                  const whiteMove = match.moveHistory[i * 2];
                  const blackMove = match.moveHistory[i * 2 + 1];
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between text-neutral-300 py-0.5 px-1.5 rounded hover:bg-neutral-900 transition-colors"
                    >
                      <span className="text-neutral-500 w-7">{i + 1}.</span>
                      <span className="font-bold text-slate-100 flex-1">{whiteMove?.san}</span>
                      <span className="font-bold text-blue-300 flex-1 text-right">{blackMove?.san || ''}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (lg:hidden): Uses exact same 3D board & pieces as desktop view */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex-1 flex flex-col overflow-y-auto px-2.5 py-2 space-y-2.5 min-h-0">
        {/* Top Dual Players & Clocks Strip */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          {/* Opponent Capsule */}
          <div
            className={`p-2.5 bg-[#141519] border rounded-xl flex items-center justify-between gap-1.5 transition-all shadow-md ${
              match.turn === opponentInfo.team && match.status === 'active'
                ? 'border-blue-500 shadow-blue-500/20 ring-1 ring-blue-500/40'
                : 'border-[#29212F]'
            }`}
          >
            <div className="truncate min-w-0">
              <div className="text-[11px] font-black uppercase text-white truncate flex items-center gap-1">
                {opponentInfo.displayName.split(' ')[0]}
                {opponentInfo.isBot && (
                  <span className="text-[8px] px-1 py-0.2 rounded bg-blue-950 border border-blue-500/30 text-blue-300">
                    BOT
                  </span>
                )}
              </div>
              <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                {opponentInfo.team === 'orange' ? 'White Pieces' : 'Black Pieces'}
              </div>
            </div>
            <div className="font-mono text-xs font-black text-blue-300 bg-neutral-900 px-2 py-1 rounded-lg border border-[#29212F] shrink-0">
              {formatTime(
                opponentInfo.team === 'orange'
                  ? match.whiteTimeRemainingMs
                  : match.blackTimeRemainingMs
              )}
            </div>
          </div>

          {/* Self Capsule */}
          <div
            className={`p-2.5 bg-[#141519] border rounded-xl flex items-center justify-between gap-1.5 transition-all shadow-md ${
              match.turn === selfInfo.team && match.status === 'active'
                ? 'border-blue-500 shadow-blue-500/20 ring-1 ring-blue-500/40'
                : 'border-[#29212F]'
            }`}
          >
            <div className="truncate min-w-0">
              <div className="text-[11px] font-black uppercase text-white truncate">
                {selfInfo.displayName.split(' ')[0]} (You)
              </div>
              <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                {selfInfo.team === 'orange' ? 'White Pieces' : 'Black Pieces'}
              </div>
            </div>
            <div className="font-mono text-xs font-black text-amber-300 bg-neutral-900 px-2 py-1 rounded-lg border border-[#29212F] shrink-0">
              {formatTime(
                selfInfo.team === 'orange'
                  ? match.whiteTimeRemainingMs
                  : match.blackTimeRemainingMs
              )}
            </div>
          </div>
        </div>

        {/* In-Check Alert Banner on Mobile */}
        {match.inCheck && (
          <div className="py-1.5 px-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-black uppercase text-center flex items-center justify-center gap-1.5 shrink-0 animate-pulse shadow-md">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>Check! {match.inCheck === 'orange' ? 'White' : 'Black'} King under threat!</span>
          </div>
        )}

        {/* FIXED CHESSBOARD CONTAINER: Exact same 3D board and pieces as desktop, sized to fit mobile view cleanly */}
        <div className="w-full max-w-[min(calc(100vw-20px),480px)] aspect-[900/1010] mx-auto flex items-center justify-center relative shrink-0 my-0.5">
          <ChessBoard3D
            pieces={match.pieces}
            background={true}
            width="100%"
            className="w-full h-full object-contain block mx-auto"
            selectedPos={selectedPos}
            validMoves={validMoves}
            lastMove={match.lastMove}
            inCheckPos={inCheckPos ? { c: inCheckPos.c, r: inCheckPos.r } : null}
            onSquareClick={handleSquareClick}
            flipped={flipped}
          />

          {/* Mobile Game Over Overlay */}
          {match.status !== 'active' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 text-center z-30 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center mb-2 shadow-lg shadow-blue-500/20">
                <Crown className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-base font-black uppercase text-white">
                {match.status === 'checkmate'
                  ? `${match.winner === 'orange' ? 'White' : 'Black'} Wins!`
                  : match.status === 'timeout'
                  ? 'Time Out Victory'
                  : match.status === 'resigned'
                  ? 'Resignation Victory'
                  : 'Game Over'}
              </h3>
              <p className="text-[11px] text-neutral-300 font-mono mt-1 max-w-xs">
                {match.winReason || 'FIDE rules concluded.'}
              </p>
              <div className="mt-4 flex gap-2.5">
                {match.mode === 'bot' && (
                  <button
                    type="button"
                    onClick={restartMatch}
                    className="min-h-[42px] px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-900/40 cursor-pointer transition-all active:scale-95"
                  >
                    Play Again
                  </button>
                )}
                <button
                  type="button"
                  onClick={onExit}
                  className="min-h-[42px] px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-[#29212F] font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  Exit Arcade
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DEDICATED MOBILE BOX FOR BOT CALCULATION & SPEECH */}
        <div className="shrink-0 p-3 bg-[#141519] border border-blue-500/30 rounded-xl flex flex-col gap-2 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-blue-300 font-bold truncate">
              <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{botStatusText}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isBotThinking ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span className="text-[9px] text-neutral-400 uppercase font-bold">
                {isBotThinking ? 'COMPUTING' : 'READY'}
              </span>
            </div>
          </div>

          {/* Quote display inside fixed box */}
          <div className="p-2.5 bg-[#0d0e12] border border-blue-500/20 rounded-lg text-xs font-mono text-blue-100 line-clamp-2 italic leading-snug">
            "{botQuote}"
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-t border-[#29212F] pt-1.5 px-0.5">
            <span>Nodes: <strong className="text-blue-300">{isBotThinking ? botTelemetry.nodes.toLocaleString() : 'Idle'}</strong></span>
            <span>Eval: <strong className="text-amber-300">{botTelemetry.evalScore}</strong></span>
            <span>Depth: <strong className="text-white">{botTelemetry.depth}-ply</strong></span>
          </div>
        </div>

        {/* Mobile Actions and Notation History */}
        <div className="shrink-0 flex flex-col gap-2 pb-2">
          <button
            type="button"
            onClick={() => setMobileNotationOpen(!mobileNotationOpen)}
            className="w-full min-h-[42px] py-2.5 px-3.5 bg-[#141519] hover:bg-[#1b1c24] border border-[#29212F] hover:border-blue-500/40 rounded-xl text-xs font-bold text-neutral-200 flex items-center justify-between cursor-pointer transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Move Notation History ({match.moveHistory.length})</span>
            </div>
            {mobileNotationOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {mobileNotationOpen && (
            <div className="p-3 bg-[#141519] border border-[#29212F] rounded-xl max-h-36 overflow-y-auto font-mono text-xs space-y-1 shadow-md">
              {match.moveHistory.length === 0 ? (
                <div className="text-neutral-500 italic text-center py-2">No moves recorded yet.</div>
              ) : (
                Array.from({ length: Math.ceil(match.moveHistory.length / 2) }).map((_, i) => (
                  <div key={i} className="flex justify-between text-neutral-300 py-0.5 px-1 rounded hover:bg-neutral-900">
                    <span className="text-neutral-500 w-6">{i + 1}.</span>
                    <span className="font-bold text-slate-100 flex-1">{match.moveHistory[i * 2]?.san}</span>
                    <span className="font-bold text-blue-300 flex-1 text-right">
                      {match.moveHistory[i * 2 + 1]?.san || ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pawn Promotion Dialog (Centered Modal) */}
      {pendingPromotion && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Pawn Promotion Selection"
        >
          <div className="bg-[#141519] border-2 border-blue-500 rounded-2xl p-5 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-black uppercase text-white tracking-wide">
              Promote Your Feline Pawn
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => executeMove(pendingPromotion.from, pendingPromotion.to, type)}
                  className="p-2 bg-[#090a0c] hover:bg-blue-950/40 border border-[#29212F] hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all group"
                >
                  <Piece3DStandalone type={type} team={match.turn} size={50} background="transparent" />
                  <span className="text-[10px] font-black uppercase text-neutral-300 group-hover:text-blue-300">
                    {type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
