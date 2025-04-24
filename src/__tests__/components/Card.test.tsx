import { render, screen } from '@testing-library/react'
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
    
    // Test du prix en utilisant une fonction de test plus précise
    const priceText = screen.getByText((content) => 
      content.includes('99.99') && content.includes('$')
    )
    expect(priceText).toBeInTheDocument()
    
    // Test du badge "owned"
    expect(screen.getByText('Owned')).toBeInTheDocument()
    
    // Test du placeholder de chargement
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument()
  })

  it('renders without owned badge for non-owned cards', () => {
    const nonOwnedCard = { ...mockCard, owned: false }
    render(<Card card={nonOwnedCard} />)
    expect(screen.queryByText('Owned')).not.toBeInTheDocument()
  })

  it('handles image loading', () => {
    render(<Card card={mockCard} />)
    const img = screen.getByAltText('Test Card')
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument()
    fireEvent.load(img)
    expect(screen.queryByTestId('loading-placeholder')).not.toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Card card={mockCard} onClick={handleClick} />)
    fireEvent.click(screen.getByTestId('card'))
    expect(handleClick).toHaveBeenCalledWith(mockCard)
  })
})
