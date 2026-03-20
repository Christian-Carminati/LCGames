'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function PaginationControls({ 
  currentPage, 
  totalPages,
  totalItems 
}: { 
  currentPage: number; 
  totalPages: number;
  totalItems: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1 && totalItems > 0) {
    return (
      <div className="flex justify-between items-center mt-6 p-4 bg-gray-900 border border-white">
        <div className="text-white text-sm">
          Total: {totalItems} score{totalItems !== 1 ? 's' : ''}
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/admin/scores?${params.toString()}`);
  };

  return (
    <div className="flex justify-between items-center mt-6 p-4 bg-gray-900 border border-white">
      <div className="text-white text-sm">
        Total: {totalItems} score{totalItems !== 1 ? 's' : ''}
      </div>
      <div className="flex gap-4 items-center">
        <button 
          className={`nes-btn ${currentPage > 1 ? 'is-primary' : 'is-disabled'}`}
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          &lt;
        </button>
        <span className="text-white">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          className={`nes-btn ${currentPage < totalPages ? 'is-primary' : 'is-disabled'}`}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
