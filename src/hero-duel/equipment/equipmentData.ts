import { EconomyTier } from '../config/economyConfig';

export interface EquipmentItem {
  id: string;
  name: string;
  powerCost: number; // 1 to 3
  tier: EconomyTier;
  benefit: string;
  tradeoff: string;
  description: string;
  iconName: string;
}

export const ALL_EQUIPMENT_ITEMS: EquipmentItem[] = [
  {
    id: 'emberglass-lantern',
    name: 'Emberglass Lantern',
    powerCost: 1,
    tier: 'cheap',
    benefit: 'Active ability reach +1 square.',
    tradeoff: 'Active ability cooldown +1.',
    description: 'A glowing amber prism that amplifies arcane casting radius at the cost of slower recharge.',
    iconName: 'Flame',
  },
  {
    id: 'hollow-crown',
    name: 'Hollow Crown',
    powerCost: 2,
    tier: 'mid',
    benefit: 'Once per match, instantly ignore and cleanse one Rooted or Slowed effect.',
    tradeoff: 'The wearer cannot be chosen as team Captain.',
    description: 'A forged dark-gold circlet granting immunity to entrapment, but abdicating imperial command.',
    iconName: 'Crown',
  },
  {
    id: 'tidal-anchor',
    name: 'Tidal Anchor',
    powerCost: 2,
    tier: 'mid',
    benefit: 'Wearer cannot be pushed, pulled, or swapped by enemy abilities.',
    tradeoff: 'Wearer movement range reduced by 1 (minimum 1).',
    description: 'Heavy abyssal ballast firmly rooting the hero to the board against displacement.',
    iconName: 'Anchor',
  },
  {
    id: 'quillstorm-cloak',
    name: 'Quillstorm Cloak',
    powerCost: 2,
    tier: 'mid',
    benefit: 'Enemy heroes capturing the wearer are Rooted for their following turn.',
    tradeoff: 'Wearer is Slowed for 1 turn whenever targeted by an active ability.',
    description: 'Barbed plumage that punishes fatal strikes while snagging on enemy magical currents.',
    iconName: 'Feather',
  },
  {
    id: 'dawnthread-sash',
    name: 'Dawnthread Sash',
    powerCost: 1,
    tier: 'cheap',
    benefit: 'The wearer starts the battle with active ability ready immediately (Cooldown 0).',
    tradeoff: 'One-time bonus on game open only.',
    description: 'Radiant morning silk providing an instant tactical surge on opening moves.',
    iconName: 'Sun',
  },
  {
    id: 'gravebloom-seed',
    name: 'Gravebloom Seed',
    powerCost: 2,
    tier: 'high',
    benefit: 'When wearer is captured, a seed tile appears for 2 turns; adjacent allies gain +1 movement.',
    tradeoff: 'Only triggers upon martyrdom.',
    description: 'A spectral bulb that germinates into an empowering aura upon hero defeat.',
    iconName: 'Sprout',
  },
  {
    id: 'orbit-whistle',
    name: 'Orbit Whistle',
    powerCost: 1,
    tier: 'cheap',
    benefit: 'Once per match, reposition one friendly hero 1 square as a free instant maneuver.',
    tradeoff: 'Single charge per battle.',
    description: 'A high-frequency silver whistle signaling emergency ally maneuvers.',
    iconName: 'Wind',
  },
  {
    id: 'sunken-gauntlet',
    name: 'Sunken Gauntlet',
    powerCost: 3,
    tier: 'high',
    benefit: 'Captures also violently push adjacent enemy heroes back 1 square.',
    tradeoff: 'Wearer cannot cast active abilities the turn following a capture.',
    description: 'Crushing hydraulic steel gauntlet that releases concussive shockwaves upon impact.',
    iconName: 'Shield',
  },
  {
    id: 'prism-hourglass',
    name: 'Prism Hourglass',
    powerCost: 3,
    tier: 'luxury',
    benefit: 'Once per match, reset one allied hero active cooldown to 0.',
    tradeoff: 'This hero’s own active cooldown increases by +2.',
    description: 'A chronomantic relic transferring temporal velocity between comrades.',
    iconName: 'Hourglass',
  },
  {
    id: 'ashen-compass',
    name: 'Ashen Compass',
    powerCost: 2,
    tier: 'mid',
    benefit: 'Reveals all enemy cooldown timers and exact attack threat vectors on hover.',
    tradeoff: 'Grants information advantage only, no direct combat stats.',
    description: 'A cracked nautical dial revealing enemy tactical intentions and cooldown readiness.',
    iconName: 'Compass',
  },
  {
    id: 'thunderstitch-boots',
    name: 'Thunderstitch Boots',
    powerCost: 2,
    tier: 'high',
    benefit: 'Wearer gains +1 movement range on its very first move of the match.',
    tradeoff: 'First move only; does not increase subsequent rounds.',
    description: 'Electrified greaves engineered for aggressive opening tactical positioning.',
    iconName: 'Zap',
  },
  {
    id: 'mirage-locket',
    name: 'Mirage Locket',
    powerCost: 2,
    tier: 'high',
    benefit: 'Once per match, wearer can swap positions with any friendly decoy, wall, or zone tile.',
    tradeoff: 'Requires an existing board object to target.',
    description: 'An optical talisman exchanging physical reality with tactical illusions.',
    iconName: 'Eye',
  },
];

export function getEquipmentById(id: string): EquipmentItem | undefined {
  return ALL_EQUIPMENT_ITEMS.find((item) => item.id === id);
}
