import React, { useState, useRef, useEffect } from 'react';
import { usePredictor } from '../predictor/PredictorContext';
import { useAuth } from '../context/AuthContext';
import { drawAchievementCard, downloadCardAsPng } from '../predictor/canvasCardRenderer';
import type { AchievementCard, CardRarity, GameModeKey } from '../predictor/types';
import { ChessPiece as ClassicPiece } from './ChessPiece';
import { CullingPiece as CullingPieceComponent } from './CullingPiece';
import {
  Trophy,
  Download,
  X,
  Filter,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  ChevronRight,
  Gift,
  Archive,
  Package,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import type { PieceColor, PieceType } from '../types/game';
import type { CullingPieceType, CullingPieceColor } from '../types/cullingGame';
import { useModalFocus } from '../utils/useModalFocus';
import { CARD_DEFINITIONS } from '../predictor/cardDefs';
import {
  getChestStore,
  getClaimedRewards,
  ClaimedChestReward,
  PendingChestEvent,
} from '../chest/chestStore';
import { triggerChestModalNow } from '../chest/reportGameEnd';
import { ChestSvg } from '../chest/ChestSvg';

interface TrophyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedCard?: AchievementCard | null;
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({
  isOpen,
  onClose,
  initialSelectedCard = null,
}) => {
  const { state, clearPredictorSession } = usePredictor();
  const { user } = useAuth();
  
  const modalRef = useModalFocus(isOpen, onClose, true);

  // Main View: 'trophies' (Achievements) vs 'inventory' (Chest Inventory)
  const [mainView, setMainView] = useState<'trophies' | 'inventory'>('trophies');
  
  // Chest Inventory sub-tab: 'pending' (Chests to Open) vs 'claimed' (Claimed Rewards History)
  const [inventorySubTab, setInventorySubTab] = useState<'pending' | 'claimed'>('pending');

  const [selectedCard, setSelectedCard] = useState<AchievementCard | null>(initialSelectedCard);
  const [filterMode, setFilterMode] = useState<GameModeKey | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'all'>('all');
  const [storeTick, setStoreTick] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load chest store data
  const chestStore = getChestStore(user?.id);
  const claimedRewards = getClaimedRewards(user?.id);

  // Compute list of unopened chests
  const pendingChestsList: PendingChestEvent[] =
    chestStore.pendingEvents && chestStore.pendingEvents.length > 0
      ? chestStore.pendingEvents
      : Array.from({ length: chestStore.pending }, (_, i) => ({
          matchId: `pending_${i}`,
          mode: 'Match Loot',
          result: 'win' as const,
        }));

  const pendingChestsCount = pendingChestsList.length;

  // Refresh store when modal opens
  useEffect(() => {
    if (isOpen) {
      setStoreTick((t) => t + 1);
    }
  }, [isOpen]);

  // Synchronize selected card when modal opens or cards change
  useEffect(() => {
    if (!isOpen) return;

    if (initialSelectedCard) {
      setSelectedCard(initialSelectedCard);
    } else if (state.earnedCards.length > 0) {
      if (!selectedCard || !state.earnedCards.some((c) => c.id === selectedCard.id)) {
        setSelectedCard(state.earnedCards[0]);
      }
    } else if (selectedCard && !selectedCard.id.endsWith('_locked')) {
      setSelectedCard(null);
    }
  }, [isOpen, initialSelectedCard, state.earnedCards]);

  const matchesTrophyDef = (cardId: string, defId: string) =>
    cardId === defId || cardId.startsWith(`${defId}_`);

  // Merge definitions with earned state to show full collection
  const allTrophyData = CARD_DEFINITIONS.map((def) => {
    // Find all earned instances of this definition
    const instances = state.earnedCards.filter(
      (c) => !c.id.endsWith('_locked') && (matchesTrophyDef(c.id, def.id) || c.title === def.title)
    );
    const isUnlocked = instances.length > 0;
    // Use the most recent earned instance for the preview if unlocked
    const earnedInstance = isUnlocked ? instances[0] : null;

    return {
      ...def,
      isUnlocked,
      earnedInstance,
      instances,
      // If earned, use the latest rating
      predictedRating: earnedInstance?.predictedRating ?? null,
    };
  });

  const selectedTrophy = selectedCard
    ? allTrophyData.find(
        (t) => matchesTrophyDef(selectedCard.id, t.id) || t.title === selectedCard.title
      )
    : undefined;

  const isSelectedCardUnlocked = Boolean(
    selectedCard &&
      (state.earnedCards.some((c) => c.id === selectedCard.id) ||
        Boolean(selectedTrophy?.isUnlocked))
  );

  const effectiveSelectedCard =
    selectedCard &&
    selectedCard.id.endsWith('_locked') &&
    selectedTrophy?.isUnlocked &&
    selectedTrophy.earnedInstance
      ? selectedTrophy.earnedInstance
      : selectedCard;

  // Render selected 1:1 square card to canvas with guaranteed mount visibility
  useEffect(() => {
    if (!isOpen || !effectiveSelectedCard || mainView !== 'trophies') return;

    let animId: number;
    let timeoutId: NodeJS.Timeout;

    const render = () => {
      if (canvasRef.current && effectiveSelectedCard) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          drawAchievementCard(ctx, effectiveSelectedCard);
        }
      }
    };

    render();
    animId = requestAnimationFrame(render);
    timeoutId = setTimeout(render, 60);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId);
    };
  }, [isOpen, effectiveSelectedCard, mainView]);

  if (!isOpen) return null;

  const filteredTrophies = allTrophyData.filter((t) => {
    if (filterMode !== 'all' && t.mode !== filterMode) return false;
    if (filterRarity !== 'all' && t.rarity !== filterRarity) return false;
    return true;
  });

  const unlockedCount = allTrophyData.filter((t) => t.isUnlocked).length;
  const totalCount = allTrophyData.length;

  const renderBadgePiece = (trophy: typeof allTrophyData[0]) => {
    const pType = trophy.pieceType || 'king';
    const pColor = trophy.pieceColor || 'white';
    const isLocked = !trophy.isUnlocked;

    const content =
      trophy.mode === 'culling' && pType.startsWith('culling_') ? (
        <CullingPieceComponent
          type={pType as CullingPieceType}
          color={pColor as CullingPieceColor}
        />
      ) : (
        <ClassicPiece
          type={pType as PieceType}
          color={pColor as PieceColor}
          className="w-full h-full"
        />
      );

    return (
      <div
        className={`w-14 h-14 flex items-center justify-center p-1 bg-white border-3 transition-all ${
          isLocked
            ? 'border-slate-800 grayscale opacity-30 group-hover:opacity-50'
            : 'border-black shadow-[3px_3px_0px_#000]'
        }`}
      >
        {content}
      </div>
    );
  };

  const handleOpenChest = () => {
    triggerChestModalNow(user?.id, true);
    setTimeout(() => {
      setStoreTick((t) => t + 1);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trophy-modal-title"
        className="relative w-full sm:max-w-6xl h-[100dvh] sm:h-[90vh] bg-[#0a0d14] border-t-4 sm:border-4 border-white text-slate-100 sm:shadow-[12px_12px_0px_#000000] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header: Modern Brutalist Navigation */}
        <header className="flex items-center justify-between px-4 py-3 bg-black border-b-4 border-white shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#fff] shrink-0">
              {mainView === 'inventory' ? (
                <Gift className="w-7 h-7 text-black" />
              ) : (
                <Trophy className="w-7 h-7 text-black" />
              )}
            </div>
            <div className="min-w-0">
              <h2
                id="trophy-modal-title"
                className="text-base sm:text-xl font-black uppercase tracking-tighter text-white leading-none mb-1 truncate"
              >
                {mainView === 'inventory' ? 'Chest Vault & Inventory' : 'Trophy Sanctuary'}
              </h2>
              <div className="flex items-center gap-2">
                {mainView === 'inventory' ? (
                  <>
                    <span className="text-xs font-black text-amber-400 bg-amber-950/40 px-2 py-0.5 border border-amber-400/30 tracking-widest whitespace-nowrap">
                      {pendingChestsCount} CHEST{pendingChestsCount === 1 ? '' : 'S'} STORED
                    </span>
                    <span className="hidden sm:inline text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {claimedRewards.length} Claimed Item{claimedRewards.length === 1 ? '' : 's'} in History
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-black text-amber-400 bg-amber-950/40 px-2 py-0.5 border border-amber-400/30 tracking-widest whitespace-nowrap">
                      {unlockedCount} / {totalCount} UNLOCKED
                    </span>
                    <span className="hidden sm:inline text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      Total Collection: {Math.round((unlockedCount / totalCount) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {mainView === 'trophies' && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'WIPE ALL PROGRESS? This will erase all badges and ratings permanently.'
                    )
                  ) {
                    clearPredictorSession();
                    setSelectedCard(null);
                  }
                }}
                className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-rose-500 border-2 border-slate-900 hover:border-rose-900 transition-all active:scale-90"
                title="Factory Reset Collection"
                aria-label="Reset collection progress"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center bg-white text-black border-2 border-black hover:bg-amber-400 transition-all cursor-pointer active:scale-90"
              aria-label="Close modal"
            >
              <X className="w-7 h-7 stroke-[3]" />
            </button>
          </div>
        </header>

        {/* Top View Selector: Trophies vs Chest Inventory */}
        <div className="bg-neutral-950 border-b-2 border-white/20 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMainView('trophies')}
              className={`min-h-[42px] px-4 font-black uppercase text-xs flex items-center gap-2 border-2 transition-all cursor-pointer ${
                mainView === 'trophies'
                  ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff]'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>TROPHIES ({unlockedCount}/{totalCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setMainView('inventory')}
              className={`min-h-[42px] px-4 font-black uppercase text-xs flex items-center gap-2 border-2 transition-all cursor-pointer ${
                mainView === 'inventory'
                  ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff]'
                  : 'bg-neutral-900 text-amber-400 border-amber-400/60 hover:bg-neutral-800'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>CHEST INVENTORY</span>
              {pendingChestsCount > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-black rounded-xs">
                  {pendingChestsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Body: Single Column Stacking on Mobile */}
        <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain bg-[#0a0d14] scroll-smooth pb-[env(safe-area-inset-bottom,24px)]">
          {mainView === 'inventory' ? (
            /* ============================================================== */
            /* ================= CHEST INVENTORY VIEW ======================= */
            /* ============================================================== */
            <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full">
              {/* Inventory Sub-tabs */}
              <div className="flex items-center gap-2 mb-6 border-b-2 border-neutral-800 pb-3">
                <button
                  type="button"
                  onClick={() => setInventorySubTab('pending')}
                  className={`min-h-[40px] px-4 text-xs font-black uppercase flex items-center gap-2 border-2 transition-all cursor-pointer ${
                    inventorySubTab === 'pending'
                      ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff]'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  <span>Chests to Open ({pendingChestsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInventorySubTab('claimed')}
                  className={`min-h-[40px] px-4 text-xs font-black uppercase flex items-center gap-2 border-2 transition-all cursor-pointer ${
                    inventorySubTab === 'claimed'
                      ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff]'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Claimed Rewards History ({claimedRewards.length})</span>
                </button>
              </div>

              {inventorySubTab === 'pending' ? (
                /* Sub-tab 1: Chests to Open */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Stored chests ready to unlock. Click &quot;Open Chest&quot; to begin the 3-tap unlock sequence!
                    </p>
                  </div>

                  {pendingChestsCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-neutral-950 border-4 border-dashed border-neutral-800 text-center p-6">
                      <div className="w-20 h-20 bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center mb-4 shadow-inner">
                        <Package className="w-10 h-10 text-neutral-600" />
                      </div>
                      <h3 className="text-base font-black uppercase text-white mb-1">
                        No Unopened Chests in Vault
                      </h3>
                      <p className="text-xs text-neutral-400 max-w-sm mb-4 leading-relaxed font-mono">
                        Finish any game mode match (Standard, Crafted, Culling, Rose, or Secret Bot) to earn mystery chests. When awarded, choose &quot;Save to Inventory&quot; to store them here!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingChestsList.map((chest, idx) => (
                        <div
                          key={chest.matchId || idx}
                          className="bg-neutral-950 border-3 border-amber-400/80 p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between relative overflow-hidden group hover:border-amber-400 transition-all"
                        >
                          {/* Chest Visual */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-16 h-16 bg-[#16120b] border-2 border-amber-400 flex items-center justify-center shrink-0 p-1 group-hover:scale-105 transition-transform">
                              <ChestSvg isWin={chest.isWin ?? (chest.result !== 'loss')} tapCount={0} isOpened={false} isWindup={false} isResigned={chest.isResigned} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono font-black uppercase text-amber-400 px-1.5 py-0.5 bg-amber-400/10 border border-amber-400/30">
                                {chest.result === 'loss' ? 'Combat Loot' : 'Victory Chest'}
                              </span>
                              <h4 className="text-sm font-black uppercase text-white tracking-tight mt-1 truncate">
                                Mystery Combat Chest
                              </h4>
                              <p className="text-[10px] font-mono text-neutral-400 truncate">
                                Origin: {chest.mode ? chest.mode.replace(/_/g, ' ') : 'Match'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-black/60 border border-neutral-800 p-2 text-[11px] text-neutral-300 font-medium mb-4">
                            Contains secret player characters, rare title cards, and ELO rating boosts.
                          </div>

                          <button
                            type="button"
                            onClick={handleOpenChest}
                            className="w-full min-h-[44px] px-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#fff] cursor-pointer flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all"
                          >
                            <Gift className="w-4 h-4 text-black shrink-0" />
                            <span>OPEN CHEST NOW</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Sub-tab 2: Claimed Rewards History */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Catalog of all secret character cards and tactical boosts acquired from opened chests.
                    </p>
                  </div>

                  {claimedRewards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-neutral-950 border-4 border-dashed border-neutral-800 text-center p-6">
                      <div className="w-20 h-20 bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center mb-4 shadow-inner">
                        <Sparkles className="w-10 h-10 text-neutral-600" />
                      </div>
                      <h3 className="text-base font-black uppercase text-white mb-1">
                        No Claimed Rewards Yet
                      </h3>
                      <p className="text-xs text-neutral-400 max-w-sm mb-4 leading-relaxed font-mono">
                        Open your stored combat chests in the &quot;Chests to Open&quot; tab to unlock secret playable bots and permanent codex achievements!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {claimedRewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="bg-neutral-950 border-3 border-white/80 p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between relative overflow-hidden"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            {/* Avatar Display */}
                            <div className="w-16 h-16 bg-black border-2 border-amber-400 overflow-hidden shrink-0 shadow-[2px_2px_0px_#000]">
                              <img
                                src={reward.avatarUrl}
                                alt={reward.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback image if local path fails
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-amber-400 text-black">
                                  {reward.rarity}
                                </span>
                                {reward.eloBoost && (
                                  <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-emerald-500 text-black">
                                    +{reward.eloBoost} ELO
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-black uppercase text-white tracking-tight mt-1 truncate">
                                {reward.name}
                              </h4>
                              <p className="text-[11px] font-bold text-amber-400 truncate">
                                {reward.role}
                              </p>
                            </div>
                          </div>

                          <div className="bg-black/60 border border-neutral-800 p-2 text-[11px] text-neutral-300 font-medium mb-3">
                            <span className="text-neutral-400 uppercase text-[10px] block font-mono">Codex Title</span>
                            <span className="font-bold text-white">{reward.title}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-t border-neutral-800 pt-2">
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              UNLOCKED & PLAYABLE
                            </span>
                            <span>{new Date(reward.claimedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* ================== TROPHY SHOWCASE VIEW ====================== */
            /* ============================================================== */
            <>
              {/* Navigation Bar: Category Tabs */}
              <nav
                className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b-2 border-white/10 z-20 shrink-0 shadow-xl"
                role="tablist"
              >
                <div className="flex overflow-x-auto scrollbar-none px-4 py-3 gap-3">
                  {(['all', 'standard', 'culling', 'rose', 'crafted'] as const).map((m) => {
                    const isActive = filterMode === m;
                    return (
                      <button
                        type="button"
                        key={m}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setFilterMode(m)}
                        className={`h-12 px-5 flex-shrink-0 flex items-center gap-2 font-black uppercase text-xs border-2 transition-all active:scale-95 ${
                          isActive
                            ? 'bg-amber-400 text-black border-black shadow-[4px_4px_0px_#fff] -translate-y-0.5'
                            : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        <span>
                          {m === 'all' ? 'All Realms' : m === 'standard' ? 'Classic' : m}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="flex flex-col lg:flex-row flex-1 relative">
                {/* Left/Detail Column: Persistent Sticky on Desktop, Top of Scroll on Mobile */}
                <aside className="lg:w-[38%] xl:w-[32%] lg:sticky lg:top-14 h-fit bg-black/60 border-b-2 lg:border-b-0 lg:border-r-4 border-white/10 p-5 sm:p-8 flex flex-col items-center shrink-0 z-10">
                  {effectiveSelectedCard ? (
                    <div className="w-full max-w-[340px] animate-in slide-in-from-top-4 duration-300">
                      {/* Badge Preview Frame */}
                      <div className="relative border-4 border-black shadow-[10px_10px_0px_#f5a623] bg-[#f5a623] aspect-square w-full mb-8 group overflow-hidden rounded-md">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={600}
                          className="w-full h-full block object-contain"
                        />
                        {!isSelectedCardUnlocked && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-black/90 border-2 border-amber-400 px-4 py-2 flex items-center gap-2 shadow-2xl">
                              <Lock className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                                Seal Locked
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/90 border border-amber-400 text-xs font-black text-amber-400 uppercase">
                          {isSelectedCardUnlocked
                            ? `Serial: ${effectiveSelectedCard.id.slice(-8)}`
                            : 'Status: Locked'}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-amber-400 text-black border-3 border-black p-5 shadow-[6px_6px_0px_#fff] relative">
                          <div className="absolute -top-3 left-4 bg-black text-amber-400 px-2 py-0.5 text-xs font-black uppercase border border-amber-400">
                            Badge Codex
                          </div>
                          <h3 className="text-2xl font-black uppercase text-black mb-1 leading-tight tracking-tighter">
                            {effectiveSelectedCard.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-black px-2 py-0.5 bg-black text-amber-400 border border-black">
                              {effectiveSelectedCard.rarity.toUpperCase()}
                            </span>
                            <span className="text-xs font-black text-black/80 uppercase tracking-widest">
                              {effectiveSelectedCard.mode} Realm
                            </span>
                          </div>
                          <p className="text-sm font-bold text-black leading-relaxed italic border-l-4 border-black pl-4 py-1">
                            &ldquo;{effectiveSelectedCard.description}&rdquo;
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isSelectedCardUnlocked && effectiveSelectedCard) {
                              downloadCardAsPng(effectiveSelectedCard);
                            }
                          }}
                          disabled={!isSelectedCardUnlocked}
                          className="w-full h-14 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 disabled:shadow-none text-black font-black text-xs sm:text-sm uppercase tracking-tighter border-3 border-black shadow-[6px_6px_0px_#fff] flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed transition-all active:translate-x-1 active:translate-y-1"
                        >
                          <Download className="w-5 h-5 stroke-[3]" />
                          <span>Download Identity Badge (PNG)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600 text-center">
                      <div className="w-20 h-20 bg-slate-900 border-2 border-slate-800 flex items-center justify-center mb-6 shadow-inner">
                        <Sparkles className="w-10 h-10 opacity-20" />
                      </div>
                      <p className="font-black text-xs uppercase tracking-[0.2em] animate-pulse">
                        Select an Achievement
                      </p>
                    </div>
                  )}
                </aside>

                {/* Right Column: Trophy Grid */}
                <main className="flex-1 p-4 sm:p-8 bg-[#0a0d14]">
                  {/* Sub-Filters: Rarity Horizontal Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-6">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2 shrink-0">
                      Filter by Tier:
                    </span>
                    {(['all', 'Legendary', 'Epic', 'Rare', 'Common'] as const).map((r) => {
                      const isActive = filterRarity === r;
                      return (
                        <button
                          type="button"
                          key={r}
                          onClick={() => setFilterRarity(r)}
                          className={`px-4 py-2 font-black uppercase text-xs border-2 transition-all active:scale-90 shrink-0 ${
                            isActive
                              ? 'bg-white text-black border-black shadow-[3px_3px_0px_#fbbf24]'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>

                  {filteredTrophies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-700 text-center border-4 border-dashed border-slate-900">
                      <Filter className="w-12 h-12 mb-4 opacity-10" />
                      <h4 className="font-black uppercase text-sm tracking-widest">
                        No Matches in Sanctuary
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterMode('all');
                          setFilterRarity('all');
                        }}
                        className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-500 uppercase hover:bg-slate-800 transition-colors"
                      >
                        Reset Realm Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {filteredTrophies.map((trophy) => {
                        const isSelected = Boolean(
                          selectedCard && matchesTrophyDef(selectedCard.id, trophy.id)
                        );
                        const isLocked = !trophy.isUnlocked;

                        return (
                          <div
                            key={trophy.id}
                            onClick={() => {
                              if (trophy.isUnlocked && trophy.earnedInstance) {
                                setSelectedCard(trophy.earnedInstance);
                              } else {
                                // Construct preview-only card for locked state
                                setSelectedCard({
                                  ...trophy,
                                  id: `${trophy.id}_locked`,
                                  predictedRating: 0,
                                  userId: 'guest',
                                  earnedAt: Date.now(),
                                  stats: {} as any,
                                } as any);
                              }
                            }}
                            className={`group relative p-4 border-3 transition-all flex flex-col justify-between aspect-[4/5] overflow-hidden cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400 text-black border-black shadow-[6px_6px_0px_#fff] -translate-y-1 z-10'
                                : 'bg-amber-500/10 text-white border-amber-500/40 hover:border-amber-400 shadow-[4px_4px_0px_#000]'
                            }`}
                            title={isLocked ? `Locked: ${trophy.description}` : trophy.title}
                          >
                            {/* Status Indicators */}
                            <div className="flex items-center justify-between mb-4">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 ${
                                  isSelected
                                    ? 'bg-black text-amber-400 border-black'
                                    : trophy.rarity === 'Legendary'
                                    ? 'bg-amber-950 text-amber-400 border-amber-800'
                                    : trophy.rarity === 'Epic'
                                    ? 'bg-purple-950 text-purple-400 border-purple-800'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {trophy.rarity}
                              </span>

                              {isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-slate-600" />
                              ) : (
                                <div
                                  className={`w-2.5 h-2.5 rounded-full border-2 ${
                                    isSelected
                                      ? 'bg-black border-black'
                                      : 'bg-emerald-500 border-emerald-900'
                                  }`}
                                />
                              )}
                            </div>

                            {/* Visual Icon */}
                            <div className="flex items-center justify-center my-4 group-hover:scale-110 transition-transform duration-300">
                              {renderBadgePiece(trophy)}
                            </div>

                            {/* Title & Stats */}
                            <div className="mt-auto">
                              <h4
                                className={`font-black text-[11px] sm:text-xs uppercase leading-tight line-clamp-2 mb-2 ${
                                  isSelected
                                    ? 'text-black'
                                    : isLocked
                                    ? 'text-slate-500'
                                    : 'text-amber-300'
                                }`}
                              >
                                {trophy.title}
                              </h4>
                              <div className="flex items-center justify-between pt-2 border-t border-black/20 dark:border-white/10">
                                <span
                                  className={`text-[11px] font-black uppercase tracking-tighter ${
                                    isSelected
                                      ? 'text-black/70'
                                      : isLocked
                                      ? 'text-slate-600'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {isLocked ? 'STATUS: LOCKED' : 'RANK ACQUIRED'}
                                </span>
                                {trophy.predictedRating && !isLocked && (
                                  <div
                                    className={`px-1.5 py-0.5 rounded-sm text-xs font-mono font-black ${
                                      isSelected
                                        ? 'bg-black text-amber-400'
                                        : 'bg-amber-400 text-black'
                                    }`}
                                  >
                                    R:{trophy.predictedRating}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Locked Cross-hatch Overlay */}
                            {isLocked && (
                              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </main>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
