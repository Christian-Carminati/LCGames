import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { GameSchema } from '@/lib/validations';
import { getGameBySlug, updateGame, deleteGame } from '@/lib/games';
import { logAction } from '@/lib/audit';
import type { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const params = await props.params;
  try {
    const game = await getGameBySlug(params.slug);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const params = await props.params;
  try {
    const body = await request.json();

    const result = GameSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.game.findUnique({ where: { slug: params.slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const { scoreConfig, difficultyConfig, palNtscConfig, ...gameFields } = result.data;
    const updated = await updateGame(params.slug, {
      title: gameFields.title,
      description: gameFields.description,
      platform: gameFields.platform,
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

    if (updated) {
      await logAction({
        action: 'UPDATE_GAME',
        entityType: 'Game',
        entityId: updated.id,
        adminId: 'admin',
      });
    }

    return NextResponse.json({ success: true, game: updated });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const params = await props.params;
  try {
    await deleteGame(params.slug);
    await logAction({
      action: 'DELETE_GAME',
      entityType: 'Game',
      entityId: params.slug,
      adminId: 'admin',
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
