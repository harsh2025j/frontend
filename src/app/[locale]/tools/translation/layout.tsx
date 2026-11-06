import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vernacular Legal Translation & OCR — 22 Indian Languages to English | Sajjad Husain Law Associates',
  description:
    'High Court-grade certified translation and OCR across all 22 Eighth Schedule Indian languages into judicial English, preserving statutory sections, FIR details, khasra measurements, and mapping IPC/CrPC to BNS/BNSS 2023.',
  keywords: [
    'Legal Vernacular Translation India',
    'Court Document OCR India',
    'Hindi to English Legal Translation',
    'Urdu to English Court Translation',
    'FIR Translation to English',
    'BNS 2023 Section Mapping Translation',
    'High Court Certified Translation',
    'Indian Language Legal OCR',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/tools/translation',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/tools/translation',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/tools/translation',
    },
  },
  openGraph: {
    title: 'Vernacular Legal Translation & Document OCR | Sajjad Husain Law Associates',
    description:
      'Certified translation across 22 Eighth Schedule Indian languages to judicial English with statutory section preservation and BNS/BNSS mapping.',
    url: 'https://www.sajjadhusainlawassociates.com/en/tools/translation',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vernacular Legal Translation & OCR — Sajjad Husain Law Associates',
    description:
      'High Court-grade translation of court documents, FIRs, and deeds across 22 Indian languages into judicial English.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.sajjadhusainlawassociates.com/en/tools/translation#app',
      name: 'Legal Vernacular Translation & Document OCR Engine',
      url: 'https://www.sajjadhusainlawassociates.com/en/tools/translation',
      applicationCategory: 'LegalApplication',
      operatingSystem: 'Web Browser',
      description:
        'Certified legal translation and OCR across 22 Eighth Schedule Indian languages to judicial English with automatic mapping of IPC/CrPC to BNS/BNSS 2023.',
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
        'Coverage of All 22 Eighth Schedule Indian Languages',
        'Specialized Judicial & Courtroom Vocabulary Dictionary',
        'Preservation of FIR Numbers, Land Revenue Khasra Details, and Dates',
        'Automatic IPC/CrPC to Bharatiya Nyaya Sanhita (BNS 2023) Section Mapping',
        'Side-by-Side Bilingual Reading and Comparison Interface',
        'High-Accuracy OCR for Scanned Police Records and Lower Court Orders',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does the translation preserve statutory sections and court case numbers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The translation engine treats statutory section references, FIR numbers, crime diary numbers, and court case numbers as immutable judicial tokens, preventing transliteration corruption.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does it handle the newly enacted criminal laws (BNS and BNSS 2023)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The translation engine automatically cross-maps legacy IPC and CrPC sections to their modern Bharatiya Nyaya Sanhita (BNS 2023) and Bharatiya Nagarik Suraksha Sanhita (BNSS 2023) equivalents in footnotes.',
          },
        },
      ],
    },
  ],
};

export default function TranslationLayout({ children }: { children: React.ReactNode }) {
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
