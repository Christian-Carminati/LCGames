import { notFound } from 'next/navigation';
import gamesData from '@/lib/games.json';
import { slugify } from '@/lib/utils';
import Link from 'next/link';
import { DonateButton } from '@/components/DonateButton';
import { GameInterface } from '@/components/GameInterface';

// Generate static params for all games to enable static export if needed
export async function generateStaticParams() {
  return gamesData.map((game) => ({
    slug: slugify(game.title),
  }));
}

interface Game {
    title: string;
    url: string;
    imageUrl: string;
    platform?: string;
    genre?: string;
    description?: string;
    scoreAddress?: string;
    romPath?: string;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const game = gamesData.find((g) => slugify(g.title) === slug) as Game | undefined;

  if (!game) {
    notFound();
  }

  const romPath = game.romPath || null;

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
        scoreAddress={game.scoreAddress}
        imageUrl={game.imageUrl}
        platform={game.platform}
        genre={game.genre}
        originalUrl={game.url}
        description={game.description}
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
