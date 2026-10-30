import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { Coord, SiegeHeroInstance, SiegeTower, SiegeThrone } from './siegeTypes';

export function getBlockedCells(
  heroes: SiegeHeroInstance[],
  towers: SiegeTower[],
  thrones: SiegeThrone[],
  currentHeroId?: string
): Set<string> {
  const blocked = new Set<string>();

  // Add obstacles
  for (const obs of SIEGE_CONFIG.OBSTACLES) {
    blocked.add(`${obs.x},${obs.y}`);
  }

  // Add living thrones
  for (const th of thrones) {
    if (th.isAlive) {
      blocked.add(`${th.pos.x},${th.pos.y}`);
    }
  }

  // Add living towers
  for (const tw of towers) {
    if (tw.isAlive) {
      blocked.add(`${tw.pos.x},${tw.pos.y}`);
    }
  }

  // Add other living heroes
  for (const h of heroes) {
    if (h.isAlive && h.instanceId !== currentHeroId) {
      blocked.add(`${h.pos.x},${h.pos.y}`);
    }
  }

  return blocked;
}

export function findPath(
  start: Coord,
  goal: Coord,
  blocked: Set<string>
): Coord[] {
  if (start.x === goal.x && start.y === goal.y) return [start];

  const queue: Coord[][] = [[start]];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const curr = path[path.length - 1];

    if (curr.x === goal.x && curr.y === goal.y) {
      return path;
    }

    const neighbors: Coord[] = [
      { x: curr.x + 1, y: curr.y },
      { x: curr.x - 1, y: curr.y },
      { x: curr.x, y: curr.y + 1 },
      { x: curr.x, y: curr.y - 1 },
    ];

    for (const n of neighbors) {
      if (n.x < 0 || n.x >= SIEGE_CONFIG.COLS || n.y < 0 || n.y >= SIEGE_CONFIG.ROWS) continue;
      const key = `${n.x},${n.y}`;
      if (visited.has(key)) continue;
      // Allow goal even if blocked (or adjacent)
      if (blocked.has(key) && !(n.x === goal.x && n.y === goal.y)) continue;

      visited.add(key);
      queue.push([...path, n]);
    }
  }

  // Fallback: return adjacent step towards goal if full path blocked
  const dx = Math.sign(goal.x - start.x);
  const dy = Math.sign(goal.y - start.y);
  const step1 = { x: start.x + dx, y: start.y };
  const step2 = { x: start.x, y: start.y + dy };
  if (!blocked.has(`${step1.x},${step1.y}`) && step1.x >= 0 && step1.x < SIEGE_CONFIG.COLS && step1.y >= 0 && step1.y < SIEGE_CONFIG.ROWS) {
    return [start, step1];
  }
  if (!blocked.has(`${step2.x},${step2.y}`) && step2.x >= 0 && step2.x < SIEGE_CONFIG.COLS && step2.y >= 0 && step2.y < SIEGE_CONFIG.ROWS) {
    return [start, step2];
  }

  return [start];
}
