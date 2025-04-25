'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

type AuthError = {
  message: string;
};

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<AuthError | null>(null);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error) {
      setError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form
        className="flex-1 flex flex-col w-full justify-center gap-2"
        onSubmit={handleLogin}
      >
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="you@example.com"
        />
        <button
          className="bg-green-700 rounded px-4 py-2 text-white mb-6"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Send magic link'}
        </button>
        {error && <p className="text-red-600">{error.message}</p>}
      </form>
    </div>
  );
}
