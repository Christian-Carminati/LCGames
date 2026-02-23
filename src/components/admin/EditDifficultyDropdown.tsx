'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function EditDifficultyDropdown({ scoreId, initialDifficulty = 0 }: { scoreId: string, initialDifficulty?: number }) {
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

  return (
    <div className="nes-select is-small w-32">
      <select 
        value={difficulty} 
        onChange={handleChange} 
        disabled={isUpdating}
        className="text-xs py-1"
      >
        <option value={0}>Lvl 0</option>
        <option value={1}>Lvl 1</option>
        <option value={2}>Lvl 2</option>
        <option value={3}>Lvl 3</option>
        <option value={4}>Lvl 4</option>
        <option value={5}>Lvl 5</option>
      </select>
    </div>
  );
}
