import React, { useState } from 'react';
import { EsGameId, EsGameState } from './EsTypes';
import { esCreateInitialGameState } from './EsEvents';
import { esClearSave, esLoadGameState } from './EsSaveStore';
import { EsSelectScreen } from './EsSelectScreen';
import { EsStoryModal } from './EsStoryModal';
import { EsGameScreen } from './EsGameScreen';

export interface EsRootProps {
  onExit: () => void;
}

export const EsRoot: React.FC<EsRootProps> = ({ onExit }) => {
  const [selectedGameId, setSelectedGameId] = useState<EsGameId | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [activeGameState, setActiveGameState] = useState<EsGameState | null>(null);

  const handleSelectGame = (gameId: EsGameId, startOver = false) => {
    setSelectedGameId(gameId);

    if (startOver) {
      esClearSave(gameId);
      // New game: Show story prologue modal
      setIsStoryModalOpen(true);
    } else {
      // Try loading saved game
      const saved = esLoadGameState(gameId);
      if (saved) {
        setActiveGameState(saved);
        setIsStoryModalOpen(false);
      } else {
        // Fallback to fresh game with story modal
        setIsStoryModalOpen(true);
      }
    }
  };

  const handleBeginGame = () => {
    if (!selectedGameId) return;
    const initial = esCreateInitialGameState(selectedGameId, 1);
    setActiveGameState(initial);
    setIsStoryModalOpen(false);
  };

  const handleBackToSelect = () => {
    setSelectedGameId(null);
    setIsStoryModalOpen(false);
    setActiveGameState(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black text-white font-sans">
      {!activeGameState && (
        <EsSelectScreen
          onSelectGame={handleSelectGame}
          onExit={onExit}
        />
      )}

      {selectedGameId && (
        <EsStoryModal
          isOpen={isStoryModalOpen}
          gameId={selectedGameId}
          onBegin={handleBeginGame}
          onClose={() => setIsStoryModalOpen(false)}
        />
      )}

      {activeGameState && (
        <EsGameScreen
          initialState={activeGameState}
          onExit={handleBackToSelect}
        />
      )}
    </div>
  );
};

export default EsRoot;
