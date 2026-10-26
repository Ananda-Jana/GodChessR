import React from 'react';

interface ChestSvgProps {
  isWin: boolean;
  tapCount: number; // 0, 1, 2, 3
  isOpened: boolean;
  isWindup: boolean;
  isResigned?: boolean;
}

export const ChestSvg: React.FC<ChestSvgProps> = ({
  isWin,
  tapCount,
  isOpened,
  isWindup,
  isResigned = false,
}) => {
  // Color specifications:
  // Win ("VICTORY"): body crimson #dc2626, lower half #991b1b, plank grooves #7f1d1d. Gold trim #fbbf24.
  // Loss ("CONSOLATION"): body deep ember maroon #9a3412, shade #7c2d12. Bronze trim #d97706.
  // Resigned ("RESIGNED"): body stone #57534e, shade #44403c. Iron trim #78716c.
  const bodyMain = isResigned ? '#57534e' : isWin ? '#dc2626' : '#9a3412';
  const bodyShade = isResigned ? '#44403c' : isWin ? '#991b1b' : '#7c2d12';
  const grooveColor = isResigned ? '#292524' : isWin ? '#7f1d1d' : '#571804';
  const bandMain = isResigned ? '#78716c' : isWin ? '#fbbf24' : '#d97706';
  const bandShade = isResigned ? '#57534e' : isWin ? '#f59e0b' : '#b45309';
  const bandHighlight = isResigned ? '#a8a29e' : isWin ? '#fde68a' : '#fcd34d';
  const outline = isResigned ? '#1c1917' : isWin ? '#3b0d0d' : '#2a0f06';
  const innerDiscColor = isResigned ? '#292524' : isWin ? '#7f1d1d' : '#451004';

  // Lid rotation around back hinge (left corner: 34px, 105px)
  let lidTransform = 'rotate(0deg)';
  if (isOpened) {
    lidTransform = 'translate(0px, -22px) rotate(-115deg)';
  } else if (tapCount === 2) {
    lidTransform = 'translate(0px, -6px) rotate(-16deg)';
  } else if (tapCount === 1) {
    lidTransform = 'translate(0px, -3px) rotate(-6deg)';
  }

  return (
    <svg
      viewBox="0 0 240 220"
      className="w-full h-full overflow-visible select-none pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* ClipPath for shine sweep across gold/iron bands and central lock ring */}
        <clipPath id="chestGoldClips">
          <rect x="64" y="105" width="26" height="88" rx="2" />
          <rect x="150" y="105" width="26" height="88" rx="2" />
          <rect x="23" y="132" width="13" height="22" rx="4" />
          <rect x="204" y="132" width="13" height="22" rx="4" />
          <circle cx="120" cy="105" r="24" />
          <path d="M 64 105 C 64 54, 90 54, 90 105 Z" />
          <path d="M 150 105 C 150 54, 176 54, 176 105 Z" />
        </clipPath>

        {/* Inner cavity glow when opened */}
        <radialGradient id="chestInnerGlowNew" cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            stopColor={isResigned ? '#ef4444' : '#fde047'}
            stopOpacity="0.95"
          />
          <stop
            offset="50%"
            stopColor={isResigned ? '#7f1d1d' : '#f59e0b'}
            stopOpacity="0.6"
          />
          <stop offset="100%" stopColor="#1c1917" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Flat Floor Shadow Under Chest */}
      <ellipse
        cx="120"
        cy="204"
        rx="85"
        ry="10"
        fill="rgba(0, 0, 0, 0.45)"
        className={tapCount === 0 && !isOpened ? 'chest-floor-shadow' : ''}
      />

      {/* Inside the Base */}
      <g id="chest-cavity">
        <rect
          x="34"
          y="105"
          width="172"
          height="88"
          rx="16"
          fill="#1c1917"
          stroke={outline}
          strokeWidth="5"
        />
        {(tapCount >= 2 || isOpened) && (
          <ellipse
            cx="120"
            cy="135"
            rx="68"
            ry="26"
            fill="url(#chestInnerGlowNew)"
            className="transition-opacity duration-300"
            style={{ opacity: isOpened ? 1 : 0.65 }}
          />
        )}
      </g>

      {/* BASE EXTERIOR */}
      <g id="chest-base">
        <rect
          x="34"
          y="105"
          width="172"
          height="88"
          rx="16"
          fill={bodyMain}
          stroke={outline}
          strokeWidth="5"
        />

        <path
          d="M 35 150 L 205 150 L 205 177 C 205 186, 196 193, 187 193 L 53 193 C 44 193, 35 186, 35 177 Z"
          fill={bodyShade}
        />

        <line x1="36" y1="134" x2="204" y2="134" stroke={grooveColor} strokeWidth="4" />
        <line x1="36" y1="165" x2="204" y2="165" stroke={grooveColor} strokeWidth="4" />

        <path
          d="M 42 110 Q 56 110 60 115 Q 52 126 42 124 Z"
          fill="#ffffff"
          opacity="0.2"
        />

        {/* Left Band */}
        <rect
          x="64"
          y="105"
          width="26"
          height="88"
          fill={bandMain}
          stroke={outline}
          strokeWidth="5"
        />
        <rect x="65" y="106" width="6" height="85" fill={bandShade} />
        <rect x="83" y="106" width="5" height="85" fill={bandHighlight} />
        <circle cx="77" cy="120" r="3" fill={bandHighlight} stroke={outline} strokeWidth="1.5" />
        <circle cx="77" cy="148" r="3" fill={bandHighlight} stroke={outline} strokeWidth="1.5" />
        <circle cx="77" cy="178" r="3" fill={bandHighlight} stroke={outline} strokeWidth="1.5" />

        {/* Right Band */}
        <rect
          x="150"
          y="105"
          width="26"
          height="88"
          fill={bandMain}
          stroke={outline}
          strokeWidth="5"
        />
        <rect x="151" y="106" width="6" height="85" fill={bandShade} />
        <rect x="169" y="106" width="5" height="85" fill={bandHighlight} />
        <circle cx="163" cy="120" r="3" fill={bandHighlight} stroke={outline} strokeWidth="1.5" />
        <circle cx="163" cy="148" r="3" fill={bandHighlight} stroke={outline} strokeWidth="1.5" />
        <circle cx="163" cy="178" r="3" fill={bandHighlight} stroke={outline} strokeWidth="1.5" />

        {/* Side Clasps */}
        <g id="left-clasp">
          <rect
            x="23"
            y="132"
            width="13"
            height="22"
            rx="4"
            fill={bandMain}
            stroke={outline}
            strokeWidth="4"
          />
          <rect x="23" y="133" width="3" height="20" rx="1" fill={bandHighlight} />
          <rect x="30" y="139" width="4" height="8" rx="1" fill={outline} />
        </g>
        <g id="right-clasp">
          <rect
            x="204"
            y="132"
            width="13"
            height="22"
            rx="4"
            fill={bandMain}
            stroke={outline}
            strokeWidth="4"
          />
          <rect x="213" y="133" width="3" height="20" rx="1" fill={bandHighlight} />
          <rect x="206" y="139" width="4" height="8" rx="1" fill={outline} />
        </g>
      </g>

      {/* LID GROUP */}
      <g
        id="chest-lid"
        style={{
          transformOrigin: '34px 105px',
          transform: lidTransform,
          transition: isWindup ? 'none' : 'transform 450ms cubic-bezier(0.18, 0.9, 0.32, 1.2)',
        }}
      >
        <path
          d="M 34 105 C 34 50, 206 50, 206 105 Z"
          fill={bodyMain}
          stroke={outline}
          strokeWidth="5"
        />

        <rect x="35" y="99" width="170" height="6" fill={bodyShade} />

        <path
          d="M 42 85 C 65 62, 175 62, 198 85"
          fill="none"
          stroke={grooveColor}
          strokeWidth="4"
        />

        {/* Crack Line across lid if resigned */}
        {isResigned && (
          <path
            d="M 90 65 L 105 78 L 98 88 L 115 98"
            fill="none"
            stroke="#1c1917"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}

        {/* Left Lid Band */}
        <path
          d="M 64 105 C 64 54, 90 54, 90 105 Z"
          fill={bandMain}
          stroke={outline}
          strokeWidth="5"
        />
        <path d="M 65 104 C 65 58, 71 58, 71 104 Z" fill={bandShade} />
        <path d="M 83 104 C 83 58, 89 58, 89 104 Z" fill={bandHighlight} />
        <circle cx="77" cy="78" r="3" fill={bandHighlight} stroke={outline} strokeWidth="1.5" />

        {/* Right Lid Band */}
        <path
          d="M 150 105 C 150 54, 176 54, 176 105 Z"
          fill={bandMain}
          stroke={outline}
          strokeWidth="5"
        />
        <path d="M 151 104 C 151 58, 157 58, 157 104 Z" fill={bandShade} />
        <path d="M 169 104 C 169 58, 175 58, 175 104 Z" fill={bandHighlight} />
        <circle cx="163" cy="78" r="3" fill={bandHighlight} stroke={outline} strokeWidth="1.5" />

        <path
          d="M 48 92 C 55 68, 100 58, 120 58 C 95 63, 58 75, 48 92 Z"
          fill="#ffffff"
          opacity="0.2"
        />

        {tapCount === 1 && (
          <line
            x1="36"
            y1="105"
            x2="204"
            y2="105"
            stroke={isResigned ? '#ef4444' : '#fde047'}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* LOCK RING */}
      <g
        id="chest-lock"
        style={{
          transformOrigin: '120px 105px',
          transform: isOpened ? 'translate(0px, -15px) scale(0.92)' : 'none',
          transition: 'transform 450ms cubic-bezier(0.18, 0.9, 0.32, 1.2)',
        }}
      >
        <circle
          cx="120"
          cy="105"
          r="24"
          fill={bandMain}
          stroke={outline}
          strokeWidth="5"
        />
        <path
          d="M 103 98 A 20 20 0 0 1 125 87"
          stroke={bandHighlight}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 137 112 A 20 20 0 0 1 115 123"
          stroke={bandShade}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        <circle
          cx="120"
          cy="105"
          r="14"
          fill={innerDiscColor}
          stroke={outline}
          strokeWidth="3.5"
        />

        <circle cx="120" cy="102" r="3" fill="#111827" />
        <polygon points="118,102 122,102 123,111 117,111" fill="#111827" />
      </g>

      {!isResigned && (
        <g clipPath="url(#chestGoldClips)">
          <polygon
            points="0,0 35,0 15,220 -20,220"
            fill="#ffffff"
            opacity="0.35"
            className={!isOpened ? 'chest-shine-band' : ''}
          />
        </g>
      )}
    </svg>
  );
};
