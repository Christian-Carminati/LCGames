import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/admin-auth';
import Link from 'next/link';
import { DonateButton } from '@/components/DonateButton';
import { GameInterface } from '@/components/GameInterface';

export const dynamicParams = true;

interface PageProps {
    params: Promise<{ slug: string }>;
}

interface ScoreConfig {
    address: string;
    type: 'byte' | 'int' | 'bcd' | 'string' | 'digits';
    length: number;
    multiplier?: number;
    baseOffset?: string;
    endianness?: string;
}

interface PalNtscConfig {
    address: string;
    baseOffset?: string;
    numStandards?: number;
}

export default async function GameDetailPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;
  const isAdmin = adminToken ? verifyAdminToken(adminToken) : false;

  const game = await prisma.game.findUnique({
      where: { slug },
      include: { gameConfig: true },
  });

  if (!game) {
    notFound();
  }

  const romPath = game.romPath || null;

  const scoreConfig = (game.gameConfig?.scoreConfig && typeof game.gameConfig.scoreConfig === 'object')
      ? game.gameConfig.scoreConfig as unknown as ScoreConfig
      : undefined;

  const palNtscConfig = (game.gameConfig?.palNtscConfig && typeof game.gameConfig.palNtscConfig === 'object')
      ? game.gameConfig.palNtscConfig as unknown as PalNtscConfig
      : undefined;

  const difficultyConfig = (game.gameConfig?.difficultyConfig as { address: string } | null) || undefined;

  return (
    <div className="container mx-auto pb-16 px-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/games" className="nes-btn">
             <span className="text-xs">BACK To ARCADE</span>
        </Link>
        {isAdmin && (
          <Link href="/admin/games" className="nes-btn is-warning">
              <span className="text-xs">ADMIN PANEL</span>
          </Link>
        )}
      </div>

      <GameInterface
        gameSlug={slug}
        gameTitle={game.title}
        romPath={romPath}
        scoreConfig={scoreConfig}
        imageUrl={game.imageUrl || ''}
        platform={game.platform || 'C64'}
        genre={game.genre || ''}
        originalUrl={game.url || ''}
        description={game.description || ''}
        isAdmin={isAdmin}
        youtubeUrl={game.youtubeUrl || undefined}
        difficultyConfig={difficultyConfig}
        palNtscConfig={palNtscConfig}
        />

      <div className="mt-12 border-t-4 border-white/10 pt-8">
          <div className="nes-container is-rounded is-dark">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                      <p className="title mb-2">SUPPORT THE ARCHIVE</p>
                      <p className="text-xs text-gray-400">Help keep the C64 servers running!</p>
                  </div>
                  <div className="shrink-0">
                    <DonateButton label="INSERT COIN (DONATE)" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
