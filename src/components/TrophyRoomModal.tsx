/**
 * TrophyRoomModal.tsx - Entry Point Component for Fullscreen Trophy Room & League
 */

import React, { useState, useEffect } from 'react';
import type { AchievementCard } from '../predictor/types';
import { useTrophyRoomData } from './trophy/useTrophyRoomData';
import { TrophyRoomDesktop } from './trophy/TrophyRoomDesktop';
import { TrophyRoomMobile } from './trophy/TrophyRoomMobile';

import { RankUpCelebration } from './trophy/RankUpCelebration';

import type { TrophyMainView } from './trophy/useTrophyRoomData';

interface TrophyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedCard?: AchievementCard | null;
  initialMainView?: TrophyMainView;
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({
  isOpen,
  onClose,
  initialSelectedCard = null,
  initialMainView = 'trophies',
}) => {
  const trophyData = useTrophyRoomData(isOpen, onClose, initialSelectedCard, initialMainView);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {isDesktop ? (
        <TrophyRoomDesktop data={trophyData} onClose={onClose} />
      ) : (
        <TrophyRoomMobile data={trophyData} onClose={onClose} />
      )}

      {trophyData.promotionData && (
        <RankUpCelebration
          isOpen={Boolean(trophyData.promotionData)}
          onClose={trophyData.closePromotionModal}
          oldRank={trophyData.promotionData.oldRank}
          newRank={trophyData.promotionData.newRank}
          newTrophies={trophyData.promotionData.newTrophies}
          gemsAwarded={trophyData.promotionData.gemsAwarded}
        />
      )}
    </>
  );
};
