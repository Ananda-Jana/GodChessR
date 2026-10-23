import React from 'react';
import { PieceType, PieceColor, CullingPieceType } from '../types/game';
import { ChessPieceRetro } from '../components/ChessPieceRetro';

export interface ChessPieceProps {
  type: PieceType | CullingPieceType;
  color: PieceColor;
  className?: string;
}

/**
 * Re-export of the Retro / Playing-Card character art chess pieces
 * used specifically for Rose Paradise and vintage card aesthetics.
 */
export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className }) => {
  return <ChessPieceRetro type={type} color={color} className={className} />;
};

export const ChessPieceRose = ChessPiece;
