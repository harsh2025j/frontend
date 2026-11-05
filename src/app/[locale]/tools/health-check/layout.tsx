import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Document Health Check & 3-Layer Contract Risk Audit | Sajjad Husain Law Associates',
  description:
    '100-point diagnostic contract audit spotting missing arbitration seats vs venues under the Hardy doctrine, uncapped indemnities, unilateral termination traps, and non-compliance with the Indian Contract Act 1872.',
  keywords: [
    'Contract Risk Audit Tool',
    'Legal Document Health Check',
    'Arbitration Seat vs Venue Audit',
    'Hardy Exploration Doctrine',
    'Contract Indemnity Audit India',
    'Indian Contract Act 1872 Compliance',
    'Commercial Agreement Risk Scanner',
    'Legal Tech Contract Review',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/tools/health-check',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/tools/health-check',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/tools/health-check',
    },
  },
  openGraph: {
    title: 'Legal Document Health Check & Contract Risk Audit | Sajjad Husain Law Associates',
    description:
      'Diagnostic 3-layer risk audit spotting statutory compliance flaws, jurisdiction traps, and uncapped commercial liabilities in Indian contracts.',
    url: 'https://www.sajjadhusainlawassociates.com/en/tools/health-check',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal Document Health Check — Sajjad Husain Law Associates',
    description:
      'Audit contracts for statutory traps, missing arbitration seats, and liability exposure under Indian law.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.sajjadhusainlawassociates.com/en/tools/health-check#app',
      name: 'Legal Document Health Check & 3-Layer Contract Risk Audit',
      url: 'https://www.sajjadhusainlawassociates.com/en/tools/health-check',
      applicationCategory: 'LegalApplication',
      operatingSystem: 'Web Browser',
      description:
        '100-point diagnostic contract audit spotting missing arbitration seats under the Hardy doctrine, uncapped indemnities, stamp duty non-compliance, and statutory risks.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      creator: {
        '@type': 'LegalService',
        name: 'Sajjad Husain Law Associates',
        url: 'https://www.sajjadhusainlawassociates.com',
      },
      featureList: [
        '100-Point Diagnostic Risk Audit Matrix',
        'Arbitration Seat vs. Venue Audit (Hardy & BGS SGS SOMA Doctrines)',
        'Statutory Validity Scan (Section 27/28 Indian Contract Act 1872)',
        'Commercial Exposure Check (Uncapped Indemnities & Force Majeure)',
        'Indian Stamp Act & Registration Requirement Audit',
        'Counsel-Grade Remedial Clause Drafting Suggestions',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What does the 3-layer contract risk audit analyze?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The audit analyzes three critical layers: 1) Statutory Validity under the Indian Contract Act 1872, 2) Dispute Resolution Precision (Arbitration seat, venue, and governing law), and 3) Commercial Risk Exposure (indemnities, caps on liability, and termination covenants).',
          },
        },
        {
          '@type': 'Question',
          name: 'Why is the distinction between arbitration seat and venue critical?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Under the Supreme Court rulings in Hardy Exploration and BGS SGS SOMA, an ambiguous seat designation can trigger protracted supervisory court jurisdictional battles. This tool verifies that your clause contains an unambiguous seat designation.',
          },
        },
      ],
    },
  ],
};

export default function HealthCheckLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
