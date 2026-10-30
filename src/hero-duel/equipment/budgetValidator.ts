import { MAX_CRAFTED_SIGILS_PER_TEAM, MAX_EQUIPMENT_POWER_BUDGET } from '../config/balanceConfig';
import { getEquipmentById } from './equipmentData';

export interface TeamArmorySelection {
  equipmentAssignments: Record<string, string>; // heroId -> equipmentId
  craftedSigilAssignments: Record<string, string>; // heroId -> sigilId
}

export function validateArmoryBudget(selection: TeamArmorySelection): {
  valid: boolean;
  totalPowerSpent: number;
  craftedSigilsCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  let totalPowerSpent = 0;

  for (const [heroId, eqId] of Object.entries(selection.equipmentAssignments)) {
    if (!eqId) continue;
    const item = getEquipmentById(eqId);
    if (!item) {
      errors.push(`Unknown equipment ID "${eqId}" on hero ${heroId}`);
      continue;
    }
    totalPowerSpent += item.powerCost;
  }

  if (totalPowerSpent > MAX_EQUIPMENT_POWER_BUDGET) {
    errors.push(
      `Total Power spent (${totalPowerSpent}) exceeds the team budget cap of ${MAX_EQUIPMENT_POWER_BUDGET} Power Points.`
    );
  }

  const craftedCount = Object.values(selection.craftedSigilAssignments).filter(Boolean).length;
  if (craftedCount > MAX_CRAFTED_SIGILS_PER_TEAM) {
    errors.push(
      `Only ${MAX_CRAFTED_SIGILS_PER_TEAM} crafted active sigil is permitted per team (found ${craftedCount}).`
    );
  }

  return {
    valid: errors.length === 0,
    totalPowerSpent,
    craftedSigilsCount: craftedCount,
    errors,
  };
}
