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
  LayoutGrid,
  ShoppingBag,
  Download,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { posToNotation } from '../game/engine';
import { usePredictor } from '../predictor/PredictorContext';
import { TrophyRoomModal } from './TrophyRoomModal';
import { MugenGemStore, StoreTab } from '../economy/MugenGemStore';
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
import { CraftGameHub } from '../craftgame/CraftGameHub';
import { MusicButton } from './MusicButton';
import bannerHeroImage from '../assets/banner-hero.png';
import { PassTicketGraphic } from '../economy/PassTicketGraphic';
import { ChromeReaper } from '../punisher/ChessBotFaces_with_Gestures';
import type { PunisherBotId } from '../punisher/punisherBot';
import type { Team as Team3D, TimeControl3D } from '../chess3d/types';

export type NavigationOrigin =
  | { type: 'store'; initialTab: StoreTab }
  | { type: 'all_modes' }
  | null;

interface DashboardProps {
  onExitPreGameViews?: () => void;
  onOpenRules: () => void;
  onOpenBotModal: () => void;
  onOpenClassicBotModal?: () => void;
  onOpenCraftedBotModal?: () => void;
  onOpenCraftTheory: () => void;
  onOpenRose?: () => void;
  onOpenHeroDuel?: () => void;
  onOpenHashiraTraining?: (trainerId?: TrainerId) => void;
  onOpenPunisher?: (botId?: PunisherBotId) => void;
  onStartLeagueBotMatch?: (botId: PunisherBotId) => void;
  onStartSecretMatch?: (botConfig: SecretPlayerConfig) => void;
  onStart3dMatch?: (params: {
    botId?: PunisherBotId;
    playerTeam?: Team3D;
    timeControl?: TimeControl3D;
    roomCode?: string;
  }) => void;
  lastCompletedMatch?: { match: MatchState; completedAt: number } | null;
  onClearLastGame?: () => void;
  initialSecretArenaOpen?: boolean;
  onClearInitialSecretArena?: () => void;
}

const BANNER_IMAGES = [
  '/assets/aistudio/image_8cc24db1.png',
  '/assets/aistudio/image_d336b87f.png',
] as const;

interface DropupThumbProps {
  src?: string;
  alt: string;
  label: string;
  fallbackIcon: React.ReactNode;
  fallbackBgClass: string;
}

const DropupThumb: React.FC<DropupThumbProps> = ({
  src,
  alt,
  label,
  fallbackIcon,
  fallbackBgClass,
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="play-dropup-thumb w-full h-full object-cover object-center rounded-[10px] select-none transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className={`w-full h-full flex flex-col items-center justify-center rounded-[10px] pb-3 ${fallbackBgClass}`}>
          {fallbackIcon}
        </div>
      )}

      {/* Smooth dark gradient covering bottom 45% of the square fading to transparent at top */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-10" />

      {/* White semi-bold text floating fixedly over the bottom portion of the fade */}
      <span className="absolute bottom-1.5 inset-x-1 z-20 text-center text-white font-semibold text-[10px] sm:text-[11px] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate px-0.5 select-none">
        {label}
      </span>
    </>
  );
};

const Chessboard3x3Icon: React.FC<{ className?: string; active?: boolean }> = ({
  className = 'w-5 h-5',
  active = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer Rounded Board Border */}
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="3.5"
      className={active ? 'stroke-red-500 fill-black/60' : 'stroke-zinc-400 fill-black/60'}
      strokeWidth="1.6"
    />
    {/* 3x3 Checkered Chessboard Grid */}
    {/* Row 1 */}
    <rect x="3.6" y="3.6" width="5.1" height="5.1" rx="1" fill={active ? '#ef4444' : '#f59e0b'} />
    <rect x="9.45" y="3.6" width="5.1" height="5.1" rx="1" fill="#18181b" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
    <rect x="15.3" y="3.6" width="5.1" height="5.1" rx="1" fill={active ? '#ef4444' : '#f59e0b'} />

    {/* Row 2 */}
    <rect x="3.6" y="9.45" width="5.1" height="5.1" rx="1" fill="#18181b" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
    <rect x="9.45" y="9.45" width="5.1" height="5.1" rx="1" fill={active ? '#ef4444' : '#f59e0b'} />
    <rect x="15.3" y="9.45" width="5.1" height="5.1" rx="1" fill="#18181b" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />

    {/* Row 3 */}
    <rect x="3.6" y="15.3" width="5.1" height="5.1" rx="1" fill={active ? '#ef4444' : '#f59e0b'} />
    <rect x="9.45" y="15.3" width="5.1" height="5.1" rx="1" fill="#18181b" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
    <rect x="15.3" y="15.3" width="5.1" height="5.1" rx="1" fill={active ? '#ef4444' : '#f59e0b'} />
  </svg>
);

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenRules,
  onOpenBotModal,
  onOpenClassicBotModal,
  onOpenCraftedBotModal,
  onOpenCraftTheory,
  onOpenRose,
  onOpenHeroDuel,
  onOpenHashiraTraining,
  onOpenPunisher,
  onStartLeagueBotMatch,
  onExitPreGameViews,
  onStartSecretMatch,
  onStart3dMatch,
  lastCompletedMatch,
  onClearLastGame,
  initialSecretArenaOpen,
  onClearInitialSecretArena,
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

  const { state: predictorState, clearPredictorSession, applyRatingBoost } = usePredictor();
  const { isInstallable, install } = usePWAInstall();
  const [isTrophyRoomOpen, setIsTrophyRoomOpen] = useState(false);
  const [trophyRoomMainView, setTrophyRoomMainView] = useState<'trophies' | 'league' | 'journey' | 'inventory' | 'mugenpass'>('trophies');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [storeInitialTab, setStoreInitialTab] = useState<StoreTab>('ore_conversion');
  const [secretArenaOrigin, setSecretArenaOrigin] = useState<NavigationOrigin>(() => {
    try {
      const stored = sessionStorage.getItem('mugen_secret_arena_origin');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const updateSecretArenaOrigin = (origin: NavigationOrigin) => {
    setSecretArenaOrigin(origin);
    try {
      if (origin) {
        sessionStorage.setItem('mugen_secret_arena_origin', JSON.stringify(origin));
      } else {
        sessionStorage.removeItem('mugen_secret_arena_origin');
      }
    } catch {}
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [activeMatches, setActiveMatches] = useState<MatchState[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<Challenge[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatarId || 'avatar_prince');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.displayName || '');
      setEditAvatar(user.avatarId || 'avatar_prince');
      setEditBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (initialSecretArenaOpen) {
      setIsSecretArenaOpen(true);
      onClearInitialSecretArena?.();
    }
  }, [initialSecretArenaOpen, onClearInitialSecretArena]);

  useEffect(() => {
    const handleOpenPunisherBot = (e: Event) => {
      const custom = e as CustomEvent;
      const botId = custom.detail?.botId;
      setIsTrophyRoomOpen(false);
      if (onOpenPunisher) {
        onOpenPunisher(botId);
      }
    };

    const handleOpenLeagueBotMatch = (e: Event) => {
      const custom = e as CustomEvent;
      const botId = custom.detail?.botId;
      setIsTrophyRoomOpen(false);
      if (onStartLeagueBotMatch && botId) {
        onStartLeagueBotMatch(botId);
      }
    };

    const handleOpenPlayerChallenge = (e: Event) => {
      const custom = e as CustomEvent;
      const target = custom.detail?.targetPlayer;
      setIsTrophyRoomOpen(false);
      if (target) {
        setChallengeModalTarget(target);
      }
    };

    const handleOpenMultiplayerChallenge = () => {
      setIsTrophyRoomOpen(false);
      // Smoothly scroll down to the online players arena rather than opening the modes tab
      const el = document.getElementById('players') || document.getElementById('matches');
      el?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleOpenLeagueTab = () => {
      setTrophyRoomMainView('league');
      setIsTrophyRoomOpen(true);
    };

    const handleOpenMugenPassTab = () => {
      setTrophyRoomMainView('mugenpass');
      setIsTrophyRoomOpen(true);
    };

    const handleOpenJourneyTab = () => {
      setTrophyRoomMainView('journey');
      setIsTrophyRoomOpen(true);
    };

    const handleToastNotice = (e: Event) => {
      const custom = e as CustomEvent;
      const msg = custom.detail?.message;
      if (msg) {
        setSentNotice(msg);
        setTimeout(() => setSentNotice(null), 5000);
      }
    };

    window.addEventListener('open_punisher_bot', handleOpenPunisherBot);
    window.addEventListener('open_league_bot_match', handleOpenLeagueBotMatch);
    window.addEventListener('open_player_challenge', handleOpenPlayerChallenge);
    window.addEventListener('open_multiplayer_challenge', handleOpenMultiplayerChallenge);
    window.addEventListener('open_league_tab', handleOpenLeagueTab);
    window.addEventListener('open_mugenpass_tab', handleOpenMugenPassTab);
    window.addEventListener('open_journey_tab', handleOpenJourneyTab);
    window.addEventListener('app_toast_notice', handleToastNotice);
    return () => {
      window.removeEventListener('open_punisher_bot', handleOpenPunisherBot);
      window.removeEventListener('open_league_bot_match', handleOpenLeagueBotMatch);
      window.removeEventListener('open_player_challenge', handleOpenPlayerChallenge);
      window.removeEventListener('open_multiplayer_challenge', handleOpenMultiplayerChallenge);
      window.removeEventListener('open_league_tab', handleOpenLeagueTab);
      window.removeEventListener('open_mugenpass_tab', handleOpenMugenPassTab);
      window.removeEventListener('open_journey_tab', handleOpenJourneyTab);
      window.removeEventListener('app_toast_notice', handleToastNotice);
    };
  }, [onOpenPunisher, onStartLeagueBotMatch]);

  const [isCullingOpen, setIsCullingOpen] = useState(false);
  const [isCullingMatchActive, setIsCullingMatchActive] = useState(false);
  const [isSecretArenaOpen, setIsSecretArenaOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAllGameModesOpen, setIsAllGameModesOpen] = useState(false);
  const [isEndlessSpringOpen, setIsEndlessSpringOpen] = useState(false);
  const [challengeModalTarget, setChallengeModalTarget] = useState<{ id: string; name: string } | null>(null);
  const [isWalkWithMastersOpen, setIsWalkWithMastersOpen] = useState(false);
  const [is3dPreviewModalOpen, setIs3dPreviewModalOpen] = useState(false);
  const [isCraftGameHubOpen, setIsCraftGameHubOpen] = useState(false);

  // Mobile navigation & bottom sheet states
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isMobileNavDropdownOpen, setIsMobileNavDropdownOpen] = useState(false);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'play' | 'matches' | 'players' | 'store' | 'hashira' | 'trophies' | 'culling' | 'modes' | 'profile' | null>(null);

  const isNavigatingRef = useRef(false);

  const handleCloseAllPreGameViews = () => {
    setIsCullingOpen(false);
    setIsSecretArenaOpen(false);
    setIs3dPreviewModalOpen(false);
    setIsAllGameModesOpen(false);
    setIsStoreOpen(false);
    setIsCraftGameHubOpen(false);
    setChallengeModalTarget(null);
    setIsWalkWithMastersOpen(false);
    setIsMobileNavDropdownOpen(false);
    setIsMobileProfileOpen(false);
    setIsTrophyRoomOpen(false);
    setIsAboutOpen(false);
    setActiveBottomTab(null);
    updateSecretArenaOrigin(null);
    setStoreInitialTab('ore_conversion');
    onExitPreGameViews?.();
  };

  // Single-source-of-truth active tab in bottom navigation bar (strictly mutually exclusive)
  const getActiveTab = (): 'modes' | 'store' | 'play' | 'hashira' | 'trophies' | null => {
    if (isMobileNavDropdownOpen) return 'play';
    if (isStoreOpen) return 'store';
    if (isTrophyRoomOpen) return 'trophies';
    if (isWalkWithMastersOpen) return 'hashira';
    if (isAllGameModesOpen) return 'modes';
    if (isCullingOpen) return 'modes';
    if (isMobileProfileOpen) return null;
    if (activeBottomTab === 'store') return 'store';
    if (activeBottomTab === 'hashira') return 'hashira';
    if (activeBottomTab === 'trophies') return 'trophies';
    if (activeBottomTab === 'play') return 'play';
    if (activeBottomTab === 'modes') return 'modes';
    return null;
  };

  const currentActiveTab = getActiveTab();

  // Clean play menu toggle handler that closes all other views without race conditions
  const togglePlayMenu = () => {
    const wasOpen = isMobileNavDropdownOpen;
    handleCloseAllPreGameViews();
    if (!wasOpen) {
      setIsMobileNavDropdownOpen(true);
      setActiveBottomTab('play');
    } else {
      setActiveBottomTab('modes');
    }
  };

  // Central mobile-only navigation orchestrator (additive, no desktop changes)
  const navigateMobile = (
    tab: 'play' | 'store' | 'hashira' | 'trophies' | 'culling' | 'rules' | 'profile' | 'modes',
    action: () => void,
    hashName?: string
  ) => {
    // Desktop guard: on desktop (>=768px), execute action directly without mobile tab state changes
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      action();
      return;
    }

    // Debounce rapid double-taps
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 150);

    // Optional subtle touch feedback
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {}

    // Close all open overlays, modals, and the PLAY drop-up menu
    handleCloseAllPreGameViews();

    // Set bottom tab active highlight
    if (tab === 'store' || tab === 'hashira' || tab === 'trophies' || tab === 'culling' || tab === 'play' || tab === 'modes' || tab === 'profile') {
      setActiveBottomTab(tab);
    }

    // Execute target action
    action();

    // Push/replace history entry for native mobile back button support
    if (hashName && typeof window !== 'undefined') {
      const targetHash = `#${hashName}`;
      if (window.location.hash !== targetHash) {
        if (window.location.hash) {
          window.history.replaceState(null, '', targetHash);
        } else {
          window.history.pushState(null, '', targetHash);
        }
      }
    }
  };

  // Mobile popstate listener for device Back button / swipe-back
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;

    const handlePopState = () => {
      if (
        isStoreOpen ||
        isTrophyRoomOpen ||
        isCullingOpen ||
        isMobileProfileOpen ||
        isMobileNavDropdownOpen ||
        is3dPreviewModalOpen ||
        isAboutOpen ||
        isAllGameModesOpen ||
        isWalkWithMastersOpen
      ) {
        handleCloseAllPreGameViews();
        setActiveBottomTab('play');
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isStoreOpen,
    isTrophyRoomOpen,
    isCullingOpen,
    isMobileProfileOpen,
    isMobileNavDropdownOpen,
    is3dPreviewModalOpen,
    isAboutOpen,
    isAllGameModesOpen,
    isWalkWithMastersOpen,
  ]);

  // Lock body scroll when mobile modal/overlay is active and unlock on close
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;
    const isAnyOpen =
      isStoreOpen ||
      isTrophyRoomOpen ||
      isMobileProfileOpen ||
      isAboutOpen ||
      isAllGameModesOpen ||
      is3dPreviewModalOpen ||
      isWalkWithMastersOpen;

    if (isAnyOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    isStoreOpen,
    isTrophyRoomOpen,
    isMobileProfileOpen,
    isAboutOpen,
    isAllGameModesOpen,
    is3dPreviewModalOpen,
    isWalkWithMastersOpen,
  ]);

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
      } catch {
        // Silently handle brief server reconnect / network fetch pause
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
      const matchesTask = fetch('/api/matches', { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json();
            setActiveMatches(data.matches || []);
          }
        })
        .catch(() => {});

      const challengesTask = fetch('/api/challenges', { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const data = await res.json();
            setOutgoingChallenges(data.outgoing || []);
          }
        })
        .catch(() => {});

      await Promise.allSettled([matchesTask, challengesTask]);
    } catch {
      // Gracefully ignore periodic background poll errors during idle/reconnect
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
    await updateProfile(editName, editAvatar, editBio);
    setIsEditingProfile(false);
  };

  if (!user) return null;

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
        {/* Darkened overlay for readability (98% darkness) */}
        <div className="absolute inset-0 bg-black/98 backdrop-brightness-50" />
      </div>

      {isCullingOpen ? (
        <div className="relative z-10 flex-1 min-h-screen">
          <CullingModeEntry
            onBack={() => setIsCullingOpen(false)}
            onMatchActiveChange={setIsCullingMatchActive}
          />
        </div>
      ) : (
        <>
          {/* Redesigned Mobile Top Bar (md:hidden, sticky, h-12, glassmorphic) */}
      <header className="md:hidden flex items-center justify-between px-3 h-12 sticky top-0 z-40 bg-zinc-950/95 supports-[backdrop-filter]:bg-zinc-950/80 supports-[backdrop-filter]:backdrop-blur-xl border-b border-white/10 text-white relative">
        {/* Mobile Brand Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            aria-label="About MugenChessX"
            title="About MugenChessX"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-1 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0 cursor-pointer"
          >
            <OctoSkull size={26} className="text-white hover:text-amber-400 transition-colors shrink-0" />
          </button>
        </div>

        {/* Mobile Top Navigation Action Icons (Borderless clean icon buttons, no square box frames) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Mobile Walk with Masters Button */}
          <button
            type="button"
            onClick={() => navigateMobile('hashira', () => setIsWalkWithMastersOpen(true), 'masters')}
            aria-label="Walk with Masters (Train with Thukuna & Gatoru)"
            title="Walk with Masters"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 text-white cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0 group relative"
          >
            <Flame className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
          </button>

          {/* Music Soundtrack Button */}
          <MusicButton />

          {/* Rules Button */}
          <button
            type="button"
            onClick={() => navigateMobile('rules', onOpenRules, 'rules')}
            aria-label="Open rulebook"
            title="Rules"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 text-white cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
          >
            <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
          </button>

          {/* Culling Mode Launcher Button */}
          <button
            type="button"
            onClick={() => navigateMobile('culling', () => setIsCullingOpen(true), 'culling')}
            aria-label="Play Culling mode"
            title="Culling"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 text-white cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
          >
            <GamepadSkull size={20} className="text-zinc-200 hover:text-white shrink-0" />
          </button>

          {/* Mobile 3D Annihilatic Chess Arcade Button */}
          <button
            type="button"
            onClick={() => navigateMobile('play', () => setIs3dPreviewModalOpen(true), '3d')}
            aria-label="3D Annihilatic Chess Arcade"
            title="3D Chess Arcade"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-purple-950/50 active:bg-purple-900/60 text-purple-400 cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 shrink-0 relative group"
          >
            <Box className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[10px] font-black font-mono px-1 rounded bg-purple-600 text-white leading-none py-0.5">
              3D
            </span>
          </button>

          {/* Mobile Install App Button */}
          {isInstallable && (
            <button
              type="button"
              onClick={install}
              aria-label="Install MugenChessX App"
              title="Install App"
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-1.5 rounded-lg bg-amber-400 text-black cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Download className="w-5 h-5 text-black shrink-0" />
            </button>
          )}

          {/* Mobile Profile Trigger (Circular Avatar Badge, ELO hidden in top bar) */}
          <button
            ref={profilePillRef}
            type="button"
            onClick={() => navigateMobile('profile', () => setIsMobileProfileOpen(true), 'profile')}
            aria-label="Open profile and statistics"
            aria-expanded={isMobileProfileOpen}
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-0.5 rounded-full border-2 border-amber-400 hover:border-amber-300 active:scale-95 transition-all cursor-pointer shrink-0 bg-neutral-900 overflow-hidden shadow-[0_0_8px_rgba(251,191,36,0.25)]"
            style={{ borderRadius: '9999px', WebkitBorderRadius: '9999px' }}
          >
            <AvatarDisplay
              avatarId={user.avatarId}
              size="sm"
              isGuest={Boolean(user.id?.startsWith('usr_guest') || user.username?.toLowerCase().includes('mecharuri'))}
              className="!w-7 !h-7 !p-0 !rounded-full"
            />
          </button>
        </div>
      </header>

      {/* Mobile Quick-Access Game Modes Drop-Up Menu (md:hidden, fiery glass styling, NOT a modal) */}
      {isMobileNavDropdownOpen && (
        <>
          {/* Invisible click-outside dismisser (transparent, covers area above bottom nav) */}
          <div
            className="md:hidden fixed top-0 left-0 right-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[115] bg-transparent"
            onClick={togglePlayMenu}
            aria-hidden="true"
          />

          {/* Drop-up Menu Card smoothly sliding up directly above the PLAY button */}
          <div
            role="menu"
            aria-label="Quick Access Game Modes"
            className="play-dropup-menu md:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] inset-x-3 max-w-sm mx-auto z-[120] flex flex-col"
          >
            {/* Downward pointer caret matching menu surface */}
            <div className="play-dropup-caret" aria-hidden="true" />

            {/* Menu Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] px-1 shrink-0 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-[#ef4216]/20 border border-[#ff7818]/40 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-[#ff9a24]" />
                </div>
                <span className="text-xs font-black text-[#fff8f0] uppercase tracking-wider">
                  Quick Access Modes
                </span>
              </div>
              <button
                type="button"
                onClick={togglePlayMenu}
                className="text-zinc-400 hover:text-white min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                aria-label="Close Modes Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable 3-column grid of quick-access game mode square tiles */}
            <div className="grid grid-cols-3 gap-1.5 max-h-[78vh] overflow-y-auto overscroll-contain pr-0.5 relative z-10">
              {/* Bot Match */}
              <button
                type="button"
                role="menuitem"
                title="Bot Match - Instant AI game"
                aria-label="Bot Match - Instant AI game"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  onOpenBotModal();
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  src="/assets/aistudio/image_53255c02.png"
                  alt="Bot Match"
                  label="Bot Match"
                  fallbackBgClass="bg-amber-400/20 border-amber-400/30"
                  fallbackIcon={<Bot className="w-6 h-6 text-amber-400" />}
                />
              </button>

              {/* Punisher Robot */}
              <button
                type="button"
                role="menuitem"
                title="Punisher AI - Ruthless bots"
                aria-label="Punisher AI - Ruthless bots"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  if (onOpenPunisher) onOpenPunisher();
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  src="/assets/aistudio/image_6c6f27fb.png"
                  alt="Punisher AI"
                  label="Punisher AI"
                  fallbackBgClass="bg-red-500/20 border-red-500/30"
                  fallbackIcon={<Zap className="w-6 h-6 text-red-400 fill-current" />}
                />
              </button>

              {/* Classic Bot */}
              <button
                type="button"
                role="menuitem"
                title="Classic Bot - Traditional chess"
                aria-label="Classic Bot - Traditional chess"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  if (onOpenClassicBotModal) onOpenClassicBotModal();
                  else onOpenBotModal();
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  src="/assets/aistudio/image_80f7eb8b.png"
                  alt="Classic Bot"
                  label="Classic Bot"
                  fallbackBgClass="bg-emerald-500/20 border-emerald-500/30"
                  fallbackIcon={<Swords className="w-6 h-6 text-emerald-400" />}
                />
              </button>

              {/* Crafted Bot */}
              <button
                type="button"
                role="menuitem"
                title="Crafted Bot - Crafting rules"
                aria-label="Crafted Bot - Crafting rules"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  if (onOpenCraftedBotModal) onOpenCraftedBotModal();
                  else onOpenBotModal();
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  src="/assets/aistudio/image_4aa74391.png"
                  alt="Crafted Bot"
                  label="Crafted Bot"
                  fallbackBgClass="bg-emerald-400/20 border-emerald-400/30"
                  fallbackIcon={<Sparkles className="w-6 h-6 text-emerald-300" />}
                />
              </button>

              {/* Culling Game */}
              <button
                type="button"
                role="menuitem"
                title="Culling Game - 88-square arena"
                aria-label="Culling Game - 88-square arena"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  setIsCullingOpen(true);
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  src="/assets/aistudio/image_9087d774.png"
                  alt="Culling Game"
                  label="Culling Game"
                  fallbackBgClass="bg-[#ef4216]/20 border-[#ff7818]/30"
                  fallbackIcon={<GamepadSkull size={24} className="text-[#ff9a24]" />}
                />
              </button>

              {/* Hashira Training */}
              <button
                type="button"
                role="menuitem"
                title="Hashira Dojo - Train w/ Thukuna"
                aria-label="Hashira Dojo - Train w/ Thukuna"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  if (onOpenHashiraTraining) onOpenHashiraTraining('thukuna');
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  src="/assets/aistudio/image_e0bfff75.png"
                  alt="Hashira Dojo"
                  label="Hashira Dojo"
                  fallbackBgClass="bg-orange-500/20 border-orange-500/30"
                  fallbackIcon={<Crown className="w-6 h-6 text-orange-400" />}
                />
              </button>

              {/* 3D Chess Arcade */}
              <button
                type="button"
                role="menuitem"
                title="3D Arcade - Annihilatic board"
                aria-label="3D Arcade - Annihilatic board"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  setIs3dPreviewModalOpen(true);
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  alt="3D Arcade"
                  label="3D Arcade"
                  fallbackBgClass="bg-purple-950/40 border-purple-500/30"
                  fallbackIcon={<Box className="w-7 h-7 text-purple-400" />}
                />
              </button>

              {/* Rose Paradise */}
              {onOpenRose && (
                <button
                  type="button"
                  role="menuitem"
                  title="Rose Paradise - Multiplayer mode"
                  aria-label="Rose Paradise - Multiplayer mode"
                  onClick={() => {
                    setIsMobileNavDropdownOpen(false);
                    onOpenRose();
                  }}
                  className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
                >
                  <DropupThumb
                    src="/assets/aistudio/image_58fb144c.png"
                    alt="Rose Paradise"
                    label="Rose Paradise"
                    fallbackBgClass="bg-rose-950/40 border-rose-500/30"
                    fallbackIcon={<Heart className="w-7 h-7 text-rose-400 fill-rose-400" />}
                  />
                </button>
              )}

              {/* Hero Duel */}
              {onOpenHeroDuel && (
                <button
                  type="button"
                  role="menuitem"
                  title="Hero Duel - 7x8 Hero Board & Card Collection"
                  aria-label="Hero Duel - 7x8 Hero Board & Card Collection"
                  onClick={() => {
                    setIsMobileNavDropdownOpen(false);
                    onOpenHeroDuel();
                  }}
                  className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
                >
                  <DropupThumb
                    src="/assets/aistudio/image_9466e3bd.png"
                    alt="Hero Duel"
                    label="Hero Duel"
                    fallbackBgClass="bg-amber-500/20 border-amber-500/30"
                    fallbackIcon={<ShieldCheck className="w-7 h-7 text-amber-400" />}
                  />
                </button>
              )}

              {/* Secret Arena */}
              <button
                type="button"
                role="menuitem"
                title="Secret Arena - Hidden bots"
                aria-label="Secret Arena - Hidden bots"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  setIsSecretArenaOpen(true);
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  src="/assets/aistudio/image_ba67a0d0.png"
                  alt="Secret Arena"
                  label="Secret Arena"
                  fallbackBgClass="bg-cyan-500/20 border-cyan-500/30"
                  fallbackIcon={<Lock className="w-6 h-6 text-cyan-400" />}
                />
              </button>

              {/* Rules & Guides */}
              <button
                type="button"
                role="menuitem"
                title="Rulebook - Guides & rules"
                aria-label="Rulebook - Guides & rules"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  onOpenRules();
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  alt="Rulebook"
                  label="Rulebook"
                  fallbackBgClass="bg-amber-950/40 border-amber-400/30"
                  fallbackIcon={<BookOpen className="w-7 h-7 text-amber-400" />}
                />
              </button>

              {/* Trophies & Chests */}
              <button
                type="button"
                role="menuitem"
                title="Trophy Vault - Badges & chests"
                aria-label="Trophy Vault - Badges & chests"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  setIsTrophyRoomOpen(true);
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  src="/assets/aistudio/image_eba86319.png"
                  alt="Trophy Vault"
                  label="Trophy Vault"
                  fallbackBgClass="bg-amber-950/40 border-amber-400/30"
                  fallbackIcon={<Trophy className="w-7 h-7 text-amber-400" />}
                />
                {predictorState.earnedCards.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-mono font-black rounded-full z-20 shadow-md">
                    {predictorState.earnedCards.length}
                  </span>
                )}
              </button>

              {/* All Modes Modal */}
              <button
                type="button"
                role="menuitem"
                title="All Modes - Browse modal"
                aria-label="All Modes - Browse modal"
                onClick={() => {
                  setIsMobileNavDropdownOpen(false);
                  setIsAllGameModesOpen(true);
                }}
                className="play-dropup-item group aspect-square relative w-full h-full p-0 overflow-hidden rounded-[10px] border border-white/15 bg-zinc-950 flex items-center justify-center cursor-pointer select-none"
              >
                <DropupThumb
                  alt="All Modes"
                  label="All Modes"
                  fallbackBgClass="bg-[#ef4216]/20 border-[#ff7818]/30"
                  fallbackIcon={<Play className="w-7 h-7 text-[#ff9a24] fill-[#ff9a24]" />}
                />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Dark Top Bar (hidden md:flex) & Mobile Play Fiery Glass Styling */}
      <style>{`
        /* Mobile PLAY Button Fiery Glass Styling */
        .play-glass-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: transparent;
          overflow: visible;
          filter: drop-shadow(0 4px 10px rgba(255, 76, 18, 0.28))
                  drop-shadow(0 10px 22px rgba(255, 91, 20, 0.22));
          animation: playWrapperBreath 3.2s ease-in-out infinite;
          transition: filter 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .play-glass-wrapper-active {
          filter: drop-shadow(0 4px 14px rgba(255, 45, 115, 0.58))
                  drop-shadow(0 12px 28px rgba(255, 100, 50, 0.45)) !important;
        }

        html body nav button.play-glass-button,
        button.play-glass-button,
        .play-glass-button {
          position: relative;
          width: 52px;
          height: 52px;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(180deg, #0A0808 0%, #100A09 45%, #1A0908 72%, #3B100B 100%);
          background-clip: padding-box;
          border: 1px solid rgba(255, 226, 200, 0.18);
          isolation: isolate;
          overflow: hidden !important;
          -webkit-clip-path: inset(0 round 20px);
          clip-path: inset(0 round 20px);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          box-shadow: 0 4px 12px rgba(255, 76, 18, 0.24),
                      0 10px 24px rgba(255, 91, 20, 0.20),
                      0 18px 34px rgba(255, 104, 24, 0.10),
                      inset 0 1px 1px rgba(255, 255, 255, 0.12);
          animation: playAmbientBreath 3.2s ease-in-out infinite;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, box-shadow 0.2s ease;
        }

        html body nav button.play-glass-button:active,
        button.play-glass-button:active {
          transform: scale(0.90) !important;
        }

        html body nav button.play-glass-button:focus-visible,
        button.play-glass-button:focus-visible {
          outline: none !important;
          border-color: #FF9A24 !important;
        }

        html body nav button.play-glass-button.play-glass-active,
        .play-glass-active {
          border-color: rgba(255, 105, 180, 0.8) !important;
          box-shadow: 0 4px 16px rgba(255, 45, 115, 0.5),
                      0 10px 30px rgba(255, 120, 40, 0.4),
                      0 20px 45px rgba(255, 45, 115, 0.25),
                      inset 0 1px 1px rgba(255, 255, 255, 0.4) !important;
        }

        /* Lower molten-glass inner layer */
        html body nav button.play-glass-button span.play-glass-molten,
        .play-glass-molten {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, transparent 0%, rgba(239,66,22,0.10) 55%, rgba(255,120,24,0.65) 86%, rgba(255,240,204,0.95) 100%);
          opacity: 0.95;
        }

        /* Corner bloom layer */
        html body nav button.play-glass-button span.play-glass-corner-bloom,
        .play-glass-corner-bloom {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at 8% 100%, rgba(239, 66, 22, 0.55) 0%, transparent 45%),
                      radial-gradient(circle at 92% 100%, rgba(239, 66, 22, 0.55) 0%, transparent 45%);
        }

        /* Animated molten flow traveling across lower interior */
        .play-glass-flow {
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 24px;
          background: radial-gradient(ellipse 65% 100% at 50% 100%, rgba(255, 185, 79, 0.5) 0%, rgba(255, 120, 24, 0.6) 40%, rgba(239, 66, 22, 0.35) 75%, transparent 100%);
          filter: blur(4px);
          pointer-events: none;
          animation: playMoltenFlow 4.8s ease-in-out infinite;
        }

        /* Fine bright lower glass rim */
        .play-glass-rim {
          position: absolute;
          bottom: 0;
          left: 14px;
          right: 14px;
          height: 1px;
          background: linear-gradient(90deg, rgba(239,66,22,0.2) 0%, #FF9A24 25%, #FFF0CC 50%, #FF9A24 75%, rgba(239,66,22,0.2) 100%);
          box-shadow: 0 -1px 3px rgba(255, 240, 204, 0.8), 0 0 6px rgba(255, 120, 24, 0.9);
          pointer-events: none;
        }

        /* Top specular reflection */
        .play-glass-specular {
          position: absolute;
          top: 0;
          left: 14px;
          right: 14px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%);
          pointer-events: none;
        }

        /* Diagonal glass gleam sweep */
        html body nav button.play-glass-button span.play-glass-gleam,
        .play-glass-gleam {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .play-glass-gleam::after {
          content: '';
          position: absolute;
          top: -50%;
          bottom: -50%;
          width: 22px;
          background: linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.16) 50%, transparent 100%);
          transform: translateX(-60px) rotate(25deg);
          animation: playGlassGleam 3.8s ease-in-out infinite;
        }

        /* Crisp PLAY Typography */
        .play-glass-label {
          position: relative;
          z-index: 2;
          font-family: inherit;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          line-height: 1;
          color: #FFF8F0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
          pointer-events: none;
        }

        /* Keyframes */
        @keyframes playGlassGleam {
          0% {
            transform: translateX(-60px) rotate(25deg);
            opacity: 0;
          }
          10% {
            opacity: 0.15;
          }
          32% {
            transform: translateX(160px) rotate(25deg);
            opacity: 0.15;
          }
          42%, 100% {
            transform: translateX(160px) rotate(25deg);
            opacity: 0;
          }
        }

        @keyframes playMoltenFlow {
          0% {
            transform: translateX(-24%) scaleX(0.85);
            opacity: 0.8;
          }
          50% {
            transform: translateX(24%) scaleX(1.15);
            opacity: 1;
          }
          100% {
            transform: translateX(-24%) scaleX(0.85);
            opacity: 0.8;
          }
        }

        @keyframes playAmbientBreath {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(255, 76, 18, 0.22),
                        0 8px 20px rgba(255, 91, 20, 0.18),
                        0 16px 30px rgba(255, 104, 24, 0.08),
                        inset 0 1px 1px rgba(255, 255, 255, 0.12);
          }
          50% {
            box-shadow: 0 5px 15px rgba(255, 76, 18, 0.32),
                        0 11px 26px rgba(255, 91, 20, 0.26),
                        0 20px 38px rgba(255, 104, 24, 0.14),
                        inset 0 1px 1px rgba(255, 255, 255, 0.15);
          }
        }

        @keyframes playWrapperBreath {
          0%, 100% {
            filter: drop-shadow(0 4px 10px rgba(255, 76, 18, 0.24))
                    drop-shadow(0 8px 18px rgba(255, 91, 20, 0.18));
          }
          50% {
            filter: drop-shadow(0 5px 14px rgba(255, 76, 18, 0.36))
                    drop-shadow(0 11px 24px rgba(255, 91, 20, 0.28));
          }
        }

        /* Fiery glass drop-up menu */
        .play-dropup-menu {
          background: rgba(10, 8, 8, 0.94);
          backdrop-filter: blur(18px) saturate(125%);
          -webkit-backdrop-filter: blur(18px) saturate(125%);
          border: 1px solid rgba(255, 226, 200, 0.16);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.48),
                      0 5px 20px rgba(255, 76, 18, 0.12),
                      inset 0 1px 0 rgba(255, 255, 255, 0.10);
          padding: 0.75rem;
          color: #FFF8F0;
          animation: playMenuSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden;
          position: fixed;
          left: 0.75rem;
          right: 0.75rem;
          max-width: 24rem;
          margin-left: auto;
          margin-right: auto;
        }

        .play-dropup-menu::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 24px;
          background: linear-gradient(180deg, transparent 0%, rgba(239, 66, 22, 0.08) 60%, rgba(255, 120, 24, 0.18) 100%);
          pointer-events: none;
        }

        .play-dropup-caret {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 12px;
          height: 12px;
          background: #0A0808;
          border-right: 1px solid rgba(255, 226, 200, 0.16);
          border-bottom: 1px solid rgba(255, 226, 200, 0.16);
          pointer-events: none;
        }

        .play-dropup-item {
          min-height: 44px;
          min-width: 44px;
          aspect-ratio: 1 / 1;
          padding: 0;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: border-color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
          color: #FFF8F0;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }

        .play-dropup-item:hover,
        .play-dropup-item:focus-visible {
          border-color: rgba(255, 154, 36, 0.55);
          box-shadow: 0 4px 14px rgba(255, 120, 24, 0.18);
        }

        .play-dropup-item:active {
          border-color: rgba(255, 154, 36, 0.75);
          transform: scale(0.96);
        }

        .play-dropup-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          border-radius: 10px;
          display: block;
          transition: transform 0.25s ease;
        }

        .play-dropup-fallback-badge {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease;
        }

        .play-dropup-item:hover .play-dropup-thumb,
        .play-dropup-item:focus-visible .play-dropup-thumb,
        .play-dropup-item:hover .play-dropup-fallback-badge,
        .play-dropup-item:focus-visible .play-dropup-fallback-badge {
          transform: scale(1.08);
        }

        @keyframes playMenuSlideUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .play-glass-wrapper,
          .play-glass-button {
            animation: none !important;
          }
          .play-glass-gleam::after {
            animation: none !important;
            display: none !important;
          }
          .play-glass-flow {
            animation: none !important;
          }
          .play-dropup-menu {
            animation: none !important;
            transform: translateY(0) !important;
            opacity: 1 !important;
          }
          .play-dropup-item:hover .play-dropup-thumb,
          .play-dropup-item:focus-visible .play-dropup-thumb,
          .play-dropup-item:hover .play-dropup-fallback-badge,
          .play-dropup-item:focus-visible .play-dropup-fallback-badge {
            transform: none !important;
          }
        }

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

          {/* Store */}
          <button
            type="button"
            onClick={() => setIsStoreOpen(true)}
            className="mcx-nav2-item"
            title="Open Mugen Gem Store"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Store</span>
          </button>

          {/* Players */}
          <a
            href="#players"
            className="mcx-nav2-item"
            title="Search online chess players"
          >
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>Players</span>
          </a>

          {/* Hero Duel */}
          {onOpenHeroDuel && (
            <button
              type="button"
              onClick={onOpenHeroDuel}
              className="mcx-nav2-item"
              title="Enter 7x8 Hero Duel Arena"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Hero Duel</span>
            </button>
          )}

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

          {/* Music Soundtrack Button */}
          <MusicButton isDesktop={true} />

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

          {/* Trophies / Career */}
          <button
            type="button"
            onClick={() => setIsTrophyRoomOpen(true)}
            className="mcx-nav2-item"
            title="View trophy room & chest inventory"
          >
            <Trophy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Career</span>
            {predictorState.earnedCards.length > 0 && (
              <span className="mcx-nav2-badge">
                {predictorState.earnedCards.length}
              </span>
            )}
          </button>
        </nav>

        {/* Right Section: Profile & Sign Out */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Desktop PWA Install App Button */}
          {isInstallable && (
            <button
              type="button"
              onClick={install}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md bg-amber-400 text-black hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
              title="Install MugenChessX App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          <div className="mcx-nav2-hairline" />

          {/* Profile Area */}
          <div
            className="mcx-nav2-profile"
            title={`Logged in as ${user.displayName} (@${user.username}) - ${predictorState.currentRating} ELO`}
          >
            <div className="mcx-nav2-avatar">
              <AvatarDisplay avatarId={user.avatarId} isGuest={Boolean(user.id?.startsWith('usr_guest') || user.username?.toLowerCase().includes('mecharuri'))} size="sm" className="!w-full !h-full !p-0" />
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
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:grid lg:grid-cols-12 gap-6 pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)] md:pb-6">

        {/* Mobile Banner */}
        <div 
          onClick={() => setIsAllGameModesOpen(true)}
          className="block md:hidden w-[calc(100%+2rem)] -ml-4 -mr-4 -mt-4 mb-4 border-b-4 border-black relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
        >
          <img
            src={bannerHeroImage}
            alt="MugenChessX"
            className="block w-full h-[138px] sm:h-[156px] object-cover object-center"
          />
          {/* Child 1: Gradient Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent to-black/90 pointer-events-none z-10" />

          {/* Child 2: Text Block */}
          <div className="absolute bottom-0 left-0 pb-3 pl-3 z-20 pointer-events-none">
            <div className="font-light uppercase text-white text-base leading-tight tracking-[0.25em]">
              MUGEN CHESS X
            </div>
            <div className="text-[11px] text-amber-400 uppercase tracking-widest font-bold mt-0.5">
              ALL GAME MODES
            </div>
          </div>
        </div>

        {/* Loose Mode Chips Removed for Mobile: Game modes are cleanly launched via the central PLAY slide-up menu */}

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
          <div className="hidden lg:block w-full aspect-[3/2] relative overflow-hidden border-3 border-black shadow-[5px_5px_0px_#000000] bg-black">
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
          <div className="hidden md:block bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-6 shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="border-2 border-black dark:border-amber-400 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl shrink-0">
                  <AvatarDisplay
                    avatarId={user.avatarId}
                    isGuest={Boolean(user.id?.startsWith('usr_guest') || user.username?.toLowerCase().includes('mecharuri'))}
                    size="lg"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase">{user.displayName}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">@{user.username}</p>
                  {user.bio ? (
                    <p className="text-xs text-neutral-700 dark:text-amber-300/90 font-mono italic mt-1 max-w-xs">
                      "{user.bio}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-neutral-500 font-mono italic mt-1">
                      No description written yet.
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditName(user.displayName);
                  setEditAvatar(user.avatarId);
                  setEditBio(user.bio || '');
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Edit Mode */}
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-t-2 border-black dark:border-white flex flex-col gap-3.5">
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
                  <label className="block text-xs font-black uppercase mb-1">Player Description / Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Write a custom description or motto..."
                    rows={2}
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white text-xs font-mono text-black dark:text-white focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">Choose Avatar</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1.5 border border-neutral-300 dark:border-neutral-800 rounded-lg">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.id)}
                        className={`p-1.5 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                          editAvatar === av.id ? 'bg-amber-400 border-black shadow-[2px_2px_0px_#000] text-black' : 'border-neutral-700 bg-neutral-900/40 opacity-70 hover:opacity-100 text-white'
                        }`}
                        title={av.name}
                      >
                        <AvatarDisplay avatarId={av.id} size="sm" />
                        <span className="text-[9px] font-black uppercase mt-1 truncate w-full text-center leading-none">{av.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
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
          {/* Desktop Banner */}
          <div 
            onClick={() => setIsAllGameModesOpen(true)}
            className="hidden md:block w-full border-4 border-black relative mb-4 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <img
              src={bannerHeroImage}
              alt="MugenChessX"
              className="block w-full h-[156px] object-cover object-center"
            />
            {/* Child 1: Gradient Fade Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent to-black/90 pointer-events-none z-10" />

            {/* Child 2: Text Block */}
            <div className="absolute bottom-0 left-0 pb-3 pl-3 z-20 pointer-events-none">
              <div className="font-light uppercase text-white text-lg leading-tight tracking-[0.25em]">
                MUGEN CHESS X
              </div>
              <div className="text-xs text-amber-400 uppercase tracking-widest font-bold mt-0.5">
                ALL GAME MODES
              </div>
            </div>
          </div>

          {/* Notifications / Errors */}
          {matchError && (
            <div className="bg-red-500 text-white border-3 border-black p-3 text-xs font-black uppercase flex items-center justify-between shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                <span>{matchError}</span>
              </div>
              <button onClick={clearMatchError} aria-label="Dismiss error" className="p-1 hover:bg-black text-white cursor-pointer">
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
              {/* SUMMONER BUTTON: Silver Glass Pill (Border Radius: 7px, Non-Brutalist) */}
              <div className="order-1 lg:order-none block md:hidden w-full">
                <style>{`
                  .glass-pill-summoner {
                    --tint: 217, 217, 217;
                    --base: #141414;
                    --fill-hot: rgba(var(--tint), 0.16);
                    --fill-cold: rgba(var(--tint), 0.02);
                    --border-hot: #d9d9d9;
                    --border-cold: #4a4a4a;
                    --text: #e6e6e6;
                    --icon-bg: #a9a9a9;
                    --icon-fg: #141414;
                    --glow: rgba(var(--tint), 0.12);

                    position: relative;
                    isolation: isolate;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    min-height: 56px;
                    padding: 10px 14px;
                    border: 0;
                    border-radius: 5px !important;
                    font-family: Inter, system-ui, -apple-system, sans-serif;
                    letter-spacing: 0.01em;
                    color: var(--text);
                    cursor: pointer;
                    background:
                      linear-gradient(135deg, var(--fill-hot) 0%, var(--fill-cold) 70%),
                      var(--base);
                    box-shadow:
                      inset 0 1px 0 rgba(255, 255, 255, 0.18),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.45),
                      0 0 14px var(--glow),
                      0 4px 14px rgba(0, 0, 0, 0.5);
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                    user-select: none;
                    overflow: hidden;
                    transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease;
                  }

                  /* gradient border (one-sided light) */
                  .glass-pill-summoner::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    padding: 1px;
                    border-radius: 5px !important;
                    background: linear-gradient(135deg, var(--border-hot) 0%, var(--border-cold) 60%, transparent 100%);
                    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    z-index: 1;
                  }

                  /* sheen sweep */
                  .glass-pill-summoner::after {
                    content: "";
                    position: absolute;
                    top: 0; bottom: 0; left: -60%;
                    width: 40%;
                    background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.22), transparent);
                    transform: skewX(-18deg);
                    opacity: 0;
                    pointer-events: none;
                    z-index: 2;
                  }

                  .glass-pill-summoner .pill__hit {
                    position: absolute;
                    inset: -4px;
                    min-height: 44px;
                    pointer-events: none;
                  }

                  @media (hover: hover) {
                    .glass-pill-summoner:hover {
                      box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, 0.25),
                        0 0 22px var(--glow),
                        0 6px 18px rgba(0, 0, 0, 0.55);
                    }
                    .glass-pill-summoner:hover::after {
                      animation: summonerSheen 0.9s ease forwards;
                    }
                  }

                  .glass-pill-summoner:active {
                    transform: scale(0.96);
                  }

                  .glass-pill-summoner:focus-visible {
                    outline: 2px solid rgba(var(--tint), 0.7);
                    outline-offset: 3px;
                  }

                  @keyframes summonerSheen {
                    0% { left: -60%; opacity: 0; }
                    20% { opacity: 1; }
                    100% { left: 130%; opacity: 0; }
                  }

                  @keyframes summonerBreathe {
                    0%, 100% {
                      box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, 0.18),
                        0 0 10px var(--glow),
                        0 4px 14px rgba(0, 0, 0, 0.5);
                    }
                    50% {
                      box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, 0.18),
                        0 0 22px var(--glow),
                        0 4px 14px rgba(0, 0, 0, 0.5);
                    }
                  }

                  @media (hover: none) {
                    .glass-pill-summoner:active::after {
                      animation: summonerSheen 0.6s ease forwards;
                    }
                    .glass-pill-summoner[data-live="true"] {
                      animation: summonerBreathe 2.8s ease-in-out infinite;
                    }
                  }

                  @media (prefers-reduced-motion: reduce) {
                    .glass-pill-summoner,
                    .glass-pill-summoner::after {
                      animation: none !important;
                      transition: none !important;
                    }
                  }
                `}</style>
                <button
                  type="button"
                  data-live="true"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                      try {
                        navigator.vibrate(8);
                      } catch {
                        // ignore
                      }
                    }
                    onOpenPunisher && onOpenPunisher('chrome-reaper');
                  }}
                  className="glass-pill-summoner group rounded-[5px]"
                  style={{ borderRadius: '5px' }}
                  title="Play against dark and HOT robots - Chrome Reaper"
                >
                  <span className="pill__hit" aria-hidden="true" />
                  {/* Scary Bot Face Icon (No black square behind it) */}
                  <div className="relative shrink-0 flex items-center justify-center bg-transparent border-0 shadow-none p-0">
                    <ChromeReaper size={42} mood="angry" className="bg-transparent text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#a9a9a9] tracking-wider uppercase">
                        SUMMONER · PUNISHER DIRECT
                      </span>
                    </div>
                    <div className="text-[13px] sm:text-sm font-medium text-[#e6e6e6] tracking-[0.01em] truncate leading-tight mt-0.5">
                      Play against dark and HOT robots
                    </div>
                    <div className="text-[11px] text-[#8e8e99] tracking-tight truncate leading-tight mt-0.5">
                      Chrome Reaper & ruthless high-ELO tactical AI
                    </div>
                  </div>
                  <div className="shrink-0 w-7 h-7 rounded-full bg-[#a9a9a9] text-[#141414] flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="7" x2="17" y2="17" />
                      <polyline points="17 7 17 17 7 17" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* EVENT PASS BUTTON: Glassmorphic Event Pass Pill with Half-Cropped Shiny Golden Pass (Mobile view only) */}
              <div className="order-1 lg:order-none block md:hidden w-full mt-2">
                <button
                  type="button"
                  data-live="true"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                      try {
                        navigator.vibrate(8);
                      } catch {
                        // ignore
                      }
                    }
                    setTrophyRoomMainView('mugenpass');
                    setIsTrophyRoomOpen(true);
                  }}
                  className="glass-pill-summoner group rounded-[5px] relative overflow-hidden"
                  style={{ borderRadius: '5px' }}
                  title="Open Event Pass & Mugen Pass in Career Page"
                >
                  <span className="pill__hit" aria-hidden="true" />

                  {/* Left-Cropped Shiny Golden Pass Graphic (Left half cut off by left container border) */}
                  <div className="relative shrink-0 -ml-7 sm:-ml-8 w-16 h-12 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                    <div className="w-28 h-auto transform -rotate-3 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] -translate-x-7">
                      <PassTicketGraphic passId="mecha_pass" multiplierText="2.5X" className="w-full h-auto" />
                    </div>
                  </div>

                  {/* Button Content Text & Thematic Accents */}
                  <div className="flex-1 min-w-0 text-left z-10 pl-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-[#fde047] tracking-wider uppercase flex items-center gap-1">
                        MUGEN PASS · GOLDEN EVENT PASS
                      </span>
                    </div>
                    <div className="text-[13px] sm:text-sm font-bold text-white tracking-[0.01em] truncate leading-tight mt-0.5">
                      VIP, Mecha & Nu Passes
                    </div>
                    <div className="text-[11px] text-amber-100/80 tracking-tight truncate leading-tight mt-0.5">
                      Boost trophies up to 2.5X & bypass with gems
                    </div>
                  </div>

                  {/* Right Action Arrow Circle (White/Golden Accent - No Red) */}
                  <div className="shrink-0 w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center opacity-90 group-hover:opacity-100 transition-all shadow-[0_0_10px_rgba(251,191,36,0.7)] z-10">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="7" x2="17" y2="17" />
                      <polyline points="17 7 17 17 7 17" />
                    </svg>
                  </div>
                </button>
              </div>

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
                    onClick={() => onOpenPunisher && onOpenPunisher()}
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
                    onClick={() => onOpenPunisher && onOpenPunisher()}
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

              {/* Custom Lane Chessing Mode Entry Card */}
              <div className="order-8 lg:order-none bg-white text-black border-4 border-black dark:border-white p-4 sm:p-5 shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 min-w-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                    <Swords className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black uppercase text-black">
                        Custom Lane Chessing Mode
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 bg-black text-amber-400 font-black uppercase">
                        5 MODES
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-700 mt-0.5">
                      Micro Chess (3×3), Speed Chess (4×4), Rank War (8×2), One Lane (8×1), and custom 8×8 officer laboratory!
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                  <button
                    onClick={() => setIsCraftGameHubOpen(true)}
                    className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Swords className="w-4 h-4 text-black" />
                    Custom Lane Chessing Mode
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

              {/* HERO DUEL STANDALONE MODE CARD (Positioned right after Culling Game entry point) */}
              <div 
                className="order-5 lg:order-none relative overflow-hidden bg-cover bg-center border-4 border-amber-400 p-4 sm:p-5 shadow-[6px_6px_0px_#fbbf24] flex flex-col justify-between gap-4 active:scale-98 transition-all min-w-0 aspect-square"
                style={{ backgroundImage: "url('/assets/aistudio/image_9466e3bd.png')" }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_95%)] z-0 pointer-events-none" />

                <div className="flex items-center gap-3.5 relative z-10 bg-black/80 p-3 border border-amber-400/40 backdrop-blur-sm rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-amber-400 border-2 border-black rounded-lg overflow-hidden flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                    <img src="/assets/aistudio/image_9466e3bd.png" alt="Hero Duel Banner" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black uppercase text-amber-400 drop-shadow">
                        Hero Duel (7×8 Arena)
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-black font-black uppercase shadow-sm">
                        NEW · 4 HEROES
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-300 mt-0.5">
                      4 heroes. 7x8 board. Collect a card for every kill. Draft, execute active powers & slay the enemy Captain!
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 lg:mt-auto">
                  <button
                    onClick={() => onOpenHeroDuel && onOpenHeroDuel()}
                    className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 shrink-0 cursor-pointer relative z-10 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Swords className="w-4 h-4" />
                    👑 PLAY HERO DUEL
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
        </>
      )}

      {/* Fixed Bottom Tab Bar (Mobile only, md:hidden, suppressed when Trophy Room is open) */}
      {!isTrophyRoomOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-[200] overflow-visible bg-zinc-950/95 supports-[backdrop-filter]:bg-zinc-950/80 supports-[backdrop-filter]:backdrop-blur-xl border-t border-white/10 text-white pb-[env(safe-area-inset-bottom)]"
        >
        <div className="grid grid-cols-[1fr_1fr_auto_1fr_1fr] h-16 max-w-md mx-auto items-center px-1 overflow-visible">
          {/* Tab 1: Modes */}
          <button
            type="button"
            onClick={() => {
              const wasOpen = isAllGameModesOpen;
              navigateMobile('modes', () => {
                if (!wasOpen) {
                  setIsAllGameModesOpen(true);
                }
              }, 'modes');
            }}
            aria-label="Open All Game Modes"
            className={`min-h-[48px] w-full flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer relative box-border ${
              currentActiveTab === 'modes'
                ? 'font-bold text-red-500'
                : 'font-semibold text-zinc-100 hover:text-white'
            }`}
          >
            <Chessboard3x3Icon className="w-5 h-5" active={currentActiveTab === 'modes'} />
            <span className="text-[11px] uppercase tracking-tight">Modes</span>
          </button>

          {/* Tab 2: Store */}
          <button
            type="button"
            onClick={() => {
              navigateMobile('store', () => setIsStoreOpen(true), 'store');
            }}
            aria-label="Open Mugen Gem Store"
            className={`min-h-[48px] w-full flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer relative box-border ${
              currentActiveTab === 'store'
                ? 'font-bold text-red-500'
                : 'font-semibold text-zinc-100 hover:text-white'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 ${currentActiveTab === 'store' ? 'text-red-500' : 'text-amber-400'}`} />
            <span className="text-[11px] uppercase tracking-tight">Store</span>
          </button>

          {/* Tab 3: PLAY Button (Fiery Molten Glass Keycap converting to Glossy King Icon when active) */}
          <div className={`play-glass-wrapper px-1 ${currentActiveTab === 'play' ? 'play-glass-wrapper-active' : ''}`}>
            <button
              type="button"
              onClick={togglePlayMenu}
              aria-label="Toggle Quick Access Game Modes Menu"
              aria-expanded={isMobileNavDropdownOpen}
              className={`play-glass-button ${currentActiveTab === 'play' ? 'play-glass-active' : ''}`}
            >
              {/* Layer 1: Lower molten-glass inner layer */}
              <span className="play-glass-molten" aria-hidden="true" />

              {/* Layer 2: Corner bloom */}
              <span className="play-glass-corner-bloom" aria-hidden="true" />

              {/* Layer 3: Moving molten light flow */}
              <span className="play-glass-flow" aria-hidden="true" />

              {/* Layer 4: Bright lower glass rim */}
              <span className="play-glass-rim" aria-hidden="true" />

              {/* Layer 5: Active Glossy Pink Chess King Icon Background Layer (Contained inside squircle container) */}
              <span
                className={`absolute inset-0 z-1 pointer-events-none transition-all duration-300 ease-out ${
                  currentActiveTab === 'play'
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-90'
                }`}
                aria-hidden="true"
              >
                <img
                  src="/assets/aistudio/Glossy_Pink_Chess_King_Icon_11d2622a.png"
                  alt=""
                  className="w-full h-full object-cover rounded-[20px] select-none"
                />
              </span>

              {/* Layer 6: Top specular highlight */}
              <span className="play-glass-specular z-2" aria-hidden="true" />

              {/* Layer 7: Diagonal glass gleam sweep */}
              <span className="play-glass-gleam z-2" aria-hidden="true" />

              {/* Crisp PLAY Label (Fades smoothly when icon takes over) */}
              <span className={`play-glass-label z-3 transition-opacity duration-200 ${currentActiveTab === 'play' ? 'opacity-0' : 'opacity-100'}`}>PLAY</span>
            </button>
          </div>

          {/* Tab 4: Hashira Dojo */}
          <button
            type="button"
            onClick={() => {
              navigateMobile('hashira', () => {
                if (onOpenHashiraTraining) {
                  onOpenHashiraTraining('thukuna');
                } else {
                  setIsWalkWithMastersOpen(true);
                }
              }, 'hashira');
            }}
            aria-label="Open Hashira Dojo"
            className={`min-h-[48px] w-full flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer relative box-border ${
              currentActiveTab === 'hashira'
                ? 'font-bold text-red-500'
                : 'font-semibold text-zinc-100 hover:text-white'
            }`}
          >
            <Flame className={`w-5 h-5 ${currentActiveTab === 'hashira' ? 'text-red-500' : 'text-amber-500'}`} />
            <span className="text-[11px] uppercase tracking-tight">Hashira</span>
          </button>

          {/* Tab 5: Trophy Room */}
          <button
            type="button"
            onClick={() => {
              navigateMobile('trophies', () => setIsTrophyRoomOpen(true), 'trophies');
            }}
            aria-label="Open Trophy Room"
            className={`min-h-[48px] w-full flex flex-col items-center justify-center gap-0.5 transition-transform duration-150 ease-out active:scale-95 motion-reduce:transform-none cursor-pointer relative box-border ${
              currentActiveTab === 'trophies'
                ? 'font-bold text-red-500'
                : 'font-semibold text-zinc-100 hover:text-white'
            }`}
          >
            <div className="relative">
              <Trophy className={`w-5 h-5 ${currentActiveTab === 'trophies' ? 'text-red-500' : 'text-amber-400'}`} />
              {predictorState.earnedCards.length > 0 && (
                <span className={`absolute -top-1.5 -right-2.5 px-1 py-0.2 ${currentActiveTab === 'trophies' ? 'bg-red-500 text-white' : 'bg-amber-400 text-black'} text-[10px] font-mono font-black rounded-full leading-tight`}>
                  {predictorState.earnedCards.length}
                </span>
              )}
            </div>
            <span className="text-[11px] uppercase tracking-tight">Career</span>
          </button>
        </div>
      </nav>
      )}

      {/* Centered Mobile Profile Modal (Mobile only, md:hidden) */}
      {isMobileProfileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[150] bg-black/80 supports-[backdrop-filter]:backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => {
            setIsMobileProfileOpen(false);
            profilePillRef.current?.focus();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Player Profile and Statistics"
        >
          {/* Centered Modal Card */}
          <div
            className="w-full max-w-lg bg-zinc-950 border-2 border-amber-400 rounded-2xl shadow-2xl p-5 sm:p-6 text-white max-h-[85vh] overflow-y-auto overscroll-contain my-auto relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Avatar, Name, Bio & Actions */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="border-2 border-amber-400 p-1 bg-neutral-900 rounded-xl shrink-0 shadow-[2px_2px_0px_#000]">
                  <AvatarDisplay
                    avatarId={user.avatarId}
                    isGuest={Boolean(user.id?.startsWith('usr_guest') || user.username?.toLowerCase().includes('mecharuri'))}
                    size="lg"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black uppercase text-white truncate">{user.displayName}</h3>
                  <p className="text-xs text-neutral-400 font-mono truncate">@{user.username}</p>
                  {user.bio ? (
                    <p className="text-xs text-amber-300/90 font-mono italic mt-1 max-w-[200px] break-words line-clamp-2">
                      "{user.bio}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-neutral-500 font-mono italic mt-1">
                      No bio written yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditName(user.displayName);
                    setEditAvatar(user.avatarId);
                    setEditBio(user.bio || '');
                    setIsEditingProfile(!isEditingProfile);
                  }}
                  className="text-xs font-black uppercase px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black border border-amber-300 cursor-pointer min-h-[38px] flex items-center justify-center active:scale-95 shadow-[2px_2px_0px_#000]"
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
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white border border-white/10 cursor-pointer active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Edit Mode Form or Stats Grid */}
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5">
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
                  <label className="block text-xs font-black uppercase mb-1 text-neutral-300">Player Description / Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Write a custom description or motto..."
                    rows={2}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/20 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1.5 text-neutral-300">Choose Profile Avatar</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1.5 border border-neutral-800 rounded-lg">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.id)}
                        className={`p-1.5 border rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                          editAvatar === av.id ? 'bg-amber-400 border-amber-300 text-black shadow-md' : 'border-white/10 bg-neutral-900/60 text-white opacity-70 hover:opacity-100'
                        }`}
                      >
                        <AvatarDisplay avatarId={av.id} size="sm" />
                        <span className="text-[9px] font-black uppercase mt-1 truncate w-full text-center leading-none">{av.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-xl border border-black cursor-pointer shadow-md active:scale-98"
                  >
                    Save Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearPredictorSession();
                      logout();
                    }}
                    className="py-2.5 px-4 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-98"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
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

                {/* Sign Out Button (Prominent) */}
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
        </div>
      )}

      <TrophyRoomModal
        isOpen={isTrophyRoomOpen}
        onClose={() => setIsTrophyRoomOpen(false)}
        initialMainView={trophyRoomMainView}
      />

      <SecretArenaModal
        isOpen={isSecretArenaOpen}
        onClose={() => {
          setIsSecretArenaOpen(false);
          updateSecretArenaOrigin(null);
          setActiveBottomTab(null);
        }}
        onBack={() => {
          setIsSecretArenaOpen(false);
          const origin = secretArenaOrigin;
          updateSecretArenaOrigin(null);
          if (origin?.type === 'store') {
            setStoreInitialTab(origin.initialTab);
            setIsStoreOpen(true);
            setActiveBottomTab('store');
          } else if (origin?.type === 'all_modes') {
            setIsAllGameModesOpen(true);
            setActiveBottomTab('modes');
          } else {
            setActiveBottomTab(null);
          }
        }}
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
        onClose={() => {
          setIsAllGameModesOpen(false);
          setActiveBottomTab('modes');
        }}
        onOpenHashiraTraining={() => onOpenHashiraTraining && onOpenHashiraTraining('thukuna')}
        onOpenPunisher={onOpenPunisher}
        onOpenBotModal={onOpenBotModal}
        onOpenClassicBotModal={onOpenClassicBotModal || onOpenBotModal}
        onOpenCraftedBotModal={onOpenCraftedBotModal || onOpenBotModal}
        onOpenSecretArena={() => {
          setIsAllGameModesOpen(false);
          updateSecretArenaOrigin({ type: 'all_modes' });
          setIsSecretArenaOpen(true);
        }}
        onOpenCulling={() => setIsCullingOpen(true)}
        onOpenHeroDuel={onOpenHeroDuel}
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

      {/* Mugen Gem Store Modal */}
      <MugenGemStore
        isOpen={isStoreOpen}
        onClose={() => {
          setIsStoreOpen(false);
          setStoreInitialTab('ore_conversion');
          setActiveBottomTab(null);
        }}
        userId={user?.id ?? 'guest'}
        currentElo={predictorState.currentRating}
        onEloDeduct={(amt) => {
          applyRatingBoost(-amt);
        }}
        onOpenSecretArena={() => {
          setIsStoreOpen(false);
          updateSecretArenaOrigin({ type: 'store', initialTab: 'secret_blueprints' });
          setIsSecretArenaOpen(true);
        }}
        initialTab={storeInitialTab}
      />

      {/* Craft Your Own Game Hub Modal */}
      <CraftGameHub
        isOpen={isCraftGameHubOpen}
        onClose={() => setIsCraftGameHubOpen(false)}
      />
    </div>
  );
};
