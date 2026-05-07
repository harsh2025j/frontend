import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sajjadhusainlawassociates.com';

    return {
        rules: {
            userAgent: '*',
            allow: [
                '/',
                '/*opengraph-image*', // Explicitly allow social share images
            ],
            disallow: [
                '/admin/',       // Don't index the admin panel
                '/api/',         // Don't index API routes
                '/search',       // Don't index search pages
                '/zh/',          // Don't index Chinese version
                '/mr/',          // Don't index Marathi version
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
