import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supreme Court & High Court Precedent Research Portal — 50,000+ Judgments | Sajjad Husain Law Associates',
  description:
    'Instant citation and ratio decidendi retrieval across 50,000+ authentic Supreme Court and High Court judgments with neutral citations, coram composition, and official Supreme Court Law Report (SCR) reader with zero hallucination.',
  keywords: [
    'Supreme Court Precedent Research',
    'High Court Judgments Search',
    'Ratio Decidendi Extraction',
    'Indian Neutral Citations',
    'Supreme Court Law Report SCR',
    'Indian Case Law Research Portal',
    'Coram Jurisprudence Search',
    'Legal Precedent AI India',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/tools/research',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/tools/research',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/tools/research',
    },
  },
  openGraph: {
    title: 'Supreme Court & High Court Precedent Research Portal | Sajjad Husain Law Associates',
    description:
      'High-speed judicial citation and ratio decidendi retrieval engine indexed against 50,000+ authentic judgments with neutral citations and official SCR reader.',
    url: 'https://www.sajjadhusainlawassociates.com/en/tools/research',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Precedent Research Portal — Sajjad Husain Law Associates',
    description:
      'Retrieve authentic judicial ratios and citations from 50,000+ Supreme Court and High Court judgments with zero hallucination.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.sajjadhusainlawassociates.com/en/tools/research#app',
      name: 'Precedent Research Portal for Indian Judiciary',
      url: 'https://www.sajjadhusainlawassociates.com/en/tools/research',
      applicationCategory: 'LegalApplication',
      operatingSystem: 'Web Browser',
      description:
        'Instant judicial citation, ratio decidendi, and precedent retrieval across 50,000+ authentic Supreme Court and High Court judgments with neutral citations and official SCR reader.',
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
        'Over 50,000+ Indexed Supreme Court and High Court Judgments',
        'Direct Ratio Decidendi Extraction with Zero Hallucination',
        'Official Supreme Court Reports (SCR) and Neutral Citation Support',
        'Coram Composition & Bench Analysis (Single, Division, Constitution Benches)',
        'Statutory Cross-Mapping with Indian Acts and Sections',
        'Integrated Law Report PDF Reader for Immediate Verification',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How accurate is the ratio decidendi extracted by this tool?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The precedent engine extracts direct verbatim holdings and principles from authenticated court transcripts and Supreme Court Reports, preventing artificial hallucinations.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it support Indian Neutral Citations?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. It indexes judgments by official Indian Neutral Citations (e.g. 2024 INSC 123), Supreme Court Reports (SCR), SCC, and AIR citations.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I verify the full official judgment directly?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every search result provides direct 1-click access to the official full judgment text and verified PDF reader.',
          },
        },
      ],
    },
  ],
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
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
