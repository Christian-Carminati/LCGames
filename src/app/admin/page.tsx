export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import Link from 'next/link';

async function getDashboardData() {
  try {
    const gamesCount = await prisma.game.count();
    const scoresCount = await prisma.score.count();
    
    // Fetch last 5 scores
    const rawScores = await prisma.score.findMany({
      take: 5,
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    // Map games to display titles
    const games = await prisma.game.findMany({
      select: { slug: true, title: true }
    });
    const gameMap = new Map(games.map(g => [g.slug, g.title]));

    const recentScores = rawScores.map(s => ({
      id: s.id,
      gameTitle: gameMap.get(s.gameSlug) || s.gameSlug,
      name: s.user?.name || 'Anonymous',
      score: Number(s.value),
      date: new Date(s.createdAt).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' })
    }));

    return { gamesCount, scoresCount, recentScores };
  } catch (e) {
     console.warn("Could not read dashboard data from DB:", e);
     return { gamesCount: 0, scoresCount: 0, recentScores: [] };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b-4 border-white pb-4">
        <h1 className="nes-text is-primary text-2xl md:text-3xl m-0">Dashboard</h1>
        <span className="nes-badge"><span className="is-success text-xs font-bold">SYSTEM: ONLINE</span></span>
      </div>
      
      {/* 3-Column Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="nes-container with-title is-rounded bg-gray-900 border-2">
          <p className="title text-sm">Games</p>
          <div className="text-center py-2">
             <span className="nes-text is-success text-3xl font-bold">{data.gamesCount}</span>
             <p className="text-xs text-gray-400 mt-2">Archived Titles</p>
          </div>
        </div>

        <div className="nes-container with-title is-rounded bg-gray-900 border-2">
            <p className="title text-sm">Scores</p>
            <div className="text-center py-2">
                <span className="nes-text is-warning text-3xl font-bold">{data.scoresCount}</span>
                <p className="text-xs text-gray-400 mt-2">Total High Scores</p>
            </div>
        </div>

        <div className="nes-container with-title is-rounded bg-gray-900 border-2">
            <p className="title text-sm">Server Info</p>
            <div className="text-center py-2">
                <span className="nes-text is-primary text-lg font-bold">LC Arcade</span>
                <p className="text-xs text-gray-400 mt-2">Active Session</p>
            </div>
        </div>
      </div>

      {/* Recent Scores Activity Terminal */}
      <div className="nes-container with-title is-dark">
        <p className="title text-sm text-yellow-400">★ Recent High Scores ★</p>
        <div className="nes-table-responsive">
          <table className="nes-table is-bordered is-dark w-full text-xs">
            <thead>
              <tr className="text-yellow-400">
                <th>Game</th>
                <th>Player</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentScores.map((item) => (
                <tr key={item.id}>
                  <td>{item.gameTitle}</td>
                  <td>{item.name}</td>
                  <td>{item.score.toLocaleString()}</td>
                  <td>{item.date}</td>
                </tr>
              ))}
              {data.recentScores.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500">No activity logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Access Actions Deck */}
      <div className="nes-container with-title is-rounded bg-gray-900 border-2">
        <p className="title text-sm">Quick Actions</p>
        <div className="flex flex-wrap gap-4 justify-start">
          <Link href="/admin/games/new" className="nes-btn is-success text-xs">+ Add Game</Link>
          <Link href="/admin/games" className="nes-btn is-primary text-xs">Manage Games</Link>
          <Link href="/admin/scores" className="nes-btn is-warning text-xs">Manage Scores</Link>
          <Link href="/admin/audit" className="nes-btn is-error text-xs">View Logs</Link>
        </div>
      </div>
    </div>
  );
}
