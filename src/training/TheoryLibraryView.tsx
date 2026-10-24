/**
 * TheoryLibraryView.tsx - Scrolls of the Chess Hashira
 *
 * Concise, illustrated scrolls and treatises explaining royal pieces,
 * fairy mechanics, dice grace transitions, and mode-specific boundary rules.
 */

import React, { useState } from 'react';
import type { TheoryScroll, HashiraRankId } from './types';
import { THEORY_SCROLLS, HASHIRA_RANKS } from './data';
import { ChessPiece } from '../components/ChessPiece';
import { BookOpen, Sparkles, ChevronRight, Bookmark, ArrowLeft } from 'lucide-react';
import type { PieceType } from '../types/game';

interface TheoryLibraryViewProps {
  currentRank: HashiraRankId;
}

export const TheoryLibraryView: React.FC<TheoryLibraryViewProps> = ({ currentRank }) => {
  const [selectedScroll, setSelectedScroll] = useState<TheoryScroll | null>(THEORY_SCROLLS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [scrollProgress, setScrollProgress] = useState(0);
  const readerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const progress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setScrollProgress(progress);
  };

  const categories = ['all', 'Fundamentals', 'Royal Tactics', 'Crafted Specials', 'Culling Mechanics'];

  const filteredScrolls = THEORY_SCROLLS.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-5 items-start w-full h-full overflow-hidden">
      {/* Scrolls Catalog Sidebar */}
      <div className="w-full md:w-80 flex flex-col gap-3 h-full shrink-0">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[44px] px-4 py-1 text-[11px] font-black uppercase whitespace-nowrap border-2 border-black dark:border-white cursor-pointer active:scale-95 transition-transform ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scrolls List */}
        <div className="space-y-2 overflow-y-auto pr-1">
          {filteredScrolls.map((scroll) => {
            const isSelected = selectedScroll?.id === scroll.id;
            return (
              <div
                key={scroll.id}
                onClick={() => {
                  setSelectedScroll(scroll);
                  setScrollProgress(0);
                  if (readerRef.current) readerRef.current.scrollTop = 0;
                }}
                className={`p-3 border-3 border-black dark:border-white shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] cursor-pointer transition-all active:translate-x-0.5 ${
                  isSelected
                    ? 'bg-amber-400 text-black dark:bg-amber-400 dark:text-black translate-x-1'
                    : 'bg-white dark:bg-[#0c0c0e] text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.2 bg-black text-amber-400">
                    {scroll.category}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                    {scroll.readingTimeMin} min read
                  </span>
                </div>
                <h4 className="text-xs font-black uppercase leading-tight">{scroll.title}</h4>
                <p className="text-[11px] font-medium opacity-80 line-clamp-2 mt-1">
                  {scroll.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Scroll Reader View */}
      {selectedScroll ? (
        <div className="flex-1 bg-white dark:bg-[#0c0c0e] border-4 border-black dark:border-white shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#ffffff] flex flex-col h-full w-full relative overflow-hidden">
          {/* Scroll Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-neutral-200 dark:bg-neutral-800 z-30">
            <div
              className="h-full bg-amber-400 transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <div
            ref={readerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-5 text-black dark:text-white"
          >
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="border-b-3 border-black dark:border-white pb-3 mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 bg-black text-amber-400 font-black text-[10px] uppercase">
                    {selectedScroll.category}
                  </span>
                  <span className="text-xs font-bold text-neutral-500">
                    · {selectedScroll.readingTimeMin} MIN READ
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black uppercase tracking-tight">
                  {selectedScroll.title}
                </h2>
                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
                  {selectedScroll.summary}
                </p>
              </div>

              {/* Piece Illustration Card if applicable */}
              {selectedScroll.relatedPieceType && (
                <div className="mb-4 p-3 bg-neutral-100 dark:bg-[#18181b] border-2 border-black dark:border-neutral-700 flex items-center gap-3">
                  <div className="w-12 h-12 bg-black border-2 border-amber-400 flex items-center justify-center shrink-0 p-1">
                    <ChessPiece
                      type={selectedScroll.relatedPieceType as PieceType}
                      color="white"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-amber-500 block">
                      Martial Unit Profile: {selectedScroll.relatedPieceType.toUpperCase()}
                    </span>
                    <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                      Key tactical unit utilized in this curriculum. Study its unique vectors.
                    </p>
                  </div>
                </div>
              )}

              {/* Scroll Sections */}
              <div className="space-y-6 pb-8">
                {selectedScroll.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
                      <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                      {sec.heading}
                    </h3>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {sec.body}
                    </p>
                    {sec.highlightBox && (
                      <div className="p-3 bg-amber-400/10 border-l-4 border-amber-500 text-xs font-bold text-amber-800 dark:text-amber-300 mt-1 shadow-sm">
                        {sec.highlightBox}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-neutral-100 dark:bg-[#141416] border-3 border-black p-8 text-center text-xs font-bold uppercase text-neutral-500 h-full flex items-center justify-center">
          Select a scroll from the catalog to read the sacred teachings.
        </div>
      )}
    </div>
  );
};
