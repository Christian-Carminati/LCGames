import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { GameSchema } from '@/lib/validations';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const games = await prisma.game.findMany({
      orderBy: { title: 'asc' }
    });
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

    const newGame = await prisma.game.create({
      data: {
        slug,
        title: data.title,
        description: data.description,
        platform: data.platform || 'C64',
        genre: data.genre,
        imageUrl: data.imageUrl || undefined,
        url: data.url || undefined,
        romPath: data.romPath,
        youtubeUrl: data.youtubeUrl || undefined,
        scoreConfig: data.scoreConfig as Prisma.InputJsonValue | undefined,
        difficultyConfig: data.difficultyConfig as Prisma.InputJsonValue | undefined,
        palNtscConfig: data.palNtscConfig as Prisma.InputJsonValue | undefined
      }
    });

    return NextResponse.json({ success: true, game: newGame });
  } catch (error) {
    console.error("Failed to create game:", error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
