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
    expect(screen.getByText('.99')).toBeInTheDocument()
    expect(screen.getByText('9.99')).toBeInTheDocument()
  })

  it('handles card clicks', () => {
    const mockClick = jest.fn()
    render(<CollectionGrid cards={mockCards} onCardClick={mockClick} />)
    fireEvent.click(screen.getByText('Card One'))
    expect(mockClick).toHaveBeenCalledWith(mockCards[0])
  })
})
