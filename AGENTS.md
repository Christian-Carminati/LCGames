# AGENTS.md - Development Guidelines for LCGames

LCGames is a Next.js 16 app with React 19, TypeScript, Tailwind CSS v4, Prisma ORM, and Playwright for testing.

## Commands

```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # TypeScript type check

# Testing
npx playwright test              # Run all tests
npx playwright test tests/e2e.spec.ts           # Single test file
npx playwright test --grep "test name"          # Tests matching pattern
npx playwright test --grep "test name" --headed # Visible browser

# Database
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npm run db:backup      # Backup database
```

## Code Style

### TypeScript
- Always use explicit types for parameters and returns
- Enable strict mode - do not disable strict checks
- Use `interface` for objects, `type` for unions/intersections
- Avoid `any` - use `unknown` when type is unknown
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Naming
- **Components**: PascalCase (`GameCard`, `LeaderboardTable`)
- **Hooks**: camelCase with "use" prefix (`useGameState`)
- **Utilities**: camelCase (`formatScore`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_SCORE`)
- **Files**: kebab-case for utils, PascalCase for components

### Imports
Use `@/` prefix for src-relative imports:
```typescript
import { useState } from 'react';
import Link from 'next/link';
import { GameCard } from '@/components/GameCard';
import { useAuth } from '@/hooks/useAuth';
import { formatScore } from '@/lib/utils';
import type { Game } from '@/types';
```

### Components

#### Server vs Client
Default to Server Components. Add "use client" only when using:
- React hooks (useState, useEffect, useRef)
- Browser APIs (window, document)
- Event handlers (onClick, onChange)

```typescript
// Server Component
export default function GamePage({ params }: { params: { slug: string } }) {
  const game = await getGame(params.slug);
  return <GameCard game={game} />;
}

// Client Component
'use client';
export function ScoreInput() {
  const [score, setScore] = useState(0);
  return <input value={score} onChange={(e) => setScore(+e.target.value)} />;
}
```

### Error Handling

```typescript
// API Routes
export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// Client-Side
async function submitScore(score: number) {
  try {
    const response = await fetch('/api/scores', { method: 'POST', body: JSON.stringify({ score }) });
    if (!response.ok) throw new Error('Failed to submit score');
    return await response.json();
  } catch (error) {
    console.error('Score submission failed:', error);
    alert('Failed to submit score. Please try again.');
  }
}
```

### CSS (Tailwind CSS v4)
- Use utility classes, avoid custom CSS
- Keep custom styles in `globals.css`

```tsx
// Good
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

### Database (Prisma)
- Use Prisma Client for all DB operations
- Include proper error handling
- Run `npx prisma generate` after schema changes

### Testing
- Place tests in `/tests` directory
- Use Playwright for E2E tests
- Test critical flows: auth, game loading, score submission, leaderboard updates, admin operations

### File Organization
```
src/
├── app/          # Next.js App Router pages
│   ├── api/      # API routes
│   ├── admin/    # Admin pages
│   └── games/    # Game pages
├── components/   # Reusable React components
├── hooks/        # Custom React hooks
├── lib/          # Utilities and helpers
├── data/         # Data access layer
└── context/      # React context providers
```

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Access via `process.env.VARIABLE_NAME`
- Prefix with `NEXT_PUBLIC_` only if needed client-side
