import React from "react";
import { Metadata } from "next";
import { casesService } from "@/data/services/cases-service/casesService";
import CaseView from "./CaseView";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sajjadhusainlawassociates.com";

interface PageProps {
    params: {
        id: string;
        locale: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, locale } = params;
    
    try {
        const response = await casesService.getById(id);
        const caseData = response.data.data;

        if (!caseData) {
            return { title: "Case Not Found" };
        }

        const title = `${caseData.title || "Legal Case"} | ${caseData.caseNumber || ""} | Sajjad Husain Law Associates`;
        const description = `Legal record for Case No: ${caseData.caseNumber}. Status: ${caseData.status}. Court: ${caseData.court}.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: "article",
                url: `${SITE_URL}/${locale}/cases/${id}`,
                images: [`${SITE_URL}/logo-gold.png`],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
            }
        };
    } catch (error) {
        return { title: "Case Details | Sajjad Husain Law Associates" };
    }
}

export default async function CaseDetailPage({ params, caseId: propId, isModal = false }: PageProps & { caseId?: string; isModal?: boolean }) {
    const { id } = params || {};
    const finalId = propId || id;

    // Fetch data for JSON-LD structured data
    let caseData = null;
    try {
        const response = await casesService.getById(finalId);
        caseData = response.data.data;
    } catch (error) {
        console.error("Error fetching case for SEO:", error);
    }

    const jsonLd = caseData ? {
        "@context": "https://schema.org",
        "@type": "LegalService",
        "name": caseData.title,
        "description": `Legal case record in ${caseData.court}`,
        "identifier": caseData.caseNumber || caseData.cnrNumber,
        "provider": {
            "@type": "Organization",
            "name": "Sajjad Husain Law Associates"
        }
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <CaseView caseId={finalId} isModal={isModal} />
        </>
    );
}
