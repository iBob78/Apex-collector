/**
 * Index file for image utilities.
 * Re-exports all image-related functions, constants, and hooks.
 */

// Constants
export { IMAGE_PATHS, getTransmissionIcon } from './paths';
export type { TransmissionType } from './paths';

// Resolvers
export {
    getPublicImage,
    normalize,
    resolveCardImage,
    resolveBrandLogo,
    resolveCountryFlag,
    resolveTransmissionIcon,
} from './resolver';

export type {
    CardImageParams,
} from './resolver';

// Hooks
export { useImagePath } from './useImagePath';
