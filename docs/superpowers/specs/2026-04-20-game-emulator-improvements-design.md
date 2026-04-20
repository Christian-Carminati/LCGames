---
name: game-emulator-improvements
description: Disable quick save/load shortcuts, peak score prompt, update controls text
type: project
---

# Game Emulator Improvements Design

Date: 2026-04-20

## Overview

Three improvements to LCGames emulator interface:
1. Disable quick save/load keyboard shortcuts in control settings
2. Add peak score prompt when score drops dramatically (game over detection workaround)
3. Update controls info text

---

## Point 3: Update Controls Text

**File:** `src/components/Emulator.tsx` (line 197-199)

**Change:**
- From: `Powered by EmulatorJS. Controls: Arrow Keys + X (Fire) + Enter (Start) + P (Pause).`
- To: `Powered by EmulatorJS. Controls: Arrow keys + X (Fire) + Enter (Start) + V (C64 keyboard) + P (Pause).`

This is a one-line text change. No complexity.

---

## Point 1: Disable Quick Save/Load Shortcuts

**Files:** `public/emulator.html`

### Problem
`EJS_Buttons` set to `false` hides UI buttons, but users can still go to control settings and remap keyboard shortcuts for save/load state actions.

### Solution: Hybrid Approach

**Layer 1: Key Interception**
Add a keydown listener that blocks common quick save/load keys before they reach the emulator:
- F5 (quick save default)
- F9 (quick load default)
- Shift+F5, Shift+F9

```javascript
// Block save/load hotkeys
document.addEventListener('keydown', function(e) {
  // F5 = 116, F9 = 120
  if (e.key === 'F5' || e.key === 'F9' ||
      (e.shiftKey && (e.key === 'F5' || e.key === 'F9'))) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}, true); // Use capture phase to intercept early
```

**Layer 2: CSS Hide from Control Settings Menu**
Add CSS to hide save/load related options in the control mapping interface. Use MutationObserver to catch dynamically loaded menu elements.

```css
/* Hide save/load from control settings dropdown */
.option-item:has([data-action*="save"]),
.option-item:has([data-action*="load"]),
.ejs-opt-save, .ejs-opt-load,
[value*="save state"], [value*="load state"] {
  display: none !important;
}
```

Note: Exact CSS selectors need to be tested against EmulatorJS version. May require adjustment based on actual DOM structure.

### Implementation Notes
- Key interception is robust for default keys
- CSS hiding may need periodic verification when EmulatorJS updates
- Users who manually remap to other keys will still be able to use them — this is a limitation

---

## Point 2: Peak Score Prompt

**Files:** `public/emulator.html`, `src/components/GameInterface.tsx`, `src/components/ScoreBoard.tsx`, `src/components/CurrentScoreCard.tsx` (new overlay)

### Problem
Many games reset score at game over, leaving little time to save. No reliable game-over detection exists across all games.

### Solution: Peak Score Monitoring

**Mechanism:**
1. Track peak score seen during session
2. Detect dramatic score drops (>70% drop within 5 seconds)
3. Show overlay prompting user to save with last known peak score
4. Auto-dismiss after 30 seconds if not actioned

**Implementation:**

**emulator.html changes:**
- Add peak tracking variables
- Detect score drops
- Send `SCORE_DROP_DETECTED` message to parent with peak score data

```javascript
let peakScore = 0;
let lastScoreTime = 0;
let lastScoreValue = 0;

function monitorPeakScore(score) {
  const now = Date.now();

  if (score > peakScore) {
    peakScore = score;
  }

  // Detect dramatic drop (game over signal)
  if (lastScoreValue > 0 && score < lastScoreValue * 0.3 && now - lastScoreTime < 5000) {
    // Score dropped >70% in less than 5 seconds — likely game over
    window.parent.postMessage({
      type: 'SCORE_DROP_DETECTED',
      peakScore: peakScore,
      finalScore: score,
      timestamp: now
    }, '*');
  }

  lastScoreValue = score;
  lastScoreTime = now;
}
```

**GameInterface.tsx changes:**
- Handle `SCORE_DROP_DETECTED` message
- Show SaveScorePrompt overlay when triggered

**New component: SaveScorePrompt.tsx**
- Modal/overlay with last peak score
- "SAVE SCORE" button
- "DISMISS" button
- Auto-dismiss after 30 seconds

**Data flow:**
```
emulator.html: score drops → SCORE_DROP_DETECTED message
    → GameInterface: receives message → shows SaveScorePrompt overlay
    → User clicks SAVE → ScoreBoard saves with peakScore
```

### UI: SaveScorePrompt Overlay

```
┌─────────────────────────────────────────┐
│         🎮 GAME OVER?                   │
│                                         │
│    Your peak score: 12,450              │
│                                         │
│    [ SAVE SCORE ]    [ DISMISS ]        │
│                                         │
│    Auto-dismiss in 30s                  │
└─────────────────────────────────────────┘
```

### Implementation Notes
- Trigger only once per session (reset on new game)
- Don't show if user already saved a score this session
- Store peakScore in component state to persist across score updates

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/Emulator.tsx` | Text update: controls info |
| `public/emulator.html` | Key interception + score drop detection |
| `src/components/GameInterface.tsx` | Handle SCORE_DROP_DETECTED message |
| `src/components/SaveScorePrompt.tsx` | New component for prompt overlay |

---

## Testing Considerations

1. **Controls text**: Verify text displays correctly on game page
2. **Key blocking**: Test F5/F9/Shift+F5/Shift+F9 are blocked in fullscreen and normal mode
3. **Score drop detection**: Test with a game that resets score, verify prompt appears
4. **SaveScorePrompt**: Test save functionality, dismiss, and auto-dismiss timer