import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Court & Case Reports, Judicial Analytics & Law Metrics | Sajjad Husain Law Associates',
  description:
    'In-depth analytical court reports, case metrics, judicial trends, and cause list statistics compiled for advocates, law firms, corporate legal departments, and judicial scholars.',
  keywords: [
    'Court Reports India',
    'Judicial Trend Analytics',
    'Case Law Metrics India',
    'High Court Statistical Reports',
    'Supreme Court Case Analytics',
    'Legal Intelligence Reports',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/reports',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/reports',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/reports',
    },
  },
  openGraph: {
    title: 'Court & Case Reports, Judicial Analytics | Sajjad Husain Law Associates',
    description:
      'Analytical case summaries, cause list analytics, and court reporting intelligence for law firms and corporate legal teams.',
    url: 'https://www.sajjadhusainlawassociates.com/en/reports',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Judicial Reports & Case Intelligence Analytics',
  url: 'https://www.sajjadhusainlawassociates.com/en/reports',
  description:
    'Analytical case summaries, cause list analytics, and court reporting intelligence for law firms and corporate legal teams.',
  publisher: {
    '@type': 'LegalService',
    name: 'Sajjad Husain Law Associates',
    url: 'https://www.sajjadhusainlawassociates.com',
  },
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
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
