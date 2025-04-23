import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Card from '../Card/Card'

describe('Card Component', () => {
  const mockCard = {
    id: '1',
    name: 'Test Card',
    rarity: 'Legendary' as const,
    type: 'Weapon' as const,
    collection: 'Test Collection',
    image_url: '/test-image.jpg',
    owned: true,
    market_price: 99.99
  }

  it('renders correctly', () => {
    render(<Card card={mockCard} />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
    expect(screen.getByText('9.99')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Card card={mockCard} onClick={handleClick} />)
    const cardElement = screen.getByText('Test Card').closest('div')
    if (cardElement) {
      fireEvent.click(cardElement)
      expect(handleClick).toHaveBeenCalledWith(mockCard)
    }
  })
})
