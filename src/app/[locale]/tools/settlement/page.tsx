'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Download,
  Gavel,
  Scale,
  ArrowLeft,
  FileText,
  Search,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  X,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toolsService } from '@/data/services/tools-service/toolsService';
import { SettlementResponse, PaymentTranche } from '@/data/services/tools-service/types';
import SettlementComingSoon from '@/components/settlement/SettlementComingSoon';

export interface SavedDispute {
  id: string;
  createdAt: string;
  disputeType: string;
  partyA: string;
  partyB: string;
  claimAmount: string;
  settlementAmount: string;
  mediatorName?: string;
  mediatorFirm?: string;
  mediatorFee?: string;
  status: 'Draft Term Sheet' | 'Mediator Assigned' | 'Executed';
  termSheet: SettlementResponse;
}

export interface PanelMediator {
  id: string;
  name: string;
  chamber: string;
  fee: string;
  numericFee: number;
}

export const SETTLEMENT_STORAGE_KEY = 'legaltech_user_settlement_disputes_v1';

export const PANEL_MEDIATORS: PanelMediator[] = [
  { id: 'auto', name: 'Assign an accredited mediator for me', chamber: 'LegalTech National Mediation Panel (Auto-Match)', fee: '₹5,00,000', numericFee: 5000 },
  { id: '1', name: 'Syed Majeed', chamber: 'BL law associate', fee: '₹10,000', numericFee: 10000 },
  { id: '2', name: 'Azeem Azeez S', chamber: 'AALA ASSOCIATES', fee: '₹10,000', numericFee: 10000 },
  { id: '3', name: 'Anjum choudhary Choudhary', chamber: 'Chamber', fee: '₹5,000', numericFee: 5000 },
  { id: '4', name: 'Adv. Danish Nabi Bhat', chamber: 'advocate', fee: '₹5,000', numericFee: 5000 },
  { id: '5', name: '0901CS211027 ARYAN MISHRA', chamber: 'advocate', fee: '₹5,000', numericFee: 5000 },
  { id: '6', name: 'Fazzu Fazal', chamber: 'HMF LAW ASSOCIATES', fee: '₹15,000', numericFee: 15000 },
  { id: '7', name: 'Rahulkumar Itnare', chamber: 'advocate', fee: '₹5,000', numericFee: 5000 },
  { id: '8', name: 'Arif Madar', chamber: 'advocate', fee: '₹5,000', numericFee: 5000 },
  { id: '9', name: 'HARISHANKAR KUMAR SONI', chamber: 'HARISHANKAR & ASSOCIATES', fee: '₹10,000', numericFee: 10000 },
  { id: '10', name: 'Ashish Shukla', chamber: 'advocate', fee: '₹10,000', numericFee: 10000 },
  { id: '11', name: 'shafi sheikh', chamber: 'Sanjay', fee: '₹5,000', numericFee: 5000 },
  { id: '12', name: 'Rupinder Singh Khural Advocate', chamber: 'Khural & associates', fee: '₹5,000', numericFee: 5000 },
  { id: '13', name: 'Advocate Manoj Sharma', chamber: 'Chamber Of Advocate Manoj Sharma', fee: '₹50,000', numericFee: 50000 },
  { id: '14', name: 'Sanjeev Kumar. A', chamber: 'ARMOR LAW FIRM', fee: '₹5,000', numericFee: 5000 },
  { id: '15', name: 'Happy', chamber: 'advocate', fee: '₹3,100', numericFee: 3100 },
  { id: '16', name: 'Azam Ansari', chamber: 'advocate', fee: '₹1,500', numericFee: 1500 },
  { id: '17', name: 'Asrar Malik', chamber: 'advocate', fee: '₹10,000', numericFee: 10000 },
  { id: '18', name: 'Adv Sunil Kumar', chamber: 'B&B Legal', fee: '₹15,000', numericFee: 15000 },
  { id: '19', name: 'Advocate Manoj Dullarwar', chamber: 'A & M legal consultancy and associates', fee: '₹2,500', numericFee: 2500 },
  { id: '20', name: 'B Das', chamber: 'advocate', fee: '₹50,000', numericFee: 50000 },
  { id: '21', name: 'Seema Garg', chamber: 'advocate', fee: '₹10,000', numericFee: 10000 },
];

export default function SettlementPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';

  // State: Coming soon preview toggle
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // State: View Mode ('dashboard' | 'wizard')
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');

  // Dashboard states
  const [disputes, setDisputes] = useState<SavedDispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<SavedDispute | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'termSheet' | 'courtApplication'>('termSheet');
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  const [copiedAppDashboard, setCopiedAppDashboard] = useState(false);

  // Wizard states
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mediatorSearch, setMediatorSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [termSheet, setTermSheet] = useState<SettlementResponse | null>(null);
  const [wizardTab, setWizardTab] = useState<'termSheet' | 'courtApplication'>('termSheet');
  const [copiedWizard, setCopiedWizard] = useState(false);
  const [copiedAppWizard, setCopiedAppWizard] = useState(false);
  const [submittedDisputeId, setSubmittedDisputeId] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: About You
    yourName: '',
    youAre: 'An individual',
    yourCity: '',
    yourAddress: '',
    yourMobile: '',
    yourEmail: '',
    preferredLanguage: 'English',

    // Step 1: Dispute Details
    disputeKind: '',
    amountInvolved: '',
    whenStarted: '',
    whatHappened: '',
    whatWouldSettle: '',
    litigationStatus: 'Nothing yet' as 'Nothing yet' | 'A legal notice was sent' | 'A case is in court',
    whichCourt: '',
    caseNumber: '',

    // Step 2: Their Details
    otherName: '',
    otherType: 'A business',
    otherPersonWhoDecides: '',
    otherAddress: '',
    otherCity: '',
    otherMobile: '',
    otherEmail: '',
    hasAdvocate: 'No' as 'No' | 'Yes',
    advocateDetails: '',

    // Step 2: Before We Approach Them
    doTheyKnowDispute: 'Yes' as 'Yes' | 'No',
    discussedSettlingBefore: 'Yes, it broke down' as 'Yes, it broke down' | 'No',
    otherPreferredLanguage: 'English',
    mediatorPreContactNotes: '',
    contactRestrictions: {
      violenceOrThreats: false,
      restrainingOrder: false,
      policeComplaint: false,
    },

    // Step 3: Choose a Mediator & Safeguards
    selectedMediator: PANEL_MEDIATORS[0],
    exclusions: {
      under18: false,
      criminalCase: false,
      taxDemand: false,
      thirdPartyAffected: false,
      regulatorInvolved: false,
      landAcquisition: false,
    },
    affirmations: {
      isNeutral: false,
      isTrueInfo: false,
    },

    // Step 3: Structured Tranches
    paymentTranches: [
      {
        tranche: 'Tranche 01 (Signing / Execution)',
        amount: '',
        dueDate: 'Within 7 business days of signing',
        paymentMode: 'RTGS / Bank Transfer',
      },
      {
        tranche: 'Tranche 02 (Interim Milestone)',
        amount: '',
        dueDate: '30 days from Tranche 01',
        paymentMode: 'RTGS / Bank Transfer',
      },
      {
        tranche: 'Tranche 03 (Final & Full Satisfaction)',
        amount: '',
        dueDate: '60 days from Tranche 01',
        paymentMode: 'RTGS / Bank Transfer',
      },
    ] as PaymentTranche[],
  });

  const filteredMediators = PANEL_MEDIATORS.filter(
    (m) =>
      m.name.toLowerCase().includes(mediatorSearch.toLowerCase()) ||
      m.chamber.toLowerCase().includes(mediatorSearch.toLowerCase())
  );

  // Smooth scroll
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (targetStep: 1 | 2 | 3 | 4) => {
    setStep(targetStep);
    scrollToTop();
  };

  // Mount checks: preview query param & view query param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('new') === 'true' || urlParams.get('view') === 'wizard') {
          setView('wizard');
        }
        const isParamPreview = urlParams.get('preview') === 'true';
        const storedPreview = localStorage.getItem('legaltech_settlement_preview_mode') === 'true';
        if (isParamPreview || storedPreview) {
          setShowPreview(true);
        }

        // Load disputes from storage
        const stored = localStorage.getItem(SETTLEMENT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setDisputes(parsed);
          }
        }
      } catch {
        // Ignore
      }
    }
  }, []);

  const handleTogglePreview = (val: boolean) => {
    setShowPreview(val);
    try {
      localStorage.setItem('legaltech_settlement_preview_mode', val ? 'true' : 'false');
    } catch {
      // Ignore
    }
  };

  // Tranche Helpers
  const handleAddTranche = () => {
    const nextIdx = formData.paymentTranches.length + 1;
    setFormData({
      ...formData,
      paymentTranches: [
        ...formData.paymentTranches,
        {
          tranche: `Tranche 0${nextIdx}`,
          amount: '',
          dueDate: `${nextIdx * 30} days post Tranche 01`,
          paymentMode: 'RTGS',
        },
      ],
    });
  };

  const handleRemoveTranche = (idx: number) => {
    const updated = formData.paymentTranches.filter((_, i) => i !== idx);
    setFormData({ ...formData, paymentTranches: updated });
  };

  const handleTrancheChange = (idx: number, field: keyof PaymentTranche, val: string) => {
    const updated = [...formData.paymentTranches];
    updated[idx] = { ...updated[idx], [field]: val };
    setFormData({ ...formData, paymentTranches: updated });
  };

  // Pre-load sample for testing
  const handleLoadSample = () => {
    setFormData({
      yourName: 'Apex Logistics Pvt. Ltd.',
      youAre: 'A company / business',
      yourCity: 'Mumbai',
      yourAddress: 'Plot 42, Bandra-Kurla Complex, Bandra East, Mumbai 400051',
      yourMobile: '+91 98200 12345',
      yourEmail: 'legal@apexlogistics.in',
      preferredLanguage: 'English',

      disputeKind: 'Money owed for logistics & freight forwarding services',
      amountInvolved: '84,50,000',
      whenStarted: 'November 2024',
      whatHappened:
        'Apex Logistics provided multi-modal freight transport and warehousing for Q3/Q4 FY 2024. Zenith Retail defaulted on final invoices, citing delivery disruptions during peak festival sales.',
      whatWouldSettle:
        'INR 58,00,000 payable in 3 structured installments over 60 days, with complete mutual discharge and withdrawal of pending commercial notices.',
      litigationStatus: 'A case is in court',
      whichCourt: 'Court of Ld. District Judge, Commercial Court, Tis Hazari, Delhi',
      caseNumber: 'CS (COMM) No. 412/2024',

      otherName: 'Zenith Retail Enterprise',
      otherType: 'A business',
      otherPersonWhoDecides: 'Mr. Rajiv Kapoor, Managing Director',
      otherAddress: 'Block B-4, Okhla Industrial Area Phase-II, New Delhi 110020',
      otherCity: 'Delhi',
      otherMobile: '+91 98110 54321',
      otherEmail: 'accounts@zenithretail.com',
      hasAdvocate: 'Yes',
      advocateDetails: 'Sh. Amit Verma, Advocate, Delhi High Court (D/1428/2012)',

      doTheyKnowDispute: 'Yes',
      discussedSettlingBefore: 'Yes, it broke down',
      otherPreferredLanguage: 'English',
      mediatorPreContactNotes:
        'Zenith management disputed invoice reconciliation citing festival sales delays, but indicated informal interest in a structured installment payoff.',
      contactRestrictions: {
        violenceOrThreats: false,
        restrainingOrder: false,
        policeComplaint: false,
      },

      paymentTranches: [
        {
          tranche: 'Tranche 01 (Signing / Execution)',
          amount: 'INR 20,00,000',
          dueDate: 'Within 7 business days of signing',
          paymentMode: 'RTGS',
        },
        {
          tranche: 'Tranche 02 (Interim Milestone)',
          amount: 'INR 20,00,000',
          dueDate: '30 days from Tranche 01',
          paymentMode: 'RTGS',
        },
        {
          tranche: 'Tranche 03 (Final & Full Satisfaction)',
          amount: 'INR 18,00,000',
          dueDate: '60 days from Tranche 01',
          paymentMode: 'RTGS',
        },
      ],
      selectedMediator: PANEL_MEDIATORS[1],
      exclusions: {
        under18: false,
        criminalCase: false,
        taxDemand: false,
        thirdPartyAffected: false,
        regulatorInvolved: false,
        landAcquisition: false,
      },
      affirmations: {
        isNeutral: true,
        isTrueInfo: true,
      },
    });
  };

  // Step 3: Trigger Synthesis
  const handleSynthesizeTermSheet = async () => {
    setLoading(true);
    try {
      const payload = {
        disputeType: formData.disputeKind || 'Commercial Settlement Dispute',
        partyA: formData.yourName || 'Claimant Party',
        partyB: formData.otherName || 'Respondent Party',
        claimAmount: `INR ${formData.amountInvolved || '50,00,000'}`,
        settlementAmount: `INR ${formData.whatWouldSettle ? '58,00,000' : '35,00,000'}`,
        disputeSummary: formData.whatHappened || 'Commercial contract dispute between parties.',
        liabilityAllocation: 'Mutual commercial accommodation without admission of civil or criminal fault',
        paymentTranches: formData.paymentTranches,
        pendingLitigation:
          formData.litigationStatus === 'A case is in court'
            ? {
                courtName: formData.whichCourt || 'Court of Ld. District Judge, Commercial Court',
                caseNumber: formData.caseNumber || 'CS (COMM) Matter',
                caseType: 'Commercial Civil Suit',
              }
            : undefined,
      };

      const res = await toolsService.generateSettlement(payload);
      setTermSheet(res);
      setWizardTab('termSheet');
    } catch (err: any) {
      alert('Settlement generation error: ' + (err.message || 'Failed to synthesize term sheet'));
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Final Submission & Save to Storage
  const handleFinalSubmit = () => {
    if (!termSheet) return;
    const disputeId = `DISP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: SavedDispute = {
      id: disputeId,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      disputeType: formData.disputeKind || 'Commercial Settlement Dispute',
      partyA: formData.yourName || 'Claimant',
      partyB: formData.otherName || 'Respondent',
      claimAmount: `INR ${formData.amountInvolved || termSheet.claimValue}`,
      settlementAmount: termSheet.agreedSettlementValue,
      mediatorName: formData.selectedMediator.name,
      mediatorFirm: formData.selectedMediator.chamber,
      mediatorFee: formData.selectedMediator.fee,
      status: 'Mediator Assigned',
      termSheet,
    };

    try {
      const existing = localStorage.getItem(SETTLEMENT_STORAGE_KEY);
      const list = existing ? JSON.parse(existing) : [];
      const updatedList = [newRecord, ...list];
      localStorage.setItem(SETTLEMENT_STORAGE_KEY, JSON.stringify(updatedList));
      setDisputes(updatedList);
    } catch {
      // Ignore storage errors
    }

    setSubmittedDisputeId(disputeId);
    goToStep(4);
  };

  const handleDeleteDispute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this dispute record?')) {
      const updated = disputes.filter((d) => d.id !== id);
      setDisputes(updated);
      try {
        localStorage.setItem(SETTLEMENT_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      if (selectedDispute?.id === id) {
        setSelectedDispute(null);
      }
    }
  };

  const getFullTermSheetText = (targetSheet: SettlementResponse | null) => {
    if (!targetSheet) return '';
    const sectionsText = (targetSheet.sections || [])
      .map((s) => `CLAUSE ${s.index}. ${s.heading.toUpperCase()}\n${s.content}\n`)
      .join('\n');

    return (
      `${targetSheet.title}\n` +
      `Governing Law: ${targetSheet.governingLaw}\n\n` +
      `BETWEEN:\n${targetSheet.parties?.partyA}\nAND\n${targetSheet.parties?.partyB}\n\n` +
      `Contested Claim: ${targetSheet.claimValue}\n` +
      `Agreed Settlement: ${targetSheet.agreedSettlementValue}\n` +
      `Default Mechanism: ${targetSheet.defaultMechanism || 'Standard S. 27 Enforcement'}\n\n` +
      `OPERATIVE SETTLEMENT COVENANTS:\n` +
      sectionsText +
      `\nEXECUTION & VERIFICATION CLAUSE:\n${targetSheet.executionBlock}\n`
    );
  };

  const handleCopyDashboard = () => {
    if (!selectedDispute?.termSheet) return;
    const text = getFullTermSheetText(selectedDispute.termSheet);
    navigator.clipboard.writeText(text);
    setCopiedDashboard(true);
    setTimeout(() => setCopiedDashboard(false), 2000);
  };

  const handleCopyAppDashboard = () => {
    if (!selectedDispute?.termSheet?.courtApplication) return;
    navigator.clipboard.writeText(selectedDispute.termSheet.courtApplication);
    setCopiedAppDashboard(true);
    setTimeout(() => setCopiedAppDashboard(false), 2000);
  };

  const handleCopyWizard = () => {
    if (!termSheet) return;
    const text = getFullTermSheetText(termSheet);
    navigator.clipboard.writeText(text);
    setCopiedWizard(true);
    setTimeout(() => setCopiedWizard(false), 2000);
  };

  const handleCopyAppWizard = () => {
    if (!termSheet?.courtApplication) return;
    navigator.clipboard.writeText(termSheet.courtApplication);
    setCopiedAppWizard(true);
    setTimeout(() => setCopiedAppWizard(false), 2000);
  };

  const handleDownloadTxt = (type: 'termSheet' | 'courtApp' | 'courtApplication') => {
    if (!selectedDispute?.termSheet) return;
    const text =
      type === 'termSheet'
        ? getFullTermSheetText(selectedDispute.termSheet)
        : selectedDispute.termSheet.courtApplication || '';
    const filename =
      type === 'termSheet'
        ? `Settlement_TermSheet_${selectedDispute.id}.txt`
        : `Court_Compromise_Application_O23R3_${Date.now()}.txt`;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Guard: Coming soon screen unless preview mode unlocked
  if (!showPreview) {
    return (
      <SettlementComingSoon
        locale={locale}
        onPreviewMode={() => handleTogglePreview(true)}
        pageType="dashboard"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Internal Demo / Preview Banner */}
      <div className="bg-[#0B2242] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner border-b border-[#CAA438]/30 print:hidden">
        <div className="flex items-center gap-2">
          <span className="font-mono bg-[#CAA438] text-[#0B2242] px-2 py-0.5 rounded font-bold uppercase text-[10px]">
            Preview Mode
          </span>
          <span className="text-gray-300">
            Internal Feature Preview. General site visitors see the &quot;Coming Soon&quot; screen.
          </span>
        </div>
        <div className="flex items-center gap-3">
          {view === 'wizard' ? (
            <button
              type="button"
              onClick={() => {
                setView('dashboard');
                scrollToTop();
              }}
              className="text-xs font-semibold text-gray-200 hover:text-white underline cursor-pointer"
            >
              Switch to Dashboard View
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setView('wizard');
                setStep(1);
                scrollToTop();
              }}
              className="text-xs font-semibold text-gray-200 hover:text-white underline cursor-pointer"
            >
              Switch to New Dispute Wizard
            </button>
          )}
          <span className="text-gray-500">|</span>
          <button
            type="button"
            onClick={() => handleTogglePreview(false)}
            className="text-xs font-semibold text-[#CAA438] hover:underline cursor-pointer"
          >
            Return to Coming Soon Notice
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW A: MULTI-STEP CREATION WIZARD                       */}
      {/* ========================================================= */}
      {view === 'wizard' && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Top Header Matching WritOnline 1:1 */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#4F80E1]">
                SETTLE A DISPUTE
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-sans">
                {step === 1 && 'Tell us about the dispute.'}
                {step === 2 && 'Tell us about the other side.'}
                {step === 3 && 'How this works.'}
                {step === 4 && 'Dispute submitted.'}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#6B7280]">
                {step === 1 &&
                  'About ten minutes. We assign or you pick a mediator, and they approach the other side, not you.'}
                {step === 2 &&
                  'Who is on the other side of this dispute, and how our mediator can reach them.'}
                {step === 3 &&
                  'The mediator is neutral. They are not your lawyer. Choose your mediator, confirm statutory eligibility, and synthesize settlement terms.'}
                {step === 4 &&
                  'Your dispute has been logged with statutory enforceability under Section 27 of The Mediation Act, 2023.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setView('dashboard');
                scrollToTop();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-[#F8FAFC] px-4 py-2 text-xs font-bold text-[#283851] shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to your disputes</span>
            </button>
          </div>

          {/* Stepper Bar Matching WritOnline 1:1 */}
          <div className="mt-8 rounded-2xl border border-gray-200/80 bg-white px-6 py-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
              {/* Step 1 */}
              <div
                onClick={() => goToStep(1)}
                className={`flex items-center gap-2.5 cursor-pointer ${
                  step === 1 ? 'text-[#111827] font-semibold' : step > 1 ? 'text-[#111827]' : 'text-[#94A3B8]'
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    step === 1
                      ? 'bg-[#283851] text-white'
                      : step > 1
                      ? 'bg-emerald-600 text-white'
                      : 'border border-gray-300 text-gray-400 bg-transparent'
                  }`}
                >
                  {step > 1 ? <Check className="size-3.5 stroke-[2.5]" /> : '1'}
                </span>
                <span>Your dispute</span>
              </div>

              <div className="h-[1px] flex-1 bg-gray-200 mx-3 sm:mx-6 hidden sm:block" />

              {/* Step 2 */}
              <div
                onClick={() => {
                  if (formData.yourName) goToStep(2);
                }}
                className={`flex items-center gap-2.5 ${formData.yourName ? 'cursor-pointer' : ''} ${
                  step === 2 ? 'text-[#111827] font-semibold' : step > 2 ? 'text-[#111827]' : 'text-[#94A3B8]'
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    step === 2
                      ? 'bg-[#283851] text-white'
                      : step > 2
                      ? 'bg-emerald-600 text-white'
                      : 'border border-gray-300 text-gray-400 bg-transparent'
                  }`}
                >
                  {step > 2 ? <Check className="size-3.5 stroke-[2.5]" /> : '2'}
                </span>
                <span>The other side</span>
              </div>

              <div className="h-[1px] flex-1 bg-gray-200 mx-3 sm:mx-6 hidden sm:block" />

              {/* Step 3 */}
              <div
                onClick={() => {
                  if (formData.yourName && formData.otherName) goToStep(3);
                }}
                className={`flex items-center gap-2.5 ${formData.yourName && formData.otherName ? 'cursor-pointer' : ''} ${
                  step === 3 ? 'text-[#111827] font-semibold' : step > 3 ? 'text-[#111827]' : 'text-[#94A3B8]'
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    step === 3
                      ? 'bg-[#283851] text-white'
                      : step > 3
                      ? 'bg-emerald-600 text-white'
                      : 'border border-gray-300 text-gray-400 bg-transparent'
                  }`}
                >
                  {step > 3 ? <Check className="size-3.5 stroke-[2.5]" /> : '3'}
                </span>
                <span>How this works</span>
              </div>

              <div className="h-[1px] flex-1 bg-gray-200 mx-3 sm:mx-6 hidden sm:block" />

              {/* Step 4 */}
              <div
                className={`flex items-center gap-2.5 ${
                  step === 4 ? 'text-[#111827] font-semibold' : 'text-[#94A3B8]'
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    step === 4
                      ? 'bg-emerald-600 text-white'
                      : 'border border-gray-300 text-gray-400 bg-transparent'
                  }`}
                >
                  4
                </span>
                <span>Submitted</span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Content Area */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className={step < 4 ? 'lg:col-span-8' : 'lg:col-span-12'}>
              {/* STEP 1: ABOUT YOU & DISPUTE DETAILS */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Card 1: ABOUT YOU */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        ABOUT YOU
                      </span>
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="text-xs font-semibold text-[#4F80E1] hover:underline cursor-pointer"
                      >
                        Fill sample dispute
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">
                        Your name or business name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.yourName}
                        onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
                        placeholder="e.g. Apex Logistics Pvt. Ltd. or Rajesh Kumar"
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">You are</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['An individual', 'A business', 'A company / business'].map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setFormData({ ...formData, youAre: type })}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                              formData.youAre === type
                                ? 'bg-[#283851] text-white shadow-2xs'
                                : 'border border-gray-200 bg-[#F8FAFC] text-[#64748B] hover:border-gray-300'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">City</label>
                        <input
                          type="text"
                          value={formData.yourCity}
                          onChange={(e) => setFormData({ ...formData, yourCity: e.target.value })}
                          placeholder="e.g. Mumbai"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">Address</label>
                        <input
                          type="text"
                          value={formData.yourAddress}
                          onChange={(e) => setFormData({ ...formData, yourAddress: e.target.value })}
                          placeholder="Registered Office / Residential Address"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">Mobile number</label>
                        <input
                          type="text"
                          value={formData.yourMobile}
                          onChange={(e) => setFormData({ ...formData, yourMobile: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">Email address</label>
                        <input
                          type="email"
                          value={formData.yourEmail}
                          onChange={(e) => setFormData({ ...formData, yourEmail: e.target.value })}
                          placeholder="name@domain.com"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: WHAT IS THE DISPUTE ABOUT? */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400 block border-b border-gray-100 pb-3">
                      WHAT IS THE DISPUTE ABOUT?
                    </span>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">
                        In one line, what kind of dispute is this?
                      </label>
                      <input
                        type="text"
                        value={formData.disputeKind}
                        onChange={(e) => setFormData({ ...formData, disputeKind: e.target.value })}
                        placeholder="e.g. Unpaid commercial invoices for supply of goods"
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">
                          Amount involved (₹)
                        </label>
                        <input
                          type="text"
                          value={formData.amountInvolved}
                          onChange={(e) => setFormData({ ...formData, amountInvolved: e.target.value })}
                          placeholder="e.g. 50,00,000"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs font-mono text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">When did it start?</label>
                        <input
                          type="text"
                          value={formData.whenStarted}
                          onChange={(e) => setFormData({ ...formData, whenStarted: e.target.value })}
                          placeholder="e.g. November 2024"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">
                        What happened? (2–3 paragraphs)
                      </label>
                      <textarea
                        rows={4}
                        value={formData.whatHappened}
                        onChange={(e) => setFormData({ ...formData, whatHappened: e.target.value })}
                        placeholder="Tell the story plainly. What was agreed, what went wrong, and what the other side says when you ask."
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] p-3 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">
                        What would settle this for you?
                      </label>
                      <textarea
                        rows={3}
                        value={formData.whatWouldSettle}
                        onChange={(e) => setFormData({ ...formData, whatWouldSettle: e.target.value })}
                        placeholder="Be practical. A lower amount paid now? An apology? Staggered installments over six months?"
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] p-3 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Card 3: HAS ANYTHING BEEN FILED OR SENT ALREADY? */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400 block border-b border-gray-100 pb-3">
                      HAS ANYTHING BEEN FILED OR SENT ALREADY?
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {['Nothing yet', 'A legal notice was sent', 'A case is in court'].map((status) => (
                        <button
                          type="button"
                          key={status}
                          onClick={() => setFormData({ ...formData, litigationStatus: status as any })}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                            formData.litigationStatus === status
                              ? 'bg-[#283851] text-white shadow-2xs'
                              : 'border border-gray-200 bg-[#F8FAFC] text-[#64748B] hover:border-gray-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {formData.litigationStatus === 'A case is in court' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-xs font-semibold text-[#111827]">Which court?</label>
                          <input
                            type="text"
                            value={formData.whichCourt}
                            onChange={(e) => setFormData({ ...formData, whichCourt: e.target.value })}
                            placeholder="e.g. Commercial Court, Tis Hazari"
                            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#111827]">Case number</label>
                          <input
                            type="text"
                            value={formData.caseNumber}
                            onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                            placeholder="e.g. CS (COMM) 412/2024"
                            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 1 Next Button */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-5 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.yourName) {
                          alert('Please enter your name or business name to proceed.');
                          return;
                        }
                        goToStep(2);
                      }}
                      className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all cursor-pointer ${
                        formData.yourName ? 'bg-[#283851] hover:bg-[#1E293B]' : 'bg-[#8FA6C3]'
                      }`}
                    >
                      Next — the other side
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: THE OTHER SIDE & BEFORE WE APPROACH */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Card 1: THEIR DETAILS */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400 block border-b border-gray-100 pb-3">
                      THEIR DETAILS
                    </span>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">
                        Person or business on the other side <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.otherName}
                        onChange={(e) => setFormData({ ...formData, otherName: e.target.value })}
                        placeholder="e.g. Zenith Retail Enterprise"
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">They are</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['An individual', 'A business'].map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setFormData({ ...formData, otherType: type })}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                              formData.otherType === type
                                ? 'bg-[#283851] text-white shadow-2xs'
                                : 'border border-gray-200 bg-[#F8FAFC] text-[#64748B] hover:border-gray-300'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.otherType === 'A business' && (
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">
                          Person who decides (if known)
                        </label>
                        <input
                          type="text"
                          value={formData.otherPersonWhoDecides}
                          onChange={(e) => setFormData({ ...formData, otherPersonWhoDecides: e.target.value })}
                          placeholder="e.g. Mr. Rajiv Kapoor, Managing Director"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">Their address</label>
                        <input
                          type="text"
                          value={formData.otherAddress}
                          onChange={(e) => setFormData({ ...formData, otherAddress: e.target.value })}
                          placeholder="Office / Residential Address"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">City</label>
                        <input
                          type="text"
                          value={formData.otherCity}
                          onChange={(e) => setFormData({ ...formData, otherCity: e.target.value })}
                          placeholder="e.g. Delhi"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">Mobile number</label>
                        <input
                          type="text"
                          value={formData.otherMobile}
                          onChange={(e) => setFormData({ ...formData, otherMobile: e.target.value })}
                          placeholder="+91 98110 54321"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#111827]">Email address</label>
                        <input
                          type="email"
                          value={formData.otherEmail}
                          onChange={(e) => setFormData({ ...formData, otherEmail: e.target.value })}
                          placeholder="accounts@zenithretail.com"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: BEFORE WE APPROACH THEM */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400 block border-b border-gray-100 pb-3">
                      BEFORE WE APPROACH THEM
                    </span>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">
                        Do they know there is a dispute?
                      </label>
                      <div className="mt-2 flex gap-2">
                        {['Yes', 'No'].map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setFormData({ ...formData, doTheyKnowDispute: opt as any })}
                            className={`rounded-xl px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                              formData.doTheyKnowDispute === opt
                                ? 'bg-[#283851] text-white shadow-2xs'
                                : 'border border-gray-200 bg-[#F8FAFC] text-[#64748B]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">
                        Have you discussed settling before?
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['Yes, it broke down', 'No'].map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setFormData({ ...formData, discussedSettlingBefore: opt as any })}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                              formData.discussedSettlingBefore === opt
                                ? 'bg-[#283851] text-white shadow-2xs'
                                : 'border border-gray-200 bg-[#F8FAFC] text-[#64748B]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">
                        What language are they most comfortable in?
                      </label>
                      <select
                        value={formData.otherPreferredLanguage}
                        onChange={(e) => setFormData({ ...formData, otherPreferredLanguage: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                      >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Marathi</option>
                        <option>Gujarati</option>
                        <option>Tamil</option>
                        <option>Bengali</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#111827]">
                        Anything the mediator should know before calling them?
                      </label>
                      <textarea
                        rows={3}
                        value={formData.mediatorPreContactNotes}
                        onChange={(e) => setFormData({ ...formData, mediatorPreContactNotes: e.target.value })}
                        placeholder="e.g. Speak to Mr. Kapoor directly; the finance team does not have settlement authority."
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] p-3 text-xs text-[#0F172A] focus:border-[#283851] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      {[
                        { key: 'violenceOrThreats', label: 'There has been violence or threats of violence' },
                        { key: 'restrainingOrder', label: 'There is a restraining order or injunction in place' },
                        { key: 'policeComplaint', label: 'A police complaint has been made by either side' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-3 text-xs text-[#334155] cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.contactRestrictions[
                                item.key as keyof typeof formData.contactRestrictions
                              ]
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                contactRestrictions: {
                                  ...formData.contactRestrictions,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="size-4 rounded border-gray-300 text-[#283851] focus:ring-[#283851] cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Step 2 Buttons */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.otherName) {
                          alert('Please enter the name of the person or business on the other side.');
                          return;
                        }
                        goToStep(3);
                      }}
                      className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all cursor-pointer ${
                        formData.otherName ? 'bg-[#283851] hover:bg-[#1E293B]' : 'bg-[#8FA6C3]'
                      }`}
                    >
                      Next — how this works
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: HOW THIS WORKS & SYNTHESIS */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Card 1: Neutrality Notice */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
                        The mediator is neutral. They are not your lawyer.
                      </h2>
                      <p className="text-xs sm:text-sm text-[#4B5563] mt-1.5 leading-relaxed">
                        This is the part people get wrong, so we say it plainly before you go any further.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* What they will do */}
                      <div className="rounded-xl bg-[#F0FDF4]/60 border border-emerald-200/80 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider font-mono">
                          <ShieldCheck className="size-4 text-emerald-600" />
                          <span>What they will do</span>
                        </div>
                        <ul className="space-y-2.5 text-xs text-[#1E293B]">
                          <li className="flex items-start gap-2.5">
                            <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Contact the other side and explain the process</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Hear both of you, separately and together</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Keep what you tell them in confidence</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Write up whatever you both agree, so it can be enforced like a court decree</span>
                          </li>
                        </ul>
                      </div>

                      {/* What they will not do */}
                      <div className="rounded-xl bg-[#FEF2F2]/60 border border-rose-200/80 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider font-mono">
                          <X className="size-4 text-rose-600" />
                          <span>What they will not do</span>
                        </div>
                        <ul className="space-y-2.5 text-xs text-[#1E293B]">
                          <li className="flex items-start gap-2.5">
                            <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>Advise you on whether a deal is good for you</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>Argue your case, or take your side</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>Represent you in court, now or later</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>Decide who is right — only you two can settle this</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Choose a mediator */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        CHOOSE A MEDIATOR
                      </span>
                      <span className="font-mono text-xs text-[#4F80E1]">
                        {PANEL_MEDIATORS.length} Empanelled Mediators
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input
                        type="text"
                        value={mediatorSearch}
                        onChange={(e) => setMediatorSearch(e.target.value)}
                        placeholder="Search mediator by name or chamber..."
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 bg-[#F8FAFC] focus:bg-white focus:border-[#283851] focus:outline-hidden transition-all"
                      />
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                      {filteredMediators.map((m) => {
                        const isSelected = formData.selectedMediator.id === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => setFormData({ ...formData, selectedMediator: m })}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#283851] bg-[#F8FAFC] shadow-2xs ring-1 ring-[#283851]'
                                : 'border-gray-200/80 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-[#283851] bg-[#283851]'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#0F172A]">{m.name}</p>
                                <p className="text-[11px] text-[#64748B]">{m.chamber}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md ${
                                  isSelected
                                    ? 'text-[#283851] bg-[#E2E8F0]'
                                    : 'text-[#283851] bg-gray-100'
                                }`}
                              >
                                {m.fee}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {filteredMediators.length === 0 && (
                        <div className="text-center py-6 text-xs text-gray-500">
                          No mediator matching &quot;{mediatorSearch}&quot;.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Statutory Exclusions */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        STATUTORY EXCLUSIONS
                      </span>
                      <span className="font-mono text-xs text-amber-600">
                        Section 6, Mediation Act 2023
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">
                        A few things mediation cannot cover
                      </h3>
                    </div>

                    <div className="space-y-3 pt-1">
                      {[
                        { key: 'under18', label: 'Someone involved is under 18' },
                        { key: 'criminalCase', label: 'There is a criminal case or police complaint' },
                        { key: 'taxDemand', label: 'It is about a tax demand or refund' },
                        { key: 'thirdPartyAffected', label: 'It affects someone who is not part of the settlement' },
                        { key: 'regulatorInvolved', label: 'A regulator is involved — SEBI, RBI, TRAI, CCI' },
                        { key: 'landAcquisition', label: 'It is about land acquisition compensation' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-3 text-xs text-[#334155] cursor-pointer hover:text-[#0F172A] select-none"
                        >
                          <input
                            type="checkbox"
                            checked={formData.exclusions[item.key as keyof typeof formData.exclusions]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                exclusions: {
                                  ...formData.exclusions,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="size-4 rounded border-gray-300 text-[#283851] focus:ring-[#283851] cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>

                    <p className="text-xs text-[#64748B] pt-2 border-t border-gray-100">
                      Tick anything that applies. If one does, we will stop and point you somewhere better — at no charge.
                    </p>

                    {/* Statutory Warning Notice */}
                    {Object.values(formData.exclusions).some(Boolean) && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3">
                        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold">Statutory Mediation Ineligibility</p>
                          <p className="leading-relaxed">
                            Under Section 6 read with the First Schedule of The Mediation Act, 2023, mediation cannot legally cover the condition selected above. We will not charge you, and we recommend consulting an advocate for formal court litigation or appropriate tribunal proceedings.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 4: Dispute Summary Review & Payment Schedule */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        DISPUTE SUMMARY &amp; PAYMENT SCHEDULE
                      </span>
                      <span className="font-mono text-xs text-[#4F80E1]">
                        Review &amp; Generate
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#F8FAFC] border border-gray-200/80 p-4 text-xs font-mono">
                      <div>
                        <span className="text-[#64748B]">Claimant:</span>
                        <p className="font-bold text-[#0F172A]">{formData.yourName || 'Claimant Party'}</p>
                        <span className="text-[#64748B] mt-2 block">Contested Amount:</span>
                        <p className="font-bold text-[#0F172A]">₹ {formData.amountInvolved || '0'}</p>
                      </div>
                      <div>
                        <span className="text-[#64748B]">Respondent:</span>
                        <p className="font-bold text-[#0F172A]">{formData.otherName || 'Respondent Party'}</p>
                        <span className="text-[#64748B] mt-2 block">Proceedings Status:</span>
                        <p className="font-bold text-[#0F172A]">{formData.litigationStatus}</p>
                      </div>
                    </div>

                    {/* Tranches Manager */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-[#111827]">
                          Structured Payment Tranches
                        </label>
                        <button
                          type="button"
                          onClick={handleAddTranche}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F80E1] cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                          <span>Add Installment</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {formData.paymentTranches.map((t, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-12 gap-2 items-center rounded-xl bg-[#FAF8F5] border border-gray-200/80 p-3 text-xs"
                          >
                            <div className="col-span-4">
                              <input
                                type="text"
                                value={t.tranche}
                                onChange={(e) => handleTrancheChange(idx, 'tranche', e.target.value)}
                                placeholder="Tranche Name"
                                className="w-full text-xs font-semibold text-[#0F172A] focus:outline-hidden"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="text"
                                value={t.amount}
                                onChange={(e) => handleTrancheChange(idx, 'amount', e.target.value)}
                                placeholder="Amount (e.g. INR 20,00,000)"
                                className="w-full text-xs font-mono text-[#0F172A] focus:outline-hidden"
                              />
                            </div>
                            <div className="col-span-4">
                              <input
                                type="text"
                                value={t.dueDate}
                                onChange={(e) => handleTrancheChange(idx, 'dueDate', e.target.value)}
                                placeholder="Due Date / Milestone"
                                className="w-full text-xs text-[#64748B] focus:outline-hidden"
                              />
                            </div>
                            <div className="col-span-1 text-right">
                              {formData.paymentTranches.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTranche(idx)}
                                  className="text-[#94A3B8] hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Synthesis Trigger Button */}
                    <button
                      type="button"
                      onClick={handleSynthesizeTermSheet}
                      disabled={loading}
                      className="w-full rounded-xl bg-[#283851] hover:bg-[#1E293B] py-3 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="size-4 animate-spin text-[#CAA438]" />
                      ) : (
                        <Gavel className="size-4 text-[#CAA438]" />
                      )}
                      <span>
                        {loading
                          ? 'Synthesizing Enforceable Term Sheet...'
                          : termSheet
                          ? 'Re-Synthesize 5-Part Term Sheet'
                          : 'Build Enforceable 5-Part Term Sheet'}
                      </span>
                    </button>
                  </div>

                  {/* Live Preview Container if Synthesized */}
                  {termSheet && (
                    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-2xs overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#F8FAFC] border-b border-gray-200/80 text-xs">
                        <div className="flex items-center gap-1 rounded-lg bg-[#E2E8F0] p-1">
                          <button
                            type="button"
                            onClick={() => setWizardTab('termSheet')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                              wizardTab === 'termSheet'
                                ? 'bg-white text-[#0F172A] shadow-2xs'
                                : 'text-[#64748B]'
                            }`}
                          >
                            <FileText className="size-3.5 text-[#CAA438]" />
                            <span>5-Part Term Sheet</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setWizardTab('courtApplication')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                              wizardTab === 'courtApplication'
                                ? 'bg-white text-[#0F172A] shadow-2xs'
                                : 'text-[#64748B]'
                            }`}
                          >
                            <Scale className="size-3.5 text-[#CAA438]" />
                            <span>Order XXIII R3 CPC Application</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={wizardTab === 'termSheet' ? handleCopyWizard : handleCopyAppWizard}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] cursor-pointer"
                          >
                            {copiedWizard || copiedAppWizard ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                            <span>{copiedWizard || copiedAppWizard ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      {wizardTab === 'termSheet' && (
                        <div className="p-6 space-y-5">
                          <div className="text-center border-b border-gray-200/80 pb-4">
                            <span className="font-mono text-[10px] font-bold text-[#CAA438] uppercase">
                              S. 27 Mediation Act 2023 · Enforceable Instrument
                            </span>
                            <h3 className="text-lg font-bold font-merriweather text-[#0F172A] uppercase mt-1">
                              {termSheet.title}
                            </h3>
                            <p className="text-xs text-[#64748B] font-mono mt-0.5">
                              {termSheet.governingLaw}
                            </p>
                          </div>

                          <div className="space-y-4">
                            {termSheet.sections?.map((sec, idx) => (
                              <div key={idx} className="border-t border-[#F1F5F9] pt-3.5 first:border-0 first:pt-0">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="font-mono text-xs font-bold text-[#0F172A]">
                                    {sec.index}. {sec.heading}
                                  </span>
                                  {sec.badge && (
                                    <span className="font-mono text-[10px] text-[#CAA438] bg-[#FFFDF5] border border-[#CAA438]/30 px-2 py-0.5 rounded">
                                      {sec.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
                                  {sec.content}
                                </p>
                              </div>
                            ))}
                          </div>

                          {termSheet.executionBlock && (
                            <div className="mt-6 rounded-xl bg-[#F8FAFC] border border-gray-200/80 p-4 font-mono text-[11px] text-[#334155] whitespace-pre-wrap">
                              {termSheet.executionBlock}
                            </div>
                          )}
                        </div>
                      )}

                      {wizardTab === 'courtApplication' && (
                        <div className="p-6">
                          <div className="rounded-xl bg-[#FAF8F5] border border-gray-200/80 p-5 font-mono text-xs text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                            {termSheet.courtApplication}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card 5: Declarations & Affirmations */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        CONFIRMATION &amp; AFFIRMATIONS
                      </span>
                      <span className="font-mono text-xs text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="size-3.5" />
                        <span>Statutory Safeguard</span>
                      </span>
                    </div>

                    <div className="space-y-3.5 pt-1">
                      <label className="flex items-start gap-3 text-xs text-[#334155] cursor-pointer hover:text-[#0F172A] select-none">
                        <input
                          type="checkbox"
                          checked={formData.affirmations.isNeutral}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              affirmations: {
                                ...formData.affirmations,
                                isNeutral: e.target.checked,
                              },
                            })
                          }
                          className="size-4 rounded border-gray-300 text-[#283851] focus:ring-[#283851] cursor-pointer mt-0.5"
                        />
                        <span className="leading-relaxed">
                          I understand the mediator is <strong className="text-[#0F172A] font-semibold underline decoration-gray-400">neutral</strong> and is not acting as my advocate.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 text-xs text-[#334155] cursor-pointer hover:text-[#0F172A] select-none">
                        <input
                          type="checkbox"
                          checked={formData.affirmations.isTrueInfo}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              affirmations: {
                                ...formData.affirmations,
                                isTrueInfo: e.target.checked,
                              },
                            })
                          }
                          className="size-4 rounded border-gray-300 text-[#283851] focus:ring-[#283851] cursor-pointer mt-0.5"
                        />
                        <span className="leading-relaxed">
                          What I have written here is true as far as I know.
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Step 3 Action Buttons */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] cursor-pointer self-start sm:self-auto"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Back</span>
                    </button>

                    <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleFinalSubmit}
                        disabled={
                          !termSheet ||
                          !formData.affirmations.isNeutral ||
                          !formData.affirmations.isTrueInfo ||
                          Object.values(formData.exclusions).some(Boolean)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
                      >
                        <span>Submit dispute &amp; save</span>
                        <Check className="size-4 stroke-[2.5]" />
                      </button>

                      {Object.values(formData.exclusions).some(Boolean) ? (
                        <span className="text-[11px] text-amber-700 font-medium">
                          Cannot submit: Dispute falls under statutory mediation exclusions
                        </span>
                      ) : !termSheet ? (
                        <span className="text-[11px] text-[#64748B]">
                          Synthesize the 5-part term sheet above to enable submission
                        </span>
                      ) : !formData.affirmations.isNeutral || !formData.affirmations.isTrueInfo ? (
                        <span className="text-[11px] text-[#64748B]">
                          Please tick both affirmations to enable submission
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SUBMITTED CONFIRMATION */}
              {step === 4 && (
                <div className="rounded-2xl border border-gray-200/80 bg-white p-8 sm:p-12 text-center shadow-2xs space-y-6">
                  <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                    <Check className="size-8 stroke-[2.5]" />
                  </div>

                  <div>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      {submittedDisputeId}
                    </span>
                    <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#111827]">
                      Dispute Submitted for Mediation
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-[#64748B] max-w-lg mx-auto">
                      Your dispute has been registered for mediation under The Mediation Act, 2023. The assigned mediator will review the case details and initiate confidential outreach to {formData.otherName}.
                    </p>
                  </div>

                  {/* Assigned Mediator & Case Summary Card */}
                  <div className="rounded-xl bg-[#F8FAFC] border border-gray-200/80 p-5 max-w-md mx-auto text-left text-xs space-y-2.5 font-mono">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="text-[#64748B]">Selected Mediator:</span>
                      <span className="font-bold text-[#0F172A]">{formData.selectedMediator.name}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="text-[#64748B]">Chamber / Association:</span>
                      <span className="text-[#0F172A]">{formData.selectedMediator.chamber}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="text-[#64748B]">Session Fee:</span>
                      <span className="font-bold text-emerald-700">{formData.selectedMediator.fee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Statutory Enforceability:</span>
                      <span className="font-bold text-[#283851]">Section 27, Mediation Act 2023</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setView('dashboard');
                        setStep(1);
                        scrollToTop();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#283851] hover:bg-[#1E293B] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <span>View All Your Disputes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors cursor-pointer"
                    >
                      <Printer className="size-4 text-[#64748B]" />
                      <span>Print Document</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky "WHAT HAPPENS NEXT" Card (Step 1 to 3) */}
            {step < 4 && (
              <div className="lg:col-span-4">
                <div className="sticky top-24 lg:top-[148px] rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs space-y-4">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400 block border-b border-gray-100 pb-3">
                    WHAT HAPPENS NEXT
                  </span>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    A neutral mediator reviews your dispute — pick one yourself, or let us assign one.
                  </p>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    They approach the other side directly. You are never asked to contact them yourself.
                  </p>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Anything you both agree to is written up so it can be enforced like a court decree.
                  </p>

                  <p className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-gray-100">
                    Nothing here is shared with the other side until you submit and a mediator is assigned.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW B: DISPUTE INSPECTION DRAWER / FULL PREVIEW         */}
      {/* ========================================================= */}
      {view === 'dashboard' && selectedDispute && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="border-b border-[#E2E8F0] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F80E1] hover:text-[#3B6FD9] mb-3 cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to your disputes</span>
              </button>

              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#CAA438] block">
                Enforceable Settlement Instrument · S. 27 Mediation Act 2023
              </span>
              <h1 className="mt-1 text-2xl font-bold font-merriweather text-[#0F172A]">
                {selectedDispute.disputeType}
              </h1>
              <p className="mt-1 text-xs text-[#64748B] font-mono">
                Dispute ID: {selectedDispute.id} · Logged: {selectedDispute.createdAt}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setView('wizard');
                  setStep(1);
                  scrollToTop();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#283851] hover:bg-[#1E293B] px-3.5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>New Dispute</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
              >
                <Printer className="size-3.5 text-[#64748B]" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Details & Live Tabs Preview */}
          <div className="mt-8 rounded-2xl border border-gray-200/80 bg-white shadow-2xs overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#F8FAFC] border-b border-gray-200/80 text-xs">
              <div className="flex items-center gap-1 rounded-lg bg-[#E2E8F0] p-1">
                <button
                  type="button"
                  onClick={() => setDashboardTab('termSheet')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    dashboardTab === 'termSheet'
                      ? 'bg-white text-[#0F172A] shadow-2xs'
                      : 'text-[#64748B]'
                  }`}
                >
                  <FileText className="size-3.5 text-[#CAA438]" />
                  <span>5-Part Term Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardTab('courtApplication')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    dashboardTab === 'courtApplication'
                      ? 'bg-white text-[#0F172A] shadow-2xs'
                      : 'text-[#64748B]'
                  }`}
                >
                  <Scale className="size-3.5 text-[#CAA438]" />
                  <span>Order XXIII R3 CPC Application</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={dashboardTab === 'termSheet' ? handleCopyDashboard : handleCopyAppDashboard}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] cursor-pointer"
                >
                  {copiedDashboard || copiedAppDashboard ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{copiedDashboard || copiedAppDashboard ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTxt(dashboardTab)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] cursor-pointer"
                >
                  <Download className="size-3.5 text-[#64748B]" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            {dashboardTab === 'termSheet' && (
              <div className="p-6 space-y-5">
                <div className="text-center border-b border-gray-200/80 pb-4">
                  <span className="font-mono text-[10px] font-bold text-[#CAA438] uppercase">
                    S. 27 Mediation Act 2023 · Enforceable Instrument
                  </span>
                  <h3 className="text-lg font-bold font-merriweather text-[#0F172A] uppercase mt-1">
                    {selectedDispute.termSheet.title}
                  </h3>
                  <p className="text-xs text-[#64748B] font-mono mt-0.5">
                    {selectedDispute.termSheet.governingLaw}
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedDispute.termSheet.sections?.map((sec, idx) => (
                    <div key={idx} className="border-t border-[#F1F5F9] pt-3.5 first:border-0 first:pt-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-[#0F172A]">
                          {sec.index}. {sec.heading}
                        </span>
                        {sec.badge && (
                          <span className="font-mono text-[10px] text-[#CAA438] bg-[#FFFDF5] border border-[#CAA438]/30 px-2 py-0.5 rounded">
                            {sec.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedDispute.termSheet.executionBlock && (
                  <div className="mt-6 rounded-xl bg-[#F8FAFC] border border-gray-200/80 p-4 font-mono text-[11px] text-[#334155] whitespace-pre-wrap">
                    {selectedDispute.termSheet.executionBlock}
                  </div>
                )}
              </div>
            )}

            {dashboardTab === 'courtApplication' && (
              <div className="p-6">
                <div className="rounded-xl bg-[#FAF8F5] border border-gray-200/80 p-5 font-mono text-xs text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                  {selectedDispute.termSheet.courtApplication}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW C: DISPUTE DASHBOARD (HOME OF /settlement)            */}
      {/* ========================================================= */}
      {view === 'dashboard' && !selectedDispute && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Eyebrow & Main Title matching writonline.in/settlement */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#4F80E1]">
                OUT-OF-COURT SETTLEMENT
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-sans">
                Your disputes.
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#6B7280]">
                Ask a neutral mediator to help resolve a dispute without going to court.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setView('wizard');
                  setStep(1);
                  scrollToTop();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#283851] hover:bg-[#1E293B] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Settle a dispute</span>
              </button>
            </div>
          </div>

          {/* Empty State Card if no disputes */}
          {disputes.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-8 sm:p-12 text-center shadow-2xs">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#4F80E1] mx-auto">
                <Scale className="size-6 text-[#CAA438]" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#111827]">
                You have not started any disputes yet.
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
                Start by telling us what the dispute is about. We will assign or you can pick a neutral mediator who will approach the other side.
              </p>
              <button
                type="button"
                onClick={() => {
                  setView('wizard');
                  setStep(1);
                  scrollToTop();
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#283851] hover:bg-[#1E293B] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Settle a dispute</span>
              </button>
            </div>
          )}

          {/* List of Disputes */}
          {disputes.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 font-mono px-1">
                <span>{disputes.length} REGISTERED DISPUTES</span>
                <span>SECTION 27 ENFORCEABLE</span>
              </div>

              {disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute)}
                  className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs hover:border-[#283851] hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#4F80E1]">
                          {dispute.id}
                        </span>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          {dispute.status}
                        </span>
                        {dispute.mediatorName && (
                          <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                            Mediator: {dispute.mediatorName} ({dispute.mediatorFee || 'Assigned'})
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-base font-bold text-[#111827]">
                        {dispute.disputeType}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Between <span className="font-semibold text-[#0F172A]">{dispute.partyA}</span> and <span className="font-semibold text-[#0F172A]">{dispute.partyB}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                          Agreed Settlement
                        </span>
                        <span className="text-sm font-bold font-mono text-emerald-700">
                          {dispute.settlementAmount}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDispute(dispute.id, e)}
                        className="rounded-lg p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Dispute"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
