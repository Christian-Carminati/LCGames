import GameForm from '@/components/admin/GameForm';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function EditGamePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  const game = await prisma.game.findUnique({
    where: { slug },
    include: { gameConfig: true },
  });

  if (!game) {
    notFound();
  }

  interface ScoreConfig {
      address: string;
      type: 'byte' | 'int' | 'bcd' | 'string' | 'digits';
      length: number;
  }

  const scoreConfig = (game.gameConfig?.scoreConfig && typeof game.gameConfig.scoreConfig === 'object')
      ? game.gameConfig.scoreConfig as unknown as ScoreConfig
      : undefined;

  const difficultyConfigRaw = game.gameConfig?.difficultyConfig as { address?: string, baseOffset?: string, numLevels?: number, levelNames?: string[] } | null;
  const palNtscConfigRaw = game.gameConfig?.palNtscConfig as { address?: string, baseOffset?: string, numStandards?: number } | null;

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

  return (
    <div>
      <h1 className="nes-text is-primary text-2xl mb-6">Edit Game</h1>
      <GameForm initialData={gameData} isEdit={true} />
    </div>
  );
}
