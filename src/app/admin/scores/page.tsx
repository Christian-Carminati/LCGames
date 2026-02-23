import prisma from '@/lib/db';
import Link from 'next/link';
import DeleteScoreButton from '@/components/DeleteScoreButton';
import ScoreControls from '@/components/admin/ScoreControls';
import { EditDifficultyDropdown } from '@/components/admin/EditDifficultyDropdown';

export const dynamic = 'force-dynamic';

export default async function AdminScoresPage(props: {
  searchParams: Promise<{ game?: string; sort?: string; order?: string }>;
}) {
  const params = await props.searchParams;
  
  // Fetch all scores with user data
  const rawScores = await prisma.score.findMany({
    include: {
        user: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Transform to flat format suitable for table and sorting
  let allScores = rawScores.map(s => ({
      id: s.id,
      gameSlug: s.gameSlug,
      name: s.user.name || 'Anonymous',
      score: s.value,
      difficulty: s.difficulty,
      date: s.createdAt.toLocaleDateString(),
      createdAt: s.createdAt.getTime() // Helper for sort
  }));

  // Filter
  if (params.game) {
    allScores = allScores.filter(s => s.gameSlug === params.game);
  }

  // Sort
  if (params.sort) {
    const { sort, order = 'asc' } = params;
    allScores.sort((a, b) => {
      // @ts-ignore - dynamic sort key access
      let valA = a[sort];
      // @ts-ignore
      let valB = b[sort];
      
      if (sort === 'score') {
          valA = Number(valA);
          valB = Number(valB);
      }
      
      // Special case for date if we want actual time sort
      if (sort === 'date') {
          valA = a.createdAt;
          valB = b.createdAt;
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const getSortLink = (key: string) => {
    const isActive = params.sort === key;
    const currentOrder = params.order === 'asc' ? 'asc' : 'desc';
    const nextOrder = isActive && currentOrder === 'desc' ? 'asc' : 'desc';
    
    // Build new query params
    const qp = new URLSearchParams();
    if (params.game) qp.set('game', params.game);
    qp.set('sort', key);
    qp.set('order', nextOrder);
    
    const arrow = isActive ? (currentOrder === 'asc' ? ' ▲' : ' ▼') : '';
    
    return (
      <Link href={`/admin/scores?${qp.toString()}`} className="text-yellow-400 hover:text-white">
        {key.charAt(0).toUpperCase() + key.slice(1)} {arrow}
      </Link>
    );
  };
  
  // Get unique game slugs for filter
  const gameSlugs = Array.from(new Set(rawScores.map(s => s.gameSlug))).sort();

  return (
    <div className="space-y-4">
      <h1 className="nes-text is-primary text-2xl mb-6">Scores Management</h1>

      <ScoreControls games={gameSlugs} />

      <div className="nes-table-responsive">
        <table className="nes-table is-bordered is-dark w-full">
          <thead>
            <tr>
              <th>{getSortLink('gameSlug')}</th>
              <th>{getSortLink('name')}</th>
              <th>{getSortLink('score')}</th>
              <th>{getSortLink('difficulty')}</th>
              <th>{getSortLink('date')}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allScores.map((item) => (
                <tr key={item.id}>
                  <td>{item.gameSlug}</td>
                  <td>{item.name}</td>
                  <td>{item.score}</td>
                  <td>
                    <EditDifficultyDropdown scoreId={item.id} initialDifficulty={item.difficulty} />
                  </td>
                  <td>{item.date}</td>
                  <td>
                    <DeleteScoreButton scoreId={item.id} />
                  </td>
                </tr>
            ))}
            {allScores.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center">No scores found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
