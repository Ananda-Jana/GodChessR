import React from 'react';
import { MatchState } from '../types/game';
import { RulebookWindow } from './rulebook/RulebookWindow';
import { RulebookModeId } from './rulebook/types';

export interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMatch?: MatchState | null;
  isBotMatch?: boolean;
  initialMode?: RulebookModeId;
}

/**
 * RulesModal
 * Full-screen in-page window rendering the comprehensive MugenChessX Official Codex
 * with isolated mode tabs (Standard, Crafted, Culling, Rose Paradise, Hashira Training, Multiplayer),
 * 3-tier subtabs (Overview, Rules & Movement, Strategy Playbook), and visual opening diagrams.
 */
export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  activeMatch,
  isBotMatch,
  initialMode,
}) => {
  return (
    <RulebookWindow
      isOpen={isOpen}
      onClose={onClose}
      activeMatch={activeMatch}
      isBotMatch={isBotMatch}
      initialMode={initialMode}
    />
  );
};
