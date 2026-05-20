import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { GameSchema } from '@/lib/validations';
import type { Prisma } from '@prisma/client';
import crypto from 'crypto';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const params = await props.params;
  const { slug } = params;
  
  try {
    const game = await prisma.game.findUnique({
      where: { slug },
      include: { GameConfig: true }
    });
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    const mappedGame = {
      ...game,
      scoreConfig: game.GameConfig?.scoreConfig,
      difficultyConfig: game.GameConfig?.difficultyConfig,
      palNtscConfig: game.GameConfig?.palNtscConfig
    };
    
    return NextResponse.json(mappedGame);
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
    const { slug } = params;
    const body = await request.json();

    const result = GameSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.game.findUnique({ where: { slug } });
    if (!existing) {
       return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const updated = await prisma.game.update({
      where: { slug },
      data: {
        title: result.data.title,
        description: result.data.description,
        platform: result.data.platform,
        genre: result.data.genre,
        imageUrl: result.data.imageUrl || undefined,
        url: result.data.url || undefined,
        romPath: result.data.romPath,
        youtubeUrl: result.data.youtubeUrl || undefined,
        published: result.data.published ?? true,
        GameConfig: {
          upsert: {
            create: {
              id: crypto.randomUUID(),
              scoreConfig: result.data.scoreConfig as Prisma.InputJsonValue | undefined,
              difficultyConfig: result.data.difficultyConfig as Prisma.InputJsonValue | undefined,
              palNtscConfig: result.data.palNtscConfig as Prisma.InputJsonValue | undefined,
              updatedAt: new Date()
            },
            update: {
              scoreConfig: result.data.scoreConfig as Prisma.InputJsonValue | undefined,
              difficultyConfig: result.data.difficultyConfig as Prisma.InputJsonValue | undefined,
              palNtscConfig: result.data.palNtscConfig as Prisma.InputJsonValue | undefined,
              updatedAt: new Date()
            }
          }
        }
      },
      include: {
        GameConfig: true
      }
    });

    const mappedGame = {
      ...updated,
      scoreConfig: updated.GameConfig?.scoreConfig,
      difficultyConfig: updated.GameConfig?.difficultyConfig,
      palNtscConfig: updated.GameConfig?.palNtscConfig
    };

    return NextResponse.json({ success: true, game: mappedGame });
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
    const { slug } = params;
    
    await prisma.$transaction([
        prisma.score.deleteMany({
            where: { gameSlug: slug }
        }),
        prisma.game.delete({
            where: { slug }
        })
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
