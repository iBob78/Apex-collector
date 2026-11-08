'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  const [profile, setProfile] = useState<{ username?: string; ap?: number; showroom_public?: boolean } | null>(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [vehicles, setVehicles] = useState<VehicleCard[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showcase, setShowcase] = useState<string[]>(EMPTY_SHOWCASE);
  const [savedShowcase, setSavedShowcase] = useState<string[]>(EMPTY_SHOWCASE);
  const [loading, setLoading] = useState(true);
  const [savingGarage, setSavingGarage] = useState(false);
  const [savingShowroomVisibility, setSavingShowroomVisibility] = useState(false);
  const [garageError, setGarageError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [achievementError, setAchievementError] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showroomMessage, setShowroomMessage] = useState<string | null>(null);

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
          .select('username, ap, showroom_public')
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
      console.error('[ProfilePage] Impossible d’enregistrer le showroom:', error.message);
      setSaveMessage(t('Impossible d’enregistrer le showroom. Vérifiez que les voitures vous appartiennent.'));
    } else {
      setSavedShowcase(showcase);
      setSaveMessage(t('Showroom enregistré.'));
    }
    setSavingGarage(false);
  };

  const setShowroomVisibility = async (isPublic: boolean) => {
    setSavingShowroomVisibility(true);
    setShowroomMessage(null);
    const { error } = await supabase.rpc('set_user_showroom_public', {
      p_is_public: isPublic,
    });
    if (error) {
      console.error('[ProfilePage] Impossible de modifier la visibilité du showroom:', error.message);
      setShowroomMessage(t('Impossible de modifier la visibilité du showroom.'));
    } else {
      setProfile((current) => current ? { ...current, showroom_public: isPublic } : current);
      setShowroomMessage(isPublic
        ? t('Votre showroom est maintenant visible par les autres joueurs.')
        : t('Votre showroom est maintenant privé.'));
    }
    setSavingShowroomVisibility(false);
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
    <div className="apex-paddock flex min-h-screen text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-28 md:pb-10">
        <div className="paddock-shell space-y-8 px-4 py-6 sm:px-7 sm:py-9 lg:px-10">
          <header className="grid overflow-hidden border border-white/25 lg:grid-cols-[minmax(0,1fr)_250px]">
            <div className="race-photo-soft relative isolate flex min-h-[270px] flex-col justify-between px-5 py-6 sm:min-h-[330px] sm:px-9 sm:py-9">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e0b] via-[#0a0e0b]/90 to-[#0a0e0b]/35" aria-hidden="true" />
              <span className="absolute -right-5 -top-16 select-none font-['Barlow_Condensed'] text-[270px] font-black leading-none text-white/[.05]" aria-hidden="true">{String(collectorProgress.level).padStart(2,'0')}</span>
              <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                <p className="race-eyebrow">DRIVER PROFILE / IDENTIFICATION</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => router.push('/settings')}
                    className="paddock-ghost inline-flex min-h-10 items-center gap-2 px-3 font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.1em]">
                    <Settings size={16} aria-hidden="true"/><span className="hidden sm:inline">{t('Réglages')}</span>
                  </button>
                  <button type="button" onClick={() => void signOut()} aria-label={t('Se déconnecter')} title={t('Se déconnecter')}
                    className="flex h-10 w-10 items-center justify-center border border-[#f4523d]/40 bg-[#f4523d]/20 text-[#ff897a] transition hover:bg-[#f4523d]/35">
                    <LogOut size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="relative z-10 flex min-w-0 items-end gap-5">
                <div className="hidden h-[90px] w-[90px] shrink-0 items-center justify-center border-[3px] border-[#dbff35] bg-[#1a2419] font-['Barlow_Condensed'] text-[57px] font-black uppercase text-[#dbff35] sm:flex" aria-hidden="true">
                  {displayName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-['Barlow_Condensed'] text-[13px] font-extrabold uppercase tracking-[.2em] text-[#dbff35]">{t('Identité pilote')} / APEX</p>
                  <h1 className="mt-3 break-words font-['Barlow_Condensed'] text-[clamp(3.4rem,7vw,7rem)] font-black uppercase leading-[.73] tracking-[-.05em]">{displayName}</h1>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[.12em] text-gray-300">RACING DEPARTMENT / MEMBER</p>
                </div>
              </div>
            </div>
            <aside className="flex flex-col justify-between bg-[#dbff35] px-6 py-6 text-[#111610] sm:px-8 sm:py-8">
              <p className="font-['Barlow_Condensed'] text-[14px] font-black uppercase tracking-[.17em]">DRIVER / LEVEL</p>
              <strong className="font-['Barlow_Condensed'] text-[118px] font-black leading-[.79] tracking-[-.085em] sm:text-[150px]">{String(collectorProgress.level).padStart(2,'0')}</strong>
              <div className="border-t-2 border-[#182516]/30 pt-4">
                <p className="font-['Barlow_Condensed'] text-[22px] font-black uppercase leading-none">{t('Niveau')} {collectorProgress.level}</p>
                <p className="mt-2 font-mono text-[11px] font-bold">{collectorProgress.progress} / 10 {t('points')}</p>
              </div>
            </aside>
          </header>

          {pageError && (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {pageError}
            </div>
          )}

          <section className="grid gap-[2px] border border-white/15 bg-white/15 sm:grid-cols-2 xl:grid-cols-4" aria-label={t('Statistiques du profil')}>
            <StatCard language={language} label={t('Cartes possédées')} value={stats.totalCards} icon={<CarFront size={18} />} />
            <StatCard language={language} label={t('Cartes légendaires')} value={stats.legendaryCards} icon={<Medal size={18} />} />
            <StatCard language={language} label={t('Constructeurs collectionnés')} value={stats.manufacturers} icon={<Users size={18} />} />
            <StatCard language={language} label={t('AP disponibles')} value={Number(profile?.ap) || 0} icon={<Wallet size={18} />} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <article className="paddock-hero p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">{t('Progression collectionneur')}</p>
                  <h2 className="paddock-title mt-2">{t('Niveau')} {collectorProgress.level}</h2>
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
                  className="paddock-meter h-2"
                >
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-cyan-200 to-[#e7c18a] transition-all" style={{ width: `${collectorProgress.progress * 10}%` }} />
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                  {t('1 point par modèle ou circuit unique ; 5 points par succès réclamé.')}
                </p>
              </div>
            </article>

            <article className="paddock-panel p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <Trophy size={19} className="text-amber-300" />
                <h2 className="paddock-section-title">{t('Palmarès compétition')}</h2>
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

          <section className="paddock-panel p-5 sm:p-7">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="paddock-eyebrow" >{t('Espace showroom')}</p>
                <h2 className="paddock-section-title mt-2">{t('Mon showroom')}</h2>
                <p className="mt-1 text-xs text-gray-500">{t('Choisissez jusqu’à trois voitures à exposer. La publication est désactivée par défaut.')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile?.showroom_public && profile.username && (
                  <Link
                    href={`/showroom/${encodeURIComponent(profile.username)}`}
                    className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-4 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/10"
                  >
                    {t('Voir mon showroom')}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void saveGarage()}
                  disabled={!hasGarageChanges || savingGarage || Boolean(garageError)}
                  className="paddock-action min-h-10 rounded-xl px-4 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingGarage ? t('Enregistrement…') : t('Enregistrer le showroom')}
                </button>
              </div>
            </div>

            {garageError && (
              <div role="alert" className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">
                {garageError}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              {showcase.map((selectedId, index) => (
                <label key={index} className="paddock-tile block p-4">
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
                    className="paddock-field min-h-11 w-full rounded-lg px-3 text-sm disabled:opacity-50"
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

            <div className="paddock-tile mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold">{t('Visibilité du showroom')}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {t('Si votre showroom est public, les voitures choisies, les statistiques de collection, vos véhicules améliorés et vos succès réclamés seront visibles.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void setShowroomVisibility(!profile?.showroom_public)}
                disabled={savingShowroomVisibility || Boolean(garageError)}
                aria-pressed={Boolean(profile?.showroom_public)}
                className={`min-h-10 shrink-0 rounded-xl px-4 text-xs font-black uppercase tracking-wider transition disabled:opacity-50 ${
                  profile?.showroom_public
                    ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20'
                    : 'border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10'
                }`}
              >
                {savingShowroomVisibility
                  ? t('Enregistrement…')
                  : profile?.showroom_public ? t('Public') : t('Rendre public')}
              </button>
            </div>
            {showroomMessage && <p role="status" className="mt-3 text-sm text-blue-200">{showroomMessage}</p>}

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
            <article className="paddock-panel p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <Medal size={18} className="text-purple-300" />
                <h2 className="paddock-section-title">{t('Titres et badges')}</h2>
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
            <article className="paddock-panel p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <CalendarDays size={18} className="text-blue-300" />
                <h2 className="paddock-section-title">{t('Inscription')}</h2>
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
    <article className="paddock-data-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
        <span className="text-blue-300">{icon}</span>
      </div>
      <p className="paddock-stat-number mt-3 tabular-nums text-[#dbff35]">{new Intl.NumberFormat(language).format(value)}</p>
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
