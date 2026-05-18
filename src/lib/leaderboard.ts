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
