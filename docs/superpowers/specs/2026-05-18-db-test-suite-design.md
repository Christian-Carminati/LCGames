# DB Test Suite Design

**Date:** 2026-05-18
**Status:** Approved

## Objective

Create a solid integration test suite for the database layer (PostgreSQL + Prisma) to validate schema constraints, query behavior, data integrity, and relationships. This suite serves as a safety net before proceeding with DB schema refactoring and optimization.

## Architecture

**Stack:**
- **Test runner:** Vitest — fast, TypeScript-native, compatible with Next.js
- **Database:** PostgreSQL via Testcontainers — ephemeral container spun up per test run
- **ORM:** Prisma Client — single instance connected to the test container
- **Migrations:** Prisma migrations via `prisma migrate deploy` on container ready

**Flow:**
```
npm run test:db
  → Testcontainers starts PostgreSQL container
  → Prisma runs `migrate deploy` against container URL
  → Vitest executes all test files (DB reset between each)
  → Testcontainers stops and removes container
```

## Directory Structure

```
tests/db/
├── setup.ts              # Testcontainers orchestration + Prisma client init
├── teardown.ts           # Global cleanup after all tests
├── helpers.ts            # Factory functions for test data creation
├── users.test.ts         # User CRUD + relations
├── games.test.ts         # Game CRUD + JSON fields
├── scores.test.ts        # Score constraints, upsert logic, queries
├── leaderboard.test.ts   # Leaderboard query behavior
└── schema.test.ts        # Schema integrity checks
```

## Test Data Reset Strategy

**Approach:** `beforeEach` truncates all tables in dependency order (respecting foreign keys):

```
Account → Session → VerificationToken → Score → Game → User
```

This ensures each test starts with a clean database state, no interference between tests.

**Alternative considered:** wrapping each test in a SQL transaction with rollback. Rejected because some Prisma migration statements are DDL and cannot run within a transaction. Truncate is more reliable.

## Helper Functions (`helpers.ts`)

- `createUserData(overrides?)` — generates unique email (`test-${uuid}@example.com`), default name
- `createGameData(overrides?)` — generates unique slug (`test-game-${uuid}`), default title/platform
- `createScoreData(overrides?)` — requires userId + gameSlug, default value/difficulty
- `seedUser(db, overrides?)` — creates and returns a persisted User
- `seedGame(db, overrides?)` — creates and returns a persisted Game
- `seedScore(db, overrides?)` — creates and returns a persisted Score

## Test Categories

### Users (`users.test.ts`)

- Create user with minimal fields (email only)
- Unique constraint on email — duplicate email throws `Prisma.PrismaClientKnownRequestError` (P2002)
- Cascade delete: deleting a user deletes their Account, Session, and Score records
- Create user with optional fields (name, image, emailVerified)
- `createdAt` and `updatedAt` are auto-set

### Games (`games.test.ts`)

- Create game with required fields (slug, title, platform)
- Unique constraint on slug — duplicate slug throws P2002
- JSON fields: write and read `scoreConfig`, `difficultyConfig`, `palNtscConfig` as valid JSON
- `published` defaults to `true` when not specified
- Update game fields (title, description, published)
- Query games sorted by title ascending

### Scores (`scores.test.ts`)

- Create score with valid userId and gameSlug
- **Unique composite constraint** `@@unique([userId, gameSlug, difficulty])` — inserting a second score with the same user/game/difficulty throws P2002
- **Upsert logic** (mirroring `POST /api/scores`):
  - If score exists and new value is higher → update value
  - If score exists and new value is same or lower → keep existing
  - If score does not exist → create new record
- Cascade delete: deleting a user removes all their scores
- Top 20 query: `findMany` with `orderBy: { value: 'desc' }`, `take: 20`, filtered by gameSlug and optional difficulty
- Score with value 0 is valid (edge case)
- Negative values — allowed by schema (Int, not constrained to positive)

### Leaderboard (`leaderboard.test.ts`)

- Global query: all scores ordered by value desc, take 100, include user.name and game.title
- Multiple scores per user across different games
- Leaderboard returns empty array when no scores exist
- Leaderboard respects max 100 entries

### Schema Integrity (`schema.test.ts`)

- Required fields reject null/undefined
- `@updatedAt` field changes on record update
- Foreign key constraint: score with non-existent gameSlug or userId fails
- Default values are applied correctly (`published`, `difficulty`, `createdAt`)

## Implementation Notes

- Use `@prisma/client` directly (not the singleton from `@/lib/db`) to connect to the test container
- Set `DATABASE_URL` environment variable to Testcontainers-provided URL before creating PrismaClient
- Use `beforeAll` for container startup and `afterAll` for teardown
- Export typed Prisma client from `setup.ts` for use in all test files
- No external dependencies beyond `@testcontainers/postgresql` and `vitest`

## Future Scope (after refactor)

- Add query performance tests (index verification)
- Test views or materialized views if added
- Test migration rollback scenarios
