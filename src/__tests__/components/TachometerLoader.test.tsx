import { render } from '@testing-library/react'
import TachometerLoader from '@/components/TachometerLoader'

describe('TachometerLoader', () => {
  it('renders loader', () => {
    const { container } = render(<TachometerLoader />)
    expect(container.firstChild).toHaveClass('animate-spin')
  })
})
