import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-sans">
        <h1 className="title text-4xl mb-8">apex collector</h1>
        <p className="text-sm opacity-50 mb-8">
          Collectionnez, échangez et montrez vos véhicules préférés
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-700 rounded-lg">
            <h2 className="text-2xl mb-4">Collection</h2>
            <p>Gérez votre collection de véhicules et découvrez de nouvelles cartes.</p>
          </div>
          
          <div className="p-6 border border-gray-700 rounded-lg">
            <h2 className="text-2xl mb-4">Marché</h2>
            <p>Achetez et vendez des cartes avec d'autres collectionneurs.</p>
          </div>
          
          <div className="p-6 border border-gray-700 rounded-lg">
            <h2 className="text-2xl mb-4">Boosters</h2>
            <p>Ouvrez des boosters pour obtenir de nouvelles cartes.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
