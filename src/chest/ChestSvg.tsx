import React from 'react';

interface ChestSvgProps {
  isWin: boolean;
  tapCount: number; // 0, 1, 2, 3
  isOpened: boolean;
  isWindup: boolean;
  isResigned?: boolean;
}

export const ChestSvg: React.FC<ChestSvgProps> = ({
  isWin: _isWin,
  tapCount,
  isOpened,
  isWindup,
  isResigned = false,
}) => {
  // Color palette: Warm wooden treasure chest with gold bands & shield lock
  const woodBodyMain = '#b5541a';
  const woodBodyShadow = '#8b3a10';
  const woodHighlight = '#c9692a';
  const woodDeepShadow = '#6b2a09';
  const goldBandMain = '#e8971e';
  const goldBandHighlight = '#f5c842';
  const goldBandShadow = '#b5700f';
  const lockPlateMain = '#d4861a';
  const lockPlateHighlight = '#f0b830';
  const lockKeyhole = '#3a1f06';
  const outline = '#3a1f06';
  const cornerStuds = '#e8971a';

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
        {/* ClipPath for shine sweep across gold elements */}
        <clipPath id="chestGoldClips">
          <rect x="28" y="112" width="184" height="20" />
          <rect x="58" y="52" width="22" height="150" />
          <rect x="160" y="52" width="22" height="150" />
          <path d="M 120 92 L 107 98 L 107 112 Q 107 122 120 126 Q 133 122 133 112 L 133 98 Z" />
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
        <path
          d="M 30 118 L 30 185 Q 30 200 46 200 L 194 200 Q 210 200 210 185 L 210 118 Z"
          fill="#1c1917"
          stroke={outline}
          strokeWidth="4"
        />
        {(tapCount >= 2 || isOpened) && (
          <ellipse
            cx="120"
            cy="145"
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
        {/* BODY (lower half, rounded rect) */}
        <path
          d="M 30 118 L 30 185 Q 30 200 46 200 L 194 200 Q 210 200 210 185 L 210 118 Z"
          fill={woodBodyShadow}
          stroke={outline}
          strokeWidth="4"
        />

        {/* BODY UPPER (plank face, lighter) */}
        <path
          d="M 30 118 L 210 118 L 210 155 L 30 155 Z"
          fill={woodBodyMain}
          stroke="none"
        />

        {/* PLANK GROOVES on body (horizontal lines suggesting wood planks) */}
        <line x1="30" y1="136" x2="210" y2="136" stroke={woodDeepShadow} strokeWidth="3" />
        <line x1="30" y1="154" x2="210" y2="154" stroke={woodDeepShadow} strokeWidth="3" />
        <line x1="30" y1="172" x2="210" y2="172" stroke={woodDeepShadow} strokeWidth="3" />

        {/* LEFT VERTICAL BAND (gold, lower half) */}
        <rect
          x="58"
          y="118"
          width="22"
          height="82"
          fill={goldBandMain}
          stroke={outline}
          strokeWidth="3.5"
        />
        <rect x="59" y="119" width="6" height="80" fill={goldBandHighlight} />
        <rect x="72" y="119" width="5" height="80" fill={goldBandShadow} />

        {/* RIGHT VERTICAL BAND (gold, lower half) */}
        <rect
          x="160"
          y="118"
          width="22"
          height="82"
          fill={goldBandMain}
          stroke={outline}
          strokeWidth="3.5"
        />
        <rect x="161" y="119" width="6" height="80" fill={goldBandHighlight} />
        <rect x="173" y="119" width="5" height="80" fill={goldBandShadow} />

        {/* GOLD CENTER BAND (horizontal, spans full width at mid-body) */}
        <rect
          x="28"
          y="112"
          width="184"
          height="20"
          fill={goldBandMain}
          stroke={outline}
          strokeWidth="4"
        />
        <rect x="29" y="113" width="182" height="5" fill={goldBandHighlight} />
        <rect x="29" y="127" width="182" height="4" fill={goldBandShadow} />

        {/* CORNER STUDS (4 rivets at corners of body) */}
        <circle cx="42" cy="120" r="5" fill={cornerStuds} stroke={outline} strokeWidth="2" />
        <circle cx="198" cy="120" r="5" fill={cornerStuds} stroke={outline} strokeWidth="2" />
        <circle cx="42" cy="192" r="5" fill={cornerStuds} stroke={outline} strokeWidth="2" />
        <circle cx="198" cy="192" r="5" fill={cornerStuds} stroke={outline} strokeWidth="2" />
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
        {/* Lid body */}
        <path
          d="M 30 118 L 30 75 Q 30 52 120 48 Q 210 52 210 75 L 210 118 Z"
          fill={woodBodyMain}
          stroke={outline}
          strokeWidth="4"
        />

        {/* Lid shadow (lower curve of lid) */}
        <path
          d="M 30 110 Q 120 106 210 110 L 210 118 L 30 118 Z"
          fill={woodBodyShadow}
        />

        {/* Lid highlight (upper curve) */}
        <path
          d="M 38 80 Q 120 58 202 80 Q 120 68 38 80 Z"
          fill={woodHighlight}
          opacity="0.6"
        />

        {/* Lid plank grooves */}
        <path
          d="M 38 105 Q 120 101 202 105"
          stroke={woodDeepShadow}
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M 40 90 Q 120 84 200 90"
          stroke={woodDeepShadow}
          strokeWidth="3"
          fill="none"
        />

        {/* Left Vertical Band (upper, on lid) */}
        <rect
          x="58"
          y="52"
          width="22"
          height="66"
          fill={goldBandMain}
          stroke={outline}
          strokeWidth="3.5"
        />
        <rect x="59" y="53" width="6" height="64" fill={goldBandHighlight} />
        <rect x="72" y="53" width="5" height="64" fill={goldBandShadow} />

        {/* Right Vertical Band (upper, on lid) */}
        <rect
          x="160"
          y="52"
          width="22"
          height="66"
          fill={goldBandMain}
          stroke={outline}
          strokeWidth="3.5"
        />
        <rect x="161" y="53" width="6" height="64" fill={goldBandHighlight} />
        <rect x="173" y="53" width="5" height="64" fill={goldBandShadow} />

        {/* Crack Line across lid if resigned */}
        {isResigned && (
          <path
            d="M 90 65 L 105 78 L 98 88 L 115 98"
            fill="none"
            stroke={outline}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}

        {/* Tap count indicator line on lid if tapCount === 1 */}
        {tapCount === 1 && (
          <line
            x1="36"
            y1="116"
            x2="204"
            y2="116"
            stroke={isResigned ? '#ef4444' : goldBandHighlight}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* LOCK SHIELD */}
      <g
        id="chest-lock"
        style={{
          transformOrigin: '120px 105px',
          transform: isOpened ? 'translate(0px, -15px) scale(0.92)' : 'none',
          transition: 'transform 450ms cubic-bezier(0.18, 0.9, 0.32, 1.2)',
        }}
      >
        {/* Shield body */}
        <path
          d="M 120 92 L 107 98 L 107 112 Q 107 122 120 126 Q 133 122 133 112 L 133 98 Z"
          fill={lockPlateMain}
          stroke={outline}
          strokeWidth="3.5"
        />
        {/* Shield left highlight */}
        <path
          d="M 120 92 L 107 98 L 107 112 Q 107 119 113 123 Q 107 118 107 112 L 107 98 Z"
          fill={lockPlateHighlight}
          opacity="0.7"
        />
        {/* Keyhole */}
        <circle
          cx="120"
          cy="107"
          r="5"
          fill={lockKeyhole}
          stroke={lockKeyhole}
          strokeWidth="1"
        />
        <polygon
          points="117,111 123,111 122,120 118,120"
          fill={lockKeyhole}
        />
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
