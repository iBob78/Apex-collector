'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
              Apex Collector
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/collection" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/collection' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
              Album
            </Link>
            <Link href="/cards" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/cards' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
              Cartes
            </Link>
            <Link href="/boosters" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/boosters' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
              Boosters
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
