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
    expect(screen.getByText('Card One')).toBeInTheDocument()
    expect(screen.getByText('Card Two')).toBeInTheDocument()
    // Utiliser une fonction de test pour les prix avec le $ et le point décimal
    expect(screen.getByText((content) => content.includes('9.99'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('19.99'))).toBeInTheDocument()
  })

  it('handles card clicks', () => {
    const mockClick = jest.fn()
    render(<CollectionGrid cards={mockCards} onCardClick={mockClick} />)
    const cards = screen.getAllByTestId('card')
    fireEvent.click(cards[0])
    expect(mockClick).toHaveBeenCalledWith(mockCards[0])
  })
})
