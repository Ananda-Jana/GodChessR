import React, { useState, useEffect } from 'react';
import { useRoseRoom } from './useRoseRoom';
import { useAuth } from '../context/AuthContext';
import { ChessPiece } from '../components/ChessPiece';
import { posToNotation } from '../game/engine';
import { getLegalMovesForSquare } from '../game/engine';
import { Heart, Sparkles, Copy, ArrowLeft, MessageSquare, Shield, Zap, Trophy, RotateCcw } from 'lucide-react';
import './rose.css';

interface RoseParadiseViewProps {
  onBack: () => void;
}

export const RoseParadiseView: React.FC<RoseParadiseViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { match, error, pendingMove, reactions, createRoom, joinRoom, sendMove, sendSummon, sendReaction } = useRoseRoom();

  const [mode, setMode] = useState<'lobby' | 'waiting' | 'join' | 'countdown' | 'match'>('lobby');
  const [selectedRole, setSelectedRole] = useState<'boyfriend' | 'girlfriend'>('boyfriend');
  const [timeControl, setTimeControl] = useState<60 | 120>(60);
  const [moveSuggestions, setMoveSuggestions] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [selectedSquare, setSelectedSquare] = useState<{ x: number; y: number } | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<{ x: number; y: number }[]>([]);
  const [isSummonModalOpen, setIsSummonModalOpen] = useState(false);
  const [summonType, setSummonType] = useState<'priest' | 'communist' | 'supremeRook'>('priest');

  // Sync mode with match status
  useEffect(() => {
    if (!match) return;
    if (match.status === 'waiting_guest') {
      setMode('waiting');
    } else if (match.status === 'handshake') {
      setMode('countdown');
    } else if (match.status === 'countdown') {
      setMode('countdown');
    } else if (match.status === 'active') {
      setMode('match');
    } else if (match.status === 'completed') {
      setMode('match');
    }
  }, [match?.status]);

  if (!user) return null;

  const mySeat = match ? (match.whiteSeat?.userId === user.id ? match.whiteSeat : match.blackSeat) : null;
  const opponentSeat = match ? (match.whiteSeat?.userId === user.id ? match.blackSeat : match.whiteSeat) : null;
  const isMyTurn = match ? match.turn === mySeat?.color : false;

  const handleSquareClick = (x: number, y: number) => {
    if (!match || match.status !== 'active' || !isMyTurn || pendingMove) return;

    const piece = match.board[y][x];
    if (selectedSquare) {
      if (selectedSquare.x === x && selectedSquare.y === y) {
        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }
      const isLegal = legalDestinations.some((d) => d.x === x && d.y === y);
      if (isLegal) {
        sendMove(selectedSquare, { x, y });
        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }
    }

    if (piece && piece.color === mySeat?.color) {
      setSelectedSquare({ x, y });
      const moves = getLegalMovesForSquare(match as any, { x, y });
      setLegalDestinations(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalDestinations([]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom(selectedRole, timeControl, moveSuggestions);
    setMode('waiting');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    joinRoom(joinCodeInput.trim());
  };

  return (
    <div className="rose-theme min-h-screen flex flex-col p-4 sm:p-6 select-none relative overflow-x-hidden">
      {/* Floating Petal Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="petal-particle" style={{ left: '10%', animationDelay: '0s' }} />
        <div className="petal-particle" style={{ left: '30%', animationDelay: '2s' }} />
        <div className="petal-particle" style={{ left: '70%', animationDelay: '4s' }} />
        <div className="petal-particle" style={{ left: '90%', animationDelay: '1s' }} />
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 pb-4 border-b-2 border-purple-500/40 mb-6">
        <button
          onClick={onBack}
          className="brutalist-button py-2 px-4 text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400 animate-pulse" />
          <h1 className="text-base sm:text-xl font-black uppercase tracking-wider text-pink-200">
            Rose Paradise
          </h1>
        </div>
      </div>

      {error && (
        <div className="z-10 mb-4 p-3 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs sm:text-sm font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* LOBBY */}
      {mode === 'lobby' && (
        <div className="z-10 max-w-xl mx-auto w-full brutalist-card p-6 sm:p-8 flex flex-col gap-6 my-auto">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black uppercase text-pink-200">Create or Join Paradise</h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-1">
              Choose your role and time control for a romantic tactical duel.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-purple-300 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('boyfriend')}
                  className={`p-3 border-3 font-black uppercase text-xs transition-all cursor-pointer ${
                    selectedRole === 'boyfriend'
                      ? 'bg-purple-600 border-black shadow-[4px_4px_0px_#000]'
                      : 'bg-purple-950/60 border-purple-800 text-purple-300'
                  }`}
                >
                  👑 Boyfriend (Prince)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('girlfriend')}
                  className={`p-3 border-3 font-black uppercase text-xs transition-all cursor-pointer ${
                    selectedRole === 'girlfriend'
                      ? 'bg-purple-600 border-black shadow-[4px_4px_0px_#000]'
                      : 'bg-purple-950/60 border-purple-800 text-purple-300'
                  }`}
                >
                  👸 Girlfriend (Queen)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-purple-300 mb-2">
                Time Control
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTimeControl(60)}
                  className={`p-3 border-3 font-black uppercase text-xs cursor-pointer ${
                    timeControl === 60 ? 'bg-purple-600 border-black shadow-[3px_3px_0px_#000]' : 'bg-purple-950/60 border-purple-800'
                  }`}
                >
                  ⚡ Sprint (60s)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeControl(120)}
                  className={`p-3 border-3 font-black uppercase text-xs cursor-pointer ${
                    timeControl === 120 ? 'bg-purple-600 border-black shadow-[3px_3px_0px_#000]' : 'bg-purple-950/60 border-purple-800'
                  }`}
                >
                  ⏳ Blitz (120s)
                </button>
              </div>
            </div>

            <button type="submit" className="brutalist-button py-4 text-sm sm:text-base cursor-pointer mt-2">
              🌹 Create Room & Get Invite Code
            </button>
          </form>

          <div className="border-t-2 border-purple-700/50 pt-5 text-center flex flex-col gap-3">
            <span className="text-xs font-bold text-purple-300 uppercase">Have an invite code?</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ROSE-XXXXXX"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="flex-1 bg-black/50 border-3 border-purple-500 px-4 py-3 text-white font-black uppercase tracking-widest text-sm focus:outline-none"
              />
              <button
                onClick={() => {
                  if (joinCodeInput.trim()) joinRoom(joinCodeInput.trim());
                }}
                className="brutalist-button px-6 py-3 text-xs sm:text-sm cursor-pointer"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WAITING ROOM */}
      {mode === 'waiting' && match && (
        <div className="z-10 max-w-lg mx-auto w-full brutalist-card p-6 sm:p-8 flex flex-col gap-6 my-auto text-center">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-pink-200">Waiting for Partner...</h2>
          <p className="text-xs sm:text-sm text-purple-200">Share this secret invite code with your partner:</p>

          <div className="bg-black/60 border-4 border-pink-400 p-4 flex items-center justify-between gap-3">
            <span className="text-xl sm:text-2xl font-black tracking-widest text-pink-300 font-mono">
              {match.code}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(match.code)}
              className="brutalist-button p-2 text-xs flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-300 animate-pulse">
            <Sparkles className="w-4 h-4" /> Waiting for partner to enter code...
          </div>

          <button
            onClick={() => setMode('lobby')}
            className="border-2 border-purple-500 py-2 px-4 text-xs font-bold uppercase text-purple-300 hover:bg-purple-900/40 cursor-pointer"
          >
            Cancel & Return
          </button>
        </div>
      )}

      {/* COUNTDOWN */}
      {mode === 'countdown' && (
        <div className="z-10 max-w-md mx-auto w-full brutalist-card p-8 flex flex-col items-center justify-center gap-6 my-auto text-center">
          <Heart className="w-16 h-16 text-pink-400 fill-pink-400 animate-bounce" />
          <h2 className="text-2xl font-black uppercase text-pink-200">Both Gardeners Ready!</h2>
          <p className="text-sm text-purple-200">Preparing board and Petals...</p>
          <div className="text-4xl font-black text-pink-300 animate-pulse">3... 2... 1... 🌹</div>
        </div>
      )}

      {/* MATCH VIEW */}
      {mode === 'match' && match && (
        <div className="z-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6 items-start justify-center flex-1">
          {/* Left Sidebar: Opponent & Petals */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            <div className="brutalist-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-purple-300">Opponent</span>
                <span className="text-xs font-bold text-pink-300 uppercase">{opponentSeat?.role}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-900 border-2 border-black flex items-center justify-center font-black">
                  {opponentSeat?.displayName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-sm">{opponentSeat?.displayName}</div>
                  <div className="text-xs text-purple-300 font-mono">
                    ⏳ {match.turn === opponentSeat?.color ? 'Thinking...' : 'Waiting'}
                  </div>
                </div>
              </div>
              {/* Petal Meter */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-purple-900">
                <span className="text-[10px] font-black uppercase text-pink-300">Petals:</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((p) => (
                    <span
                      key={p}
                      className={`text-sm ${
                        (opponentSeat?.petals || 0) >= p ? 'text-pink-400' : 'text-purple-900'
                      }`}
                    >
                      🌹
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Reactions */}
            <div className="brutalist-card p-4 flex flex-col gap-2">
              <span className="text-xs font-black uppercase text-purple-300">Send Reaction</span>
              <div className="grid grid-cols-3 gap-2">
                {['❤️', '🌹', '😉', '😅', '✨', '⏳'].map((emo) => (
                  <button
                    key={emo}
                    onClick={() => sendReaction(emo)}
                    className="p-2 bg-purple-950 border-2 border-purple-700 hover:bg-purple-800 text-lg cursor-pointer transition-transform hover:scale-105"
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Chess Board */}
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="brutalist-card p-4 flex flex-col items-center gap-3 w-full max-w-[520px]">
              <div className="flex items-center justify-between w-full px-2 text-xs font-black uppercase text-pink-200">
                <span>{match.turn === mySeat?.color ? '👉 Your Turn' : "Opponent's Turn"}</span>
                <span className="font-mono">Halfmove: {match.halfmoveClock}/40</span>
              </div>

              {/* 8x8 Board */}
              <div className="grid grid-cols-8 w-full aspect-square border-4 border-black bg-[#2a0f45]">
                {match.board.map((row, y) =>
                  row.map((piece, x) => {
                    const isSelected = selectedSquare?.x === x && selectedSquare?.y === y;
                    const isLegalDest = legalDestinations.some((d) => d.x === x && d.y === y);
                    const isDark = (x + y) % 2 === 1;

                    return (
                      <div
                        key={`${x}-${y}`}
                        onClick={() => handleSquareClick(x, y)}
                        className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                          isDark ? 'bg-[#3b155e]' : 'bg-[#58218a]'
                        } ${isSelected ? 'ring-4 ring-pink-400 z-10' : ''}`}
                      >
                        {isLegalDest && (
                          <div className="absolute w-4 h-4 rounded-full bg-pink-400/80 animate-ping z-20" />
                        )}
                        {piece && <ChessPiece type={piece.type} color={piece.color} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: My Card, Petals & Summons */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            <div className="brutalist-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-purple-300">You ({mySeat?.role})</span>
                <span className="text-xs font-bold text-pink-300 uppercase">{mySeat?.color}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 border-2 border-black flex items-center justify-center font-black">
                  {user.displayName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-sm">{user.displayName}</div>
                  <div className="text-xs text-purple-300 font-mono">
                    ⏳ {match.turn === mySeat?.color ? 'Your Move' : 'Waiting'}
                  </div>
                </div>
              </div>
              {/* Petal Meter & Summon Button */}
              <div className="flex items-center justify-between pt-2 border-t border-purple-900">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-pink-300">Petals:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((p) => (
                      <span
                        key={p}
                        className={`text-sm ${
                          (mySeat?.petals || 0) >= p ? 'text-pink-400' : 'text-purple-900'
                        }`}
                      >
                        🌹
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setIsSummonModalOpen(true)}
                  disabled={(mySeat?.petals || 0) < 3 || (mySeat?.summonsUsed || 0) >= 2}
                  className={`brutalist-button px-3 py-1.5 text-[10px] ${
                    (mySeat?.petals || 0) < 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  ⚡ Summon (3 🌹)
                </button>
              </div>
            </div>

            {/* Completed Match Overlay */}
            {match.status === 'completed' && (
              <div className="brutalist-card p-6 bg-purple-950 border-4 border-pink-400 text-center flex flex-col gap-4">
                <Trophy className="w-10 h-10 text-pink-300 mx-auto animate-bounce" />
                <h3 className="text-lg font-black uppercase text-pink-200">
                  {match.winner === 'draw' ? 'Match Drawn!' : `${match.winner} Wins!`}
                </h3>
                <p className="text-xs text-purple-200">{match.winReason}</p>
                <button
                  onClick={onBack}
                  className="brutalist-button py-3 px-4 text-xs cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUMMON MODAL */}
      {isSummonModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="brutalist-card max-w-md w-full p-6 flex flex-col gap-4 bg-[#1b0a2e] border-pink-400">
            <h3 className="text-lg font-black uppercase text-pink-200">Summon Reinforcement</h3>
            <p className="text-xs text-purple-200">Choose a unit to summon using 3 Petals into your 2-row home zone:</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'priest', label: 'Cupid (Priest)' },
                { type: 'communist', label: 'Thorn Guard' },
                { type: 'supremeRook', label: 'Rose Tower' },
              ].map((s) => (
                <button
                  key={s.type}
                  onClick={() => setSummonType(s.type as any)}
                  className={`p-3 border-2 font-black uppercase text-[10px] text-center cursor-pointer ${
                    summonType === s.type ? 'bg-purple-600 border-black shadow-[2px_2px_0px_#000]' : 'bg-purple-950 border-purple-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-purple-300 italic">
              Click an empty, unattacked square in your home zone to place your summon.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSummonModalOpen(false)}
                className="flex-1 brutalist-button py-2 bg-purple-700 cursor-pointer"
              >
                Close & Place
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
