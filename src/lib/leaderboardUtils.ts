import { getLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';
import prisma from './db';

export type { LeaderboardEntry };

// Re-export from the new service
export { getLeaderboard };

// Legacy function kept for backward compatibility
export interface OldScoreEntry {
  name: string;
  score: string;
  pos: number;
  uploadedAt: string;
}

export async function saveScores(newScores: OldScoreEntry[], gameSlug: string = 'unknown'): Promise<OldScoreEntry[]> {
  console.warn("DB SaveScores called. Requires user ID relationship. Returning mock updated board.");
  const result = await getLeaderboard({});
  return result.entries.map(e => ({
    name: e.name,
    score: e.score.toString(),
    pos: e.pos,
    uploadedAt: e.uploadedAt,
  }));
}
