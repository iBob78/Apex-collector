import UnitToggle from '../components/UnitToggle';

export default function SettingsPage() {
  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      <p className="text-gray-500">Choisissez vos préférences d'affichage :</p>

      <div>
        <h2 className="text-lg font-semibold mb-2">Unités</h2>
        <UnitToggle />
      </div>
    </main>
  );
}
