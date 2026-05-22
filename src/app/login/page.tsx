'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseBrowser';
import { motion, AnimatePresence } from 'framer-motion';
import { LogInIcon, UserPlusIcon, ArrowRightIcon, ZapIcon } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginForm] Submitting...', { isLogin, email });
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

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
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
      console.log('[LoginForm] Loading finished');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -ml-10 -mb-10" />

        <div className="relative z-10">
          <header className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-6">
              {isLogin ? <LogInIcon size={28} /> : <UserPlusIcon size={28} />}
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
              {isLogin ? 'Accès Pilote' : 'Nouvelle Écurie'}
            </h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email</label>
              <input
                type="email"
                placeholder="nom@ecurie.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Mot de passe</label>
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
                  {isLogin ? 'Connexion' : 'Créer l\'écurie'}
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
              {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse delay-1000" />

      <Suspense fallback={<div className="text-gray-500 font-mono text-xs uppercase animate-pulse">Chargement système...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}