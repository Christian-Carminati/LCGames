# DB Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor database schema, add service layer, implement soft delete and audit trail, add cursor pagination, improve validation.

**Architecture:** Two-phase migration (add GameConfig/AuditLog, then drop old JSON columns). Service layer (`scores.ts`, `games.ts`, `leaderboard.ts`, `audit.ts`) centralizes all query logic. API routes become thin wrappers. Existing DB test suite (39 tests) validates each change.

**Tech Stack:** Prisma ORM, PostgreSQL, Zod, Vitest + Testcontainers

---

### Task 0: Update Prisma Schema — Add GameConfig, AuditLog, soft delete, indexes

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add GameConfig model after Game**

```prisma
model GameConfig {
  id               String   @id @default(cuid())
  gameId           String   @unique
  game             Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  scoreConfig      Json?
  difficultyConfig Json?
  palNtscConfig    Json?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

Add to Game model:
```prisma
model Game {
  // ... existing fields (keep scoreConfig, difficultyConfig, palNtscConfig for now) ...
  gameConfig GameConfig?
}
```

- [ ] **Step 2: Add AuditLog model**

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String
  entityType String
  entityId   String
  adminId    String
  oldValue   Json?
  newValue   Json?
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
  @@index([createdAt(sort: desc)])
}
```

- [ ] **Step 3: Add deletedAt and scoreHash to Score; change value to BigInt**

```prisma
model Score {
  // ... existing fields ...
  value      BigInt                            // Int → BigInt
  deletedAt  DateTime?
  scoreHash  String?

  @@index([gameSlug, difficulty, value(sort: desc)])
  @@index([userId])
  @@index([createdAt(sort: desc)])
}
```

- [ ] **Step 4: Add deletedAt to User**

```prisma
model User {
  // ... existing fields ...
  deletedAt DateTime?
}
```

- [ ] **Step 5: Sync database**

```bash
npx prisma db push
```

Expected: New tables created, columns added, indexes created.

- [ ] **Step 6: Backfill GameConfig from existing Game JSON data**

```bash
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const games = await prisma.game.findMany({ where: { gameConfig: null } });
  for (const game of games) {
    if (game.scoreConfig || game.difficultyConfig || game.palNtscConfig) {
      await prisma.gameConfig.create({
        data: {
          gameId: game.id,
          scoreConfig: game.scoreConfig,
          difficultyConfig: game.difficultyConfig,
          palNtscConfig: game.palNtscConfig,
        }
      });
    }
  }
  console.log('Backfilled ' + games.filter(g => g.scoreConfig || g.difficultyConfig || g.palNtscConfig).length + ' GameConfig records');
}
main().catch(console.error).finally(() => prisma.\$disconnect());
"
```

- [ ] **Step 7: Run DB tests to verify schema changes don't break existing queries**

```bash
npm run test:db
```

Expect: Tests may fail due to BigInt type — fix test expectations for `score.value` (BigInt vs number).

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma tests/
git commit -m "feat: add GameConfig, AuditLog, soft delete, BigInt to schema"
```

---

### Task 1: Remove JSON columns from Game (cleanup migration)

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Remove scoreConfig, difficultyConfig, palNtscConfig from Game model**

```prisma
model Game {
  // Remove these three fields:
  // scoreConfig      Json?
  // difficultyConfig Json?
  // palNtscConfig    Json?
}
```

- [ ] **Step 2: Add a relation to access GameConfig from Game**

```prisma
model Game {
  // ... keep everything else ...
  gameConfig GameConfig?
}
```

- [ ] **Step 3: Sync database**

```bash
npx prisma db push
```

- [ ] **Step 4: Run DB tests**

```bash
npm run test:db
```

Expected: Tests pass (or fail predictably — fix as needed).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: remove JSON config fields from Game, use GameConfig"
```

---

### Task 2: Add strict Zod validation for config schemas

**Files:**
- Modify: `src/lib/validations.ts`

- [ ] **Step 1: Add specific config validation schemas**

Add to `src/lib/validations.ts`:

```typescript
export const ScoreConfigSchema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]+$/, 'Must be hex like 0x0800'),
  type: z.enum(['byte', 'int', 'bcd', 'string', 'digits']),
  length: z.number().int().min(1).max(8),
  baseOffset: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  endianness: z.enum(['big', 'little']).optional(),
  multiplier: z.number().int().min(1).optional(),
});

export const DifficultyConfigSchema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]+$/),
  baseOffset: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  numLevels: z.number().int().min(1).max(20).optional(),
  levelNames: z.string().optional(),
}).optional();

export const PalNtscConfigSchema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]+$/),
  baseOffset: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  numStandards: z.number().int().min(1).max(2).optional(),
}).optional();
```

- [ ] **Step 2: Update GameSchema to use specific config schemas**

Replace the loose `z.record(...)` lines:

```typescript
export const GameSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional(),
  platform: z.enum(['C64 LC-Games', 'C64 Arcade', 'PC', 'Amiga', 'Other']),
  genre: z.string().max(50).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
  romPath: z.string().optional(),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  scoreConfig: ScoreConfigSchema.nullish(),
  difficultyConfig: DifficultyConfigSchema,
  palNtscConfig: PalNtscConfigSchema,
  published: z.boolean().optional(),
}).transform(data => ({
  ...data,
  platform: data.platform || 'C64 LC-Games' as const
}));
```

- [ ] **Step 3: Run tests**

```bash
npm run test:db
```

Expected: Tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat: strict Zod validation for score/difficulty/PAL-NTSC configs"
```

---

### Task 3: Create Games service

**Files:**
- Create: `src/lib/games.ts`

- [ ] **Step 1: Create `src/lib/games.ts`**

```typescript
import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';

export interface GameWithConfig {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  platform: string;
  genre: string | null;
  imageUrl: string | null;
  url: string | null;
  romPath: string | null;
  youtubeUrl: string | null;
  published: boolean;
  difficultyConfig: Prisma.JsonValue | null;
  palNtscConfig: Prisma.JsonValue | null;
  scoreConfig: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

function mergeGameConfig(game: any): GameWithConfig {
  return {
    ...game,
    scoreConfig: game.gameConfig?.scoreConfig ?? null,
    difficultyConfig: game.gameConfig?.difficultyConfig ?? null,
    palNtscConfig: game.gameConfig?.palNtscConfig ?? null,
  };
}

export async function getGameBySlug(slug: string): Promise<GameWithConfig | null> {
  const game = await prisma.game.findUnique({
    where: { slug },
    include: { gameConfig: true },
  });
  return game ? mergeGameConfig(game) : null;
}

export async function listGames(): Promise<GameWithConfig[]> {
  const games = await prisma.game.findMany({
    orderBy: { title: 'asc' },
    include: { gameConfig: true },
  });
  return games.map(mergeGameConfig);
}

export async function createGame(data: Prisma.GameCreateInput & {
  scoreConfig?: Prisma.InputJsonValue;
  difficultyConfig?: Prisma.InputJsonValue;
  palNtscConfig?: Prisma.InputJsonValue;
}): Promise<GameWithConfig> {
  const { scoreConfig, difficultyConfig, palNtscConfig, ...gameData } = data;

  const game = await prisma.game.create({
    data: {
      ...gameData,
      gameConfig: {
        create: {
          scoreConfig: scoreConfig as Prisma.InputJsonValue ?? Prisma.DbNull,
          difficultyConfig: difficultyConfig as Prisma.InputJsonValue ?? Prisma.DbNull,
          palNtscConfig: palNtscConfig as Prisma.InputJsonValue ?? Prisma.DbNull,
        },
      },
    },
    include: { gameConfig: true },
  });

  return mergeGameConfig(game);
}

export async function updateGame(
  slug: string,
  data: Partial<Prisma.GameUpdateInput> & {
    scoreConfig?: Prisma.InputJsonValue;
    difficultyConfig?: Prisma.InputJsonValue;
    palNtscConfig?: Prisma.InputJsonValue;
  }
): Promise<GameWithConfig | null> {
  const { scoreConfig, difficultyConfig, palNtscConfig, ...gameData } = data;

  const game = await prisma.game.update({
    where: { slug },
    data: {
      ...gameData,
      gameConfig: scoreConfig !== undefined || difficultyConfig !== undefined || palNtscConfig !== undefined ? {
        upsert: {
          create: {
            scoreConfig: (scoreConfig ?? Prisma.DbNull) as Prisma.InputJsonValue,
            difficultyConfig: (difficultyConfig ?? Prisma.DbNull) as Prisma.InputJsonValue,
            palNtscConfig: (palNtscConfig ?? Prisma.DbNull) as Prisma.InputJsonValue,
          },
          update: {
            ...(scoreConfig !== undefined ? { scoreConfig: scoreConfig as Prisma.InputJsonValue } : {}),
            ...(difficultyConfig !== undefined ? { difficultyConfig: difficultyConfig as Prisma.InputJsonValue } : {}),
            ...(palNtscConfig !== undefined ? { palNtscConfig: palNtscConfig as Prisma.InputJsonValue } : {}),
          },
        },
      } : undefined,
    },
    include: { gameConfig: true },
  });

  return mergeGameConfig(game);
}

export async function deleteGame(slug: string): Promise<void> {
  await prisma.$transaction([
    prisma.score.deleteMany({ where: { gameSlug: slug } }),
    prisma.game.delete({ where: { slug } }),
  ]);
}
```

- [ ] **Step 2: Run tests**

```bash
npm run test:db
```

Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/games.ts
git commit -m "feat: add games service with GameConfig support"
```

---

### Task 4: Create Scores service

**Files:**
- Create: `src/lib/scores.ts`

- [ ] **Step 1: Create `src/lib/scores.ts`**

```typescript
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface ScoreEntry {
  id: string;
  value: number;
  difficulty: number;
  userId: string;
  gameSlug: string;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
    email: string;
  };
}

function formatScore(s: any): ScoreEntry {
  return {
    ...s,
    value: Number(s.value),
  };
}

export async function getTopScores(params: {
  gameSlug: string;
  difficulty?: number;
  cursor?: string;
  limit?: number;
}): Promise<{ scores: ScoreEntry[]; nextCursor: string | null }> {
  const { gameSlug, difficulty, cursor, limit = 20 } = params;

  const scores = await prisma.score.findMany({
    where: {
      gameSlug,
      deletedAt: null,
      ...(difficulty !== undefined ? { difficulty } : {}),
    },
    orderBy: [{ value: 'desc' }, { id: 'asc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { name: true, image: true, email: true } },
    },
  });

  const hasMore = scores.length > limit;
  const result = hasMore ? scores.slice(0, limit) : scores;

  return {
    scores: result.map(formatScore),
    nextCursor: hasMore ? result[result.length - 1].id : null,
  };
}

export async function upsertScore(params: {
  userId: string;
  gameSlug: string;
  value: number;
  difficulty?: number;
  hash?: string;
}): Promise<{ scores: ScoreEntry[]; nextCursor: string | null }> {
  const { userId, gameSlug, value, difficulty = 0, hash } = params;

  const existingScore = await prisma.score.findFirst({
    where: { userId, gameSlug, difficulty, deletedAt: null },
  });

  if (existingScore) {
    if (value > Number(existingScore.value)) {
      await prisma.score.update({
        where: { id: existingScore.id },
        data: { value, ...(hash ? { scoreHash: hash } : {}) },
      });
    }
  } else {
    await prisma.score.create({
      data: { value, difficulty, userId, gameSlug, scoreHash: hash ?? null },
    });
  }

  return getTopScores({ gameSlug, difficulty });
}

export async function softDeleteScore(scoreId: string): Promise<void> {
  await prisma.score.update({
    where: { id: scoreId },
    data: { deletedAt: new Date() },
  });
}

export async function updateScoreDifficulty(
  scoreId: string,
  difficulty: number
): Promise<ScoreEntry | null> {
  const updated = await prisma.score.update({
    where: { id: scoreId },
    data: { difficulty },
    include: {
      user: { select: { name: true, image: true, email: true } },
    },
  });
  return formatScore(updated);
}
```

- [ ] **Step 2: Run tests**

```bash
npm run test:db
```

Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/scores.ts
git commit -m "feat: add scores service with soft delete and pagination"
```

---

### Task 5: Create Leaderboard service

**Files:**
- Create: `src/lib/leaderboard.ts`

- [ ] **Step 1: Create `src/lib/leaderboard.ts`**

```typescript
import prisma from '@/lib/db';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  pos: number;
  uploadedAt: string;
  gameTitle: string;
}

export async function getLeaderboard(params: {
  cursor?: string;
  limit?: number;
}): Promise<{ entries: LeaderboardEntry[]; nextCursor: string | null }> {
  const { cursor, limit = 50 } = params;

  const scores = await prisma.score.findMany({
    where: { deletedAt: null },
    orderBy: [{ value: 'desc' }, { id: 'asc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { name: true } },
      game: { select: { title: true } },
    },
  });

  const hasMore = scores.length > limit;
  const result = hasMore ? scores.slice(0, limit) : scores;

  return {
    entries: result.map((s, i) => ({
      userId: s.userId,
      name: s.user?.name || (s.deletedAt ? '[Deleted User]' : 'GUEST'),
      score: Number(s.value),
      pos: i + 1,
      uploadedAt: s.createdAt.toISOString(),
      gameTitle: s.game.title,
    })),
    nextCursor: hasMore ? result[result.length - 1].id : null,
  };
}
```

- [ ] **Step 2: Update `src/lib/leaderboardUtils.ts` to use the new service**

In `src/lib/leaderboardUtils.ts`, replace the `getLeaderboard` function:

```typescript
import { getLeaderboard } from '@/lib/leaderboard';
export { getLeaderboard };
// Keep saveScores as-is for now (it's not used with auth)
```

- [ ] **Step 3: Run tests**

```bash
npm run test:db
```

Expected: Tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/leaderboard.ts src/lib/leaderboardUtils.ts
git commit -m "feat: add leaderboard service with cursor pagination"
```

---

### Task 6: Create Audit service

**Files:**
- Create: `src/lib/audit.ts`

- [ ] **Step 1: Create `src/lib/audit.ts`**

```typescript
import prisma from '@/lib/db';

export type AdminAction =
  | 'DELETE_SCORE'
  | 'UPDATE_DIFFICULTY'
  | 'DELETE_USER'
  | 'RESTORE_SCORE'
  | 'CREATE_GAME'
  | 'UPDATE_GAME'
  | 'DELETE_GAME';

export async function logAction(params: {
  action: AdminAction;
  entityType: string;
  entityId: string;
  adminId: string;
  oldValue?: unknown;
  newValue?: unknown;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      adminId: params.adminId,
      oldValue: params.oldValue ?? Prisma.DbNull,
      newValue: params.newValue ?? Prisma.DbNull,
    },
  });
}

export async function getAuditLog(params: {
  cursor?: string;
  limit?: number;
}): Promise<{ entries: any[]; nextCursor: string | null }> {
  const { cursor, limit = 50 } = params;

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = entries.length > limit;
  const result = hasMore ? entries.slice(0, limit) : entries;

  return {
    entries: result,
    nextCursor: hasMore ? result[result.length - 1].id : null,
  };
}
```

- [ ] **Step 2: Run tests**

```bash
npm run test:db
```

Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/audit.ts
git commit -m "feat: add audit service for admin action logging"
```

---

### Task 7: Update scores API route to use services

**Files:**
- Modify: `src/app/api/scores/route.ts`

- [ ] **Step 1: Rewrite `src/app/api/scores/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { verifyScoreHash } from '@/lib/security';
import { getTopScores, upsertScore } from '@/lib/scores';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameSlug = searchParams.get('gameSlug');
  const difficultyParam = searchParams.get('difficulty');
  const cursor = searchParams.get('cursor');
  const limitParam = searchParams.get('limit');

  if (!gameSlug) {
    return NextResponse.json({ error: 'Game slug required' }, { status: 400 });
  }

  const difficulty = difficultyParam !== null ? parseInt(difficultyParam, 10) : undefined;
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;

  try {
    const result = await getTopScores({ gameSlug, difficulty, cursor, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameSlug, score, difficulty = 0, hash } = body;

    if (!gameSlug || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const isValid = verifyScoreHash(score, gameSlug, difficulty, hash);
    if (!isValid) {
      console.warn(`[SECURITY] Invalid score hash from user ${session.user.email} for game ${gameSlug}`);
      return NextResponse.json({ error: 'Invalid score verification signature' }, { status: 403 });
    }

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: { name: session.user.name || "Anonymous", image: session.user.image },
      create: { email: session.user.email, name: session.user.name || "Anonymous", image: session.user.image },
    });

    const result = await upsertScore({
      userId: user.id,
      gameSlug,
      value: score,
      difficulty,
      hash,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("Error saving score:", e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

Add the missing import at the top:
```typescript
import prisma from '@/lib/db';
```

- [ ] **Step 2: Run tests**

```bash
npm run test:db
```

Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/scores/route.ts
git commit -m "refactor: scores API uses scores service with pagination"
```

---

### Task 8: Update admin scores/games API routes to use services and audit

**Files:**
- Modify: `src/app/api/admin/scores/route.ts`
- Modify: `src/app/api/admin/games/route.ts`
- Modify: `src/app/api/admin/games/[slug]/route.ts`

- [ ] **Step 1: Rewrite `src/app/api/admin/scores/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { ScoreIdSchema, ScoreDifficultySchema } from '@/lib/validations';
import { softDeleteScore, updateScoreDifficulty } from '@/lib/scores';
import { logAction } from '@/lib/audit';

export async function DELETE(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const result = ScoreIdSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
    }

    const { scoreId } = result.data;
    await softDeleteScore(scoreId);
    await logAction({ action: 'DELETE_SCORE', entityType: 'Score', entityId: scoreId, adminId: 'admin' });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to soft delete score:", e);
    return NextResponse.json({ error: 'Failed to delete score' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const result = ScoreDifficultySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
    }

    const { scoreId, difficulty } = result.data;
    const oldScore = await prisma.score.findUnique({ where: { id: scoreId } });
    const updated = await updateScoreDifficulty(scoreId, difficulty);
    await logAction({
      action: 'UPDATE_DIFFICULTY',
      entityType: 'Score',
      entityId: scoreId,
      adminId: 'admin',
      oldValue: oldScore ? { difficulty: oldScore.difficulty } : undefined,
      newValue: { difficulty },
    });

    return NextResponse.json({ success: true, score: updated });
  } catch (e) {
    console.error("Failed to update score difficulty:", e);
    return NextResponse.json({ error: 'Failed to update score difficulty' }, { status: 500 });
  }
}
```

Add the import:
```typescript
import prisma from '@/lib/db';
```

- [ ] **Step 2: Rewrite `src/app/api/admin/games/route.ts` to use games service**

Replace the POST handler (keep GET as-is or update to use `listGames()`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { GameSchema } from '@/lib/validations';
import { createGame, listGames } from '@/lib/games';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
  try {
    const games = await listGames();
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const result = GameSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.game.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'A game with this slug already exists' }, { status: 409 });
    }

    const { scoreConfig, difficultyConfig, palNtscConfig, ...gameFields } = data;
    const game = await createGame({
      slug,
      title: gameFields.title,
      description: gameFields.description,
      platform: gameFields.platform || 'C64 LC-Games',
      genre: gameFields.genre,
      imageUrl: gameFields.imageUrl || undefined,
      url: gameFields.url || undefined,
      romPath: gameFields.romPath,
      youtubeUrl: gameFields.youtubeUrl || undefined,
      published: gameFields.published ?? true,
      scoreConfig: scoreConfig as any,
      difficultyConfig: difficultyConfig as any,
      palNtscConfig: palNtscConfig as any,
    } as any);

    await logAction({ action: 'CREATE_GAME', entityType: 'Game', entityId: game.id, adminId: 'admin' });

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error("Failed to create game:", error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Rewrite `src/app/api/admin/games/[slug]/route.ts` to use games service**

Replace GET with `getGameBySlug()`, PUT with `updateGame()`, DELETE with `deleteGame()` + audit:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { GameSchema } from '@/lib/validations';
import { getGameBySlug, updateGame, deleteGame } from '@/lib/games';
import { logAction } from '@/lib/audit';

export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const params = await props.params;
  try {
    const game = await getGameBySlug(params.slug);
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const params = await props.params;
  try {
    const body = await request.json();
    const result = GameSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.game.findUnique({ where: { slug: params.slug } });
    if (!existing) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

    const { scoreConfig, difficultyConfig, palNtscConfig, ...gameFields } = result.data;
    const updated = await updateGame(params.slug, {
      title: gameFields.title,
      description: gameFields.description,
      platform: gameFields.platform,
      genre: gameFields.genre,
      imageUrl: gameFields.imageUrl || undefined,
      url: gameFields.url || undefined,
      romPath: gameFields.romPath,
      youtubeUrl: gameFields.youtubeUrl || undefined,
      published: gameFields.published ?? true,
      scoreConfig: scoreConfig as any,
      difficultyConfig: difficultyConfig as any,
      palNtscConfig: palNtscConfig as any,
    } as any);

    if (updated) {
      await logAction({ action: 'UPDATE_GAME', entityType: 'Game', entityId: updated.id, adminId: 'admin' });
    }

    return NextResponse.json({ success: true, game: updated });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const params = await props.params;
  try {
    await deleteGame(params.slug);
    await logAction({ action: 'DELETE_GAME', entityType: 'Game', entityId: params.slug, adminId: 'admin' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test:db
```

Expected: Tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/scores/route.ts src/app/api/admin/games/route.ts src/app/api/admin/games/\[slug\]/route.ts
git commit -m "refactor: admin API routes use services and audit logging"
```

---

### Task 9: Update GameInterface, Emulator, and admin GameForm to read GameConfig

**Files:**
- Modify: `src/components/Emulator.tsx`
- Modify: `src/components/GameInterface.tsx`
- Modify: `src/app/games/[slug]/page.tsx`
- Modify: `src/app/admin/games/[slug]/page.tsx`
- Modify: `src/components/admin/GameForm.tsx`

- [ ] **Step 1: Update game slug page to pass configs from GameConfig**

In `src/app/games/[slug]/page.tsx`, change how `scoreConfig`, `difficultyConfig`, `palNtscConfig` are extracted.

Replace the manual extraction with the service:

```typescript
import { getGameBySlug } from '@/lib/games';
// ... in the component:
const game = await getGameBySlug(slug);
```

If not using the service directly, at least read from `gameConfig`:

```typescript
const gameConfig = game.gameConfig;
const scoreConfig = gameConfig?.scoreConfig as ScoreConfig | undefined;
const difficultyConfig = gameConfig?.difficultyConfig as any;
const palNtscConfig = gameConfig?.palNtscConfig as any;
```

- [ ] **Step 2: Update admin game slug page to use GameConfig**

In `src/app/admin/games/[slug]/page.tsx`, read config from GameConfig:

```typescript
const gameConfig = game.gameConfig;
const scoreConfig = gameConfig?.scoreConfig as ScoreConfig | undefined;
```

- [ ] **Step 3: Verify the app still works**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/games/\[slug\]/page.tsx src/app/admin/games/\[slug\]/page.tsx
git commit -m "refactor: game pages read config from GameConfig relation"
```

---

### Task 10: Add admin audit log page

**Files:**
- Create: `src/app/admin/audit/page.tsx`
- Create: `src/components/admin/AuditLogTable.tsx`
- Modify: `src/app/admin/layout.tsx` or add link from admin dashboard

- [ ] **Step 1: Create `src/components/admin/AuditLogTable.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  adminId: string;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
}

export default function AuditLogTable() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit')
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="nes-table-responsive">
      <table className="nes-table is-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Entity ID</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id}>
              <td>{new Date(e.createdAt).toLocaleString()}</td>
              <td><span className="nes-badge"><span className="is-warning">{e.action}</span></span></td>
              <td>{e.entityType}</td>
              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.entityId}</td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr><td colSpan={4} className="text-center">No audit entries yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/audit/page.tsx`**

```typescript
import AuditLogTable from '@/components/admin/AuditLogTable';

export default function AuditPage() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Audit Log</h2>
      <AuditLogTable />
    </div>
  );
}
```

- [ ] **Step 3: Create audit API route `src/app/api/admin/audit/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  try {
    const result = await getAuditLog({ cursor, limit });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/audit/ src/app/api/admin/audit/ src/components/admin/AuditLogTable.tsx
git commit -m "feat: add admin audit log page"
```

---

### Task 11: Update DB test suite for new schema

**Files:**
- Modify: `tests/db/scores.test.ts` — update BigInt expectation, add soft delete tests
- Modify: `tests/db/schema.test.ts` — add GameConfig, AuditLog tests
- Create: `tests/db/services.test.ts` — service layer integration tests

- [ ] **Step 1: Add soft delete tests to scores.test.ts**

Add to `tests/db/scores.test.ts`:

```typescript
describe('Soft delete', () => {
  it('soft-deletes a score by setting deletedAt', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);
    const score = await prisma.score.create({
      data: { value: 500, userId: user.id, gameSlug: game.slug },
    });

    await prisma.score.update({
      where: { id: score.id },
      data: { deletedAt: new Date() },
    });

    const active = await prisma.score.findMany({ where: { deletedAt: null } });
    expect(active).toHaveLength(0);

    const all = await prisma.score.findMany();
    expect(all).toHaveLength(1);
  });

  it('excludes soft-deleted scores from leaderboard queries', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    await prisma.score.create({ data: { value: 100, userId: user.id, gameSlug: game.slug } });
    const score2 = await prisma.score.create({ data: { value: 200, userId: user.id, gameSlug: game.slug, difficulty: 1 } });
    await prisma.score.update({ where: { id: score2.id }, data: { deletedAt: new Date() } });

    const active = await prisma.score.findMany({
      where: { deletedAt: null },
      orderBy: { value: 'desc' },
    });
    expect(active).toHaveLength(1);
    expect(active[0].value).toBe(100);
  });

  it('allows creating new score with same userId/gameSlug/difficulty after soft delete', async () => {
    const user = await seedUser(prisma);
    const game = await seedGame(prisma);

    const score = await prisma.score.create({
      data: { value: 500, userId: user.id, gameSlug: game.slug },
    });
    await prisma.score.update({ where: { id: score.id }, data: { deletedAt: new Date() } });

    // Create a new score with same user/game/difficulty (the soft-deleted one
    // still has the unique constraint, but the service layer should handle this
    // by checking deletedAt: null first)
    await prisma.score.create({
      data: { value: 999, userId: user.id, gameSlug: game.slug, difficulty: 0 },
    });

    const active = await prisma.score.findMany({ where: { deletedAt: null } });
    expect(active).toHaveLength(1);
    expect(active[0].value).toBe(999);
  });
});
```

- [ ] **Step 2: Add GameConfig and AuditLog tests to schema.test.ts**

Add to `tests/db/schema.test.ts`:

```typescript
describe('GameConfig', () => {
  it('creates GameConfig with 1:1 relation to Game', async () => {
    const game = await seedGame(prisma);
    const config = await prisma.gameConfig.create({
      data: {
        gameId: game.id,
        scoreConfig: { address: '0x0800', type: 'bcd', length: 3 },
      },
    });

    expect(config.id).toBeTruthy();
    expect(config.gameId).toBe(game.id);

    const loaded = await prisma.game.findUnique({
      where: { id: game.id },
      include: { gameConfig: true },
    });
    expect(loaded?.gameConfig?.scoreConfig).toEqual({ address: '0x0800', type: 'bcd', length: 3 });
  });

  it('cascades delete when Game is removed', async () => {
    const game = await seedGame(prisma);
    await prisma.gameConfig.create({
      data: { gameId: game.id },
    });

    await prisma.game.delete({ where: { id: game.id } });

    const configs = await prisma.gameConfig.findMany();
    expect(configs).toHaveLength(0);
  });
});

describe('AuditLog', () => {
  it('creates audit log entry', async () => {
    const entry = await prisma.auditLog.create({
      data: {
        action: 'DELETE_SCORE',
        entityType: 'Score',
        entityId: 'test-id',
        adminId: 'admin-id',
      },
    });

    expect(entry.id).toBeTruthy();
    expect(entry.action).toBe('DELETE_SCORE');
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it('stores optional oldValue and newValue', async () => {
    const entry = await prisma.auditLog.create({
      data: {
        action: 'UPDATE_DIFFICULTY',
        entityType: 'Score',
        entityId: 'test-id',
        adminId: 'admin-id',
        oldValue: { difficulty: 0 },
        newValue: { difficulty: 1 },
      },
    });

    expect(entry.oldValue).toEqual({ difficulty: 0 });
    expect(entry.newValue).toEqual({ difficulty: 1 });
  });
});
```

- [ ] **Step 3: Create `tests/db/services.test.ts`**

```typescript
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

    await upsertScore({
      userId: user.id,
      gameSlug: game.slug,
      value: 500,
    });

    const scores = await prisma.score.findMany();
    expect(scores).toHaveLength(1);
    expect(Number(scores[0].value)).toBe(500);
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
```

- [ ] **Step 4: Run full test suite**

```bash
npm run test:db
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/db/
git commit -m "test: add soft delete, GameConfig, AuditLog, service layer tests"
```

---

### Task 12: Update test helpers for GameConfig and AuditLog in resetDb

**Files:**
- Modify: `tests/db/helpers.ts`

- [ ] **Step 1: Add GameConfig and AuditLog to resetDb order**

```typescript
const TABLES = ['Account', 'Session', 'VerificationToken', 'AuditLog', 'GameConfig', 'Score', 'Game', 'User'] as const;
```

Note: GameConfig must be deleted before Game (due to FK constraint). AuditLog has no FK constraints, so it can be deleted early.

- [ ] **Step 2: Run tests to verify**

```bash
npm run test:db
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/db/helpers.ts
git commit -m "fix: update resetDb table order for GameConfig and AuditLog"
```

---

### Task 13: Final full suite verification

- [ ] **Step 1: Run all tests**

```bash
npm run test:db
```

Expected: 50+ tests pass (existing 39 + new tests).

- [ ] **Step 2: Build check**

```bash
npm run build 2>&1 | tail -30
```

Expected: Build succeeds.

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: adjustments after full test suite run"
```
