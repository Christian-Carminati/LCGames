import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from './client';
import { seedUser, seedGame, resetDb } from './helpers';
import { Prisma } from '@prisma/client';

beforeEach(async () => {
  await resetDb(prisma);
});

describe('Scores', () => {
  it('creates a score with valid user and game', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);
    const score = await prisma.score.create({
      data: { value: 500, userId: user.id, gameSlug: game.slug },
    });

    expect(score.id).toBeTruthy();
    expect(score.value).toBe(500);
    expect(score.difficulty).toBe(0);
    expect(score.userId).toBe(user.id);
    expect(score.gameSlug).toBe(game.slug);
  });

  it('enforces unique constraint on (userId, gameSlug, difficulty)', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    await prisma.score.create({
      data: { value: 100, userId: user.id, gameSlug: game.slug, difficulty: 1 },
    });

    await expect(
      prisma.score.create({
        data: { value: 200, userId: user.id, gameSlug: game.slug, difficulty: 1 },
      })
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it('allows same user+game with different difficulties', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    await prisma.score.create({
      data: { value: 100, userId: user.id, gameSlug: game.slug, difficulty: 1 },
    });
    await prisma.score.create({
      data: { value: 200, userId: user.id, gameSlug: game.slug, difficulty: 2 },
    });

    const scores = await prisma.score.findMany({ where: { userId: user.id } });
    expect(scores).toHaveLength(2);
  });

  it('cascades delete when user is removed', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);
    await prisma.score.create({
      data: { value: 500, userId: user.id, gameSlug: game.slug },
    });

    await prisma.user.delete({ where: { id: user.id } });

    const scores = await prisma.score.findMany();
    expect(scores).toHaveLength(0);
  });

  it('fetches top 20 scores ordered by value descending, filtered by game', async () => {
    const user = await seedUser(prisma);
    const gameA = await seedGame(prisma, { slug: 'game-a', title: 'Game A' });
    const gameB = await seedGame(prisma, { slug: 'game-b', title: 'Game B' });

    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: gameA.slug, difficulty: 0 } });
    await prisma.score.create({ data: { value: 500, userId: user.id, gameSlug: gameA.slug, difficulty: 1 } });
    await prisma.score.create({ data: { value: 999, userId: user.id, gameSlug: gameB.slug, difficulty: 0 } });

    const scores = await prisma.score.findMany({
      where: { gameSlug: gameA.slug },
      orderBy: { value: 'desc' },
      take: 20,
    });

    expect(scores).toHaveLength(2);
    expect(scores[0].value).toBe(500);
    expect(scores[1].value).toBe(100);
  });

  it('fetches top 20 scores filtered by game and difficulty', async () => {
    const user1 = await seedUser(prisma);
    const user2 = await seedUser(prisma);
    const game = await seedGame(prisma);

    await prisma.score.create({ data: { value: 300, userId: user1.id, gameSlug: game.slug, difficulty: 1 } });
    await prisma.score.create({ data: { value: 200, userId: user1.id, gameSlug: game.slug, difficulty: 0 } });
    await prisma.score.create({ data: { value: 100, userId: user2.id, gameSlug: game.slug, difficulty: 1 } });

    const scores = await prisma.score.findMany({
      where: { gameSlug: game.slug, difficulty: 1 },
      orderBy: { value: 'desc' },
      take: 20,
    });

    expect(scores).toHaveLength(2);
    expect(scores[0].value).toBe(300);
    expect(scores[1].value).toBe(100);
  });

  it('allows score value of 0', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    const score = await prisma.score.create({
      data: { value: 0, userId: user.id, gameSlug: game.slug },
    });

    expect(score.value).toBe(0);
  });

  it('allows negative score values', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    const score = await prisma.score.create({
      data: { value: -5, userId: user.id, gameSlug: game.slug },
    });

    expect(score.value).toBe(-5);
  });

  it('enforces foreign key — score without existing user fails', async () => {
    const game = await seedGame(prisma);

    await expect(
      prisma.score.create({
        data: { value: 100, userId: 'nonexistent-user', gameSlug: game.slug },
      })
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it('enforces foreign key — score without existing game fails', async () => {
    const user = await seedUser(prisma);

    await expect(
      prisma.score.create({
        data: { value: 100, userId: user.id, gameSlug: 'nonexistent-game' },
      })
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it('upsert logic: creates new score when none exists', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    let existing = await prisma.score.findUnique({
      where: {
        userId_gameSlug_difficulty: { userId: user.id, gameSlug: game.slug, difficulty: 0 },
      },
    });
    expect(existing).toBeNull();

    if (!existing) {
      await prisma.score.create({
        data: { value: 500, userId: user.id, gameSlug: game.slug, difficulty: 0 },
      });
    }

    const scores = await prisma.score.findMany({ where: { userId: user.id } });
    expect(scores).toHaveLength(1);
    expect(scores[0].value).toBe(500);
  });

  it('upsert logic: updates score when new value is higher', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    await prisma.score.create({
      data: { value: 500, userId: user.id, gameSlug: game.slug, difficulty: 0 },
    });

    const existing = await prisma.score.findUnique({
      where: {
        userId_gameSlug_difficulty: { userId: user.id, gameSlug: game.slug, difficulty: 0 },
      },
    });
    if (existing && 1000 > existing.value) {
      await prisma.score.update({
        where: { id: existing.id },
        data: { value: 1000 },
      });
    }

    const score = await prisma.score.findUniqueOrThrow({ where: { id: existing!.id } });
    expect(score.value).toBe(1000);
  });

  it('upsert logic: keeps existing score when new value is lower', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    await prisma.score.create({
      data: { value: 500, userId: user.id, gameSlug: game.slug, difficulty: 0 },
    });

    const existing = await prisma.score.findUnique({
      where: {
        userId_gameSlug_difficulty: { userId: user.id, gameSlug: game.slug, difficulty: 0 },
      },
    });
    // New value is lower — should keep existing
    expect(existing!.value).toBe(500);
  });
});
