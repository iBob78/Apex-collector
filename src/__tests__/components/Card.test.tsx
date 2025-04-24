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

  beforeEach(() => {
    // Reset tout état entre les tests
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<Card card={mockCard} />)
    
    // Test du texte visible
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
    expect(screen.getByText('Owned')).toBeInTheDocument()
    
    // Test du prix en utilisant un data-testid
    expect(screen.getByTestId('card-price')).toHaveTextContent('9.99')
  })

  it('shows loading state', () => {
    render(<Card card={mockCard} />)
    const loadingElement = screen.getByTestId('loading-placeholder')
    expect(loadingElement).toBeInTheDocument()
  })

  it('hides loading state after image loads', () => {
    render(<Card card={mockCard} />)
    const img = screen.getByAltText('Test Card')
    
    // Vérifier l'état initial
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument()
    expect(img).toHaveClass('opacity-0')
    
    // Simuler le chargement de l'image
    fireEvent.load(img)
    
    // Vérifier que le placeholder est masqué
    expect(screen.queryByTestId('loading-placeholder')).not.toBeInTheDocument()
    expect(img).toHaveClass('opacity-100')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Card card={mockCard} onClick={handleClick} />)
    
    const cardElement = screen.getByTestId('card')
    fireEvent.click(cardElement)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith(mockCard)
  })

  it('does not show owned badge for non-owned cards', () => {
    const nonOwnedCard = { ...mockCard, owned: false }
    render(<Card card={nonOwnedCard} />)
    expect(screen.queryByText('Owned')).not.toBeInTheDocument()
  })
})
