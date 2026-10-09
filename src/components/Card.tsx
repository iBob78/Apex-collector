'use client';

import clsx from 'clsx';
import IPBadge from './IPBadge';
import SafeImage from './SafeImage';
import VehicleStatIcon from './VehicleStatIcon';
import { resolveCardImage, resolveBrandLogo, resolveCountryFlag, resolveDrivetrainLayoutIcon, IMAGE_PATHS } from '@/lib/images';
import type { AnyCard } from '@/types/game';
import { useRouter } from 'next/navigation';
import { Wind, ArrowUpCircle, Compass, MoveRight } from 'lucide-react';
import { getCardLevel, getLevelProgress } from '@/lib/level';
import { getRarityBorderClass } from '@/lib/rarity';
import { calculateVehicleIP } from '@/lib/vehicleStats';
import { formatDistance, formatPower, formatTorque, formatWeight } from '@/lib/preferences';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

type CardProps = AnyCard & {
  owned?: boolean;
  count?: number;
  showLevel?: boolean;
  compact?: boolean;
  className?: string;
  onCardClick?: () => void;
};

export default function Card(props: CardProps) {
  const router = useRouter();
  const { language, units, t } = useSitePreferences();
  const {
    id: propId,
    image_url,
    rarity,
    image_url: cardImage, // fallback to image_url
    owned = true,
    count = 1,
    showLevel = true,
    compact = false,
    className,
    onCardClick,
  } = props;

  // ID ROBUSTE : card_id d'abord (CSV), puis id
  const id = (props as any).card_id || propId;

  const isVehicle = (props as any).category === 'vehicle' || 'make' in props;
  const isCircuit = (props as any).category === 'circuit' || 'country' in props;

  // Extraction sécurisée des données avec valeurs par défaut
  const power_hp = isVehicle ? Number((props as any).power_hp) || 0 : 0;
  const torque_nm = isVehicle ? Number((props as any).torque_nm) || 0 : 0;
  const acceleration = isVehicle ? (props as any).acceleration_0_100 : 0;

  // New Circuit Stats
  const length_km = isCircuit ? (props as any).length_km : 0;
  const turns = isCircuit ? (props as any).turns : 0;
  const straight_km = isCircuit ? (props as any).straight_km : 0;
  const circuit_type = isCircuit ? (props as any).type : '';

  // Correction Poids : On gère le cas où la donnée est déjà en KG (ex: 1060) ou en Tonnes (ex: 1.06)
  const rawWeight = isVehicle ? Number((props as any).weight_t) || 0 : 0;
  const drivetrainLayout = isVehicle ? (props as any).transmission : undefined;
  const drivetrainLayoutIcon = resolveDrivetrainLayoutIcon(drivetrainLayout);

  // Calcul IP
  const ip = isVehicle ? calculateVehicleIP(power_hp, rawWeight) : 0;

  // Niveau de la carte
  const countValue = Number(props.count ?? count ?? 0);
  const level = getCardLevel(countValue);
  const levelEffectClass = level > 0 ? `card-level-effect-${level}` : null;

  // Utilisation du resolver centralisé pour gérer les chemins complexes (véhicules vs circuits)
  const finalImage = resolveCardImage({
    category: isVehicle ? 'vehicle' : isCircuit ? 'circuit' : 'vehicle',
    make: (props as any).make,
    model: (props as any).model,
    year: (props as any).year,
    name: (props as any).name,
    country: (props as any).country,
    image_url: cardImage
  });
  const vehicleCountry = (props as any).country_code || (props as any).country;
  const vehicleFlag = isVehicle ? resolveCountryFlag(vehicleCountry) : undefined;

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
      return;
    }

    router.push(`/collection/${id}`);
  };

  return (
    <div className={clsx("flex w-full min-w-0 flex-col gap-2 group/card", className)}>
      <div
        className={clsx(
          "relative w-full min-w-0 cursor-pointer transition-all duration-300",
          "aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a]",
          "border-[3px] shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
          getRarityBorderClass(rarity),
          !owned && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
        )}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleCardClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* Image Background */}
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={finalImage}
            fallback={isVehicle ? IMAGE_PATHS.PLACEHOLDERS.VEHICLE_CARD : IMAGE_PATHS.PLACEHOLDERS.CIRCUIT_CARD}
            alt={isVehicle ? (props as any).model : (props as any).name}
            fill
            className="object-cover"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {levelEffectClass && (
          <div
            aria-hidden="true"
            className={clsx("card-level-effect", levelEffectClass)}
          />
        )}

        {/* Top Right Logo / Flag */}
        {isVehicle && ((props as any).make || vehicleFlag) && (
          <div className="absolute top-3 right-3 z-10 flex flex-col items-center gap-1">
            {(props as any).make && (
              <div className="relative h-7 w-7">
                <SafeImage
                  src={resolveBrandLogo((props as any).make)}
                  alt={(props as any).make}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            {vehicleFlag && (
              <div className="relative h-[11px] w-4 overflow-hidden rounded-[1px] border border-white/30 bg-black/40">
                <SafeImage
                  src={vehicleFlag}
                  alt={vehicleCountry}
                  fill
                  showPlaceholderOnError={false}
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}

        {isCircuit && ((props as any).country_code || (props as any).country) && (
          <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/10">
            <SafeImage
              src={resolveCountryFlag((props as any).country_code || (props as any).country)}
              alt={(props as any).country || 'Circuit'}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* IP Badge - Top Left */}
        {isVehicle && ip > 0 && (
          <div className="absolute top-3 left-3 z-20 origin-top-left">
            <IPBadge value={ip} size="sm" />
          </div>
        )}
        {/* Content Container */}
        <div className={clsx("absolute bottom-0 inset-x-0 z-10 flex flex-col items-center", compact ? "p-2" : "p-4")}>

          {/* Title Section */}
          <div className={clsx("text-center", compact ? "mb-2" : "mb-3")}>
            <h3 className={clsx("font-bold text-white uppercase tracking-wider leading-tight", compact ? "text-sm" : "text-lg")}>
              {isVehicle ? (props as any).make : (props as any).name}
            </h3>
            <p className={clsx("text-gray-300 font-medium tracking-wide", compact ? "text-[10px]" : "text-xs")}>
              {isVehicle ? (
                <>
                  {(props as any).model} · {(props as any).year}
                </>
              ) : (props as any).country}
            </p>
          </div>

          {/* Vehicle stats */}
          {isVehicle && (
            <div className={clsx("grid grid-cols-2 gap-x-1.5 gap-y-1 text-center text-gray-200 w-full", compact ? "mb-1.5 px-0" : "mb-2 px-2")}>
              <div className="min-w-0">
                <div className="flex items-center justify-center gap-1">
                  <VehicleStatIcon kind="engine" />
                  <div className="min-w-0 text-left">
                    <p className="text-[8px] font-medium uppercase tracking-wide text-gray-400">{t('Puissance')}</p>
                    <p className={clsx("font-semibold", compact ? "text-[9px]" : "text-[11px]")}>
                      {formatPower(power_hp, units, language, Number((props as any).power_kw) || undefined)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-center gap-1">
                  <VehicleStatIcon kind="torque" />
                  <div className="min-w-0 text-left">
                    <p className="text-[8px] font-medium uppercase tracking-wide text-gray-400">{t('Couple')}</p>
                    <p className={clsx("font-semibold", compact ? "text-[9px]" : "text-[11px]")}>
                      {formatTorque(torque_nm, units, language)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-center gap-1">
                  <VehicleStatIcon kind="acceleration" />
                  <div className="min-w-0 text-left">
                    <p className="text-[8px] font-medium uppercase tracking-wide text-gray-400">{t('0 à 100 km/h')}</p>
                    <p className={clsx("font-semibold", compact ? "text-[9px]" : "text-[11px]")}>
                      {acceleration !== null && acceleration !== undefined ? `${acceleration} s` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid 2x2 for Circuits */}
          {isCircuit && (
            <div className={clsx("grid grid-cols-2 gap-y-2 font-semibold text-gray-200 w-full", compact ? "gap-x-1 text-[10px] mb-2 px-0" : "gap-x-6 text-xs mb-3 px-2")}>
              <div className="flex items-center gap-1.5 justify-end">
                <MoveRight size={14} className="text-blue-400" />
                <span>{formatDistance(Number(length_km) || 0, units, language)}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <Compass size={14} className="text-green-400" />
                <span>{turns} {t('virages')}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <ArrowUpCircle size={14} className="text-yellow-400" />
                <span>{formatDistance(Number(straight_km) || 0, units, language)} {t('ligne')}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <Wind size={14} className="text-orange-400" />
                <span>{circuit_type}</span>
              </div>
            </div>
          )}

          {/* Bottom Metadata : Weight Only */}
          {isVehicle && (
            <div className={clsx("flex items-center justify-center gap-1 pr-14 text-[9px]", compact ? "mb-1.5" : "mb-2")}>
              <VehicleStatIcon kind="weight" />
              <span className="text-gray-400">{t('Poids')}</span>
              <span className="font-medium text-gray-200">{formatWeight(rawWeight, units, language)}</span>
            </div>
          )}
        </div>
        {isVehicle && drivetrainLayoutIcon && (
          <div className="absolute bottom-2 right-2 z-20">
            <SafeImage
              src={drivetrainLayoutIcon}
              alt={`Configuration moteur et transmission ${drivetrainLayout}`}
              width={compact ? 54 : 68}
              height={compact ? 28 : 36}
              showPlaceholderOnError={false}
              className={clsx("h-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", compact ? "w-[54px]" : "w-[68px]")}
            />
          </div>
        )}
      </div>

      {/* Discrete Level Below Card */}
      {showLevel && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-sm border border-blue-400/30 uppercase tracking-tight">
            {t('Niveau')} {level}
          </span>
        </div>
      )}
    </div>
  );
}
