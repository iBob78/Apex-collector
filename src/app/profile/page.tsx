'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  CarFront,
  LogOut,
  Medal,
  Settings,
  Star,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllPages } from '@/lib/fetchAllPages';
import { calculateCollectorLevel } from '@/lib/collector-level';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import type { VehicleCard } from '@/types/game';

type Achievement = {
  id: string;
  title: string;
  description?: string;
};

type ProfileStats = {
  totalCards: number;
  uniqueVehicles: number;
  uniqueCircuits: number;
  uniqueDrivers: number;
  legendaryCards: number;
  manufacturers: number;
  claimedAchievements: number;
};

const EMPTY_STATS: ProfileStats = {
  totalCards: 0,
  uniqueVehicles: 0,
  uniqueCircuits: 0,
  uniqueDrivers: 0,
  legendaryCards: 0,
  manufacturers: 0,
  claimedAchievements: 0,
};

const EMPTY_SHOWCASE = ['', '', ''];

export default function ProfilePage() {
  const router = useRouter();
  const { language, t } = useSitePreferences();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ username?: string; ap?: number } | null>(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [vehicles, setVehicles] = useState<VehicleCard[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showcase, setShowcase] = useState<string[]>(EMPTY_SHOWCASE);
  const [savedShowcase, setSavedShowcase] = useState<string[]>(EMPTY_SHOWCASE);
  const [loading, setLoading] = useState(true);
  const [savingGarage, setSavingGarage] = useState(false);
  const [garageError, setGarageError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [achievementError, setAchievementError] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchProfileData = async () => {
      let loadingStage = 'session';
      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!currentUser) {
          router.replace('/login');
          return;
        }
        if (!active) return;
        setUser(currentUser);

        loadingStage = 'profil joueur';
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, ap')
          .eq('id', currentUser.id)
          .single();
        if (profileError) throw profileError;
        if (active) setProfile(profileData);

        loadingStage = 'possessions';
        const [ownedVehicles, ownedCircuits, ownedDrivers] = await Promise.all([
          fetchAllPages((from, to) => supabase.from('user_cards')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('id')
            .range(from, to)),
          fetchAllPages((from, to) => supabase.from('user_circuits')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('id')
            .range(from, to)),
          fetchAllPages((from, to) => supabase.from('user_drivers')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('id')
            .range(from, to)),
        ]);
        const vehicleIds = Array.from(new Set(ownedVehicles
          .map((item: any) => String(item.card_id || item.id || '').trim())
          .filter(Boolean)));
        const circuitIds = Array.from(new Set(ownedCircuits
          .map((item: any) => String(item.circuit_id || item.id || '').trim())
          .filter(Boolean)));
        const driverIds = Array.from(new Set(ownedDrivers
          .map((item: any) => String(item.driver_id || item.id || '').trim())
          .filter(Boolean)));

        loadingStage = 'catalogue des véhicules';
        const allVehicles = await fetchAllPages((from, to) => supabase.from('cards')
          .select('*')
          .order('id')
          .range(from, to));
        const vehicleIdSet = new Set(vehicleIds.map((id) => id.toLowerCase()));
        const vehicleDetails = allVehicles.filter((vehicle: any) =>
          vehicleIdSet.has(String(vehicle.card_id || vehicle.id || '').trim().toLowerCase()),
        );

        loadingStage = 'catalogue des circuits';
        const allCircuits = await fetchAllPages((from, to) => supabase.from('circuits')
          .select('*')
          .order('id')
          .range(from, to));
        const circuitIdSet = new Set(circuitIds.map((id) => id.toLowerCase()));
        const circuitDetails = allCircuits.filter((circuit: any) =>
          circuitIdSet.has(String(circuit.id || circuit.circuit_id || '').trim().toLowerCase()),
        );

        loadingStage = 'catalogue des pilotes';
        const allDrivers = await fetchAllPages((from, to) => supabase.from('drivers')
          .select('*')
          .order('id')
          .range(from, to));
        const driverIdSet = new Set(driverIds.map((id) => id.toLowerCase()));
        const driverDetails = allDrivers.filter((driver: any) =>
          driverIdSet.has(String(driver.driver_id || driver.id || '').trim().toLowerCase()),
        );

        const getCopies = (item: any) => {
          const copies = Number(item.count ?? item.quantity ?? 1);
          return Number.isFinite(copies) ? Math.max(0, copies) : 0;
        };
        const vehicleCopies = ownedVehicles.reduce((sum: number, item: any) => sum + getCopies(item), 0);
        const circuitCopies = ownedCircuits.reduce((sum: number, item: any) => sum + getCopies(item), 0);
        const driverCopies = ownedDrivers.reduce((sum: number, item: any) => sum + getCopies(item), 0);
        const ownedVehicleDetails = (vehicleDetails as Array<Record<string, any>>).map((vehicle) => ({
          ...vehicle,
          make: vehicle.make || '',
          model: vehicle.model || '',
          year: Number(vehicle.year) || 0,
          power_hp: vehicle.power_hp ?? 0,
          torque_nm: vehicle.torque_nm ?? 0,
          max_speed_kmh: vehicle.max_speed_kmh ?? 0,
          weight_t: vehicle.weight_t ?? 0,
        })) as VehicleCard[];
        const ownedCircuitDetails = circuitDetails as Array<{ id: string; rarity?: string }>;
        const manufacturers = new Set(ownedVehicleDetails
          .map((vehicle) => String(vehicle.make || '').trim().toLowerCase())
          .filter(Boolean));
        const legendaryCards = [...ownedVehicleDetails, ...ownedCircuitDetails, ...driverDetails]
          .filter((card) => card.rarity?.toLowerCase() === 'legend').length;

        loadingStage = 'succès';
        let claimedAchievementRows: Achievement[] = [];
        const { data: claimedRows, error: claimedError } = await supabase
          .from('user_objective_progress')
          .select('objective_id')
          .eq('user_id', currentUser.id)
          .eq('status', 'claimed');

        if (claimedError) {
          console.error('[ProfilePage] Impossible de charger les succès réclamés:', claimedError.message);
          if (active) setAchievementError(true);
        } else if (claimedRows?.length) {
          const claimedIds = claimedRows.map((row: { objective_id: string }) => row.objective_id);
          const { data: achievementRows, error: achievementLoadError } = await supabase
            .from('objective_definitions')
            .select('id, title, description')
            .eq('category', 'achievement')
            .in('id', claimedIds);
          if (achievementLoadError) {
            console.error('[ProfilePage] Impossible de charger les badges:', achievementLoadError.message);
            if (active) setAchievementError(true);
          } else {
            claimedAchievementRows = achievementRows || [];
          }
        }

        if (active) {
          setVehicles(ownedVehicleDetails);
          setAchievements(claimedAchievementRows);
          setStats({
            totalCards: vehicleCopies + circuitCopies + driverCopies,
            uniqueVehicles: vehicleIds.length,
            uniqueCircuits: circuitIds.length,
            uniqueDrivers: driverIds.length,
            legendaryCards,
            manufacturers: manufacturers.size,
            claimedAchievements: claimedAchievementRows.length,
          });
        }

        loadingStage = 'garage personnel';
        const { data: showcaseRows, error: showcaseLoadError } = await supabase
          .from('user_garage_showcase')
          .select('card_id, position')
          .eq('user_id', currentUser.id)
          .order('position');

        if (showcaseLoadError) {
          console.error('[ProfilePage] Impossible de charger le garage:', showcaseLoadError.message);
          if (active) setGarageError(t('Le garage personnel n’est pas encore activé sur cette base. La migration 017 doit être appliquée.'));
        } else {
          const slots = [...EMPTY_SHOWCASE];
          (showcaseRows || []).forEach((row: { card_id: string; position: number }) => {
            if (row.position >= 1 && row.position <= slots.length) slots[row.position - 1] = row.card_id;
          });
          if (active) {
            setShowcase(slots);
            setSavedShowcase(slots);
          }
        }
      } catch (error) {
        const details = error && typeof error === 'object'
          ? error as { message?: string; code?: string; details?: string; hint?: string }
          : null;
        const message = error instanceof Error
          ? error.message
          : details?.message || String(error);
        console.error('[ProfilePage] Erreur de chargement:', {
          stage: loadingStage,
          message,
          code: details?.code,
          details: details?.details,
          hint: details?.hint,
        });
        if (active) setPageError(t('Impossible de charger votre profil à l’étape : {stage}.', { stage: loadingStage }));
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchProfileData();
    return () => {
      active = false;
    };
  }, [router, t]);

  const collectorProgress = useMemo(
    () => calculateCollectorLevel(stats.uniqueVehicles, stats.uniqueCircuits, stats.claimedAchievements, stats.uniqueDrivers),
    [stats],
  );
  const vehicleById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );
  const selectedVehicles = showcase
    .map((id) => vehicleById.get(id))
    .filter((vehicle): vehicle is VehicleCard => Boolean(vehicle));
  const hasGarageChanges = showcase.join('|') !== savedShowcase.join('|');

  const saveGarage = async () => {
    setSavingGarage(true);
    setSaveMessage(null);
    const selectedIds = showcase.filter(Boolean);
    const { error } = await supabase.rpc('save_personal_garage_showcase', {
      p_card_ids: selectedIds,
    });
    if (error) {
      console.error('[ProfilePage] Impossible d’enregistrer le garage:', error.message);
      setSaveMessage(t('Impossible d’enregistrer le garage. Vérifiez que les voitures vous appartiennent.'));
    } else {
      setSavedShowcase(showcase);
      setSaveMessage(t('Garage enregistré.'));
    }
    setSavingGarage(false);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[ProfilePage] Erreur de déconnexion:', error.message);
      setPageError(t('Impossible de vous déconnecter. Réessayez.'));
      return;
    }
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const displayName = profile?.username || user?.email?.split('@')[0] || t('Pilote Apex');
  const registrationDate = user?.created_at
    ? new Intl.DateTimeFormat(language, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.created_at))
    : '—';

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-28 md:pb-10">
        <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 sm:px-7 sm:py-9 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/10 text-2xl font-black uppercase text-blue-200">
                {displayName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{t('Identité pilote')}</p>
                <h1 className="truncate text-2xl font-black uppercase italic tracking-tight sm:text-3xl">{displayName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/settings')}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-bold uppercase tracking-wider text-gray-200 transition hover:bg-white/10"
              >
                <Settings size={15} /> <span className="hidden sm:inline">{t('Réglages')}</span>
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                aria-label={t('Se déconnecter')}
                title={t('Se déconnecter')}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {pageError && (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {pageError}
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t('Statistiques du profil')}>
            <StatCard language={language} label={t('Cartes possédées')} value={stats.totalCards} icon={<CarFront size={18} />} />
            <StatCard language={language} label={t('Cartes légendaires')} value={stats.legendaryCards} icon={<Medal size={18} />} />
            <StatCard language={language} label={t('Constructeurs collectionnés')} value={stats.manufacturers} icon={<Users size={18} />} />
            <StatCard language={language} label={t('AP disponibles')} value={Number(profile?.ap) || 0} icon={<Wallet size={18} />} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <article className="rounded-3xl border border-blue-400/15 bg-gradient-to-br from-[#101a28] via-[#0b0d12] to-[#090909] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">{t('Progression collectionneur')}</p>
                  <h2 className="mt-1 text-3xl font-black italic">{t('Niveau')} {collectorProgress.level}</h2>
                </div>
                <Star className="text-blue-300" size={22} />
              </div>
              <p className="mt-3 text-sm text-gray-400">
                {t('La collection progresse grâce aux modèles, circuits, pilotes et succès réclamés, sans dépendre des compétitions.')}
              </p>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs text-gray-400">
                  <span>{collectorProgress.progress} / 10 {t('points')}</span>
                  <span>{t('Prochain niveau')}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={t('Progression vers le prochain niveau')}
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-valuenow={collectorProgress.progress}
                  className="h-2 overflow-hidden rounded-full bg-white/10"
                >
                  <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${collectorProgress.progress * 10}%` }} />
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                  {t('1 point par modèle ou circuit unique ; 5 points par succès réclamé.')}
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <Trophy size={19} className="text-amber-300" />
                <h2 className="text-sm font-black uppercase tracking-widest">{t('Palmarès compétition')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CompetitionStat label={t('Championnats remportés')} />
                <CompetitionStat label={t('Meilleur classement')} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-gray-500">
                {t('Les résultats de championnat ne sont pas encore enregistrés dans le jeu. Ils seront distincts du niveau collectionneur.')}
              </p>
            </article>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-7">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{t('Espace personnel')}</p>
                <h2 className="mt-1 text-xl font-black uppercase italic tracking-tight sm:text-2xl">{t('Mon garage')}</h2>
                <p className="mt-1 text-xs text-gray-500">{t('Choisissez jusqu’à trois voitures à exposer dans votre garage privé.')}</p>
              </div>
              <button
                type="button"
                onClick={() => void saveGarage()}
                disabled={!hasGarageChanges || savingGarage || Boolean(garageError)}
                className="min-h-10 rounded-xl bg-blue-600 px-4 text-xs font-black uppercase tracking-wider text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingGarage ? t('Enregistrement…') : t('Enregistrer le garage')}
              </button>
            </div>

            {garageError && (
              <div role="alert" className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">
                {garageError}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              {showcase.map((selectedId, index) => (
                <label key={index} className="block rounded-2xl border border-white/10 bg-black/30 p-4">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {index === 0 ? t('Voiture vedette') : `${t('Emplacement')} ${index + 1}`}
                  </span>
                  <select
                    value={selectedId}
                    onChange={(event) => {
                      const next = [...showcase];
                      next[index] = event.target.value;
                      setShowcase(next);
                      setSaveMessage(null);
                    }}
                    disabled={Boolean(garageError)}
                    className="min-h-11 w-full rounded-lg border border-white/10 bg-[#111] px-3 text-sm text-white disabled:opacity-50"
                  >
                    <option value="">{t('Aucune voiture')}</option>
                    {selectedId && !vehicleById.has(selectedId) && (
                      <option value={selectedId} disabled>{t('Voiture indisponible — retirez-la')}</option>
                    )}
                    {vehicles.map((vehicle) => (
                      <option
                        key={vehicle.id}
                        value={vehicle.id}
                        disabled={showcase.some((id, otherIndex) => otherIndex !== index && id === vehicle.id)}
                      >
                        {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || t('Voiture sans nom')}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            {saveMessage && <p role="status" className="mt-4 text-sm text-blue-200">{saveMessage}</p>}

            {selectedVehicles.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {selectedVehicles.map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    {...vehicle}
                    category="vehicle"
                    owned
                    count={1}
                    showLevel={false}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-gray-500">
                {vehicles.length
                  ? t('Votre garage est vide. Choisissez une voiture à exposer.')
                  : t('Aucune voiture dans votre collection pour le moment.')}
              </div>
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <Medal size={18} className="text-purple-300" />
                <h2 className="text-sm font-black uppercase tracking-widest">{t('Titres et badges')}</h2>
              </div>
              {achievementError ? (
                <p className="text-sm text-amber-200">{t('Les succès ne sont pas disponibles pour le moment.')}</p>
              ) : achievements.length ? (
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement) => (
                    <span key={achievement.id} title={achievement.description} className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-2 text-xs font-bold text-purple-100">
                      {t(achievement.title)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('Aucun succès réclamé pour le moment.')}</p>
              )}
            </article>
            <article className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <CalendarDays size={18} className="text-blue-300" />
                <h2 className="text-sm font-black uppercase tracking-widest">{t('Inscription')}</h2>
              </div>
              <p className="text-lg font-bold">{registrationDate}</p>
              <p className="mt-2 text-xs text-gray-500">
                {stats.uniqueVehicles} {t('modèles')} · {stats.uniqueCircuits} {t('circuits')} · {stats.uniqueDrivers} {t('pilotes')} · {stats.manufacturers} {t('constructeurs')}
              </p>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ language, label, value, icon }: { language: string; label: string; value: number; icon: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
        <span className="text-blue-300">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums">{new Intl.NumberFormat(language).format(value)}</p>
    </article>
  );
}

function CompetitionStat({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <p className="text-[9px] font-bold uppercase leading-relaxed tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 font-mono text-lg font-bold text-gray-400">—</p>
    </div>
  );
}
