'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { IMAGE_PATHS, resolveCardImage } from '@/lib/images';
import { calculateVehicleIP } from '@/lib/vehicleStats';
import { formatDistance, formatPower, formatSpeed, formatTorque, formatWeight } from '@/lib/preferences';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

interface CardDetailsModalProps {
  card: any | null;
  ownedCount: number;
  onClose: () => void;
}

export default function CardDetailsModal({ card, ownedCount, onClose }: CardDetailsModalProps) {
  const { language, units, t } = useSitePreferences();
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
  const title = card
    ? isVehicle
      ? `${card.make || ''} ${card.model || ''}`.trim()
      : card.name || 'Circuit'
    : '';
  const image = card
    ? resolveCardImage({
        category: isVehicle ? 'vehicle' : 'circuit',
        make: card.make,
        model: card.model,
        year: card.year,
        name: card.name,
        country: card.country,
        image_url: card.image_url,
      })
    : '';
  const rawWeight = Number(card?.weight_t);
  const vehicleIp = isVehicle ? calculateVehicleIP(card?.power_hp, card?.weight_t) : 0;
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
          { label: t('Transmission'), value: card.transmission || '—' },
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

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key={String(card.card_id || card.id)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-details-title"
            className="grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] text-white shadow-2xl md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[4/3] min-h-0 bg-black md:aspect-auto md:min-h-[32rem]">
              <SafeImage
                src={image}
                fallback={isVehicle ? IMAGE_PATHS.PLACEHOLDERS.VEHICLE_CARD : IMAGE_PATHS.PLACEHOLDERS.CIRCUIT_CARD}
                alt={title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            </div>

            <div className="relative min-h-0 overflow-y-auto p-5 sm:p-7">
              <button
                type="button"
                aria-label={t('Fermer les détails')}
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-md border border-white/10 bg-black/50 p-2 text-gray-300 transition-colors hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="mb-6 pr-10">
                <p className="mb-2 text-xs font-bold uppercase text-blue-400">{t(isVehicle ? 'Véhicule' : 'Circuit')}</p>
                <h2 id="card-details-title" className="text-2xl font-black uppercase italic leading-tight sm:text-3xl">
                  {title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  {card.rarity && <span className="rounded border border-white/10 px-2 py-1">{card.rarity}</span>}
                  {isVehicle && card.year && <span>{card.year}</span>}
                  {card.country && <span>{card.country}</span>}
                  <span>{ownedCount} {t(ownedCount > 1 ? 'exemplaires' : 'exemplaire')} {t(ownedCount > 1 ? 'possédés' : 'possédé')}</span>
                </div>
              </div>

              {card.description && (
                <p className="mb-6 border-l-2 border-blue-500/60 pl-3 text-sm leading-relaxed text-gray-300">
                  {card.description}
                </p>
              )}

              {details.length > 0 && (
                <dl className="grid grid-cols-2 gap-2">
                  {details.map(({ label, value }) => (
                    <div key={label} className="min-w-0 border-t border-white/10 py-3">
                      <dt className="text-[10px] font-bold uppercase text-gray-500">{label}</dt>
                      <dd className="mt-1 break-words text-sm font-semibold text-gray-100">{value}</dd>
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