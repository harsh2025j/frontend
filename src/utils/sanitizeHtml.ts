import DOMPurify from 'isomorphic-dompurify';

// Add a hook to ensure all anchor tags open in a new tab and are secure
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if ('target' in node) {
        // Enforce opening in a new tab for all links
        node.setAttribute('target', '_blank');
        // Prevent tabnabbing vulnerabilities
        node.setAttribute('rel', 'noopener noreferrer');
    }
});

/**
 * Sanitizes an HTML string while preserving rich media (iframes, video, audio)
 * and ensuring all links safely open in a new tab.
 * 
 * @param html The dirty HTML string
 * @returns The sanitized HTML string
 */
export const sanitizeHtml = (html: string | undefined | null): string => {
    if (!html) return '';

    return DOMPurify.sanitize(html, {
        // Allow iframe (for YouTube/Vimeo embeds), video, and audio tags
        ADD_TAGS: ['iframe', 'video', 'audio', 'source'],
        
        // Allow attributes necessary for rich media and links
        ADD_ATTR: [
            'allow', 
            'allowfullscreen', 
            'frameborder', 
            'scrolling', 
            'target', 
            'controls', 
            'muted', 
            'loop', 
            'autoplay'
        ]
    }) as string;
};
