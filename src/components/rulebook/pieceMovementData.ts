import { PieceType, PieceColor } from '../../types/game';
import { CullingPieceType } from '../../types/cullingGame';

export type PieceCategory = 'standard' | 'crafted' | 'culling' | 'rose';

export interface PieceMovementOffset {
  dx: number;
  dy: number;
  isLeap?: boolean;
  isAbility?: boolean;
  label?: string;
}

export interface PieceMovementDef {
  id: string;
  name: string;
  category: PieceCategory;
  modeBadge: string;
  pieceType: string;
  pieceColor: PieceColor;
  canLeap: boolean;
  leapType?: 'knight' | 'orthogonal_2' | 'diagonal_2' | 'zigzag' | 'unrestricted';
  leapDescription?: string;
  hasSpecialAbility: boolean;
  abilityName?: string;
  abilityDescription?: string;
  description: string;
  movementText: string;
  gridSize?: number; // 9 for standard, 7 for compact
  getOffsets: () => PieceMovementOffset[];
}

export const ALL_PIECE_MOVEMENTS: PieceMovementDef[] = [
  // ==========================================
  // CRAFTED SPECIALS
  // ==========================================
  {
    id: 'communist',
    name: 'Communist',
    category: 'crafted',
    modeBadge: 'Crafted Mode',
    pieceType: 'communist',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'zigzag',
    leapDescription: 'Zigzags along 4 orthogonal lines (offsets ±2, ±4). Valid as long as at least one zigzag branch path is clear.',
    hasSpecialAbility: false,
    description: 'Exotic crafted unit replacing Bishops. Moves in an alternating diagonal zigzag pattern along orthogonal vectors.',
    movementText: 'Zigzags ±2 or ±4 squares orthogonally via diagonal alternation. Can leap past single intervening units.',
    gridSize: 9,
    getOffsets: () => [
      // ±2 and ±4 offsets with alternating diagonal deviation
      { dx: 2, dy: 1, isLeap: true },
      { dx: 2, dy: -1, isLeap: true },
      { dx: -2, dy: 1, isLeap: true },
      { dx: -2, dy: -1, isLeap: true },
      { dx: 1, dy: 2, isLeap: true },
      { dx: -1, dy: 2, isLeap: true },
      { dx: 1, dy: -2, isLeap: true },
      { dx: -1, dy: -2, isLeap: true },
      { dx: 4, dy: 1, isLeap: true },
      { dx: 4, dy: -1, isLeap: true },
      { dx: -4, dy: 1, isLeap: true },
      { dx: -4, dy: -1, isLeap: true },
      { dx: 1, dy: 4, isLeap: true },
      { dx: -1, dy: 4, isLeap: true },
      { dx: 1, dy: -4, isLeap: true },
      { dx: -1, dy: -4, isLeap: true },
    ],
  },
  {
    id: 'supremeRook',
    name: 'Supreme Rook',
    category: 'crafted',
    modeBadge: 'Crafted Mode',
    pieceType: 'supremeRook',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'diagonal_2',
    leapDescription: 'Leaps exactly 2 squares diagonally over any intervening pieces, bypassing pawn barriers.',
    hasSpecialAbility: true,
    abilityName: 'Diagonal Bastion Leap',
    abilityDescription: 'Unlimited orthogonal slides + 2-square diagonal leaps over friendly or enemy units.',
    description: 'Crafted fortress rook replacing a standard Rook in Crafted Mode.',
    movementText: 'Slides any distance orthogonally (blocked by pieces) AND leaps exactly 2 squares diagonally over pieces.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      // Orthogonal slides (1-4)
      const orthos = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
      orthos.forEach(d => {
        for (let r = 1; r <= 4; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r, isLeap: false });
      });
      // 2-square diagonal leaps (jumps over pieces)
      offsets.push(
        { dx: 2, dy: 2, isLeap: true, isAbility: true },
        { dx: 2, dy: -2, isLeap: true, isAbility: true },
        { dx: -2, dy: 2, isLeap: true, isAbility: true },
        { dx: -2, dy: -2, isLeap: true, isAbility: true }
      );
      return offsets;
    },
  },
  {
    id: 'priest',
    name: 'Priest',
    category: 'crafted',
    modeBadge: 'Crafted Mode',
    pieceType: 'priest',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'orthogonal_2',
    leapDescription: 'Leaps exactly 2 squares orthogonally over any intervening units, directly bypassing pawn chains.',
    hasSpecialAbility: true,
    abilityName: 'Orthogonal Holy Leap',
    abilityDescription: 'Diagonal slides up to 3 squares + 2-square orthogonal leaps over friendly or enemy pieces.',
    description: 'Crafted sniper piece replacing Knights in Crafted Mode.',
    movementText: 'Slides 1–3 squares diagonally (blocked by pieces) AND leaps exactly 2 squares orthogonally (jumps over pieces).',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      // Diagonal slides (1-3)
      const diags = [{ dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }];
      diags.forEach(d => {
        for (let r = 1; r <= 3; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r, isLeap: false });
      });
      // 2-square orthogonal leaps (jumps over pieces)
      offsets.push(
        { dx: 0, dy: 2, isLeap: true, isAbility: true },
        { dx: 0, dy: -2, isLeap: true, isAbility: true },
        { dx: 2, dy: 0, isLeap: true, isAbility: true },
        { dx: -2, dy: 0, isLeap: true, isAbility: true }
      );
      return offsets;
    },
  },

  // ==========================================
  // STANDARD & PRINCE
  // ==========================================
  {
    id: 'prince',
    name: 'The Prince',
    category: 'standard',
    modeBadge: 'Standard / Crafted',
    pieceType: 'prince',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'knight',
    leapDescription: 'Leaps 2 squares orthogonally or diagonally like a noble knight-king hybrid, clearing friendly pawns safely.',
    hasSpecialAbility: true,
    abilityName: 'Royal Vanguard Hop',
    abilityDescription: 'Knight L-shape leap (2x1) OR 1–4 diagonal slide. Un-checked jumping over intervening units.',
    description: 'Unique corner noble piece starting at h1 (White) and a8 (Black). Cannot leap when delivering check.',
    movementText: 'Knight L-shape leap (2x1) OR 1–4 diagonal slide. Can leap over pieces when moving 2 squares.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const knightLeaps = [
        { dx: 1, dy: 2 }, { dx: 2, dy: 1 }, { dx: 2, dy: -1 }, { dx: 1, dy: -2 },
        { dx: -1, dy: -2 }, { dx: -2, dy: -1 }, { dx: -2, dy: 1 }, { dx: -1, dy: 2 }
      ];
      knightLeaps.forEach(l => offsets.push({ ...l, isLeap: true }));
      const diags = [{ dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }];
      diags.forEach(d => {
        for (let r = 1; r <= 4; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r, isLeap: false });
      });
      // King steps
      const kingSteps = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }
      ];
      kingSteps.forEach(s => offsets.push({ ...s, isLeap: false }));
      return offsets;
    },
  },
  {
    id: 'knight',
    name: 'Knight',
    category: 'standard',
    modeBadge: 'Standard Chess',
    pieceType: 'knight',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'knight',
    leapDescription: 'The classic chess leaper. Jumps in a 2x1 L-shape over any intervening piece on the board.',
    hasSpecialAbility: false,
    description: 'Standard cavalry piece. Can leap over friendly and enemy pieces alike.',
    movementText: 'Jumps in a 2×1 L-shape pattern. Completely ignores all pieces standing in between.',
    gridSize: 9,
    getOffsets: () => [
      { dx: 1, dy: 2, isLeap: true }, { dx: 2, dy: 1, isLeap: true },
      { dx: 2, dy: -1, isLeap: true }, { dx: 1, dy: -2, isLeap: true },
      { dx: -1, dy: -2, isLeap: true }, { dx: -2, dy: -1, isLeap: true },
      { dx: -2, dy: 1, isLeap: true }, { dx: -1, dy: 2, isLeap: true },
    ],
  },
  {
    id: 'queen',
    name: 'Queen',
    category: 'standard',
    modeBadge: 'All Modes',
    pieceType: 'queen',
    pieceColor: 'white',
    canLeap: false,
    hasSpecialAbility: false,
    description: 'The supreme slider. Controls orthogonal and diagonal lines across the entire board.',
    movementText: 'Slides any distance in all 8 directions until blocked by a piece.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ];
      dirs.forEach(d => {
        for (let r = 1; r <= 4; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r, isLeap: false });
      });
      return offsets;
    },
  },
  {
    id: 'rook',
    name: 'Rook',
    category: 'standard',
    modeBadge: 'Standard Chess',
    pieceType: 'rook',
    pieceColor: 'white',
    canLeap: false,
    hasSpecialAbility: false,
    description: 'Heavy orthogonal piece commanding ranks and files.',
    movementText: 'Slides unlimited squares orthogonally (horizontal & vertical).',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
      dirs.forEach(d => {
        for (let r = 1; r <= 4; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r, isLeap: false });
      });
      return offsets;
    },
  },
  {
    id: 'bishop',
    name: 'Bishop',
    category: 'standard',
    modeBadge: 'Standard Chess',
    pieceType: 'bishop',
    pieceColor: 'white',
    canLeap: false,
    hasSpecialAbility: false,
    description: 'Long-range diagonal slider tied to its starting square color.',
    movementText: 'Slides unlimited squares diagonally until blocked.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [{ dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }];
      dirs.forEach(d => {
        for (let r = 1; r <= 4; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r, isLeap: false });
      });
      return offsets;
    },
  },

  // ==========================================
  // CULLING GAME SORCERERS (Strictly synchronized with cullingEngine.ts & CullingTheoryView.tsx)
  // ==========================================
  {
    id: 'culling_gojo',
    name: 'Satoru Gojo (Sovereign)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_gojo',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'orthogonal_2',
    leapDescription: 'Domain Step (Once per match): Leaps exactly 2 squares in any of 8 straight or diagonal lines over intervening units to an unattacked empty square.',
    hasSpecialAbility: true,
    abilityName: 'Domain Step & 5-Turn Immunity',
    abilityDescription: 'Moves 1 step in all 8 directions. Sovereign has total capture/check immunity during first 5 turns. Once per game: Domain Step leap to unattacked cell when not in check.',
    description: 'White Sovereign piece. Omnidirectional single-step movement with an emergency tactical leap evasion.',
    movementText: 'Steps 1 square in all 8 directions (king geometry). Once per match: leaps 2 squares to empty, unattacked square when not in check.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      // 1-step King moves
      const dirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ];
      dirs.forEach(d => offsets.push({ dx: d.dx, dy: d.dy, isLeap: false }));
      // 8 Domain Step leap targets (distance 2)
      dirs.forEach(d => {
        offsets.push({ dx: d.dx * 2, dy: d.dy * 2, isLeap: true, isAbility: true, label: 'Domain' });
      });
      return offsets;
    },
  },
  {
    id: 'culling_sukuna',
    name: 'Ryomen Sukuna (Sovereign)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_sukuna',
    pieceColor: 'black',
    canLeap: true,
    leapType: 'orthogonal_2',
    leapDescription: 'Domain Step (Once per match): Leaps exactly 2 squares in any of 8 straight or diagonal lines over intervening units to an unattacked empty square.',
    hasSpecialAbility: true,
    abilityName: 'Domain Step & 5-Turn Immunity',
    abilityDescription: 'Moves 1 step in all 8 directions. Sovereign has total capture/check immunity during first 5 turns. Once per game: Domain Step leap to unattacked cell when not in check.',
    description: 'Black Sovereign piece. Omnidirectional single-step movement with an emergency tactical leap evasion.',
    movementText: 'Steps 1 square in all 8 directions (king geometry). Once per match: leaps 2 squares to empty, unattacked square when not in check.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ];
      dirs.forEach(d => offsets.push({ dx: d.dx, dy: d.dy, isLeap: false }));
      dirs.forEach(d => {
        offsets.push({ dx: d.dx * 2, dy: d.dy * 2, isLeap: true, isAbility: true, label: 'Domain' });
      });
      return offsets;
    },
  },
  {
    id: 'culling_yuji',
    name: 'Yuji Itadori (Vanguard)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_yuji',
    pieceColor: 'white',
    canLeap: false,
    hasSpecialAbility: true,
    abilityName: 'Black Flash (Strike in Place)',
    abilityDescription: 'Slides 1 to 3 squares in all 8 directions (queen geometry, range 3, no leaps). Capturing an enemy at distance 2 in a straight/diagonal line strikes in place without moving Vanguard.',
    description: 'White Vanguard piece. Dominates open files and central corridors with 3-square sliding sweeps and stationary Black Flash.',
    movementText: 'Slides up to 3 squares in all 8 directions (no leaping). Distance 2 captures strike in place (Vanguard stays on square).',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ];
      dirs.forEach(d => {
        for (let r = 1; r <= 3; r++) {
          offsets.push({
            dx: d.dx * r,
            dy: d.dy * r,
            isLeap: false,
            isAbility: r === 2,
            label: r === 2 ? 'Flash' : undefined,
          });
        }
      });
      return offsets;
    },
  },
  {
    id: 'culling_kenjaku',
    name: 'Kenjaku (Vanguard)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_kenjaku',
    pieceColor: 'black',
    canLeap: false,
    hasSpecialAbility: true,
    abilityName: 'Black Flash (Strike in Place)',
    abilityDescription: 'Slides 1 to 3 squares in all 8 directions (queen geometry, range 3, no leaps). Capturing an enemy at distance 2 strikes in place without moving Kenjaku.',
    description: 'Black Vanguard piece. Dominates open files and central corridors with 3-square sliding sweeps and stationary Black Flash.',
    movementText: 'Slides up to 3 squares in all 8 directions (no leaping). Distance 2 captures strike in place.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ];
      dirs.forEach(d => {
        for (let r = 1; r <= 3; r++) {
          offsets.push({
            dx: d.dx * r,
            dy: d.dy * r,
            isLeap: false,
            isAbility: r === 2,
            label: r === 2 ? 'Flash' : undefined,
          });
        }
      });
      return offsets;
    },
  },
  {
    id: 'culling_mechamaru',
    name: 'Kokichi Muta / Mechamaru (Artillery)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_mechamaru',
    pieceColor: 'white',
    canLeap: false,
    hasSpecialAbility: true,
    abilityName: 'Stationary Ranged Strike',
    abilityDescription: 'Moves 1 step in all 8 directions. Removes an enemy exactly 2 squares away in 8 directions without moving, if intermediate cell is empty. Disabled by Warden Ratio Field.',
    description: 'White Artillery piece. Provides stationary ranged sniping against advancing hostiles.',
    movementText: 'Steps 1 square in all 8 directions + Stationary Ranged Strike at distance 2 with empty middle square.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ];
      dirs.forEach(d => offsets.push({ dx: d.dx, dy: d.dy, isLeap: false }));
      dirs.forEach(d => {
        offsets.push({ dx: d.dx * 2, dy: d.dy * 2, isAbility: true, label: 'Snipe' });
      });
      return offsets;
    },
  },
  {
    id: 'culling_uraume',
    name: 'Uraume (Artillery)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_uraume',
    pieceColor: 'black',
    canLeap: false,
    hasSpecialAbility: true,
    abilityName: 'Stationary Ranged Strike',
    abilityDescription: 'Moves 1 step in all 8 directions. Removes an enemy exactly 2 squares away in 8 directions without moving, if intermediate cell is empty. Disabled by Warden Ratio Field.',
    description: 'Black Artillery piece. Provides stationary ranged sniping against advancing hostiles.',
    movementText: 'Steps 1 square in all 8 directions + Stationary Ranged Strike at distance 2 with empty middle square.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ];
      dirs.forEach(d => offsets.push({ dx: d.dx, dy: d.dy, isLeap: false }));
      dirs.forEach(d => {
        offsets.push({ dx: d.dx * 2, dy: d.dy * 2, isAbility: true, label: 'Snipe' });
      });
      return offsets;
    },
  },
  {
    id: 'culling_panda',
    name: 'Panda (Bulwark)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_panda',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'knight',
    leapDescription: 'Knight L-jumps (dx:±1, dy:±2 or dx:±2, dy:±1). Leaps over all intervening friendly or enemy pieces.',
    hasSpecialAbility: true,
    abilityName: 'Shell Hardening Barrier',
    abilityDescription: 'First enemy capture attempt fails completely: attacker is halted on origin square, shell breaks, and enemy turn ends immediately.',
    description: 'White Bulwark piece. Knight leaping geometry with a one-time damage-absorption shell that wastes an enemy turn.',
    movementText: 'Knight L-jumps (8 directions). Leaps over pieces. First enemy capture attempt fails completely.',
    gridSize: 9,
    getOffsets: () => [
      { dx: 1, dy: 2, isLeap: true }, { dx: 2, dy: 1, isLeap: true },
      { dx: 2, dy: -1, isLeap: true }, { dx: 1, dy: -2, isLeap: true },
      { dx: -1, dy: -2, isLeap: true }, { dx: -2, dy: -1, isLeap: true },
      { dx: -2, dy: 1, isLeap: true }, { dx: -1, dy: 2, isLeap: true },
    ],
  },
  {
    id: 'culling_yorozu',
    name: 'Yorozu (Bulwark)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_yorozu',
    pieceColor: 'black',
    canLeap: true,
    leapType: 'knight',
    leapDescription: 'Knight L-jumps (dx:±1, dy:±2 or dx:±2, dy:±1). Leaps over all intervening friendly or enemy pieces.',
    hasSpecialAbility: true,
    abilityName: 'Shell Hardening Barrier',
    abilityDescription: 'First enemy capture attempt fails completely: attacker is halted on origin square, shell breaks, and enemy turn ends immediately.',
    description: 'Black Bulwark piece. Knight leaping geometry with a one-time damage-absorption shell.',
    movementText: 'Knight L-jumps (8 directions). Leaps over pieces. First enemy capture attempt fails completely.',
    gridSize: 9,
    getOffsets: () => [
      { dx: 1, dy: 2, isLeap: true }, { dx: 2, dy: 1, isLeap: true },
      { dx: 2, dy: -1, isLeap: true }, { dx: 1, dy: -2, isLeap: true },
      { dx: -1, dy: -2, isLeap: true }, { dx: -2, dy: -1, isLeap: true },
      { dx: -2, dy: 1, isLeap: true }, { dx: -1, dy: 2, isLeap: true },
    ],
  },
  {
    id: 'culling_nanami',
    name: 'Kento Nanami (Warden)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_nanami',
    pieceColor: 'white',
    canLeap: false,
    hasSpecialAbility: true,
    abilityName: 'Ratio Field Suppression',
    abilityDescription: 'Slides up to 3 squares orthogonally (no diagonal moves, no leaps). Radiates Ratio Field: all adjacent enemy units are restricted to 1 square max, and Artillery strikes are disabled. Skirmishers are immune.',
    description: 'White Warden piece. Orthogonal slider with a paralyzing close-quarters suppression aura.',
    movementText: 'Slides 1–3 squares orthogonally (ranks/files). Radiates Ratio Field suppressing adjacent enemy units.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const orthos = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
      orthos.forEach(d => {
        for (let r = 1; r <= 3; r++) {
          offsets.push({
            dx: d.dx * r,
            dy: d.dy * r,
            isLeap: false,
            isAbility: false,
          });
        }
      });
      return offsets;
    },
  },
  {
    id: 'culling_reggie',
    name: 'Reggie Star (Warden)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_reggie',
    pieceColor: 'black',
    canLeap: false,
    hasSpecialAbility: true,
    abilityName: 'Ratio Field Suppression',
    abilityDescription: 'Slides up to 3 squares orthogonally (no diagonal moves, no leaps). Radiates Ratio Field: all adjacent enemy units are restricted to 1 square max, and Artillery strikes are disabled. Skirmishers are immune.',
    description: 'Black Warden piece. Orthogonal slider with a paralyzing close-quarters suppression aura.',
    movementText: 'Slides 1–3 squares orthogonally (ranks/files). Radiates Ratio Field suppressing adjacent enemy units.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const orthos = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
      orthos.forEach(d => {
        for (let r = 1; r <= 3; r++) {
          offsets.push({
            dx: d.dx * r,
            dy: d.dy * r,
            isLeap: false,
            isAbility: false,
          });
        }
      });
      return offsets;
    },
  },
  {
    id: 'culling_maki',
    name: 'Maki Zenin (Skirmisher)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_maki',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'orthogonal_2',
    leapDescription: 'Hops exactly 2 squares orthogonally (ranks/files) leaping over intervening friendly or enemy pieces.',
    hasSpecialAbility: true,
    abilityName: 'Heavenly Restriction & Orthogonal Leap',
    abilityDescription: 'Steps 1 square in all 8 directions OR hops 2 squares orthogonally over pieces. 100% immune to Warden Ratio Field suppression.',
    description: 'White Skirmisher piece. Agile frontline infiltrator that ignores enemy suppression auras.',
    movementText: 'Steps 1 square in 8 directions OR hops 2 squares orthogonally over pieces. Immune to Ratio Field.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ];
      dirs.forEach(d => offsets.push({ dx: d.dx, dy: d.dy, isLeap: false }));
      // 2-square orthogonal leaps
      offsets.push(
        { dx: 0, dy: 2, isLeap: true, isAbility: true, label: 'Hop' },
        { dx: 0, dy: -2, isLeap: true, isAbility: true, label: 'Hop' },
        { dx: 2, dy: 0, isLeap: true, isAbility: true, label: 'Hop' },
        { dx: -2, dy: 0, isLeap: true, isAbility: true, label: 'Hop' }
      );
      return offsets;
    },
  },
  {
    id: 'culling_naoya',
    name: 'Naoya Zenin (Skirmisher)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_naoya',
    pieceColor: 'black',
    canLeap: true,
    leapType: 'orthogonal_2',
    leapDescription: 'Hops exactly 2 squares orthogonally (ranks/files) leaping over intervening friendly or enemy pieces.',
    hasSpecialAbility: true,
    abilityName: 'Heavenly Restriction & Orthogonal Leap',
    abilityDescription: 'Steps 1 square in all 8 directions OR hops 2 squares orthogonally over pieces. 100% immune to Warden Ratio Field suppression.',
    description: 'Black Skirmisher piece. Agile frontline infiltrator that ignores enemy suppression auras.',
    movementText: 'Steps 1 square in 8 directions OR hops 2 squares orthogonally over pieces. Immune to Ratio Field.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      const dirs = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ];
      dirs.forEach(d => offsets.push({ dx: d.dx, dy: d.dy, isLeap: false }));
      offsets.push(
        { dx: 0, dy: 2, isLeap: true, isAbility: true, label: 'Hop' },
        { dx: 0, dy: -2, isLeap: true, isAbility: true, label: 'Hop' },
        { dx: 2, dy: 0, isLeap: true, isAbility: true, label: 'Hop' },
        { dx: -2, dy: 0, isLeap: true, isAbility: true, label: 'Hop' }
      );
      return offsets;
    },
  },
  {
    id: 'culling_hakari',
    name: 'Kinji Hakari (Rusher)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_hakari',
    pieceColor: 'white',
    canLeap: false,
    hasSpecialAbility: true,
    abilityName: 'Idle Death Gamble (Jackpot Bonus Move)',
    abilityDescription: 'Slides up to 2 squares diagonally (no leaping); steps 1 square orthogonally. Upon capturing an enemy, earns 1 bonus move with the same piece: a 1-square non-capturing step to an unattacked safe square.',
    description: 'White Rusher piece. Hit-and-run assassin that retreats immediately after executing a capture.',
    movementText: 'Slides 1–2 squares diagonally, 1 step orthogonally. Capturing grants 1-square safe Jackpot bonus move.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      // 1-step orthogonal
      offsets.push(
        { dx: 0, dy: 1, isLeap: false }, { dx: 0, dy: -1, isLeap: false },
        { dx: 1, dy: 0, isLeap: false }, { dx: -1, dy: 0, isLeap: false }
      );
      // 1-2 diagonal slides
      const diags = [{ dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }];
      diags.forEach(d => {
        offsets.push({ dx: d.dx, dy: d.dy, isLeap: false });
        offsets.push({ dx: d.dx * 2, dy: d.dy * 2, isLeap: false, isAbility: true, label: 'Slide' });
      });
      return offsets;
    },
  },
  {
    id: 'culling_kurourushi',
    name: 'Kurourushi (Rusher)',
    category: 'culling',
    modeBadge: 'Culling Game',
    pieceType: 'culling_kurourushi',
    pieceColor: 'black',
    canLeap: false,
    hasSpecialAbility: true,
    abilityName: 'Idle Death Gamble (Jackpot Bonus Move)',
    abilityDescription: 'Slides up to 2 squares diagonally (no leaping); steps 1 square orthogonally. Upon capturing an enemy, earns 1 bonus move with the same piece: a 1-square non-capturing step to an unattacked safe square.',
    description: 'Black Rusher piece. Hit-and-run assassin that retreats immediately after executing a capture.',
    movementText: 'Slides 1–2 squares diagonally, 1 step orthogonally. Capturing grants 1-square safe Jackpot bonus move.',
    gridSize: 9,
    getOffsets: () => {
      const offsets: PieceMovementOffset[] = [];
      offsets.push(
        { dx: 0, dy: 1, isLeap: false }, { dx: 0, dy: -1, isLeap: false },
        { dx: 1, dy: 0, isLeap: false }, { dx: -1, dy: 0, isLeap: false }
      );
      const diags = [{ dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }];
      diags.forEach(d => {
        offsets.push({ dx: d.dx, dy: d.dy, isLeap: false });
        offsets.push({ dx: d.dx * 2, dy: d.dy * 2, isLeap: false, isAbility: true, label: 'Slide' });
      });
      return offsets;
    },
  },

  // ==========================================
  // ROSE PARADISE SPECIAL ALLIES
  // ==========================================
  {
    id: 'cupid_priest',
    name: 'Cupid Priest',
    category: 'rose',
    modeBadge: 'Rose Paradise',
    pieceType: 'priest',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'orthogonal_2',
    leapDescription: 'Angel of Hearts leaping 2 squares orthogonally over opposing units.',
    hasSpecialAbility: true,
    abilityName: 'Charming Angel Arrow',
    abilityDescription: 'Diagonal slide + orthogonal leaping hops that charm adjacent enemy pawns.',
    description: 'Romantic ally summoned via Rose Petals.',
    movementText: 'Slides 1–3 squares diagonally AND leaps 2 squares orthogonally over obstacles.',
    gridSize: 9,
    getOffsets: () => [
      { dx: 1, dy: 1, isLeap: false }, { dx: 2, dy: 2, isLeap: false }, { dx: 3, dy: 3, isLeap: false },
      { dx: -1, dy: -1, isLeap: false }, { dx: -2, dy: -2, isLeap: false }, { dx: -3, dy: -3, isLeap: false },
      { dx: 1, dy: -1, isLeap: false }, { dx: 2, dy: -2, isLeap: false }, { dx: 3, dy: -3, isLeap: false },
      { dx: -1, dy: 1, isLeap: false }, { dx: -2, dy: 2, isLeap: false }, { dx: -3, dy: 3, isLeap: false },
      { dx: 0, dy: 2, isLeap: true, isAbility: true },
      { dx: 0, dy: -2, isLeap: true, isAbility: true },
      { dx: 2, dy: 0, isLeap: true, isAbility: true },
      { dx: -2, dy: 0, isLeap: true, isAbility: true },
    ],
  },
  {
    id: 'thorn_guard',
    name: 'Thorn Guard',
    category: 'rose',
    modeBadge: 'Rose Paradise',
    pieceType: 'communist',
    pieceColor: 'white',
    canLeap: true,
    leapType: 'zigzag',
    leapDescription: 'Iron Rose hopping in alternating zigzag trajectories over defensive lines.',
    hasSpecialAbility: false,
    description: 'Thorn defense guardian summoned via Rose Petals.',
    movementText: 'Zigzags ±2 or ±4 squares along orthogonal vectors via diagonal branches.',
    gridSize: 9,
    getOffsets: () => [
      { dx: 2, dy: 1, isLeap: true }, { dx: 2, dy: -1, isLeap: true },
      { dx: -2, dy: 1, isLeap: true }, { dx: -2, dy: -1, isLeap: true },
      { dx: 1, dy: 2, isLeap: true }, { dx: -1, dy: 2, isLeap: true },
      { dx: 1, dy: -2, isLeap: true }, { dx: -1, dy: -2, isLeap: true },
    ],
  },
];

export const LEAPING_PIECES = ALL_PIECE_MOVEMENTS.filter(p => p.canLeap);
export const SPECIAL_ABILITY_PIECES = ALL_PIECE_MOVEMENTS.filter(p => p.hasSpecialAbility);
