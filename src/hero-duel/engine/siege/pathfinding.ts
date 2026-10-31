import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { Coord, SiegeHeroInstance, SiegePawnInstance } from './siegeTypes';

export function getBlockedCells(
  heroes: SiegeHeroInstance[],
  pawns: SiegePawnInstance[],
  currentEntityId?: string
): Set<string> {
  const blocked = new Set<string>();

  // Add living friendly/enemy heroes
  for (const h of heroes) {
    if (h.isAlive && h.instanceId !== currentEntityId) {
      blocked.add(`${h.pos.x},${h.pos.y}`);
    }
  }

  // Add living pawns
  for (const p of pawns) {
    if (p.isAlive && p.id !== currentEntityId) {
      blocked.add(`${p.pos.x},${p.pos.y}`);
    }
  }

  return blocked;
}

/**
 * Find path supporting 8-direction King movement on 8x8 grid
 */
export function findPath(
  start: Coord,
  goal: Coord,
  blocked: Set<string>
): Coord[] {
  if (start.x === goal.x && start.y === goal.y) return [start];

  const queue: Coord[][] = [[start]];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  // 8 Directions: Orthogonal + Diagonals
  const dirOffsets = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
    { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 },
  ];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const curr = path[path.length - 1];

    if (curr.x === goal.x && curr.y === goal.y) {
      return path;
    }

    for (const d of dirOffsets) {
      const nx = curr.x + d.x;
      const ny = curr.y + d.y;
      if (nx < 0 || nx >= SIEGE_CONFIG.COLS || ny < 0 || ny >= SIEGE_CONFIG.ROWS) continue;

      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;
      // Allow stepping onto goal even if occupied (to initiate combat)
      if (blocked.has(key) && !(nx === goal.x && ny === goal.y)) continue;

      visited.add(key);
      queue.push([...path, { x: nx, y: ny }]);
    }
  }

  // Fallback: 1-step King movement towards goal
  const dx = Math.sign(goal.x - start.x);
  const dy = Math.sign(goal.y - start.y);
  const fallbackStep = { x: start.x + dx, y: start.y + dy };

  if (
    fallbackStep.x >= 0 && fallbackStep.x < SIEGE_CONFIG.COLS &&
    fallbackStep.y >= 0 && fallbackStep.y < SIEGE_CONFIG.ROWS &&
    !blocked.has(`${fallbackStep.x},${fallbackStep.y}`)
  ) {
    return [start, fallbackStep];
  }

  return [start];
}
