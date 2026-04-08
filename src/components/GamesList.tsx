'use client';

import { useState, useEffect } from 'react';
import { GameCard } from '@/components/GameCard';

interface Game {
  title: string;
  url: string | null;
  imageUrl: string | null;
  platform: string;
  genre: string | null;
  description: string | null;
  slug: string;
}

interface GamesListProps {
  games: Game[];
}

export function GamesList({ games }: GamesListProps) {
  const [filter, setFilter] = useState<'ALL' | 'C64_LC_GAMES' | 'C64_ARCADE' | 'PC' | 'AMIGA' | 'NES'>('ALL');

  useEffect(() => {
    const saved = sessionStorage.getItem('arcade_filter');
    if (saved && ['ALL', 'C64_LC_GAMES', 'C64_ARCADE', 'PC', 'AMIGA', 'NES'].includes(saved)) {
      setFilter(saved as 'ALL' | 'C64_LC_GAMES' | 'C64_ARCADE' | 'PC' | 'AMIGA' | 'NES');
    }
  }, []);

  const handleFilterChange = (newFilter: 'ALL' | 'C64_LC_GAMES' | 'C64_ARCADE' | 'PC' | 'AMIGA' | 'NES') => {
    setFilter(newFilter);
    sessionStorage.setItem('arcade_filter', newFilter);
  };

  const filteredGames = games.filter(game => {
    if (filter === 'ALL') return true;
    if (filter === 'C64_LC_GAMES') return game.platform === 'C64 LC-Games';
    if (filter === 'C64_ARCADE') return game.platform === 'C64 Arcade';
    if (filter === 'PC') return game.platform === 'PC';
    if (filter === 'AMIGA') return game.platform === 'Amiga';
    if (filter === 'NES') return game.platform === 'NES';
    return true;
  });

  return (
    <>
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl text-c64-text mb-4 text-center">
            <i className="nes-icon is-medium star"></i> GAME LIBRARY
        </h1>
        
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button 
                type="button" 
                className={`nes-btn ${filter === 'ALL' ? 'is-primary' : ''}`}
                onClick={() => handleFilterChange('ALL')}
            >
                ALL
            </button>
            <button
                type="button"
                className={`nes-btn ${filter === 'C64_LC_GAMES' ? 'is-primary' : ''}`}
                onClick={() => handleFilterChange('C64_LC_GAMES')}
            >
                C64 LC-GAMES
            </button>
            <button
                type="button"
                className={`nes-btn ${filter === 'C64_ARCADE' ? 'is-primary' : ''}`}
                onClick={() => handleFilterChange('C64_ARCADE')}
            >
                C64 ARCADE
            </button>
            <button
                type="button"
                className={`nes-btn ${filter === 'PC' ? 'is-primary' : ''}`}
                onClick={() => handleFilterChange('PC')}
            >
                PC
            </button>
             <button
                type="button"
                className={`nes-btn ${filter === 'AMIGA' ? 'is-primary' : ''}`}
                onClick={() => handleFilterChange('AMIGA')}
            >
                AMIGA
            </button>
            <button
                type="button"
                className={`nes-btn ${filter === 'NES' ? 'is-primary' : ''}`}
                onClick={() => handleFilterChange('NES')}
            >
                NES
            </button>
        </div>

        <p className="text-xs text-white mb-8">
            SHOWING {filteredGames.length} CARTRIDGES
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game) => (
          <GameCard 
            key={game.slug}
            title={game.title}
            imageUrl={game.imageUrl || ''}
            url={game.slug}
            slug={game.slug}
          />
        ))}
      </div>
    </>
  );
}
