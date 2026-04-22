import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sajjadhusainlawassociates.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',       // Don't index the admin panel
                '/api/',         // Don't index API routes
                '/*?*',          // Don't index internal search result URLs with many query params
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
