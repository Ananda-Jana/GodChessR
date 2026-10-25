import React from 'react';

type IconProps = { size?: number; className?: string };

const SideBracket = "M310 346 L322 350 L322 372 L340 380 L336 388 L318 388 L310 378 Z";

export const OctoSkull: React.FC<IconProps> = ({ size = 128, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="304 230 176 172"
    width={size}
    height={(size * 172) / 176}
    className={className}
    fill="currentColor"
    fillRule="evenodd"
    role="img"
    aria-label="Octagon skull"
  >
    <path d="M378 250 L386 236 L408 236 L416 250 L408 250 L402 243 L392 243 L386 250 Z" />
    <path d={SideBracket} />
    <path d={SideBracket} transform="translate(782 0) scale(-1 1)" />
    <path
      d="M365 280 L417 280 L440 302 L440 346 L424 358 L424 372 L410 372
         L410 388 L398 392 L384 392 L372 388 L372 372 L358 372 L358 358
         L342 346 L342 302 Z
         M368 313 A9 9 0 1 0 368.01 313 Z
         M414 313 A9 9 0 1 0 414.01 313 Z
         M391 341 Q396 341 396 347 Q396 354 391 354 Q386 354 386 347 Q386 341 391 341 Z
         M380 372 L383 372 L383 385 L380 385 Z
         M399 372 L402 372 L402 385 L399 385 Z"
    />
  </svg>
);

export default OctoSkull;
