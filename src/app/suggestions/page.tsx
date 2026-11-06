import Link from 'next/link';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import SuggestionForm from './SuggestionForm';

export default async function SuggestionsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-5 text-white">
        <p role="alert" className="max-w-lg rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-sm text-red-200">
          Impossible de vérifier la session Supabase : {error.message}
        </p>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-5 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <Lightbulb className="mx-auto mb-5 text-cyan-300" size={38} />
          <h1 className="text-2xl font-black">Connecte-toi pour proposer une carte</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Les suggestions sont rattachées au compte du joueur pour éviter les envois anonymes.</p>
          <Link href="/login?redirect=/suggestions" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">
            Se connecter <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );
  }

  return <SuggestionForm />;
}
