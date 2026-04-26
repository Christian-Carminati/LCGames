'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { generateScoreHash } from '@/lib/security';
import { checkCheatsEnabled } from '@/lib/cheat-detection';

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
  const { showNotification } = useNotification();
  const [submitting, setSubmitting] = useState(false);

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

  const handleSaveScore = async () => {
    if (!capturedScore || capturedScore === 0) return;

    if (romPath) {
      const { hasCheats } = checkCheatsEnabled(romPath);
      if (hasCheats) {
        showNotification("Cheats detected! Score cannot be saved.", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameSlug,
          score: capturedScore,
          difficulty: currentDifficulty,
          hash: generateScoreHash(capturedScore, gameSlug, currentDifficulty)
        })
      });

      if (res.ok) {
        showNotification("Score Saved!", "success");
        onScoreSaved?.();
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || "Failed to save score.", "error");
      }
    } catch (e) {
      console.error("Failed to save score", e);
      showNotification("Error saving score.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginAndSave = () => {
    sessionStorage.setItem('pendingScore', JSON.stringify({
      gameSlug,
      score: capturedScore,
      difficulty: currentDifficulty
    }));
    signIn('google', { callbackUrl: window.location.href });
  };

  const isDisabled = !capturedScore || capturedScore === 0 || submitting;

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

      <div className="mt-4 flex flex-col gap-3">
        {session ? (
          <button
            type="button"
            className={`nes-btn is-success w-full ${isDisabled ? 'is-disabled' : ''}`}
            onClick={handleSaveScore}
            disabled={isDisabled}
          >
            {submitting ? 'SAVING...' : 'SAVE SCORE'}
          </button>
        ) : (
          <button
            type="button"
            className="nes-btn is-primary w-full"
            onClick={handleLoginAndSave}
          >
            LOGIN TO SAVE
          </button>
        )}
      </div>
    </div>
  );
}