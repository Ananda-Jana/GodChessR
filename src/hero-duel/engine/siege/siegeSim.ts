import { SiegeState, SiegeHeroInstance, SiegePawnInstance, Coord, TeamSide, PlayerAction, DamageFlash } from './siegeTypes';
import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { getHeroById } from '../../heroes/heroRegistry';
import { grantSiegeKillCard, awardSiegeVictoryCard } from '../../cards/siegeCardBridge';

/**
 * Check if a cell coordinate is inside any 2x2 shrine
 */
export function isCoordOnShrine(pos: Coord, shrines = SIEGE_CONFIG.SHRINES): boolean {
  return shrines.some((s) => s.cells.some((c) => c.x === pos.x && c.y === pos.y));
}

/**
 * Find the shrine object containing the given cell
 */
export function getShrineAtCoord(pos: Coord, shrines: SiegeState['shrines']) {
  return shrines.find((s) => s.cells.some((c) => c.x === pos.x && c.y === pos.y));
}

/**
 * Calculate valid 8-directional moves, attacks, and shrine destinations for a hero
 */
export function getValidHeroMoves(
  hero: SiegeHeroInstance,
  state: SiegeState
): { moves: Coord[]; attacks: Coord[]; shrines: Coord[] } {
  if (!hero.isAlive) {
    return { moves: [], attacks: [], shrines: [] };
  }

  const moves: Coord[] = [];
  const attacks: Coord[] = [];
  const shrines: Coord[] = [];

  const directions = [
    { x: 0, y: -1 }, // North
    { x: 0, y: 1 },  // South
    { x: -1, y: 0 }, // West
    { x: 1, y: 0 },  // East
    { x: -1, y: -1 }, // North-West
    { x: 1, y: -1 },  // North-East
    { x: -1, y: 1 },  // South-West
    { x: 1, y: 1 },   // South-East
  ];

  for (const dir of directions) {
    const targetX = hero.pos.x + dir.x;
    const targetY = hero.pos.y + dir.y;

    // Check board boundaries (8x8 grid: 0..7)
    if (targetX < 0 || targetX >= SIEGE_CONFIG.COLS || targetY < 0 || targetY >= SIEGE_CONFIG.ROWS) {
      continue;
    }

    const targetCoord = { x: targetX, y: targetY };

    // Check if an ally occupies this cell
    const allyHero = state.heroes.find(
      (h) => h.isAlive && h.team === hero.team && h.pos.x === targetX && h.pos.y === targetY
    );
    const allyPawn = state.pawns.find(
      (p) => p.isAlive && p.team === hero.team && p.pos.x === targetX && p.pos.y === targetY
    );
    if (allyHero || allyPawn) {
      continue; // Blocked by ally
    }

    // Check if an enemy occupies this cell
    const enemyHero = state.heroes.find(
      (h) => h.isAlive && h.team !== hero.team && h.pos.x === targetX && h.pos.y === targetY
    );
    const enemyPawn = state.pawns.find(
      (p) => p.isAlive && p.team !== hero.team && p.pos.x === targetX && p.pos.y === targetY
    );

    if (enemyHero || enemyPawn) {
      attacks.push(targetCoord);
    } else {
      // Empty cell - either shrine or normal move
      if (isCoordOnShrine(targetCoord)) {
        shrines.push(targetCoord);
      } else {
        moves.push(targetCoord);
      }
    }
  }

  return { moves, attacks, shrines };
}

/**
 * Execute a single action for a hero (move, attack, or hold)
 */
function applyHeroAction(
  hero: SiegeHeroInstance,
  action: PlayerAction,
  nextHeroes: SiegeHeroInstance[],
  nextPawns: SiegePawnInstance[],
  nextState: SiegeState,
  newFlashes: DamageFlash[],
  newEliminations: string[]
): { hero: SiegeHeroInstance; reachedShrine: boolean; shrineId?: string } {
  let reachedShrine = false;
  let reachedShrineId: string | undefined;

  if (action.isHold) {
    // Hero holds position (defensive stand on shrine)
    nextState.events.unshift({
      id: `ev_hold_${Date.now()}_${hero.instanceId}`,
      timeSec: stateTime(nextState),
      text: `${hero.name} holds defensive stance at (${hero.pos.x + 1}, ${8 - hero.pos.y}).`,
      team: hero.team,
    });
    return { hero, reachedShrine: false };
  }

  const { targetPos } = action;

  // Check for enemy hero at target cell
  const enemyHero = nextHeroes.find(
    (h) => h.isAlive && h.team !== hero.team && h.pos.x === targetPos.x && h.pos.y === targetPos.y
  );

  // Check for enemy pawn at target cell
  const enemyPawn = nextPawns.find(
    (p) => p.isAlive && p.team !== hero.team && p.pos.x === targetPos.x && p.pos.y === targetPos.y
  );

  if (enemyHero) {
    // Defender on shrine gets 20% damage reduction
    const defenderOnShrine = isCoordOnShrine(enemyHero.pos);
    const rawDmg = Math.max(1, hero.attackDamage - enemyHero.defense * 0.25);
    const damage = defenderOnShrine ? Math.max(1, Math.round(rawDmg * 0.8)) : Math.round(rawDmg);
    const isCrit = damage >= 4;

    enemyHero.hp -= damage;
    hero.damageDealt += damage;
    nextState.stats.totalDamageDealt[hero.team] += damage;

    // Red damage flash
    newFlashes.push({
      id: `flash_${Date.now()}_${enemyHero.instanceId}`,
      pos: { ...targetPos },
      color: hero.team === 1 ? '#ef5350' : '#ff9800',
    });

    // Floating number
    nextState.floatingNumbers.push({
      id: `fn_${Date.now()}_${Math.random()}`,
      pos: { ...targetPos },
      text: isCrit ? `-${damage} CRIT!` : `-${damage}`,
      color: isCrit ? '#ff9800' : '#ef5350',
      lifeSec: 1.5,
    });

    if (enemyHero.hp <= 0) {
      enemyHero.hp = 0;
      enemyHero.isAlive = false;
      hero.kills += 1;
      nextState.stats.heroesEliminated[hero.team] += 1;
      newEliminations.push(enemyHero.instanceId);

      nextState.events.unshift({
        id: `ev_kill_${Date.now()}_${enemyHero.instanceId}`,
        timeSec: stateTime(nextState),
        text: `⚔️ ${hero.name} eliminated ${enemyHero.name}!`,
        team: hero.team,
      });

      if (hero.team === 1) {
        grantSiegeKillCard(enemyHero.heroId);
      }

      // Attacker takes the conquered cell
      hero.pos = { ...targetPos };
      const shrineOnCell = getShrineAtCoord(targetPos, nextState.shrines);
      if (shrineOnCell) {
        reachedShrine = true;
        reachedShrineId = shrineOnCell.id;
      }
    } else {
      // Enemy survives: hero remains on their starting cell
      nextState.events.unshift({
        id: `ev_atk_${Date.now()}_${enemyHero.instanceId}`,
        timeSec: stateTime(nextState),
        text: `${hero.name} attacked ${enemyHero.name} for ${damage} DMG.`,
        team: hero.team,
      });
    }
  } else if (enemyPawn) {
    const rawDmg = Math.max(1, hero.attackDamage);
    enemyPawn.hp -= rawDmg;
    newFlashes.push({
      id: `flash_pawn_${Date.now()}_${enemyPawn.id}`,
      pos: { ...targetPos },
      color: '#ef5350',
    });
    nextState.floatingNumbers.push({
      id: `fn_pawn_${Date.now()}_${Math.random()}`,
      pos: { ...targetPos },
      text: `-${rawDmg}`,
      color: '#ef5350',
      lifeSec: 1.2,
    });

    if (enemyPawn.hp <= 0) {
      enemyPawn.hp = 0;
      enemyPawn.isAlive = false;
      newEliminations.push(enemyPawn.id);
      // Hero occupies cell
      hero.pos = { ...targetPos };
      const shrineOnCell = getShrineAtCoord(targetPos, nextState.shrines);
      if (shrineOnCell) {
        reachedShrine = true;
        reachedShrineId = shrineOnCell.id;
      }
    }
  } else {
    // Normal move onto empty cell
    hero.pos = { ...targetPos };
    const shrineOnCell = getShrineAtCoord(targetPos, nextState.shrines);
    if (shrineOnCell) {
      reachedShrine = true;
      reachedShrineId = shrineOnCell.id;
    }
  }

  return { hero, reachedShrine, shrineId: reachedShrineId };
}

function stateTime(state: SiegeState): number {
  return state.turn * 5;
}

/**
 * Advances living pawns 1 step forward or attacks diagonally/orthogonally
 */
function advancePawns(
  nextState: SiegeState,
  newFlashes: DamageFlash[],
  newEliminations: string[]
): void {
  nextState.pawns = nextState.pawns.map((pawn) => {
    if (!pawn.isAlive) return pawn;

    const forwardDir = pawn.team === 1 ? -1 : 1; // Team 1 moves up (y-1), Team 2 moves down (y+1)
    const nextY = pawn.pos.y + forwardDir;

    if (nextY < 0 || nextY >= SIEGE_CONFIG.ROWS) {
      return pawn; // Reached end of board
    }

    // Check diagonal attack targets first (standard chess pawn capture)
    const diagonalOffsets = [-1, 1];
    for (const dx of diagonalOffsets) {
      const diagX = pawn.pos.x + dx;
      if (diagX >= 0 && diagX < SIEGE_CONFIG.COLS) {
        const enemyHero = nextState.heroes.find(
          (h) => h.isAlive && h.team !== pawn.team && h.pos.x === diagX && h.pos.y === nextY
        );
        const enemyPawn = nextState.pawns.find(
          (p) => p.isAlive && p.team !== pawn.team && p.pos.x === diagX && p.pos.y === nextY
        );

        if (enemyHero) {
          enemyHero.hp -= pawn.attackDamage;
          newFlashes.push({
            id: `flash_pawn_atk_${Date.now()}_${enemyHero.instanceId}`,
            pos: { x: diagX, y: nextY },
            color: '#ff9800',
          });
          nextState.floatingNumbers.push({
            id: `fn_pawn_strike_${Date.now()}_${Math.random()}`,
            pos: { x: diagX, y: nextY },
            text: `-${pawn.attackDamage}`,
            color: '#ff9800',
            lifeSec: 1.2,
          });
          if (enemyHero.hp <= 0) {
            enemyHero.hp = 0;
            enemyHero.isAlive = false;
            newEliminations.push(enemyHero.instanceId);
            return { ...pawn, pos: { x: diagX, y: nextY } };
          }
          return pawn; // Pawn stays on cell after strike
        }

        if (enemyPawn) {
          enemyPawn.hp -= pawn.attackDamage;
          if (enemyPawn.hp <= 0) {
            enemyPawn.hp = 0;
            enemyPawn.isAlive = false;
            newEliminations.push(enemyPawn.id);
            return { ...pawn, pos: { x: diagX, y: nextY } };
          }
          return pawn;
        }
      }
    }

    // Forward cell check
    const frontCoord = { x: pawn.pos.x, y: nextY };
    const obstacleHero = nextState.heroes.find(
      (h) => h.isAlive && h.pos.x === frontCoord.x && h.pos.y === frontCoord.y
    );
    const obstaclePawn = nextState.pawns.find(
      (p) => p.isAlive && p.pos.x === frontCoord.x && p.pos.y === frontCoord.y
    );

    if (obstacleHero) {
      if (obstacleHero.team !== pawn.team) {
        // Strike enemy hero ahead
        obstacleHero.hp -= pawn.attackDamage;
        newFlashes.push({
          id: `flash_pawn_fwd_${Date.now()}`,
          pos: frontCoord,
          color: '#ff9800',
        });
        if (obstacleHero.hp <= 0) {
          obstacleHero.hp = 0;
          obstacleHero.isAlive = false;
          newEliminations.push(obstacleHero.instanceId);
          return { ...pawn, pos: frontCoord };
        }
      }
      return pawn; // Blocked
    }

    if (obstaclePawn) {
      if (obstaclePawn.team !== pawn.team) {
        obstaclePawn.hp -= pawn.attackDamage;
        if (obstaclePawn.hp <= 0) {
          obstaclePawn.hp = 0;
          obstaclePawn.isAlive = false;
          newEliminations.push(obstaclePawn.id);
          return { ...pawn, pos: frontCoord };
        }
      }
      return pawn; // Blocked
    }

    // Empty cell directly ahead: advance
    return { ...pawn, pos: frontCoord };
  });
}

/**
 * Updates shrine ownership, contested status, and dominion turns
 */
function updateShrinesAndDominion(nextState: SiegeState): void {
  let playerHoldsBoth = true;
  let botHoldsBoth = true;

  nextState.shrines = nextState.shrines.map((shrine) => {
    const occupants = nextState.heroes.filter(
      (h) => h.isAlive && shrine.cells.some((c) => c.x === h.pos.x && c.y === h.pos.y)
    );

    const playerPresent = occupants.some((h) => h.team === 1);
    const botPresent = occupants.some((h) => h.team === 2);

    let owner: TeamSide | null = shrine.owner;
    let isContested = false;

    if (playerPresent && botPresent) {
      isContested = true;
      playerHoldsBoth = false;
      botHoldsBoth = false;
    } else if (playerPresent) {
      owner = 1;
      botHoldsBoth = false;
    } else if (botPresent) {
      owner = 2;
      playerHoldsBoth = false;
    } else {
      // Empty: retains owner until contested or re-claimed
      if (owner === 1) {
        botHoldsBoth = false;
      } else if (owner === 2) {
        playerHoldsBoth = false;
      } else {
        playerHoldsBoth = false;
        botHoldsBoth = false;
      }
    }

    return {
      ...shrine,
      owner,
      occupierTeam: isContested ? null : owner,
      isContested,
    };
  });

  // Dominion turn counters: increment by 1 each turn team holds BOTH shrines
  if (playerHoldsBoth) {
    nextState.dominionTurns[1] += 1;
    nextState.dominionTurns[2] = 0;
    nextState.events.unshift({
      id: `ev_dom_p1_${Date.now()}`,
      timeSec: stateTime(nextState),
      text: `👑 Player Squad maintains Dominion control (${nextState.dominionTurns[1]}/8 Turns)!`,
      team: 1,
    });
  } else if (botHoldsBoth) {
    nextState.dominionTurns[2] += 1;
    nextState.dominionTurns[1] = 0;
    nextState.events.unshift({
      id: `ev_dom_p2_${Date.now()}`,
      timeSec: stateTime(nextState),
      text: `⚠️ Enemy Bot maintains Dominion control (${nextState.dominionTurns[2]}/8 Turns)!`,
      team: 2,
    });
  } else {
    nextState.dominionTurns[1] = 0;
    nextState.dominionTurns[2] = 0;
  }

  // Sync dominionTimer for backwards compatibility with stats/results modal
  nextState.dominionTimer[1] = nextState.dominionTurns[1];
  nextState.dominionTimer[2] = nextState.dominionTurns[2];

  // Update stats
  if (playerHoldsBoth) nextState.stats.shrineControlSec[1] += 1;
  if (botHoldsBoth) nextState.stats.shrineControlSec[2] += 1;
}

/**
 * Checks win and loss conditions
 */
function checkWinConditions(nextState: SiegeState): void {
  const alivePlayerHeroes = nextState.heroes.filter((h) => h.team === 1 && h.isAlive);
  const aliveBotHeroes = nextState.heroes.filter((h) => h.team === 2 && h.isAlive);

  if (nextState.dominionTurns[1] >= SIEGE_CONFIG.DOMINION_WIN_HOLD_TURNS) {
    nextState.winner = 1;
    nextState.winReason = 'Shrine Dominion (Held both 2x2 Shrines for 8 cumulative turns!)';
    awardSiegeVictoryCard(nextState);
  } else if (nextState.dominionTurns[2] >= SIEGE_CONFIG.DOMINION_WIN_HOLD_TURNS) {
    nextState.winner = 2;
    nextState.winReason = 'Enemy Dominion (Enemy held both 2x2 Shrines for 8 cumulative turns!)';
  } else if (aliveBotHeroes.length === 0 && nextState.heroes.some((h) => h.team === 2)) {
    nextState.winner = 1;
    nextState.winReason = 'Enemy Elimination (All 4 Bot Heroes Slayed!)';
    awardSiegeVictoryCard(nextState);
  } else if (alivePlayerHeroes.length === 0 && nextState.heroes.some((h) => h.team === 1)) {
    nextState.winner = 2;
    nextState.winReason = 'Squad Defeat (All Player Heroes Slayed!)';
  }
}

/**
 * Pure function: process player actions only (Step 2 of turn flow)
 */
export function processPlayerTurnPhase(
  state: SiegeState,
  playerActions: PlayerAction[]
): { nextState: SiegeState; unlockedModalHeroId: string | null; shrineId: string | null } {
  let nextState: SiegeState = {
    ...state,
    events: [...state.events],
    floatingNumbers: [...state.floatingNumbers],
    damageFlashes: [],
    eliminatedUnitIds: [],
  };

  const nextHeroes = [...nextState.heroes.map((h) => ({ ...h }))];
  const nextPawns = [...nextState.pawns.map((p) => ({ ...p }))];
  const newFlashes: DamageFlash[] = [];
  const newEliminations: string[] = [];

  let unlockedHeroId: string | null = null;
  let unlockedShrineId: string | null = null;

  for (const action of playerActions) {
    const heroIndex = nextHeroes.findIndex((h) => h.instanceId === action.heroInstanceId && h.isAlive);
    if (heroIndex === -1) continue;

    const currentHero = nextHeroes[heroIndex];
    const { hero: updatedHero, reachedShrine, shrineId } = applyHeroAction(
      currentHero,
      action,
      nextHeroes,
      nextPawns,
      nextState,
      newFlashes,
      newEliminations
    );

    nextHeroes[heroIndex] = updatedHero;

    if (reachedShrine && !updatedHero.abilityUnlocked && !unlockedHeroId) {
      unlockedHeroId = updatedHero.instanceId;
      unlockedShrineId = shrineId || 's-left';
    }
  }

  nextState.heroes = nextHeroes;
  nextState.pawns = nextPawns;
  nextState.damageFlashes = newFlashes;
  nextState.eliminatedUnitIds = newEliminations;

  if (unlockedHeroId && unlockedShrineId) {
    nextState.shrineModal = { heroInstanceId: unlockedHeroId, shrineId: unlockedShrineId };
  }

  // Update shrines
  updateShrinesAndDominion(nextState);
  checkWinConditions(nextState);

  return { nextState, unlockedModalHeroId: unlockedHeroId, shrineId: unlockedShrineId };
}

/**
 * Pure function: process bot actions and pawn movement (Step 4 of turn flow)
 */
export function processBotTurnPhase(
  state: SiegeState,
  botActions: PlayerAction[]
): SiegeState {
  let nextState: SiegeState = {
    ...state,
    events: [...state.events],
    floatingNumbers: [...state.floatingNumbers],
    damageFlashes: [],
    eliminatedUnitIds: [],
  };

  const nextHeroes = [...nextState.heroes.map((h) => ({ ...h }))];
  const nextPawns = [...nextState.pawns.map((p) => ({ ...p }))];
  const newFlashes: DamageFlash[] = [];
  const newEliminations: string[] = [];

  for (const action of botActions) {
    const heroIndex = nextHeroes.findIndex((h) => h.instanceId === action.heroInstanceId && h.isAlive);
    if (heroIndex === -1) continue;

    const currentHero = nextHeroes[heroIndex];
    const { hero: updatedHero, reachedShrine } = applyHeroAction(
      currentHero,
      action,
      nextHeroes,
      nextPawns,
      nextState,
      newFlashes,
      newEliminations
    );

    if (reachedShrine && !updatedHero.abilityUnlocked) {
      // Bot auto-unlocks active ability upon reaching shrine
      updatedHero.abilityUnlocked = true;
      nextState.events.unshift({
        id: `ev_bot_unlock_${Date.now()}_${updatedHero.instanceId}`,
        timeSec: stateTime(nextState),
        text: `⚡ Enemy ${updatedHero.name} unlocked active ability at the shrine!`,
        team: 2,
      });
    }

    nextHeroes[heroIndex] = updatedHero;
  }

  nextState.heroes = nextHeroes;
  nextState.pawns = nextPawns;

  // Advance Pawns
  advancePawns(nextState, newFlashes, newEliminations);

  nextState.damageFlashes = newFlashes;
  nextState.eliminatedUnitIds = newEliminations;

  // Update shrines and check dominion & win conditions
  updateShrinesAndDominion(nextState);
  checkWinConditions(nextState);

  // Increment turn
  nextState.turn = state.turn + 1;
  nextState.elapsedSeconds = nextState.turn * 5;

  return nextState;
}

/**
 * Single pure function to process a complete turn with player and bot actions
 */
export function processTurn(
  state: SiegeState,
  playerActions: PlayerAction[],
  botActions: PlayerAction[] = []
): SiegeState {
  // 1. Apply all player actions
  const { nextState: playerResolved } = processPlayerTurnPhase(state, playerActions);
  if (playerResolved.winner) {
    return playerResolved;
  }

  // 2. Apply bot actions and advance pawns
  const turnResolved = processBotTurnPhase(playerResolved, botActions);
  return turnResolved;
}

/**
 * Unlock hero ability when confirmed from Shrine Modal
 */
export function unlockHeroAbility(
  state: SiegeState,
  instanceId: string,
  abilityName?: string
): SiegeState {
  const updatedHeroes = state.heroes.map((h) => {
    if (h.instanceId === instanceId) {
      return { ...h, abilityUnlocked: true };
    }
    return h;
  });

  const hero = state.heroes.find((h) => h.instanceId === instanceId);
  const def = hero ? getHeroById(hero.heroId) : null;
  const chosenName = abilityName || def?.active.name || 'Shrine Skill';

  return {
    ...state,
    heroes: updatedHeroes,
    shrineModal: null, // Resume game
    events: [
      {
        id: `ev_unlock_${Date.now()}`,
        timeSec: stateTime(state),
        text: `✨ ${hero?.name || 'Hero'} unlocked [${chosenName}] at the Grand Shrine!`,
        team: hero?.team,
      },
      ...state.events,
    ],
  };
}

/**
 * Skip ability unlock for now and resume
 */
export function skipHeroAbilityUnlock(state: SiegeState): SiegeState {
  return {
    ...state,
    shrineModal: null,
  };
}

/**
 * Execute tactical ability for unlocked hero
 */
export function executeHeroAbility(state: SiegeState, instanceId: string): SiegeState {
  const hero = state.heroes.find((h) => h.instanceId === instanceId);
  if (!hero || !hero.isAlive || !hero.abilityUnlocked || hero.currentAbilityCooldown > 0) {
    return state;
  }

  const def = getHeroById(hero.heroId);
  const updatedHeroes = state.heroes.map((h) => {
    if (h.instanceId === instanceId) {
      return {
        ...h,
        currentAbilityCooldown: 2, // 2 turns cooldown in turn-based mode
      };
    }
    return h;
  });

  // Apply skill AoE / damage to nearest enemies within 2 cells
  const enemies = updatedHeroes.filter(
    (e) => e.isAlive && e.team !== hero.team && Math.max(Math.abs(e.pos.x - hero.pos.x), Math.abs(e.pos.y - hero.pos.y)) <= 2
  );

  const newFlashes: DamageFlash[] = [];
  const newEliminations: string[] = [];

  enemies.forEach((enemy) => {
    const dmg = 4;
    enemy.hp -= dmg;
    hero.damageDealt += dmg;
    newFlashes.push({
      id: `flash_skill_${Date.now()}_${enemy.instanceId}`,
      pos: { ...enemy.pos },
      color: '#9c27b0',
    });
    state.floatingNumbers.push({
      id: `fn_skill_${Date.now()}_${Math.random()}`,
      pos: { ...enemy.pos },
      text: `-${dmg} SKILL!`,
      color: '#ba68c8',
      lifeSec: 1.5,
    });
    if (enemy.hp <= 0) {
      enemy.hp = 0;
      enemy.isAlive = false;
      hero.kills += 1;
      newEliminations.push(enemy.instanceId);
      if (hero.team === 1) {
        grantSiegeKillCard(enemy.heroId);
      }
    }
  });

  return {
    ...state,
    heroes: updatedHeroes,
    damageFlashes: newFlashes,
    eliminatedUnitIds: newEliminations,
    events: [
      {
        id: `ev_skill_${Date.now()}`,
        timeSec: stateTime(state),
        text: `⚡ ${hero.name} executed ${def.active.name}!`,
        team: hero.team,
      },
      ...state.events,
    ],
  };
}
