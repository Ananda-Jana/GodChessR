/**
 * JourneyAvatar.tsx - Flexible Avatar Component with TSX Vector Fallbacks and Image Upload Support
 *
 * Supports:
 * - Local image file upload (PNG/JPG/WEBP via FileReader data URL)
 * - Built-in vector TSX fallbacks with customizable colors
 * - Preset selectable avatar themes
 */

import React, { useRef } from 'react';
import { Camera, Shield, Crown, Sparkles, User, Bot } from 'lucide-react';

interface JourneyAvatarProps {
  customImageUrl?: string;
  avatarKey?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isEditable?: boolean;
  onImageUploaded?: (dataUrl: string) => void;
  accentColor?: string;
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

export const JourneyAvatar: React.FC<JourneyAvatarProps> = ({
  customImageUrl,
  avatarKey = 'default',
  size = 'md',
  className = '',
  isEditable = false,
  onImageUploaded,
  accentColor = '#fbbf24',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && onImageUploaded) {
        onImageUploaded(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderVectorFallback = () => {
    switch (avatarKey) {
      case 'joystick':
        return (
          <div className="w-full h-full flex items-center justify-center bg-emerald-950 text-emerald-400">
            <Bot className="w-3/5 h-3/5" />
          </div>
        );
      case 'jester':
        return (
          <div className="w-full h-full flex items-center justify-center bg-amber-950 text-amber-400">
            <Sparkles className="w-3/5 h-3/5" />
          </div>
        );
      case 'octavian':
      case 'warden':
      case 'sentinel':
        return (
          <div className="w-full h-full flex items-center justify-center bg-blue-950 text-blue-400">
            <Shield className="w-3/5 h-3/5" />
          </div>
        );
      case 'iron-regent':
      case 'omni-sovereign':
      case 'celestial-deity':
        return (
          <div className="w-full h-full flex items-center justify-center bg-yellow-950 text-yellow-300">
            <Crown className="w-3/5 h-3/5" />
          </div>
        );
      case 'cyclops-revenant':
      case 'chrome-reaper':
        return (
          <div className="w-full h-full flex items-center justify-center bg-rose-950 text-rose-500">
            <Bot className="w-3/5 h-3/5" />
          </div>
        );
      default:
        return (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            <User className="w-3/5 h-3/5" />
          </div>
        );
    }
  };

  return (
    <div
      className={`relative rounded-md overflow-hidden border-2 border-black flex-shrink-0 shadow-[2px_2px_0px_#000] ${
        SIZE_CLASSES[size]
      } ${className}`}
      style={{ borderColor: accentColor }}
    >
      {customImageUrl ? (
        <img
          src={customImageUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        renderVectorFallback()
      )}

      {isEditable && (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
            title="Upload custom avatar image"
          >
            <Camera className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};
