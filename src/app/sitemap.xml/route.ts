import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://api.sajjadhusainlawassociates.com';
const LIMIT = 50000;
const MAX_SITEMAPS = { articles: 10000, judgments: 10000, cases: 10000, tags: 7000, categories: 2000 };

export async function GET() {
  const SITE_URL = 'https://www.sajjadhusainlawassociates.com';
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE_URL}/sitemap/static.xml</loc></sitemap>`;

  const endpoints = [
    { key: 'articles', path: '/articles/sitemap' },
    { key: 'judgments', path: '/judgments/sitemap' },
    { key: 'cases', path: '/cases/sitemap' },
    { key: 'tags', path: '/tags/sitemap' },
    { key: 'categories', path: '/categories/sitemap' }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${API_BASE}${ep.path}?limit=${LIMIT}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || {};
        let totalPages = responseData.totalPages || 1;
        
        const maxPages = MAX_SITEMAPS[ep.key as keyof typeof MAX_SITEMAPS];
        if (totalPages > maxPages) totalPages = maxPages;

        for (let i = 1; i <= totalPages; i++) {
          xml += `\n  <sitemap><loc>${SITE_URL}/sitemap/${ep.key}-${i}.xml</loc></sitemap>`;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  xml += '\n</sitemapindex>';
  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}
