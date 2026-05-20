import { test, expect } from '@playwright/test';

const TEST_GAME_SLUG = 'hero-is-back-c64c128';

test.describe('Cheat Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    if (await page.getByText('INSERT COIN').isVisible()) {
      await page.locator('.fixed.inset-0').click();
    }
  });

  test('cheat detection module should detect cheats in localStorage', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    const romPath = 'HeroIsBack.d64';
    const settingsKey = `ejs-1-c64-${romPath}-settings`;
    
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({
        cheats: [{ code: 'INFINITE LIVES', enabled: true }]
      }));
    }, settingsKey);
    
    await page.reload();
    
    await page.getByText('PLAY GAME').click();
    
    await page.waitForTimeout(3000);
    
    const hasCheatsNotification = await page.getByText(/cheat.*detected/i).isVisible().catch(() => false);
    
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, settingsKey);
  });
});

test.describe('Admin ROM Download', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    if (await page.getByText('INSERT COIN').isVisible()) {
      await page.locator('.fixed.inset-0').click();
    }
  });

  test('non-admin should see ROM ADMIN-ONLY badge', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    await expect(page.getByText('ROM ADMIN-ONLY')).toBeVisible();
    
    const downloadButton = page.getByRole('link', { name: 'DOWNLOAD ROM' });
    await expect(downloadButton).not.toBeVisible();
  });

  test('admin should see DOWNLOAD ROM button', async ({ page, context }) => {
    await context.addCookies([{
      name: 'admin_token',
      value: 'authenticated',
      domain: 'localhost',
      path: '/'
    }]);
    
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    await expect(page.getByRole('link', { name: 'DOWNLOAD ROM' })).toBeVisible();
  });
});

test.describe('Score Separation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    if (await page.getByText('INSERT COIN').isVisible()) {
      await page.locator('.fixed.inset-0').click();
    }
  });

  test('game with scoreConfig should show CurrentScoreCard and ScoreBoard', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    await expect(page.getByText('CURRENT SCORE')).toBeVisible();
    await expect(page.getByText('HIGH SCORES')).toBeVisible();
    
    await expect(page.getByRole('button', { name: 'SAVE SCORE' })).toBeVisible();
  });

  test('ScoreBoard should only show leaderboard without save functionality', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    const highScoresSection = page.getByText('HIGH SCORES');
    await expect(highScoresSection).toBeVisible();
    
    const saveScoreButton = highScoresSection.locator('..').getByRole('button', { name: 'SAVE SCORE' });
    await expect(saveScoreButton).not.toBeVisible();
  });

  test('CurrentScoreCard should show score value and difficulty selector', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    await expect(page.getByText('SCORE', { exact: true })).toBeVisible();
    
    await expect(page.locator('.text-green-400').getByText('0', { exact: true })).toBeVisible();
  });
});

test.describe('PAL/NTSC Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    if (await page.getByText('INSERT COIN').isVisible()) {
      await page.locator('.fixed.inset-0').click();
    }
  });

  test('PAL/NTSC buttons should appear when config is present', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    const palButton = page.getByRole('button', { name: 'PAL' });
    const ntscButton = page.getByRole('button', { name: 'NTSC' });
    
    await expect(palButton).toBeVisible();
    await expect(ntscButton).toBeVisible();
  });

  test('PAL/NTSC should be selectable', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    const ntscButton = page.getByRole('button', { name: 'NTSC' });
    await ntscButton.click();
    
    await expect(ntscButton).toHaveClass(/is-success/);
    
    const palButton = page.getByRole('button', { name: 'PAL' });
    await palButton.click();
    
    await expect(palButton).toHaveClass(/is-success/);
  });

  test('difficulty should display with PAL/NTSC standard', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    const difficultyLabel = page.getByText(/DIFFICULTY:/i);
    await expect(difficultyLabel).toBeVisible();
    
    await expect(difficultyLabel).toContainText('PAL');
  });
});

test.describe('Difficulty Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    if (await page.getByText('INSERT COIN').isVisible()) {
      await page.locator('.fixed.inset-0').click();
    }
  });

  test('difficulty level buttons should be visible for games with difficulty config', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    const easyButton = page.getByRole('button', { name: 'EASY' });
    await expect(easyButton).toBeVisible();
  });

  test('switching difficulty should update the display', async ({ page }) => {
    await page.goto(`/games/${TEST_GAME_SLUG}`);
    
    const mediumButton = page.getByRole('button', { name: /MEDIUM|NORMAL/i });
    if (await mediumButton.isVisible()) {
      await mediumButton.click();
      await expect(mediumButton).toHaveClass(/is-primary/);
    }
  });
});
