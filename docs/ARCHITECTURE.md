# System Architecture

## Technology Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [NES.css](https://nostalgic-css.github.io/NES.css/) (Retro 8-bit style)
- **Deployment target**: Vercel / Node.js Server

## Frontend
- **Components**: Located in `src/components`. Key components:
    - `Emulator.tsx`: Wraps the EmulatorJS logic via iframe/window messaging.
    - `GameCard.tsx`: Displays game metadata in the library.
- **Pages**:
    - `/` (Home): Retro boot sequence intro.
    - `/games`: Main library with filtering.
    - `/leaderboard`: High score tables.
    - `/admin`: Dashboard for game/score stats.

## Backend (API Functions)
- **`/api/leaderboard`**: Returns the global leaderboard data.
- **`/api/upload-score`**: Handles `.d64` save file uploads, parses them for high scores, and updates the leaderboard.
    - **Logic**: Uses `src/lib/d64Utils.ts` to inspect the Commodore 64 disk images.

## Data Persistence & Limitations
> [!WARNING]
> **Current Storage**: The application currently uses **local JSON files** for storage (`src/data/leaderboard.json`, `src/data/scores.json`).

- **Issue**: In ephemeral environments (like Vercel functions or standard container deployments), the local filesystem is **not persistent**. Valid writes will be lost upon the next deployment or instance recycle.
- **Symptom**: "Only my user works" - because the data is saved only on the local machine where the dev server is running.
- **Recommendation**: Integrate a proper database (PostgreSQL, Supabase, MongoDB, or Vercel KV) to persistently store user scores and leaderboard entries.

## Emulator Integration
- Uses **EmulatorJS**.
- The emulator runs in an isolated `iframe` (`public/emulator.html`).
- **Communication**: The React app communicates with the emulator via `postMessage`.
    - **Score Extraction**: The emulator frame monitors C64 RAM (WASM heap) for specific memory addresses defined in `games.json` to detect score changes or extract save files.
