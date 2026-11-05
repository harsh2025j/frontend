import React from 'react';
import type { Metadata } from 'next';
import ToolsShell from '@/components/tools/ToolsShell';

export const metadata: Metadata = {
  title: 'Judiciary AI Tools Suite — Indian Law & Court Intelligence | Sajjad Husain Law Associates',
  description:
    'Institutional-grade legal AI suite for Indian courts: Precedents Research over 50,000+ judgments, Court Pleadings Drafter, Order XXIII Rule 3 CPC Mediation Term Sheets, 3-Layer Contract Risk Audit, and 22-Language Vernacular OCR Translation.',
  keywords: [
    'Legal AI India',
    'Judiciary AI Tools',
    'Supreme Court Precedent Research',
    'AI Legal Drafting India',
    'Order XXIII Rule 3 CPC Mediation',
    'Contract Risk Audit Tool',
    'Legal Vernacular Translation',
    'Sajjad Husain Law Associates Tools',
    'Court Pleadings Drafter',
  ],
  alternates: {
    canonical: 'https://www.sajjadhusainlawassociates.com/en/tools',
    languages: {
      en: 'https://www.sajjadhusainlawassociates.com/en/tools',
      hi: 'https://www.sajjadhusainlawassociates.com/hi/tools',
    },
  },
  openGraph: {
    title: 'Judiciary AI Tools Suite — Indian Court Intelligence | Sajjad Husain Law Associates',
    description:
      'Domain-specific judicial intelligence tools built for Indian courts: Precedent Research, Court Pleadings Drafter, Mediation Term Sheets, Contract Risk Audit, and Vernacular Translation.',
    url: 'https://www.sajjadhusainlawassociates.com/en/tools',
    siteName: 'Sajjad Husain Law Associates',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Judiciary AI Tools Suite — Sajjad Husain Law Associates',
    description:
      'AI legal intelligence tools for Indian courts: Precedents Research, Court Drafting, Mediation, Contract Audit, and Vernacular Translation.',
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <ToolsShell>{children}</ToolsShell>;
}
