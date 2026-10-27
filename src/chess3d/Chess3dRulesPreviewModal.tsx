import React, { useState, useEffect } from 'react';
import { X, Bot, Users, Swords, Play, Shield, Sparkles, Clock, Crown, ChevronRight } from 'lucide-react';
import { ChessBoard3D } from './3dchessboard';
import { createInitialPieces } from './chess3dEngine';
import { PUNISHER_BOTS, type PunisherBotId } from './chess3dBot';
import type { Team, TimeControl3D } from './types';
import { useAuth } from '../context/AuthContext';

interface Chess3dRulesPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBotMatch: (botId: PunisherBotId, playerTeam: Team) => void;
  onStartMultiplayerMatch: (roomCode?: string, timeControl?: TimeControl3D, team?: Team) => void;
}

export const Chess3dRulesPreviewModal: React.FC<Chess3dRulesPreviewModalProps> = ({
  isOpen,
  onClose,
  onStartBotMatch,
  onStartMultiplayerMatch,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bot' | 'multiplayer'>('bot');
  const [selectedBotId, setSelectedBotId] = useState<PunisherBotId>('chrome-reaper');
  const [playerTeam, setPlayerTeam] = useState<Team>('orange');
  const [timeControl, setTimeControl] = useState<TimeControl3D>('5m');
  const [joinCode, setJoinCode] = useState('');
  const [openRooms, setOpenRooms] = useState<any[]>([]);

  // Preview board with initial pieces
  const [previewPieces] = useState(() => createInitialPieces());

  useEffect(() => {
    if (!isOpen) return;

    // Listen for Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Request open 3D rooms over WebSocket
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      ws.onopen = () => {
        ws?.send(JSON.stringify({ type: '3d:get_rooms' }));
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === '3d:open_rooms') {
            setOpenRooms(data.rooms || []);
          }
        } catch {}
      };
    } catch {}

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      ws?.close();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const botList = Object.values(PUNISHER_BOTS);
  const activeBot = PUNISHER_BOTS[selectedBotId];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end lg:items-center justify-center p-0 lg:p-4 overflow-hidden lg:overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="3D Annihilatic Chess Arcade Preview & Rules"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#141519] border-t-2 border-x-2 lg:border-2 border-[#29212F] shadow-2xl rounded-t-2xl lg:rounded-2xl flex flex-col h-[94dvh] lg:h-auto max-h-[94dvh] lg:max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#29212F] bg-[#0c0d10] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Crown className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
                3D Annihilatic Chess Arcade
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 font-mono font-bold border border-blue-500/30">
                  FIDE 8x8
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Pure standard chess tactics with 3D feline masters and lethal Punisher bots
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 lg:w-8 lg:h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-[#29212F] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 lg:w-4 lg:h-4" />
          </button>
        </div>

        {/* Modal Body: Left Preview, Right Mode Configuration */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 min-h-0">
          {/* Left Column: Board & Pieces Preview */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Live 3D Board Preview
              </span>
              <span className="text-[10px] font-mono text-neutral-400">8x8 Standard Grid</span>
            </div>

            {/* Interactive 3D Miniature Preview (160px hero on mobile, aspect-square on desktop) */}
            <div className="w-full h-40 lg:h-auto lg:aspect-square bg-[#0b0c0e] border border-[#29212F] rounded-xl overflow-hidden p-1 lg:p-2 flex items-center justify-center shadow-inner relative group shrink-0">
              <ChessBoard3D pieces={previewPieces} background={false} width="100%" />
              <div className="absolute bottom-2 inset-x-2 py-1 px-2 rounded bg-black/80 backdrop-blur-sm text-center text-[10px] font-bold text-neutral-200 border border-white/10 pointer-events-none">
                3D Annihilatic Chess · FIDE 8x8 Masters
              </div>
            </div>

            {/* Rules Recap Box */}
            <div className="bg-[#0b0c0e] border border-[#29212F] rounded-xl p-3 text-xs space-y-1.5 text-neutral-300">
              <div className="font-bold text-white uppercase text-[11px] flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Standard FIDE Tournament Rules:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-400">
                <li>Strict FIDE movement: Castling, En Passant, Pawn Promotion.</li>
                <li>Zero dice, zero crafting, and no Prince pieces.</li>
                <li>Checkmate to claim victory; stalemate results in a draw.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Mode Select & Launch Details */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#090a0c] border border-[#29212F] rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('bot')}
                className={`min-h-[44px] lg:min-h-0 py-2.5 lg:py-2 px-3 text-xs font-black uppercase rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'bot'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                Vs. Punisher Bots
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('multiplayer')}
                className={`min-h-[44px] lg:min-h-0 py-2.5 lg:py-2 px-3 text-xs font-black uppercase rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'multiplayer'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Multiplayer Room
              </button>
            </div>

            {activeTab === 'bot' ? (
              /* BOT TAB */
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-300 mb-1.5">
                    Select Punisher Bot Opponent
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {botList.map((bot) => (
                      <button
                        key={bot.id}
                        type="button"
                        onClick={() => setSelectedBotId(bot.id)}
                        className={`min-h-[44px] p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedBotId === bot.id
                            ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                            : 'bg-[#090a0c] border-[#29212F] hover:border-neutral-600'
                        }`}
                      >
                        <div className="text-xs font-bold text-white truncate">{bot.name}</div>
                        <div className="text-[10px] text-blue-400 font-mono mt-0.5">
                          {bot.rating} ELO
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Bot Details Box */}
                {activeBot && (
                  <div className="p-3 bg-[#090a0c] border border-blue-500/30 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                        {activeBot.name}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                          {activeBot.rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Tactical Depth: {activeBot.depth} · Aggression: {activeBot.aggression}x · High-speed minimax
                      </p>
                    </div>
                  </div>
                )}

                {/* Color Choice */}
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-300 mb-1.5">
                    Choose Your Pieces
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPlayerTeam('orange')}
                      className={`min-h-[44px] lg:min-h-0 p-3 lg:p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        playerTeam === 'orange'
                          ? 'bg-blue-950/50 border-blue-400 text-white shadow-sm ring-1 ring-blue-500/40'
                          : 'bg-[#090a0c] border-[#29212F] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-amber-200 border border-amber-500 shadow-sm" />
                      White Pieces (Moves First)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerTeam('red')}
                      className={`min-h-[44px] lg:min-h-0 p-3 lg:p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        playerTeam === 'red'
                          ? 'bg-blue-950/50 border-blue-400 text-white shadow-sm ring-1 ring-blue-500/40'
                          : 'bg-[#090a0c] border-[#29212F] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-red-600 border border-red-400 shadow-sm" />
                      Black Pieces (Moves Second)
                    </button>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="button"
                  onClick={() => onStartBotMatch(selectedBotId, playerTeam)}
                  className="min-h-[46px] mt-2 w-full py-3.5 lg:py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Confirm & Enter 3D Arcade (vs. {activeBot?.name})
                </button>
              </div>
            ) : (
              /* MULTIPLAYER TAB */
              <div className="flex flex-col gap-4">
                {/* Create Room Section */}
                <div className="bg-[#090a0c] border border-[#29212F] rounded-xl p-3.5 space-y-3">
                  <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-blue-400" />
                    Create Custom 3D Chess Room
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                      Time Control
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['3m', '5m', 'untimed'] as TimeControl3D[]).map((tc) => (
                        <button
                          key={tc}
                          type="button"
                          onClick={() => setTimeControl(tc)}
                          className={`min-h-[44px] lg:min-h-0 py-2.5 lg:py-1.5 px-2 rounded-lg border text-xs font-bold uppercase cursor-pointer transition-colors flex items-center justify-center ${
                            timeControl === tc
                              ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-900/30'
                              : 'bg-[#141519] border-[#29212F] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {tc === '3m' ? '3m Blitz' : tc === '5m' ? '5m Rapid' : 'Untimed'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartMultiplayerMatch(undefined, timeControl, playerTeam)}
                    className="min-h-[44px] lg:min-h-0 w-full py-3 lg:py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-md shadow-blue-900/30 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    Host Room with Code
                  </button>
                </div>

                {/* Join Room by Code */}
                <div className="bg-[#090a0c] border border-[#29212F] rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Join by 6-Character Room Code
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 7X8K2M"
                      maxLength={6}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 bg-[#141519] border border-[#29212F] rounded-lg text-xs font-mono font-bold text-white uppercase tracking-widest focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      disabled={joinCode.length < 4}
                      onClick={() => onStartMultiplayerMatch(joinCode)}
                      className="min-h-[44px] lg:min-h-0 px-4 py-2.5 lg:py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:bg-neutral-800 text-white text-xs font-black uppercase rounded-lg border border-blue-500/40 cursor-pointer transition-all flex items-center justify-center"
                    >
                      Join
                    </button>
                  </div>
                </div>

                {/* Open Rooms List */}
                {openRooms.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-black uppercase text-neutral-400">
                      Live Open Rooms ({openRooms.length})
                    </div>
                    <div className="max-h-28 overflow-y-auto space-y-1">
                      {openRooms.map((room) => (
                        <div
                          key={room.code}
                          className="p-2 bg-[#090a0c] border border-[#29212F] rounded-lg flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{room.hostName}</span>
                            <span className="text-[10px] text-neutral-400 ml-2">
                              Code: <span className="font-mono text-blue-300">{room.code}</span> · {room.timeControl}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onStartMultiplayerMatch(room.code)}
                            className="min-h-[38px] lg:min-h-0 py-1.5 lg:py-1 px-3 lg:px-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded cursor-pointer flex items-center justify-center"
                          >
                            Join
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
