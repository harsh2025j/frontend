import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Courtroom Display Boards | Sajjad Husain Law Associates',
  description:
    'Real-time live court display board showing current courtroom proceedings, active item numbers, bench status, and matter progress for High Courts and judicial tribunals across India.',
  keywords: [
    'Live Court Display Board',
    'High Court Display Board Live',
    'Courtroom Live Item Number',
    'Allahabad High Court Display Board',
    'Court Case Item Tracker',
    'Live Bench Status India',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/display-boards',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/display-boards',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/display-boards',
    },
  },
  openGraph: {
    title: 'Live Courtroom Display Boards | Sajjad Husain Law Associates',
    description:
      'Real-time live court item tracking boards displaying active courtroom proceedings and bench status for advocates and litigants.',
    url: 'https://www.sajjadhusainlawassociates.com/en/display-boards',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Live Courtroom Display Board System',
  url: 'https://www.sajjadhusainlawassociates.com/en/display-boards',
  applicationCategory: 'LegalApplication',
  operatingSystem: 'Web Browser',
  description:
    'Real-time live court item tracking board displaying active courtroom proceedings and item numbers for advocates and litigants.',
  publisher: {
    '@type': 'LegalService',
    name: 'Sajjad Husain Law Associates',
    url: 'https://www.sajjadhusainlawassociates.com',
  },
};

export default function DisplayBoardsLayout({ children }: { children: React.ReactNode }) {
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
