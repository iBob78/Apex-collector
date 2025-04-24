import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from '@/components/Card'

// Mock Next/Image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad }: { src: string; alt: string; onLoad?: () => void }) {
    return <img src={src} alt={alt} onLoad={onLoad} data-testid="card-image" />
  }
})

describe('Card', () => {
  const mockCard = {
    id: '1',
    name: 'Test Card',
    imageUrl: '/test-image.jpg',
    rarity: 'Rare',
    price: 99.99,
    owned: true
  }

  it('renders card details correctly', () => {
    render(<Card card={mockCard} />)

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Rare')).toBeInTheDocument()
    expect(screen.getByText('9.99')).toBeInTheDocument()
    expect(screen.getByText('Owned')).toBeInTheDocument()
  })

  it('shows loading placeholder and hides it after image loads', () => {
    render(<Card card={mockCard} />)
    
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument()
    
    const image = screen.getByTestId('card-image')
    fireEvent.load(image)
    
    expect(screen.queryByTestId('loading-placeholder')).not.toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Card card={mockCard} onClick={handleClick} />)
    
    fireEvent.click(screen.getByTestId('card'))
    
    expect(handleClick).toHaveBeenCalledWith(mockCard)
  })

  it('does not show owned badge for non-owned cards', () => {
    const nonOwnedCard = { ...mockCard, owned: false }
    render(<Card card={nonOwnedCard} />)
    
    expect(screen.queryByText('Owned')).not.toBeInTheDocument()
  })
})
