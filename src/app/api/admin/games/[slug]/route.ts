import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

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
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const params = await props.params;
  try {
    const { slug } = params;
    const body = await request.json();
    
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
