import { Suspense } from "react";
import HomeLoading from "./HomeLoading";
import HomeClient from "./HomeClient";
import { HomeDataProvider } from "@/context/HomeDataContext";
import { API_BASE_URL, API_ENDPOINTS, IS_NGROK } from "@/data/services/apiConfig/apiContants";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 600;

async function getArticles(params: Record<string, any> = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE.FETCH_ALL}?${queryParams.toString()}`, {
      headers: {
        ...(IS_NGROK && { "ngrok-skip-browser-warning": "true" }),
      },
      next: { revalidate: 600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (e) {
    console.error("Failed to fetch articles on server for home:", e);
    return [];
  }
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

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
      <Suspense fallback={<HomeLoading />}><HomeClient /></Suspense>
    </HomeDataProvider>
  );
}
