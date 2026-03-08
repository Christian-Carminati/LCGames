

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { generateScoreHash } from '@/lib/security';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const gameSlug = searchParams.get('gameSlug');
    const difficultyParam = searchParams.get('difficulty');

    if (!gameSlug) {
        return NextResponse.json({ error: 'Game slug required' }, { status: 400 });
    }

    const difficulty = difficultyParam !== null ? parseInt(difficultyParam, 10) : undefined;

    try {
        const scores = await prisma.score.findMany({
            where: { 
                gameSlug,
                ...(difficulty !== undefined ? { difficulty } : {})
            },
            orderBy: { value: 'desc' },
            take: 20,
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        email: true
                    }
                }
            }
        });

        // Map to expected format
        const formattedScores = (scores as any[]).map((s: any) => ({
            userId: s.userId, // keep userId available? Or maybe email. The frontend expects userId to match session email for highlighting.
            name: s.user.name || "Anonymous",
            score: s.value,
            date: s.updatedAt.toLocaleDateString('it-IT'),
            userImage: s.user.image
        }));

        return NextResponse.json(formattedScores);
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

        const expectedHash = generateScoreHash(score, gameSlug, difficulty);
        if (hash !== expectedHash) {
            console.warn(`[SECURITY] Invalid score hash from user ${session.user.email} for game ${gameSlug}`);
            return NextResponse.json({ error: 'Invalid score verification signature' }, { status: 403 });
        }

        const userEmail = session.user.email;
        const userName = session.user.name || "Anonymous";
        const userImage = session.user.image;

        // Ensure user exists (in case they logged in but DB record missing/outdated)
        // Upsert User
        const user = await prisma.user.upsert({
            where: { email: userEmail },
            update: {
                name: userName,
                image: userImage
            },
            create: {
                email: userEmail,
                name: userName,
                image: userImage
            }
        });

        // 1. Check existing score for this user+game+difficulty
        const existingScore = await prisma.score.findUnique({
            where: {
                userId_gameSlug_difficulty: {
                    userId: user.id,
                    gameSlug,
                    difficulty
                }
            }
        });

        if (existingScore) {
            if (score > existingScore.value) {
                // Update if higher
                await prisma.score.update({
                    where: { id: existingScore.id },
                    data: { value: score }
                });
            }
            // If lower, do nothing (Max Score logic)
        } else {
            // Create new
            await prisma.score.create({
                data: {
                    value: score,
                    difficulty,
                    userId: user.id,
                    gameSlug
                }
            });
        }

        // Return updated list (top 20) for same difficulty
        const newScores = await prisma.score.findMany({
            where: { gameSlug, difficulty },
            orderBy: { value: 'desc' },
            take: 20,
            include: {
                user: {
                   select: { name: true, image: true, email: true }
                }
            }
        });

         const formattedScores = (newScores as any[]).map((s: any) => ({
            userId: s.user?.email, // Frontend uses email to check "isMe" usually? Yes, session.user.email
            name: s.user.name || "Anonymous",
            score: s.value,
            date: s.updatedAt.toLocaleDateString('it-IT'),
            userImage: s.user.image
        }));

        return NextResponse.json(formattedScores);

    } catch (e) {
        console.error("Error saving score:", e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
