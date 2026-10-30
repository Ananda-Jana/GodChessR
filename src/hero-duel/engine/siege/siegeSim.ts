import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { SiegeState, TeamSide, Coord, SiegeHeroInstance } from './siegeTypes';
import { getBlockedCells, findPath } from './pathfinding';
import { getChebyshevDistance, isThroneShielded } from './siegeCombat';

export function simulateSiegeTick(state: SiegeState, dtSec: number = 0.1): SiegeState {
  if (state.winner) return state;

  const newTick = state.tick + 1;
  const newElapsed = state.elapsedSeconds + dtSec;

  // Check timeout (5 minutes)
  if (newElapsed >= SIEGE_CONFIG.MAX_MATCH_SECONDS) {
    const d1 = state.dominion[1];
    const d2 = state.dominion[2];
    let timeoutWinner: TeamSide | 'draw' | null = null;
    let reason = 'Time expired - Draw';

    if (d1 > d2) {
      timeoutWinner = 1;
      reason = 'Time expired - Higher Dominion';
    } else if (d2 > d1) {
      timeoutWinner = 2;
      reason = 'Time expired - Higher Dominion';
    } else {
      const s1 = state.shrines.filter((s) => s.owner === 1).length;
      const s2 = state.shrines.filter((s) => s.owner === 2).length;
      if (s1 > s2) {
        timeoutWinner = 1;
        reason = 'Time expired - More Shrines Held';
      } else if (s2 > s1) {
        timeoutWinner = 2;
        reason = 'Time expired - More Shrines Held';
      }
    }

    return {
      ...state,
      tick: newTick,
      elapsedSeconds: newElapsed,
      winner: timeoutWinner,
      winReason: reason,
    };
  }

  const heroes = [...state.heroes.map((h) => ({ ...h, statuses: [...h.statuses] }))];
  const towers = [...state.towers.map((t) => ({ ...t }))];
  const thrones = [...state.thrones.map((th) => ({ ...th }))];
  const shrines = [...state.shrines.map((s) => ({ ...s }))];
  const events = [...state.events];

  const pushEvent = (text: string, team?: TeamSide) => {
    events.unshift({
      id: `ev_${newTick}_${Math.random()}`,
      timeSec: Number(newElapsed.toFixed(1)),
      text,
      team,
    });
    if (events.length > 50) events.pop();
  };

  // 1. Update statuses and cooldowns
  for (const h of heroes) {
    if (!h.isAlive) continue;

    if (h.currentAbilityCooldown > 0) {
      const heldShrines = shrines.filter((s) => {
        if (s.owner !== h.team) return false;
        return heroes.some((ally) => ally.isAlive && ally.team === h.team && getChebyshevDistance(ally.pos, s.pos) <= 1);
      }).length;
      const rechargeMult = 1 + heldShrines * SIEGE_CONFIG.COOLDOWN_RECHARGE_BONUS_PER_SHRINE;
      h.currentAbilityCooldown = Math.max(0, h.currentAbilityCooldown - dtSec * rechargeMult);
    }

    h.statuses = h.statuses
      .map((st) => ({ ...st, durationSec: st.durationSec - dtSec }))
      .filter((st) => st.durationSec > 0);
  }

  // 2. Shrines Capture & Dominion
  const teamShrinesHeld = { 1: 0, 2: 0 };
  for (const s of shrines) {
    const presentTeam1 = heroes.some((h) => h.isAlive && h.team === 1 && getChebyshevDistance(h.pos, s.pos) <= 1);
    const presentTeam2 = heroes.some((h) => h.isAlive && h.team === 2 && getChebyshevDistance(h.pos, s.pos) <= 1);

    if (presentTeam1 && !presentTeam2) {
      if (s.owner === 1) {
        s.capturingTeam = 1;
        s.progress = 4.0;
      } else if (s.owner === null) {
        if (s.capturingTeam !== 1) {
          s.capturingTeam = 1;
          s.progress = 0;
        }
        s.progress += dtSec;
        if (s.progress >= SIEGE_CONFIG.SHRINE_CAPTURE_SECONDS) {
          s.owner = 1;
          s.capturingTeam = null;
          pushEvent(`Team 1 captured ${s.id} shrine!`, 1);
        }
      } else {
        if (s.capturingTeam !== 1) {
          s.capturingTeam = 1;
          s.progress = SIEGE_CONFIG.SHRINE_CAPTURE_SECONDS;
        }
        s.progress -= dtSec;
        if (s.progress <= 0) {
          s.owner = null;
          s.capturingTeam = null;
          s.progress = 0;
          pushEvent(`Team 1 neutralized ${s.id} shrine!`, 1);
        }
      }
    } else if (presentTeam2 && !presentTeam1) {
      if (s.owner === 2) {
        s.capturingTeam = 2;
        s.progress = 4.0;
      } else if (s.owner === null) {
        if (s.capturingTeam !== 2) {
          s.capturingTeam = 2;
          s.progress = 0;
        }
        s.progress += dtSec;
        if (s.progress >= SIEGE_CONFIG.SHRINE_CAPTURE_SECONDS) {
          s.owner = 2;
          s.capturingTeam = null;
          pushEvent(`Team 2 captured ${s.id} shrine!`, 2);
        }
      } else {
        if (s.capturingTeam !== 2) {
          s.capturingTeam = 2;
          s.progress = 0;
        }
        s.progress -= dtSec;
        if (s.progress <= 0) {
          s.owner = null;
          s.capturingTeam = null;
          s.progress = 0;
          pushEvent(`Team 2 neutralized ${s.id} shrine!`, 2);
        }
      }
    }

    if (s.owner === 1) teamShrinesHeld[1]++;
    if (s.owner === 2) teamShrinesHeld[2]++;
  }

  const dominion = { ...state.dominion };
  if (teamShrinesHeld[1] > teamShrinesHeld[2]) {
    const diff = teamShrinesHeld[1] - teamShrinesHeld[2];
    dominion[1] = Math.min(SIEGE_CONFIG.DOMINION_WIN_SCORE, dominion[1] + diff * SIEGE_CONFIG.DOMINION_GAIN_RATE * dtSec);
  } else if (teamShrinesHeld[2] > teamShrinesHeld[1]) {
    const diff = teamShrinesHeld[2] - teamShrinesHeld[1];
    dominion[2] = Math.min(SIEGE_CONFIG.DOMINION_WIN_SCORE, dominion[2] + diff * SIEGE_CONFIG.DOMINION_GAIN_RATE * dtSec);
  }

  let winner: TeamSide | 'draw' | null = state.winner;
  let winReason: string | null = state.winReason;

  if (dominion[1] >= SIEGE_CONFIG.DOMINION_WIN_SCORE) {
    winner = 1;
    winReason = 'Team 1 achieved 100 Dominion!';
  } else if (dominion[2] >= SIEGE_CONFIG.DOMINION_WIN_SCORE) {
    winner = 2;
    winReason = 'Team 2 achieved 100 Dominion!';
  }

  // 3. Towers firing
  for (const tw of towers) {
    if (!tw.isAlive) continue;
    tw.timeSinceLastAttack += dtSec;
    if (tw.timeSinceLastAttack >= SIEGE_CONFIG.TOWER_ATTACK_SECONDS) {
      tw.timeSinceLastAttack = 0;
      const enemyTeam: TeamSide = tw.team === 1 ? 2 : 1;
      const enemiesInRange = heroes.filter((h) => h.isAlive && h.team === enemyTeam && getChebyshevDistance(h.pos, tw.pos) <= SIEGE_CONFIG.TOWER_RANGE);
      if (enemiesInRange.length > 0) {
        enemiesInRange.sort((a, b) => a.hp - b.hp);
        const target = enemiesInRange[0];
        target.hp -= SIEGE_CONFIG.TOWER_DAMAGE;
        pushEvent(`Tower shot ${target.name} for 1 damage!`, tw.team);
        if (target.hp <= 0) {
          target.isAlive = false;
          pushEvent(`${target.name} was destroyed by Tower!`, tw.team);
        }
      }
    }
  }

  // 4. Hero Movement and Combat
  const blocked = getBlockedCells(heroes, towers, thrones);

  for (const h of heroes) {
    if (!h.isAlive) continue;
    const isRooted = h.statuses.some((st) => st.type === 'rooted');
    const isDisarmed = h.statuses.some((st) => st.type === 'disarmed');
    const isSlowed = h.statuses.some((st) => st.type === 'slowed');

    const enemyTeam: TeamSide = h.team === 1 ? 2 : 1;
    const enemiesInRange = heroes.filter((en) => en.isAlive && en.team === enemyTeam && getChebyshevDistance(h.pos, en.pos) <= h.attackRange);

    const enemyThrone = thrones.find((th) => th.team === enemyTeam && th.isAlive);
    const enemyTowers = towers.filter((tw) => tw.team === enemyTeam && tw.isAlive);

    h.timeSinceLastAttack += dtSec;
    const effectiveAtkInterval = isSlowed ? h.attackIntervalSec * 1.5 : h.attackIntervalSec;

    if (!isDisarmed && h.timeSinceLastAttack >= effectiveAtkInterval) {
      if (enemiesInRange.length > 0) {
        enemiesInRange.sort((a, b) => a.hp - b.hp);
        const target = enemiesInRange[0];
        target.hp -= h.attackDamage;
        h.timeSinceLastAttack = 0;
        pushEvent(`${h.name} attacked ${target.name} for 1 damage!`, h.team);
        if (target.hp <= 0) {
          target.isAlive = false;
          pushEvent(`${target.name} was defeated by ${h.name}!`, h.team);
        }
      } else if (enemyThrone && getChebyshevDistance(h.pos, enemyThrone.pos) <= h.attackRange) {
        if (!isThroneShielded(enemyTeam, towers)) {
          enemyThrone.hp -= h.attackDamage;
          h.timeSinceLastAttack = 0;
          pushEvent(`${h.name} struck enemy Throne for 1 damage!`, h.team);
          if (enemyThrone.hp <= 0) {
            enemyThrone.isAlive = false;
            winner = h.team;
            winReason = `Team ${h.team} destroyed the enemy Throne!`;
          }
        }
      } else {
        const twInRange = enemyTowers.find((tw) => getChebyshevDistance(h.pos, tw.pos) <= h.attackRange);
        if (twInRange) {
          twInRange.hp -= h.attackDamage;
          h.timeSinceLastAttack = 0;
          pushEvent(`${h.name} attacked enemy Tower for 1 damage!`, h.team);
          if (twInRange.hp <= 0) {
            twInRange.isAlive = false;
            pushEvent(`Enemy Tower was destroyed by ${h.name}!`, h.team);
          }
        }
      }
    }

    if (!isRooted) {
      h.timeSinceLastMove += dtSec;
      const effectiveMoveInterval = isSlowed ? h.moveIntervalSec * 1.5 : h.moveIntervalSec;

      if (h.timeSinceLastMove >= effectiveMoveInterval) {
        h.timeSinceLastMove = 0;
        let goal: Coord | null = null;

        if (h.order?.type === 'move' && h.order.targetCoord) {
          goal = h.order.targetCoord;
        } else if (h.order?.type === 'capture_shrine') {
          const nearestShrine = shrines[0];
          goal = nearestShrine ? nearestShrine.pos : null;
        } else {
          const uncapturedShrine = shrines.find((s) => s.owner !== h.team);
          if (uncapturedShrine && Math.random() > 0.4) {
            goal = uncapturedShrine.pos;
          } else {
            goal = enemyThrone ? enemyThrone.pos : { x: 4, y: h.team === 1 ? 12 : 0 };
          }
        }

        if (goal && (h.pos.x !== goal.x || h.pos.y !== goal.y)) {
          const path = findPath(h.pos, goal, blocked);
          if (path.length > 1) {
            const nextStep = path[1];
            const nextKey = `${nextStep.x},${nextStep.y}`;
            if (!blocked.has(nextKey)) {
              h.pos = nextStep;
            }
          }
        }
      }
    }
  }

  const t1Alive = heroes.some((h) => h.team === 1 && h.isAlive);
  const t2Alive = heroes.some((h) => h.team === 2 && h.isAlive);
  if (!t1Alive && t2Alive) {
    winner = 2;
    winReason = 'All Team 1 heroes fell!';
  } else if (!t2Alive && t1Alive) {
    winner = 1;
    winReason = 'All Team 2 heroes fell!';
  }

  return {
    ...state,
    tick: newTick,
    elapsedSeconds: newElapsed,
    heroes,
    towers,
    thrones,
    shrines,
    dominion,
    winner,
    winReason,
    events,
  };
}
