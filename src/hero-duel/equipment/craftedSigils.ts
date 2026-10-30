export interface CraftedSigilDef {
  id: string;
  name: string;
  cooldown: number;
  description: string;
  effectType: 'pull' | 'veil' | 'portal' | 'tempo' | 'stillness' | 'bastion';
  costTier: 'mid' | 'high' | 'luxury';
}

export const CRAFTED_SIGILS: CraftedSigilDef[] = [
  {
    id: 'sigil-tether',
    name: 'Sigil of Tether',
    cooldown: 5,
    description: 'Pull an enemy hero 2 squares toward you along a straight line (blocked by pieces; never captures).',
    effectType: 'pull',
    costTier: 'mid',
  },
  {
    id: 'sigil-veil',
    name: 'Sigil of Veil',
    cooldown: 5,
    description: 'One allied hero becomes untargetable by enemy active abilities for 2 turns.',
    effectType: 'veil',
    costTier: 'mid',
  },
  {
    id: 'sigil-rift',
    name: 'Sigil of Rift',
    cooldown: 6,
    description: 'Create two linked portal tiles within 3 squares of the user; any ally can traverse between them for 3 turns.',
    effectType: 'portal',
    costTier: 'high',
  },
  {
    id: 'sigil-tempo',
    name: 'Sigil of Tempo',
    cooldown: 5,
    description: 'An ally hero executes a free 1-square non-capturing reposition at the conclusion of your turn.',
    effectType: 'tempo',
    costTier: 'high',
  },
  {
    id: 'sigil-stillness',
    name: 'Sigil of Stillness',
    cooldown: 7,
    description: 'All enemy active abilities suffer +1 cooldown penalty.',
    effectType: 'stillness',
    costTier: 'luxury',
  },
  {
    id: 'sigil-bastion',
    name: 'Sigil of Bastion',
    cooldown: 5,
    description: 'The user and all adjacent allies cannot be pushed, pulled, or swapped for 2 turns.',
    effectType: 'bastion',
    costTier: 'mid',
  },
];

export function getCraftedSigilById(id: string): CraftedSigilDef | undefined {
  return CRAFTED_SIGILS.find((s) => s.id === id);
}
