# LC-Games C64 Archive - Project Context

## Project Overview

A **Next.js 15** web application that serves as a Commodore 64 retro game archive. The project features:

- **Browser-based C64 emulation** via EmulatorJS embedded in an iframe
- **RAM-based high-score extraction** - reads score values directly from the emulator's WASM memory heap
- **User authentication** via NextAuth (Google OAuth provider)
- **PostgreSQL database** with Prisma ORM for persistent score storage
- **Retro 8-bit UI** styled with NES.css and Tailwind CSS

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + NES.css |
| Database | PostgreSQL (via Neon or Docker) |
| ORM | Prisma 7 with Accelerate extension |
| Auth | NextAuth 5 (Google provider) |
| Testing | Playwright |
| Deployment | Vercel / Node.js |

## Project Structure

```
LCGames/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           # Admin dashboard
│   │   ├── api/             # API routes (Edge runtime)
│   │   │   ├── scores/      # Score CRUD operations
│   │   │   ├── leaderboard/ # Global leaderboard data
│   │   │   └── upload-score # D64 save file uploads
│   │   ├── games/           # Game library pages
│   │   ├── leaderboard/     # High score tables
│   │   ├── login/           # Auth pages
│   │   └── page.tsx         # Home page (retro boot screen)
│   ├── components/          # React components
│   │   ├── Emulator.tsx     # EmulatorJS iframe wrapper
│   │   ├── ScoreBoard.tsx   # Score submission & leaderboard
│   │   ├── GameCard.tsx     # Game display component
│   │   └── ...
│   ├── context/             # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   │   ├── db.ts            # Prisma client singleton
│   │   ├── d64Utils.ts      # C64 disk image parsing
│   │   ├── leaderboardUtils.ts
│   │   └── security.ts      # Score hash generation
│   └── auth.ts              # NextAuth configuration
├── prisma/
│   └── schema.prisma        # Database schema (User, Game, Score, etc.)
├── public/
│   └── emulator.html        # EmulatorJS host page with score extraction logic
├── tests/                   # Playwright E2E tests
├── scripts/                 # Utility scripts (e.g., db backup)
└── docker-compose.yml       # Local PostgreSQL development
```

## Building and Running

### Prerequisites
- Node.js 20+
- npm (or yarn/pnpm/bun)
- Docker (optional, for local database)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Opens at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm run start
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:backup` | Backup database (via `scripts/backup-db.ts`) |
| `npx playwright test` | Run E2E tests |

## Database Configuration

### Local Development (Docker)
```bash
docker-compose up -d
```
This starts PostgreSQL on port 5432 with:
- Database: `c64games`
- User: `myuser`
- Password: `mypassword`

### Environment Variables
Required in `.env`:
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/c64games"
# Or for Vercel/Neon:
# DATABASE_URL="postgresql://..."
# PRISMA_DATABASE_URL="prisma://..."  # For Accelerate

NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (for NextAuth)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Prisma Commands
```bash
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations (development)
npx prisma migrate deploy # Run migrations (production)
npx prisma studio        # Open database GUI
```

## Testing

### Playwright E2E Tests
```bash
npx playwright test
```

Tests run against a dev server on **port 3002** (configured in `playwright.config.ts`).

Test files:
- `tests/e2e.spec.ts` - General end-to-end tests
- `tests/admin.spec.ts` - Admin dashboard tests

## Key Architecture Details

### Score Extraction System
The application reads high scores directly from C64 emulator memory:

1. **Configuration**: Each game defines `scoreConfig` with:
   - `address`: Memory address (hex) where score is stored
   - `type`: Data format (`byte`, `int`, `bcd`, `string`)
   - `length`: Number of bytes to read
   - `endianness`: Byte order (default: `big`)

2. **Extraction Flow**:
   - `public/emulator.html` runs a script that locates the C64 RAM in the WASM heap
   - Every second, it reads the configured address and decodes the value
   - Score data is sent to React via `postMessage`
   - User submits via `ScoreBoard.tsx` component

3. **Debugging**: Admin users can use the "Memory Hunter" tool in the Emulator component to search for score addresses

### API Routes
All API routes use **Edge runtime** for optimal performance:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/scores` | GET | Fetch scores for a game (supports `?difficulty=`) |
| `/api/scores` | POST | Submit a new score |
| `/api/leaderboard` | GET | Global leaderboard data |
| `/api/upload-score` | POST | Upload D64 save file for parsing |
| `/api/auth/[...nextauth]` | ALL | NextAuth endpoints |

### Security
- Score submissions include a hash generated by `generateScoreHash()` (`src/lib/security.ts`)
- COOP/COEP headers configured in `next.config.ts` for emulator isolation
- Unique constraint on scores: one high score per user/game/difficulty

### Styling Conventions
- Uses **NES.css** for 8-bit retro components (`.nes-btn`, `.nes-container`, etc.)
- Custom font: **Press Start 2P** (configured in `layout.tsx`)
- CRT scanline effect overlay (`.crt-scanline`)
- Tailwind CSS for layout and utility classes

## Development Conventions

### TypeScript
- Strict mode enabled (`tsconfig.json`)
- Path alias: `@/*` → `./src/*`
- No emit (Next.js handles compilation)

### ESLint
- Config: `eslint-config-next` with TypeScript support
- Config file: `eslint.config.mjs`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

### Code Style
- React Server Components by default (use `'use client'` for client components)
- Functional components with TypeScript interfaces for props
- Async/await for data fetching in Server Components

## Deployment

### Vercel
1. Push to Git repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker
```bash
docker build -t lc-games .
docker run -p 3000:3000 --env-file .env lc-games
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Score shows 0 | Memory address may be wrong; use Memory Hunter to find correct address |
| Sync Failed | Check `/api/scores` route for 500 errors |
| Only local user works | Database not configured; ensure `DATABASE_URL` is set |
| Emulator not loading | Check COOP/COEP headers in `next.config.ts` |

## Related Documentation
- `SCORE_SYSTEM.md` - Detailed score extraction configuration guide
- `docs/ARCHITECTURE.md` - System architecture overview
- `README.md` - Getting started guide
