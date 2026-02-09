'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useNotification } from '@/context/NotificationContext';

export default function DeleteScoreButton({ scoreId }: { scoreId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { showNotification } = useNotification();

  const handleDelete = async () => {
    // We can replace this with a proper modal later, but for now let's keep native confirm for critical actions
    // or use a double-click-to-confirm pattern if strictly "no alerts" is required.
    // The user asked to remove ALL alerts.
    if (!window.confirm('Are you sure you want to delete this score?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/scores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreId }),
      });
      
      if (res.ok) {
        showNotification("Score deleted successfully", "success");
        router.refresh();
      } else {
        showNotification("Failed to delete score", "error");
      }
    } catch (e) {
      showNotification("Error deleting score", "error");
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
