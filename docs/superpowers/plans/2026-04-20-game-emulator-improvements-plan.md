# Game Emulator Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement three improvements: (1) disable quick save/load keyboard shortcuts, (2) add peak score prompt on dramatic score drop, (3) update controls info text.

**Architecture:** Hybrid approach for shortcuts (key interception + CSS hiding). Peak score monitoring with overlay prompt for game-over workaround. Simple text update for controls.

**Tech Stack:** React (Next.js), EmulatorJS iframe, vanilla JS for key handling.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `public/emulator.html` | Key interception, score drop detection, peak tracking |
| `src/components/Emulator.tsx` | Controls text update |
| `src/components/SaveScorePrompt.tsx` | NEW: Overlay component for peak score prompt |
| `src/components/GameInterface.tsx` | Handle SCORE_DROP_DETECTED message, render SaveScorePrompt |
| `src/components/CurrentScoreCard.tsx` | Already handles save logic, used by SaveScorePrompt |

---

## Task 1: Update Controls Text (Emulator.tsx)

**Files:**
- Modify: `src/components/Emulator.tsx:197`

- [ ] **Step 1: Update controls text**

Change line 197 from:
```typescript
Powered by EmulatorJS. Controls: Arrow Keys + X (Fire) + Enter (Start) + P (Pause).
```
To:
```typescript
Powered by EmulatorJS. Controls: Arrow keys + X (Fire) + Enter (Start) + V (C64 keyboard) + P (Pause).
```

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Commit**

```bash
git add src/components/Emulator.tsx
git commit -m "feat: update controls info text with V key and proper casing"
```

---

## Task 2: Key Interception in emulator.html

**Files:**
- Modify: `public/emulator.html`

- [ ] **Step 1: Add keydown listener to block F5/F9**

Find the existing `document.addEventListener("keydown"` around line 227 and add blocking code at the top of that handler, before the existing P-key pause handler.

Add this at the start of the keydown handler function:

```javascript
// Block save/load hotkeys (F5=Fast Save default, F9=Fast Load default)
if (e.key === 'F5' || e.key === 'F9' ||
    (e.shiftKey && (e.key === 'F5' || e.key === 'F9'))) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}
```

The existing keydown handler starts at line 227:
```javascript
document.addEventListener("keydown", function (e) {
```

Insert the blocking code after the opening brace, before any existing code.

- [ ] **Step 2: Add MutationObserver to hide save/load from control settings menu**

After the existing MutationObserver around line 188 (for anti-cheat), add a second observer for hiding save/load options:

```javascript
// Hide save/load options from control settings
const hideObserver = new MutationObserver(() => {
  // Target common EmulatorJS control settings selectors
  const selectors = [
    '[data-action*="save"]', '[data-action*="load"]',
    '.ejs-opt-save', '.ejs-opt-load',
    '[data-input*="save state"]', '[data-input*="load state"]',
    '.option-item:has(.ejs-btn-save)', '.option-item:has(.ejs-btn-load)'
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.style.display = 'none');
  });
});
hideObserver.observe(document.body, { childList: true, subtree: true });
```

Add this after the existing observer setup (around line 194).

- [ ] **Step 3: Commit**

```bash
git add public/emulator.html
git commit -m "feat: block quick save/load keyboard shortcuts and hide from settings"
```

---

## Task 3: Peak Score Tracking in emulator.html

**Files:**
- Modify: `public/emulator.html`

- [ ] **Step 1: Add peak score tracking variables**

After the existing variable declarations around line 48 (after `let palNtscConfig = null;`), add:

```javascript
// Peak score tracking for game-over detection
let peakScore = 0;
let lastScoreTime = 0;
let lastScoreValue = 0;
let scoreDropAlertSent = false; // Prevent multiple triggers
```

- [ ] **Step 2: Modify sendScoreToParent to track peak**

Find the `sendScoreToParent` function around line 533 and update it to call monitorPeakScore:

```javascript
function sendScoreToParent(score) {
  if (!isNaN(score)) {
    const difficulty = readDifficulty();
    const palNtscValue = readPalNtsc();

    // Track peak score and detect drops
    monitorPeakScore(score);

    window.parent.postMessage(
      { type: "SCORE_UPDATE", score: score, difficulty: difficulty, palNtsc: palNtscValue },
      "*",
    );

    // Also send separate PAL/NTSC update message
    const standard = palNtscValue === 1 ? 'NTSC' : 'PAL';
    window.parent.postMessage(
      { type: "PALNTSC_UPDATE", standard: standard },
      "*",
    );
  }
}
```

- [ ] **Step 3: Add monitorPeakScore function**

Add this function before `sendScoreToParent` (around line 520, after the lastLog declaration):

```javascript
/**
 * Monitor score for peak tracking and game-over detection
 * Triggers SCORE_DROP_DETECTED when score drops >70% within 5 seconds
 */
function monitorPeakScore(score) {
  const now = Date.now();

  if (score > peakScore) {
    peakScore = score;
  }

  // Detect dramatic drop (game over signal)
  // Only trigger if: previous score was > 50, dropped >70%, happened within 5 seconds
  if (lastScoreValue > 50 && score < lastScoreValue * 0.3 && now - lastScoreTime < 5000) {
    if (!scoreDropAlertSent) {
      scoreDropAlertSent = true; // Prevent re-triggering
      console.log("[PEAK] Game over detected. Peak:", peakScore, "Final:", score);
      window.parent.postMessage({
        type: 'SCORE_DROP_DETECTED',
        peakScore: peakScore,
        finalScore: score,
        timestamp: now
      }, '*');
    }
  }

  lastScoreValue = score;
  lastScoreTime = now;
}
```

- [ ] **Step 4: Reset peak tracking on new game**

Add this reset logic in the `initEmulator` function, after the localStorage settings are applied (around line 156):

```javascript
// Reset peak score tracking for new game session
peakScore = 0;
lastScoreTime = 0;
lastScoreValue = 0;
scoreDropAlertSent = false;
```

- [ ] **Step 5: Commit**

```bash
git add public/emulator.html
git commit -m "feat: add peak score tracking and game-over detection via score drop monitoring"
```

---

## Task 4: Create SaveScorePrompt Component

**Files:**
- Create: `src/components/SaveScorePrompt.tsx`

- [ ] **Step 1: Create the SaveScorePrompt component**

```typescript
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
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/SaveScorePrompt.tsx
git commit -m "feat: add SaveScorePrompt component for peak score saving"
```

---

## Task 5: Integrate SaveScorePrompt into GameInterface

**Files:**
- Modify: `src/components/GameInterface.tsx`

- [ ] **Step 1: Add import for SaveScorePrompt**

Add at the top of the file (after existing imports):
```typescript
import { SaveScorePrompt } from '@/components/SaveScorePrompt';
```

- [ ] **Step 2: Add state for peak score prompt**

Find the `lastSavedScore` state around line 179 and add new state after it:
```typescript
const [lastSavedScore, setLastSavedScore] = useState<{ score: number; difficulty: number; standard: 'PAL' | 'NTSC' } | null>(null);
const [peakScorePrompt, setPeakScorePrompt] = useState<{ score: number; difficulty: number; standard: 'PAL' | 'NTSC' } | null>(null);
```

- [ ] **Step 3: Handle SCORE_DROP_DETECTED message in the message handler**

In the `useEffect` that handles messages (around line 87 in Emulator.tsx), add handling for `SCORE_DROP_DETECTED`:

```typescript
// Handle Score Drop (Game Over Detection)
if (event.data?.type === 'SCORE_DROP_DETECTED' && typeof event.data.peakScore === 'number') {
  // Only show prompt if we have a valid peak score and haven't already saved
  if (event.data.peakScore > 0 && !lastSavedScore) {
    setPeakScorePrompt({
      score: event.data.peakScore,
      difficulty: currentDifficulty,
      standard: currentStandard
    });
  }
}
```

- [ ] **Step 4: Add SaveScorePrompt to render**

In the JSX return, add the SaveScorePrompt overlay. Find where `CurrentScoreCard` is rendered (around line 358) and add the overlay after the `ref={scoreBoardRef}` div:

```typescript
{peakScorePrompt && (
  <SaveScorePrompt
    peakScore={peakScorePrompt.score}
    gameSlug={gameSlug}
    difficulty={peakScorePrompt.difficulty}
    standard={peakScorePrompt.standard}
    onDismiss={() => setPeakScorePrompt(null)}
    onSaveSuccess={() => {
      setLastSavedScore({ score: peakScorePrompt.score, difficulty: peakScorePrompt.difficulty, standard: peakScorePrompt.standard });
      setScoreRefreshKey(prev => prev + 1);
    }}
  />
)}
```

- [ ] **Step 5: Type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/GameInterface.tsx
git commit -m "feat: integrate peak score prompt in GameInterface"
```

---

## Task 6: Final Verification

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Verify all changes**

Check git status and diff to ensure all files modified correctly.

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat: complete emulator improvements - disable shortcuts, peak score prompt, update controls text"
```

---

## Post-Implementation Notes

1. **Key blocking**: F5/F9 and Shift+F5/F9 will be blocked. Users who remap to other keys will still have access — this is a known limitation.

2. **CSS hiding**: The MutationObserver CSS approach may need adjustment if EmulatorJS changes their DOM structure. Monitor after updates.

3. **Score drop detection**: Triggers when score drops >70% within 5 seconds, only when previous score was >50. Prevents false positives on initial game load.

4. **Peak score prompt**: Only shows if no score has been saved yet in this session. Once user saves (or dismisses), it won't reappear for the same game.

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch fresh subagent per task with two-stage review

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?