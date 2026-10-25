import React, { useId } from "react";

type IconProps = {
  size?: number;
  className?: string;
  /** color of the eye cores and edge shards (defaults to currentColor) */
  accent?: string;
  /** adds a soft glow behind the eye cores */
  glow?: boolean;
};

export const CyberSkull: React.FC<IconProps> = ({
  size = 128,
  className,
  accent = "currentColor",
  glow = false,
}) => {
  const uid = useId().replace(/:/g, "");
  const shape = `${uid}-shape`;
  const cuts = `${uid}-cuts`;
  const mask = `${uid}-mask`;
  const blur = `${uid}-blur`;

  const mirror = "translate(200 0) scale(-1 1)";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 216"
      width={size}
      height={(size * 216) / 200}
      className={className}
      role="img"
      aria-label="Cyber skull"
    >
      <defs>
        {/* right half of the skull silhouette (mirrored for the left) */}
        <path
          id={shape}
          d="M100 8 H132 L158 20 L170 48 L172 88 L182 116 L178 146 L168 156
             L164 176 L150 190 L146 208 H128 L124 196 H112 L110 206 H100 Z"
        />

        {/* right half of the cutouts */}
        <g id={cuts}>
          {/* hexagonal eye socket */}
          <path d="M112 112 L148 104 L166 118 L162 136 L146 146 L120 140 Z" />
          {/* forehead panel slit */}
          <rect x="134" y="14" width="3" height="30" />
          {/* cheek circuit line */}
          <path
            d="M128 156 L148 162 L152 178"
            fill="none"
            stroke="#000"
            strokeWidth="3"
            strokeLinejoin="miter"
          />
          {/* tooth slits */}
          <rect x="114" y="176" width="3" height="18" />
          <rect x="136" y="176" width="3" height="24" />
        </g>

        <filter id={blur} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="216">
          {/* solid skull */}
          <g fill="#fff">
            <use href={`#${shape}`} />
            <use href={`#${shape}`} transform={mirror} />
          </g>
          {/* carved details */}
          <g fill="#000">
            <use href={`#${cuts}`} />
            <use href={`#${cuts}`} transform={mirror} />
            {/* nose */}
            <path d="M100 144 L109 166 H91 Z" />
            {/* double chevron */}
            <path d="M100 38 L126 53 V62 L100 47 L74 62 V53 Z" />
            <path d="M100 56 L126 71 V80 L100 65 L74 80 V71 Z" />
            {/* centre tooth slit */}
            <rect x="98.5" y="178" width="3" height="26" />
          </g>
        </mask>
      </defs>

      {/* optional glow behind the eyes */}
      {glow && (
        <g fill={accent} filter={`url(#${blur})`} opacity="0.7">
          <circle cx="138" cy="124" r="10" />
          <circle cx="62" cy="124" r="10" />
        </g>
      )}

      {/* the skull itself, with true transparent cutouts */}
      <rect width="200" height="216" fill="currentColor" mask={`url(#${mask})`} />

      {/* eye cores sitting inside the sockets */}
      <g fill={accent}>
        <path d="M128 116 L148 114 L150 128 L136 134 Z" />
        <path d="M128 116 L148 114 L150 128 L136 134 Z" transform={mirror} />
      </g>

      {/* floating edge shards */}
      <g fill={accent}>
        <path d="M184 42 L196 54 V74 L190 68 V57 L184 51 Z" />
        <path d="M184 42 L196 54 V74 L190 68 V57 L184 51 Z" transform={mirror} />
        <path d="M188 150 L196 158 V176 L190 170 Z" />
        <path d="M188 150 L196 158 V176 L190 170 Z" transform={mirror} />
      </g>
    </svg>
  );
};

export default CyberSkull;
