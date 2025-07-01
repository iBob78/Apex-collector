// src/components/Carte.tsx

import Image from 'next/image';
import clsx from 'clsx';

export default function Carte({ card, owned = true }: { card: any; owned?: boolean }) {
  const power = parseInt(card.power_hp);
  const weight = parseFloat(card.weight_t) * 1000;
  const ip = power && weight ? Math.floor((power / weight) * 1000) : null;

  const transmissionIcons = {
    FWD: '/icons/transmission/fwd.svg',
    RWD: '/icons/transmission/rwd.svg',
    AWD: '/icons/transmission/awd.svg',
  };

  const countryFlags = {
    Ferrari: '🇮🇹',
    Ford: '🇺🇸',
    Audi: '🇩🇪',
    BMW: '🇩🇪',
    // Ajoute d'autres marques ici
  };

  return (
    <div
      className={clsx(
        'relative rounded-xl overflow-hidden border border-gray-700 bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-lg p-3',
        !owned && 'blur-sm grayscale'
      )}
    >
      {/* Badge IP */}
      {ip && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold tracking-wider z-10">
          IP {ip}
        </div>
      )}

      {/* Logo constructeur */}
      {card.logo_url && (
        <div className="absolute top-2 right-2 z-10">
          <Image src={card.logo_url} alt="logo constructeur" width={32} height={32} />
        </div>
      )}

      {/* Image principale */}
      <div className="relative w-full h-40 rounded-md overflow-hidden">
        <Image
          src={card.image_url}
          alt={card.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Marque + modèle */}
      <div className="mt-3 text-white text-sm">
        <p className="font-bold uppercase">
          {card.make} {countryFlags[card.make] || ''}
        </p>
        <p className="text-gray-300 lowercase italic">
          {card.model} – {card.year}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-200">
        <Stat icon="/icons/power.svg" label={`${card.power_hp} HP`} />
        <Stat icon="/icons/torque.svg" label={`${card.torque_nm} Nm`} />
        <Stat icon="/icons/speed.svg" label={`${card.max_speed_kmh} km/h`} />
        <Stat icon="/icons/acceleration.svg" label={`${card['0-60']} s`} />
        <Stat icon="/icons/weight.svg" label={`${weight} kg`} />
        <Stat icon="/icons/temp.svg" label={`${card.engine_temp || '—'} °C`} />
      </div>

      {/* Transmission */}
      {card.transmission && transmissionIcons[card.transmission] && (
        <div className="absolute bottom-2 right-2 opacity-80">
          <Image
            src={transmissionIcons[card.transmission]}
            alt={card.transmission}
            width={28}
            height={28}
          />
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={icon} alt="" width={16} height={16} />
      <span>{label}</span>
    </div>
  );
}
