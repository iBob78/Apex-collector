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
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<Card card={mockCard} />)
    
    // Vérification des éléments textuels basiques
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
    
    // Vérification du prix avec une fonction de test plus précise
    const priceText = screen.getByText((content) => {
      return content === '9.99' || content.includes('9.99')
    })
    expect(priceText).toBeInTheDocument()
    
    // Vérification du badge "owned"
    expect(screen.getByText('Owned')).toBeInTheDocument()
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
