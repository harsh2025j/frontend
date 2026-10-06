import { Suspense } from "react";
import ArticleSkeleton from "@/components/ui/ArticleSkeleton";
import React, { cache } from "react";
import { Metadata } from "next";
import { casesService } from "@/data/services/cases-service/casesService";
import CaseView from "./CaseView";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 3600;

// Marks this route as statically renderable so Next.js serves it via ISR
// instead of rendering it dynamically on every request. Returning an empty
// list prerenders nothing at build time; each path is generated on first
// request and then cached for the `revalidate` window above.
// `dynamicParams` defaults to true, so any slug still resolves.
export function generateStaticParams() {
  return [];
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sajjadhusainlawassociates.com";

interface PageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

const fetchCase = cache(async (slug: string) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const response = isUUID
        ? await casesService.getById(slug)
        : await casesService.getBySlug(slug);
    return response.data.data;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = await params;

    try {
        const caseData = await fetchCase(slug);

        if (!caseData) {
            return {
                title: "Case Not Found | Sajjad Husain Law Associates",
                description: "The requested case could not be found.",
            };
        }

        const title = `${caseData.title || "Legal Case"} | ${caseData.caseNumber || ""} - Case Status`;
        const courtName = caseData.court || "Court";
        const description = `Case No: ${caseData.caseNumber || "N/A"}. Status: ${caseData.status || "Pending"}. Court: ${courtName}. View full case details and hearing updates.`;

        return {
            title,
            description,
            keywords: [
                caseData.caseNumber,
                caseData.cnrNumber,
                caseData.title,
                courtName,
                `${courtName} case status`,
                "case status india",
                "court case update",
            ].filter(Boolean),
            alternates: {
                canonical: `${SITE_URL}/${locale}/cases/${slug}`,
            },
            openGraph: {
                title,
                description,
                type: "article",
                url: `${SITE_URL}/${locale}/cases/${slug}`,
                siteName: "Sajjad Husain Law Associates",
                images: [`${SITE_URL}/logo-gold.png`],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
            },
        };
    } catch {
        return {
            title: "Case Details | Sajjad Husain Law Associates",
            description: "View detailed case information, hearing dates, and status updates on Sajjad Husain Law Associates.",
        };
    }
}

export default async function CaseDetailPage({ params: paramsPromise, caseId: propId, isModal = false }: PageProps & { caseId?: string; isModal?: boolean }) {
    const { slug, locale } = await paramsPromise;
    setRequestLocale(locale);
    const finalId = propId || slug;

    let caseData = null;

    try {
        if (propId) {
            const response = await casesService.getById(propId);
            caseData = response.data.data;
        } else {
            caseData = await fetchCase(slug);
        }
    } catch (error) {
        console.error("Error fetching case for SEO:", error);
    }

    const jsonLd = caseData ? {
        "@context": "https://schema.org",
        "@type": "LegalService",
        "name": caseData.title,
        "description": `Legal case record in ${caseData.court || "Court"}`,
        "identifier": caseData.caseNumber || caseData.cnrNumber,
        "provider": {
            "@type": "Organization",
            "name": "Sajjad Husain Law Associates"
        }
    } : null;

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": `${SITE_URL}/${locale || 'en'}`
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Cases",
                "item": `${SITE_URL}/${locale || 'en'}/cases`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": caseData?.title || "Case Detail",
                "item": `${SITE_URL}/${locale || 'en'}/cases/${finalId}`
            }
        ]
    };

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <Suspense fallback={<ArticleSkeleton />}><CaseView caseId={propId} caseSlug={slug} isModal={isModal} /></Suspense>
        </>
    );
}
