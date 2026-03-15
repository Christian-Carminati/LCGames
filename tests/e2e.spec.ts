import { test, expect } from '@playwright/test';

test.describe('LC-Games E2E', () => {

  test('User can insert coin and enter home', async ({ page }) => {
    await page.goto('/');
    
    // Check for Insert Coin Overlay
    const overlay = page.getByText('INSERT COIN');
    await expect(overlay).toBeVisible();
    
    // Click to start - use more specific selector for the overlay
    await page.locator('.fixed.inset-0').click();
    
    // Check that overlay disappears
    await expect(overlay).toBeHidden();
    
    // Check Home Content
    await expect(page.getByText('BASIC BYTES FREE')).toBeVisible();
    await expect(page.getByRole('link', { name: 'START GAME' })).toBeVisible();
  });

  test('User can navigate to games list', async ({ page }) => {
    await page.goto('/');
    // Skip coin screen with more specific selector
    await page.locator('.fixed.inset-0').click({ force: true });
    
    await page.getByRole('link', { name: 'START GAME' }).click();
    
    // Check URL
    await expect(page).toHaveURL('/games');
    
    // Check Items (assuming games.json has items)
    await expect(page.getByText('GAME LIBRARY')).toBeVisible();
    const gameCards = page.locator('.nes-container');
    await expect(gameCards.first()).toBeVisible();
  });

  test('User can view game details and emulator', async ({ page }) => {
    await page.goto('/games/hero-is-back-c64c128');
    // Skip coin if it appears (it's global)
    if (await page.getByText('INSERT COIN').isVisible()) {
        await page.locator('.fixed.inset-0').click();
    }
    
    // Check Game Info
    await expect(page.getByText('H.E.R.O. Is Back')).toBeVisible();
    await expect(page.getByText('PLATFORM: C64')).toBeVisible();
    
    // Check Emulator Iframe
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    const src = await iframe.getAttribute('src');
    expect(src).toContain('emulator.html');
    expect(src).toContain('HeroIsBack.d64');
  });

});
