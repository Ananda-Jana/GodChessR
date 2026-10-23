/**
 * Mode-Specific Achievement Card Definitions & Verification Rules
 */

import type { CardDefinition, GameModeKey, TacticalMetrics } from './types';

export const CARD_DEFINITIONS: CardDefinition[] = [
  // ==========================================
  // A. CULLING GAME CARDS
  // ==========================================
  {
    id: 'culling_gojo_killer',
    title: 'Gojo Killer',
    mode: 'culling',
    modeLabel: 'EARNED IN: CULLING GAME',
    rarity: 'Legendary',
    description: 'Achieved a verified victory over Satoru Gojo or captured the Limitless Sovereign.',
    motifSymbol: '⚡',
    accentColor: '#3B82F6',
    pieceType: 'culling_gojo',
    pieceColor: 'white',
    condition: (stats, outcome) =>
      stats.specialActionsCount >= 1 && outcome === 'win' && stats.capturesMade >= 2,
    getHighlight: (stats, rating) => `Rating: ${rating} · Gojo Sovereign Vanquished`,
  },
  {
    id: 'culling_sukuna_destructor',
    title: 'Sukuna Destructor',
    mode: 'culling',
    modeLabel: 'EARNED IN: CULLING GAME',
    rarity: 'Legendary',
    description: 'Vanquished the King of Curses Ryomen Sukuna through ruthless tactical execution.',
    motifSymbol: '🔥',
    accentColor: '#DC2626',
    pieceType: 'culling_sukuna',
    pieceColor: 'black',
    condition: (stats, outcome) =>
      outcome === 'win' && stats.capturesMade >= 3,
    getHighlight: (stats, rating) => `Rating: ${rating} · King of Curses Overthrown`,
  },
  {
    id: 'culling_domain_sovereign',
    title: 'Domain Sovereign',
    mode: 'culling',
    modeLabel: 'EARNED IN: CULLING GAME',
    rarity: 'Epic',
    description: 'Executed a flawless Domain Step to leap across the 88-square Culling board.',
    motifSymbol: '🌌',
    accentColor: '#8B5CF6',
    pieceType: 'culling_kenjaku',
    pieceColor: 'black',
    condition: (stats) => stats.specialActionsCount >= 1,
    getHighlight: (stats, rating) => `Rating: ${rating} · Domain Step Activated`,
  },
  {
    id: 'culling_black_flash_virtuoso',
    title: 'Black Flash Virtuoso',
    mode: 'culling',
    modeLabel: 'EARNED IN: CULLING GAME',
    rarity: 'Epic',
    description: 'Struck enemy forces with spatial distortion precision via Black Flash or Ranged Strike.',
    motifSymbol: '✦',
    accentColor: '#EC4899',
    pieceType: 'culling_yuji',
    pieceColor: 'white',
    condition: (stats) => stats.capturesMade >= 2 && stats.specialActionsCount >= 1,
    getHighlight: (stats, rating) => `Rating: ${rating} · Spatial Distortion Striker`,
  },
  {
    id: 'culling_cursed_tactician',
    title: 'Cursed Tactician',
    mode: 'culling',
    modeLabel: 'EARNED IN: CULLING GAME',
    rarity: 'Rare',
    description: 'Demonstrated tactical mastery across the cross-shaped Jujutsu battlefield.',
    motifSymbol: '👁️',
    accentColor: '#10B981',
    pieceType: 'culling_nanami',
    pieceColor: 'white',
    condition: (stats) => stats.capturesMade >= 3 || stats.turnsSurvived >= 12,
    getHighlight: (stats, rating) => `Rating: ${rating} · ${stats.capturesMade} Tactical Captures`,
  },
  {
    id: 'culling_unbroken_vessel',
    title: 'Unbroken Vessel',
    mode: 'culling',
    modeLabel: 'EARNED IN: CULLING GAME',
    rarity: 'Rare',
    description: 'Withstood intense enemy pressure and defended against severe check threats.',
    motifSymbol: '🛡️',
    accentColor: '#F59E0B',
    pieceType: 'culling_panda',
    pieceColor: 'white',
    condition: (stats) => stats.checksDefendedCount >= 1 || stats.piecesLost <= 2,
    getHighlight: (stats, rating) => `Rating: ${rating} · ${stats.checksDefendedCount} Checks Defended`,
  },
  {
    id: 'culling_king_of_culling',
    title: 'King of Culling',
    mode: 'culling',
    modeLabel: 'EARNED IN: CULLING GAME',
    rarity: 'Common',
    description: 'Completed a Culling Game match with verified tactical performance.',
    motifSymbol: '👑',
    accentColor: '#6B7280',
    pieceType: 'culling_maki',
    pieceColor: 'white',
    condition: (stats) => stats.turnsSurvived >= 5,
    getHighlight: (stats, rating) => `Rating: ${rating} · Culling Combatant`,
  },

  // ==========================================
  // B. STANDARD CHESS & BOT CARDS
  // ==========================================
  {
    id: 'standard_grandmaster_slayer',
    title: 'Grandmaster Slayer',
    mode: 'standard',
    modeLabel: 'EARNED IN: PLAY VS BOT',
    rarity: 'Legendary',
    description: 'Defeated the Grandmaster Bot in high-level tactical chess combat.',
    motifSymbol: '🏆',
    accentColor: '#F59E0B',
    pieceType: 'king',
    pieceColor: 'white',
    condition: (stats, outcome) =>
      outcome === 'win' && stats.opponentDifficulty === 'grandmaster',
    getHighlight: (stats, rating) => `Rating: ${rating} · Grandmaster Bot Defeated`,
  },
  {
    id: 'standard_master_triumph',
    title: 'Master Triumph',
    mode: 'standard',
    modeLabel: 'EARNED IN: PLAY VS BOT',
    rarity: 'Epic',
    description: 'Conquered the Master Bot with disciplined strategy and sharp calculation.',
    motifSymbol: '⭐',
    accentColor: '#3B82F6',
    pieceType: 'queen',
    pieceColor: 'white',
    condition: (stats, outcome) =>
      outcome === 'win' && stats.opponentDifficulty === 'master',
    getHighlight: (stats, rating) => `Rating: ${rating} · Master Bot Overcome`,
  },
  {
    id: 'standard_royal_checkmate',
    title: 'Royal Checkmate Master',
    mode: 'standard',
    modeLabel: 'EARNED IN: STANDARD CHESS',
    rarity: 'Rare',
    description: 'Delivered an authoritative checkmate in standard chess combat.',
    motifSymbol: '♚',
    accentColor: '#10B981',
    pieceType: 'king',
    pieceColor: 'black',
    condition: (stats, outcome) => outcome === 'win',
    getHighlight: (stats, rating) => `Rating: ${rating} · Checkmate Victory`,
  },
  {
    id: 'standard_prince_tactics',
    title: 'Prince of Tactics',
    mode: 'standard',
    modeLabel: 'EARNED IN: STANDARD CHESS',
    rarity: 'Rare',
    description: 'Mastered the custom Prince mechanic to break open enemy lines.',
    motifSymbol: '🤴',
    accentColor: '#8B5CF6',
    pieceType: 'prince',
    pieceColor: 'white',
    condition: (stats) => stats.specialActionsCount >= 1,
    getHighlight: (stats, rating) => `Rating: ${rating} · Prince Vanguard Executed`,
  },
  {
    id: 'standard_valiant_defender',
    title: 'Valiant Defender',
    mode: 'standard',
    modeLabel: 'EARNED IN: STANDARD CHESS',
    rarity: 'Rare',
    description: 'Successfully repelled enemy checks and maintained defensive composure.',
    motifSymbol: '🛡️',
    accentColor: '#6366F1',
    pieceType: 'rook',
    pieceColor: 'white',
    condition: (stats) => stats.checksDefendedCount >= 1,
    getHighlight: (stats, rating) => `Rating: ${rating} · ${stats.checksDefendedCount} Attacks Repelled`,
  },
  {
    id: 'standard_tactical_virtuoso',
    title: 'Tactical Virtuoso',
    mode: 'standard',
    modeLabel: 'EARNED IN: STANDARD CHESS',
    rarity: 'Common',
    description: 'Demonstrated consistent tactical accuracy and sharp calculation throughout the match.',
    motifSymbol: '🎯',
    accentColor: '#14B8A6',
    pieceType: 'knight',
    pieceColor: 'white',
    condition: (stats) => stats.capturesMade >= 3 || stats.turnsSurvived >= 10,
    getHighlight: (stats, rating) => `Rating: ${rating} · ${stats.capturesMade} Tactical Captures`,
  },

  // ==========================================
  // C. CRAFTED & ONLINE PVP CARDS
  // ==========================================
  {
    id: 'crafted_conqueror',
    title: 'Crafted Conqueror',
    mode: 'crafted',
    modeLabel: 'EARNED IN: CRAFTED CHESS',
    rarity: 'Epic',
    description: 'Forged a custom chess piece mid-battle and turned the tide to victory.',
    motifSymbol: '🔨',
    accentColor: '#F59E0B',
    pieceType: 'supremeRook',
    pieceColor: 'white',
    condition: (stats, outcome) =>
      stats.specialActionsCount >= 1 && outcome === 'win',
    getHighlight: (stats, rating) => `Rating: ${rating} · Forge Master Victory`,
  },
  {
    id: 'pvp_duel_sovereign',
    title: 'Duel Sovereign',
    mode: 'crafted',
    modeLabel: 'EARNED IN: ONLINE PVP',
    rarity: 'Legendary',
    description: 'Emerged victorious in live human-vs-human online multiplayer combat.',
    motifSymbol: '⚔️',
    accentColor: '#EC4899',
    pieceType: 'communist',
    pieceColor: 'white',
    condition: (stats, outcome) =>
      outcome === 'win' && stats.opponentDifficulty === 'pvp_human',
    getHighlight: (stats, rating) => `Rating: ${rating} · Live PvP Champion`,
  },
  {
    id: 'pvp_precision_striker',
    title: 'Precision Striker',
    mode: 'crafted',
    modeLabel: 'EARNED IN: ONLINE PVP',
    rarity: 'Rare',
    description: 'Executed high-accuracy piece exchanges against an online opponent.',
    motifSymbol: '🎯',
    accentColor: '#06B6D4',
    pieceType: 'priest',
    pieceColor: 'white',
    condition: (stats) => stats.capturesMade >= 4,
    getHighlight: (stats, rating) => `Rating: ${rating} · ${stats.capturesMade} Captures Executed`,
  },

  // ==========================================
  // D. ROSE PARADISE CARDS
  // ==========================================
  {
    id: 'rose_sovereign',
    title: 'Rose Sovereign',
    mode: 'rose',
    modeLabel: 'EARNED IN: ROSE PARADISE',
    rarity: 'Legendary',
    description: 'Completed a peaceful, romantic Rose Paradise match in harmony.',
    motifSymbol: '🌹',
    accentColor: '#E11D48',
    pieceType: 'queen',
    pieceColor: 'white',
    condition: (stats) => stats.turnsSurvived >= 6,
    getHighlight: (stats, rating) => `Rating: ${rating} · Rose Paradise Sovereign`,
  },
  {
    id: 'rose_petal_virtuoso',
    title: 'Petal Virtuoso',
    mode: 'rose',
    modeLabel: 'EARNED IN: ROSE PARADISE',
    rarity: 'Epic',
    description: 'Harvested radiant rose petals during peaceful couples gameplay.',
    motifSymbol: '🌸',
    accentColor: '#F472B6',
    pieceType: 'priest',
    pieceColor: 'white',
    condition: (stats) => stats.specialActionsCount >= 1,
    getHighlight: (stats, rating) => `Rating: ${rating} · Rose Petal Harvested`,
  },
  {
    id: 'rose_love_link',
    title: 'Love-Link Legend',
    mode: 'rose',
    modeLabel: 'EARNED IN: ROSE PARADISE',
    rarity: 'Rare',
    description: 'Connected pieces in harmonious love-link synergy with your partner.',
    motifSymbol: '💕',
    accentColor: '#FB7185',
    pieceType: 'prince',
    pieceColor: 'white',
    condition: (stats) => stats.turnsSurvived >= 8,
    getHighlight: (stats, rating) => `Rating: ${rating} · Love Link Connected`,
  },
  {
    id: 'rose_garden_strategist',
    title: 'Garden Strategist',
    mode: 'rose',
    modeLabel: 'EARNED IN: ROSE PARADISE',
    rarity: 'Common',
    description: 'Maintained elegant, peaceful position play in the Rose Paradise garden.',
    motifSymbol: '✨',
    accentColor: '#F43F5E',
    pieceType: 'knight',
    pieceColor: 'white',
    condition: (stats) => stats.turnsSurvived >= 4,
    getHighlight: (stats, rating) => `Rating: ${rating} · Heartbound Strategist`,
  },
];

/**
 * Finds all achievement cards earned based on current match metrics and outcome.
 */
export function evaluateEarnedCards(
  mode: GameModeKey,
  metrics: TacticalMetrics,
  outcome: 'win' | 'loss' | 'draw' | 'active',
  currentRating: number,
  ratingDelta: number,
  matchId: string
): CardDefinition[] {
  // Filter card definitions matching mode and conditions
  const eligible = CARD_DEFINITIONS.filter((cardDef) => {
    if (cardDef.mode !== mode && !(mode === 'standard' && cardDef.mode === 'crafted')) {
      if (cardDef.mode !== mode) return false;
    }
    return cardDef.condition(metrics, outcome, ratingDelta);
  });

  if (eligible.length === 0) {
    const fallback = CARD_DEFINITIONS.find((c) => c.mode === mode) || CARD_DEFINITIONS[CARD_DEFINITIONS.length - 1];
    return [fallback];
  }

  return eligible;
}
