import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from './client';
import { createUserData, createGameData, seedUser, seedGame, resetDb } from './helpers';
import { Prisma } from '@prisma/client';

beforeEach(async () => {
  await resetDb(prisma);
});

describe('Schema Integrity', () => {
  describe('Required fields', () => {
    it('user requires email', async () => {
      await expect(
        prisma.user.create({ data: {} as any })
      ).rejects.toThrow();
    });

    it('game requires slug, title, and platform', async () => {
      await expect(
        prisma.game.create({ data: {} as any })
      ).rejects.toThrow();
    });

    it('score requires value, userId, and gameSlug', async () => {
      await expect(
        prisma.score.create({ data: {} as any })
      ).rejects.toThrow();
    });
  });

  describe('Default values', () => {
    it('game.published defaults to true', async () => {
      const game = await prisma.game.create({
        data: createGameData({ published: undefined as any }),
      });
      expect(game.published).toBe(true);
    });

    it('score.difficulty defaults to 0', async () => {
      const user = await seedUser(prisma);
      const game = await seedGame(prisma);
      const score = await prisma.score.create({
        data: { value: 100, userId: user.id, gameSlug: game.slug },
      });
      expect(score.difficulty).toBe(0);
    });

    it('score.createdAt defaults to current date', async () => {
      const user = await seedUser(prisma);
      const game = await seedGame(prisma);
      const score = await prisma.score.create({
        data: { value: 100, userId: user.id, gameSlug: game.slug },
      });
      expect(score.createdAt).toBeInstanceOf(Date);
      expect(score.createdAt.getTime()).toBeCloseTo(Date.now(), -3);
    });
  });

  describe('updatedAt auto-update', () => {
    it('user.updatedAt changes on update', async () => {
      const user = await prisma.user.create({ data: createUserData() });
      const original = user.updatedAt.getTime();

      await new Promise(r => setTimeout(r, 10));

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name: 'New Name' },
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(original);
    });

    it('game.updatedAt changes on update', async () => {
      const game = await prisma.game.create({ data: createGameData() });
      const original = game.updatedAt.getTime();

      await new Promise(r => setTimeout(r, 10));

      const updated = await prisma.game.update({
        where: { id: game.id },
        data: { title: 'Updated' },
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(original);
    });
  });

  describe('Foreign key constraints', () => {
    it('score references existing user', async () => {
      const game = await seedGame(prisma);
      await expect(
        prisma.score.create({
          data: { value: 100, userId: 'fake-user-id', gameSlug: game.slug },
        })
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });

    it('score references existing game', async () => {
      const user = await seedUser(prisma);
      await expect(
        prisma.score.create({
          data: { value: 100, userId: user.id, gameSlug: 'fake-game-slug' },
        })
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });
  });
});
