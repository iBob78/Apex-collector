'use client';

import clsx from 'clsx';
import IPBadge from './IPBadge';
import SafeImage from './SafeImage';
import { resolveCardImage, resolveBrandLogo, resolveCountryFlag, IMAGE_PATHS } from '@/lib/images';
import type { AnyCard, Transmission } from '@/types/game';
import { useRouter } from 'next/navigation';
import { Zap, Gauge, Wind, Timer, ArrowUpCircle, Compass, MoveRight } from 'lucide-react';
import { getCardLevel, getLevelProgress } from '@/lib/level';
import { getRarityBorderClass } from '@/lib/rarity';

type CardProps = AnyCard & {
  owned?: boolean;
  count?: number;
  showLevel?: boolean;
  compact?: boolean;
};

export default function Card(props: CardProps) {
  const router = useRouter();
  const {
    id: propId,
    image_url,
    rarity,
    image_url: cardImage, // fallback to image_url
    owned = true,
    count = 1,
    showLevel = true,
    compact = false,
  } = props;

  // ID ROBUSTE : card_id d'abord (CSV), puis id
  const id = (props as any).card_id || propId;

  const isVehicle = (props as any).category === 'vehicle' || 'make' in props;
  const isCircuit = (props as any).category === 'circuit' || 'country' in props;

  // Extraction sécurisée des données avec valeurs par défaut
  const power_hp = isVehicle ? Number((props as any).power_hp) || 0 : 0;
  const torque_nm = isVehicle ? (props as any).torque_nm : 0;
  const max_speed_kmh = isVehicle ? (props as any).max_speed_kmh : 0;
  const acceleration = isVehicle ? (props as any).acceleration_0_100 : 0;

  // New Circuit Stats
  const length_km = isCircuit ? (props as any).length_km : 0;
  const turns = isCircuit ? (props as any).turns : 0;
  const straight_km = isCircuit ? (props as any).straight_km : 0;
  const circuit_type = isCircuit ? (props as any).type : '';

  // Correction Poids : On gère le cas où la donnée est déjà en KG (ex: 1060) ou en Tonnes (ex: 1.06)
  const rawWeight = isVehicle ? Number((props as any).weight_t) || 0 : 0;
  const weight_kg = rawWeight > 50 ? rawWeight : rawWeight * 1000;

  const transmission = isVehicle ? (props as any).transmission : undefined;

  // Calcul IP
  const ip = (power_hp > 0 && weight_kg > 0) ? Math.floor((power_hp / weight_kg) * 1000) : 0;

  // Niveau de la carte
  const countValue = Number(props.count ?? count ?? 0);
  const level = getCardLevel(countValue);

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

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 group/card">
      <div
        className={clsx(
          "relative w-full min-w-0 cursor-pointer transition-all duration-300",
          "aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a]",
          "border-[3px]",
          getRarityBorderClass(rarity),
          !owned && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
        )}
        onClick={() => router.push(`/collection/${id}`)}
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

        {/* Top Right Logo / Flag */}
        {isVehicle && (props as any).make && (
          <div className="absolute top-1 right-1 z-10 w-7 h-7">
            <SafeImage
              src={resolveBrandLogo((props as any).make)}
              alt={(props as any).make}
              fill
              className="object-contain"
            />
          </div>
        )}

        {isCircuit && ((props as any).country_code || (props as any).country) && (
          <div className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/10">
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
          <div className="absolute top-1 left-1 z-20 origin-top-left">
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
              {isVehicle ? `${(props as any).model} · ${(props as any).year}` : (props as any).country}
            </p>
          </div>

          {/* Stats Grid 2x2 */}
          {isVehicle && (
            <div className={clsx("grid grid-cols-2 gap-y-2 font-semibold text-gray-200 w-full", compact ? "gap-x-1 text-[10px] mb-2 px-0" : "gap-x-6 text-xs mb-3 px-2")}>
              <div className="flex items-center gap-1.5 justify-end">
                <Zap size={14} className="text-yellow-400" />
                <span>{power_hp} HP</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <Gauge size={14} className="text-orange-400" />
                <span>{torque_nm} Nm</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Wind size={14} className="text-blue-400" />
                <span>{max_speed_kmh} km/h</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <Timer size={14} className="text-green-400" />
                <span>{acceleration} s</span>
              </div>
            </div>
          )}

          {/* Stats Grid 2x2 for Circuits */}
          {isCircuit && (
            <div className={clsx("grid grid-cols-2 gap-y-2 font-semibold text-gray-200 w-full", compact ? "gap-x-1 text-[10px] mb-2 px-0" : "gap-x-6 text-xs mb-3 px-2")}>
              <div className="flex items-center gap-1.5 justify-end">
                <MoveRight size={14} className="text-blue-400" />
                <span>{length_km} km</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <Compass size={14} className="text-green-400" />
                <span>{turns} virages</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <ArrowUpCircle size={14} className="text-yellow-400" />
                <span>{straight_km} km ligne</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <Wind size={14} className="text-orange-400" />
                <span>{circuit_type}</span>
              </div>
            </div>
          )}

          {/* Bottom Metadata : Weight Only */}
          {isVehicle && (
            <div className={clsx("flex items-center text-[10px] text-gray-400", compact ? "gap-2 mb-2" : "gap-4 mb-3")}>
              <span className="flex items-center gap-1">
                ⚖️ {weight_kg} kg
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Discrete Level Below Card */}
      {showLevel && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-sm border border-blue-400/30 uppercase tracking-tight">
            Niveau {level}
          </span>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex-shrink-0">{icon}</div>
      <span className="truncate">{label}</span>
    </div>
  );
}