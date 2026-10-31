// Safe haptic feedback utility for mobile and touch interactions in Hero Duel

export const haptics = {
  /** Light tick for selecting a hero or UI tab */
  select: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  },

  /** Solid tactile pulse when executing a move */
  move: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    } catch {}
  },

  /** Double impact pulse when striking an enemy */
  attack: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 30, 60]);
      }
    } catch {}
  },

  /** Chime pattern when reaching or capturing a shrine */
  shrine: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([25, 30, 45, 30, 60]);
      }
    } catch {}
  },

  /** Energetic surge pulse when triggering an active ability */
  ability: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 40, 80]);
      }
    } catch {}
  },

  /** Victory fanfare vibration */
  victory: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 30, 50, 30, 120]);
      }
    } catch {}
  },

  /** Defeat warning vibration */
  defeat: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 50, 100]);
      }
    } catch {}
  },
};
