import { HeroDefinition } from '../types/heroDuelTypes';

export const YJKSTRA_PATHFINDER: HeroDefinition = {
  id: 'yjkstra-pathfinder',
  name: 'Yjkstra',
  title: 'The Pathfinder',
  role: 'Tactician / Repositioner',
  movementDescription: 'Orthogonal slider up to 3 squares; captures orthogonally only.',
  active: {
    id: 'shortest_path',
    name: 'Shortest Path',
    description: 'Choose any friendly hero (including self) and move it along any valid route of up to 4 steps through empty squares (BFS pathfinding, ignoring that hero’s normal move pattern). The path is previewed before confirmation.',
    baseCooldown: 4,
    rangeSquares: 4,
    requiresTarget: true,
    targetType: 'ally_hero',
  },
  passives: [
    {
      id: 'greedy_relaxation',
      name: 'Greedy Relaxation',
      description: 'After Yjkstra captures an enemy hero, it takes one free 1-square non-capturing step.',
    },
    {
      id: 'edge_weights',
      name: 'Edge Weights',
      description: 'Enemy sliders cannot slide through squares adjacent to Yjkstra; they must stop immediately upon reaching an adjacent square (Zone of Control).',
    },
  ],
  weakness: 'Cannot capture diagonally; the Shortest Path ability repositions but does not directly capture.',
  counterplay: 'Attack diagonally or pin with leapers that ignore slider zone of control.',
  avatarIcon: 'Compass',
};
