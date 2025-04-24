import { render, screen } from '@testing-library/react';
import CollectionGrid from '@/components/Collection/CollectionGrid';

describe('CollectionGrid', () => {
  it('renders empty collection message when no items', () => {
    render(<CollectionGrid items={[]} />);
    expect(screen.getByText('No items in collection')).toBeInTheDocument();
  });

  it('renders items when provided', () => {
    const items = [
      {
        id: '1',
        name: 'Test Card',
        rarity: 'Rare',
        price: '100'
      }
    ];
    render(<CollectionGrid items={items} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });
});
