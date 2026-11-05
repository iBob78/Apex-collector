'use client';

import clsx from 'clsx';
import IPBadge from './IPBadge';
import SafeImage from './SafeImage';
import VehicleStatIcon from './VehicleStatIcon';
import { resolveCardImage, resolveBrandLogo, resolveCountryFlag, resolveDrivetrainLayoutIcon, IMAGE_PATHS } from '@/lib/images';
import type { AnyCard } from '@/types/game';
import { useRouter } from 'next/navigation';
import { Wind, ArrowUpCircle, Check, Compass, MoveRight, ChevronRight, Star, Trophy } from 'lucide-react';
import { getRarityBorderClass } from '@/lib/rarity';
import { calculateVehicleIP } from '@/lib/vehicleStats';
import { formatDistance, formatPower, formatTorque, formatWeight } from '@/lib/preferences';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import { getFuelTypeInfo } from '@/lib/fuelTypes';
import { drivetrainLayoutDescriptions } from '@/lib/drivetrain';
import { getDriverAgeAtCardYear } from '@/lib/driverCards';

type CardProps = AnyCard & {
  owned?: boolean;
  count?: number;
  showLevel?: boolean;
  compact?: boolean;
  /** Four-column phone collection with all original card information. */
  mobileGrid?: boolean;
  /** Tilt the card toward the pointer in the collection. */
  pointerTilt?: boolean;
  /** Conceal unowned cards without revealing their identity or opening their details. */
  hideUnownedContent?: boolean;
  /** Lift the vehicle name slightly on booster reveal cards only. */
  boosterReveal?: boolean;
  isFavorite?: boolean;
  upgradeLevel?: number;
  upgradePrice?: number;
  upgradeAvailable?: boolean;
  upgradePending?: boolean;
  onUpgrade?: () => void;
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
    showLevel = true,
    compact = false,
    mobileGrid = false,
    pointerTilt = false,
    hideUnownedContent = false,
    boosterReveal = false,
    isFavorite = false,
    count = 0,
    upgradeLevel = 0,
    upgradePrice,
    upgradeAvailable = false,
    upgradePending = false,
    onUpgrade,
    className,
    onCardClick,
  } = props;

  // ID ROBUSTE : card_id d'abord (CSV), puis id
  const isDriver = (props as any).category === 'driver' || 'driver_id' in props;
  const id = (props as any).card_id || (props as any).circuit_id || (props as any).driver_id || propId;

  const isVehicle = (props as any).category === 'vehicle' || ((props as any).category == null && 'make' in props);
  const isCircuit = (props as any).category === 'circuit' || ((props as any).category == null && 'country' in props);

  // Extraction sécurisée des données avec valeurs par défaut
  const power_hp = isVehicle ? Number((props as any).power_hp) || 0 : 0;
  const torque_nm = isVehicle ? Number((props as any).torque_nm) || 0 : 0;
  const acceleration = isVehicle ? (props as any).acceleration_0_100 : 0;

  // New Circuit Stats
  const length_km = isCircuit ? (props as any).length_km : 0;
  const turns = isCircuit ? (props as any).turns : 0;
  const straight_km = isCircuit ? (props as any).straight_km : 0;
  const circuit_type = isCircuit ? (props as any).type : '';
  const circuitSubtitle = isCircuit
    ? [(props as any).country, (props as any).year].filter(Boolean).join(' · ')
    : '';
  const driverAge = isDriver ? getDriverAgeAtCardYear((props as any).birth_date, (props as any).year) : null;
  const driverSubtitle = isDriver
    ? [(props as any).year, driverAge === null ? null : `${driverAge} ans`].filter(Boolean).join(' · ')
    : '';

  // Correction Poids : On gère le cas où la donnée est déjà en KG (ex: 1060) ou en Tonnes (ex: 1.06)
  const rawWeight = isVehicle ? Number((props as any).weight_t) || 0 : 0;
  const collectionNumber = Number((props as any).collection_number);
  const hasCollectionNumber = Number.isFinite(collectionNumber) && collectionNumber > 0;
  const contentPadding = mobileGrid
    ? hasCollectionNumber
      ? 'px-0.5 pb-2.5 pt-0.5 sm:p-4 sm:pb-10'
      : 'px-0.5 pb-2 pt-0.5 sm:p-4'
    : compact
      ? hasCollectionNumber ? 'p-2 pb-7' : 'p-2'
      : hasCollectionNumber ? 'p-4 pb-10' : 'p-4';
  const level = Math.max(0, Math.min(9, Math.floor(Number(upgradeLevel) || 0)));
  const levelEffectClass = level >= 1 ? `card-upgrade-effect-${level}` : null;
  const canTiltToPointer = pointerTilt && owned;
  const isConcealed = hideUnownedContent && !owned;
  const cardWrapperClassName = clsx("flex w-full min-w-0 flex-col group/card", mobileGrid ? "gap-1 sm:gap-2" : "gap-2", className);
  const cardFrameClassName = clsx(
    "relative w-full min-w-0 aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a]",
    mobileGrid ? "border-2 sm:border-[3px] shadow-[0_6px_16px_rgba(0,0,0,0.35)] sm:shadow-[0_12px_30px_rgba(0,0,0,0.35)]" : "border-[3px] shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
  );
  const drivetrainLayout = isVehicle ? (props as any).transmission : undefined;
  const drivetrainLayoutIcon = resolveDrivetrainLayoutIcon(drivetrainLayout);
  const drivetrainLayoutDescription = typeof drivetrainLayout === 'string'
    ? Object.entries(drivetrainLayoutDescriptions).find(
      ([code]) => code === drivetrainLayout.trim().toUpperCase(),
    )?.[1]
    : undefined;

  // Calcul IP
  const ip = isVehicle ? calculateVehicleIP(power_hp, rawWeight) : 0;

  // Utilisation du resolver centralisé pour gérer les chemins complexes (véhicules vs circuits)
  const finalImage = resolveCardImage({
    category: isDriver ? 'driver' : isVehicle ? 'vehicle' : isCircuit ? 'circuit' : 'vehicle',
    make: (props as any).make,
    model: (props as any).model,
    year: (props as any).year,
    name: (props as any).name,
    country: (props as any).country,
    image_url: cardImage
  });
  const vehicleCountry = (props as any).country_code || (props as any).country;
  const cardCountry = (props as any).country_code || (props as any).country;
  const vehicleFlag = isVehicle ? resolveCountryFlag(vehicleCountry) : undefined;
  const fuelType = isVehicle ? getFuelTypeInfo((props as any).fuel_type) : null;

  const handleCardClick = () => {
    if (isConcealed) return;

    if (onCardClick) {
      onCardClick();
      return;
    }

    router.push(`/collection/${id}`);
  };

  if (isConcealed) {
    return (
      <div className={cardWrapperClassName}>
        <div
          role="img"
          aria-label={t('Carte non découverte')}
          className={clsx(cardFrameClassName, "cursor-default border-white/10")}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(148,163,184,0.13),_transparent_70%)]"
          >
            <div className="absolute inset-2 rounded-lg border border-dashed border-white/10 sm:inset-4" />
            <span className="font-black text-4xl text-white/20 sm:text-6xl">?</span>
          </div>
        </div>
        {mobileGrid && showLevel && (
          <div className="flex min-h-[25px] w-full items-start justify-center sm:hidden">
            <span className="h-[23px] w-full" aria-hidden="true" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cardWrapperClassName}>
      <div
        className={clsx(
          cardFrameClassName,
          "cursor-pointer transition-all duration-300",
          getRarityBorderClass(rarity),
          canTiltToPointer && "card-pointer-tilt",
          !owned && "grayscale opacity-60"
        )}
        onClick={handleCardClick}
        onPointerMove={(event) => {
          if (!owned || event.pointerType === 'touch' || (!pointerTilt && level < 1)) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const relativeX = (event.clientX - bounds.left) / bounds.width;
          const relativeY = (event.clientY - bounds.top) / bounds.height;
          const pointerX = relativeX * 100;
          const pointerY = relativeY * 100;
          event.currentTarget.style.setProperty('--card-pointer-x', `${pointerX}%`);
          event.currentTarget.style.setProperty('--card-pointer-y', `${pointerY}%`);
          if (canTiltToPointer) {
            event.currentTarget.style.setProperty('--card-rotate-x', `${(0.5 - relativeY) * 12}deg`);
            event.currentTarget.style.setProperty('--card-rotate-y', `${(relativeX - 0.5) * 14}deg`);
          }
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty('--card-pointer-x', '50%');
          event.currentTarget.style.setProperty('--card-pointer-y', '42%');
          event.currentTarget.style.setProperty('--card-rotate-x', '0deg');
          event.currentTarget.style.setProperty('--card-rotate-y', '0deg');
        }}
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
            fallback={isVehicle ? IMAGE_PATHS.PLACEHOLDERS.VEHICLE_CARD : isDriver ? IMAGE_PATHS.PLACEHOLDERS.PILOT_CARD : IMAGE_PATHS.PLACEHOLDERS.CIRCUIT_CARD}
            alt={isVehicle ? (props as any).model : (props as any).name}
            fill
            className="object-cover"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {['icon', 'mythic', 'legend'].includes(String(rarity).toLowerCase()) && (
          <div
            aria-hidden="true"
            className={
              String(rarity).toLowerCase() === 'mythic'
                ? 'rarity-mythic-holo-sheen'
                : String(rarity).toLowerCase() === 'legend'
                  ? 'rarity-legend-holo-sheen'
                  : 'rarity-icon-holo-sheen'
            }
          />
        )}

        {levelEffectClass && (
          <div
            aria-hidden="true"
            className={clsx("card-upgrade-effect", levelEffectClass)}
          />
        )}

        {/* Top Right Logo / Flag */}
        {isVehicle && ((props as any).make || vehicleFlag) && (
          <div className={clsx("absolute z-10 flex flex-col items-center", mobileGrid ? "right-0.5 top-0.5 gap-0.5 sm:right-3 sm:top-3 sm:gap-1" : "right-3 top-3 gap-1")}>
            {(props as any).make && (
              <div className={clsx("relative", mobileGrid ? "h-3.5 w-3.5 sm:h-7 sm:w-7" : "h-7 w-7")}>
                <SafeImage
                  src={resolveBrandLogo((props as any).make)}
                  alt={(props as any).make}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            {vehicleFlag && (
              <div className={clsx("relative overflow-hidden rounded-[1px] border border-white/30 bg-black/40", mobileGrid ? "h-[7px] w-3 sm:h-[11px] sm:w-4" : "h-[11px] w-4")}>
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

        {(isCircuit || isDriver) && cardCountry && (
          <div className={clsx("absolute z-10 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/10", mobileGrid ? "right-0.5 top-0.5 h-4 w-4 sm:right-3 sm:top-3 sm:h-8 sm:w-8" : "right-3 top-3 h-8 w-8")}>
            <SafeImage
              src={resolveCountryFlag(cardCountry)}
              alt={(props as any).country || (isDriver ? 'Pilote' : 'Circuit')}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* IP Badge - Top Left */}
        {isVehicle && (ip > 0 || fuelType) && (
          <div className={clsx(
              "absolute z-20 flex origin-top-left flex-col items-start gap-1",
              mobileGrid ? "left-0.5 top-0.5 scale-[0.62] sm:left-3 sm:top-3 sm:scale-100" : "left-3 top-3",
              mobileGrid && ip <= 0 && "hidden sm:flex",
            )}>
            {ip > 0 && <IPBadge value={ip} size="sm" />}
            {fuelType && (
              <span
                aria-label={`Carburant : ${fuelType.label}`}
                title={fuelType.label}
                className={clsx("inline-flex items-center justify-center border border-sky-200/75 bg-[#061a2e]/90 font-black leading-none tracking-wide text-white shadow-sm shadow-black/40", mobileGrid ? "min-w-0 rounded-sm px-0.5 py-0 text-[8px] sm:min-w-8 sm:rounded-md sm:px-1.5 sm:py-0.5 sm:text-[10px]" : "min-w-8 rounded-md px-1.5 py-0.5 text-[10px]")}
              >
                {fuelType.code}
              </span>
            )}
          </div>
        )}
        {hasCollectionNumber && (
          <div aria-label={`Numéro de collection ${collectionNumber}`} className={clsx("absolute z-20 rounded-md border border-white/15 bg-black/70 font-bold tabular-nums text-white/90", mobileGrid ? "bottom-0.5 left-0.5 px-0.5 py-0 text-[6px] sm:bottom-2 sm:left-2 sm:px-1.5 sm:py-0.5 sm:text-[9px]" : "bottom-2 left-2 px-1.5 py-0.5 text-[9px]")}>
            #{collectionNumber}
          </div>
        )}
        {mobileGrid && isFavorite && (
          <span className="absolute left-1/2 top-0.5 z-20 -translate-x-1/2 rounded-full bg-black/75 p-0.5 text-amber-400 sm:hidden" aria-label={t('Favori')}>
            <Star size={12} fill="currentColor" aria-hidden="true" />
          </span>
        )}

        {/* Content Container */}
        <div className={clsx(
          "absolute inset-x-0 z-10 flex flex-col items-center",
          mobileGrid ? "bottom-[7%] sm:bottom-0" : "bottom-0",
          contentPadding,
        )}>

          {/* Title Section */}
          <div className={clsx(
            "min-w-0 w-full text-center",
            mobileGrid && isVehicle ? "relative -top-1 mb-0 sm:static sm:mb-3" : mobileGrid ? "mb-0 sm:mb-3" : compact ? "mb-2" : "mb-3",
            boosterReveal && isVehicle && "relative -translate-y-1",
          )}>
            <h3 className={clsx("font-bold text-white uppercase", mobileGrid ? "line-clamp-2 text-[8px] leading-[9px] tracking-normal sm:line-clamp-none sm:text-lg sm:leading-tight sm:tracking-wider" : compact ? "text-sm leading-tight tracking-wider" : "text-lg leading-tight tracking-wider")}>
              {isVehicle ? (props as any).make : (props as any).name}
            </h3>
            <p className={clsx("text-gray-300 font-medium", mobileGrid ? "truncate text-[7px] leading-[8px] tracking-normal sm:whitespace-normal sm:text-xs sm:leading-normal sm:tracking-wide" : compact ? "text-[10px] tracking-wide" : "text-xs tracking-wide")}>
              {isVehicle ? (
                <>
                  {(props as any).model} · {(props as any).year}
                </>
              ) : isDriver ? driverSubtitle : circuitSubtitle}
            </p>
          </div>

          {/* Vehicle stats */}
          {isVehicle && (
            <div className={clsx(
              "grid w-full grid-cols-2 text-center text-gray-200",
              mobileGrid
                ? "mb-0 grid-rows-2 items-center gap-x-1 gap-y-1 px-0 [&_svg]:h-[7px] [&_svg]:w-[7px] sm:mb-2 sm:grid-rows-none sm:gap-x-1.5 sm:gap-y-1 sm:px-2 sm:[&_svg]:h-4 sm:[&_svg]:w-4"
                : compact ? "mb-1.5 gap-x-1.5 gap-y-1 px-0" : "mb-2 gap-x-1.5 gap-y-1 px-2",
            )}>
              <div className="min-w-0">
                <div className={clsx("flex items-center", mobileGrid ? "justify-end gap-0.5 sm:justify-center sm:gap-1" : "justify-center gap-1")}>
                  <VehicleStatIcon kind="engine" />
                  <div className="min-w-0 text-left">
                    <p className={clsx("font-medium uppercase text-gray-400", mobileGrid ? "sr-only max-w-full truncate text-[5px] leading-[7px] tracking-tight sm:not-sr-only sm:text-[8px] sm:leading-normal sm:tracking-wide" : "text-[8px] tracking-wide")}>{t('Puissance')}</p>
                    <p className={clsx("font-semibold", mobileGrid ? "max-w-full truncate whitespace-nowrap text-[5px] leading-[7px] tabular-nums tracking-tight sm:whitespace-normal sm:text-[11px] sm:leading-normal sm:normal-nums" : compact ? "text-[9px]" : "text-[11px]")}>
                      {formatPower(power_hp, units, language, Number((props as any).power_kw) || undefined)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <div className={clsx("flex items-center", mobileGrid ? "justify-start gap-0.5 sm:justify-center sm:gap-1" : "justify-center gap-1")}>
                  <VehicleStatIcon kind="torque" />
                  <div className="min-w-0 text-left">
                    <p className={clsx("font-medium uppercase text-gray-400", mobileGrid ? "sr-only max-w-full truncate text-[5px] leading-[7px] tracking-tight sm:not-sr-only sm:text-[8px] sm:leading-normal sm:tracking-wide" : "text-[8px] tracking-wide")}>{t('Couple')}</p>
                    <p className={clsx("font-semibold", mobileGrid ? "max-w-full truncate whitespace-nowrap text-[5px] leading-[7px] tabular-nums tracking-tight sm:whitespace-normal sm:text-[11px] sm:leading-normal sm:normal-nums" : compact ? "text-[9px]" : "text-[11px]")}>
                      {formatTorque(torque_nm, units, language)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <div className={clsx("flex items-center", mobileGrid ? "-translate-x-1 justify-end gap-0.5 sm:translate-x-0 sm:justify-center sm:gap-1" : "justify-center gap-1")}>
                  <VehicleStatIcon kind="acceleration" />
                  <div className="min-w-0 text-left">
                    <p className={clsx("font-medium uppercase text-gray-400", mobileGrid ? "sr-only max-w-full truncate text-[5px] leading-[7px] tracking-tight sm:not-sr-only sm:text-[8px] sm:leading-normal sm:tracking-wide" : "text-[8px] tracking-wide")}>{t('0 à 100 km/h')}</p>
                    <p className={clsx("font-semibold", mobileGrid ? "max-w-full truncate whitespace-nowrap text-[5px] leading-[7px] tabular-nums tracking-tight sm:whitespace-normal sm:text-[11px] sm:leading-normal sm:normal-nums" : compact ? "text-[9px]" : "text-[11px]")}>
                      {acceleration !== null && acceleration !== undefined ? `${acceleration} s` : '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <div className={clsx("flex items-center", mobileGrid ? "justify-start gap-0.5 sm:justify-center sm:gap-1" : "justify-center gap-1")}>
                  <VehicleStatIcon kind="weight" />
                  <div className="min-w-0 text-left">
                    <p className={clsx("font-medium uppercase text-gray-400", mobileGrid ? "sr-only max-w-full truncate text-[5px] leading-[7px] tracking-tight sm:not-sr-only sm:text-[8px] sm:leading-normal sm:tracking-wide" : "text-[8px] tracking-wide")}>{t('Poids')}</p>
                    <p className={clsx("font-semibold", mobileGrid ? "max-w-full truncate whitespace-nowrap text-[5px] leading-[7px] tabular-nums tracking-tight sm:whitespace-normal sm:text-[11px] sm:leading-normal sm:normal-nums" : compact ? "text-[9px]" : "text-[11px]")}>
                      {formatWeight(rawWeight, units, language)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid 2x2 for Circuits */}
          {isCircuit && (
            <div className={clsx(
              "grid w-full grid-cols-2 font-semibold text-gray-200",
              mobileGrid
                ? "mb-0 grid-rows-2 items-center gap-x-1 gap-y-1 px-0 text-[6px] leading-[8px] [&_svg]:h-2 [&_svg]:w-2 sm:mb-3 sm:grid-rows-none sm:gap-x-6 sm:gap-y-2 sm:px-2 sm:text-xs sm:leading-normal sm:[&_svg]:h-[14px] sm:[&_svg]:w-[14px]"
                : compact ? "mb-2 gap-x-1 gap-y-2 px-0 text-[10px]" : "mb-3 gap-x-6 gap-y-2 px-2 text-xs",
            )}>
              <div className={clsx("flex min-w-0 items-center", mobileGrid ? "justify-start gap-0.5 overflow-hidden sm:justify-end sm:gap-1.5 sm:overflow-visible" : "justify-end gap-0.5 sm:gap-1.5")}>
                <MoveRight size={14} className="text-blue-400" />
                <span className={clsx(mobileGrid && "min-w-0 truncate sm:overflow-visible")}>{formatDistance(Number(length_km) || 0, units, language)}</span>
              </div>
              <div className={clsx("flex min-w-0 items-center", mobileGrid ? "justify-start gap-0.5 overflow-hidden sm:gap-1.5 sm:overflow-visible" : "justify-start gap-0.5 sm:gap-1.5")}>
                <Compass size={14} className="text-green-400" />
                <span className={clsx(mobileGrid && "min-w-0 truncate sm:overflow-visible")}>{turns} {t('virages')}</span>
              </div>
              <div className={clsx("flex min-w-0 items-center", mobileGrid ? "justify-start gap-0.5 overflow-hidden sm:justify-end sm:gap-1.5 sm:overflow-visible" : "justify-end gap-0.5 sm:gap-1.5")}>
                <ArrowUpCircle size={14} className="text-yellow-400" />
                <span className={clsx(mobileGrid && "min-w-0 truncate sm:overflow-visible")}>{formatDistance(Number(straight_km) || 0, units, language)} {t('ligne')}</span>
              </div>
              <div className={clsx("flex min-w-0 items-center", mobileGrid ? "justify-start gap-0.5 overflow-hidden sm:gap-1.5 sm:overflow-visible" : "justify-start gap-0.5 sm:gap-1.5")}>
                <Wind size={14} className="text-orange-400" />
                <span className={clsx(mobileGrid && "min-w-0 truncate sm:overflow-visible")}>{circuit_type}</span>
              </div>
            </div>
          )}

          {isDriver && (
            <div className={clsx(
              "grid w-full grid-cols-2 font-semibold text-gray-200",
              mobileGrid
                ? "mb-0 grid-rows-2 items-center gap-x-1 gap-y-1 px-0 text-[6px] leading-[8px] sm:mb-3 sm:gap-x-3 sm:gap-y-2 sm:px-2 sm:text-xs sm:leading-normal"
                : compact ? "mb-2 gap-x-2 gap-y-2 px-0 text-[10px]" : "mb-3 gap-x-3 gap-y-2 px-2 text-xs",
            )}>
              <div className="flex min-w-0 items-center justify-start gap-1">
                <Trophy size={14} className="shrink-0 text-amber-300" />
                <span className={clsx(mobileGrid && "min-w-0 truncate sm:overflow-visible")}>
                  {(props as any).world_championships || 0} {t('titres')}
                </span>
              </div>
              {[
                ['MON', (props as any).won_monaco_gp, 'Grand Prix de Monaco'],
                ['IND', (props as any).won_indy_500, '500 miles d’Indianapolis'],
                ['LEM', (props as any).won_24h_le_mans, '24 Heures du Mans'],
              ].map(([label, won, event]) => (
                <div key={String(label)} className="flex min-w-0 items-center justify-start gap-1" title={String(event)}>
                  {won
                    ? <Check size={12} className="shrink-0 text-emerald-300" aria-label={`${event} remporté`} />
                    : <span aria-hidden="true" className="w-3 shrink-0 text-center text-gray-500">—</span>}
                  <span className={clsx(mobileGrid && "min-w-0 truncate sm:overflow-visible")}>{label}</span>
                </div>
              ))}
            </div>
          )}

        </div>
        {isVehicle && drivetrainLayoutIcon && (
          <div
            className={clsx("absolute z-20 cursor-help", mobileGrid ? "bottom-1.5 right-1.5 sm:bottom-2 sm:right-2" : "bottom-2 right-2")}
            title={drivetrainLayoutDescription
              ? `${drivetrainLayout}: ${drivetrainLayoutDescription}`
              : `Configuration moteur et transmission ${drivetrainLayout}`}
            aria-label={drivetrainLayoutDescription
              ? `${drivetrainLayout} : ${drivetrainLayoutDescription}`
              : `Configuration moteur et transmission ${drivetrainLayout}`}
          >
            <SafeImage
              src={drivetrainLayoutIcon}
              alt=""
              aria-hidden="true"
              width={compact ? 54 : 68}
              height={compact ? 28 : 36}
              showPlaceholderOnError={false}
              className={clsx("h-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", mobileGrid ? "w-6 sm:w-[68px]" : compact ? "w-[54px]" : "w-[68px]")}
            />
          </div>
        )}
      </div>

      {/* This collection-only badge must respect showLevel (booster draws hide levels). */}
      {mobileGrid && showLevel && (
        <div className="flex min-h-[25px] w-full items-start justify-center sm:hidden">
          {owned && count > 0 ? (
            <button
              type="button"
              disabled={upgradePending}
              onClick={(event) => {
                event.stopPropagation();
                if (isVehicle && upgradeAvailable && onUpgrade) onUpgrade();
                else handleCardClick();
              }}
              aria-label={isVehicle
                ? upgradeAvailable && onUpgrade && upgradePrice !== undefined
                  ? `${count} ${t('Exemplaires')}, ${t('Niveau')} ${level}. ${t('Acheter le niveau {level} pour {price} AP', { level: level + 1, price: upgradePrice })}`
                  : `${count} ${t('Exemplaires')}, ${t('Niveau')} ${level}. ${t('Voir les détails')}`
                : `${count} ${t('Exemplaires')}. ${t('Voir les détails')}`}
              className={clsx(
                "flex h-[23px] w-full min-w-0 items-center justify-between gap-0.5 rounded-md border px-0.5 py-0 text-[9px] font-black tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-60",
                isVehicle && upgradeAvailable && onUpgrade
                  ? "border-cyan-400/70 bg-cyan-500/25 text-cyan-100"
                  : "border-blue-500/25 bg-blue-600/20 text-blue-100",
              )}
            >
              <span className="min-w-0 truncate">×{count}</span>
              {isVehicle && <span className="shrink-0 text-[8px] leading-tight">{t('Niveau')} {level}</span>}
              {isVehicle && upgradeAvailable && onUpgrade
                ? <ArrowUpCircle size={10} className="shrink-0 text-cyan-300" aria-hidden="true" />
                : <ChevronRight size={10} className="shrink-0 text-blue-300" aria-hidden="true" />}
            </button>
          ) : <span className="h-[23px] w-full" aria-hidden="true" />}
        </div>
      )}

      {/* Discrete Level Below Card */}
      {showLevel && isVehicle && owned && (
        <div className={clsx("items-center gap-2", mobileGrid ? "hidden sm:flex" : "flex")}>
          {upgradeAvailable && upgradePrice !== undefined && onUpgrade ? (
            <button
              type="button"
              disabled={upgradePending}
              onClick={(event) => {
                event.stopPropagation();
                onUpgrade();
              }}
              onKeyDown={(event) => event.stopPropagation()}
              aria-label={t('Acheter le niveau {level} pour {price} AP', {
                level: level + 1,
                price: upgradePrice,
              })}
              className="rounded-full border border-cyan-300/40 bg-cyan-500 px-3 py-1 text-[10px] font-black uppercase tracking-tight text-white shadow-sm transition hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-60"
            >
              {upgradePending
                ? t('Achat…')
                : t('Niveau {level} · {price} AP', { level: level + 1, price: upgradePrice })}
            </button>
          ) : (
            <span className="rounded-full border border-blue-400/30 bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-white shadow-sm">
              {t('Niveau')} {level}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
