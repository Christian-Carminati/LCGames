# Disable Donations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disable all donation banners, buttons, and messages across the LCGames site via a single code-level flag, leaving the code fully in place for easy re-enabling.

**Architecture:** A single constant `DONATIONS_ENABLED = false` in `src/lib/features.ts` is the source of truth. Call sites (`layout.tsx` footer, `games/[slug]/page.tsx` banner) wrap their donation blocks in `{DONATIONS_ENABLED && ...}` so whole containers disappear; the `DonateButton` and `DonationModal` components additionally early-return `null` as a safety net for any future usage. A new Playwright spec asserts the donation UI is absent.

**Tech Stack:** Next.js 16 (App Router), TypeScript, React 19, Playwright, Tailwind + nes.css.

---

## File Structure

- **Create:** `src/lib/features.ts` — single feature-flag constant (source of truth)
- **Modify:** `src/app/layout.tsx` — footer: guard `<DonateButton />`
- **Modify:** `src/app/games/[slug]/page.tsx` — guard the "SUPPORT THE ARCHIVE" block
- **Modify:** `src/components/DonateButton.tsx` — early-return `null` when disabled
- **Modify:** `src/components/DonationModal.tsx` — early-return `null` when disabled
- **Test:** `tests/no-donations.spec.ts` — new Playwright spec asserting donation UI is absent

**Out of scope (per spec):** `GameInterface.tsx`'s unused `donateLabel` prop and `InsertCoin.tsx` (emulator start screen) are left untouched.

---

### Task 1: Write the failing E2E test

**Files:**
- Create: `tests/no-donations.spec.ts`

- [ ] **Step 1: Create the test file**

```ts
import { test, expect } from '@playwright/test';

test.describe('Donation UI is disabled', () => {
  // Cold first compile of `next dev` can take a while on the first navigation.
  test.setTimeout(60_000);

  test('home page footer shows branding but no donate button', async ({ page }) => {
    await page.goto('/');

    // Anchor: the home page actually loaded. Scope to the footer because the
    // home H1 "Welcome to LC-Games Archive!" would match an unscoped substring search.
    await expect(page.locator('footer').getByText('LC-GAMES ARCHIVE')).toBeVisible({ timeout: 30_000 });

    // No donation button (itch.io link) anywhere
    await expect(page.locator('a[href="https://lowcarb.itch.io/"]')).toHaveCount(0);
  });

  test('game detail page shows no SUPPORT THE ARCHIVE banner', async ({ page }) => {
    // Open a real game detail page via the games list (robust to which games exist)
    await page.goto('/games');

    const detailLink = page.getByRole('link', { name: 'DETAILS' }).first();
    await expect(detailLink).toBeVisible({ timeout: 30_000 });
    await detailLink.click();
    await page.waitForURL(/\/games\//);

    // Anchor: the game detail page actually loaded
    await expect(page.getByRole('button', { name: 'PLAY GAME' })).toBeVisible({ timeout: 30_000 });

    // No donation banner content
    await expect(page.getByText('SUPPORT THE ARCHIVE')).toHaveCount(0);
    await expect(page.getByText('Help keep the C64 servers running!')).toHaveCount(0);
    await expect(page.getByText('INSERT COIN (DONATE)')).toHaveCount(0);
    await expect(page.locator('a[href="https://lowcarb.itch.io/"]')).toHaveCount(0);
  });
});
```

> **Execution note (2026-08-05):** the originally-planned game slug `hero-is-back-c64c128` 404s in the current dev DB (the slug is now `h-e-r-o-is-back-c64`). The game-page test instead opens a real detail page via the games list, which is robust to which games exist. The footer anchor is scoped to `footer` because `getByText('LC-GAMES ARCHIVE')` matches the home H1 "Welcome to LC-Games Archive!" via case-insensitive substring matching.

- [ ] **Step 2: Run the new test — expect it to FAIL**

Run: `npx playwright test tests/no-donations.spec.ts`

Expected: both tests FAIL — the donation button and "SUPPORT THE ARCHIVE" banner are currently rendered, so the `toHaveCount(0)` assertions are violated. This is the red state.

---

### Task 2: Implement the flag and guard the call sites

**Files:**
- Create: `src/lib/features.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/games/[slug]/page.tsx`

- [ ] **Step 1: Create the feature flag module**

Create `src/lib/features.ts`:

```ts
/**
 * Feature flags for the LCGames site.
 *
 * Set DONATIONS_ENABLED to `true` to re-enable every donation prompt
 * (footer button, "SUPPORT THE ARCHIVE" banner, DonationModal).
 * The components stay in the codebase either way — the flag just switches
 * them off so site visitors see no trace of them.
 */
export const DONATIONS_ENABLED = false;
```

- [ ] **Step 2: Guard the footer button in `src/app/layout.tsx`**

Add the import after the existing `import { DonateButton } from "@/components/DonateButton";` (line 13):

```ts
import { DONATIONS_ENABLED } from "@/lib/features";
```

Replace the footer block (lines 47–50):

```tsx
            <footer className="p-8 text-center opacity-80">
                <p className="text-xs mb-4 text-c64-text">LC-GAMES ARCHIVE</p>
                {DONATIONS_ENABLED && <DonateButton />}
            </footer>
```

The "LC-GAMES ARCHIVE" text stays — it is branding, not a donation prompt.

- [ ] **Step 3: Guard the "SUPPORT THE ARCHIVE" banner in `src/app/games/[slug]/page.tsx`**

Add the import after the existing `import { DonateButton } from '@/components/DonateButton';` (line 7):

```ts
import { DONATIONS_ENABLED } from '@/lib/features';
```

Wrap the whole banner container (lines 87–99) in the flag:

```tsx
      {DONATIONS_ENABLED && (
        <div className="mt-12 border-t-4 border-white/10 pt-8">
          <div className="nes-container is-rounded is-dark">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                      <p className="title mb-2">SUPPORT THE ARCHIVE</p>
                      <p className="text-xs text-gray-400">Help keep the C64 servers running!</p>
                  </div>
                  <div className="shrink-0">
                    <DonateButton label="INSERT COIN (DONATE)" />
                  </div>
              </div>
          </div>
        </div>
      )}
```

The whole block — title, copy, and button — disappears together, leaving no empty container.

- [ ] **Step 4: Run the new test — expect it to PASS**

Run: `npx playwright test tests/no-donations.spec.ts`

Expected: both tests PASS (green state). The dev server hot-reloads the flag change.

- [ ] **Step 5: Commit**

```bash
git add src/lib/features.ts src/app/layout.tsx "src/app/games/[slug]/page.tsx" tests/no-donations.spec.ts
git commit -m "feat: disable donation UI behind DONATIONS_ENABLED flag"
```

---

### Task 3: Guard the components as a safety net

**Files:**
- Modify: `src/components/DonateButton.tsx`
- Modify: `src/components/DonationModal.tsx`

- [ ] **Step 1: Guard `src/components/DonateButton.tsx`**

Add the import after `import React from 'react';` (line 3):

```ts
import { DONATIONS_ENABLED } from '@/lib/features';
```

Add the guard at the top of the component body (before the existing `return`):

```tsx
  if (!DONATIONS_ENABLED) return null;
```

Resulting component shape:

```tsx
'use client';

import React from 'react';
import { DONATIONS_ENABLED } from '@/lib/features';

interface DonateButtonProps {
  label?: string;
  className?: string;
}

export function DonateButton({
    label = "WORK IN PROGRESS",
    className = ""
}: DonateButtonProps) {
  if (!DONATIONS_ENABLED) return null;

  return (
    <a
      href="https://lowcarb.itch.io/"
      target="_blank"
      rel="noopener noreferrer"
      type="button"
      className={`nes-btn is-warning ${className}`}
    >
      <i className="nes-icon coin is-small"></i> {label}
    </a>
  );
}
```

- [ ] **Step 2: Guard `src/components/DonationModal.tsx`**

Add the import after `'use client';` (line 1):

```ts
import { DONATIONS_ENABLED } from '@/lib/features';
```

Add the guard as the first line of the component body (before the existing `if (!isOpen) return null;`):

```ts
  if (!DONATIONS_ENABLED) return null;
```

Resulting component shape:

```tsx
'use client';

import { DONATIONS_ENABLED } from '@/lib/features';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export function DonationModal({ isOpen, onClose, username }: DonationModalProps) {
  if (!DONATIONS_ENABLED) return null;
  if (!isOpen) return null;
  // ...rest unchanged
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`

Expected: exit code 0, no type errors. The flag is a plain boolean literal, safe to import from client components.

- [ ] **Step 4: Commit**

```bash
git add src/components/DonateButton.tsx src/components/DonationModal.tsx
git commit -m "feat: make DonateButton and DonationModal render nothing when donations disabled"
```

---

### Task 4: Full verification

**Files:**
- None (verification only)

- [ ] **Step 1: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`

Expected: type-check exit code 0, lint passes with no errors.

- [ ] **Step 2: Run the full E2E suite**

Run: `npx playwright test`

Expected: all existing specs pass (they reference only the INSERT COIN emulator overlay, which is untouched), plus the two new `no-donations` tests pass.

- [ ] **Step 3: Confirm the working tree contains no donation UI**

Run: `git grep -n -i "SUPPORT THE ARCHIVE\|lowcarb.itch.io"`

Expected: matches appear only in the spec/plan docs and the test file — no leftover donation UI in source files.

---

### Task 5: Re-enable check — prove disabled, not deleted

**Files:**
- Modify: `src/lib/features.ts` (temporarily, then revert)

- [ ] **Step 1: Temporarily flip the flag to `true`**

In `src/lib/features.ts`, change `export const DONATIONS_ENABLED = false;` to `export const DONATIONS_ENABLED = true;`.

- [ ] **Step 2: Run the new test — expect it to FAIL**

Run: `npx playwright test tests/no-donations.spec.ts`

Expected: both tests FAIL — the donation UI returns, proving the code was preserved and only the switch turns it off.

- [ ] **Step 3: Flip the flag back to `false` and re-run — expect PASS**

Revert `src/lib/features.ts` to `export const DONATIONS_ENABLED = false;`, then:

Run: `npx playwright test tests/no-donations.spec.ts`

Expected: both tests PASS.

- [ ] **Step 4: Confirm the working tree matches the committed state**

Run: `git status --short`

Expected: no modified files (Task 2/3 commits already captured everything). Nothing further to commit.
