# Disable Donations Design Spec (2026-08-05)

Disable all donation banners and messages across the LCGames site via a single code-level flag. The donation UI is **disabled, not deleted** — the code stays fully in place behind a switch. When disabled, no user-visible trace of the donation prompts remains.

## 1. Architectural Overview & Context

LCGames is a retro game arcade. The site currently surfaces donation prompts in two places:

*   **Global footer** (`src/app/layout.tsx`): a `<DonateButton />` linking to the site owner's itch.io page.
*   **Game detail page** (`src/app/games/[slug]/page.tsx`): a "SUPPORT THE ARCHIVE" NES-styled banner box with the copy "Help keep the C64 servers running!" and an "INSERT COIN (DONATE)" button.

Two additional donation artifacts exist as dead/unused code:

*   **`src/components/DonationModal.tsx`**: a "PAYMENT METHOD" modal (PayPal / credit card via Ko-fi). Currently imported nowhere.
*   **`src/components/GameInterface.tsx`**: a `donateLabel?: string` prop, declared but never read. No visible effect.

The requirement is a hard toggle controlled by a **constant in code**. When off, the user must not notice donations ever existed: no empty containers, no orphaned text, no layout gaps.

The "INSERT COIN" overlay in `src/components/InsertCoin.tsx` is the retro emulator start screen (insert coin to *play*), **not** a donation prompt. It is out of scope and left untouched.

## 2. Design

### A. Single Source of Truth (`src/lib/features.ts`)

Create a new module exporting one constant:

```ts
export const DONATIONS_ENABLED = false;
```

It is a pure boolean literal, safe to import from both server components (`layout.tsx`, page files) and client components (`DonateButton`, `DonationModal`). No server/client boundary issues.

### B. Guard at Call Sites

The visible blocks are wrapped in `{DONATIONS_ENABLED && (...)}` so that whole containers disappear, not just inner buttons.

1.  **Footer** (`src/app/layout.tsx`): wrap only `<DonateButton />`. The "LC-GAMES ARCHIVE" text stays — it is branding, not a donation prompt. The footer remains centered and natural.
2.  **Game page** (`src/app/games/[slug]/page.tsx`): wrap the entire "SUPPORT THE ARCHIVE" box (the `mt-12 border-t-4` container, lines 87–99). The whole block — title, copy, and button — is removed together. No empty box, no orphaned heading.

### C. Guard Inside Components (safety net)

3.  **`src/components/DonateButton.tsx`**: early-return `null` when `!DONATIONS_ENABLED`.
4.  **`src/components/DonationModal.tsx`**: early-return `null` when `!DONATIONS_ENABLED`. Although currently dead code, this keeps it consistent and makes any future usage automatically disabled by the same flag.

### D. Out of Scope

5.  **`GameInterface.tsx` `donateLabel` prop**: left untouched. Declared but unused; no visible effect, not a banner or prompt.
6.  **`InsertCoin.tsx`**: emulator start screen, not a donation. Untouched.

## 3. Data Flow

None. The flag is a static constant evaluated at render time. No state, no network requests, no prop threading, no DB involvement.

## 4. Error Handling

Not applicable. There is no I/O or fallible logic introduced.

## 5. Testing

*   **Type check**: run `tsc --noEmit` to confirm all imports and guards compile.
*   **E2E regression**: the existing Playwright suite makes no reference to the donation UI (its "INSERT COIN" matches target the emulator start overlay), so it must pass unchanged.
*   **Visual verification**: with the dev server running, confirm the home page footer shows no donate button and the game detail page shows no "SUPPORT THE ARCHIVE" box, with no leftover layout artifacts.
*   **Re-enable check**: temporarily set `DONATIONS_ENABLED = true` (or verify by inspection) to confirm the UI returns — proving the code was disabled, not deleted.

## 6. File Change Summary

| File | Change |
|------|--------|
| `src/lib/features.ts` | **New** — `export const DONATIONS_ENABLED = false;` |
| `src/app/layout.tsx` | Wrap `<DonateButton />` in `DONATIONS_ENABLED &&` |
| `src/app/games/[slug]/page.tsx` | Wrap the "SUPPORT THE ARCHIVE" box in `DONATIONS_ENABLED &&` |
| `src/components/DonateButton.tsx` | Early-return `null` when disabled |
| `src/components/DonationModal.tsx` | Early-return `null` when disabled |
