import React, { cache } from "react";
import { Metadata } from "next";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import JudgmentView from "./JudgmentView";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sajjadhusainlawassociates.com";

interface PageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

const fetchJudgment = cache(async (slug: string) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const response = isUUID
        ? await judgmentsService.getById(slug)
        : await judgmentsService.getBySlug(slug);
    return response.data.data;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = await params;

    try {
        const judgment = await fetchJudgment(slug);

        if (!judgment) {
            return {
                title: "Judgment Not Found | Sajjad Husain Law Associates",
                description: "The requested judgment could not be found.",
            };
        }

        const petitioner = judgment.petitioner || "Petitioner";
        const respondent = judgment.respondent || "Respondent";
        const courtName = judgment.court || judgment.case?.court || "High Court";
        const caseNumber = judgment.case?.caseNumber || "";
        const judgmentDate = judgment.judgmentDate
            ? new Date(judgment.judgmentDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
            : "";

        const seoTitle = `${petitioner} vs ${respondent} | ${courtName} Judgment`;
        const rawSummary = judgment.summary?.replace(/<[^>]*>?/gm, "").trim() || "";
        const description = rawSummary
            ? rawSummary.slice(0, 155) + (rawSummary.length > 155 ? "..." : "")
            : `${courtName} judgment in ${petitioner} vs ${respondent}${caseNumber ? ` (${caseNumber})` : ""}${judgmentDate ? `, dated ${judgmentDate}` : ""}.`;

        const keywords = [
            `${petitioner} vs ${respondent}`,
            caseNumber,
            courtName,
            `${courtName} judgment`,
            judgment.judgmentType,
            "court order",
            "legal decision india",
        ].filter(Boolean);

        return {
            title: seoTitle,
            description,
            keywords,
            alternates: {
                canonical: `${SITE_URL}/${locale}/judgments/${slug}`,
            },
            openGraph: {
                title: seoTitle,
                description,
                type: "article",
                url: `${SITE_URL}/${locale}/judgments/${slug}`,
                siteName: "Sajjad Husain Law Associates",
                images: [`${SITE_URL}/logo-gold.png`],
                ...(judgment.judgmentDate && { publishedTime: judgment.judgmentDate }),
            },
            twitter: {
                card: "summary_large_image",
                title: seoTitle,
                description,
            },
        };
    } catch {
        return {
            title: "Judgment Detail | Sajjad Husain Law Associates",
            description: "Read the full text and analysis of this court judgment on Sajjad Husain Law Associates.",
        };
    }
}

export default async function JudgmentDetailPage({ params: paramsPromise, judgmentId: propId, isModal = false }: PageProps & { judgmentId?: string; isModal?: boolean }) {
    const { slug, locale } = await paramsPromise;
    setRequestLocale(locale);
    const finalId = propId || slug;

    let judgment = null;

    try {
        judgment = await fetchJudgment(finalId);
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
