import DOMPurify from 'dompurify';

// Add a hook to selectively make external links open in a new tab (Client-side)
if (typeof window !== 'undefined' && DOMPurify.isSupported) {
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
}

/**
 * Lightweight, zero-JSDOM server-side sanitizer for SSR.
 * Strips active scripts/handlers and formats external links safely without any heavy Node DOM emulation.
 */
function sanitizeServerHtml(html: string): string {
    if (!html) return '';

    // 1. Remove script tags
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // 2. Remove dangerous inline event handlers (onerror, onload, onclick, etc.)
    clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

    // 3. Remove javascript: pseudo-protocol in href/src
    clean = clean.replace(/(href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1="#"');

    // 4. Ensure external links have target="_blank" and rel="noopener noreferrer"
    clean = clean.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
        const hrefMatch = attrs.match(/href\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+))/i);
        if (!hrefMatch) return match;
        const href = hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '';
        const hrefLower = href.toLowerCase();
        const isInternal = href.startsWith('/') || 
                           href.startsWith('.') || 
                           href.startsWith('#') || 
                           hrefLower.startsWith('mailto:') || 
                           hrefLower.startsWith('tel:') || 
                           hrefLower.includes('sajjadhusainlawassociates.com');

        let newAttrs = attrs;
        if (!isInternal) {
            if (!/target\s*=/i.test(newAttrs)) {
                newAttrs += ' target="_blank"';
            } else {
                newAttrs = newAttrs.replace(/target\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/i, 'target="_blank"');
            }
            if (!/rel\s*=/i.test(newAttrs)) {
                newAttrs += ' rel="noopener noreferrer"';
            } else {
                newAttrs = newAttrs.replace(/rel\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/i, 'rel="noopener noreferrer"');
            }
        } else {
            newAttrs = newAttrs.replace(/\s*target\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
        }
        return '<a' + newAttrs + '>';
    });

    return clean;
}

/**
 * Sanitizes an HTML string while preserving rich media (iframes, video, audio)
 * and ensuring all links safely open in a new tab.
 * 
 * Works seamlessly and fast on both client and server without JSDOM.
 * 
 * @param html The dirty HTML string
 * @returns The sanitized HTML string
 */
export const sanitizeHtml = (html: string | undefined | null): string => {
    if (!html) return '';

    // If running in browser where window exists, use full DOMPurify with native DOM
    if (typeof window !== 'undefined' && DOMPurify.isSupported) {
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
    }

    // Server-side (Node.js / SSR / Edge): Fast, lightweight string sanitization without heavy JSDOM
    return sanitizeServerHtml(html);
};
