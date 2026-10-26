import React, { useState } from 'react';
import { MODE_ART_MAP, MODE_FALLBACK_GRADIENTS, ModeArtKey } from './modeArt';

interface ModeArtPanelProps {
  modeKey: ModeArtKey;
  alt?: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const ModeArtPanel: React.FC<ModeArtPanelProps> = ({
  modeKey,
  alt,
  className = '',
  title,
  subtitle,
}) => {
  const [hasError, setHasError] = useState(false);
  const src = MODE_ART_MAP[modeKey];
  const gradientClass = MODE_FALLBACK_GRADIENTS[modeKey] || 'from-neutral-900 to-black border-amber-400';

  return (
    <div
      className={`hidden md:flex flex-col justify-end shrink-0 w-80 lg:w-84 relative overflow-hidden bg-black border-r-4 border-black dark:border-white select-none ${className}`}
    >
      {/* Background Gradient / Fallback */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradientClass} opacity-90`} />

      {/* Main Image */}
      {!hasError && src && (
        <img
          src={src}
          alt={alt || `${modeKey} Artwork`}
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-105 contrast-110 transition-opacity duration-300"
        />
      )}

      {/* Dark Vignette Overlay for Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

      {/* Optional Title/Subtitle Overlay at Bottom */}
      {(title || subtitle) && (
        <div className="relative z-10 p-5 space-y-1">
          {title && (
            <h4 className="text-base font-black uppercase text-white tracking-wide drop-shadow-md">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-xs font-bold text-amber-300/90 uppercase tracking-wider font-mono">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
