import type { PunisherBotId } from '../punisher/punisherBot';

export interface LeagueBotDefinition {
  id: PunisherBotId;
  name: string;
  rating: string;
  minTier: number;
  minTrophies: number;
  desc: string;
}

export const LEAGUE_BOTS: LeagueBotDefinition[] = [
  {
    id: 'joystick-wraith',
    name: 'Joystick Wraith',
    rating: '400-600',
    minTier: 1,
    minTrophies: 0,
    desc: 'Beginner Gamer AI - Grabs free pieces',
  },
  {
    id: 'static-jester',
    name: 'Static Jester',
    rating: '800-1000',
    minTier: 2,
    minTrophies: 100,
    desc: 'Unpredictable Trickster - Early Queen Attacks',
  },
  {
    id: 'octavian-hollow',
    name: 'Octavian Hollow',
    rating: '1300-1500',
    minTier: 4,
    minTrophies: 300,
    desc: 'Solid Fortress - Defensive Pawn Chains',
  },
  {
    id: 'bangla-bot',
    name: 'বাংলা-বট (Bangla Bot)',
    rating: '1800-1900',
    minTier: 5,
    minTrophies: 450,
    desc: 'Furious Berserker - Savage Offensive Plays',
  },
  {
    id: 'iron-regent',
    name: 'Iron Regent',
    rating: '1900-2100',
    minTier: 6,
    minTrophies: 600,
    desc: 'Imperial Strategist - Positional Squeeze',
  },
  {
    id: 'cyclops-revenant',
    name: 'Cyclops Revenant',
    rating: '2200-2400',
    minTier: 8,
    minTrophies: 1000,
    desc: 'Brutal Warlord - High-Initiative Sacrifices',
  },
  {
    id: 'chrome-reaper',
    name: 'Chrome Reaper',
    rating: '2500+ ELO',
    minTier: 11,
    minTrophies: 1500,
    desc: 'Grandmaster Calculator - Ruthless Tactical AI',
  },
];
