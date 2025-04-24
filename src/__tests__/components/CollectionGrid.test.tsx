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
    
    // Test des noms de cartes
    expect(screen.getByText('Card One')).toBeInTheDocument()
    expect(screen.getByText('Card Two')).toBeInTheDocument()
    
    // Test des prix avec une fonction de test
    const priceElements = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             content.includes('$') &&
             (content.includes('9.99') || content.includes('19.99'))
    })
    expect(priceElements).toHaveLength(2)
    
    // Test des raretés
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

  it('renders empty state when no cards', () => {
    render(<CollectionGrid cards={[]} />)
    expect(screen.getByText('Aucune carte à afficher')).toBeInTheDocument()
  })
})
