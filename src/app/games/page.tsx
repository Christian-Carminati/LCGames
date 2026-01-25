'use client';

import { useState } from 'react';
import { GameCard } from '@/components/GameCard';
import gamesData from '@/lib/games.json';

interface Game {
  title: string;
  url: string;
  imageUrl: string;
  platform: string;
  genre: string;
  description: string;
  scoreAddress?: string;
}

export default function GamesPage() {
  const [filter, setFilter] = useState<'ALL' | 'C64' | 'PC' | 'AMIGA'>('ALL');
  const games: Game[] = gamesData as Game[];

  const filteredGames = games.filter(game => {
    if (filter === 'ALL') return true;
    if (filter === 'C64') return game.platform === 'C64';
    if (filter === 'PC') return game.platform === 'PC';
    if (filter === 'AMIGA') return game.platform === 'Amiga';
    return true;
  });

  return (
    <div className="container mx-auto pb-10">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl text-c64-text mb-4 text-center">
            <i className="nes-icon is-medium star"></i> GAME LIBRARY
        </h1>
        
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button 
                type="button" 
                className={`nes-btn ${filter === 'ALL' ? 'is-primary' : ''}`}
                onClick={() => setFilter('ALL')}
            >
                ALL
            </button>
            <button 
                type="button" 
                className={`nes-btn ${filter === 'C64' ? 'is-primary' : ''}`}
                onClick={() => setFilter('C64')}
            >
                C64
            </button>
            <button 
                type="button" 
                className={`nes-btn ${filter === 'PC' ? 'is-primary' : ''}`}
                onClick={() => setFilter('PC')}
            >
                PC
            </button>
             <button 
                type="button" 
                className={`nes-btn ${filter === 'AMIGA' ? 'is-primary' : ''}`}
                onClick={() => setFilter('AMIGA')}
            >
                AMIGA
            </button>
        </div>

        <p className="text-xs text-white mb-8">
            SHOWING {filteredGames.length} CARTRIDGES
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game, index) => (
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
