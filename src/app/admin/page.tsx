export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';

async function getStats() {
  try {
    const gamesCount = await prisma.game.count();
    const scoresCount = await prisma.score.count();
    return { gamesCount, scoresCount };
  } catch (e) {
     console.warn("Could not read stats from DB:", e);
     return { gamesCount: 0, scoresCount: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <h1 className="nes-text is-primary text-3xl">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="nes-container with-title is-rounded">
          <p className="title">Games</p>
          <div className="text-center">
             <span className="nes-text is-success text-4xl">{stats.gamesCount}</span>
             <p>Total Games</p>
          </div>
        </div>

        <div className="nes-container with-title is-rounded">
            <p className="title">Scores</p>
            <div className="text-center">
                <span className="nes-text is-warning text-4xl">{stats.scoresCount ?? 0}</span>
                <p>Total Scores Submitted</p>
            </div>
        </div>
      </div>
    </div>
  );
}
