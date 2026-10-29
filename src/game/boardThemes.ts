export type BoardThemeId = 'crimson' | 'midnight';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  subtitle: string;
  lightBg: string;
  darkBg: string;
  coordLightColor: string;
  coordDarkColor: string;
  previewHex: {
    light: string;
    dark: string;
  };
}

export const DEFAULT_BOARD_THEME: BoardThemeId = 'crimson';

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  crimson: {
    id: 'crimson',
    name: 'Demon Slayer Crimson',
    subtitle: 'Classic Hashira crimson & parchment ivory',
    lightBg: 'bg-[#F2EFE4]',
    darkBg: 'bg-[#BC1434]',
    coordLightColor: 'text-[#BC1434]/80',
    coordDarkColor: 'text-[#F2EFE4]/85',
    previewHex: {
      light: '#F2EFE4',
      dark: '#BC1434',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Abyss',
    subtitle: 'Deep oceanic navy & twilight indigo',
    lightBg: 'bg-[#274975]',
    darkBg: 'bg-[#0f223b]',
    coordLightColor: 'text-[#0f223b]/85',
    coordDarkColor: 'text-[#93c5fd]/90',
    previewHex: {
      light: '#274975',
      dark: '#0f223b',
    },
  },
};
