import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { getAdminAccess } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import type { PlayerAccount } from '@/lib/admin/playerDeletion';
import PlayerAccountManager from './PlayerAccountManager';

export default async function AdminPlayersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] p-5 text-white">
        <p role="alert" className="max-w-lg rounded-xl border border-red-400/20 bg-red-400/10 p-5 text-red-200">
          Impossible de vérifier la session Supabase.
        </p>
      </main>
    );
  }
  if (!user) redirect('/login?redirect=/admin/players');

  const access = await getAdminAccess(supabase);
  if (access.error) {
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <p role="alert" className="mx-auto max-w-3xl rounded-xl border border-red-400/20 bg-red-400/10 p-5 text-red-200">
          Impossible de vérifier les droits administrateur : {access.error}
        </p>
      </main>
    );
  }
  if (!access.isOwner) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] p-5 text-white">
        <section className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <ShieldAlert className="mx-auto mb-4 text-amber-400" size={38} />
          <h1 className="text-2xl font-black">Gestion réservée au propriétaire</h1>
          <p className="mt-3 text-sm text-slate-400">
            Les administrateurs délégués ne peuvent pas supprimer les comptes joueurs.
          </p>
          <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">
            <ArrowLeft size={16} /> Retour au garage
          </Link>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase.rpc('owner_search_player_accounts', {
    p_search: '',
    p_limit: 40,
  });
  if (error) {
    console.error('[AdminPlayers] Chargement impossible:', error.message);
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <p role="alert" className="mx-auto max-w-3xl rounded-xl border border-amber-400/20 bg-amber-400/10 p-5 text-amber-200">
          La gestion des joueurs n’est pas encore disponible : applique d’abord la migration
          <code className="mx-1">043_owner_permanent_player_deletion.sql</code>.
          Aucun compte n’a été modifié.
        </p>
      </main>
    );
  }

  return <PlayerAccountManager initialPlayers={(data ?? []) as PlayerAccount[]} />;
}
