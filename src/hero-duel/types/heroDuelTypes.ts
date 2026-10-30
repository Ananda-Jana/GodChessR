/**
 * Core types for Hero Duel Game Mode
 */

import { BoardPosition } from '../config/boardConfig';

export type PlayerSide = 'player1' | 'player2';

export type HeroId =
  | 'mugen-king'
  | 'malevolent-priest'
  | 'dr-methanogenic'
  | 'captain-englland'
  | 'ajx-assassin'
  | 'yjkstra-pathfinder'
  | 'ironclad-warden'
  | 'black-monkey'
  | 'part-king-kong';

export type StatusEffectType =
  | 'silenced'   // Cannot use active ability
  | 'rooted'     // Cannot move
  | 'slowed'     // Movement range -1 (minimum 1)
  | 'disarmed'   // May move, but cannot capture
  | 'cursed'     // Takes effect from specific hero abilities
  | 'untargetable'; // Cannot be targeted by enemy active abilities

export interface ActiveStatus {
  type: StatusEffectType;
  durationTurns: number;
  sourceHeroId?: string;
}

export type ZoneObjectType = 'gas' | 'shrine' | 'banner' | 'wall' | 'decoy' | 'spore' | 'portal';

export interface BoardZoneObject {
  id: string;
  type: ZoneObjectType;
  owner: PlayerSide;
  position: BoardPosition;
  durationTurns: number;
  pairedPortalPos?: BoardPosition; // For linked portal sigils
}

export interface HeroPassiveDef {
  id: string;
  name: string;
  description: string;
  isOneTime?: boolean;
  cooldownMax?: number;
}

export interface HeroActiveDef {
  id: string;
  name: string;
  description: string;
  baseCooldown: number;
  rangeSquares: number;
  requiresTarget: boolean;
  targetType: 'self' | 'empty_square' | 'ally_hero' | 'enemy_hero' | 'any_square';
}

export interface HeroDefinition {
  id: HeroId;
  name: string;
  title: string;
  role: string;
  movementDescription: string;
  active: HeroActiveDef;
  passives: [HeroPassiveDef, HeroPassiveDef];
  weakness: string;
  counterplay: string;
  avatarIcon: string;
}

export interface InGameHeroState {
  instanceId: string;
  heroId: HeroId;
  owner: PlayerSide;
  position: BoardPosition;
  isCaptain: boolean;
  isAlive: boolean;
  currentCooldown: number; // Ticks down at end of owner's turn
  passiveCooldowns: Record<string, number>;
  passiveUsedFlags: Record<string, boolean>; // For once-per-match passives like Second Crown, Thick Hide
  statuses: ActiveStatus[];
  equippedItemId?: string;
  activeSigilId?: string; // Replaces default active if crafted
}

export type ActionType = 'move' | 'ability' | 'chain_capture';

export interface HeroAction {
  type: ActionType;
  actorInstanceId: string;
  from: BoardPosition;
  to: BoardPosition;
  abilityId?: string;
  targetInstanceId?: string;
  path?: BoardPosition[]; // For Yjkstra BFS shortest path
}

export type MatchPhase =
  | 'hub'
  | 'draft'
  | 'placement'
  | 'battle'
  | 'card_reward'
  | 'game_over';

export type WinReason =
  | 'captain_elimination'
  | 'all_heroes_eliminated'
  | 'turn_limit_heroes_advantage'
  | 'turn_limit_value_advantage'
  | 'threefold_repetition_draw'
  | 'turn_limit_draw'
  | 'resignation';

export interface MatchHistoryEntry {
  turnNumber: number;
  activeSide: PlayerSide;
  action: HeroAction;
  killedHeroId?: HeroId;
  notation: string;
  timestamp: number;
}

export interface HeroDuelMatchState {
  id: string;
  phase: MatchPhase;
  turnNumber: number; // 1 to 60
  activeSide: PlayerSide;
  player1: {
    name: string;
    isAi: boolean;
    aiLevel?: 'easy' | 'normal' | 'hard';
    heroes: InGameHeroState[];
    equipmentPowerSpent: number;
  };
  player2: {
    name: string;
    isAi: boolean;
    aiLevel?: 'easy' | 'normal' | 'hard';
    heroes: InGameHeroState[];
    equipmentPowerSpent: number;
  };
  zones: BoardZoneObject[];
  history: MatchHistoryEntry[];
  boardPositionsHistory: string[]; // For threefold repetition
  pendingChainHeroInstanceId?: string; // For Kong's Rampage or Englland's Avenge
  pendingFreeStepHeroInstanceId?: string; // For Englland Vanguard Strike / Yjkstra Greedy Relaxation
  winner?: PlayerSide | 'draw';
  winReason?: WinReason;
  killsThisMatch: Array<{
    killerSide: PlayerSide;
    killedHeroId: HeroId;
    turn: number;
  }>;
}

export type { CardRarity } from '../config/rarityConfig';

export type Coord = BoardPosition;
export type TeamId = 1 | 2;

export interface HeroInstance {
  instanceId: string;
  heroId: HeroId;
  name?: string;
  title?: string;
  team: 1 | 2;
  pos: Coord;
  isCaptain: boolean;
  isAlive: boolean;
  currentCooldown: number;
  isSilenced?: boolean;
  statuses: Array<{ type: StatusEffectType; duration: number }>;
  active: HeroActiveDef;
  passives: HeroPassiveDef[];
}

export interface HeroZone {
  id: string;
  type: ZoneObjectType;
  coords: Coord[];
  duration: number;
}

export interface HeroDuelState {
  turnNumber: number;
  currentTurn: 1 | 2;
  heroes: HeroInstance[];
  zones: HeroZone[];
  winner: 1 | 2 | 'draw' | null;
  winReason: string | null;
  isPassAndPlay?: boolean;
}

export interface Action {
  type: 'move' | 'active';
  team: 1 | 2;
  from: Coord;
  to?: Coord;
  target?: Coord;
}

export type AiDifficulty = 'easy' | 'normal' | 'hard';
