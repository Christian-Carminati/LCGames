import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from './client';
import { createGameData, resetDb } from './helpers';
import { Prisma } from '@prisma/client';

beforeEach(async () => {
  await resetDb(prisma);
});

describe('Games', () => {
  it('creates a game with required fields', async () => {
    const data = createGameData();
    const game = await prisma.game.create({ data });

    expect(game.id).toBeTruthy();
    expect(game.slug).toBe(data.slug);
    expect(game.title).toBe(data.title);
    expect(game.platform).toBe('C64 LC-Games');
  });

  it('enforces unique slug constraint', async () => {
    await prisma.game.create({ data: createGameData({ slug: 'dupe-slug' }) });

    await expect(
      prisma.game.create({ data: createGameData({ slug: 'dupe-slug' }) })
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it('defaults published to true', async () => {
    const game = await prisma.game.create({
      data: createGameData({ published: undefined as any }),
    });
    expect(game.published).toBe(true);
  });

  it('stores and reads JSON fields via GameConfig', async () => {
    const scoreConfig = { address: '0x0800', type: 'bcd', length: 3 };
    const difficultyConfig = { address: '0x2299' };
    const palNtscConfig = { address: '0x2a00', baseOffset: '0x0', numStandards: 2 };

    const game = await prisma.game.create({
      data: {
        ...createGameData(),
        gameConfig: {
          create: { scoreConfig, difficultyConfig, palNtscConfig },
        },
      },
      include: { gameConfig: true },
    });

    expect(game.gameConfig?.scoreConfig).toEqual(scoreConfig);
    expect(game.gameConfig?.difficultyConfig).toEqual(difficultyConfig);
    expect(game.gameConfig?.palNtscConfig).toEqual(palNtscConfig);
  });

  it('updates game fields', async () => {
    const game = await prisma.game.create({ data: createGameData() });

    const updated = await prisma.game.update({
      where: { id: game.id },
      data: { title: 'Updated Title', published: false },
    });

    expect(updated.title).toBe('Updated Title');
    expect(updated.published).toBe(false);
  });

  it('fetches games ordered by title ascending', async () => {
    await prisma.game.create({ data: createGameData({ slug: 'game-b', title: 'Beta Game' }) });
    await prisma.game.create({ data: createGameData({ slug: 'game-a', title: 'Alpha Game' }) });
    await prisma.game.create({ data: createGameData({ slug: 'game-c', title: 'Gamma Game' }) });

    const games = await prisma.game.findMany({ orderBy: { title: 'asc' } });
    expect(games[0].title).toBe('Alpha Game');
    expect(games[1].title).toBe('Beta Game');
    expect(games[2].title).toBe('Gamma Game');
  });
});
