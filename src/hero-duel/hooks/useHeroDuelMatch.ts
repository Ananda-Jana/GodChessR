import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HeroDuelState,
  Action,
  Coord,
  HeroInstance,
  AiDifficulty,
} from '../types/heroDuelTypes';
import { CollectibleHeroCard } from '../types/cardTypes';
import {
  createInitialHeroDuelState,
  applyHeroDuelAction,
  getLegalHeroMoves,
  getValidActiveTargets,
} from '../engine/heroDuelEngine';
import { getEasyBotAction } from '../ai/easyBot';
import { getNormalBotAction } from '../ai/normalBot';
import { getHardBotAction } from '../ai/hardBot';
import { generateDefeatedHeroCard } from '../cards/cardGenerator';
import { saveCardToCollection } from '../cards/collectionStore';
import { sounds } from '../../utils/audio';

interface UseHeroDuelMatchProps {
  team1Heroes: HeroInstance[];
  team2Heroes: HeroInstance[];
  difficulty?: AiDifficulty;
  isPassAndPlay?: boolean;
}

export function useHeroDuelMatch({
  team1Heroes,
  team2Heroes,
  difficulty = 'normal',
  isPassAndPlay = false,
}: UseHeroDuelMatchProps) {
  const [matchState, setMatchState] = useState<HeroDuelState>(() =>
    createInitialHeroDuelState(team1Heroes, team2Heroes, isPassAndPlay ? 'pass_and_play' : 'ai')
  );

  const [selectedCoord, setSelectedCoord] = useState<Coord | null>(null);
  const [legalMoves, setLegalMoves] = useState<Coord[]>([]);
  const [activeTargetMode, setActiveTargetMode] = useState<boolean>(false);
  const [activeTargets, setActiveTargets] = useState<Coord[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [earnedCards, setEarnedCards] = useState<CollectibleHeroCard[]>([]);

  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef(matchState);
  stateRef.current = matchState;

  // Track hero kills to award cards
  const previousAliveHeroesRef = useRef<Set<string>>(
    new Set(matchState.heroes.filter((h) => h.isAlive).map((h) => `${h.team}_${h.instanceId}`))
  );

  // Check for killed heroes on state change and grant cards
  useEffect(() => {
    const currentAlive = new Set<string>(
      matchState.heroes.filter((h) => h.isAlive).map((h) => `${h.team}_${h.instanceId}`)
    );

    matchState.heroes.forEach((h) => {
      const key = `${h.team}_${h.instanceId}`;
      if (previousAliveHeroesRef.current.has(key) && !currentAlive.has(key)) {
        // Hero was just killed! If killed hero is Team 2 (enemy), award a card to the player!
        if (h.team === 2 || isPassAndPlay) {
          const card = generateDefeatedHeroCard(h.heroId);
          saveCardToCollection(card);
          setEarnedCards((prev) => [card, ...prev]);
        }
      }
    });

    previousAliveHeroesRef.current = currentAlive;
  }, [matchState.heroes, isPassAndPlay]);

  // Clean up AI timer on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  // Run AI Turn if it's Team 2's turn and not pass-and-play
  useEffect(() => {
    if (isPassAndPlay || matchState.winner || matchState.currentTurn !== 2) {
      return;
    }

    setIsAiThinking(true);

    // Run AI deferred to guarantee 60fps mobile responsiveness
    aiTimerRef.current = setTimeout(() => {
      const currentState = stateRef.current;
      if (currentState.currentTurn !== 2 || currentState.winner) {
        setIsAiThinking(false);
        return;
      }

      let aiAction: Action | null = null;
      if (difficulty === 'easy') {
        aiAction = getEasyBotAction(currentState, 2);
      } else if (difficulty === 'hard') {
        aiAction = getHardBotAction(currentState, 2);
      } else {
        aiAction = getNormalBotAction(currentState, 2);
      }

      if (aiAction) {
        const nextState = applyHeroDuelAction(currentState, aiAction);
        if (aiAction.type === 'move') {
          sounds.playMove();
        } else if (aiAction.type === 'active') {
          sounds.playAbility();
        }
        setMatchState(nextState);
      }

      setIsAiThinking(false);
    }, 450);
  }, [matchState.currentTurn, matchState.winner, isPassAndPlay, difficulty]);

  // Handle Square Selection
  const handleSelectSquare = useCallback(
    (coord: Coord) => {
      if (matchState.winner || (matchState.currentTurn === 2 && !isPassAndPlay)) {
        return;
      }

      // If in Active Target Mode
      if (activeTargetMode && selectedCoord) {
        const isTarget = activeTargets.some((t) => t.x === coord.x && t.y === coord.y);
        if (isTarget) {
          const action: Action = {
            type: 'active',
            team: matchState.currentTurn,
            from: selectedCoord,
            target: coord,
          };
          const nextState = applyHeroDuelAction(matchState, action);
          sounds.playAbility();
          setMatchState(nextState);
          setActiveTargetMode(false);
          setActiveTargets([]);
          setSelectedCoord(null);
          setLegalMoves([]);
          return;
        }
      }

      const occupant = matchState.heroes.find(
        (h) => h.isAlive && h.pos.x === coord.x && h.pos.y === coord.y
      );

      // If clicking already selected hero
      if (selectedCoord && selectedCoord.x === coord.x && selectedCoord.y === coord.y) {
        setSelectedCoord(null);
        setLegalMoves([]);
        setActiveTargetMode(false);
        setActiveTargets([]);
        return;
      }

      // If a hero is selected and clicking on a legal move destination
      if (selectedCoord) {
        const isLegal = legalMoves.some((m) => m.x === coord.x && m.y === coord.y);
        if (isLegal) {
          const action: Action = {
            type: 'move',
            team: matchState.currentTurn,
            from: selectedCoord,
            to: coord,
          };
          const nextState = applyHeroDuelAction(matchState, action);
          sounds.playMove();
          setMatchState(nextState);
          setSelectedCoord(null);
          setLegalMoves([]);
          setActiveTargetMode(false);
          setActiveTargets([]);
          return;
        }
      }

      // Select ally hero
      if (occupant && occupant.team === matchState.currentTurn) {
        setSelectedCoord(coord);
        setActiveTargetMode(false);
        setActiveTargets([]);
        const moves = getLegalHeroMoves(matchState, occupant);
        setLegalMoves(moves);
      } else {
        setSelectedCoord(null);
        setLegalMoves([]);
        setActiveTargetMode(false);
        setActiveTargets([]);
      }
    },
    [matchState, selectedCoord, legalMoves, activeTargetMode, activeTargets, isPassAndPlay]
  );

  // Trigger Active Ability targeting mode
  const handleTriggerActive = useCallback(() => {
    if (!selectedCoord) return;
    const hero = matchState.heroes.find(
      (h) => h.isAlive && h.pos.x === selectedCoord.x && h.pos.y === selectedCoord.y
    );
    if (!hero || hero.team !== matchState.currentTurn || hero.currentCooldown > 0 || hero.isSilenced) {
      return;
    }

    const targets = getValidActiveTargets(matchState, hero);
    if (targets.length === 0) {
      // If self-targeted active with no external target needed
      const action: Action = {
        type: 'active',
        team: matchState.currentTurn,
        from: selectedCoord,
      };
      const nextState = applyHeroDuelAction(matchState, action);
      sounds.playAbility();
      setMatchState(nextState);
      setSelectedCoord(null);
      setLegalMoves([]);
      return;
    }

    setActiveTargetMode(true);
    setActiveTargets(targets);
  }, [matchState, selectedCoord]);

  // Cancel Active Targeting
  const handleCancelActive = useCallback(() => {
    setActiveTargetMode(false);
    setActiveTargets([]);
  }, []);

  const selectedHero = selectedCoord
    ? matchState.heroes.find(
        (h) => h.isAlive && h.pos.x === selectedCoord.x && h.pos.y === selectedCoord.y
      ) || null
    : null;

  return {
    matchState,
    selectedCoord,
    selectedHero,
    legalMoves,
    activeTargetMode,
    activeTargets,
    isAiThinking,
    earnedCards,
    handleSelectSquare,
    handleTriggerActive,
    handleCancelActive,
  };
}
