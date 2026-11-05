'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CarFront, Medal, Users } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import SafeImage from '@/components/SafeImage';
import { supabase } from '@/lib/supabaseClient';
import { resolveCardImage } from '@/lib/images';
import { getRarityColor } from '@/lib/rarity';
import { calculateVehicleIP } from '@/lib/vehicleStats';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import type { VehicleCard } from '@/types/game';

type PublicShowroom = {
  username: string;
  vehicles: Array<VehicleCard & { position: number }>;
  stats: {
    totalCards: number;
    legendaryCards: number;
    manufacturers: number;
  };
};

export default function ShowroomPage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { language, t } = useSitePreferences();
  const [showroom, setShowroom] = useState<PublicShowroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadShowroom = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        if (authError) console.error('[ShowroomPage] Impossible de vérifier la session:', authError.message);
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase.rpc('get_public_showroom', {
        p_username: username,
      });
      if (error) {
        console.error('[ShowroomPage] Impossible de charger le showroom:', error.message);
        if (active) setLoadError(true);
      } else if (active && data) {
        setShowroom(data as PublicShowroom);
      }
      if (active) setLoading(false);
    };

    void loadShowroom();
    return () => {
      active = false;
    };
  }, [username]);

  const featuredVehicle = showroom?.vehicles[0];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-28 md:pb-10">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-9 lg:px-10">
          {loading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : !showroom ? (
            <section className="mx-auto mt-16 max-w-lg rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 text-center">
              <CarFront className="mx-auto text-gray-500" size={34} />
              <h1 className="mt-4 text-xl font-black uppercase">{t('Showroom indisponible')}</h1>
              <p className="mt-2 text-sm text-gray-400">
                {loadError
                  ? t('Une erreur a empêché le chargement du showroom.')
                  : t('Ce joueur n’a pas publié son showroom ou celui-ci n’existe pas.')}
              </p>
              <Link href="/marketplace" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-bold hover:bg-white/15">
                <ArrowLeft size={16} /> {t('Retour au marché')}
              </Link>
            </section>
          ) : (
            <>
              <header className="mb-6">
                <Link href="/marketplace" className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 transition hover:text-white">
                  <ArrowLeft size={15} /> {t('Retour au marché')}
                </Link>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-400">{t('Showroom public')}</p>
                <h1 className="mt-2 text-3xl font-black uppercase italic tracking-tight sm:text-4xl">
                  {t('Showroom de {username}', { username: showroom.username })}
                </h1>
                <p className="mt-1 text-sm text-gray-400">{t('Sa passion automobile, en un coup d’œil')}</p>
              </header>

              {featuredVehicle ? (
                <section className="relative isolate min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#090b10] sm:min-h-[520px]">
                  <SafeImage
                    src={resolveCardImage({
                      category: 'vehicle',
                      make: featuredVehicle.make,
                      model: featuredVehicle.model,
                      year: featuredVehicle.year,
                      image_url: featuredVehicle.image_url,
                    })}
                    alt={`${featuredVehicle.make} ${featuredVehicle.model}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="object-cover object-center"
                    placeholderClassName="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(180,30,40,0.2),_transparent_65%)] text-gray-500"
                  />
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-black via-black/75 to-black/5 sm:via-black/55" />
                  <div className="absolute inset-0 -z-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                  <div className="relative z-10 flex min-h-[430px] flex-col justify-between p-5 sm:min-h-[520px] sm:p-9 lg:p-12">
                    <span className="w-fit rounded-md border border-red-400/30 bg-red-600/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider">
                      {t('Voiture vedette')}
                    </span>
                    <div className="max-w-md">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300">{featuredVehicle.make}</p>
                      <h2 className="mt-1 text-3xl font-black uppercase italic leading-tight sm:text-5xl">
                        {featuredVehicle.model}
                      </h2>
                      <span
                        className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black"
                        style={{ backgroundColor: `${getRarityColor(featuredVehicle.rarity)}30`, color: getRarityColor(featuredVehicle.rarity) }}
                      >
                        {t(featuredVehicle.rarity)}
                      </span>
                      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/15 pt-4 text-sm sm:max-w-sm">
                        <span className="text-gray-400">{t('Indice de performance')}</span>
                        <span className="text-right font-bold">{calculateVehicleIP(featuredVehicle.power_hp, featuredVehicle.weight_t)}</span>
                        <span className="text-gray-400">{t('Vitesse maximale')}</span>
                        <span className="text-right font-bold">{featuredVehicle.max_speed_kmh || '—'} km/h</span>
                        <span className="text-gray-400">{t('Puissance')}</span>
                        <span className="text-right font-bold">{featuredVehicle.power_hp || '—'} ch</span>
                      </div>
                      <a href="#collection-exposee" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-500/60 bg-black/50 px-4 text-xs font-black uppercase tracking-wider transition hover:bg-red-600">
                        {t('Découvrir le showroom')} <ArrowRight size={15} />
                      </a>
                    </div>
                  </div>
                </section>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/15 bg-[#0a0a0a] p-10 text-center text-sm text-gray-400">
                  {t('Aucune voiture n’est actuellement exposée.')}
                </div>
              )}

              <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label={t('Statistiques du showroom')}>
                <ShowroomStat language={language} label={t('Cartes possédées')} value={showroom.stats.totalCards} icon={<CarFront size={18} />} />
                <ShowroomStat language={language} label={t('Cartes légendaires')} value={showroom.stats.legendaryCards} icon={<Medal size={18} />} />
                <ShowroomStat language={language} label={t('Constructeurs collectionnés')} value={showroom.stats.manufacturers} icon={<Users size={18} />} />
              </section>

              {showroom.vehicles.length > 0 && (
                <section id="collection-exposee" className="mt-8 scroll-mt-6">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">{t('Sélection du pilote')}</p>
                      <h2 className="mt-1 text-xl font-black uppercase italic">{t('Voitures exposées')}</h2>
                    </div>
                    <span className="text-xs text-gray-500">{showroom.vehicles.length} / 3</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-3">
                    {showroom.vehicles.map((vehicle) => (
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
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function ShowroomStat({
  language,
  label,
  value,
  icon,
}: {
  language: string;
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
        <span className="text-red-300">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums">{new Intl.NumberFormat(language).format(value)}</p>
    </article>
  );
}
