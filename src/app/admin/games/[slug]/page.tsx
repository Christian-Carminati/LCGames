
import GameForm from '@/components/admin/GameForm';
import { getGames, Game } from '@/lib/adminGames';
import { slugify } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function EditGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const games: Game[] = await getGames();
  const game = games.find((g) => slugify(g.title) === slug);

  if (!game) {
    notFound();
  }

  return (
    <div>
      <h1 className="nes-text is-primary text-2xl mb-6">Edit Game</h1>
      <GameForm initialData={game} isEdit={true} />
    </div>
  );
}
