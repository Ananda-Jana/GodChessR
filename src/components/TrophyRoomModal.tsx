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
import { getGems } from '../economy/mugenStore';
import { MugenGemIcon } from '../economy/MugenGemIcon';

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

  // Refresh store when modal opens or storage events fire
  useEffect(() => {
    if (isOpen) {
      setStoreTick((t) => t + 1);
    }
    const handleUpdate = () => {
      setStoreTick((t) => t + 1);
    };
    window.addEventListener('trophy_room_updated', handleUpdate);
    window.addEventListener('mugen_chest_stored', handleUpdate);
    return () => {
      window.removeEventListener('trophy_room_updated', handleUpdate);
      window.removeEventListener('mugen_chest_stored', handleUpdate);
    };
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
    onClose();
    triggerChestModalNow(user?.id, true);
    setTimeout(() => {
      setStoreTick((t) => t + 1);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trophy-modal-title"
        className="relative w-full sm:max-w-6xl h-[100dvh] sm:h-[90vh] bg-[#0a0d14] border-t-4 sm:border-4 border-white text-slate-100 sm:shadow-[12px_12px_0px_#000000] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header: Modern Brutalist Navigation */}
        {/* STREAMLIINED MOBILE-OPTIMIZED TOP NAV BAR */}
        <header className="flex flex-col gap-2 px-3 py-2.5 bg-black border-b-2 border-white/20 shrink-0 z-30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 bg-amber-400 border border-black flex items-center justify-center shrink-0">
                {mainView === 'inventory' ? (
                  <Gift className="w-5 h-5 text-black" />
                ) : (
                  <Trophy className="w-5 h-5 text-black" />
                )}
              </div>
              <div className="min-w-0">
                <h2
                  id="trophy-modal-title"
                  className="text-xs sm:text-sm font-black uppercase text-white truncate"
                >
                  {mainView === 'inventory' ? 'Chest Vault' : 'Trophy Sanctuary'}
                </h2>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  {mainView === 'inventory'
                    ? `${pendingChestsCount} Chests Stored`
                    : `${unlockedCount}/${totalCount} Unlocked (${Math.round((unlockedCount / totalCount) * 100)}%)`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Live Gem Balance Badge */}
              <div className="px-2.5 py-1 bg-amber-400 text-black border border-black font-mono font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_#fff]">
                <MugenGemIcon className="w-4 h-4 text-black shrink-0" />
                <span>{getGems(user?.id || 'guest')} GEMS</span>
              </div>

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
                  className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 border border-slate-700 bg-neutral-900 cursor-pointer"
                  title="Factory reset progress"
                  aria-label="Factory reset progress"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center bg-white text-black border border-black hover:bg-amber-400 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Collapsed Compact View Selector Tabs */}
          <div
            role="tablist"
            aria-label="Sanctuary and Vault Views"
            className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mainView === 'trophies'}
              aria-controls="trophies-panel"
              id="trophies-tab"
              onClick={() => setMainView('trophies')}
              className={`min-h-[36px] px-3 py-1 font-black uppercase text-[11px] flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                mainView === 'trophies'
                  ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#fff]'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Trophies ({unlockedCount}/{totalCount})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mainView === 'inventory'}
              aria-controls="inventory-panel"
              id="inventory-tab"
              onClick={() => setMainView('inventory')}
              aria-label={`Chest inventory, ${pendingChestsCount} chests stored`}
              className={`min-h-[36px] px-3 py-1 font-black uppercase text-[11px] flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                mainView === 'inventory'
                  ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#fff]'
                  : 'bg-neutral-900 text-amber-400 border-amber-400/60 hover:bg-neutral-800'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Chest Vault</span>
              {pendingChestsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[9px] font-black rounded-xs">
                  {pendingChestsCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Body: Single Column Stacking on Mobile */}
        <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain bg-[#0a0d14] scroll-smooth pb-[max(env(safe-area-inset-bottom,0px),16px)]">
          {mainView === 'inventory' ? (
            /* ============================================================== */
            /* ================= CHEST INVENTORY VIEW ======================= */
            /* ============================================================== */
            <div
              id="inventory-panel"
              role="tabpanel"
              aria-labelledby="inventory-tab"
              className="flex-1 flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full min-w-0"
            >
              {/* Inventory Sub-tabs */}
              <div
                role="tablist"
                aria-label="Chest Vault Sub-tabs"
                className="flex items-center gap-2 mb-6 border-b-2 border-neutral-800 pb-3 flex-wrap"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={inventorySubTab === 'pending'}
                  aria-controls="pending-chests-panel"
                  id="pending-chests-tab"
                  onClick={() => setInventorySubTab('pending')}
                  className={`min-h-[44px] px-4 text-xs font-black uppercase flex items-center gap-2 border-2 transition-all cursor-pointer motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none ${
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
                  role="tab"
                  aria-selected={inventorySubTab === 'claimed'}
                  aria-controls="claimed-rewards-panel"
                  id="claimed-rewards-tab"
                  onClick={() => setInventorySubTab('claimed')}
                  className={`min-h-[44px] px-4 text-xs font-black uppercase flex items-center gap-2 border-2 transition-all cursor-pointer motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none ${
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
                <div id="pending-chests-panel" role="tabpanel" aria-labelledby="pending-chests-tab">
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
                    <div role="list" aria-label="Unopened Chests" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingChestsList.map((chest, idx) => (
                        <div
                          key={chest.matchId || idx}
                          role="listitem"
                          className="bg-neutral-950 border-3 border-amber-400/80 p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between relative overflow-hidden group hover:border-amber-400 transition-all motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none"
                        >
                          {/* Chest Visual */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-16 h-16 bg-[#16120b] border-2 border-amber-400 flex items-center justify-center shrink-0 p-1 group-hover:scale-105 transition-transform motion-reduce:transition-none motion-reduce:transform-none">
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
                            className="w-full min-h-[44px] px-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#fff] cursor-pointer flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none"
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
                <div id="claimed-rewards-panel" role="tabpanel" aria-labelledby="claimed-rewards-tab">
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
                    <div role="list" aria-label="Claimed Rewards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {claimedRewards.map((reward) => (
                        <div
                          key={reward.id}
                          role="listitem"
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
                className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b-2 border-white/10 z-20 shrink-0 shadow-xl relative"
                role="tablist"
                aria-label="Realm Categories"
                onKeyDown={(e) => {
                  if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                    e.preventDefault();
                    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
                    if (!tabs.length) return;
                    const modes = (['all', 'standard', 'culling', 'rose', 'crafted'] as const);
                    const currentIndex = modes.indexOf(filterMode);
                    let nextIndex = currentIndex;
                    if (e.key === 'ArrowLeft') {
                      nextIndex = currentIndex > 0 ? currentIndex - 1 : modes.length - 1;
                    } else if (e.key === 'ArrowRight') {
                      nextIndex = currentIndex < modes.length - 1 ? currentIndex + 1 : 0;
                    } else if (e.key === 'Home') {
                      nextIndex = 0;
                    } else if (e.key === 'End') {
                      nextIndex = modes.length - 1;
                    }
                    setFilterMode(modes[nextIndex]);
                    tabs[nextIndex]?.focus();
                  }
                }}
              >
                {/* Right-edge fade overlay for mobile scroll affordance (STEP 5b) */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10 lg:hidden"
                  aria-hidden="true"
                />

                <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-3 gap-3 min-w-0 flex-nowrap">
                  {(['all', 'standard', 'culling', 'rose', 'crafted'] as const).map((m) => {
                    const isActive = filterMode === m;
                    return (
                      <button
                        type="button"
                        key={m}
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => setFilterMode(m)}
                        className={`min-h-[48px] px-5 flex-shrink-0 flex items-center gap-2 font-black uppercase text-xs border-2 transition-all active:scale-95 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none ${
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

              <div id="trophies-panel" role="tabpanel" aria-labelledby="trophies-tab" className="flex flex-col lg:flex-row flex-1 relative min-w-0">
                {/* Left/Detail Column: Persistent Sticky on Desktop, Top of Scroll on Mobile */}
                <aside className="lg:w-[38%] xl:w-[32%] lg:sticky lg:top-14 h-fit bg-black/60 border-b-2 lg:border-b-0 lg:border-r-4 border-white/10 p-5 sm:p-8 flex flex-col items-center shrink-0 z-10 min-w-0">
                  {/* Visually-hidden live region for screen readers when selected card changes (STEP 4b) */}
                  <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                    {effectiveSelectedCard
                      ? `Selected: ${effectiveSelectedCard.title}, ${effectiveSelectedCard.rarity}, ${isSelectedCardUnlocked ? 'Unlocked' : 'Locked'}`
                      : 'No trophy selected'}
                  </div>

                  {effectiveSelectedCard ? (
                    <div className="w-full max-w-[340px] animate-in slide-in-from-top-4 duration-300 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none">
                      {/* Badge Preview Frame */}
                      <div className="relative border-4 border-black shadow-[10px_10px_0px_#f5a623] bg-[#f5a623] aspect-square w-full mb-8 group overflow-hidden rounded-md max-h-[38dvh] lg:max-h-none mx-auto">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={600}
                          role="img"
                          aria-label={
                            effectiveSelectedCard
                              ? `${effectiveSelectedCard.title}, ${effectiveSelectedCard.rarity} badge, ${
                                  isSelectedCardUnlocked
                                    ? `Serial ${effectiveSelectedCard.id.slice(-8)}, Unlocked`
                                    : 'Status Locked'
                                }`
                              : 'No trophy selected'
                          }
                          className="w-full h-full block object-contain max-h-[38dvh] lg:max-h-none mx-auto"
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
                          aria-describedby={!isSelectedCardUnlocked ? 'download-disabled-helper' : undefined}
                          className="w-full min-h-[56px] py-3 px-4 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-400 disabled:border-slate-700 disabled:shadow-none text-black font-black text-xs sm:text-sm uppercase tracking-tighter border-3 border-black shadow-[6px_6px_0px_#fff] flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed transition-all active:translate-x-1 active:translate-y-1 leading-tight motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none"
                        >
                          <Download className="w-5 h-5 stroke-[3] shrink-0" />
                          <span>Download Identity Badge (PNG)</span>
                        </button>

                        {!isSelectedCardUnlocked && (
                          <p id="download-disabled-helper" className="text-xs font-bold text-amber-400 text-center mt-1">
                            Unlock this trophy to download its badge
                          </p>
                        )}
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
                <main className="flex-1 p-4 sm:p-8 bg-[#0a0d14] min-w-0">
                  {/* Sub-Filters: Rarity Horizontal Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-4 mb-6 flex-wrap min-w-0">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 shrink-0">
                      Filter by Tier:
                    </span>
                    {(['all', 'Legendary', 'Epic', 'Rare', 'Common'] as const).map((r) => {
                      const isActive = filterRarity === r;
                      return (
                        <button
                          type="button"
                          key={r}
                          aria-pressed={isActive}
                          onClick={() => setFilterRarity(r)}
                          className={`min-h-[44px] px-4 py-2 font-black uppercase text-xs border-2 transition-all active:scale-90 shrink-0 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none cursor-pointer ${
                            isActive
                              ? 'bg-white text-black border-black shadow-[3px_3px_0px_#fbbf24]'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>

                  {filteredTrophies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400 text-center border-4 border-dashed border-slate-900">
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
                        className="mt-4 min-h-[44px] px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400 uppercase hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Reset Realm Filters
                      </button>
                    </div>
                  ) : (
                    <div role="list" aria-label="Trophies" className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {filteredTrophies.map((trophy) => {
                        const isSelected = Boolean(
                          selectedCard && matchesTrophyDef(selectedCard.id, trophy.id)
                        );
                        const isLocked = !trophy.isUnlocked;

                        return (
                          <button
                            type="button"
                            key={trophy.id}
                            role="listitem"
                            aria-pressed={isSelected}
                            aria-label={`${trophy.title}, ${trophy.rarity} tier, ${isLocked ? 'locked' : 'unlocked'}${trophy.predictedRating && !isLocked ? `, rating ${trophy.predictedRating}` : ''}`}
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
                            className={`group relative p-4 border-3 transition-all flex flex-col justify-between aspect-[4/5] overflow-hidden cursor-pointer w-full text-left motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none ${
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
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {trophy.rarity}
                              </span>

                              {isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
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
                            <div className="flex items-center justify-center my-4 group-hover:scale-110 transition-transform duration-300 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:animate-none">
                              {renderBadgePiece(trophy)}
                            </div>

                            {/* Title & Stats */}
                            <div className="mt-auto">
                              <h4
                                className={`font-black text-xs uppercase leading-tight line-clamp-2 mb-2 ${
                                  isSelected
                                    ? 'text-black'
                                    : isLocked
                                    ? 'text-slate-300'
                                    : 'text-amber-300'
                                }`}
                              >
                                {trophy.title}
                              </h4>
                              <div className="flex items-center justify-between pt-2 border-t border-black/20 dark:border-white/10">
                                <span
                                  className={`text-[11px] font-black uppercase tracking-tighter ${
                                    isSelected
                                      ? 'text-black/80'
                                      : isLocked
                                      ? 'text-slate-300'
                                      : 'text-slate-300'
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

                            {/* Accessible screen reader text for lock status & rarity (STEP 3e) */}
                            <span className="sr-only">
                              {trophy.title} is {isLocked ? 'locked' : 'unlocked'}, {trophy.rarity} tier.
                            </span>

                            {/* Locked Cross-hatch Overlay */}
                            {isLocked && (
                              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
                            )}
                          </button>
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
