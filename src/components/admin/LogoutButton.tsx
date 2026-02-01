'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout} 
      className="nes-btn is-error w-full text-xs"
    >
      Logout
    </button>
  );
}
