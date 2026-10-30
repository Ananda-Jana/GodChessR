/**
 * Strict Palette Families for Hero Duel Card Art.
 * Every palette = { bg, spot, spot2, light } plus fixed ink #0B0B0F and paper #F3EDE0.
 */

export interface CardPaletteDef {
  id: string;
  family: 'noir' | 'pop';
  bg: string;
  spot: string;
  spot2: string;
  light: string;
}

export const PALETTE_LINOCUT_NOIR: Record<string, CardPaletteDef> = {
  N1: { id: 'N1', family: 'noir', bg: '#17141A', spot: '#E8458B', spot2: '#7A2149', light: '#FFE3EF' },
  N2: { id: 'N2', family: 'noir', bg: '#121716', spot: '#2EE6B6', spot2: '#0F6B57', light: '#D9FFF3' },
  N3: { id: 'N3', family: 'noir', bg: '#17130D', spot: '#F2A31B', spot2: '#8A5200', light: '#FFF0CC' },
  N4: { id: 'N4', family: 'noir', bg: '#170E0E', spot: '#E81E1E', spot2: '#7A0F0F', light: '#FFD9D9' },
  N5: { id: 'N5', family: 'noir', bg: '#11150C', spot: '#8DDB2B', spot2: '#3F6B0E', light: '#EEFFC7' },
  N6: { id: 'N6', family: 'noir', bg: '#0E1418', spot: '#34C6F4', spot2: '#12577A', light: '#DDF6FF' },
};

export const PALETTE_INK_POP: Record<string, CardPaletteDef> = {
  P1: { id: 'P1', family: 'pop', bg: '#FFC400', spot: '#7B2CFF', spot2: '#FF8A00', light: '#FFF3B0' },
  P2: { id: 'P2', family: 'pop', bg: '#FF8A00', spot: '#8A2BE2', spot2: '#FFC400', light: '#FFE9B8' },
  P3: { id: 'P3', family: 'pop', bg: '#19C8A0', spot: '#FF4F6D', spot2: '#0B6E5A', light: '#E4FFF7' },
  P4: { id: 'P4', family: 'pop', bg: '#2D5BFF', spot: '#FFE14D', spot2: '#0A1F7A', light: '#E2E9FF' },
};

export const ALL_PALETTES: Record<string, CardPaletteDef> = {
  ...PALETTE_LINOCUT_NOIR,
  ...PALETTE_INK_POP,
};

export function getPaletteForCard(seed: number, rarity: string): CardPaletteDef {
  const noirKeys = Object.keys(PALETTE_LINOCUT_NOIR);
  const popKeys = Object.keys(PALETTE_INK_POP);

  if (rarity === 'common') {
    return PALETTE_LINOCUT_NOIR[noirKeys[seed % noirKeys.length]];
  } else if (rarity === 'master' || rarity === 'mythic' || rarity === 'legendary') {
    return PALETTE_INK_POP[popKeys[seed % popKeys.length]];
  } else {
    // Rare or Epic
    return seed % 2 === 0
      ? PALETTE_LINOCUT_NOIR[noirKeys[seed % noirKeys.length]]
      : PALETTE_INK_POP[popKeys[seed % popKeys.length]];
  }
}
