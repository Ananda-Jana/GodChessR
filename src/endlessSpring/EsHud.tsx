import React from 'react';
import { EsGameState } from './EsTypes';
import { ES_ROUND_LIMITS } from './EsGameData';

export interface EsHudProps {
  state: EsGameState;
  className?: string;
}

export const EsHud: React.FC<EsHudProps> = ({ state, className = '' }) => {
  const { gameId, stageOrAct, round } = state;
  const limitSetting = ES_ROUND_LIMITS[gameId];
  const roundLimit = Array.isArray(limitSetting) ? limitSetting[stageOrAct - 1] : limitSetting;

  const getObjectiveText = (): string => {
    switch (gameId) {
      case 1:
        return 'Defend your Scarecrow · Capture or burn the enemy Scarecrow';
      case 2:
        return state.itemsCollected.notebook && state.itemsCollected.slip
          ? 'Both items held! Reach the EXIT tile'
          : 'Collect Notebook & Slip · Avoid 3 Questions from Investigator';
      case 3:
        if (stageOrAct === 1) {
          return `Stage 1: Wrap across board edges (Loops ${state.loopsCount}/2) to enter Passage`;
        } else if (stageOrAct === 2) {
          return 'Stage 2: Evade rising water · Rescuer Lift ready · Reach row 6 Passage';
        } else {
          return 'Stage 3: Gate behind is vanishing · Reach Passage (3,5)/(4,5)';
        }
      case 4:
        if (stageOrAct === 1) {
          return `Act 1: Guide AJ to row 0 (${state.crowdTokens.length} tokens active)`;
        } else if (stageOrAct === 2) {
          return 'Act 2: Homedoing · Catch the fleeing neutral Scarecrow';
        } else {
          return 'Act 3: Reach the Red Door at (2,6) · Evade Torchbearer stillness';
        }
      case 5:
        if (stageOrAct === 1) {
          const kinCount = state.pieces.filter((p) => p.type === 'kin').length;
          return `Phase 1: Total Mistrust · Move next to Kin to reveal them (${6 - kinCount}/6 revealed)`;
        } else if (stageOrAct === 2) {
          return `Phase 2: Collect all 5 Papers (${state.papersCollected}/5) and reach the Stair`;
        } else {
          return 'Phase 3: Reckoning · Survive round 8 or defeat Yjkstra';
        }
    }
  };

  const getNextEventText = (): string => {
    switch (gameId) {
      case 1:
        if (round < 4) return `Shadow shrinks to x < 3 in ${4 - round + 1} rounds`;
        if (round < 5) return 'Shrine of Ryoshin appears at end of round 5';
        if (round < 8) return `Shadow shrinks to x < 2 in ${8 - round + 1} rounds`;
        if (round < 11) return `Storm begins in ${11 - round} rounds (slider range reduced)`;
        if (round <= 20) return `Fire begins in ${21 - round} rounds`;
        if (round < 30) return 'Fire is spreading each round';
        return 'Dusk approaches (final round)';

      case 2:
        if (round < 11) return `The Angel appears in ${11 - round} rounds`;
        if (round < 21) return `Phase 3 begins in ${21 - round} rounds`;
        return 'World of My Own (Echoes become real instantly)';

      case 3:
        if (stageOrAct === 2) {
          if (round < 3) return 'Water begins rising at end of round 3';
          if (round <= 9) return `Water rises to row y=${round - 3 + 1} at round end`;
        } else if (stageOrAct === 3) {
          if (round === 1) return 'Row 0 squares become void at round end';
          if (round < 3) return `Guest reinforcement in ${3 - round} rounds`;
          if (round < 6) return `Second reinforcement in ${6 - round} rounds`;
        }
        return `Stage ends in ${roundLimit - round + 1} rounds`;

      case 4:
        if (stageOrAct === 1) {
          if (round < 4) return `B reinforcements in ${4 - round} rounds`;
          if (round < 8) return `B reinforcements in ${8 - round} rounds`;
          if (round < 12) return `Final reinforcements in ${12 - round} rounds`;
          return 'End of procession approaching';
        }
        return `Act ends in ${roundLimit - round + 1} rounds`;

      case 5:
        if (stageOrAct === 2) {
          return round % 2 === 1 ? 'Watcher moves at round end' : 'Watcher resting this round';
        }
        if (stageOrAct === 3) {
          return round % 2 === 1 ? 'Yjkstra acts this round' : 'Yjkstra resting (even round)';
        }
        return `Phase ends in ${roundLimit - round + 1} rounds`;
    }
  };

  return (
    <div className={`w-full px-3 py-1.5 bg-zinc-950/90 border-b border-amber-500/20 text-xs flex flex-col justify-center shrink-0 ${className}`}>
      {/* Objective Line */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="text-[13px] sm:text-sm font-semibold text-amber-300 truncate">
          {getObjectiveText()}
        </div>
        <div className="text-[11px] font-mono font-bold text-neutral-400 shrink-0 whitespace-nowrap">
          Round {round}/{roundLimit} · {state.turn === 'A' ? "Player's Turn" : "Opponent's Turn"}
        </div>
      </div>

      {/* Next Event & Context Line */}
      <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-400 mt-0.5 min-w-0">
        <span className="text-amber-200/80 truncate">
          ⚡ {getNextEventText()}
        </span>
        {gameId === 2 && (
          <span className="font-mono text-amber-400 shrink-0">
            Questions: {state.questionsCount}/3
          </span>
        )}
        {gameId === 3 && stageOrAct === 1 && (
          <span className="font-mono text-cyan-300 shrink-0">
            Loops: {state.loopsCount}/2
          </span>
        )}
      </div>
    </div>
  );
};
