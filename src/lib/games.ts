import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

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
  scoreConfig: Prisma.JsonValue | null;
  difficultyConfig: Prisma.JsonValue | null;
  palNtscConfig: Prisma.JsonValue | null;
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
          scoreConfig: (scoreConfig ?? Prisma.DbNull) as Prisma.InputJsonValue,
          difficultyConfig: (difficultyConfig ?? Prisma.DbNull) as Prisma.InputJsonValue,
          palNtscConfig: (palNtscConfig ?? Prisma.DbNull) as Prisma.InputJsonValue,
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
