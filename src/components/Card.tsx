'use client';
import Image from 'next/image';
import clsx from 'clsx';
import IPBadge from './IPBadge';

type CardProps = {
  image_url: string;
  logo_url: string;
  make: string;
  model: string;
  year: number;
  power_hp: string;
  torque_nm: string;
  max_speed_kmh: string;
  acceleration_0_100: string;
  weight_t: string;
  engine_temp: string;
  transmission: 'FWD' | 'RWD' | 'AWD';
};

export default function Card({
  image_url,
  logo_url,
  make,
  model,
  year,
  power_hp,
  torque_nm,
  max_speed_kmh,
  acceleration_0_100,
  weight_t,
  engine_temp,
  transmission,
}: CardProps) {
  const power = parseInt(power_hp);
  const weight = parseFloat(weight_t) * 1000;
  const ip = Math.floor((power / weight) * 1000);

  const transmissionIcons = {
    FWD: '/icons/transmission/fwd.svg',
    RWD: '/icons/transmission/rwd.svg',
    AWD: '/icons/transmission/awd.svg',
  };

  const countryFlags: Record<string, string> = {
    Ferrari: '🇮🇹',
    Ford: '🇺🇸',
    Audi: '🇩🇪',
    BMW: '🇩🇪',
  };

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-[6px] shadow-lg',
        'w-[176px] aspect-[63/88] text-white font-mono'
      )}
    >
      <Image
        src={image_url}
        alt={`${make} ${model}`}
        fill
        className="object-cover object-center"
      />

      <div className="absolute inset-0 border-[3px] rounded-[6px] pointer-events-none border-yellow-400 shadow-[0_0_8px_2px_rgba(255,215,0,0.4)]" />

      {ip && <IPBadge value={ip} />}

      <div className="absolute top-1 right-1 z-10">
        <Image src={logo_url} alt="logo constructeur" width={20} height={20} />
      </div>

      <div className="absolute bottom-0 w-full bg-black/80 px-2 pt-1 pb-2">
        <p className="text-[11px] font-bold uppercase">
          {make} {countryFlags[make] || ''}
        </p>
        <p className="text-[10px] italic lowercase text-gray-300">
          {model} · {year}
        </p>
        <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-gray-200">
          <Stat icon="/icons/power.svg" label={`${power_hp} HP`} />
          <Stat icon="/icons/torque.svg" label={`${torque_nm} Nm`} />
          <Stat icon="/icons/speed.svg" label={`${max_speed_kmh} km/h`} />
          <Stat icon="/icons/acceleration.svg" label={`${acceleration_0_100} s`} />
          <Stat icon="/icons/weight.svg" label={`${weight} kg`} />
          <Stat icon="/icons/temp.svg" label={`${engine_temp} °C`} />
        </div>
      </div>

      <div className="absolute bottom-1 right-1 opacity-90">
        <Image
          src={transmissionIcons[transmission]}
          alt={transmission}
          width={16}
          height={16}
          className="drop-shadow-[0_0_2px_#0ff]"
        />
      </div>
    </div>
  );
}

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <Image src={icon} alt="" width={12} height={12} />
      <span>{label}</span>
    </div>
  );
}