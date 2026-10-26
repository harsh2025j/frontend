export interface ToolItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  category: 'Legal Research' | 'Drafting & Pleadings' | 'Alternative Dispute Resolution' | 'Document Review' | 'Judicial Translation' | 'Court Analytics';
  iconName: 'Search' | 'FileText' | 'Gavel' | 'FileCheck2' | 'Languages' | 'Scale' | 'BookOpen' | 'ShieldAlert' | 'Briefcase';
  badge: string;
  badgeVariant?: 'primary' | 'gold' | 'emerald' | 'amber';
  status: 'active' | 'beta' | 'coming_soon';
  features: string[];
  primaryAction: string;
  route: string;
  benchmarkTime?: string;
  statBadge?: string;
}

export const TOOLS_REGISTRY: ToolItem[] = [
  {
    id: 'research',
    slug: 'research',
    title: 'Supreme Court & High Court Precedents Research',
    shortTitle: 'Precedent Research',
    tagline: '50k+ Supreme Court & High Court Judgments, Ratio Decidendi & Direct Law Reports',
    description: 'Instant citation and judicial ratio retrieval with authentic neutral citations, coram composition, and live Supreme Court official law report reader.',
    category: 'Legal Research',
    iconName: 'Search',
    badge: 'Supreme Court SCR Index',
    badgeVariant: 'primary',
    status: 'active',
    features: [
      'High-speed query against authentic Supreme Court Precedent Repository',
      'Precise ratio decidendi extraction with zero judicial hallucination',
      'Neutral & Official SCR Citation matching with 1-click law report reader',
      'Acts and statutory sections mapping with formal court argument templates'
    ],
    primaryAction: 'Search Precedents',
    route: '/tools/research',
    benchmarkTime: '< 1 second',
    statBadge: '50,000+ Precedents'
  },
  {
    id: 'drafting',
    slug: 'drafting',
    title: 'Court Pleadings & Petitions Drafter',
    shortTitle: 'Court Pleadings',
    tagline: 'Disciplined Drafting for Petitions, Appeals, Bail & Pleadings',
    description: 'Convert matter facts, statutory grounds, and prayers into a court-ready first draft for Article 226/32 Writ Petitions, SLPs, and Commercial Suits.',
    category: 'Drafting & Pleadings',
    iconName: 'Scale',
    badge: 'High Court & SC Formats',
    badgeVariant: 'gold',
    status: 'active',
    features: [
      'Formulated questions of law adhering to High Court & Supreme Court Rules',
      'Chronological synopsis and list of dates with statutory milestones',
      'Substantiated grounds linking facts directly to binding judicial ratios',
      'Conforming prayer clauses, interim stay applications & verification deeds'
    ],
    primaryAction: 'Draft Court Pleading',
    route: '/tools/drafting',
    benchmarkTime: '10–15 mins',
    statBadge: '99% Structural Accuracy'
  },
  {
    id: 'mediation',
    slug: 'mediation',
    title: 'Mediation & Out-of-Court Settlement Desk',
    shortTitle: 'Mediation & Settlement',
    tagline: 'Order XXIII Rule 3 CPC & Mediation Act 2023 Settlement Term Sheets',
    description: 'Structure commercial disputes, unpaid claims, and contested liabilities into a balanced, judicially enforceable 5-part settlement term sheet.',
    category: 'Alternative Dispute Resolution',
    iconName: 'Gavel',
    badge: 'Order XXIII R3 CPC',
    badgeVariant: 'emerald',
    status: 'active',
    features: [
      '5-part enforceable settlement agreement complying with the Mediation Act 2023',
      'Structured payment tranches, grace periods, and commercial default interest',
      'Comprehensive mutual releases, non-disparagement, and court withdrawal terms',
      'Order XXIII Rule 3 CPC compromise decree template with advocate verification'
    ],
    primaryAction: 'Build Term Sheet',
    route: '/tools/mediation',
    benchmarkTime: '5 minutes',
    statBadge: 'Statutory Enforceability'
  },
  {
    id: 'documents',
    slug: 'documents',
    title: 'Legal Contracts & Deeds Library',
    shortTitle: 'Contracts & Deeds',
    tagline: 'Draft from 2,176+ Proven Indian Legal Templates Across 58 Categories',
    description: 'Pick the kind of document, choose a template, provide your situation — the draft follows the template structure and wording with your details in place and [● label] blanks.',
    category: 'Drafting & Pleadings',
    iconName: 'FileText',
    badge: '2,176 Templates · 58 Categories',
    badgeVariant: 'gold',
    status: 'active',
    features: [
      'Comprehensive library of 2,176+ templates across 58 Indian legal categories',
      'Conversational AI refinement chat extracting parties, property, and dispute details',
      'Live Intelligence Inspector with "What I have" and "Still needed" guidance',
      'High Court & standard legal document editor with interactive [● label] blanks'
    ],
    primaryAction: 'Browse Templates',
    route: '/tools/documents',
    benchmarkTime: '< 2 minutes',
    statBadge: '2,176 Templates'
  },
  {
    id: 'health-check',
    slug: 'health-check',
    title: 'Legal Document Health Check & 3-Layer Risk Audit',
    shortTitle: 'Document Health Check',
    tagline: 'Automated Diagnostic Audit for Contracts, Agreements & Pleadings',
    description: 'A 3-layer diagnostic audit spotting missing arbitration seats, uncapped indemnities, unilateral terminations, and statutory compliance traps.',
    category: 'Document Review',
    iconName: 'FileCheck2',
    badge: '3-Layer Risk Audit',
    badgeVariant: 'amber',
    status: 'active',
    features: [
      'Statutory compliance scan (Contract Act, Specific Relief Act, Stamp Acts)',
      'Arbitration Seat vs Venue clarity check under Hardy Exploration doctrine',
      'Uncapped indemnities and limitation of liability gap identification',
      'Actionable revision checklist with counsel clause substitution recommendations'
    ],
    primaryAction: 'Audit Document',
    route: '/tools/health-check',
    benchmarkTime: 'Instant diagnostic',
    statBadge: '100-Point Audit Engine'
  },
  {
    id: 'translation',
    slug: 'translation',
    title: 'Legal Vernacular Translation & Document OCR',
    shortTitle: 'Legal Translation',
    tagline: 'High Court-Grade Certified Translation for 22 Indian Languages',
    description: 'Translate vernacular court orders, police FIRs, revenue records, and sale deeds into structured judicial English while preserving citations and sections.',
    category: 'Judicial Translation',
    iconName: 'Languages',
    badge: '22 Eighth Schedule Languages',
    badgeVariant: 'primary',
    status: 'active',
    features: [
      'Certified translation of FIRs, revenue records, sale deeds, and court orders',
      'Preservation of statutory sections, FIR numbers, case titles, and plot measurements',
      'Direct mapping of IPC/CrPC sections to new Bharatiya Nyaya Sanhita (BNS 2023)',
      'Side-by-side bilingual view with formal advocate review notes and export'
    ],
    primaryAction: 'Translate Document',
    route: '/tools/translation',
    benchmarkTime: 'Real-time OCR & Translation',
    statBadge: '22 Indian Languages'
  }
];

export const TOOL_CATEGORIES = [
  'All Tools',
  'Legal Research',
  'Drafting & Pleadings',
  'Alternative Dispute Resolution',
  'Document Review',
  'Judicial Translation'
] as const;
