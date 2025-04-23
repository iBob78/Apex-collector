import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CollectionGrid from '../Collection/CollectionGrid'

describe('CollectionGrid Component', () => {
  const mockCards = [
    {
      id: '1',
      name: 'Card One',
      rarity: 'Common' as const,
      type: 'Weapon' as const,
      collection: 'Test',
      image_url: '/test1.jpg',
      owned: true
    },
    {
      id: '2',
      name: 'Card Two',
      rarity: 'Legendary' as const,
      type: 'Legend' as const,
      collection: 'Test',
      image_url: '/test2.jpg',
      owned: false
    }
  ]

  it('renders all cards', () => {
    render(<CollectionGrid cards={mockCards} />)
    expect(screen.getByText('Card One')).toBeInTheDocument()
    expect(screen.getByText('Card Two')).toBeInTheDocument()
  })

  it('filters cards by search', () => {
    render(<CollectionGrid cards={mockCards} />)
    const searchInput = screen.getByPlaceholderText('Search cards...')
    
    fireEvent.change(searchInput, { target: { value: 'One' } })
    
    expect(screen.getByText('Card One')).toBeInTheDocument()
    expect(screen.queryByText('Card Two')).not.toBeInTheDocument()
  })

  it('sorts cards correctly', () => {
    render(<CollectionGrid cards={mockCards} />)
    const sortSelect = screen.getByRole('combobox')
    
    fireEvent.change(sortSelect, { target: { value: 'rarity' } })
    
    const cards = screen.getAllByRole('heading')
    expect(cards[0]).toHaveTextContent('Card Two') // Legendary should be first
    expect(cards[1]).toHaveTextContent('Card One') // Common should be second
  })
})
