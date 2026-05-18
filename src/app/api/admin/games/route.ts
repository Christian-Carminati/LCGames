import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { GameSchema } from '@/lib/validations';
import { createGame, listGames } from '@/lib/games';
import { logAction } from '@/lib/audit';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const games = await listGames();
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    const result = GameSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.game.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'A game with this slug already exists' },
        { status: 409 }
      );
    }

    const { scoreConfig, difficultyConfig, palNtscConfig, ...gameFields } = data;
    const game = await createGame({
      slug,
      title: gameFields.title,
      description: gameFields.description,
      platform: gameFields.platform || 'C64 LC-Games',
      genre: gameFields.genre,
      imageUrl: gameFields.imageUrl || undefined,
      url: gameFields.url || undefined,
      romPath: gameFields.romPath,
      youtubeUrl: gameFields.youtubeUrl || undefined,
      published: gameFields.published ?? true,
      scoreConfig: scoreConfig as Prisma.InputJsonValue | undefined,
      difficultyConfig: difficultyConfig as Prisma.InputJsonValue | undefined,
      palNtscConfig: palNtscConfig as Prisma.InputJsonValue | undefined,
    } as any);

    await logAction({
      action: 'CREATE_GAME',
      entityType: 'Game',
      entityId: game.id,
      adminId: 'admin',
    });

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error("Failed to create game:", error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
