import { notFound } from 'next/navigation';
import gamesData from '@/lib/games.json';
import { slugify } from '@/lib/utils';
import { Emulator } from '@/components/Emulator';
import Link from 'next/link';
import { DonateButton } from '@/components/DonateButton';
import { ScoreBoard } from '@/components/ScoreBoard';

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

      <div className="flex flex-col gap-6">
        <div className="nes-container is-rounded is-dark with-title">
            <p className="title">{game.title}</p>
            <Emulator romPath={romPath} scoreAddress={game.scoreAddress} />
        </div>

        <div className="nes-container is-rounded is-dark with-title">
            <p className="title">GAME INFO</p>
            <div className="flex flex-col md:flex-row gap-6">
                 <div className="w-full md:w-1/3">
                    <img src={game.imageUrl} alt={game.title} className="w-full border-4 border-c64-border rendering-pixelated" />
                 </div>
                 <div className="w-full md:w-2/3 space-y-4 text-sm">
                    <p>STATUS: ARCHIVED</p>
                    <p>PLATFORM: {game.platform || 'COMMODORE 64'}</p>
                    <p>GENRE: {game.genre || 'RETRO'}</p>
                    <p>ORIGINAL SOURCE: <a href={game.url} className="text-c64-text underline" target="_blank">{game.url}</a></p>
                    
                    {romPath && (
                        <div className="mt-4">
                            <a href={romPath} download className="nes-btn is-success">
                                <i className="nes-icon download is-small"></i> COMPACT DISK (ROM)
                            </a>
                        </div>
                    )}

                    {game.description && (
                        <div className="mt-4 p-4 bg-c64-bg border-4 border-c64-border text-xs leading-relaxed">
                            {game.description}
                        </div>
                    )}
                    
                    {!romPath && (
                        <div className="nes-badge">
                            <span className="is-warning">ROM MISSING</span>
                        </div>
                    )}
                 </div>
            </div>
        </div>

        <ScoreBoard gameSlug={slug} />

        <div className="nes-container is-rounded is-dark with-title">
            <p className="title">SUPPORT</p>
            <div className="flex flex-col items-center gap-4 text-center">
                 <p className="text-sm">Enjoying the archive? Help keep the server running!</p>
                 <DonateButton label="DONATE 1 CREDIT" />
            </div>
        </div>
      </div>
    </div>
  );
}
