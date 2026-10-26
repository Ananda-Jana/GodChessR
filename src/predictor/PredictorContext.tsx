/**
 * PredictorContext - Central State Store & Real-time Action Observer
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { AchievementCard, GameModeKey, MatchSessionStats, PlayerActionObserved, PredictorState, RatingSnapshot, TacticalMetrics } from './types';
import { calculateMoveRatingUpdate, evaluateMoveQuality, INITIAL_BASELINE_RATING, applyMatchResultAdjustment } from './ratingEngine';
import { evaluateEarnedCards } from './cardDefs';
import type { PieceColor } from '../types/game';
import { useAuth } from '../context/AuthContext';

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
  applyRatingBoost: (boostAmount: number, matchId?: string) => void;
}

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
  const { user } = useAuth();
  const currentUserId = user?.id || 'guest';
  const prevUserIdRef = useRef<string | null>(null);

  const [state, setState] = useState<PredictorState>(() => defaultState);
  const stateRef = useRef<PredictorState>(defaultState);
  stateRef.current = state;
  const [latestMatchCards, setLatestMatchCards] = useState<AchievementCard[]>([]);

  // Track processed action IDs to prevent double-counting
  const processedActionIds = useRef<Set<string>>(new Set());

  // Handle active user switches, new registrations, or logouts
  useEffect(() => {
    // Always clear legacy un-scoped session keys
    try {
      sessionStorage.removeItem('mugenchessx_predictor_session_v1');
    } catch {
      // Ignore
    }

    if (prevUserIdRef.current !== currentUserId) {
      processedActionIds.current.clear();
      setLatestMatchCards([]);

      if (currentUserId && currentUserId !== 'guest') {
        const userKey = `mugenchessx_predictor_user_${currentUserId}`;
        try {
          const saved = sessionStorage.getItem(userKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed.currentRating === 'number') {
              setState(parsed);
              prevUserIdRef.current = currentUserId;
              return;
            }
          }
        } catch {
          // Ignore parse errors
        }
      }

      // Default pristine state for guest / newly registered user
      setState(defaultState);
      prevUserIdRef.current = currentUserId;
    }
  }, [currentUserId]);

  // Sync current state to user-scoped storage
  useEffect(() => {
    if (!currentUserId || currentUserId === 'guest') return;
    const userKey = `mugenchessx_predictor_user_${currentUserId}`;
    try {
      sessionStorage.setItem(userKey, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state, currentUserId]);

  const clearPredictorSession = useCallback(() => {
    try {
      sessionStorage.removeItem('mugenchessx_predictor_session_v1');
      if (currentUserId && currentUserId !== 'guest') {
        sessionStorage.removeItem(`mugenchessx_predictor_user_${currentUserId}`);
      }
    } catch {
      // Ignore
    }
    processedActionIds.current.clear();
    setState(defaultState);
    setLatestMatchCards([]);
  }, [currentUserId]);

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
      const currentState = stateRef.current;

      // Apply final match result rating adjustment synchronously
      const { finalRating, resultDelta } = applyMatchResultAdjustment(
        currentState.currentRating,
        outcome,
        metrics,
        opponentDifficulty
      );

      // Evaluate earned cards synchronously
      const cardDefs = evaluateEarnedCards(
        mode,
        metrics,
        outcome,
        finalRating,
        resultDelta,
        matchId
      );

      const newlyEarned: AchievementCard[] = cardDefs.map((def) => ({
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

      const wins = outcome === 'win' ? currentState.wins + 1 : currentState.wins;
      const losses = outcome === 'loss' ? currentState.losses + 1 : currentState.losses;
      const draws = outcome === 'draw' ? currentState.draws + 1 : currentState.draws;

      const updatedCards = [...newlyEarned, ...currentState.earnedCards];

      const nextState: PredictorState = {
        ...currentState,
        currentRating: finalRating,
        sessionGamesPlayed: currentState.sessionGamesPlayed + 1,
        wins,
        losses,
        draws,
        earnedCards: updatedCards,
        activeMatchStats: null,
      };

      stateRef.current = nextState;
      setState(nextState);
      setLatestMatchCards(newlyEarned);
      return newlyEarned;
    },
    []
  );

  const appliedRatingMatchIdsRef = useRef<Set<string>>(new Set());

  const applyRatingBoost = useCallback(
    (boostAmount: number, matchId?: string) => {
      try {
        if (!boostAmount || boostAmount <= 0) return;
        if (matchId) {
          if (appliedRatingMatchIdsRef.current.has(matchId)) return;
          appliedRatingMatchIdsRef.current.add(matchId);
        }

        setState((prev) => {
          const nextRating = Math.max(100, Math.min(3000, prev.currentRating + boostAmount));
          const nextState: PredictorState = {
            ...prev,
            currentRating: nextRating,
          };
          stateRef.current = nextState;
          if (currentUserId && currentUserId !== 'guest') {
            const userKey = `mugenchessx_predictor_user_${currentUserId}`;
            try {
              sessionStorage.setItem(userKey, JSON.stringify(nextState));
            } catch {}
          }
          return nextState;
        });
      } catch {}
    },
    [currentUserId]
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
        applyRatingBoost,
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
