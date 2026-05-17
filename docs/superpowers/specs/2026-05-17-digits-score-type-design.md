# Digits Score Type Design

**Date:** 2026-05-17
**Status:** Approved

## Summary

Add a new `"digits"` score parsing type where each byte in memory represents a single decimal digit (0-9). This is commonly used by C64 games that store each score digit as a separate byte.

## Motivation

Many C64 games store scores as unpacked BCD — one byte per digit, each in the range 0x00-0x09. The existing types (`byte`, `int`, `bcd`, `string`) don't cover this format cleanly:

| Type | Example bytes | Parsed as | Result |
|------|-------------|-----------|--------|
| `bcd` | `$12 $34` | Each byte holds two digits | 1234 |
| `digits` (new) | `$01 $02 $03 $04` | Each byte holds one digit | 1234 |

## Changes

### 1. `public/emulator.html` — `parseBytesToScore()`

Add a new branch:

```javascript
if (type === "digits") {
  let strVal = "";
  let started = false;
  for (const b of bytes) {
    if (b < 0 || b > 9) return 0;
    if (b === 0 && !started) continue;
    started = true;
    strVal += b.toString();
  }
  return strVal === "" ? 0 : parseInt(strVal, 10);
}
```

Rules:
- Each byte must be 0 <= byte <= 9, otherwise return 0
- Leading zero bytes are skipped
- If all bytes are zero (or leading zeros only), return 0

### 2. Type definitions — add `"digits"` to union types

Files to update:
- `src/components/admin/GameForm.tsx` — `ScoreConfig.type` union
- `src/components/Emulator.tsx` — `scoreConfig.type` union
- `src/components/GameInterface.tsx` — `scoreConfig.type` union
- `src/app/games/[slug]/page.tsx` — `ScoreConfig.type` union

### 3. `src/components/admin/GameForm.tsx`

Add `"digits"` to the type `<select>` options in the score config section.

## Files modified

- `public/emulator.html`
- `src/components/admin/GameForm.tsx`
- `src/components/Emulator.tsx`
- `src/components/GameInterface.tsx`
- `src/app/games/[slug]/page.tsx`

## What does NOT change

- Prisma schema (type is already a string in JSON)
- API routes
- CurrentScoreCard, ScoreBoard, or any UI component
- Security, cheat detection, hash verification
- No new dependencies
