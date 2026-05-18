import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { verifyScoreHash } from '@/lib/security';
import { getTopScores, upsertScore } from '@/lib/scores';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const gameSlug = searchParams.get('gameSlug');
    const difficultyParam = searchParams.get('difficulty');
    const cursor = searchParams.get('cursor') || undefined;
    const limitParam = searchParams.get('limit');

    if (!gameSlug) {
        return NextResponse.json({ error: 'Game slug required' }, { status: 400 });
    }

    const difficulty = difficultyParam !== null ? parseInt(difficultyParam, 10) : undefined;
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;

    try {
        const result = await getTopScores({ gameSlug, difficulty, cursor, limit });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching scores:", error);
        return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { gameSlug, score, difficulty = 0, hash } = body;

        if (!gameSlug || typeof score !== 'number') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const isValid = verifyScoreHash(score, gameSlug, difficulty, hash);
        if (!isValid) {
            console.warn(`[SECURITY] Invalid score hash from user ${session.user.email} for game ${gameSlug}`);
            return NextResponse.json({ error: 'Invalid score verification signature' }, { status: 403 });
        }

        const user = await prisma.user.upsert({
            where: { email: session.user.email },
            update: { name: session.user.name || "Anonymous", image: session.user.image },
            create: { email: session.user.email, name: session.user.name || "Anonymous", image: session.user.image },
        });

        const result = await upsertScore({
            userId: user.id,
            gameSlug,
            value: score,
            difficulty,
            hash,
        });

        return NextResponse.json(result);

    } catch (e) {
        console.error("Error saving score:", e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
