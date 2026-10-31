import { SiegeState, SiegeHeroInstance, SiegePawnInstance, Coord, TeamSide, PlayerAction, DamageFlash, VisualProjectile } from './siegeTypes';
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

    const isOrthogonal = Math.abs(dir.x) + Math.abs(dir.y) === 1;

    if (enemyHero || enemyPawn) {
      if (isOrthogonal) {
        attacks.push(targetCoord);
      }
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
 * Check if two coordinates are directly adjacent orthogonally (horizontally or vertically, distance = 1)
 */
export function isOrthogonallyAdjacent(posA: Coord, posB: Coord): boolean {
  return Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y) === 1;
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

  // Strict orthogonal rule: cannot attack diagonally or across a gap!
  const isOrthogonalContact = isOrthogonallyAdjacent(hero.pos, targetPos);

  if ((enemyHero || enemyPawn) && !isOrthogonalContact) {
    // Attempted diagonal or distance attack - ignored
    return { hero, reachedShrine: false };
  }

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
        nextState.upgradeModal = {
          heroInstanceId: hero.instanceId,
          eliminatedEnemyName: enemyHero.name,
        };
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
 * Updates shrine ownership, contested status, and dominion continuous hold (60 seconds)
 * Increments hold timer and shrine healing ONLY on 1-second real time ticks.
 */
function updateShrinesAndDominion(nextState: SiegeState, isSecondTick: boolean = false): void {
  // 1. Automatic Shrine Healing: 1 HP per second (capped at SIEGE_CONFIG.HERO_DEFAULT_HP max HP) - only on second tick
  if (isSecondTick) {
    nextState.heroes = nextState.heroes.map((h) => {
      if (h.isAlive && isCoordOnShrine(h.pos) && h.hp < SIEGE_CONFIG.HERO_DEFAULT_HP) {
        return {
          ...h,
          hp: Math.min(SIEGE_CONFIG.HERO_DEFAULT_HP, h.hp + 1),
        };
      }
      return h;
    });
  }

  // Check if any shrine currently has units from BOTH sides (Player AND Opponent)
  let hasBothSidesOnAnyShrine = false;

  nextState.shrines.forEach((shrine) => {
    const heroOccupants = nextState.heroes.filter(
      (h) => h.isAlive && shrine.cells.some((c) => c.x === h.pos.x && c.y === h.pos.y)
    );
    const pawnOccupants = nextState.pawns.filter(
      (p) => p.isAlive && shrine.cells.some((c) => c.x === p.pos.x && c.y === p.pos.y)
    );

    const playerPresent = heroOccupants.some((h) => h.team === 1) || pawnOccupants.some((p) => p.team === 1);
    const botPresent = heroOccupants.some((h) => h.team === 2) || pawnOccupants.some((p) => p.team === 2);

    if (playerPresent && botPresent) {
      hasBothSidesOnAnyShrine = true;
    }
  });

  // Shrine countdown timer triggers for both shrines once any shrine has units from both sides
  if (hasBothSidesOnAnyShrine) {
    nextState.shrineTimerTriggered = true;
  }

  const isTriggered = !!nextState.shrineTimerTriggered;

  nextState.shrines = nextState.shrines.map((shrine) => {
    const heroOccupants = nextState.heroes.filter(
      (h) => h.isAlive && shrine.cells.some((c) => c.x === h.pos.x && c.y === h.pos.y)
    );
    const pawnOccupants = nextState.pawns.filter(
      (p) => p.isAlive && shrine.cells.some((c) => c.x === p.pos.x && c.y === p.pos.y)
    );

    const playerPresent = heroOccupants.some((h) => h.team === 1) || pawnOccupants.some((p) => p.team === 1);
    const botPresent = heroOccupants.some((h) => h.team === 2) || pawnOccupants.some((p) => p.team === 2);

    let owner: TeamSide | null = shrine.owner;
    if (playerPresent && !botPresent) owner = 1;
    else if (botPresent && !playerPresent) owner = 2;

    const isContested = playerPresent && botPresent;
    let continuousHold = shrine.dominionTimer || 0;

    if (isTriggered && isSecondTick) {
      // Unstoppable real-time countdown timer advances 1 second continuously ONLY on 1-second interval tick!
      continuousHold += 1;
    } else if (!isTriggered) {
      continuousHold = 0;
    }

    return {
      ...shrine,
      owner,
      occupierTeam: isContested ? null : owner,
      isContested,
      dominionTimer: continuousHold,
    };
  });

  // Calculate highest single-shrine hold for each side
  const maxPlayerShrineHold = Math.max(
    ...nextState.shrines.map((s) => (s.owner === 1 ? s.dominionTimer : 0)),
    0
  );
  const maxBotShrineHold = Math.max(
    ...nextState.shrines.map((s) => (s.owner === 2 ? s.dominionTimer : 0)),
    0
  );

  nextState.dominionTurns[1] = maxPlayerShrineHold;
  nextState.dominionTurns[2] = maxBotShrineHold;
  nextState.dominionTimer[1] = maxPlayerShrineHold;
  nextState.dominionTimer[2] = maxBotShrineHold;

  if (isSecondTick) {
    if (maxPlayerShrineHold > 0) nextState.stats.shrineControlSec[1] += 1;
    if (maxBotShrineHold > 0) nextState.stats.shrineControlSec[2] += 1;
  }
}

/**
 * Checks win and loss conditions:
 * - 60s continuous hold on a shrine: HP comparison ONLY occurs after 60 seconds are exhausted on a shrine!
 * - Total elimination -> WIN/LOSS
 */
function checkWinConditions(nextState: SiegeState): void {
  const alivePlayerHeroes = nextState.heroes.filter((h) => h.team === 1 && h.isAlive);
  const aliveBotHeroes = nextState.heroes.filter((h) => h.team === 2 && h.isAlive);

  // 1. Single Shrine 60-Second Rule: Evaluates ONLY when 60s is reached on a shrine!
  const playerReached60 = (nextState.dominionTurns[1] >= SIEGE_CONFIG.DOMINION_WIN_HOLD_TURNS);
  const botReached60 = (nextState.dominionTurns[2] >= SIEGE_CONFIG.DOMINION_WIN_HOLD_TURNS);

  if (playerReached60 || botReached60) {
    const playerShrineHeroes = nextState.heroes.filter((h) => h.team === 1 && h.isAlive && isCoordOnShrine(h.pos));
    const botShrineHeroes = nextState.heroes.filter((h) => h.team === 2 && h.isAlive && isCoordOnShrine(h.pos));

    if (playerReached60 && !botReached60) {
      if (botShrineHeroes.length === 0) {
        nextState.winner = 1;
        nextState.winReason = 'Shrine Victory! (Held Grand Shrine for 60s with zero enemy contest at the final second)';
        awardSiegeVictoryCard(nextState);
        return;
      } else {
        // Both sides have pieces on shrines (or contesting same shrine) - HP comparison after 60s timestamp exhausted
        const playerAvgHp = playerShrineHeroes.reduce((sum, h) => sum + h.hp, 0) / playerShrineHeroes.length;
        const botAvgHp = botShrineHeroes.reduce((sum, h) => sum + h.hp, 0) / botShrineHeroes.length;
        if (playerAvgHp > botAvgHp) {
          nextState.winner = 1;
          nextState.winReason = `Shrine Dominion Victory! (Shrine Avg HP at 60s: Player ${playerAvgHp.toFixed(1)} vs Enemy ${botAvgHp.toFixed(1)})`;
          awardSiegeVictoryCard(nextState);
          return;
        } else if (botAvgHp > playerAvgHp) {
          nextState.winner = 2;
          nextState.winReason = `Defeat at 60s! (Enemy Shrine Avg HP ${botAvgHp.toFixed(1)} exceeded Player ${playerAvgHp.toFixed(1)})`;
          return;
        } else {
          // Total HP tie-break
          const pTotal = alivePlayerHeroes.reduce((s, h) => s + h.hp, 0);
          const bTotal = aliveBotHeroes.reduce((s, h) => s + h.hp, 0);
          if (pTotal >= bTotal) {
            nextState.winner = 1;
            nextState.winReason = `Shrine Victory by Squad Health Tie-Break at 60s (${pTotal} HP vs ${bTotal} HP)!`;
            awardSiegeVictoryCard(nextState);
            return;
          } else {
            nextState.winner = 2;
            nextState.winReason = `Shrine Defeat by Squad Health Tie-Break at 60s (${bTotal} HP vs ${pTotal} HP)!`;
            return;
          }
        }
      }
    } else if (botReached60 && !playerReached60) {
      if (playerShrineHeroes.length === 0) {
        nextState.winner = 2;
        nextState.winReason = 'Enemy Victory! (Enemy held shrine for 60s with no player presence at the final second)';
        return;
      } else {
        const playerAvgHp = playerShrineHeroes.reduce((sum, h) => sum + h.hp, 0) / playerShrineHeroes.length;
        const botAvgHp = botShrineHeroes.reduce((sum, h) => sum + h.hp, 0) / botShrineHeroes.length;
        if (playerAvgHp > botAvgHp) {
          nextState.winner = 1;
          nextState.winReason = `Heroic Defense! (Player Shrine Avg HP at 60s ${playerAvgHp.toFixed(1)} outlasted Enemy ${botAvgHp.toFixed(1)})`;
          awardSiegeVictoryCard(nextState);
          return;
        } else {
          nextState.winner = 2;
          nextState.winReason = `Defeat at 60s! (Enemy Shrine Avg HP at 60s ${botAvgHp.toFixed(1)} vs Player ${playerAvgHp.toFixed(1)})`;
          return;
        }
      }
    } else {
      // Both reached 60s simultaneously
      const playerAvgHp = playerShrineHeroes.length > 0 ? playerShrineHeroes.reduce((sum, h) => sum + h.hp, 0) / playerShrineHeroes.length : 0;
      const botAvgHp = botShrineHeroes.length > 0 ? botShrineHeroes.reduce((sum, h) => sum + h.hp, 0) / botShrineHeroes.length : 0;
      if (playerAvgHp >= botAvgHp) {
        nextState.winner = 1;
        nextState.winReason = `Shrine Victory by Average HP at 60s (${playerAvgHp.toFixed(1)} vs ${botAvgHp.toFixed(1)})`;
        awardSiegeVictoryCard(nextState);
        return;
      } else {
        nextState.winner = 2;
        nextState.winReason = `Defeat by Average HP at 60s (${botAvgHp.toFixed(1)} vs ${playerAvgHp.toFixed(1)})`;
        return;
      }
    }
  }

  // 2. Elimination
  if (aliveBotHeroes.length === 0 && nextState.heroes.some((h) => h.team === 2)) {
    nextState.winner = 1;
    nextState.winReason = 'Total Elimination (All Enemy Champions Defeated!)';
    awardSiegeVictoryCard(nextState);
    return;
  }
  if (alivePlayerHeroes.length === 0 && nextState.heroes.some((h) => h.team === 1)) {
    nextState.winner = 2;
    nextState.winReason = 'Squad Defeated (All Player Champions Fallen)';
    return;
  }
}

/**
 * Automatically executes orthogonal attacks (1-second interval) for any units in direct horizontal or vertical contact.
 * Strictly no diagonal attacks and no attacks across gaps.
 */
export function processOrthogonalAutoAttacks(
  state: SiegeState,
  isSecondTick: boolean = false
): {
  nextState: SiegeState;
  anyAttackHappened: boolean;
} {
  if (state.winner) return { nextState: state, anyAttackHappened: false };

  let nextState: SiegeState = {
    ...state,
    events: [...state.events],
    floatingNumbers: [...state.floatingNumbers],
    damageFlashes: [],
    eliminatedUnitIds: [],
  };

  const nextHeroes = state.heroes.map((h) => ({ ...h }));
  const nextPawns = state.pawns.map((p) => ({ ...p }));
  const newFlashes: DamageFlash[] = [];
  const newEliminations: string[] = [];
  let anyAttackHappened = false;

  // Process hero attacks against adjacent enemies
  for (const hero of nextHeroes) {
    if (!hero.isAlive) continue;

    // Find all enemy targets that are orthogonally adjacent (Manhattan distance === 1)
    const enemyHeroes = nextHeroes.filter(
      (e) => e.isAlive && e.team !== hero.team && isOrthogonallyAdjacent(hero.pos, e.pos)
    );
    const enemyPawns = nextPawns.filter(
      (p) => p.isAlive && p.team !== hero.team && isOrthogonallyAdjacent(hero.pos, p.pos)
    );

    if (enemyHeroes.length === 0 && enemyPawns.length === 0) continue;

    anyAttackHappened = true;
    enemyHeroes.sort((a, b) => a.hp - b.hp);
    const targetHero = enemyHeroes[0];
    const targetPawn = enemyPawns[0];

    if (targetHero) {
      const defenderOnShrine = isCoordOnShrine(targetHero.pos);
      const rawDmg = Math.max(1, hero.attackDamage - targetHero.defense * 0.25);
      const damage = defenderOnShrine ? Math.max(1, Math.round(rawDmg * 0.8)) : Math.round(rawDmg);

      targetHero.hp = Math.max(0, targetHero.hp - damage);
      hero.damageDealt += damage;
      nextState.stats.totalDamageDealt[hero.team] += damage;

      newFlashes.push({
        id: `flash_auto_${Date.now()}_${targetHero.instanceId}`,
        pos: { ...targetHero.pos },
        color: hero.team === 1 ? '#ef5350' : '#ff9800',
      });

      nextState.floatingNumbers.push({
        id: `fn_auto_${Date.now()}_${Math.random()}`,
        pos: { ...targetHero.pos },
        text: `-${damage}`,
        color: hero.team === 1 ? '#ef5350' : '#ff9800',
        lifeSec: 1.2,
      });

      if (targetHero.hp <= 0) {
        targetHero.hp = 0;
        targetHero.isAlive = false;
        hero.kills += 1;
        nextState.stats.heroesEliminated[hero.team] += 1;
        newEliminations.push(targetHero.instanceId);

        nextState.events.unshift({
          id: `ev_kill_${Date.now()}_${targetHero.instanceId}`,
          timeSec: nextState.turn * 5,
          text: `⚔️ ${hero.name} eliminated ${targetHero.name}!`,
          team: hero.team,
        });

        if (hero.team === 1) {
          grantSiegeKillCard(targetHero.heroId);
          nextState.upgradeModal = {
            heroInstanceId: hero.instanceId,
            eliminatedEnemyName: targetHero.name,
          };
        }
      }
    } else if (targetPawn) {
      const rawDmg = Math.max(1, hero.attackDamage);
      targetPawn.hp = Math.max(0, targetPawn.hp - rawDmg);

      newFlashes.push({
        id: `flash_pawn_auto_${Date.now()}_${targetPawn.id}`,
        pos: { ...targetPawn.pos },
        color: hero.team === 1 ? '#ef5350' : '#ff9800',
      });

      nextState.floatingNumbers.push({
        id: `fn_pawn_auto_${Date.now()}_${Math.random()}`,
        pos: { ...targetPawn.pos },
        text: `-${rawDmg}`,
        color: hero.team === 1 ? '#ef5350' : '#ff9800',
        lifeSec: 1.0,
      });

      if (targetPawn.hp <= 0) {
        targetPawn.hp = 0;
        targetPawn.isAlive = false;
        newEliminations.push(targetPawn.id);
      }
    }
  }

  // Also pawns strike adjacent enemies
  for (const pawn of nextPawns) {
    if (!pawn.isAlive) continue;
    const enemyHeroes = nextHeroes.filter(
      (e) => e.isAlive && e.team !== pawn.team && isOrthogonallyAdjacent(pawn.pos, e.pos)
    );
    const enemyPawns = nextPawns.filter(
      (p) => p.isAlive && p.team !== pawn.team && isOrthogonallyAdjacent(pawn.pos, p.pos)
    );

    const targetHero = enemyHeroes[0];
    const targetPawn = enemyPawns[0];

    if (targetHero) {
      anyAttackHappened = true;
      targetHero.hp = Math.max(0, targetHero.hp - pawn.attackDamage);
      newFlashes.push({
        id: `flash_pawn_atk_${Date.now()}_${targetHero.instanceId}`,
        pos: { ...targetHero.pos },
        color: pawn.team === 1 ? '#ef5350' : '#ff9800',
      });
      nextState.floatingNumbers.push({
        id: `fn_pawn_strike_${Date.now()}_${Math.random()}`,
        pos: { ...targetHero.pos },
        text: `-${pawn.attackDamage}`,
        color: pawn.team === 1 ? '#ef5350' : '#ff9800',
        lifeSec: 1.0,
      });
      if (targetHero.hp <= 0) {
        targetHero.hp = 0;
        targetHero.isAlive = false;
        newEliminations.push(targetHero.instanceId);
      }
    } else if (targetPawn) {
      anyAttackHappened = true;
      targetPawn.hp = Math.max(0, targetPawn.hp - pawn.attackDamage);
      if (targetPawn.hp <= 0) {
        targetPawn.hp = 0;
        targetPawn.isAlive = false;
        newEliminations.push(targetPawn.id);
      }
    }
  }

  nextState.heroes = nextHeroes;
  nextState.pawns = nextPawns;
  nextState.damageFlashes = newFlashes;
  nextState.eliminatedUnitIds = newEliminations;

  updateShrinesAndDominion(nextState, isSecondTick);
  checkWinConditions(nextState);

  return { nextState, anyAttackHappened };
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

    if (reachedShrine && !updatedHero.abilityUnlocked) {
      updatedHero.abilityUnlocked = true;
      nextState.events.unshift({
        id: `ev_unlock_${Date.now()}_${updatedHero.instanceId}`,
        timeSec: stateTime(nextState),
        text: `⚡ ${updatedHero.name} reached Grand Shrine! Personal equipment ability UNLOCKED!`,
        team: 1,
      });
    }
  }

  nextState.heroes = nextHeroes;
  nextState.pawns = nextPawns;
  nextState.damageFlashes = newFlashes;
  nextState.eliminatedUnitIds = newEliminations;

  // Update shrines
  updateShrinesAndDominion(nextState);
  checkWinConditions(nextState);

  // Trigger immediate orthogonal auto-attacks for newly adjacent units
  const autoResolved = processOrthogonalAutoAttacks(nextState);
  nextState = autoResolved.nextState;

  return { nextState, unlockedModalHeroId: null, shrineId: null };
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

  // Trigger immediate orthogonal auto-attacks for newly adjacent units
  const autoResolved = processOrthogonalAutoAttacks(nextState);
  nextState = autoResolved.nextState;

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
 * Execute tactical ability for unlocked hero matching equipment ability specifications:
 * - Meteor: Drops on an enemy piece holding a shrine (or nearest enemy).
 * - Jet Pack: Flies horizontally across to the other side, damaging every enemy in path, returns to user's shrine.
 * - Spiky Ball: Hits each enemy hero once for 1 HP.
 * - Shield Barrier: Creates a 2x2 zone around your shrine where enemies take 1-2 HP damage depending on level.
 */
export function executeHeroAbility(state: SiegeState, instanceId: string): SiegeState {
  const hero = state.heroes.find((h) => h.instanceId === instanceId);
  if (!hero || !hero.isAlive || !hero.abilityUnlocked || hero.currentAbilityCooldown > 0) {
    return state;
  }

  const level = hero.abilityLevel || 1;
  const abilityId = hero.assignedAbilityId || 'royalMeteor';
  const cdDuration = Math.max(1, hero.abilityCooldownSec || 7);

  const updatedHeroes = state.heroes.map((h) => {
    if (h.instanceId === instanceId) {
      return {
        ...h,
        currentAbilityCooldown: cdDuration,
      };
    }
    return h;
  });

  const newFlashes: DamageFlash[] = [
    {
      id: `flash_ability_hero_${Date.now()}_${hero.instanceId}`,
      pos: { ...hero.pos },
      color: '#d8b4fe',
    },
  ];
  const newProjectiles: VisualProjectile[] = [];
  const newEliminations: string[] = [];
  let abilityEventText = '';

  if (abilityId === 'royalMeteor' || (abilityId as string) === 'meteor') {
    // Royal Meteor drops on an enemy piece holding a shrine (or nearest enemy)
    const enemiesOnShrine = updatedHeroes.filter(
      (e) => e.isAlive && e.team !== hero.team && isCoordOnShrine(e.pos)
    );
    const target = enemiesOnShrine[0] || updatedHeroes.filter((e) => e.isAlive && e.team !== hero.team)[0];
    if (target) {
      const dmg = 4 + level;
      target.hp = Math.max(0, target.hp - dmg);
      hero.damageDealt += dmg;
      newFlashes.push({
        id: `flash_meteor_${Date.now()}`,
        pos: { ...target.pos },
        color: '#e5531a',
      });
      newProjectiles.push({
        id: `royalMeteor_${Date.now()}_${target.instanceId}`,
        from: { x: target.pos.x, y: Math.max(0, target.pos.y - 4) },
        to: { x: target.pos.x, y: target.pos.y },
        progress: 1,
        type: 'ability_beam',
        team: hero.team,
      });
      state.floatingNumbers.push({
        id: `fn_meteor_${Date.now()}`,
        pos: { ...target.pos },
        text: `-${dmg} ROYAL METEOR!`,
        color: '#ffb02e',
        lifeSec: 1.5,
      });
      if (target.hp <= 0) {
        target.isAlive = false;
        hero.kills += 1;
        newEliminations.push(target.instanceId);
        if (hero.team === 1) grantSiegeKillCard(target.heroId);
      }
    }
    abilityEventText = `☄️ ${hero.name} cast Royal Meteor on the battlefield!`;
  } else if (abilityId === 'curseSeal') {
    // Curse Seal hits all active enemy champions
    const allEnemies = updatedHeroes.filter((e) => e.isAlive && e.team !== hero.team);
    const dmg = 2 + level;
    allEnemies.forEach((target) => {
      target.hp = Math.max(0, target.hp - dmg);
      hero.damageDealt += dmg;
      newFlashes.push({
        id: `flash_curse_${Date.now()}_${target.instanceId}`,
        pos: { ...target.pos },
        color: '#a855f7',
      });
      newProjectiles.push({
        id: `curseSeal_${Date.now()}_${target.instanceId}`,
        from: { ...hero.pos },
        to: { ...target.pos },
        progress: 1,
        type: 'ability_beam',
        team: hero.team,
      });
      state.floatingNumbers.push({
        id: `fn_curse_${Date.now()}_${Math.random()}`,
        pos: { ...target.pos },
        text: `-${dmg} CURSED!`,
        color: '#d8b4fe',
        lifeSec: 1.5,
      });
      if (target.hp <= 0) {
        target.isAlive = false;
        hero.kills += 1;
        newEliminations.push(target.instanceId);
        if (hero.team === 1) grantSiegeKillCard(target.heroId);
      }
    });
    abilityEventText = `📜 ${hero.name} inscribed Curse Seal on all enemy champions!`;
  } else if (abilityId === 'toxicFlask') {
    // Toxic Flask hurls poison flask dealing AoE damage to enemies within 2 cells
    const dmg = 2 + level;
    const nearbyEnemies = updatedHeroes.filter(
      (e) =>
        e.isAlive &&
        e.team !== hero.team &&
        Math.abs(e.pos.x - hero.pos.x) <= 2 &&
        Math.abs(e.pos.y - hero.pos.y) <= 2
    );
    nearbyEnemies.forEach((target) => {
      target.hp = Math.max(0, target.hp - dmg);
      hero.damageDealt += dmg;
      newFlashes.push({
        id: `flash_flask_${Date.now()}_${target.instanceId}`,
        pos: { ...target.pos },
        color: '#84cc16',
      });
      newProjectiles.push({
        id: `toxicFlask_${Date.now()}_${target.instanceId}`,
        from: { ...hero.pos },
        to: { ...target.pos },
        progress: 1,
        type: 'gas_cloud',
        team: hero.team,
      });
      state.floatingNumbers.push({
        id: `fn_flask_${Date.now()}_${Math.random()}`,
        pos: { ...target.pos },
        text: `-${dmg} TOXIC!`,
        color: '#bef264',
        lifeSec: 1.5,
      });
      if (target.hp <= 0) {
        target.isAlive = false;
        hero.kills += 1;
        newEliminations.push(target.instanceId);
        if (hero.team === 1) grantSiegeKillCard(target.heroId);
      }
    });
    abilityEventText = `🧪 ${hero.name} threw a Toxic Flask inflicting acidic poison!`;
  } else if (abilityId === 'rallyBanner') {
    // Rally Banner restores HP to all allied champions
    const healAmt = 3 + level;
    const allies = updatedHeroes.filter((e) => e.isAlive && e.team === hero.team);
    newProjectiles.push({
      id: `rallyBanner_${Date.now()}_${hero.instanceId}`,
      from: { ...hero.pos },
      to: { ...hero.pos },
      progress: 1,
      type: 'ability_beam',
      team: hero.team,
    });
    allies.forEach((ally) => {
      const prevHp = ally.hp;
      ally.hp = Math.min(15, ally.hp + healAmt);
      const diff = ally.hp - prevHp;
      if (diff > 0) {
        state.floatingNumbers.push({
          id: `fn_heal_${Date.now()}_${Math.random()}`,
          pos: { ...ally.pos },
          text: `+${diff} HEAL`,
          color: '#4ade80',
          lifeSec: 1.5,
        });
      }
    });
    abilityEventText = `🚩 ${hero.name} planted Rally Banner healing all allies by +${healAmt} HP!`;
  } else if (abilityId === 'phaseDaggers') {
    // Phase Daggers strikes the lowest HP enemy hero
    const allEnemies = updatedHeroes.filter((e) => e.isAlive && e.team !== hero.team);
    allEnemies.sort((a, b) => a.hp - b.hp);
    const target = allEnemies[0];
    if (target) {
      const dmg = 4 + level;
      target.hp = Math.max(0, target.hp - dmg);
      hero.damageDealt += dmg;
      newFlashes.push({
        id: `flash_dagger_${Date.now()}`,
        pos: { ...target.pos },
        color: '#38bdf8',
      });
      newProjectiles.push({
        id: `phaseDaggers_${Date.now()}_${target.instanceId}`,
        from: { ...hero.pos },
        to: { ...target.pos },
        progress: 1,
        type: 'hero_slash',
        team: hero.team,
      });
      state.floatingNumbers.push({
        id: `fn_dagger_${Date.now()}`,
        pos: { ...target.pos },
        text: `-${dmg} PHASE CRIT!`,
        color: '#38bdf8',
        lifeSec: 1.5,
      });
      if (target.hp <= 0) {
        target.isAlive = false;
        hero.kills += 1;
        newEliminations.push(target.instanceId);
        if (hero.team === 1) grantSiegeKillCard(target.heroId);
      }
    }
    abilityEventText = `🗡️ ${hero.name} shadow dashed with Phase Daggers!`;
  } else if (abilityId === 'jetBoots' || (abilityId as string) === 'jetpack') {
    // Jet Boots flies horizontally across the row damaging enemies
    const targetY = hero.pos.y;
    const enemiesInPath = updatedHeroes.filter(
      (e) => e.isAlive && e.team !== hero.team && e.pos.y === targetY
    );
    const dmg = 3 + level;
    newProjectiles.push({
      id: `jetBoots_${Date.now()}_${hero.instanceId}`,
      from: { x: 0, y: targetY },
      to: { x: 7, y: targetY },
      progress: 1,
      type: 'ability_beam',
      team: hero.team,
    });
    enemiesInPath.forEach((target) => {
      target.hp = Math.max(0, target.hp - dmg);
      hero.damageDealt += dmg;
      newFlashes.push({
        id: `flash_jet_${Date.now()}_${target.instanceId}`,
        pos: { ...target.pos },
        color: '#38bdf8',
      });
      state.floatingNumbers.push({
        id: `fn_jet_${Date.now()}_${Math.random()}`,
        pos: { ...target.pos },
        text: `-${dmg} JETPACK!`,
        color: '#38bdf8',
        lifeSec: 1.5,
      });
      if (target.hp <= 0) {
        target.isAlive = false;
        hero.kills += 1;
        newEliminations.push(target.instanceId);
        if (hero.team === 1) grantSiegeKillCard(target.heroId);
      }
    });
    abilityEventText = `🚀 ${hero.name} dashed with Rocket Jet Pack across Row ${8 - targetY}!`;
  } else if (abilityId === 'bastionShield' || (abilityId as string) === 'shield_barrier') {
    // Bastion Shield grants shield/heal to shrine allies & damages shrine enemies
    const healAmt = 2 + level;
    const allies = updatedHeroes.filter((e) => e.isAlive && e.team === hero.team && isCoordOnShrine(e.pos));
    newProjectiles.push({
      id: `bastionShield_${Date.now()}_${hero.instanceId}`,
      from: { ...hero.pos },
      to: { ...hero.pos },
      progress: 1,
      type: 'ability_beam',
      team: hero.team,
    });
    allies.forEach((ally) => {
      ally.hp = Math.min(15, ally.hp + healAmt);
      state.floatingNumbers.push({
        id: `fn_barrier_heal_${Date.now()}_${Math.random()}`,
        pos: { ...ally.pos },
        text: `+${healAmt} SHIELD`,
        color: '#fbbf24',
        lifeSec: 1.5,
      });
    });
    const enemiesAtShrines = updatedHeroes.filter((e) => e.isAlive && e.team !== hero.team && isCoordOnShrine(e.pos));
    enemiesAtShrines.forEach((target) => {
      const dmg = 2 + level;
      target.hp = Math.max(0, target.hp - dmg);
      hero.damageDealt += dmg;
      if (target.hp <= 0) {
        target.isAlive = false;
        hero.kills += 1;
        newEliminations.push(target.instanceId);
        if (hero.team === 1) grantSiegeKillCard(target.heroId);
      }
    });
    abilityEventText = `🛡️ ${hero.name} cast Bastion Barrier fortifying the Grand Shrine!`;
  } else if (abilityId === 'spikyBall' || (abilityId as string) === 'spiky_ball') {
    // Spiky Ball ricochets hitting all enemy heroes
    const allEnemies = updatedHeroes.filter((e) => e.isAlive && e.team !== hero.team);
    const dmg = 2 + level;
    allEnemies.forEach((target) => {
      target.hp = Math.max(0, target.hp - dmg);
      hero.damageDealt += dmg;
      newFlashes.push({
        id: `flash_spiky_${Date.now()}_${target.instanceId}`,
        pos: { ...target.pos },
        color: '#94a3b8',
      });
      newProjectiles.push({
        id: `spikyBall_${Date.now()}_${target.instanceId}`,
        from: { ...hero.pos },
        to: { ...target.pos },
        progress: 1,
        type: 'ability_beam',
        team: hero.team,
      });
      state.floatingNumbers.push({
        id: `fn_spiky_${Date.now()}_${Math.random()}`,
        pos: { ...target.pos },
        text: `-${dmg} SPIKE!`,
        color: '#f8fafc',
        lifeSec: 1.2,
      });
      if (target.hp <= 0) {
        target.isAlive = false;
        hero.kills += 1;
        newEliminations.push(target.instanceId);
        if (hero.team === 1) grantSiegeKillCard(target.heroId);
      }
    });
    abilityEventText = `⚽ ${hero.name} launched Spiky Ball hitting all enemy champions!`;
  } else if (abilityId === 'seismicSlam') {
    // Seismic Slam ground shockwave AoE in 3x3 radius around caster
    const dmg = 3 + level;
    const surroundingEnemies = updatedHeroes.filter(
      (e) =>
        e.isAlive &&
        e.team !== hero.team &&
        Math.abs(e.pos.x - hero.pos.x) <= 1 &&
        Math.abs(e.pos.y - hero.pos.y) <= 1
    );
    newProjectiles.push({
      id: `seismicSlam_${Date.now()}_${hero.instanceId}`,
      from: { ...hero.pos },
      to: { ...hero.pos },
      progress: 1,
      type: 'ability_beam',
      team: hero.team,
    });
    surroundingEnemies.forEach((target) => {
      target.hp = Math.max(0, target.hp - dmg);
      hero.damageDealt += dmg;
      newFlashes.push({
        id: `flash_slam_${Date.now()}_${target.instanceId}`,
        pos: { ...target.pos },
        color: '#f97316',
      });
      state.floatingNumbers.push({
        id: `fn_slam_${Date.now()}_${Math.random()}`,
        pos: { ...target.pos },
        text: `-${dmg} SLAM!`,
        color: '#fb923c',
        lifeSec: 1.5,
      });
      if (target.hp <= 0) {
        target.isAlive = false;
        hero.kills += 1;
        newEliminations.push(target.instanceId);
        if (hero.team === 1) grantSiegeKillCard(target.heroId);
      }
    });
    abilityEventText = `💥 ${hero.name} executed Seismic Slam shaking the earth!`;
  }

  // Check if player eliminated any enemy piece to trigger mid-game upgrade modal
  let upgradeModal = state.upgradeModal;
  if (hero.team === 1 && newEliminations.length > 0) {
    const eliminated = state.heroes.find((h) => h.instanceId === newEliminations[0]);
    upgradeModal = {
      heroInstanceId: hero.instanceId,
      eliminatedEnemyName: eliminated?.name || 'Enemy Champion',
    };
  }

  return {
    ...state,
    heroes: updatedHeroes,
    damageFlashes: newFlashes,
    eliminatedUnitIds: newEliminations,
    projectiles: newProjectiles,
    upgradeModal,
    events: [
      {
        id: `ev_skill_${Date.now()}`,
        timeSec: stateTime(state),
        text: abilityEventText,
        team: hero.team,
      },
      ...state.events,
    ],
  };
}

/**
 * Apply mid-game ability upgrade selected by player:
 * Cooldown reduction (-1s/turn) or Potency/Range boost
 */
export function applyAbilityUpgrade(
  state: SiegeState,
  heroInstanceId: string,
  upgradeType: 'cooldown' | 'potency_range'
): SiegeState {
  const updatedHeroes = state.heroes.map((h) => {
    if (h.instanceId === heroInstanceId) {
      const nextLvl = Math.min(3, (h.abilityLevel || 1) + 1);
      const nextCd = upgradeType === 'cooldown' ? Math.max(1, (h.abilityCooldownSec || 3) - 1) : h.abilityCooldownSec;
      return {
        ...h,
        abilityLevel: nextLvl,
        abilityCooldownSec: nextCd,
      };
    }
    return h;
  });

  const hero = state.heroes.find((h) => h.instanceId === heroInstanceId);

  return {
    ...state,
    heroes: updatedHeroes,
    upgradeModal: null,
    events: [
      {
        id: `ev_upg_${Date.now()}`,
        timeSec: stateTime(state),
        text: `⭐ ${hero?.name || 'Hero'} upgraded ability to Level ${Math.min(3, (hero?.abilityLevel || 1) + 1)} (${
          upgradeType === 'cooldown' ? '-1s Cooldown' : '+Power / Range'
        })!`,
        team: 1,
      },
      ...state.events,
    ],
  };
}

/**
 * Dismiss mid-game ability upgrade modal
 */
export function dismissAbilityUpgrade(state: SiegeState): SiegeState {
  return {
    ...state,
    upgradeModal: null,
  };
}

