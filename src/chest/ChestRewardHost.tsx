import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { subscribeToChestTriggers, ChestTriggerEvent } from './reportGameEnd';
import { SecretPlayerRewardDef } from './chestConfig';
import { getChestStore, addPendingChest, consumePendingChest } from './chestStore';
import { getSecretPlayerById } from '../secret/secretPlayersData';
import { SecretPlayerConfig } from '../secret/types';

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

  // Check and pop pending chests if available
  const tryOpenPending = useCallback(() => {
    try {
      const store = getChestStore(userId);
      if (store.pending > 0) {
        consumePendingChest(userId);
        setActiveEvent({
          matchId: `pending_${Date.now()}`,
          mode: 'pending',
          result: 'win',
          userId,
        });
        setIsOpen(true);
      }
    } catch {
      // Fail safely
    }
  }, [userId]);

  // Subscribe to game end chest triggers
  useEffect(() => {
    const unsubscribe = subscribeToChestTriggers((event) => {
      try {
        if (isOpen) {
          // If modal is currently displayed, store as pending
          addPendingChest(event.userId || userId);
        } else {
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
    setIsOpen(false);
    setActiveEvent(null);

    if (!wasOpened) {
      // Closed before tap 3: increment pending
      addPendingChest(userId);
    } else {
      // Opened successfully: if there are pending chests, show next after brief 400ms pause
      const store = getChestStore(userId);
      if (store.pending > 0) {
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
        onClose={handleClose}
        onPlaySecretPlayer={handlePlaySecretPlayer}
        userId={userId}
      />
    </Suspense>
  );
};
