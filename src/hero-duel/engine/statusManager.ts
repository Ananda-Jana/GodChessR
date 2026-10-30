import { ActiveStatus, InGameHeroState, StatusEffectType } from '../types/heroDuelTypes';

export function hasStatus(hero: InGameHeroState, type: StatusEffectType): boolean {
  return hero.statuses.some((s) => s.type === type && s.durationTurns > 0);
}

export function applyStatus(hero: InGameHeroState, type: StatusEffectType, durationTurns: number, sourceHeroId?: string): InGameHeroState {
  // If hero is Dr. Methanogenic, immune to enemy hazard statuses via Anaerobic Adaptation
  if (hero.heroId === 'dr-methanogenic' && (type === 'slowed' || type === 'disarmed')) {
    return hero;
  }

  const existingIdx = hero.statuses.findIndex((s) => s.type === type);
  let updatedStatuses: ActiveStatus[];

  if (existingIdx !== -1) {
    updatedStatuses = [...hero.statuses];
    updatedStatuses[existingIdx] = {
      ...updatedStatuses[existingIdx],
      durationTurns: Math.max(updatedStatuses[existingIdx].durationTurns, durationTurns),
    };
  } else {
    updatedStatuses = [...hero.statuses, { type, durationTurns, sourceHeroId }];
  }

  return {
    ...hero,
    statuses: updatedStatuses,
  };
}

export function removeStatus(hero: InGameHeroState, type: StatusEffectType): InGameHeroState {
  return {
    ...hero,
    statuses: hero.statuses.filter((s) => s.type !== type),
  };
}

export function tickHeroStatuses(hero: InGameHeroState): InGameHeroState {
  const decremented = hero.statuses
    .map((s) => ({ ...s, durationTurns: s.durationTurns - 1 }))
    .filter((s) => s.durationTurns > 0);

  return {
    ...hero,
    statuses: decremented,
  };
}
