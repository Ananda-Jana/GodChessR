/**
 * 30 Deterministic Procedural Background Scene Renderers for Hero Duel Cards
 * Size: 750 x 1050 logical pixels
 */

export const BACKGROUND_SCENE_NAMES = [
  'Crimson Nebula',
  'Shinto Shrine Torii at Twilight',
  'Cyber Neon Grid Matrix',
  'Abyssal Storm Surge',
  'Magma Fissure Cavern',
  'Bamboo Forest Night Rain',
  'Ruined Colosseum of Kings',
  'Alchemical Gas Laboratory',
  'Obsidian Monolith Citadel',
  'Jungle Canopy Canopy Mist',
  'Golden Desert Dunes',
  'Glacial Snow Peaks',
  'Celestial Astral Gate',
  'Void Horizon Event',
  'Thunderbolt Lightning Storm',
  'Solar Eclipse Halo',
  'Sakura Moonlit Sanctuary',
  'Imperial Throne Chamber',
  'Sunken Deep Sea Ruins',
  'Iron Foundry Sparks',
  'Spirit Mountain Crest',
  'Emerald Aurora Borealis',
  'Dark Labyrinth Corridor',
  'Dragonfire Crater',
  'Prismatic Crystal Cavern',
  'Blood Moon Horizon',
  'Clockwork Gear Core',
  'Toxic Swamp Vapor',
  'Zen Rock Garden in Snow',
  'Infinity Mirror Hall',
];

export function renderProceduralBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sceneIndex: number,
  seed: number,
  paletteIndex: number
): void {
  const pseudoRand = (offset: number) => {
    const x = Math.sin(seed + offset * 997) * 10000;
    return x - Math.floor(x);
  };

  const idx = Math.abs(sceneIndex) % BACKGROUND_SCENE_NAMES.length;

  // Base background fill with radial atmosphere
  const grad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    width * 0.1,
    width * 0.5,
    height * 0.5,
    width * 0.8
  );

  switch (idx % 6) {
    case 0: // Crimson & Black
      grad.addColorStop(0, '#580812');
      grad.addColorStop(0.5, '#290308');
      grad.addColorStop(1, '#080002');
      break;
    case 1: // Oceanic Deep Navy
      grad.addColorStop(0, '#0c2340');
      grad.addColorStop(0.5, '#061220');
      grad.addColorStop(1, '#02060b');
      break;
    case 2: // Royal Purple / Void
      grad.addColorStop(0, '#2d124d');
      grad.addColorStop(0.5, '#17062a');
      grad.addColorStop(1, '#07010e');
      break;
    case 3: // Toxic Amber / Emerald
      grad.addColorStop(0, '#093322');
      grad.addColorStop(0.5, '#041c12');
      grad.addColorStop(1, '#010906');
      break;
    case 4: // Golden Sand / Obsidian
      grad.addColorStop(0, '#422c06');
      grad.addColorStop(0.5, '#211502');
      grad.addColorStop(1, '#0a0600');
      break;
    default: // Steel Slate
      grad.addColorStop(0, '#1f2937');
      grad.addColorStop(0.5, '#111827');
      grad.addColorStop(1, '#030712');
      break;
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Scene-specific procedural accents
  ctx.save();

  if (idx === 1 || idx === 16) {
    // Torii Gate / Pagoda silhouette
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 14;
    // Top beam
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.35);
    ctx.lineTo(width * 0.8, height * 0.35);
    ctx.stroke();
    // Pillars
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.35);
    ctx.lineTo(width * 0.28, height * 0.8);
    ctx.moveTo(width * 0.7, height * 0.35);
    ctx.lineTo(width * 0.72, height * 0.8);
    ctx.stroke();
  } else if (idx === 2 || idx === 26) {
    // Cyber Neon Grid
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.15)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (idx === 4 || idx === 23) {
    // Magma Fissures
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.28)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      let cx = width * (0.2 + pseudoRand(i) * 0.6);
      let cy = height * 0.8;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 4; s++) {
        cx += (pseudoRand(i * 10 + s) - 0.5) * 80;
        cy -= 60 + pseudoRand(s) * 40;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
  } else {
    // Starfield particles & cosmic dust
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let p = 0; p < 60; p++) {
      const px = pseudoRand(p * 3) * width;
      const py = pseudoRand(p * 7) * height * 0.75;
      const pr = 0.8 + pseudoRand(p) * 2.2;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Light bottom-to-top subtle gradient overlay (55% alpha at bottom, 0 by roughly 55-60% of card height)
  const bottomGradient = ctx.createLinearGradient(0, height, 0, height * 0.42);
  bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
  bottomGradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.55)');
  bottomGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.18)');
  bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}
