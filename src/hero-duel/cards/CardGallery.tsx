import React, { useState, useEffect, useRef } from 'react';
import { CollectibleHeroCard } from '../types/cardTypes';
import { CardRarity } from '../types/heroDuelTypes';
import { getCardCollection, exportCollectionAsJson, importCollectionFromJson } from './collectionStore';
import { renderCardToCanvas, downloadCardPng } from './cardRenderer';
import {
  ArrowLeft,
  Download,
  Share2,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  Upload,
  FileJson,
  X,
} from 'lucide-react';
import { RARITY_CONFIGS } from '../config/rarityConfig';

interface CardGalleryProps {
  onBack: () => void;
}

import { CardLab } from './CardLab';
import { FlaskConical } from 'lucide-react';

export const CardGallery: React.FC<CardGalleryProps> = ({ onBack }) => {
  const [cards, setCards] = useState<CollectibleHeroCard[]>([]);
  const [selectedRarity, setSelectedRarity] = useState<CardRarity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCard, setActiveCard] = useState<CollectibleHeroCard | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [showLab, setShowLab] = useState<boolean>(() => {
    return window.location.search.includes('lab=1');
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    const list = await getCardCollection();
    setCards(list);
  };

  if (showLab) {
    return <CardLab onBack={() => setShowLab(false)} />;
  }

  const filteredCards = cards.filter((c) => {
    const matchesRarity = selectedRarity === 'all' || c.rarity === selectedRarity;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.heroName.toLowerCase().includes(q) ||
      c.japaneseWord.meaning.toLowerCase().includes(q) ||
      c.japaneseWord.romaji.toLowerCase().includes(q);
    return matchesRarity && matchesQuery;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = async (card: CollectibleHeroCard) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hero Duel Card: ${card.heroName}`,
          text: `Check out my ${card.rarity.toUpperCase()} ${card.heroName} card (Code #${card.code}) on MugenChessX!`,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyCode(card.code);
    }
  };

  const handleExport = async () => {
    const json = await exportCollectionAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HeroDuel_Collection_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusNotice('Collection exported successfully!');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const count = await importCollectionFromJson(text);
        await loadCards();
        setStatusNotice(`Imported ${count} cards to collection!`);
        setTimeout(() => setStatusNotice(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="hd-root min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="px-4 py-3 border-b-2 border-white/20 bg-[#121216] sticky top-0 z-30 flex items-center justify-between">
        <button
          onClick={onBack}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white hover:bg-neutral-800 flex items-center gap-2 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Vault</span>
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h1 className="text-sm sm:text-base font-black uppercase tracking-wider">
            Hero Duel Card Vault ({cards.length})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLab(true)}
            title="Open Card Lab (Dev Preview 27 Cards)"
            className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center gap-1.5 rounded cursor-pointer shadow-sm"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Card Lab</span>
          </button>
          <button
            onClick={handleExport}
            title="Export Collection as JSON"
            className="p-1.5 border border-white/30 hover:border-white text-neutral-300 hover:text-white rounded cursor-pointer"
          >
            <FileJson className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import Collection JSON"
            className="p-1.5 border border-white/30 hover:border-white text-neutral-300 hover:text-white rounded cursor-pointer"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto p-4 flex-1 flex flex-col gap-4">
        {/* Toast Notice */}
        {statusNotice && (
          <div className="p-2.5 bg-amber-400 text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] animate-in fade-in">
            {statusNotice}
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#18181f] p-3 border-2 border-white/10 rounded-lg">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by code or hero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-black/70 border border-white/20 text-xs font-mono rounded text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Rarity Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['all', 'common', 'rare', 'epic', 'master', 'mythic', 'legendary'] as const).map(
              (r) => {
                const label = r === 'all' ? 'All' : RARITY_CONFIGS[r].label;
                const active = selectedRarity === r;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRarity(r)}
                    className={`px-2.5 py-1 text-[11px] font-black uppercase rounded transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'bg-neutral-800/80 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Cards Grid */}
        {filteredCards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/15 rounded-xl">
            <Sparkles className="w-12 h-12 text-neutral-600 mb-3" />
            <h3 className="text-base font-black uppercase text-neutral-400">
              No Cards Discovered Yet
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1 font-mono">
              Defeat enemy heroes on the 7×8 Hero Duel battlefield to earn unique collectible cards
              with procedural backgrounds!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5 pb-16">
            {filteredCards.map((card) => (
              <CardThumbnail
                key={card.code}
                card={card}
                onClick={() => setActiveCard(card)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Fullscreen Inspector Modal */}
      {activeCard && (
        <CardInspectModal
          card={activeCard}
          onClose={() => setActiveCard(null)}
          onDownload={() => downloadCardPng(activeCard)}
          onShare={() => handleShare(activeCard)}
          onCopyCode={() => handleCopyCode(activeCard.code)}
          copiedCode={copiedCode}
        />
      )}
    </div>
  );
};

interface CardThumbnailProps {
  card: CollectibleHeroCard;
  onClick: () => void;
}

const CardThumbnail: React.FC<CardThumbnailProps> = ({ card, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderCardToCanvas(canvasRef.current, card, 0.35);
    }
  }, [card]);

  return (
    <div
      onClick={onClick}
      className="hd-card-3d-tilt group relative aspect-[5/7] bg-[#121218] border-2 border-white/20 hover:border-amber-400 rounded-lg overflow-hidden cursor-pointer shadow-lg flex flex-col justify-between"
      title={`${card.heroName} - #${card.code}`}
    >
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
        <div className="w-full">
          <div className="text-[10px] font-black uppercase text-amber-400">
            {card.rarity.toUpperCase()}
          </div>
          <div className="text-xs font-black truncate text-white">{card.heroName}</div>
          <div className="text-[9px] font-mono text-neutral-300">#{card.code}</div>
        </div>
      </div>
    </div>
  );
};

interface CardInspectModalProps {
  card: CollectibleHeroCard;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
  onCopyCode: () => void;
  copiedCode: boolean;
}

const CardInspectModal: React.FC<CardInspectModalProps> = ({
  card,
  onClose,
  onDownload,
  onShare,
  onCopyCode,
  copiedCode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderCardToCanvas(canvasRef.current, card, 0.75);
    }
  }, [card]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-[#16161c] border-3 border-white max-w-2xl w-full max-h-[92vh] overflow-y-auto rounded-xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row gap-5 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Canvas */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-[5/7] shrink-0 border-2 border-white/20 rounded-lg overflow-hidden shadow-2xl">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>

        {/* Info & Actions */}
        <div className="flex-1 w-full flex flex-col justify-between gap-4 text-left">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase" style={{ backgroundColor: card.rarityConfig.bgColor, color: card.rarityConfig.color }}>
                <span>{card.rarity.toUpperCase()}</span>
                <span>•</span>
                <span>#{card.code}</span>
              </div>

              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-black uppercase flex items-center gap-1">
                <Check className="w-3 h-3" /> Unlocked in Vault
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
              {card.heroName}
            </h2>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase">
              {card.heroTitle}
            </div>

            <div className="mt-3 p-3 bg-black/50 border border-white/15 rounded text-xs space-y-1">
              <div className="text-neutral-400 text-[11px] uppercase font-mono">Word of Power</div>
              <div className="text-sm font-black text-white">
                {card.japaneseWord.kanji} ({card.japaneseWord.romaji})
              </div>
              <div className="text-neutral-300 text-[11px] italic">
                “{card.japaneseWord.meaning}”
              </div>
            </div>

            <div className="mt-3 p-3 bg-black/50 border border-white/15 rounded text-xs">
              <div className="text-neutral-400 text-[11px] uppercase font-mono mb-0.5">Lore Inscription</div>
              <p className="text-neutral-200 text-xs italic leading-relaxed">
                “{card.loreSentence}”
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/15">
            <button
              onClick={onDownload}
              className="hd-btn-brutal w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download 2x PNG (1500×2100)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onCopyCode}
                className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase border border-white/30 flex items-center justify-center gap-1.5 cursor-pointer rounded"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={onShare}
                className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase border border-white/30 flex items-center justify-center gap-1.5 cursor-pointer rounded"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
