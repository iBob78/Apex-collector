import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('renders card information', () => {
    const cardProps = {
      name: 'Test Card',
      rarity: 'Rare',
      price: '100'
    };

    render(<Card {...cardProps} />);
    
    const elements = [
      screen.getByText('Test Card'),
      screen.getByText('Rare'),
      screen.getByText('100')
    ];
    
    elements.forEach(element => {
      expect(element).toBeInTheDocument();
    });
  });
});
