'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
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
  romPath
}: CurrentScoreCardProps) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);
  const [selectedStandard, setSelectedStandard] = useState<'PAL' | 'NTSC'>('PAL');
  const { showNotification } = useNotification();

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

  const calculateCombinedDifficulty = useCallback((): number => {
    if (!hasDifficultyLevels && !hasPalNtsc) return 0;
    const baseDifficulty = hasDifficultyLevels ? selectedDifficulty : 0;
    const standardOffset = (hasPalNtsc && selectedStandard === 'NTSC') ? numDifficultyLevels : 0;
    return baseDifficulty + standardOffset;
  }, [hasDifficultyLevels, hasPalNtsc, numDifficultyLevels, selectedDifficulty, selectedStandard]);

  useEffect(() => {
    if (hasDifficultyLevels) {
      setSelectedDifficulty(currentDifficulty);
    }
  }, [currentDifficulty, hasDifficultyLevels]);

  useEffect(() => {
    setSelectedStandard(currentStandard);
  }, [currentStandard]);

  const handleSaveScore = async () => {
    if (capturedScore === undefined) return;

    if (romPath) {
      const { hasCheats } = checkCheatsEnabled(romPath);
      if (hasCheats) {
        showNotification("Cheats detected! Please disable them before saving score.", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const combinedDifficulty = calculateCombinedDifficulty();
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameSlug,
          score: capturedScore,
          difficulty: hasDifficultyLevels ? combinedDifficulty : 0,
          hash: generateScoreHash(capturedScore, gameSlug, hasDifficultyLevels ? combinedDifficulty : 0)
        })
      });

      if (res.ok) {
        showNotification("Score Saved!", "success");
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

  const getDifficultyLabel = (): string => {
    if (!hasDifficultyLevels) return '';
    const diffName = getDifficultyName(selectedDifficulty).toUpperCase();
    if (hasPalNtsc) {
      return `${diffName} (${selectedStandard})`;
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

      <div className="mt-4">
        {session ? (
          <button 
            type="button" 
            className={`nes-btn is-success w-full ${submitting ? 'is-disabled' : ''}`}
            onClick={handleSaveScore}
            disabled={submitting || capturedScore === undefined || capturedScore === 0}
          >
            {submitting ? 'SAVING...' : 'SAVE SCORE'}
          </button>
        ) : (
          <>
            <button 
              type="button" 
              className="nes-btn is-primary w-full"
              onClick={() => {
                if (capturedScore !== undefined && capturedScore > 0) {
                  sessionStorage.setItem('pendingScore', JSON.stringify({
                    gameSlug,
                    score: capturedScore,
                    difficulty: hasDifficultyLevels ? calculateCombinedDifficulty() : 0
                  }));
                }
                signIn('google', { callbackUrl: window.location.href });
              }}
            >
              LOGIN TO SAVE
            </button>
            <p className="text-xs text-yellow-500 mt-2 animate-pulse text-center">
              Score won&apos;t be saved without login
            </p>
          </>
        )}
      </div>
    </div>
  );
}
