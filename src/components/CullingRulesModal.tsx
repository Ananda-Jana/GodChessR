import React from 'react';
import { RulebookWindow } from './rulebook/RulebookWindow';

interface CullingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CullingRulesModal: React.FC<CullingRulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <RulebookWindow
      isOpen={isOpen}
      onClose={onClose}
      initialMode="culling"
      initialSubTab="movement_book"
    />
  );
};
