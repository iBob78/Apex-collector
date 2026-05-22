export default function AchievementBadge({
  title,
  date,
}: {
  title: string;
  date: string;
}) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl space-y-2 shadow">
      <div className="h-20 w-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto" />
      <h3 className="text-center font-semibold">{title}</h3>
      <p className="text-sm text-center text-gray-400">Débloqué le {date}</p>
    </div>
  );
}