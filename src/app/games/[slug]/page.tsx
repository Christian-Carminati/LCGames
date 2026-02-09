import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import Link from 'next/link';
import { DonateButton } from '@/components/DonateButton';
import { GameInterface } from '@/components/GameInterface';

// Generate static params for all games to enable static export if needed/optimization
export async function generateStaticParams() {
  const games = await prisma.game.findMany({ select: { slug: true } });
  return games.map((game) => ({
    slug: game.slug,
  }));
}

export const dynamicParams = true; // Allow dynamic fallback

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function GameDetailPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_token')?.value === 'authenticated';
  
  const game = await prisma.game.findUnique({
      where: { slug }
  });

  if (!game) {
    notFound();
  }

  const romPath = game.romPath || null;
  
  // Safe cast for scoreConfig since Prisma Json type is generic
  interface ScoreConfig {
      address: string;
      type: 'string';
      length: number;
      multiplier?: number;
      baseOffset?: string;
      endianness?: string;
  }
  
  const scoreConfig = (game.scoreConfig && typeof game.scoreConfig === 'object') 
      ? game.scoreConfig as unknown as ScoreConfig 
      : undefined;

  return (
    <div className="container mx-auto pb-16 px-4">
      <div className="mb-6 flex items-center">
        <Link href="/games" className="nes-btn">
             <span className="text-xs">BACK To ARCADE</span>
        </Link>
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
