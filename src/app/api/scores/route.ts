

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from '@/auth';

// Helper to get the path to the scores file
const SCORES_FILE = path.join(process.cwd(), 'src/data/scores.json');

async function getScores() {
    try {
        const data = await fs.readFile(SCORES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function saveScores(scores: any) {
    try {
        await fs.mkdir(path.dirname(SCORES_FILE), { recursive: true });
        await fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2));
    } catch (error) {
        console.error("Failed to save scores:", error);
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const gameSlug = searchParams.get('gameSlug');

    if (!gameSlug) {
        return NextResponse.json({ error: 'Game slug required' }, { status: 400 });
    }

    const allScores = await getScores();
    const gameScores = allScores[gameSlug] || [];
    
    // Sort by score descending and take top 20 for API return
    const topScores = gameScores
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 20);

    return NextResponse.json(topScores);
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { gameSlug, score } = body;

        if (!gameSlug || typeof score !== 'number') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const allScores = await getScores();
        if (!allScores[gameSlug]) {
            allScores[gameSlug] = [];
        }

        const userEmail = session.user.email;
        const userName = session.user.name || "Anonymous";
        const userImage = session.user.image;

        // Check if user already has a score
        const existingScoreIndex = allScores[gameSlug].findIndex((s: any) => s.userId === userEmail);

        if (existingScoreIndex !== -1) {
            // Update if new score is higher
            if (score > allScores[gameSlug][existingScoreIndex].score) {
                allScores[gameSlug][existingScoreIndex].score = score;
                allScores[gameSlug][existingScoreIndex].date = new Date().toLocaleDateString();
                allScores[gameSlug][existingScoreIndex].name = userName; // Update name in case it changed
                if (userImage) allScores[gameSlug][existingScoreIndex].userImage = userImage;
            } else {
                 // Do nothing if score is not higher (or maybe just update date?)
                 // Keeping it strictly "High Score" means we don't change it.
            }
        } else {
             // New entry
            allScores[gameSlug].push({
                userId: userEmail,
                name: userName,
                score,
                date: new Date().toLocaleDateString(),
                userImage
            });
        }
        
        // Sort
        allScores[gameSlug] = allScores[gameSlug].sort((a: any, b: any) => b.score - a.score);

        // Save All (or limit to a reasonable number to prevent infinite growth, e.g. 100? or just keep all)
        // User asked "backend keeps 20". I will slice to 20 to strictly follow the request.
        allScores[gameSlug] = allScores[gameSlug].slice(0, 20);

        await saveScores(allScores);

        return NextResponse.json(allScores[gameSlug]);

    } catch (e) {
        console.error("Error saving score:", e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
