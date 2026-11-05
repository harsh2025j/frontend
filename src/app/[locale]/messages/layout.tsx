import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Direct Advocate Messaging & Case Consultation Portal | Sajjad Husain Law Associates',
  description:
    'Confidential, encrypted messaging portal to consult directly with advocates at Sajjad Husain Law Associates. Share case files, inquire about hearing updates, and receive legal guidance.',
  keywords: [
    'Chat with Advocate India',
    'Legal Messaging Portal',
    'Consult Advocate Online',
    'Direct Lawyer Messaging',
    'Sajjad Husain Law Associates Chat',
    'Case Inquiry Messaging',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/messages',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/messages',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/messages',
    },
  },
  openGraph: {
    title: 'Direct Advocate Messaging Portal | Sajjad Husain Law Associates',
    description:
      'Confidential communication portal to consult directly with advocates, share case records, and receive timely litigation updates.',
    url: 'https://www.sajjadhusainlawassociates.com/en/messages',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Advocate Real-Time Consultation & Case Messaging Desk',
  url: 'https://www.sajjadhusainlawassociates.com/en/messages',
  provider: {
    '@type': 'LegalService',
    name: 'Sajjad Husain Law Associates',
    url: 'https://www.sajjadhusainlawassociates.com',
  },
  description:
    'Confidential client-advocate real-time messaging portal for litigation status tracking, brief sharing, and legal inquiries.',
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
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
