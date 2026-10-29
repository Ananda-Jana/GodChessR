import React, { useState, useEffect, useCallback } from 'react';
import {
  getGems,
  spendGems,
  deductEloForGems,
  recordChestPurchase,
  getMugenCrypto,
  convertGemsToCrypto,
  getEloShieldStatus,
  activateEloShield,
  getUnlockedSecretCodes,
  unlockSecretCode,
} from './mugenStore';
import { MugenGemIcon } from './MugenGemIcon';
import { MugenCryptoIcon } from './MugenCryptoIcon';
import {
  unlockSecretPlayer,
  PendingChestEvent,
  addPendingChestEvent,
} from '../chest/chestStore';
import { ChestModal } from '../chest/ChestModal';
import { SECRET_PLAYERS } from '../secret/secretPlayersData';
import { SecretEngineCodeModal } from '../secret/components/SecretEngineCodeModal';
import { SecretPlayerConfig } from '../secret/types';
import {
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Flame,
  Zap,
  ArrowLeftRight,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Package,
  KeyRound,
  AlertCircle,
  Coins,
  Swords,
  ChevronDown,
  Trophy,
} from 'lucide-react';

export type StoreTab = 'ore_conversion' | 'secret_blueprints' | 'chest_vault';

interface MugenGemStoreProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentElo: number;
  onEloDeduct: (amount: number) => void;
  onOpenSecretArena: () => void;
  initialTab?: StoreTab;
}

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
    description: 'Tactical combat artifact containing hidden battle relics and rating boosts.',
    borderColorClass: 'border-slate-400',
    accentTextClass: 'text-slate-300',
  },
  {
    id: 'chest_crimson',
    name: 'Crimson Chest',
    cost: 600,
    description: 'Secret character fragment imbued with ancient battle energy and tactics.',
    borderColorClass: 'border-red-500',
    accentTextClass: 'text-red-400',
  },
  {
    id: 'chest_void',
    name: 'Void Chest',
    cost: 900,
    description: 'Legendary codex card with high-tier rating attributes and secret PINs.',
    borderColorClass: 'border-purple-500',
    accentTextClass: 'text-purple-400',
  },
  {
    id: 'chest_mugen',
    name: 'Mugen Chest',
    cost: 1200,
    description: 'Ultimate ELO boost relic granting massive session rating protection power.',
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
  initialTab = 'ore_conversion',
}) => {
  const [activeTab, setActiveTab] = useState<StoreTab>(initialTab);
  const [gemBalance, setGemBalance] = useState<number>(0);
  const [cryptoBalance, setCryptoBalance] = useState<number>(0);
  const [eloShieldStatus, setEloShieldStatus] = useState<{ active: boolean; matchesRemaining: number }>({
    active: false,
    matchesRemaining: 0,
  });
  const [unlockedCodes, setUnlockedCodes] = useState<string[]>([]);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<'success' | 'error' | 'info'>('info');

  // Active chest opening modal state
  const [activeChestEvent, setActiveChestEvent] = useState<PendingChestEvent | null>(null);

  // Pending purchase routing choice modal state (Open Immediately vs Store in Trophy Room)
  const [purchasedChestForChoice, setPurchasedChestForChoice] = useState<{
    chest: ChestCatalogItem;
    chestEvent: PendingChestEvent;
  } | null>(null);

  // Active PIN inspector modal
  const [selectedBotForCode, setSelectedBotForCode] = useState<SecretPlayerConfig | null>(null);

  // Synchronize balances and statuses
  const syncWallet = useCallback(() => {
    setGemBalance(getGems(userId));
    setCryptoBalance(getMugenCrypto(userId));
    setEloShieldStatus(getEloShieldStatus(userId));
    setUnlockedCodes(getUnlockedSecretCodes(userId));
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      syncWallet();
    }
  }, [isOpen, initialTab, syncWallet]);

  useEffect(() => {
    const handleEconomyUpdate = () => {
      syncWallet();
    };
    window.addEventListener('mugen_economy_update', handleEconomyUpdate);
    return () => window.removeEventListener('mugen_economy_update', handleEconomyUpdate);
  }, [syncWallet]);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNoticeMessage(msg);
    setNoticeType(type);
    setTimeout(() => {
      setNoticeMessage(null);
    }, 4500);
  };

  if (!isOpen) return null;

  // Handle Gem to Crypto conversion
  const handleConvertGemsToCrypto = (gemsAmount: number) => {
    if (gemBalance < gemsAmount) {
      showNotification(`Insufficient Mugen Gems. You need ${gemsAmount} gems to convert.`, 'error');
      return;
    }
    const res = convertGemsToCrypto(userId, gemsAmount);
    if (res.success) {
      syncWallet();
      showNotification(
        `Successfully converted ${res.gemsSpent} Gems into ${res.cryptoGained} Mugen Crypto.`,
        'success'
      );
    } else {
      showNotification('Currency conversion failed. Please check your balance.', 'error');
    }
  };

  // Handle ELO Shield Activation
  const handleActivateEloShield = () => {
    if (cryptoBalance < 1) {
      showNotification('Insufficient Mugen Crypto. 1 Crypto is required to activate ELO Shield.', 'error');
      return;
    }
    const success = activateEloShield(userId);
    if (success) {
      syncWallet();
      showNotification('ELO Protection Shield Activated. Your rating is shielded against next defeat.', 'success');
    } else {
      showNotification('Failed to activate ELO Shield. Insufficient Crypto balance.', 'error');
    }
  };

  // Handle ELO to Gems deduction
  const handleDeductElo = (eloAmount: number) => {
    if (currentElo <= 50) {
      showNotification('Current ELO rating is at baseline minimum. Cannot deduct further.', 'error');
      return;
    }
    const { newElo, gemsAwarded } = deductEloForGems(userId, currentElo, eloAmount);
    if (gemsAwarded > 0) {
      onEloDeduct(currentElo - newElo);
      syncWallet();
      showNotification(`Converted ${currentElo - newElo} ELO into +${gemsAwarded} Mugen Gems.`, 'success');
    } else {
      showNotification('Unable to deduct ELO. Minimum rating limit reached.', 'error');
    }
  };

  // Handle Secret Blueprint 6-digit PIN Unlock
  const handleUnlockSecretBlueprint = (botConfig: SecretPlayerConfig) => {
    if (unlockedCodes.includes(botConfig.id)) {
      setSelectedBotForCode(botConfig);
      return;
    }
    if (cryptoBalance < 1) {
      showNotification(
        `Insufficient Mugen Crypto. 1 Crypto required to decrypt ${botConfig.publicName}'s 6-digit PIN.`,
        'error'
      );
      return;
    }
    const success = unlockSecretCode(userId, botConfig.id);
    if (success) {
      // Also unlock character in secret arena system
      unlockSecretPlayer(userId, botConfig.id as any);
      syncWallet();
      showNotification(
        `Decryption complete! ${botConfig.publicName}'s 6-digit access PIN is unlocked.`,
        'success'
      );
      setSelectedBotForCode(botConfig);
    } else {
      showNotification('Failed to decrypt secret PIN.', 'error');
    }
  };

  // Handle Chest Purchase - routes through choice popup
  const handleBuyChest = (chest: ChestCatalogItem) => {
    if (gemBalance < chest.cost) {
      showNotification(`Insufficient gems. Need ${chest.cost} gems to purchase ${chest.name}.`, 'error');
      return;
    }

    const spent = spendGems(userId, chest.cost);
    if (!spent) {
      showNotification('Transaction failed. Please verify your gem balance.', 'error');
      return;
    }

    recordChestPurchase(userId, chest.id);
    syncWallet();

    const chestEvent: PendingChestEvent = {
      matchId: `store_purchase_${Date.now()}`,
      mode: 'store',
      result: 'win',
      userId,
      directOpen: true,
      eloBoost: chest.id === 'chest_mugen' ? 25 : chest.id === 'chest_void' ? 18 : 10,
    };

    setPurchasedChestForChoice({ chest, chestEvent });
  };

  const handleOpenPurchasedChestNow = () => {
    if (!purchasedChestForChoice) return;
    const { chest, chestEvent } = purchasedChestForChoice;
    setPurchasedChestForChoice(null);
    setActiveChestEvent(chestEvent);
    showNotification(`Opening ${chest.name} rewards...`, 'info');
  };

  const handleStorePurchasedChestInTrophyRoom = () => {
    if (!purchasedChestForChoice) return;
    const { chest, chestEvent } = purchasedChestForChoice;
    addPendingChestEvent(chestEvent, userId);
    setPurchasedChestForChoice(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trophy_room_updated'));
      window.dispatchEvent(new CustomEvent('mugen_chest_stored', { detail: { chestId: chest.id } }));
    }
    showNotification(
      `Saved ${chest.name} to your Trophy Room inventory! You can open it anytime from the Trophy Room.`,
      'success'
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Mugen Aura Vault Store"
        onClick={onClose}
      >
        <div
          className="w-full max-w-5xl bg-[#0a0c10] border-2 sm:border-3 border-yellow-400/80 shadow-[0_0_35px_rgba(250,204,21,0.25),6px_6px_0px_#000000] text-white relative flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden rounded-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOP HEADER: Brutalist Aesthetic & Responsive Mobile Layout */}
          <div className="bg-[#0b0c10] border-b-2 sm:border-b-3 border-black p-2.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_#000] shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                    ORE ECONOMY
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 font-bold uppercase truncate">
                    TACTICAL RESERVE
                  </span>
                </div>
                <h1 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-wider text-white truncate">
                  MUGEN AURA VAULT
                </h1>
              </div>
            </div>

            {/* Balances & Close (Touch-friendly & Responsive) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto sm:ml-0">
              {/* Gem Balance Badge */}
              <div
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-500/10 border-2 border-amber-500/40 shadow-[2px_2px_0px_#000]"
                title="Current Mugen Gems"
              >
                <MugenGemIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase text-amber-300 font-bold leading-none">
                    GEMS
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-amber-400 leading-tight">
                    {gemBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Crypto Balance Badge */}
              <div
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-400/10 border-2 border-yellow-400/40 shadow-[2px_2px_0px_#000]"
                title="Current Mugen Crypto"
              >
                <MugenCryptoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase text-yellow-300 font-bold leading-none">
                    CRYPTO
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-yellow-400 leading-tight">
                    {cryptoBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2.5 bg-neutral-900 hover:bg-red-600 border-2 border-black text-white shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
                aria-label="Close Store"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* NOTIFICATION BANNER */}
          {noticeMessage && (
            <div
              className={`px-3 sm:px-4 py-2 text-xs font-mono font-bold flex items-center justify-between border-b-2 border-black animate-in fade-in duration-150 shrink-0 ${
                noticeType === 'success'
                  ? 'bg-emerald-500 text-black'
                  : noticeType === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-yellow-400 text-black'
              }`}
            >
              <div className="flex items-center gap-2">
                {noticeType === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">{noticeMessage}</span>
              </div>
              <button
                onClick={() => setNoticeMessage(null)}
                className="p-0.5 hover:opacity-75 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TABS NAVIGATION: Responsive text, zero emojis */}
          <div className="grid grid-cols-3 bg-[#0d0f15] border-b-2 sm:border-b-3 border-black p-1 sm:p-2 gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('ore_conversion')}
              className={`py-2 sm:py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
                activeTab === 'ore_conversion'
                  ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] translate-y-[-1px]'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate"><span className="hidden sm:inline">ORE </span>CONVERSION</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('secret_blueprints')}
              className={`py-2 sm:py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
                activeTab === 'secret_blueprints'
                  ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] translate-y-[-1px]'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate"><span className="hidden sm:inline">SECRET </span>PIN VAULT</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chest_vault')}
              className={`py-2 sm:py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
                activeTab === 'chest_vault'
                  ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] translate-y-[-1px]'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate"><span className="hidden sm:inline">CHEST </span>VAULT</span>
            </button>
          </div>

          {/* TAB CONTENTS CONTAINER: Scrollable with momentum & responsive padding */}
          <div className="p-2.5 sm:p-5 md:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6 overscroll-contain">
            {/* TAB 1: ORE CONVERSION */}
            {activeTab === 'ore_conversion' && (
              <div className="space-y-4 sm:space-y-6">
                {/* MOBILE VIEW: Card 1 -> Card 3 -> Card 2 (Elo Protection at bottom of mobile scroll) */}
                <div className="md:hidden flex flex-col gap-3">
                  {/* CARD 1: GEM TO CRYPTO CONVERSION */}
                  <div className="bg-[#0e1117] border-2 border-black shadow-[4px_4px_0px_#000] p-3.5 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <MugenCryptoIcon className="w-5 h-5 text-yellow-400 shrink-0" />
                        <h3 className="text-sm font-black uppercase text-white tracking-wide truncate">
                          GEM ➔ CRYPTO CONVERSION
                        </h3>
                      </div>
                      <span className="px-1.5 py-0.5 bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 font-mono font-black text-[9px] uppercase shrink-0">
                        CATALYST ORE
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 mb-2.5">
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => handleConvertGemsToCrypto(1000)}
                          disabled={gemBalance < 1000}
                          className={`min-h-[44px] py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-1.5 transition-all ${
                            gemBalance >= 1000
                              ? 'bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5'
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-black" />
                          <span>1,000 GEMS ➔ 1 CRYPTO</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConvertGemsToCrypto(2000)}
                          disabled={gemBalance < 2000}
                          className={`min-h-[44px] py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-1.5 transition-all ${
                            gemBalance >= 2000
                              ? 'bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5'
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 text-black" />
                          <span>2,000 GEMS ➔ 2 CRYPTO</span>
                        </button>
                      </div>

                      <details className="border border-neutral-800 bg-black/50 p-2.5 text-xs text-neutral-300 group">
                        <summary className="font-bold text-xs text-yellow-400 flex items-center justify-between cursor-pointer select-none">
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Quick Rules & Exchange Lore</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="pt-2.5 space-y-2 border-t border-neutral-800 mt-2">
                          <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
                            Mugen Crypto is a secondary asset minted through Mugen Gem fusion. Fixed rate:{' '}
                            <span className="text-yellow-400 font-bold">1,000 Gems = 1 Crypto</span> (2,000 Gems = 2 Crypto).
                          </p>
                          <div className="p-2 bg-black border border-neutral-800 font-mono text-[10px] space-y-1">
                            <div className="flex justify-between text-neutral-400">
                              <span>Wallet Balance:</span>
                              <span className="text-amber-400 font-bold">{gemBalance.toLocaleString()} Gems</span>
                            </div>
                            <div className="flex justify-between text-neutral-400">
                              <span>Crypto Reserves:</span>
                              <span className="text-yellow-400 font-bold">{cryptoBalance.toLocaleString()} Crypto</span>
                            </div>
                            <div className="text-[9px] text-yellow-400/90 italic pt-1 border-t border-neutral-800">
                              Direct ELO to Crypto exchange is disabled to preserve competitive integrity.
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* CARD 3: ELO TO GEMS CATALYST */}
                  <div className="bg-[#0e1117] border-2 border-black shadow-[4px_4px_0px_#000] p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400 shrink-0" />
                        <h3 className="text-sm font-black uppercase text-white tracking-wide">
                          ELO TO GEMS CATALYST
                        </h3>
                      </div>
                      <span className="text-[9px] font-mono font-black px-2 py-0.5 bg-yellow-400 text-black border border-black uppercase">
                        50 ELO = 500 GEMS
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeductElo(50)}
                          disabled={currentElo <= 50}
                          className="min-h-[44px] py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-0.5 active:translate-y-0.5"
                        >
                          -50 ELO ➔ +500 GEMS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeductElo(100)}
                          disabled={currentElo <= 100}
                          className="min-h-[44px] py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-0.5 active:translate-y-0.5"
                        >
                          -100 ELO ➔ +1,000 GEMS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeductElo(200)}
                          disabled={currentElo <= 200}
                          className="min-h-[44px] py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-0.5 active:translate-y-0.5"
                        >
                          -200 ELO ➔ +2,000 GEMS
                        </button>
                      </div>

                      <details className="border border-neutral-800 bg-black/50 p-2.5 text-xs text-neutral-300 group">
                        <summary className="font-bold text-xs text-yellow-400 flex items-center justify-between cursor-pointer select-none">
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Catalyst Rules & Balance Requirements</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="pt-2 space-y-1.5 border-t border-neutral-800 mt-2">
                          <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
                            Exchange excess ELO rating into Mugen Gems to fund chest unlocks and crypto ore fusion.
                            Requires minimum 50 ELO remaining balance.
                          </p>
                          <p className="text-[10px] font-mono text-neutral-400">
                            Current Rating: <span className="text-yellow-400 font-bold">{currentElo} ELO</span>
                          </p>
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* CARD 2: ELO PROTECTION BARRIER (AT BOTTOM OF MOBILE SCROLL) */}
                  <div className="bg-[#0e1117] border-2 border-black shadow-[4px_4px_0px_#000] p-3.5 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                        <h3 className="text-sm font-black uppercase text-white tracking-wide truncate">
                          ELO PROTECTION BARRIER
                        </h3>
                      </div>
                      <span className="px-1.5 py-0.5 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-mono font-black text-[9px] uppercase shrink-0">
                        RATING SHIELD
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 mb-2.5">
                      <div
                        className={`p-2.5 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-between gap-2 ${
                          eloShieldStatus.active
                            ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {eloShieldStatus.active ? (
                            <div className="p-1 bg-emerald-500 text-black border border-black animate-pulse shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="p-1 bg-neutral-800 text-neutral-400 border border-neutral-700 shrink-0">
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-[9px] font-mono uppercase block font-bold text-neutral-400">
                              Barrier Status
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-white truncate block">
                              {eloShieldStatus.active
                                ? `ACTIVE (${eloShieldStatus.matchesRemaining} SHIELDED)`
                                : 'INACTIVE'}
                            </span>
                          </div>
                        </div>

                        {eloShieldStatus.active && (
                          <span className="text-[9px] font-mono font-black px-2 py-0.5 bg-emerald-500 text-black border border-black uppercase shrink-0">
                            ARMED
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleActivateEloShield}
                        disabled={cryptoBalance < 1}
                        className={`w-full min-h-[44px] py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 transition-all ${
                          cryptoBalance >= 1
                            ? 'bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5'
                            : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>ACTIVATE ELO SHIELD (1 CRYPTO)</span>
                      </button>

                      <details className="border border-neutral-800 bg-black/50 p-2.5 text-xs text-neutral-300 group">
                        <summary className="font-bold text-xs text-yellow-400 flex items-center justify-between cursor-pointer select-none">
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Shield Mechanics & Rules</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="pt-2 border-t border-neutral-800 mt-2">
                          <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
                            Imbue your matches with an evaluation barrier. When active, losing a rated match will{' '}
                            <span className="text-emerald-400 font-bold">NOT decrease your ELO rating</span>. Consumes 1 shield charge per defeat.
                          </p>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>

                {/* DESKTOP VIEW: Card 1 & Card 2 side by side, Card 3 below */}
                <div className="hidden md:grid grid-cols-2 gap-4">
                  {/* CARD 1: GEM TO CRYPTO CONVERSION */}
                  <div className="bg-[#0e1117] border-3 border-black shadow-[4px_4px_0px_#000] p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <MugenCryptoIcon className="w-6 h-6 text-yellow-400 shrink-0" />
                        <h3 className="text-base font-black uppercase text-white tracking-wide truncate">
                          GEM ➔ CRYPTO CONVERSION
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 font-mono font-black text-[10px] uppercase shrink-0">
                        CATALYST ORE
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-medium mb-3">
                        Mugen Crypto is a secondary asset minted through Mugen Gem fusion. Fixed rate:{' '}
                        <span className="text-yellow-400 font-bold">1,000 Gems = 1 Crypto</span> (2,000 Gems = 2 Crypto).
                      </p>

                      <div className="p-2.5 bg-black/60 border border-neutral-800 font-mono text-[11px] mb-4 space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>Wallet Balance:</span>
                          <span className="text-amber-400 font-bold">{gemBalance.toLocaleString()} Gems</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Crypto Reserves:</span>
                          <span className="text-yellow-400 font-bold">{cryptoBalance.toLocaleString()} Crypto</span>
                        </div>
                        <div className="text-[10px] text-yellow-400/90 italic pt-1 border-t border-neutral-800">
                          Direct ELO to Crypto exchange is disabled to preserve competitive integrity.
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConvertGemsToCrypto(1000)}
                          disabled={gemBalance < 1000}
                          className={`min-h-[44px] py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-1.5 transition-all ${
                            gemBalance >= 1000
                              ? 'bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5'
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>1,000 GEMS ➔ 1 CRYPTO</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConvertGemsToCrypto(2000)}
                          disabled={gemBalance < 2000}
                          className={`min-h-[44px] py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-1.5 transition-all ${
                            gemBalance >= 2000
                              ? 'bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5'
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>2,000 GEMS ➔ 2 CRYPTO</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: ELO PROTECTION BARRIER */}
                  <div className="bg-[#0e1117] border-3 border-black shadow-[4px_4px_0px_#000] p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <Shield className="w-6 h-6 text-emerald-400 shrink-0" />
                        <h3 className="text-base font-black uppercase text-white tracking-wide truncate">
                          ELO PROTECTION BARRIER
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-mono font-black text-[10px] uppercase shrink-0">
                        RATING SHIELD
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-medium mb-3">
                        Imbue your matches with an evaluation barrier. When active, losing a rated match will{' '}
                        <span className="text-emerald-400 font-bold">NOT decrease your ELO rating</span>. Consumes 1 shield charge per defeat.
                      </p>

                      <div
                        className={`p-3 border-2 border-black shadow-[2px_2px_0px_#000] mb-4 flex items-center justify-between gap-2.5 ${
                          eloShieldStatus.active
                            ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {eloShieldStatus.active ? (
                            <div className="p-1.5 bg-emerald-500 text-black border border-black animate-pulse shrink-0">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="p-1.5 bg-neutral-800 text-neutral-400 border border-neutral-700 shrink-0">
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono uppercase block font-bold text-neutral-400">
                              Protection Status
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-white truncate block">
                              {eloShieldStatus.active
                                ? `BARRIER ACTIVE (${eloShieldStatus.matchesRemaining} SHIELDED)`
                                : 'BARRIER INACTIVE'}
                            </span>
                          </div>
                        </div>

                        {eloShieldStatus.active && (
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-emerald-500 text-black border border-black uppercase shrink-0">
                            ARMED
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleActivateEloShield}
                        disabled={cryptoBalance < 1}
                        className={`w-full min-h-[44px] py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 transition-all ${
                          cryptoBalance >= 1
                            ? 'bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5'
                            : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>ACTIVATE ELO SHIELD (1 CRYPTO)</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 3: ELO TO GEMS CATALYST (col-span-2) */}
                  <div className="bg-[#0e1117] border-3 border-black shadow-[4px_4px_0px_#000] p-5 md:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400 shrink-0" />
                        <h3 className="text-base font-black uppercase text-white tracking-wide">
                          ELO TO GEMS CATALYST
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-yellow-400 text-black border border-black uppercase">
                        50 ELO = 500 GEMS
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed font-medium mb-4">
                      Exchange excess ELO rating into Mugen Gems to fund chest unlocks and crypto ore fusion.
                      Requires minimum 50 ELO remaining balance.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeductElo(50)}
                        disabled={currentElo <= 50}
                        className="min-h-[44px] py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-0.5 active:translate-y-0.5"
                      >
                        -50 ELO ➔ +500 GEMS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeductElo(100)}
                        disabled={currentElo <= 100}
                        className="min-h-[44px] py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-0.5 active:translate-y-0.5"
                      >
                        -100 ELO ➔ +1,000 GEMS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeductElo(200)}
                        disabled={currentElo <= 200}
                        className="min-h-[44px] py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-0.5 active:translate-y-0.5"
                      >
                        -200 ELO ➔ +2,000 GEMS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SECRET BLUEPRINTS (6-DIGIT PIN VAULT) */}
            {activeTab === 'secret_blueprints' && (
              <div className="space-y-4">
                <div className="p-3 sm:p-4 bg-[#12141a] border-2 border-yellow-400/40 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <KeyRound className="w-5 h-5 text-yellow-400 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black uppercase text-white">
                        SECRET CHARACTER 6-DIGIT PIN DECRYPTION
                      </h4>
                      <p className="text-[11px] text-neutral-300 font-medium">
                        Spend 1 Mugen Crypto to decrypt any secret AI opponent's 6-digit access PIN. Unlocks the character and provides direct access to battle in the Secret Arena.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSecretArena();
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] shrink-0 cursor-pointer flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Swords className="w-3.5 h-3.5 text-black" />
                    <span>OPEN SECRET ARENA</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {SECRET_PLAYERS.map((player) => {
                    const isUnlocked = unlockedCodes.includes(player.id);
                    return (
                      <div
                        key={player.id}
                        className="bg-[#0e1117] border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] p-3.5 sm:p-4 flex flex-col justify-between relative group"
                      >
                        {/* Status Tag */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                          <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-neutral-900 text-yellow-400 border border-yellow-400/40 uppercase">
                            6-DIGIT PIN
                          </span>
                          <span
                            className={`text-[10px] font-mono font-black uppercase px-1.5 py-0.5 border ${
                              isUnlocked
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                          >
                            {isUnlocked ? 'DECRYPTED' : 'ENCRYPTED'}
                          </span>
                        </div>

                        {/* Character Info */}
                        <div className="flex gap-3 items-center mb-3">
                          <div className="w-14 h-14 bg-black border-2 border-neutral-700 shrink-0 overflow-hidden relative">
                            {player.avatarSrc ? (
                              <img
                                src={player.avatarSrc}
                                alt={player.publicName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-neutral-800">
                                {player.publicName[0]}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black uppercase text-white truncate group-hover:text-yellow-400 transition-colors">
                              {player.publicName}
                            </h4>
                            <p className="text-[11px] font-bold text-yellow-300/90 truncate">
                              {player.title}
                            </p>
                            <p className="text-[10px] text-neutral-400 line-clamp-1 italic">
                              "{player.tagline}"
                            </p>
                          </div>
                        </div>

                        {/* Button Actions: Brutalist Yellow */}
                        {isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => setSelectedBotForCode(player)}
                            className="w-full min-h-[44px] py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
                          >
                            <KeyRound className="w-4 h-4 text-black stroke-[2.5]" />
                            <span>VIEW 6-DIGIT PIN</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUnlockSecretBlueprint(player)}
                            disabled={cryptoBalance < 1}
                            className={`w-full min-h-[44px] py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 transition-transform ${
                              cryptoBalance >= 1
                                ? 'bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5'
                                : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <Unlock className="w-4 h-4 text-black stroke-[2.5]" />
                            <span>DECRYPT PIN (1 CRYPTO)</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CHEST VAULT */}
            {activeTab === 'chest_vault' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {CHEST_CATALOG.map((chest) => {
                    const canAfford = gemBalance >= chest.cost;
                    return (
                      <div
                        key={chest.id}
                        className={`bg-[#0e1117] border-2 sm:border-3 ${chest.borderColorClass} shadow-[4px_4px_0px_#000] p-3.5 sm:p-4 flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                            <span className="text-[10px] font-mono font-black uppercase text-neutral-400">
                              REWARD CHEST
                            </span>
                            <div className="flex items-center gap-1 text-amber-400 font-mono font-black text-xs">
                              <MugenGemIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span>{chest.cost}</span>
                            </div>
                          </div>

                          <div className="py-3 sm:py-4 flex justify-center">
                            <Package className={`w-12 h-12 sm:w-14 sm:h-14 ${chest.accentTextClass} animate-pulse`} />
                          </div>

                          <h4 className="text-sm font-black uppercase text-white mb-1">
                            {chest.name}
                          </h4>
                          <p className="text-[11px] text-neutral-300 font-medium leading-relaxed mb-4 line-clamp-3">
                            {chest.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBuyChest(chest)}
                          disabled={!canAfford}
                          className={`w-full min-h-[44px] py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-1.5 transition-transform ${
                            canAfford
                              ? 'bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5'
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <MugenGemIcon className="w-3.5 h-3.5" />
                          <span>UNLOCK ({chest.cost} GEMS)</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secret PIN Decryption Modal */}
      <SecretEngineCodeModal
        isOpen={Boolean(selectedBotForCode)}
        onClose={() => setSelectedBotForCode(null)}
        player={selectedBotForCode}
        onLaunchArena={() => {
          setSelectedBotForCode(null);
          onClose();
          onOpenSecretArena();
        }}
      />

      {/* Chest Acquisition Routing Choice Modal */}
      {purchasedChestForChoice && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Chest Routing Choice"
          onClick={handleStorePurchasedChestInTrophyRoom}
        >
          <div
            className="w-full max-w-sm sm:max-w-md bg-[#0a0c10] border-3 border-yellow-400 text-white shadow-[0_0_35px_rgba(250,204,21,0.35),8px_8px_0px_#000000] p-4 sm:p-6 relative flex flex-col items-center text-center gap-3.5 sm:gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleStorePurchasedChestInTrophyRoom}
              className="absolute top-2.5 right-2.5 p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
              title="Store in Trophy Room and Close"
              aria-label="Store in Trophy Room and Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-yellow-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#fff]">
              <Package className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-black text-yellow-400 uppercase tracking-widest px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/30">
                CHEST UNLOCKED
              </span>
              <h3 className="text-base sm:text-lg font-black uppercase text-white mt-1.5">
                {purchasedChestForChoice.chest.name}
              </h3>
              <p className="text-xs text-neutral-300 font-medium mt-1 leading-relaxed max-w-sm">
                Would you like to open your chest immediately to reveal mystery rewards, or store it in your Trophy Room to open later?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
              <button
                type="button"
                onClick={handleOpenPurchasedChestNow}
                className="flex-1 min-h-[44px] py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Zap className="w-4 h-4 text-black stroke-[2.5]" />
                <span>OPEN IMMEDIATELY</span>
              </button>

              <button
                type="button"
                onClick={handleStorePurchasedChestInTrophyRoom}
                className="flex-1 min-h-[44px] py-2.5 px-3 bg-black hover:bg-neutral-900 text-yellow-400 font-black text-xs uppercase tracking-wider border-2 border-yellow-400 shadow-[4px_4px_0px_#facc15] flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Trophy className="w-4 h-4 text-yellow-400 stroke-[2.5]" />
                <span>STORE IN TROPHY ROOM</span>
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 font-mono">
              Stored chests can be accessed anytime from the Trophy Room Chest Vault.
            </p>
          </div>
        </div>
      )}

      {/* Chest Opening Award Host Modal */}
      {activeChestEvent && (
        <ChestModal
          isOpen={Boolean(activeChestEvent)}
          result={activeChestEvent.result}
          matchId={activeChestEvent.matchId}
          initialEloBoost={activeChestEvent.eloBoost}
          userId={userId}
          onClose={() => setActiveChestEvent(null)}
          onPlaySecretPlayer={() => {
            setActiveChestEvent(null);
            onClose();
          }}
        />
      )}
    </>
  );
};
