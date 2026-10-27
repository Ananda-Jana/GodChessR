import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { subscribeToChestTriggers, ChestTriggerEvent } from './reportGameEnd';
import { SecretPlayerRewardDef } from './chestConfig';
import { getChestStore, addPendingChestEvent, popPendingChestEvent } from './chestStore';
import { getSecretPlayerById } from '../secret/secretPlayersData';
import { SecretPlayerConfig } from '../secret/types';
import { usePredictor } from '../predictor/PredictorContext';
import { PostGameChestAwardModal } from './PostGameChestAwardModal';

// Lazily load ChestModal so zero chest opening code is included in initial bundle
const LazyChestModal = React.lazy(() =>
  import('./ChestModal').then((m) => ({ default: m.ChestModal }))
);

interface ChestRewardHostProps {
  userId?: string;
  onStartSecretMatch: (botConfig: SecretPlayerConfig) => void;
}

export const ChestRewardHost: React.FC<ChestRewardHostProps> = ({
  userId,
  onStartSecretMatch,
}) => {
  const [activeEvent, setActiveEvent] = useState<ChestTriggerEvent | null>(null);
  const [phase, setPhase] = useState<'prompt' | 'open' | null>(null);
  const { applyRatingBoost } = usePredictor();

  // Subscribe to game end chest triggers
  useEffect(() => {
    const unsubscribe = subscribeToChestTriggers((event) => {
      try {
        if (phase !== null) {
          // If a chest modal is already active on screen, queue as pending
          addPendingChestEvent(event, event.userId || userId);
        } else {
          setActiveEvent(event);
          if (event.directOpen) {
            setPhase('open');
          } else {
            setPhase('prompt');
          }
        }
      } catch {
        // Safe fail
      }
    });

    return () => {
      unsubscribe();
    };
  }, [phase, userId]);

  const handleOpenNow = () => {
    if (!activeEvent) return;
    // Consume from pending since it is being opened now
    popPendingChestEvent(activeEvent.userId || userId);
    setPhase('open');
  };

  const handleSaveToInventory = () => {
    if (activeEvent) {
      addPendingChestEvent(activeEvent, activeEvent.userId || userId);
    }
    setPhase(null);
    setActiveEvent(null);
  };

  const handleChestModalClose = (wasOpened: boolean) => {
    const closedEvent = activeEvent;
    setPhase(null);
    setActiveEvent(null);

    if (!wasOpened && closedEvent) {
      // Closed before tap 3 completed: re-queue into pending
      addPendingChestEvent(closedEvent, userId);
    }
  };

  const handlePlaySecretPlayer = (reward: SecretPlayerRewardDef) => {
    setPhase(null);
    setActiveEvent(null);

    try {
      const botConfig = getSecretPlayerById(reward.id);
      if (botConfig) {
        onStartSecretMatch(botConfig);
      }
    } catch {
      // Safe fail
    }
  };

  if (!phase || !activeEvent) return null;

  return (
    <>
      {/* Phase 1: Standalone Post-Game Award Modal with "Open Now" or "Save to Inventory" */}
      <PostGameChestAwardModal
        isOpen={phase === 'prompt'}
        result={activeEvent.result}
        mode={activeEvent.mode}
        onOpenNow={handleOpenNow}
        onSaveToInventory={handleSaveToInventory}
      />

      {/* Phase 2: Interactive 3-Tap Chest Unlocking Modal */}
      {phase === 'open' && (
        <Suspense fallback={null}>
          <LazyChestModal
            isOpen={true}
            result={activeEvent.result}
            resigned={activeEvent.resigned}
            matchId={activeEvent.matchId}
            initialEloBoost={activeEvent.eloBoost}
            onApplyEloBoost={applyRatingBoost}
            onClose={handleChestModalClose}
            onPlaySecretPlayer={handlePlaySecretPlayer}
            userId={userId}
          />
        </Suspense>
      )}
    </>
  );
};
