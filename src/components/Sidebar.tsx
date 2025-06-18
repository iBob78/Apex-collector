'use client';
import Link from 'next/link';
import { HomeIcon, PackageIcon, GiftIcon, TrophyIcon, SettingsIcon, UserIcon, Layers3Icon } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/marketplace', label: 'Marketplace', icon: PackageIcon },
  { href: '/boosters', label: 'Boosters', icon: GiftIcon },
  { href: '/achievements', label: 'Succès', icon: TrophyIcon },
  { href: '/collection', label: 'Collection', icon: Layers3Icon },
  { href: '/profile', label: 'Profil', icon: UserIcon },
  { href: '/settings', label: 'Réglages', icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 p-6 flex flex-col gap-6 sticky top-0">
      <h1 className="text-xl tracking-widest font-normal lowercase text-blue-500" style={{ fontFamily: 'Arial, sans-serif' }}>
  apex collector
</h1>

      <nav className="flex flex-col gap-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 text-gray-300 hover:text-white transition">
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}