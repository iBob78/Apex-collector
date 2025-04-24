import { render, screen, fireEvent } from '@testing-library/react'
import Select from '@/components/ui/select'

describe('Select', () => {
  it('renders select with options', () => {
    render(
      <Select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('handles change events', () => {
    const onChange = jest.fn()
    render(
      <Select onChange={onChange}>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
    expect(onChange).toHaveBeenCalled()
  })
})
