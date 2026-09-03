import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // 1. Handle Academy Subdomain (e.g., academy.localhost:3000 or academy.yourdomain.com)
  if (host.startsWith('academy.')) {
    const pathname = url.pathname;
    
    // Ignore static assets, APIs, and Next.js internal requests
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-academy-subdomain', 'true');

    // Check if the path already has a locale (e.g., /en/ or /hi/)
    const hasLocale = /^\/(en|hi)(\/|$)/.test(pathname);
    
    // If the path doesn't already contain /academy, rewrite it
    if (!pathname.includes('/academy')) {
      if (hasLocale) {
        // Example: /hi/auth/login -> /hi/academy/auth/login
        url.pathname = pathname.replace(/^\/(en|hi)/, (match) => `${match}/academy`);
      } else {
        // Example: /auth/login -> /en/academy/auth/login (Defaults to 'en')
        url.pathname = `/en/academy${pathname === '/' ? '' : pathname}`;
      }
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders }
      });
    }
    
    // If it already includes /academy but lacks a locale, enforce the default locale
    if (!hasLocale) {
       url.pathname = `/en${pathname}`;
       return NextResponse.rewrite(url, {
         request: { headers: requestHeaders }
       });
    }
    
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // 2. Normal Request Handling (Main Website)
  return intlMiddleware(request);
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api|_next|_vercel|.*\\..*).*)',
    ]
};
