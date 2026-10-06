import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

function getAcademyHost(host: string): string {
  if (host.startsWith('academy.')) return host;
  const cleanHost = host.replace(/^www\./, '');
  if (cleanHost.startsWith('127.0.0.1')) {
    return cleanHost.replace('127.0.0.1', 'academy.localhost');
  }
  return `academy.${cleanHost}`;
}

function getProtocol(request: NextRequest, host: string): string {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto.split(',')[0].trim();
  }
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http';
  }
  return request.nextUrl.protocol ? request.nextUrl.protocol.replace(':', '') : 'https';
}

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Ignore static assets, APIs, and Next.js internal requests
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // 1. Handle Academy Subdomain (e.g., academy.localhost:3000 or academy.yourdomain.com)
  if (host.startsWith('academy.')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-academy-subdomain', 'true');

    // If an academy URL on the subdomain still contains /academy, clean it up to avoid duplication
    // e.g., academy.localhost:3000/academy/courses -> academy.localhost:3000/courses
    const duplicateAcademyRegex = /^(?:\/(?:en|hi))?\/academy(\/.*)?$/;
    const dupMatch = pathname.match(duplicateAcademyRegex);
    if (dupMatch) {
      const cleanSubpath = dupMatch[1] || '/';
      const cleanUrl = new URL(`${cleanSubpath}${url.search}`, request.url);
      return NextResponse.redirect(cleanUrl, 307);
    }

    // Check if the path already has a locale (e.g., /en/ or /hi/)
    const hasLocale = /^\/(en|hi)(\/|$)/.test(pathname);

    // If the path doesn't already contain /academy, rewrite it to internal app structure
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

  // 2. Main Website: Redirect /academy and /academy/* to academy.domain/*
  // IMPORTANT: Do NOT redirect admin panel routes (e.g., /admin/academy, /en/admin/academy/*)
  const isAdminRoute = /^\/(?:en|hi)?\/admin(\/|$)/.test(pathname) || pathname.includes('/admin');

  if (!isAdminRoute) {
    // 2a. Short verification links (/v/:id) or direct verify paths on main site -> redirect to academy subdomain
    if (pathname.startsWith('/v/') || pathname.startsWith('/certificates/verify/')) {
      const targetHost = getAcademyHost(host);
      const proto = getProtocol(request, host);
      const destination = `${proto}://${targetHost}${pathname}${url.search}`;
      return NextResponse.redirect(new URL(destination), 307);
    }

    const academyRegex = /^(?:\/(?:en|hi))?\/academy(\/.*)?$/;
    const match = pathname.match(academyRegex);

    if (match) {
      const remainingPath = match[1] || '/';
      const normalizedPath = remainingPath.startsWith('/') ? remainingPath : `/${remainingPath}`;
      const targetHost = getAcademyHost(host);
      const proto = getProtocol(request, host);
      const destination = `${proto}://${targetHost}${normalizedPath}${url.search}`;

      return NextResponse.redirect(new URL(destination), 307);
    }
  }

  // 3. Normal Request Handling (Main Website)
  const response = intlMiddleware(request);
  response.headers.delete('set-cookie');
  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};
