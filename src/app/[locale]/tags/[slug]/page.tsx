import React from "react";
import { Metadata } from "next";
import TagClient from "./TagClient";

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

export default function TagPage() {
  return <TagClient />;
}
