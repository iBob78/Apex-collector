import Card from '@/components/Card';

const carteTest = {
  name: 'Ford Mustang GT',
  make: 'Ford',
  model: 'mustang gt',
  year: 2016,
  image_url: '/images/vehicles/MustangGT.jpg',
  logo_url: '/images/logos/Ford.jpg',
  power_hp: '435',
  torque_nm: '542',
  max_speed_kmh: '250',
  acceleration_0_100: '4.3',
  weight_t: '1.65',
  engine_temp: '90',
  transmission: 'RWD',
};

export default function Page() {
  return (
    <main className="p-6">
      <Card {...carteTest} />
    </main>
  );

}