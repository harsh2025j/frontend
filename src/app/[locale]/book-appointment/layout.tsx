import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Advocate Consultation & Legal Case Advisory | Sajjad Husain Law Associates',
  description:
    'Schedule a confidential legal consultation with senior advocates at Sajjad Husain Law Associates. Advisory services for Supreme Court of India, Allahabad High Court, commercial arbitration, constitutional writs, and civil litigation.',
  keywords: [
    'Book Advocate Appointment Lucknow',
    'Legal Consultation Supreme Court Advocate',
    'High Court Lawyer Consultation',
    'Schedule Advocate Advisory',
    'Sajjad Husain Law Associates Appointment',
    'Constitutional Writ Advocate Consultation',
    'Commercial Arbitration Advisory India',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/book-appointment',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/book-appointment',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/book-appointment',
    },
  },
  openGraph: {
    title: 'Book Advocate Consultation & Legal Case Advisory | Sajjad Husain Law Associates',
    description:
      'Schedule a confidential consultation with senior advocates for High Court, Supreme Court, corporate, and civil advisory.',
    url: 'https://www.sajjadhusainlawassociates.com/en/book-appointment',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Advocate Consultation — Sajjad Husain Law Associates',
    description:
      'Direct appointment booking with senior advocates and litigation counsel.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': 'https://www.sajjadhusainlawassociates.com/en/book-appointment#service',
      name: 'Advocate Consultation & Legal Case Advisory',
      url: 'https://www.sajjadhusainlawassociates.com/en/book-appointment',
      serviceType: 'Legal Advisory & Courtroom Litigation Representation',
      provider: {
        '@type': 'LegalService',
        name: 'Sajjad Husain Law Associates',
        url: 'https://www.sajjadhusainlawassociates.com',
        telephone: '+917080909786',
        email: 'sajjadhusainlawassociates@gmail.com',
      },
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Consultation Formats',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'In-Chambers Consultation (Lucknow)',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Virtual Video Legal Consultation',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Written Case Merit Opinion & Briefing',
            },
          },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What matters can I schedule a consultation for?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can book consultations for Supreme Court appeals (SLP), High Court Article 226/227 writ petitions, bail and criminal revisions, commercial arbitration, property disputes, and corporate compliance.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are virtual online consultations available for outstation clients?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. We offer secure virtual video consultations for clients across India and overseas, complete with prior document review and digital case summaries.',
          },
        },
      ],
    },
  ],
};

export default function BookAppointmentLayout({ children }: { children: React.ReactNode }) {
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
