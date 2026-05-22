export default function PackCard({
  title,
  description,
  price,
  color,
}: {
  title: string;
  description: string;
  price: number;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-4 shadow text-white ${color}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm">{description}</p>
      <p className="text-sm mt-2">💎 {price}</p>
      <button className="mt-3 bg-black/30 px-3 py-1 rounded hover:bg-black/50 transition">
        Ouvrir
      </button>
    </div>
  );
}