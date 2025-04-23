import React from "react";
import Image from "next/image"; // Import du composant Image de Next.js

interface CardProps {
  name: string;
  description?: string;
  imageUrl?: string;
  rarity?: string;
}

const Card: React.FC<CardProps> = ({ name, description, imageUrl, rarity }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md bg-white transition-transform transform hover:scale-105">
      {imageUrl && (
        <div className="w-full h-40 mb-2 relative rounded overflow-hidden">
          {/* Utilisation de <Image /> pour optimiser les images */}
          <Image
            src={imageUrl}
            alt={name}
            className="object-cover"
            layout="fill" // Ajuste l'image pour remplir le conteneur
            sizes="(max-width: 768px) 100vw, 33vw" // Indique à Next.js comment gérer les tailles
          />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900">{name}</h3>
      <p className="text-gray-600">{description || "Pas de description"}</p>
      {rarity && (
        <p className="mt-2 text-sm font-semibold text-blue-600">Rareté : {rarity}</p>
      )}
    </div>
  );
};

export default Card;
