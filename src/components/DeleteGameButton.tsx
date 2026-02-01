'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteGameButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/games/${slug}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete game');
      }
    } catch (e) {
      alert('Error deleting game');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className={`nes-btn is-error ${isDeleting ? 'is-disabled' : ''}`}
      disabled={isDeleting}
    >
      {isDeleting ? '...' : 'Delete'}
    </button>
  );
}
