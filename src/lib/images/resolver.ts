/**
 * Image resolution utilities for Supabase Storage and local images.
 * Handles URL construction, fallbacks, and validation.
 */

import { IMAGE_PATHS } from './paths';

// Configuration pour Supabase Storage
const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'assets';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || '';
const STORAGE_ENDPOINT = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}`;

/**
 * Resolves an image key to a full public URL.
 * Handles both absolute URLs and Supabase Storage keys.
 */
export function getPublicImage(key?: string | null): string | undefined {
    if (!key || typeof key !== 'string') return undefined;

    const trimmed = key.trim();
    if (trimmed === '') return undefined;

    // 1. Si c'est déjà une URL complète, on la retourne
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    // 2. Si c'est un chemin local (commence par /), on le retourne
    if (trimmed.startsWith('/')) {
        return trimmed;
    }

    // 3. Construction de la base URL
    if (!SUPABASE_URL) {
        return trimmed.startsWith('/') ? trimmed : `/${trimmed.toLowerCase()}`;
    }

    // Si c'est déjà une URL Supabase, on force le passage en minuscule pour le chemin
    if (trimmed.includes(SUPABASE_URL) && trimmed.includes('/storage/v1/object/public/')) {
        return trimmed.toLowerCase();
    }

    // On s'assure de ne pas doubler le nom du bucket si le chemin commence déjà par celui-ci
    const bucketPrefix = `${BUCKET_NAME}/`;
    const pathWithoutBucket = trimmed.startsWith(bucketPrefix)
        ? trimmed.substring(bucketPrefix.length)
        : trimmed;

    // URL standard: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    // On force TOUT en minuscule car Supabase Storage est sensible à la casse
    const finalUrl = `${STORAGE_ENDPOINT}/${pathWithoutBucket.toLowerCase()}`;

    return finalUrl;
}

/**
 * Normalise une chaîne pour les noms de fichiers (minuscules, tirets).
 */
export function normalize(str?: string | null): string {
    if (!str || typeof str !== 'string') return 'unknown';

    return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Espaces -> tirets
        .replace(/[^a-z0-9-]/g, '')     // Caractères spéciaux supprimés
        .replace(/-+/g, '-')            // Doublons de tirets
        .replace(/^-|-$/g, '');         // Tirets début/fin
}

/**
 * Paramètres pour résoudre une image de carte
 */
export interface CardImageParams {
    category?: 'vehicle' | 'circuit' | string;
    make?: string | null;
    model?: string | null;
    year?: string | number | null;
    name?: string | null;
    country?: string | null;
    image_url?: string | null;
}

/**
 * Résout l'image d'une carte avec stratégie de fallback.
 */
export function resolveCardImage(params: CardImageParams): string | undefined {
    const { category, image_url, make, model, year, name, country } = params;

    // 1. Priorité à image_url déjà présent dans la DB
    if (image_url) {
        const resolved = getPublicImage(image_url);
        if (resolved) return resolved;
    }

    // 2. Génération automatique du chemin basé sur les infos
    if (category === 'circuit') {
        const normalizedName = normalize(name);
        const normalizedYear = year || 'unknown';
        const key = `${IMAGE_PATHS.CIRCUIT_CARD}/${normalizedName}-${normalizedYear}.jpg`;
        return getPublicImage(key);
    } else {
        // Défaut: véhicule
        const normalizedMake = normalize(make);
        const normalizedModel = normalize(model);
        const normalizedYear = year || 'unknown';
        const key = `${IMAGE_PATHS.VEHICLE_CARD}/${normalizedMake}-${normalizedModel}-${normalizedYear}.jpg`;
        return getPublicImage(key);
    }
}

/**
 * Résout le logo d'une marque.
 * Utilise uniquement des minuscules sans espaces.
 */
export function resolveBrandLogo(make?: string | null): string | undefined {
    if (!make) {
        return getPublicImage(IMAGE_PATHS.PLACEHOLDERS.BRAND_LOGO);
    }

    // On utilise normalize pour s'assurer que c'est en minuscules et sans caractères spéciaux
    const normalized = normalize(make).replace(/-/g, ''); // On enlève aussi les tirets pour coller au format "alfaromeo"
    return getPublicImage(`${IMAGE_PATHS.BRAND_LOGO}/${normalized}.png`);
}

/**
 * Résout le drapeau d'un pays.
 * Gère soit le code 2 lettres (it, fr), soit l'emoji drapeau.
 */
export function resolveCountryFlag(countryOrCode?: string | null): string | undefined {
    if (!countryOrCode) return undefined;

    let code = countryOrCode.trim();

    // 1. Détection Silicon / Emoji (conversion 🇲🇽 -> MX)
    if (/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/.test(code)) {
        const chars = Array.from(code);
        const cp1 = chars[0].codePointAt(0);
        const cp2 = chars[1]?.codePointAt(0);

        if (cp1 && cp2) {
            const r1 = cp1 - 0x1F1E6 + 65;
            const r2 = cp2 - 0x1F1E6 + 65;
            code = String.fromCharCode(r1, r2);
        }
    }

    // 2. Normalisation du code
    code = code.toLowerCase();

    // 3. Cas particuliers (noms de pays complets -> codes)
    const mapping: Record<string, string> = {
        'italie': 'it',
        'france': 'fr',
        'autriche': 'at',
        'allemagne': 'de',
        'espagne': 'es',
        'japon': 'jp',
        'usa': 'us',
        'mexique': 'mx',
        'belgique': 'be',
        'monaco': 'mc',
        'royaume-uni': 'gb',
        'canada': 'ca',
        'australie': 'au',
        'brésil': 'br',
        'états-unis': 'us'
    };

    const finalCode = mapping[code] || code;

    // On ne garde que les 2 premiers caractères pour être sûr
    const cleanCode = finalCode.substring(0, 2);

    return getPublicImage(`${IMAGE_PATHS.COUNTRY_LOGO}/${cleanCode}.png`);
}

/**
 * Retourne l'icône de transmission.
 */
export function resolveTransmissionIcon(transmission?: string | null): string {
    const trans = (transmission || 'RWD').toUpperCase();
    if (trans.includes('AWD') || trans.includes('4WD')) return getPublicImage(IMAGE_PATHS.ICONS.TRANSMISSION.AWD)!;
    if (trans.includes('FWD')) return getPublicImage(IMAGE_PATHS.ICONS.TRANSMISSION.FWD)!;
    return getPublicImage(IMAGE_PATHS.ICONS.TRANSMISSION.RWD)!;
}
