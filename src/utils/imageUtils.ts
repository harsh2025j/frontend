/**
 * Utility function to get a safe image URL
 * Replaces via.placeholder.com URLs with local placeholder
 */
export function getSafeImageUrl(url: string | null | undefined): string {
    // If no URL provided, return local placeholder
    if (!url) {
        return '/placeholder.png';
    }

    // If URL contains via.placeholder.com, replace with local placeholder
    if (url.includes('via.placeholder.com')) {
        return '/placeholder.png';
    }

    // Return the original URL
    return url;
}

/**
 * Check if an image URL is valid
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    if (url.includes('via.placeholder.com')) return false;
    return true;
}
