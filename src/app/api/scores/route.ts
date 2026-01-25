
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper to get the path to the scores file
// In production (Vercel), this won't persist writes, but works for demo/local.
const SCORES_FILE = path.join(process.cwd(), 'src/data/scores.json');

async function getScores() {
    try {
        const data = await fs.readFile(SCORES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or error, return empty object
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
    
    // Sort by score descending and take top 10
    const topScores = gameScores
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 10);

    return NextResponse.json(topScores);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { gameSlug, name, score } = body;

        if (!gameSlug || !name || typeof score !== 'number') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const allScores = await getScores();
        if (!allScores[gameSlug]) {
            allScores[gameSlug] = [];
        }

        const newScore = {
            name: name.toUpperCase().slice(0, 10),
            score,
            date: new Date().toLocaleDateString()
        };

        allScores[gameSlug].push(newScore);
        await saveScores(allScores);

        // Return updated top scores
        const topScores = allScores[gameSlug]
             .sort((a: any, b: any) => b.score - a.score)
             .slice(0, 10);

        return NextResponse.json(topScores);

    } catch (e) {
        console.error("Error saving score:", e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
