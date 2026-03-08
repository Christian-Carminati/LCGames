import Link from 'next/link';
import prisma from '@/lib/db';
import DeleteGameButton from '@/components/DeleteGameButton';
import { Game } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminGamesPage() {
  const games: Game[] = await prisma.game.findMany({
    orderBy: { title: 'asc' }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="nes-text is-primary text-2xl">Games Management</h1>
        <Link href="/admin/games/new" className="nes-btn is-success relative z-10">
          + Add Game
        </Link>
      </div>

      <div className="nes-table-responsive">
        <table className="nes-table is-bordered is-dark w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Platform</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => {
              return (
                <tr key={game.slug}>
                  <td>{game.title}</td>
                  <td>{game.platform}</td>
                  <td className="flex gap-2">
                    <Link href={`/admin/games/${game.slug}`} className="nes-btn is-primary">
                      Edit
                    </Link>
                    <DeleteGameButton slug={game.slug} />
                  </td>
                </tr>
              );
            })}
             {games.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center">No games found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
