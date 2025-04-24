import { render, screen, fireEvent } from '@testing-library/react'
import CollectionGrid from '@/components/CollectionGrid'

describe('CollectionGrid', () => {
  const mockItems = [
    { id: 1, name: 'Card 1', rarity: 'Common', price: '10' },
    { id: 2, name: 'Card 2', rarity: 'Rare', price: '20' }
  ]

  it('renders empty collection message when no items', () => {
    render(<CollectionGrid items={[]} />)
    expect(screen.getByText(/no items in collection/i)).toBeInTheDocument()
  })

  it('renders items when provided', () => {
    render(<CollectionGrid items={mockItems} />)
    mockItems.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    })
  })

  it('handles card click', () => {
    const onCardClick = jest.fn()
    render(<CollectionGrid items={mockItems} onCardClick={onCardClick} />)
    
    // Cliquer sur le premier card
    const firstCard = screen.getByText(mockItems[0].name).closest('[data-testid="card"]')
    fireEvent.click(firstCard)
    
    expect(onCardClick).toHaveBeenCalledWith(mockItems[0])
  })
})
