/**
 * TrophyRoomModal - Brutalist 1:1 Square Achievement Gallery
 */

import React, { useState, useRef, useEffect } from 'react';
import { usePredictor } from '../predictor/PredictorContext';
import { drawAchievementCard, downloadCardAsPng } from '../predictor/canvasCardRenderer';
import type { AchievementCard, CardRarity, GameModeKey } from '../predictor/types';
import { ChessPiece as ClassicPiece } from './ChessPiece';
import { CullingPiece as CullingPieceComponent } from './CullingPiece';
import { Trophy, Download, X, Filter, Sparkles, RefreshCw } from 'lucide-react';
import type { PieceColor, PieceType } from '../types/game';
import type { CullingPieceType, CullingPieceColor } from '../types/cullingGame';

interface TrophyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedCard?: AchievementCard | null;
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({
  isOpen,
  onClose,
  initialSelectedCard = null,
}) => {
  const { state, clearPredictorSession } = usePredictor();
  const [selectedCard, setSelectedCard] = useState<AchievementCard | null>(initialSelectedCard);
  const [filterMode, setFilterMode] = useState<GameModeKey | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'all'>('all');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize selected card when modal opens or cards change
  useEffect(() => {
    if (!isOpen) return;

    if (initialSelectedCard) {
      setSelectedCard(initialSelectedCard);
    } else if (state.earnedCards.length > 0) {
      if (!selectedCard || !state.earnedCards.some((c) => c.id === selectedCard.id)) {
        setSelectedCard(state.earnedCards[0]);
      }
    }
  }, [isOpen, initialSelectedCard, state.earnedCards]);

  // Render selected 1:1 square card to canvas with guaranteed mount visibility
  useEffect(() => {
    if (!isOpen || !selectedCard) return;

    let animId: number;
    let timeoutId: NodeJS.Timeout;

    const render = () => {
      if (canvasRef.current && selectedCard) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          drawAchievementCard(ctx, selectedCard);
        }
      }
    };

    render();
    animId = requestAnimationFrame(render);
    timeoutId = setTimeout(render, 60);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId);
    };
  }, [isOpen, selectedCard]);

  if (!isOpen) return null;

  const filteredCards = state.earnedCards.filter((card) => {
    if (filterMode !== 'all' && card.mode !== filterMode) return false;
    if (filterRarity !== 'all' && card.rarity !== filterRarity) return false;
    return true;
  });

  const renderBadgePiece = (card: AchievementCard) => {
    const pType = card.pieceType || 'king';
    const pColor = card.pieceColor || 'white';

    if (card.mode === 'culling' && pType.startsWith('culling_')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center p-0.5 bg-neutral-900 border border-slate-700">
          <CullingPieceComponent
            type={pType as CullingPieceType}
            color={pColor as CullingPieceColor}
          />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 flex items-center justify-center p-0.5 bg-neutral-900 border border-slate-700">
        <ClassicPiece
          type={pType as PieceType}
          color={pColor as PieceColor}
          className="w-full h-full"
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0a0d14] border-4 border-black dark:border-white text-slate-100 shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#ffffff] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-neutral-900 border-b-3 border-black dark:border-white">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-tight text-amber-300">
                Session Trophy Room
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Predicted Rating: <span className="text-amber-400 font-bold">{state.currentRating}</span> · {state.earnedCards.length} Badges Collected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset session predictor rating and clear collected badges?')) {
                  clearPredictorSession();
                  setSelectedCard(null);
                }
              }}
              className="p-2 text-xs font-bold uppercase text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors"
              title="Reset Session Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-slate-950 border-b-2 border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-400 uppercase">Mode:</span>
            <div className="flex items-center gap-1">
              {(['all', 'standard', 'culling', 'rose', 'crafted'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`px-2 py-0.5 font-extrabold uppercase text-[11px] transition-colors cursor-pointer ${
                    filterMode === m
                      ? 'bg-amber-400 text-black border border-black'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {m === 'all' ? 'All' : m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 uppercase">Rarity:</span>
            <div className="flex items-center gap-1">
              {(['all', 'Legendary', 'Epic', 'Rare', 'Common'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRarity(r)}
                  className={`px-2 py-0.5 font-extrabold uppercase text-[11px] transition-colors cursor-pointer ${
                    filterRarity === r
                      ? 'bg-amber-400 text-black border border-black'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left/Top: 1:1 Square Canvas Card Preview */}
          <div className="md:col-span-5 p-5 bg-slate-950 border-b md:border-b-0 md:border-r-2 border-slate-800 flex flex-col items-center justify-center overflow-y-auto">
            {selectedCard ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-[320px]">
                {/* 1:1 Square Canvas Frame */}
                <div className="relative border-3 border-amber-400 shadow-[6px_6px_0px_#000000] rounded-none overflow-hidden bg-black aspect-square w-full">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={600}
                    className="w-full h-full block object-contain"
                  />
                </div>

                {/* Download PNG Action */}
                <button
                  onClick={() => downloadCardAsPng(selectedCard)}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Download className="w-4 h-4" /> Download Square Badge PNG
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-500 p-8">
                <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-xs uppercase">Select a badge to preview</p>
              </div>
            )}
          </div>

          {/* Right/Bottom: 1:1 Badge Snapshots Grid */}
          <div className="md:col-span-7 p-5 overflow-y-auto max-h-[60vh] md:max-h-none">
            {filteredCards.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-bold uppercase text-xs text-slate-400">No badges match filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredCards.map((card) => {
                  const isSelected = selectedCard?.id === card.id;
                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className={`p-3 bg-slate-900 border-2 cursor-pointer transition-all aspect-square flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-slate-800 shadow-[4px_4px_0px_#fbbf24] -translate-y-0.5'
                          : 'border-slate-800 hover:border-slate-600 hover:bg-slate-850 shadow-[3px_3px_0px_#000000]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 truncate">
                          {card.mode}
                        </span>
                        <span
                          className={`text-[8px] font-extrabold uppercase px-1 py-0.2 border ${
                            card.rarity === 'Legendary'
                              ? 'bg-amber-950 text-amber-300 border-amber-500'
                              : card.rarity === 'Epic'
                              ? 'bg-purple-950 text-purple-300 border-purple-500'
                              : card.rarity === 'Rare'
                              ? 'bg-blue-950 text-blue-300 border-blue-500'
                              : 'bg-slate-800 text-slate-300 border-slate-600'
                          }`}
                        >
                          {card.rarity}
                        </span>
                      </div>

                      {/* Center Piece Motif */}
                      <div className="flex items-center justify-center my-1">
                        {renderBadgePiece(card)}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-[11px] text-white uppercase truncate text-center">
                          {card.title}
                        </h4>
                        <div className="text-[9px] font-mono text-amber-400 text-center">
                          R: {card.predictedRating}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
