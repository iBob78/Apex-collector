import { render, screen } from '@testing-library/react'
import Menu from '@/components/Menu'

describe('Menu', () => {
  it('renders menu items', () => {
    render(<Menu />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
