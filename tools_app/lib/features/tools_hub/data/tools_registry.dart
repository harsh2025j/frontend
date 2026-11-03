import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import 'models/tool_item.dart';

class ToolsRegistry {
  ToolsRegistry._();

  static const List<ToolItem> tools = [
    ToolItem(
      id: 'research',
      slug: 'research',
      title: 'Supreme Court & High Court Precedents Research',
      shortTitle: 'Precedent Research',
      tagline: '50k+ Supreme Court & High Court Judgments & Ratio Decidendi',
      description:
          'Instant citation and judicial ratio retrieval with authentic neutral citations, coram composition, and live Supreme Court law reports.',
      category: 'Legal Research',
      icon: Icons.search_rounded,
      badge: 'Supreme Court SCR Index',
      status: 'active',
      features: [
        'Search authentic Supreme Court Precedent Repository',
        'Precise ratio decidendi extraction with zero hallucination',
        'Neutral & Official SCR Citation matching',
        'Statutory sections mapping with formal court argument templates',
      ],
      primaryAction: 'Search Precedents',
      benchmarkTime: '< 1 sec',
      statBadge: '50,000+ Judgments',
      accentColor: AppColors.toolResearch,
    ),
    ToolItem(
      id: 'drafting',
      slug: 'drafting',
      title: 'Court Pleadings & Petitions Drafter',
      shortTitle: 'Pleadings Drafter',
      tagline: 'Disciplined Drafting for Petitions, Appeals, Bail & Pleadings',
      description:
          'Convert matter facts, statutory grounds, and prayers into a court-ready first draft for Article 226/32 Writs, SLPs, and Commercial Suits.',
      category: 'Drafting & Pleadings',
      icon: Icons.gavel_rounded,
      badge: 'High Court & SC Formats',
      status: 'active',
      features: [
        'Formulated questions of law adhering to Court Rules',
        'Chronological synopsis & list of dates with statutory milestones',
        'Substantiated grounds linking facts to binding judicial ratios',
        'Prayer clauses, interim stay applications & verification deeds',
      ],
      primaryAction: 'Draft Court Pleading',
      benchmarkTime: '10–15 mins',
      statBadge: '99% Structural Accuracy',
      accentColor: AppColors.toolDrafting,
    ),
    ToolItem(
      id: 'documents',
      slug: 'documents',
      title: 'Legal Contracts & Deeds Library',
      shortTitle: 'Contracts & Deeds',
      tagline: 'Draft from 2,176+ Indian Legal Templates Across 58 Categories',
      description:
          'Pick the kind of document, choose a template, provide your situation — conversational AI fills your details with interactive [● label] blanks.',
      category: 'Drafting & Pleadings',
      icon: Icons.description_outlined,
      badge: '2,176 Templates · 58 Categories',
      status: 'active',
      features: [
        'Comprehensive library of 2,176+ templates across 58 categories',
        'Conversational AI refinement extracting parties & dispute details',
        'Live Intelligence Inspector with "What I have" guidance',
        'High Court & standard legal document editor with interactive blanks',
      ],
      primaryAction: 'Browse Templates',
      benchmarkTime: '< 2 mins',
      statBadge: '2,176 Templates',
      accentColor: AppColors.toolDocuments,
    ),
    ToolItem(
      id: 'health-check',
      slug: 'health-check',
      title: 'Document Health Check & 3-Layer Risk Audit',
      shortTitle: 'Document Health Check',
      tagline: 'Automated Diagnostic Audit for Contracts, Agreements & Pleadings',
      description:
          'A 3-layer diagnostic audit spotting missing arbitration seats, uncapped indemnities, unilateral terminations, and statutory compliance traps.',
      category: 'Document Review',
      icon: Icons.fact_check_outlined,
      badge: '3-Layer Risk Audit',
      status: 'active',
      features: [
        'Statutory compliance scan (Contract Act, Specific Relief Act)',
        'Arbitration Seat vs Venue clarity check under Hardy doctrine',
        'Uncapped indemnities & limitation of liability gap identification',
        'Actionable revision checklist with counsel clause substitution',
      ],
      primaryAction: 'Audit Document',
      benchmarkTime: 'Instant diagnostic',
      statBadge: '100-Point Audit Engine',
      accentColor: AppColors.toolHealth,
    ),
    ToolItem(
      id: 'translation',
      slug: 'translation',
      title: 'Vernacular Translation & Legal OCR',
      shortTitle: 'Legal Translation',
      tagline: 'High Court-Grade Certified Translation for 22 Indian Languages',
      description:
          'Translate vernacular court orders, police FIRs, revenue records, and sale deeds into structured judicial English preserving statutory sections.',
      category: 'Judicial Translation',
      icon: Icons.translate_rounded,
      badge: '22 Eighth Schedule Languages',
      status: 'active',
      features: [
        'Certified translation of FIRs, revenue records & court orders',
        'Preservation of statutory sections, FIR numbers & plot measurements',
        'Direct mapping of IPC/CrPC sections to new Bharatiya Nyaya Sanhita (BNS)',
        'Side-by-side bilingual view with formal review notes & export',
      ],
      primaryAction: 'Translate Document',
      benchmarkTime: 'Real-time OCR',
      statBadge: '22 Indian Languages',
      accentColor: AppColors.toolTranslation,
    ),
    ToolItem(
      id: 'mediation',
      slug: 'mediation',
      title: 'Mediation & Settlement Desk',
      shortTitle: 'Mediation & Settlement',
      tagline: 'Order XXIII Rule 3 CPC & Mediation Act 2023 Settlement Sheets',
      description:
          'Structure commercial disputes, unpaid claims, and contested liabilities into a balanced, judicially enforceable 5-part settlement term sheet.',
      category: 'Alternative Dispute Resolution',
      icon: Icons.handshake_outlined,
      badge: 'CPC & Mediation Act',
      status: 'active',
      features: [
        '5-part enforceable settlement agreement complying with Mediation Act 2023',
        'Structured payment tranches, grace periods & default interest',
        'Comprehensive mutual releases & court withdrawal terms',
        'Order XXIII Rule 3 CPC compromise decree template with verification',
      ],
      primaryAction: 'Create Settlement',
      benchmarkTime: '5 mins',
      statBadge: 'Judicially Enforceable',
      accentColor: AppColors.toolSettlement,
    ),
  ];

  static const List<String> categories = [
    'All Tools',
    'Legal Research',
    'Drafting & Pleadings',
    'Alternative Dispute Resolution',
    'Document Review',
    'Judicial Translation',
  ];
}
