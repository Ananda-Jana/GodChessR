/**
 * High-resolution 2D Vector Path definitions for the 9 Hero Duels champions.
 * Each hero has 2 distinct pose variants (A & B) with linocut hatch lines,
 * sticker outlines, piece plinth bases, and accent shapes.
 */

export interface HeroVectorArtDef {
  heroId: string;
  name: string;
  roleTitle: string;
  poseA: {
    pathSvg: string;
    hatchesSvg?: string;
    accentsSvg?: string;
    eyesSvg?: string;
  };
  poseB: {
    pathSvg: string;
    hatchesSvg?: string;
    accentsSvg?: string;
    eyesSvg?: string;
  };
}

export const HERO_CARD_VECTOR_ART: Record<string, HeroVectorArtDef> = {
  'mugen-king': {
    heroId: 'mugen-king',
    name: 'MugenKING',
    roleTitle: 'THE SOVEREIGN',
    poseA: {
      // Hooded sovereign with long flowing cape, scepter with cross top, infinity crown halo
      pathSvg: `
        M280,650 L470,650 L460,610 C460,610 520,550 510,480 C500,410 460,380 460,340 
        C460,280 430,220 375,220 C320,220 290,280 290,340 C290,380 250,410 240,480 
        C230,550 290,610 290,610 Z
        M330,190 C300,190 300,150 340,150 C360,150 375,170 375,170 C375,170 390,150 410,150 C450,150 450,190 420,190 C390,190 375,170 375,170 C375,170 360,190 330,190 Z
      `,
      hatchesSvg: `
        M310,280 L340,260 M305,310 L345,290 M300,340 L350,320 M295,370 L355,350
        M300,420 L360,400 M305,470 L365,450
      `,
      accentsSvg: `
        M375,130 L380,145 L395,150 L380,155 L375,170 L370,155 L355,150 L370,145 Z
      `,
      eyesSvg: `
        M345,310 A6,6 0 1,0 357,310 A6,6 0 1,0 345,310
        M393,310 A6,6 0 1,0 405,310 A6,6 0 1,0 393,310
      `,
    },
    poseB: {
      pathSvg: `
        M270,650 L480,650 L470,610 C470,610 540,520 500,450 C460,380 450,350 450,330 
        C450,270 420,210 375,210 C330,210 300,270 300,330 C300,350 290,380 250,450 
        C210,520 280,610 280,610 Z
      `,
      hatchesSvg: `
        M440,280 L410,260 M445,310 L405,290 M450,340 L400,320
      `,
      eyesSvg: `
        M345,305 A6,6 0 1,0 357,305 A6,6 0 1,0 345,305
        M393,305 A6,6 0 1,0 405,305 A6,6 0 1,0 393,305
      `,
    },
  },

  'malevolent-priest': {
    heroId: 'malevolent-priest',
    name: 'Malevolent Priest',
    roleTitle: 'CURSE CONTROLLER',
    poseA: {
      // Tall eboshi hat, wide sleeves, floating paper talisman ofuda
      pathSvg: `
        M290,650 L460,650 L450,600 C450,600 540,500 520,420 C500,340 430,310 430,250 
        L320,250 C320,310 250,340 230,420 C210,500 300,600 300,600 Z
        M340,250 L340,110 L410,110 L410,250 Z
      `,
      hatchesSvg: `
        M350,130 L390,130 M350,160 L390,160 M350,190 L390,190
        M260,450 L310,430 M255,480 L315,460
      `,
      accentsSvg: `
        M350,290 L400,290 L400,360 L350,360 Z
      `,
      eyesSvg: `
        M370,320 A5,5 0 1,0 380,320 A5,5 0 1,0 370,320
      `,
    },
    poseB: {
      pathSvg: `
        M280,650 L470,650 L460,600 C460,600 550,480 510,410 C470,340 440,310 440,240 
        L310,240 C310,310 280,340 240,410 C200,480 290,600 290,600 Z
        M330,240 L330,100 L420,100 L420,240 Z
      `,
      hatchesSvg: `
        M340,120 L410,120 M340,150 L410,150 M340,180 L410,180
      `,
      eyesSvg: `
        M370,315 A5,5 0 1,0 380,315 A5,5 0 1,0 370,315
      `,
    },
  },

  'dr-methanogenic': {
    heroId: 'dr-methanogenic',
    name: 'Dr. Methanogenic',
    roleTitle: 'SPORE ALCHEMIST',
    poseA: {
      // Hunched scientist with gas mask, round lenses, bubbling flask
      pathSvg: `
        M280,650 L470,650 L450,580 C450,580 500,500 480,440 C460,380 430,340 430,290 
        C430,240 395,200 365,200 C335,200 300,240 300,290 C300,340 270,380 250,440 
        C230,500 280,580 280,580 Z
        M450,420 L480,460 L440,510 L410,470 Z
      `,
      hatchesSvg: `
        M320,260 L350,240 M315,290 L355,270 M310,320 L360,300
      `,
      accentsSvg: `
        M320,285 A16,16 0 1,0 352,285 A16,16 0 1,0 320,285
        M378,285 A16,16 0 1,0 410,285 A16,16 0 1,0 378,285
      `,
      eyesSvg: `
        M332,285 A5,5 0 1,0 342,285 A5,5 0 1,0 332,285
        M390,285 A5,5 0 1,0 400,285 A5,5 0 1,0 390,285
      `,
    },
    poseB: {
      pathSvg: `
        M270,650 L480,650 L460,580 C460,580 510,490 490,430 C470,370 440,330 440,280 
        C440,230 400,190 365,190 C330,190 290,230 290,280 C290,330 260,370 240,430 
        C220,490 270,580 270,580 Z
      `,
      hatchesSvg: `
        M310,250 L340,230 M305,280 L345,260
      `,
      eyesSvg: `
        M332,280 A5,5 0 1,0 342,280 A5,5 0 1,0 332,280
        M390,280 A5,5 0 1,0 400,280 A5,5 0 1,0 390,280
      `,
    },
  },

  'captain-englland': {
    heroId: 'captain-englland',
    name: 'Captain Englland',
    roleTitle: 'VANGUARD KNIGHT',
    poseA: {
      // Epaulettes, peaked captain cap, holding flagpole banner with knight emblem
      pathSvg: `
        M270,650 L480,650 L460,590 C460,590 530,510 500,430 C470,350 440,320 440,260 
        C440,200 400,170 375,170 C350,170 310,200 310,260 C310,320 280,350 250,430 
        C220,510 290,590 290,590 Z
        M300,170 L450,170 L430,130 L320,130 Z
        M500,200 L515,650 L500,650 Z
      `,
      hatchesSvg: `
        M330,230 L370,210 M325,260 L375,240 M320,290 L380,270
      `,
      accentsSvg: `
        M515,220 L610,240 L590,320 L515,300 Z
      `,
      eyesSvg: `
        M345,250 A6,6 0 1,0 357,250 A6,6 0 1,0 345,250
        M393,250 A6,6 0 1,0 405,250 A6,6 0 1,0 393,250
      `,
    },
    poseB: {
      pathSvg: `
        M260,650 L490,650 L470,590 C470,590 540,500 510,420 C480,340 450,310 450,250 
        C450,190 405,160 375,160 C345,160 300,190 300,250 C300,310 270,340 240,420 
        C210,500 280,590 280,590 Z
      `,
      hatchesSvg: `
        M320,220 L360,200 M315,250 L365,230
      `,
      eyesSvg: `
        M345,245 A6,6 0 1,0 357,245 A6,6 0 1,0 345,245
        M393,245 A6,6 0 1,0 405,245 A6,6 0 1,0 393,245
      `,
    },
  },

  'ajx-assassin': {
    heroId: 'ajx-assassin',
    name: 'AJX Assassin',
    roleTitle: 'GLITCH SHADOW',
    poseA: {
      // Sleek hooded assassin mid-leap with twin short blades and glitch slices
      pathSvg: `
        M290,650 L460,650 L440,570 C440,570 510,480 480,400 C450,320 420,290 420,230 
        C420,180 390,150 365,150 C340,150 310,180 310,230 C310,290 280,320 250,400 
        C220,480 290,570 290,570 Z
        M180,350 L260,320 L240,380 Z
        M470,320 L550,350 L490,380 Z
      `,
      hatchesSvg: `
        M330,200 L370,180 M325,230 L375,210 M320,260 L380,240
      `,
      eyesSvg: `
        M345,220 A5,5 0 1,0 355,220 A5,5 0 1,0 345,220
        M385,220 A5,5 0 1,0 395,220 A5,5 0 1,0 385,220
      `,
    },
    poseB: {
      pathSvg: `
        M280,650 L470,650 L450,570 C450,570 520,470 490,390 C460,310 430,280 430,220 
        C430,170 395,140 365,140 C335,140 300,170 300,220 C300,280 270,310 240,390 
        C210,470 280,570 280,570 Z
      `,
      hatchesSvg: `
        M320,190 L360,170 M315,220 L365,200
      `,
      eyesSvg: `
        M345,215 A5,5 0 1,0 355,215 A5,5 0 1,0 345,215
        M385,215 A5,5 0 1,0 395,215 A5,5 0 1,0 385,215
      `,
    },
  },

  'yjkstra-pathfinder': {
    heroId: 'yjkstra-pathfinder',
    name: 'Yjkstra Pathfinder',
    roleTitle: 'BFS ARCHITECT',
    poseA: {
      // Long-coated figure holding floating node graph
      pathSvg: `
        M280,650 L470,650 L450,580 C450,580 510,490 480,410 C450,330 420,300 420,240 
        C420,190 390,160 365,160 C340,160 310,190 310,240 C310,300 280,330 250,410 
        C220,490 280,580 280,580 Z
      `,
      hatchesSvg: `
        M330,210 L370,190 M325,240 L375,220
      `,
      accentsSvg: `
        M480,250 A12,12 0 1,0 504,250 A12,12 0 1,0 480,250
        M540,200 A12,12 0 1,0 564,200 A12,12 0 1,0 540,200
        M550,320 A12,12 0 1,0 574,320 A12,12 0 1,0 550,320
      `,
      eyesSvg: `
        M340,230 A6,6 0 1,0 352,230 A6,6 0 1,0 340,230
        M380,230 A6,6 0 1,0 392,230 A6,6 0 1,0 380,230
      `,
    },
    poseB: {
      pathSvg: `
        M270,650 L480,650 L460,580 C460,580 520,480 490,400 C460,320 430,290 430,230 
        C430,180 395,150 365,150 C335,150 300,180 300,230 C300,290 270,320 240,400 
        C210,480 270,580 270,580 Z
      `,
      hatchesSvg: `
        M320,200 L360,180 M315,230 L365,210
      `,
      eyesSvg: `
        M340,225 A6,6 0 1,0 352,225 A6,6 0 1,0 340,225
        M380,225 A6,6 0 1,0 392,225 A6,6 0 1,0 380,225
      `,
    },
  },

  'ironclad-warden': {
    heroId: 'ironclad-warden',
    name: 'Ironclad Warden',
    roleTitle: 'TOWER SHIELD WALL',
    poseA: {
      // Massive armored wall figure with brick pattern tower shield
      pathSvg: `
        M230,650 L520,650 L500,550 C500,550 560,450 520,360 C480,270 440,240 440,190 
        C440,140 395,120 365,120 C335,120 290,140 290,190 C290,240 250,270 210,360 
        C170,450 230,550 230,550 Z
        M180,300 L320,300 L300,650 L160,650 Z
      `,
      hatchesSvg: `
        M350,160 L390,140 M345,190 L395,170 M340,220 L400,200
        M200,350 L280,350 M200,420 L280,420 M200,490 L280,490
      `,
      eyesSvg: `
        M340,180 L390,180 L390,186 L340,186 Z
      `,
    },
    poseB: {
      pathSvg: `
        M220,650 L530,650 L510,550 C510,550 570,440 530,350 C490,260 450,230 450,180 
        C450,130 400,110 365,110 C330,110 280,130 280,180 C280,230 240,260 200,350 
        C160,440 220,550 220,550 Z
      `,
      hatchesSvg: `
        M340,150 L380,130 M335,180 L385,160
      `,
      eyesSvg: `
        M340,175 L390,175 L390,181 L340,181 Z
      `,
    },
  },

  'black-monkey': {
    heroId: 'black-monkey',
    name: 'BlackMonkey',
    roleTitle: 'TRICKSTER FLANKER',
    poseA: {
      // Lithe monkey with long curling S tail and white grin
      pathSvg: `
        M280,650 L470,650 L450,580 C450,580 500,490 470,410 C440,330 410,300 410,240 
        C410,190 380,160 365,160 C350,160 320,190 320,240 C320,300 290,330 260,410 
        C230,490 280,580 280,580 Z
        M470,450 C580,400 580,600 470,550 Z
      `,
      hatchesSvg: `
        M330,210 L370,190 M325,240 L375,220
      `,
      eyesSvg: `
        M345,220 A5,5 0 1,0 355,220 A5,5 0 1,0 345,220
        M385,220 A5,5 0 1,0 395,220 A5,5 0 1,0 385,220
        M340,250 Q365,275 390,250 Z
      `,
    },
    poseB: {
      pathSvg: `
        M270,650 L480,650 L460,580 C460,580 510,480 480,400 C450,320 420,290 420,230 
        C420,180 390,150 365,150 C340,150 310,180 310,230 C310,290 280,320 250,400 
        C220,480 270,580 270,580 Z
      `,
      hatchesSvg: `
        M320,200 L360,180 M315,230 L365,210
      `,
      eyesSvg: `
        M345,215 A5,5 0 1,0 355,215 A5,5 0 1,0 345,215
        M385,215 A5,5 0 1,0 395,215 A5,5 0 1,0 385,215
      `,
    },
  },

  'part-king-kong': {
    heroId: 'part-king-kong',
    name: 'Part King Kong',
    roleTitle: 'RAMPAGE BRUTE',
    poseA: {
      // Huge hunched ape brute with enormous fists planted on ground, scarred chest
      pathSvg: `
        M220,650 L530,650 L510,540 C510,540 580,430 530,320 C480,210 440,180 440,130 
        C440,80 395,60 365,60 C335,60 290,80 290,130 C290,180 250,210 200,320 
        C150,430 220,540 220,540 Z
      `,
      hatchesSvg: `
        M340,120 L390,100 M335,160 L395,140 M330,200 L400,180
      `,
      accentsSvg: `
        M330,280 L400,320 M330,320 L400,280
      `,
      eyesSvg: `
        M335,140 A6,6 0 1,0 347,140 A6,6 0 1,0 335,140
        M383,140 A6,6 0 1,0 395,140 A6,6 0 1,0 383,140
        M340,170 Q365,200 390,170 Z
      `,
    },
    poseB: {
      pathSvg: `
        M210,650 L540,650 L520,540 C520,540 590,420 540,310 C490,200 450,170 450,120 
        C450,70 400,50 365,50 C330,50 280,70 280,120 C280,170 240,200 190,310 
        C140,420 210,540 210,540 Z
      `,
      hatchesSvg: `
        M330,110 L380,90 M325,150 L385,130
      `,
      eyesSvg: `
        M335,135 A6,6 0 1,0 347,135 A6,6 0 1,0 335,135
        M383,135 A6,6 0 1,0 395,135 A6,6 0 1,0 383,135
      `,
    },
  },
};
