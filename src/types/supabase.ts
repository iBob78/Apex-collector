export type Database = {
  public: {
    Tables: {
      cards: {
        Row: {
          id: string;
          created_at: string;
          card_id: string;
          name: string;
          rarity: string;
          image_url: string;
          description: string;
          power_hp: number;
          torque_nm: number;
          max_speed_kmh: number;
          weight_t: number;
          make: string;
          model: string;
          year: number;
          acceleration: string;
          popularity: number;
          is_holographic: boolean;
          price_eur: number;
          collection_number: number;
          total_in_collection: number;
        };
      };
      // Ajoutez d'autres tables selon vos besoins
    };
  };
};
