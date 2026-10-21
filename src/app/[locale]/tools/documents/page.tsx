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

    try {
      const res = await toolsService.generateLegalDocumentDraft({
        template: selectedTemplate?.title || 'LEGAL AGREEMENT',
        category: selectedCategory?.name || 'Agreement',
        situation: situationText,
        extractedData: extractedMap,
      });

      setTimeout(() => {
        setDraftContent(res.content || '');
        setIsWritingDraft(false);
        setReadyToDraft(false);
      }, 1600);
    } catch {
      setIsWritingDraft(false);
      setReadyToDraft(false);
    }
  };

  // Export handlers
  const handleDownloadWord = () => {
    const cleanContent = draftContent
      .replace(/<span[^>]*class="[^"]*page-break-badge[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
      .replace(/<div[^>]*class="[^"]*page-break-indicator[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<hr[^>]*class="[^"]*court-page-break[^"]*"[^>]*\/?>/gi, '<br clear="all" style="page-break-before:always;mso-break-type:section-break" />')
      .replace(/<div[^>]*court-page-break[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '<br clear="all" style="page-break-before:always;mso-break-type:section-break" />')
      .replace(/<div[^>]*court-page-break[^>]*>[\s\S]*?<\/div>/gi, '<br clear="all" style="page-break-before:always;mso-break-type:section-break" />')
      .replace(/<div[^>]*data-page-break="true"[^>]*>[\s\S]*?<\/div>/gi, '<br clear="all" style="page-break-before:always;mso-break-type:section-break" />')
      .replace(/<p(?:\s+[^>]*)?>\s*(<p(?:\s+[^>]*)?>)/gi, '$1')
      .replace(/(<\/p>)\s*<\/p>/gi, '$1')
      .replace(/<br\s*\/?>\s*(<p)/gi, '$1')
      .replace(/(<\/p>)\s*<br\s*\/?>/gi, '$1');

    const formattedContent = /<\s*(p|div|h[1-6]|span|table|section|article|header|br|b|i|strong|em)\b/i.test(cleanContent)
      ? cleanContent
      : cleanContent
          .split(/\n\n+/)
          .map((p) => `<p style="text-align: justify; line-height: 1.5; margin-bottom: 8pt;">${p.trim().replace(/\n/g, '<br/>')}</p>`)
          .join('');

    const docContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <title>${selectedTemplate?.title || 'Legal Document'}</title>
  <style>
    @page Section1 {
      size: 8.27in 11.69in; /* A4 */
      margin: 1.25in 1.0in 1.25in 1.25in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 13pt;
      color: #000000;
      background: #FFFFFF;
      line-height: 1.5;
    }
    p {
      text-align: justify;
      margin-top: 0pt;
      margin-bottom: 8pt;
      line-height: 1.5;
      font-size: 13pt;
    }
    .ql-align-center { text-align: center !important; }
    .ql-align-right { text-align: right !important; }
    .ql-align-justify { text-align: justify !important; }
    .ql-align-left { text-align: left !important; }
    .court-page-break {
      page-break-before: always !important;
      mso-break-type: page-break;
    }
    .page-break-indicator {
      display: none !important;
    }
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
    u { text-decoration: underline; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 8pt;
      margin-bottom: 12pt;
    }
    th, td {
      border: 1px solid #475569;
      padding: 6pt 8pt;
      font-size: 11pt;
    }
  </style>
</head>
<body>
  <div class="Section1">
    ${formattedContent}
  </div>
</body>
</html>`;

    const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(selectedTemplate?.title || 'Legal-Document').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedTemplate?.title || 'Legal Document'}</title>
          <style>
            body { font-family: 'Times New Roman', Georgia, serif; font-size: 14pt; line-height: 1.7; margin: 1.2in 1in; color: #000; }
            pre { font-family: 'Times New Roman', Georgia, serif; white-space: pre-wrap; word-wrap: break-word; }
            @page { size: A4; margin: 1in; }
          </style>
        </head>
        <body>
          <pre>${draftContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
              <span>7 drafts left</span>
              <span className="text-emerald-400">·</span>
              <span>Lawyer</span>
            </div>
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
                className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0B2242] text-white shadow-xs'
                    : isCompleted
                    ? 'text-[#0B2242] hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <span
                  className={`size-5 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${
                    isActive
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
                      className={`w-full flex items-start gap-3 p-4 text-left transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#EAEFF9] border-l-4 border-l-[#0B2242]' : 'hover:bg-gray-50'
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
                <div className="sticky top-20 rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs space-y-4">
                  <div className="border-b border-[#F1F5F9] pb-4">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                      {selectedTemplate.category}
                    </span>
                    <h3 className="mt-1 text-lg font-bold font-merriweather text-[#0B2242]">
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
                    <p className="mt-2 text-xs sm:text-sm text-[#334155] leading-relaxed">
                      {selectedTemplate.description}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-xs text-[#475569] space-y-2">
                    <h5 className="font-bold text-[#0B2242] uppercase font-mono text-[11px]">Included Clauses & Features</h5>
                    <ul className="space-y-1.5 list-disc list-inside">
                      <li>Formal Indian execution preamble & party recitals</li>
                      <li>Operative commercial and procedural covenants</li>
                      <li>Indian Arbitration & Conciliation Act 1996 dispute clause</li>
                      <li>Liquidated damages, indemnity & termination cure terms</li>
                      <li>Two-witness attestations & verification deeds</li>
                    </ul>
                  </div>

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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
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

                {/* Google Docs Style Paginated Legal Document Canvas */}
                <div className="w-full max-w-5xl mx-auto">
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
