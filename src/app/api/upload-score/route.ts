
import { NextRequest, NextResponse } from 'next/server';
import { extractScoresFromD64 } from '@/lib/d64Utils';
import { saveScores } from '@/lib/leaderboardUtils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract scores
    const extractedScores = extractScoresFromD64(buffer);

    if (extractedScores.length === 0) {
        return NextResponse.json({ message: 'No scores found or parse error' }, { status: 400 });
    }

    // Save to global leaderboard
    const updatedLeaderboard = await saveScores(extractedScores);

    return NextResponse.json({ 
        success: true, 
        message: 'Scores processed successfully',
        newScores: extractedScores,
        leaderboard: updatedLeaderboard
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
