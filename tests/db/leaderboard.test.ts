import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from './client';
import { seedUser, seedGame, resetDb } from './helpers';

beforeEach(async () => {
  await resetDb(prisma);
});

describe('Leaderboard', () => {
  it('returns empty array when no scores exist', async () => {
    const scores = await prisma.score.findMany({
      orderBy: { value: 'desc' },
      take: 100,
    });
    expect(scores).toHaveLength(0);
  });

  it('returns scores ordered by value descending across all games', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);
    const game2 = await seedGame(prisma, { slug: 'another-game', title: 'Another Game' });

    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: game.slug } });
    await prisma.score.create({ data: { value: 999, userId: user.id, gameSlug: game2.slug } });
    await prisma.score.create({ data: { value: 500, userId: user.id, gameSlug: game.slug, difficulty: 1 } });

    const scores = await prisma.score.findMany({
      orderBy: { value: 'desc' },
      take: 100,
      include: {
        user: { select: { name: true } },
        game: { select: { title: true } },
      },
    });

    expect(scores).toHaveLength(3);
    expect(scores[0].value).toBe(999);
    expect(scores[1].value).toBe(500);
    expect(scores[2].value).toBe(100);
    expect(scores[0].game.title).toBe('Another Game');
    expect(scores[0].user.name).toBe('Test User');
  });

  it('respects take limit of 100', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    for (let i = 0; i < 150; i++) {
      await prisma.score.create({
        data: { value: i, userId: user.id, gameSlug: game.slug, difficulty: i },
      });
    }

    const scores = await prisma.score.findMany({
      orderBy: { value: 'desc' },
      take: 100,
    });

    expect(scores).toHaveLength(100);
    expect(scores[0].value).toBe(149);
    expect(scores[99].value).toBe(50);
  });

  it('includes user name for each score', async () => {
    const user = await seedUser(prisma, { name: 'Leaderboard Player' });
    const game = await seedGame(prisma);

    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: game.slug } });

    const scores = await prisma.score.findMany({
      orderBy: { value: 'desc' },
      take: 100,
      include: {
        user: { select: { name: true } },
      },
    });

    expect(scores[0].user.name).toBe('Leaderboard Player');
  });

  it('includes game title for each score', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma, { slug: 'leaderboard-game', title: 'Leaderboard Game Title' });

    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: game.slug } });

    const scores = await prisma.score.findMany({
      orderBy: { value: 'desc' },
      take: 100,
      include: {
        game: { select: { title: true } },
      },
    });

    expect(scores[0].game.title).toBe('Leaderboard Game Title');
  });
});
