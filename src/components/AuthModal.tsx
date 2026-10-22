import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AVATAR_OPTIONS, AvatarDisplay } from './Avatars';
import { Crown, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, register, error, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarId, setAvatarId] = useState(AVATAR_OPTIONS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100 dark:bg-black">
      <div className="w-full max-w-md bg-white dark:bg-[#0a0a0c] border-4 border-black dark:border-white p-6 sm:p-8 shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] flex flex-col gap-6 text-black dark:text-white">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-amber-400 border-3 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
            <Crown className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            MugenChessX
          </h1>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wide">
            by ANANDA JANA
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-bold uppercase max-w-xs">
            Multiplayer online strategy featuring Prince mechanics and dice rolls.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-200 dark:bg-neutral-900 border-2 border-black dark:border-white p-1">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-black uppercase transition-all cursor-pointer ${
              !isRegister
                ? 'bg-amber-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
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
            className={`flex-1 py-2 text-xs font-black uppercase transition-all cursor-pointer ${
              isRegister
                ? 'bg-amber-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500 text-white border-3 border-black p-3 text-xs font-black uppercase flex items-start gap-2 shadow-[2px_2px_0px_#000]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-white" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. grandmaster99"
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#141416] border-2 border-black dark:border-white text-xs sm:text-sm font-mono text-black dark:text-white focus:outline-none focus:bg-amber-100 dark:focus:bg-neutral-800"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Magnus"
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#141416] border-2 border-black dark:border-white text-xs sm:text-sm text-black dark:text-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#141416] border-2 border-black dark:border-white text-xs sm:text-sm font-mono text-black dark:text-white focus:outline-none"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-black uppercase mb-1.5">
                Pick Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarId(av.id)}
                    className={`p-1.5 border-2 border-black dark:border-white flex justify-center cursor-pointer ${
                      avatarId === av.id ? 'bg-amber-400 shadow-[2px_2px_0px_#000]' : 'bg-neutral-100 dark:bg-neutral-900 opacity-60'
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
            className="w-full mt-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-black border-3 border-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] cursor-pointer"
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
  );
};
