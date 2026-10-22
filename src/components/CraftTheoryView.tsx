import React, { useState } from 'react';
import { PieceType, PieceColor } from '../types/game';
import { CRAFTABLE_PIECES, CRAFTABLE_MAP, getCraftablePreviewOffsets, CraftablePieceDef } from '../game/craftables';
import { ChessPiece } from './ChessPiece';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, BookOpen, Crown, Shield, Zap } from 'lucide-react';

interface CraftTheoryViewProps {
  onBack: () => void;
}

interface PieceCatalogItem {
  id: PieceType;
  name: string;
  category: 'crafted' | 'standard';
  description: string;
  movementText: string;
  getOffsets: () => { dx: number; dy: number }[];
}

export const CraftTheoryView: React.FC<CraftTheoryViewProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const isThemeLight = theme === 'light';

  const previewColor: PieceColor = 'white';

  const catalogItems: PieceCatalogItem[] = [
    // Crafted Pieces
    {
      id: 'communist',
      name: 'Communist',
      category: 'crafted',
      description: 'Crafted piece replacing Bishops in crafted mode. Moves along orthogonal directions in an alternating diagonal zigzag.',
      movementText: 'Zigzag along 4 orthogonal lines (offsets ±2 or ±4). Requires at least one zigzag path to be clear of pieces.',
      getOffsets: () => getCraftablePreviewOffsets(CRAFTABLE_MAP.communist),
    },
    {
      id: 'supremeRook',
      name: 'Supreme Rook',
      category: 'crafted',
      description: 'Crafted piece replacing a Rook in crafted mode. Combines full orthogonal sliding with diagonal leaping.',
      movementText: 'Slides any distance orthogonally (blocked by pieces) AND leaps exactly 2 squares diagonally (jumps over pieces).',
      getOffsets: () => getCraftablePreviewOffsets(CRAFTABLE_MAP.supremeRook),
    },
    {
      id: 'priest',
      name: 'Priest',
      category: 'crafted',
      description: 'Crafted piece replacing Knights in crafted mode. Slides diagonally 1-3 squares and leaps orthogonally 2 squares.',
      movementText: 'Slides 1–3 squares diagonally (blocked by pieces) AND leaps exactly 2 squares orthogonally (jumps over pieces).',
      getOffsets: () => getCraftablePreviewOffsets(CRAFTABLE_MAP.priest),
    },
    // Special & Standard Pieces
    {
      id: 'prince',
      name: 'Prince',
      category: 'standard',
      description: 'Special starting corner piece (h1 for White, a8 for Black). Features Knight leaps and bounded diagonal slides, plus a one-time 3x1 special move.',
      movementText: 'Knight L-shape leap (2x1) OR 1–4 squares diagonal slide. Usable once per game: extended 3x1 first move.',
      getOffsets: () => {
        const offsets: { dx: number; dy: number }[] = [];
        // Knight leaps
        const knightLeaps = [
          { dx: 1, dy: 2 }, { dx: 2, dy: 1 }, { dx: 2, dy: -1 }, { dx: 1, dy: -2 },
          { dx: -1, dy: -2 }, { dx: -2, dy: -1 }, { dx: -2, dy: 1 }, { dx: -1, dy: 2 }
        ];
        knightLeaps.forEach(l => offsets.push(l));
        // Diagonal slides (1-4)
        const diags = [{ dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }];
        diags.forEach(d => {
          for (let r = 1; r <= 4; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r });
        });
        // 3x1 special leap
        offsets.push({ dx: 3, dy: 1 }, { dx: 3, dy: -1 }, { dx: -3, dy: 1 }, { dx: -3, dy: -1 }, { dx: 1, dy: 3 }, { dx: 1, dy: -3 }, { dx: -1, dy: 3 }, { dx: -1, dy: -3 });
        return offsets;
      },
    },
    {
      id: 'queen',
      name: 'Queen',
      category: 'standard',
      description: 'The most powerful standard sliding piece. Combines Rook and Bishop movement in all directions.',
      movementText: 'Slides any distance orthogonally or diagonally in all 8 directions.',
      getOffsets: () => {
        const offsets: { dx: number; dy: number }[] = [];
        const dirs = [
          { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
          { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
        ];
        dirs.forEach(d => {
          for (let r = 1; r <= 4; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r });
        });
        return offsets;
      },
    },
    {
      id: 'rook',
      name: 'Rook',
      category: 'standard',
      description: 'Powerful orthogonal slider stationed in the corners.',
      movementText: 'Slides any distance horizontally or vertically along ranks and files.',
      getOffsets: () => {
        const offsets: { dx: number; dy: number }[] = [];
        const dirs = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
        dirs.forEach(d => {
          for (let r = 1; r <= 4; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r });
        });
        return offsets;
      },
    },
    {
      id: 'bishop',
      name: 'Bishop',
      category: 'standard',
      description: 'Diagonal sliding piece operating on squares of a single color.',
      movementText: 'Slides any distance diagonally along unobstructed diagonals.',
      getOffsets: () => {
        const offsets: { dx: number; dy: number }[] = [];
        const dirs = [{ dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }];
        dirs.forEach(d => {
          for (let r = 1; r <= 4; r++) offsets.push({ dx: d.dx * r, dy: d.dy * r });
        });
        return offsets;
      },
    },
    {
      id: 'knight',
      name: 'Knight',
      category: 'standard',
      description: 'Agile leaping piece that jumps over other pieces in an L-shape pattern.',
      movementText: 'Leaps in an L-shape: exactly 2 squares in one orthogonal direction and 1 square perpendicular.',
      getOffsets: () => [
        { dx: 1, dy: 2 }, { dx: 2, dy: 1 }, { dx: 2, dy: -1 }, { dx: 1, dy: -2 },
        { dx: -1, dy: -2 }, { dx: -2, dy: -1 }, { dx: -2, dy: 1 }, { dx: -1, dy: 2 }
      ],
    },
    {
      id: 'pawn',
      name: 'Pawn',
      category: 'standard',
      description: 'Forward-moving infantry. Advances 1 square (or 2 on first move) and captures diagonally. 2 pawns reaching back rank triggers immediate draw!',
      movementText: 'Moves forward 1 square (2 from starting rank). Captures diagonally 1 square forward.',
      getOffsets: () => [
        { dx: 0, dy: 1 }, { dx: 0, dy: 2 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
      ],
    },
    {
      id: 'king',
      name: 'King',
      category: 'standard',
      description: 'The most important piece on the board. Must be defended from checkmate at all costs.',
      movementText: 'Steps exactly 1 square in any direction (orthogonal or diagonal).',
      getOffsets: () => [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ],
    },
  ];

  const [filter, setFilter] = useState<'all' | 'crafted' | 'standard'>('all');

  const filteredItems = catalogItems.filter(item => {
    if (filter === 'crafted') return item.category === 'crafted';
    if (filter === 'standard') return item.category === 'standard';
    return true;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b-4 border-black dark:border-white bg-white dark:bg-[#0a0a0c] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-amber-400 hover:text-black border-2 border-black dark:border-white text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_var(--shadow)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000]">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-sm sm:text-base font-black uppercase tracking-tight">
              GodChess Craft Theory & Piece Guide
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white p-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 font-black uppercase cursor-pointer border ${
              filter === 'all'
                ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                : 'border-transparent text-neutral-600 dark:text-neutral-400'
            }`}
          >
            All Pieces ({catalogItems.length})
          </button>
          <button
            onClick={() => setFilter('crafted')}
            className={`px-3 py-1 font-black uppercase cursor-pointer border ${
              filter === 'crafted'
                ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                : 'border-transparent text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Crafted Specials (3)
          </button>
          <button
            onClick={() => setFilter('standard')}
            className={`px-3 py-1 font-black uppercase cursor-pointer border ${
              filter === 'standard'
                ? 'bg-amber-400 text-black border-black shadow-[1px_1px_0px_#000]'
                : 'border-transparent text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Standard & Prince (7)
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Intro Banner */}
        <div className="bg-amber-400 text-black border-4 border-black p-5 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase">Craft Theory & Movement Encyclopedia</h2>
              <p className="text-xs font-bold text-neutral-900 mt-0.5">
                Comprehensive guide to all standard chess pieces, the unique Prince, and advanced craftable army pieces (Communist, Supreme Rook, Priest). Review movement patterns, tactical rules, and 9×9 preview grids.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Filter */}
        <div className="flex sm:hidden items-center justify-center gap-1 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white p-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 font-black uppercase cursor-pointer ${filter === 'all' ? 'bg-amber-400 text-black' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('crafted')}
            className={`px-2 py-1 font-black uppercase cursor-pointer ${filter === 'crafted' ? 'bg-amber-400 text-black' : ''}`}
          >
            Crafted
          </button>
          <button
            onClick={() => setFilter('standard')}
            className={`px-2 py-1 font-black uppercase cursor-pointer ${filter === 'standard' ? 'bg-amber-400 text-black' : ''}`}
          >
            Standard
          </button>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const reachableOffsets = item.getOffsets();
            const reachableSet = new Set(reachableOffsets.map(o => `${o.dx},${o.dy}`));

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0a0a0c] border-3 border-black dark:border-white p-5 shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffffff] flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 p-1 border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                        <ChessPiece type={item.id} color={previewColor} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black uppercase tracking-wide">{item.name}</h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 border font-black uppercase ${
                              item.category === 'crafted'
                                ? 'bg-red-500 text-white border-black'
                                : 'bg-amber-400 text-black border-black'
                            }`}
                          >
                            {item.category === 'crafted' ? 'Crafted Special' : 'Standard / Prince'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-100 dark:bg-[#141416] border-2 border-black dark:border-white text-xs font-mono mb-3">
                    <span className="font-black uppercase text-[10px] text-amber-600 dark:text-amber-400 block mb-1">
                      Movement Rule:
                    </span>
                    {item.movementText}
                  </div>
                </div>

                {/* Static 9x9 Preview Grid */}
                <div className="flex flex-col items-center pt-2 border-t-2 border-black/10 dark:border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-70 mb-2">
                    9×9 Movement Preview Grid
                  </span>
                  <div
                    className={`grid grid-cols-9 grid-rows-9 w-48 h-48 sm:w-56 sm:h-56 border-2 p-1 ${
                      isThemeLight ? 'border-black bg-neutral-200' : 'border-white bg-zinc-800'
                    }`}
                  >
                    {Array.from({ length: 9 }).map((_, r) => {
                      const dy = 4 - r;
                      return Array.from({ length: 9 }).map((__, c) => {
                        const dx = c - 4;
                        const isCenter = dx === 0 && dy === 0;
                        const isReachable = reachableSet.has(`${dx},${dy}`);
                        const isCellLight = (c + r) % 2 === 0;

                        let cellBg = isCellLight
                          ? isThemeLight ? 'bg-neutral-100' : 'bg-zinc-700'
                          : isThemeLight ? 'bg-neutral-300' : 'bg-zinc-900';

                        if (isReachable) {
                          cellBg = 'bg-amber-400 ring-1 ring-inset ring-amber-500';
                        }

                        return (
                          <div
                            key={`${dx},${dy}`}
                            className={`flex items-center justify-center relative p-0.5 ${cellBg}`}
                          >
                            {isCenter && (
                              <div className="w-full h-full p-0.5">
                                <ChessPiece type={item.id} color={previewColor} />
                              </div>
                            )}
                            {isReachable && (
                              <div className="w-1.5 h-1.5 bg-black rounded-full pointer-events-none" />
                            )}
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CraftTheoryView;
