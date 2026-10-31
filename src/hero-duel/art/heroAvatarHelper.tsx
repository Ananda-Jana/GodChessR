import React, { useState, useEffect } from 'react';
import { HeroPiece as HeroPieceClassic, HeroPieceType, HERO_INFO, PieceColor } from './HeroPiecex';
import { HeroPiece as HeroPieceFaceted } from './HeroPiecexNewTheme';
import { getPieceTheme, subscribePieceTheme, PieceTheme } from './themeStore';

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

export interface HeroPieceWrapperProps {
  type: HeroPieceType;
  color: PieceColor;
  className?: string;
  theme?: PieceTheme;
}

export const HeroPiece: React.FC<HeroPieceWrapperProps> = (props) => {
  const [activeTheme, setActiveTheme] = useState<PieceTheme>(props.theme || getPieceTheme());

  useEffect(() => {
    if (props.theme) {
      setActiveTheme(props.theme);
      return;
    }
    return subscribePieceTheme(() => {
      setActiveTheme(getPieceTheme());
    });
  }, [props.theme]);

  const targetTheme = props.theme || activeTheme;

  if (targetTheme === 'faceted') {
    return <HeroPieceFaceted type={props.type} color={props.color} className={props.className} />;
  }

  return <HeroPieceClassic type={props.type} color={props.color} className={props.className} />;
};

export { HERO_INFO, getPieceTheme, subscribePieceTheme };
export type { HeroPieceType, PieceTheme };
