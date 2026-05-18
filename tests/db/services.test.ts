import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from './client';
import { seedUser, seedGame, resetDb } from './helpers';
import { upsertScore, getTopScores, softDeleteScore } from '@/lib/scores';
import { getLeaderboard } from '@/lib/leaderboard';

beforeEach(async () => {
  await resetDb(prisma);
});

describe('Scores Service', () => {
  it('upsertScore creates a new score', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    const result = await upsertScore({
      userId: user.id,
      gameSlug: game.slug,
      value: 500,
    });

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].value).toBe(500);
  });

  it('getTopScores excludes soft-deleted scores', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: game.slug } });
    const s2 = await prisma.score.create({ data: { value: 200, userId: user.id, gameSlug: game.slug, difficulty: 1 } });
    await softDeleteScore(s2.id);

    const result = await getTopScores({ gameSlug: game.slug });
    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].value).toBe(100);
  });

  it('getTopScores returns cursor for pagination', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: game.slug, difficulty: 0 } });
    await prisma.score.create({ data: { value: 200, userId: user.id, gameSlug: game.slug, difficulty: 1 } });

    const result = await getTopScores({ gameSlug: game.slug, limit: 1 });
    expect(result.scores).toHaveLength(1);
    expect(result.nextCursor).toBeTruthy();

    const page2 = await getTopScores({ gameSlug: game.slug, limit: 1, cursor: result.nextCursor! });
    expect(page2.scores).toHaveLength(1);
    expect(page2.nextCursor).toBeNull();
  });
});

describe('Leaderboard Service', () => {
  it('returns entries with game title and user name', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma, { slug: 'lb-game', title: 'LB Test' });
    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: game.slug } });

    const result = await getLeaderboard({});
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].gameTitle).toBe('LB Test');
    expect(result.entries[0].name).toBe('Test User');
  });
});
