export interface ScenarioArrow {
  from: string; // e.g. "d3"
  to: string;   // e.g. "d5"
  label?: string;
  dashed?: boolean;
}

export interface ScenarioSquareHighlight {
  square: string;
  variant: 'origin' | 'target' | 'aoe' | 'danger' | 'ratio' | 'ally';
  label?: string;
}

export interface CullingAbilityScenario {
  id: string;
  characterName: string;
  characterType: string;
  counterpartName: string;
  counterpartType: string;
  role: string;
  abilityName: string;
  abilityType: 'active' | 'passive' | 'leap';
  boardCols: number;
  boardRows: number;
  originSquare: string;
  scenarioPieces: { square: string; type: string; color: 'white' | 'black' }[];
  arrows: ScenarioArrow[];
  highlights: ScenarioSquareHighlight[];
  technicalSpecs: {
    movementProfile: string;
    leapRadius: string;
    coordinateOffsets: string;
    captureCondition: string;
    specialRestrictions: string;
  };
  techniqueExplanation: string;
  activationCondition: string;
  studentTakeaway: string;
}

export const CULLING_ABILITY_SCENARIOS: CullingAbilityScenario[] = [
  // 1. SATORU GOJO / RYOMEN SUKUNA: SOVEREIGN (DOMAIN STEP LEAP)
  {
    id: 'gojo_domain_step',
    characterName: 'Satoru Gojo',
    characterType: 'culling_gojo',
    counterpartName: 'Ryomen Sukuna',
    counterpartType: 'culling_sukuna',
    role: 'Sovereign',
    abilityName: 'Domain Step (Leap Evasion)',
    abilityType: 'active',
    boardCols: 7,
    boardRows: 7,
    originSquare: 'd3',
    scenarioPieces: [
      { square: 'd3', type: 'culling_gojo', color: 'white' },
      { square: 'd4', type: 'culling_pawn', color: 'white' },
      { square: 'b5', type: 'culling_pawn', color: 'black' },
    ],
    arrows: [
      { from: 'd3', to: 'd5', label: 'Domain Step: File Vault (dx:0, dy:+2)' },
      { from: 'd3', to: 'f5', label: 'Domain Step: Diag Vault (dx:+2, dy:+2)', dashed: true },
    ],
    highlights: [
      { square: 'd3', variant: 'origin', label: 'Sovereign Origin' },
      { square: 'd4', variant: 'ally', label: 'Friendly Blocker Vaulted' },
      { square: 'd5', variant: 'target', label: 'Unattacked Empty Target' },
      { square: 'f5', variant: 'target', label: 'Diagonal Landing Cell' },
    ],
    technicalSpecs: {
      movementProfile: 'Steps 1 square in all 8 directions (standard king geometry).',
      leapRadius: 'Fixed distance 2 leap over intervening obstacles.',
      coordinateOffsets: '(0, ±2), (±2, 0), (±2, ±2) — 8 radial landing nodes.',
      captureCondition: 'Non-capturing only. Target cell MUST be completely empty.',
      specialRestrictions:
        'Usable once per match. Disabled while Sovereign is in check. Target must not be attacked by enemy.',
    },
    techniqueExplanation:
      'Domain Step is a once-per-match evasive tactical leap. When not in check, the Sovereign can jump exactly 2 squares in any of 8 orthogonal or diagonal lines, completely vaulting friendly or enemy blockers to land on an empty, unattacked square.',
    activationCondition:
      'Engine check: match.gojoDomainStepUsed === false && !isSquareAttacked(target) && !match.inCheck.',
    studentTakeaway:
      'Save Domain Step for late-game escape when corners are sealed. Also remember Sovereigns enjoy total capture/check immunity during the first 5 match turns.',
  },

  // 2. YUJI ITADORI / KENJAKU: VANGUARD (BLACK FLASH REMOTE CAPTURE)
  {
    id: 'yuji_black_flash',
    characterName: 'Yuji Itadori',
    characterType: 'culling_yuji',
    counterpartName: 'Kenjaku',
    counterpartType: 'culling_kenjaku',
    role: 'Vanguard',
    abilityName: 'Black Flash (Stationary Strike in Place)',
    abilityType: 'active',
    boardCols: 7,
    boardRows: 7,
    originSquare: 'd3',
    scenarioPieces: [
      { square: 'd3', type: 'culling_yuji', color: 'white' },
      { square: 'd5', type: 'culling_panda', color: 'black' },
      { square: 'f3', type: 'culling_pawn', color: 'black' },
    ],
    arrows: [
      { from: 'd3', to: 'd5', label: 'Black Flash: Dist 2 Strike in Place' },
      { from: 'd3', to: 'f3', label: 'Standard Dist 2 Capture (Moves)', dashed: true },
    ],
    highlights: [
      { square: 'd3', variant: 'origin', label: 'Vanguard Remains Anchored' },
      { square: 'd4', variant: 'ratio', label: 'Intermediate Square Empty' },
      { square: 'd5', variant: 'target', label: 'Enemy Obliterated in Place' },
    ],
    technicalSpecs: {
      movementProfile: 'Slides 1 to 3 squares in all 8 directions (queen geometry, range 3, no leaps).',
      leapRadius: 'No leaping. Path between origin and target must be clear.',
      coordinateOffsets: '(0, ±2), (±2, 0), (±2, ±2) for Black Flash in-place strike.',
      captureCondition:
        'At distance 2: target is removed, Vanguard remains on origin square. At distance 1 or 3: moves to square normally.',
      specialRestrictions: 'Restricted to 1 square max when adjacent to an enemy Warden (Nanami/Reggie).',
    },
    techniqueExplanation:
      'When the Vanguard captures an enemy unit precisely 2 squares away along a straight or diagonal line with an empty middle cell, Black Flash eliminates the enemy piece while the Vanguard stays anchored on its origin square. Captures at distance 1 or 3 move the Vanguard onto the target square normally.',
    activationCondition:
      'Engine check: distance === 2 && intermediateCell.isEmpty && move.actionType === "black_flash".',
    studentTakeaway:
      'Use Black Flash to decapitate enemy attackers at distance 2 without vacating your critical defensive outpost or exposing the Sovereign behind you.',
  },

  // 3. KOKICHI MUTA (MECHAMARU) / URAUME: ARTILLERY (RANGED STRIKE)
  {
    id: 'mechamaru_ranged_strike',
    characterName: 'Kokichi Muta (Mechamaru)',
    characterType: 'culling_mechamaru',
    counterpartName: 'Uraume',
    counterpartType: 'culling_uraume',
    role: 'Artillery',
    abilityName: 'Ranged Strike (Stationary Elimination)',
    abilityType: 'active',
    boardCols: 7,
    boardRows: 7,
    originSquare: 'c2',
    scenarioPieces: [
      { square: 'c2', type: 'culling_mechamaru', color: 'white' },
      { square: 'c4', type: 'culling_pawn', color: 'black' },
      { square: 'e4', type: 'culling_pawn', color: 'black' },
    ],
    arrows: [
      { from: 'c2', to: 'c4', label: 'Ranged Strike: Orthogonal (dx:0, dy:+2)' },
      { from: 'c2', to: 'e4', label: 'Ranged Strike: Diagonal (dx:+2, dy:+2)', dashed: true },
    ],
    highlights: [
      { square: 'c2', variant: 'origin', label: 'Artillery Stays Stationed' },
      { square: 'c3', variant: 'ratio', label: 'Intermediate Cell Must Be Vacant' },
      { square: 'c4', variant: 'target', label: 'Target Sniped from Range' },
    ],
    technicalSpecs: {
      movementProfile: 'Steps 1 square in all 8 directions (orthogonal + diagonal).',
      leapRadius: 'No leaping. Requires completely vacant intermediate square.',
      coordinateOffsets: '(0, ±2), (±2, 0), (±2, ±2) — 8 radial snipe targets at distance 2.',
      captureCondition: 'Removes enemy piece at distance 2 without moving Artillery.',
      specialRestrictions: 'Completely disabled if an enemy Warden stands adjacent in the 8 surrounding cells.',
    },
    techniqueExplanation:
      'Artillery eliminates an enemy piece located exactly 2 squares away along any of the 8 straight or diagonal vectors without vacating its position, provided the intermediate square is empty. The artillery never moves into the line of fire.',
    activationCondition:
      'Engine check: chebyshevDist === 2 && intermediateCell.isEmpty && !adjacentToWarden.',
    studentTakeaway:
      'Station Artillery behind friendly pawns or inside wing pockets (B1/G1) to command 2-square approach corridors without physical counter-exposure.',
  },

  // 4. PANDA / YOROZU: BULWARK (KNIGHT L-JUMP & SHELL HARDENING)
  {
    id: 'panda_shell',
    characterName: 'Panda',
    characterType: 'culling_panda',
    counterpartName: 'Yorozu',
    counterpartType: 'culling_yorozu',
    role: 'Bulwark',
    abilityName: 'Shell Hardening (First-Strike Damage Barrier)',
    abilityType: 'passive',
    boardCols: 7,
    boardRows: 7,
    originSquare: 'd4',
    scenarioPieces: [
      { square: 'd4', type: 'culling_panda', color: 'white' },
      { square: 'd2', type: 'culling_kenjaku', color: 'black' },
      { square: 'd3', type: 'culling_pawn', color: 'white' },
    ],
    arrows: [
      { from: 'd2', to: 'd4', label: 'Enemy Attack Fails: Halted on d2', dashed: true },
      { from: 'd4', to: 'e6', label: 'Bulwark L-Jump Leap (dx:+1, dy:+2)' },
    ],
    highlights: [
      { square: 'd4', variant: 'origin', label: 'Bulwark (Shell Active)' },
      { square: 'd2', variant: 'danger', label: 'Attacker Rebounded to Origin' },
      { square: 'e6', variant: 'target', label: 'Knight Leap Target' },
    ],
    technicalSpecs: {
      movementProfile: 'Knight L-jump leaps (2x1 and 1x2 in 8 directions). Vaults all intervening units.',
      leapRadius: 'Standard Knight jump radius: dx:±1/dy:±2 or dx:±2/dy:±1.',
      coordinateOffsets: '(±1, ±2), (±2, ±1) — 8 leap destinations.',
      captureCondition: 'Captures normally on landing square.',
      specialRestrictions: 'One of only two roles in the game capable of leaping in regular play.',
    },
    techniqueExplanation:
      'The Bulwark leaps freely over any friendly or enemy pieces using Knight L-jumps. Passively carries Shell Hardening: the first time an opponent attempts to capture this piece, the attack fails completely. The attacking unit stays halted on its origin square, the shell breaks permanently, and the opponent’s entire turn ends with zero progress.',
    activationCondition:
      'Engine check: target.pandaCore === "panda". Shell absorbs strike, resets to "broken", absorbs turn.',
    studentTakeaway:
      'Use the Bulwark as a frontline tempo sink. Placing Panda in the slide vector of an enemy Queen or Rook costs them an entire turn.',
  },

  // 5. KENTO NANAMI / REGGIE STAR: WARDEN (RATIO FIELD SUPPRESSION)
  {
    id: 'nanami_ratio_field',
    characterName: 'Kento Nanami',
    characterType: 'culling_nanami',
    counterpartName: 'Reggie Star',
    counterpartType: 'culling_reggie',
    role: 'Warden',
    abilityName: 'Ratio Field (8-Square Mobility Suppression Aura)',
    abilityType: 'passive',
    boardCols: 7,
    boardRows: 7,
    originSquare: 'd4',
    scenarioPieces: [
      { square: 'd4', type: 'culling_nanami', color: 'white' },
      { square: 'e4', type: 'culling_kenjaku', color: 'black' },
      { square: 'd5', type: 'culling_uraume', color: 'black' },
      { square: 'c3', type: 'culling_naoya', color: 'black' },
    ],
    arrows: [
      { from: 'd4', to: 'd1', label: 'Warden Orthogonal Slide (Max 3 Sq)' },
      { from: 'e4', to: 'f4', label: 'Vanguard Restricted to 1 Sq', dashed: true },
    ],
    highlights: [
      { square: 'd4', variant: 'origin', label: 'Warden Center (Ratio Field)' },
      { square: 'e4', variant: 'aoe', label: 'Vanguard Suppressed: Max 1 Sq' },
      { square: 'd5', variant: 'aoe', label: 'Artillery Strike Deactivated' },
      { square: 'c3', variant: 'target', label: 'Skirmisher Immune to Ratio' },
    ],
    technicalSpecs: {
      movementProfile: 'Slides 1 to 3 squares orthogonally along ranks and files. NO diagonal moves.',
      leapRadius: 'No leaping. Blocked by any intermediate unit.',
      coordinateOffsets: '(0, ±1..3), (±1..3, 0) orthogonal sliders.',
      captureCondition: 'Captures normally at the end of an unobstructed orthogonal ray.',
      specialRestrictions: 'Has NO pawn immunity; can be captured by any enemy piece.',
    },
    techniqueExplanation:
      'The Warden slides up to 3 squares orthogonally. Radiates an unyielding Ratio Field: any enemy piece located in the 8 adjacent squares is restricted to a maximum movement/capture distance of 1 square, and enemy Artillery Ranged Strikes are deactivated. Skirmishers (Maki/Naoya) are completely immune.',
    activationCondition:
      'Engine check: chebyshevDist(enemy, warden) <= 1 && enemy.type !== "culling_maki" && enemy.type !== "culling_naoya".',
    studentTakeaway:
      'Lock down enemy heavy pieces by pressing the Warden directly adjacent to them. Step adjacent to an Artillery to silence its ranged strike instantly.',
  },

  // 6. MAKI ZENIN / NAOYA ZENIN: SKIRMISHER (HEAVENLY RESTRICTION & ORTHOGONAL LEAP)
  {
    id: 'maki_heavenly_restriction',
    characterName: 'Maki Zenin',
    characterType: 'culling_maki',
    counterpartName: 'Naoya Zenin',
    counterpartType: 'culling_naoya',
    role: 'Skirmisher',
    abilityName: 'Heavenly Restriction & Orthogonal Leap',
    abilityType: 'leap',
    boardCols: 7,
    boardRows: 7,
    originSquare: 'c2',
    scenarioPieces: [
      { square: 'c2', type: 'culling_maki', color: 'white' },
      { square: 'c3', type: 'culling_pawn', color: 'white' },
      { square: 'd2', type: 'culling_reggie', color: 'black' },
      { square: 'c4', type: 'culling_pawn', color: 'black' },
    ],
    arrows: [
      { from: 'c2', to: 'c4', label: 'Orthogonal Leap over c3 (dx:0, dy:+2)' },
      { from: 'c2', to: 'a2', label: 'Rank Leap (dx:-2, dy:0)', dashed: true },
    ],
    highlights: [
      { square: 'c2', variant: 'origin', label: 'Skirmisher Origin' },
      { square: 'c3', variant: 'ally', label: 'Allied Pawn Vaulted Over' },
      { square: 'd2', variant: 'danger', label: 'Enemy Warden (Ratio Ignored)' },
      { square: 'c4', variant: 'target', label: 'Capture Landing Square' },
    ],
    technicalSpecs: {
      movementProfile: 'Steps 1 square in all 8 directions, OR hops exactly 2 squares orthogonally.',
      leapRadius: 'Orthogonal leap radius: fixed distance 2 (dx:0, dy:±2 or dx:±2, dy:0).',
      coordinateOffsets: '(0, ±2), (±2, 0) leaps; (±1, ±1), (0, ±1), (±1, 0) single steps.',
      captureCondition: 'Captures on landing square for both steps and leaps.',
      specialRestrictions: 'One of only two leaping roles. 100% immune to Warden Ratio Field.',
    },
    techniqueExplanation:
      'The Skirmisher steps 1 square in all 8 directions, or hops exactly 2 squares along ranks and files, vaulting over any intermediate pawn or piece. Governed by Heavenly Restriction, the Skirmisher is completely immune to the Warden’s Ratio Field suppression, preserving full mobility even when directly adjacent to Nanami or Reggie.',
    activationCondition:
      'Engine check: (Math.abs(dx) === 2 && dy === 0) || (Math.abs(dy) === 2 && dx === 0). Ignores ratioDebuff.',
    studentTakeaway:
      'Deploy the Skirmisher to assassinate enemy Wardens. Unlike other pieces that get slowed to 1 square, the Skirmisher leaps right over pawns and captures without penalty.',
  },

  // 7. KINJI HAKARI / KUROURUSHI: RUSHER (IDLE DEATH GAMBLE JACKPOT BONUS STEP)
  {
    id: 'hakari_jackpot',
    characterName: 'Kinji Hakari',
    characterType: 'culling_hakari',
    counterpartName: 'Kurourushi',
    counterpartType: 'culling_kurourushi',
    role: 'Rusher',
    abilityName: 'Idle Death Gamble (Jackpot Bonus Move)',
    abilityType: 'passive',
    boardCols: 7,
    boardRows: 7,
    originSquare: 'c2',
    scenarioPieces: [
      { square: 'c2', type: 'culling_hakari', color: 'white' },
      { square: 'e4', type: 'culling_pawn', color: 'black' },
      { square: 'e5', type: 'culling_kenjaku', color: 'black' },
    ],
    arrows: [
      { from: 'c2', to: 'e4', label: '1. Diagonal Capture Slide (dx:+2, dy:+2)' },
      { from: 'e4', to: 'f3', label: '2. Jackpot Safe Retreat Step (1 Sq)', dashed: true },
    ],
    highlights: [
      { square: 'c2', variant: 'origin', label: 'Rusher Starting Cell' },
      { square: 'e4', variant: 'target', label: 'Capture & Jackpot Trigger' },
      { square: 'f3', variant: 'target', label: 'Unattacked Safe Escape Cell' },
      { square: 'e5', variant: 'danger', label: 'Threatening Enemy Queen' },
    ],
    technicalSpecs: {
      movementProfile: 'Slides up to 2 squares diagonally (no leaping); steps 1 square orthogonally.',
      leapRadius: 'No leaping. Path must be unobstructed.',
      coordinateOffsets: '(±1..2, ±1..2) diagonal slides; (0, ±1), (±1, 0) orthogonal steps.',
      captureCondition: 'Executes standard capture, then immediately triggers Jackpot bonus move.',
      specialRestrictions:
        'Jackpot step must be with the same piece, non-capturing, 1 square in 8 directions, to an unattacked square keeping Sovereign safe.',
    },
    techniqueExplanation:
      'The Rusher is a swift hit-and-run assassin. Upon capturing an enemy piece, the player immediately earns ONE bonus move with that SAME piece: a single 1-square step in any of 8 directions to an unattacked empty square. If all surrounding squares are covered by opponent attacks, the bonus step is forfeited.',
    activationCondition:
      'Engine check: move.captured !== undefined => match.pendingJackpotStep = { pieceId, pos }.',
    studentTakeaway:
      'Master the hit-and-run: slide diagonally to capture an enemy forward piece, then immediately use the Jackpot bonus step to retreat behind your pawn shield in the same turn.',
  },
];
