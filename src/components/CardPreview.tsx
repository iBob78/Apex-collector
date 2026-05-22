export default function CardPreview({
  name,
  rarity,
  stat,
}: {
  name: string;
  rarity: string;
  stat: string;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="h-40 bg-gray-700 rounded mb-2" />
      <h2 className="font-semibold">{name}</h2>
      <p className="text-sm text-gray-400">Rareté : {rarity}</p>
      <p className="text-sm text-gray-400">{stat}</p>
    </div>
  );
}