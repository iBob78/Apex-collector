import { render, screen, fireEvent } from '@testing-library/react'
import Card from '@/components/Card'

describe('Card Component', () => {
  const mockCard = {
    id: '1',
    name: 'Test Card',
    imageUrl: '/test-image.jpg',
    rarity: 'Legendary',
    price: 99.99,
    owned: true,
  }

  it('renders correctly', () => {
    render(<Card card={mockCard} />)
    
    // Test du nom et de la rareté
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
    
    // Test du prix avec une regex
    expect(screen.getByText(/$99\.99/)).toBeInTheDocument()
    
    // Test du badge "owned"
    expect(screen.getByText('Owned')).toBeInTheDocument()
    
    // Test du placeholder de chargement
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const mockClick = jest.fn()
    render(<Card card={mockCard} onClick={mockClick} />)
    fireEvent.click(screen.getByTestId('card'))
    expect(mockClick).toHaveBeenCalledWith(mockCard)
  })

  it('handles image load completion', () => {
    render(<Card card={mockCard} />)
    const img = screen.getByAltText('Test Card')
    fireEvent.load(img)
    expect(screen.queryByTestId('loading-placeholder')).not.toBeInTheDocument()
  })
})
