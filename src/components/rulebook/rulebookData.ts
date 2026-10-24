import { ModeRulebookData } from './types';

export const RULEBOOK_MODES: ModeRulebookData[] = [
  // ==========================================
  // 1. STANDARD DICE CHESS (BOT STANDARD)
  // ==========================================
  {
    id: 'standard',
    title: 'Play vs Bot (Standard)',
    subtitle: '8×8 Tournament Arena with Authoritative Dice Roll & Prince Mechanics',
    badge: 'Standard Mode',
    accentColor: 'amber',
    overview: {
      objective: 'Checkmate the opponent King while navigating random dice rolls and defending against Prince leaps.',
      boardGeometry: 'Standard 8×8 grid with 64 squares using algebraic coordinates (a–h, ranks 1–8).',
      armySize: '16 pieces per side (32 total), featuring Queens at a1/h8 and Princes at h1/a8.',
      timeControl: 'Blitz format (2 minutes or 5 minutes clock with 8-second grace auto-roll window).',
      winConditions: [
        'Checkmate: Deliver inescapable check to the opponent King.',
        'Timeout: Opponent runs out of time on their match clock.',
        'Resignation: Opponent concedes the match.',
      ],
      drawConditions: [
        'Stalemate: Current player has no legal moves and is not in check.',
        'Insufficient Material: Neither player has pieces capable of delivering checkmate.',
        '50-Move Rule: 50 consecutive moves without a pawn push or capture.',
      ],
      keyHighlights: [
        {
          title: 'Royal Corner Starting Layout',
          desc: 'White Queen starts at a1, Prince at h1. Black Prince starts at a8, Queen at h8. Back ranks and pawns follow standard configuration.',
        },
        {
          title: 'Authoritative Dice Roll Phase',
          desc: 'Every turn begins by rolling authoritative dice (1–6). Rolls 1, 2, 3 unlock inexpensive pieces (Knights, Bishops, Pawns); Rolls 4, 5, 6 unlock expensive pieces (Rooks, Queen, Prince).',
        },
        {
          title: 'Check Defense Dice Override',
          desc: 'CRITICAL INVARIANT: If your King is in check, the dice roll is bypassed! You may move ANY legal piece to escape check, regardless of dice category.',
        },
      ],
    },
    rules: {
      sections: [
        {
          title: '1. The Prince Piece Mechanics',
          content: 'The Prince is a custom noble unit that combines jumping mobility with tactical flexibility:',
          items: [
            {
              name: 'Unchecked Leaping',
              details: 'The Prince can leap over friendly or enemy pieces when moving 2 squares orthogonally or diagonally, functioning like an extended knight or super-pawn.',
              badge: 'Leap',
            },
            {
              name: 'Movement Range',
              details: 'Can step 1 square in any direction (like a King) OR leap exactly 2 squares in orthogonal or diagonal directions over intervening pieces.',
            },
            {
              name: 'Check Delivery Constraint',
              details: 'The Prince cannot leap when delivering direct check to the enemy King.',
              badge: 'Restriction',
            },
          ],
        },
        {
          title: '2. Dice System & Piece Eligibility',
          content: 'Turn eligibility is strictly governed by authoritative dice rolls:',
          items: [
            {
              name: 'Rolls 1, 2, 3 (Inexpensive Pieces)',
              details: 'Unlocks movement for Knights, Bishops, and Pawns. Excellent for opening development and pawn breaks.',
              badge: '1 · 2 · 3',
            },
            {
              name: 'Rolls 4, 5, 6 (Expensive Pieces)',
              details: 'Unlocks movement for Rooks, Queen, and Prince. Devastating for breakthrough strikes and heavy piece maneuvers.',
              badge: '4 · 5 · 6',
            },
            {
              name: '8-Second Grace Window',
              details: 'Players have 8 seconds to manually click the dice roller; if the timer expires, the server automatically rolls to maintain fast-paced gameplay.',
            },
          ],
        },
        {
          title: '3. Check & King Safety Invariants',
          content: 'King safety strictly takes precedence over dice rolls:',
          items: [
            {
              name: 'Check Priority',
              details: 'When in check, you are never locked out of making an escape move. The dice phase is automatically suspended until the check is parried.',
            },
            {
              name: 'Absolute Pins',
              details: 'A pinned piece cannot move if moving it would expose your King to direct check.',
            },
          ],
        },
      ],
    },
    strategy: {
      tacticalPrinciples: [
        'Maintain a balanced army: keep both inexpensive (Knights/Bishops) and expensive (Rooks/Prince) active so no dice roll is wasted.',
        'Use the Prince as an early outpost anchor on d4/e4 or d5/e5 to exploit its unblockable leap over pawn chains.',
        'Corner Queens (a1/h8) have clear diagonal vision once pawns advance; develop b2/g2 pawns quickly to activate them.',
      ],
      openings: [
        {
          id: 'prince_vanguard',
          name: 'Prince Vanguard Opening',
          tagline: 'Dominating central outposts via unchecked leaping strikes',
          boardDimensions: { cols: 8, rows: 8 },
          notationSteps: [
            '1. e4 (Open center lane for bishop & queen)',
            '2. d4 (Staking the classical pawn duo)',
            '3. Ph3 (Prince preparing flank leap)',
            '4. Pf5 (Prince leaping into the enemy perimeter)',
            '5. Nf3 (Knight supporting central hold)',
          ],
          description:
            'The Prince Vanguard Opening activates the custom Prince from the corner h1 square, deploying it via h3 to f5 where it can leap over enemy pawns and strike at d6 and e7.',
          strategicGoals: [
            'Immediate central spatial advantage with pawns on e4 and d4',
            'Unblockable outpost for the Prince on f5 leaping over the pawn wall',
            'Threatening forks against enemy queen and back-rank rooks',
            'Smooth development for Knights and Bishops on subsequent turns',
          ],
          keySquares: ['e4', 'd4', 'h3', 'f5', 'f3'],
          diagramPieces: [
            { square: 'e4', type: 'pawn', color: 'white' },
            { square: 'd4', type: 'pawn', color: 'white' },
            { square: 'f5', type: 'prince', color: 'white' },
            { square: 'f3', type: 'knight', color: 'white' },
            { square: 'a1', type: 'queen', color: 'white' },
            { square: 'e1', type: 'king', color: 'white' },
            { square: 'e7', type: 'pawn', color: 'black' },
            { square: 'd7', type: 'pawn', color: 'black' },
            { square: 'e8', type: 'king', color: 'black' },
            { square: 'a8', type: 'prince', color: 'black' },
            { square: 'h8', type: 'queen', color: 'black' },
          ],
          focalSquares: [
            { square: 'f5', variant: 'key', label: 'Prince Outpost' },
            { square: 'e4', variant: 'defense', label: 'Center Stake' },
            { square: 'd4', variant: 'defense', label: 'Pawn Wedge' },
            { square: 'e7', variant: 'attack', label: 'Target' },
          ],
        },
        {
          id: 'royal_corner_defense',
          name: 'Royal Corner Battery',
          tagline: 'Unleashing long-range diagonal snipers from the corner ranks',
          boardDimensions: { cols: 8, rows: 8 },
          notationSteps: [
            '1. c3 (Opening diagonal for Queen on a1)',
            '2. d4 (Solidifying center control)',
            '3. Bf4 (Developing active bishop)',
            '4. e3 (Forming resilient pawn pyramid)',
            '5. Qa4 (Queen surging along the unblocked diagonal)',
          ],
          description:
            'Capitalizes on the unique corner queen placement at a1. By pushing c3 and clearing the a1-h8 long diagonal, the Queen exerts enormous pressure across the board.',
          strategicGoals: [
            'Activate the a1 Queen without displacing the King',
            'Rock-solid c3-d4-e3 pawn wedge',
            'Early pins against enemy knights on c6',
          ],
          keySquares: ['a1', 'c3', 'd4', 'a4', 'f4'],
          diagramPieces: [
            { square: 'a4', type: 'queen', color: 'white' },
            { square: 'c3', type: 'pawn', color: 'white' },
            { square: 'd4', type: 'pawn', color: 'white' },
            { square: 'e3', type: 'pawn', color: 'white' },
            { square: 'f4', type: 'bishop', color: 'white' },
            { square: 'h1', type: 'prince', color: 'white' },
            { square: 'e1', type: 'king', color: 'white' },
            { square: 'c6', type: 'knight', color: 'black' },
            { square: 'e7', type: 'pawn', color: 'black' },
            { square: 'd5', type: 'pawn', color: 'black' },
            { square: 'e8', type: 'king', color: 'black' },
          ],
          focalSquares: [
            { square: 'a4', variant: 'attack', label: 'Queen Battery' },
            { square: 'c6', variant: 'attack', label: 'Pinned Knight' },
            { square: 'd4', variant: 'fortress', label: 'Pyramid Apex' },
          ],
        },
      ],
    },
  },

  // ==========================================
  // 2. CRAFTED PIECES MODE (BOT CRAFTED)
  // ==========================================
  {
    id: 'crafted',
    title: 'Play vs Bot (Crafted Pieces)',
    subtitle: 'Asymmetric Warfare with Communists, Supreme Rooks, and Priests',
    badge: 'Crafted Mode',
    accentColor: 'cyan',
    overview: {
      objective: 'Defeat the Grandmaster Bot utilizing exotic crafted pieces or mid-game crafting threshold placement.',
      boardGeometry: '8×8 grid with unique custom piece starting army or mid-game crafting placement.',
      armySize: '16 pieces per side, featuring Communists, Supreme Rooks, and Priests.',
      timeControl: 'Blitz format (2 minutes or 5 minutes clock).',
      winConditions: [
        'Checkmate: Trap the opponent King.',
        'Timeout: Opponent clock expires.',
        'Resignation: Opponent yields.',
      ],
      drawConditions: ['Stalemate', '3-fold repetition', '50-move rule'],
      keyHighlights: [
        {
          title: 'Crafted Starting Army Layout',
          desc: 'Communists replace standard Bishops (c1, f1 for White; c8, f8 for Black). Priests replace standard Knights (b1 for White; g8 for Black). Supreme Rook replaces one standard Rook (d1 for White; d8 for Black). Corner Queens (a1/h8) and Princes (h1/a8) remain intact.',
        },
        {
          title: 'Crafting Threshold: 2 Expensive Pieces Lost',
          desc: 'When a player loses 2 expensive pieces (Queen, Rook, Supreme Rook, or Prince), a crafting banner unlocks allowing 1 legendary craft placement on any empty square in their territory.',
        },
        {
          title: 'Exotic Movement Dynamics',
          desc: 'Crafted pieces have non-traditional geometry: zigzags, hybrid leap-slides, and extended ranges that can bypass standard pawn blocks.',
        },
      ],
    },
    rules: {
      sections: [
        {
          title: '1. The Communist (Zigzag Striker)',
          content: 'The Communist moves in an alternating diagonal zigzag pattern along 4 orthogonal lines (offsets ±2, ±4):',
          items: [
            {
              name: 'Zigzag Geometry',
              details: 'Strikes through an alternating diagonal-orthogonal hop, traversing 2 or 4 squares while hopping past obstacles.',
              badge: 'Zigzag',
            },
            {
              name: 'Branch Clearance',
              details: 'Movement is valid as long as at least one of its branching zigzag paths is unobstructed.',
            },
          ],
        },
        {
          title: '2. The Supreme Rook (Bastion Fortress)',
          content: 'The Supreme Rook merges unstoppable orthogonal slides with diagonal jumping:',
          items: [
            {
              name: 'Orthogonal Slide',
              details: 'Unlimited straight orthogonal movement like a standard Rook (blocked by pieces).',
            },
            {
              name: 'Diagonal Leap',
              details: 'Can leap exactly 2 squares diagonally over any intervening piece to surprise enemy flankers.',
              badge: 'Leap',
            },
          ],
        },
        {
          title: '3. The Priest (Holy Sniper)',
          content: 'The Priest merges diagonal slides with orthogonal jumping:',
          items: [
            {
              name: 'Diagonal Slide',
              details: 'Slides diagonally up to 3 squares (blocked by intervening pieces).',
            },
            {
              name: 'Orthogonal Leap',
              details: 'Can leap exactly 2 squares orthogonally over intervening pieces to bypass pawn chains.',
              badge: 'Leap',
            },
          ],
        },
      ],
    },
    strategy: {
      tacticalPrinciples: [
        'Set up intersecting cross-fire lines with Communist zigzags and Supreme Rook rays.',
        'Use the Priest’s 2-square orthogonal leap to bypass solid pawn chains and attack f7/f2 weaknesses.',
        'Keep track of expensive piece trades to trigger your crafting threshold before the opponent.',
      ],
      openings: [
        {
          id: 'heavy_battery',
          name: 'Heavy Battery Deployment',
          tagline: 'Establishing cross-board diagonal and orthogonal suppression',
          boardDimensions: { cols: 8, rows: 8 },
          notationSteps: [
            '1. d3 (Opening Supreme Rook vertical ray)',
            '2. Cb3 (Communist zigzag flank sweep to b3)',
            '3. Pd4 (Priest leaping into central battery at d4)',
            '4. SRd2 (Supreme Rook backing the d-file)',
          ],
          description:
            'A devastating setup that combines the Supreme Rook on d2, the Priest on d4, and the Communist on b3 to create an impenetrable central death-zone.',
          strategicGoals: [
            'Supreme Rook controls the open d-file',
            'Priest dominates the central d4 square with 3-square diagonal vision',
            'Communist guards the c4 and a4 ingress points with zigzag hops',
          ],
          keySquares: ['d2', 'd3', 'd4', 'b3', 'f1'],
          diagramPieces: [
            { square: 'd2', type: 'supremeRook', color: 'white' },
            { square: 'd4', type: 'priest', color: 'white' },
            { square: 'b3', type: 'communist', color: 'white' },
            { square: 'f1', type: 'communist', color: 'white' },
            { square: 'a1', type: 'queen', color: 'white' },
            { square: 'e1', type: 'king', color: 'white' },
            { square: 'e7', type: 'pawn', color: 'black' },
            { square: 'd7', type: 'pawn', color: 'black' },
            { square: 'e8', type: 'king', color: 'black' },
          ],
          focalSquares: [
            { square: 'd4', variant: 'key', label: 'Priest Outpost' },
            { square: 'd2', variant: 'attack', label: 'Supreme Rook Battery' },
            { square: 'b3', variant: 'defense', label: 'Communist Guard' },
          ],
        },
        {
          id: 'priest_sniper',
          name: 'Priest Sniper Opening',
          tagline: 'Puncturing opponent pawn defenses with orthogonal leaping strikes',
          boardDimensions: { cols: 8, rows: 8 },
          notationSteps: [
            '1. c3 (Pawn anchor clearing priest jump square)',
            '2. Pb3 (Priest forward leap to b3)',
            '3. Pe6 (Priest deep diagonal invasion targeting f7/e7)',
          ],
          description:
            'Exploits the Priest’s ability to leap 2 squares orthogonally over friendly pawns to land directly on b3, from where its 3-square diagonal range can strike into Black’s camp.',
          strategicGoals: [
            'Rapid development without opening lines for enemy rooks',
            'Early pressure on the delicate f7 pawn',
            'Forcing early defensive pawn concessions from the Bot',
          ],
          keySquares: ['b1', 'c3', 'b3', 'e6', 'f7'],
          diagramPieces: [
            { square: 'b3', type: 'priest', color: 'white' },
            { square: 'c3', type: 'pawn', color: 'white' },
            { square: 'e4', type: 'pawn', color: 'white' },
            { square: 'e1', type: 'king', color: 'white' },
            { square: 'e7', type: 'pawn', color: 'black' },
            { square: 'f7', type: 'pawn', color: 'black' },
            { square: 'e8', type: 'king', color: 'black' },
          ],
          focalSquares: [
            { square: 'b3', variant: 'key', label: 'Priest Perch' },
            { square: 'f7', variant: 'attack', label: 'Sniper Target' },
          ],
        },
      ],
    },
  },

  // ==========================================
  // 3. CULLING GAME MODE (Synchronized with cullingEngine.ts & CullingTheoryView.tsx)
  // ==========================================
  {
    id: 'culling',
    title: 'Culling Game Mode',
    subtitle: '88-Square Cross Battlefield: Sovereign Immunity, Domain Step & Ratio Suppression',
    badge: 'Culling Mode',
    accentColor: 'red',
    overview: {
      objective: 'Eliminate the opponent Sovereign (Gojo for White, Sukuna for Black) or force a timeout/resignation.',
      boardGeometry: '88-square cross-shaped board: 8×8 central zone + 4 extended arms (Top B9..G9, Bottom B0..G0, Left L2..L7, Right R2..R7). Outer corners are non-playable void cells.',
      armySize: '16 pieces per side: Sovereign, Vanguard, Artillery, Bulwark, Warden, Skirmisher, Rusher, and 8 Pawns.',
      timeControl: '3 minutes per side blitz clock with engine move validation.',
      winConditions: [
        'Sovereign Elimination: Checkmate or capture Satoru Gojo (White) or Ryomen Sukuna (Black).',
        'Timeout: Opponent clock hits zero.',
        'Resignation: Opponent yields.',
      ],
      drawConditions: ['Stalemate or 3-fold repetition.'],
      keyHighlights: [
        {
          title: '88-Square Cross Battlefield',
          desc: 'Features an 8×8 center plus four 6-square extended arms (B0..G0, B9..G9, L2..L7, R2..R7). The four corner regions are empty void space.',
        },
        {
          title: '5-Turn Sovereign Immunity & Domain Step',
          desc: 'Sovereigns cannot be checked or captured during turns 1–5. Once per match, Domain Step allows a 2-square evasive leap in all 8 directions over intervening obstacles to an unattacked empty square.',
        },
        {
          title: 'Engine-Authoritative Special Abilities',
          desc: 'Vanguard Black Flash strikes in place at distance 2; Artillery snipes at distance 2 without moving; Bulwark Shell absorbs the first capture attempt; Warden Ratio Field restricts adjacent enemy units to 1 square; Skirmishers leap orthogonally and ignore Ratio Field; Rushers trigger Jackpot bonus steps upon capture.',
        },
      ],
    },
    rules: {
      sections: [
        {
          title: '1. Sovereign Royalty (Gojo & Sukuna)',
          content: 'The core royal piece whose survival determines the outcome of the match:',
          items: [
            {
              name: 'Omnidirectional Single Step',
              details: 'Moves and captures 1 square in all 8 directions (orthogonal and diagonal).',
              badge: 'Sovereign',
            },
            {
              name: '5-Turn Sovereign Immunity',
              details: 'During the first 5 turns of the match, Sovereigns cannot be captured or placed in check.',
              badge: 'Immunity',
            },
            {
              name: 'Domain Step (Once per Match)',
              details: 'Leaps exactly 2 squares in any of 8 straight or diagonal lines over intervening pieces to land on an unattacked empty square. Unavailable while in check.',
              badge: 'Leap',
            },
          ],
        },
        {
          title: '2. Heavy Assault: Vanguard & Artillery',
          content: 'Primary offensive operators controlling long-distance vectors:',
          items: [
            {
              name: 'Vanguard (Yuji & Kenjaku)',
              details: 'Slides 1 to 3 squares in all 8 directions. Captures at distance 2 trigger Black Flash (strikes in place without moving Vanguard). Distance 1 & 3 captures move normally.',
              badge: 'Range 3',
            },
            {
              name: 'Artillery (Mechamaru & Uraume)',
              details: 'Steps 1 square in all 8 directions. Ranged Strike eliminates an enemy piece 2 squares away in 8 directions without moving, if intermediate cell is empty. Disabled by Warden Ratio Field.',
              badge: 'Sniper',
            },
          ],
        },
        {
          title: '3. Tactical Control: Bulwark, Warden & Skirmisher',
          content: 'Defensive barriers and zone-denial operators:',
          items: [
            {
              name: 'Bulwark (Panda & Yorozu)',
              details: 'Knight L-jumps (dx:±1, dy:±2 or dx:±2, dy:±1). Leaps over pieces. Passively carries Shell: first enemy capture attempt fails, stopping attacker on origin and spending their turn.',
              badge: 'Shell',
            },
            {
              name: 'Warden (Nanami & Reggie)',
              details: 'Slides 1 to 3 squares orthogonally (no diagonal moves, no leaps). Radiates Ratio Field: all adjacent enemy units are restricted to max 1 square, and Artillery strikes are disabled.',
              badge: 'Suppression',
            },
            {
              name: 'Skirmisher (Maki & Naoya)',
              details: 'Steps 1 square in 8 directions OR hops 2 squares orthogonally over pieces. Governed by Heavenly Restriction: 100% immune to Warden Ratio Field.',
              badge: 'Leap',
            },
          ],
        },
        {
          title: '4. Hit-and-Run Rusher & Pawn Promotion',
          content: 'Agile flankers and army reinforcement mechanics:',
          items: [
            {
              name: 'Rusher (Hakari & Kurourushi)',
              details: 'Slides up to 2 squares diagonally; steps 1 square orthogonally. Upon capturing an enemy, earns 1 bonus move with the same piece: a 1-square non-capturing step to an unattacked safe square.',
              badge: 'Jackpot',
            },
            {
              name: 'Culling Pawn & Warden Promotion',
              details: 'Steps 1 square forward, captures 1 square diagonally forward (no initial 2-square step, no en passant). Automatically promotes to Warden (Nanami for White, Reggie for Black) upon reaching the file’s far edge.',
              badge: 'Promotion',
            },
          ],
        },
      ],
    },
    strategy: {
      tacticalPrinciples: [
        'Exploit the 5-turn Sovereign immunity to safely advance pawns and establish central presence.',
        'Use the Vanguard Black Flash to eliminate hostile pieces at distance 2 without surrendering defensive squares.',
        'Position the Warden adjacent to enemy heavy pieces to shut down 3-square sliding sweeps and silence Artillery.',
        'Deploy the Skirmisher to assassinate enemy Wardens, taking advantage of its complete immunity to Ratio Field.',
        'Utilize Rusher hit-and-run tactics: capture an exposed unit and immediately retreat with the Jackpot bonus step.',
      ],
      openings: [
        {
          id: 'cross_bastion',
          name: 'Cross Central Bastion (Culling Edition)',
          tagline: 'Locking central corridors with Vanguard vision, Warden suppression, and Sovereign safety',
          boardDimensions: { cols: 8, rows: 8 },
          notationSteps: [
            '1. d3 (Opening central file for Vanguard on d1)',
            '2. e3 (Creating resilient central pawn wedge)',
            '3. Warden to f3 (Orthogonal control suppressing enemy flankers)',
            '4. Vanguard to d4 (Dominating central 3-square cross rays)',
            '5. Artillery to c2 (Stationed Ranged Strike command)',
          ],
          description:
            'A battle-tested formation on the Culling board. By staking an early d3/e3 pawn pyramid, the Vanguard occupies the dominant d4 outpost with 3-square vision, while the Warden on f3 projects Ratio suppression and the Sovereign remains secure.',
          strategicGoals: [
            'Solid d3/e3 central pawn fortress',
            'Vanguard controls 8 radial directions with Black Flash strike-in-place readiness',
            'Warden protects central approaches from enemy sliding sweeps',
            'Safe Sovereign positioning within the home perimeter',
          ],
          keySquares: ['d3', 'e3', 'd4', 'f3', 'c2', 'e1'],
          diagramPieces: [
            { square: 'e1', type: 'culling_gojo', color: 'white' },
            { square: 'd4', type: 'culling_yuji', color: 'white' },
            { square: 'f3', type: 'culling_nanami', color: 'white' },
            { square: 'c2', type: 'culling_mechamaru', color: 'white' },
            { square: 'd3', type: 'pawn', color: 'white' },
            { square: 'e3', type: 'pawn', color: 'white' },
            { square: 'e8', type: 'culling_sukuna', color: 'black' },
            { square: 'd6', type: 'pawn', color: 'black' },
            { square: 'e6', type: 'pawn', color: 'black' },
          ],
          focalSquares: [
            { square: 'd4', variant: 'key', label: 'Vanguard Outpost' },
            { square: 'f3', variant: 'defense', label: 'Warden Suppression' },
            { square: 'e1', variant: 'fortress', label: 'Sovereign Core' },
          ],
        },
      ],
    },
  },

  // ==========================================
  // 4. ROSE PARADISE MODE
  // ==========================================
  {
    id: 'rose',
    title: 'Rose Paradise Mode',
    subtitle: 'Untimed Couples Chess with Rose Petals & Universal Reinforcements',
    badge: 'Couples Mode',
    accentColor: 'rose',
    overview: {
      objective: 'Play a peaceful, unhurried match with your partner or romantic bot; win by gentle checkmate or loving concession.',
      boardGeometry: 'Standard 8×8 grid with elegant romantic theming.',
      armySize: '16 starting units + unlimited summonable allies from the Rose Reserve.',
      timeControl: 'Untimed! No clocks, no timers, and zero time pressure.',
      winConditions: [
        'Romantic Checkmate: Deliver an inescapable checkmate.',
        'Loving Concession: Graciously surrender to your partner.',
      ],
      drawConditions: ['Mutual romantic agreement.'],
      keyHighlights: [
        {
          title: 'Rose Petal Economy & Love Links',
          desc: 'Earn Petals through capturing pieces (+1), delivering checks (+1), or creating a Love Link (+1) by moving your Prince and Queen to adjacent squares (max once per 4 turns).',
        },
        {
          title: 'Summon Reinforcements Anywhere (3 🌹)',
          desc: 'Spend 3 Petals to summon ANY piece (Queen, Rook, Bishop, Knight, Cupid Priest, Thorn Guard, Rose Tower, or Pawn) on ANY empty square on the entire board! Restriction: initial placement cannot deliver direct check.',
        },
        {
          title: 'Peaceful Untimed Deliberation',
          desc: 'No ticking clocks. Chat, send romantic reactions, and analyze positions together at your own pace.',
        },
      ],
    },
    rules: {
      sections: [
        {
          title: '1. Petal Economy & Love Link Triggers',
          content: 'Rose Petals are the lifeblood of the Paradise battlefield:',
          items: [
            {
              name: 'Love Link (+1 🌹)',
              details: 'Whenever your Prince and Queen stand on adjacent squares (orthogonally or diagonally) at the end of your move, you trigger a Love Link and gain +1 Petal.',
              badge: '+1 Petal',
            },
            {
              name: 'Captures & Checks (+1 🌹)',
              details: 'Every enemy capture and every delivered check awards +1 Rose Petal.',
            },
          ],
        },
        {
          title: '2. Universal Summoning Rules (3 🌹)',
          content: 'Summon reinforcements anywhere on the board:',
          items: [
            {
              name: 'Any Empty Square',
              details: 'You can drop your summoned piece on any unoccupied square across the entire 64-square grid.',
              badge: 'Any Square',
            },
            {
              name: 'Non-Check Spawn Invariant',
              details: 'The only restriction is that the initial placement cannot deliver direct check to the opponent King.',
              badge: 'Invariant',
            },
          ],
        },
        {
          title: '3. Legendary Allied Reinforcements',
          content: 'Unique units available in the summon catalog:',
          items: [
            {
              name: 'Cupid Priest 🏹',
              details: 'Slides along diagonals like a bishop + charms and leaps over orthogonal obstacles.',
            },
            {
              name: 'Thorn Guard 🌹',
              details: 'Iron rose communist unit with alternating diagonal zigzags.',
            },
            {
              name: 'Rose Tower 🏰',
              details: 'Bastion supreme rook with sliding and diagonal leaps.',
            },
          ],
        },
      ],
    },
    strategy: {
      tacticalPrinciples: [
        'Prioritize early Love Links to build a petal surplus for mid-game double-summons.',
        'Summon pieces directly behind enemy pawn lines to launch devastating rear-guard attacks.',
        'Keep your Queen and Prince in coordinated proximity to deter enemy infiltrators.',
      ],
      openings: [
        {
          id: 'rose_romantic_gambit',
          name: 'Rose Romantic Gambit',
          tagline: 'Early Prince and Queen rendezvous for rapid Petal harvesting',
          boardDimensions: { cols: 8, rows: 8 },
          notationSteps: [
            '1. e4 (King pawn opens central lanes)',
            '2. d4 (Queen diagonal unsealed)',
            '3. Pe2 (Prince leaps toward the center heart)',
            '4. Qd3 (Queen approaches Prince)',
            '5. Pe3 (Love Link triggered on adjacent squares: +1 Petal!)',
          ],
          description:
            'The Romantic Gambit focuses on triggering Love Links within the first 5 moves. By maneuvering the Prince to e2/e3 and the Queen to d3, they link together to immediately begin compounding Rose Petals.',
          strategicGoals: [
            'Trigger Love Link by Move 5 to bank free petals',
            'Establish uncontested central presence',
            'Bank 3 petals for the first surprise summon',
          ],
          keySquares: ['e4', 'd4', 'e2', 'd3', 'e3'],
          diagramPieces: [
            { square: 'e3', type: 'prince', color: 'white' },
            { square: 'd3', type: 'queen', color: 'white' },
            { square: 'e4', type: 'pawn', color: 'white' },
            { square: 'd4', type: 'pawn', color: 'white' },
            { square: 'e1', type: 'king', color: 'white' },
            { square: 'e7', type: 'pawn', color: 'black' },
            { square: 'd7', type: 'pawn', color: 'black' },
            { square: 'e8', type: 'king', color: 'black' },
          ],
          focalSquares: [
            { square: 'e3', variant: 'key', label: 'Love Link (Prince)' },
            { square: 'd3', variant: 'key', label: 'Love Link (Queen)' },
            { square: 'e4', variant: 'defense', label: 'Pawn Shield' },
          ],
        },
      ],
    },
  },

  // ==========================================
  // 5. HASHIRA TRAINING DOJO MODE
  // ==========================================
  {
    id: 'training',
    title: 'Hashira Training Dojo',
    subtitle: 'Tactical Kata Mastery under Sensei Gensei, Thukuna & Gatoru',
    badge: 'Dojo Mode',
    accentColor: 'orange',
    overview: {
      objective: 'Master tactical chess disciplines across 10 Hashira ranks (Mizunoto to Hashira) through interactive katas and trial matches.',
      boardGeometry: 'Standard 8×8 training board with interactive move vectors and dynamic resize fitting.',
      armySize: 'Kata-specific tactical compositions and trial matches.',
      timeControl: 'Self-paced kata solving with trial match clocks.',
      winConditions: [
        'Complete all multi-step katas in the current rank.',
        'Defeat the Hashira Mentor in the graduation trial match.',
      ],
      drawConditions: ['Kata failure triggers reversible blunder reset.'],
      keyHighlights: [
        {
          title: 'Reversible Blunder Feedback',
          desc: 'Making a tactical error never causes a fatal lockout; Sensei Gensei / Thukuna immediately highlights the blunder and resets to the decision point.',
        },
        {
          title: 'Iron Stance Invariants',
          desc: 'Strict adherence to sound tactical rules: no hanging pieces, verifying opponent replies, and executing clean checkmate combos.',
        },
        {
          title: 'Tactical Debrief Cards',
          desc: 'Post-lesson evaluation calculates tactical accuracy, blunder counts, and predicted rating progression.',
        },
      ],
    },
    rules: {
      sections: [
        {
          title: '1. Kata Progression & Rank Advancement',
          content: 'Training proceeds sequentially through ranks:',
          items: [
            {
              name: 'Rank Ladder',
              details: 'Progress from Mizunoto (Rank 1) through Kanoe, Hinoto, Kinoto, up to the supreme Hashira rank.',
            },
            {
              name: 'Interactive Vector Arrows',
              details: 'Emerald green move vectors guide tactical solutions while navy square accents highlight critical targets.',
            },
          ],
        },
        {
          title: '2. Mentor Trials & Real-Time Debriefs',
          content: 'Test your skills under Grandmaster mentors:',
          items: [
            {
              name: 'Sensei Thukuna & Sensei Gatoru',
              details: 'Mentors provide situational advice, tactical warnings, and post-trial debriefs.',
            },
          ],
        },
      ],
    },
    strategy: {
      tacticalPrinciples: [
        'Always scan for opponent candidate checks and captures before committing to an attack.',
        'Exploit tactical motifs: pins, forks, skewers, discovered attacks, and deflection.',
        'Calculate at least 2 moves deep to avoid walking into counter-pins.',
      ],
      openings: [
        {
          id: 'iron_stance',
          name: 'Hashira Iron Stance Opening',
          tagline: 'Classical center fortification with zero piece-safety compromises',
          boardDimensions: { cols: 8, rows: 8 },
          notationSteps: [
            '1. e4 (Open central lines for queen & bishop)',
            '2. Nf3 (Develop with tempo against enemy e-pawn)',
            '3. Bc4 (Italian bishop eyeing the fragile f7 square)',
            '4. d3 (Solidifying pawn center)',
            '5. O-O (Castling for absolute King safety)',
          ],
          description:
            'The foundational formation taught in the Mizunoto rank. Emphasizes immediate center occupation, rapid minor piece development, and early castling to eliminate tactical blunder vulnerabilities.',
          strategicGoals: [
            'Zero hanging pieces during opening development',
            'Rapid King castling by Move 5',
            'Active diagonals for both bishops aiming at enemy weaknesses',
          ],
          keySquares: ['e4', 'f3', 'c4', 'd3', 'g1'],
          diagramPieces: [
            { square: 'e4', type: 'pawn', color: 'white' },
            { square: 'd3', type: 'pawn', color: 'white' },
            { square: 'f3', type: 'knight', color: 'white' },
            { square: 'c4', type: 'bishop', color: 'white' },
            { square: 'g1', type: 'king', color: 'white' },
            { square: 'f1', type: 'rook', color: 'white' },
            { square: 'e5', type: 'pawn', color: 'black' },
            { square: 'c6', type: 'knight', color: 'black' },
            { square: 'e8', type: 'king', color: 'black' },
          ],
          focalSquares: [
            { square: 'c4', variant: 'attack', label: 'Sniper Bishop' },
            { square: 'f7', variant: 'attack', label: 'Tactical Weakness' },
            { square: 'g1', variant: 'fortress', label: 'Castled King' },
          ],
        },
      ],
    },
  },

  // ==========================================
  // 6. MULTIPLAYER CHALLENGES & RULES
  // ==========================================
  {
    id: 'multiplayer',
    title: 'Multiplayer Matches',
    subtitle: 'Real-time Peer-to-Peer Matches & Dynamic Board Expansion',
    badge: 'Multiplayer Mode',
    accentColor: 'purple',
    overview: {
      objective: 'Compete against other human players online in authoritative real-time matches with dynamic board expansion.',
      boardGeometry: 'Begins at standard 8×8 and dynamically expands up to 10×8 after Move 10.',
      armySize: '16 pieces per player with optional crafting rule toggle.',
      timeControl: '5 minutes or 2 minutes blitz with server-authoritative clock synchronization.',
      winConditions: [
        'Checkmate: Capture the opponent King.',
        'Timeout: Opponent runs out of time.',
        'Resignation: Opponent resigns.',
      ],
      drawConditions: ['Stalemate', '3-fold repetition', 'Mutual draw agreement.'],
      keyHighlights: [
        {
          title: 'Dynamic Board Expansion (Move 10)',
          desc: 'After both players complete 10 moves, an expansion vote triggers! The board can expand left, right, or both, adding files i and j to the battlefield.',
        },
        {
          title: 'Authoritative Server Move Validation',
          desc: 'All moves, dice rolls, and timers are verified by the server WebSocket to eliminate desynchronization and ensure tournament fairness.',
        },
        {
          title: 'Match-Level Crafting Toggle',
          desc: 'Challenges can be created with Crafting: Enabled or Avoid Crafting based on match rules.',
        },
      ],
    },
    rules: {
      sections: [
        {
          title: '1. Dynamic Board Expansion System',
          content: 'At Move 10, the board expands dynamically based on player choices:',
          items: [
            {
              name: 'Expansion Voting',
              details: 'Each player selects Left, Right, Both, or None. The board geometry instantly updates, creating new tactical columns for rooks and queens.',
              badge: 'Move 10',
            },
            {
              name: 'Newly Opened Squares',
              details: 'Pieces can immediately move into the expanded flank columns on subsequent turns.',
            },
          ],
        },
        {
          title: '2. Real-Time Network & Reconnect Rules',
          content: 'Fair play safeguards for online multiplayer matches:',
          items: [
            {
              name: 'Disconnect Grace Period',
              details: 'Players have a 60-second window to reconnect if their internet drops without instantly forfeiting.',
            },
            {
              name: 'Server-Authoritative Clock',
              details: 'Clocks run on server time to eliminate client lag tampering.',
            },
          ],
        },
      ],
    },
    strategy: {
      tacticalPrinciples: [
        'Position your rooks on the edge files before Move 10 to instantly seize control of expanded columns i and j.',
        'Use the expansion phase to relieve cramped back-rank pieces.',
        'Manage your match clock strictly—blitz time pressure causes blunders in expanded territory.',
      ],
      openings: [
        {
          id: 'expansion_anticipation',
          name: 'Expansion Anticipation System',
          tagline: 'Positioning back-rank batteries to exploit Move-10 lateral board expansion',
          boardDimensions: { cols: 8, rows: 8 },
          notationSteps: [
            '1. e4 (Standard center opening)',
            '2. Nf3 (Knight development)',
            '3. h3 (Clearing the h-file for future flank expansion)',
            '4. a3 (Clearing the a-file for lateral mobility)',
            '5. Ra2 / Rh2 (Pre-loading rooks for outer expanded columns)',
          ],
          description:
            'Prepares specifically for the Move 10 board expansion by positioning rooks on the outermost edge files, allowing them to instantly dominate the newly opened files i and j when the board expands.',
          strategicGoals: [
            'Instant dominance over newly created flank squares',
            'Surprise long-range rook batteries firing along expanded files',
            'Denying the opponent lateral counter-play',
          ],
          keySquares: ['a1', 'h1', 'a2', 'h2', 'e4'],
          diagramPieces: [
            { square: 'e4', type: 'pawn', color: 'white' },
            { square: 'f3', type: 'knight', color: 'white' },
            { square: 'a2', type: 'rook', color: 'white' },
            { square: 'h2', type: 'rook', color: 'white' },
            { square: 'e1', type: 'king', color: 'white' },
            { square: 'e5', type: 'pawn', color: 'black' },
            { square: 'e8', type: 'king', color: 'black' },
          ],
          focalSquares: [
            { square: 'a2', variant: 'attack', label: 'Expansion Battery (Left)' },
            { square: 'h2', variant: 'attack', label: 'Expansion Battery (Right)' },
          ],
        },
      ],
    },
  },
];

export function getRulebookDataByMode(mode: string): ModeRulebookData {
  const found = RULEBOOK_MODES.find((m) => m.id === mode);
  return found || RULEBOOK_MODES[0];
}
