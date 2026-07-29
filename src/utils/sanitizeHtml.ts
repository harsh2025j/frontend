import DOMPurify from 'isomorphic-dompurify';


// Add a hook to selectively make external links open in a new tab
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeName && node.nodeName.toLowerCase() === 'a') {
        const href = node.getAttribute('href');
        if (href) {
            // Check if the link is internal or a special protocol
            const hrefLower = href.toLowerCase();
            const isInternal = href.startsWith('/') || 
                               href.startsWith('.') || 
                               href.startsWith('#') || 
                               hrefLower.startsWith('mailto:') || 
                               hrefLower.startsWith('tel:') || 
                               hrefLower.includes('sajjadhusainlawassociates.com');
            
            if (!isInternal) {
                // Enforce opening in a new tab for external links
                node.setAttribute('target', '_blank');
                // Prevent tabnabbing vulnerabilities
                node.setAttribute('rel', 'noopener noreferrer');
            } else {
                // Ensure internal links don't have target="_blank"
                if (node.getAttribute('target') === '_blank') {
                    node.removeAttribute('target');
                }
            }
        }
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
            'autoplay',
            'style',
            'class'
        ],
        ALLOW_DATA_ATTR: true
    }) as string;
};
