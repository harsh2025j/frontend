import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Legal Drafting Assistant for Indian Courts — Writs, SLPs & Petitions | Sajjad Husain Law Associates',
  description:
    'Draft court-ready Article 226/32 Writ Petitions, Special Leave Petitions (SLPs), Commercial Suits, Interim Applications, and Legal Notices conforming strictly to Supreme Court Rules 2013 and High Court practice.',
  keywords: [
    'AI Legal Drafting India',
    'Court Pleadings Drafter',
    'Writ Petition Drafter Article 226',
    'Special Leave Petition SLP Drafting',
    'Supreme Court Drafting Assistant',
    'Commercial Plaint Drafter',
    'Legal Notice Generator India',
    'Bharatiya Nyaya Sanhita Drafting',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/tools/drafting',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/tools/drafting',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/tools/drafting',
    },
  },
  openGraph: {
    title: 'AI Legal Drafting Assistant for Indian Courts | Sajjad Husain Law Associates',
    description:
      'Disciplined 3-step court drafting engine for Article 226/32 Writs, SLPs, and commercial suits formulated with verified questions of law and conforming prayer deeds.',
    url: 'https://www.sajjadhusainlawassociates.com/en/tools/drafting',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Legal Drafting Studio — Sajjad Husain Law Associates',
    description:
      'Draft court-ready writs, SLPs, plaints, and legal notices adhering to Indian Supreme Court and High Court rules.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.sajjadhusainlawassociates.com/en/tools/drafting#app',
      name: 'AI Legal Drafting Studio for Indian Courts',
      url: 'https://www.sajjadhusainlawassociates.com/en/tools/drafting',
      applicationCategory: 'LegalApplication',
      operatingSystem: 'Web Browser',
      description:
        'Court-ready drafting engine for Article 226/32 Writ Petitions, Special Leave Petitions (SLPs), Commercial Suits, and Legal Notices adhering strictly to High Court and Supreme Court Rules.',
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
        '3-Step Guided Court Drafting Workflow',
        'Article 226 & 32 Constitutional Writ Petitions',
        'Special Leave Petitions (SLP Civil & Criminal)',
        'Commercial Plaints & Suits under CPC 1908',
        'Section 482 CrPC / Section 528 BNSS Quashing Petitions',
        'Automatic formatting according to Supreme Court Rules 2013',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does this drafting tool comply with Supreme Court and High Court rules?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The drafting engine formats chronological synopsis, list of dates, questions of law, grounds, and prayer deeds strictly according to the Supreme Court Rules 2013 and High Court practice standards.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the drafted petition updated for the new criminal laws (BNS, BNSS 2023)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The engine seamlessly maps historical IPC and CrPC provisions to their corresponding sections under the Bharatiya Nyaya Sanhita (BNS 2023) and Bharatiya Nagarik Suraksha Sanhita (BNSS 2023).',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I export the drafted pleading into editable formats?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You can copy the generated pleadings directly or export them for court submission, advocate verification, and filing before the court registry.',
          },
        },
      ],
    },
  ],
};

export default function DraftingLayout({ children }: { children: React.ReactNode }) {
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
