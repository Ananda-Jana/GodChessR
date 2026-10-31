import React, { useState } from 'react';
import { Palette, X, Sparkles, Check, Shield, Landmark } from 'lucide-react';
import { HeroPiece, HERO_INFO, HeroPieceType } from '../art/heroAvatarHelper';
import { PIECE_THEMES, PieceTheme, getPieceTheme, setPieceTheme } from '../art/themeStore';
import { SHRINE_THEMES, ShrineTheme, getShrineTheme, setShrineTheme } from '../art/shrineThemeStore';
import { ShrineStructure } from '../components/ShrineStructure';
import { ALL_HEROES } from '../heroes/heroRegistry';
import { heroIdToPieceType } from '../art/heroAvatarHelper';
import { haptics } from '../utils/haptics';

interface PieceThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PieceThemeModal: React.FC<PieceThemeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pieces' | 'shrines'>('pieces');
  const [selectedTheme, setSelectedTheme] = useState<PieceTheme>(() => getPieceTheme());
  const [selectedShrineTheme, setSelectedShrineTheme] = useState<ShrineTheme>(() => getShrineTheme());
  const [previewColor, setPreviewColor] = useState<'white' | 'black'>('white');

  if (!isOpen) return null;

  const handleSelectTheme = (theme: PieceTheme) => {
    haptics.select();
    setSelectedTheme(theme);
    setPieceTheme(theme);
  };

  const handleSelectShrineTheme = (theme: ShrineTheme) => {
    haptics.select();
    setSelectedShrineTheme(theme);
    setShrineTheme(theme);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0e111a] border-2 border-amber-400 p-4 sm:p-6 rounded-2xl max-w-2xl w-full max-h-[92vh] shadow-2xl flex flex-col gap-4 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-400 leading-tight">
                Match Customizer & Themes
              </h2>
              <p className="text-[10px] text-neutral-400 font-mono">
                Select hero piece art styles and shrine architecture before starting match
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-white/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Hero Pieces vs Shrine Architecture */}
        <div className="flex items-center gap-2 bg-black/60 p-1 rounded-xl border border-white/15">
          <button
            type="button"
            onClick={() => {
              haptics.select();
              setActiveTab('pieces');
            }}
            className={`flex-1 py-2 px-3 text-xs font-black uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'pieces'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-neutral-900/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Hero Piece Themes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              haptics.select();
              setActiveTab('shrines');
            }}
            className={`flex-1 py-2 px-3 text-xs font-black uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'shrines'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-neutral-900/60'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Shrine Architecture Themes</span>
          </button>
        </div>

        {activeTab === 'pieces' ? (
          <>
            {/* Theme Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PIECE_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 relative ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 ring-1 ring-amber-400 shadow-xl'
                        : 'bg-black/50 border-white/15 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-amber-300">
                        {theme.tagline}
                      </span>
                      {isSelected && (
                        <span className="bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-black uppercase text-white">{theme.name}</h3>
                      <p className="text-[10px] text-neutral-300 leading-tight mt-1 font-mono">
                        {theme.description}
                      </p>
                    </div>

                    {/* Mini 3-Piece Live Preview Sample */}
                    <div className="flex items-center justify-around bg-black/60 p-2 rounded-lg border border-white/10 mt-1">
                      {['mugen-king', 'ajx-assassin', 'ironclad-warden'].map((hId) => (
                        <div key={hId} className="w-8 h-8 drop-shadow-md">
                          <HeroPiece
                            type={heroIdToPieceType(hId)}
                            color={previewColor}
                            theme={theme.id}
                            className="w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full 9-Hero Preview Matrix */}
            <div className="bg-black/60 border border-white/15 p-3 rounded-xl space-y-2 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Full Squad Preview ({selectedTheme === 'faceted' ? 'Faceted Busts' : 'Vector Silhouette'})</span>
                </span>

                {/* White / Black Color Toggle */}
                <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewColor('white')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      previewColor === 'white' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    White Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewColor('black')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      previewColor === 'black' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Black Team
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 pt-1">
                {ALL_HEROES.map((h) => {
                  const pieceType = heroIdToPieceType(h.id);

                  return (
                    <div
                      key={h.id}
                      className="bg-neutral-900/90 border border-white/10 p-1.5 rounded-xl flex flex-col items-center gap-1 text-center"
                    >
                      <div className="w-8 h-8 flex items-center justify-center drop-shadow-md">
                        <HeroPiece
                          type={pieceType}
                          color={previewColor}
                          theme={selectedTheme}
                          className="w-full h-full"
                        />
                      </div>
                      <span className="text-[8px] font-mono font-bold text-neutral-300 truncate w-full">
                        {h.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Shrine Theme Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {SHRINE_THEMES.map((theme) => {
                const isSelected = selectedShrineTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectShrineTheme(theme.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 relative ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 ring-1 ring-amber-400 shadow-xl'
                        : 'bg-black/50 border-white/15 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-amber-300">
                        {theme.tagline}
                      </span>
                      {isSelected && (
                        <span className="bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-black uppercase text-white">{theme.name}</h3>
                      <p className="text-[11px] text-neutral-300 leading-relaxed mt-1 font-mono">
                        {theme.description}
                      </p>
                    </div>

                    {/* Shrine Live Preview */}
                    <div className="flex items-center justify-around bg-black/60 p-3 rounded-xl border border-white/10 mt-2">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-mono text-blue-400">Player Side</span>
                        <div className="w-14 h-14 flex items-center justify-center drop-shadow-md">
                          <ShrineStructure owner="player" size={48} />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-mono text-red-400">Enemy Side</span>
                        <div className="w-14 h-14 flex items-center justify-center drop-shadow-md">
                          <ShrineStructure owner="enemy" size={48} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="border-t border-white/15 pt-3 flex items-center justify-between">
          <span className="text-[10px] text-neutral-400 font-mono">
            Themes apply immediately to the match
          </span>
          <button
            type="button"
            onClick={() => {
              haptics.select();
              onClose();
            }}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded cursor-pointer shadow-lg flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Apply Themes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
