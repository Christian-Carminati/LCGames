'use client';

import { useState } from 'react';
import { useRetroSound } from '@/hooks/useRetroSound';
import { usePathname } from 'next/navigation';

export function InsertCoin() {
  const [hasInsertedCoin, setHasInsertedCoin] = useState(false);
  const { playCoin, resumeAudio } = useRetroSound();
  const pathname = usePathname();

  // Only show on homepage
  if (pathname !== '/') {
      return null;
  }

  const handleCoin = async () => {
    await resumeAudio();
    playCoin();
    setHasInsertedCoin(true);
  };

  if (hasInsertedCoin) return null;

  return (
    <div 
        onClick={handleCoin}
        className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center cursor-pointer"
    >
      <div className="text-center animate-pulse">
        <p className="text-c64-text text-2xl mb-4 font-c64 title">INSERT COIN</p>
        <p className="text-white text-xs">1 CREDIT(S)</p>
      </div>
      
      <p className="absolute bottom-10 text-gray-500 text-xs text-center px-4">
        CLICK ANYWHERE TO START • SOUND ON
      </p>
    </div>
  );
}
