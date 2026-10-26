import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { subscribeToChestTriggers, ChestTriggerEvent } from './reportGameEnd';
import { SecretPlayerRewardDef } from './chestConfig';
import { getChestStore, addPendingChestEvent, popPendingChestEvent } from './chestStore';
import { getSecretPlayerById } from '../secret/secretPlayersData';
import { SecretPlayerConfig } from '../secret/types';
import { usePredictor } from '../predictor/PredictorContext';

// Lazily load ChestModal so zero chest code is included in initial bundle
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { applyRatingBoost } = usePredictor();

  // Check and pop pending chests if available
  const tryOpenPending = useCallback(() => {
    try {
      const pendingEvent = popPendingChestEvent(userId);
      if (pendingEvent) {
        setActiveEvent(pendingEvent);
        setIsOpen(true);
      }
    } catch {
      // Fail safely
    }
  }, [userId]);

  // Check for pending chests on mount (e.g. when returning to Dashboard)
  useEffect(() => {
    const timer = setTimeout(() => {
      tryOpenPending();
    }, 400);
    return () => clearTimeout(timer);
  }, [tryOpenPending]);

  // Subscribe to game end chest triggers
  useEffect(() => {
    const unsubscribe = subscribeToChestTriggers((event) => {
      try {
        if (isOpen) {
          // If modal is currently displayed, store as pending
          addPendingChestEvent(event, event.userId || userId);
        } else {
          popPendingChestEvent(event.userId || userId);
          setActiveEvent(event);
          setIsOpen(true);
        }
      } catch {
        // Safe fail
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, userId]);

  const handleClose = (wasOpened: boolean) => {
    const closedEvent = activeEvent;
    setIsOpen(false);
    setActiveEvent(null);

    if (!wasOpened && closedEvent) {
      // Closed before tap 3: re-queue into pending
      addPendingChestEvent(closedEvent, userId);
    } else {
      // Opened successfully: if there are pending chests, show next after brief 400ms pause
      const store = getChestStore(userId);
      if (store.pending > 0 || (store.pendingEvents && store.pendingEvents.length > 0)) {
        setTimeout(() => {
          tryOpenPending();
        }, 400);
      }
    }
  };

  const handlePlaySecretPlayer = (reward: SecretPlayerRewardDef) => {
    setIsOpen(false);
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

  if (!isOpen || !activeEvent) return null;

  return (
    <Suspense fallback={null}>
      <LazyChestModal
        isOpen={isOpen}
        result={activeEvent.result}
        resigned={activeEvent.resigned}
        matchId={activeEvent.matchId}
        initialEloBoost={activeEvent.eloBoost}
        onApplyEloBoost={applyRatingBoost}
        onClose={handleClose}
        onPlaySecretPlayer={handlePlaySecretPlayer}
        userId={userId}
      />
    </Suspense>
  );
};
