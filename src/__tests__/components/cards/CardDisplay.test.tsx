import { render, screen, fireEvent } from '@testing-library/react'
import CardDisplay from '@/components/cards/CardDisplay'

describe('CardDisplay', () => {
  const mockCard = {
    id: '1',
    name: 'Test Card',
    rarity: 'legendary',
    manufacturer: 'Test Manufacturer',
    year: 2025,
    stats: {
      speed: 90,
      handling: 85,
      endurance: 95,
      tech: 88
    }
  }

  it('renders card information correctly', () => {
    render(<CardDisplay card={mockCard} />)
    expect(screen.getByText(mockCard.name)).toBeInTheDocument()
    expect(screen.getByText(`${mockCard.manufacturer} - ${mockCard.year}`)).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClick = jest.fn()
    render(<CardDisplay card={mockCard} onClick={onClick} />)
    fireEvent.click(screen.getByText(mockCard.name))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders stats correctly', () => {
    render(<CardDisplay card={mockCard} />)
    expect(screen.getByText('Speed')).toBeInTheDocument()
    expect(screen.getByText('90')).toBeInTheDocument()
    expect(screen.getByText('Handling')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('Endurance')).toBeInTheDocument()
    expect(screen.getByText('95')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('88')).toBeInTheDocument()
  })

  it('applies correct rarity styling', () => {
    const { container } = render(<CardDisplay card={mockCard} />)
    const cardElement = container.firstElementChild
    expect(cardElement).toHaveClass('bg-yellow-500')
  })
})
