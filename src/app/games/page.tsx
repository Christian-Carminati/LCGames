import { GameCard } from '@/components/GameCard';
import gamesData from '@/lib/games.json';

interface Game {
  title: string;
  url: string;
  imageUrl: string;
}

export default function GamesPage() {
  const games: Game[] = gamesData;

  return (
    <div className="container mx-auto pb-10">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl text-c64-text mb-4 text-center">
            <i className="nes-icon is-medium star"></i> GAME LIBRARY
        </h1>
        <p className="text-xs text-white mb-8">SELECT CARTRIDGE TO LOAD...</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game, index) => (
          <GameCard 
            key={index}
            title={game.title}
            imageUrl={game.imageUrl}
            url={game.url}
          />
        ))}
      </div>
    </div>
  );
}
