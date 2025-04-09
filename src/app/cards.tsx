import React from "react";
import Image from "next/image"; // 👈 import du composant optimisé

interface CardProps {
  name: string;
  description?: string;
  imageUrl?: string;
  rarity?: string;
}

const rarityColors: Record<string, string> = {
  common: "text-gray-500",
  rare: "text-blue-500",
  epic: "text-purple-500",
  legendary: "text-orange-500",
};

const Card: React.FC<CardProps> = ({ name, description, imageUrl, rarity }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md bg-white transition-transform transform hover:scale-105">
      {imageUrl && (
        <div className="w-full h-40 relative mb-2 rounded overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill // 👈 rend l'image responsive à son conteneur
            className="object-cover rounded"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900">{name}</h3>
      <p className="text-gray-600">{description || "Pas de description"}</p>
      {rarity && (
        <p className={`mt-2 text-sm font-semibold ${rarityColors[rarity.toLowerCase()] || "text-gray-600"}`}>
          Rareté : {rarity}
        </p>
      )}
    </div>
  );
};

export default Card;
