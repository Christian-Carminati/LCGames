export const runtime = "edge";

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { title: 'asc' }
    });
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Auto-generate slug if not provided/derived
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newGame = await prisma.game.create({
      data: {
        slug,
        title: body.title,
        description: body.description,
        platform: body.platform || "C64",
        genre: body.genre,
        imageUrl: body.imageUrl,
        url: body.url,
        romPath: body.romPath,
        youtubeUrl: body.youtubeUrl || null,
        scoreConfig: body.scoreConfig ? body.scoreConfig : undefined,
        difficultyConfig: body.difficultyConfig !== undefined ? body.difficultyConfig : undefined
      }
    });

    return NextResponse.json({ success: true, game: newGame });
  } catch (error) {
    console.error("Failed to create game:", error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
