import { HeroId } from '../../types/heroDuelTypes';

export type TeamSide = 1 | 2; // 1 = player (bottom), 2 = bot (top)

export interface Coord {
  x: number;
  y: number;
}

export type HeroRole =
  | 'leader'
  | 'controller'
  | 'area'
  | 'commander'
  | 'assassin'
  | 'pathfinder'
  | 'tank'
  | 'trickster'
  | 'bruiser';

export interface SiegeHeroInstance {
  instanceId: string;
  heroId: HeroId;
  team: TeamSide;
  name: string;
  title: string;
  role: HeroRole;
  pos: Coord;
  targetPos: Coord | null;
  hp: number;
  maxHp: number;
  attackRange: number;
  attackDamage: number;
  attackIntervalSec: number;
  moveIntervalSec: number;
  timeSinceLastAttack: number;
  timeSinceLastMove: number;
  abilityCooldownSec: number;
  currentAbilityCooldown: number;
  isAlive: boolean;
  statuses: {
    type: 'silenced' | 'rooted' | 'slowed' | 'disarmed';
    durationSec: number;
  }[];
  order?: {
    type: 'move' | 'attack_target' | 'capture_shrine';
    targetCoord?: Coord;
    targetEntityId?: string;
  };
}

export interface SiegeTower {
  id: string;
  team: TeamSide;
  pos: Coord;
  hp: number;
  maxHp: number;
  timeSinceLastAttack: number;
  isAlive: boolean;
}

export interface SiegeThrone {
  team: TeamSide;
  pos: Coord;
  hp: number;
  maxHp: number;
  isAlive: boolean;
}

export interface SiegeShrine {
  id: string;
  pos: Coord;
  owner: TeamSide | null; // 1, 2, or null (neutral)
  capturingTeam: TeamSide | null;
  progress: number; // 0 to 4.0 seconds
}

export interface SiegeState {
  tick: number;
  elapsedSeconds: number;
  heroes: SiegeHeroInstance[];
  towers: SiegeTower[];
  thrones: SiegeThrone[];
  shrines: SiegeShrine[];
  dominion: {
    1: number;
    2: number;
  };
  winner: TeamSide | 'draw' | null;
  winReason: string | null;
  events: {
    id: string;
    timeSec: number;
    text: string;
    team?: TeamSide;
  }[];
}
