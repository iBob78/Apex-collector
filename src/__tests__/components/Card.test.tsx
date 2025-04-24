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
    
    // Test du prix avec une fonction de test
    const priceElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             content.includes('$') && 
             content.includes('99.99')
    })
    expect(priceElement).toBeInTheDocument()
    
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

  it('hides loading placeholder after image load', () => {
    render(<Card card={mockCard} />)
    const img = screen.getByAltText('Test Card')
    fireEvent.load(img)
    expect(screen.queryByTestId('loading-placeholder')).not.toBeInTheDocument()
  })
})
