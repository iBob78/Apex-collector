import React from "react";

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
        <img src={imageUrl} alt={name} className="w-full h-40 object-cover mb-2 rounded" />
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
