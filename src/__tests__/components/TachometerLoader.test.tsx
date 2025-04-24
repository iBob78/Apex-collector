import { render } from '@testing-library/react'
import TachometerLoader from '@/components/TachometerLoader'

describe('TachometerLoader', () => {
  it('renders loader with animation', () => {
    const { container } = render(<TachometerLoader />)
    expect(container.firstChild).toHaveClass('animate-spin')
  })

  it('contains SVG element', () => {
    const { container } = render(<TachometerLoader />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
