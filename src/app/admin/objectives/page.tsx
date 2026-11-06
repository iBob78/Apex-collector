import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { getAdminAccess } from '@/lib/admin';
import { fetchAllPages } from '@/lib/fetchAllPages';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import ObjectiveStudio, { type ObjectiveCatalogs } from './ObjectiveStudio';
import type { ObjectiveDefinition } from '@/lib/actions/objectives';

export default async function AdminObjectivesPage() {
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
  if (!user) redirect('/login?redirect=/admin/objectives');

  const adminAccess = await getAdminAccess(supabase);
  if (adminAccess.error) {
    return (
      <main className="min-h-screen bg-[#07090d] px-5 py-12 text-white md:px-10">
        <p role="alert" className="mx-auto max-w-3xl rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-red-200">
          {adminAccess.error}. Vérifie que la migration 034_managed_admin_users.sql a été appliquée.
        </p>
      </main>
    );
  }
  if (!adminAccess.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-5 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <ShieldAlert className="mx-auto mb-5 text-amber-400" size={38} />
          <h1 className="text-2xl font-black">Accès administrateur requis</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Ton compte n’est pas autorisé à gérer les succès et contrats.</p>
          <Link className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5" href="/dashboard">
            <ArrowLeft size={16} /> Retour au garage
          </Link>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase
    .from('objective_definitions')
    .select('*')
    .order('created_at', { ascending: false });

  let catalogs: ObjectiveCatalogs;
  try {
    if (error) throw error;
    const [vehicles, circuits, drivers] = await Promise.all([
      fetchAllPages((from, to) => supabase
        .from('cards')
        .select('card_id, make, model, year, rarity, fuel_type, transmission, collection_number')
        .order('collection_number')
        .order('id')
        .range(from, to)),
      fetchAllPages((from, to) => supabase
        .from('circuits')
        .select('circuit_id, name, country, year, rarity, type, collection_number')
        .order('collection_number')
        .order('id')
        .range(from, to)),
      fetchAllPages((from, to) => supabase
        .from('drivers')
        .select('driver_id, name, year, country, rarity, collection_number')
        .order('collection_number')
        .order('id')
        .range(from, to)),
    ]);
    catalogs = {
      vehicles: vehicles as ObjectiveCatalogs['vehicles'],
      circuits: circuits as ObjectiveCatalogs['circuits'],
      drivers: drivers as ObjectiveCatalogs['drivers'],
    };
  } catch (loadError) {
    const message = loadError instanceof Error ? loadError.message : 'Erreur Supabase inconnue.';
    return (
      <main className="min-h-screen bg-[#07090d] px-5 py-12 text-white md:px-10">
        <p role="alert" className="mx-auto max-w-3xl rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-red-200">
          Impossible de charger les objectifs et les catalogues de cartes : {message}. Vérifie que les migrations 014 (objectifs), 020 (pilotes) et 021 (numéros de collection) sont appliquées dans Supabase.
        </p>
      </main>
    );
  }

  return <ObjectiveStudio initialObjectives={(data ?? []) as ObjectiveDefinition[]} catalogs={catalogs} />;
}
