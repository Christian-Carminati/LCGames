'use client';

import { useSession } from 'next-auth/react';

interface CurrentScoreCardProps {
  gameSlug: string;
  capturedScore?: number;
  hasDifficultyLevels?: boolean;
  currentDifficulty?: number;
  difficultyNames?: string[];
  hasPalNtsc?: boolean;
  currentStandard?: 'PAL' | 'NTSC';
  numDifficultyLevels?: number;
  romPath?: string | null;
  onScoreSaved?: () => void;
}

export function CurrentScoreCard({
  gameSlug,
  capturedScore,
  hasDifficultyLevels = false,
  currentDifficulty = 0,
  difficultyNames = [],
  hasPalNtsc = false,
  currentStandard = 'PAL',
  numDifficultyLevels = 1,
  romPath,
  onScoreSaved
}: CurrentScoreCardProps) {
  const { data: session } = useSession();

  const getDifficultyName = (levelIndex: number): string => {
    if (difficultyNames[levelIndex]) {
      return difficultyNames[levelIndex];
    }
    switch (levelIndex) {
      case 0: return 'EASY';
      case 1: return 'MEDIUM';
      case 2: return 'HARD';
      default: return `HARD ${levelIndex - 1}`;
    }
  };

  const getDifficultyLabel = (): string => {
    if (!hasDifficultyLevels) return '';
    const diffName = getDifficultyName(currentDifficulty).toUpperCase();
    if (hasPalNtsc) {
      return `${diffName} (${currentStandard})`;
    }
    return diffName;
  };

  return (
    <div className="nes-container is-rounded is-dark with-title">
      <p className="title">CURRENT SCORE</p>

      <div className="mb-4 text-center">
        <p className="text-xs text-gray-400 mb-2">SCORE</p>
        <p className="text-4xl text-green-400">{capturedScore ?? 0}</p>
      </div>

      {hasDifficultyLevels && numDifficultyLevels > 1 && (
        <div className="mb-4">
          <p className="text-xs text-yellow-400 text-center">
            DIFFICULTY: {getDifficultyLabel()}
          </p>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">Score will be captured at game over</p>
      </div>
    </div>
  );
}
