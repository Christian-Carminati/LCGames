# Score Submission - Remove Popup, Add Fixed Save Button

**Date:** 2026-04-26

## Overview

Replace the modal popup (`SaveScorePrompt`) with a fixed "SAVE SCORE" button in the `CurrentScoreCard` component. Users can save their score directly without an overlay interrupting the game flow.

## Changes

### 1. CurrentScoreCard — Add Save Button

**File:** `src/components/CurrentScoreCard.tsx`

Add to `CurrentScoreCard`:
- `useSession()` per verificare se loggato
- `useNotification()` per showNotification
- Bottone "SAVE SCORE" sempre visibile (disabilitato se score = 0)
- Logica di save identica a `SaveScorePrompt.handleSave`
- Se non loggato → `signIn('google')` con redirect alla pagina corrente
- Se cheats attivi → notifica errore + bottone disabilitato
- Dopo save → `onScoreSaved?.()` + notifica successo

### 2. GameInterface — Remove Popup Logic

**File:** `src/components/GameInterface.tsx`

- Rimuovere `peakScorePrompt` state
- Rimuovere `frozenDifficulty` e `frozenStandard` state
- Rimuovere listener `SCORE_DROP_DETECTED` che triggherava il popup
- Rimuovere rendering di `<SaveScorePrompt>`
- Rimuovere import di `SaveScorePrompt`

### 3. SaveScorePrompt — Delete

**File:** `src/components/SaveScorePrompt.tsx`

Eliminare il file completamente.

## Props Changes

`CurrentScoreCard` non richiede modifiche alle props — il bottone save usa `capturedScore` esistente e la funzione `onScoreSaved` gia presente.

## Edge Cases

| Case | Behavior |
|------|----------|
| Score = 0 | Bottone disabilitato |
| Non loggato | Click → redirect Google login |
| Cheats attivi | Notifica errore, save bloccato |
| Save in corso | Bottone diventa `is-disabled`, testo "SAVING..." |
| Save fallito | Notifica errore, bottone riabilitato |
