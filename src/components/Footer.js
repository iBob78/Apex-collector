import Link from 'next/link';

const footerLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/collection', label: 'Garage' },
  { href: '/cards', label: 'Cartes' },
  { href: '/boosters', label: 'Boosters' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/missions', label: 'Missions' },
  { href: '/achievements', label: 'Succès' },
  { href: '/profile', label: 'Profil' },
  { href: '/settings', label: 'Réglages' },
  { href: '/how-to-play', label: 'How to play' },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#080808] text-sm text-gray-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-6 sm:px-6 md:flex-row md:justify-between">
        <nav aria-label="Navigation de pied de page" className="flex flex-wrap justify-center gap-x-5 gap-y-3">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs text-gray-600 md:text-right">
          © {new Date().getFullYear()} Apex Collector
        </p>
      </div>
    </footer>
  );
}