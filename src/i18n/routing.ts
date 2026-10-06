import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'hi'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Disable cookie-based detection to enable Vercel Edge CDN caching (no Set-Cookie on every request)
    localeDetection: false,

    // Ensure all localized routes have the locale prefix (/en/ or /hi/)
    localePrefix: 'always'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
