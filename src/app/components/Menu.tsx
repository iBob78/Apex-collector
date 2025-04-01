export default function Menu() {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-3">
        <h1 className="text-2xl font-bold tracking-wide text-primary-color">
          APEX COLLECTOR
        </h1>
        <div className="flex items-center space-x-6">
          <span className="text-sm flex items-center">
            🏎️ <span className="ml-1">Ford Mustang GT</span>
          </span>
          <span className="text-sm flex items-center">
            💰 <span className="ml-1">165,296</span>
          </span>
          <span className="text-sm flex items-center">
            🔰 <span className="ml-1">Niveau 35</span>
          </span>
        </div>
      </div>

      {/* Menu Buttons */}
      <div className="grid grid-cols-4 gap-6 mt-4 text-center">
        {[
          { label: "📖 Collection" },
          { label: "🎴 Boosters" },
          { label: "💲 Marché" },
          { label: "🏆 Succès" },
          { label: "🔧 Paramètres" },
          { label: "🏁 Événements" },
          { label: "🛒 Boutique" },
          { label: "👤 Profil" },
        ].map((item, index) => (
          <button
            key={index}
            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg shadow-md transition-all transform hover:scale-105"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-6 text-sm text-gray-400">
        <button className="hover:text-white transition-colors">🎯 GPS</button>
        <button className="hover:text-white transition-colors">🎥 Caméra</button>
        <button className="hover:text-white transition-colors">🔍 Zoom</button>
        <button className="hover:text-red-400 transition-colors">❌ Quitter</button>
      </div>
    </div>
  );
}
