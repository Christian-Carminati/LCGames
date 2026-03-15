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
  
  const difficultyConfigRaw = game.difficultyConfig as { address?: string, baseOffset?: string, numLevels?: number, levelNames?: string[] } | null;
  const palNtscConfigRaw = game.palNtscConfig as { address?: string, baseOffset?: string, numStandards?: number } | null;
  const gameData = {
      title: game.title,
      platform: game.platform,
      description: game.description || '',
      genre: game.genre || '',
      url: game.url || '',
      imageUrl: game.imageUrl || '',
      romPath: game.romPath || '',
      youtubeUrl: game.youtubeUrl || '',
      difficultyConfig: {
        address: difficultyConfigRaw?.address || '',
        baseOffset: difficultyConfigRaw?.baseOffset || '',
        numLevels: difficultyConfigRaw?.numLevels || 1,
        levelNames: difficultyConfigRaw?.levelNames?.join(', ') || ''
      },
      palNtscConfig: {
        address: palNtscConfigRaw?.address || '',
        baseOffset: palNtscConfigRaw?.baseOffset || '',
        numStandards: palNtscConfigRaw?.numStandards || 2
      },
      scoreConfig: scoreConfig || { address: '', type: 'byte', length: 1, multiplier: 1, baseOffset: '', endianness: 'big' }
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
