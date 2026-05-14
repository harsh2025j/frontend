import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sajjadhusainlawassociates.com';
const API_BASE = 'https://api.sajjadhusainlawassociates.com';

/**
 * Fetch helper for the production API
 */
async function fetchArticles(page: number) {
    try {
        const res = await fetch(`${API_BASE}/articles?page=${page}&limit=25`);
        if (!res.ok) return [];
        const json = await res.json();
        // Articles are in 'data'
        return Array.isArray(json.data) ? json.data : [];
    } catch (e) {
        return [];
    }
}

async function fetchJudgmentsOrCases(endpoint: string, page: number) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}?page=${page}&limit=25`);
        if (!res.ok) return [];
        const json = await res.json();
        // Judgments and Cases are in 'data.data'
        return Array.isArray(json.data?.data) ? json.data.data : [];
    } catch (e) {
        return [];
    }
}

async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
    } catch (e) {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes
    const staticRoutes = [
        '/en', '/en/news', '/en/judgments', '/en/cases',
        '/en/about', '/en/contact', '/en/privacy-policy', '/en/terms',
    ].map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
    }));

    // 2. Dynamic Routes (fetching 4 pages of each)
    const pages = [1, 2, 3, 4];

    // --- NEWS ARTICLES ---
    const articleResults = await Promise.all(pages.map(p => fetchArticles(p)));
    const articleRoutes = articleResults.flat().map((item: any) => ({
        url: `${SITE_URL}/en/news/${item.slug}`,
        lastModified: new Date(item.updatedAt || item.createdAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    })).filter(r => r.url && !r.url.includes('undefined'));

    // --- JUDGMENTS ---
    const judgmentResults = await Promise.all(pages.map(p => fetchJudgmentsOrCases('/judgments', p)));
    const judgmentRoutes = judgmentResults.flat().map((item: any) => ({
        url: `${SITE_URL}/en/judgments/${item.id}`,
        lastModified: new Date(item.updatedAt || item.judgmentDate || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    })).filter(r => r.url && !r.url.includes('undefined'));

    // --- CASES ---
    const caseResults = await Promise.all(pages.map(p => fetchJudgmentsOrCases('/cases', p)));
    const caseRoutes = caseResults.flat().map((item: any) => ({
        url: `${SITE_URL}/en/cases/${item.id}`,
        lastModified: new Date(item.updatedAt || item.filingDate || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    })).filter(r => r.url && !r.url.includes('undefined'));

    // --- CATEGORIES ---
    const categories = await fetchCategories();
    const categoryRoutes = categories.map((cat: any) => ({
        url: `${SITE_URL}/en/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    })).filter((r: any) => r.url && !r.url.includes('undefined'));

    // Combine and remove duplicates
    const allRoutes = [...staticRoutes, ...articleRoutes, ...judgmentRoutes, ...caseRoutes, ...categoryRoutes];
    const uniqueMap = new Map();
    allRoutes.forEach(r => uniqueMap.set(r.url, r));

    return Array.from(uniqueMap.values()) as MetadataRoute.Sitemap;
}
