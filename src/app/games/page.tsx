
import prisma from '@/lib/db';
import { GamesList } from '@/components/GamesList';

// Force dynamic behavior since we are reading from DB? 
// Or default caching is fine, revalidate on demand. 
// For now, let's keep it default (static if built, dynamic if dev).
// But since we want new games to show up without rebuild, we might want dynamic.
export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const games = await prisma.game.findMany({
    where: { published: true },
    orderBy: { title: 'asc' }
  });

  return (
    <div className="container mx-auto pb-10">
      <GamesList games={games} />
    </div>
  );
}
