'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteScoreButton({ scoreId }: { scoreId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this score?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/scores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreId }),
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete score');
      }
    } catch (e) {
      alert('Error deleting score');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className={`nes-btn is-error is-small ${isDeleting ? 'is-disabled' : ''}`}
      disabled={isDeleting}
    >
      X
    </button>
  );
}
