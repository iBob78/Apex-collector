'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Gift, LoaderCircle, LockKeyhole, Trophy } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import {
  claimObjectiveReward,
  describeObjectiveReward,
  getUserObjectives,
  type ObjectiveCategory,
  type ObjectiveProgress,
} from '@/lib/actions/objectives';
import { createClient } from '@/lib/supabaseBrowser';

export default function ObjectiveBoard({
  category,
  title,
  subtitle,
}: {
  category: ObjectiveCategory;
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [objectives, setObjectives] = useState<ObjectiveProgress[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchObjectives = useCallback(async (id: string) => {
    setLoading(true);
    const result = await getUserObjectives(id, category);
    setObjectives(result.data);
    setLoadError(result.error);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setLoadError(error.message);
        setLoading(false);
        return;
      }
      if (!data.user) {
        setLoading(false);
        return;
      }
      setUserId(data.user.id);
      void fetchObjectives(data.user.id);
    }).catch((error: unknown) => {
      if (!mounted) return;
      setLoadError(error instanceof Error ? error.message : 'Erreur inattendue pendant la vérification de la session.');
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [fetchObjectives]);

  const handleClaim = async (progressId: string) => {
    if (!userId) return;
    setClaimingId(progressId);
    const result = await claimObjectiveReward(userId, progressId);
    if (result.success) {
      const gains = [
        result.reward > 0 ? `${result.reward} AC` : null,
        result.boosterSlug ? 'Booster offert (voir la boutique)' : null,
      ].filter(Boolean);
      window.alert(`${t('Récompense récupérée')} : ${gains.join(' + ') || '0 AC'}.`);
      await fetchObjectives(userId);
    } else {
      window.alert(`${t('Erreur')}: ${result.error}`);
    }
    setClaimingId(null);
  };

  const completedCount = objectives.filter((item) => item.status !== 'active').length;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="p-4 sm:p-6 md:p-12">
          <header className="mb-9">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">
              <Trophy size={14} /> Apex Collector
            </p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter">{t(title)}</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">{t(subtitle)}</p>
          </header>

          {userId && !loading && !loadError && objectives.length > 0 && (
            <section className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div>
                <h2 className="font-black uppercase tracking-wide">{t('Votre progression')}</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {completedCount} / {objectives.length} {t(category === 'contract' ? 'contrats terminés' : 'succès débloqués')}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 sm:w-48">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(completedCount / objectives.length) * 100}%` }}
                />
              </div>
            </section>
          )}

          {loading ? (
            <div className="flex h-48 items-center justify-center text-blue-400"><LoaderCircle className="animate-spin" /></div>
          ) : loadError ? (
            <p role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-sm text-red-200">
              {t('Impossible de charger les objectifs')}: {loadError}
            </p>
          ) : !userId ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <LockKeyhole className="mx-auto mb-3 text-blue-400" />
              <p className="text-sm text-gray-400">{t('Connectez-vous pour suivre vos objectifs.')}</p>
              <button onClick={() => router.push('/login')} className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-xs font-black uppercase">
                {t('Se connecter')}
              </button>
            </div>
          ) : objectives.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-gray-500">
              {t(category === 'contract' ? 'Aucun contrat disponible pour le moment.' : 'Aucun succès disponible pour le moment.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {objectives.map((item, index) => {
                const isClaimed = item.status === 'claimed';
                const isCompleted = item.status === 'completed';
                const percent = Math.min(100, (item.current_count / item.objective.target_count) * 100);
                const requirements = item.objective.requirements ?? [];
                return (
                  <article
                    key={item.id}
                    className={`relative overflow-hidden rounded-3xl border p-6 transition ${
                      isCompleted ? 'border-amber-400/30 bg-amber-400/[0.035]' : 'border-white/[0.08] bg-[#0a0a0a]'
                    }`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {isClaimed ? <CheckCircle2 className="mt-1 shrink-0 text-emerald-400" /> : isCompleted ? <Gift className="mt-1 shrink-0 text-amber-300" /> : <Circle className="mt-1 shrink-0 text-blue-400" />}
                        <div>
                          <h2 className={`font-black uppercase tracking-wide ${isClaimed ? 'text-gray-500' : 'text-white'}`}>{t(item.objective.title)}</h2>
                          <p className="mt-2 text-sm leading-6 text-gray-400">{t(item.objective.description)}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black text-blue-200">
                        {describeObjectiveReward(item.objective)}
                      </span>
                    </div>
                    {requirements.length > 0 && (
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-cyan-200/70">
                        {item.objective.requirement_operator === 'any' ? 'Valider au moins une condition' : 'Valider toutes les conditions'}
                      </p>
                    )}

                    <div className="mt-6">
                      <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>{t('Progression')}</span>
                        <span className={isCompleted || isClaimed ? 'text-amber-300' : 'text-blue-300'}>
                          {item.current_count} / {item.objective.target_count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full border border-white/5 bg-white/5">
                        <div className={`h-full rounded-full transition-all ${isCompleted || isClaimed ? 'bg-amber-400' : 'bg-blue-600'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    {requirements.length > 0 && (
                      <ul className="mt-5 space-y-2.5">
                        {requirements.map((requirement, requirementIndex) => {
                          const current = item.requirement_progress?.[requirementIndex] ?? 0;
                          const categoryLabel = requirement.category === 'vehicle'
                            ? 'Véhicules'
                            : requirement.category === 'circuit'
                              ? 'Circuits'
                              : 'Pilotes';
                          const details = [
                            requirement.item_label,
                            requirement.make,
                            requirement.model,
                            requirement.year,
                            requirement.country,
                            requirement.type,
                            ({ EL: 'Électrique', GO: 'Diesel', ES: 'Essence', HY: 'Hybride' } as Record<string, string>)[requirement.fuel_type] ?? requirement.fuel_type,
                            requirement.transmission,
                            requirement.rarity,
                          ].filter(Boolean);
                          const requirementPercent = Math.min(100, (current / requirement.target_count) * 100);
                          return (
                            <li key={`${item.id}-condition-${requirementIndex}`} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                              <div className="mb-2 flex items-start justify-between gap-3 text-xs">
                                <span className="min-w-0 text-gray-300">
                                  <span className="font-bold text-gray-200">{categoryLabel}</span>
                                  {details.length > 0 && <span className="text-gray-500"> · {details.join(' · ')}</span>}
                                  <span className="mt-1 block text-[10px] text-gray-500">
                                    {requirement.count_mode === 'copies' ? 'Exemplaires' : 'Cartes différentes'}
                                  </span>
                                </span>
                                <span className="shrink-0 font-black text-blue-200">{current} / {requirement.target_count}</span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${requirementPercent}%` }} />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => void handleClaim(item.id)}
                        disabled={claimingId === item.id}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-black uppercase tracking-widest text-black transition hover:bg-amber-300 disabled:opacity-60"
                      >
                        {claimingId === item.id ? <LoaderCircle size={15} className="animate-spin" /> : <Gift size={15} />}
                        {t('Réclamer la récompense')}
                      </button>
                    ) : isClaimed ? (
                      <p className="mt-5 text-center text-[10px] font-black uppercase tracking-widest text-emerald-400">{t('Récompense récupérée')}</p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
