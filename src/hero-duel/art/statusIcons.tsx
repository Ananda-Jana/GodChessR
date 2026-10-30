import React from 'react';
import { StatusEffectType } from '../types/heroDuelTypes';

interface StatusBadgeProps {
  status: StatusEffectType;
  duration?: number;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, duration, className = 'w-4 h-4' }) => {
  let label = '';
  let bg = '';
  let icon = '';

  switch (status) {
    case 'silenced':
      label = 'Silenced';
      bg = 'bg-purple-600 text-white';
      icon = '🤐';
      break;
    case 'rooted':
      label = 'Rooted';
      bg = 'bg-emerald-700 text-white';
      icon = '🌿';
      break;
    case 'slowed':
      label = 'Slowed';
      bg = 'bg-blue-600 text-white';
      icon = '❄️';
      break;
    case 'disarmed':
      label = 'Disarmed';
      bg = 'bg-amber-600 text-black';
      icon = '🚫';
      break;
    case 'cursed':
      label = 'Cursed';
      bg = 'bg-red-700 text-white';
      icon = '💀';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-black font-mono uppercase ${bg} ${className}`}
      title={`${label} (${duration ?? 1} turn left)`}
    >
      <span>{icon}</span>
      {duration !== undefined && <span>{duration}</span>}
    </span>
  );
};
