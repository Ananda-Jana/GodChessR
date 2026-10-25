import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { useEsModalFocus } from './EsModalFocus';
import { EsPieceRenderer } from './EsPieceRenderer';
import { EsPieceType } from './EsTypes';

export interface EsRulesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: 1 | 2 | 3 | 4 | 5;
}

interface PieceDoc {
  type: EsPieceType;
  name: string;
  desc: string;
  // 5x5 matrix representing relative move offsets (-2 to +2)
  // center is (2,2)
  diagram: number[][]; // 1 = move/step, 2 = slide ray, 3 = jump
}

const PIECE_DOCS: PieceDoc[] = [
  {
    type: 'dreamer',
    name: 'Dreamer (AJ)',
    desc: 'Royal/protagonist. 1 step in all 8 directions. Captures.',
    diagram: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    type: 'keeper',
    name: 'Keeper (Sunanda)',
    desc: 'Opponent royal. 1 step in all 8 directions. Captures.',
    diagram: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    type: 'guide',
    name: 'Guide (AJX)',
    desc: 'Slides up to 3 in O4, OR 1 step in D4. Captures.',
    diagram: [
      [0, 0, 2, 0, 0],
      [0, 1, 2, 1, 0],
      [2, 2, 0, 2, 2],
      [0, 1, 2, 1, 0],
      [0, 0, 2, 0, 0],
    ],
  },
  {
    type: 'footman',
    name: 'Footman',
    desc: '1 step in O4 orthogonal directions. Captures.',
    diagram: [
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    type: 'shade',
    name: 'Shade',
    desc: 'Knight jump (+-1,+-2 or +-2,+-1). Ignores intervening pieces. Captures.',
    diagram: [
      [0, 3, 0, 3, 0],
      [3, 0, 0, 0, 3],
      [0, 0, 0, 0, 0],
      [3, 0, 0, 0, 3],
      [0, 3, 0, 3, 0],
    ],
  },
  {
    type: 'wind',
    name: 'Wind',
    desc: 'Slides up to 3 squares in D4 diagonal directions. Captures.',
    diagram: [
      [2, 0, 0, 0, 2],
      [0, 2, 0, 2, 0],
      [0, 0, 0, 0, 0],
      [0, 2, 0, 2, 0],
      [2, 0, 0, 0, 2],
    ],
  },
  {
    type: 'beam',
    name: 'Beam',
    desc: 'Slides up to 4 squares in O4 orthogonal directions. Captures.',
    diagram: [
      [0, 0, 2, 0, 0],
      [0, 0, 2, 0, 0],
      [2, 2, 0, 2, 2],
      [0, 0, 2, 0, 0],
      [0, 0, 2, 0, 0],
    ],
  },
  {
    type: 'scarecrow',
    name: 'Scarecrow',
    desc: '1 step in O4. NO capture. (Royal piece in Game 1).',
    diagram: [
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    type: 'investigator',
    name: 'Investigator',
    desc: 'Slides up to 2 in O4. NO capture. Questions AJ on adjacency.',
    diagram: [
      [0, 0, 2, 0, 0],
      [0, 0, 2, 0, 0],
      [2, 2, 0, 2, 2],
      [0, 0, 2, 0, 0],
      [0, 0, 2, 0, 0],
    ],
  },
  {
    type: 'boat',
    name: 'Paper Boat',
    desc: 'Fragile piece to protect. 1 step in O4. NO capture.',
    diagram: [
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    type: 'rescuer',
    name: 'Rescuer',
    desc: 'Slides up to 4 in O4. Captures. Lift special swaps with Boat.',
    diagram: [
      [0, 0, 2, 0, 0],
      [0, 0, 2, 0, 0],
      [2, 2, 0, 2, 2],
      [0, 0, 2, 0, 0],
      [0, 0, 2, 0, 0],
    ],
  },
  {
    type: 'banded',
    name: 'Banded',
    desc: '1 step in 8 directions. Captures. Moves twice in G4 Act 1.',
    diagram: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    type: 'yjkstra',
    name: 'Yjkstra',
    desc: 'Boss. Slides up to 2 in 8 directions. Acts on odd rounds only.',
    diagram: [
      [2, 0, 2, 0, 2],
      [0, 2, 2, 2, 0],
      [2, 2, 0, 2, 2],
      [0, 2, 2, 2, 0],
      [2, 0, 2, 0, 2],
    ],
  },
];

export const EsRulesSheet: React.FC<EsRulesSheetProps> = ({ isOpen, onClose, gameId }) => {
  const modalRef = useEsModalFocus(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Endless Spring Rules and Piece Legend"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 backdrop-blur-md p-0 md:p-4"
    >
      <div
        ref={modalRef}
        className="w-full md:max-w-2xl bg-zinc-950 border-t md:border border-amber-500/30 rounded-t-2xl md:rounded-lg shadow-2xl max-h-[85dvh] flex flex-col overflow-hidden text-neutral-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Rules &amp; Piece Legend
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rules"
            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 text-xs">
          {/* Universal Rules */}
          <div className="p-3 bg-white/5 border border-white/10 rounded">
            <h4 className="font-bold text-amber-300 uppercase mb-1.5 text-xs">
              Universal Core Invariants
            </h4>
            <ul className="space-y-1 list-disc list-inside text-neutral-300 leading-relaxed">
              <li><strong>No Check / Checkmate:</strong> Royal pieces are eliminated only when captured.</li>
              <li><strong>Turn Flow:</strong> Round = A moves, then B moves. You can never land on a friendly piece or void square.</li>
              <li><strong>Sliding Pieces:</strong> Stop at the first piece or void on their ray.</li>
              <li><strong>Jumping Pieces:</strong> Ignore pieces and voids in between; landing must be playable.</li>
              <li><strong>Zero Randomness:</strong> Game events and deterministic opponent moves are scheduled and visible.</li>
            </ul>
          </div>

          {/* Piece Legend with 5x5 mini-diagrams */}
          <div>
            <h4 className="font-bold text-amber-300 uppercase mb-2 text-xs">
              Piece Roster &amp; Movement Geometry
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PIECE_DOCS.map((doc) => (
                <div
                  key={doc.type}
                  className="p-2.5 bg-zinc-900 border border-white/10 rounded flex items-start gap-3"
                >
                  {/* Silhouette */}
                  <div className="w-10 h-10 shrink-0 bg-black/40 border border-white/10 rounded p-1 flex items-center justify-center">
                    <EsPieceRenderer type={doc.type} side="A" className="w-full h-full" />
                  </div>

                  {/* Description & 5x5 Mini Diagram */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-[13px]">{doc.name}</div>
                    <p className="text-[11px] text-neutral-400 leading-tight mt-0.5 mb-2">{doc.desc}</p>

                    {/* 5x5 Mini diagram */}
                    <div className="grid grid-cols-5 gap-0.5 w-[65px] h-[65px] bg-neutral-950 p-0.5 border border-white/10 rounded">
                      {doc.diagram.map((row, r) =>
                        row.map((cell, c) => {
                          const isCenter = r === 2 && c === 2;
                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`w-full h-full rounded-[1px] flex items-center justify-center text-[7px] ${
                                isCenter
                                  ? 'bg-amber-400'
                                  : cell === 1
                                  ? 'bg-emerald-500/80'
                                  : cell === 2
                                  ? 'bg-sky-500/80'
                                  : cell === 3
                                  ? 'bg-purple-500/80'
                                  : 'bg-neutral-800'
                              }`}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-zinc-900 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase rounded text-xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
