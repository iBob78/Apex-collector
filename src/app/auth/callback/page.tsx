'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseBrowser';
import { safeInternalRedirect } from '@/lib/signup';

function AuthCallbackRedirect() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const authError = searchParams.get('error_description') || searchParams.get('error');
  const redirect = safeInternalRedirect(searchParams.get('redirect'));
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const complete = async () => {
      if (authError) { if (active) setError(authError); return; }
      const supabase = createClient();
      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            // The browser SDK may have already exchanged the code on initialization.
            const { data: existing } = await supabase.auth.getSession();
            if (!existing.session) throw exchangeError;
          }
        }
        const { data, error: sessionError } = await supabase.auth.getUser();
        if (sessionError || !data.user) throw sessionError ?? new Error('Session introuvable.');
        if (active) window.location.replace(redirect);
      } catch {
        if (active) setError('Lien de confirmation invalide ou expiré. Réessayez depuis votre e-mail ou reconnectez-vous.');
      }
    };
    void complete();
    return () => { active = false; };
  }, [code, authError, redirect]);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-5 p-6 text-center">
      <p role="status">{error || 'Validation de votre adresse e-mail en cours…'}</p>
      {error && <a className="text-blue-300 underline" href="/login">Retour à la connexion</a>}
    </main>
  );
}
export default function AuthCallback() {
  return <Suspense fallback={<p>Validation de votre adresse e-mail en cours…</p>}><AuthCallbackRedirect /></Suspense>;
}
