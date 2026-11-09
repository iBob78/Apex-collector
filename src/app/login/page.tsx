'use client';
import { useState, Suspense } from 'react';
import { SiteLanguage, UnitSystem } from '@/lib/preferences';
import { defaultSignupUsername, isValidSignupUsername, safeInternalRedirect } from '@/lib/signup';
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
  const [notice, setNotice] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeInternalRedirect(searchParams.get('redirect'));

  const supabase = createClient();
  const { language, units, saveLanguage, saveUnits, t } = useSitePreferences();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!isLogin && !isValidSignupUsername(username)) {
      setError(t('Le pseudo doit contenir 3 à 24 caractères : lettres, chiffres, _ ou -.'));
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) setError(authError.message);
        else window.location.assign(redirect);
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username: username.trim(), language, unit_preference: units },
            emailRedirectTo: window.location.origin + '/auth/callback?redirect=' + encodeURIComponent(redirect),
          },
        });
        if (authError) {
          setError(authError.message.toLowerCase().includes('database error')
            ? t('Inscription impossible. Vérifiez votre pseudo ou réessayez.')
            : authError.message);
        } else if (!data.session) {
          setNotice(t('Vérifiez votre boîte mail pour activer votre compte, puis connectez-vous.'));
        } else {
          window.location.assign(redirect);
        }
      }
    } catch {
      setError(t('Une erreur inattendue est survenue.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[24px] sm:rounded-[32px] p-5 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -ml-10 -mb-10" />

        <div className="relative z-10">
          <header className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-6">
              {isLogin ? <LogInIcon size={28} /> : <UserPlusIcon size={28} />}
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
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
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  if (!usernameEdited) setUsername(defaultSignupUsername(value));
                }}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label htmlFor="signup-username" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('Pseudo')}</label>
                  <input
                    id="signup-username"
                    type="text"
                    autoComplete="nickname"
                    value={username}
                    maxLength={24}
                    minLength={3}
                    pattern="[A-Za-z0-9_-]{3,24}"
                    required
                    onChange={(e) => { setUsername(e.target.value); setUsernameEdited(true); }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                  <p className="text-[10px] text-gray-500">{t('Le pseudo doit contenir 3 à 24 caractères : lettres, chiffres, _ ou -.')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="signup-language" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('Langue')}</label>
                    <select
                      id="signup-language"
                      value={language}
                      onChange={(e) => { void saveLanguage(e.target.value as SiteLanguage); }}
                      className="w-full bg-[#161b25] border border-white/10 rounded-2xl px-3 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-units" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('Unités')}</label>
                    <select
                      id="signup-units"
                      value={units}
                      onChange={(e) => { void saveUnits(e.target.value as UnitSystem); }}
                      className="w-full bg-[#161b25] border border-white/10 rounded-2xl px-3 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="metric">{t('Métriques')}</option>
                      <option value="imperial">{t('Impériales')}</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('Mot de passe')}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            <AnimatePresence>
              {notice && (
                <motion.p role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                  {notice}
                </motion.p>
              )}
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
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group overflow-hidden relative"
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
              onClick={() => { setIsLogin(!isLogin); setError(''); setNotice(''); }}
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
    <main className="flex items-center justify-center min-h-screen bg-[#050505] text-white p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse delay-1000" />

      <Suspense fallback={<div className="text-gray-500 font-mono text-xs uppercase animate-pulse">{t('Chargement système...')}</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}