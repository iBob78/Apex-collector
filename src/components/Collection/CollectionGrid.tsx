import Card from '@/components/Card';

interface CollectionGridProps {
  items?: Array<{
    id: string;
    name: string;
    rarity: string;
    price: string;
  }>;
}

const CollectionGrid = ({ items = [] }: CollectionGridProps) => {
  if (items.length === 0) {
    return <div>No items in collection</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          name={item.name}
          rarity={item.rarity}
          price={item.price}
        />
      ))}
    </div>
  );
};

export default CollectionGrid;
