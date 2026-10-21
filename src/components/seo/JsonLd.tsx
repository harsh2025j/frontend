import React from 'react';

interface JsonLdProps {
  locale?: string;
}

export default function JsonLd({ locale = 'en' }: JsonLdProps) {
  const siteUrl = 'https://www.sajjadhusainlawassociates.com';
  const academyUrl = 'https://academy.sajjadhusainlawassociates.com';

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Sajjad Husain Law Associates',
        alternateName: 'LegalTech | Sajjad Husain Law Associates',
        description:
          "India's premier legal technology platform providing real-time High Court and Supreme Court judgments, AI judicial intelligence tools, legal education, and legal news.",
        inLanguage: [locale, 'en', 'hi'],
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/${locale}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'LegalService',
        '@id': `${siteUrl}/#organization`,
        name: 'Sajjad Husain Law Associates',
        legalName: 'Sajjad Husain Law Associates',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        image: `${siteUrl}/logo.png`,
        description:
          'Premier Indian law firm offering High Court and Supreme Court litigation, constitutional writ practice, commercial arbitration, mediation under Mediation Act 2023, and judicial intelligence tools.',
        telephone: '+917080909786',
        email: 'sajjadhusainlawassociates@gmail.com',
        priceRange: '₹₹₹',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Chamber 515, Block-C, High Court, Lucknow - Ayodhya Rd, Gomti Nagar',
          addressLocality: 'Lucknow',
          addressRegion: 'Uttar Pradesh',
          postalCode: '226010',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '26.8687',
          longitude: '80.9992',
        },
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '20:00',
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Judiciary AI Tools & Legal Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Supreme Court & High Court Precedents Research',
                url: `${siteUrl}/${locale}/tools/research`,
                description:
                  'Instant citation and judicial ratio retrieval across 50,000+ authentic Supreme Court and High Court judgments.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'AI Legal Drafting Studio for Indian Courts',
                url: `${siteUrl}/${locale}/tools/drafting`,
                description:
                  'Court-ready drafting for Article 226/32 Writs, Special Leave Petitions, and commercial suits.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Mediation & Out-of-Court Settlement Desk',
                url: `${siteUrl}/${locale}/tools/mediation`,
                description:
                  'Structured settlement term sheets complying with Order XXIII Rule 3 CPC and the Mediation Act 2023.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Legal Document Health Check & 3-Layer Risk Audit',
                url: `${siteUrl}/${locale}/tools/documents`,
                description:
                  'Diagnostic risk audit spotting missing arbitration seats, uncapped indemnities, and statutory compliance traps.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Legal Vernacular Translation & Document OCR',
                url: `${siteUrl}/${locale}/tools/translation`,
                description:
                  'Certified translation across 22 Eighth Schedule Indian languages to English with BNS 2023 mapping.',
              },
            },
          ],
        },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': `${academyUrl}/#academy`,
        name: 'Sajjad Husain Law Associates Legal Academy',
        url: academyUrl,
        description:
          'Professional legal education and training academy providing specialized diploma courses, practical litigation internships, and verifiable certifications for law students and practitioners.',
        parentOrganization: {
          '@id': `${siteUrl}/#organization`,
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Chamber 515, Block-C, High Court, Lucknow - Ayodhya Rd, Gomti Nagar',
          addressLocality: 'Lucknow',
          addressRegion: 'Uttar Pradesh',
          postalCode: '226010',
          addressCountry: 'IN',
        },
        hasCredential: {
          '@type': 'EducationalOccupationalCredential',
          name: 'Verified Legal Academy Credential',
          url: `${academyUrl}/verify-certificate`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
    />
  );
}
