export type ShrineTheme = 'theme1' | 'theme2';

export interface ShrineThemeMeta {
  id: ShrineTheme;
  name: string;
  tagline: string;
  description: string;
}

export const SHRINE_THEMES: ShrineThemeMeta[] = [
  {
    id: 'theme1',
    name: 'Shrine Theme 1: Classic Grand Temple',
    tagline: 'Default Architectural Shrine',
    description: 'The original stone terrace and pagoda shrine structure.',
  },
  {
    id: 'theme2',
    name: 'Shrine Theme 2: Ornate Pagoda Spire',
    tagline: 'Multi-Tiered Pagoda',
    description: 'Detailed multi-tiered pagoda with curved eaves, segmented spire, and arched windows.',
  },
];

const STORAGE_KEY = 'hero_duel_shrine_theme_v1';
let currentShrineTheme: ShrineTheme = 'theme1';

if (typeof window !== 'undefined' && window.localStorage) {
  const saved = window.localStorage.getItem(STORAGE_KEY) as ShrineTheme;
  if (saved === 'theme1' || saved === 'theme2') {
    currentShrineTheme = saved;
  }
}

const listeners = new Set<() => void>();

export function getShrineTheme(): ShrineTheme {
  return currentShrineTheme;
}

export function setShrineTheme(theme: ShrineTheme): void {
  currentShrineTheme = theme;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }
  listeners.forEach((fn) => fn());
}

export function subscribeShrineTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
