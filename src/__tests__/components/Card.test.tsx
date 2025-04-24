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
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             content.includes('99.99')
    })).toBeInTheDocument()
    expect(screen.getByText('Owned')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const mockClick = jest.fn()
    render(<Card card={mockCard} onClick={mockClick} />)
    const cardElement = screen.getByTestId('card')
    fireEvent.click(cardElement)
    expect(mockClick).toHaveBeenCalledWith(mockCard)
  })

  it('shows loading state', () => {
    render(<Card card={mockCard} />)
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument()
  })
})
