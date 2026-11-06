import { Suspense } from "react";
import React from "react";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import AuthorClient from "./AuthorClient";
import AuthorLoading from "./loading";
import { API_BASE_URL, API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";

export const revalidate = 600;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ username: string; locale: string }>;
}

/**
 * Generate Dynamic Metadata for Author Profile page
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, locale } = await params;

  let authorName = username
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  let bio = `Read articles, case law analyses, and legal commentary written by ${authorName} on Sajjad Husain Law Associates.`;
  let profilePicture: string | undefined;

  try {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(username);
    const endpoint = isMongoId
      ? API_ENDPOINTS.PROFILE.PUBLIC.replace(":id", username)
      : API_ENDPOINTS.PROFILE.BY_USERNAME.replace(":username", username);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: { revalidate: 600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.name) authorName = data.data.name;
      if (data?.data?.bio) bio = data.data.bio.slice(0, 160);
      if (data?.data?.profilePicture) profilePicture = data.data.profilePicture;
    }
  } catch {
    // Fail gracefully with formatted username
  }

  const title = `${authorName} — Author & Legal Contributor | Sajjad Husain Law Associates`;
  const description = bio;
  const SITE_URL = "https://www.sajjadhusainlawassociates.com";

  return {
    title,
    description,
    keywords: [
      authorName,
      `${authorName} articles`,
      `${authorName} lawyer`,
      "legal author",
      "court news author",
      "Sajjad Husain Law Associates",
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/author/${username}`,
      siteName: "Sajjad Husain Law Associates",
      locale,
      type: "profile",
      images: profilePicture ? [{ url: profilePicture, alt: authorName }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profilePicture ? [profilePicture] : undefined,
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { username, locale } = await params;
  setRequestLocale(locale);

  const formattedName = username
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${formattedName}'s Author Page`,
    url: `https://www.sajjadhusainlawassociates.com/${locale}/author/${username}`,
    mainEntity: {
      "@type": "Person",
      name: formattedName,
      jobTitle: "Legal Contributor",
      worksFor: {
        "@type": "LegalService",
        name: "Sajjad Husain Law Associates",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<AuthorLoading />}>
        <AuthorClient username={username} locale={locale} />
      </Suspense>
    </>
  );
}
