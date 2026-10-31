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

export type CommandType = 'attack' | 'defend' | 'capture' | 'regroup' | 'retreat' | 'auto';
export type FormationType = 'spread' | 'clustered_left' | 'clustered_right';

export interface HeroOrder {
  type: CommandType;
  targetCoord?: Coord;
  targetEntityId?: string;
  label?: string;
}

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
  attackDamage: number;
  defense: number;
  attackRange: number;
  attackIntervalSec: number;
  moveIntervalSec: number;
  timeSinceLastAttack: number;
  timeSinceLastMove: number;
  abilityCooldownSec: number;
  currentAbilityCooldown: number;
  abilityUnlocked: boolean; // Gated by reaching a shrine
  abilityLevel?: number; // 1 to 3
  assignedAbilityId?:
    | 'royalMeteor'
    | 'curseSeal'
    | 'toxicFlask'
    | 'rallyBanner'
    | 'phaseDaggers'
    | 'jetBoots'
    | 'bastionShield'
    | 'spikyBall'
    | 'seismicSlam';
  isAlive: boolean;
  statuses: {
    type: 'silenced' | 'rooted' | 'slowed' | 'disarmed' | 'shielded' | 'buffed';
    durationSec: number;
  }[];
  order?: HeroOrder;
  // Stats tracked per hero for post-match analysis
  damageDealt: number;
  kills: number;
  shrinesCaptured: number;
}

export interface SiegePawnInstance {
  id: string;
  team: TeamSide;
  pos: Coord;
  hp: number;
  maxHp: number;
  attackDamage: number;
  defense: number;
  isAlive: boolean;
}

export interface SiegeShrine {
  id: string; // 's-left' or 's-right'
  name: string;
  cells: Coord[]; // 4 cells forming 2x2 area
  owner: TeamSide | null; // 1, 2, or null
  occupierTeam: TeamSide | null;
  isContested: boolean;
  dominionTimer: number; // Seconds held continuously by owner
}

export interface VisualProjectile {
  id: string;
  from: Coord;
  to: Coord;
  progress: number; // 0..1
  type: 'hero_slash' | 'ability_beam' | 'gas_cloud' | 'pawn_strike';
  team: TeamSide;
}

export interface FloatingNumber {
  id: string;
  pos: Coord;
  text: string;
  color: string;
  lifeSec: number;
}

export interface DamageFlash {
  id: string;
  pos: Coord;
  color?: string;
}

export interface ShrineModalState {
  heroInstanceId: string;
  shrineId: string;
}

export interface PlayerAction {
  heroInstanceId: string;
  targetPos: Coord;
  isHold?: boolean;
}

export interface SiegeState {
  tick: number;
  turn: number;
  elapsedSeconds: number;
  shrineTimerTriggered?: boolean;
  heroes: SiegeHeroInstance[];
  pawns: SiegePawnInstance[];
  shrines: SiegeShrine[];
  dominionTurns: {
    1: number; // Turns holding both shrines (win at 8)
    2: number;
  };
  dominionTimer: {
    1: number;
    2: number;
  };
  damageFlashes: DamageFlash[];
  eliminatedUnitIds: string[];
  shrineModal: ShrineModalState | null; // When non-null, turn timer is paused for ability selection
  upgradeModal?: { heroInstanceId: string; eliminatedEnemyName: string } | null; // When non-null, modal offers mid-game upgrades
  projectiles: VisualProjectile[];
  floatingNumbers: FloatingNumber[];
  winner: TeamSide | 'draw' | null;
  winReason: string | null;
  events: {
    id: string;
    timeSec: number;
    text: string;
    team?: TeamSide;
  }[];
  stats: {
    shrineControlSec: { 1: number; 2: number };
    heroesEliminated: { 1: number; 2: number };
    totalDamageDealt: { 1: number; 2: number };
    turningPointText?: string;
  };
}
