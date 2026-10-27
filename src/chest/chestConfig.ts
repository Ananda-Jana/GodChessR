/**
 * Reward Chest Configuration & Tuning Constants
 * Feature flag CHEST_ENABLED allows complete instantaneous toggle of the feature.
 */

export const CHEST_ENABLED = true;

// Anti-farming minimum player moves required in an eligible match
export const MIN_MOVES = 0;

// Maximum pending chests accumulated if closed before opening
export const MAX_PENDING = 12;

// Presentation delay (ms) so player sees the game-over screen first
export const REPORT_DELAY_MS = 1200;

// LocalStorage key namespace
export const STORAGE_KEY = 'chestRewards_v1';

// Secret codes for the 4 new secret players (6-digit PIN compatible with touch keypad)
export const SECRET_PLAYER_CODES = {
  lucca: '000000',
  magi: '111112',
  toji: '654321',
  lengoku: '222220',
} as const;

export interface SecretPlayerRewardDef {
  id: 'lucca' | 'magi' | 'toji' | 'lengoku';
  name: string;
  avatarSrc: string;
  accentColor: string;
  buttonTextColor: string;
  code: string;
  elo: number;
  tagline: string;
  title: string;
}

export const SECRET_PLAYER_REWARDS: SecretPlayerRewardDef[] = [
  {
    id: 'lucca',
    name: 'LUCCA',
    avatarSrc: '/secret-players/lucca.png',
    accentColor: '#14b8a6', // Teal
    buttonTextColor: '#000000',
    code: SECRET_PLAYER_CODES.lucca,
    elo: 1500,
    title: 'Master Tactician',
    tagline: 'Calm, calculating, and striking with surgical precision.',
  },
  {
    id: 'magi',
    name: 'MAGI',
    avatarSrc: '/secret-players/magi.png',
    accentColor: '#a855f7', // Violet
    buttonTextColor: '#ffffff',
    code: SECRET_PLAYER_CODES.magi,
    elo: 1700,
    title: 'Arcane Grandmistress',
    tagline: 'Illusionary sacrifices and devastating diagonal attacks.',
  },
  {
    id: 'toji',
    name: 'TOJI',
    avatarSrc: '/secret-players/toji.png',
    accentColor: '#dc2626', // Dark Red
    buttonTextColor: '#ffffff',
    code: SECRET_PLAYER_CODES.toji,
    elo: 2000,
    title: 'Sorcerer Killer',
    tagline: 'Zero cursed energy. Pure physical tactical dominance.',
  },
  {
    id: 'lengoku',
    name: 'LENGOKU',
    avatarSrc: '/secret-players/lengoku.png',
    accentColor: '#f97316', // Orange
    buttonTextColor: '#000000',
    code: SECRET_PLAYER_CODES.lengoku,
    elo: 2200,
    title: 'Flame Hashira',
    tagline: 'Set your heart ablaze! Unyielding offensive spirit.',
  },
];
