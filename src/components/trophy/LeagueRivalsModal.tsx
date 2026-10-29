/**
 * LeagueRivalsModal.tsx - Dedicated League Rivals Challenge Modal
 * Allows players in League mode to view real online rivals and issue challenges directly without redirecting to modes.
 */

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Users, X, Search, Zap, Swords, Shield, Bot } from 'lucide-react';

interface LeagueRivalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengePlayer: (player: { id: string; name: string }) => void;
  onFightBotFallback?: () => void;
}

interface RivalPlayer {
  id: string;
  username: string;
  displayName: string;
  avatarId?: string;
  stats?: {
    totalGames: number;
    wins: number;
    losses: number;
  };
  trophies?: number;
}

export const LeagueRivalsModal: React.FC<LeagueRivalsModalProps> = ({
  isOpen,
  onClose,
  onChallengePlayer,
  onFightBotFallback,
}) => {
  const { user, token } = useAuth();
  const { onlineUserIds } = useSocket();
  const [players, setPlayers] = useState<RivalPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !token) return;

    let isMounted = true;
    async function fetchPlayers() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/players?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setPlayers(data.players || []);
        }
      } catch {
        // Silently handle temporary fetch errors
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchPlayers, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, searchQuery, token]);

  if (!isOpen) return null;

  const currentUserId = user?.id;

  // Filter out self
  const rivalsList = players.filter((p) => p.id !== currentUserId);

  // Sort online rivals first
  const sortedRivals = [...rivalsList].sort((a, b) => {
    const aOnline = onlineUserIds.includes(a.id);
    const bOnline = onlineUserIds.includes(b.id);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return (b.trophies || 0) - (a.trophies || 0);
  });

  const onlineRivalsCount = rivalsList.filter((p) => onlineUserIds.includes(p.id)).length;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="League Rivals Directory"
    >
      <div
        className="relative w-full max-w-xl bg-[#090d14] border-2 border-white/20 shadow-[8px_8px_0px_#fff] flex flex-col max-h-[85vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-slate-900 hover:bg-rose-600 text-white border border-slate-700 hover:border-black cursor-pointer transition-colors active:scale-95"
          title="Close Rivals Directory"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-white/10 pr-14">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-amber-400 text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#fff]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-white tracking-wide flex items-center gap-2">
                <span>LEAGUE RIVALS DIRECTORY</span>
                {onlineRivalsCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {onlineRivalsCount} ONLINE
                  </span>
                )}
              </h2>
            </div>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Challenge online competitors to authoritative Ranked League matches
          </p>

          {/* Search Box */}
          <div className="relative mt-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rivals by username or display name..."
              className="w-full bg-slate-950 border border-slate-700 pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Rivals List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="p-8 text-center text-xs font-mono text-slate-400 animate-pulse">
              Querying online radar...
            </div>
          ) : sortedRivals.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center gap-3 bg-slate-950/60 border border-slate-800">
              <Users className="w-10 h-10 text-slate-600" />
              <div className="text-center">
                <span className="text-sm font-black uppercase text-white block">
                  No Rivals Found
                </span>
                <span className="text-xs font-mono text-slate-400 block mt-1">
                  {searchQuery
                    ? 'No players matched your search query.'
                    : 'No other players are currently registered or online.'}
                </span>
              </div>
              {onFightBotFallback && (
                <button
                  type="button"
                  onClick={onFightBotFallback}
                  className="mt-2 py-2 px-4 bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-xs uppercase border border-black shadow-[2px_2px_0px_#fff] flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Bot className="w-4 h-4" />
                  <span>Fight Calibrated League Bot Instead</span>
                </button>
              )}
            </div>
          ) : (
            sortedRivals.map((player) => {
              const isOnline = onlineUserIds.includes(player.id);

              return (
                <div
                  key={player.id}
                  className={`p-3 border flex items-center justify-between gap-3 transition-colors ${
                    isOnline
                      ? 'bg-slate-900/90 border-slate-700 hover:border-amber-400'
                      : 'bg-slate-950/60 border-slate-900 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-10 h-10 bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-sm uppercase text-amber-400 shrink-0">
                        {player.displayName.charAt(0)}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                          isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                        }`}
                        title={isOnline ? 'Online' : 'Offline'}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm uppercase text-white truncate">
                          {player.displayName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          @{player.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
                        <span className="text-amber-400 font-bold">
                          {player.trophies ? `${player.trophies} TR` : 'Ranked Player'}
                        </span>
                        <span>·</span>
                        <span className={isOnline ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {isOnline ? 'Online Now' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onChallengePlayer({ id: player.id, name: player.displayName })}
                    className="py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-xs uppercase border border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Challenge</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            5:00 Rapid · Standard Pieces · Full TR Stakes
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
