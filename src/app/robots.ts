import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sajjadhusainlawassociates.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/*opengraph-image*', // Explicitly allow social share images
                ],
                disallow: [
                    '/admin/',       // Don't index the admin panel
                    '/api/',         // Don't index API routes
                    '/search',       // Don't index search page
                ],
            },
            {
                userAgent: 'Mediapartners-Google',
                allow: '/',
            },
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'ClaudeBot',
                    'Claude-Web',
                    'PerplexityBot',
                    'Google-Extended',
                    'Applebot-Extended',
                    'Amazonbot',
                ],
                allow: [
                    '/',
                    '/llms.txt',
                    '/llms-full.txt',
                ],
                disallow: [
                    '/admin/',
                    '/api/',
                    '/dashboard/private/',
                    '/search',
                ],
            }
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
