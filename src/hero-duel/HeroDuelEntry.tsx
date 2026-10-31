import React, { useState, useMemo, useEffect } from 'react';
import './styles/heroDuel.css';
import { HeroId, Coord, HeroInstance, AiDifficulty } from './types/heroDuelTypes';
import { getRandomBalancedDraft, getHeroById } from './heroes/heroRegistry';
import { ModeHome } from './ui/ModeHome';
import { HeroDraft } from './ui/HeroDraft';
import { Placement } from './ui/Placement';
import { HeroBoard } from './ui/HeroBoard';
import { AbilityBar } from './ui/AbilityBar';
import { GuidancePanel } from './ui/GuidancePanel';
import { ResultsModal } from './ui/ResultsModal';
import { HowToPlayModal } from './ui/HowToPlayModal';
import { CardGallery } from './cards/CardGallery';
import { DeploymentScreen } from './ui/siege/DeploymentScreen';
import { SiegeMatchView } from './ui/siege/SiegeMatchView';
import { useHeroDuelMatch } from './hooks/useHeroDuelMatch';
import {
  ArrowLeft,
  BookOpen,
  RotateCcw,
  Flag,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  Users,
} from 'lucide-react';

interface HeroDuelEntryProps {
  onBack: () => void;
}

type HeroDuelScreen = 'home' | 'siege_deploy' | 'siege_match' | 'draft' | 'placement' | 'match' | 'vault';

interface PlacedHero {
  heroId: HeroId;
  pos: Coord;
  isCaptain: boolean;
}

export const HeroDuelEntry: React.FC<HeroDuelEntryProps> = ({ onBack }) => {
  const [screen, setScreen] = useState<HeroDuelScreen>('home');
  const [isPassAndPlay, setIsPassAndPlay] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('normal');
  const [siegeHeroes, setSiegeHeroes] = useState<HeroId[]>([
    'mugen-king',
    'captain-englland',
    'dr-methanogenic',
    'ironclad-warden',
  ]);
  const [siegePlacements, setSiegePlacements] = useState<{ heroId: HeroId; pos: { x: number; y: number } }[]>([]);

  const [draftedHeroes, setDraftedHeroes] = useState<HeroId[]>([
    'mugen-king',
    'captain-englland',
    'dr-methanogenic',
    'ironclad-warden',
  ]);
  const [captainId, setCaptainId] = useState<HeroId>('mugen-king');
  const [team1Placements, setTeam1Placements] = useState<PlacedHero[]>([]);
  const [team2Placements, setTeam2Placements] = useState<PlacedHero[]>([]);
  const [matchKey, setMatchKey] = useState(0);

  // Shrine Siege Flow Start
  const handleStartSiege = (difficulty: AiDifficulty) => {
    setAiDifficulty(difficulty);
    const draft = getRandomBalancedDraft();
    setSiegeHeroes(draft.heroes);
    setScreen('siege_deploy');
  };

  const handleConfirmSiegeDeployment = (placements: { heroId: HeroId; pos: { x: number; y: number } }[]) => {
    setSiegePlacements(placements);
    setSiegeHeroes(placements.map((p) => p.heroId));
    setScreen('siege_match');
  };

  // Start Vs AI Flow (Classic Legacy)
  const handleStartClassicAi = (difficulty: AiDifficulty) => {
    setIsPassAndPlay(false);
    setAiDifficulty(difficulty);
    setScreen('draft');
  };

  // Start Pass & Play Flow (Classic Legacy)
  const handleStartPassAndPlay = () => {
    setIsPassAndPlay(true);
    setScreen('draft');
  };

  // Draft Confirmed
  const handleConfirmDraft = (heroes: HeroId[], captain: HeroId) => {
    setDraftedHeroes(heroes);
    setCaptainId(captain);
    setScreen('placement');
  };

  // Placement Confirmed -> Setup Opponent and Start Match
  const handleConfirmPlacement = (placements: PlacedHero[]) => {
    setTeam1Placements(placements);

    const opponentDraft = getRandomBalancedDraft();
    const oppSlots: Coord[] = [
      { x: 1, y: 7 },
      { x: 2, y: 7 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
    ];
    const oppPlacements: PlacedHero[] = opponentDraft.heroes.map((hId, idx) => ({
      heroId: hId,
      pos: oppSlots[idx] || { x: idx, y: 7 },
      isCaptain: hId === opponentDraft.captainId,
    }));
    setTeam2Placements(oppPlacements);
    setMatchKey((prev) => prev + 1);
    setScreen('match');
  };

  const handleRestartMatch = () => {
    setMatchKey((prev) => prev + 1);
  };

  // Convert placements to HeroInstance for Match Hook
  const team1HeroInstances: HeroInstance[] = useMemo(() => {
    return team1Placements.map((p, idx) => {
      const def = getHeroById(p.heroId);
      return {
        instanceId: `p1_${idx}_${p.heroId}`,
        heroId: p.heroId,
        name: def.name,
        title: def.title,
        team: 1 as const,
        pos: p.pos,
        isCaptain: p.isCaptain,
        isAlive: true,
        currentCooldown: 1,
        isSilenced: false,
        statuses: [],
        active: def.active,
        passives: [...def.passives],
      };
    });
  }, [team1Placements, matchKey]);

  const team2HeroInstances: HeroInstance[] = useMemo(() => {
    return team2Placements.map((p, idx) => {
      const def = getHeroById(p.heroId);
      return {
        instanceId: `p2_${idx}_${p.heroId}`,
        heroId: p.heroId,
        name: def.name,
        title: def.title,
        team: 2 as const,
        pos: p.pos,
        isCaptain: p.isCaptain,
        isAlive: true,
        currentCooldown: 0,
        isSilenced: false,
        statuses: [],
        active: def.active,
        passives: [...def.passives],
      };
    });
  }, [team2Placements, matchKey]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans select-none">
      {screen === 'home' && (
        <ModeHome
          onStartSiege={handleStartSiege}
          onStartClassicAi={handleStartClassicAi}
          onStartPassAndPlay={handleStartPassAndPlay}
          onOpenCardVault={() => setScreen('vault')}
          onBack={onBack}
        />
      )}

      {screen === 'siege_deploy' && (
        <DeploymentScreen
          heroes={siegeHeroes}
          onStartBattle={handleConfirmSiegeDeployment}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'siege_match' && (
        <SiegeMatchView
          heroes={siegeHeroes}
          placements={siegePlacements}
          aiDifficulty={aiDifficulty}
          onBackToHome={() => setScreen('home')}
          onOpenCardVault={() => setScreen('vault')}
        />
      )}

      {screen === 'draft' && (
        <HeroDraft
          onConfirmDraft={handleConfirmDraft}
          onBack={() => setScreen('home')}
          teamLabel={isPassAndPlay ? 'Team 1 Champions' : 'Your 4 Champions'}
        />
      )}

      {screen === 'placement' && (
        <Placement
          draftedHeroIds={draftedHeroes}
          captainId={captainId}
          onConfirmPlacement={handleConfirmPlacement}
          onBack={() => setScreen('draft')}
        />
      )}

      {screen === 'match' && (
        <ClassicMatchView
          key={matchKey}
          team1Heroes={team1HeroInstances}
          team2Heroes={team2HeroInstances}
          aiDifficulty={aiDifficulty}
          isPassAndPlay={isPassAndPlay}
          onRestart={handleRestartMatch}
          onBackToHome={() => setScreen('home')}
          onOpenVault={() => setScreen('vault')}
        />
      )}

      {screen === 'vault' && (
        <CardGallery onBack={() => setScreen('home')} />
      )}
    </div>
  );
};

interface ClassicMatchViewProps {
  team1Heroes: HeroInstance[];
  team2Heroes: HeroInstance[];
  aiDifficulty: AiDifficulty;
  isPassAndPlay: boolean;
  onRestart: () => void;
  onBackToHome: () => void;
  onOpenVault: () => void;
}

const ClassicMatchView: React.FC<ClassicMatchViewProps> = ({
  team1Heroes,
  team2Heroes,
  aiDifficulty,
  isPassAndPlay,
  onRestart,
  onBackToHome,
  onOpenVault,
}) => {
  const {
    matchState,
    selectedCoord,
    legalMoves,
    selectedHero,
    activeTargetMode,
    activeTargets,
    isAiThinking,
    earnedCards,
    handleSelectSquare,
    handleTriggerActive,
    handleCancelActive,
  } = useHeroDuelMatch({
    team1Heroes,
    team2Heroes,
    difficulty: aiDifficulty,
    isPassAndPlay,
  });

  const myTeamHeroes = matchState.heroes.filter((h) => h.team === (matchState.currentTurn === 1 ? 1 : 2) && h.isAlive);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="px-4 py-3 border-b-2 border-white/20 bg-[#121218] sticky top-0 z-30 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 text-white border-2 border-white hover:bg-neutral-800 flex items-center gap-2 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Duel</span>
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h1 className="text-sm sm:text-base font-black uppercase tracking-wider">
            Classic Duel (Legacy) • Turn {matchState.currentTurn}
          </h1>
        </div>

        <button
          onClick={onRestart}
          className="hd-btn-brutal px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-white flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart</span>
        </button>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl w-full mx-auto p-3 sm:p-5 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* CENTER COLUMN */}
        <section className="col-span-12 lg:col-span-12 flex flex-col items-center gap-3 w-full max-w-xl mx-auto">
          <HeroBoard
            matchState={matchState}
            selectedCoord={selectedCoord}
            legalMoves={legalMoves}
            activeTargetMode={activeTargetMode}
            activeTargets={activeTargets}
            onSelectSquare={handleSelectSquare}
          />

          <AbilityBar
            myHeroes={myTeamHeroes}
            selectedHero={selectedHero}
            activeTargetMode={activeTargetMode}
            onSelectHeroAndTriggerAbility={(hero) => {
              handleSelectSquare(hero.pos);
              setTimeout(() => handleTriggerActive(), 20);
            }}
            onSelectHero={(hero) => handleSelectSquare(hero.pos)}
            onCancelActive={handleCancelActive}
            isMyTurn={isPassAndPlay ? true : matchState.currentTurn === 1}
          />
        </section>
      </main>

      {matchState.winner && (
        <ResultsModal
          matchState={matchState}
          earnedCards={earnedCards}
          onPlayAgain={onRestart}
          onOpenVault={onOpenVault}
          onExit={onBackToHome}
        />
      )}
    </div>
  );
};
