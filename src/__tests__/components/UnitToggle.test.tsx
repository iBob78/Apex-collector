import { render, screen, fireEvent } from '@testing-library/react';
import UnitToggle from '@/components/UnitToggle';

describe('UnitToggle', () => {
  it('renders toggle button', () => {
    const onToggle = jest.fn();
    render(<UnitToggle isMetric={true} onToggle={onToggle} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggles between metric and imperial', () => {
    const onToggle = jest.fn();
    render(<UnitToggle isMetric={true} onToggle={onToggle} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalled();
  });
});
