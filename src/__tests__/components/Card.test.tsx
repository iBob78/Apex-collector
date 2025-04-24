import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from '@/components'
import type { ImageProps } from 'next/image'

// Mock Next/Image
jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockImage(props: ImageProps) {
    // Omit les props spécifiques à Next/Image
    const { src, alt, onLoad, className } = props
    return (
      <img
        src={src as string}
        alt={alt}
        onLoad={onLoad}
        className={className}
        data-testid="next-image"
      />
    )
  }
})

const mockCard = {
  id: '1',
  name: 'Test Card',
  imageUrl: '/test-image.jpg',
  rarity: 'Legendary',
  price: 99.99,
  owned: true
}

describe('Card Component', () => {
  it('renders correctly', () => {
    render(<Card card={mockCard} />)
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
    expect(screen.getByText('9.99')).toBeInTheDocument()
    expect(screen.getByText('Owned')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<Card card={mockCard} />)
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument()
  })

  it('hides loading state after image loads', () => {
    render(<Card card={mockCard} />)
    const img = screen.getByTestId('next-image')
    
    // Simuler le chargement de l'image
    fireEvent.load(img)
    
    expect(screen.queryByTestId('loading-placeholder')).not.toBeInTheDocument()
  })

  it('handles click events', () => {
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
