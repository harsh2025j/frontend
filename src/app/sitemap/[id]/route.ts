import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://api.sajjadhusainlawassociates.com';
const LIMIT = 50000;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const SITE_URL = 'https://www.sajjadhusainlawassociates.com';
  let rawId = (await params).id;

  if (rawId.endsWith('.xml')) {
    rawId = rawId.replace('.xml', '');
  }

  if (rawId === 'static') {
    const staticPaths = [
      '',
      '/about',
      '/contact',
      '/supreme-court',
      '/high-court',
      '/judgments',
      '/cases',
      '/judges',
      '/top-stories',
      '/know-the-law',
      '/privacy-policy',
      '/terms',
      '/cookie-policy',
      '/disclaimer',
      '/editorial-policy'
    ];

    const locales = ['en', 'hi'];
    const staticUrls = [SITE_URL]; // Root URL

    for (const locale of locales) {
      for (const path of staticPaths) {
        staticUrls.push(`${SITE_URL}/${locale}${path}`);
      }
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (const url of staticUrls) {
      const isHome = url === SITE_URL || url === `${SITE_URL}/en` || url === `${SITE_URL}/hi`;
      xml += `\n  <url>\n    <loc>${url}</loc>\n    <changefreq>${isHome ? 'daily' : 'weekly'}</changefreq>\n    <priority>${isHome ? '1.0' : '0.8'}</priority>\n  </url>`;
    }
    xml += '\n</urlset>';
    return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
  }

  const [type, pageStr] = rawId.split('-');
  const page = parseInt(pageStr, 10);

  if (!type || isNaN(page)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const endpointsMap: Record<string, string> = {
    articles: '/articles/sitemap',
    judgments: '/judgments/sitemap',
    cases: '/cases/sitemap',
    tags: '/tags/sitemap',
    categories: '/categories/sitemap'
  };

  const endpointPath = endpointsMap[type];
  if (!endpointPath) return new NextResponse('Not found', { status: 404 });

  try {
    const res = await fetch(`${API_BASE}${endpointPath}?page=${page}&limit=${LIMIT}`);
    if (!res.ok) return new NextResponse('Error fetching data', { status: 500 });

    const json = await res.json();
    const items = Array.isArray(json.data?.data) ? json.data.data : [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (const item of items) {
      let url = '';
      if (type === 'articles') url = `${SITE_URL}/en/news/${item.slug}`;
      else if (type === 'judgments') url = `${SITE_URL}/en/judgments/${item.slug || item.id}`;
      else if (type === 'cases') url = `${SITE_URL}/en/cases/${item.slug || item.id}`;
      else if (type === 'tags') url = `${SITE_URL}/en/tags/${item.slug}`;
      else if (type === 'categories') url = `${SITE_URL}/en/category/${item.slug}`;

      if (url && !url.includes('undefined')) {
        const lastModStr = item.updatedAt ? `\n    <lastmod>${new Date(item.updatedAt).toISOString()}</lastmod>` : '';
        const freq = (type === 'articles' || type === 'categories' || type === 'tags') ? 'weekly' : 'monthly';
        const priority = (type === 'tags') ? '0.7' : '0.9';

        xml += `\n  <url>\n    <loc>${url}</loc>${lastModStr}\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
      }
    }
    xml += '\n</urlset>';

    return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
  } catch (e) {
    return new NextResponse('Error', { status: 500 });
  }
}
