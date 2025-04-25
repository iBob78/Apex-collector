import { render, screen, fireEvent } from '@testing-library/react'
import CardDisplay from '@/components/cards/CardDisplay'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />
  },
}))

describe('CardDisplay', () => {
  const mockCard = {
    id: '1',
    type: 'Vehicle' as const,
    name: 'Test Car',
    rarity: 'Legendary' as const,
    imageUrl: '/test.jpg',
    releaseSet: 'Test Set',
    isLimited: true,
    serialNumber: 42,
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
    expect(screen.getByText('#42')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClick = jest.fn()
    render(<CardDisplay card={mockCard} onClick={onClick} />)
    fireEvent.click(screen.getByText(mockCard.name))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders stats bars', () => {
    render(<CardDisplay card={mockCard} />)
    expect(screen.getByText('Speed')).toBeInTheDocument()
    expect(screen.getByText('Handling')).toBeInTheDocument()
    expect(screen.getByText('Endurance')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })

  it('applies correct rarity styling', () => {
    const { container } = render(<CardDisplay card={mockCard} />)
    expect(container.firstChild).toHaveClass('bg-yellow-500')
  })
})
