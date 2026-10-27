import React from 'react';
import { CraftPieceColor, CraftPieceType } from './craftGameTypes';

interface CraftPieceProps {
  type: CraftPieceType;
  color: CraftPieceColor;
  className?: string;
}

const WHITE_STYLE = {
  fill: '#ffffff',
  stroke: '#1e293b',
  strokeWidth: '1.5',
  detail: '#334155',
};

const BLACK_STYLE = {
  fill: '#090d16',
  stroke: '#cbd5e1',
  strokeWidth: '1.5',
  detail: '#f1f5f9',
};

export const CraftGamePiece: React.FC<CraftPieceProps> = ({
  type,
  color,
  className = 'w-full h-full',
}) => {
  const isWhite = color === 'white';
  const s = isWhite ? WHITE_STYLE : BLACK_STYLE;

  const renderSvg = () => {
    switch (type) {
      case 'pawn':
        return (
          <>
            <circle cx="12" cy="7" r="3.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
            <path
              d="M9.5 11.5 C9.5 11.5 7 15 7 19 L17 19 C17 15 14.5 11.5 14.5 11.5 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            <rect x="5.5" y="19" width="13" height="2.5" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      case 'knight':
        return (
          <>
            <path
              d="M7 20 L17 20 C17 17 16 14 16 12 C16 9 14.5 6 12 5 C10.5 5 9.5 6 9 7 C8 8 6 9.5 6 11.5 C6 13 7.5 14 8.5 14 C7.5 16 7 18 7 20 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            <circle cx="10" cy="8.5" r="1" fill={s.detail} />
            <rect x="5.5" y="20" width="13" height="2" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      case 'bishop':
        return (
          <>
            <circle cx="12" cy="4" r="1.2" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
            <path
              d="M12 6 C9 6 8 9 8 12 C8 15 9.5 17 9.5 19 L14.5 19 C14.5 17 16 15 16 12 C16 9 15 6 12 6 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            <path d="M10 10 L14 13 M14 10 L10 13" stroke={s.detail} strokeWidth="1" strokeLinecap="round" />
            <rect x="6" y="19.5" width="12" height="2.5" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      case 'rook':
        return (
          <>
            <path
              d="M6 6 H8 V9 H10 V6 H14 V9 H16 V6 H18 V10 L16.5 12 V18.5 H7.5 V12 L6 10 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            <rect x="5" y="19" width="14" height="2.5" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      case 'queen':
        return (
          <>
            <circle cx="5" cy="7" r="1.2" fill={s.fill} stroke={s.stroke} strokeWidth="1" />
            <circle cx="8.5" cy="5" r="1.2" fill={s.fill} stroke={s.stroke} strokeWidth="1" />
            <circle cx="12" cy="4" r="1.4" fill={s.fill} stroke={s.stroke} strokeWidth="1" />
            <circle cx="15.5" cy="5" r="1.2" fill={s.fill} stroke={s.stroke} strokeWidth="1" />
            <circle cx="19" cy="7" r="1.2" fill={s.fill} stroke={s.stroke} strokeWidth="1" />
            <path
              d="M5 8.5 L7.5 17 H16.5 L19 8.5 L15 12 L12 6 L9 12 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            <rect x="5.5" y="18.5" width="13" height="3" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      case 'king':
        return (
          <>
            <path d="M12 2.5 V6.5 M10 4.5 H14" stroke={s.stroke} strokeWidth="1.6" strokeLinecap="square" />
            <path
              d="M6 9 C6 7.5 9 7.5 12 7.5 C15 7.5 18 7.5 18 9 C18 12 16.5 14 16.5 18 H7.5 C7.5 14 6 12 6 9 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            <circle cx="12" cy="11.5" r="1.5" fill={s.detail} />
            <rect x="5" y="18.5" width="14" height="3" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      case 'prince':
        return (
          <>
            {/* Prince: Crowned winged horse / royal knight */}
            <path d="M12 2.5 L10.5 5 H13.5 Z" fill="#f59e0b" stroke={s.stroke} strokeWidth="0.8" />
            <path
              d="M7 20 L17 20 C17 17 16 14 16 12 C16 9 14.5 6 12 5 C10.5 5 9.5 6 9 7 C8 8 6 9.5 6 11.5 C6 13 7.5 14 8.5 14 C7.5 16 7 18 7 20 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            {/* Extended wing feathers */}
            <path d="M13 11 C15 10 17 11 18 13" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
            <circle cx="10" cy="8.5" r="1.2" fill="#f59e0b" />
            <rect x="5.5" y="20" width="13" height="2" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      case 'supremeRook':
        return (
          <>
            {/* Supreme Rook: Armored Fortress */}
            <path
              d="M5 6 H7.5 V8.5 H9.5 V6 H14.5 V8.5 H16.5 V6 H19 V10 L17.5 12 V18.5 H6.5 V12 L5 10 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            <path d="M12 9.5 V15.5 M9 12.5 H15" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="4.5" y="19" width="15" height="2.8" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      case 'priest':
        return (
          <>
            {/* Priest: Celestial halo + Mitre */}
            <circle cx="12" cy="4" r="2.2" stroke="#3b82f6" strokeWidth="1" fill="none" />
            <path
              d="M12 6 C9.5 6 8.5 9 8.5 12 C8.5 15 9.8 17 9.8 19 L14.2 19 C14.2 17 15.5 15 15.5 12 C15.5 9 14.5 6 12 6 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            <path d="M12 9 V15 M10 11.5 H14" stroke="#3b82f6" strokeWidth="1.2" />
            <rect x="6" y="19.5" width="12" height="2.5" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      case 'communist':
        return (
          <>
            {/* Communist: Hammer & sickle star badge */}
            <circle cx="12" cy="7" r="3.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
            <path
              d="M9.5 11.5 C9.5 11.5 7 15 7 19 L17 19 C17 15 14.5 11.5 14.5 11.5 Z"
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
            />
            <polygon points="12,12.5 12.8,14.5 15,14.5 13.2,15.8 13.8,17.8 12,16.5 10.2,17.8 10.8,15.8 9,14.5 11.2,14.5" fill="#ef4444" />
            <rect x="5.5" y="19" width="13" height="2.5" rx="0.5" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
          </>
        );

      default:
        return <circle cx="12" cy="12" r="8" fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />;
    }
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: isWhite ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' : 'drop-shadow(0 2px 4px rgba(255,255,255,0.15))' }}
    >
      {renderSvg()}
    </svg>
  );
};
