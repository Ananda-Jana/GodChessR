import React, { useState, useEffect, useRef } from 'react';
import { HeroId, CardRarity } from '../types/heroDuelTypes';
import { CollectibleHeroCard } from '../types/cardTypes';
import { HERO_MAP, ALL_HEROES } from '../heroes/heroRegistry';
import { renderCardToCanvas, downloadCardPng } from './cardRenderer';
import { RARITY_CONFIGS } from '../config/rarityConfig';
import { pickJapaneseWord, generateCardLore } from './cardGrammar';
import { ArrowLeft, Download, RefreshCw, Sparkles, Layers, Eye } from 'lucide-react';

interface CardLabProps {
  onBack: () => void;
}

const NINE_HEROES: HeroId[] = [
  'mugen-king',
  'malevolent-priest',
  'dr-methanogenic',
  'captain-englland',
  'ajx-assassin',
  'yjkstra-pathfinder',
  'ironclad-warden',
  'black-monkey',
  'part-king-kong',
];

const SCENE_VARIANTS = [
  { id: 'a', label: 'Variant A (Common/Noir)', rarity: 'common' as CardRarity, seedOffset: 101 },
  { id: 'b', label: 'Variant B (Epic/Pop)', rarity: 'epic' as CardRarity, seedOffset: 202 },
  { id: 'c', label: 'Variant C (Legendary)', rarity: 'legendary' as CardRarity, seedOffset: 303 },
];

export const CardLab: React.FC<CardLabProps> = ({ onBack }) => {
  const [labCards, setLabCards] = useState<CollectibleHeroCard[]>([]);
  const [selectedHeroFilter, setSelectedHeroFilter] = useState<string>('all');
  const [activeCard, setActiveCard] = useState<CollectibleHeroCard | null>(null);
  const [cardScale, setCardScale] = useState<number>(0.32);

  useEffect(() => {
    generateAll27Cards();
  }, []);

  const generateAll27Cards = () => {
    const cards: CollectibleHeroCard[] = [];
    let codeIndex = 100;

    for (const heroId of NINE_HEROES) {
      const heroDef = HERO_MAP[heroId] || ALL_HEROES[0];

      for (let vIdx = 0; vIdx < SCENE_VARIANTS.length; vIdx++) {
        const variant = SCENE_VARIANTS[vIdx];
        codeIndex++;
        const code = `LAB-${heroId.substring(0, 3).toUpperCase()}-${codeIndex}`;
        const seed = Math.abs(hashCode(code) + variant.seedOffset);

        const japaneseWord = pickJapaneseWord();
        const loreSentence = generateCardLore(heroId);

        const card: CollectibleHeroCard = {
          id: `lab_${heroId}_${variant.id}_${seed}`,
          code,
          heroId,
          heroName: heroDef.name,
          heroTitle: heroDef.title,
          rarity: variant.rarity,
          rarityConfig: RARITY_CONFIGS[variant.rarity],
          japaneseWord,
          loreSentence,
          backgroundIndex: seed % 30,
          paletteIndex: seed % 5,
          visualSeed: seed,
          mintedAt: Date.now(),
          defeatedBy: 'CardLab Tester',
        };

        cards.push(card);
      }
    }

    setLabCards(cards);
  };

  const filteredCards = labCards.filter((c) => {
    if (selectedHeroFilter === 'all') return true;
    return c.heroId === selectedHeroFilter;
  });

  return (
    <div className="hd-root min-h-screen bg-[#08080a] text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="px-4 py-3 border-b-2 border-amber-500/40 bg-[#101014] sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white hover:bg-neutral-800 flex items-center gap-2 text-xs cursor-pointer font-black uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Vault</span>
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-400">
                Card Art Lab (27 Variants)
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono">
                9 Heroes × 3 Vector Scene Variants • 100% Canvas 2D
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateAll27Cards}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-white/20 rounded text-xs font-black uppercase flex items-center gap-1.5 text-neutral-200 cursor-pointer"
            title="Re-seed all 27 cards"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Seed</span>
          </button>

          {/* Scale Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-black/60 p-1 border border-white/20 rounded">
            <Layers className="w-3.5 h-3.5 text-neutral-400 ml-1" />
            <button
              onClick={() => setCardScale(0.25)}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer ${
                cardScale === 0.25 ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setCardScale(0.35)}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer ${
                cardScale === 0.35 ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setCardScale(0.48)}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer ${
                cardScale === 0.48 ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Large
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 flex-1 flex flex-col gap-5">
        {/* Hero Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-[#14141a] p-2 border border-white/10 rounded-lg">
          <button
            onClick={() => setSelectedHeroFilter('all')}
            className={`px-3 py-1 text-xs font-black uppercase rounded whitespace-nowrap cursor-pointer transition-colors ${
              selectedHeroFilter === 'all'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            All 9 Heroes (27)
          </button>
          {NINE_HEROES.map((hId) => {
            const hDef = HERO_MAP[hId];
            const active = selectedHeroFilter === hId;
            return (
              <button
                key={hId}
                onClick={() => setSelectedHeroFilter(hId)}
                className={`px-2.5 py-1 text-xs font-bold uppercase rounded whitespace-nowrap cursor-pointer transition-colors ${
                  active
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-neutral-800/80 text-neutral-300 hover:text-white'
                }`}
              >
                {hDef?.name || hId}
              </button>
            );
          })}
        </div>

        {/* 27 Card Contact Sheet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 pb-20">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-[#121218] border-2 border-white/20 hover:border-amber-400 rounded-xl p-3 shadow-xl flex flex-col gap-3 group transition-all"
            >
              {/* Top Info Bar */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                  style={{ backgroundColor: card.rarityConfig.bgColor, color: card.rarityConfig.color }}
                >
                  {card.rarity.toUpperCase()}
                </span>
                <span className="font-mono text-neutral-400 text-[11px]">#{card.code}</span>
              </div>

              {/* Card Canvas */}
              <div
                onClick={() => setActiveCard(card)}
                className="relative aspect-[5/7] w-full flex items-center justify-center bg-black/60 rounded-lg overflow-hidden cursor-pointer shadow-inner"
              >
                <LabCardCanvas card={card} scale={cardScale} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-amber-400 text-black rounded-full font-bold shadow-lg flex items-center gap-1 text-xs">
                    <Eye className="w-4 h-4" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>

              {/* Bottom Meta & Action */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                <div>
                  <div className="font-black text-white">{card.heroName}</div>
                  <div className="text-[10px] text-amber-400 font-mono">
                    {card.japaneseWord.kanji} ({card.japaneseWord.romaji})
                  </div>
                </div>

                <button
                  onClick={() => downloadCardPng(card)}
                  title="Download 2x PNG (1500×2100)"
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 border border-white/20 rounded text-neutral-300 hover:text-white cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Inspect Modal */}
      {activeCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveCard(null)}
        >
          <div
            className="bg-[#181820] border-3 border-amber-400 max-w-xl w-full rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black uppercase text-amber-400">
              {activeCard.heroName} — #{activeCard.code}
            </h3>
            <div className="w-full max-w-[320px] aspect-[5/7] border-2 border-white/20 rounded-lg overflow-hidden shadow-2xl">
              <LabCardCanvas card={activeCard} scale={0.7} />
            </div>

            <div className="text-xs text-neutral-300 font-mono">
              <p>Kanji: {activeCard.japaneseWord.kanji} ({activeCard.japaneseWord.romaji})</p>
              <p className="italic text-neutral-400 mt-1">“{activeCard.loreSentence}”</p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => downloadCardPng(activeCard)}
                className="hd-btn-brutal flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download 2x PNG (1500×2100)</span>
              </button>
              <button
                onClick={() => setActiveCard(null)}
                className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase rounded border border-white/20 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface LabCardCanvasProps {
  card: CollectibleHeroCard;
  scale: number;
}

const LabCardCanvas: React.FC<LabCardCanvasProps> = ({ card, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderCardToCanvas(canvasRef.current, card, scale);
    }
  }, [card, scale]);

  return <canvas ref={canvasRef} className="object-contain max-w-full max-h-full" />;
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
