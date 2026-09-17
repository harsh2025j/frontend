import HomeClient from "./HomeClient";
import { HomeDataProvider } from "@/context/HomeDataContext";
import { API_BASE_URL, API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";

// Cache homepage at Edge CDN for 5 minutes (300 seconds)
// This eliminates repeated serverless executions on the homepage while keeping content fresh
export const revalidate = 300;

async function getArticles(params: Record<string, any> = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE.FETCH_ALL}?${queryParams.toString()}`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (e) {
    console.error("Failed to fetch articles on server for home:", e);
    return [];
  }
}

export default async function Home() {
  // Parallel fetch strictly for the Homepage
  const [latestArticles, financeArticles, legalArticles, hindiArticles, judgmentsArticles, bareActsArticles] = await Promise.all([
    getArticles({ limit: 8, status: 'published' }),
    getArticles({ category: "finance-articles", limit: 10, status: 'published' }),
    getArticles({ category: "legal-articles", limit: 10, status: 'published' }),
    getArticles({ category: "hindi-news", limit: 4, status: 'published' }),
    getArticles({ category: "judgments", limit: 6, status: 'published' }),
    getArticles({ category: "bare-acts", limit: 8, status: 'published' }),
  ]);

  const initialHomeData = {
    latestArticles,
    financeArticles,
    legalArticles,
    hindiArticles,
    judgmentsArticles,
    bareActsArticles
  };

  return (
    <HomeDataProvider data={initialHomeData}>
      <HomeClient />
    </HomeDataProvider>
  );
}
