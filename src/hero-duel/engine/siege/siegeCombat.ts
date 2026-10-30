import { Coord, SiegeHeroInstance, SiegeTower, SiegeThrone, TeamSide } from './siegeTypes';

export function getChebyshevDistance(a: Coord, b: Coord): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function isThroneShielded(team: TeamSide, towers: SiegeTower[]): boolean {
  const teamTowers = towers.filter((t) => t.team === team);
  // Shielded if at least one tower is still alive
  return teamTowers.some((t) => t.isAlive);
}
