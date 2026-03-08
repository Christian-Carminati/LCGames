import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const { slug } = params;
  
  try {
    const game = await prisma.game.findUnique({
      where: { slug }
    });
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  try {
    const { slug } = params;
    const body = await request.json();
    
    // Check exist
    const existing = await prisma.game.findUnique({ where: { slug } });
    if (!existing) {
       return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const updated = await prisma.game.update({
      where: { slug },
      data: {
        title: body.title,
        description: body.description,
        platform: body.platform,
        genre: body.genre,
        imageUrl: body.imageUrl,
        url: body.url,
        romPath: body.romPath,
        youtubeUrl: body.youtubeUrl || null,
        scoreConfig: body.scoreConfig ? body.scoreConfig : undefined,
        difficultyConfig: body.difficultyConfig !== undefined ? body.difficultyConfig : undefined
      }
    });

    return NextResponse.json({ success: true, game: updated });
  } catch (error) {
     console.error("Update error:", error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  try {
    const { slug } = params;
    
    // Use transaction to ensure cascade delete behavior if not set in DB
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
