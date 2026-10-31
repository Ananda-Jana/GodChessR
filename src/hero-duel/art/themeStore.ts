export type PieceTheme = 'classic' | 'faceted';

export interface PieceThemeMeta {
  id: PieceTheme;
  name: string;
  tagline: string;
  description: string;
}

export const PIECE_THEMES: PieceThemeMeta[] = [
  {
    id: 'classic',
    name: 'Theme 1: Vector Silhouette',
    tagline: 'Sleek & Tactical',
    description: 'Clean high-contrast vector silhouettes with metallic team heraldry.',
  },
  {
    id: 'faceted',
    name: 'Theme 2: Faceted Busts',
    tagline: 'Detailed Character Faces',
    description: 'Hand-crafted polygonal character busts showing express faces, horns, caps & crowns.',
  },
];

const STORAGE_KEY = 'hero_duel_piece_theme_v2';

let currentTheme: PieceTheme = 'faceted';

if (typeof window !== 'undefined' && window.localStorage) {
  const saved = window.localStorage.getItem(STORAGE_KEY) as PieceTheme;
  if (saved === 'classic' || saved === 'faceted') {
    currentTheme = saved;
  }
}

const listeners = new Set<() => void>();

export function getPieceTheme(): PieceTheme {
  return currentTheme;
}

export function setPieceTheme(theme: PieceTheme): void {
  currentTheme = theme;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }
  listeners.forEach((fn) => fn());
}

export function subscribePieceTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
