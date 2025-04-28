import { render, screen, fireEvent } from '@testing-library/react';
import CollectionGrid from '@/components/CollectionGrid';
import { Card } from '@/types/card';

describe('CollectionGrid', () => {
  const mockCards: Card[] = [
    {
      id: '1',
      name: 'Test Card 1',
      rarity: 'common',
      manufacturer: 'Test Maker',
      year: 2025,
      stats: {
        speed: 85,
        handling: 80,
        endurance: 90,
        tech: 85
      }
    },
    {
      id: '2',
      name: 'Test Card 2',
      rarity: 'rare',
      manufacturer: 'Test Maker',
      year: 2025,
      stats: {
        speed: 90,
        handling: 85,
        endurance: 95,
        tech: 88
      }
    }
  ];

  it('renders loading state correctly', () => {
    render(<CollectionGrid cards={[]} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders cards correctly', () => {
    render(<CollectionGrid cards={mockCards} />);
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    expect(screen.getByText('Test Card 2')).toBeInTheDocument();
  });

  it('handles card click events', () => {
    const onCardClick = jest.fn();
    render(<CollectionGrid cards={mockCards} onCardClick={onCardClick} />);
    
    fireEvent.click(screen.getByText('Test Card 1'));
    expect(onCardClick).toHaveBeenCalledWith(mockCards[0]);
  });

  it('displays empty message when no cards present', () => {
    render(<CollectionGrid cards={[]} />);
    expect(screen.getByText('No cards in collection')).toBeInTheDocument();
  });
});
