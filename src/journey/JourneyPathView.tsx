/**
 * JourneyPathView.tsx - Responsive Scrollable Progression Path for Journey Career Mode
 *
 * Provides serpentine cyberpunk roadmap across 5 chapters and 21 checkpoint nodes,
 * supporting touch scrolling, milestone chests, avatar customization, and match launching.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  Zap,
  Crown,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Shield,
  Gift,
  Compass,
} from 'lucide-react';
import { JOURNEY_NODES } from './journeyNodes';
import type { JourneyNodeDef, JourneyProgress } from './journeyTypes';
import {
  getJourneyProgress,
  recordNodeVictory,
  claimMilestoneChest,
  saveCustomAvatar,
  resetJourneyProgress,
} from './journeyStore';
import { JourneyNodeCard } from './JourneyNodeCard';
import { JourneyPreMatchModal } from './JourneyPreMatchModal';
import { JourneyAvatar } from './JourneyAvatar';

interface JourneyPathViewProps {
  userId?: string;
  onLaunchMatch: (node: JourneyNodeDef) => void;
}

export const JourneyPathView: React.FC<JourneyPathViewProps> = ({
  userId,
  onLaunchMatch,
}) => {
  const [progress, setProgress] = useState<JourneyProgress>(() =>
    getJourneyProgress(userId)
  );
  const [selectedNode, setSelectedNode] = useState<JourneyNodeDef | null>(null);
  const [isPreMatchOpen, setIsPreMatchOpen] = useState(false);
  const [claimNotice, setClaimNotice] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeNodeRef = useRef<HTMLDivElement | null>(null);

  // Sync state on updates
  useEffect(() => {
    const handleUpdate = () => {
      setProgress(getJourneyProgress(userId));
    };
    window.addEventListener('journey_progress_updated', handleUpdate);
    return () =>
      window.removeEventListener('journey_progress_updated', handleUpdate);
  }, [userId]);

  // Auto-scroll to active node on mount
  useEffect(() => {
    if (activeNodeRef.current) {
      setTimeout(() => {
        activeNodeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 250);
    }
  }, []);

  const handleSelectNode = (node: JourneyNodeDef) => {
    setSelectedNode(node);
    setIsPreMatchOpen(true);
  };

  const handleClaimChest = (nodeId: string) => {
    const res = claimMilestoneChest(userId, nodeId);
    if (res.success) {
      setClaimNotice(`MILESTONE REWARD CLAIMED! +${res.gemsAwarded} MUGEN GEMS`);
      setTimeout(() => setClaimNotice(null), 4000);
    }
  };

  const handleCustomAvatarUploaded = (dataUrl: string) => {
    saveCustomAvatar(userId, dataUrl);
  };

  const handleResetProgress = () => {
    if (
      window.confirm(
        'Are you sure you want to reset your Journey progression? All stars and node clears will be reset.'
      )
    ) {
      const fresh = resetJourneyProgress(userId);
      setProgress(fresh);
    }
  };

  // Group nodes by chapter
  const chapters = [1, 2, 3, 4, 5].map((chapNum) => {
    const chapterNodes = JOURNEY_NODES.filter((n) => n.chapter === chapNum);
    return {
      number: chapNum,
      name: chapterNodes[0]?.chapterName || `Chapter ${chapNum}`,
      nodes: chapterNodes,
    };
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a10] text-slate-100 overflow-hidden select-none">
      {/* 1. TOP STATS BAR */}
      <div className="px-4 py-3 bg-black/80 border-b-2 border-white/10 flex items-center justify-between shrink-0 z-20">
        {/* Left: Avatar Slot & Name */}
        <div className="flex items-center gap-3">
          <JourneyAvatar
            customImageUrl={progress.customAvatarUrl}
            size="md"
            isEditable={true}
            onImageUploaded={handleCustomAvatarUploaded}
            accentColor="#fbbf24"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-amber-400">
                JOURNEY CAMPAIGN
              </span>
              <span className="text-[9px] font-mono bg-slate-900 border border-slate-700 px-1.5 py-0.2 rounded-xs text-slate-400">
                21 NODES
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <span>Hover avatar to upload photo</span>
            </div>
          </div>
        </div>

        {/* Right: Stars, Points & Reset Button */}
        <div className="flex items-center gap-3">
          {/* Total Stars Counter */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 border border-amber-500/50 rounded-md">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-mono font-black text-white">
              {progress.totalStars}
              <span className="text-slate-500 text-[10px]">/63</span>
            </span>
          </div>

          {/* Total Points Counter */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 border border-emerald-500/50 rounded-md">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-black text-emerald-400">
              {progress.totalJourneyPoints} PTS
            </span>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetProgress}
            className="w-8 h-8 rounded-md border border-slate-800 bg-slate-950 text-slate-500 hover:text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
            title="Reset Journey Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Claim Toast Notice */}
      {claimNotice && (
        <div className="bg-amber-400 text-black px-4 py-2 font-mono font-black text-xs text-center border-b border-black animate-pulse flex items-center justify-center gap-2">
          <Gift className="w-4 h-4" />
          <span>{claimNotice}</span>
        </div>
      )}

      {/* 2. SCROLLABLE ROADMAP CONTAINER */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-12 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {chapters.map((chap) => (
          <div key={chap.number} className="max-w-2xl mx-auto space-y-6">
            {/* Chapter Banner Header */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-amber-500/40" />
              <div className="px-4 py-1.5 bg-black/90 border-2 border-amber-500/60 rounded-full flex items-center gap-2 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-mono font-black uppercase text-amber-300 tracking-wider">
                  CHAPTER {chap.number}: {chap.name}
                </span>
              </div>
              <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-amber-500/40" />
            </div>

            {/* Nodes in Chapter: Alternating Serpentine Path */}
            <div className="flex flex-col items-center gap-8 relative">
              {chap.nodes.map((node, index) => {
                const nodeProg = progress.nodes[node.id] || {
                  nodeId: node.id,
                  unlocked: false,
                  completed: false,
                  stars: 0,
                  highScore: 0,
                  attemptCount: 0,
                };
                const isActive =
                  nodeProg.unlocked &&
                  !nodeProg.completed &&
                  progress.lastActiveNodeId === node.id;
                const isClaimed = Boolean(
                  progress.claimedChests && progress.claimedChests[node.id]
                );

                // Alternating horizontal alignment for winding feel
                const alignmentClass =
                  index % 3 === 0
                    ? 'self-center'
                    : index % 3 === 1
                    ? 'self-start sm:ml-12'
                    : 'self-end sm:mr-12';

                return (
                  <div
                    key={node.id}
                    ref={isActive ? activeNodeRef : undefined}
                    className={`relative z-10 transition-transform ${alignmentClass}`}
                  >
                    <JourneyNodeCard
                      node={node}
                      progress={nodeProg}
                      isActive={isActive}
                      isChestClaimed={isClaimed}
                      onSelectNode={handleSelectNode}
                      onClaimChest={handleClaimChest}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Path Complete Signpost */}
        <div className="max-w-md mx-auto my-12 p-6 rounded-xl bg-gradient-to-b from-slate-900 to-black border-2 border-amber-400 text-center space-y-3 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
          <Crown className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-black uppercase text-white tracking-widest">
            THE APEX OF MASTERY
          </h3>
          <p className="text-xs font-mono text-slate-300">
            Conquering all 21 nodes proves supreme tactical dominance. Return to any checkpoint anytime to maximize your 3-star rating!
          </p>
        </div>
      </div>

      {/* 3. MISSION BRIEFING MODAL */}
      <JourneyPreMatchModal
        isOpen={isPreMatchOpen}
        node={selectedNode}
        progress={selectedNode ? progress.nodes[selectedNode.id] : null}
        onClose={() => setIsPreMatchOpen(false)}
        onStartMatch={(node) => {
          setIsPreMatchOpen(false);
          onLaunchMatch(node);
        }}
      />
    </div>
  );
};
