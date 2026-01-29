/**
 * Utility function to get a safe image URL
 * Replaces via.placeholder.com URLs with local placeholder
 */
export function getSafeImageUrl(url: any): any {
    // If no URL provided, return local placeholder
    if (!url) {
        return '/placeholder.png';
    }

    // If it's a string, perform checks
    if (typeof url === 'string') {
        if (url.includes('via.placeholder.com')) {
            return '/placeholder.png';
        }
        return url;
    }

    // If it's an object (like StaticImageData), return as is
    return url;
}

/**
 * Check if an image URL is valid
 */
export function isValidImageUrl(url: any): boolean {
    if (!url) return false;
    if (typeof url === 'string') {
        return !url.includes('via.placeholder.com');
    }
    return true; // Assume objects are valid
}
