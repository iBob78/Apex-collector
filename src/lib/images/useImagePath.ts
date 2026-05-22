/**
 * React hook for image URL resolution with fallback support.
 * Handles Supabase Storage keys, full URLs, and null/undefined values safely.
 */

'use client';

import { useState, useEffect } from 'react';
import { getPublicImage } from './resolver';

/**
 * Hook to resolve image URLs with fallback support.
 * Returns undefined if no valid image can be resolved.
 * 
 * @param key - Primary image key or URL
 * @param fallback - Fallback image key or URL
 * @returns Resolved image URL or undefined
 * 
 * @example
 * const imageUrl = useImagePath('cards/vehicle/ferrari-488-gtb-2015.jpg', 'placeholders/vehicle-placeholder.png');
 * // Returns full Supabase URL or fallback
 */
export function useImagePath(
    key?: string | null,
    fallback?: string | null
): string | undefined {
    const [url, setUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        const resolveOne = (maybe?: string | null): string | undefined => {
            if (!maybe || typeof maybe !== 'string' || maybe.trim() === '') {
                return undefined;
            }
            return getPublicImage(maybe.trim());
        };

        const resolved = resolveOne(key) ?? resolveOne(fallback) ?? undefined;
        setUrl(resolved);

        // Debug logging in development
        if (process.env.NODE_ENV !== 'production') {
            console.debug('[useImagePath]', { key, fallback, resolved });
        }
    }, [key, fallback]);

    return url;
}

export default useImagePath;
