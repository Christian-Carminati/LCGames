# DB Refactor Design

**Date:** 2026-05-18
**Status:** Approved

## Objective

Refactor the database schema and query layer for better structure, performance, and maintainability. Includes schema normalization, soft delete, audit trail, pagination, a dedicated service layer, and proper validation — with a test suite already in place to verify correctness.

## 1. Schema Changes

### New Table: GameConfig

Move JSON configuration fields from `Game` to a dedicated 1:1 table.

```prisma
model GameConfig {
  id               String  @id @default(cuid())
  gameId           String  @unique
  game             Game    @relation(fields: [gameId], references: [id], onDelete: Cascade)
  scoreConfig      Json?   // { address, type, length, endianness, baseOffset }
  difficultyConfig Json?   // { address }
  palNtscConfig    Json?   // { address, baseOffset, numStandards }
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Modifications to Score

```prisma
model Score {
  id         String   @id @default(cuid())
  value      BigInt                            // Int → BigInt for high scores
  difficulty Int      @default(0)
  userId     String
  gameSlug   String
  deletedAt  DateTime?                         // soft delete
  scoreHash  String?                           // moved from API logic
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  game Game @relation(fields: [gameSlug], references: [slug])

  @@unique([userId, gameSlug, difficulty])
  @@index([gameSlug, difficulty, value(sort: desc)])
  @@index([userId])
  @@index([createdAt(sort: desc)])
}
```

### Modifications to User

```prisma
model User {
  // ... existing fields ...
  deletedAt DateTime?  // soft delete
}
```

### New Table: AuditLog

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String   // "DELETE_SCORE" | "UPDATE_DIFFICULTY" | "DELETE_USER" | "RESTORE_SCORE" | "CREATE_GAME" | "UPDATE_GAME" | "DELETE_GAME"
  entityType String   // "Score" | "User" | "Game"
  entityId   String
  adminId    String
  oldValue   Json?
  newValue   Json?
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
  @@index([createdAt(sort: desc)])
}
```

`adminId` references `User.id` (no explicit relation to avoid circular dependencies on soft delete).

### Migration Steps

1. Deploy indexes (non-blocking)
2. Create GameConfig, AuditLog tables; add deletedAt columns; migrate value Int→BigInt
3. Backfill: copy JSON data from Game to GameConfig for existing games
4. Remove JSON columns from Game (after verification)
5. Application layer handles soft delete filtering

## 2. Data Access Layer

Centralize query logic into service modules:

```
src/lib/
├── scores.ts       # upsertScore, getTopScores, deleteScore (soft), updateDifficulty
├── games.ts        # createGame, updateGame, getGame, listGames (with GameConfig)
├── leaderboard.ts  # getLeaderboard with cursor pagination, filters
└── audit.ts        # logAction, getAuditLog
```

### scores.ts — upsert logic

```typescript
export async function upsertScore(params: {
  userId: string;
  gameSlug: string;
  value: bigint;
  difficulty?: number;
  hash?: string;
}): Promise<ScoreWithUser[]>
```

Replaces the inline upsert in `POST /api/scores`. Checks `deletedAt: null` when finding existing score. If existing score is found:
- New value higher → update
- New value same or lower → keep existing

Returns top 20 scores after mutation.

### leaderboard.ts — cursor pagination

```typescript
export async function getLeaderboard(params: {
  gameSlug?: string;
  difficulty?: number;
  cursor?: string;
  limit?: number;
}): Promise<{ scores: ScoreEntry[]; nextCursor?: string }>
```

Cursor is the last score's ID. Prisma: `cursor ? { id: cursor }, skip: 1`. `limit + 1` fetched to detect next page.

### audit.ts

```typescript
type AdminAction = 'DELETE_SCORE' | 'UPDATE_DIFFICULTY' | 'DELETE_USER' | 'RESTORE_SCORE' | 'CREATE_GAME' | 'UPDATE_GAME' | 'DELETE_GAME';

export async function logAction(params: {
  action: AdminAction;
  entityType: string;
  entityId: string;
  adminId: string;
  oldValue?: unknown;
  newValue?: unknown;
}): Promise<void>
```

Recorded on every admin mutation. Admin views in `/admin/audit` page.

## 3. Pagination and Query Optimization

All score/leaderboard list endpoints use cursor-based pagination:

```typescript
// GET /api/scores?gameSlug=hero-is-back&difficulty=1&cursor=xxx&limit=20
// Response: { scores: [...], nextCursor: "abc123" | null }
```

Composite index `@@index([gameSlug, difficulty, value(sort: desc)])` supports the primary leaderboard query without sequential scans.

Leaderboard query pattern:
```typescript
await prisma.score.findMany({
  where: { gameSlug, difficulty, deletedAt: null },
  orderBy: [{ value: 'desc' }, { id: 'asc' }],
  take: limit + 1,
  cursor: cursor ? { id: cursor } : undefined,
  skip: cursor ? 1 : 0,
});
```

## 4. Soft Delete and Audit Trail

### Soft Delete Behavior

- **Score**: `deletedAt` set on admin delete. All public queries filter `deletedAt: null`.
- **User**: `deletedAt` set on account deletion. Soft-deleted users show "[Deleted User]" on leaderboard. OAuth re-login restores user (sets `deletedAt = null`).
- **Game**: No soft delete (admin-controlled, rarely deleted, easily recreated).

### Unique Constraint After Soft Delete

The `@@unique([userId, gameSlug, difficulty])` constraint prevents creating a new score if a soft-deleted one exists with the same combination. The `upsertScore` service handles this:
- When creating, first checks for existing score with `deletedAt: null`
- If a soft-deleted record exists, creates a new one (constraint still enforced)
- If constraint violation occurs, the service catches P2002 and handles gracefully

### Admin Audit Trail

AuditLog records all admin mutations. API routes call `logAction()` after each mutation.
No user-triggered actions are logged (only admin).

## 5. Validation and Migration Strategy

### Zod Validation

Replace loose schemas with specific validators:

```typescript
export const ScoreConfigSchema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]+$/),
  type: z.enum(['byte', 'int', 'bcd', 'string', 'digits']),
  length: z.number().int().min(1).max(8),
  baseOffset: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  endianness: z.enum(['big', 'little']).optional(),
});
```

Applied in game create/update API routes and the admin GameForm component.

### Migration Order

Each step is reversible and independently testable:

1. **Indexes** — deploy new indexes (non-blocking, no data migration)
2. **New tables** — create GameConfig, AuditLog; add deletedAt, scoreHash columns; change value to BigInt
3. **Backfill** — migrate JSON from Game to GameConfig
4. **Cleanup** — drop JSON columns from Game
5. **Service layer deploy** — scores.ts, games.ts, leaderboard.ts, audit.ts (API routes still work directly)
6. **API route switch** — routes call services instead of raw Prisma
7. **Pagination** — update API routes to support cursor parameter
8. **Frontend** — update components to handle paginated responses

### Rollback

Each migration step has a down migration. The backup file `backups/backup-YYYY-MM-DDTHH-MM-SS-msZ.sql` can restore the full database.

## Database Backup

Full pg_dump taken before any changes:
- `backups/backup-2026-05-18T10-42-46-576Z.sql` (63 KB)
- Dumped from PostgreSQL 17.2 via Prisma Postgres
- Connections use SSL (`sslmode=require`)
