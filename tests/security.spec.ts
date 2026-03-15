import { test, expect } from '@playwright/test';

test.describe('Security', () => {
  
  test('admin API routes require authentication', async ({ request }) => {
    // Test that admin API endpoints return 401 without auth
    const response = await request.get('/api/admin/games');
    expect(response.status()).toBe(401);
  });

  test('admin scores API requires authentication', async ({ request }) => {
    const response = await request.delete('/api/admin/scores', {
      data: { scoreId: 'test' }
    });
    expect(response.status()).toBe(401);
  });

  test('admin upload-rom API requires authentication', async ({ request }) => {
    const response = await request.post('/api/admin/upload-rom');
    expect(response.status()).toBe(401);
  });

  test('admin backup API requires authentication', async ({ request }) => {
    const response = await request.post('/api/admin/backup');
    expect(response.status()).toBe(401);
  });

  test('login rate limiting returns 429 after too many attempts', async ({ request }) => {
    // Try to login multiple times with wrong password
    for (let i = 0; i < 6; i++) {
      await request.post('/api/admin/login', {
        data: { password: 'wrong-password' }
      });
    }
    
    // The 6th attempt should be rate limited
    const response = await request.post('/api/admin/login', {
      data: { password: 'wrong-password' }
    });
    expect(response.status()).toBe(429);
  });

});
