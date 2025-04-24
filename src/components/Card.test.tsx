import { render, screen, fireEvent } from '@testing-library/react'
import Card from './Card'

describe('Card', () => {
  const mockCard = {
    name: 'Test Card',
    rarity: 'Rare',
    price: '100',
  }

  it('renders card information', () => {
    render(<Card {...mockCard} />)
    expect(screen.getByText(mockCard.name)).toBeInTheDocument()
    expect(screen.getByText(mockCard.rarity)).toBeInTheDocument()
    expect(screen.getByText(mockCard.price)).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Card {...mockCard} onClick={handleClick} />)
    
    fireEvent.click(screen.getByText(mockCard.name))
    expect(handleClick).toHaveBeenCalled()
  })
})
