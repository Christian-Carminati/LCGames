
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SCORES_FILE = path.join(process.cwd(), 'src/data/scores.json');

async function getScores() {
  try {
    const data = await fs.promises.readFile(SCORES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveScores(scores: any) {
    await fs.promises.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2));
}

export async function GET() {
  const scores = await getScores();
  return NextResponse.json(scores);
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { gameSlug, scoreIndex } = body; // Using index for now as it's simplest if we trust the order hasn't changed between read and delete

        if (!gameSlug || scoreIndex === undefined) {
             return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const scores = await getScores();
        if (!scores[gameSlug]) {
             return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        // Remove the score at the specific index
        // We need to be careful about concurrent edits, but for this app it's low risk.
        // A better way would be passing the full score object to match.
        // Let's try to match by content if index seems risky, but JSON arrays are ordered.
        
        // Actually, if we pass the whole object {name, score, date}, we can filter it out.
        // But what if there are duplicates? The user might want to delete ONE of them.
        // Index is risky if the list changes.
        
        // Let's stick with index for now but maybe double check the content matches if provided?
        // Let's just use index for simplicity in this V1.
        
        scores[gameSlug].splice(scoreIndex, 1);
        
        // Clean up empty game keys? No need.
        
        await saveScores(scores);
        return NextResponse.json({ success: true });

    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete score' }, { status: 500 });
    }
}
