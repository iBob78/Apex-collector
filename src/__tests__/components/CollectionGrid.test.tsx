import { render, screen } from '@testing-library/react';
import CollectionGrid from '@/components/Collection/CollectionGrid';

describe('CollectionGrid', () => {
  it('renders empty collection message when no items', () => {
    render(<CollectionGrid items={[]} />);
    expect(screen.getByText(/No items in collection/i)).toBeInTheDocument();
  });
});
