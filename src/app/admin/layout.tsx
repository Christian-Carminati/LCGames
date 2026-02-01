import Link from 'next/link';
import React from 'react';
import LogoutButton from '@/components/admin/LogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 border-r-4 border-white p-4 flex flex-col gap-4 relative z-10">
        <div className="nes-container is-dark with-title">
          <p className="title">Admin</p>
          <ul className="nes-list is-disc">
            <li><Link href="/admin" className="hover:text-yellow-400">Dashboard</Link></li>
            <li><Link href="/admin/games" className="hover:text-yellow-400">Games</Link></li>
            <li><Link href="/admin/scores" className="hover:text-yellow-400">Scores</Link></li>
          </ul>
        </div>
        
        <div className="mt-auto flex flex-col gap-2">
             <Link href="/" className="nes-btn w-full text-xs">Exit</Link>
             <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
