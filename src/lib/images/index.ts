/**
 * Index file for image utilities.
 * Re-exports all image-related functions, constants, and hooks.
 */

// Constants
export { IMAGE_PATHS, getDrivetrainLayoutIcon, getTransmissionIcon } from './paths';
export type { DrivetrainLayout, TransmissionType } from './paths';

// Resolvers
export {
    getPublicImage,
    normalize,
    buildVehicleKey,
    resolveCardImage,
    resolveBrandLogo,
    resolveCountryFlag,
    resolveTransmissionIcon,
    resolveDrivetrainLayoutIcon,
} from './resolver';

export type {
    CardImageParams,
} from './resolver';

// Hooks
export { useImagePath } from './useImagePath';
