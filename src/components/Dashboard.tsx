import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { AvatarDisplay, AVATAR_OPTIONS } from './Avatars';
import { UserProfile, MatchState, Challenge, PieceTheme } from '../types/game';
import { CullingModeEntry } from './CullingModeEntry';
import { RoseParadiseEntryButton } from '../rose/RoseParadiseEntryButton';
import {
  Crown,
  Search,
  Swords,
  Play,
  RotateCcw,
  BookOpen,
  LogOut,
  Clock,
  Trophy,
  X,
  CheckCircle2,
  AlertCircle,
  Bot,
  Sparkles,
  Sun,
  Moon,
  Palette,
  Flame,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { posToNotation } from '../game/engine';
import { usePredictor } from '../predictor/PredictorContext';
import { TrophyRoomModal } from './TrophyRoomModal';
import type { TrainerId } from '../training/types';
import { TRAINER_PROFILES } from '../training/data';

interface DashboardProps {
  onOpenRules: () => void;
  onOpenBotModal: () => void;
  onOpenCraftedBotModal?: () => void;
  onOpenCraftTheory: () => void;
  onOpenRose?: () => void;
  onOpenHashiraTraining?: (trainerId?: TrainerId) => void;
  lastCompletedMatch?: { match: MatchState; completedAt: number } | null;
  onClearLastGame?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenRules,
  onOpenBotModal,
  onOpenCraftedBotModal,
  onOpenCraftTheory,
  onOpenRose,
  onOpenHashiraTraining,
  lastCompletedMatch,
  onClearLastGame,
}) => {
  const { user, token, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    onlineUserIds,
    sendChallenge,
    cancelChallenge,
    joinMatch,
    matchError,
    clearMatchError,
  } = useSocket();

  const { state: predictorState, clearPredictorSession } = usePredictor();
  const [isTrophyRoomOpen, setIsTrophyRoomOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [activeMatches, setActiveMatches] = useState<MatchState[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<Challenge[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatarId || 'avatar_prince');
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [isCullingOpen, setIsCullingOpen] = useState(false);

  // Fetch players on mount or search
  useEffect(() => {
    async function fetchPlayers() {
      if (!token) return;
      setIsLoadingPlayers(true);
      try {
        const res = await fetch(`/api/players?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          setPlayers(data.players || []);
        }
      } catch (err) {
        console.error('Failed to search players:', err);
      } finally {
        setIsLoadingPlayers(false);
      }
    }

    const timer = setTimeout(fetchPlayers, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  // Fetch active matches & outgoing challenges
  const refreshUserData = async () => {
    if (!token) return;
    try {
      const [matchesRes, challengesRes] = await Promise.all([
        fetch('/api/matches', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/challenges', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (matchesRes.ok && matchesRes.headers.get('content-type')?.includes('application/json')) {
        const data = await matchesRes.json();
        setActiveMatches(data.matches || []);
      }
      if (challengesRes.ok && challengesRes.headers.get('content-type')?.includes('application/json')) {
        const data = await challengesRes.json();
        setOutgoingChallenges(data.outgoing || []);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  useEffect(() => {
    refreshUserData();
    const interval = setInterval(refreshUserData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const [challengeTimeControl, setChallengeTimeControl] = useState<120 | 300>(300);
  const [challengeMoveSuggestions, setChallengeMoveSuggestions] = useState<'included' | 'excluded'>('included');
  const [challengeCrafting, setChallengeCrafting] = useState<'allowed' | 'off'>('allowed');
  const [challengePieceTheme, setChallengePieceTheme] = useState<PieceTheme>('classic');

  const handleChallengePlayer = (targetUserId: string, targetName: string) => {
    const craftingAllowed = challengeCrafting === 'allowed';
    sendChallenge(targetUserId, challengeTimeControl, challengeMoveSuggestions, craftingAllowed, challengePieceTheme);
    setSentNotice(
      `Challenge (${challengeTimeControl === 120 ? '2m' : '5m'}, hints ${challengeMoveSuggestions}, crafting ${craftingAllowed ? 'on' : 'off'}, ${challengePieceTheme === 'classic' ? 'Classic' : 'Retro Cards'} pieces) sent to ${targetName}!`
    );
    setTimeout(() => setSentNotice(null), 4000);
    setTimeout(refreshUserData, 500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(editName, editAvatar);
    setIsEditingProfile(false);
  };

  if (!user) return null;

  if (isCullingOpen) {
    return <CullingModeEntry onBack={() => setIsCullingOpen(false)} />;
  }

  const ongoingMatches = activeMatches.filter((m) => m.status === 'active');
  const pastMatches = activeMatches.filter((m) => m.status === 'completed');

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans">
      {/* Brutalist Top Bar */}
      <header className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-3.5 border-b-4 border-black dark:border-white bg-white dark:bg-[#0a0a0c] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-400 border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000]">
            <Crown className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black uppercase tracking-tight whitespace-nowrap">
              MugenChessX
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider whitespace-nowrap">
              by ANANDA JANA
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-xs font-black uppercase">
          <a href="#matches" className="hover:text-amber-500 transition-colors whitespace-nowrap">
            Active Matches ({ongoingMatches.length})
          </a>
          <a href="#players" className="hover:text-amber-500 transition-colors whitespace-nowrap">
            Find Players
          </a>
          <button
            onClick={onOpenRules}
            className="hover:text-amber-500 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer font-black"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            Rules
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Per-client Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:px-3 sm:py-1.5 border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black dark:hover:text-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_var(--shadow)] cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Board`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:text-black" />
            ) : (
              <Moon className="w-4 h-4 text-black" />
            )}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light Board' : 'Dark Board'}</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="border-2 border-black dark:border-white p-0.5 bg-neutral-100 dark:bg-neutral-900">
              <AvatarDisplay avatarId={user.avatarId} size="sm" />
            </div>
            <span className="text-xs font-black uppercase hidden sm:inline">
              {user.displayName}
            </span>
          </div>

          <button
            onClick={() => setIsTrophyRoomOpen(true)}
            className="px-2.5 py-1.5 text-xs font-black uppercase bg-amber-400 text-black hover:bg-amber-300 border-2 border-black dark:border-white shadow-[2px_2px_0px_var(--shadow)] flex items-center gap-1.5 cursor-pointer"
            title="Session Trophy Room"
          >
            <Trophy className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Trophy Room</span>
            {predictorState.earnedCards.length > 0 && (
              <span className="px-1.5 py-0.2 bg-black text-amber-300 text-[10px] font-mono">
                {predictorState.earnedCards.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              clearPredictorSession();
              logout();
            }}
            className="px-2.5 py-1.5 text-xs font-black uppercase bg-neutral-200 dark:bg-neutral-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 border-2 border-black dark:border-white shadow-[2px_2px_0px_var(--shadow)] flex items-center gap-1.5 cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mobile Top Training Buttons Bar */}
        <div className="lg:hidden col-span-1 flex items-center justify-center gap-2 w-full mb-1">
          <button
            onClick={() => onOpenHashiraTraining && onOpenHashiraTraining('thukuna')}
            className="flex-1 py-1.5 px-2 bg-gradient-to-r from-amber-900 to-neutral-950 border-2 border-amber-600 text-amber-200 font-black text-[10px] uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer truncate"
          >
            <img src={TRAINER_PROFILES.thukuna.avatarSrc} alt="Thukuna" className="w-5 h-5 object-cover border border-amber-500 shrink-0" />
            <span className="truncate">Train Thukuna</span>
          </button>
          <button
            onClick={() => onOpenHashiraTraining && onOpenHashiraTraining('gatoru')}
            className="flex-1 py-1.5 px-2 bg-gradient-to-r from-sky-700 to-neutral-950 border-2 border-sky-400 text-sky-200 font-black text-[10px] uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer truncate"
          >
            <img src={TRAINER_PROFILES.gatoru.avatarSrc} alt="Gatoru" className="w-5 h-5 object-cover border border-sky-400 shrink-0" />
            <span className="truncate">Train Gatoru</span>
          </button>
        </div>

        {/* Latest Edition Banner (Mobile) */}
        <div className="lg:hidden w-full">
          <img
            src="/assets/aistudio/image_8cc24db1.png"
            alt="Latest Edition"
            className="w-full pointer-events-none border-2 border-black dark:border-white shadow-[4px_4px_0px_#000000]"
          />
        </div>

        {/* Left Column: Profile Card & Outgoing Challenges (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Latest Edition Banner (Desktop) */}
          <div className="hidden lg:block">
            <img
              src="/assets/aistudio/image_8cc24db1.png"
              alt="Latest Edition"
              className="w-full pointer-events-none border-3 border-black dark:border-white shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff]"
            />
          </div>

          {/* Desktop Left Sidebar: Train with Thukuna & Train with Gatoru */}
          <div className="hidden lg:flex flex-col gap-3 bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff]">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Hashira Training Dojos
            </h4>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => onOpenHashiraTraining && onOpenHashiraTraining('thukuna')}
                className="w-full py-3 px-3.5 bg-gradient-to-r from-amber-900 to-neutral-950 border-3 border-amber-600 text-amber-200 font-black text-xs uppercase flex items-center gap-3.5 shadow-[3px_3px_0px_#000] cursor-pointer hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 transition-all text-left"
              >
                <img src={TRAINER_PROFILES.thukuna.avatarSrc} alt="Thukuna" className="w-10 h-10 object-cover border-2 border-amber-500 shrink-0 shadow-[1px_1px_0px_#000]" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">Train with Thukuna</span>
                  <span className="text-[10px] text-amber-400/80 font-normal">Plasma Hashira · Opening & Tactical</span>
                </div>
              </button>

              <button
                onClick={() => onOpenHashiraTraining && onOpenHashiraTraining('gatoru')}
                className="w-full py-3 px-3.5 bg-gradient-to-r from-sky-700 to-neutral-950 border-3 border-sky-400 text-sky-200 font-black text-xs uppercase flex items-center gap-3.5 shadow-[3px_3px_0px_#000] cursor-pointer hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 transition-all text-left"
              >
                <img src={TRAINER_PROFILES.gatoru.avatarSrc} alt="Gatoru" className="w-10 h-10 object-cover border-2 border-sky-400 shrink-0 shadow-[1px_1px_0px_#000]" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">Train with Gatoru</span>
                  <span className="text-[10px] text-sky-300/80 font-normal">Void Hashira · Six Eyes & Precision</span>
                </div>
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-5 shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="border-2 border-black dark:border-white p-0.5 bg-neutral-100 dark:bg-neutral-900">
                  <AvatarDisplay avatarId={user.avatarId} size="lg" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase">{user.displayName}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditName(user.displayName);
                  setEditAvatar(user.avatarId);
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Profile Edit Mode */}
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-t-2 border-black dark:border-white flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white text-xs font-bold text-black dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Avatar</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.id)}
                        className={`p-1 border border-black dark:border-white flex justify-center cursor-pointer ${
                          editAvatar === av.id ? 'bg-amber-400 shadow-[2px_2px_0px_#000]' : 'opacity-60'
                        }`}
                      >
                        <AvatarDisplay avatarId={av.id} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  Save Profile
                </button>
              </form>
            ) : (
              <div className="mt-4 pt-4 border-t-2 border-black dark:border-white space-y-3 font-mono">
                {/* Predicted Skill Rating ELO Badge */}
                <div className="p-2.5 bg-amber-400 dark:bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider block text-black/80">Predicted Rating</span>
                    <span className="text-xl font-black font-mono leading-none">{predictorState.currentRating} ELO</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-black text-amber-300">
                    Live Session
                  </span>
                </div>

                {/* Session Wins, Losses, Draws Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-neutral-100 dark:bg-[#141416] p-2 border-2 border-black dark:border-white">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {(user.stats?.wins || 0) + predictorState.wins}
                    </span>
                    <p className="text-[10px] font-black uppercase mt-0.5">Wins</p>
                  </div>
                  <div className="bg-neutral-100 dark:bg-[#141416] p-2 border-2 border-black dark:border-white">
                    <span className="text-lg font-black">
                      {(user.stats?.losses || 0) + predictorState.losses}
                    </span>
                    <p className="text-[10px] font-black uppercase mt-0.5">Losses</p>
                  </div>
                  <div className="bg-neutral-100 dark:bg-[#141416] p-2 border-2 border-black dark:border-white">
                    <span className="text-lg font-black text-amber-500">
                      {(user.stats?.draws || 0) + predictorState.draws}
                    </span>
                    <p className="text-[10px] font-black uppercase mt-0.5">Draws</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Last Completed Game Review */}
          {lastCompletedMatch && (
            <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-5 shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Last Game Review (Auto-flushes in 10m)
                </h4>
                {onClearLastGame && (
                  <button
                    onClick={onClearLastGame}
                    className="text-[10px] font-black uppercase text-neutral-500 hover:text-red-500 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="text-xs space-y-2">
                <div className="p-2.5 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white">
                  <div className="font-black uppercase truncate">
                    {lastCompletedMatch.match.whitePlayer.displayName} vs {lastCompletedMatch.match.blackPlayer.displayName}
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1 uppercase">
                    Result: {lastCompletedMatch.match.result?.winner === 'draw' ? 'Draw' : `${lastCompletedMatch.match.result?.winner} Wins`} ({lastCompletedMatch.match.result?.reason})
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1 p-2 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white font-mono text-[11px]">
                  <div className="font-black uppercase text-[10px] text-neutral-400 mb-1 sticky top-0 bg-neutral-100 dark:bg-[#141416] py-0.5">Consecutive Steps Log:</div>
                  {lastCompletedMatch.match.moveHistory.length === 0 ? (
                    <div className="text-neutral-400 italic py-2 text-center">No moves recorded.</div>
                  ) : (
                    lastCompletedMatch.match.moveHistory.map((m, idx) => {
                      const fromStr = posToNotation(m.from);
                      const toStr = posToNotation(m.to);
                      const pieceName = m.piece.type;
                      const color = m.piece.color;
                      return (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-black/10 dark:border-white/10 last:border-0">
                          <span className="font-bold text-neutral-600 dark:text-neutral-300">{idx + 1}. [{color[0].toUpperCase()}] {pieceName}</span>
                          <span className="font-mono">{fromStr} → {toStr} {m.captured ? `(captures ${m.captured.type})` : ''}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Outgoing Challenges */}
          {outgoingChallenges.length > 0 && (
            <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-5 shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff]">
              <h4 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Outgoing Invitations ({outgoingChallenges.length})
              </h4>
              <div className="space-y-2">
                {outgoingChallenges.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between p-2.5 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AvatarDisplay avatarId={ch.challenged.avatarId} size="sm" />
                      <div>
                        <span className="font-black uppercase block truncate max-w-[130px]">
                          {ch.challenged.displayName}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase font-mono">Waiting for response...</span>
                      </div>
                    </div>
                    <button
                      onClick={() => cancelChallenge(ch.id)}
                      className="px-2 py-1 text-[11px] font-black uppercase text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white border border-red-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Rules Summary Card */}
          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-5 shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff] text-xs space-y-2.5">
            <h4 className="font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              Game Highlights
            </h4>
            <p className="leading-relaxed">
              · <strong>DICE ROLLS (1-6):</strong> Rolls 1-3 move Inexpensive pieces (Knights, Bishops, Pawns); 4-6 move Expensive pieces (Rooks, Queens, Princes, Kings, Pawns).
            </p>
            <p className="leading-relaxed">
              · <strong>FREE PASS FALLBACK:</strong> If no piece in the rolled category can move, all legal moves on the board unlock!
            </p>
            <p className="leading-relaxed">
              · <strong>TWO-PAWN DRAW:</strong> Either player landing 2 pawns on enemy back rank draws immediately.
            </p>
            <p className="leading-relaxed text-[11px] text-neutral-600 dark:text-neutral-400">
              · <strong>TAILORED MODE RULES:</strong> Play vs Bot (Standard), Play vs Bot (Crafted), and Multiplayer feature separate rules and options.
            </p>
            <button
              onClick={onOpenRules}
              className="w-full mt-1 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 hover:text-black dark:hover:text-black border-2 border-black dark:border-white text-xs font-black uppercase transition-colors cursor-pointer shadow-[2px_2px_0px_var(--shadow)]"
            >
              Open Full Rulebook
            </button>
          </div>
        </div>

        {/* Right / Center Column: Active Matches & Find Players (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Notifications / Errors */}
          {matchError && (
            <div className="bg-red-500 text-white border-3 border-black p-3 text-xs font-black uppercase flex items-center justify-between shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                <span>{matchError}</span>
              </div>
              <button onClick={clearMatchError} className="p-1 hover:bg-black text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {sentNotice && (
            <div className="bg-emerald-400 text-black border-3 border-black p-3 text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000]">
              <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
              <span>{sentNotice}</span>
            </div>
          )}

          {/* FEATURE BANNER: CHESS HASHIRA TRAINING */}
          <div className="bg-gradient-to-r from-yellow-950 via-neutral-900 to-black text-white border-4 border-amber-400 p-4 sm:p-5 shadow-[6px_6px_0px_#eab308] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                <Flame className="w-7 h-7 text-black fill-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black uppercase text-amber-400 tracking-wide">
                    Chess Hashira Training · 鬼殺チェス柱稽古
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-black font-black uppercase">
                    6 Martial Tiers
                  </span>
                </div>
                <p className="text-xs font-bold text-neutral-300 mt-0.5">
                  Train under Thukuna : The Plasma Hashira across Opening, Tactical & Culling Dojos. Practice sparring, earn authentic badges, and ascend to the Hashira Pillar!
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenHashiraTraining && onOpenHashiraTraining('thukuna')}
              className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <Swords className="w-4 h-4" />
              Enter Hashira Dojo
            </button>
          </div>

          {/* Instant Grandmaster Bot Challenge Card */}
          <div className="bg-amber-400 text-black border-4 border-black p-4 sm:p-5 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-amber-400 shrink-0">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black uppercase">Play vs Grandmaster Bot</h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-black text-amber-400 font-black uppercase">
                    Instant
                  </span>
                </div>
                <p className="text-xs font-bold text-neutral-900 mt-0.5">
                  Top-level minimax engine with Prince tactical analysis. Zero matchmaking lag!
                </p>
              </div>
            </div>

            <button
              onClick={onOpenBotModal}
              className="py-3 px-5 bg-black hover:bg-neutral-900 text-amber-400 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              Play vs Bot
            </button>
          </div>

          {/* Jujutsu Kaisen Culling Game Mode Challenge Card */}
          <div className="bg-[#1a0505] text-white border-4 border-[#8b0000] p-4 sm:p-5 shadow-[6px_6px_0px_#8b0000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-red-600 border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#000]">
                <Swords className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black uppercase text-red-400">
                    Play Culling Game Mode (Jujutsu Kaisen)
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-600 text-white font-black uppercase">
                    88 Cross Squares
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-300 mt-0.5">
                  Gojo & Protagonists vs Sukuna & Antagonists on an 88-square cross board with custom abilities!
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCullingOpen(true)}
              className="py-3 px-5 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              ⚔️ Culling Mode
            </button>
          </div>

          {/* NEW: Instant Grandmaster Bot with Crafted Pieces Challenge Card (Navy Blue Background) */}
          <div className="bg-[#0f172a] text-white border-4 border-black dark:border-white p-4 sm:p-5 shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                <Sparkles className="w-7 h-7 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black uppercase text-amber-400">
                    Play vs Grandmaster Bot with Crafted Pieces
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-black font-black uppercase">
                    New Mode
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-300 mt-0.5">
                  Custom crafted army: Bishops replaced with Communists, Knights with Priests, and a Rook with Supreme Rook. Same tactical dice rules!
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCraftedBotModal || onOpenBotModal}
              className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              Play vs Bot (Crafted)
            </button>
          </div>

          <RoseParadiseEntryButton onClick={onOpenRose || (() => {})} />

          {/* Craft Theory Catalog Button Card (Solid White, Highlighted) */}
          <div className="bg-white text-black border-4 border-black dark:border-white p-4 sm:p-5 shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                <BookOpen className="w-7 h-7 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black uppercase text-black">
                    Craft Theory & Piece Encyclopedia
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-black text-amber-400 font-black uppercase">
                    Guide
                  </span>
                </div>
                <p className="text-xs font-bold text-neutral-700 mt-0.5">
                  Explore rules, descriptions, and 9×9 movement preview grids for all standard chess pieces, the Prince, and crafted specials.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCraftTheory}
              className="py-3 px-5 bg-white hover:bg-neutral-100 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <BookOpen className="w-4 h-4 text-black" />
              Craft Theory
            </button>
          </div>

          {/* Active / Ongoing Matches Section */}
          <section id="matches">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-500" />
                Active Matches ({ongoingMatches.length})
              </h3>
              <button
                onClick={refreshUserData}
                className="text-xs font-black uppercase hover:text-amber-500 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {ongoingMatches.length === 0 ? (
              <div className="bg-neutral-100 dark:bg-[#141416] border-3 border-black dark:border-white p-6 text-center text-xs font-bold uppercase text-neutral-500">
                No active games currently. Issue a challenge below!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ongoingMatches.map((m) => {
                  const isWhite = m.whitePlayer.userId === user.id;
                  const opponent = isWhite ? m.blackPlayer : m.whitePlayer;
                  const isMyTurn = (isWhite && m.turn === 'white') || (!isWhite && m.turn === 'black');

                  return (
                    <div
                      key={m.id}
                      className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <AvatarDisplay avatarId={opponent.avatarId} size="md" />
                          <div>
                            <span className="font-black text-sm uppercase block">
                              vs {opponent.displayName}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500 uppercase">
                              Playing as {isWhite ? 'White' : 'Black'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 border font-black uppercase ${
                            isMyTurn
                              ? 'bg-amber-400 text-black border-black animate-pulse'
                              : 'bg-neutral-200 dark:bg-neutral-800 border-black dark:border-white'
                          }`}
                        >
                          {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
                        </span>
                      </div>

                      <button
                        onClick={() => joinMatch(m.id)}
                        className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Enter Match Room
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Find & Challenge Players Section */}
          <section id="players">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-500" />
                Find Players to Challenge
              </h3>
              
              {/* Challenge Controls Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white p-1 text-xs">
                  <span className="text-[10px] font-black uppercase px-1">Timer:</span>
                  <button
                    type="button"
                    onClick={() => setChallengeTimeControl(300)}
                    className={`px-2 py-0.5 font-black text-[11px] uppercase cursor-pointer border ${
                      challengeTimeControl === 300
                        ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    5m
                  </button>
                  <button
                    type="button"
                    onClick={() => setChallengeTimeControl(120)}
                    className={`px-2 py-0.5 font-black text-[11px] uppercase cursor-pointer border ${
                      challengeTimeControl === 120
                        ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    2m
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white p-1 text-xs">
                  <span className="text-[10px] font-black uppercase px-1">Hints:</span>
                  <button
                    type="button"
                    onClick={() => setChallengeMoveSuggestions('included')}
                    className={`px-2 py-0.5 font-black text-[11px] uppercase cursor-pointer border ${
                      challengeMoveSuggestions === 'included'
                        ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    On
                  </button>
                  <button
                    type="button"
                    onClick={() => setChallengeMoveSuggestions('excluded')}
                    className={`px-2 py-0.5 font-black text-[11px] uppercase cursor-pointer border ${
                      challengeMoveSuggestions === 'excluded'
                        ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Off
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white p-1 text-xs">
                  <span className="text-[10px] font-black uppercase px-1">Crafting:</span>
                  <button
                    type="button"
                    onClick={() => setChallengeCrafting('allowed')}
                    title="Allow 2nd expensive piece sacrifice to craft Communist, Priest, or Supreme Rook"
                    className={`px-2 py-0.5 font-black text-[11px] uppercase cursor-pointer border ${
                      challengeCrafting === 'allowed'
                        ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    On
                  </button>
                  <button
                    type="button"
                    onClick={() => setChallengeCrafting('off')}
                    title="Avoid mid-game piece crafting (standard chess piece flow without summons)"
                    className={`px-2 py-0.5 font-black text-[11px] uppercase cursor-pointer border ${
                      challengeCrafting === 'off'
                        ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Avoid
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white p-1 text-xs">
                  <span className="text-[10px] font-black uppercase px-1">Theme:</span>
                  <button
                    type="button"
                    onClick={() => setChallengePieceTheme('classic')}
                    title="Classic Standard clean geometric chess pieces"
                    className={`px-2 py-0.5 font-black text-[11px] uppercase cursor-pointer border ${
                      challengePieceTheme === 'classic'
                        ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Classic
                  </button>
                  <button
                    type="button"
                    onClick={() => setChallengePieceTheme('retro')}
                    title="Retro Playing Cards character art pieces"
                    className={`px-2 py-0.5 font-black text-[11px] uppercase cursor-pointer border ${
                      challengePieceTheme === 'retro'
                        ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Retro Cards
                  </button>
                </div>
              </div>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered players by username..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#141416] border-3 border-black dark:border-white text-xs font-mono text-black dark:text-white placeholder-neutral-500 focus:outline-none shadow-[3px_3px_0px_var(--shadow)]"
              />
            </div>

            <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white overflow-hidden shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff]">
              {isLoadingPlayers ? (
                <div className="p-8 text-center text-xs font-black uppercase text-neutral-500">Searching players...</div>
              ) : players.length === 0 ? (
                <div className="p-8 text-center text-xs font-black uppercase text-neutral-500">
                  {searchQuery ? 'No registered players found matching that name.' : 'No other players registered yet.'}
                </div>
              ) : (
                <div className="divide-y-2 divide-black dark:divide-white">
                  {players.map((p) => {
                    const isOnline = onlineUserIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className="p-3.5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative border-2 border-black dark:border-white p-0.5 bg-neutral-200 dark:bg-neutral-800">
                            <AvatarDisplay avatarId={p.avatarId} size="md" />
                            {isOnline && (
                              <span
                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-black"
                                title="Online now"
                              />
                            )}
                          </div>
                          <div>
                            <span className="font-black text-xs uppercase block">
                              {p.displayName}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500">
                              @{p.username} · {p.stats.wins}W / {p.stats.losses}L / {p.stats.draws}D
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleChallengePlayer(p.id, p.displayName)}
                          className="py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          Challenge
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Recent Match History Section */}
          {pastMatches.length > 0 && (
            <section id="history">
              <h3 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Recent Match History
              </h3>
              <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white overflow-hidden shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] divide-y-2 divide-black dark:divide-white">
                {pastMatches.map((m) => {
                  const isWhite = m.whitePlayer.userId === user.id;
                  const opponent = isWhite ? m.blackPlayer : m.whitePlayer;
                  const isWinner =
                    (m.result?.winner === 'white' && isWhite) ||
                    (m.result?.winner === 'black' && !isWhite);
                  const isDraw = m.result?.winner === 'draw';

                  let badgeColor = 'bg-neutral-200 text-neutral-800 border-black';
                  let label = 'DEFEAT';
                  if (isWinner) {
                    badgeColor = 'bg-emerald-400 text-black border-black';
                    label = 'VICTORY';
                  } else if (isDraw) {
                    badgeColor = 'bg-amber-400 text-black border-black';
                    label = m.result?.reason === 'two_pawns_end_rank_draw' ? '2-PAWN DRAW' : 'DRAW';
                  }

                  return (
                    <div key={m.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <AvatarDisplay avatarId={opponent.avatarId} size="sm" />
                        <div>
                          <span className="font-black uppercase block">vs {opponent.displayName}</span>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 border font-black uppercase text-[10px] ${badgeColor}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <TrophyRoomModal
        isOpen={isTrophyRoomOpen}
        onClose={() => setIsTrophyRoomOpen(false)}
      />
    </div>
  );
};
