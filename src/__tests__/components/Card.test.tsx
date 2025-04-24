import { render, screen } from '@testing-library/react'
import { Card } from '@/components/Card'

// Un mock très simple de Next/Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt }: { src: string; alt: string }) {
    return <img src={src} alt={alt} />
  }
}))

describe('Card', () => {
  const mockCard = {
    id: '1',
    name: 'Test Card',
    imageUrl: '/test.jpg',
    rarity: 'Common',
    price: 10.99,
    owned: true
  }

  it('renders basic card information', () => {
    render(<Card card={mockCard} />)
    
    // Vérifions juste les éléments de base
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Common')).toBeInTheDocument()
    expect(screen.getByText('0.99')).toBeInTheDocument()
  })
})
