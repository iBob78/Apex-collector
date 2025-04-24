import { render, screen, fireEvent } from '@testing-library/react'
import CollectionGrid from '@/components/CollectionGrid'

describe('CollectionGrid Component', () => {
  const mockCards = [
    {
      id: '1',
      name: 'Card One',
      imageUrl: '/test1.jpg',
      rarity: 'Common',
      price: 9.99,
      owned: true,
    },
    {
      id: '2',
      name: 'Card Two',
      imageUrl: '/test2.jpg',
      rarity: 'Rare',
      price: 19.99,
      owned: false,
    },
  ]

  it('renders all cards', () => {
    render(<CollectionGrid cards={mockCards} />)
    
    // Vérifier les noms des cartes
    expect(screen.getByText('Card One')).toBeInTheDocument()
    expect(screen.getByText('Card Two')).toBeInTheDocument()
    
    // Vérifier les prix avec data-testid
    const prices = screen.getAllByTestId('card-price')
    expect(prices[0]).toHaveTextContent('.99')
    expect(prices[1]).toHaveTextContent('9.99')
    
    // Vérifier les raretés
    expect(screen.getByText('Common')).toBeInTheDocument()
    expect(screen.getByText('Rare')).toBeInTheDocument()
  })

  it('handles card clicks', () => {
    const mockClick = jest.fn()
    render(<CollectionGrid cards={mockCards} onCardClick={mockClick} />)
    const cards = screen.getAllByTestId('card')
    fireEvent.click(cards[0])
    expect(mockClick).toHaveBeenCalledWith(mockCards[0])
  })
})
