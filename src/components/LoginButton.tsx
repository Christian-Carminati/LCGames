'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {session.user?.image && (
             <img src={session.user.image} alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
        )}
        <span className="text-xs hidden sm:inline">{session.user?.name}</span>
        <button onClick={() => signOut()} className="nes-btn is-error is-small text-xs">Sign out</button>
      </div>
    );
  }

  return (
    <button onClick={() => signIn('google')} className="nes-btn is-primary is-small">Sign in</button>
  );
}
