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

// The 58 Categories with exact counts reverse-engineered from WritOnline
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
  { id: 'trust', name: 'Trust', templateCount: 22 },
  { id: 'vakalatnama', name: 'Vakalatnama', templateCount: 12 },
  { id: 'will', name: 'Will', templateCount: 24 },
];

// Curated library of templates mapped to categories
const TEMPLATES_LIBRARY: Record<string, LegalDocTemplate[]> = {
  agreement: [
    { id: 'agr-1', title: 'Agreement 0F Reference to Two Arbitrators', category: 'Agreement', pageCount: 2, description: 'Agreement between two commercial parties referring ongoing contract dispute to two appointed independent arbitrators with provision for an umpire.' },
    { id: 'agr-2', title: 'Agreement Form between Owner and a Builder for Construction', category: 'Agreement', pageCount: 4, description: 'Comprehensive construction contract specifying architectural plans, timeline, payment tranches, architect supervision, and delay penalties.' },
    { id: 'agr-3', title: 'Agreement Form between Owner and a Builder for Construction of the Building', category: 'Agreement', pageCount: 4, description: 'Standard high-density urban residential construction deed with municipal approval conditions and milestone certification.' },
    { id: 'agr-4', title: 'Agreement Admiting the Minor to the Benefit of Partnership', category: 'Agreement', pageCount: 2, description: 'Partnership admission instrument under Section 30 of the Indian Partnership Act, 1932.' },
    { id: 'agr-5', title: 'Agreement Appointing Broker for Sale of a Shop Along with Stock in Trade Remaining Unsold', category: 'Agreement', pageCount: 2, description: 'Commercial brokerage and sole selling agency agreement with commission percentages and inventory schedules.' },
    { id: 'agr-6', title: 'Agreement Introducing a New Partner in the Existing Partnership', category: 'Agreement', pageCount: 2, description: 'Deed of reconstitution and admission of incoming partner with capital contribution and profit/loss redistribution.' },
    { id: 'agr-7', title: 'Agreement Modifying the Partnership Deed', category: 'Agreement', pageCount: 4, description: 'Supplementary partnership deed altering profit-sharing ratio, drawing rights, and administrative powers.' },
    { id: 'agr-8', title: 'Agreement Reducing the Rate of Interest in Mortgage Deed', category: 'Agreement', pageCount: 1, description: 'Memorandum of endorsement modifying mortgage interest covenants.' },
    { id: 'agr-9', title: 'Agreement between Builder and a Broker for Selling', category: 'Agreement', pageCount: 1, description: 'Real estate marketing and mandate agreement for residential housing units.' },
    { id: 'agr-10', title: 'Agreement between Building Owner and an Artist', category: 'Agreement', pageCount: 2, description: 'Commissioning deed for mural, architectural sculpture, or interior artistic installation.' },
    { id: 'agr-11', title: 'Agreement between Cinema Owner and a Company', category: 'Agreement', pageCount: 2, description: 'Theatrical screening and distribution revenue sharing contract.' },
    { id: 'agr-12', title: 'Agreement between Manufacturer and Commission Agent', category: 'Agreement', pageCount: 3, description: 'Goods manufacturing agency with credit terms, consignment storage, and territory reservation.' },
    { id: 'agr-13', title: 'Agreement between Manufacturer and Sole Selling Agents with Canvassing Rights', category: 'Agreement', pageCount: 4, description: 'Exclusive territorial distribution agreement with minimum sales quota and termination safeguards.' },
    { id: 'agr-14', title: 'Agreement between Owners and Labour Contractor for Supply of Labour', category: 'Agreement', pageCount: 2, description: 'Contract labour agreement under Contract Labour (Regulation and Abolition) Act, 1970.' },
    { id: 'agr-15', title: 'Agreement between Publisher and Author for Grant of Copyright on Lump Sum Consideration', category: 'Agreement', pageCount: 2, description: 'Assignment of literary copyright under Section 18 of the Copyright Act, 1957.' },
    { id: 'agr-16', title: 'Agreement between Publisher and Author on Royalty Basis', category: 'Agreement', pageCount: 3, description: 'Publishing agreement with quarterly royalty reporting, audit rights, and reprint options.' },
    { id: 'agr-17', title: 'Master Service and Vendor Agreement', category: 'Agreement', pageCount: 5, description: 'Commercial vendor contract with SLA covenants, confidentiality, IP assignment, and liability limits.' },
  ],
  arbitration: [
    { id: 'arb-1', title: 'Agreement 0F Reference to Two Arbitrators', category: 'Arbitration', pageCount: 2, description: 'Formal reference to two arbitrators with procedure for nomination of presiding arbitrator under Arbitration Act 1996.' },
    { id: 'arb-2', title: 'Agreement for Reference to Sole Arbitrator', category: 'Arbitration', pageCount: 2, description: 'Streamlined agreement appointing a single neutral arbitrator for commercial dispute resolution.' },
    { id: 'arb-3', title: 'Notice Invoking Arbitration under Section 21', category: 'Arbitration', pageCount: 2, description: 'Statutory Section 21 invocation notice setting out claim summary and proposing arbitral tribunal names.' },
    { id: 'arb-4', title: 'Joint Application for Extension of Time under Section 29A', category: 'Arbitration', pageCount: 3, description: 'Court application for extension of arbitral tribunal mandate.' },
  ],
  affidavit: [
    { id: 'aff-1', title: 'General Affidavit in Support of Facts', category: 'Affidavit', pageCount: 1, description: 'Court affidavit with standard verification of truthfulness and deponent verification recital.' },
    { id: 'aff-2', title: 'Affidavit of Evidence by Way of Examination-in-Chief (Order XVIII Rule 4 CPC)', category: 'Affidavit', pageCount: 3, description: 'Formal evidentiary affidavit for civil trial testimony with exhibit numbering.' },
    { id: 'aff-3', title: 'Affidavit for Change of Name in Gazette Notification', category: 'Affidavit', pageCount: 1, description: 'Sworn affidavit for official gazette publication of name change.' },
  ],
  notice: [
    { id: 'not-1', title: 'Legal Notice under Section 138 of Negotiable Instruments Act', category: 'Notice', pageCount: 2, description: 'Statutory 15-day demand notice for dishonoured cheque with cheque particulars and memo dates.' },
    { id: 'not-2', title: 'Legal Notice for Specific Performance of Sale Agreement', category: 'Notice', pageCount: 3, description: 'Demand notice calling upon vendor to execute conveyance deed and receive balance consideration.' },
    { id: 'not-3', title: 'Notice under Section 80 Code of Civil Procedure against Government', category: 'Notice', pageCount: 3, description: 'Mandatory 60-day pre-suit notice to Government/Public Officer under Section 80 CPC.' },
  ],
  power_of_attorney: [
    { id: 'poa-1', title: 'General Power of Attorney (GPA) for Property Management', category: 'Power of Attorney', pageCount: 3, description: 'Comprehensive general power granted to attorney to manage, lease, and represent owner before authorities.' },
    { id: 'poa-2', title: 'Special Power of Attorney (SPA) for Court Litigation & Pleadings', category: 'Power of Attorney', pageCount: 2, description: 'Specific authority to institute legal proceedings, engage counsel, and sign affidavits on principal’s behalf.' },
  ],
};

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
  const partyAResidence = extractedData['party_a_residence'] || extractedData['Party A residence'] || '[● Residential / Registered Office Address of First Party]';
  const partyB = extractedData['party_b'] || extractedData['Party B name'] || '[● Name of Second Party]';
  const partyBResidence = extractedData['party_b_residence'] || extractedData['Party B residence'] || '[● Residential / Registered Office Address of Second Party]';
  const amount = extractedData['amount'] || extractedData['Financial consideration / amount'] || '[● Agreed Consideration Amount in INR]';
  const seat = extractedData['seat'] || extractedData['Seat of arbitration'] || extractedData['Governing jurisdiction'] || '[● Seat of Arbitration / New Delhi]';
  const disputeSubject = extractedData['dispute_subject'] || extractedData['Subject of the dispute'] || situation || '[● Specific subject matter and transaction scope]';
  const dateOfSigning = '[● Day, Month and Year of Signing]';
  const placeOfSigning = '[● Place of Execution / City]';

  const isArbitration = /arbitrat/i.test(templateTitle);
  const isConstruction = /builder|construct|building/i.test(templateTitle);

  if (isArbitration) {
    const arb1 = extractedData['arbitrator_1'] || extractedData['First arbitrator'] || '[● Name of First Arbitrator appointed by First Party]';
    const arb2 = extractedData['arbitrator_2'] || extractedData['Second arbitrator'] || '[● Name of Second Arbitrator appointed by Second Party]';
    return `${templateTitle.toUpperCase()}

THIS AGREEMENT OF ARBITRAL REFERENCE is entered into on this ${dateOfSigning} at ${placeOfSigning}, India;

BY AND BETWEEN:
1. ${partyA}, residing at / having registered office at ${partyAResidence} (hereinafter referred to as the "FIRST PARTY", which expression shall include legal heirs, successors, and assigns) of the FIRST PART;
AND
2. ${partyB}, residing at / having registered office at ${partyBResidence} (hereinafter referred to as the "SECOND PARTY", which expression shall include legal heirs, successors, and assigns) of the SECOND PART.

WHEREAS:
A. The parties hereto entered into commercial relations wherein mutual rights, liabilities, and obligations were stipulated;
B. In the performance thereof, commercial disputes and differences have arisen between the parties concerning ${disputeSubject}, with a claim valuation of Rs. ${amount};
C. In order to avoid protracted court litigation and resolve the controversy expeditiously, the parties have mutually agreed to refer all disputes to arbitration under the Arbitration and Conciliation Act, 1996.

NOW, THEREFORE, THIS INDENTURE WITNESSETH AND IT IS MUTUALLY COVENANTED AS FOLLOWS:

1. REFERENCE TO ARBITRAL TRIBUNAL:
The parties hereby refer all disputes, claims, counterclaims, and differences between them concerning ${disputeSubject} to the joint arbitration and final determination of two independent Arbitrators, viz. ${arb1} nominated by the First Party, and ${arb2} nominated by the Second Party.

2. APPOINTMENT OF PRESIDING ARBITRATOR (UMPIRE):
The two nominated Arbitrators shall, prior to entering upon the reference and taking cognizance of the dispute, nominate and appoint a third independent Arbitrator who shall act as the Presiding Arbitrator (Umpire) in accordance with Section 11 of the Arbitration and Conciliation Act, 1996.

3. ARBITRAL SEAT AND PROCEDURAL LANGUAGE:
The legal seat and territorial venue of the arbitration proceedings shall be ${seat}, and the proceedings, evidence, and orders shall be conducted strictly in the English language.

4. STATEMENT OF CLAIMS AND EVIDENCE:
The Arbitral Tribunal shall provide adequate and reasonable opportunity to both parties to submit their respective Statement of Claim, Statement of Defence, Counterclaims, and documentary evidence in accordance with natural justice.

5. ARBITRAL AWARD AND ENFORCEABILITY:
The arbitral award rendered by the Arbitrators (or the Presiding Arbitrator in case of equality of votes) shall be in writing, reasoned, final, conclusive, and binding on both parties under Section 35 and Section 36 of the Arbitration and Conciliation Act, 1996.

6. COSTS AND REMUNERATION:
Arbitrator remuneration and administrative costs shall initially be borne [● proportion of costs / equally by both parties], subject to final cost assessment and recovery in the Arbitral Award.

IN WITNESS WHEREOF, the First Party and the Second Party have set and subscribed their respective hands to this deed on the date and year first above written.

_____________________________               _____________________________
FIRST PARTY (${partyA})                      SECOND PARTY (${partyB})

WITNESSES:
1. Name: [● Witness 1 Full Name]
   Address: [● Witness 1 Residential Address]
   Signature: _______________________

2. Name: [● Witness 2 Full Name]
   Address: [● Witness 2 Residential Address]
   Signature: _______________________`;
  }

  if (isConstruction) {
    return `${templateTitle.toUpperCase()}

THIS CONSTRUCTION AGREEMENT is executed on this ${dateOfSigning} at ${placeOfSigning}, India;

BY AND BETWEEN:
${partyA}, residing at ${partyAResidence} (hereinafter referred to as the "OWNER", which expression shall include legal representatives, heirs, and permitted assigns) of the FIRST PART;
AND
${partyB}, having registered office at ${partyBResidence} (hereinafter referred to as the "BUILDER / CONTRACTOR", which expression shall include successors and assigns) of the SECOND PART.

WHEREAS:
A. The Owner is the absolute, lawful owner of Plot No. [● Plot Number], admeasuring [● Area in sq. yards / meters], situated at [● Complete Property Address];
B. The Owner is desirous of constructing a residential/commercial structure thereon as per the architectural blueprints and structural designs prepared by the appointed Architect, [● Name of Architect];
C. The Builder has represented that it possesses the requisite infrastructure, technical workforce, and capital to complete the construction within the specified milestones.

NOW IT IS MUTUALLY COVENANTED AND AGREED BETWEEN THE PARTIES AS FOLLOWS:

1. WORK SPECIFICATIONS:
The Builder shall carry out and complete the construction of the building in strict adherence to the sanctioned municipal drawings, architectural plans, and merchantable materials specified in Annexure A.

2. CONSIDERATION AND PAYMENT TRANCHES:
The Owner agrees to pay the Builder a total agreed contract sum of Rs. ${amount} /- (Rupees ${amount} only), payable in progressive installments upon completion of plinth, RCC roof casting, brickwork, finishing, and issuance of Architect Certificate.

3. COMPLETION SCHEDULE:
The Builder undertakes to commence site operations within [● 15 days] of this deed and shall complete the entire construction ready for handover within [● 12 months / Completion Timeline].

4. DELAY AND LIQUIDATED DAMAGES:
In the event of unexcused delay beyond the agreed completion date, the Builder shall be liable to pay liquidated damages calculated at Rs. [● Delay Penalty Amount per week] per week of delay.

5. ARBITRATION AND GOVERNING LAW:
Any dispute arising out of or regarding the interpretation or breach of this agreement shall be settled through arbitration under the Arbitration and Conciliation Act, 1996, with seat at ${seat}.

IN WITNESS WHEREOF, the Owner and the Builder have hereunto set their hands and seals on the day and year first above written.

_____________________________               _____________________________
OWNER (${partyA})                            BUILDER (${partyB})

WITNESSES:
1. Name: [● Witness 1 Full Name]
   Address: [● Witness 1 Address]
   Signature: _______________________

2. Name: [● Witness 2 Full Name]
   Address: [● Witness 2 Address]
   Signature: _______________________`;
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

  const normalized = rawText
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n');

  if (/<\s*(p|div|h[1-6]|span|table|section|article|header|br|b|i|strong|em)\b/i.test(normalized)) {
    return normalized;
  }

  return normalized
    .split(/\n\n+/)
    .map((p) => {
      const trimmed = p.trim();
      const isTitleOrHeading = /^(AGREEMENT|DEED|INDENTURE|IN WITNESS|NOW THEREFORE|WHEREAS|BY AND BETWEEN|MEMORANDUM OF|SCHEDULE|ANNEXURE|WITNESSES)/i.test(trimmed);
      const isCenterAlign = /^(AGREEMENT|DEED|INDENTURE|MEMORANDUM OF|SCHEDULE|ANNEXURE)/i.test(trimmed);
      const alignClass = isCenterAlign ? ' class="ql-align-center"' : '';
      const textAlign = isCenterAlign ? 'center' : 'justify';
      const fontWeight = isTitleOrHeading ? 'font-weight: bold;' : '';

      return `<p${alignClass} style="text-align: ${textAlign}; line-height: 1.6; margin-bottom: 12pt; font-family: 'Times New Roman', Georgia, serif; font-size: 13pt; ${fontWeight}">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
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
  const [previewTab, setPreviewTab] = useState<'pdf' | 'overview'>('pdf');

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
    ? TEMPLATES_LIBRARY[selectedCategory.id] || [
      {
        id: `${selectedCategory.id}-default-1`,
        title: `Standard ${selectedCategory.name} Form`,
        category: selectedCategory.name,
        pageCount: 2,
        description: `Authoritative standard ${selectedCategory.name} template conforming to Indian statutory practice.`,
      },
      {
        id: `${selectedCategory.id}-default-2`,
        title: `Commercial ${selectedCategory.name} Agreement`,
        category: selectedCategory.name,
        pageCount: 3,
        description: `Detailed commercial ${selectedCategory.name} with standard indemnity, breach, and arbitration covenants.`,
      },
    ]
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
      setSelectedTemplate({
        id: `${cat.id}-default-1`,
        title: `Standard ${cat.name} Form`,
        category: cat.name,
        pageCount: 2,
        description: `Authoritative standard ${cat.name} template conforming to Indian statutory practice.`,
      });
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
                        className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                          previewTab === 'pdf' ? 'bg-white text-[#0B2242] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <FileText className="size-3.5 text-[#C9A227]" />
                        <span>Document PDF Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('overview')}
                        className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                          previewTab === 'overview' ? 'bg-white text-[#0B2242] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <span>Overview &amp; Scope</span>
                      </button>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      Page 1 of {selectedTemplate.pageCount}
                    </span>
                  </div>

                  {/* TAB 1: Live A4 PDF Legal Sheet Preview */}
                  {previewTab === 'pdf' && (() => {
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

                  <button
                    onClick={handleUseTemplate}
                    className="w-full rounded-lg bg-[#0B2242] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#15345E] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Use this template</span>
                    <ArrowRight className="size-4" />
                  </button>
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
                <div className="mt-2 flex justify-between text-xs text-[#64748B] font-mono">
                  <button
                    type="button"
                    onClick={() =>
                      setSituationText(
                        'Party A is Mr. Rajesh Kumar, residing at Sector 62, Noida. Party B is Mr. Amit Sharma, residing at Indirapuram, Ghaziabad. They have a commercial dispute regarding unpaid supplies of industrial machinery worth INR 45,00,000 delivered on 15th August 2023 under Contract Ref No. IND-889. They agree to refer all disputes arising thereunder to two arbitrators: Justice (Retd.) V. K. Gupta appointed by Party A, and Justice (Retd.) S. P. Singh appointed by Party B. Seat of arbitration shall be New Delhi.'
                      )
                    }
                    className="text-xs text-[#0B2242] hover:underline cursor-pointer"
                  >
                    Load Sample Facts
                  </button>
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
                {/* Studio Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#CBD5E1] bg-white p-3 shadow-xs">
                  {/* Left Formatter Buttons */}
                  <div className="flex items-center gap-1 text-[#0B2242]">
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => document.execCommand('bold')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <Bold className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => document.execCommand('italic')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <Italic className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Underline"
                      onClick={() => document.execCommand('underline')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <Underline className="size-4" />
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      type="button"
                      title="Align Left"
                      onClick={() => document.execCommand('justifyLeft')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <AlignLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Centre"
                      onClick={() => document.execCommand('justifyCenter')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <AlignCenter className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Align Right"
                      onClick={() => document.execCommand('justifyRight')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <AlignRight className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Justify"
                      onClick={() => document.execCommand('justifyFull')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <AlignJustify className="size-4" />
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      type="button"
                      title="Numbered list"
                      onClick={() => document.execCommand('insertOrderedList')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <ListOrdered className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Bulleted list"
                      onClick={() => document.execCommand('insertUnorderedList')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <List className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Undo"
                      onClick={() => document.execCommand('undo')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <RotateCcw className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Redo"
                      onClick={() => document.execCommand('redo')}
                      className="rounded p-1.5 hover:bg-gray-100 transition-colors"
                    >
                      <RotateCw className="size-4" />
                    </button>
                  </div>

                  {/* Right Actions: Auto-save, Revise, Word, PDF */}
                  <div className="flex items-center gap-2">
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
                      className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2242] hover:border-[#0B2242] transition-colors"
                    >
                      Revise the draft
                    </button>

                    <button
                      onClick={handleCopyDraft}
                      className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2242] hover:border-[#0B2242] transition-colors inline-flex items-center gap-1"
                    >
                      {copiedDraft ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                      <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleDownloadWord}
                      className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2242] hover:border-[#0B2242] transition-colors inline-flex items-center gap-1"
                    >
                      <Download className="size-3 text-[#0B2242]" />
                      <span>Word</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="rounded-lg bg-[#0B2242] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#15345E] transition-colors inline-flex items-center gap-1.5 shadow-xs"
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
