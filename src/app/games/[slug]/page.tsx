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

  // Determine ROM path - hardcoded for demo purposes as we only have this one
  const romPath = slug.includes('hero-is-back') ? '/roms/HeroIsBack.d64' : null;

  return (
    <div className="container mx-auto pb-10">
      <div className="mb-4">
        <Link href="/games" className="nes-btn">{"<"} BACK TO LIST</Link>
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

      <div className="nes-container is-rounded is-dark with-title mt-6">
          <p className="title">SUPPORT</p>
          <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-sm">Enjoying the archive? Help keep the server running!</p>
                <DonateButton label="DONATE 1 CREDIT" />
          </div>
      </div>
    </div>
  );
}
