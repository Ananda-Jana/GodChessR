import { BOARD_COLS, BOARD_ROWS, BoardPosition, COL_LABELS, ROW_LABELS } from '../config/boardConfig';

export function isWithinBoard(pos: BoardPosition): boolean {
  return pos.x >= 0 && pos.x < BOARD_COLS && pos.y >= 0 && pos.y < BOARD_ROWS;
}

export function isSamePos(a: BoardPosition, b: BoardPosition): boolean {
  return a.x === b.x && a.y === b.y;
}

export function posToNotation(pos: BoardPosition): string {
  if (!isWithinBoard(pos)) return '??';
  return `${COL_LABELS[pos.x]}${ROW_LABELS[pos.y]}`;
}

export function notationToPos(notation: string): BoardPosition | null {
  if (notation.length !== 2) return null;
  const colLetter = notation[0].toUpperCase();
  const rowNumber = notation[1];
  const x = COL_LABELS.indexOf(colLetter as any);
  const y = ROW_LABELS.indexOf(rowNumber as any);
  if (x === -1 || y === -1) return null;
  return { x, y };
}

export function getChebyshevDistance(a: BoardPosition, b: BoardPosition): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function getManhattanDistance(a: BoardPosition, b: BoardPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function isBorderSquare(pos: BoardPosition): boolean {
  return pos.x === 0 || pos.x === BOARD_COLS - 1 || pos.y === 0 || pos.y === BOARD_ROWS - 1;
}

/**
 * Breadth-First-Search pathfinding on 7x8 grid through empty squares
 * Used for Yjkstra's Shortest Path ability (up to maxSteps, e.g. 4)
 */
export function findBfsPaths(
  startPos: BoardPosition,
  maxSteps: number,
  isSquareBlocked: (pos: BoardPosition) => boolean
): { dest: BoardPosition; path: BoardPosition[] }[] {
  const results: { dest: BoardPosition; path: BoardPosition[] }[] = [];
  const queue: { current: BoardPosition; path: BoardPosition[]; distance: number }[] = [
    { current: startPos, path: [], distance: 0 },
  ];
  const visited = new Set<string>();
  visited.add(`${startPos.x},${startPos.y}`);

  const directions = [
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
  ];

  while (queue.length > 0) {
    const { current, path, distance } = queue.shift()!;
    if (distance >= maxSteps) continue;

    for (const d of directions) {
      const nextPos: BoardPosition = { x: current.x + d.dx, y: current.y + d.dy };
      const key = `${nextPos.x},${nextPos.y}`;

      if (!isWithinBoard(nextPos) || visited.has(key)) continue;
      if (isSquareBlocked(nextPos)) continue;

      visited.add(key);
      const nextPath = [...path, nextPos];
      results.push({ dest: nextPos, path: nextPath });
      queue.push({ current: nextPos, path: nextPath, distance: distance + 1 });
    }
  }

  return results;
}
