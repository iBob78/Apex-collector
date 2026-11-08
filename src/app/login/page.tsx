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
      <div className="paddock-panel relative overflow-hidden p-6 shadow-2xl sm:p-10">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -ml-10 -mb-10" />

        <div className="relative z-10">
          <header className="mb-9 text-center"><p className="paddock-eyebrow mb-5">APEX / DRIVER ACCESS</p>
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-xl border border-cyan-200/30 bg-cyan-300/[0.09] text-cyan-200">
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
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse delay-1000" />

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div className="flex justify-center lg:justify-start">
          <Suspense fallback={<div className="text-gray-500 font-mono text-xs uppercase animate-pulse">{t('Chargement système...')}</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <aside className="paddock-hero relative hidden min-h-[540px] items-center justify-center p-10 lg:flex" aria-label="Apex Collector">
          <div className="absolute left-8 top-8">
            <p className="paddock-eyebrow">APEX / COLLECTOR</p>
            <h2 className="paddock-section-title mt-2">THE PRIVATE PADDOCK</h2>
          </div>
          <div className="relative mt-12 w-[65%] max-w-[300px]">
            <div className="absolute -inset-9 rounded-full border border-cyan-200/15" aria-hidden="true" />
            <img src="/showcase-card.png" alt="Apex Collector" className="paddock-landing-image relative w-full rounded-xl" />
          </div>
          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between border-t border-cyan-100/15 pt-4">
            <span className="paddock-micro">BUILD YOUR GARAGE</span>
            <span className="font-mono text-xs text-[#e7c18a]">001 / APEX</span>
          </div>
        </aside>
      </div>
    </main>
  );
}