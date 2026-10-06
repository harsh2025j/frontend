import { Suspense } from "react";
import React from "react";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import TagClient from "./TagClient";

export const revalidate = 1200;

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
 * Generate Dynamic Metadata for Tag pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  // Format slug for title (e.g. supreme-court -> Supreme Court)
  const formattedName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const title = `${formattedName} | Related Law News & Updates - Sajjad Husain Law Associates`;
  const description = `Explore legal reports, news updates, and insights tagged with ${formattedName}. Stay up to date with the latest from Sajjad Husain Law Associates.`;

  const SITE_URL = "https://www.sajjadhusainlawassociates.com";

  return {
    title: title,
    description: description,
    keywords: [
      formattedName,
      `${formattedName} updates`,
      "legal tags",
      "law topics",
      "Sajjad Husain Law Associates",
      "latest legal news"
    ],
    openGraph: {
      title: title,
      description: description,
      url: `${SITE_URL}/${locale}/tags/${slug}`,
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
      canonical: `${SITE_URL}/${locale}/tags/${slug}`,
    }
  };
}

export default async function TagPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Suspense fallback={null}><TagClient /></Suspense>;
}
