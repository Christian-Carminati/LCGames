'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { generateScoreHash } from '@/lib/security';
import { checkCheatsEnabled } from '@/lib/cheat-detection';

export default function LoginButton() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [isSubmittingPending, setIsSubmittingPending] = useState(false);
  const hasCheckedPendingRef = useRef(false);

  useEffect(() => {
    if (session && !hasCheckedPendingRef.current && !isSubmittingPending) {
      hasCheckedPendingRef.current = true;

      const pendingScoreData = sessionStorage.getItem('pendingScore');
      if (pendingScoreData) {
        try {
          const { gameSlug, score, difficulty, romPath } = JSON.parse(pendingScoreData);

          if (romPath) {
            const { hasCheats } = checkCheatsEnabled(romPath);
            if (hasCheats) {
              sessionStorage.removeItem('pendingScore');
              showNotification("Cheats detected! Score cannot be saved.", "error");
              return;
            }
          }

          setIsSubmittingPending(true);
          fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameSlug,
              score,
              difficulty,
              hash: generateScoreHash(score, gameSlug, difficulty)
            })
          }).then(res => {
            sessionStorage.removeItem('pendingScore');
            if (res.ok) {
              showNotification("Score Saved!", "success");
            } else {
              showNotification("Failed to save score.", "error");
            }
          }).catch(() => {
            showNotification("Error saving score.", "error");
          }).finally(() => {
            setIsSubmittingPending(false);
          });
        } catch {
          sessionStorage.removeItem('pendingScore');
        }
      }
    }

    // Reset flag when user signs out so pending score can be checked on next login
    if (!session) {
      hasCheckedPendingRef.current = false;
    }
  }, [session, isSubmittingPending, showNotification]);

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {session.user?.image && (
             <img src={session.user.image} alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
        )}
        <span className="text-xs hidden sm:inline">{session.user?.name}</span>
        <button onClick={() => signOut()} className="nes-btn is-error is-small text-xs">Sign out</button>
      </div>
    );
  }

  return (
    <button onClick={() => signIn('google')} className="nes-btn is-primary is-small">Sign in</button>
  );
}
