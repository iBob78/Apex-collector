interface CardProps {
  name: string;
  rarity: string;
  price: string;
}

const Card = ({ name, rarity, price }: CardProps) => {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{rarity}</p>
      <p>{price}</p>
    </div>
  );
};

export default Card;
