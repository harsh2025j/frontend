import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Merriweather, Unna } from "next/font/google";
import "../globals.css";
import ClientLayout from "@/components/layout/ClientWrapper";
import ReduxProvider from "@/data/redux/providers/ReduxProvider";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@/components/ui/GlobalLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AdProvider } from "@/context/AdContext";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Script from 'next/script';
import GoogleAnalyticsTracker from "@/components/GoogleAnalyticsTracker";

import { API_BASE_URL, API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
});

// const unna = Unna({
//   weight: ['400', '700'],
//   style: ['normal', 'italic'],
//   subsets: ['latin'],
//   variable: '--font-unna',
//   display: 'swap',
// });

const METADATA_BASE = new URL('https://www.sajjadhusainlawassociates.com'); // production
// const METADATA_BASE = new URL('https://unimpeded-sprung-banter.ngrok-free.dev'); // dev (url)


export const metadata: Metadata = {
  metadataBase: METADATA_BASE,
  title: {
    default: "Sajjad Husain Law Associates | News, Judgment & Case Status",
    template: "%s | Legal News & Judgment - Sajjad Husain Law Associates"
  },
  description: "India's premier legal technology platform providing real-time High Court and Supreme Court judgments, latest law news, and a comprehensive case status portal.",
  keywords: [
    "Indian Legal News",
    "Latest High Court Judgments",
    "Supreme Court Orders",
    "Legal Tech India",
    "Case Status Portal",
    "Law Updates Today",
    "Judgment Analysis",
    "Advocate News India",
    "Legal Research Platform",
    "Sajjad Husain Law Associates",
    "Law Journal Online",
    "Court Room Updates",
    "Latest Supreme Court Judgements",
    "High Court Judgements",
    "Legal News"
  ],
  authors: [{ name: "Sajjad Husain Law Associates" }],
  creator: "Sajjad Husain Law Associates",
  publisher: "Sajjad Husain Law Associates",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logoico.png", sizes: "16x16", type: "image/png" },
      { url: "/logoico.png", sizes: "32x32", type: "image/png" },
      { url: "/logoico.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/logoico.png",
    apple: [
      { url: "/logoico.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.sajjadhusainlawassociates.com",
    siteName: "Sajjad Husain Law Associates",
    title: "Sajjad Husain Law Associates | Next-Gen Legal Tech",
    description: "Advanced Legal Technology Platform providing legal insights, judgment analysis, and latest law news in India.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Sajjad Husain Law Associates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sajjad Husain Law Associates | Next-Gen Legal Tech",
    description: "Advanced Legal Technology Platform providing legal insights, judgment analysis, and latest law news in India.",
    creator: "@SajjadHusainLaw",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "2V5MrE-SR9--pjYygKw7KYu269YLinXDRr_MRj1Hy-A",
  }
};


async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES.FETCH_ALL_CATEGORY}`, {
      headers: {
        // "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
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
      next: { revalidate: 60 } // 0 means do not cache, so it updates instantly
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
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
  const headersList = await headers();
  const isAcademySubdomain = headersList.get('x-academy-subdomain') === 'true';

  // Parallel fetch for speed
  const [categories, latestArticles, financeArticles, legalArticles, hindiArticles, judgmentsArticles, bareActsArticles] = await Promise.all([
    getCategories(),
    getArticles({ limit: 8, status: 'published' }), // For NewsSlider and Latest News
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

  const siteUrl = "https://www.sajjadhusainlawassociates.com";
  const siteSearchJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sajjad Husain Law Associates",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/${locale}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };


  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSearchJsonLd) }}
        />
        {/* Google AdSense Script - Replace with your actual publisher ID */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6354615575453705"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Google Analytics Script */}
        <Script
          id="google-analytics-src"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-88RRSP2L7E`}
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-88RRSP2L7E', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${merriweather.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            <ReduxProvider>
              <AdProvider>
                <ClientLayout
                  initialCategories={categories}
                  initialHomeData={initialHomeData}
                  isAcademySubdomain={isAcademySubdomain}
                >
                  {children}
                </ClientLayout>

                <GoogleAnalyticsTracker />
                <Analytics />
                <SpeedInsights />

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


