/**
 * TrophyRoomDesktop.tsx - Dedicated Fullscreen Desktop Layout (>= 1024px)
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
import type { CardRarity } from '../../predictor/types';
import {
  Trophy,
  Gift,
  X,
  RefreshCw,
  Lock,
  Download,
  Filter,
  Sparkles,
  Package,
  CheckCircle2,
  Swords,
  Crown,
  Flame,
  Archive,
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

interface TrophyRoomDesktopProps {
  data: ReturnType<typeof useTrophyRoomData>;
  onClose: () => void;
}

export const TrophyRoomDesktop: React.FC<TrophyRoomDesktopProps> = ({ data, onClose }) => {
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
    handleFactoryReset,
    matchesTrophyDef,
  } = data;

  const { onlineUserIds, sendChallenge } = useSocket();
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
        className={`w-14 h-14 flex items-center justify-center p-1 bg-white border-3 transition-all ${
          isLocked
            ? 'border-slate-800 grayscale opacity-30 group-hover:opacity-50'
            : 'border-black shadow-[3px_3px_0px_#000]'
        }`}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-[#080b11] text-slate-100 flex overflow-hidden select-none">
      {/* STRICT TOP-RIGHT CLOSE BUTTON */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-6 z-[120] w-12 h-12 flex items-center justify-center bg-white hover:bg-amber-400 text-black border-2 border-black cursor-pointer shadow-[3px_3px_0px_#fff] transition-all active:scale-95 rounded-md"
        title="Exit Trophy Room"
      >
        <X className="w-6 h-6 stroke-[3]" />
      </button>

      {/* 1. LEFT VERTICAL ICON RAIL */}
      <aside className="w-20 bg-black border-r-2 border-white/20 flex flex-col items-center justify-between py-6 shrink-0 z-30">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#fff]">
            <Trophy className="w-6 h-6 text-black" />
          </div>

          <div className="w-full border-t border-white/10 my-2" />

          {/* Nav Rail Buttons */}
          <button
            onClick={() => setMainView('trophies')}
            className={`w-14 h-14 rounded-md flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
              mainView === 'trophies'
                ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff] scale-105'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Trophy Sanctuary"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[9px] font-mono font-black uppercase">Trophies</span>
          </button>

          <button
            onClick={() => setMainView('league')}
            className={`w-14 h-14 rounded-md flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
              mainView === 'league'
                ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff] scale-105'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="League Rank Ladder"
          >
            <Crown className="w-5 h-5" />
            <span className="text-[9px] font-mono font-black uppercase">League</span>
          </button>

          <button
            onClick={() => setMainView('inventory')}
            className={`w-14 h-14 rounded-md flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer relative ${
              mainView === 'inventory'
                ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff] scale-105'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Chest Vault"
          >
            <Gift className="w-5 h-5" />
            <span className="text-[9px] font-mono font-black uppercase">Vault</span>
            {pendingChestsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-600 text-white font-mono text-[9px] font-black rounded-xs border border-black">
                {pendingChestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMainView('mugenpass')}
            className={`w-14 h-14 rounded-md flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer relative ${
              mainView === 'mugenpass'
                ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff] scale-105'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Mugen Pass Store"
          >
            <MugenPassIcon className="w-5 h-5 fill-current" />
            <span className="text-[9px] font-mono font-black uppercase">Pass</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <button
            onClick={handleFactoryReset}
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-rose-500 border border-slate-800 bg-slate-950 cursor-pointer rounded-md"
            title="Factory Reset Progress"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN DESKTOP CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP STATUS HEADER BAR */}
        <header className="h-20 bg-black/80 border-b-2 border-white/20 px-8 pr-24 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4">
            <RankBadge rank={currentRank} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase text-amber-400 tracking-wider">
                  {currentRank.name}
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {currentTrophies} TR
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Rank Tier {currentRank.tierNumber} / 11 · Sanctuary & Ladder Headquarters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet Gem Badge */}
            <div className="px-4 py-2 bg-amber-400 text-black border-2 border-black font-mono font-black text-sm flex items-center gap-2 shadow-[3px_3px_0px_#fff]">
              <CurrencyAllocatedSlot type="gem" size="md" />
              <span>{currentGems.toLocaleString()} GEMS</span>
            </div>

            {/* Total Unlocked Badges Counter */}
            <div className="px-4 py-2 bg-slate-900 border-2 border-slate-700 font-mono text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                UNLOCKED: <strong className="text-white">{unlockedCount}</strong> / {totalCount}
              </span>
            </div>
          </div>
        </header>

        {/* VIEW PORT BODY */}
        <main className="flex-1 overflow-hidden relative">
          {mainView === 'trophies' && (
            /* ============================================================== */
            /* ===================== TROPHIES DESKTOP VIEW ================== */
            /* ============================================================== */
            <div className="h-full flex overflow-hidden">
              {/* Left Scrollable Trophy Grid */}
              <div className="flex-1 overflow-y-auto p-8 pr-4">
                {/* Filter Controls Bar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono font-black uppercase text-slate-300">
                      Realm Filter:
                    </span>
                    <div className="flex items-center gap-1.5 ml-2">
                      {(['all', 'standard', 'culling', 'rose', 'crafted'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setFilterMode(mode)}
                          className={`px-3 py-1 font-mono font-bold text-xs uppercase border transition-all cursor-pointer ${
                            filterMode === mode
                              ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#fff]'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {mode === 'all' ? 'All Realms' : mode === 'standard' ? 'Classic' : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black uppercase text-slate-300">
                      Rarity:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(['all', 'Common', 'Rare', 'Epic', 'Legendary', 'Godly'] as const).map((rarity) => (
                        <button
                          key={rarity}
                          onClick={() => setFilterRarity(rarity as any)}
                          className={`px-3 py-1 font-mono font-bold text-xs uppercase border transition-all cursor-pointer ${
                            filterRarity === rarity
                              ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#fff]'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {rarity}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4-Column Responsive Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
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
                        }}
                        className={`p-4 border-3 transition-all flex flex-col justify-between aspect-[4/5] cursor-pointer text-left ${
                          isSelected
                            ? 'bg-amber-400 text-black border-black shadow-[6px_6px_0px_#fff] scale-[1.02]'
                            : 'bg-slate-900/60 text-white border-slate-800 hover:border-amber-400/80 shadow-[4px_4px_0px_#000]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
                              isSelected
                                ? 'bg-black text-amber-400 border-black'
                                : 'bg-slate-950 text-slate-300 border-slate-800'
                            }`}
                          >
                            {trophy.rarity}
                          </span>
                          {isLocked ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>

                        <div className="flex items-center justify-center my-3">
                          {renderBadgePiece(trophy)}
                        </div>

                        <div>
                          <h4 className={`font-black text-xs uppercase leading-tight truncate ${isSelected ? 'text-black' : 'text-white'}`}>
                            {trophy.title}
                          </h4>
                          <span className={`text-[10px] font-mono block mt-1 ${isSelected ? 'text-black/80' : 'text-slate-400'}`}>
                            {isLocked ? 'STATUS: LOCKED' : 'UNLOCKED'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Sticky Preview Inspector Column */}
              <aside className="w-[360px] xl:w-[400px] border-l-4 border-white/10 bg-black/80 p-6 flex flex-col items-center shrink-0 overflow-y-auto">
                {effectiveSelectedCard ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative border-4 border-black shadow-[10px_10px_0px_#f5a623] bg-[#f5a623] aspect-square w-full mb-6 overflow-hidden rounded-md">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={600}
                        className="w-full h-full block object-contain"
                      />
                      {!isSelectedCardUnlocked && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="bg-black/90 border-2 border-amber-400 px-4 py-2 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                              Seal Locked
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full bg-amber-400 text-black border-3 border-black p-5 shadow-[6px_6px_0px_#fff] mb-4">
                      <h3 className="text-xl font-black uppercase text-black mb-1 leading-tight">
                        {effectiveSelectedCard.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-black px-2 py-0.5 bg-black text-amber-400">
                          {effectiveSelectedCard.rarity.toUpperCase()}
                        </span>
                        <span className="text-xs font-black text-black/80 uppercase">
                          {effectiveSelectedCard.mode} Realm
                        </span>
                      </div>
                      <p className="text-xs font-bold text-black leading-relaxed italic border-l-4 border-black pl-3 py-0.5">
                        &ldquo;{effectiveSelectedCard.description}&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadSelectedCard}
                      disabled={!isSelectedCardUnlocked}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-black font-black text-xs uppercase border-3 border-black shadow-[4px_4px_0px_#fff] cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Badge PNG</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Sparkles className="w-12 h-12 mb-3 opacity-30" />
                    <span className="text-xs font-mono font-bold uppercase">Select a trophy to view badge</span>
                  </div>
                )}
              </aside>
            </div>
          )}

          {mainView === 'league' && (
            /* ============================================================== */
            /* ===================== LEAGUE DESKTOP VIEW ==================== */
            /* ============================================================== */
            <div className="flex-1 h-full flex overflow-hidden p-6 gap-6">
              {/* Left Hero Rank Panel + PLAY Options */}
              <div className="w-[420px] bg-slate-900/90 border-4 border-amber-400 p-6 flex flex-col justify-between shrink-0 shadow-[8px_8px_0px_#000] overflow-y-auto">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-black font-mono font-black text-xs uppercase mb-4 border border-black">
                    <Crown className="w-4 h-4" />
                    <span>YOUR LEAGUE STANDING</span>
                  </div>

                  <RankBadge rank={currentRank} size="hero" className="my-2" />

                  <h2
                    className="text-2xl font-black uppercase mt-2 tracking-wide"
                    style={{ color: currentRank.primaryColor }}
                  >
                    {currentRank.name}
                  </h2>
                  <span className="text-xs font-mono text-slate-400 font-bold uppercase mt-1">
                    Tier {currentRank.tierNumber} of 11
                  </span>

                  {/* Trophy Counter */}
                  <div className="my-4 px-6 py-2.5 bg-black border-2 border-amber-400 shadow-[4px_4px_0px_#fff]">
                    <span className="text-2xl font-mono font-black text-amber-300">
                      {currentTrophies} <span className="text-xs text-amber-500">TR</span>
                    </span>
                  </div>

                  {/* Progress to Next Rank */}
                  {rankProgress.nextRank ? (
                    <div className="w-full bg-slate-950 p-3 border border-slate-700 mb-6">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
                        <span>Next: {rankProgress.nextRank.name}</span>
                        <span className="text-amber-400">{rankProgress.trophiesRemaining} TR Needed</span>
                      </div>
                      <div className="w-full bg-slate-900 h-3 border border-slate-700 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all duration-500"
                          style={{ width: `${rankProgress.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block text-right mt-1">
                        {rankProgress.progressPercent}% Complete
                      </span>
                    </div>
                  ) : (
                    <div className="w-full text-xs font-mono text-amber-400 font-bold uppercase p-3 bg-black border border-amber-400 mb-6">
                      👑 MAXIMUM RANK ACHIEVED!
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* LEAGUE MATCHMAKING & BOT COMBAT SECTION                   */}
                  {/* ========================================================= */}
                  <div className="w-full bg-black/80 border-2 border-amber-400/80 p-4 text-left space-y-4 shadow-[4px_4px_0px_#000]">
                    <div className="flex items-center justify-between border-b border-amber-400/40 pb-2">
                      <div className="flex items-center gap-2">
                        <Swords className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-mono font-black uppercase text-amber-400">
                          LEAGUE MATCHMAKING & BOT COMBAT
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-400/20 text-amber-300">
                        OFFICIAL
                      </span>
                    </div>

                    {/* Multiplayer Arena Options */}
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-2">
                        1. MULTIPLAYER LEAGUE MATCH
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleAutoMatch}
                          className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-[11px] uppercase border border-black shadow-[2px_2px_0px_#fff] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Auto Match</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenRivals}
                          className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-mono font-black text-[11px] uppercase border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Challenge</span>
                        </button>
                      </div>

                      {autoMatchNotice && (
                        <div className="mt-2 p-2 bg-amber-400/10 border border-amber-400/40 text-[10px] font-mono text-amber-300 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{autoMatchNotice}</span>
                        </div>
                      )}
                    </div>

                    {/* Bot Engine Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                          2. LEAGUE BOT ENGINES (RANK UNLOCKED)
                        </span>
                        <span className="text-[9px] font-mono text-amber-400">
                          {currentRank.name} Tier
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
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
                                  ? 'bg-slate-900 text-white border-slate-700 hover:border-amber-400'
                                  : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-60'
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
                              <span className={`text-[9px] font-mono font-bold ${isSelected ? 'text-black/80' : 'text-amber-400/90'}`}>
                                {isUnlocked ? `${bot.rating}` : `Need ${bot.minTrophies} TR`}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Bot Launch Card */}
                      {(() => {
                        const botObj = LEAGUE_BOTS.find((b) => b.id === selectedBotId) || LEAGUE_BOTS[0];
                        return (
                          <div className="mt-3 p-2.5 bg-slate-950 border border-slate-800 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black uppercase text-amber-400">
                                SELECTED: {botObj.name}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-300">
                                {botObj.rating}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 italic">
                              &ldquo;{botObj.desc}&rdquo;
                            </p>
                            <button
                              type="button"
                              onClick={() => handlePlayBotMatch(botObj.id)}
                              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-xs uppercase border border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Play className="w-3.5 h-3.5 fill-black" />
                              <span>PLAY MATCH VS {botObj.name.toUpperCase()}</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Full Rank Ladder & Info */}
              <div className="flex-1 bg-slate-900/60 border-2 border-slate-800 p-6 flex flex-col overflow-y-auto">
                <h3 className="text-base font-black uppercase text-white tracking-wider mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>OFFICIAL LEAGUE RANK LADDER (11 TIERS)</span>
                </h3>

                <div className="space-y-3">
                  {allRanks.map((rank) => {
                    const isCurrent = rank.id === currentRank.id;
                    const isPassed = currentTrophies >= rank.minTrophies;

                    return (
                      <div
                        key={rank.id}
                        className={`p-4 border-2 transition-all flex items-center justify-between gap-4 ${
                          isCurrent
                            ? 'bg-amber-400/10 border-amber-400 shadow-[4px_4px_0px_#f5a623]'
                            : isPassed
                            ? 'bg-slate-900/80 border-slate-700'
                            : 'bg-slate-950/40 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <RankBadge rank={rank} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4
                                className="font-black text-sm uppercase tracking-wide truncate"
                                style={{ color: rank.primaryColor }}
                              >
                                {rank.name}
                              </h4>
                              {isCurrent && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-400 text-black border border-black">
                                  YOUR RANK
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono text-slate-400 block mt-0.5">
                              Requirement: {rank.minTrophies} TR · Tier {rank.tierNumber}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-amber-400 block">
                            +{rank.rewards.gemsOnPromotion} Gems Bonus
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {isPassed ? '✅ Cleared' : '🔒 Locked'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {mainView === 'inventory' && (
            /* ============================================================== */
            /* ==================== VAULT DESKTOP VIEW ===================== */
            /* ============================================================== */
            <div className="h-full flex flex-col p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-400 text-black border border-black shadow-[2px_2px_0px_#fff]">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase text-amber-400">
                      CHEST VAULT INVENTORY
                    </h2>
                    <p className="text-xs font-mono text-slate-400">
                      Manage unopened battle loot chests and historical rewards
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInventorySubTab('pending')}
                    className={`px-4 py-2 font-mono font-black text-xs uppercase border transition-all cursor-pointer ${
                      inventorySubTab === 'pending'
                        ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff]'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    Unopened Chests ({pendingChestsCount})
                  </button>
                  <button
                    onClick={() => setInventorySubTab('claimed')}
                    className={`px-4 py-2 font-mono font-black text-xs uppercase border transition-all cursor-pointer ${
                      inventorySubTab === 'claimed'
                        ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#fff]'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    Claimed History ({claimedRewards.length})
                  </button>
                </div>
              </div>

              {inventorySubTab === 'pending' ? (
                <div>
                  {pendingChestsCount === 0 ? (
                    <div className="p-12 text-center bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-md">
                      <Archive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <h3 className="text-base font-black uppercase text-slate-400">
                        NO UNOPENED CHESTS IN VAULT
                      </h3>
                      <p className="text-xs font-mono text-slate-500 mt-1 max-w-md mx-auto">
                        Win tactical chess matches or purchase loot chests from the Mugen Store to store chests in your vault!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                      {pendingChestsList.map((event, idx) => (
                        <div
                          key={`${event.matchId}_${idx}`}
                          className="bg-slate-900/80 border-3 border-amber-400 p-6 flex flex-col items-center text-center shadow-[6px_6px_0px_#000]"
                        >
                          <div className="w-20 h-20 mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] flex items-center justify-center">
                            <ChestSvg isWin={true} tapCount={0} isOpened={false} isWindup={false} />
                          </div>
                          <h4 className="font-black text-sm uppercase text-amber-300">
                            Battle Loot Chest
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                            Source: {event.mode || 'Match Reward'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenChest()}
                            className="mt-6 w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#fff] cursor-pointer transition-transform active:scale-95"
                          >
                            Open Chest Now
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {claimedRewards.length === 0 ? (
                    <div className="p-12 text-center bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-md">
                      <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <h3 className="text-base font-black uppercase text-slate-400">
                        NO CLAIMED REWARDS YET
                      </h3>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {claimedRewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="p-4 bg-slate-900/80 border border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <h5 className="font-black text-xs uppercase text-white">
                              {reward.name || reward.title || 'Chest Loot'}
                            </h5>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              Claimed: {new Date(reward.claimedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-amber-400 block">
                              +50 Gems Bonus
                            </span>
                            {reward.eloBoost ? (
                              <span className="text-[10px] font-mono text-emerald-400">
                                +{reward.eloBoost} ELO Boost
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mainView === 'mugenpass' && (
            <div className="h-full overflow-y-auto pr-2">
              <MugenPassView userId={user?.id || 'guest'} />
            </div>
          )}
        </main>
      </div>

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

