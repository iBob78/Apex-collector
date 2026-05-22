/**
 * Apex Collector - Unified Game Types
 * Consistent with the Supabase schema and UI components.
 */

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legend' | 'Icon';
export type Transmission = 'FWD' | 'RWD' | 'AWD';
export type CardCategory = 'vehicle' | 'circuit';

export interface BaseCard {
    id: string;
    name?: string;
    rarity: Rarity | string;
    image_url?: string;
    created_at?: string;
    description?: string;
}

export interface VehicleCard extends BaseCard {
    category?: 'vehicle';
    make: string;
    model: string;
    year: number;
    power_hp: number | string;
    torque_nm: number | string;
    max_speed_kmh: number | string;
    acceleration_0_100?: string | number;
    weight_t: number | string;
    transmission?: Transmission;
    engine_temp?: string | number;
    logo_url?: string;

    // Nouveaux champs issus de l'export CSV
    power_kw?: number | string;
    cylinder?: string;
    engine_size?: string;
    boost?: string;
    country_code?: string;
}

export interface CircuitCard extends BaseCard {
    category: 'circuit';
    country?: string;
    country_code?: string;
    length_km?: number;
    turns?: number;
    straight_km?: number;
    type?: 'Route' | 'Urbain' | 'Oval';
}

export type AnyCard = VehicleCard | CircuitCard;

export interface UserCard {
    id: string;
    user_id: string;
    card_id: string;
    quantity: number;
    acquired_at: string;
    source?: string;
    card?: AnyCard;
}
