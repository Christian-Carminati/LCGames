
import { NextResponse } from 'next/server';
import { getGames, addGame } from '@/lib/adminGames';

export async function GET() {
  const games = await getGames();
  return NextResponse.json(games);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate body?
    if (!body.title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    await addGame(body);
    return NextResponse.json({ success: true, game: body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
