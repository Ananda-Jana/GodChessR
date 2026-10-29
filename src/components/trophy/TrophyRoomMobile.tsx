/**
 * TrophyRoomMobile.tsx - Dedicated Fullscreen Mobile Layout (< 1024px)
 */

import React, { useState } from 'react';
import { useTrophyRoomData } from './useTrophyRoomData';
import { RankBadge } from './RankBadge';
import { ChessPiece } from '../ChessPiece';
import { CullingPiece } from '../CullingPiece';
import { ChestSvg } from '../../chest/ChestSvg';
import { CurrencyAllocatedSlot } from '../../economy/CurrencyIcons';
import type { PieceColor, PieceType } from '../../types/game';
import type { CullingPieceType, CullingPieceColor } from '../../types/cullingGame';
import {
  Trophy,
  Gift,
  X,
  Lock,
  Download,
  CheckCircle2,
  Crown,
  Flame,
  Archive,
  Sparkles,
  Swords,
  Play,
  Users,
  Bot,
  Zap,
  Info,
} from 'lucide-react';
import type { PunisherBotId } from '../../punisher/punisherBot';
import { LEAGUE_BOTS } from '../../league/leagueBots';
import { LeaguePreMatchModal } from './LeaguePreMatchModal';
import { LeagueRivalsModal } from './LeagueRivalsModal';
import { useSocket } from '../../context/SocketContext';
import { MugenPassIcon } from '../../economy/MugenPassIcon';
import { MugenPassView } from '../../economy/MugenPassView';

interface TrophyRoomMobileProps {
  data: ReturnType<typeof useTrophyRoomData>;
  onClose: () => void;
}

export const TrophyRoomMobile: React.FC<TrophyRoomMobileProps> = ({ data, onClose }) => {
  const {
    user,
    mainView,
    setMainView,
    inventorySubTab,
    setInventorySubTab,
    selectedCard,
    setSelectedCard,
    effectiveSelectedCard,
    isSelectedCardUnlocked,
    filterMode,
    setFilterMode,
    filterRarity,
    setFilterRarity,
    canvasRef,
    filteredTrophies,
    allTrophyData,
    unlockedCount,
    totalCount,
    pendingChestsList,
    pendingChestsCount,
    claimedRewards,
    currentGems,
    currentTrophies,
    currentRank,
    rankProgress,
    allRanks,
    handleOpenChest,
    handleDownloadSelectedCard,
    matchesTrophyDef,
  } = data;

  const { onlineUserIds, sendChallenge } = useSocket();
  // Sheet inspector state for tapped card on mobile
  const [isInspectorSheetOpen, setIsInspectorSheetOpen] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState<string>('joystick-wraith');
  const [isPreMatchOpen, setIsPreMatchOpen] = useState(false);
  const [preMatchBotId, setPreMatchBotId] = useState<PunisherBotId>('joystick-wraith');
  const [isRivalsModalOpen, setIsRivalsModalOpen] = useState(false);
  const [autoMatchNotice, setAutoMatchNotice] = useState<string | null>(null);

  const handlePlayBotMatch = (botId: string) => {
    setPreMatchBotId(botId as PunisherBotId);
    setIsPreMatchOpen(true);
  };

  const handleDeployLeagueBotMatch = (botId: PunisherBotId) => {
    setIsPreMatchOpen(false);
    onClose();
    window.dispatchEvent(new CustomEvent('open_league_bot_match', { detail: { botId } }));
  };

  const handleAutoMatch = () => {
    const candidateId = onlineUserIds.find((id) => id !== user?.id);
    if (candidateId) {
      sendChallenge(candidateId, 300, 'included', true, 'classic', 'classic');
      onClose();
      window.dispatchEvent(
        new CustomEvent('app_toast_notice', {
          detail: { message: 'Auto Match: Ranked challenge dispatched to online player! Match starts on accept.' },
        })
      );
    } else {
      setAutoMatchNotice(
        'No other players are currently online in the queue. You can challenge a League Bot below to earn TR, or open the Rivals Directory!'
      );
      setTimeout(() => setAutoMatchNotice(null), 6000);
    }
  };

  const handleOpenRivals = () => {
    setIsRivalsModalOpen(true);
  };

  const handleChallengeFromRivals = (targetPlayer: { id: string; name: string }) => {
    setIsRivalsModalOpen(false);
    onClose();
    window.dispatchEvent(new CustomEvent('open_player_challenge', { detail: { targetPlayer } }));
  };

  const renderBadgePiece = (trophy: typeof allTrophyData[0]) => {
    const pType = trophy.pieceType || 'king';
    const pColor = trophy.pieceColor || 'white';
    const isLocked = !trophy.isUnlocked;

    const content =
      trophy.mode === 'culling' && pType.startsWith('culling_') ? (
        <CullingPiece
          type={pType as CullingPieceType}
          color={pColor as CullingPieceColor}
        />
      ) : (
        <ChessPiece
          type={pType as PieceType}
          color={pColor as PieceColor}
          className="w-full h-full"
        />
      );

    return (
      <div
        className={`w-12 h-12 flex items-center justify-center p-1 bg-white border-2 transition-all ${
          isLocked
            ? 'border-slate-800 grayscale opacity-30'
            : 'border-black shadow-[2px_2px_0px_#000]'
        }`}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-[100dvh] bg-[#080b11] text-slate-100 flex flex-col overflow-hidden select-none touch-manipulation">
      {/* 1. COMPACT STICKY TOP BAR WITH TOP-RIGHT CLOSE BUTTON */}
      <header className="h-12 bg-black border-b border-white/20 px-3 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2 min-w-0">
          <RankBadge rank={currentRank} size="xs" />
          <div className="min-w-0 flex items-center gap-1.5">
            <span className="text-xs font-mono font-black uppercase text-amber-400 truncate">
              {currentRank.name}
            </span>
            <span className="text-[10px] font-mono text-slate-300 font-bold">
              ({currentTrophies} TR)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Gems */}
          <div className="px-2 py-0.5 bg-amber-400 text-black font-mono font-black text-[11px] flex items-center gap-1 border border-black shadow-[1px_1px_0px_#fff]">
            <CurrencyAllocatedSlot type="gem" size="sm" />
            <span>{currentGems}</span>
          </div>

          {/* Close Button strictly in Top Right Corner */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black rounded-md shadow-[2px_2px_0px_#000] flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
            title="Exit Trophy Room"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE CONTENT BODY */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 pb-24">
        {mainView === 'trophies' && (
          /* ============================================================== */
          /* ==================== TROPHIES MOBILE VIEW =================== */
          /* ============================================================== */
          <div className="space-y-3">
            {/* Filter Chips Row */}
            <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none">
              {(['all', 'standard', 'culling', 'rose', 'crafted'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`min-h-[36px] px-3 font-mono font-black uppercase text-[10px] border flex-shrink-0 flex items-center cursor-pointer ${
                    filterMode === m
                      ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#fff]'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {m === 'all' ? 'All Realms' : m === 'standard' ? 'Classic' : m}
                </button>
              ))}
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredTrophies.map((trophy) => {
                const isSelected = Boolean(
                  selectedCard && matchesTrophyDef(selectedCard.id, trophy.id)
                );
                const isLocked = !trophy.isUnlocked;

                return (
                  <button
                    key={trophy.id}
                    onClick={() => {
                      if (trophy.isUnlocked && trophy.earnedInstance) {
                        setSelectedCard(trophy.earnedInstance);
                      } else {
                        setSelectedCard({
                          ...trophy,
                          id: `${trophy.id}_locked`,
                          predictedRating: 0,
                          userId: 'guest',
                          earnedAt: Date.now(),
                          stats: {} as any,
                        } as any);
                      }
                      setIsInspectorSheetOpen(true);
                    }}
                    className={`p-3 border-2 transition-all flex flex-col justify-between aspect-[4/5] text-left active:scale-98 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-black border-black shadow-[4px_4px_0px_#fff]'
                        : 'bg-slate-900/90 text-white border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[8px] font-black uppercase px-1.5 py-0.5 border ${
                          isSelected
                            ? 'bg-black text-amber-400 border-black'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        {trophy.rarity}
                      </span>
                      {isLocked ? (
                        <Lock className="w-3 h-3 text-slate-500" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-center my-2">
                      {renderBadgePiece(trophy)}
                    </div>

                    <div>
                      <h4 className={`font-black text-[11px] uppercase leading-tight truncate ${isSelected ? 'text-black' : 'text-white'}`}>
                        {trophy.title}
                      </h4>
                      <span className={`text-[9px] font-mono block mt-0.5 ${isSelected ? 'text-black/80' : 'text-slate-400'}`}>
                        {isLocked ? 'LOCKED' : 'UNLOCKED'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mainView === 'league' && (
          /* ============================================================== */
          /* ===================== LEAGUE MOBILE VIEW ===================== */
          /* ============================================================== */
          <div className="space-y-4">
            {/* Rank Card Banner */}
            <div className="bg-slate-900 border-3 border-amber-400 p-4 flex flex-col items-center text-center shadow-[4px_4px_0px_#000]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400 text-black font-mono font-black text-[10px] uppercase mb-3 border border-black">
                <Crown className="w-3.5 h-3.5" />
                <span>LEAGUE RANKING</span>
              </div>

              <RankBadge rank={currentRank} size="md" />

              <h2
                className="text-lg font-black uppercase mt-1.5 tracking-wide"
                style={{ color: currentRank.primaryColor }}
              >
                {currentRank.name}
              </h2>

              <div className="mt-2 px-4 py-1.5 bg-black border border-amber-400">
                <span className="text-xl font-mono font-black text-amber-300">
                  {currentTrophies} <span className="text-xs text-amber-500">TR</span>
                </span>
              </div>

              {rankProgress.nextRank ? (
                <div className="w-full bg-slate-950 p-2.5 border border-slate-800 mt-3 text-left">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300 mb-1">
                    <span>Next: {rankProgress.nextRank.name}</span>
                    <span className="text-amber-400">{rankProgress.trophiesRemaining} TR</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 border border-slate-700 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full"
                      style={{ width: `${rankProgress.progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* LEAGUE MATCHMAKING & BOT COMBAT MOBILE SECTION */}
            <div className="bg-black/90 border-2 border-amber-400 p-3.5 space-y-3.5 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between border-b border-amber-400/40 pb-2">
                <div className="flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-black uppercase text-amber-400">
                    PLAY & MATCHMAKING
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-400/20 text-amber-300">
                  OFFICIAL
                </span>
              </div>

              {/* Quick Multiplayer Options */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
                  1. MULTIPLAYER ARENA
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAutoMatch}
                    className="py-2.5 px-2 bg-amber-400 text-black font-mono font-black text-[10px] uppercase border border-black shadow-[2px_2px_0px_#fff] flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Auto Match</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenRivals}
                    className="py-2.5 px-2 bg-slate-900 text-white font-mono font-black text-[10px] uppercase border border-slate-700 flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Challenge</span>
                  </button>
                </div>

                {autoMatchNotice && (
                  <div className="mt-2 p-2 bg-amber-400/10 border border-amber-400/40 text-[9px] font-mono text-amber-300 flex items-start gap-1">
                    <Info className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>{autoMatchNotice}</span>
                  </div>
                )}
              </div>

              {/* Bot Selector */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
                  2. LEAGUE BOT ENGINES (RANK UNLOCKED)
                </span>

                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {LEAGUE_BOTS.map((bot) => {
                    const isUnlocked = currentTrophies >= bot.minTrophies || currentRank.tierNumber >= bot.minTier;
                    const isSelected = selectedBotId === bot.id;

                    return (
                      <button
                        key={bot.id}
                        onClick={() => isUnlocked && setSelectedBotId(bot.id)}
                        disabled={!isUnlocked}
                        className={`p-2 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#fff]'
                            : isUnlocked
                            ? 'bg-slate-900 text-white border-slate-700'
                            : 'bg-slate-950 text-slate-600 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase truncate">
                            {bot.name}
                          </span>
                          {!isUnlocked ? (
                            <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                          ) : (
                            <Bot className={`w-3 h-3 shrink-0 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                          )}
                        </div>
                        <span className={`text-[8px] font-mono font-bold ${isSelected ? 'text-black/80' : 'text-amber-400'}`}>
                          {isUnlocked ? bot.rating : `${bot.minTrophies} TR`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Bot Launch */}
                {(() => {
                  const botObj = LEAGUE_BOTS.find((b) => b.id === selectedBotId) || LEAGUE_BOTS[0];
                  return (
                    <div className="mt-2.5 p-2 bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-black text-amber-400 uppercase">{botObj.name}</span>
                        <span className="text-slate-300">{botObj.rating}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayBotMatch(botObj.id)}
                        className="w-full py-2 bg-amber-400 text-black font-mono font-black text-xs uppercase border border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>PLAY VS {botObj.name.toUpperCase()}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Rank Ladder */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider">
                11-TIER RANK LADDER
              </h3>
              {allRanks.map((rank) => {
                const isCurrent = rank.id === currentRank.id;
                const isPassed = currentTrophies >= rank.minTrophies;

                return (
                  <div
                    key={rank.id}
                    className={`p-3 border-2 flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-400/10 border-amber-400'
                        : isPassed
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-slate-950 border-slate-900 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <RankBadge rank={rank} size="xs" />
                      <div className="min-w-0">
                        <span
                          className="font-black text-xs uppercase block truncate"
                          style={{ color: rank.primaryColor }}
                        >
                          {rank.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 block">
                          Req: {rank.minTrophies} TR
                        </span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[8px] font-mono font-black uppercase px-1.5 py-0.5 bg-amber-400 text-black border border-black">
                        YOUR RANK
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {mainView === 'inventory' && (
          /* ============================================================== */
          /* ===================== VAULT MOBILE VIEW ====================== */
          /* ============================================================== */
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <button
                onClick={() => setInventorySubTab('pending')}
                className={`flex-1 py-2 font-mono font-black text-[10px] uppercase border cursor-pointer ${
                  inventorySubTab === 'pending'
                    ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#fff]'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Unopened ({pendingChestsCount})
              </button>
              <button
                onClick={() => setInventorySubTab('claimed')}
                className={`flex-1 py-2 font-mono font-black text-[10px] uppercase border cursor-pointer ${
                  inventorySubTab === 'claimed'
                    ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#fff]'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                History ({claimedRewards.length})
              </button>
            </div>

            {inventorySubTab === 'pending' ? (
              <div className="space-y-2.5">
                {pendingChestsCount === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 border border-slate-800">
                    <Archive className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <span className="text-xs font-mono font-bold text-slate-400 block uppercase">
                      Vault is Empty
                    </span>
                  </div>
                ) : (
                  pendingChestsList.map((event, idx) => (
                    <div
                      key={`${event.matchId}_${idx}`}
                      className="p-3 bg-slate-900 border-2 border-amber-400 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 flex items-center justify-center shrink-0">
                          <ChestSvg isWin={true} tapCount={0} isOpened={false} isWindup={false} />
                        </div>
                        <div>
                          <h4 className="font-black text-xs uppercase text-amber-300">
                            Battle Chest
                          </h4>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">
                            {event.mode || 'Loot Reward'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenChest()}
                        className="py-1.5 px-3 bg-amber-400 text-black font-black text-[10px] uppercase border border-black shadow-[2px_2px_0px_#fff] cursor-pointer shrink-0"
                      >
                        Open
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {claimedRewards.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 border border-slate-800">
                    <Gift className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <span className="text-xs font-mono font-bold text-slate-400 block uppercase">
                      No History
                    </span>
                  </div>
                ) : (
                  claimedRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="p-2.5 bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-black uppercase text-white truncate max-w-[160px]">
                        {reward.name || reward.title || 'Chest Loot'}
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        +50 Gems
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {mainView === 'mugenpass' && (
          <div>
            <MugenPassView userId={user?.id || 'guest'} />
          </div>
        )}
      </div>

      {/* 3. CARD INSPECTOR OVERLAY SHEET FOR MOBILE */}
      {isInspectorSheetOpen && effectiveSelectedCard && (
        <div
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xs flex flex-col justify-end p-4"
          onClick={() => setIsInspectorSheetOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-slate-900 border-2 border-amber-400 p-4 shadow-2xl flex flex-col items-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-2 border-black shadow-[6px_6px_0px_#f5a623] bg-[#f5a623] aspect-square w-full mb-4 overflow-hidden rounded-md">
              <canvas ref={canvasRef} width={600} height={600} className="w-full h-full block object-contain" />
            </div>

            <div className="w-full bg-amber-400 text-black p-3 border border-black mb-4">
              <h3 className="text-base font-black uppercase">{effectiveSelectedCard.title}</h3>
              <p className="text-[11px] font-bold italic mt-1">&ldquo;{effectiveSelectedCard.description}&rdquo;</p>
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={handleDownloadSelectedCard}
                disabled={!isSelectedCardUnlocked}
                className="w-full py-2.5 bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-black font-black text-xs uppercase border border-black shadow-[2px_2px_0px_#fff]"
              >
                Download PNG
              </button>

              <button
                onClick={() => setIsInspectorSheetOpen(false)}
                className="w-full py-2 bg-slate-950 text-white font-mono font-bold text-xs uppercase border border-slate-700"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CLEAN MOBILE NAVIGATION BAR AT BOTTOM (NO CLOSE BUTTON AT BOTTOM) */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-black/95 border-t-2 border-white/20 px-3 flex items-center justify-around z-40 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setMainView('trophies')}
          className={`flex flex-col items-center justify-center min-h-[44px] px-3 font-mono font-black text-[10px] uppercase cursor-pointer ${
            mainView === 'trophies' ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span>Trophies</span>
        </button>

        <button
          onClick={() => setMainView('league')}
          className={`flex flex-col items-center justify-center min-h-[44px] px-3 font-mono font-black text-[10px] uppercase cursor-pointer ${
            mainView === 'league' ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          <Crown className="w-5 h-5 mb-0.5" />
          <span>League</span>
        </button>

        <button
          onClick={() => setMainView('inventory')}
          className={`flex flex-col items-center justify-center min-h-[44px] px-3 font-mono font-black text-[10px] uppercase cursor-pointer relative ${
            mainView === 'inventory' ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          <Gift className="w-5 h-5 mb-0.5" />
          <span>Vault</span>
          {pendingChestsCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-600" />
          )}
        </button>

        <button
          onClick={() => setMainView('mugenpass')}
          className={`flex flex-col items-center justify-center min-h-[44px] px-3 font-mono font-black text-[10px] uppercase cursor-pointer relative ${
            mainView === 'mugenpass' ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          <MugenPassIcon className="w-5 h-5 mb-0.5 fill-current" />
          <span>Pass</span>
        </button>
      </nav>

      {/* League Pre-Match Loadout Modal */}
      <LeaguePreMatchModal
        isOpen={isPreMatchOpen}
        onClose={() => setIsPreMatchOpen(false)}
        botId={preMatchBotId}
        currentRank={currentRank}
        currentTrophies={currentTrophies}
        userName={user?.displayName || user?.username || 'Player'}
        onDeploy={handleDeployLeagueBotMatch}
      />

      {/* League Rivals Directory Modal */}
      <LeagueRivalsModal
        isOpen={isRivalsModalOpen}
        onClose={() => setIsRivalsModalOpen(false)}
        onChallengePlayer={handleChallengeFromRivals}
        onFightBotFallback={() => {
          setIsRivalsModalOpen(false);
          handlePlayBotMatch(selectedBotId);
        }}
      />
    </div>
  );
};
