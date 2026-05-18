import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export function createUserData(overrides?: Partial<{
  name: string;
  email: string;
  image: string;
  emailVerified: Date;
}>) {
  const id = crypto.randomUUID().slice(0, 8);
  return {
    name: 'Test User',
    email: `test-${id}@example.com`,
    ...overrides,
  };
}

export function createGameData(overrides?: Partial<{
  slug: string;
  title: string;
  description: string;
  platform: string;
  genre: string;
  imageUrl: string;
  romPath: string;
  youtubeUrl: string;
  published: boolean;
  scoreConfig: Record<string, unknown>;
  difficultyConfig: Record<string, unknown>;
  palNtscConfig: Record<string, unknown>;
}>) {
  const id = crypto.randomUUID().slice(0, 8);
  return {
    slug: `test-game-${id}`,
    title: `Test Game ${id}`,
    platform: 'C64 LC-Games',
    published: true,
    ...overrides,
  };
}

export function createScoreData(overrides?: Partial<{
  value: number;
  difficulty: number;
  userId: string;
  gameSlug: string;
}>) {
  return {
    value: 1000,
    difficulty: 0,
    ...overrides,
  };
}

// Seed helpers — persist data and return the full record
export async function seedUser(db: PrismaClient, overrides?: Parameters<typeof createUserData>[0]) {
  return db.user.create({ data: createUserData(overrides) });
}

export async function seedGame(db: PrismaClient, overrides?: Parameters<typeof createGameData>[0]) {
  return db.game.create({ data: createGameData(overrides) });
}

export async function seedScore(
  db: PrismaClient,
  overrides: { userId: string; gameSlug: string } & Partial<{
    value: number;
    difficulty: number;
  }>
) {
  const { userId, gameSlug, ...rest } = overrides;
  if (!userId || !gameSlug) {
    throw new Error('seedScore requires userId and gameSlug');
  }
  return db.score.create({
    data: { value: 1000, difficulty: 0, userId, gameSlug, ...rest },
  });
}

// Reset: delete all data between tests
const TABLES = ['Account', 'Session', 'VerificationToken', 'Score', 'Game', 'User'] as const;

export async function resetDb(db: PrismaClient) {
  await db.$transaction([
    db.account.deleteMany(),
    db.session.deleteMany(),
    db.verificationToken.deleteMany(),
    db.score.deleteMany(),
    db.game.deleteMany(),
    db.user.deleteMany(),
  ]);
}
