'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseBrowser';
import { motion, AnimatePresence } from 'framer-motion';
import { LogInIcon, UserPlusIcon, ArrowRightIcon, ZapIcon } from 'lucide-react';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const supabase = createClient();
  const { language, t } = useSitePreferences();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginForm] Submitting...', { isLogin, email });
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { language } },
          });

      console.log('[LoginForm] Auth result:', { data, error: authError });

      if (authError) {
        setError(authError.message);
      } else {
        console.log('[LoginForm] Redirecting to:', redirect);
        // Use window.location instead of router.push to force full page reload
        // This ensures middleware re-checks session with fresh cookies
        window.location.href = redirect;
      }
    } catch (err: any) {
      console.error('[LoginForm] Unexpected error:', err);
      setError(t("Une erreur inattendue est survenue."));
    } finally {
      setLoading(false);
      console.log('[LoginForm] Loading finished');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 w-full max-w-md"
    >
      <div className="paddock-panel relative overflow-hidden p-6 shadow-[0_25px_65px_rgba(0,0,0,.35)] sm:p-10">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D32F35]/10 blur-[80px] -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -ml-10 -mb-10" />

        <div className="relative z-10">
          <header className="mb-9 text-center"><p className="race-eyebrow mb-5 justify-center">APEX / DRIVER ACCESS</p>
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8ba7ff]/35 bg-[#34456e]/35 text-[#c1d7ff]">
              {isLogin ? <LogInIcon size={28} /> : <UserPlusIcon size={28} />}
            </div>
            <h2 className="paddock-title">
              {t(isLogin ? 'Accès Pilote' : 'Nouvelle Écurie')}
            </h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('Email')}</label>
              <input
                type="email"
                placeholder={t('nom@ecurie.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="paddock-field w-full rounded-xl px-5 py-4 text-sm transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('Mot de passe')}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="paddock-field w-full rounded-xl px-5 py-4 text-sm transition-all placeholder:text-slate-500"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-3 rounded-xl font-bold uppercase tracking-tight"
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="paddock-action group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl py-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t(isLogin ? 'Connexion' : 'Créer l\'écurie')}
                  <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              {t(isLogin ? 'Inscrivez-vous' : 'Connectez-vous')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const { t } = useSitePreferences();
  return (
    <main className="apex-paddock relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 text-white sm:px-6 lg:py-20">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#D32F35]/5 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse delay-1000" />

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div className="flex justify-center lg:justify-start">
          <Suspense fallback={<div className="text-gray-500 font-mono text-xs uppercase animate-pulse">{t('Chargement système...')}</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <aside className="race-hero race-photo relative hidden min-h-[610px] flex-col justify-between rounded-[22px] lg:flex" aria-label="Apex Collector">
          <div className="absolute inset-0 bg-gradient-to-r from-[#101215]/80 to-transparent"/>
          <span className="absolute -right-10 top-5 select-none font-['Barlow_Condensed'] text-[220px] font-black leading-none text-white/[.07]" aria-hidden="true">01</span>
          <div className="relative z-10 p-9">
            <p className="paddock-eyebrow">APEX / COLLECTIONNEUR</p>
            <span className="race-poster-label mt-5">THE PRIVATE PADDOCK / 001</span>
          </div>
          <div className="relative z-10 p-9">
            <h2 className="font-['Barlow_Condensed'] text-[clamp(3.3rem,6vw,6.1rem)] font-black italic leading-[.9] text-white">Construis ton <span className="text-[#9bb6ff]">garage de rêve.</span></h2>
            <div className="mt-7 flex items-center justify-between border-t border-white/30 pt-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[.17em] text-[#F0EFEB]">BUILD YOUR GARAGE</span>
              <span className="font-mono text-[10px] font-bold text-gray-300">AC / 001</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}