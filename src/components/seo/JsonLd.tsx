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
        potentialAction: [
          {
            '@type': 'SearchAction',
            name: 'Platform Legal Search',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/${locale}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          {
            '@type': 'SearchAction',
            name: 'Supreme Court & High Court Judgments Search',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/${locale}/judgments?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          {
            '@type': 'SearchAction',
            name: 'Court Case Status & CNR Tracker',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/${locale}/cases?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
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
          'Premier Indian law firm and judicial technology platform offering High Court and Supreme Court litigation, constitutional writ practice, commercial arbitration, judicial intelligence tools, and accredited legal education.',
        telephone: '+917080909786',
        email: 'sajjadhusainlawassociates@gmail.com',
        priceRange: '₹₹₹',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Lucknow – Ayodhya Road, Gomti Nagar',
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
          name: 'Judiciary AI Tools, Litigation Services & Legal Education',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'Supreme Court & High Court Precedents Research Portal',
                url: `${siteUrl}/${locale}/tools/research`,
                applicationCategory: 'LegalApplication',
                operatingSystem: 'Web Browser',
                description:
                  'Instant judicial citation, ratio decidendi, and precedent retrieval across 50,000+ authentic Supreme Court and High Court judgments with neutral citations and official SCR reader.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'AI Legal Drafting Studio for Indian Courts',
                url: `${siteUrl}/${locale}/tools/drafting`,
                applicationCategory: 'LegalApplication',
                operatingSystem: 'Web Browser',
                description:
                  'Court-ready drafting engine for Article 226/32 Writs, Special Leave Petitions (SLPs), Commercial Suits, Interim Applications, and Legal Notices conforming to Supreme Court and High Court Rules.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'Mediation & Out-of-Court Settlement Desk',
                url: `${siteUrl}/${locale}/tools/settlement`,
                applicationCategory: 'LegalApplication',
                operatingSystem: 'Web Browser',
                description:
                  'Enforceable 5-part settlement term sheet generator conforming to Order XXIII Rule 3 CPC and the Mediation Act 2023 with payment tranches, grace periods, and mutual releases.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'Legal Document Health Check & 3-Layer Contract Risk Audit',
                url: `${siteUrl}/${locale}/tools/health-check`,
                applicationCategory: 'LegalApplication',
                operatingSystem: 'Web Browser',
                description:
                  '100-point diagnostic contract audit spotting missing arbitration seats under the Hardy doctrine, uncapped indemnities, stamp duty non-compliance, and statutory traps.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'Legal Document Templates & Automated Agreements',
                url: `${siteUrl}/${locale}/tools/documents`,
                applicationCategory: 'LegalApplication',
                operatingSystem: 'Web Browser',
                description:
                  'Comprehensive library of vetted Indian legal agreements, affidavits, plaints, power of attorney, lease deeds, and notices updated for the Bharatiya Nyaya Sanhita 2023.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'Legal Vernacular Translation & Document OCR',
                url: `${siteUrl}/${locale}/tools/translation`,
                applicationCategory: 'LegalApplication',
                operatingSystem: 'Web Browser',
                description:
                  'Certified legal translation and OCR across 22 Eighth Schedule Indian languages to judicial English with automatic mapping of IPC/CrPC to BNS/BNSS 2023.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Schedule Advocate Consultation & Case Advisory',
                url: `${siteUrl}/${locale}/book-appointment`,
                description:
                  'Direct consultation booking with senior advocates and litigation specialists for High Court, Supreme Court, corporate, and civil advisory.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Confidential Client-Advocate Messaging & Case Inquiries',
                url: `${siteUrl}/${locale}/messages`,
                description:
                  'Real-time secure communication portal with advocates for matter status inquiries, case brief sharing, and legal consultations.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Supreme Court & High Court Judgments Repository',
                url: `${siteUrl}/${locale}/judgments`,
                description:
                  'Comprehensive searchable repository of Indian landmark judgments, case summaries, neutral citations, and coram jurisprudence.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Live Case Status & Cause List Tracker',
                url: `${siteUrl}/${locale}/cases`,
                description:
                  'Real-time case tracking portal across Indian High Courts and district courts with CNR search, daily orders, and cause list alerts.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Live Courtroom Display Boards',
                url: `${siteUrl}/${locale}/display-boards`,
                description:
                  'Live court item tracking boards displaying active courtroom proceedings and item numbers for advocates and litigants.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Bare Acts & Central Statutes Library',
                url: `${siteUrl}/${locale}/legal-documents`,
                description:
                  'Comprehensive digital repository of Central Acts, Indian statutory codes, Bharatiya Nyaya Sanhita (BNS), BNSS, and Bharatiya Sakshya Adhiniyam.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Judicial Reports & Case Intelligence Analytics',
                url: `${siteUrl}/${locale}/reports`,
                description:
                  'Analytical case summaries, cause list analytics, and court reporting intelligence for law firms and corporate legal teams.',
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
          streetAddress: 'Lucknow – Ayodhya Road, Gomti Nagar',
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
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Legal Education & Certification Courses',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Course',
                name: 'Practical Litigation & Courtroom Procedure Certification',
                url: `${academyUrl}/courses`,
                description:
                  'Comprehensive training on court filings, drafting of plaints and petitions, cross-examination techniques, and case management.',
                provider: {
                  '@id': `${academyUrl}/#academy`,
                },
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Course',
                name: 'Judicial Precedents & Legal Research Masterclass',
                url: `${academyUrl}/courses`,
                description:
                  'In-depth mastery of Supreme Court and High Court research methods, ratio extraction, and statutory cross-mapping.',
                provider: {
                  '@id': `${academyUrl}/#academy`,
                },
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Legal Academy Admissions & Student Enrollment',
                url: `${academyUrl}/join`,
                description:
                  'Direct admissions desk for law students, advocates, and judicial aspirants enrolling in legal certification programs.',
              },
            },
          ],
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
