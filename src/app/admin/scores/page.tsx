import prisma from '@/lib/db';
import Link from 'next/link';
import DeleteScoreButton from '@/components/DeleteScoreButton';
import ScoreControls from '@/components/admin/ScoreControls';
import { EditDifficultyDropdown } from '@/components/admin/EditDifficultyDropdown';
import PaginationControls from '@/components/admin/PaginationControls';

export const dynamic = 'force-dynamic';

export default async function AdminScoresPage(props: {
  searchParams: Promise<{ game?: string; sort?: string; order?: string; page?: string }>;
}) {
  const params = await props.searchParams;
  
  // Fetch games for configs
  const games = await prisma.game.findMany({
      select: {
          slug: true,
          title: true,
          GameConfig: {
              select: {
                  difficultyConfig: true,
                  palNtscConfig: true
              }
          }
      }
  });
  const gamesMapped = games.map(g => ({
      slug: g.slug,
      title: g.title,
      difficultyConfig: g.GameConfig?.difficultyConfig,
      palNtscConfig: g.GameConfig?.palNtscConfig
  }));
  const gameMap = new Map(gamesMapped.map(g => [g.slug, g]));

  // Fetch all scores with user data
  const rawScores = await prisma.score.findMany({
    include: {
        user: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Transform to flat format
  let allScores = (rawScores as any[]).map((s: any) => {
      const gameInfo = gameMap.get(s.gameSlug);
      const hasPalNtsc = !!gameInfo?.palNtscConfig;
      const difficultyConfig = gameInfo?.difficultyConfig as { numLevels?: number } | null;
      const numDifficultyLevels = difficultyConfig?.numLevels || 1;
      const maxLevels = Math.max(1, numDifficultyLevels);
      
      let videoSystem = '-';
      if (hasPalNtsc) {
          const sysIdx = Math.floor(s.difficulty / maxLevels);
          videoSystem = sysIdx === 0 ? 'PAL' : 'NTSC';
      }

      return {
          id: s.id,
          gameSlug: s.gameSlug,
          gameTitle: gameInfo?.title || s.gameSlug,
          name: s.user?.name || 'Anonymous',
          score: Number(s.value),
          difficulty: s.difficulty,
          videoSystem,
          date: new Date(s.createdAt).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' }),
          createdAt: new Date(s.createdAt).getTime()
      };
  });

  // Filter
  if (params.game) {
    allScores = allScores.filter((s: any) => s.gameSlug === params.game);
  }

  // Sort
  if (params.sort) {
    const sortField = params.sort as string;
    const isAsc = params.order === 'asc';
    
    allScores.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'score') {
        valA = Number(valA);
        valB = Number(valB);
      } else if (sortField === 'date') {
        valA = a.createdAt;
        valB = b.createdAt;
      }
      
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const itemsPerPage = 20;
  const currentPageParams = parseInt(params.page || '1', 10);
  const currentPage = isNaN(currentPageParams) || currentPageParams < 1 ? 1 : currentPageParams;
  const totalItems = allScores.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Ensure current page is valid
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const pagedScores = allScores.slice(startIndex, startIndex + itemsPerPage);

  const getSortLink = (key: string, label?: string) => {
    const isActive = params.sort === key;
    const currentOrder = params.order === 'asc' ? 'asc' : 'desc';
    const nextOrder = isActive && currentOrder === 'desc' ? 'asc' : 'desc';
    
    const qp = new URLSearchParams();
    if (params.game) qp.set('game', params.game);
    qp.set('sort', key);
    qp.set('order', nextOrder);
    
    const arrow = isActive ? (currentOrder === 'asc' ? ' ▲' : ' ▼') : '';
    const displayLabel = label || (key.charAt(0).toUpperCase() + key.slice(1));
    
    return (
      <Link href={`/admin/scores?${qp.toString()}`} className="text-yellow-400 hover:text-white">
        {displayLabel} {arrow}
      </Link>
    );
  };
  
  const uniqueGameSlugs = Array.from(new Set((rawScores as any[]).map((s: any) => s.gameSlug))).sort();
  const gameOptions = uniqueGameSlugs.map(slug => ({
    slug,
    title: gameMap.get(slug)?.title || slug
  }));

  return (
    <div className="space-y-4">
      <h1 className="nes-text is-primary text-2xl mb-6">Scores Management</h1>

      <ScoreControls games={gameOptions} />

      <div className="nes-table-responsive">
        <table className="nes-table is-bordered is-dark w-full">
          <thead>
            <tr>
              <th>{getSortLink('gameTitle', 'Game')}</th>
              <th>{getSortLink('name', 'Player')}</th>
              <th>{getSortLink('score')}</th>
              <th>{getSortLink('difficulty')}</th>
              <th>{getSortLink('videoSystem', 'Video System')}</th>
              <th>{getSortLink('date')}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedScores.map((item: any) => {
                const gameInfo = gameMap.get(item.gameSlug);
                const hasPalNtsc = !!gameInfo?.palNtscConfig;
                const difficultyConfig = gameInfo?.difficultyConfig as { numLevels?: number } | null;
                const numDifficultyLevels = difficultyConfig?.numLevels || 1;

                return (
                <tr key={item.id}>
                  <td>{item.gameTitle}</td>
                  <td>{item.name}</td>
                  <td>{item.score}</td>
                  <EditDifficultyDropdown 
                      scoreId={item.id} 
                      initialDifficulty={item.difficulty} 
                      hasPalNtsc={hasPalNtsc}
                      numDifficultyLevels={numDifficultyLevels}
                  />
                  <td>{item.date}</td>
                  <td>
                    <DeleteScoreButton scoreId={item.id} />
                  </td>
                </tr>
                );
            })}
            {pagedScores.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center">No scores found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls 
        currentPage={validCurrentPage} 
        totalPages={totalPages} 
        totalItems={totalItems} 
      />
    </div>
  );
}
