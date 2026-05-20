'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavLinksProps {
  gameCount: number;
}

export default function AdminNavLinks({ gameCount }: AdminNavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/games', label: `Games [${gameCount}]` },
    { href: '/admin/scores', label: 'Scores [NEW]' },
    { href: '/admin/audit', label: 'Audit Log' },
  ];

  return (
    <ul className="nes-list is-disc p-0 list-none flex flex-col gap-3">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
        return (
          <li key={link.href} className="m-0 flex items-center">
            <Link
              href={link.href}
              className={`hover:text-yellow-400 text-sm md:text-base flex items-center gap-2 ${
                isActive ? 'text-yellow-400 font-bold' : 'text-white'
              }`}
            >
              {isActive && <span className="text-yellow-400">▶</span>}
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
