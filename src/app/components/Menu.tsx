import Link from "next/link";

export default function Menu() {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 shadow-lg min-w-[250px]">
      <h1 className="text-2xl font-bold tracking-wide text-primary-color">
        APEX COLLECTOR
      </h1>

      <nav className="mt-4">
        {[
          { label: "📖 Collection", href: "/collection" },
          { label: "🎴 Boosters", href: "/boosters" },
          { label: "💲 Marché", href: "/market" },
          { label: "🏆 Succès", href: "/success" },
          { label: "⚙️ Paramètres", href: "/settings" },  {/* Ajout du lien vers les paramètres */}
        ].map(({ label, href }, index) => (
          <Link key={index} href={href} className="block p-2 hover:bg-gray-700 rounded">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
