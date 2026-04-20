'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';
import { generateScoreHash } from '@/lib/security';

interface SaveScorePromptProps {
  peakScore: number;
  gameSlug: string;
  difficulty?: number;
  standard?: 'PAL' | 'NTSC';
  onDismiss: () => void;
  onSaveSuccess?: () => void;
}

export function SaveScorePrompt({
  peakScore,
  gameSlug,
  difficulty = 0,
  standard = 'PAL' as const,
  onDismiss,
  onSaveSuccess
}: SaveScorePromptProps) {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [countdown, setCountdown] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-dismiss countdown
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onDismiss]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameSlug,
          score: peakScore,
          difficulty,
          hash: generateScoreHash(peakScore, gameSlug, difficulty)
        })
      });

      if (res.ok) {
        showNotification("Score Saved!", "success");
        onSaveSuccess?.();
        onDismiss();
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
      score: peakScore,
      difficulty
    }));
    signIn('google', { callbackUrl: window.location.href });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="nes-container is-rounded is-dark with-title max-w-sm w-full">
        <p className="title">GAME OVER?</p>

        <div className="text-center py-4">
          <p className="text-xs text-gray-400 mb-2">YOUR PEAK SCORE</p>
          <p className="text-4xl text-yellow-400">{peakScore.toLocaleString()}</p>
        </div>

        <div className="flex flex-col gap-3">
          {session ? (
            <button
              type="button"
              className={`nes-btn is-success w-full ${submitting ? 'is-disabled' : ''}`}
              onClick={handleSave}
              disabled={submitting}
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

          <button
            type="button"
            className="nes-btn is-disabled w-full"
            onClick={onDismiss}
          >
            DISMISS
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Auto-dismiss in {countdown}s
        </p>
      </div>
    </div>
  );
}