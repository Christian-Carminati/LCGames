import Link from 'next/link';
import React from 'react';
import LogoutButton from '@/components/admin/LogoutButton';
import AdminNavLinks from '@/components/admin/AdminNavLinks';
import prisma from '@/lib/db';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gameCount = await prisma.game.count().catch(() => 0);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 border-r-4 border-white p-4 flex flex-col gap-4 relative z-10">
        <div className="nes-container is-dark with-title p-3">
          <p className="title text-sm md:text-base font-bold">LCG Admin</p>
          <AdminNavLinks gameCount={gameCount} />
        </div>
        
        <div className="mt-auto flex flex-col gap-3 pt-4 border-t-2 border-dashed border-gray-700">
             <Link href="/" className="nes-btn w-full text-xs text-center block">Exit Arcade</Link>
             <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
