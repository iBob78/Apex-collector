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
    expect(screen.getByText('9.99')).toBeInTheDocument()
    expect(screen.getByText('Owned')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const mockClick = jest.fn()
    render(<Card card={mockCard} onClick={mockClick} />)
    fireEvent.click(screen.getByText('Test Card'))
    expect(mockClick).toHaveBeenCalledWith(mockCard)
  })
})
