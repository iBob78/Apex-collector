'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'

export default function OpenBoosterPage() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // 🔐 Vérifie l'utilisateur connecté
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user?.id) {
        setUserId(data.user.id)
      } else {
        router.push('/login')
      }
    }

    getUser()
  }, [router])

  const openBooster = async () => {
    if (!userId) {
      alert("Tu dois être connecté pour ouvrir un booster.")
      return
    }

    setLoading(true)
    const rarities = ['Legend', 'Epic', 'Rare', 'Common']
    const weights = [0.05, 0.15, 0.3, 0.5]

    const pickRarity = () => {
      const rand = Math.random()
      let total = 0
      for (let i = 0; i < rarities.length; i++) {
        total += weights[i]
        if (rand < total) return rarities[i]
      }
      return 'Common'
    }

    const drawn: any[] = []

    for (let i = 0; i < 6; i++) {
      const rarity = pickRarity()
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('rarity', rarity)

      if (data && data.length > 0) {
        const card = data[Math.floor(Math.random() * data.length)]
        drawn.push(card)

        await supabase.from('users_cards').insert({
          user_id: userId,
          card_id: card.card_id,
          obtained_at: new Date().toISOString(),
        })
      }
    }

    setCards(drawn)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-8">
      <h1 className="text-4xl font-bold mb-6">Ouvre ton booster 🎁</h1>

      <button
        onClick={openBooster}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-full text-white font-semibold mb-8 transition"
      >
        {loading ? 'Ouverture du pack...' : 'Ouvrir un booster (6 cartes)'}
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-5xl">
        {cards.map(card => (
          <Card key={card.card_id} card={card} />
        ))}
      </div>
    </div>
  )
}