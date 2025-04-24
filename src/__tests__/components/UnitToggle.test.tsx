import { render, screen, fireEvent } from '@testing-library/react'
import UnitToggle from '@/components/UnitToggle'

describe('UnitToggle', () => {
  it('displays metric text when isMetric is true', () => {
    render(<UnitToggle isMetric={true} onToggle={() => {}} />)
    expect(screen.getByText('Switch to Imperial')).toBeInTheDocument()
  })

  it('displays imperial text when isMetric is false', () => {
    render(<UnitToggle isMetric={false} onToggle={() => {}} />)
    expect(screen.getByText('Switch to Metric')).toBeInTheDocument()
  })

  it('calls onToggle with opposite value', () => {
    const onToggle = jest.fn()
    render(<UnitToggle isMetric={true} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledWith(false)
  })
})
