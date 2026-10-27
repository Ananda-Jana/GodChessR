import React, { useState, useEffect, useRef } from 'react';
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
  Palette,
  Flame,
  Lock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Users,
  Zap,
  Box,
  Heart,
} from 'lucide-react';
import { posToNotation } from '../game/engine';
import { usePredictor } from '../predictor/PredictorContext';
import { TrophyRoomModal } from './TrophyRoomModal';
import type { TrainerId } from '../training/types';
import { TRAINER_PROFILES } from '../training/data';
import { SecretArenaModal } from '../secret/components/SecretArenaModal';
import { SecretPlayerConfig } from '../secret/types';
import { MultiplayerChallengeModal } from './MultiplayerChallengeModal';
import { GamepadSkull } from './GamepadSkull';
import { OctoSkull } from './OctoSkull';
import { CyberSkull } from './CyberSkull';
import { AboutGameModal } from './AboutGameModal';
import { AllGameModesModal } from './AllGameModesModal';
import { WalkWithMastersCard } from './HashiraTrainingCard';
import { Chess3dEntryCard } from '../chess3d/Chess3dEntryCard';
import { Chess3dRulesPreviewModal } from '../chess3d/Chess3dRulesPreviewModal';
import type { PunisherBotId } from '../chess3d/chess3dBot';
import type { Team as Team3D, TimeControl3D } from '../chess3d/types';

interface DashboardProps {
  onOpenRules: () => void;
  onOpenBotModal: () => void;
  onOpenClassicBotModal?: () => void;
  onOpenCraftedBotModal?: () => void;
  onOpenCraftTheory: () => void;
  onOpenRose?: () => void;
  onOpenHashiraTraining?: (trainerId?: TrainerId) => void;
  onOpenPunisher?: () => void;
  onStartSecretMatch?: (botConfig: SecretPlayerConfig) => void;
  onStart3dMatch?: (params: {
    botId?: PunisherBotId;
    playerTeam?: Team3D;
    timeControl?: TimeControl3D;
    roomCode?: string;
  }) => void;
  lastCompletedMatch?: { match: MatchState; completedAt: number } | null;
  onClearLastGame?: () => void;
}

const BANNER_IMAGES = [
  '/assets/aistudio/image_8cc24db1.png',
  '/assets/aistudio/image_d336b87f.png',
] as const;

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenRules,
  onOpenBotModal,
  onOpenClassicBotModal,
  onOpenCraftedBotModal,
  onOpenCraftTheory,
  onOpenRose,
  onOpenHashiraTraining,
  onOpenPunisher,
  onStartSecretMatch,
  onStart3dMatch,
  lastCompletedMatch,
  onClearLastGame,
}) => {
  const { user, token, logout, updateProfile } = useAuth();
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
  const [isSecretArenaOpen, setIsSecretArenaOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAllGameModesOpen, setIsAllGameModesOpen] = useState(false);
  const [isEndlessSpringOpen, setIsEndlessSpringOpen] = useState(false);
  const [challengeModalTarget, setChallengeModalTarget] = useState<{ id: string; name: string } | null>(null);
  const [isWalkWithMastersOpen, setIsWalkWithMastersOpen] = useState(false);
  const [is3dPreviewModalOpen, setIs3dPreviewModalOpen] = useState(false);

  // Mobile navigation & bottom sheet states
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'play' | 'matches' | 'players' | null>(null);

  const profilePillRef = useRef<HTMLButtonElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);

  // Keyboard accessibility and focus management for mobile profile sheet
  useEffect(() => {
    if (!isMobileProfileOpen) return;
    const focusTimer = setTimeout(() => {
      sheetCloseRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileProfileOpen(false);
        profilePillRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileProfileOpen]);

  // Smooth scroll helper for mobile bottom navigation (respecting prefers-reduced-motion)
  const scrollToSection = (id: string, tab: 'play' | 'matches' | 'players') => {
    setActiveBottomTab(tab);
    const el = document.getElementById(id);
    if (el) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  };

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

  // Rotating Banner Images State (5s loop, fixed bounding box)
  const [bannerIndex, setBannerIndex] = useState<number>(0);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 5000);
    return () => clearInterval(bannerTimer);
  }, []);

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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans relative">
      {/* Fixed Background Image (Home Screen Only) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/assets/aistudio/image_1fd5a868.png')",
        }}
      >
        {/* Darkened overlay for readability */}
        <div className="absolute inset-0 bg-black/65 backdrop-brightness-75" />
      </div>

      {/* Redesigned Mobile Top Bar (md:hidden, sticky, h-12, glassmorphic) */}
      <header className="md:hidden flex items-center justify-between px-3 h-12 sticky top-0 z-40 bg-zinc-950/95 supports-[backdrop-filter]:bg-zinc-950/80 supports-[backdrop-filter]:backdrop-blur-xl border-b border-white/10 text-white relative">
        {/* Mobile Brand Button (Icon-only on mobile view to avoid text clipping/overflow) */}
        <button
          type="button"
          onClick={() => setIsAboutOpen(true)}
          aria-label="About MugenChessX"
          title="About MugenChessX"
          className="p-1 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0 cursor-pointer"
        >
          <OctoSkull size={26} className="text-white hover:text-amber-400 transition-colors shrink-0" />
        </button>

        {/* Mobile Top Navigation Action Icons (Borderless clean icon buttons, no square box frames) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Mobile Walk with Masters Button */}
          <button
            type="button"
            onClick={() => setIsWalkWithMastersOpen(true)}
            aria-label="Walk with Masters (Train with Thukuna & Gatoru)"
            title="Walk with Masters"
            className="p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 text-white cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0 group relative"
          >
            <Flame className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
          </button>

          {/* Rules Button */}
          <button
            type="button"
            onClick={onOpenRules}
            aria-label="Open rulebook"
            title="Rules"
            className="p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 text-white cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
          >
            <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
          </button>

          {/* Culling Mode Launcher Button */}
          <button
            type="button"
            onClick={() => setIsCullingOpen(true)}
            aria-label="Play Culling mode"
            title="Culling"
            className="p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 text-white cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
          >
            <GamepadSkull size={20} className="text-zinc-200 hover:text-white shrink-0" />
          </button>

          {/* Mobile 3D Annihilatic Chess Arcade Button */}
          <button
            type="button"
            onClick={() => setIs3dPreviewModalOpen(true)}
            aria-label="3D Annihilatic Chess Arcade"
            title="3D Chess Arcade"
            className="p-1.5 rounded-lg hover:bg-purple-950/50 active:bg-purple-900/60 text-purple-400 cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 shrink-0 relative group"
          >
            <Box className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[7px] font-black font-mono px-0.5 rounded bg-purple-600 text-white leading-none py-0.5">
              3D
            </span>
          </button>

          {/* Mobile Profile Trigger (Avatar + Live ELO, sleek borderless pill) */}
          <button
            ref={profilePillRef}
            type="button"
            onClick={() => setIsMobileProfileOpen(true)}
            aria-label="Open profile and statistics"
            aria-expanded={isMobileProfileOpen}
            className="p-1 px-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 flex items-center gap-1.5 text-white cursor-pointer active:scale-95 transition-all shrink-0"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-400 flex items-center justify-center bg-neutral-900 shrink-0">
              <AvatarDisplay avatarId={user.avatarId} size="sm" />
            </div>
            <span className="font-mono text-xs font-bold text-amber-300 whitespace-nowrap">
              {predictorState.currentRating} ELO
            </span>
          </button>
        </div>
      </header>

      {/* Desktop Dark Top Bar (hidden md:flex) - Restyled Desktop Top Navigation Bar */}
      <style>{`
        @media (min-width: 768px) {
          .mcx-nav2 {
            background-color: #0b0b0f !important;
            border-bottom: 1px solid #1f1f28 !important;
            height: 56px !important;
            padding-left: 1.25rem !important;
            padding-right: 1.25rem !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6) !important;
          }
          .mcx-nav2-brand {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            box-shadow: none !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.6rem !important;
            cursor: pointer !important;
            text-align: left !important;
          }
          .mcx-nav2-brand:focus-visible {
            outline: 2px solid #f5c518 !important;
            outline-offset: 2px !important;
          }
          .mcx-nav2-hairline {
            width: 1px !important;
            height: 20px !important;
            background-color: rgba(255, 255, 255, 0.12) !important;
            flex-shrink: 0 !important;
          }
          .mcx-nav2-items {
            display: flex !important;
            align-items: center !important;
            gap: 1.25rem !important;
          }
          .mcx-nav2-item {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 0.4rem !important;
            height: 56px !important;
            padding: 0 2px !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: #b9b9c4 !important;
            font-size: 0.75rem !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.06em !important;
            text-decoration: none !important;
            cursor: pointer !important;
            transition: color 0.2s ease !important;
            white-space: nowrap !important;
          }
          .mcx-nav2-item:hover {
            color: #ffffff !important;
            background: transparent !important;
          }
          .mcx-nav2-item::after {
            content: '' !important;
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 3px !important;
            background-color: #f5c518 !important;
            transform: scaleX(0) !important;
            transform-origin: center !important;
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            border-radius: 3px 3px 0 0 !important;
          }
          .mcx-nav2-item:hover::after,
          .mcx-nav2-item.active::after {
            transform: scaleX(1) !important;
          }
          .mcx-nav2-item.active {
            color: #ffffff !important;
          }
          .mcx-nav2-item:focus-visible {
            outline: 2px solid #f5c518 !important;
            outline-offset: -2px !important;
            border-radius: 4px !important;
          }
          .mcx-nav2-badge {
            background-color: #f5c518 !important;
            color: #000000 !important;
            font-size: 10px !important;
            font-weight: 900 !important;
            padding: 1px 5px !important;
            border-radius: 9999px !important;
            line-height: 1 !important;
          }
          .mcx-nav2-profile {
            display: flex !important;
            align-items: center !important;
            gap: 0.5rem !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .mcx-nav2-avatar {
            width: 28px !important;
            height: 28px !important;
            border-radius: 50% !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background-color: #18181b !important;
            flex-shrink: 0 !important;
          }
          .mcx-nav2-username {
            color: #f4f4f5 !important;
            font-size: 0.75rem !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.03em !important;
          }
          .mcx-nav2-elo {
            color: #f5c518 !important;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            font-size: 0.8125rem !important;
            font-weight: 900 !important;
            letter-spacing: 0.02em !important;
          }
          .mcx-nav2-logout {
            display: inline-flex !important;
            align-items: center !important;
            gap: 0.35rem !important;
            padding: 0.4rem 0.6rem !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: #71717a !important;
            font-size: 0.75rem !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            cursor: pointer !important;
            border-radius: 6px !important;
            transition: color 0.2s ease, background-color 0.2s ease !important;
          }
          .mcx-nav2-logout:hover {
            color: #ffffff !important;
            background-color: rgba(255, 255, 255, 0.06) !important;
          }
          .mcx-nav2-logout:focus-visible {
            outline: 2px solid #f5c518 !important;
            outline-offset: 2px !important;
          }
        }
      `}</style>
      <header className="hidden md:flex items-center justify-between gap-3 sticky top-0 z-40 mcx-nav2">
        {/* Brand Lockup Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            aria-label="About MugenChessX"
            className="mcx-nav2-brand group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-amber-400/50 transition-colors">
              <OctoSkull size={22} className="shrink-0 text-white group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-tight text-white whitespace-nowrap leading-none mb-0.5">
                MugenChessX
              </span>
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap leading-none">
                by ANANDA JANA
              </span>
            </div>
          </button>
          <div className="mcx-nav2-hairline" />
        </div>

        {/* Center Navigation Links */}
        <nav aria-label="Main Navigation" className="mcx-nav2-items overflow-x-auto scrollbar-none py-0.5">
          {/* All Modes */}
          <button
            type="button"
            onClick={() => setIsAllGameModesOpen(true)}
            className="mcx-nav2-item active"
            title="Browse all game modes"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>All Modes</span>
          </button>

          {/* Matches */}
          <a
            href="#matches"
            className="mcx-nav2-item"
            title="Jump to active matches"
          >
            <Swords className="w-3.5 h-3.5 text-zinc-400" />
            <span>Matches</span>
            {ongoingMatches.length > 0 && (
              <span className="mcx-nav2-badge">
                {ongoingMatches.length}
              </span>
            )}
          </a>

          {/* Players */}
          <a
            href="#players"
            className="mcx-nav2-item"
            title="Search online chess players"
          >
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>Players</span>
          </a>

          {/* Culling */}
          <button
            type="button"
            onClick={() => setIsCullingOpen(true)}
            className="mcx-nav2-item"
            title="Launch Culling Game 88-square battlegrounds"
          >
            <GamepadSkull size={16} className="text-zinc-400" />
            <span>Culling</span>
          </button>

          {/* Rose */}
          {onOpenRose && (
            <button
              type="button"
              onClick={onOpenRose}
              className="mcx-nav2-item"
              title="Enter Rose Paradise multiplayer romance mode"
            >
              <Heart className="w-3.5 h-3.5 text-zinc-400" />
              <span>Rose</span>
            </button>
          )}

          {/* 3D Arcade */}
          <button
            type="button"
            onClick={() => setIs3dPreviewModalOpen(true)}
            className="mcx-nav2-item"
            title="Open 3D Annihilatic Chess Arcade"
          >
            <Box className="w-3.5 h-3.5 text-zinc-400" />
            <span>3D Arcade</span>
          </button>

          {/* Masters */}
          <button
            type="button"
            onClick={() => setIsWalkWithMastersOpen(true)}
            className="mcx-nav2-item"
            title="Train with Thukuna & Gatoru"
          >
            <Flame className="w-3.5 h-3.5 text-zinc-400" />
            <span>Masters</span>
          </button>

          {/* Rules */}
          <button
            type="button"
            onClick={onOpenRules}
            className="mcx-nav2-item"
            title="Read complete chess rulebook and tactical guides"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>Rules</span>
          </button>

          {/* Trophies */}
          <button
            type="button"
            onClick={() => setIsTrophyRoomOpen(true)}
            className="mcx-nav2-item"
            title="View trophy room & chest inventory"
          >
            <Trophy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Trophies</span>
            {predictorState.earnedCards.length > 0 && (
              <span className="mcx-nav2-badge">
                {predictorState.earnedCards.length}
              </span>
            )}
          </button>
        </nav>

        {/* Right Section: Profile & Sign Out */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="mcx-nav2-hairline" />

          {/* Profile Area */}
          <div
            className="mcx-nav2-profile"
            title={`Logged in as ${user.displayName} (@${user.username}) - ${predictorState.currentRating} ELO`}
          >
            <div className="mcx-nav2-avatar">
              <AvatarDisplay avatarId={user.avatarId} size="sm" className="!w-full !h-full !p-0" />
            </div>
            <span className="mcx-nav2-username hidden lg:inline">
              {user.displayName}
            </span>
            <span className="mcx-nav2-elo">
              {predictorState.currentRating} ELO
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              clearPredictorSession();
              logout();
            }}
            className="mcx-nav2-logout"
            title="Sign out of your session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:grid lg:grid-cols-12 gap-6 pb-24 md:pb-6">

        {/* Latest Edition Banner (Mobile) */}
        <div className="lg:hidden order-2 w-full aspect-[3/2] relative overflow-hidden border-2 border-black dark:border-white shadow-[4px_4px_0px_#000000] bg-black">
          {BANNER_IMAGES.map((src, idx) => (
            <img
              key={src}
              src={src}
              alt="Featured Edition Banner"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out pointer-events-none ${
                idx === bannerIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {/* Subtle bottom gradient to ensure text readability */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

          {/* Fixed Glassmorphic Chess Play Now Button (Mobile) */}
          <div className="absolute inset-x-3 bottom-3 z-20">
            <button
              type="button"
              onClick={() => setIsAllGameModesOpen(true)}
              className="w-full py-2 px-3 rounded-xl backdrop-blur-md bg-black/60 hover:bg-black/75 active:bg-black/85 border border-white/30 hover:border-amber-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-[0_8px_20px_rgba(0,0,0,0.6)] cursor-pointer transition-all active:scale-95 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Chess Play Now - View all game modes"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-amber-400/20 border border-amber-400/60 flex items-center justify-center shrink-0">
                  <Play className="w-2.5 h-2.5 fill-amber-400 text-amber-400 group-hover/btn:scale-110 transition-transform" />
                </div>
                <span className="font-black tracking-wide text-white group-hover/btn:text-amber-300 transition-colors">
                  Chess Play Now
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/15 text-white/90 font-mono font-bold border border-white/20 uppercase">
                All Modes
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Resume Active Match Strip (order-3, md:hidden) */}
        {ongoingMatches.length > 0 && (
          <div className="md:hidden order-3 w-full bg-amber-400 text-black border-2 border-black p-3 shadow-[3px_3px_0px_#000] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 bg-black rounded-full animate-ping shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-black uppercase block leading-none text-black/80">Active Match</span>
                <span className="text-xs font-black uppercase truncate block">
                  vs {ongoingMatches[0].whitePlayer.userId === user.id ? ongoingMatches[0].blackPlayer.displayName : ongoingMatches[0].whitePlayer.displayName}
                </span>
              </div>
            </div>
            <button
              onClick={() => joinMatch(ongoingMatches[0].id)}
              className="px-3 py-1.5 bg-black hover:bg-neutral-900 text-amber-400 font-black text-xs uppercase border border-black shadow-[2px_2px_0px_#000] flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Resume
            </button>
          </div>
        )}

        {/* Left Column: Profile Card & Outgoing Challenges (4 cols) */}
        <div className="order-5 lg:order-1 lg:col-span-4 flex flex-col gap-6">
          {/* Latest Edition Banner (Desktop Left Sidebar) */}
          <div className="hidden lg:block w-full aspect-[3/2] relative overflow-hidden border-3 border-black dark:border-white shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff] bg-black">
            {BANNER_IMAGES.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt="Featured Edition Banner"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out pointer-events-none ${
                  idx === bannerIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            {/* Subtle bottom gradient to ensure crystal-clear text readability over any slide image */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

            {/* Fixed Glassmorphic Chess Play Now Button (Desktop Left Sidebar) */}
            <div className="absolute inset-x-3.5 bottom-3.5 z-20">
              <button
                type="button"
                onClick={() => setIsAllGameModesOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl backdrop-blur-md bg-black/60 hover:bg-black/75 active:bg-black/85 border border-white/30 hover:border-amber-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.6)] cursor-pointer transition-all active:scale-95 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Chess Play Now - View all game modes"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/60 flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 fill-amber-400 text-amber-400 group-hover/btn:scale-110 transition-transform" />
                  </div>
                  <span className="font-black tracking-wide text-white group-hover/btn:text-amber-300 transition-colors">
                    Chess Play Now
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white/90 font-mono font-bold border border-white/20 uppercase tracking-tight">
                  All Modes ⚔️
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Left Sidebar: Train with Thukuna & Train with Gatoru */}
          {/* Desktop Left Sidebar Walk with Masters Card */}
          <div className="hidden lg:block w-full">
            <WalkWithMastersCard onOpenHashiraTraining={onOpenHashiraTraining} />
          </div>

          {/* User Profile Card (Desktop only, hidden on mobile) */}
          <div className="hidden md:block bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-5 shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff]">
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

          {/* Quick Rules Summary Card (Collapsible on Mobile, Fully Open on Desktop) */}
          <div className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-4 sm:p-5 shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff] text-xs">
            <button
              type="button"
              onClick={() => setIsHighlightsExpanded(!isHighlightsExpanded)}
              aria-expanded={isHighlightsExpanded}
              className="w-full flex items-center justify-between font-black uppercase text-amber-600 dark:text-amber-400 cursor-pointer md:cursor-default"
            >
              <span className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                Game Highlights
              </span>
              <span className="md:hidden p-1 text-neutral-500">
                {isHighlightsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            <div className={`space-y-2.5 mt-2.5 ${isHighlightsExpanded ? 'block' : 'hidden md:block'}`}>
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
        </div>

        {/* Right / Center Column: Active Matches & Find Players (8 cols) */}
        <div className="order-4 lg:order-2 lg:col-span-8 flex flex-col gap-6">
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

          {/* Game Modes List with single #modes anchor */}
          <div id="modes" className="scroll-mt-16 flex flex-col gap-4 sm:gap-5 lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">

            {/* Desktop Column 1 (Left Column) */}
            <div className="contents lg:flex lg:flex-col lg:gap-4">
              {/* FEATURE BANNER: CHESS HASHIRA TRAINING */}
              <div className="order-1 lg:order-none bg-gradient-to-r from-yellow-950 via-neutral-900 to-black text-white border-4 border-amber-400 p-4 sm:p-5 shadow-[6px_6px_0px_#eab308] flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 relative overflow-hidden min-w-0">
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

                <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                  <button
                    onClick={() => onOpenHashiraTraining && onOpenHashiraTraining('thukuna')}
                    className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Swords className="w-4 h-4" />
                    Enter Hashira Dojo
                  </button>
                </div>
              </div>

              {/* PUNISHER ROBOT SELECTOR: Premium Animated Reactor Card */}
              <div className="order-2 lg:order-none punisher-reactor-card relative border-4 border-[#2727F5] p-4 sm:p-5 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 overflow-hidden min-w-0">
                <style>{`
                  @property --angle {
                    syntax: '<angle>';
                    initial-value: 0deg;
                    inherits: false;
                  }

                  @keyframes plasmaFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }

                  @keyframes borderOrbit {
                    from { --angle: 0deg; }
                    to { --angle: 360deg; }
                  }

                  @keyframes gridDrift {
                    from { background-position: 0 0; }
                    to { background-position: 100px 100px; }
                  }

                  @keyframes scanSweep {
                    0% { transform: translateY(-100%); opacity: 0; }
                    10% { opacity: 1; }
                    40% { opacity: 1; }
                    50% { transform: translateY(500%); opacity: 0; }
                    100% { transform: translateY(500%); opacity: 0; }
                  }

                  @keyframes coreBeat {
                    0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.3; }
                    50% { transform: scale(1.4) translate(-50%, -50%); opacity: 0.6; }
                  }

                  @keyframes sparkTwinkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1); }
                  }

                  @keyframes glitchBurst {
                    0% { transform: translate(0); text-shadow: none; }
                    1% { transform: translate(-2px, 0); text-shadow: 2px 0 #ff0000, -2px 0 #0000ff; }
                    2% { transform: translate(2px, 0); text-shadow: -2px 0 #ff0000, 2px 0 #0000ff; }
                    3% { transform: translate(0); text-shadow: none; }
                    100% { transform: translate(0); text-shadow: none; }
                  }

                  @keyframes neonBreathe {
                    0%, 100% { box-shadow: 6px 6px 0px #000000, 0 0 15px rgba(39,39,245,0.4); }
                    50% { box-shadow: 6px 6px 0px #000000, 0 0 30px rgba(39,39,245,0.8); }
                  }

                  .punisher-reactor-card {
                    animation: neonBreathe 3s infinite ease-in-out;
                    background: #0a0a3d;
                    will-change: box-shadow;
                  }

                  .punisher-reactor-card::before {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    padding: 3px;
                    background: conic-gradient(from var(--angle), transparent, #818cf8, #ffffff, #818cf8, transparent);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    animation: borderOrbit 4s linear infinite;
                    pointer-events: none;
                    z-index: 5;
                  }

                  .plasma-layer {
                    background: radial-gradient(circle at 20% 30%, #2727F5, transparent 70%),
                                radial-gradient(circle at 80% 70%, #6d28d9, transparent 70%),
                                linear-gradient(135deg, #14146e 0%, #4c1d95 100%);
                    background-size: 300% 300%;
                    animation: plasmaFlow 10s ease-in-out infinite;
                    will-change: background-position;
                  }

                  .hologrid-layer {
                    background-image: repeating-linear-gradient(rgba(129,140,248,0.15) 0 1px, transparent 1px 20px),
                                      repeating-linear-gradient(90deg, rgba(129,140,248,0.15) 0 1px, transparent 1px 20px);
                    animation: gridDrift 20s linear infinite;
                    mask-image: radial-gradient(circle, black 40%, transparent 100%);
                    will-change: background-position;
                  }

                  .scanline-layer {
                    background: linear-gradient(to bottom, transparent, rgba(199,210,254,0.25), transparent);
                    height: 40px;
                    animation: scanSweep 6s ease-in-out infinite;
                    will-change: transform;
                  }

                  .core-glow {
                    background: radial-gradient(circle, #2727F5 0%, #6d28d9 50%, transparent 100%);
                    filter: blur(40px);
                    animation: coreBeat 3s ease-in-out infinite;
                    will-change: transform, opacity;
                  }

                  .punisher-cont {
                    box-shadow: 4px 4px 0px #000000, 0 0 16px rgba(220, 38, 38, 0.45);
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                  }
                  .punisher-cont:hover {
                    transform: scale(1.04);
                    box-shadow: 5px 5px 0px #000000, 0 0 28px rgba(220, 38, 38, 0.85);
                  }

                  .glitch-text {
                    animation: glitchBurst 7s infinite;
                  }

                  @media (prefers-reduced-motion: reduce) {
                    .punisher-reactor-card, .punisher-reactor-card::before, .plasma-layer, .hologrid-layer, .scanline-layer, .core-glow, .glitch-text, .punisher-cont {
                      animation: none !important;
                    }
                    .plasma-layer {
                      background: linear-gradient(135deg, #14146e, #4c1d95) !important;
                    }
                  }
                `}</style>

                {/* Effects Wrapper (z-0) */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                  <div className="absolute inset-0 plasma-layer" />
                  <div className="absolute inset-0 hologrid-layer" />
                  <div className="absolute top-0 left-0 right-0 scanline-layer" />
                  <div className="absolute top-1/2 left-1/4 w-64 h-64 core-glow -translate-x-1/2 -translate-y-1/2" />
                  
                  {/* Electric Sparks */}
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-0"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `sparkTwinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 5}s`,
                        boxShadow: '0 0 8px #c7d2fe'
                      }}
                    />
                  ))}
                </div>

                {/* Content (z-10) */}
                <div className="flex items-center gap-3.5 sm:gap-4.5 relative z-10">
                  {/* Punisher Container (punisher-cont) with enlarged intimidating Oni demon avatar */}
                  <div 
                    id="punisher-cont"
                    className="punisher-cont w-20 h-20 sm:w-24 sm:h-24 bg-black border-3 border-red-600 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#000000] overflow-hidden relative group cursor-pointer"
                    data-container="punisher-cont"
                    onClick={onOpenPunisher}
                    title="Enter Punisher Robot Selector"
                  >
                    {/* Ominous red radial glow backdrop */}
                    <div 
                      aria-hidden="true" 
                      className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.35)_0%,_transparent_75%)] pointer-events-none" 
                    />
                    <img 
                      src="/assets/aistudio/image_6c6f27fb.png" 
                      alt="Punisher Robot Demon Mask" 
                      className="w-full h-full object-contain filter contrast-125 brightness-110 p-1.5 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(220,38,38,0.55)]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black uppercase text-white tracking-wide glitch-text">
                        Punisher Robot Selector
                      </h3>
                      <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-black text-amber-400 border border-amber-400/40 shadow-[1px_1px_0px_#000]">
                        RUTHLESS AI
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#c7d2fe] mt-0.5 max-w-md">
                      Face 7 legendary mechanical opponents. From the clumsy Joystick Wraith to the calculating Chrome Reaper. No dice, no mercy.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                  <button
                    onClick={onOpenPunisher}
                    className="relative z-10 py-3 px-5 bg-[#2727F5] hover:bg-[#4a4aff] text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    Enter Selector
                  </button>
                </div>
              </div>

              {/* Instant Grandmaster Bot Challenge Card (Animated Fire Effect) */}
              <div className="order-3 lg:order-none bot-fire-card text-black border-4 border-black p-4 sm:p-5 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 relative overflow-hidden transition-all duration-200 min-w-0">
                <style>{`
                  @keyframes fireFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }

                  @keyframes flameRise {
                    0% { transform: translateY(20%) scaleY(0.95) scaleX(0.98); opacity: 0.6; }
                    25% { transform: translateY(-12%) scaleY(1.15) scaleX(1.05) translateX(-6px); opacity: 0.9; }
                    50% { transform: translateY(8%) scaleY(0.9) scaleX(0.95) translateX(5px); opacity: 0.65; }
                    75% { transform: translateY(-16%) scaleY(1.2) scaleX(0.92) translateX(-3px); opacity: 0.95; }
                    100% { transform: translateY(20%) scaleY(0.95) scaleX(0.98); opacity: 0.6; }
                  }

                  @keyframes emberFloat {
                    0% { transform: translateY(30px) translateX(0) scale(1); opacity: 0; }
                    20% { opacity: 0.95; }
                    80% { opacity: 0.7; }
                    100% { transform: translateY(-90px) translateX(14px) scale(0.2); opacity: 0; }
                  }

                  @keyframes heatPulse {
                    0%, 100% { box-shadow: 6px 6px 0px #000000, 0 0 16px rgba(249,115,22,0.5); }
                    50% { box-shadow: 6px 6px 0px #000000, 0 0 32px rgba(253,224,71,0.85), inset 0 0 24px rgba(234,88,12,0.4); }
                  }

                  @keyframes edgeFlicker {
                    0%, 100% { opacity: 0.4; }
                    12% { opacity: 0.9; }
                    27% { opacity: 0.35; }
                    41% { opacity: 0.95; }
                    63% { opacity: 0.5; }
                    80% { opacity: 0.85; }
                  }

                  .bot-fire-card {
                    animation: heatPulse 2.5s infinite ease-in-out;
                    will-change: box-shadow;
                  }

                  .bot-fire-bg {
                    background: linear-gradient(115deg, #dc2626 0%, #ea580c 25%, #f97316 50%, #f59e0b 75%, #fde047 100%);
                    background-size: 300% 300%;
                    animation: fireFlow 6.5s ease-in-out infinite;
                    will-change: background-position;
                  }

                  .bot-fire-edge {
                    box-shadow: inset 0 3px 12px rgba(255, 255, 255, 0.6), inset 0 -3px 12px rgba(220, 38, 38, 0.8);
                    animation: edgeFlicker 1.8s infinite linear;
                    will-change: opacity;
                  }

                  .bot-flame-blob-1 {
                    background: radial-gradient(circle, rgba(253,224,71,0.85) 0%, rgba(249,115,22,0.6) 50%, transparent 80%);
                    filter: blur(14px);
                    mix-blend-mode: overlay;
                    animation: flameRise 3.2s infinite ease-in-out;
                    will-change: transform, opacity;
                  }

                  .bot-flame-blob-2 {
                    background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,146,60,0.7) 45%, transparent 75%);
                    filter: blur(16px);
                    mix-blend-mode: screen;
                    animation: flameRise 4.5s infinite ease-in-out 0.6s;
                    will-change: transform, opacity;
                  }

                  .bot-flame-blob-3 {
                    background: radial-gradient(circle, rgba(253,224,71,0.8) 0%, rgba(234,88,12,0.65) 55%, transparent 80%);
                    filter: blur(14px);
                    mix-blend-mode: overlay;
                    animation: flameRise 5.2s infinite ease-in-out 1.2s;
                    will-change: transform, opacity;
                  }

                  .bot-ember-1 { animation: emberFloat 2.8s infinite ease-out 0.1s; will-change: transform, opacity; }
                  .bot-ember-2 { animation: emberFloat 3.6s infinite ease-out 0.7s; will-change: transform, opacity; }
                  .bot-ember-3 { animation: emberFloat 2.4s infinite ease-out 1.3s; will-change: transform, opacity; }
                  .bot-ember-4 { animation: emberFloat 4.1s infinite ease-out 0.4s; will-change: transform, opacity; }
                  .bot-ember-5 { animation: emberFloat 3.1s infinite ease-out 1.8s; will-change: transform, opacity; }
                  .bot-ember-6 { animation: emberFloat 2.6s infinite ease-out 0.9s; will-change: transform, opacity; }

                  @media (prefers-reduced-motion: reduce) {
                    .bot-fire-card {
                      animation: none !important;
                    }
                    .bot-fire-bg {
                      background: linear-gradient(115deg, #ea580c, #f59e0b, #fde047) !important;
                      animation: none !important;
                    }
                    .bot-flame-blob-1, .bot-flame-blob-2, .bot-flame-blob-3,
                    .bot-ember-1, .bot-ember-2, .bot-ember-3, .bot-ember-4, .bot-ember-5, .bot-ember-6,
                    .bot-fire-edge {
                      animation: none !important;
                      display: none !important;
                    }
                  }
                `}</style>

                {/* Fire Effect Background Container (z-0) */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                  <div className="absolute inset-0 bot-fire-bg" />
                  <div className="absolute inset-0 bot-fire-edge" />
                  <div className="absolute -bottom-8 left-[10%] w-48 h-36 rounded-full bot-flame-blob-1" />
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full bot-flame-blob-2" />
                  <div className="absolute -bottom-8 right-[10%] w-52 h-36 rounded-full bot-flame-blob-3" />

                  <div className="absolute bottom-1 left-[12%] w-1.5 h-1.5 rounded-full bg-amber-200 bot-ember-1" />
                  <div className="absolute bottom-2 left-[28%] w-1 h-1 rounded-full bg-yellow-300 bot-ember-2" />
                  <div className="absolute bottom-1 left-[45%] w-2 h-2 rounded-full bg-orange-300 bot-ember-3" />
                  <div className="absolute bottom-2 left-[62%] w-1.5 h-1.5 rounded-full bg-amber-300 bot-ember-4" />
                  <div className="absolute bottom-1 left-[78%] w-1 h-1 rounded-full bg-yellow-200 bot-ember-5" />
                  <div className="absolute bottom-2 left-[90%] w-2 h-2 rounded-full bg-orange-400 bot-ember-6" />
                </div>

                {/* Card Content & Text (z-10) */}
                <div className="flex items-center gap-3.5 relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-amber-400 shrink-0 shadow-[2px_2px_0px_#000]">
                    <CyberSkull size={28} className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black uppercase text-black">Play vs Grandmaster Bot</h3>
                      <span className="text-[10px] px-1.5 py-0.5 bg-black text-amber-400 font-black uppercase shadow-sm">
                        Instant
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inner Action Buttons (z-10) */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10 lg:mt-auto">
                  <button
                    type="button"
                    onClick={onOpenClassicBotModal || onOpenBotModal}
                    className="py-2 px-3.5 bg-neutral-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center cursor-pointer transition-transform duration-75 active:scale-95"
                    title="Play Traditional Chess (No Prince)"
                  >
                    <span className="leading-tight">Play Normal Chess</span>
                    <span className="text-[9px] font-bold text-amber-300 lowercase tracking-normal leading-tight">
                      without prince
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenBotModal}
                    className="py-3 px-5 bg-black hover:bg-neutral-900 text-amber-400 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer transition-transform duration-75 active:scale-95"
                  >
                    <Swords className="w-4 h-4" />
                    Play vs Bot
                  </button>
                </div>
              </div>

              {/* NEW: Instant Grandmaster Bot with Crafted Pieces Challenge Card (Navy Blue Background) */}
              <div className="order-7 lg:order-none bg-[#0f172a] text-white border-4 border-black dark:border-white p-4 sm:p-5 shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 min-w-0">
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

                <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                  <button
                    onClick={onOpenCraftedBotModal || onOpenBotModal}
                    className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Swords className="w-4 h-4" />
                    Play vs Bot (Crafted)
                  </button>
                </div>
              </div>

              {/* Craft Theory Catalog Button Card (Solid White, Highlighted) */}
              <div className="order-8 lg:order-none bg-white text-black border-4 border-black dark:border-white p-4 sm:p-5 shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 min-w-0">
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

                <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                  <button
                    onClick={onOpenCraftTheory}
                    className="py-3 px-5 bg-white hover:bg-neutral-100 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <BookOpen className="w-4 h-4 text-black" />
                    Craft Theory
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Column 2 (Right Column) */}
            <div className="contents lg:flex lg:flex-col lg:gap-4">
              {/* Secret Players Arena Launcher Card (Square Aspect) */}
              <div 
                className="order-5 lg:order-none relative overflow-hidden bg-cover bg-center border-4 border-neutral-300 p-4 sm:p-5 shadow-[6px_6px_0px_#ffffff] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col justify-between gap-4 active:scale-98 transition-all min-w-0 aspect-square"
                style={{ backgroundImage: "url('/assets/aistudio/image_ba67a0d0.png')" }}
              >
                {/* Vignette radial overlay: circular dark edges, clear bright center */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.85)_95%)] z-0 pointer-events-none" />

                <div className="flex items-center gap-3.5 relative z-10 bg-black/75 p-3 border border-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-black border-2 border-white flex items-center justify-center text-amber-400 shrink-0 shadow-[2px_2px_0px_#000] relative">
                    <Lock className="w-6 h-6 text-amber-400" />
                    <Sparkles className="w-3.5 h-3.5 text-white absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black uppercase text-white drop-shadow-md">
                        Play Against Secret Players
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 bg-black text-amber-400 font-black uppercase border border-amber-400 flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        SECURED ACCESS
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">
                      Challenge passcode-protected custom bots (Boyfriend Bot, Girlfriend Bot & War Bot) with sweet Bengali dialogue & tactical personalities!
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                  <button
                    onClick={() => setIsSecretArenaOpen(true)}
                    className="py-3 px-5 bg-white hover:bg-neutral-100 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer relative z-10"
                  >
                    <Lock className="w-4 h-4 text-black" />
                    SECRET ARENA
                  </button>
                </div>
              </div>

              {/* Jujutsu Kaisen Culling Game Mode Challenge Card (Square Aspect, Sukuna Background, Right below Secret Arena on Desktop, 4th Position Vertically on Mobile) */}
              <div 
                className="order-4 lg:order-none relative overflow-hidden bg-cover bg-center border-4 border-red-600 p-4 sm:p-5 shadow-[6px_6px_0px_#8b0000] flex flex-col justify-between gap-4 active:scale-98 transition-all min-w-0 aspect-square"
                style={{ backgroundImage: "url('/assets/aistudio/image_9087d774.png')" }}
              >
                {/* Vignette radial overlay: circular dark edges, clear bright center */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_95%)] z-0 pointer-events-none" />

                <div className="flex items-center gap-3.5 relative z-10 bg-black/80 p-3 border border-red-500/40 backdrop-blur-sm rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-red-600 border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#000]">
                    <Swords className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black uppercase text-red-400 drop-shadow">
                        Play Culling Game Mode (Jujutsu Kaisen)
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-600 text-white font-black uppercase shadow-sm">
                        88 Cross Squares
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                  <button
                    onClick={() => setIsCullingOpen(true)}
                    className="py-3 px-5 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer relative z-10"
                  >
                    <Swords className="w-4 h-4" />
                    ⚔️ CULLING MODE
                  </button>
                </div>
              </div>

              {/* 3D Annihilatic Chess Arcade Entry Card (Desktop Right Column & Mobile before Rose Paradise) */}
              <div className="order-5 lg:order-none min-w-0">
                <Chess3dEntryCard onOpen={() => setIs3dPreviewModalOpen(true)} />
              </div>

              {/* Rose Paradise Entry Button Card */}
              <div className="order-6 lg:order-none min-w-0">
                <RoseParadiseEntryButton onClick={onOpenRose || (() => {})} />
              </div>
            </div>
          </div>

          {/* Active / Ongoing Matches Section */}
          <section id="matches" className="scroll-mt-16">
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
          <section id="players" className="scroll-mt-16">
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
                          onClick={() => setChallengeModalTarget({ id: p.id, name: p.displayName })}
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

      {/* Fixed Bottom Tab Bar (Mobile only, md:hidden) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 supports-[backdrop-filter]:bg-zinc-950/80 supports-[backdrop-filter]:backdrop-blur-xl border-t border-white/10 text-white pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
          {/* Tab 1: Play */}
          <button
            type="button"
            onClick={() => scrollToSection('modes', 'play')}
            aria-label="Jump to Play Game Modes"
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeBottomTab === 'play' ? 'text-amber-400 font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Swords className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-tight">Play</span>
          </button>

          {/* Tab 2: Matches */}
          <button
            type="button"
            onClick={() => scrollToSection('matches', 'matches')}
            aria-label="Jump to Active Matches"
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer relative ${
              activeBottomTab === 'matches' ? 'text-amber-400 font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Play className="w-5 h-5" />
              {ongoingMatches.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-mono font-black rounded-full leading-tight">
                  {ongoingMatches.length}
                </span>
              )}
            </div>
            <span className="text-[11px] uppercase tracking-tight">Matches</span>
          </button>

          {/* Tab 3: Players */}
          <button
            type="button"
            onClick={() => scrollToSection('players', 'players')}
            aria-label="Jump to Find Players"
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeBottomTab === 'players' ? 'text-amber-400 font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-tight">Players</span>
          </button>

          {/* Tab 4: Hashira Dojo */}
          <button
            type="button"
            onClick={() => onOpenHashiraTraining && onOpenHashiraTraining('thukuna')}
            aria-label="Open Hashira Dojo"
            className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-[11px] uppercase tracking-tight">Hashira</span>
          </button>

          {/* Tab 5: Trophy Room */}
          <button
            type="button"
            onClick={() => setIsTrophyRoomOpen(true)}
            aria-label="Open Trophy Room"
            className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer relative"
          >
            <div className="relative">
              <Trophy className="w-5 h-5 text-amber-400" />
              {predictorState.earnedCards.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 bg-amber-400 text-black text-[9px] font-mono font-black rounded-full leading-tight">
                  {predictorState.earnedCards.length}
                </span>
              )}
            </div>
            <span className="text-[11px] uppercase tracking-tight">Trophies</span>
          </button>
        </div>
      </nav>

      {/* Mobile Profile Bottom Sheet Drawer (Mobile only, md:hidden) */}
      {isMobileProfileOpen && (
        <>
          {/* Dark Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/75 supports-[backdrop-filter]:backdrop-blur-sm transition-opacity"
            onClick={() => {
              setIsMobileProfileOpen(false);
              profilePillRef.current?.focus();
            }}
          />

          {/* Sheet Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Player Profile and Statistics"
            className="md:hidden fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto overscroll-contain bg-zinc-950 border-t-2 border-amber-400 rounded-t-3xl shadow-2xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-white animate-in slide-in-from-bottom duration-200"
          >
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-4" />

            {/* Profile Drawer Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="border-2 border-amber-400 p-0.5 bg-neutral-900 rounded-lg">
                  <AvatarDisplay avatarId={user.avatarId} size="lg" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">{user.displayName}</h3>
                  <p className="text-xs text-neutral-400 font-mono">@{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditName(user.displayName);
                    setEditAvatar(user.avatarId);
                    setIsEditingProfile(!isEditingProfile);
                  }}
                  className="text-xs font-black uppercase px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10 cursor-pointer min-h-[44px] flex items-center justify-center active:scale-95"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit'}
                </button>
                <button
                  ref={sheetCloseRef}
                  type="button"
                  onClick={() => {
                    setIsMobileProfileOpen(false);
                    profilePillRef.current?.focus();
                  }}
                  aria-label="Close Profile"
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white border border-white/10 cursor-pointer active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Edit Mode Form or Stats Grid */}
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="pt-3 border-t border-white/10 flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-neutral-300">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/20 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1.5 text-neutral-300">Avatar</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.id)}
                        className={`p-1 border rounded-lg flex justify-center cursor-pointer ${
                          editAvatar === av.id ? 'bg-amber-400 border-amber-300' : 'border-white/10 opacity-60'
                        }`}
                      >
                        <AvatarDisplay avatarId={av.id} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-2 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-xl border border-black cursor-pointer shadow-md active:scale-98"
                >
                  Save Profile
                </button>
              </form>
            ) : (
              <div className="space-y-3 font-mono">
                {/* Predicted Skill Rating ELO Badge */}
                <div className="p-3 bg-amber-400 text-black rounded-xl border border-amber-300 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider block text-black/80">Predicted Rating</span>
                    <span className="text-2xl font-black font-mono leading-none">{predictorState.currentRating} ELO</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-black text-amber-300 rounded font-sans">
                    Live Session
                  </span>
                </div>

                {/* Session Wins, Losses, Draws Grid */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="bg-neutral-900 p-2.5 rounded-xl border border-white/10">
                    <span className="text-xl font-black text-emerald-400 block">
                      {(user.stats?.wins || 0) + predictorState.wins}
                    </span>
                    <p className="text-[10px] font-black uppercase text-neutral-400 mt-0.5 font-sans">Wins</p>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded-xl border border-white/10">
                    <span className="text-xl font-black text-white block">
                      {(user.stats?.losses || 0) + predictorState.losses}
                    </span>
                    <p className="text-[10px] font-black uppercase text-neutral-400 mt-0.5 font-sans">Losses</p>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded-xl border border-white/10">
                    <span className="text-xl font-black text-amber-400 block">
                      {(user.stats?.draws || 0) + predictorState.draws}
                    </span>
                    <p className="text-[10px] font-black uppercase text-neutral-400 mt-0.5 font-sans">Draws</p>
                  </div>
                </div>

                {/* Quick Trophy Room Launcher */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileProfileOpen(false);
                    setIsTrophyRoomOpen(true);
                  }}
                  className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-amber-300 font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer min-h-[44px] active:scale-98 transition-colors font-sans"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>View Session Trophy Room ({predictorState.earnedCards.length})</span>
                </button>

                {/* Sign Out Button (Separated) */}
                <div className="pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      clearPredictorSession();
                      logout();
                    }}
                    className="w-full py-2.5 px-4 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px] active:scale-98 font-sans"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <TrophyRoomModal
        isOpen={isTrophyRoomOpen}
        onClose={() => setIsTrophyRoomOpen(false)}
      />

      <SecretArenaModal
        isOpen={isSecretArenaOpen}
        onClose={() => setIsSecretArenaOpen(false)}
        onStartSecretMatch={(bot) => {
          setIsSecretArenaOpen(false);
          onStartSecretMatch && onStartSecretMatch(bot);
        }}
      />

      <MultiplayerChallengeModal
        isOpen={Boolean(challengeModalTarget)}
        onClose={() => setChallengeModalTarget(null)}
        targetPlayer={challengeModalTarget}
        onSendChallenge={(targetUserId, timeControl, moveSuggestions, craftingAllowed, pieceTheme, gameMode, expansionDisabled) => {
          sendChallenge(targetUserId, timeControl, moveSuggestions, craftingAllowed, pieceTheme, gameMode, expansionDisabled);
          setSentNotice(
            `Challenge (${gameMode === 'classic' ? 'Traditional' : gameMode === 'crafted' ? 'Crafted' : 'Mugen'}, ${timeControl === 120 ? '2m' : '5m'}) sent to ${challengeModalTarget?.name}!`
          );
          setTimeout(() => setSentNotice(null), 4000);
          setTimeout(refreshUserData, 500);
        }}
      />

      <AboutGameModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <AllGameModesModal
        isOpen={isAllGameModesOpen}
        onClose={() => setIsAllGameModesOpen(false)}
        onOpenHashiraTraining={() => onOpenHashiraTraining && onOpenHashiraTraining('thukuna')}
        onOpenPunisher={onOpenPunisher}
        onOpenBotModal={onOpenBotModal}
        onOpenClassicBotModal={onOpenClassicBotModal || onOpenBotModal}
        onOpenCraftedBotModal={onOpenCraftedBotModal || onOpenBotModal}
        onOpenSecretArena={() => setIsSecretArenaOpen(true)}
        onOpenCulling={() => setIsCullingOpen(true)}
        onOpenRose={onOpenRose}
        onOpen3dChess={() => setIs3dPreviewModalOpen(true)}
        onOpenCraftTheory={onOpenCraftTheory}
        onJumpToMultiplayer={() => {
          const el = document.getElementById('players') || document.getElementById('matches');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Mobile Walk with Masters Modal */}
      {isWalkWithMastersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Walk with Masters"
          onClick={() => setIsWalkWithMastersOpen(false)}
        >
          <div
            className="w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <WalkWithMastersCard
              onOpenHashiraTraining={onOpenHashiraTraining}
              onClose={() => setIsWalkWithMastersOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* 3D Annihilatic Chess Arcade Rules Preview & Launch Modal */}
      <Chess3dRulesPreviewModal
        isOpen={is3dPreviewModalOpen}
        onClose={() => setIs3dPreviewModalOpen(false)}
        onStartBotMatch={(botId, playerTeam) => {
          setIs3dPreviewModalOpen(false);
          onStart3dMatch?.({ botId, playerTeam });
        }}
        onStartMultiplayerMatch={(roomCode, timeControl, team) => {
          setIs3dPreviewModalOpen(false);
          onStart3dMatch?.({ roomCode, timeControl, playerTeam: team });
        }}
      />
    </div>
  );
};
