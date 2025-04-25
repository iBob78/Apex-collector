'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type AuthError = {
  message: string;
  status?: number;
};

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<AuthError | null>(null);
  
  const supabase = createClientComponentClient<Database>();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        setAuthError(error);
      }
    } catch (err) {
      setAuthError({ message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {loading ? 'Loading...' : 'Sign Up'}
      </button>
      {authError && (
        <p className="text-red-500">{authError.message}</p>
      )}
    </form>
  );
}
