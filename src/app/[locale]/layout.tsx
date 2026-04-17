import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ClientLayout from "@/components/layout/ClientWrapper";
import ReduxProvider from "@/data/redux/providers/ReduxProvider";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@/components/ui/GlobalLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AdProvider } from "@/context/AdContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const METADATA_BASE = new URL('https://www.sajjadhusainlawassociates.com'); // production
// const METADATA_BASE = new URL('https://unimpeded-sprung-banter.ngrok-free.dev'); // dev (url)


export const metadata: Metadata = {
  metadataBase: METADATA_BASE,
  description: "Next-Gen Legal Tech",
  icons: {
    icon: "/logo.png",
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { API_BASE_URL, API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES.FETCH_ALL_CATEGORY}`, {
      headers: {
        // "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error("Failed to fetch categories on server:", e);
    return [];
  }
}

async function getArticles(params: any = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ARTICLE.FETCH_ALL}?${queryParams.toString()}`, {
      headers: {
        // "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error("Failed to fetch articles on server:", e);
    return [];
  }
}


export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  // Parallel fetch for speed
  const [categories, latestArticles, financeArticles, legalArticles, hindiArticles] = await Promise.all([
    getCategories(),
    getArticles({ limit: 6 }), // For NewsSlider
    getArticles({ category: "finance-articles", limit: 10 }),
    getArticles({ category: "legal-articles", limit: 10 }),
    getArticles({ category: "hindi-news", limit: 3 }),
  ]);

  const initialHomeData = {
    latestArticles,
    financeArticles,
    legalArticles,
    hindiArticles
  };


  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            <ReduxProvider>
              <AdProvider>
                <ClientLayout
                  initialCategories={categories}
                  initialHomeData={initialHomeData}
                >
                  {children}
                </ClientLayout>


                {/* <GlobalLoader /> */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    // Prevent duplicate toasts
                    style: {
                      maxWidth: '500px',
                    },
                  }}
                />
              </AdProvider>
            </ReduxProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


