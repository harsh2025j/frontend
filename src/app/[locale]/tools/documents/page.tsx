'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Download,
  Printer,
  Sparkles,
  Upload,
  RefreshCw,
  FolderOpen,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  Send,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit2,
  CheckCheck,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw,
  Heading,
  Type,
  X,
  FileCheck2,
} from 'lucide-react';
import { toolsService } from '@/data/services/tools-service/toolsService';
import { LegalDocCategory, LegalDocTemplate, ExtractedEntityItem, StillNeededItem, LegalDocDraft } from '@/data/services/tools-service/types';
import dynamic from 'next/dynamic';

const PaginatedCourtEditor = dynamic(() => import('@/components/ui/PaginatedCourtEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 gap-2">
      <RefreshCw className="size-6 animate-spin text-[#0B2242]" />
      <span className="font-semibold text-[#0B2242]">Loading Google Docs Style Document Editor...</span>
    </div>
  ),
});
import { downloadDocxFile } from '@/utils/docxExport';

// The 58 Indian Statutory Categories with exact template counts
const CATEGORIES: LegalDocCategory[] = [
  { id: 'acknowledgement', name: 'Acknowledgement', templateCount: 67, subcategoriesCount: 6 },
  { id: 'adoption', name: 'Adoption', templateCount: 14 },
  { id: 'affidavit', name: 'Affidavit', templateCount: 13 },
  { id: 'agreement', name: 'Agreement', templateCount: 153 },
  { id: 'application', name: 'Application', templateCount: 9 },
  { id: 'appointment', name: 'Appointment', templateCount: 26 },
  { id: 'apprenticeship', name: 'Apprenticeship', templateCount: 5 },
  { id: 'arbitration', name: 'Arbitration', templateCount: 60, subcategoriesCount: 1 },
  { id: 'assignment', name: 'Assignment', templateCount: 19 },
  { id: 'banking', name: 'Banking', templateCount: 39 },
  { id: 'bond', name: 'Bond', templateCount: 64 },
  { id: 'child-custody', name: 'Child Custody', templateCount: 3 },
  { id: 'civil-pleadings', name: 'Civil Pleadings', templateCount: 232 },
  { id: 'classification-of-offences', name: 'Classification Of Offences', templateCount: 1 },
  { id: 'company', name: 'Company', templateCount: 123 },
  { id: 'composition-deed', name: 'Composition Deed', templateCount: 19 },
  { id: 'consumer-protection-act', name: 'Consumer Protection Act', templateCount: 17 },
  { id: 'conveyancing', name: 'Conveyancing', templateCount: 44 },
  { id: 'copyright', name: 'Copyright', templateCount: 10 },
  { id: 'criminal-pleading', name: 'Criminal Pleading', templateCount: 91 },
  { id: 'easements', name: 'Easements', templateCount: 10 },
  { id: 'exchange', name: 'Exchange', templateCount: 7 },
  { id: 'franchisee', name: 'Franchisee', templateCount: 3 },
  { id: 'gst', name: 'GST', templateCount: 47, subcategoriesCount: 5 },
  { id: 'gift', name: 'Gift', templateCount: 86 },
  { id: 'guarantee', name: 'Guarantee', templateCount: 10 },
  { id: 'hindu-marriage-act', name: 'Hindu Marriage Act, Divorce, Maintenance, Restitution of Conjugal Rights', templateCount: 9 },
  { id: 'hire-purchase', name: 'Hire-Purchase', templateCount: 18 },
  { id: 'income-tax', name: 'Income Tax', templateCount: 187 },
  { id: 'indemnity', name: 'Indemnity', templateCount: 18 },
  { id: 'information-technology', name: 'Information Technology', templateCount: 5 },
  { id: 'infrastructure', name: 'Infrastructure, Development and Financing', templateCount: 15 },
  { id: 'intellectual-property', name: 'Intellectual Property (IPR)', templateCount: 125, subcategoriesCount: 3 },
  { id: 'labour', name: 'Labour', templateCount: 7 },
  { id: 'lease-financing', name: 'Lease Financing', templateCount: 38 },
  { id: 'matrimonial', name: 'Matrimonial', templateCount: 36 },
  { id: 'medical-form', name: 'Medical Form', templateCount: 1 },
  { id: 'mou', name: 'Memorandum of Understanding', templateCount: 2 },
  { id: 'miscellaneous-deeds', name: 'Miscellaneous Deeds', templateCount: 123 },
  { id: 'mortgage-pledge', name: 'Mortgage, Pledge, Hypothecation and Security Documents', templateCount: 35 },
  { id: 'motor-vehicle-act', name: 'Motor Vehicle Act', templateCount: 15 },
  { id: 'negotiable-instrument', name: 'Negotiable Instrument', templateCount: 15 },
  { id: 'notice', name: 'Notice', templateCount: 65 },
  { id: 'partition', name: 'Partition', templateCount: 14 },
  { id: 'partnership', name: 'Partnership', templateCount: 9 },
  { id: 'plaint-and-written-statement', name: 'Plaint and Written Statement', templateCount: 10 },
  { id: 'pleadings', name: 'Pleadings', templateCount: 47 },
  { id: 'power-of-attorney', name: 'Power of Attorney', templateCount: 69 },
  { id: 'principle', name: 'Principle', templateCount: 3 },
  { id: 'release', name: 'Release', templateCount: 10 },
  { id: 'rent', name: 'Rent', templateCount: 13 },
  { id: 'sale', name: 'Sale', templateCount: 23 },
  { id: 'special-leave-petition', name: 'Special Leave Petition', templateCount: 8 },
  { id: 'specific-relief-act', name: 'Specific Relief Act', templateCount: 6 },
  { id: 'supreme-court-forms', name: 'Supreme Court Forms', templateCount: 18 },
  { id: 'trust', name: 'Trust, Wakf and Society', templateCount: 14 },
  { id: 'vakalatnama', name: 'Vakalatnama', templateCount: 12 },
  { id: 'will', name: 'Will', templateCount: 24 },
];

import rawTemplatesCatalog from '@/data/legalTemplatesCatalog.json';

// Curated library of templates mapped to categories (populated from full 2,176 production catalog)
const TEMPLATES_LIBRARY: Record<string, LegalDocTemplate[]> = (() => {
  const lib: Record<string, LegalDocTemplate[]> = {};
  const catalog = rawTemplatesCatalog as unknown as {
    templates: Array<{
      id: string;
      title: string;
      category_slug: string;
      category_name: string;
      subcategory_name?: string | null;
      page_count?: number;
    }>;
  };

  for (const t of catalog.templates) {
    const slug = t.category_slug;
    if (!lib[slug]) lib[slug] = [];
    lib[slug].push({
      id: t.id,
      title: t.title,
      category: t.category_name,
      subcategory: t.subcategory_name || undefined,
      pageCount: t.page_count || 1,
      description: `Official ${t.category_name} standard legal draft template: ${t.title}. Formatted for Indian legal drafting.`,
    });
  }

  // Aliases for short category slugs
  lib['mou'] = lib['memorandum-of-understanding'] || lib['mou'] || [];
  lib['trust'] = lib['trust-wakf-and-society'] || lib['trust'] || [];
  lib['infrastructure'] = lib['infrastructure-development-and-financing'] || lib['infrastructure'] || [];
  lib['intellectual-property'] = lib['intellectual-property-ipr'] || lib['intellectual-property'] || [];
  lib['mortgage-pledge'] = lib['mortgage-pledge-hypothecation-and-security-documents'] || lib['mortgage-pledge'] || [];
  lib['hindu-marriage-act'] = lib['hindu-marriage-act-divorce-maintenance-restitution-of-conjugal-rights'] || lib['hindu-marriage-act'] || [];
  lib['power_of_attorney'] = lib['power-of-attorney'] || [];

  return lib;
})();

interface DocumentSpecimen {
  categoryBadge: string;
  title: string;
  preamble: string;
  parties: Array<{ label: string; text: string }>;
  recitals: string[];
  clauses: Array<{ number: string; title: string; body: string }>;
  signatures: Array<{ role: string; label: string }>;
  witnesses: string[];
}

function getDocumentSpecimen(template: LegalDocTemplate): DocumentSpecimen {
  const titleLower = (template.title || '').toLowerCase();

  if (titleLower.includes('arbitrat')) {
    return {
      categoryBadge: 'Arbitration & Conciliation Act 1996 Specimen',
      title: template.title,
      preamble: 'THIS INDENTURE / AGREEMENT OF REFERENCE is executed on this _____ day of ____________, 20___ at New Delhi, India;',
      parties: [
        { label: 'FIRST PARTY', text: '1. [● FIRST PARTY / CLAIMANT NAME], residing at / registered office at [● Complete Address], (hereinafter referred to as "FIRST PARTY");' },
        { label: 'SECOND PARTY', text: '2. [● SECOND PARTY / RESPONDENT NAME], residing at / registered office at [● Complete Address], (hereinafter referred to as "SECOND PARTY").' },
      ],
      recitals: [
        'WHEREAS commercial transactions took place under Contract Ref No. [● Reference Number] dated [● Date] having an aggregate value of Rs. [● Valuation in INR];',
        'AND WHEREAS disputes and claims have arisen between the parties regarding non-payment and execution amounting to Rs. [● Amount in Dispute];',
        'AND WHEREAS the parties have mutually agreed to refer all disputes to arbitration under the Arbitration and Conciliation Act, 1996 to avoid protracted court litigation;',
      ],
      clauses: [
        { number: '1', title: 'REFERENCE TO ARBITRATORS', body: 'The parties refer all disputes and claims to the joint arbitration of [● Name of Arbitrator 1] (nominated by First Party) and [● Name of Arbitrator 2] (nominated by Second Party).' },
        { number: '2', title: 'APPOINTMENT OF UMPIRE', body: 'The two nominated Arbitrators shall, prior to entering upon the reference, nominate and appoint a third Arbitrator as Presiding Arbitrator (Umpire) in accordance with Section 11 of the Act.' },
        { number: '3', title: 'SEAT & LANGUAGE', body: 'The legal seat and venue of the arbitration shall be [● Seat, e.g. New Delhi], and all proceedings shall be conducted in the English language.' },
        { number: '4', title: 'TIMELINE & AWARD', body: 'The Arbitrators shall make their reasoned award within [● 6 / 12 Months] in terms of Section 29A of the Act, which award shall be conclusive and binding.' },
      ],
      signatures: [
        { role: 'FIRST PARTY', label: 'Signature of First Party / Claimant' },
        { role: 'SECOND PARTY', label: 'Signature of Second Party / Respondent' },
      ],
      witnesses: [
        '1. [● Name, Father’s Name & Address of Witness 1]',
        '2. [● Name, Father’s Name & Address of Witness 2]',
      ],
    };
  }

  if (titleLower.includes('builder') || titleLower.includes('construct')) {
    return {
      categoryBadge: 'Real Estate & Construction Law Specimen',
      title: template.title,
      preamble: 'THIS CONSTRUCTION AGREEMENT is made on this _____ day of ____________, 20___ at [● Place of Execution], India;',
      parties: [
        { label: 'OWNER', text: '1. [● OWNER NAME], residing at [● Residential Address], (hereinafter referred to as the "OWNER");' },
        { label: 'BUILDER', text: '2. [● BUILDER / CONTRACTOR NAME], having its office at [● Office Address], (hereinafter referred to as the "BUILDER").' },
      ],
      recitals: [
        'WHEREAS the Owner is the absolute owner of Plot No. [● Plot Number], Khasra No. [● Khasra], admeasuring [● Area in sq. meters] situated at [● Property Location];',
        'AND WHEREAS the Owner has engaged Architect [● Architect Name] and obtained municipal sanction for construction of a building thereon;',
        'AND WHEREAS the Builder has covenanted to execute and complete the entire construction for an agreed consideration of Rs. [● Agreed Contract Sum];',
      ],
      clauses: [
        { number: '1', title: 'CONSTRUCTION SPECIFICATIONS', body: 'The Builder shall construct the building in strict conformity with architectural drawings and merchantable materials set out in Schedule A.' },
        { number: '2', title: 'PAYMENT TRANCHES', body: 'The Owner shall pay the contract sum of Rs. [● Amount in INR] linked strictly to milestone completion certificates issued by the Architect.' },
        { number: '3', title: 'TIME OF ESSENCE & DELAY', body: 'Construction shall be completed within [● Timeline in Months]. Unexcused delay shall attract liquidated damages of Rs. [● Penalty per week] per week.' },
        { number: '4', title: 'ARBITRATION', body: 'Any dispute arising hereunder shall be referred to arbitration under the Arbitration and Conciliation Act, 1996 with seat at [● Seat / New Delhi].' },
      ],
      signatures: [
        { role: 'OWNER', label: 'Signature of Owner' },
        { role: 'BUILDER', label: 'Signature of Builder / Authorized Signatory' },
      ],
      witnesses: [
        '1. [● Name, Father’s Name & Address of Witness 1]',
        '2. [● Name, Father’s Name & Address of Witness 2]',
      ],
    };
  }

  if (titleLower.includes('power of attorney') || titleLower.includes('poa')) {
    return {
      categoryBadge: 'Powers of Attorney Act 1882 Specimen',
      title: template.title,
      preamble: 'TO ALL TO WHOM THESE PRESENTS SHALL COME, I, [● PRINCIPAL NAME], residing at [● Principal Address], SEND GREETINGS;',
      parties: [
        { label: 'PRINCIPAL', text: '1. [● PRINCIPAL NAME], residing at [● Principal Address], (hereinafter referred to as the "PRINCIPAL");' },
        { label: 'ATTORNEY', text: '2. [● ATTORNEY AGENT NAME], residing at [● Attorney Address], (hereinafter referred to as the "ATTORNEY").' },
      ],
      recitals: [
        'WHEREAS the Principal is the lawful owner of [● Property / Business Description] situated at [● Location / Jurisdiction];',
        'AND WHEREAS the Principal is unable to personally attend to management, court proceedings, and registry filings due to [● Cause, e.g. absence from city / occupation];',
      ],
      clauses: [
        { number: '1', title: 'MANAGEMENT & COLLECTION', body: 'To manage, supervise, and control the said property, demand and collect rents, and issue valid discharge receipts.' },
        { number: '2', title: 'COURT LITIGATION & ADVOCATES', body: 'To institute, defend, sign plaints, written statements, affidavits, and engage advocates on behalf of the Principal.' },
        { number: '3', title: 'SUB-REGISTRAR PRESENTATION', body: 'To present deeds before the Sub-Registrar of Assurances and admit execution thereof on behalf of the Principal.' },
        { number: '4', title: 'RATIFICATION', body: 'The Principal hereby ratifies and confirms all lawful acts done by the Attorney by virtue of these presents.' },
      ],
      signatures: [
        { role: 'PRINCIPAL', label: 'Signature of Principal (Executant)' },
        { role: 'ATTORNEY', label: 'Signature of Attorney (Specimen)' },
      ],
      witnesses: [
        '1. [● Name, Father’s Name & Address of Witness 1]',
        '2. [● Name, Father’s Name & Address of Witness 2]',
      ],
    };
  }

  if (titleLower.includes('notice')) {
    return {
      categoryBadge: 'Statutory Legal Demand Notice Specimen',
      title: template.title,
      preamble: 'LEGAL DEMAND NOTICE ISSUED UNDER INSTRUCTIONS OF CLIENT; DATED: _____ DAY OF ____________, 20___;',
      parties: [
        { label: 'ISSUED BY ADVOCATE FOR', text: 'Client: [● CLIENT / PAYEE NAME], residing at [● Client Address];' },
        { label: 'ADDRESSED TO', text: 'Noticee / Accused: [● NOTICEE / DRAWER NAME], residing at [● Noticee Address].' },
      ],
      recitals: [
        'Under instructions from and on behalf of my client, I hereby serve upon you this formal statutory demand notice:',
        'WHEREAS you approached my client for commercial transaction / loan, towards discharge whereof you issued Cheque No. [● Cheque Number] for Rs. [● Cheque Amount] drawn on [● Bank Name];',
        'AND WHEREAS upon presentation, the said cheque was dishonoured with remark "[● Return Reason, e.g. Funds Insufficient]" vide memo dated [● Cheque Return Date];',
      ],
      clauses: [
        { number: '1', title: 'DEMAND FOR PAYMENT', body: 'You are hereby called upon to pay the said sum of Rs. [● Amount in INR] within 15 days of receipt of this notice.' },
        { number: '2', title: 'CONSEQUENCES OF DEFAULT', body: 'Take notice that failure to pay shall compel my client to initiate criminal proceedings under Section 138 Negotiable Instruments Act without further reference.' },
      ],
      signatures: [
        { role: 'ADVOCATE', label: 'Signature of Advocate for Client' },
      ],
      witnesses: [
        'Copy retained for office file and postal dispatch track record.',
      ],
    };
  }

  // Universal Default Specimen
  return {
    categoryBadge: `Indian Legal Standard Specimen · ${template.category}`,
    title: template.title,
    preamble: 'THIS INDENTURE / AGREEMENT is made on this _____ day of ____________, 20___ at New Delhi, India;',
    parties: [
      { label: 'FIRST PARTY', text: '1. [● FIRST PARTY / PRINCIPAL NAME], residing at / registered office at [● Address], (hereinafter referred to as the "FIRST PARTY");' },
      { label: 'SECOND PARTY', text: '2. [● SECOND PARTY / CONTRACTOR NAME], residing at / registered office at [● Address], (hereinafter referred to as the "SECOND PARTY").' },
    ],
    recitals: [
      'WHEREAS the First Party is the lawful owner/operator of [● Subject Matter] and is desirous of entering into this arrangement;',
      'AND WHEREAS the Second Party has the requisite expertise, capacity, and legal standing to perform the obligations herein;',
      'AND WHEREAS the agreed financial consideration for the covenants herein is Rs. [● Agreed Consideration Amount in INR];',
    ],
    clauses: [
      { number: '1', title: 'SCOPE OF ENGAGEMENT', body: 'The parties agree that the transaction shall be executed strictly as per the terms and specifications agreed upon herein.' },
      { number: '2', title: 'FINANCIAL CONSIDERATION', body: 'In consideration whereof, the Second Party shall pay/receive an amount of Rs. [● Amount in INR] in designated banking tranches.' },
      { number: '3', title: 'DISPUTE RESOLUTION', body: 'Any dispute arising out of this deed shall be referred to arbitration under the Arbitration and Conciliation Act, 1996 with seat at New Delhi, India.' },
      { number: '4', title: 'JURISDICTION', body: 'The competent civil courts having territorial jurisdiction shall have exclusive authority.' },
    ],
    signatures: [
      { role: 'FIRST PARTY', label: 'Signature of First Party' },
      { role: 'SECOND PARTY', label: 'Signature of Second Party' },
    ],
    witnesses: [
      '1. [● Name, Father’s Name & Address of Witness 1]',
      '2. [● Name, Father’s Name & Address of Witness 2]',
    ],
  };
}

function countRemainingBlanks(content: string): number {
  if (!content) return 0;
  const matches1 = content.match(/\[●[^\]]+\]/g) || [];
  const matches2 = content.match(/_{5,}/g) || [];
  return matches1.length + matches2.length;
}

function generateClientSideLegalDraft(
  templateTitle: string,
  category: string,
  situation: string,
  extractedData: Record<string, string> = {}
): string {
  const partyA = extractedData['party_a'] || extractedData['Party A name'] || '[● Name of First Party]';
  const partyAResidence = extractedData['party_a_residence'] || extractedData['Party A residence'] || '[● Residential / Registered Office Address]';
  const partyB = extractedData['party_b'] || extractedData['Party B name'] || '[● Name of Second Party]';
  const partyBResidence = extractedData['party_b_residence'] || extractedData['Party B residence'] || '[● Residential / Registered Office Address]';
  const amount = extractedData['amount'] || extractedData['Financial consideration / amount'] || '[● Agreed Consideration Amount in INR]';
  const seat = extractedData['seat'] || extractedData['Seat of arbitration'] || extractedData['Governing jurisdiction'] || '[● Seat of Arbitration / New Delhi]';
  const disputeSubject = extractedData['dispute_subject'] || extractedData['Subject of the dispute'] || situation || '[● Specific subject matter and transaction scope]';
  const dateOfSigning = '[● Day, Month and Year of Signing]';
  const placeOfSigning = '[● Place of Execution / City]';

  let cleanSeat = extractedData['seat'] || extractedData['Seat of arbitration'] || extractedData['Governing jurisdiction'] || '';
  if (!cleanSeat || /house no|flat no|street|sector|road|nagar|lane/i.test(cleanSeat)) {
    const cityMatch = (situation + ' ' + (extractedData['seat'] || '')).match(/(?:New Delhi|Delhi|Mumbai|Bangalore|Bengaluru|Kolkata|Chennai|Chandigarh|Kanpur|Lucknow|Ahmedabad|Pune|Jaipur|Hyderabad|Indore|Panipat|Gurgaon|Gurugram|Noida|Ghaziabad|Prayagraj|Allahabad|Varanasi|Agra)/i);
    cleanSeat = cityMatch ? cityMatch[0] : 'New Delhi';
  }

  const isAffidavit = /affidavit/i.test(templateTitle) || /affidavit/i.test(category);
  const isWill = /will\b|testament|codicil/i.test(templateTitle) || /will/i.test(category);
  const isPOA = /power.of.attorney|attorney|mukhtarnama|\bpoa\b/i.test(templateTitle) || /power-of-attorney/i.test(category) || /power of attorney/i.test(category);
  const isNotice = /notice/i.test(templateTitle) || /notice/i.test(category);
  const isGift = /gift|danpatra|hiba/i.test(templateTitle) || /gift/i.test(category);
  const isSale = /deed of (?:absolute )?sale|conveyance deed|sale deed|bainama/i.test(templateTitle) || (/^sale$/i.test(category) && !/agreement to sell/i.test(templateTitle));
  const isRent = /rent\b|\blease\b|tenan|kirayanama|leave.and.license/i.test(templateTitle) || /rent|lease financing/i.test(category);
  const isRelease = /\brelease\b|relinquish|chhootnama/i.test(templateTitle) || /release/i.test(category);
  const isPartition = /partition|batwara|family.settlement/i.test(templateTitle) || /partition/i.test(category);
  const isCriminalPleading = /bail|anticipatory|criminal|437|438|439|crpc|bnss|fir\b|quash|remand/i.test(templateTitle) || /criminal pleading|classification of offences/i.test(category);
  const isCivilPleading = /plaint|injunction|civil.suit|order.vii|written.statement|execution.petition|suit.for|slp|special.leave/i.test(templateTitle) || /civil pleadings|plaint and written statement|pleadings|special leave petition|supreme court forms/i.test(category);
  const isPartnership = /partnership|llp deed|firm deed/i.test(templateTitle) || /partnership/i.test(category);
  const isTrust = /trust\b|waqf|society/i.test(templateTitle) || /trust, wakf and society/i.test(category);
  const isArbitration = /arbitrat/i.test(templateTitle) || /arbitration/i.test(category);
  const isConstruction = /builder|construct|building/i.test(templateTitle);

  // 1. STATUTORY AFFIDAVIT GENERATOR (Indian Oaths Act, 1969 & High Court Rules)
  if (isAffidavit) {
    let deponent = extractedData['deponent'] || extractedData['Deponent'] || extractedData['Name'] || '';
    if (!deponent) {
      const m = situation.match(/Deponent\s*:\s*([^,\n]+)/i) || situation.match(/I,\s*([A-Za-z\s]+?)(?:,|$)/);
      if (m) deponent = m[1].trim();
    }
    if (!deponent) deponent = partyA !== '[● Name of First Party]' ? partyA : '[● Full Legal Name of Deponent]';

    let age = extractedData['age'] || extractedData['Age'] || '';
    if (!age) {
      const m = situation.match(/aged\s*(?:about)?\s*(\d+)\s*(?:years)?/i);
      if (m) age = m[1].trim();
    }
    if (!age) age = '[● Age in Years]';

    let father = extractedData['father'] || extractedData['Father'] || extractedData['Spouse'] || '';
    if (!father) {
      const m = situation.match(/(?:son|daughter|wife)\s*of\s*(?:Shri\s*)?([^,\n\.]+)/i);
      if (m) father = m[1].trim();
    }
    if (!father) father = '[● Father’s / Spouse’s Name]';

    let address = extractedData['address'] || extractedData['Address'] || '';
    if (!address) {
      const m = situation.match(/residing at\s*([\s\S]+?)(?=\.\s*[A-Z][a-z]+:|\n|Purpose:|$)/i)
        || situation.match(/address\s*:\s*([^\n\.]+)/i);
      if (m) address = m[1].trim();
    }
    if (!address) address = partyAResidence !== '[● Residential / Registered Office Address of First Party]' ? partyAResidence : '[● Permanent Residential Address of Deponent]';

    let place = extractedData['place'] || extractedData['Place'] || '';
    if (!place) {
      const m = address.match(/(?:Kanpur|New Delhi|Delhi|Noida|Gurgaon|Mumbai|Lucknow|Bangalore|Kolkata|Chennai|Jaipur|Chandigarh|Hyderabad|Pune|Ahmedabad|Ghaziabad|Prayagraj|Allahabad|Varanasi|Agra)/i)
        || situation.match(/(?:Kanpur|New Delhi|Delhi|Noida|Gurgaon|Mumbai|Lucknow|Bangalore|Kolkata|Chennai|Jaipur|Chandigarh|Hyderabad|Pune|Ahmedabad|Ghaziabad|Prayagraj|Allahabad|Varanasi|Agra)/i);
      if (m) place = m[0].trim();
    }
    if (!place) place = placeOfSigning !== '[● Place of Execution / City]' ? placeOfSigning : '[● City / District of Execution]';

    let purpose = extractedData['purpose'] || extractedData['Purpose'] || '';
    if (!purpose) {
      const m = situation.match(/purpose\s*:\s*([^\n\.]+)/i);
      if (m) purpose = m[1].trim();
    }
    if (!purpose) purpose = 'declaring and verifying true particulars before the concerned authority';

    // Parse individual declarations
    let facts: string[] = [];
    const keyFactsMatch = situation.match(/Key Facts to Declare\s*:\s*([\s\S]+)$/i);
    if (keyFactsMatch && keyFactsMatch[1]) {
      facts = keyFactsMatch[1]
        .split('\n')
        .map(s => s.trim().replace(/^[-*•\d\.]+\s*/, ''))
        .filter(s => s.length > 5);
    }
    if (facts.length === 0) {
      facts = situation
        .split('\n')
        .map(s => s.trim())
        .filter(s => /^That\s+/i.test(s));
    }
    if (facts.length === 0) {
      facts = [
        `That the deponent is a permanent and bona fide resident of the address specified hereinabove.`,
        `That all identity proofs, declarations, and credentials submitted by the deponent are authentic and genuine.`,
        `That the deponent has never been convicted of any criminal offense in any court of law in India or abroad.`,
      ];
    }

    const factLines = facts.map((f, i) => `${i + 2}. ${f.startsWith('That ') ? f : 'That ' + f}`).join('\n\n');
    const totalParas = facts.length + 3;

    return `${templateTitle.toUpperCase()}

BEFORE THE NOTARY PUBLIC / OATH COMMISSIONER AT ${place.toUpperCase()}, INDIA

I, ${deponent}, Son/Daughter/Wife of Shri ${father}, aged about ${age} years, resident of ${address}, do hereby solemnly affirm and declare on oath as under:

1. That I am the deponent herein, an Indian citizen, and fully conversant with the true and correct facts stated hereunder.

${factLines}

${totalParas - 1}. That this affidavit is executed and sworn by me for the purpose of ${purpose}, and for presenting the same before the competent verifying authority.

${totalParas}. That whatever is stated hereinabove is true, correct, and based on my personal knowledge and belief, and nothing material has been concealed or misrepresented therefrom.


                                                         _____________________________
                                                         DEPONENT (${deponent})


                                  VERIFICATION

Verified at ${place} on this ${dateOfSigning}, that the contents of paragraphs 1 to ${totalParas} of the above affidavit are true and correct to the best of my personal knowledge and belief. No part of it is false and nothing material has been concealed or suppressed therefrom.


                                                         _____________________________
                                                         DEPONENT (${deponent})


                                  ATTESTATION

Solemnly affirmed and signed before me by the deponent at ${place} on this _____ day of ____________, 20___, who is personally known to me / identified by Shri [● Name of Identifying Advocate], Advocate.


                                                         _____________________________
                                                         NOTARY PUBLIC / OATH COMMISSIONER
                                                         (Seal & Official Registration Stamp)`;
  }

  // 2. STATUTORY WILL / TESTAMENT GENERATOR (Indian Succession Act, 1925, Section 63)
  if (isWill) {
    const testator = partyA !== '[● Name of First Party]' ? partyA : '[● Full Name of Testator]';
    const testatorAddress = partyAResidence !== '[● Residential / Registered Office Address of First Party]' ? partyAResidence : '[● Residential Address of Testator]';
    const executor = partyB !== '[● Name of Second Party]' ? partyB : '[● Name and Address of Appointed Executor]';

    return `${templateTitle.toUpperCase()}

THIS IS THE LAST WILL AND TESTAMENT of me, ${testator}, residing at ${testatorAddress}, executed on this ${dateOfSigning} at ${seat}, India.

WHEREAS:
1. I am in sound health and in possession of sound mind, memory, and understanding, and I am making this Will of my own free will, without any undue influence, coercion, or fraud from any person whomsoever.
2. I hereby revoke, annul, and cancel all former wills, codicils, and testamentary dispositions made by me at any time prior to this deed.

NOW THEREFORE, I DECLARE AND DIRECT AS FOLLOWS:

1. APPOINTMENT OF EXECUTOR:
I hereby nominate and appoint ${executor} to be the sole Executor of this my Last Will and Testament, who shall obtain probate hereof and administer my estate in accordance with my wishes expressed herein.

2. PAYMENT OF LIABILITIES:
I direct my Executor to pay and discharge all my just testamentary expenses, medical dues, and lawful debts out of my estate.

3. DISPOSITION OF IMMOVABLE PROPERTIES:
All my right, title, and interest in my immovable properties, including [● description and schedule of immovable properties], shall devolve and vest absolutely upon [● Name(s) and relationship of beneficiary/beneficiaries].

4. DISPOSITION OF MOVABLE PROPERTIES & BANK ASSETS:
All my bank accounts, fixed deposits, securities, jewelry, and movable assets shall vest absolutely upon [● Name(s) of beneficiary/beneficiaries].

5. RESIDUARY ESTATE:
Any other property, movable or immovable, belonging to me at the time of my demise and not specifically mentioned herein, shall devolve upon [● Name of Residuary Beneficiary].

IN WITNESS WHEREOF, I, the said Testator, have to this my Last Will and Testament set and subscribed my hand on the day, month, and year first written above.


                                                         _____________________________
                                                         TESTATOR (${testator})

ATTESTATION CLAUSE (SECTION 63, INDIAN SUCCESSION ACT, 1925):
Signed, published, and declared by the above-named Testator, ${testator}, as his/her Last Will and Testament, in the joint presence of us, both present at the same time, who at his/her request, in his/her presence, and in the presence of each other, have subscribed our names as attesting witnesses:

WITNESSES:
1. Signature: _______________________
   Name: [● Name of Witness 1]
   Address: [● Address of Witness 1]

2. Signature: _______________________
   Name: [● Name of Witness 2]
   Address: [● Address of Witness 2]`;
  }

  // 3. POWER OF ATTORNEY GENERATOR (Powers of Attorney Act, 1882)
  if (isPOA) {
    const principal = partyA !== '[● Name of First Party]' ? partyA : '[● Name of Principal / Executant]';
    const principalAddress = partyAResidence !== '[● Residential / Registered Office Address of First Party]' ? partyAResidence : '[● Residential Address of Principal]';
    const attorney = partyB !== '[● Name of Second Party]' ? partyB : '[● Name of Appointed Attorney / Agent]';
    const attorneyAddress = partyBResidence !== '[● Residential / Registered Office Address of Second Party]' ? partyBResidence : '[● Address of Attorney]';

    return `${templateTitle.toUpperCase()}

TO ALL TO WHOM THESE PRESENTS SHALL COME, I, ${principal}, residing at ${principalAddress}, SEND GREETINGS:

WHEREAS I am the lawful owner / holder of [● description of subject matter / property / business] and am unable to manage, look after, and attend to the affairs personally due to [● reason, e.g. absence / business commitments].

AND WHEREAS I repose full trust and confidence in ${attorney}, residing at ${attorneyAddress}, and desire to appoint him/her as my lawful Attorney to act for me and on my behalf.

NOW KNOW YE AND THESE PRESENTS WITNESS that I do hereby nominate, constitute, and appoint the said ${attorney} as my true and lawful Attorney, to perform all or any of the following acts, deeds, and things:

1. MANAGEMENT & CUSTODY:
To manage, supervise, and control the said property/matter and to do all acts necessary for its preservation.

2. LEGAL PROCEEDINGS:
To represent me before all courts, registries, sub-registrars, municipal authorities, and government offices, and to sign plaints, petitions, affidavits, and appeals.

3. EXECUTION OF INSTRUMENTS:
To sign, seal, execute, and deliver all deeds, agreements, receipts, and documents on my behalf.

4. RATIFICATION:
AND I hereby agree and undertake to ratify, confirm, and validate all lawful acts, deeds, and things whatsoever done or caused to be done by the said Attorney by virtue of these presents.

IN WITNESS WHEREOF I have executed this Power of Attorney on this ${dateOfSigning} at ${seat}.


                                                         _____________________________
                                                         EXECUTANT / PRINCIPAL (${principal})

I accept the appointment as Attorney:
_____________________________
ATTORNEY (${attorney})

WITNESSES:
1. Signature: __________________ Name & Address: [● Witness 1]
2. Signature: __________________ Name & Address: [● Witness 2]`;
  }

  // 4. STATUTORY LEGAL NOTICE GENERATOR (Advocate Legal Demand Notice)
  if (isNotice) {
    const client = partyA !== '[● Name of First Party]' ? partyA : '[● Name of Client]';
    const recipient = partyB !== '[● Name of Second Party]' ? partyB : '[● Name of Notice Recipient]';
    const recipientAddress = partyBResidence !== '[● Residential / Registered Office Address of Second Party]' ? partyBResidence : '[● Address of Recipient]';

    return `REGISTERED A.D. / SPEED POST LEGAL DEMAND NOTICE

FROM:
[● Name of Advocate], Advocate
Office: [● Chambers / Law Office Address]
Mobile: [● Mobile Number] | Email: [● Email Address]
Date: ${dateOfSigning}

TO:
${recipient}
${recipientAddress}

SUBJECT: LEGAL DEMAND NOTICE UNDER INSTRUCTIONS OF MY CLIENT, ${client.toUpperCase()}

Sir / Madam,

Under instructions from and on behalf of my client, ${client}, I hereby serve upon you this formal Legal Notice as follows:

1. That my client is [● description of client, business relationship, or transaction context].

2. That on or about [● date / timeline], you entered into an understanding/transaction with my client regarding ${disputeSubject}, under which a total sum of Rs. ${amount} was payable/due to my client.

3. That in breach of your contractual, statutory, and legal obligations, you have failed and neglected to fulfill the obligations / discharge the outstanding liabilities despite repeated oral demands and communications.

4. That by reason of your aforesaid willful default and breach, my client has suffered grave financial loss, injury, and mental harassment.

NOW, THEREFORE, I HEREBY CALL UPON YOU, through this Legal Notice, to pay the outstanding sum of Rs. ${amount} / perform [● specific requisition] within a period of 15 (FIFTEEN) DAYS from the receipt of this notice.

PLEASE TAKE NOTE that in the event of your failure to comply with the requisitions of this notice within the stipulated period, my client has given me strict instructions to institute appropriate civil suits for recovery and/or criminal proceedings before the competent courts of law, holding you strictly liable for all costs, damages, and consequences arising therefrom.

A copy of this notice is retained in my office for future legal proceedings and record.


                                                         _____________________________
                                                         [● Name of Advocate]
                                                         ADVOCATE FOR THE CLIENT`;
  }

  // 5. ARBITRATION REFERENCE AGREEMENT (Arbitration & Conciliation Act, 1996)
  if (isArbitration) {
    const arb1 = extractedData['First arbitrator'] || extractedData['arbitrator_1'] || '[● Name of First Arbitrator appointed by First Party]';
    const arb2 = extractedData['Second arbitrator'] || extractedData['arbitrator_2'] || '[● Name of Second Arbitrator appointed by Second Party]';

    return `${templateTitle.toUpperCase()}

THIS ARBITRATION AGREEMENT is made at ${cleanSeat} on this ${dateOfSigning} between ${partyA}, residing at ${partyAResidence}, of the ONE PART and ${partyB}, residing at ${partyBResidence}, of the OTHER PART.

WHEREAS disputes and differences have arisen between the parties hereto regarding ${disputeSubject}, having a total valuation of ${amount}.

AND WHEREAS the parties have mutually agreed to refer all disputes, claims, and counterclaims arising out of or in connection with the said transaction to two arbitrators viz. ${arb1} and ${arb2}.

NOW IT IS HEREBY MUTUALLY AGREED BY AND BETWEEN THE PARTIES HERETO AS FOLLOWS:

1. The parties hereto refer all their disputes, claims, and counterclaims regarding ${disputeSubject} and all questions incidental thereto to the joint arbitration and final determination of the said two Arbitrators ${arb1} and ${arb2}.

2. The said Arbitrators shall, before entering upon the reference and prior to conducting any arbitral hearings, appoint a third arbitrator who shall act as the Presiding Arbitrator (Umpire) in accordance with Section 11 of the Arbitration and Conciliation Act, 1996.

3. The seat and venue of the arbitration proceedings shall be ${cleanSeat}, and the arbitral tribunal shall conduct the proceedings in the English language.

4. The Arbitrators shall make their final arbitral award within the statutory period prescribed under Section 29A of the Arbitration and Conciliation Act, 1996.

5. The arbitral award passed by the Arbitral Tribunal shall be final, conclusive, and binding upon both parties and their respective legal heirs, successors, and permitted assigns.

IN WITNESS WHEREOF the parties hereto have signed and executed this Agreement on the day, month, and year first above written.

_____________________________               _____________________________
FIRST PARTY (${partyA})                      SECOND PARTY (${partyB})

WITNESSES:
1. [● Name, Father's Name and Address of Witness 1]
2. [● Name, Father's Name and Address of Witness 2]`;
  }

  // 6. STATUTORY GIFT DEED GENERATOR (Transfer of Property Act, 1882, Section 122)
  if (isGift) {
    let donor = extractedData['donor'] || extractedData['Donor'] || '';
    if (!donor) {
      const m = situation.match(/Donor\s*:\s*([^,\n]+)/i);
      if (m) donor = m[1].trim();
    }
    if (!donor) donor = partyA !== '[● Name of First Party]' ? partyA : '[● Full Legal Name of Donor]';

    let donee = extractedData['donee'] || extractedData['Donee'] || '';
    if (!donee) {
      const m = situation.match(/Donee\s*:\s*([^,\n]+)/i);
      if (m) donee = m[1].trim();
    }
    if (!donee) donee = partyB !== '[● Name of Second Party]' ? partyB : '[● Full Legal Name of Donee]';

    let prop = extractedData['property'] || extractedData['Property'] || '';
    if (!prop) {
      const m = situation.match(/(?:residential flat|plot|house|property)\s+at\s+([^,\n\.]+)/i)
        || situation.match(/property\s*:\s*([^,\n\.]+)/i);
      if (m) prop = m[1].trim();
    }
    if (!prop) prop = '[● Detailed Description & Schedule of Gifted Property]';

    return `DEED OF GIFT

THIS DEED OF GIFT is made and executed on this ${dateOfSigning} at ${cleanSeat}, India,

BY AND BETWEEN:

${donor}, residing at ${partyAResidence} (hereinafter referred to as the "DONOR", which expression shall unless repugnant to the context include his/her heirs, executors, administrators, and assigns) of the ONE PART;

AND

${donee}, residing at ${partyBResidence} (hereinafter referred to as the "DONEE", which expression shall unless repugnant to the context include his/her heirs, executors, administrators, and assigns) of the OTHER PART.

WHEREAS:
1. The Donor is the absolute, lawful owner and in exclusive possession of the property more fully described in the Schedule hereunder written (hereinafter referred to as the "Said Property").
2. The Donee is the [● relationship, e.g. son / daughter / close family member] of the Donor, and the Donor holds deep affection and regard for the Donee.
3. Out of natural love and affection which the Donor bears towards the Donee, the Donor is desirous of gifting and conveying the Said Property absolutely unto the Donee without any monetary consideration or pecuniary benefit whatsoever.

NOW THIS DEED OF GIFT WITNESSETH IN TERMS OF SECTION 122 OF THE TRANSFER OF PROPERTY ACT, 1882:

1. VOLUNTARY GIFT & CONVEYANCE:
In consideration of natural love and affection, the Donor doth hereby freely, voluntarily, and absolutely grant, transfer, convey, and assign by way of gift unto the Donee all that piece and parcel of the Said Property, together with all rights, titles, interests, easements, privileges, and appurtenances belonging thereto.

2. ABSOLUTE OWNERSHIP & POSSESSION:
The Donor has on the execution hereof delivered peaceful, vacant physical possession and custody of the Said Property unto the Donee. The Donee shall henceforth hold, enjoy, and possess the Said Property as the absolute and sole owner thereof without any eviction, hindrance, claim, or demand by the Donor or anyone claiming through or under him/her.

3. COVENANT OF TITLE & NON-ENCUMBRANCE:
The Donor covenants that the Said Property is free from all encumbrances, liens, mortgages, charges, court attachments, or statutory claims, and that the Donor possesses full right and power to gift the same.

4. STATUTORY ACCEPTANCE BY DONEE:
The Donee hereby gratefully accepts the gift of the Said Property made by the Donor under this Deed during the lifetime of the Donor, in solemn compliance with Section 122 of the Transfer of Property Act, 1882.

SCHEDULE OF PROPERTY
All that residential property situated at: ${prop}, bounded as follows:
North: [● Boundary on North]
South: [● Boundary on South]
East:  [● Boundary on East]
West:  [● Boundary on West]

IN WITNESS WHEREOF the Donor and the Donee have subscribed their respective hands to this Deed of Gift on the day, month, and year first above written.

_____________________________               _____________________________
DONOR (${donor})                             DONEE (${donee})
                                            ("I accept the Gift as Donee")

WITNESSES:
1. Signature: _______________________ Name: [● Witness 1 Name & Address]
2. Signature: _______________________ Name: [● Witness 2 Name & Address]`;
  }

  // 7. STATUTORY DEED OF ABSOLUTE SALE (Transfer of Property Act, 1882, Section 54)
  if (isSale) {
    let vendor = extractedData['vendor'] || extractedData['seller'] || '';
    if (!vendor) {
      const m = situation.match(/(?:Seller\/Vendor|Seller|Vendor)\s*:\s*([^,\n]+)/i);
      if (m) vendor = m[1].trim();
    }
    if (!vendor) vendor = partyA !== '[● Name of First Party]' ? partyA : '[● Full Legal Name of Vendor]';

    let purchaser = extractedData['purchaser'] || extractedData['buyer'] || '';
    if (!purchaser) {
      const m = situation.match(/(?:Buyer\/Purchaser|Buyer|Purchaser)\s*:\s*([^,\n]+)/i);
      if (m) purchaser = m[1].trim();
    }
    if (!purchaser) purchaser = partyB !== '[● Name of Second Party]' ? partyB : '[● Full Legal Name of Purchaser]';

    let saleAmount = amount;
    const mAmount = situation.match(/(?:consideration of|total consideration of|sum of)\s*(?:Rs\.?|INR)?\s*([0-9,]+)/i);
    if (mAmount) saleAmount = 'Rs. ' + mAmount[1].trim();

    let prop = extractedData['property'] || '';
    if (!prop) {
      const m = situation.match(/(?:Sale of|property at|plot|flat)\s+([^\n\.]+?)(?=\s+for|\s+paid|$)/i);
      if (m) prop = m[1].trim();
    }
    if (!prop) prop = '[● Detailed Description of Immovable Property]';

    return `DEED OF ABSOLUTE SALE

THIS DEED OF SALE is executed on this ${dateOfSigning} at ${cleanSeat}, India,

BY AND BETWEEN:

${vendor}, residing at ${partyAResidence} (hereinafter called the "VENDOR", which expression shall unless repugnant to the context include legal heirs, executors, administrators, and assigns) of the ONE PART;

AND

${purchaser}, residing at ${partyBResidence} (hereinafter called the "PURCHASER", which expression shall unless repugnant to the context include legal heirs, executors, administrators, and assigns) of the OTHER PART.

WHEREAS:
1. The Vendor is the absolute and lawful owner and in continuous possession of all that freehold property situated at ${prop}, having acquired title vide registered deed [● Registered Deed No. / Title particulars].
2. The Vendor has agreed to sell, transfer, and convey the said property, and the Purchaser has agreed to purchase the same for the total agreed sale consideration of ${saleAmount}.

NOW THIS DEED OF SALE WITNESSETH IN TERMS OF SECTION 54 OF THE TRANSFER OF PROPERTY ACT, 1882 AS FOLLOWS:

1. CONSIDERATION & DISCHARGE RECEIPT:
In consideration of the total sum of ${saleAmount} paid by the Purchaser to the Vendor (the receipt whereof the Vendor doth hereby admit, acknowledge, and grant full acquittance and discharge unto the Purchaser), the Vendor hereby grants, conveys, sells, transfers, and assigns absolutely and forever unto the Purchaser all right, title, and interest in the Said Property.

2. VACANT PEACEFUL POSSESSION:
The Vendor has simultaneously with the execution of this deed delivered vacant, peaceful possession of the Said Property along with original title documents and sanction plans to the Purchaser.

3. FREE FROM ENCUMBRANCES:
The Vendor solemnly covenants that the Said Property is completely free from all mortgages, charges, liens, trusts, court attachments, litigations, tax arrears, or encumbrances of any nature whatsoever.

4. INDEMNITY & TITLE WARRANTY:
The Vendor undertakes to indemnify and keep indemnified the Purchaser against any loss, damages, or costs that the Purchaser may incur on account of any defect or defect in title of the Vendor or claims raised by any third party or legal heir.

5. MUTATION & TAXATION:
The Purchaser shall be entitled to effect mutation of the Said Property in municipal, revenue, and electricity authority records in his/her own name.

SCHEDULE OF PROPERTY
All that freehold residential plot/property bearing: ${prop}
Bounded by:
North: [● Property / Road on North]
South: [● Property / Road on South]
East:  [● Property / Road on East]
West:  [● Property / Road on West]

IN WITNESS WHEREOF the Vendor and Purchaser have set their respective hands on the day and year first written above.

_____________________________               _____________________________
VENDOR (${vendor})                           PURCHASER (${purchaser})

WITNESSES:
1. Signature: _______________________ Name: [● Witness 1 Name & Address]
2. Signature: _______________________ Name: [● Witness 2 Name & Address]`;
  }

  // 8. STATUTORY RESIDENTIAL TENANCY & LEASE AGREEMENT
  if (isRent) {
    let lessor = extractedData['landlord'] || extractedData['lessor'] || '';
    if (!lessor) {
      const m = situation.match(/(?:Landlord\/Lessor|Landlord|Lessor)\s*:\s*([^,\n]+)/i);
      if (m) lessor = m[1].trim();
    }
    if (!lessor) lessor = partyA !== '[● Name of First Party]' ? partyA : '[● Full Legal Name of Landlord / Lessor]';

    let lessee = extractedData['tenant'] || extractedData['lessee'] || '';
    if (!lessee) {
      const m = situation.match(/(?:Tenant\/Lessee|Tenant|Lessee)\s*:\s*([^,\n]+)/i);
      if (m) lessee = m[1].trim();
    }
    if (!lessee) lessee = partyB !== '[● Name of Second Party]' ? partyB : '[● Full Legal Name of Tenant / Lessee]';

    let rent = extractedData['rent'] || '';
    const mRent = situation.match(/monthly rent of\s*(?:Rs\.?|INR)?\s*([0-9,]+)/i);
    if (mRent) rent = 'Rs. ' + mRent[1].trim();
    if (!rent) rent = 'Rs. 35,000/- per month';

    let deposit = extractedData['deposit'] || '';
    const mDep = situation.match(/security deposit of\s*(?:Rs\.?|INR)?\s*([0-9,]+)/i);
    if (mDep) deposit = 'Rs. ' + mDep[1].trim();
    if (!deposit) deposit = 'Rs. 1,00,000/-';

    let duration = extractedData['duration'] || extractedData['tenure'] || '';
    const mDur = situation.match(/duration of\s*([^,\n\.]+)/i);
    if (mDur) duration = mDur[1].trim();
    if (!duration) duration = '11 (Eleven) months';

    let demisedPremises = extractedData['premises'] || '';
    if (!demisedPremises) {
      const m = situation.match(/(?:Flat No\.|Plot No\.|owner of|premises)\s+([^,\n\.]+?)(?=\.\s*Tenant|\.\s*Monthly|$)/i);
      if (m) demisedPremises = m[1].trim();
    }
    if (!demisedPremises) demisedPremises = partyAResidence;

    return `RESIDENTIAL TENANCY AND LEASE AGREEMENT

THIS LEASE AGREEMENT is made and entered into on this ${dateOfSigning} at ${cleanSeat}, India,

BY AND BETWEEN:

${lessor}, residing at ${partyAResidence} (hereinafter referred to as the "LESSOR / LANDLORD", which expression shall include legal heirs, successors, and assigns) of the ONE PART;

AND

${lessee}, residing at ${partyBResidence} (hereinafter referred to as the "LESSEE / TENANT", which expression shall include legal heirs and permitted assigns) of the OTHER PART.

WHEREAS the Lessor is the absolute owner and in possession of the residential property: ${demisedPremises} (hereinafter referred to as the "Demised Premises"), and has agreed to let out the same to the Lessee for residential tenancy purposes.

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:

1. DURATION OF TENANCY:
The tenancy shall be for a fixed term of ${duration}, commencing from [● Commencement Date] and expiring on [● Expiry Date], renewable by mutual written consent.

2. MONTHLY RENT:
The Lessee agrees to pay to the Lessor a monthly rent of ${rent}, payable strictly in advance on or before the 7th day of each calendar month via bank transfer / RTGS.

3. INTEREST-FREE SECURITY DEPOSIT:
The Lessee has deposited with the Lessor an interest-free refundable security deposit of ${deposit}. The said deposit shall be refunded to the Lessee at the time of vacating and handing over peaceful possession of the Demised Premises, subject to deductions for unpaid utility dues or structural damages beyond normal wear and tear.

4. UTILITIES & MAINTENANCE:
The Lessee shall regularly pay the actual electricity, water, and society maintenance charges directly to the concerned service authorities.

5. RESTRICTIONS ON USE & SUB-LETTING:
The Demised Premises shall be used solely and exclusively for private residential dwelling purposes. The Lessee shall not sub-let, assign, or part with possession of the premises to any third party.

6. TERMINATION & VACATING:
Either party may terminate this agreement by giving 1 (one) month's written notice to the other. Upon termination, the Lessee shall peacefully hand over vacant possession of the premises in good condition.

IN WITNESS WHEREOF the Lessor and the Lessee have executed this Tenancy Agreement on the date first written above.

_____________________________               _____________________________
LESSOR / LANDLORD (${lessor})                 LESSEE / TENANT (${lessee})

WITNESSES:
1. Signature: _______________________ Name: [● Witness 1 Name & Address]
2. Signature: _______________________ Name: [● Witness 2 Name & Address]`;
  }

  // 9. STATUTORY DEED OF RELEASE & RELINQUISHMENT OF UNDIVIDED SHARE
  if (isRelease) {
    let releasor = extractedData['releasor'] || '';
    if (!releasor) {
      const m = situation.match(/Releasor\s*:\s*([^,\n]+)/i);
      if (m) releasor = m[1].trim();
    }
    if (!releasor) releasor = partyA !== '[● Name of First Party]' ? partyA : '[● Full Legal Name of Releasor]';

    let releasee = extractedData['releasee'] || '';
    if (!releasee) {
      const m = situation.match(/Releasee\s*:\s*([^,\n]+)/i);
      if (m) releasee = m[1].trim();
    }
    if (!releasee) releasee = partyB !== '[● Name of Second Party]' ? partyB : '[● Full Legal Name of Releasee]';

    let share = 'undivided share';
    const mShare = situation.match(/(\d+\/\d+(?:rd|th)?\s+undivided share)/i);
    if (mShare) share = mShare[1].trim();

    let prop = extractedData['property'] || '';
    if (!prop) {
      const m = situation.match(/(?:ancestral property at|property at)\s*([^,\n\.]+)/i);
      if (m) prop = m[1].trim();
    }
    if (!prop) prop = '[● Detailed Schedule of Ancestral / Joint Property]';

    return `DEED OF RELINQUISHMENT AND RELEASE

THIS DEED OF RELEASE AND RELINQUISHMENT is executed on this ${dateOfSigning} at ${cleanSeat}, India,

BY:

${releasor}, residing at ${partyAResidence} (hereinafter called the "RELEASOR", which expression shall include legal heirs, successors, and assigns) of the ONE PART;

IN FAVOR OF:

${releasee}, residing at ${partyBResidence} (hereinafter called the "RELEASEE", which expression shall include legal heirs, successors, and assigns) of the OTHER PART.

WHEREAS:
1. The parties hereto are related as [● family relationship / brother and sister / co-heirs], being the legal heirs of Late [● Name of Deceased Ancestor/Parent].
2. The Releasor holds and is legally entitled to a ${share} in the joint ancestral property situated at: ${prop}.
3. The Releasor has decided out of natural love, familial harmony, and affection to voluntarily relinquish, release, and surrender all her/his undivided share, title, and claim in the said property in favor of the Releasee without claiming any monetary consideration or compensation therefor.

NOW THIS DEED WITNESSETH AS FOLLOWS:

1. VOLUNTARY RELINQUISHMENT:
The Releasor doth hereby absolutely and irrevocably relinquish, release, surrender, and forever extinguish all her/his ${share}, right, title, claim, and interest in and to the said property in favor of the Releasee.

2. VESTING OF EXCLUSIVE TITLE:
By virtue of this deed, the Releasee becomes the absolute, exclusive owner of the said relinquished share. The Releasee shall henceforth hold and enjoy the property without any let, hindrance, interruption, or claim by the Releasor or anyone claiming through her/him.

3. MUTATION:
The Releasor confirms that she/he has no objection to the mutation of the said property exclusively in the name of the Releasee in the revenue and municipal records.

SCHEDULE OF PROPERTY
All that joint ancestral property situated at: ${prop}
Bounded by:
North: [● North Boundary]
South: [● South Boundary]
East:  [● East Boundary]
West:  [● West Boundary]

IN WITNESS WHEREOF the Releasor has executed and signed this Deed of Relinquishment in the presence of the Releasee and attesting witnesses.

_____________________________               _____________________________
RELEASOR (${releasor})                       RELEASEE (${releasee})
                                            ("Accepted")

WITNESSES:
1. Signature: _______________________ Name: [● Witness 1 Name & Address]
2. Signature: _______________________ Name: [● Witness 2 Name & Address]`;
  }

  // 10. STATUTORY DEED OF PARTITION BETWEEN CO-OWNERS
  if (isPartition) {
    let prop = situation.match(/(?:joint family property at|property at)\s*([^,\n\.]+)/i)?.[1] || '[● Joint Family Property Details]';

    return `DEED OF PARTITION BETWEEN CO-OWNERS

THIS DEED OF PARTITION is made and executed on this ${dateOfSigning} at ${cleanSeat}, India,

BY AND BETWEEN:

${partyA}, residing at ${partyAResidence} (hereinafter referred to as "FIRST CO-SHARER") of the FIRST PART;

AND

${partyB}, residing at ${partyBResidence} (hereinafter referred to as "SECOND CO-SHARER") of the SECOND PART;
(Collectively referred to as the "CO-SHARERS").

WHEREAS:
1. The Co-sharers are the joint and absolute owners of the joint family property situated at ${prop}.
2. Disputes and inconvenience having arisen in the joint enjoyment of the said property, the Co-sharers have mutually agreed to effect an absolute partition by metes and bounds so that each Co-sharer may hold and enjoy his/her allotted portion in severalty.

NOW THIS DEED OF PARTITION WITNESSETH AS FOLLOWS:

1. ALLOTMENT OF SCHEDULE A:
All that portion of the property described in SCHEDULE A hereunder is allotted absolutely and exclusively to the First Co-sharer (${partyA}), who shall henceforth hold and possess the same as absolute owner.

2. ALLOTMENT OF SCHEDULE B:
All that portion of the property described in SCHEDULE B hereunder is allotted absolutely and exclusively to the Second Co-sharer (${partyB}), who shall henceforth hold and possess the same as absolute owner.

3. MUTUAL RELEASE & DISCHARGE:
Each of the Co-sharers doth hereby release, quit-claim, and discharge the portion of the property allotted to the other Co-sharer, so that neither party nor their respective legal heirs shall have any claim, right, or demand in the share of the other.

4. SEPARATE ENJOYMENT & MUTATION:
Each party shall be entitled to get their respective allotted portions mutated separately in their own names in the municipal and revenue records and pay the taxes assessed thereon independently.

SCHEDULE A (Allotted to First Co-sharer)
All that portion measuring [● Area] bounded by:
North: [● North] | South: [● South] | East: [● East] | West: [● West]

SCHEDULE B (Allotted to Second Co-sharer)
All that portion measuring [● Area] bounded by:
North: [● North] | South: [● South] | East: [● East] | West: [● West]

IN WITNESS WHEREOF the Co-sharers have signed and executed this Deed of Partition on the day and year first above written.

_____________________________               _____________________________
FIRST CO-SHARER (${partyA})                  SECOND CO-SHARER (${partyB})

WITNESSES:
1. Signature: _______________________ Name: [● Witness 1 Name & Address]
2. Signature: _______________________ Name: [● Witness 2 Name & Address]`;
  }

  // 11. STATUTORY CIVIL PLEADINGS / PLAINT / INJUNCTION (Code of Civil Procedure, 1908)
  if (isCivilPleading) {
    let court = 'IN THE COURT OF LEARNED CIVIL JUDGE (SENIOR DIVISION) / DISTRICT JUDGE';
    const mCourt = situation.match(/(?:Court of|In the court of)\s*([^,\n\.]+)/i);
    if (mCourt) court = `IN THE COURT OF ${mCourt[1].trim().toUpperCase()}`;

    let plaintiff = extractedData['plaintiff'] || '';
    if (!plaintiff) {
      const m = situation.match(/Plaintiff\s*:\s*([^,\n]+)/i);
      if (m) plaintiff = m[1].trim();
    }
    if (!plaintiff) plaintiff = partyA !== '[● Name of First Party]' ? partyA : '[● Name of Plaintiff]';

    let defendant = extractedData['defendant'] || '';
    if (!defendant) {
      const m = situation.match(/Defendant\s*:\s*([^,\n]+)/i);
      if (m) defendant = m[1].trim();
    }
    if (!defendant) defendant = partyB !== '[● Name of Second Party]' ? partyB : '[● Name of Defendant]';

    let valuation = 'Rs. 25,00,000/-';
    const mVal = situation.match(/(?:Valued at|Valuation)\s*(?:Rs\.?|INR)?\s*([0-9,]+)/i);
    if (mVal) valuation = 'Rs. ' + mVal[1].trim();

    return `${court}
AT ${cleanSeat.toUpperCase()}

CIVIL SUIT NO. ________ OF 20___

IN THE MATTER OF:

${plaintiff}
Having address at: ${partyAResidence}
                                                                  ... PLAINTIFF
VERSUS

${defendant}
Having address at: ${partyBResidence}
                                                                  ... DEFENDANT

SUIT FOR PERMANENT PROHIBITORY INJUNCTION AND ANCILLARY RELIEFS UNDER ORDER VII OF THE CODE OF CIVIL PROCEDURE, 1908

THE PLAINTIFF MOST RESPECTFULLY SHOWETH:

1. That the Plaintiff is a law-abiding person/entity and is the lawful, absolute owner and in continuous possession of the suit property: ${disputeSubject}.

2. That the Defendant has no right, title, or interest in the suit property, yet on or about [● date of cause of action], the Defendant along with his associates illegally attempted to trespass, interfere, and dispossess the Plaintiff from the suit property without any authority of law.

3. That the Plaintiff lodged a formal police complaint regarding the illegal threats and encroachment attempts, but was advised that the dispute involves civil rights over immovable property, necessitating the filing of the present civil suit.

4. CAUSE OF ACTION:
The cause of action for filing the present suit arose in favor of the Plaintiff and against the Defendant on [● date] when the Defendant first threatened to disturb peaceful possession, and continues to subsist from day to day as the threat of illegal interference remains imminent.

5. VALUATION & COURT FEES:
The suit for the purposes of court fees and jurisdiction is valued at ${valuation}, and the requisite ad-valorem court fees have been duly affixed on the plaint.

6. JURISDICTION:
The suit property is situated within the territorial and pecuniary jurisdiction of this Hon'ble Court, and this Hon'ble Court has full competence to try and adjudicate the present suit.

                                  PRAYER

WHEREFORE, IT IS MOST RESPECTFULLY PRAYED THAT THIS HON'BLE COURT MAY BE PLEASED TO:

(a) Pass a Decree of Permanent Prohibitory Injunction restraining the Defendant, his agents, servants, and representatives from trespassing into, encroaching upon, or interfering with the Plaintiff's peaceful possession over the suit property;
(b) Award costs of the suit in favor of the Plaintiff and against the Defendant; and
(c) Pass such other or further order(s) as this Hon'ble Court may deem fit and proper in the interest of justice.


                                                          _____________________________
                                                          PLAINTIFF (${plaintiff})
                                                          THROUGH ADVOCATE

                                   VERIFICATION

Verified at ${cleanSeat} on this ${dateOfSigning}, that the contents of paragraphs 1 to 6 of the above Plaint are true and correct to the best of my personal knowledge and belief, and nothing material has been concealed therefrom.


                                                          _____________________________
                                                          PLAINTIFF (${plaintiff})`;
  }

  // 12. STATUTORY CRIMINAL PLEADINGS / BAIL APPLICATION (CrPC / BNSS)
  if (isCriminalPleading) {
    let court = 'IN THE COURT OF LEARNED SESSIONS JUDGE / SPECIAL JUDGE';
    const mCourt = situation.match(/(?:court of|before)\s*([^,\n\.]+)/i);
    if (mCourt) court = `IN THE COURT OF ${mCourt[1].trim().toUpperCase()}`;

    let applicant = extractedData['accused'] || extractedData['applicant'] || '';
    if (!applicant) {
      const m = situation.match(/(?:Applicant\/Accused|Applicant|Accused)\s*:\s*([^,\n]+)/i);
      if (m) applicant = m[1].trim();
    }
    if (!applicant) applicant = partyA !== '[● Name of First Party]' ? partyA : '[● Name of Applicant / Accused]';

    let firNo = '204/2024';
    const mFir = situation.match(/FIR No\.\s*([^,\n\.]+)/i);
    if (mFir) firNo = mFir[1].trim();

    let ps = 'Karol Bagh';
    const mPs = situation.match(/(?:PS|Police Station)\s*([^,\n\.]+)/i);
    if (mPs) ps = mPs[1].trim();

    let sections = '420/406 IPC';
    const mSec = situation.match(/Section\s*([^,\n\.]+)/i);
    if (mSec) sections = mSec[1].trim();

    return `${court}
AT ${cleanSeat.toUpperCase()}

BAIL APPLICATION NO. ________ OF 20___

IN THE MATTER OF:

${applicant}
S/o [● Father's Name], R/o ${partyAResidence}
(Presently confined in Central Jail / Judicial Custody)
                                                                  ... APPLICANT / ACCUSED
VERSUS

STATE (GOVT. OF NCT OF DELHI / STATE OF UTTAR PRADESH)
                                                                  ... RESPONDENT

APPLICATION UNDER SECTION 439 OF THE CODE OF CRIMINAL PROCEDURE, 1973 (READ WITH SECTION 483 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023) FOR GRANT OF REGULAR BAIL TO THE APPLICANT IN FIR NO. ${firNo}, POLICE STATION ${ps.toUpperCase()}, UNDER SECTIONS ${sections}.

MOST RESPECTFULLY SHOWETH:

1. That the Applicant / Accused is a respectable citizen with deep roots in society and has been falsely implicated in the above-mentioned FIR registered at Police Station ${ps}.

2. That the Applicant was arrested on [● date of arrest] and is currently in judicial custody. Investigation as against the Applicant is complete and custodial interrogation is no longer required.

3. GROUNDS FOR REGULAR BAIL:
   (a) False Implication: The allegations leveled in the FIR are purely civil/commercial in nature and have been given a criminal color with malafide intent.
   (b) No Flight Risk: The Applicant is a permanent resident of the address specified herein, having deep roots in society and immovable assets, and there is no likelihood of absconding.
   (c) Parity: The co-accused in the matter has already been enlarged on bail by the competent court.
   (d) Tampering Not Possible: All documentary evidence is already seized by the Investigating Agency, eliminating any possibility of witness tampering.
   (e) Undertaking: The Applicant undertakes to abide by all terms and conditions that may be imposed by this Hon'ble Court.

                                  PRAYER

WHEREFORE, IT IS MOST RESPECTFULLY PRAYED THAT THIS HON'BLE COURT MAY BE PLEASED TO:

(a) Enlarge the Applicant / Accused on regular bail in FIR No. ${firNo}, registered at Police Station ${ps}, on such terms and conditions as this Hon'ble Court may deem fit; and
(b) Pass such other or further order(s) as this Hon'ble Court may deem just and proper in the interest of justice.


                                                          _____________________________
                                                          APPLICANT / ACCUSED (${applicant})
                                                          THROUGH COUNSEL

                                   VERIFICATION

Verified at ${cleanSeat} on this ${dateOfSigning}, that the contents of paragraphs 1 to 3 of the above Bail Application are true and correct to the best of my knowledge and belief based on case records.


                                                          _____________________________
                                                          APPLICANT / ACCUSED (${applicant})`;
  }

  // 13. STATUTORY PARTNERSHIP DEED (Indian Partnership Act, 1932)
  if (isPartnership) {
    let partner1 = partyA !== '[● Name of First Party]' ? partyA : '[● Partner 1 Full Name]';
    let partner2 = partyB !== '[● Name of Second Party]' ? partyB : '[● Partner 2 Full Name]';
    const mPartners = situation.match(/Partners\s*:\s*Partner 1\s*([^,\n]+?)\s*and\s*Partner 2\s*([^,\n\.]+)/i);
    if (mPartners) {
      partner1 = mPartners[1].trim();
      partner2 = mPartners[2].trim();
    }

    let firmName = extractedData['firm_name'] || '';
    const mFirm = situation.match(/firm\s*([^,\n\.]+)/i);
    if (mFirm) firmName = mFirm[1].trim();
    if (!firmName) firmName = 'M/s [● Firm Name]';

    let capital = 'Rs. 10,00,000/- each';
    const mCap = situation.match(/(?:capital|Initial capital)\s*(?:Rs\.?|INR)?\s*([0-9,]+)/i);
    if (mCap) capital = 'Rs. ' + mCap[1].trim();

    let profitSharing = '50:50 equal ratio';
    const mProf = situation.match(/(?:profit & loss|profit and loss)[^\n\.]+/i);
    if (mProf) profitSharing = mProf[0].trim();

    return `PARTNERSHIP DEED

THIS DEED OF PARTNERSHIP is made and executed on this ${dateOfSigning} at ${cleanSeat}, India,

BY AND BETWEEN:

${partner1}, residing at ${partyAResidence} (hereinafter referred to as the "FIRST PARTNER") of the FIRST PART;

AND

${partner2}, residing at ${partyBResidence} (hereinafter referred to as the "SECOND PARTNER") of the SECOND PART;
(The First Partner and Second Partner are hereinafter collectively referred to as the "PARTNERS").

WHEREAS the Partners have mutually agreed to carry on business in partnership under the provisions of the Indian Partnership Act, 1932, upon the terms and conditions recorded herein.

NOW THIS DEED WITNESSETH AS FOLLOWS:

1. FIRM NAME AND STYLE:
The partnership business shall be carried on under the firm name and style of: "${firmName}".

2. PRINCIPAL PLACE OF BUSINESS:
The principal office and place of business of the firm shall be situated at: ${cleanSeat}, India, or at such other place(s) as the Partners may mutually agree in writing.

3. COMMENCEMENT & DURATION:
The partnership shall commence from [● Commencement Date] and shall be a partnership "AT WILL", determinable by either partner giving 3 (three) months' prior written notice to the other.

4. CAPITAL CONTRIBUTIONS:
The initial capital of the partnership firm shall be ${capital}, contributed equally by both Partners and credited to their respective capital accounts.

5. PROFIT AND LOSS SHARING RATIO:
The net profits and losses of the partnership business (including statutory depreciation, operational expenses, and taxes) shall be shared between the Partners in the ratio of: ${profitSharing}.

6. BANK ACCOUNTS OPERATION:
The banking accounts of the firm shall be opened in the name of the Firm and operated jointly by both Partners.

7. DUTIES OF WORKING PARTNERS:
Each partner shall diligently devote their time and attention to the business of the firm and maintain full transparency in all firm transactions.

8. RETIREMENT & DISSOLUTION:
Upon the retirement or demise of any Partner, the firm shall not stand dissolved, and the remaining Partner along with the legal heirs of the deceased partner may reconstitute the firm upon mutually agreed terms.

9. DISPUTE RESOLUTION:
Any dispute or controversy arising between the Partners relating to the interpretation of this deed or the affairs of the firm shall be settled amicably, failing which it shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, with the arbitral seat at ${cleanSeat}.

IN WITNESS WHEREOF the Partners have signed and executed this Partnership Deed on the day, month, and year first written above.

_____________________________               _____________________________
FIRST PARTNER (${partner1})                  SECOND PARTNER (${partner2})

WITNESSES:
1. Signature: _______________________ Name: [● Witness 1 Name & Address]
2. Signature: _______________________ Name: [● Witness 2 Name & Address]`;
  }

  // 14. STATUTORY DEED OF PUBLIC CHARITABLE TRUST (Indian Trusts Act, 1882)
  if (isTrust) {
    let settlor = extractedData['settlor'] || '';
    if (!settlor) {
      const m = situation.match(/Settlor\s*:\s*([^,\n]+)/i);
      if (m) settlor = m[1].trim();
    }
    if (!settlor) settlor = partyA !== '[● Name of First Party]' ? partyA : '[● Full Legal Name of Settlor]';

    let trustName = 'Public Charitable Trust';
    const mTrust = situation.match(/(?:establishing|trust named|called)\s*([^,\n\.]+)/i);
    if (mTrust) trustName = mTrust[1].trim();

    let corpus = 'Rs. 5,00,000/-';
    const mCorpus = situation.match(/(?:corpus of|corpus)\s*(?:Rs\.?|INR)?\s*([0-9,]+)/i);
    if (mCorpus) corpus = 'Rs. ' + mCorpus[1].trim();

    let objects = 'Providing free medical care, education, and relief to underprivileged citizens';
    const mObj = situation.match(/Objects\s*:\s*([^,\n\.]+)/i);
    if (mObj) objects = mObj[1].trim();

    return `DEED OF TRUST

THIS DEED OF PUBLIC CHARITABLE TRUST is made and executed on this ${dateOfSigning} at ${cleanSeat}, India,

BY:

${settlor}, residing at ${partyAResidence} (hereinafter referred to as the "SETTLOR", which expression shall include legal heirs, executors, and administrators) of the ONE PART;

IN FAVOR OF:

The Board of Trustees comprising:
1. ${settlor} (Managing Trustee)
2. [● Name of Trustee 2]
3. [● Name of Trustee 3]
(Hereinafter collectively referred to as the "TRUSTEES").

WHEREAS the Settlor is desirous of establishing a public charitable, non-profit Trust for the benefit of the community at large, and has set apart an initial corpus of ${corpus} towards the foundation of the Trust.

NOW THIS DEED OF TRUST WITNESSETH AS FOLLOWS:

1. CREATION AND DEDICATION OF TRUST:
The Settlor doth hereby irrevocably grant, transfer, and deliver unto the Trustees the initial trust corpus of ${corpus}, to hold the same together with all future donations, endowments, and assets upon trust for the purposes set forth herein.

2. NAME AND REGISTERED OFFICE:
The Trust shall be known and styled as: "${trustName}". Its registered office shall be situated at: ${cleanSeat}, India.

3. OBJECTS OF THE TRUST:
The objects of the trust for which this Trust is established are strictly public charitable purposes, including:
(a) ${objects};
(b) Establishment and maintenance of educational and healthcare institutions; and
(c) Providing relief to the poor, distressed, and underprivileged irrespective of caste, creed, or religion.

4. POWERS AND DUTIES OF TRUSTEES:
The Trustees shall have full power to manage the trust properties, accept donations, invest funds in statutory securities under Section 11(5) of the Income Tax Act, 1961, and incur expenses necessary to fulfill the objects of the trust.

5. IRREVOCABILITY AND DISSOLUTION:
The Trust is strictly IRREVOCABLE. In the event of dissolution, the remaining corpus and assets shall not be distributed among the Trustees, but shall be transferred to another registered charitable trust having similar objects.

IN WITNESS WHEREOF the Settlor and the Trustees have signed and executed this Deed of Trust on the day, month, and year first written above.

_____________________________               _____________________________
SETTLOR (${settlor})                         TRUSTEES (Board of Trustees)

WITNESSES:
1. Signature: _______________________ Name: [● Witness 1 Name & Address]
2. Signature: _______________________ Name: [● Witness 2 Name & Address]`;
  }

  // Universal Indian Legal Deed / Agreement
  return `${templateTitle.toUpperCase()}

THIS INDENTURE / AGREEMENT is made and entered into on this ${dateOfSigning} at ${placeOfSigning}, India;

BY AND BETWEEN:
1. ${partyA}, residing at / having registered office at ${partyAResidence} (hereinafter referred to as the "FIRST PARTY", which term shall unless repugnant to the context include its successors, legal heirs, and permitted assigns) of the ONE PART;
AND
2. ${partyB}, residing at / having registered office at ${partyBResidence} (hereinafter referred to as the "SECOND PARTY", which term shall unless repugnant to the context include its successors, legal heirs, and permitted assigns) of the OTHER PART.

WHEREAS:
A. The First Party and the Second Party have agreed to enter into this formal instrument to record, define, and regulate their mutual rights and commercial obligations concerning ${disputeSubject};
B. The total financial and contractual consideration agreed upon for the covenants herein is Rs. ${amount};
C. Both parties have verified their respective legal standing, corporate authorizations, and authority to enter into this legally binding arrangement.

NOW, THEREFORE, THIS DEED WITNESSETH AND IT IS HEREBY MUTUALLY AGREED BY AND BETWEEN THE PARTIES AS FOLLOWS:

1. SCOPE AND DEFINITION OF ENGAGEMENT:
The First Party and the Second Party covenant to discharge their mutual obligations regarding ${disputeSubject} in strict compliance with the terms and covenants herein.

2. FINANCIAL COVENANTS AND CONSIDERATION:
In consideration of the mutual covenants and undertakings, the agreed financial sum of Rs. ${amount} shall be paid and discharged through regular banking channels strictly as per [● Milestone / Schedule of Payment].

3. STATUTORY COMPLIANCE AND INDEMNITY:
Each party covenants to comply with all relevant Indian statutory laws, rules, and municipal permissions, and shall keep the other party indemnified against any regulatory penalty, fine, or third-party claim arising from its default.

4. TERM AND TERMINATION:
This Agreement shall remain in force for an initial term of [● Term / Duration, e.g. 12 Months] from the date of execution, unless terminated earlier by either party giving [● 30 days] prior written notice upon uncured breach.

5. DISPUTE RESOLUTION AND ARBITRATION:
All disputes, controversies, or claims arising out of or relating to this Agreement, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be ${seat}, and the proceedings shall be conducted in English.

6. JURISDICTION:
Subject to the arbitration clause, the competent civil courts situated at ${seat} shall have exclusive territorial jurisdiction.

IN WITNESS WHEREOF, the parties hereto have signed, sealed, and executed this Agreement on the day, month, and year first written above.

_____________________________               _____________________________
FIRST PARTY (${partyA})                      SECOND PARTY (${partyB})

WITNESSES:
1. Name: [● Witness 1 Full Name]
   Address: [● Witness 1 Address]
   Signature: _______________________

2. Name: [● Witness 2 Full Name]
   Address: [● Witness 2 Address]
   Signature: _______________________`;
}

function formatLegalDraftToHtml(rawText: string): string {
  if (!rawText) return '';

  let normalized = rawText
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .trim();

  // Strip markdown code block fences if LLM wrapped draft in ``` or ```html or ```markdown
  if (normalized.startsWith('```')) {
    normalized = normalized.replace(/^```[a-z]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  // If already rich structured HTML with h2/table/hanging indent, return as is
  if (
    normalized.includes('<h2') &&
    (normalized.includes('ql-align-center') || normalized.includes('text-align: center')) &&
    (normalized.includes('ql-align-right') || normalized.includes('text-align: right') || normalized.includes('<table'))
  ) {
    return normalized;
  }

  // Split into logical blocks by 2 or more newlines
  const rawBlocks = normalized.split(/\n\s*\n+/);
  const htmlBlocks: string[] = [];

  const isCourtOrAuthority = (line: string) =>
    /^(BEFORE THE|IN THE COURT OF|IN THE HIGH COURT OF|IN THE SUPREME COURT OF|BEFORE THE DISTRICT MAGISTRATE|BEFORE NOTARY PUBLIC|AT [A-Z\s]+|IN THE MATTER OF:|MEMORANDUM OF PARTIES|CAUSE TITLE)/i.test(line.trim());

  const isSectionHeading = (line: string) =>
    /^(VERIFICATION|ATTESTATION|PRAYER|RELIEF SOUGHT|GROUNDS|QUESTIONS OF LAW|INDEX|LIST OF DATES|SCHEDULE OF PROPERTY|SCHEDULE|ANNEXURE|IN WITNESS WHEREOF|WITNESSES|NOW THIS DEED WITNESSETH|NOW THEREFORE|TERMS AND CONDITIONS)/i.test(line.trim());

  const isSignatureLine = (line: string) => {
    const trimmed = line.trim();
    if (/^\d+\./.test(trimmed) || /^That\s/i.test(trimmed) || isCourtOrAuthority(trimmed) || isSectionHeading(trimmed)) return false;
    return /^(DEPONENT|TESTATOR|EXECUTANT|APPLICANT|PETITIONER|NOTARY PUBLIC|OATH COMMISSIONER|ADVOCATE|SIGNATORY)(\s*\(.*?\))?$/i.test(trimmed) ||
      /^_{3,}\s*(DEPONENT|TESTATOR|EXECUTANT|APPLICANT|PETITIONER|NOTARY PUBLIC|ADVOCATE)/i.test(trimmed);
  };

  const isBilateralSignature = (text: string) => {
    const hasPartyA = /(FIRST PARTY|PARTY A|PARTY OF (THE )?FIRST PART|LESSOR|SELLER|EMPLOYER|LICENSOR|ASSIGNOR|TRANSFEROR|MORTGAGOR|BORROWER)/i.test(text);
    const hasPartyB = /(SECOND PARTY|PARTY B|PARTY OF (THE )?SECOND PART|LESSEE|PURCHASER|BUYER|EMPLOYEE|LICENSEE|ASSIGNEE|TRANSFEREE|MORTGAGEE|LENDER)/i.test(text);
    return hasPartyA && hasPartyB;
  };

  let isFirstBlock = true;

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i].trim();
    if (!block) continue;

    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

    // 1. Bilateral Signature Block (Two parties side-by-side in borderless table)
    if (isBilateralSignature(block) && (lines.some((l) => /FIRST PARTY|LESSOR|SELLER|PARTY OF FIRST PART/i.test(l)) || lines.length <= 4)) {
      let partyA = 'FIRST PARTY';
      let partyB = 'SECOND PARTY';

      const matchA = block.match(/(?:FIRST PARTY|LESSOR|SELLER|PARTY OF THE FIRST PART)[^(\n]*(\([^)]+\))?/i);
      const matchB = block.match(/(?:SECOND PARTY|LESSEE|PURCHASER|PARTY OF THE SECOND PART)[^(\n]*(\([^)]+\))?/i);

      if (matchA) partyA = matchA[0].replace(/_{3,}/g, '').trim();
      if (matchB) partyB = matchB[0].replace(/_{3,}/g, '').trim();

      htmlBlocks.push(`
<table style="width: 100%; border: none; margin-top: 24pt; margin-bottom: 24pt; border-collapse: collapse;">
  <tbody>
    <tr>
      <td style="width: 50%; text-align: center; border: none; padding: 12pt 8pt; vertical-align: top;">
        <p style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #0F172A;">_____________________________</p>
        <p style="margin: 4pt 0 0 0; font-weight: bold; font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #0F172A; text-transform: uppercase;">${partyA || 'FIRST PARTY'}</p>
      </td>
      <td style="width: 50%; text-align: center; border: none; padding: 12pt 8pt; vertical-align: top;">
        <p style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #0F172A;">_____________________________</p>
        <p style="margin: 4pt 0 0 0; font-weight: bold; font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #0F172A; text-transform: uppercase;">${partyB || 'SECOND PARTY'}</p>
      </td>
    </tr>
  </tbody>
</table>`.trim());
      continue;
    }

    // 2. Single Right-Aligned Signature (DEPONENT, TESTATOR, NOTARY PUBLIC, etc.)
    if (isSignatureLine(block) || (lines.length <= 3 && lines.some((l) => isSignatureLine(l)))) {
      const sigTitle = lines.find((l) => isSignatureLine(l)) || lines[lines.length - 1];
      const cleanTitle = sigTitle.replace(/_{3,}/g, '').trim();
      const underLineP = `<p style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #0F172A;">_____________________________</p>`;

      htmlBlocks.push(`
<div class="ql-align-right" style="text-align: right; margin-top: 20pt; margin-bottom: 24pt; width: 100%; display: flex; justify-content: flex-end;">
  <div style="display: inline-block; text-align: center; min-width: 200pt; max-width: 280pt;">
    ${underLineP}
    <p style="margin: 4pt 0 0 0; font-weight: bold; font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #0F172A; text-transform: uppercase;">${cleanTitle}</p>
  </div>
</div>`.trim());
      continue;
    }

    // 3. Document Main Title (First major heading)
    if (isFirstBlock || /^(AFFIDAVIT|AGREEMENT|DEED|INDENTURE|PETITION|MEMORANDUM|SPECIAL POWER OF ATTORNEY|GENERAL POWER OF ATTORNEY|LAST WILL AND TESTAMENT)/i.test(block)) {
      if (lines.length === 1 && lines[0].length < 120) {
        htmlBlocks.push(
          `<h2 class="ql-align-center" style="text-align: center; font-size: 14pt; font-weight: bold; margin-top: 10pt; margin-bottom: 12pt; font-family: 'Times New Roman', Georgia, serif; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.4; color: #0F172A;">${lines[0]}</h2>`
        );
        isFirstBlock = false;
        continue;
      }
    }
    isFirstBlock = false;

    // 4. Section Headings (VERIFICATION, ATTESTATION, PRAYER, etc.)
    if (lines.length === 1 && isSectionHeading(lines[0])) {
      htmlBlocks.push(
        `<p class="ql-align-center" style="text-align: center; font-size: 13pt; font-weight: bold; margin-top: 20pt; margin-bottom: 10pt; font-family: 'Times New Roman', Georgia, serif; text-transform: uppercase; text-decoration: underline; letter-spacing: 0.5px; color: #0F172A;">${lines[0]}</p>`
      );
      continue;
    }

    // 5. Court / Authority Header lines
    if (lines.every((l) => isCourtOrAuthority(l) || l.length < 60) && lines.some((l) => isCourtOrAuthority(l))) {
      const content = lines.join('<br/>');
      htmlBlocks.push(
        `<p class="ql-align-center" style="text-align: center; font-size: 12pt; font-weight: bold; margin-top: 6pt; margin-bottom: 10pt; font-family: 'Times New Roman', Georgia, serif; text-transform: uppercase; line-height: 1.5; color: #0F172A;">${content}</p>`
      );
      continue;
    }

    // 6. Numbered Paragraphs (Legal Hanging Indent: 28pt padding-left, -28pt text-indent)
    const isNumbered = /^\s*(\d+\.|\([0-9a-zA-Z]+\)|[a-z]\))\s+/.test(block);
    if (isNumbered) {
      const formattedText = block.replace(/\n+/g, '<br/>');
      htmlBlocks.push(
        `<p style="text-align: justify; padding-left: 28pt; text-indent: -28pt; font-size: 12.5pt; font-family: 'Times New Roman', Georgia, serif; line-height: 1.6; margin-bottom: 10pt; color: #0F172A;">${formattedText}</p>`
      );
      continue;
    }

    // 7. General Legal Body Paragraph (Preamble, Recitals, Sworn statements)
    const formattedText = block.replace(/\n+/g, '<br/>');
    htmlBlocks.push(
      `<p style="text-align: justify; font-size: 12.5pt; font-family: 'Times New Roman', Georgia, serif; line-height: 1.6; margin-bottom: 12pt; color: #0F172A;">${formattedText}</p>`
    );
  }

  return htmlBlocks.join('\n\n');
}

export default function LegalDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';

  // Navigation / Stepper State
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<LegalDocCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LegalDocTemplate | null>(null);
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [previewTab, setPreviewTab] = useState<'pdf' | 'specimen' | 'overview'>('pdf');

  // Step 3 Details State
  const [situationText, setSituationText] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 4 AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [whatIHave, setWhatIHave] = useState<ExtractedEntityItem[]>([]);
  const [stillNeeded, setStillNeeded] = useState<StillNeededItem[]>([]);
  const [readyToDraft, setReadyToDraft] = useState<boolean>(false);

  // Step 5 Draft Studio State
  const [isWritingDraft, setIsWritingDraft] = useState<boolean>(false);
  const [draftContent, setDraftContent] = useState<string>('');
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'SAVED' | 'SAVING' | 'IDLE'>('IDLE');
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // In-place auto-save implementation
  useEffect(() => {
    if (activeStep !== 5 || !draftContent || !selectedTemplate) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setAutoSaveStatus('SAVING');
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const payload: Partial<LegalDocDraft> = {
          id: savedDocId || undefined,
          title: selectedTemplate.title,
          category: selectedTemplate.category,
          situation: situationText,
          content: draftContent,
          status: 'DRAFT READY',
        };
        const res = await toolsService.saveLegalDocumentDraft(payload);
        if (res?.id && !savedDocId) {
          setSavedDocId(res.id);
        }
        setAutoSaveStatus('SAVED');
      } catch {
        setAutoSaveStatus('SAVED');
      }
    }, 2500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [draftContent, activeStep, savedDocId, selectedTemplate, situationText]);

  // Filter Categories
  const filteredCategories = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter Templates
  const currentTemplates = selectedCategory
    ? TEMPLATES_LIBRARY[selectedCategory.id] || []
    : [];

  const filteredTemplates = currentTemplates.filter((t) =>
    t.title.toLowerCase().includes(templateSearch.toLowerCase())
  );

  // Step 1: Select Category
  const handleSelectCategory = (cat: LegalDocCategory) => {
    setSelectedCategory(cat);
    const tmpls = TEMPLATES_LIBRARY[cat.id] || [];
    if (tmpls.length > 0) {
      setSelectedTemplate(tmpls[0]);
    } else {
      setSelectedTemplate(null);
    }
    setActiveStep(2);
  };

  // Step 2: Use Template
  const handleUseTemplate = () => {
    if (!selectedTemplate) return;
    setActiveStep(3);
  };

  // Step 3: File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((f) => {
        if (f.size > 10 * 1024 * 1024) {
          alert(`"${f.name}" exceeds the 10 MB per-file limit.`);
          return false;
        }
        return true;
      });
      setUploadedFiles((prev) => {
        const combined = [...prev, ...validFiles];
        if (combined.length > 10) {
          alert('Maximum 10 supporting documents allowed per draft.');
        }
        return combined.slice(0, 10);
      });
    }
  };

  // Step 3 -> Step 4: Continue to AI Chat
  const handleContinueToChat = async () => {
    if (!situationText.trim() && uploadedFiles.length === 0) return;

    setActiveStep(4);
    setIsAiTyping(true);

    // Initial assistant prompt
    const initialAiMsg = `Reading the template "${selectedTemplate?.title}" and your documents… Analyzing the legal relationships and operative covenants.`;
    setChatMessages([{ sender: 'ai', text: initialAiMsg }]);

    try {
      const res = await toolsService.analyzeLegalDocumentChat({
        template: selectedTemplate?.title || 'Legal Document',
        category: selectedCategory?.name || 'Agreement',
        situation: situationText,
        messages: [{ sender: 'user', content: situationText }],
      });

      setTimeout(() => {
        setIsAiTyping(false);
        setWhatIHave(res.whatIHave || []);
        setStillNeeded(res.stillNeeded || []);
        setChatMessages((prev) => [
          ...prev,
          { sender: 'ai', text: res.assistantMessage || 'I have extracted the core details. A few particulars are still needed.' },
        ]);
      }, 1400);
    } catch {
      setIsAiTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Thank you, I have recorded your situation. You can fill in the remaining details or draft now — missing details will appear as blanks like [● label].`,
        },
      ]);
    }
  };

  // Step 4: Send user message in Chat
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      const updatedSituation = situationText + '\n' + userText;
      setSituationText(updatedSituation);

      const res = await toolsService.analyzeLegalDocumentChat({
        template: selectedTemplate?.title || 'Legal Document',
        category: selectedCategory?.name || 'Agreement',
        situation: updatedSituation,
        messages: [...chatMessages, { sender: 'user', content: userText }],
      });

      setIsAiTyping(false);
      if (res.whatIHave && res.whatIHave.length > 0) {
        setWhatIHave(res.whatIHave);
      }
      if (res.stillNeeded) {
        setStillNeeded(res.stillNeeded);
      }
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.assistantMessage || 'Recorded. Your details have been updated in the Inspector.' },
      ]);
    } catch {
      setIsAiTyping(false);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Noted. Your details have been incorporated into the draft template.' },
      ]);
    }
  };

  // Step 4: Handle "Fill in" badge click
  const handleFillIn = (item: StillNeededItem) => {
    setChatInput(`Regarding "${item.label}": `);
  };

  // Step 4: Remove extracted entity
  const handleRemoveEntity = (key: string) => {
    setWhatIHave((prev) => prev.filter((item) => item.key !== key));
  };

  // Step 4: Transition to Step 5 Confirmation
  const handleProceedToDraftStep = () => {
    setActiveStep(5);
    setReadyToDraft(true);
  };

  // Step 5: Write the draft trigger
  const handleWriteDraft = async () => {
    setIsWritingDraft(true);

    const extractedMap: Record<string, string> = {};
    whatIHave.forEach((item) => {
      extractedMap[item.key] = item.value;
      extractedMap[item.label] = item.value;
    });

    let draftText = '';
    try {
      const res = await toolsService.generateLegalDocumentDraft({
        template: selectedTemplate?.title || 'LEGAL AGREEMENT',
        templateId: selectedTemplate?.id,
        category: selectedCategory?.name || 'Agreement',
        situation: situationText,
        extractedData: extractedMap,
      });
      if (res?.content && res.content.trim()) {
        draftText = res.content;
      }
    } catch {
      // Backend unavailable, fallback to client-side legal engine
    }

    if (!draftText) {
      draftText = generateClientSideLegalDraft(
        selectedTemplate?.title || 'LEGAL AGREEMENT',
        selectedCategory?.name || 'Agreement',
        situationText,
        extractedMap
      );
    }

    const formattedDraftHtml = formatLegalDraftToHtml(draftText);

    setTimeout(() => {
      setDraftContent(formattedDraftHtml);
      setIsWritingDraft(false);
      setReadyToDraft(false);
    }, 1200);
  };

  // Export handlers
  const handleDownloadWord = async () => {
    const filename = (selectedTemplate?.title || 'Legal-Document').replace(/\s+/g, '_');
    await downloadDocxFile(draftContent, filename, selectedTemplate?.title);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftContent);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Top Header Bar */}
      <div className="border-b border-[#E2E8F0] bg-white sticky top-0 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/tools`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0B2242] transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>All legal documents</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B2242]">
              LEGAL DOCUMENTS · AI
            </span>
          </div>


        </div>
      </div>

      {/* Hero Headline */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-merriweather text-[#0B2242]">
          {selectedTemplate && activeStep > 2 ? selectedTemplate.title : 'Draft from a proven template.'}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] max-w-3xl">
          {selectedTemplate && activeStep > 2
            ? `${selectedTemplate.category} · Follows the template structure and wording with your details in place.`
            : 'Pick the kind of document, choose a template, tell us the facts — the draft follows the template’s structure and wording with your details in place. 2,176 templates across 58 categories.'}
        </p>

        {/* 5-Step Stepper Header */}
        <div className="mt-6 flex flex-wrap items-center gap-1 rounded-xl border border-[#CBD5E1] bg-white p-1.5 shadow-xs">
          {[
            { num: 1, label: 'Document Type' },
            { num: 2, label: 'Template' },
            { num: 3, label: 'Details' },
            { num: 4, label: 'AI Chat' },
            { num: 5, label: 'Draft' },
          ].map((st) => {
            const isActive = activeStep === st.num;
            const isCompleted = activeStep > st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (isCompleted || isActive) setActiveStep(st.num);
                }}
                className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${isActive
                    ? 'bg-[#0B2242] text-white shadow-xs'
                    : isCompleted
                      ? 'text-[#0B2242] hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
              >
                <span
                  className={`size-5 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${isActive
                      ? 'bg-white text-[#0B2242]'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                >
                  {isCompleted ? <Check className="size-3" /> : st.num}
                </span>
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        {/* STEP 1: DOCUMENT TYPE (58 CATEGORIES) */}
        {activeStep === 1 && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#0B2242]">Filter categories, or search all templates</h2>
                <p className="text-xs text-[#64748B]">Select the legal branch or category of deed you wish to execute</p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search all templates or categories..."
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white pl-9 pr-3.5 py-2 text-xs text-[#0B2242] focus:border-[#0B2242] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="group flex flex-col justify-between text-left rounded-xl border border-[#CBD5E1] bg-white p-4.5 shadow-xs transition-all hover:border-[#0B2242] hover:shadow-md cursor-pointer"
                >
                  <div>
                    <h3 className="font-bold text-sm text-[#0B2242] group-hover:text-[#1D4ED8] transition-colors leading-snug">
                      {cat.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#64748B]">
                      <span className="font-semibold text-[#0B2242]">{cat.templateCount} templates</span>
                      {cat.subcategoriesCount && (
                        <>
                          <span>·</span>
                          <span>{cat.subcategoriesCount} subcategories</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-[#0B2242] group-hover:translate-x-1 transition-transform">
                    <span>Explore templates</span>
                    <ChevronRight className="size-3.5 text-gray-400 group-hover:text-[#0B2242]" />
                  </div>
                </button>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#CBD5E1] p-8">
                <Search className="mx-auto size-8 text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-[#0B2242]">No matching legal categories found</p>
                <p className="text-xs text-gray-500 mt-1">Try searching for other terms like &ldquo;Agreement&rdquo;, &ldquo;Arbitration&rdquo;, &ldquo;Notice&rdquo;, or &ldquo;Pleadings&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="mt-3 px-3.5 py-1.5 text-xs font-bold text-[#0B2242] bg-[#EAEFF9] rounded-lg hover:bg-[#dbe4f6] transition-colors cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: TEMPLATE SELECTION */}
        {activeStep === 2 && selectedCategory && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Templates List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#0B2242] text-white px-3 py-0.5 text-xs font-bold">
                    {selectedCategory.name}
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">{filteredTemplates.length} templates available</span>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-2 size-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search templates in category..."
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white pl-8 pr-3 py-1.5 text-xs text-[#0B2242] focus:border-[#0B2242] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#CBD5E1] bg-white divide-y divide-[#F1F5F9] shadow-xs max-h-[580px] overflow-y-auto">
                {filteredTemplates.map((tmpl) => {
                  const isSelected = selectedTemplate?.id === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`w-full flex items-start gap-3 p-4 text-left transition-colors cursor-pointer ${isSelected ? 'bg-[#EAEFF9] border-l-4 border-l-[#0B2242]' : 'hover:bg-gray-50'
                        }`}
                    >
                      <FileText className={`size-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#0B2242]' : 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#0B2242]">{tmpl.title}</h4>
                        <p className="mt-0.5 text-xs text-[#64748B] line-clamp-1">{tmpl.description}</p>
                      </div>
                      <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0B2242]">
                        {tmpl.pageCount} {tmpl.pageCount === 1 ? 'page' : 'pages'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Preview Aside (5 cols) */}
            <div className="lg:col-span-5">
              {selectedTemplate ? (
                <div className="sticky top-20 rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm space-y-4">
                  {/* Top Mode Selector Tabs */}
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                    <div className="flex items-center gap-1.5 p-0.5 bg-gray-100 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('pdf')}
                        className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                          previewTab === 'pdf' ? 'bg-white text-[#0B2242] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <FileText className="size-3.5 text-[#C9A227]" />
                        <span>Authentic PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('specimen')}
                        className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                          previewTab === 'specimen' ? 'bg-white text-[#0B2242] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <FileCheck2 className="size-3.5 text-[#0B2242]" />
                        <span>Clauses</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('overview')}
                        className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                          previewTab === 'overview' ? 'bg-white text-[#0B2242] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <span>Overview</span>
                      </button>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {selectedTemplate.pageCount} {selectedTemplate.pageCount === 1 ? 'Page' : 'Pages'}
                    </span>
                  </div>

                  {/* TAB 1: Live S3 PDF Stream */}
                  {previewTab === 'pdf' && (
                    <div className="relative rounded-lg border border-gray-300 bg-slate-900 shadow-md h-[460px] overflow-hidden">
                      <iframe
                        src={`${toolsService.getTemplatePdfUrl(selectedTemplate.id)}#toolbar=0&navpanes=0`}
                        className="w-full h-full border-0 bg-white"
                        title={selectedTemplate.title}
                      />
                    </div>
                  )}

                  {/* TAB 2: Structured Indian Legal Specimen */}
                  {previewTab === 'specimen' && (() => {
                    const specimen = getDocumentSpecimen(selectedTemplate);
                    return (
                      <div className="relative rounded-lg border border-gray-300 bg-white p-5 sm:p-6 shadow-md font-serif text-[11px] text-[#1E293B] leading-relaxed max-h-[460px] overflow-y-auto select-none border-t-4 border-t-[#0B2242]">
                        {/* Document Header */}
                        <div className="text-center pb-3 border-b border-gray-200 mb-3.5">
                          <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-gray-400">
                            {specimen.categoryBadge}
                          </p>
                          <h3 className="mt-1 text-xs sm:text-sm font-bold uppercase tracking-wide text-[#0B2242] leading-snug">
                            {specimen.title}
                          </h3>
                        </div>

                        {/* Opening Recital */}
                        <p className="text-justify mb-3 italic text-gray-600">
                          {specimen.preamble}
                        </p>

                        {/* Parties Block */}
                        <div className="mb-3 space-y-1.5 text-justify bg-gray-50/80 p-2.5 rounded border border-gray-200/60 font-sans text-[10.5px]">
                          <p className="font-bold text-[#0B2242] uppercase text-[9.5px] tracking-wider">BY AND BETWEEN:</p>
                          {specimen.parties.map((pt, pIdx) => (
                            <React.Fragment key={pIdx}>
                              {pIdx > 0 && <p className="text-center font-bold text-[9px] uppercase text-gray-400">AND</p>}
                              <p>
                                <strong className="text-[#0B2242]">{pt.text}</strong>
                              </p>
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Recitals */}
                        <div className="mb-3 space-y-1.5 text-justify text-[11px]">
                          {specimen.recitals.map((rec, rIdx) => (
                            <p key={rIdx}>{rec}</p>
                          ))}
                        </div>

                        {/* Operative Clauses */}
                        <div className="mb-3.5 space-y-2 text-justify text-[10.5px]">
                          <p className="font-bold font-sans text-[#0B2242] uppercase text-[10px]">NOW THEREFORE, IT IS MUTUALLY COVENANTED AS FOLLOWS:</p>
                          {specimen.clauses.map((cl, cIdx) => (
                            <p key={cIdx}>
                              <span className="font-bold">{cl.number}. {cl.title}:</span> {cl.body}
                            </p>
                          ))}
                        </div>

                        {/* Signature Block */}
                        <div className="pt-2.5 border-t border-gray-200 text-[10px] space-y-2">
                          <p className="italic text-gray-500">IN WITNESS WHEREOF, the parties hereto have signed and delivered this deed.</p>
                          <div className="flex justify-between pt-1">
                            {specimen.signatures.map((sig, sIdx) => (
                              <div key={sIdx} className="text-center">
                                <div className="w-24 border-b border-gray-400 mb-1" />
                                <span className="font-sans font-semibold text-[9px] text-gray-500">{sig.role}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Witnesses Block */}
                        <div className="pt-2 border-t border-gray-100 text-[9.5px] text-gray-500 font-sans space-y-0.5">
                          <p className="font-bold uppercase text-[9px] text-gray-400">WITNESSES:</p>
                          {specimen.witnesses.map((w, wIdx) => (
                            <p key={wIdx} className="italic">{w}</p>
                          ))}
                        </div>

                        {/* Footer Badge */}
                        <div className="mt-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[9px] font-sans font-bold uppercase tracking-widest text-amber-800">
                            Specimen Form · Fillable Blanks highlighted as [● label]
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* TAB 2: Overview & Scope */}
                  {previewTab === 'overview' && (
                    <div className="space-y-4">
                      <div className="border-b border-[#F1F5F9] pb-3">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                          {selectedTemplate.category}
                        </span>
                        <h3 className="mt-1 text-base font-bold font-merriweather text-[#0B2242]">
                          {selectedTemplate.title}
                        </h3>
                        <div className="mt-2 inline-flex items-center gap-2 rounded bg-gray-100 px-2.5 py-1 text-xs font-medium text-[#0B2242]">
                          <Clock className="size-3 text-gray-500" />
                          <span>Standard length: {selectedTemplate.pageCount} pages</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-mono">
                          Template Overview
                        </h4>
                        <p className="mt-2 text-xs text-[#334155] leading-relaxed">
                          {selectedTemplate.description}
                        </p>
                      </div>

                      <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs text-[#475569] space-y-1.5">
                        <h5 className="font-bold text-[#0B2242] uppercase font-mono text-[10px]">Included Clauses &amp; Features</h5>
                        <ul className="space-y-1 list-disc list-inside text-[11px]">
                          <li>Formal Indian execution preamble &amp; party recitals</li>
                          <li>Operative commercial and procedural covenants</li>
                          <li>Indian Arbitration &amp; Conciliation Act 1996 dispute clause</li>
                          <li>Liquidated damages, indemnity &amp; termination cure terms</li>
                          <li>Two-witness attestations &amp; verification deeds</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleUseTemplate}
                      className="flex-1 rounded-lg bg-[#0B2242] px-4 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#15345E] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Use this template</span>
                      <ArrowRight className="size-4" />
                    </button>
                    <a
                      href={toolsService.getTemplatePdfUrl(selectedTemplate.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[#CBD5E1] bg-gray-50 px-3.5 py-3 text-xs font-bold text-[#0B2242] hover:bg-white hover:border-[#0B2242] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Stream authentic legal PDF directly from S3 Legal Template Pipeline"
                    >
                      <Download className="size-3.5 text-[#C9A227]" />
                      <span className="hidden sm:inline">Official PDF</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
                  <FileText className="mx-auto size-8 text-gray-300" />
                  <p className="mt-2 text-xs text-gray-500">Select a template to preview its legal scope and structure</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: DETAILS */}
        {activeStep === 3 && selectedTemplate && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold font-merriweather text-[#0B2242]">Describe the situation</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#64748B]">
                  Who are the parties, what is being done, and any amounts, dates, property or places involved. Write it in your own words — any language is fine.
                </p>
              </div>

              <div>
                <textarea
                  rows={8}
                  value={situationText}
                  onChange={(e) => setSituationText(e.target.value)}
                  maxLength={20000}
                  placeholder="Who the parties are, what is being done or agreed, and any amounts, dates, property or places involved…"
                  className="w-full rounded-xl border border-[#CBD5E1] bg-white p-4 text-xs sm:text-sm text-[#0B2242] focus:border-[#0B2242] focus:outline-hidden leading-relaxed"
                />
                <div className="mt-2 flex justify-end text-xs text-[#64748B] font-mono">
                  <span>{situationText.length} / 20,000</span>
                </div>
              </div>

              {/* Supporting Documents Dropzone */}
              <div>
                <h3 className="text-sm font-bold font-merriweather text-[#0B2242]">Supporting documents (optional)</h3>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  Title deeds, IDs, earlier agreements, notices — anything the document should rely on.
                </p>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  <Upload className="mx-auto size-8 text-gray-400" />
                  <p className="mt-2 text-xs sm:text-sm font-bold text-[#0B2242]">Drop supporting documents here</p>
                  <p className="mt-1 text-[11px] text-[#64748B]">
                    BMP, DOCX, JPEG, JPG, PDF, PNG, TIFF · up to 10 MB each · 10 files per document. Any language — non-English text is read in English for the AI.
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-lg border border-[#CBD5E1] bg-white px-4 py-1.5 text-xs font-semibold text-[#0B2242] hover:bg-gray-50 shadow-xs"
                  >
                    Choose files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".bmp,.docx,.jpeg,.jpg,.pdf,.png,.tiff"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0B2242]"
                      >
                        <span className="font-semibold truncate pr-2">{f.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-gray-400 font-mono text-[10px]">{(f.size / 1024).toFixed(1)} KB</span>
                          <button
                            type="button"
                            onClick={() => setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Continue Action */}
              <div className="border-t border-[#F1F5F9] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-[#64748B]">
                  {!situationText.trim() && uploadedFiles.length === 0
                    ? 'Describe the situation or add a document to continue.'
                    : 'Facts entered. Proceed to AI refinement chat.'}
                </p>

                <button
                  onClick={handleContinueToChat}
                  disabled={!situationText.trim() && uploadedFiles.length === 0}
                  className="rounded-lg bg-[#0B2242] px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#15345E] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  <span>Continue to AI chat</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AI CHAT & INTELLIGENCE INSPECTOR */}
        {activeStep === 4 && selectedTemplate && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: AI Conversational Chat (7 cols) */}
            <div className="lg:col-span-7 flex flex-col rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs h-[640px]">
              <div className="border-b border-[#F1F5F9] pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0B2242] flex items-center gap-1.5">
                    <Sparkles className="size-4 text-[#CAA438]" />
                    <span>AI Legal Assistant</span>
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Answering questions automatically updates the draft particulars</p>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${msg.sender === 'user'
                          ? 'bg-[#0B2242] text-white rounded-br-xs'
                          : 'bg-[#F1F5F9] text-[#1E293B] rounded-bl-xs border border-[#E2E8F0]'
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-[#F1F5F9] px-4 py-2.5 text-xs text-[#64748B] flex items-center gap-2 border border-[#E2E8F0]">
                      <RefreshCw className="size-3.5 animate-spin text-[#0B2242]" />
                      <span>Analyzing template and your facts…</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-[#F1F5F9] pt-3 mt-3">
                <textarea
                  rows={3}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Your answer (Enter to send · Shift+Enter for a new line)..."
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-xs text-[#0B2242] focus:border-[#0B2242] focus:outline-hidden"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">Enter to send · Shift+Enter for a new line</span>
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isAiTyping}
                    className="rounded-lg bg-[#0B2242] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#15345E] transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="size-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Intelligence Inspector (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs h-[640px] overflow-y-auto">
              <div className="space-y-6">
                {/* What I Have */}
                <div>
                  <h4 className="font-merriweather font-bold text-sm text-[#0B2242]">What I have</h4>
                  <p className="mt-0.5 text-[11px] text-[#64748B]">
                    Something wrong? Edit or remove it — the assistant keeps your change.
                  </p>

                  <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                    {whatIHave.length > 0 ? (
                      whatIHave.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-mono text-[10px] uppercase font-bold text-[#64748B] block truncate">
                              {item.label}
                            </span>
                            <span className="font-semibold text-[#0B2242] block truncate">{item.value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEntity(item.key)}
                            className="ml-2 text-gray-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">Nothing yet.</p>
                    )}
                  </div>
                </div>

                {/* Still Needed */}
                <div>
                  <h4 className="font-merriweather font-bold text-sm text-[#0B2242]">Still needed</h4>
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {stillNeeded.length > 0 ? (
                      stillNeeded.map((sn) => (
                        <div
                          key={sn.id}
                          className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 text-xs text-[#0B2242]"
                        >
                          <span className="min-w-0 flex-1 text-[11px] font-medium truncate">
                            {sn.label} {sn.optional && <span className="text-gray-400 text-[10px]">(optional)</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFillIn(sn)}
                            className="ml-2 rounded bg-white border border-amber-300 px-2 py-0.5 font-mono text-[10px] font-bold text-[#0B2242] hover:bg-amber-100 transition-colors shrink-0"
                          >
                            Fill in
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">—</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Notice & Actions */}
              <div className="border-t border-[#F1F5F9] pt-4 mt-4 space-y-3">
                <p className="text-[11px] text-[#64748B] leading-snug">
                  Don’t have every detail? You can draft now — missing details become visible blanks like{' '}
                  <span className="font-mono font-bold text-[#0B2242] bg-gray-100 px-1 py-0.5 rounded">[● label]</span>.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleProceedToDraftStep}
                    className="flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-xs font-bold text-[#0B2242] hover:bg-gray-50 transition-colors text-center"
                  >
                    Draft anyway
                  </button>
                  <button
                    onClick={handleProceedToDraftStep}
                    className="flex-1 rounded-lg bg-[#0B2242] px-3.5 py-2.5 text-xs font-bold text-white hover:bg-[#15345E] transition-colors text-center shadow-xs"
                  >
                    Continue to draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DRAFT CONFIRMATION & STUDIO */}
        {activeStep === 5 && selectedTemplate && (
          <div>
            {readyToDraft ? (
              /* Pre-Draft Confirmation Screen */
              <div className="max-w-2xl mx-auto rounded-xl border border-[#CBD5E1] bg-white p-8 text-center shadow-xs space-y-6">
                <div className="size-12 rounded-full bg-[#EAEFF9] text-[#0B2242] flex items-center justify-center mx-auto">
                  <Sparkles className="size-6 text-[#CAA438]" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold font-merriweather text-[#0B2242]">Ready to write your document</h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#475569] leading-relaxed max-w-lg mx-auto">
                    The draft follows <span className="font-bold text-[#0B2242]">{selectedTemplate.title}</span> — its structure, clause order and wording — with your facts in place. Anything still missing appears as a blank like{' '}
                    <span className="font-mono font-bold text-[#0B2242] bg-gray-100 px-1.5 py-0.5 rounded">[● label]</span> for you to fill in.
                  </p>
                </div>

                <button
                  onClick={handleWriteDraft}
                  disabled={isWritingDraft}
                  className="rounded-xl bg-[#0B2242] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#15345E] transition-all inline-flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isWritingDraft ? (
                    <>
                      <RefreshCw className="size-4 animate-spin text-[#CAA438]" />
                      <span>Writing your document from the template and your facts…</span>
                    </>
                  ) : (
                    <>
                      <span>Write the draft</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Interactive Studio with Canvas & Toolbar */
              <div className="space-y-4">
                {/* Studio Document Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 shadow-xs">
                  {/* Left: Document Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-[#EAEFF9] text-[#0B2242] flex items-center justify-center shrink-0">
                      <FileText className="size-4 text-[#0B2242]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0B2242] leading-tight">
                        {selectedTemplate?.title || 'Certified Legal Document'}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {selectedCategory?.name || 'Legal Draft'} • A4 Court Format
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Auto-save, Revise, Copy, Word, Print/PDF */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-[#0B2242] flex items-center gap-1 mr-2">
                      {autoSaveStatus === 'SAVING' ? (
                        <>
                          <RefreshCw className="size-3 animate-spin text-[#CAA438]" />
                          <span className="text-gray-500">Saving…</span>
                        </>
                      ) : (
                        <>
                          <CheckCheck className="size-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Saved</span>
                        </>
                      )}
                    </span>

                    <button
                      onClick={() => setActiveStep(4)}
                      className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2242] hover:border-[#0B2242] transition-colors cursor-pointer"
                    >
                      Revise the draft
                    </button>

                    <button
                      onClick={handleCopyDraft}
                      className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2242] hover:border-[#0B2242] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedDraft ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                      <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleDownloadWord}
                      className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2242] hover:border-[#0B2242] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="size-3 text-[#0B2242]" />
                      <span>Word</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="rounded-lg bg-[#0B2242] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#15345E] transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Printer className="size-3 text-[#CAA438]" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>

                {/* Blanks & Quality Indicator Banner */}
                {countRemainingBlanks(draftContent) > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl text-xs text-amber-900 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>{countRemainingBlanks(draftContent)} runtime blanks detected:</strong> Missing client particulars appear as <span className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded text-amber-950">[● label]</span> or <span className="font-mono font-bold underline">_______</span>. You can click directly on the canvas to fill them in before exporting.
                      </span>
                    </div>
                    <span className="self-start sm:self-auto shrink-0 font-mono text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                      Indian Statutory Standard
                    </span>
                  </div>
                )}

                {/* Google Docs Style Paginated Legal Document Canvas */}
                <div id="legal-doc-printable" className="w-full max-w-5xl mx-auto">
                  <style>{`
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      #legal-doc-printable, #legal-doc-printable * {
                        visibility: visible !important;
                      }
                      #legal-doc-printable {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                      }
                    }
                  `}</style>
                  <PaginatedCourtEditor
                    value={draftContent}
                    onChange={(val) => setDraftContent(val)}
                    placeholder="Legal document canvas..."
                    documentTitle={selectedTemplate?.title || 'Certified Legal Document'}
                    initialPageSize="a4"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
