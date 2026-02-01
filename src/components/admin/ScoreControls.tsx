'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ScoreControls({ games }: { games: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGame = searchParams.get('game') || '';

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const game = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (game) {
      params.set('game', game);
    } else {
      params.delete('game');
    }
    router.push(`/admin/scores?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex gap-4 items-center bg-gray-900 p-4 border border-white relative z-10">
      <div className="nes-field">
        <label htmlFor="game_select" className="text-white">Filter by Game</label>
        <div className="nes-select is-dark">
          <select id="game_select" value={currentGame} onChange={handleGameChange}>
            <option value="">All Games</option>
            {games.map(game => (
              <option key={game} value={game}>{game}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
