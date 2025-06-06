import Image from 'next/image'
import { VehicleCard as VehicleCardType } from '@/types/cards'

interface Props {
  card: VehicleCardType
}

export default function VehicleCard({ card }: Props) {
  return (
    <div className="relative w-[250px] h-[333px] rounded-lg overflow-hidden bg-gradient-to-b from-gray-800 to-black border border-gray-700">
      {/* Rareté - Ruban en haut à gauche */}
      <div className={`absolute top-3 left-[-25px] rotate-[-45deg] px-6 py-1 text-[10px] font-bold z-10
        ${card.rarity === 'common' ? 'bg-gray-500' : ''}
        ${card.rarity === 'rare' ? 'bg-blue-500' : ''}
        ${card.rarity === 'epic' ? 'bg-purple-500' : ''}
        ${card.rarity === 'legendary' ? 'bg-yellow-500' : ''}
      `}>
        {card.rarity.toUpperCase()}
      </div>

      {/* Image du véhicule */}
      <div className="relative w-full h-[125px]">
        <Image
          src={card.image_url}
          alt={card.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Informations du véhicule */}
      <div className="p-3">
        <h3 className="text-base font-bold mb-1">{card.name}</h3>
        <p className="text-xs text-gray-300 mb-3 h-[32px] overflow-hidden">{card.description}</p>
        
        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div>
            <span className="text-gray-400">Vitesse:</span>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{ width: `${card.stats.speed}%` }}
              />
            </div>
          </div>
          <div>
            <span className="text-gray-400">Accélération:</span>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${card.stats.acceleration}%` }}
              />
            </div>
          </div>
          <div>
            <span className="text-gray-400">Maniabilité:</span>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-yellow-500 h-1.5 rounded-full" 
                style={{ width: `${card.stats.handling}%` }}
              />
            </div>
          </div>
          <div>
            <span className="text-gray-400">Freinage:</span>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-red-500 h-1.5 rounded-full" 
                style={{ width: `${card.stats.braking}%` }}
              />
            </div>
          </div>
        </div>

        {/* Numéro de série */}
        <div className="absolute bottom-1.5 right-3 text-[10px] text-gray-500">
          #{card.serial_number}
        </div>
      </div>
    </div>
  )
}
