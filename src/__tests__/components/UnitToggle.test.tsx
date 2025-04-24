import { render, screen, fireEvent } from '@testing-library/react'
import UnitToggle from '@/components/UnitToggle'

describe('UnitToggle', () => {
  it('renders toggle button', () => {
    render(<UnitToggle />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('toggles between metric and imperial', () => {
    render(<UnitToggle />)
    const button = screen.getByRole('button')
    
    // Initial state
    expect(button).toHaveTextContent(/Toggle to Imperial/)
    
    // Click to toggle
    fireEvent.click(button)
    expect(button).toHaveTextContent(/Toggle to Metric/)
    
    // Click again to toggle back
    fireEvent.click(button)
    expect(button).toHaveTextContent(/Toggle to Imperial/)
  })
})
