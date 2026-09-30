'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    router.replace(redirect);
  }, [redirect, router]);

  return <p>Connexion en cours...</p>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<p>Connexion en cours...</p>}>
      <AuthCallbackRedirect />
    </Suspense>
  );
}
