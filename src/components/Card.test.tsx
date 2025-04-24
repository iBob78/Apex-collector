import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('renders card information', () => {
    const cardProps = {
      name: 'Test Card',
      rarity: 'Rare',
      price: '100',
    };

    render(<Card {...cardProps} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Rare')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
