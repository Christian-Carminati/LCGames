'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function EditDifficultyDropdown({ 
  scoreId, 
  initialDifficulty = 0,
  hasPalNtsc = false,
  numDifficultyLevels = 1
}: { 
  scoreId: string, 
  initialDifficulty?: number,
  hasPalNtsc?: boolean,
  numDifficultyLevels?: number
}) {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<number>(initialDifficulty);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDifficulty = parseInt(e.target.value, 10);
    setDifficulty(newDifficulty);
    setIsUpdating(true);

    try {
      const res = await fetch('/api/admin/scores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreId, difficulty: newDifficulty }),
      });

      if (!res.ok) {
        throw new Error('Failed to update difficulty');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating score difficulty:', error);
      // Revert on failure
      setDifficulty(initialDifficulty);
      alert('Failed to update difficulty');
    } finally {
      setIsUpdating(false);
    }
  };

  const options: React.ReactNode[] = [];
  const standards = hasPalNtsc ? ['PAL', 'NTSC'] : [''];
  
  standards.forEach((std, stdIdx) => {
      const maxLevels = Math.max(1, numDifficultyLevels);
      for (let d = 0; d < maxLevels; d++) {
          const val = d + (stdIdx * maxLevels);
          const labelStr = `Lvl ${d}${std ? ` (${std})` : ''}`;
          options.push(<option key={val} value={val}>{labelStr}</option>);
      }
  });

  return (
    <div className="nes-select is-small w-40">
      <select 
        value={difficulty} 
        onChange={handleChange} 
        disabled={isUpdating}
        className="text-xs py-1"
      >
        {options}
      </select>
    </div>
  );
}
