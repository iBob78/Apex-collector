"use client";

import Link from "next/link";

export default function Menu() {
  const links: { label: string; href: string }[] = [
    { label: "🏠 Accueil", href: "/" },
    { label: "🗂️ Collection", href: "/collection" },
    { label: "🛒 Marché", href: "/market" },
    { label: "⚙️ Paramètres", href: "/settings" },
  ];

  return (
    <aside className="w-64 h-full bg-gray-800 text-white p-4 space-y-4">
      <h2 className="text-xl font-bold">Menu</h2>
      <nav className="space-y-2">
        {links.map(({ label, href }, index) => (
          <Link key={index} href={href} className="block p-2 hover:bg-gray-700 rounded">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
