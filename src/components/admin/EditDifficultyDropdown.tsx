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

  const maxLevels = Math.max(1, numDifficultyLevels);
  const currentLevel = difficulty % maxLevels;
  const currentSystemIdx = Math.floor(difficulty / maxLevels);

  const updateDifficulty = async (newDifficulty: number) => {
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

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = parseInt(e.target.value, 10);
    const newDifficulty = newLevel + (currentSystemIdx * maxLevels);
    updateDifficulty(newDifficulty);
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSystemIdx = parseInt(e.target.value, 10);
    const newDifficulty = currentLevel + (newSystemIdx * maxLevels);
    updateDifficulty(newDifficulty);
  };

  const levelOptions: React.ReactNode[] = [];
  for (let d = 0; d < maxLevels; d++) {
      levelOptions.push(<option key={d} value={d}>Lvl {d}</option>);
  }

  const systemOptions: React.ReactNode[] = [
    <option key={0} value={0}>PAL</option>,
    <option key={1} value={1}>NTSC</option>,
  ];

  return (
    <>
      <td>
        <div className="nes-select is-dark is-small w-28">
          <select 
            value={currentLevel} 
            onChange={handleLevelChange} 
            disabled={isUpdating}
            className="text-xs py-1 bg-gray-800 text-white"
          >
            {levelOptions}
          </select>
        </div>
      </td>
      <td>
        {hasPalNtsc ? (
          <div className="nes-select is-dark is-small w-28">
            <select 
              value={currentSystemIdx} 
              onChange={handleSystemChange} 
              disabled={isUpdating}
              className="text-xs py-1 bg-gray-800 text-white"
            >
              {systemOptions}
            </select>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>
    </>
  );
}
