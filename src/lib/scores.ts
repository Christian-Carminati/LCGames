import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';

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
