import React from 'react';

export interface AvatarOption {
  id: string;
  name: string;
  color: string;
  image?: string;
  svg: React.ReactNode;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar_oni_cyber',
    name: 'Cyber Hannya',
    color: 'from-amber-500 to-rose-700',
    image: '/assets/aistudio/image_97317ea2.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M12 2L15 5C17 8 17 12 15 15H9C7 12 7 8 9 5L12 2Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V11M10 9H14" strokeLinecap="round"/>
        <path d="M6 19H18V21H6V19Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_oni_flame',
    name: 'Flame Skull',
    color: 'from-purple-600 to-yellow-500',
    image: '/assets/aistudio/image_6328ad3f.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M12 2L15 5C17 8 17 12 15 15H9C7 12 7 8 9 5L12 2Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V11M10 9H14" strokeLinecap="round"/>
        <path d="M6 19H18V21H6V19Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_oni_buddha',
    name: 'Buddha Split',
    color: 'from-cyan-500 to-rose-600',
    image: '/assets/aistudio/image_6715c510.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M12 2L15 5C17 8 17 12 15 15H9C7 12 7 8 9 5L12 2Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V11M10 9H14" strokeLinecap="round"/>
        <path d="M6 19H18V21H6V19Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_oni_tengu',
    name: 'Tengu Flame',
    color: 'from-red-600 to-amber-600',
    image: '/assets/aistudio/image_60f34245.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M12 2L15 5C17 8 17 12 15 15H9C7 12 7 8 9 5L12 2Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V11M10 9H14" strokeLinecap="round"/>
        <path d="M6 19H18V21H6V19Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_oni_tiger',
    name: 'Floral Tiger',
    color: 'from-blue-600 to-amber-500',
    image: '/assets/aistudio/image_746959ec.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M12 2L15 5C17 8 17 12 15 15H9C7 12 7 8 9 5L12 2Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V11M10 9H14" strokeLinecap="round"/>
        <path d="M6 19H18V21H6V19Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_oni_tribal',
    name: 'Tribal Demon',
    color: 'from-purple-800 to-red-600',
    image: '/assets/aistudio/image_e0bfff75.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M12 2L15 5C17 8 17 12 15 15H9C7 12 7 8 9 5L12 2Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V11M10 9H14" strokeLinecap="round"/>
        <path d="M6 19H18V21H6V19Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_prince',
    name: 'Gatoru Luchha',
    color: 'from-amber-500 to-amber-700',
    image: '/assets/aistudio/gatoru_luchha_avatar.jpg',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 19H19V21H5V19Z" fill="currentColor"/>
        <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_king',
    name: 'Toji Fushiguro',
    color: 'from-purple-500 to-indigo-700',
    image: '/secret-players/toji.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 19H19V21H5V19Z" fill="currentColor"/>
        <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_queen',
    name: 'Rose Empress',
    color: 'from-rose-500 to-pink-700',
    image: '/secret-players/girl_bot.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M4 17L2 7L7 11L12 5L17 11L22 7L20 17H4Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 19H18V21H6V19Z" fill="currentColor"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_knight',
    name: 'Lengoku',
    color: 'from-blue-500 to-cyan-700',
    image: '/secret-players/lengoku.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M19 19H5V17C5 14 7 13 8 11C7 10 7 8 8 7L11 4C14 4 16 6 16 9C16 11 15 12 17 14L19 15V19Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="8" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_rook',
    name: 'Magi Sorcerer',
    color: 'from-emerald-500 to-teal-700',
    image: '/secret-players/magi.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M4 20H20V17H18V10H19V4H16V6H14V4H10V6H8V4H5V10H6V17H4V20Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 13H15V17H9V13Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'avatar_bishop',
    name: 'Lucca Grandmaster',
    color: 'from-amber-600 to-orange-800',
    image: '/secret-players/lucca.png',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
        <path d="M12 2L15 5C17 8 17 12 15 15H9C7 12 7 8 9 5L12 2Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V11M10 9H14" strokeLinecap="round"/>
        <path d="M6 19H18V21H6V19Z" fill="currentColor"/>
      </svg>
    ),
  },
];

export const AvatarDisplay: React.FC<{
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isGuest?: boolean;
}> = ({
  avatarId,
  size = 'md',
  className = '',
  isGuest = false,
}) => {
  const isDirectImage = Boolean(avatarId && (avatarId.startsWith('/') || avatarId.startsWith('http') || avatarId.endsWith('.png') || avatarId.endsWith('.jpg')));
  const avatar = AVATAR_OPTIONS.find((a) => a.id === avatarId);

  let imageSrc = '/assets/aistudio/image_97317ea2.png';
  if (isDirectImage) {
    imageSrc = avatarId;
  } else if (avatar?.image) {
    imageSrc = avatar.image;
  } else if (!isGuest && avatarId === 'avatar_prince') {
    imageSrc = '/assets/aistudio/gatoru_luchha_avatar.jpg';
  }

  const sizeClasses = {
    sm: 'w-7 h-7 p-0.5',
    md: 'w-10 h-10 p-0.5',
    lg: 'w-14 h-14 p-1',
    xl: 'w-20 h-20 p-1',
  }[size];

  if (imageSrc) {
    return (
      <div
        className={`${sizeClasses} overflow-hidden bg-zinc-900 border border-white/20 shadow-sm flex items-center justify-center shrink-0 ${className}`}
        title={avatar?.name || 'Player Avatar'}
      >
        <img
          src={imageSrc}
          alt={avatar?.name || 'Avatar'}
          className="w-full h-full object-cover rounded-inherit"
          onError={(e) => {
            // fallback if needed
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-xl bg-gradient-to-br ${avatar.color} text-white shadow-sm flex items-center justify-center shrink-0 border border-white/10 ${className}`}
      title={avatar.name}
    >
      {avatar.svg}
    </div>
  );
};
