/**
 * Centralized image path constants for the entire application.
 * All image paths should reference these constants instead of hardcoded strings.
 * Using Supabase Storage keys (without leading slash).
 */

export const IMAGE_PATHS = {
    /**
     * Vehicle card images
     * Format: cards/vehicle/{make}-{model}-{year}.jpg
     */
    VEHICLE_CARD: 'cards/vehicle',

    /**
     * Circuit card images
     * Format: cards/circuit/{name}-{year}.jpg
     */
    CIRCUIT_CARD: 'cards/circuit',

    /**
     * Brand/manufacturer logos
     * Path in Supabase bucket: logos/brand
     */
    BRAND_LOGO: 'logos/brand',

    /**
     * Country flags for circuits
     * Path in Supabase bucket: logos/country
     */
    COUNTRY_LOGO: 'logos/country',

    /**
     * UI Icons
     */
    ICONS: {
        BASE: 'icons',
        POWER: 'icons/power.svg',
        TORQUE: 'icons/torque.svg',
        SPEED: 'icons/speed.svg',
        ACCELERATION: 'icons/acceleration.svg',
        WEIGHT: 'icons/weight.svg',
        TEMPERATURE: 'icons/temp.svg',
        STEERING: 'icons/steering.svg',
        TYPE: 'icons/type.svg',
        TRANSMISSION: {
            FWD: 'icons/transmission/fwd.svg',
            RWD: 'icons/transmission/rwd.svg',
            AWD: 'icons/transmission/awd.svg',
        },
    } as const,

    /**
     * Placeholder images for fallbacks
     */
    PLACEHOLDERS: {
        CARD_BACK: 'placeholders/card-back.png',
        BRAND_LOGO: 'placeholders/brand-logo.png',
        NO_IMAGE: 'placeholders/no-image.png',
        VEHICLE_CARD: 'cards/vehicle/default.jpg',
        CIRCUIT_CARD: 'placeholders/circuit_default.jpg',
    } as const,
} as const;

/**
 * Type for valid transmission types
 */
export type TransmissionType = keyof typeof IMAGE_PATHS.ICONS.TRANSMISSION;

/**
 * Helper to get transmission icon path
 */
export function getTransmissionIcon(type: TransmissionType): string {
    return IMAGE_PATHS.ICONS.TRANSMISSION[type];
}
