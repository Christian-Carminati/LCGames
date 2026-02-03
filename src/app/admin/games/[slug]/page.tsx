import GameForm from '@/components/admin/GameForm';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function EditGamePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;
  
  const game = await prisma.game.findUnique({
    where: { slug }
  });

  if (!game) {
    notFound();
  }
  
  // Cast scoreConfig
  const scoreConfig = game.scoreConfig as any;
  const gameData = {
      ...game,
      scoreConfig
  };

  return (
    <div>
      <h1 className="nes-text is-primary text-2xl mb-6">Edit Game</h1>
      <GameForm initialData={gameData} isEdit={true} />
    </div>
  );
}
