import React from 'react';
import { PieceType, PieceColor, CullingPieceType, PieceTheme } from '../types/game';
import { ChessPieceClassic } from './ChessPieceClassic';
import { ChessPieceRetro } from './ChessPieceRetro';

export interface ChessPieceProps {
  type: PieceType | CullingPieceType;
  color: PieceColor;
  theme?: PieceTheme;
  className?: string;
}

/**
 * Unified Chess Piece Dispatcher Component
 * Supports:
 * - 'classic': High-contrast, clean geometric tournament/standard design
 * - 'retro': Playing card vintage regal aesthetic
 * Defaults cleanly to 'classic'.
 */
export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  theme = 'classic',
  className = 'w-full h-full',
}) => {
  if (theme === 'retro') {
    return <ChessPieceRetro type={type} color={color} className={className} />;
  }
  return <ChessPieceClassic type={type} color={color} className={className} />;
};