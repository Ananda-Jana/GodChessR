import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AVATAR_OPTIONS, AvatarDisplay } from './Avatars';
import { Crown, AlertCircle, UserCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, register, loginGuest, error, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarId, setAvatarId] = useState(AVATAR_OPTIONS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGuestLogin = async () => {
    clearError();
    setIsSubmitting(true);
    try {
      await loginGuest();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register(username, displayName || username, password, avatarId);
      } else {
        await login(username, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950">
      <div className="w-full max-w-md flex flex-col gap-3">
        {/* Symmetric Imperial Order Box directly above the login form */}
        <div className="bg-[#3d060f] border-4 border-amber-400 p-3 sm:p-3.5 shadow-[6px_6px_0px_#000000] flex items-center gap-3 sm:gap-4">
          {/* Small square avatar container */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-black border-2 border-amber-400 shadow-[2px_2px_0px_#000000] overflow-hidden flex items-center justify-center">
            <img
              src="/assets/aistudio/image_77c93c63.png"
              alt="The Plasma Hashira - Sir thukuna"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Right side symmetric decree text */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              Domain Decree · 勅命
            </span>
            <p className="text-xs sm:text-sm font-black text-white uppercase tracking-tight leading-snug">
              The Plasma Hashira - Sir thukuna is ordering you to login
            </p>
          </div>
        </div>

        {/* Main Login Box with Dark Red Background and Yellow Borders */}
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          className="w-full bg-[#500714] border-4 border-amber-400 p-6 sm:p-8 shadow-[8px_8px_0px_#000000] flex flex-col gap-6 text-white"
        >
          {/* Brand Header */}
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-amber-400 border-3 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
              <Crown className="w-7 h-7" />
            </div>
            <h1 id="auth-modal-title" className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              MugenChessX
            </h1>
            <p className="text-xs text-amber-400 font-extrabold uppercase tracking-wide">
              by ANANDA JANA
            </p>
            <p className="text-xs text-rose-200/90 font-bold uppercase max-w-xs">
              Multiplayer online strategy featuring Prince mechanics and dice rolls.
            </p>
          </div>

          {/* Play as Guest White Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isSubmitting}
            className="w-full min-h-[48px] py-3 px-4 bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black border-3 border-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] cursor-pointer flex items-center justify-center gap-2.5 transition-transform active:translate-x-0.5 active:translate-y-0.5 focus-visible:ring-4 focus-visible:ring-amber-400 outline-none disabled:opacity-50"
          >
            <UserCheck className="w-5 h-5 text-black shrink-0" />
            <span>Play as Guest</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex bg-[#32040b] border-2 border-amber-400 p-1">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                clearError();
              }}
              className={`flex-1 h-11 text-xs font-black uppercase transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400 outline-none ${
                !isRegister
                  ? 'bg-amber-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-rose-200 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                clearError();
              }}
              className={`flex-1 h-11 text-xs font-black uppercase transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400 outline-none ${
                isRegister
                  ? 'bg-amber-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-rose-200 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-700 text-white border-3 border-black p-3 text-xs font-black uppercase flex items-start gap-2 shadow-[2px_2px_0px_#000]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-white" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-amber-300">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. grandmaster99"
                className="w-full px-3.5 py-2.5 bg-[#2b040a] border-2 border-amber-400/90 text-xs sm:text-sm font-mono text-white placeholder-rose-300/40 focus:outline-none focus:border-amber-400 focus:bg-[#38060d] focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-amber-300">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Magnus"
                  className="w-full px-3.5 py-2.5 bg-[#2b040a] border-2 border-amber-400/90 text-xs sm:text-sm text-white placeholder-rose-300/40 focus:outline-none focus:border-amber-400 focus:bg-[#38060d] focus-visible:ring-2 focus-visible:ring-amber-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase mb-1 text-amber-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#2b040a] border-2 border-amber-400/90 text-xs sm:text-sm font-mono text-white placeholder-rose-300/40 focus:outline-none focus:border-amber-400 focus:bg-[#38060d] focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-black uppercase mb-1.5 text-amber-300">
                  Pick Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarId(av.id)}
                      className={`p-1.5 border-2 border-amber-400 flex justify-center cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400 outline-none ${
                        avatarId === av.id ? 'bg-amber-400 shadow-[2px_2px_0px_#000]' : 'bg-[#2b040a] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <AvatarDisplay avatarId={av.id} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 min-h-[48px] py-3 px-4 bg-amber-400 hover:bg-amber-300 text-black border-3 border-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all focus-visible:ring-4 focus-visible:ring-amber-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Processing...'
                : isRegister
                ? 'Create New Account'
                : 'Sign In to Play'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
