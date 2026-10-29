/**
 * useTrophyRoomData.ts - Shared Hook for Trophy Room Logic Across Desktop & Mobile
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePredictor } from '../../predictor/PredictorContext';
import { useAuth } from '../../context/AuthContext';
import { drawAchievementCard, downloadCardAsPng } from '../../predictor/canvasCardRenderer';
import type { AchievementCard, CardRarity, GameModeKey } from '../../predictor/types';
import { CARD_DEFINITIONS } from '../../predictor/cardDefs';
import {
  getChestStore,
  getClaimedRewards,
  PendingChestEvent,
} from '../../chest/chestStore';
import { triggerChestModalNow } from '../../chest/reportGameEnd';
import { getGems } from '../../economy/mugenStore';
import {
  getRankFromTrophies,
  getRankProgress,
  RANK_CONFIGS,
  RankDefinition,
  RankProgressInfo,
} from '../../league/rankConfig';

export type TrophyMainView = 'trophies' | 'league' | 'inventory' | 'mugenpass';
export type InventorySubTab = 'pending' | 'claimed';

export function useTrophyRoomData(
  isOpen: boolean,
  onClose: () => void,
  initialCard?: AchievementCard | null,
  initialMainView: TrophyMainView = 'trophies'
) {
  const { state: predictorState, clearPredictorSession } = usePredictor();
  const { user } = useAuth();

  const [mainView, setMainView] = useState<TrophyMainView>(initialMainView);

  useEffect(() => {
    if (isOpen) {
      setMainView(initialMainView);
    }
  }, [isOpen, initialMainView]);
  const [inventorySubTab, setInventorySubTab] = useState<InventorySubTab>('pending');
  const [selectedCard, setSelectedCard] = useState<AchievementCard | null>(initialCard || null);
  const [filterMode, setFilterMode] = useState<GameModeKey | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'all'>('all');
  const [storeTick, setStoreTick] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Chest Store Data
  const chestStore = getChestStore(user?.id);
  const claimedRewards = getClaimedRewards(user?.id);

  const pendingChestsList: PendingChestEvent[] =
    chestStore.pendingEvents && chestStore.pendingEvents.length > 0
      ? chestStore.pendingEvents
      : Array.from({ length: chestStore.pending }, (_, i) => ({
          matchId: `pending_${i}`,
          mode: 'Match Loot',
          result: 'win' as const,
        }));

  const pendingChestsCount = pendingChestsList.length;
  const currentGems = getGems(user?.id || 'guest');

  // Server/User League Data
  const currentTrophies = (user as any)?.trophies ?? 0;
  const rankProgress: RankProgressInfo = getRankProgress(currentTrophies);
  const currentRank: RankDefinition = rankProgress.currentRank;

  const [promotionData, setPromotionData] = useState<{
    oldRank: RankDefinition;
    newRank: RankDefinition;
    newTrophies: number;
    gemsAwarded: number;
  } | null>(null);

  // Listen for storage / store updates & league updates
  useEffect(() => {
    if (isOpen) {
      setStoreTick((t) => t + 1);
    }
    const handleUpdate = () => setStoreTick((t) => t + 1);
    const handleLeagueUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      const res = custom.detail;
      if (res && res.promoted && res.oldRank && res.newRank) {
        setPromotionData({
          oldRank: res.oldRank,
          newRank: res.newRank,
          newTrophies: res.newTrophies,
          gemsAwarded: res.gemsAwarded || 0,
        });
      }
      setStoreTick((t) => t + 1);
    };

    window.addEventListener('trophy_room_updated', handleUpdate);
    window.addEventListener('mugen_chest_stored', handleUpdate);
    window.addEventListener('league:updated', handleLeagueUpdated);
    return () => {
      window.removeEventListener('trophy_room_updated', handleUpdate);
      window.removeEventListener('mugen_chest_stored', handleUpdate);
      window.removeEventListener('league:updated', handleLeagueUpdated);
    };
  }, [isOpen]);

  // Sync selected card
  useEffect(() => {
    if (!isOpen) return;

    if (initialCard) {
      setSelectedCard(initialCard);
    } else if (predictorState.earnedCards.length > 0) {
      if (!selectedCard || !predictorState.earnedCards.some((c) => c.id === selectedCard.id)) {
        setSelectedCard(predictorState.earnedCards[0]);
      }
    } else if (selectedCard && !selectedCard.id.endsWith('_locked')) {
      setSelectedCard(null);
    }
  }, [isOpen, initialCard, predictorState.earnedCards]);

  const matchesTrophyDef = (cardId: string, defId: string) =>
    cardId === defId || cardId.startsWith(`${defId}_`);

  // Merge definitions with earned state
  const allTrophyData = CARD_DEFINITIONS.map((def) => {
    const instances = predictorState.earnedCards.filter(
      (c) => !c.id.endsWith('_locked') && (matchesTrophyDef(c.id, def.id) || c.title === def.title)
    );
    const isUnlocked = instances.length > 0;
    const earnedInstance = isUnlocked ? instances[0] : null;

    return {
      ...def,
      isUnlocked,
      earnedInstance,
      instances,
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
      (predictorState.earnedCards.some((c) => c.id === selectedCard.id) ||
        Boolean(selectedTrophy?.isUnlocked))
  );

  const effectiveSelectedCard =
    selectedCard &&
    selectedCard.id.endsWith('_locked') &&
    selectedTrophy?.isUnlocked &&
    selectedTrophy.earnedInstance
      ? selectedTrophy.earnedInstance
      : selectedCard;

  // Render 1:1 square canvas card preview
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

  const filteredTrophies = allTrophyData.filter((t) => {
    if (filterMode !== 'all' && t.mode !== filterMode) return false;
    if (filterRarity !== 'all' && t.rarity !== filterRarity) return false;
    return true;
  });

  const unlockedCount = allTrophyData.filter((t) => t.isUnlocked).length;
  const totalCount = allTrophyData.length;

  const handleOpenChest = useCallback(() => {
    onClose();
    triggerChestModalNow(user?.id, true);
    setTimeout(() => {
      setStoreTick((t) => t + 1);
    }, 300);
  }, [onClose, user?.id]);

  const handleDownloadSelectedCard = useCallback(() => {
    if (isSelectedCardUnlocked && effectiveSelectedCard) {
      downloadCardAsPng(effectiveSelectedCard);
    }
  }, [isSelectedCardUnlocked, effectiveSelectedCard]);

  const handleFactoryReset = useCallback(() => {
    if (window.confirm('WIPE ALL PROGRESS? This will erase all badges and ratings permanently.')) {
      clearPredictorSession();
      setSelectedCard(null);
    }
  }, [clearPredictorSession]);

  return {
    user,
    mainView,
    setMainView,
    inventorySubTab,
    setInventorySubTab,
    selectedCard,
    setSelectedCard,
    effectiveSelectedCard,
    isSelectedCardUnlocked,
    filterMode,
    setFilterMode,
    filterRarity,
    setFilterRarity,
    canvasRef,
    filteredTrophies,
    allTrophyData,
    unlockedCount,
    totalCount,
    pendingChestsList,
    pendingChestsCount,
    claimedRewards,
    currentGems,
    currentTrophies,
    currentRank,
    rankProgress,
    allRanks: RANK_CONFIGS,
    promotionData,
    closePromotionModal: () => setPromotionData(null),
    handleOpenChest,
    handleDownloadSelectedCard,
    handleFactoryReset,
    matchesTrophyDef,
  };
}
