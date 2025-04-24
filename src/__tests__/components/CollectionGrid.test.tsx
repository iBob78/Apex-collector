import { render, screen, fireEvent } from '@testing-library/react'
import CollectionGrid from '@/components/CollectionGrid'

describe('CollectionGrid Component', () => {
  const mockCards = [
    {
      id: '1',
      name: 'Card 1',
      imageUrl: '/test1.jpg',
      rarity: 'Common',
      price: 9.99,
      owned: true
    },
    {
      id: '2',
      name: 'Card 2',
      imageUrl: '/test2.jpg',
      rarity: 'Rare',
      price: 19.99,
      owned: false
    }
  ]

  it('renders all cards', () => {
    render(<CollectionGrid cards={mockCards} />)
    
    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
  })

  it('handles card clicks', () => {
    const handleCardClick = jest.fn()
    render(<CollectionGrid cards={mockCards} onCardClick={handleCardClick} />)
    
    fireEvent.click(screen.getByText('Card 1'))
    
    expect(handleCardClick).toHaveBeenCalledWith(mockCards[0])
  })
})
