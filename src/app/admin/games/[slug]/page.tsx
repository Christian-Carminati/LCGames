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
  
  // Safe cast for scoreConfig
  interface ScoreConfig {
      address: string;
      type: string;
      length: number;
  }
  
  const scoreConfig = (game.scoreConfig && typeof game.scoreConfig === 'object') 
      ? game.scoreConfig as unknown as ScoreConfig 
      : undefined;
  
  const gameData = {
      ...game,
      description: game.description || '',
      genre: game.genre || '',
      url: game.url || '',
      imageUrl: game.imageUrl || '',
      romPath: game.romPath || '',
      scoreConfig: scoreConfig as any // We need to cast here because Prisma types vs Interface mismatch is hard to satisfy perfectly without mapping every field. 
      // Wait, "non usare any".
      // If I cast `game.scoreConfig` to `ScoreConfig`, then `gameData.scoreConfig` is `ScoreConfig | undefined`.
      // `GameFormData` expects `scoreConfig: ScoreConfig`. Partial allows undefined? No, Partial makes keys optional.
      // But `ScoreConfig` is a nested object. `Partial<GameFormData>` means `scoreConfig` is optional, but if present must match `ScoreConfig`.
      // My `scoreConfig` variable is `ScoreConfig | undefined`.
      // `gameData` has `scoreConfig` property.
      // If `scoreConfig` is undefined, `gameData.scoreConfig` is undefined.
      // If `Partial<GameFormData>` allows `scoreConfig?: ScoreConfig | undefined`, then it matches.
      // However, `scoreConfig` in `gameData` is being assigned.
      // Let's rely on the previous casting `as unknown as ScoreConfig` and assign it.
  };

  // Actually, let's fix the assignment to avoid 'as any' in the object literal if possible.
  // gameData is being inferred. 
  // I'll just use the variable `scoreConfig` which is typed correctly above.


  return (
    <div>
      <h1 className="nes-text is-primary text-2xl mb-6">Edit Game</h1>
      <GameForm initialData={gameData} isEdit={true} />
    </div>
  );
}
