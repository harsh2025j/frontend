import { Suspense } from "react";
import CategoryLoading from "./loading";
import React from "react";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import CategoryClient from "./CategoryClient";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";

export const revalidate = 600;

// Marks this route as statically renderable so Next.js serves it via ISR
// instead of rendering it dynamically on every request. Returning an empty
// list prerenders nothing at build time; each path is generated on first
// request and then cached for the `revalidate` window above.
// `dynamicParams` defaults to true, so any slug still resolves.
export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

/**
 * Generate Dynamic Metadata for Category pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  
  // Format slug for title (e.g. crime-news -> Crime News)
  const formattedName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const title = `${formattedName} | Latest Insights & Legal Updates - Sajjad Husain Law Associates`;
  const description = `Browse the latest ${formattedName} reports, case analysis, and legal updates from Sajjad Husain Law Associates. Stay informed with our expert legal insights.`;
  
  const SITE_URL = "https://www.sajjadhusainlawassociates.com";

  return {
    title: title,
    description: description,
    keywords: [
      formattedName,
      `${formattedName} India`,
      "legal updates",
      "court news",
      "law reports",
      "Sajjad Husain Law Associates",
      "latest legal news"
    ],
    openGraph: {
      title: title,
      description: description,
      url: `${SITE_URL}/${locale}/category/${slug}`,
      siteName: "Sajjad Husain Law Associates",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/category/${slug}`,
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Suspense fallback={<CategoryLoading />}><CategoryClient /></Suspense>;
}
