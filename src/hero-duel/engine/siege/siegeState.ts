import { SIEGE_CONFIG } from '../../config/siegeConfig';
import { HeroId, HeroDefinition } from '../../types/heroDuelTypes';
import { getHeroById } from '../../heroes/heroRegistry';
import { SiegeState, SiegeHeroInstance, SiegeTower, SiegeThrone, SiegeShrine, TeamSide, HeroRole } from './siegeTypes';

interface PlacedSiegeHero {
  heroId: HeroId;
  team: TeamSide;
  pos: { x: number; y: number };
}

export function createInitialSiegeState(
  team1HeroIds: HeroId[],
  team2HeroIds: HeroId[],
  team1Placements: { heroId: HeroId; pos: { x: number; y: number } }[],
  team2Placements: { heroId: HeroId; pos: { x: number; y: number } }[]
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

  const heroes: SiegeHeroInstance[] = [];

  team1Placements.forEach((p, idx) => {
    const def = getHeroById(p.heroId);
    heroes.push({
      instanceId: `t1_${idx}_${p.heroId}`,
      heroId: p.heroId,
      team: 1,
      name: def.name,
      title: def.title,
      role: mapRole(p.heroId),
      pos: { x: p.pos.x, y: p.pos.y },
      targetPos: null,
      hp: SIEGE_CONFIG.HERO_DEFAULT_HP,
      maxHp: SIEGE_CONFIG.HERO_DEFAULT_HP,
      attackRange: def.name.includes('Priest') || def.name.includes('Methanogenic') ? 2 : 1,
      attackDamage: 1,
      attackIntervalSec: 1.2,
      moveIntervalSec: 0.8,
      timeSinceLastAttack: 0,
      timeSinceLastMove: 0,
      abilityCooldownSec: 16,
      currentAbilityCooldown: 0,
      isAlive: true,
      statuses: [],
    });
  });

  team2Placements.forEach((p, idx) => {
    const def = getHeroById(p.heroId);
    heroes.push({
      instanceId: `t2_${idx}_${p.heroId}`,
      heroId: p.heroId,
      team: 2,
      name: def.name,
      title: def.title,
      role: mapRole(p.heroId),
      pos: { x: p.pos.x, y: p.pos.y },
      targetPos: null,
      hp: SIEGE_CONFIG.HERO_DEFAULT_HP,
      maxHp: SIEGE_CONFIG.HERO_DEFAULT_HP,
      attackRange: def.name.includes('Priest') || def.name.includes('Methanogenic') ? 2 : 1,
      attackDamage: 1,
      attackIntervalSec: 1.2,
      moveIntervalSec: 0.8,
      timeSinceLastAttack: 0,
      timeSinceLastMove: 0,
      abilityCooldownSec: 16,
      currentAbilityCooldown: 0,
      isAlive: true,
      statuses: [],
    });
  });

  const towers: SiegeTower[] = [
    { id: 't1_left', team: 1, pos: SIEGE_CONFIG.PLAYER_TOWERS[0], hp: SIEGE_CONFIG.TOWER_HP, maxHp: SIEGE_CONFIG.TOWER_HP, timeSinceLastAttack: 0, isAlive: true },
    { id: 't1_right', team: 1, pos: SIEGE_CONFIG.PLAYER_TOWERS[1], hp: SIEGE_CONFIG.TOWER_HP, maxHp: SIEGE_CONFIG.TOWER_HP, timeSinceLastAttack: 0, isAlive: true },
    { id: 't2_left', team: 2, pos: SIEGE_CONFIG.BOT_TOWERS[0], hp: SIEGE_CONFIG.TOWER_HP, maxHp: SIEGE_CONFIG.TOWER_HP, timeSinceLastAttack: 0, isAlive: true },
    { id: 't2_right', team: 2, pos: SIEGE_CONFIG.BOT_TOWERS[1], hp: SIEGE_CONFIG.TOWER_HP, maxHp: SIEGE_CONFIG.TOWER_HP, timeSinceLastAttack: 0, isAlive: true },
  ];

  const thrones: SiegeThrone[] = [
    { team: 1, pos: SIEGE_CONFIG.PLAYER_THRONE, hp: SIEGE_CONFIG.THRONE_HP, maxHp: SIEGE_CONFIG.THRONE_HP, isAlive: true },
    { team: 2, pos: SIEGE_CONFIG.BOT_THRONE, hp: SIEGE_CONFIG.THRONE_HP, maxHp: SIEGE_CONFIG.THRONE_HP, isAlive: true },
  ];

  const shrines: SiegeShrine[] = SIEGE_CONFIG.SHRINES.map((s) => ({
    id: s.id,
    pos: { x: s.x, y: s.y },
    owner: null,
    capturingTeam: null,
    progress: 0,
  }));

  return {
    tick: 0,
    elapsedSeconds: 0,
    heroes,
    towers,
    thrones,
    shrines,
    dominion: { 1: 0, 2: 0 },
    winner: null,
    winReason: null,
    events: [
      { id: 'start', timeSec: 0, text: 'Shrine Siege match started! Capture shrines and destroy enemy Throne.' },
    ],
  };
}
