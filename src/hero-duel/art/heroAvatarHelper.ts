import { HeroPiece, HeroPieceType, HERO_INFO, PieceColor } from './HeroPiecex';

export function heroIdToPieceType(heroId: string): HeroPieceType {
  switch (heroId) {
    case 'mugen-king': return 'mugenKing';
    case 'malevolent-priest': return 'shrinePriest';
    case 'dr-methanogenic': return 'methanogenic';
    case 'captain-englland': return 'englland';
    case 'ajx-assassin': return 'ajx';
    case 'yjkstra-pathfinder': return 'yjkstra';
    case 'ironclad-warden': return 'ironcladWarden';
    case 'black-monkey': return 'blackMonkey';
    case 'part-king-kong': return 'partyKingKong';
    default: return 'mugenKing';
  }
}

export { HeroPiece, HERO_INFO };
export type { HeroPieceType };
