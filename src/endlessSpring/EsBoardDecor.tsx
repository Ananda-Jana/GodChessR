import React from 'react';
import { EsGameId } from './EsTypes';

export interface EsBoardDecorProps {
  gameId: EsGameId;
  stageOrAct?: number;
  side: 'left' | 'right';
  className?: string;
}

export const EsBoardDecor: React.FC<EsBoardDecorProps> = ({
  gameId,
  stageOrAct = 1,
  side,
  className = '',
}) => {
  // Side decor is hidden on mobile screens, shown only on md+
  // All artwork is inline SVG with viewBox
  const renderDecor = () => {
    switch (gameId) {
      case 1:
        if (side === 'left') {
          // Eucalyptus trees on the left
          return (
            <svg viewBox="0 0 80 400" className="w-full h-full text-amber-900/40" fill="currentColor">
              <path d="M 35 400 L 40 200 L 45 400 Z" opacity="0.6" />
              <ellipse cx="40" cy="180" rx="25" ry="50" opacity="0.3" />
              <ellipse cx="35" cy="130" rx="30" ry="45" opacity="0.3" />
              <ellipse cx="42" cy="80" rx="22" ry="38" opacity="0.3" />
            </svg>
          );
        } else {
          // Four-storey block on the right
          return (
            <svg viewBox="0 0 80 400" className="w-full h-full text-slate-800/60" fill="currentColor">
              <rect x="10" y="80" width="60" height="320" rx="2" />
              <rect x="20" y="110" width="15" height="20" fill="#fef08a" opacity="0.2" />
              <rect x="45" y="110" width="15" height="20" fill="#fef08a" opacity="0.2" />
              <rect x="20" y="160" width="15" height="20" fill="#fef08a" opacity="0.2" />
              <rect x="45" y="160" width="15" height="20" fill="#fef08a" opacity="0.2" />
              <rect x="20" y="210" width="15" height="20" fill="#fef08a" opacity="0.2" />
              <rect x="45" y="210" width="15" height="20" fill="#fef08a" opacity="0.2" />
              <rect x="20" y="260" width="15" height="20" fill="#fef08a" opacity="0.2" />
              <rect x="45" y="260" width="15" height="20" fill="#fef08a" opacity="0.2" />
            </svg>
          );
        }

      case 2:
        // Window rows for school corridor
        return (
          <svg viewBox="0 0 80 400" className="w-full h-full text-slate-700/40" fill="currentColor">
            <line x1="40" y1="0" x2="40" y2="400" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
            {[60, 140, 220, 300].map((y) => (
              <g key={y}>
                <rect x="15" y={y} width="50" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="40" y1={y} x2="40" y2={y + 40} stroke="currentColor" strokeWidth="1.5" />
                <line x1="15" y1={y + 20} x2="65" y2={y + 20} stroke="currentColor" strokeWidth="1.5" />
              </g>
            ))}
          </svg>
        );

      case 3:
        // Palm silhouettes, rubber trees, fair lights
        return (
          <svg viewBox="0 0 80 400" className="w-full h-full text-teal-800/40" fill="currentColor">
            <path d="M 40 400 Q 30 250 40 120" stroke="currentColor" strokeWidth="6" fill="none" />
            <path d="M 40 120 Q 15 110 5 130" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 40 120 Q 20 80 10 90" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 40 120 Q 45 70 55 85" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 40 120 Q 65 110 75 125" stroke="currentColor" strokeWidth="3" fill="none" />
          </svg>
        );

      case 4:
        // Stalls and bunting, garden hedges, hotel wallpaper
        return (
          <svg viewBox="0 0 80 400" className="w-full h-full text-rose-800/40" fill="currentColor">
            <path d="M 0 60 Q 40 90 80 60" stroke="currentColor" strokeWidth="2" fill="none" />
            <polygon points="15,70 25,70 20,85" fill="#f43f5e" opacity="0.4" />
            <polygon points="35,75 45,75 40,90" fill="#fbbf24" opacity="0.4" />
            <polygon points="55,70 65,70 60,85" fill="#38bdf8" opacity="0.4" />
            <rect x="15" y="200" width="50" height="80" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          </svg>
        );

      case 5:
        // Endless blossom petals (static, subtle)
        return (
          <svg viewBox="0 0 80 400" className="w-full h-full text-amber-500/30" fill="currentColor">
            {[40, 90, 160, 230, 310, 370].map((y, i) => (
              <g key={y} transform={`translate(${i % 2 === 0 ? 25 : 45}, ${y}) rotate(${i * 35})`}>
                <ellipse cx="0" cy="0" rx="8" ry="14" fill="#fbbf24" opacity="0.35" />
                <ellipse cx="0" cy="0" rx="6" ry="10" fill="#f43f5e" opacity="0.25" />
              </g>
            ))}
          </svg>
        );
    }
  };

  return (
    <div className={`hidden md:block w-16 lg:w-20 shrink-0 pointer-events-none select-none ${className}`}>
      {renderDecor()}
    </div>
  );
};
