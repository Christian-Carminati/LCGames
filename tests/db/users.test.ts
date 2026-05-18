import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from './client';
import { createUserData, resetDb } from './helpers';
import { Prisma } from '@prisma/client';

beforeEach(async () => {
  await resetDb(prisma);
});

describe('Users', () => {
  it('creates a user with minimal fields (email only)', async () => {
    const user = await prisma.user.create({
      data: createUserData({ name: undefined }),
    });

    expect(user).toBeDefined();
    expect(user.id).toBeTruthy();
    expect(user.email).toMatch(/^test-.*@example\.com$/);
    expect(user.name).toBeNull();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('creates a user with all optional fields', async () => {
    const data = createUserData({
      name: 'Full User',
      image: 'https://example.com/avatar.png',
      emailVerified: new Date('2026-01-01'),
    });
    const user = await prisma.user.create({ data });

    expect(user.name).toBe('Full User');
    expect(user.image).toBe('https://example.com/avatar.png');
    expect(user.emailVerified).toEqual(new Date('2026-01-01'));
  });

  it('enforces unique email constraint', async () => {
    const data = createUserData({ email: 'dupe@example.com' });
    await prisma.user.create({ data });

    await expect(
      prisma.user.create({ data })
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it('updates user name and image', async () => {
    const user = await prisma.user.create({ data: createUserData() });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Updated Name', image: 'https://example.com/new.png' },
    });

    expect(updated.name).toBe('Updated Name');
    expect(updated.image).toBe('https://example.com/new.png');
  });

  it('cascades delete to scores', async () => {
    const user = await prisma.user.create({ data: createUserData() });
    const game = await prisma.game.create({
      data: {
        slug: 'cascade-test',
        title: 'Cascade Test',
        platform: 'C64',
      },
    });
    await prisma.score.create({
      data: { value: 500, userId: user.id, gameSlug: game.slug },
    });

    await prisma.user.delete({ where: { id: user.id } });

    const scores = await prisma.score.findMany({ where: { userId: user.id } });
    expect(scores).toHaveLength(0);
  });
});
