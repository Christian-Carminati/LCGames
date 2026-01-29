import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/leaderboardUtils';

export async function GET() {
  const leaderboard = getLeaderboard();
  return NextResponse.json(leaderboard);
}
