import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { getAdminAccess } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import AdminAccessManager, { type ManagedAdmin } from './AdminAccessManager';

export default async function AdminAccessPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-5 text-white">
        <p role="alert" className="max-w-lg rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-sm text-red-200">
          Impossible de vérifier la session Supabase : {authError.message}
        </p>
      </main>
    );
  }
  if (!user) redirect('/login?redirect=/admin/access');

  const access = await getAdminAccess(supabase);
  if (access.error) {
    return (
      <main className="min-h-screen bg-[#07090d] px-5 py-12 text-white md:px-10">
        <p role="alert" className="mx-auto max-w-3xl rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-red-200">
          {access.error}. Vérifie que la migration 034_managed_admin_users.sql a été appliquée.
        </p>
      </main>
    );
  }
  if (!access.isOwner) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-5 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <ShieldAlert className="mx-auto mb-5 text-amber-400" size={38} />
          <h1 className="text-2xl font-black">Gestion réservée au propriétaire</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Seul le propriétaire du site peut attribuer ou retirer le rôle administrateur.</p>
          <Link className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5" href="/dashboard">
            <ArrowLeft size={16} /> Retour au garage
          </Link>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase.rpc('get_admin_users');
  if (error) {
    console.error('[AdminAccessPage] Chargement des administrateurs impossible:', error.message);
    return (
      <main className="min-h-screen bg-[#07090d] px-5 py-12 text-white md:px-10">
        <p role="alert" className="mx-auto max-w-3xl rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-red-200">
          Impossible de charger les comptes administrateurs : {error.message}
        </p>
      </main>
    );
  }

  return <AdminAccessManager initialAdmins={(data ?? []) as ManagedAdmin[]} ownerId={user.id} />;
}
