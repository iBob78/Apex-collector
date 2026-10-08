import { render, screen } from '@testing-library/react';
import IPBadge from '../IPBadge';

const ipClasses: [number, string][] = [
  [0, 'G'],
  [199, 'G'],
  [200, 'F'],
  [299, 'F'],
  [300, 'E'],
  [399, 'E'],
  [400, 'D'],
  [499, 'D'],
  [500, 'C'],
  [599, 'C'],
  [600, 'B'],
  [699, 'B'],
  [700, 'A'],
  [799, 'A'],
  [800, 'S'],
  [999, 'S'],
  [1000, 'SS'],
  [1200, 'SS'],
];

describe('IPBadge', () => {
  it.each(ipClasses)('maps IP %s to class %s', (value, ipClass) => {
    render(<IPBadge value={value} />);

    expect(screen.queryByText(ipClass)).not.toBeNull();
    expect(screen.queryByText(String(value))).not.toBeNull();
  });
});
