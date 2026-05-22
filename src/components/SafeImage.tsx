/**
 * SafeImage - Enhanced Next.js Image component with robust error handling.
 * Prevents errors from null/undefined sources and provides graceful fallbacks.
 */

'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { getPublicImage } from '@/lib/images';

export type SafeImageProps = Omit<ImageProps, 'src' | 'onError'> & {
    src?: string | null;
    fallback?: string | null;
    showPlaceholderOnError?: boolean;
    placeholderClassName?: string;
};

/**
 * Safe wrapper around Next.js Image component.
 * Handles null/undefined sources and provides fallback mechanisms.
 */
export default function SafeImage(props: SafeImageProps) {
    const {
        src,
        alt = '',
        fallback = null,
        showPlaceholderOnError = true,
        placeholderClassName,
        ...rest
    } = props;

    const [hasError, setHasError] = useState(false);
    const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

    // Resolve src on mount and whenever it changes
    useEffect(() => {
        const primary = getPublicImage(src);
        setResolvedSrc(primary ?? null);
        setHasError(false);
    }, [src]);

    // Handle errors: try fallback, then show placeholder
    const handleError = () => {
        if (process.env.NODE_ENV !== 'production') {
            // console.error('[SafeImage] Failed to load:', resolvedSrc);
        }

        if (!hasError && fallback) {
            const fback = getPublicImage(fallback);
            if (fback) {
                setResolvedSrc(fback);
                setHasError(true);
                return;
            }
        }

        setHasError(true);
        setResolvedSrc(null);
    };

    // Placeholder logic
    if (!resolvedSrc || (hasError && !resolvedSrc)) {
        if (!showPlaceholderOnError) return null;

        const width = 'width' in rest ? rest.width : (rest.fill ? '100%' : 100);
        const height = 'height' in rest ? rest.height : (rest.fill ? '100%' : 100);

        return (
            <div
                className={placeholderClassName || 'bg-gray-800 flex items-center justify-center text-gray-500 text-xs text-center p-2'}
                style={{
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: typeof height === 'number' ? `${height}px` : height,
                }}
            >
                <span>No Image</span>
            </div>
        );
    }

    // Final Image reveal
    // We use any for rest to avoid strict Next.js 15 ImageProps complexity with fill vs width/height
    return (
        <Image
            {...(rest as any)}
            src={resolvedSrc}
            alt={alt}
            onError={handleError}
        />
    );
}
