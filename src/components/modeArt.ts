export type ModeArtKey =
  | 'hashira-training'
  | 'punisher-robot'
  | 'grandmaster-bot'
  | 'culling-game'
  | 'secret-arena'
  | 'crafted-pieces';

export const MODE_ART_MAP: Record<ModeArtKey, string> = {
  'hashira-training': '/assets/aistudio/image_e0bfff75.png',
  'punisher-robot': '/assets/aistudio/image_4681080e.png',
  'grandmaster-bot': '/assets/aistudio/image_4aa74391.png',
  'culling-game': '/assets/aistudio/image_9087d774.png',
  'secret-arena': '/assets/aistudio/image_ba67a0d0.png',
  'crafted-pieces': '/assets/aistudio/image_4aa74391.png',
};

export const MODE_FALLBACK_GRADIENTS: Record<ModeArtKey, string> = {
  'hashira-training': 'from-amber-950 via-neutral-900 to-black border-amber-500',
  'punisher-robot': 'from-blue-950 via-indigo-950 to-black border-blue-500',
  'grandmaster-bot': 'from-orange-950 via-red-950 to-black border-orange-500',
  'culling-game': 'from-red-950 via-neutral-950 to-black border-red-600',
  'secret-arena': 'from-purple-950 via-neutral-950 to-black border-purple-500',
  'crafted-pieces': 'from-slate-900 via-amber-950 to-black border-amber-400',
};
