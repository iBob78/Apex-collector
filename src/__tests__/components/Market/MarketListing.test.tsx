import { render, screen, fireEvent, act } from '@testing-library/react'
import MarketListing from '@/components/Market/MarketListing'

describe('MarketListing', () => {
  const mockListing = {
    id: '1',
    card: {
      name: 'Test Card',
      rarity: 'Rare',
      price: '100'
    },
    seller: 'seller1',
    price: 100
  }

  it('renders listing information', () => {
    render(<MarketListing {...mockListing} />)
    expect(screen.getByText(mockListing.card.name)).toBeInTheDocument()
    expect(screen.getByText(/seller: seller1/i)).toBeInTheDocument()
    expect(screen.getByText(/price: \$100/i)).toBeInTheDocument()
  })

  it('handles buy action', async () => {
    const onBuy = jest.fn().mockResolvedValue(undefined)
    render(<MarketListing {...mockListing} onBuy={onBuy} />)
    
    const buyButton = screen.getByText(/buy now/i)
    await act(async () => {
      fireEvent.click(buyButton)
    })
    
    expect(onBuy).toHaveBeenCalledWith(mockListing.id)
  })

  it('shows loading state during buy action', async () => {
    const onBuy = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<MarketListing {...mockListing} onBuy={onBuy} />)
    
    const buyButton = screen.getByText(/buy now/i)
    fireEvent.click(buyButton)
    
    expect(await screen.findByText(/processing/i)).toBeInTheDocument()
    expect(buyButton).toBeDisabled()

    // Attendre que le chargement soit terminé
    await act(() => new Promise(resolve => setTimeout(resolve, 150)))
    expect(screen.getByText(/buy now/i)).toBeInTheDocument()
  })

  it('handles missing onBuy prop', () => {
    render(<MarketListing {...mockListing} />)
    const buyButton = screen.getByText(/buy now/i)
    fireEvent.click(buyButton)
    // Ne devrait pas planter
  })
})
