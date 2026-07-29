import React from "react";
import { Metadata } from "next";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import JudgmentView from "./JudgmentView";

// Enable ISR caching for 1 hour to reduce SSR compute costs
export const revalidate = 3600;

// This is the constant site URL for absolute paths in SEO
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sajjadhusainlawassociates.com";

interface PageProps {
    params: {
        slug: string;
        locale: string;
    };
}

/**
 * Dynamic Metadata generation for Judgment pages
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = params;

    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        let response;
        if (isUUID) {
            response = await judgmentsService.getById(slug);
        } else {
            response = await judgmentsService.getBySlug(slug);
        }
        
        const judgment = response.data.data;

        if (!judgment) {
            return { title: "Judgment Not Found" };
        }

        const courtName = judgment.court || judgment.case?.court || "THE HIGH COURT OF JURISDICTION";
        const baseTitle = `${judgment.petitioner || "Petitioner"} vs ${judgment.respondent || "Respondent"} | ${courtName}`;
        const seoTitle = `${baseTitle} | Latest Judgment & Court Order - Sajjad Husain Law Associates`;
        const description = judgment.summary?.replace(/<[^>]*>?/gm, "").slice(0, 160) + "..." || `Judgment record for ${judgment.case?.caseNumber || "this case"}.`;

        return {
            title: seoTitle,
            description,
            keywords: [
                `${judgment.petitioner} vs ${judgment.respondent}`,
                judgment.case?.caseNumber || "",
                courtName,
                "latest judgment",
                "court order",
                "legal decision india",
                "case status update"
            ],
            openGraph: {
                title: seoTitle,
                description,
                type: "article",
                url: `${SITE_URL}/${locale}/judgments/${slug}`,
                images: [`${SITE_URL}/logo-gold.png`],
            },
            twitter: {
                card: "summary_large_image",
                title: seoTitle,
                description,
            }
        };
    } catch (error) {
        return { title: "Judgment Detail | Sajjad Husain Law Associates" };
    }
}

export default async function JudgmentDetailPage({ params: paramsPromise, judgmentId: propId, isModal = false }: PageProps & { judgmentId?: string; isModal?: boolean }) {
    const params = await paramsPromise;
    const { slug, locale } = params || {};
    const finalId = propId || slug;

    // Fetch data for JSON-LD structured data
    let judgment = null;

    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalId);
        let response;
        if (isUUID) {
            response = await judgmentsService.getById(finalId);
        } else {
            response = await judgmentsService.getBySlug(finalId);
        }
        judgment = response.data.data;
    } catch (error) {
        console.error("Error fetching judgment for SEO:", error);
    }

    const jsonLd = judgment ? {
        "@context": "https://schema.org",
        "@type": "LegalDecision",
        "name": `${judgment.petitioner} vs ${judgment.respondent}`,
        "description": judgment.summary?.replace(/<[^>]*>?/gm, "").slice(0, 200),
        "datePublished": judgment.judgmentDate,
        "identifier": judgment.neutralCitationHC || judgment.neutralCitationSC || judgment.case?.caseNumber,
        "jurisdiction": judgment.court || judgment.case?.court,
        "author": {
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
                "name": "Judgments",
                "item": `${SITE_URL}/${locale || 'en'}/judgments`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": judgment ? `${judgment.petitioner} vs ${judgment.respondent}` : "Judgment Detail",
                "item": `${SITE_URL}/${locale || 'en'}/judgments/${finalId}`
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
            <JudgmentView judgmentId={finalId} isModal={isModal} />
        </>
    );
}
