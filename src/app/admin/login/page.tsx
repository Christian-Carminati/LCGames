'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (_) {
      setError('An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212529] font-['Press_Start_2P']">
      <div className="nes-container is-dark with-title max-w-md w-full">
        <p className="title">Admin Login</p>
        <form onSubmit={handleSubmit}>
          <div className="nes-field">
            <label htmlFor="password_field">Password</label>
            <input
              type="password"
              id="password_field"
              className="nes-input is-dark"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          
          {error && <p className="nes-text is-error mt-4">{error}</p>}
          
          <div className="mt-8 flex justify-end">
             <button type="submit" className="nes-btn is-primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
