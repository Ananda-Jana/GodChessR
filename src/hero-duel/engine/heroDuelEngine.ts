import { BOARD_COLS, BOARD_ROWS, BoardPosition, DEFAULT_PLAYER_1_SPOTS, DEFAULT_PLAYER_2_SPOTS } from '../config/boardConfig';
import { MAX_MATCH_ROUNDS, P1_STARTING_COOLDOWN_OFFSET, P2_STARTING_COOLDOWN_OFFSET } from '../config/balanceConfig';
import { getHeroById } from '../heroes/heroRegistry';
import {
  HeroAction,
  HeroDuelMatchState,
  HeroId,
  InGameHeroState,
  PlayerSide,
  WinReason,
  Coord,
  HeroInstance,
  HeroZone,
  HeroDuelState,
  Action,
} from '../types/heroDuelTypes';
import { getChebyshevDistance, isSamePos, isWithinBoard, posToNotation } from './boardGeometry';
import { evaluateCaptureAttempt, isSilencedByRoyalSilence } from './priorityEngine';
import { applyStatus } from './statusManager';
import { endTurnAndAdvance } from './turnManager';
import { createZone, getDecoyAt, isSquareBlockedByZone } from './zoneManager';
import { getLegalMovesForHero } from './moveGenerator';

/**
 * Creates a fresh Hero Duel match in the draft or placement phase
 */
export function createHeroDuelMatch(
  id: string,
  player1Name: string,
  player2Name: string,
  isP2Ai: boolean = true,
  aiLevel: 'easy' | 'normal' | 'hard' = 'normal',
  p1Draft?: { heroes: HeroId[]; captainId: HeroId; equipment?: Record<HeroId, string> },
  p2Draft?: { heroes: HeroId[]; captainId: HeroId; equipment?: Record<HeroId, string> }
): HeroDuelMatchState {
  const p1Heroes: InGameHeroState[] = (p1Draft?.heroes || []).map((hId, idx) => {
    const def = getHeroById(hId);
    return {
      instanceId: `p1_hero_${idx}_${hId}`,
      heroId: hId,
      owner: 'player1',
      position: DEFAULT_PLAYER_1_SPOTS[idx] || { x: idx, y: 0 },
      isCaptain: hId === p1Draft?.captainId,
      isAlive: true,
      currentCooldown: P1_STARTING_COOLDOWN_OFFSET, // CD 1 for P1 (ready turn 2)
      passiveCooldowns: {},
      passiveUsedFlags: {},
      statuses: [],
      equippedItemId: p1Draft?.equipment?.[hId],
    };
  });

  const p2Heroes: InGameHeroState[] = (p2Draft?.heroes || []).map((hId, idx) => {
    const def = getHeroById(hId);
    return {
      instanceId: `p2_hero_${idx}_${hId}`,
      heroId: hId,
      owner: 'player2',
      position: DEFAULT_PLAYER_2_SPOTS[idx] || { x: idx, y: 7 },
      isCaptain: hId === p2Draft?.captainId,
      isAlive: true,
      currentCooldown: P2_STARTING_COOLDOWN_OFFSET, // CD 0 for P2 (ready turn 1)
      passiveCooldowns: {},
      passiveUsedFlags: {},
      statuses: [],
      equippedItemId: p2Draft?.equipment?.[hId],
    };
  });

  return {
    id,
    phase: 'battle',
    turnNumber: 1,
    activeSide: 'player1',
    player1: {
      name: player1Name,
      isAi: false,
      heroes: p1Heroes,
      equipmentPowerSpent: 0,
    },
    player2: {
      name: player2Name,
      isAi: isP2Ai,
      aiLevel,
      heroes: p2Heroes,
      equipmentPowerSpent: 0,
    },
    zones: [],
    history: [],
    boardPositionsHistory: [],
    killsThisMatch: [],
  };
}

/**
 * Executes a player action (Move or Ability)
 */
export function executeHeroAction(
  state: HeroDuelMatchState,
  action: HeroAction
): { state: HeroDuelMatchState; success: boolean; error?: string } {
  if (state.phase !== 'battle') {
    return { state, success: false, error: 'Match is not in battle phase' };
  }

  const activeSide = state.activeSide;
  const activeTeam = activeSide === 'player1' ? state.player1 : state.player2;
  const opponentTeam = activeSide === 'player1' ? state.player2 : state.player1;

  const actor = activeTeam.heroes.find((h) => h.instanceId === action.actorInstanceId);
  if (!actor || !actor.isAlive) {
    return { state, success: false, error: 'Actor hero is invalid or dead' };
  }

  let nextP1Heroes = [...state.player1.heroes];
  let nextP2Heroes = [...state.player2.heroes];
  let nextZones = [...state.zones];
  let killedHeroId: HeroId | undefined = undefined;
  let notation = '';

  const allAliveHeroes = () =>
    [...nextP1Heroes, ...nextP2Heroes].filter((h) => h.isAlive);

  if (action.type === 'move') {
    const from = action.from;
    const to = action.to;

    // Check if stepping on a decoy zone
    const decoy = getDecoyAt(nextZones, to);
    if (decoy) {
      // Attacker wastes move stepping on decoy; decoy is destroyed
      nextZones = nextZones.filter((z) => z.id !== decoy.id);
      notation = `${actor.heroId.toUpperCase()} steps into Decoy at ${posToNotation(to)}`;
    }

    // Check if landing on an enemy hero (capture)
    const opponentHeroIdx = (activeSide === 'player1' ? nextP2Heroes : nextP1Heroes).findIndex(
      (h) => h.isAlive && isSamePos(h.position, to)
    );

    if (opponentHeroIdx !== -1) {
      const oppHero = (activeSide === 'player1' ? nextP2Heroes : nextP1Heroes)[opponentHeroIdx];

      // Evaluate capture protections (Thick Hide, Second Crown, etc.)
      const emptyBackRanks = (activeSide === 'player1' ? [6, 7] : [0, 1]).flatMap((y) =>
        Array.from({ length: BOARD_COLS }, (_, x) => ({ x, y }))
      ).filter((pos) => !allAliveHeroes().some((h) => isSamePos(h.position, pos)));

      const capResult = evaluateCaptureAttempt(actor, oppHero, from, emptyBackRanks, true);

      if (!capResult.allowed) {
        if (capResult.consumedPassive === 'thick_hide') {
          // Thick hide consumed! Opponent stays, actor is repelled back to start
          if (activeSide === 'player1') {
            nextP2Heroes[opponentHeroIdx] = {
              ...oppHero,
              passiveUsedFlags: { ...oppHero.passiveUsedFlags, thick_hide: true },
            };
          } else {
            nextP1Heroes[opponentHeroIdx] = {
              ...oppHero,
              passiveUsedFlags: { ...oppHero.passiveUsedFlags, thick_hide: true },
            };
          }
          notation = `${actor.heroId} attacked ${oppHero.heroId} - Repelled by Thick Hide!`;
        } else {
          return { state, success: false, error: capResult.notes || 'Capture blocked' };
        }
      } else if (capResult.consumedPassive === 'second_crown' && capResult.defenderRelocatedTo) {
        // Second Crown: King relocates instead of dying
        if (activeSide === 'player1') {
          nextP2Heroes[opponentHeroIdx] = {
            ...oppHero,
            position: capResult.defenderRelocatedTo,
            passiveUsedFlags: { ...oppHero.passiveUsedFlags, second_crown: true },
          };
        } else {
          nextP1Heroes[opponentHeroIdx] = {
            ...oppHero,
            position: capResult.defenderRelocatedTo,
            passiveUsedFlags: { ...oppHero.passiveUsedFlags, second_crown: true },
          };
        }

        // Actor moves onto the square
        if (activeSide === 'player1') {
          const actIdx = nextP1Heroes.findIndex((h) => h.instanceId === actor.instanceId);
          nextP1Heroes[actIdx] = { ...actor, position: to };
        } else {
          const actIdx = nextP2Heroes.findIndex((h) => h.instanceId === actor.instanceId);
          nextP2Heroes[actIdx] = { ...actor, position: to };
        }
        notation = `${actor.heroId} strikes ${oppHero.heroId} - Crown relocates to ${posToNotation(capResult.defenderRelocatedTo)}!`;
      } else {
        // Successful KILL!
        killedHeroId = oppHero.heroId;

        // Mark opponent hero dead
        if (activeSide === 'player1') {
          nextP2Heroes[opponentHeroIdx] = { ...oppHero, isAlive: false };
        } else {
          nextP1Heroes[opponentHeroIdx] = { ...oppHero, isAlive: false };
        }

        // Move actor onto square
        if (activeSide === 'player1') {
          const actIdx = nextP1Heroes.findIndex((h) => h.instanceId === actor.instanceId);
          nextP1Heroes[actIdx] = { ...actor, position: to };
        } else {
          const actIdx = nextP2Heroes.findIndex((h) => h.instanceId === actor.instanceId);
          nextP2Heroes[actIdx] = { ...actor, position: to };
        }

        // Trigger post-kill passives:
        // 1. BlackMonkey Pilfer: all enemy cooldowns +1
        if (actor.heroId === 'black-monkey') {
          const incEnemyCds = (heroes: InGameHeroState[]) =>
            heroes.map((h) => ({ ...h, currentCooldown: h.currentCooldown + 1 }));
          if (activeSide === 'player1') nextP2Heroes = incEnemyCds(nextP2Heroes);
          else nextP1Heroes = incEnemyCds(nextP1Heroes);
        }

        // 2. Malevolent Priest Ritual Toll: priest active cooldown -1 on any ally kill
        const reducePriestCd = (heroes: InGameHeroState[]) =>
          heroes.map((h) =>
            h.heroId === 'malevolent-priest'
              ? { ...h, currentCooldown: Math.max(0, h.currentCooldown - 1) }
              : h
          );
        if (activeSide === 'player1') nextP1Heroes = reducePriestCd(nextP1Heroes);
        else nextP2Heroes = reducePriestCd(nextP2Heroes);

        // 3. AJX Exploit: If killed hero was on cooldown, AJX CD -2
        if (actor.heroId === 'ajx-assassin' && oppHero.currentCooldown > 0) {
          const reduceAjxCd = (heroes: InGameHeroState[]) =>
            heroes.map((h) =>
              h.instanceId === actor.instanceId
                ? { ...h, currentCooldown: Math.max(0, h.currentCooldown - 2) }
                : h
            );
          if (activeSide === 'player1') nextP1Heroes = reduceAjxCd(nextP1Heroes);
          else nextP2Heroes = reduceAjxCd(nextP2Heroes);
        }

        // 4. Ironclad Warden Reprisal: Root the killer if killed hero had an adjacent Warden ally
        const hadAdjacentWarden = (activeSide === 'player1' ? nextP2Heroes : nextP1Heroes).some(
          (h) => h.isAlive && h.heroId === 'ironclad-warden' && getChebyshevDistance(h.position, oppHero.position) <= 1
        );
        if (hadAdjacentWarden) {
          const applyRoot = (heroes: InGameHeroState[]) =>
            heroes.map((h) =>
              h.instanceId === actor.instanceId ? applyStatus(h, 'rooted', 2) : h
            );
          if (activeSide === 'player1') nextP1Heroes = applyRoot(nextP1Heroes);
          else nextP2Heroes = applyRoot(nextP2Heroes);
        }

        notation = `${actor.heroId.toUpperCase()} captures ${oppHero.heroId.toUpperCase()} at ${posToNotation(to)}!`;
      }
    } else {
      // Normal non-capturing move
      if (activeSide === 'player1') {
        const actIdx = nextP1Heroes.findIndex((h) => h.instanceId === actor.instanceId);
        nextP1Heroes[actIdx] = { ...actor, position: to };
      } else {
        const actIdx = nextP2Heroes.findIndex((h) => h.instanceId === actor.instanceId);
        nextP2Heroes[actIdx] = { ...actor, position: to };
      }

      // Dr. Methanogenic Spore Drift passive
      if (actor.heroId === 'dr-methanogenic') {
        nextZones.push(createZone('spore', activeSide, from, 1));
      }

      notation = `${actor.heroId.toUpperCase()} moves ${posToNotation(from)} to ${posToNotation(to)}`;
    }
  } else if (action.type === 'ability') {
    // ACTIVE ABILITIES NEVER CAPTURE DIRECTLY
    const def = getHeroById(actor.heroId);
    const targetPos = action.to;

    // Put active on cooldown
    const setOnCd = (heroes: InGameHeroState[]) =>
      heroes.map((h) =>
        h.instanceId === actor.instanceId ? { ...h, currentCooldown: def.active.baseCooldown } : h
      );
    if (activeSide === 'player1') nextP1Heroes = setOnCd(nextP1Heroes);
    else nextP2Heroes = setOnCd(nextP2Heroes);

    switch (actor.heroId) {
      case 'mugen-king': {
        // Boundless decree: swap places with ally
        const ally = allAliveHeroes().find(
          (h) => h.owner === activeSide && isSamePos(h.position, targetPos)
        );
        if (ally) {
          const swapPositions = (heroes: InGameHeroState[]) =>
            heroes.map((h) => {
              if (h.instanceId === actor.instanceId) return { ...h, position: ally.position };
              if (h.instanceId === ally.instanceId) return { ...h, position: actor.position };
              return h;
            });
          if (activeSide === 'player1') nextP1Heroes = swapPositions(nextP1Heroes);
          else nextP2Heroes = swapPositions(nextP2Heroes);
          notation = `Boundless Decree: MugenKING swaps with ${ally.heroId}`;
        }
        break;
      }

      case 'malevolent-priest': {
        // Desecrated Ground: place shrine
        nextZones.push(createZone('shrine', activeSide, targetPos, 3));
        notation = `Desecrated Ground placed at ${posToNotation(targetPos)}`;
        break;
      }

      case 'dr-methanogenic': {
        // Methane Bloom: 3x3 gas cloud for 2 turns
        nextZones.push(createZone('gas', activeSide, targetPos, 2));
        notation = `Methane Bloom deployed at ${posToNotation(targetPos)}`;
        break;
      }

      case 'captain-englland': {
        // Rally Standard: Banner on own square for 3 turns
        nextZones.push(createZone('banner', activeSide, actor.position, 3));
        notation = `Rally Standard planted at ${posToNotation(actor.position)}`;
        break;
      }

      case 'ajx-assassin': {
        // Null Jump: teleport to empty square
        const tp = (heroes: InGameHeroState[]) =>
          heroes.map((h) => (h.instanceId === actor.instanceId ? { ...h, position: targetPos } : h));
        if (activeSide === 'player1') nextP1Heroes = tp(nextP1Heroes);
        else nextP2Heroes = tp(nextP2Heroes);
        notation = `Null Jump: AJX teleports to ${posToNotation(targetPos)}`;
        break;
      }

      case 'yjkstra-pathfinder': {
        // Shortest Path: move friendly hero along path
        if (action.targetInstanceId) {
          const moveTarget = (heroes: InGameHeroState[]) =>
            heroes.map((h) =>
              h.instanceId === action.targetInstanceId ? { ...h, position: targetPos } : h
            );
          if (activeSide === 'player1') nextP1Heroes = moveTarget(nextP1Heroes);
          else nextP2Heroes = moveTarget(nextP2Heroes);
          notation = `Shortest Path: Repositioned unit to ${posToNotation(targetPos)}`;
        }
        break;
      }

      case 'ironclad-warden': {
        // Bulwark Plant: wall on square for 3 turns
        nextZones.push(createZone('wall', activeSide, targetPos, 3));
        notation = `Bulwark Wall constructed at ${posToNotation(targetPos)}`;
        break;
      }

      case 'black-monkey': {
        // Mirror Troupe: leaves decoy on square
        nextZones.push(createZone('decoy', activeSide, actor.position, 2));
        notation = `Mirror Troupe: Decoy deployed at ${posToNotation(actor.position)}`;
        break;
      }

      case 'part-king-kong': {
        // Ground Slam: 3x3 push 1 square away or Root if blocked
        const pushEnemies = (heroes: InGameHeroState[]) =>
          heroes.map((h) => {
            if (!h.isAlive || h.owner === activeSide) return h;
            if (getChebyshevDistance(h.position, actor.position) <= 1) {
              const dx = Math.sign(h.position.x - actor.position.x);
              const dy = Math.sign(h.position.y - actor.position.y);
              const pushDest: BoardPosition = { x: h.position.x + dx, y: h.position.y + dy };
              const isBlocked =
                !isWithinBoard(pushDest) ||
                isSquareBlockedByZone(nextZones, pushDest) ||
                allAliveHeroes().some((other) => isSamePos(other.position, pushDest));

              if (isBlocked) {
                return applyStatus(h, 'rooted', 2);
              } else {
                return { ...h, position: pushDest };
              }
            }
            return h;
          });

        if (activeSide === 'player1') nextP2Heroes = pushEnemies(nextP2Heroes);
        else nextP1Heroes = pushEnemies(nextP1Heroes);
        notation = `Ground Slam! Kong unleashes shockwave`;
        break;
      }
    }
  }

  // Update history & kills
  const nextKills = [...state.killsThisMatch];
  if (killedHeroId) {
    nextKills.push({
      killerSide: activeSide,
      killedHeroId,
      turn: state.turnNumber,
    });
  }

  const historyEntry = {
    turnNumber: state.turnNumber,
    activeSide,
    action,
    killedHeroId,
    notation,
    timestamp: Date.now(),
  };

  // Build intermediate state before turn cycle
  let updatedState: HeroDuelMatchState = {
    ...state,
    player1: { ...state.player1, heroes: nextP1Heroes },
    player2: { ...state.player2, heroes: nextP2Heroes },
    zones: nextZones,
    history: [...state.history, historyEntry],
    killsThisMatch: nextKills,
  };

  // Check Win Conditions
  const p1Captain = nextP1Heroes.find((h) => h.isCaptain);
  const p2Captain = nextP2Heroes.find((h) => h.isCaptain);
  const p1AliveCount = nextP1Heroes.filter((h) => h.isAlive).length;
  const p2AliveCount = nextP2Heroes.filter((h) => h.isAlive).length;

  if (p1Captain && !p1Captain.isAlive) {
    updatedState.phase = 'game_over';
    updatedState.winner = 'player2';
    updatedState.winReason = 'captain_elimination';
    return { state: updatedState, success: true };
  }

  if (p2Captain && !p2Captain.isAlive) {
    updatedState.phase = 'game_over';
    updatedState.winner = 'player1';
    updatedState.winReason = 'captain_elimination';
    return { state: updatedState, success: true };
  }

  if (p1AliveCount === 0) {
    updatedState.phase = 'game_over';
    updatedState.winner = 'player2';
    updatedState.winReason = 'all_heroes_eliminated';
    return { state: updatedState, success: true };
  }

  if (p2AliveCount === 0) {
    updatedState.phase = 'game_over';
    updatedState.winner = 'player1';
    updatedState.winReason = 'all_heroes_eliminated';
    return { state: updatedState, success: true };
  }

  // Check Turn 60 round limit tiebreaker
  if (state.turnNumber >= MAX_MATCH_ROUNDS && state.activeSide === 'player2') {
    updatedState.phase = 'game_over';
    if (p1AliveCount > p2AliveCount) {
      updatedState.winner = 'player1';
      updatedState.winReason = 'turn_limit_heroes_advantage';
    } else if (p2AliveCount > p1AliveCount) {
      updatedState.winner = 'player2';
      updatedState.winReason = 'turn_limit_heroes_advantage';
    } else {
      updatedState.winner = 'draw';
      updatedState.winReason = 'turn_limit_draw';
    }
    return { state: updatedState, success: true };
  }

  // Cycle turn
  const advancedState = endTurnAndAdvance(updatedState);
  return { state: advancedState, success: true };
}

/**
 * Creates initial state for 7x8 Hero Duel match UI
 */
export function createInitialHeroDuelState(
  team1Heroes: HeroInstance[],
  team2Heroes: HeroInstance[],
  mode: 'ai' | 'pass_and_play' = 'ai'
): HeroDuelState {
  const heroes: HeroInstance[] = [
    ...team1Heroes.map((h, idx) => {
      const def = getHeroById(h.heroId);
      return {
        ...h,
        instanceId: `p1_${idx}_${h.heroId}`,
        team: 1 as const,
        pos: h.pos || { x: idx + 1, y: 0 },
        isCaptain: Boolean(h.isCaptain),
        name: def.name,
        title: def.title,
        isAlive: true,
        currentCooldown: 1, // CD 1 for Team 1
        isSilenced: false,
        statuses: [],
        active: def.active,
        passives: [...def.passives],
      };
    }),
    ...team2Heroes.map((h, idx) => {
      const def = getHeroById(h.heroId);
      return {
        ...h,
        instanceId: `p2_${idx}_${h.heroId}`,
        team: 2 as const,
        pos: h.pos || { x: idx + 1, y: 7 },
        isCaptain: Boolean(h.isCaptain),
        name: def.name,
        title: def.title,
        isAlive: true,
        currentCooldown: 0, // CD 0 for Team 2
        isSilenced: false,
        statuses: [],
        active: def.active,
        passives: [...def.passives],
      };
    }),
  ];

  return {
    turnNumber: 1,
    currentTurn: 1,
    heroes,
    zones: [],
    winner: null,
    winReason: null,
    isPassAndPlay: mode === 'pass_and_play',
  };
}

/**
 * Computes legal move destinations for a hero on the 7x8 board
 */
export function getLegalHeroMoves(state: HeroDuelState, hero: HeroInstance): Coord[] {
  if (!hero.isAlive) return [];
  if (hero.statuses?.some((s) => s.type === 'rooted')) return [];

  const inGameHero: InGameHeroState = {
    instanceId: hero.instanceId,
    heroId: hero.heroId,
    owner: hero.team === 1 ? 'player1' : 'player2',
    position: hero.pos,
    isCaptain: hero.isCaptain,
    isAlive: hero.isAlive,
    currentCooldown: hero.currentCooldown,
    passiveCooldowns: {},
    passiveUsedFlags: {},
    statuses: (hero.statuses || []).map((s) => ({ type: s.type, durationTurns: s.duration })),
  };

  const allHeroes: InGameHeroState[] = state.heroes.map((h) => ({
    instanceId: h.instanceId,
    heroId: h.heroId,
    owner: h.team === 1 ? 'player1' : 'player2',
    position: h.pos,
    isCaptain: h.isCaptain,
    isAlive: h.isAlive,
    currentCooldown: h.currentCooldown,
    passiveCooldowns: {},
    passiveUsedFlags: {},
    statuses: (h.statuses || []).map((s) => ({ type: s.type, durationTurns: s.duration })),
  }));

  const boardZones = (state.zones || []).map((z) => ({
    id: z.id,
    type: z.type,
    owner: 'player1' as PlayerSide,
    position: z.coords[0] || { x: 0, y: 0 },
    durationTurns: z.duration,
  }));

  const moves = getLegalMovesForHero(inGameHero, allHeroes, boardZones);
  return moves.map((m) => m.to);
}

/**
 * Returns valid target coordinates for an active ability
 */
export function getValidActiveTargets(state: HeroDuelState, hero: HeroInstance): Coord[] {
  if (!hero.isAlive || hero.currentCooldown > 0 || hero.isSilenced) return [];

  const active = hero.active;
  if (!active) return [];

  const validTargets: Coord[] = [];
  const range = active.rangeSquares || 3;

  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLS; x++) {
      const coord = { x, y };
      const dist = Math.max(Math.abs(coord.x - hero.pos.x), Math.abs(coord.y - hero.pos.y));
      if (dist === 0 && active.targetType !== 'self') continue;
      if (dist > range) continue;

      const occ = state.heroes.find((h) => h.isAlive && h.pos.x === x && h.pos.y === y);

      if (active.targetType === 'empty_square' && !occ) {
        validTargets.push(coord);
      } else if (active.targetType === 'ally_hero' && occ && occ.team === hero.team && occ.instanceId !== hero.instanceId) {
        validTargets.push(coord);
      } else if (active.targetType === 'enemy_hero' && occ && occ.team !== hero.team) {
        validTargets.push(coord);
      } else if (active.targetType === 'any_square') {
        validTargets.push(coord);
      } else if (active.targetType === 'self' && dist === 0) {
        validTargets.push(coord);
      }
    }
  }

  return validTargets;
}

/**
 * Executes a move or active action in the UI match state
 */
export function applyHeroDuelAction(state: HeroDuelState, action: Action): HeroDuelState {
  if (state.winner) return state;

  const nextHeroes = state.heroes.map((h) => ({
    ...h,
    statuses: [...(h.statuses || [])],
  }));

  const actorIdx = nextHeroes.findIndex(
    (h) => h.isAlive && h.team === action.team && h.pos.x === action.from.x && h.pos.y === action.from.y
  );

  if (actorIdx === -1) return state;
  const actor = nextHeroes[actorIdx];

  if (action.type === 'move' && action.to) {
    const dest = action.to;
    // Check if capturing an enemy hero
    const enemyIdx = nextHeroes.findIndex(
      (h) => h.isAlive && h.team !== action.team && h.pos.x === dest.x && h.pos.y === dest.y
    );

    if (enemyIdx !== -1) {
      nextHeroes[enemyIdx].isAlive = false;
    }

    actor.pos = dest;
  } else if (action.type === 'active') {
    actor.currentCooldown = actor.active.baseCooldown;

    // Execute active effect
    if (action.target) {
      const targetHeroIdx = nextHeroes.findIndex(
        (h) => h.isAlive && h.pos.x === action.target!.x && h.pos.y === action.target!.y
      );

      if (actor.heroId === 'mugen-king' && targetHeroIdx !== -1) {
        // Swap positions
        const targetHero = nextHeroes[targetHeroIdx];
        const tempPos = { ...actor.pos };
        actor.pos = { ...targetHero.pos };
        targetHero.pos = tempPos;
      } else if (actor.heroId === 'malevolent-priest' && targetHeroIdx !== -1) {
        // Curse or damage
        nextHeroes[targetHeroIdx].statuses.push({ type: 'silenced', duration: 2 });
      } else if (actor.heroId === 'ajx-assassin' && targetHeroIdx !== -1) {
        // Strike enemy
        nextHeroes[targetHeroIdx].isAlive = false;
      } else if (actor.heroId === 'captain-englland' && action.target) {
        // Vanguard Strike
        if (targetHeroIdx !== -1 && nextHeroes[targetHeroIdx].team !== action.team) {
          nextHeroes[targetHeroIdx].isAlive = false;
        }
        actor.pos = { ...action.target };
      }
    }
  }

  // Check victory conditions
  const p1Captain = nextHeroes.find((h) => h.team === 1 && h.isCaptain);
  const p2Captain = nextHeroes.find((h) => h.team === 2 && h.isCaptain);
  const p1Alive = nextHeroes.filter((h) => h.team === 1 && h.isAlive);
  const p2Alive = nextHeroes.filter((h) => h.team === 2 && h.isAlive);

  let winner: 1 | 2 | 'draw' | null = null;
  let winReason: string | null = null;

  if (p1Captain && !p1Captain.isAlive) {
    winner = 2;
    winReason = 'Team 1 Captain has fallen!';
  } else if (p2Captain && !p2Captain.isAlive) {
    winner = 1;
    winReason = 'Enemy Captain vanquished!';
  } else if (p1Alive.length === 0) {
    winner = 2;
    winReason = 'All Team 1 champions eliminated.';
  } else if (p2Alive.length === 0) {
    winner = 1;
    winReason = 'All enemy champions eliminated!';
  } else if (state.turnNumber >= 60) {
    if (p1Alive.length > p2Alive.length) {
      winner = 1;
      winReason = 'Round 60 limit reached: Team 1 has hero advantage.';
    } else if (p2Alive.length > p1Alive.length) {
      winner = 2;
      winReason = 'Round 60 limit reached: Team 2 has hero advantage.';
    } else {
      winner = 'draw';
      winReason = 'Round 60 limit reached: Perfect stalemate.';
    }
  }

  // Advance turn and decrement cooldowns for the active team's heroes
  const nextTurnNumber = action.team === 2 ? state.turnNumber + 1 : state.turnNumber;
  const nextCurrentTurn: 1 | 2 = action.team === 1 ? 2 : 1;

  for (const h of nextHeroes) {
    if (h.isAlive && h.team === action.team) {
      h.currentCooldown = Math.max(0, h.currentCooldown - 1);
      h.statuses = h.statuses
        .map((s) => ({ ...s, duration: s.duration - 1 }))
        .filter((s) => s.duration > 0);
    }
  }

  return {
    ...state,
    turnNumber: nextTurnNumber,
    currentTurn: nextCurrentTurn,
    heroes: nextHeroes,
    winner,
    winReason,
  };
}
