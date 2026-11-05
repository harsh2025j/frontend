import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dispute Settlement & Mediation Desk — Order XXIII CPC & Mediation Act 2023 | Sajjad Husain Law Associates',
  description:
    'Enforceable 5-part commercial and civil settlement term sheet generator complying strictly with Order XXIII Rule 3 CPC and the Mediation Act 2023, structuring payment tranches, grace periods, commercial default interest, and mutual release covenants.',
  keywords: [
    'Order XXIII Rule 3 CPC Settlement',
    'Mediation Act 2023 Term Sheet',
    'Out of Court Settlement Agreement India',
    'Commercial Dispute Settlement Template',
    'Compromise Decree Application CPC',
    'Mediation Agreement Generator India',
    'Civil Settlement Term Sheet',
    'ADR Settlement Desk India',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/tools/settlement',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/tools/settlement',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/tools/settlement',
    },
  },
  openGraph: {
    title: 'Dispute Settlement & Mediation Desk | Sajjad Husain Law Associates',
    description:
      'Structured 5-part settlement term sheet generator complying with Order XXIII Rule 3 CPC and the Mediation Act 2023 with payment tranches and default interest.',
    url: 'https://www.sajjadhusainlawassociates.com/en/tools/settlement',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dispute Settlement & Mediation Desk — Sajjad Husain Law Associates',
    description:
      'Structure enforceable compromise agreements and settlement term sheets under Order XXIII CPC and Mediation Act 2023.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.sajjadhusainlawassociates.com/en/tools/settlement#app',
      name: 'Dispute Settlement & Mediation Term Sheet Desk',
      url: 'https://www.sajjadhusainlawassociates.com/en/tools/settlement',
      applicationCategory: 'LegalApplication',
      operatingSystem: 'Web Browser',
      description:
        'Enforceable 5-part settlement term sheet generator conforming to Order XXIII Rule 3 CPC and the Mediation Act 2023 with payment tranches, grace periods, and mutual releases.',
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
        '5-Part Structured Settlement Term Sheet Architecture',
        'Compliance with Order XXIII Rule 3 CPC Compromise Decrees',
        'Integration with Mediation Act 2023 Statutory Requirements',
        'Automated Payment Tranches, Grace Periods, and Default Interest Calculation',
        'Mutual Release and Litigation Withdrawal Covenants',
        'Advocate Verification and Joint Compromise Application Deeds',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does Order XXIII Rule 3 CPC apply to this settlement deed?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Order XXIII Rule 3 of the Code of Civil Procedure 1908 allows the court to record a lawful agreement or compromise in writing and pass a compromise decree accordingly. The generated term sheet satisfies all statutory elements required for judicial recording.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does the agreement protect against default in installment payments?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The term sheet incorporates acceleration clauses, grace periods, and commercial default interest, entitling the non-defaulting party to execute the compromise decree or revive original claims upon breach.',
          },
        },
      ],
    },
  ],
};

export default function SettlementLayout({ children }: { children: React.ReactNode }) {
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
