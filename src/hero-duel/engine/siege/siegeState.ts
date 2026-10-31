import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { HeroId } from '../../types/heroDuelTypes';
import { getHeroById } from '../../heroes/heroRegistry';
import {
  SiegeState,
  SiegeHeroInstance,
  SiegePawnInstance,
  SiegeShrine,
  TeamSide,
  HeroRole,
} from './siegeTypes';

import { HERO_DUEL_ABILITY_MAP } from '../../config/siegeRulesCodex';

export function createInitialSiegeState(
  team1HeroIds: HeroId[],
  team2HeroIds: HeroId[],
  team1Placements?: { heroId: HeroId; pos: { x: number; y: number } }[],
  team2Placements?: { heroId: HeroId; pos: { x: number; y: number } }[]
): SiegeState {
  const mapRole = (hId: HeroId): HeroRole => {
    switch (hId) {
      case 'mugen-king': return 'leader';
      case 'malevolent-priest': return 'controller';
      case 'dr-methanogenic': return 'area';
      case 'captain-englland': return 'commander';
      case 'ajx-assassin': return 'assassin';
      case 'yjkstra-pathfinder': return 'pathfinder';
      case 'ironclad-warden': return 'tank';
      case 'black-monkey': return 'trickster';
      case 'part-king-kong': return 'bruiser';
      default: return 'leader';
    }
  };

  const getHpForHero = (_hId: HeroId): number => {
    return SIEGE_CONFIG.HERO_DEFAULT_HP; // 35 HP
  };

  const getAttackForHero = (hId: HeroId): number => {
    if (hId === 'mugen-king' || hId === 'part-king-kong') return 4;
    if (hId === 'ajx-assassin' || hId === 'captain-englland') return 3.5;
    return 3;
  };

  const getDefenseForHero = (hId: HeroId): number => {
    if (hId === 'ironclad-warden') return 3;
    if (hId === 'captain-englland' || hId === 'malevolent-priest') return 2;
    return 1;
  };

  // Standard back rank cols: 1, 3, 5, 7
  const defaultPlayerCols = [1, 3, 5, 7];
  const defaultBotCols = [1, 3, 5, 7];

  const heroes: SiegeHeroInstance[] = [];

  // Team 1 (Player) Heroes on row 7
  team1HeroIds.slice(0, 4).forEach((heroId, idx) => {
    const def = getHeroById(heroId);
    const hp = SIEGE_CONFIG.HERO_DEFAULT_HP;
    const foundPlacement = team1Placements?.find((p) => p.heroId === heroId);
    const placementPos = foundPlacement ? foundPlacement.pos : { x: defaultPlayerCols[idx], y: 7 };
    const abilityDef = HERO_DUEL_ABILITY_MAP[heroId];

    heroes.push({
      instanceId: `t1_${idx}_${heroId}`,
      heroId,
      team: 1,
      name: def.name,
      title: def.title,
      role: mapRole(heroId),
      pos: placementPos,
      targetPos: null,
      hp,
      maxHp: hp,
      attackRange: 1,
      attackDamage: getAttackForHero(heroId),
      defense: getDefenseForHero(heroId),
      attackIntervalSec: SIEGE_CONFIG.HERO_ATTACK_COOLDOWN_SEC,
      moveIntervalSec: 0.8,
      timeSinceLastAttack: 0,
      timeSinceLastMove: 0,
      abilityCooldownSec: abilityDef?.cooldownSec || 7,
      currentAbilityCooldown: 0,
      abilityUnlocked: false, // Locked until stepping onto a shrine
      abilityLevel: 1,
      assignedAbilityId: abilityDef?.id || 'royalMeteor',
      isAlive: true,
      statuses: [],
      order: { type: 'auto' },
      damageDealt: 0,
      kills: 0,
      shrinesCaptured: 0,
    });
  });

  // Team 2 (Bot) Heroes on row 0
  team2HeroIds.slice(0, 4).forEach((heroId, idx) => {
    const def = getHeroById(heroId);
    const hp = SIEGE_CONFIG.HERO_DEFAULT_HP;
    const foundPlacement = team2Placements?.find((p) => p.heroId === heroId);
    const placementPos = foundPlacement ? foundPlacement.pos : { x: defaultBotCols[idx], y: 0 };
    const abilityDef = HERO_DUEL_ABILITY_MAP[heroId];

    heroes.push({
      instanceId: `t2_${idx}_${heroId}`,
      heroId,
      team: 2,
      name: def.name,
      title: def.title,
      role: mapRole(heroId),
      pos: placementPos,
      targetPos: null,
      hp,
      maxHp: hp,
      attackRange: 1,
      attackDamage: getAttackForHero(heroId),
      defense: getDefenseForHero(heroId),
      attackIntervalSec: SIEGE_CONFIG.HERO_ATTACK_COOLDOWN_SEC,
      moveIntervalSec: 0.8,
      timeSinceLastAttack: 0,
      timeSinceLastMove: 0,
      abilityCooldownSec: abilityDef?.cooldownSec || 7,
      currentAbilityCooldown: 0,
      abilityUnlocked: false,
      abilityLevel: 1,
      assignedAbilityId: abilityDef?.id || 'royalMeteor',
      isAlive: true,
      statuses: [],
      order: { type: 'auto' },
      damageDealt: 0,
      kills: 0,
      shrinesCaptured: 0,
    });
  });

  // Pawns Setup
  // Player pawns on row 6 (cols 1, 3, 5, 7)
  const pawns: SiegePawnInstance[] = [];
  defaultPlayerCols.forEach((col, idx) => {
    pawns.push({
      id: `pawn_t1_${idx}`,
      team: 1,
      pos: { x: col, y: 6 },
      hp: SIEGE_CONFIG.PAWN_DEFAULT_HP,
      maxHp: SIEGE_CONFIG.PAWN_DEFAULT_HP,
      attackDamage: SIEGE_CONFIG.PAWN_ATTACK_DAMAGE,
      defense: SIEGE_CONFIG.PAWN_DEFENSE,
      isAlive: true,
    });
  });

  // Bot pawns on row 1 (cols 1, 3, 5, 7)
  defaultBotCols.forEach((col, idx) => {
    pawns.push({
      id: `pawn_t2_${idx}`,
      team: 2,
      pos: { x: col, y: 1 },
      hp: SIEGE_CONFIG.PAWN_DEFAULT_HP,
      maxHp: SIEGE_CONFIG.PAWN_DEFAULT_HP,
      attackDamage: SIEGE_CONFIG.PAWN_ATTACK_DAMAGE,
      defense: SIEGE_CONFIG.PAWN_DEFENSE,
      isAlive: true,
    });
  });

  // Shrines Setup
  const shrines: SiegeShrine[] = SIEGE_CONFIG.SHRINES.map((s) => ({
    id: s.id,
    name: s.name,
    cells: s.cells,
    owner: null,
    occupierTeam: null,
    isContested: false,
    dominionTimer: 0,
  }));

  return {
    tick: 0,
    turn: 1,
    elapsedSeconds: 0,
    heroes,
    pawns,
    shrines,
    dominionTurns: { 1: 0, 2: 0 },
    dominionTimer: { 1: 0, 2: 0 },
    damageFlashes: [],
    eliminatedUnitIds: [],
    shrineModal: null,
    projectiles: [],
    floatingNumbers: [],
    winner: null,
    winReason: null,
    events: [
      { id: 'start', timeSec: 0, text: 'SHRINE SIEGE: Turn 1. Command your champions to advance, capture shrines, or attack enemies.' },
    ],
    stats: {
      shrineControlSec: { 1: 0, 2: 0 },
      heroesEliminated: { 1: 0, 2: 0 },
      totalDamageDealt: { 1: 0, 2: 0 },
    },
  };
}
