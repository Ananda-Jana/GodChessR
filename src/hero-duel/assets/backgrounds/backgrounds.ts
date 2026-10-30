/**
 * 30 rich painted-style background images as clean SVG Data URIs for Hero Duel cards.
 * Zero emojis - 100% same-origin vector scenes with gradients, silhouettes, and lighting.
 */

function createSvgDataUri(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    svgString.replace(/\s+/g, ' ').trim()
  )}`;
}

export const HERO_CARD_BACKGROUND_IMAGES: string[] = [
  // 0: Shrine Gate at Dusk
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2d0b2e"/>
          <stop offset="50%" stop-color="#7c1d48"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.6" r="0.4">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#sky)"/>
      <circle cx="375" cy="620" r="280" fill="url(#sun)"/>
      <path d="M0,850 Q375,780 750,850 L750,1050 L0,1050 Z" fill="#18081a"/>
      <!-- Torii Gate Silhouette -->
      <rect x="220" y="420" width="310" height="28" rx="6" fill="#0f0410"/>
      <rect x="180" y="370" width="390" height="32" rx="8" fill="#0f0410"/>
      <rect x="260" y="400" width="30" height="350" fill="#0f0410"/>
      <rect x="460" y="400" width="30" height="350" fill="#0f0410"/>
      <!-- Cherry Blossom Silhouettes -->
      <circle cx="120" cy="180" r="80" fill="#f472b6" opacity="0.3"/>
      <circle cx="620" cy="220" r="110" fill="#f472b6" opacity="0.25"/>
    </svg>
  `),

  // 1: Neon Cyber Alley
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#030712"/>
          <stop offset="60%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#311042"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg1)"/>
      <!-- Neon Grid Perspective -->
      <path d="M0,700 L375,550 L750,700 M0,800 L375,550 L750,800 M0,950 L375,550 L750,950" stroke="#a855f7" stroke-width="2" opacity="0.4"/>
      <line x1="375" y1="550" x2="0" y2="1050" stroke="#06b6d4" stroke-width="3" opacity="0.5"/>
      <line x1="375" y1="550" x2="750" y2="1050" stroke="#06b6d4" stroke-width="3" opacity="0.5"/>
      <rect x="80" y="200" width="120" height="400" fill="#0f172a" stroke="#ec4899" stroke-width="4"/>
      <rect x="550" y="150" width="120" height="450" fill="#0f172a" stroke="#3b82f6" stroke-width="4"/>
    </svg>
  `),

  // 2: Storm Ocean
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="50%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg2)"/>
      <path d="M0,650 Q180,600 375,680 T750,620 L750,1050 L0,1050 Z" fill="#0369a1" opacity="0.5"/>
      <path d="M0,720 Q200,780 420,700 T750,760 L750,1050 L0,1050 Z" fill="#0284c7" opacity="0.7"/>
      <!-- Lightning Bolt -->
      <polygon points="420,0 360,350 410,350 330,700 480,320 420,320" fill="#e0f2fe" opacity="0.85"/>
    </svg>
  `),

  // 3: Volcanic Magma Cracks
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#18181b"/>
          <stop offset="60%" stop-color="#450a0a"/>
          <stop offset="100%" stop-color="#7f1d1d"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg3)"/>
      <path d="M100,1050 L250,750 L350,850 L550,600 L700,1050" stroke="#f97316" stroke-width="18" fill="none" opacity="0.8" stroke-linecap="round"/>
      <path d="M100,1050 L250,750 L350,850 L550,600 L700,1050" stroke="#fef08a" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="250" cy="750" r="40" fill="#ef4444" opacity="0.4"/>
      <circle cx="550" cy="600" r="60" fill="#f97316" opacity="0.4"/>
    </svg>
  `),

  // 4: Moonlight Bamboo Grove
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#022c22"/>
          <stop offset="100%" stop-color="#064e3b"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg4)"/>
      <circle cx="375" cy="250" r="180" fill="#a7f3d0" opacity="0.3"/>
      <!-- Bamboo Stalks -->
      <rect x="80" y="0" width="22" height="1050" fill="#047857" opacity="0.8"/>
      <rect x="220" y="0" width="28" height="1050" fill="#065f46" opacity="0.9"/>
      <rect x="480" y="0" width="26" height="1050" fill="#047857" opacity="0.85"/>
      <rect x="620" y="0" width="20" height="1050" fill="#065f46" opacity="0.8"/>
    </svg>
  `),

  // 5: Ruined Arena Pillars
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1c1917"/>
          <stop offset="100%" stop-color="#44403c"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg5)"/>
      <rect x="100" y="300" width="70" height="600" fill="#292524"/>
      <rect x="580" y="250" width="80" height="650" fill="#292524"/>
      <polygon points="50,900 700,900 750,1050 0,1050" fill="#1c1917"/>
    </svg>
  `),

  // 6: Emerald Gas Vats Lab
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <radialGradient id="bg6" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#022c22"/>
        </radialGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg6)"/>
      <circle cx="200" cy="500" r="120" fill="#059669" opacity="0.3"/>
      <circle cx="550" cy="450" r="140" fill="#34d399" opacity="0.25"/>
    </svg>
  `),

  // 7: Rainforest Canopy Sunbeams
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg7" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#14532d"/>
          <stop offset="100%" stop-color="#052e16"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg7)"/>
      <polygon points="100,0 250,0 600,1050 350,1050" fill="#fef08a" opacity="0.15"/>
      <polygon points="400,0 550,0 750,800 600,800" fill="#fef08a" opacity="0.12"/>
    </svg>
  `),

  // 8: Desert Sunset Dunes
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg8" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7c2d12"/>
          <stop offset="50%" stop-color="#c2410c"/>
          <stop offset="100%" stop-color="#ea580c"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg8)"/>
      <circle cx="375" cy="550" r="160" fill="#fef08a" opacity="0.6"/>
      <path d="M0,650 Q250,550 500,680 T750,600 L750,1050 L0,1050 Z" fill="#9a3412"/>
      <path d="M0,780 Q300,700 750,820 L750,1050 L0,1050 Z" fill="#431407"/>
    </svg>
  `),

  // 9: Glacial Aurora Peaks
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg9" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#030712"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg9)"/>
      <!-- Aurora Wave -->
      <path d="M0,250 Q200,100 400,300 T750,150 L750,450 Q500,300 200,450 Z" fill="#2dd4bf" opacity="0.35"/>
      <!-- Mountain Peaks -->
      <polygon points="100,1050 300,550 500,1050" fill="#1e293b"/>
      <polygon points="350,1050 550,480 750,1050" fill="#334155"/>
    </svg>
  `),

  // 10: Cyber City Skyline
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg10" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#3b0764"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg10)"/>
      <rect x="50" y="400" width="100" height="650" fill="#1e1b4b"/>
      <rect x="180" y="300" width="140" height="750" fill="#2e1065"/>
      <rect x="360" y="450" width="120" height="600" fill="#1e1b4b"/>
      <rect x="520" y="250" width="160" height="800" fill="#2e1065"/>
    </svg>
  `),

  // 11: Swirling Void Nebula
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <radialGradient id="bg11" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.6"/>
          <stop offset="50%" stop-color="#581c87"/>
          <stop offset="100%" stop-color="#090514"/>
        </radialGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg11)"/>
      <circle cx="375" cy="400" r="220" fill="#38bdf8" opacity="0.25"/>
    </svg>
  `),

  // 12: Gothic Crimson Castle
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg12" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#450a0a"/>
          <stop offset="100%" stop-color="#090508"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg12)"/>
      <circle cx="375" cy="300" r="140" fill="#f87171" opacity="0.5"/>
      <polygon points="375,200 320,500 430,500" fill="#18080a"/>
      <rect x="280" y="500" width="190" height="550" fill="#18080a"/>
    </svg>
  `),

  // 13: Golden Shoji Dojo
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg13" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#78350f"/>
          <stop offset="100%" stop-color="#451a03"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg13)"/>
      <rect x="100" y="100" width="550" height="700" fill="#fef08a" opacity="0.3" stroke="#b45309" stroke-width="12"/>
      <line x1="375" y1="100" x2="375" y2="800" stroke="#b45309" stroke-width="8"/>
      <line x1="100" y1="450" x2="650" y2="450" stroke="#b45309" stroke-width="8"/>
    </svg>
  `),

  // 14: Bioluminescent Ocean Trench
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg14" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0c4a6e"/>
          <stop offset="100%" stop-color="#082f49"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg14)"/>
      <circle cx="200" cy="700" r="90" fill="#38bdf8" opacity="0.35"/>
      <circle cx="550" cy="650" r="110" fill="#06b6d4" opacity="0.3"/>
    </svg>
  `),

  // 15: Phantom Blue Forest
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg15" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg15)"/>
      <circle cx="150" cy="400" r="25" fill="#60a5fa" opacity="0.8"/>
      <circle cx="600" cy="300" r="35" fill="#818cf8" opacity="0.7"/>
    </svg>
  `),

  // 16: Thunder Peak Summit
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg16" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b0764"/>
          <stop offset="100%" stop-color="#1e1035"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg16)"/>
      <polygon points="150,1050 375,400 600,1050" fill="#140824"/>
      <polygon points="375,100 320,400 390,400 300,750 480,380 400,380" fill="#c084fc"/>
    </svg>
  `),

  // 17: Solar Eclipse Corona
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <radialGradient id="bg17" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#18181b"/>
        </radialGradient>
      </defs>
      <rect width="750" height="1050" fill="#09090b"/>
      <circle cx="375" cy="420" r="210" fill="url(#bg17)"/>
      <circle cx="375" cy="420" r="180" fill="#09090b"/>
    </svg>
  `),

  // 18: Steel Industrial Fortress
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg18" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg18)"/>
      <rect x="150" y="300" width="450" height="750" fill="#1e293b" stroke="#64748b" stroke-width="8"/>
    </svg>
  `),

  // 19: Prismatic Crystal Cavern
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg19" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#155e75"/>
          <stop offset="100%" stop-color="#083344"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg19)"/>
      <polygon points="200,1050 260,600 320,1050" fill="#22d3ee" opacity="0.6"/>
      <polygon points="450,1050 520,550 580,1050" fill="#67e8f9" opacity="0.7"/>
    </svg>
  `),

  // 20: Sakura Petal River Valley
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg20" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#831843"/>
          <stop offset="100%" stop-color="#500724"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg20)"/>
      <path d="M300,500 Q450,700 350,1050 L450,1050 Q550,700 400,500 Z" fill="#f472b6" opacity="0.4"/>
    </svg>
  `),

  // 21: Floating Ethereal Cloud Citadel
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg21" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e3a8a"/>
          <stop offset="100%" stop-color="#172554"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg21)"/>
      <ellipse cx="375" cy="500" rx="220" ry="80" fill="#60a5fa" opacity="0.3"/>
    </svg>
  `),

  // 22: Obsidian Runed Gate
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg22" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#18181b"/>
          <stop offset="100%" stop-color="#09090b"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg22)"/>
      <rect x="220" y="250" width="310" height="800" fill="#27272a" stroke="#f59e0b" stroke-width="4"/>
    </svg>
  `),

  // 23: Swirling Dimensional Sigil
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <radialGradient id="bg23" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#030712"/>
        </radialGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg23)"/>
      <circle cx="375" cy="525" r="220" stroke="#f43f5e" stroke-width="6" fill="none" opacity="0.6"/>
    </svg>
  `),

  // 24: Candlelit Throne Hall
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg24" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#292524"/>
          <stop offset="100%" stop-color="#0c0a09"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg24)"/>
      <circle cx="200" cy="400" r="30" fill="#f59e0b" opacity="0.5"/>
      <circle cx="550" cy="400" r="30" fill="#f59e0b" opacity="0.5"/>
    </svg>
  `),

  // 25: Jagged Dragon Spire
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg25" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3f6212"/>
          <stop offset="100%" stop-color="#1a2e05"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg25)"/>
      <polygon points="200,1050 375,300 550,1050" fill="#14532d"/>
    </svg>
  `),

  // 26: Marble Constellation Altar
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg26" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#312e81"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg26)"/>
      <circle cx="375" cy="450" r="180" fill="#e0e7ff" opacity="0.2"/>
    </svg>
  `),

  // 27: Murky Toxic Swamp
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg27" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#14532d"/>
          <stop offset="100%" stop-color="#022c22"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg27)"/>
      <circle cx="300" cy="700" r="140" fill="#a3e635" opacity="0.25"/>
    </svg>
  `),

  // 28: Jagged Ice Citadel
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg28" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#155e75"/>
          <stop offset="100%" stop-color="#083344"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg28)"/>
      <polygon points="100,0 200,500 300,0" fill="#a5f3fc" opacity="0.5"/>
      <polygon points="450,0 550,550 650,0" fill="#67e8f9" opacity="0.5"/>
    </svg>
  `),

  // 29: Molten Forge Gears
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1050">
      <defs>
        <linearGradient id="bg29" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7c2d12"/>
          <stop offset="100%" stop-color="#18080a"/>
        </linearGradient>
      </defs>
      <rect width="750" height="1050" fill="url(#bg29)"/>
      <circle cx="375" cy="500" r="160" stroke="#f97316" stroke-width="24" fill="none" opacity="0.5"/>
    </svg>
  `),
];
