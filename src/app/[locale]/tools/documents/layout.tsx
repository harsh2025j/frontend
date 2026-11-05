import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Document Templates & Automated Agreements for Indian Law | Sajjad Husain Law Associates',
  description:
    'Comprehensive library of vetted Indian legal agreements, affidavits, plaints, power of attorney, lease deeds, employment contracts, and statutory notices drafted by senior advocates and updated for Indian statutes.',
  keywords: [
    'Legal Document Templates India',
    'Indian Contract Templates',
    'Power of Attorney Format India',
    'Lease Agreement Template India',
    'Affidavit Format Indian Courts',
    'Employment Agreement India',
    'Legal Drafting Templates',
    'Bharatiya Nyaya Sanhita Templates',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/tools/documents',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/tools/documents',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/tools/documents',
    },
  },
  openGraph: {
    title: 'Legal Document Templates & Automated Agreements | Sajjad Husain Law Associates',
    description:
      'Vetted Indian legal templates, contracts, affidavits, and plaints drafted by courtroom practitioners in compliance with Indian statutory acts.',
    url: 'https://www.sajjadhusainlawassociates.com/en/tools/documents',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal Document Templates — Sajjad Husain Law Associates',
    description:
      'Access verified Indian legal document templates, contracts, affidavits, and court notices.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.sajjadhusainlawassociates.com/en/tools/documents#app',
      name: 'Legal Document Templates & Agreement Suite',
      url: 'https://www.sajjadhusainlawassociates.com/en/tools/documents',
      applicationCategory: 'LegalApplication',
      operatingSystem: 'Web Browser',
      description:
        'Comprehensive digital library of vetted Indian legal agreements, affidavits, plaints, power of attorney, and statutory notices conforming to the Indian Contract Act 1872 and Stamp Acts.',
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
        'Vetted Commercial Agreements and Non-Disclosure Agreements (NDAs)',
        'General & Special Power of Attorney Formats',
        'Residential & Commercial Lease Deeds',
        'Notarized and Court-Conforming Affidavit Templates',
        'Statutory Demand Notices under Section 138 NI Act',
        'Pre-Litigation Legal Notice Formats',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are these document templates legally enforceable in Indian courts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. All templates are drafted and vetted by experienced courtroom advocates in compliance with the Indian Contract Act 1872, Registration Act 1908, and Indian Stamp Act 1899.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I customize these agreements with my own clauses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every template can be customized with your party details, consideration terms, jurisdiction clauses, and execution dates.',
          },
        },
      ],
    },
  ],
};

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
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
