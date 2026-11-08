'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Star } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { supabase } from '@/lib/supabaseClient';
import VehicleStatIcon from '@/components/VehicleStatIcon';
import { IMAGE_PATHS, resolveBrandLogo, resolveCardImage, resolveCountryFlag, resolveDrivetrainLayoutIcon } from '@/lib/images';
import { drivetrainLayoutDescriptions } from '@/lib/drivetrain';
import { calculateVehicleIP } from '@/lib/vehicleStats';
import { formatDistance, formatPower, formatSpeed, formatTorque, formatWeight } from '@/lib/preferences';
import { getNextLevelUnlock } from '@/lib/level';
import { getRarityColor } from '@/lib/rarity';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import { getDriverAgeAtCardYear } from '@/lib/driverCards';

interface CardDetailsModalProps {
  card: any | null;
  ownedCount: number;
  upgradeLevel: number;
  upgradePending: boolean;
  isFavorite: boolean;
  favoritePending: boolean;
  onToggleFavorite: () => void;
  onUpgrade: () => void;
  onClose: () => void;
}

type TopCardOwner = {
  username: string;
  owned_count: number;
};

export default function CardDetailsModal({
  card,
  ownedCount,
  upgradeLevel,
  upgradePending,
  isFavorite,
  favoritePending,
  onToggleFavorite,
  onUpgrade,
  onClose,
}: CardDetailsModalProps) {
  const { language, units, t } = useSitePreferences();
  const [topCardOwner, setTopCardOwner] = useState<TopCardOwner | null>(null);
  const [topCardOwnerLoading, setTopCardOwnerLoading] = useState(false);
  const [topCardOwnerError, setTopCardOwnerError] = useState(false);
  useEffect(() => {
    if (!card) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [card, onClose]);

  const isVehicle = card ? card.category === 'vehicle' || 'make' in card : false;
  const isDriver = card ? card.category === 'driver' || 'driver_id' in card : false;
  const cardCategory = card
    ? isDriver
      ? 'driver'
      : isVehicle
        ? 'vehicle'
        : 'circuit'
    : null;
  const cardEntityId = card
    ? String(
        cardCategory === 'driver'
          ? card.driver_id || card.id
          : cardCategory === 'circuit'
            ? card.circuit_id || card.id
            : card.card_id || card.id,
      )
    : null;

  useEffect(() => {
    if (!card || !cardCategory || !cardEntityId) {
      setTopCardOwner(null);
      setTopCardOwnerError(false);
      setTopCardOwnerLoading(false);
      return;
    }

    let active = true;
    setTopCardOwner(null);
    setTopCardOwnerError(false);
    setTopCardOwnerLoading(true);

    const fetchTopCardOwner = async () => {
      try {
        const { data, error } = await supabase.rpc('get_top_card_owner', {
          p_category: cardCategory,
          p_card_id: cardEntityId,
        });

        if (error) {
          console.error('[CardDetailsModal] Impossible de charger le détenteur principal:', error.message);
          if (active) setTopCardOwnerError(true);
        } else if (active) {
          const owner = Array.isArray(data) ? data[0] : null;
          setTopCardOwner(owner?.username
            ? { username: owner.username, owned_count: Number(owner.owned_count) || 0 }
            : null);
        }
      } catch (error) {
        console.error('[CardDetailsModal] Erreur pendant la recherche du détenteur principal:', error);
        if (active) setTopCardOwnerError(true);
      } finally {
        if (active) setTopCardOwnerLoading(false);
      }
    };

    void fetchTopCardOwner();
    return () => {
      active = false;
    };
  }, [card, cardCategory, cardEntityId]);

  const title = card
    ? isVehicle
      ? `${card.make || ''} ${card.model || ''}`.trim()
      : card.name || (isDriver ? 'Pilote' : 'Circuit')
    : '';
  const image = card
    ? resolveCardImage({
        category: isDriver ? 'driver' : isVehicle ? 'vehicle' : 'circuit',
        make: card.make,
        model: card.model,
        year: card.year,
        name: card.name,
        country: card.country,
        image_url: card.image_url,
      })
    : '';
  const rawWeight = Number(card?.weight_t);
  const countryCode = countryCodeFromValue(card?.country_code || card?.country);
  const countryFlag = isVehicle ? resolveCountryFlag(card?.country_code || card?.country) : undefined;
  const brandLogo = isVehicle ? resolveBrandLogo(card?.make) : undefined;
  const drivetrainLayoutIcon = isVehicle ? resolveDrivetrainLayoutIcon(card?.transmission) : undefined;
  const drivetrainDescription = typeof card?.transmission === 'string'
    && Object.prototype.hasOwnProperty.call(drivetrainLayoutDescriptions, card.transmission)
    ? drivetrainLayoutDescriptions[card.transmission as keyof typeof drivetrainLayoutDescriptions]
    : null;
  const countryName = card?.country && countryCodeFromValue(card.country) !== countryCode
    ? card.country
    : countryCode
      ? new Intl.DisplayNames([language], { type: 'region' }).of(countryCode) || card?.country || countryCode
      : card?.country || null;
  const vehicleIp = isVehicle ? calculateVehicleIP(card?.power_hp, card?.weight_t) : 0;
  const nextLevelUnlock = isVehicle && ownedCount > 0
    ? getNextLevelUnlock(ownedCount, upgradeLevel)
    : null;
  const formattedPrice = Number.isFinite(Number(card?.new_price_eur)) && card?.new_price_eur !== null && card?.new_price_eur !== undefined
    ? `${new Intl.NumberFormat(language).format(Number(card.new_price_eur))} €`
    : '—';
  const formattedUnitsSold = Number.isFinite(Number(card?.units_sold)) && card?.units_sold !== null && card?.units_sold !== undefined
    ? new Intl.NumberFormat(language).format(Number(card.units_sold))
    : '—';
  const details: { label: string; value: string | number | null | undefined }[] = !card
    ? []
    : isVehicle
      ? [
          { label: t('Pays'), value: card.country_code || '—' },
          { label: t('Année'), value: card.year || '—' },
          { label: t('Marque'), value: card.make || '—' },
          { label: t('Modèle'), value: card.model || '—' },
          { label: t('Puissance'), value: card.power_hp !== null && card.power_hp !== undefined ? formatPower(Number(card.power_hp), units, language, Number(card.power_kw) || undefined) : '—' },
          { label: t('Couple'), value: card.torque_nm !== null && card.torque_nm !== undefined ? formatTorque(Number(card.torque_nm), units, language) : '—' },
          { label: t('Poids'), value: rawWeight > 0 ? formatWeight(rawWeight, units, language) : '—' },
          { label: t('0 à 100 km/h'), value: card.acceleration_0_100 !== null && card.acceleration_0_100 !== undefined ? `${card.acceleration_0_100} s` : '—' },
          { label: t('Position moteur / transmission'), value: card.transmission || '—' },
          { label: t('Indice de performance (IP)'), value: vehicleIp > 0 ? vehicleIp : '—' },
          { label: t('Vitesse maximale'), value: card.max_speed_kmh !== null && card.max_speed_kmh !== undefined ? formatSpeed(Number(card.max_speed_kmh), units, language) : '—' },
          { label: t('Prix neuf'), value: formattedPrice },
          { label: t('Carburant'), value: card.fuel_type || '—' },
          { label: t('Régime maximal'), value: card.max_rpm ? `${new Intl.NumberFormat(language).format(Number(card.max_rpm))} rpm` : '—' },
          { label: t('Exemplaires vendus (monde)'), value: formattedUnitsSold },
          { label: t('Cylindrée'), value: card.engine_size || '—' },
          { label: t('Cylindres'), value: card.cylinder || '—' },
          { label: t('Aspiration'), value: card.boost?.toLowerCase() === 'na' ? t('Atmosphérique') : card.boost || '—' },
        ]
      : [
          { label: t('Longueur'), value: card.length_km ? formatDistance(Number(card.length_km), units, language) : null },
          { label: t('Virages'), value: card.turns ?? null },
          { label: t('Ligne droite'), value: card.straight_km ? formatDistance(Number(card.straight_km), units, language) : null },
          { label: t('Type'), value: card.type || null },
          { label: t('Pays'), value: card.country || card.country_code || null },
          { label: t('Année'), value: card.year || null },
        ];
  const cardDetails = isDriver && card
    ? [
        { label: t('Date de naissance'), value: card.birth_date || null },
        { label: t('Âge sur cette carte'), value: getDriverAgeAtCardYear(card.birth_date, card.year) },
        { label: t('Pays d’origine'), value: card.country || card.country_code || null },
        { label: t('Titres de champion du monde'), value: card.world_championships ?? 0 },
        { label: t('Podiums'), value: card.podiums ?? 0 },
        { label: t('Courses gagnées'), value: card.race_wins ?? 0 },
        { label: t('Grand Prix de Monaco remporté'), value: card.won_monaco_gp ? t('Oui') : t('Non') },
        { label: t('500 miles d’Indianapolis remportés'), value: card.won_indy_500 ? t('Oui') : t('Non') },
        { label: t('24 Heures du Mans remportées'), value: card.won_24h_le_mans ? t('Oui') : t('Non') },
      ]
    : details;

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key={String(card.card_id || card.id)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040815]/85 p-0 backdrop-blur-md sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-details-title"
            className="apx-card-details-dialog grid h-[100dvh] max-h-[100dvh] w-full max-w-4xl grid-cols-1 grid-rows-[32dvh_minmax(0,1fr)] overflow-hidden border border-[#a1b8f3]/25 bg-[#0c1429] text-white shadow-[0_36px_120px_rgba(0,0,0,.68)] sm:h-auto sm:max-h-[90dvh] sm:grid-rows-[minmax(0,auto)_minmax(0,1fr)] sm:rounded-[22px] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:grid-rows-1"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="apx-card-details-photo relative min-h-0 bg-[#060d1c] md:min-h-[32rem]">
              <SafeImage
                src={image}
                fallback={isVehicle ? IMAGE_PATHS.PLACEHOLDERS.VEHICLE_CARD : isDriver ? IMAGE_PATHS.PLACEHOLDERS.PILOT_CARD : IMAGE_PATHS.PLACEHOLDERS.CIRCUIT_CARD}
                alt={title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b18]/90 via-[#11162a]/10 to-[#050a1a]/35" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px]"
                style={{ background: `linear-gradient(90deg, transparent, ${getRarityColor(String(card.rarity || 'Common'))}, transparent)`,
                  boxShadow: `0 0 20px ${getRarityColor(String(card.rarity || 'Common'))}` }} />
              {/* Mobile-only outline still tracks the real rarity. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 border-[3px] sm:hidden"
                style={{ borderColor: getRarityColor(String(card.rarity || 'Common')) }}
              />
            </div>

            <div className="apx-card-details-content relative min-h-0 overflow-y-auto p-5 sm:p-7">
              <button
                type="button"
                aria-label={t('Fermer les détails')}
                onClick={onClose}
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-[#9bb9f7]/25 bg-[#182440]/85 text-[#dce7ff] transition-colors hover:bg-[#2b3965] hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="mb-6 pr-10">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-[#97baff]">{t(isVehicle ? 'Véhicule' : isDriver ? 'Pilote' : 'Circuit')}</p>
                <h2 id="card-details-title" className="font-['Barlow_Condensed'] text-[32px] font-black italic leading-[.95] tracking-[-.02em] text-white sm:text-[40px]">
                  {isVehicle ? (
                    <>
                      <span className="font-black">{card.make}</span>
                      {card.model && <> <span className="font-normal">{card.model}</span></>}
                    </>
                  ) : (
                    <span className="font-black">{title}</span>
                  )}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  {card.rarity && (
                    <>
                      <span className="rounded-lg border bg-white/[.04] px-2.5 py-1 font-bold"
                        style={{ color: getRarityColor(String(card.rarity)),
                          borderColor: getRarityColor(String(card.rarity)) }}>
                        {t(String(card.rarity))}
                      </span>
                    </>
                  )}
                  {card.variant_of_card_id && (
                    <span className="rounded border border-fuchsia-300/30 bg-fuchsia-300/[0.08] px-2 py-1 font-black uppercase tracking-wide text-fuchsia-200">
                      Alt Art
                    </span>
                  )}
                  {Number.isFinite(Number(card.collection_number)) && Number(card.collection_number) > 0 && (
                    <span className="rounded border border-white/10 px-2 py-1 tabular-nums">
                      #{Number(card.collection_number)}
                    </span>
                  )}
                  {(isVehicle || isDriver) && card.year && <span>{card.year}</span>}
                  {card.country && <span>{card.country}</span>}
                  <span>{ownedCount} {t(ownedCount > 1 ? 'exemplaires' : 'exemplaire')} {t(ownedCount > 1 ? 'possédés' : 'possédé')}</span>
                </div>
              </div>

              {isVehicle && card.is_record === true && card.record_description && (
                <section className="mb-5 rounded-xl border border-amber-300/30 bg-amber-300/[0.07] p-4">
                  <div className="flex items-center gap-2 text-amber-200">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-amber-200 bg-amber-300 px-1 text-xs font-black text-[#251500]">R</span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.16em]">{t('Record détenu')}</h3>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-100">{card.record_description}</p>
                </section>
              )}

              {card && (
                <section aria-live="polite" className="mb-5 rounded-xl border border-[#81aaff]/25 bg-[#436bc8]/[.08] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b5cfff]">
                    {t('Plus grand détenteur de cette carte')}
                  </p>
                  {topCardOwnerLoading ? (
                    <p className="mt-2 text-sm text-gray-400">{t('Recherche du collectionneur…')}</p>
                  ) : topCardOwnerError ? (
                    <p role="status" className="mt-2 text-sm text-amber-100">
                      {t('Impossible de charger le détenteur principal. Réessayez en rouvrant la carte.')}
                    </p>
                  ) : topCardOwner ? (
                    <p className="mt-2 text-sm text-gray-300">
                      <Link
                        href={`/showroom/${encodeURIComponent(topCardOwner.username)}`}
                        className="font-bold text-white underline decoration-amber-300/60 underline-offset-4 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                      >
                        @{topCardOwner.username}
                      </Link>
                      <span className="ml-2 text-gray-400">
                        · {new Intl.NumberFormat(language).format(topCardOwner.owned_count)} {t(topCardOwner.owned_count === 1 ? 'exemplaire' : 'exemplaires')}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400">{t('Aucun joueur ne possède cette carte pour le moment.')}</p>
                  )}
                </section>
              )}

              {ownedCount > 0 && (
                <button
                  type="button"
                  disabled={favoritePending}
                  aria-pressed={isFavorite}
                  onClick={onToggleFavorite}
                  className={`mb-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-50 ${isFavorite ? 'border-amber-400/60 bg-amber-400/15 text-amber-200' : 'border-white/15 bg-white/5 text-gray-200 hover:bg-white/10'}`}
                >
                  <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
                  {favoritePending ? t('Enregistrement…') : isFavorite ? t('Retirer des favoris') : t('Ajouter aux favoris')}
                </button>
              )}

              {nextLevelUnlock && (
                <section className="mb-6 rounded-xl border border-[#8d9cff]/25 bg-[#5e74df]/[.09] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b7c9ff]">
                    {upgradeLevel > 0 ? t('Niveau {level}', { level: upgradeLevel }) : t('Niveau de base')}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {nextLevelUnlock.unlocked
                      ? t('Niveau {level} débloqué', { level: nextLevelUnlock.nextLevel })
                      : t('Encore {count} exemplaire(s) pour débloquer le niveau {level}', {
                          count: nextLevelUnlock.copiesRemaining,
                          level: nextLevelUnlock.nextLevel,
                        })}
                  </p>
                  {nextLevelUnlock.unlocked && (
                    <button
                      type="button"
                      disabled={upgradePending}
                      onClick={onUpgrade}
                      className="mt-3 rounded-lg border border-[#91b8ff]/40 bg-gradient-to-r from-[#476acf] to-[#7051bd] px-3 py-2 text-xs font-black text-white shadow-[0_4px_18px_rgba(82,94,212,.25)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
                    >
                      {upgradePending
                        ? t('Achat…')
                        : t('Acheter le niveau {level} · {price} AP', {
                            level: nextLevelUnlock.nextLevel,
                            price: nextLevelUnlock.price,
                          })}
                    </button>
                  )}
                </section>
              )}

              {!isVehicle && card.description && (
                <p className="mb-6 border-l-2 border-blue-500/60 pl-3 text-sm leading-relaxed text-gray-300">
                  {card.description}
                </p>
              )}

              {cardDetails.length > 0 && (
                <dl className="grid grid-cols-2 gap-2.5">
                  {cardDetails.map(({ label, value }) => (
                    <div key={label} className="apx-detail-stat min-w-0 rounded-lg p-3">
                      <dt className="text-[10px] font-bold uppercase text-gray-500">{label}</dt>
                      <dd className="mt-1 break-words text-sm font-semibold text-gray-100">
                        {isVehicle && label === t('Pays') ? (
                          <span className="inline-flex items-center gap-2">
                            {countryFlag && (
                              <span className="relative inline-block h-3 w-[18px] overflow-hidden rounded-[1px] border border-white/20">
                                <SafeImage
                                  src={countryFlag}
                                  alt=""
                                  fill
                                  showPlaceholderOnError={false}
                                  className="object-cover"
                                />
                              </span>
                            )}
                            <span>{countryName || '—'}</span>
                          </span>
                        ) : isVehicle && label === t('Marque') ? (
                          <span className="inline-flex items-center gap-2">
                            {brandLogo && (
                              <SafeImage
                                src={brandLogo}
                                alt=""
                                width={22}
                                height={22}
                                showPlaceholderOnError={false}
                                className="h-[22px] w-[22px] object-contain"
                              />
                            )}
                            <span>{value}</span>
                          </span>
                        ) : isVehicle && label === t('Puissance') ? (
                          <span className="inline-flex items-center gap-1.5"><VehicleStatIcon kind="engine" />{value}</span>
                        ) : isVehicle && label === t('Couple') ? (
                          <span className="inline-flex items-center gap-1.5"><VehicleStatIcon kind="torque" />{value}</span>
                        ) : isVehicle && label === t('Poids') ? (
                          <span className="inline-flex items-center gap-1.5"><VehicleStatIcon kind="weight" />{value}</span>
                        ) : isVehicle && label === t('0 à 100 km/h') ? (
                          <span className="inline-flex items-center gap-1.5"><VehicleStatIcon kind="acceleration" />{value}</span>
                        ) : isVehicle && label === t('Position moteur / transmission') ? (
                          <span className="inline-flex flex-col items-start gap-1">
                            {drivetrainLayoutIcon && (
                              <SafeImage
                                src={drivetrainLayoutIcon}
                                alt={`Configuration moteur et transmission ${card.transmission}`}
                                width={40}
                                height={22}
                                showPlaceholderOnError={false}
                                className="h-auto w-10"
                              />
                            )}
                            <span className="text-xs leading-snug">
                              {value}
                              {drivetrainDescription && <> - {t(drivetrainDescription)}</>}
                            </span>
                          </span>
                        ) : value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function countryCodeFromValue(value?: string | null): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();

  const flagCharacters = Array.from(trimmed);
  if (
    flagCharacters.length === 2 &&
    flagCharacters.every((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint !== undefined && codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff;
    })
  ) {
    return flagCharacters
      .map((character) => String.fromCharCode(character.codePointAt(0)! - 0x1f1e6 + 65))
      .join('');
  }

  return undefined;
}