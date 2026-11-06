import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bare Acts & Central Statutes Digital Library | Sajjad Husain Law Associates',
  description:
    'Comprehensive repository of Indian Bare Acts, Central Statutes, the Constitution of India, and the newly enacted criminal laws: Bharatiya Nyaya Sanhita (BNS 2023), BNSS 2023, and Bharatiya Sakshya Adhiniyam (BSA 2023).',
  keywords: [
    'Bare Acts India',
    'Central Statutes Library',
    'Bharatiya Nyaya Sanhita BNS 2023 Bare Act',
    'Bharatiya Nagarik Suraksha Sanhita BNSS Bare Act',
    'Bharatiya Sakshya Adhiniyam BSA Bare Act',
    'Constitution of India Bare Act',
    'Indian Statutory Acts',
    'Civil Procedure Code CPC Bare Act',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/legal-documents',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/legal-documents',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/legal-documents',
    },
  },
  openGraph: {
    title: 'Bare Acts & Central Statutes Digital Library | Sajjad Husain Law Associates',
    description:
      'Digital library of Indian Central Acts, statutory codes, Bharatiya Nyaya Sanhita, and civil codes for legal research.',
    url: 'https://www.sajjadhusainlawassociates.com/en/legal-documents',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Bare Acts & Central Statutes Digital Library',
  url: 'https://www.sajjadhusainlawassociates.com/en/legal-documents',
  description:
    'Comprehensive digital repository of Central Acts, Indian statutory codes, Bharatiya Nyaya Sanhita (BNS), BNSS, and Bharatiya Sakshya Adhiniyam.',
  publisher: {
    '@type': 'LegalService',
    name: 'Sajjad Husain Law Associates',
    url: 'https://www.sajjadhusainlawassociates.com',
  },
};

export default function LegalDocumentsLayout({ children }: { children: React.ReactNode }) {
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
