import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supreme Court & High Court Judgments Search Repository | Sajjad Husain Law Associates',
  description:
    'Comprehensive searchable database of Supreme Court of India and High Court judgments. Filter by Case Number, Diary Number, Free-Text Keywords, Judge Name, and Date Range with official SCR citations and neutral citations.',
  keywords: [
    'Supreme Court Judgments Search',
    'High Court Orders Database',
    'Indian Landmark Judgments',
    'Supreme Court Law Report SCR',
    'Indian Neutral Citations',
    'Case Law Search India',
    'Judgments by Judge Name',
    'Precedent Search India',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/judgments',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/judgments',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/judgments',
    },
  },
  openGraph: {
    title: 'Supreme Court & High Court Judgments Repository | Sajjad Husain Law Associates',
    description:
      'Search authentic Supreme Court and High Court judgments with multi-parameter filtering, neutral citations, and integrated law report reader.',
    url: 'https://www.sajjadhusainlawassociates.com/en/judgments',
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
      '@id': 'https://www.sajjadhusainlawassociates.com/en/judgments#collection',
      name: 'Supreme Court & High Court Judgments Repository',
      url: 'https://www.sajjadhusainlawassociates.com/en/judgments',
      description:
        'Searchable repository of Supreme Court of India and High Court judgments with multi-parameter filtering, neutral citations, and coram jurisprudence.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.sajjadhusainlawassociates.com/en/judgments?q={search_term_string}',
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

export default function JudgmentsLayout({ children }: { children: React.ReactNode }) {
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
