import { render, screen, fireEvent } from '@testing-library/react'
import Card from '@/components/Card'

describe('Card Component', () => {
  const mockCard = {
    id: '1',
    name: 'Test Card',
    imageUrl: '/test-image.jpg',
    rarity: 'Legendary',
    price: 99.99,
    owned: true
  }

  it('renders correctly', () => {
    render(<Card card={mockCard} />)
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
    expect(screen.getByText('9.99')).toBeInTheDocument()
    expect(screen.getByText('Owned')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<Card card={mockCard} />)
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument()
  })

  it('hides loading state after image loads', () => {
    render(<Card card={mockCard} />)
    const img = screen.getByAltText('Test Card')
    
    // Simuler le chargement de l'image
    fireEvent.load(img)
    
    expect(screen.queryByTestId('loading-placeholder')).not.toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Card card={mockCard} onClick={handleClick} />)
    
    fireEvent.click(screen.getByTestId('card'))
    
    expect(handleClick).toHaveBeenCalledWith(mockCard)
  })

  it('does not show owned badge for non-owned cards', () => {
    const nonOwnedCard = { ...mockCard, owned: false }
    render(<Card card={nonOwnedCard} />)
    expect(screen.queryByText('Owned')).not.toBeInTheDocument()
  })
})
