import React, { useState, useEffect } from 'react';
import {
  getGems,
  spendGems,
  deductEloForGems,
  hasBoughtChest,
  recordChestPurchase,
} from './mugenStore';
import {
  unlockSecretPlayer,
  getChestStore,
  addPendingChestEvent,
  popPendingChestEvent,
  PendingChestEvent,
} from '../chest/chestStore';
import { ChestModal } from '../chest/ChestModal';
import { SecretPlayerRewardDef } from '../chest/chestConfig';
import { SECRET_PLAYERS } from '../secret/secretPlayersData';
import {
  ShoppingBag,
  Sparkles,
  Coins,
  Lock,
  Unlock,
  CheckCircle2,
  Gift,
  KeyRound,
  X,
  Flame,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface MugenGemStoreProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentElo: number;
  onEloDeduct: (amount: number) => void;
  onOpenSecretArena: () => void;
}

type StoreTab = 'exchange' | 'chests' | 'secrets';

interface ChestCatalogItem {
  id: string;
  name: string;
  cost: number;
  description: string;
  borderColorClass: string;
  accentTextClass: string;
}

const CHEST_CATALOG: ChestCatalogItem[] = [
  {
    id: 'chest_shadow',
    name: 'Shadow Chest',
    cost: 400,
    description: 'Rare combat artifact containing hidden tactical relics.',
    borderColorClass: 'border-slate-400',
    accentTextClass: 'text-slate-300',
  },
  {
    id: 'chest_crimson',
    name: 'Crimson Chest',
    cost: 600,
    description: 'Secret character fragment imbued with ancient battle energy.',
    borderColorClass: 'border-red-500',
    accentTextClass: 'text-red-400',
  },
  {
    id: 'chest_void',
    name: 'Void Chest',
    cost: 900,
    description: 'Legendary codex card with high-tier rating attributes.',
    borderColorClass: 'border-purple-500',
    accentTextClass: 'text-purple-400',
  },
  {
    id: 'chest_mugen',
    name: 'Mugen Chest',
    cost: 1200,
    description: 'Ultimate ELO boost relic granting massive session rating power.',
    borderColorClass: 'border-amber-400',
    accentTextClass: 'text-amber-400',
  },
];

export const MugenGemStore: React.FC<MugenGemStoreProps> = ({
  isOpen,
  onClose,
  userId,
  currentElo,
  onEloDeduct,
  onOpenSecretArena,
}) => {
  const [activeTab, setActiveTab] = useState<StoreTab>('exchange');
  const [gemBalance, setGemBalance] = useState<number>(0);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [unlockedSecretMap, setUnlockedSecretMap] = useState<Record<string, boolean>>({});
  const [animatingUnlockId, setAnimatingUnlockId] = useState<string | null>(null);

  // Post-purchase and vault flow state for Chest Shop
  const [justPurchasedChestId, setJustPurchasedChestId] = useState<string | null>(null);
  const [lastPurchasedEvent, setLastPurchasedEvent] = useState<PendingChestEvent | null>(null);
  const [activeOpeningEvent, setActiveOpeningEvent] = useState<PendingChestEvent | null>(null);
  const [vaultChests, setVaultChests] = useState<PendingChestEvent[]>([]);
  const [savedConfirmationMessage, setSavedConfirmationMessage] = useState<string | null>(null);

  // Sync balances, vault chests, and unlocked state on open / updates
  const refreshStoreState = () => {
    if (!userId) return;
    setGemBalance(getGems(userId));

    try {
      const store = getChestStore(userId);
      const unlockedList = store.unlocked || [];
      const map: Record<string, boolean> = {};
      SECRET_PLAYERS.forEach((p) => {
        map[p.id] = unlockedList.includes(p.id);
      });
      setUnlockedSecretMap(map);

      // Load pending unopened chests stored in user's vault
      const pendingList: PendingChestEvent[] =
        store.pendingEvents && store.pendingEvents.length > 0
          ? store.pendingEvents
          : Array.from({ length: store.pending || 0 }, (_, i) => ({
              matchId: `pending_${i}`,
              mode: 'Combat Loot',
              result: 'win' as const,
              userId,
            }));
      setVaultChests(pendingList);
    } catch {
      // Fall safe
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStoreState();
      setNoticeMessage(null);
      setJustPurchasedChestId(null);
      setLastPurchasedEvent(null);
      setActiveOpeningEvent(null);
      setSavedConfirmationMessage(null);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  // Derive chest purchase state inline
  const purchasedChestMap: Record<string, boolean> = {
    chest_shadow: hasBoughtChest(userId, 'chest_shadow'),
    chest_crimson: hasBoughtChest(userId, 'chest_crimson'),
    chest_void: hasBoughtChest(userId, 'chest_void'),
    chest_mugen: hasBoughtChest(userId, 'chest_mugen'),
  };

  const purchasedChestsCount = Object.values(purchasedChestMap).filter(Boolean).length;

  // ELO exchange handler
  const handleExchangeElo = () => {
    if (currentElo - 50 < 50) {
      setNoticeMessage('Minimum 50 ELO must remain after exchange!');
      return;
    }

    const { gemsAwarded } = deductEloForGems(userId, currentElo, 50);
    if (gemsAwarded > 0) {
      onEloDeduct(50);
      setGemBalance(getGems(userId));
      setNoticeMessage(`Exchange Successful! Received +${gemsAwarded} Mugen Gems.`);
    }
  };

  // Chest purchase handler
  const handleBuyChest = (chest: ChestCatalogItem) => {
    if (hasBoughtChest(userId, chest.id)) {
      setNoticeMessage(`You have already claimed the ${chest.name}!`);
      return;
    }

    const currentBalance = getGems(userId);
    if (currentBalance < chest.cost) {
      const deficit = chest.cost - currentBalance;
      setNoticeMessage(`Insufficient Gems! Need ${deficit} more gems.`);
      return;
    }

    const success = spendGems(userId, chest.cost);
    if (success) {
      recordChestPurchase(userId, chest.id);
      setGemBalance(getGems(userId));

      // Create and persist pending chest event into chestStore immediately
      const newEvent: PendingChestEvent = {
        matchId: `store_${chest.id}_${Date.now()}`,
        mode: chest.name,
        result: 'win',
        userId,
        isWin: true,
      };
      addPendingChestEvent(newEvent, userId);
      setLastPurchasedEvent(newEvent);
      setJustPurchasedChestId(chest.id);
      setNoticeMessage(null);
      setSavedConfirmationMessage(null);
      refreshStoreState();
    }
  };

  // Immediate chest opening handler (triggers full 3-tap ChestModal animation)
  const handleOpenNow = (eventToOpen?: PendingChestEvent | null) => {
    const target = eventToOpen || lastPurchasedEvent;
    if (target) {
      popPendingChestEvent(userId);
      setActiveOpeningEvent(target);
      setJustPurchasedChestId(null);
      setLastPurchasedEvent(null);
      refreshStoreState();
    }
  };

  // Save to trophy room handler
  const handleSaveToTrophyRoom = () => {
    setJustPurchasedChestId(null);
    setLastPurchasedEvent(null);
    setSavedConfirmationMessage('Chest safely stored in Trophy Room → Chest Vault');
    refreshStoreState();
  };

  // Chest modal close handler
  const handleChestModalClose = (wasOpened: boolean) => {
    if (!wasOpened && activeOpeningEvent) {
      // Re-queue into pending vault if closed before completing 3 taps
      addPendingChestEvent(activeOpeningEvent, userId);
    }
    setActiveOpeningEvent(null);
    setJustPurchasedChestId(null);
    setLastPurchasedEvent(null);
    refreshStoreState();
  };

  // Secret player unlock handler
  const handleUnlockSecretPlayer = (playerId: string, playerName: string) => {
    const cost = 800;
    const currentBalance = getGems(userId);

    if (currentBalance < cost) {
      const deficit = cost - currentBalance;
      setNoticeMessage(`Need ${deficit} more Mugen Gems to unlock ${playerName}!`);
      return;
    }

    const success = spendGems(userId, cost);
    if (success) {
      unlockSecretPlayer(playerId, userId);
      setGemBalance(getGems(userId));
      setAnimatingUnlockId(playerId);
      setNoticeMessage(`Unlocked ${playerName}! PIN Code Revealed.`);
      setUnlockedSecretMap((prev) => ({ ...prev, [playerId]: true }));

      setTimeout(() => {
        setAnimatingUnlockId(null);
      }, 1000);
    }
  };

  const isEloExchangeDisabled = currentElo - 50 < 50;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 md:flex md:items-center md:justify-center">
      <style>{`
        @keyframes secretReveal {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1.0); opacity: 1; }
        }
        .animate-secret-reveal {
          animation: secretReveal 400ms ease-out forwards;
        }
      `}</style>

      {/* Main Container Wrapper */}
      <div className="fixed inset-0 z-50 flex flex-col pb-[64px] md:pb-0 bg-[#0a0a0f] overflow-hidden md:relative md:inset-auto md:w-[900px] md:max-w-[95vw] md:h-[85vh] md:border-4 md:border-white md:shadow-[12px_12px_0px_#000]">
        
        {/* Inner Layout */}
        <div className="flex flex-col h-full w-full overflow-hidden bg-[#0a0a0f]">
          
          {/* TOP BAR */}
          <header className="shrink-0 h-14 px-4 flex items-center justify-between bg-[#0a0a0f] border-b-2 border-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="font-black uppercase text-white text-base md:text-lg tracking-wider">
                MUGEN STORE
              </h2>
            </div>

            {/* Center Gem Balance */}
            <div className="px-3 py-1.5 bg-amber-400 text-black font-mono font-black text-xs md:text-sm flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_#fff]">
              <Coins className="w-4 h-4 text-black shrink-0" />
              <span>{gemBalance} GEMS</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] bg-red-600 hover:bg-red-500 text-white border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_#fff] cursor-pointer shrink-0"
              title="Close Store"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>
          </header>

          {/* TAB BAR */}
          <div className="shrink-0 flex flex-row w-full border-b-2 border-slate-700 bg-black">
            <button
              onClick={() => {
                setActiveTab('exchange');
                setNoticeMessage(null);
                setSavedConfirmationMessage(null);
              }}
              className={`flex-1 min-h-[48px] font-black uppercase text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'exchange'
                  ? 'border-b-[3px] border-amber-400 text-amber-400 bg-white/5'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4 shrink-0" />
              <span>Gem Exchange</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('chests');
                setNoticeMessage(null);
                setSavedConfirmationMessage(null);
              }}
              className={`flex-1 min-h-[48px] font-black uppercase text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'chests'
                  ? 'border-b-[3px] border-amber-400 text-amber-400 bg-white/5'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Gift className="w-4 h-4 shrink-0" />
              <span>Chest Shop</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('secrets');
                setNoticeMessage(null);
                setSavedConfirmationMessage(null);
              }}
              className={`flex-1 min-h-[48px] font-black uppercase text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'secrets'
                  ? 'border-b-[3px] border-amber-400 text-amber-400 bg-white/5'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>Secret Unlock</span>
            </button>
          </div>

          {/* Inline Feedback Notice */}
          {noticeMessage && (
            <div className="bg-amber-400 text-black border-b-2 border-black font-mono font-black text-xs px-4 py-2 text-center flex items-center justify-center gap-2 shrink-0">
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <span>{noticeMessage}</span>
            </div>
          )}

          {/* CONTENT AREA (Only Scrollable Region) */}
          <main className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 bg-[#0a0a0f]">
            
            {/* ============================================================== */}
            {/* TAB 1: GEM EXCHANGE                                            */}
            {/* ============================================================== */}
            {activeTab === 'exchange' && (
              <div className="max-w-[500px] mx-auto space-y-4">
                <div className="bg-[#0c0d14] border-2 border-white p-6 flex flex-col gap-4 shadow-[6px_6px_0px_#000]">
                  
                  {/* Row 1: Gem Balance */}
                  <div className="bg-white/5 border border-slate-700 p-4 flex justify-between items-center">
                    <span className="font-mono text-xs font-black uppercase text-slate-300">
                      YOUR BALANCE
                    </span>
                    <span className="font-mono text-lg font-black text-amber-400 flex items-center gap-1.5">
                      <Coins className="w-5 h-5 text-amber-400 shrink-0" />
                      {gemBalance} GEMS
                    </span>
                  </div>

                  {/* Row 2: Current ELO */}
                  <div className="bg-white/5 border border-slate-700 p-4 flex justify-between items-center">
                    <span className="font-mono text-xs font-black uppercase text-slate-300">
                      CURRENT RATING
                    </span>
                    <span className="font-mono text-lg font-black text-white flex items-center gap-1.5">
                      <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                      {currentElo} ELO
                    </span>
                  </div>

                  {/* Exchange Rate Line */}
                  <p className="text-xs text-zinc-400 text-center font-mono">
                    Exchange 50 ELO → Receive 500 Mugen Gems
                  </p>

                  {/* Exchange Button */}
                  <button
                    onClick={handleExchangeElo}
                    disabled={isEloExchangeDisabled}
                    className="w-full min-h-[52px] bg-amber-400 text-black font-black text-sm uppercase border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isEloExchangeDisabled
                      ? 'EXCHANGE LOCKED (MIN 50 ELO REQUIRED)'
                      : 'EXCHANGE 50 ELO → +500 GEMS'}
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: CHEST SHOP                                              */}
            {/* ============================================================== */}
            {activeTab === 'chests' && (
              <div className="space-y-6">
                
                {/* Saved confirmation toast banner */}
                {savedConfirmationMessage && (
                  <div className="p-3 bg-emerald-500 text-black font-black text-xs border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                      {savedConfirmationMessage}
                    </span>
                    <button
                      onClick={() => setSavedConfirmationMessage(null)}
                      className="text-black font-bold text-xs uppercase underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* 4 Chest Catalog Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {CHEST_CATALOG.map((chest) => {
                    const isPurchased = Boolean(purchasedChestMap[chest.id]);
                    const isAffordable = gemBalance >= chest.cost;
                    const isJustPurchased = justPurchasedChestId === chest.id;

                    return (
                      <div
                        key={chest.id}
                        className={`bg-[#0c0d14] border-2 ${chest.borderColorClass} p-4 flex flex-col gap-3 w-full shadow-[4px_4px_0px_#fff] justify-between`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-black border border-white/20 ${chest.accentTextClass}`}>
                                Combat Chest
                              </span>
                              <h3 className="text-base font-black uppercase text-white tracking-tight mt-1">
                                {chest.name}
                              </h3>
                            </div>

                            <div className="px-3 py-1 bg-amber-400 text-black font-mono font-black text-xs border border-black flex items-center gap-1 shadow-[2px_2px_0px_#000]">
                              <Coins className="w-3.5 h-3.5 text-black shrink-0" />
                              <span>{chest.cost} GEMS</span>
                            </div>
                          </div>

                          <p className="text-xs font-mono text-zinc-300 bg-black/60 p-2 border border-white/10">
                            {chest.description}
                          </p>
                        </div>

                        {/* Post-Purchase vs Purchase Button State */}
                        <div className="pt-2 border-t border-white/10">
                          {isJustPurchased ? (
                            /* Inline Post-Purchase Banner with 2 Buttons */
                            <div className="bg-amber-400 text-black font-black text-xs p-3 border-2 border-black shadow-[3px_3px_0px_#000] flex flex-col gap-2">
                              <span>CHEST ACQUIRED! Open now with animation or find it in Trophy Room.</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleOpenNow()}
                                  className="bg-black text-amber-400 border-2 border-amber-400 min-h-[44px] flex-1 font-black text-xs uppercase cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                                >
                                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span>OPEN NOW</span>
                                </button>
                                <button
                                  onClick={handleSaveToTrophyRoom}
                                  className="bg-white/10 text-white border-2 border-white min-h-[44px] flex-1 font-black text-xs uppercase cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                                  <span>SAVE TO TROPHY ROOM</span>
                                </button>
                              </div>
                            </div>
                          ) : isPurchased ? (
                            <div className="w-full py-2.5 bg-neutral-900 text-emerald-400 border-2 border-emerald-500 font-mono font-black text-xs uppercase flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>CLAIMED & STORED</span>
                            </div>
                          ) : !isAffordable ? (
                            <button
                              disabled
                              className="w-full py-2.5 bg-neutral-900 text-zinc-500 border-2 border-slate-800 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
                            >
                              <Lock className="w-4 h-4 text-zinc-500" />
                              <span>LOCKED (NEED {chest.cost - gemBalance} MORE GEMS)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyChest(chest)}
                              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#fff] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                            >
                              <Gift className="w-4 h-4 text-black shrink-0" />
                              <span>PURCHASE CHEST ({chest.cost} GEMS)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* YOUR CHEST VAULT SECTION */}
                <div className="mt-8 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-4">
                    <h3 className="font-black uppercase text-xs text-amber-400 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>YOUR CHEST VAULT ({vaultChests.length} UNOPENED)</span>
                    </h3>
                    <button
                      onClick={onClose}
                      className="text-zinc-400 hover:text-amber-400 text-xs font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <span>GO TO TROPHY ROOM</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {vaultChests.length === 0 ? (
                    <p className="text-zinc-500 text-sm italic font-mono p-4 bg-neutral-900/50 border border-slate-800 text-center">
                      No unopened chests currently in vault. Purchase one above or earn match loot to stock your vault!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {vaultChests.map((vChest, idx) => (
                        <div
                          key={`vault_${vChest.matchId || idx}`}
                          className="border-2 border-amber-400/60 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0c0d14] shadow-[4px_4px_0px_#000]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-400/10 border-2 border-amber-400 flex items-center justify-center shrink-0">
                              <Gift className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <span className="font-black uppercase text-white text-sm block">
                                {vChest.mode ? vChest.mode.replace(/_/g, ' ') : 'Mystery Combat Chest'}
                              </span>
                              <span className="text-zinc-400 text-xs font-mono">
                                Stored in Trophy Room → Ready to open
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleOpenNow(vChest)}
                              className="flex-1 sm:flex-none min-h-[42px] px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#fff] cursor-pointer flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
                            >
                              <Gift className="w-3.5 h-3.5 text-black shrink-0" />
                              <span>OPEN NOW</span>
                            </button>
                            <button
                              onClick={onClose}
                              className="flex-1 sm:flex-none min-h-[42px] px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase border border-white/30 cursor-pointer flex items-center justify-center gap-1"
                              title="View in Trophy Room"
                            >
                              <span>TROPHY ROOM</span>
                              <ArrowRight className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: SECRET UNLOCK                                           */}
            {/* ============================================================== */}
            {activeTab === 'secrets' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SECRET_PLAYERS.filter((player) => player.id !== 'boy_friend' && player.id !== 'girl_friend').map((player) => {
                  const isUnlocked = Boolean(unlockedSecretMap[player.id]);
                  const isAffordable = gemBalance >= 800;
                  const isAnimating = animatingUnlockId === player.id;

                  return (
                    <div
                      key={player.id}
                      className={`bg-[#0c0d14] border-2 border-slate-300 p-4 flex flex-col justify-between gap-3 w-full shadow-[4px_4px_0px_#fff] ${
                        isAnimating ? 'animate-secret-reveal' : ''
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {/* Avatar Display */}
                          <div className="w-16 h-16 bg-black border-2 border-amber-400 overflow-hidden shrink-0 shadow-[2px_2px_0px_#000]">
                            {player.avatarSrc ? (
                              <img
                                src={player.avatarSrc}
                                alt={player.realName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full ${player.avatarBg} flex items-center justify-center text-2xl`}>
                                {player.avatarIcon}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-base font-black uppercase text-amber-400 truncate">
                                {player.realName}
                              </h3>
                              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-amber-400 text-black border border-black shrink-0">
                                800 GEMS
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-300 truncate mt-0.5">
                              {player.title}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs font-mono text-zinc-300 bg-black/60 p-2 border border-white/10">
                          {player.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800">
                        {isUnlocked ? (
                          <div className="space-y-2">
                            <div className="bg-black border-2 border-amber-400 p-3 text-center font-mono font-black text-amber-400 text-xl tracking-[0.3em]">
                              {player.passcode}
                            </div>

                            <button
                              onClick={() => {
                                onClose();
                                onOpenSecretArena();
                              }}
                              className="w-full min-h-[48px] bg-amber-400 text-black font-black uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_#fff] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
                            >
                              <ArrowRight className="w-4 h-4 text-black shrink-0" />
                              <span>PLAY NOW IN ARENA</span>
                            </button>
                          </div>
                        ) : !isAffordable ? (
                          <button
                            disabled
                            className="w-full py-2.5 bg-neutral-900 text-zinc-500 border-2 border-slate-800 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
                          >
                            <Lock className="w-4 h-4 text-zinc-500" />
                            <span>LOCKED (NEED {800 - gemBalance} MORE GEMS)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnlockSecretPlayer(player.id, player.realName)}
                            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#fff] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                          >
                            <Unlock className="w-4 h-4 text-black shrink-0" />
                            <span>UNLOCK CHARACTER (800 GEMS)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Interactive 3-Tap Chest Opening Animation Modal */}
      {activeOpeningEvent && (
        <ChestModal
          isOpen={Boolean(activeOpeningEvent)}
          result={activeOpeningEvent.result || 'win'}
          matchId={activeOpeningEvent.matchId}
          userId={userId}
          onApplyEloBoost={(boost) => {
            onEloDeduct(-boost);
          }}
          onClose={handleChestModalClose}
          onPlaySecretPlayer={(_reward: SecretPlayerRewardDef) => {
            setActiveOpeningEvent(null);
            onClose();
            onOpenSecretArena();
          }}
        />
      )}
    </div>
  );
};
