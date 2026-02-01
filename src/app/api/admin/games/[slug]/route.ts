import { NextResponse } from 'next/server';
import { getGames, saveGames, Game } from '@/lib/adminGames';
import { slugify } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const games: Game[] = await getGames();
  const game = games.find((g) => slugify(g.title) === slug);
  
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  
  return NextResponse.json(game);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const games: Game[] = await getGames();
    const index = games.findIndex((g) => slugify(g.title) === slug);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Update game
    games[index] = { ...games[index], ...body };
    await saveGames(games);
    
    return NextResponse.json({ success: true, game: games[index] });
  } catch (_) {
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const games: Game[] = await getGames();
    const filteredGames = games.filter((g) => slugify(g.title) !== slug);
    
    if (games.length === filteredGames.length) {
       return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    await saveGames(filteredGames);
    return NextResponse.json({ success: true });
  } catch (_) {
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
