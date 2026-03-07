
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/leaderboardUtils';

export async function GET() {
  const leaderboard = await getLeaderboard();
  return NextResponse.json(leaderboard);
}
