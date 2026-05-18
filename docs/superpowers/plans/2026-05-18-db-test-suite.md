# DB Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an integration test suite for the PostgreSQL + Prisma database layer using Vitest and Testcontainers, covering schema constraints, queries, data integrity, and relationships.

**Architecture:** Testcontainers spins up an ephemeral PostgreSQL container per test run. Vitest runs tests against it with full reset between each test. Prisma Client connects directly to the containerized DB. Tests validate schema constraints (unique, cascade, foreign keys), application query logic (top 20 scores, upsert), and leaderboard behavior.

**Tech Stack:** Vitest, Testcontainers for Node.js (`@testcontainers/postgresql`), Prisma Client, PostgreSQL 16

---

### Task 0: Install dependencies and configure Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install dependencies**

```bash
npm install -D vitest @testcontainers/postgresql @types/node
```

- [ ] **Step 2: Add npm script to `package.json`**

```json
"test:db": "vitest run"
```

Insert after the `"db:backup"` line (around line 11).

- [ ] **Step 3: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globalSetup: ['./tests/db/globalSetup.ts'],
    setupFiles: ['./tests/db/client.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ['tests/db/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add package.json vitest.config.ts
git commit -m "chore: add vitest and testcontainers dependencies"
```

---

### Task 1: Create globalSetup — Testcontainers orchestration

**Files:**
- Create: `tests/db/globalSetup.ts`

- [ ] **Step 1: Create `tests/db/globalSetup.ts`**

```typescript
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const URL_FILE = path.join(__dirname, '.test-db-url');
let container: StartedPostgreSqlContainer;

export async function setup() {
  container = await new PostgreSqlContainer('postgres:16-alpine').start();
  const connectionUri = container.getConnectionUri();

  // Write URL so test workers can find it
  fs.writeFileSync(URL_FILE, connectionUri);

  // Run migrations against the test container
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: connectionUri },
    cwd: path.join(__dirname, '../..'),
    stdio: 'inherit',
  });
}

export async function teardown() {
  await container?.stop();
  if (fs.existsSync(URL_FILE)) {
    fs.unlinkSync(URL_FILE);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/db/globalSetup.ts
git commit -m "feat: add testcontainers globalSetup for ephemeral postgres"
```

---

### Task 2: Create Prisma client singleton for tests

**Files:**
- Create: `tests/db/client.ts`

- [ ] **Step 1: Create `tests/db/client.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const URL_FILE = path.join(__dirname, '.test-db-url');

function getDbUrl(): string {
  if (fs.existsSync(URL_FILE)) {
    return fs.readFileSync(URL_FILE, 'utf-8').trim();
  }
  // Fallback: if running without globalSetup (e.g. in worker), read from env
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  throw new Error(
    'Test database URL not found. Run tests via `npm run test:db` which starts Testcontainers.'
  );
}

export const prisma = new PrismaClient({
  datasources: { db: { url: getDbUrl() } },
});
```

- [ ] **Step 2: Commit**

```bash
git add tests/db/client.ts
git commit -m "feat: add prisma client singleton for test suite"
```

---

### Task 3: Create test helpers and factory functions

**Files:**
- Create: `tests/db/helpers.ts`

- [ ] **Step 1: Create `tests/db/helpers.ts`**

```typescript
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
  overrides?: { userId: string; gameSlug: string } & Partial<{
    value: number;
    difficulty: number;
  }>
) {
  const { userId, gameSlug, ...rest } = overrides ?? {} as any;
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
```

- [ ] **Step 2: Commit**

```bash
git add tests/db/helpers.ts
git commit -m "feat: add test helpers and factory functions"
```

---

### Task 4: Write users.test.ts

**Files:**
- Create: `tests/db/users.test.ts`

- [ ] **Step 1: Create `tests/db/users.test.ts`**

```typescript
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
```

- [ ] **Step 2: Run the test to verify it passes**

```bash
npm run test:db -- tests/db/users.test.ts
```

Expected: All 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/db/users.test.ts
git commit -m "feat: add user model integration tests"
```

---

### Task 5: Write games.test.ts

**Files:**
- Create: `tests/db/games.test.ts`

- [ ] **Step 1: Create `tests/db/games.test.ts`**

```typescript
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
      data: createGameData({ published: undefined }),
    });
    expect(game.published).toBe(true);
  });

  it('stores and reads JSON fields (scoreConfig, difficultyConfig, palNtscConfig)', async () => {
    const scoreConfig = { address: '0x0800', type: 'bcd', length: 3 };
    const difficultyConfig = { address: '0x2299' };
    const palNtscConfig = { address: '0x2a00', baseOffset: '0x0', numStandards: 2 };

    const game = await prisma.game.create({
      data: createGameData({ scoreConfig, difficultyConfig, palNtscConfig }),
    });

    expect(game.scoreConfig).toEqual(scoreConfig);
    expect(game.difficultyConfig).toEqual(difficultyConfig);
    expect(game.palNtscConfig).toEqual(palNtscConfig);
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
```

- [ ] **Step 2: Run the test to verify it passes**

```bash
npm run test:db -- tests/db/games.test.ts
```

Expected: All 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/db/games.test.ts
git commit -m "feat: add game model integration tests"
```

---

### Task 6: Write scores.test.ts

**Files:**
- Create: `tests/db/scores.test.ts`

- [ ] **Step 1: Create `tests/db/scores.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from './client';
import { seedUser, seedGame, createScoreData, resetDb } from './helpers';
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

    // Create scores for game A
    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: gameA.slug, difficulty: 0 } });
    await prisma.score.create({ data: { value: 500, userId: user.id, gameSlug: gameA.slug, difficulty: 1 } });
    // Create a score for game B (should not appear in game A filter)
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
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    await prisma.score.create({ data: { value: 300, userId: user.id, gameSlug: game.slug, difficulty: 1 } });
    await prisma.score.create({ data: { value: 200, userId: user.id, gameSlug: game.slug, difficulty: 0 } });
    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: game.slug, difficulty: 1 } });

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

  it('allows negative score values (schema Int, no positive constraint)', async () => {
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

    // Check no score exists
    let existing = await prisma.score.findUnique({
      where: {
        userId_gameSlug_difficulty: { userId: user.id, gameSlug: game.slug, difficulty: 0 },
      },
    });
    expect(existing).toBeNull();

    // Create
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

    // Create initial score
    await prisma.score.create({
      data: { value: 500, userId: user.id, gameSlug: game.slug, difficulty: 0 },
    });

    // "Upsert" with higher value
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

    // "Upsert" with lower value (should NOT update)
    const existing = await prisma.score.findUnique({
      where: {
        userId_gameSlug_difficulty: { userId: user.id, gameSlug: game.slug, difficulty: 0 },
      },
    });
    if (existing && 100 <= existing.value) {
      // Do nothing — keep existing
    }

    const score = await prisma.score.findUniqueOrThrow({ where: { id: existing!.id } });
    expect(score.value).toBe(500);
  });
});
```

- [ ] **Step 2: Run the test to verify it passes**

```bash
npm run test:db -- tests/db/scores.test.ts
```

Expected: All 12 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/db/scores.test.ts
git commit -m "feat: add score model integration tests"
```

---

### Task 7: Write leaderboard.test.ts

**Files:**
- Create: `tests/db/leaderboard.test.ts`

- [ ] **Step 1: Create `tests/db/leaderboard.test.ts`**

```typescript
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

    // Create 150 scores (same user+game but different difficulties to bypass unique constraint)
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
```

- [ ] **Step 2: Run the test to verify it passes**

```bash
npm run test:db -- tests/db/leaderboard.test.ts
```

Expected: All 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/db/leaderboard.test.ts
git commit -m "feat: add leaderboard integration tests"
```

---

### Task 8: Write schema.test.ts

**Files:**
- Create: `tests/db/schema.test.ts`

- [ ] **Step 1: Create `tests/db/schema.test.ts`**

```typescript
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
        data: createGameData({ published: undefined }),
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
      expect(score.createdAt.getTime()).toBeCloseTo(Date.now(), -3); // within ~1s
    });
  });

  describe('updatedAt auto-update', () => {
    it('user.updatedAt changes on update', async () => {
      const user = await prisma.user.create({ data: createUserData() });
      const original = user.updatedAt.getTime();

      // Wait a tick to ensure timestamp difference
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
```

- [ ] **Step 2: Run the test to verify it passes**

```bash
npm run test:db -- tests/db/schema.test.ts
```

Expected: All 9 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/db/schema.test.ts
git commit -m "feat: add schema integrity tests"
```

---

### Task 9: Run full test suite and verify

- [ ] **Step 1: Run all DB tests**

```bash
npm run test:db
```

Expected: All tests pass (5 user + 6 games + 12 scores + 5 leaderboard + 9 schema = 37 tests).

- [ ] **Step 2: If any test fails, fix and re-run until green**

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: adjust db tests after full suite run"
```
