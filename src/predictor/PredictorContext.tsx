/**
 * PredictorContext - Central State Store & Real-time Action Observer
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { AchievementCard, GameModeKey, MatchSessionStats, PlayerActionObserved, PredictorState, RatingSnapshot, TacticalMetrics } from './types';
import { calculateMoveRatingUpdate, evaluateMoveQuality, INITIAL_BASELINE_RATING, applyMatchResultAdjustment } from './ratingEngine';
import { evaluateEarnedCards } from './cardDefs';
import type { PieceColor } from '../types/game';

interface PredictorContextValue {
  state: PredictorState;
  observeMoveAction: (action: PlayerActionObserved, currentMetrics: TacticalMetrics) => void;
  finalizeMatch: (
    matchId: string,
    mode: GameModeKey,
    playerColor: PieceColor,
    outcome: 'win' | 'loss' | 'draw',
    metrics: TacticalMetrics,
    opponentName: string,
    opponentDifficulty?: 'grandmaster' | 'master' | 'pvp_human' | 'couples_partner'
  ) => AchievementCard[];
  clearPredictorSession: () => void;
  latestMatchCards: AchievementCard[];
  clearLatestMatchCards: () => void;
}

const STORAGE_KEY = 'mugenchessx_predictor_session_v1';

const defaultState: PredictorState = {
  currentRating: INITIAL_BASELINE_RATING,
  sessionGamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  earnedCards: [],
  activeMatchStats: null,
};

const PredictorContext = createContext<PredictorContextValue | undefined>(undefined);

export function PredictorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PredictorState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentRating === 'number') {
          return parsed;
        }
      }
    } catch {
      // Fall back to default
    }
    return defaultState;
  });

  const [latestMatchCards, setLatestMatchCards] = useState<AchievementCard[]>([]);

  // Track processed action IDs to prevent double-counting
  const processedActionIds = useRef<Set<string>>(new Set());

  // Sync state to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  const clearPredictorSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    processedActionIds.current.clear();
    setState(defaultState);
    setLatestMatchCards([]);
  }, []);

  const clearLatestMatchCards = useCallback(() => {
    setLatestMatchCards([]);
  }, []);

  const observeMoveAction = useCallback(
    (action: PlayerActionObserved, currentMetrics: TacticalMetrics) => {
      if (!action || !action.id) return;

      // Ignore duplicate events
      if (processedActionIds.current.has(action.id)) {
        return;
      }
      processedActionIds.current.add(action.id);

      setState((prev) => {
        const currentRating = prev.currentRating;
        const moveScore = evaluateMoveQuality(action, currentMetrics);
        const { newRating, delta, tacticalQuality } = calculateMoveRatingUpdate(
          currentRating,
          moveScore,
          action.turnIndex
        );

        const snapshot: RatingSnapshot = {
          turnIndex: action.turnIndex,
          rating: newRating,
          tacticalQuality,
          delta,
          timestamp: action.timestamp || Date.now(),
        };

        const existingStats = prev.activeMatchStats;
        const updatedHistory = existingStats
          ? [...existingStats.ratingHistory, snapshot]
          : [snapshot];

        const updatedStats: MatchSessionStats = {
          matchId: existingStats?.matchId || `match_${action.mode}_${Date.now()}`,
          mode: action.mode,
          playerColor: action.playerColor,
          opponentName: existingStats?.opponentName || 'Opponent',
          initialRating: existingStats?.initialRating || currentRating,
          currentRating: newRating,
          ratingHistory: updatedHistory,
          metrics: currentMetrics,
        };

        return {
          ...prev,
          currentRating: newRating,
          activeMatchStats: updatedStats,
        };
      });
    },
    []
  );

  const finalizeMatch = useCallback(
    (
      matchId: string,
      mode: GameModeKey,
      playerColor: PieceColor,
      outcome: 'win' | 'loss' | 'draw',
      metrics: TacticalMetrics,
      opponentName: string,
      opponentDifficulty?: 'grandmaster' | 'master' | 'pvp_human' | 'couples_partner'
    ): AchievementCard[] => {
      let newlyEarned: AchievementCard[] = [];

      setState((prev) => {
        // Apply final match result rating adjustment
        const { finalRating, resultDelta } = applyMatchResultAdjustment(
          prev.currentRating,
          outcome,
          metrics,
          opponentDifficulty
        );

        // Evaluate earned cards
        const cardDefs = evaluateEarnedCards(
          mode,
          metrics,
          outcome,
          finalRating,
          resultDelta,
          matchId
        );

        newlyEarned = cardDefs.map((def) => ({
          id: `${def.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: def.title,
          mode: def.mode,
          modeLabel: def.modeLabel,
          rarity: def.rarity,
          description: def.description,
          highlight: def.getHighlight(metrics, finalRating),
          predictedRating: finalRating,
          ratingDelta: resultDelta,
          motifSymbol: def.motifSymbol,
          accentColor: def.accentColor,
          pieceType: def.pieceType || 'king',
          pieceColor: def.pieceColor || 'white',
          earnedAt: Date.now(),
          matchId,
          statsSummary: {
            movesCount: metrics.turnsSurvived,
            captures: metrics.capturesMade,
            specialActions: metrics.specialActionsCount,
            outcome,
          },
        }));

        const wins = outcome === 'win' ? prev.wins + 1 : prev.wins;
        const losses = outcome === 'loss' ? prev.losses + 1 : prev.losses;
        const draws = outcome === 'draw' ? prev.draws + 1 : prev.draws;

        // Deduplicate card titles in session collection
        const updatedCards = [...newlyEarned, ...prev.earnedCards];

        return {
          ...prev,
          currentRating: finalRating,
          sessionGamesPlayed: prev.sessionGamesPlayed + 1,
          wins,
          losses,
          draws,
          earnedCards: updatedCards,
          activeMatchStats: null,
        };
      });

      setLatestMatchCards(newlyEarned);
      return newlyEarned;
    },
    []
  );

  return (
    <PredictorContext.Provider
      value={{
        state,
        observeMoveAction,
        finalizeMatch,
        clearPredictorSession,
        latestMatchCards,
        clearLatestMatchCards,
      }}
    >
      {children}
    </PredictorContext.Provider>
  );
}

export function usePredictor() {
  const context = useContext(PredictorContext);
  if (!context) {
    throw new Error('usePredictor must be used within a PredictorProvider');
  }
  return context;
}
