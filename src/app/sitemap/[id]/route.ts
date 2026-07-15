import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.sajjadhusainlawassociates.com';
const LIMIT = 50000;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const SITE_URL = 'https://www.sajjadhusainlawassociates.com';
  let rawId = (await params).id;
  
  if (rawId.endsWith('.xml')) {
    rawId = rawId.replace('.xml', '');
  }

  if (rawId === 'static') {
    const staticRoutes = [
      '/en', '/en/news', '/en/judgments', '/en/cases', 
      '/en/about', '/en/contact', '/en/privacy-policy', '/en/terms', 
      '/en/cookie-policy', '/en/disclaimer', '/en/editorial-policy'
    ];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (const route of staticRoutes) {
      xml += `\n  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`;
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
      else if (type === 'judgments') url = `${SITE_URL}/en/judgments/${item.id}`;
      else if (type === 'cases') url = `${SITE_URL}/en/cases/${item.id}`;
      else if (type === 'tags') url = `${SITE_URL}/en/tags/${item.slug}`;
      else if (type === 'categories') url = `${SITE_URL}/en/category/${item.slug}`;

      if (url && !url.includes('undefined')) {
        const lastMod = new Date(item.updatedAt || new Date()).toISOString();
        const freq = (type === 'articles' || type === 'categories' || type === 'tags') ? 'weekly' : 'monthly';
        const priority = (type === 'tags') ? '0.7' : '0.9';
        
        xml += `\n  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
      }
    }
    xml += '\n</urlset>';
    
    return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
  } catch (e) {
    return new NextResponse('Error', { status: 500 });
  }
}
