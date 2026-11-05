import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Case Status & Cause List Tracker | Sajjad Husain Law Associates',
  description:
    'Track live case status across Indian High Courts and district courts. Search by Case Number, CNR Number, Party Name, or Advocate Name to view daily cause lists, order sheets, and next hearing dates.',
  keywords: [
    'Court Case Status Tracker India',
    'High Court Case Status Search',
    'CNR Number Search India',
    'Daily Cause List Tracker',
    'Indian Court Orders Tracker',
    'Advocate Case Status Search',
    'eCourts Status Portal',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/cases',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/cases',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/cases',
    },
  },
  openGraph: {
    title: 'Live Case Status & Cause List Tracker | Sajjad Husain Law Associates',
    description:
      'Real-time case tracking portal across Indian High Courts and district courts with CNR search, daily orders, and cause list alerts.',
    url: 'https://www.sajjadhusainlawassociates.com/en/cases',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://www.sajjadhusainlawassociates.com/en/cases#tracker',
      name: 'Live Court Case Status & Cause List Tracker',
      url: 'https://www.sajjadhusainlawassociates.com/en/cases',
      description:
        'Live case tracking engine across Indian High Courts and district courts with CNR search, daily orders, and cause list alerts.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.sajjadhusainlawassociates.com/en/cases?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'LegalService',
        name: 'Sajjad Husain Law Associates',
        url: 'https://www.sajjadhusainlawassociates.com',
      },
    },
  ],
};

export default function CasesLayout({ children }: { children: React.ReactNode }) {
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
