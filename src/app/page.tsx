import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-8">
            Bienvenue sur Apex Collector
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Collectionnez les voitures les plus emblématiques du monde
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link href="/collection" 
                  className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg hover:bg-opacity-20 transition-all">
              <h2 className="text-2xl font-bold text-white mb-4">Album</h2>
              <p className="text-gray-300">Explorez votre collection de cartes</p>
            </Link>
            
            <Link href="/cards" 
                  className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg hover:bg-opacity-20 transition-all">
              <h2 className="text-2xl font-bold text-white mb-4">Cartes</h2>
              <p className="text-gray-300">Découvrez toutes les cartes disponibles</p>
            </Link>
            
            <Link href="/boosters" 
                  className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg hover:bg-opacity-20 transition-all">
              <h2 className="text-2xl font-bold text-white mb-4">Boosters</h2>
              <p className="text-gray-300">Ouvrez des boosters pour obtenir de nouvelles cartes</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
