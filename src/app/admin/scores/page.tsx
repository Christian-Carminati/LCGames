import DeleteScoreButton from '@/components/DeleteScoreButton';
import ScoreControls from '@/components/admin/ScoreControls';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface Score {
  name: string;
  score: number;
  date: string;
}

interface ScoreData {
  [gameSlug: string]: Score[];
}

interface FlattenedScore extends Score {
  gameSlug: string;
  index: number;
  [key: string]: string | number; // For sorting access
}

async function getScores(): Promise<ScoreData> {
  const scoresPath = path.join(process.cwd(), 'src/data/scores.json');
  try {
    const data = await fs.promises.readFile(scoresPath, 'utf-8');
    return JSON.parse(data);
  } catch (_) {
    return {};
  }
}

export default async function AdminScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string; sort?: string; order?: string }>;
}) {
  const params = await searchParams;
  const scoresData = await getScores();
  const gameSlugs = Object.keys(scoresData);
  
  // Flatten scores
  let allScores: FlattenedScore[] = [];
  gameSlugs.forEach(gameSlug => {
      scoresData[gameSlug].forEach((score: Score, index: number) => {
          allScores.push({
              gameSlug,
              index,
              ...score
          });
      });
  });

  // Filter
  if (params.game) {
    allScores = allScores.filter(s => s.gameSlug === params.game);
  }

  // Sort
  if (params.sort) {
    const { sort, order = 'asc' } = params;
    allScores.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];

      // Handle numeric scores
      if (sort === 'score') {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  } else {
    // Default sort by date desc
    allScores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
              <th>{getSortLink('date')}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allScores.map((item, i) => (
                <tr key={`${item.gameSlug}-${item.index}-${i}`}>
                  <td>{item.gameSlug}</td>
                  <td>{item.name}</td>
                  <td>{item.score}</td>
                  <td>{item.date}</td>
                  <td>
                    <DeleteScoreButton gameSlug={item.gameSlug} scoreIndex={item.index} />
                  </td>
                </tr>
            ))}
            {allScores.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center">No scores found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
