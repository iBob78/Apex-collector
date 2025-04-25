import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-sans text-sm">
        <h1 className="title text-4xl mb-8">apex collector</h1>
        <p className="text-sm opacity-50">
          Collectionnez, échangez et montrez vos véhicules préférés
        </p>
      </div>
    </main>
  )
}
