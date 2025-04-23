'use client'

import { useState, useEffect } from 'react'
import CollectionGrid from '@/components/Collection/CollectionGrid'
import { Card } from '@/types/card'
import { createClient } from '@/lib/supabase'

export default function CollectionPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCards = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cards')
        .select('*')
      
      if (error) {
        console.error('Error fetching cards:', error)
        return
      }

      setCards(data)
      setLoading(false)
    }

    fetchCards()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Collection</h1>
      <CollectionGrid cards={cards} />
    </div>
  )
}
