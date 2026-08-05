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
