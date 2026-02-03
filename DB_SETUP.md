# Database Setup

This project uses **PostgreSQL** (via Vercel or local Docker) and **Prisma**.

## 1. Prerequisites

- Node.js (v18+)
- Docker (for local DB) OR a Vercel Postgres instance

## 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Connect to your Vercel Postgres or Local Postgres
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/c64app?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/c64app?schema=public"

# NextAuth Secret
AUTH_SECRET="your-secret-key"
```

## 3. Local Development

1.  **Start DB**: If using local Docker:
    ```bash
    docker run --name c64-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=c64app -p 5432:5432 -d postgres
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Initialize Database**:
    ```bash
    npx prisma migrate dev --name init
    ```
4.  **Seed Data**:
    Migrates data from `games.json` to the database.
    ```bash
    node scripts/seed.js
    ```
5.  **Run Dev Server**:
    ```bash
    npm run dev
    ```

## 4. Admin Access

To access the Admin panel (`/admin`):
- Login with the admin credentials (configured in `.env` or hardcoded in `auth.ts` for now).
- Or leverage the new Database User model if implemented.

## 5. Deployment (Vercel)

1.  Connect your repo to Vercel.
2.  Add the Vercel Postgres integration.
3.  Vercel will automatically set `POSTGRES_PRISMA_URL` etc.
4.  Run `npx prisma migrate deploy` in the build command or post-install.
5.  Run the seed script manually or via a one-off task if needed.
