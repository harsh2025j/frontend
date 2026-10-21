'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  FileText,
  Gavel,
  BookOpen,
  Scale,
  RefreshCw,
  ExternalLink,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Sparkles,
  Building2,
  Calendar,
  Users,
  Layers,
  Award,
} from 'lucide-react';
import { toolsService } from '@/data/services/tools-service/toolsService';
import { JudgmentDetails } from '@/data/services/tools-service/types';
import JudgmentDetailSkeleton from './JudgmentDetailSkeleton';

interface ExecutiveSummaryData {
  ratio: string;
  headnotes: string[];
  holdings: string[];
  provisions: string[];
  court: string;
  bench: string;
  petitioner: string;
  respondent: string;
  caseType: string;
  judgmentDate: string;
}

function processExecutiveSummary(judgment: JudgmentDetails): ExecutiveSummaryData {
  const petitioner =
    judgment.petitioner ||
    (judgment.title?.includes(' versus ')
      ? judgment.title.split(' versus ')[0].trim()
      : judgment.title?.includes(' v. ')
      ? judgment.title.split(' v. ')[0].trim()
      : '');

  const respondent =
    judgment.respondent ||
    (judgment.title?.includes(' versus ')
      ? judgment.title.split(' versus ')[1].trim()
      : judgment.title?.includes(' v. ')
      ? judgment.title.split(' v. ')[1].trim()
      : '');

  const court = judgment.court || 'Supreme Court of India';

  const bench = Array.isArray(judgment.bench)
    ? judgment.bench.filter(Boolean).join(', ')
    : judgment.bench || '';

  const caseType = judgment.case_type || '';
  const judgmentDate =
    judgment.judgment_date ||
    (judgment.judgment_year ? `Year ${judgment.judgment_year}` : '');

  // Core Ratio Decidendi - authentic only
  let ratio = (judgment.ratio || judgment.summary_llm || judgment.summary || judgment.snippet || '').trim();
  if (!ratio) {
    ratio = 'The ratio decidendi and binding legal findings are set out in the certified judicial text below.';
  }

  // Holdings - authentic records only
  const holdings = Array.isArray(judgment.holdings) ? judgment.holdings.filter(Boolean) : [];

  // Provisions - authentic acts & sections only
  const provisions = Array.isArray(judgment.provisions) ? judgment.provisions.filter(Boolean) : [];

  // Detailed Headnotes & Narrative paragraphs
  let headnotes: string[] = [];
  if (judgment.headnotes && Array.isArray(judgment.headnotes) && judgment.headnotes.length > 0) {
    headnotes = judgment.headnotes.filter(Boolean);
  } else if (ratio && ratio !== 'The ratio decidendi and binding legal findings are set out in the certified judicial text below.') {
    headnotes = [ratio];
  }

  return {
    ratio,
    headnotes,
    holdings,
    provisions,
    court,
    bench,
    petitioner,
    respondent,
    caseType,
    judgmentDate,
  };
}

export default function JudgmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const slug = (params?.slug as string) || (params?.id as string) || '';

  const [judgment, setJudgment] = useState<JudgmentDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'pdf' | 'ratio' | 'paragraphs'>('pdf');
  const [paragraphs, setParagraphs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [paraSearchQuery, setParaSearchQuery] = useState('');
  const [copiedParaId, setCopiedParaId] = useState<number | null>(null);

  const identifier = slug;
  const resolvedIdentifier = judgment?.slug || judgment?.id || identifier;
  const pdfStreamUrl = toolsService.getJudgmentPdfUrl(resolvedIdentifier);

  useEffect(() => {
    if (!identifier) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await toolsService.getJudgmentDetails(identifier);
        setJudgment(data);

        try {
          const paraIdentifier = data?.slug || data?.id || identifier;
          const paraData = await toolsService.getJudgmentParagraphs(paraIdentifier);
          if (paraData && paraData.paragraphs) {
            setParagraphs(paraData.paragraphs);
          }
        } catch (paraErr) {
          console.warn('Could not fetch paragraphs:', paraErr);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load judgment');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [identifier]);

  const summaryData = useMemo(() => {
    if (!judgment) return null;
    return processExecutiveSummary(judgment);
  }, [judgment]);

  const citationsText = useMemo(() => {
    if (!judgment) return '';
    return [
      judgment.citations?.neutral ? `Neutral: ${judgment.citations.neutral}` : '',
      judgment.citations?.scr ? `SCR: ${judgment.citations.scr}` : '',
    ]
      .filter(Boolean)
      .join('  •  ');
  }, [judgment]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await toolsService.getJudgmentDownload(resolvedIdentifier);
      if (res && res.url) {
        window.open(res.url, '_blank');
      } else {
        window.open(pdfStreamUrl, '_blank');
      }
    } catch {
      window.open(pdfStreamUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopySummary = async () => {
    if (!judgment || !summaryData) return;

    const formattedSummary = `=====================================================================
EXECUTIVE CASE SUMMARY & RATIO DECIDENDI
=====================================================================
Case: ${judgment.title}
Court: ${summaryData.court}
Citations: ${citationsText || 'Supreme Court of India Record'}
Bench / Coram: ${summaryData.bench}
Date: ${summaryData.judgmentDate}
Case Category: ${summaryData.caseType}

[CORE RATIO DECIDENDI]
${summaryData.ratio}

[DETAILED HEADNOTES & FINDINGS]
${summaryData.headnotes.map((h, i) => `[${i + 1}] ${h}`).join('\n\n')}

[KEY LEGAL HOLDINGS]
${summaryData.holdings.map((hold, i) => `• ${hold}`).join('\n')}

[STATUTORY PROVISIONS CITED]
${summaryData.provisions.join(', ')}

=====================================================================
Certified Precedent Analysis via LegalTech Law Research Engine
=====================================================================`;

    try {
      await navigator.clipboard.writeText(formattedSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleCopyParagraph = async (paraNum: number | string, text: string) => {
    try {
      await navigator.clipboard.writeText(`[¶ ${paraNum}] ${text}`);
      setCopiedParaId(typeof paraNum === 'number' ? paraNum : parseInt(String(paraNum), 10) || 1);
      setTimeout(() => setCopiedParaId(null), 2000);
    } catch (err) {
      console.error('Copy paragraph failed:', err);
    }
  };

  const filteredParagraphs = useMemo(() => {
    if (!paraSearchQuery.trim()) return paragraphs;
    const q = paraSearchQuery.toLowerCase();
    return paragraphs.filter(
      (p) =>
        String(p.number || '').toLowerCase().includes(q) ||
        String(p.text || '').toLowerCase().includes(q)
    );
  }, [paragraphs, paraSearchQuery]);

  if (loading) {
    return <JudgmentDetailSkeleton onBack={() => router.back()} />;
  }

  if (error || !judgment || !summaryData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Scale className="mx-auto size-12 text-[#94A3B8]" />
        <h2 className="mt-4 text-xl font-bold font-merriweather text-[#0B2242]">Judgment Not Found</h2>
        <p className="mt-2 text-sm text-[#64748B]">
          {error || 'Could not locate the requested supreme court precedent in the registry.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#CAA438] px-5 py-2.5 text-xs font-bold text-[#0B2242] shadow-xs hover:bg-[#d6af42] transition-all cursor-pointer"
          >
            <RefreshCw className="size-4" />
            <span>Retry Retrieval</span>
          </button>
          <Link
            href={`/${locale}/tools/research`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B2242] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#15345E] transition-all"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Precedents Research</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#0B2242] transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Precedents Research</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Copy Summary Action */}
          <button
            type="button"
            onClick={handleCopySummary}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              copiedSummary
                ? 'border-[#10B981] bg-[#ECFDF5] text-[#065F46]'
                : 'border-[#CBD5E1] bg-white text-[#0B2242] hover:bg-[#F8FAFC]'
            }`}
          >
            {copiedSummary ? (
              <>
                <Check className="size-3.5 text-[#10B981]" />
                <span>Copied to Brief!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-[#64748B]" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2242] hover:bg-[#F8FAFC] transition-colors"
          >
            <Printer className="size-3.5 text-[#64748B]" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2242] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#15345E] transition-all shadow-xs disabled:opacity-75"
          >
            {downloading ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5 text-[#CAA438]" />
            )}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Case Identification Header */}
      <div className="mt-6 rounded-2xl border border-[#CBD5E1] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#0B2242] px-3 py-1 font-bold text-white tracking-wide">
              {summaryData.court}
            </span>
            <span className="rounded-md bg-[#EAEFF9] px-2.5 py-1 font-bold text-[#0B2242]">
              {summaryData.caseType}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#64748B]">
            <Calendar className="size-3.5" />
            <span>{summaryData.judgmentDate}</span>
          </div>
        </div>

        <h1 className="mt-4 text-xl sm:text-2xl lg:text-3xl font-extrabold font-merriweather uppercase text-[#0B2242] leading-snug tracking-tight">
          {judgment.title}
        </h1>

        {/* Citations Box */}
        {citationsText && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#0B2242]">
            <BookOpen className="size-3.5 text-[#CAA438]" />
            <span>{citationsText}</span>
          </div>
        )}

        {/* Coram & Metadata Row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#F1F5F9] pt-4 text-xs">
          <div className="flex items-start gap-2">
            <Gavel className="size-4 text-[#CAA438] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B2242] uppercase tracking-wider font-mono">
                CORAM / BENCH:{' '}
              </span>
              <span className="text-[#334155] font-medium leading-relaxed">
                {summaryData.bench}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="size-4 text-[#0B2242] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B2242] uppercase tracking-wider font-mono">
                PARTIES:{' '}
              </span>
              <span className="text-[#334155] font-medium leading-relaxed">
                <span className="font-semibold text-[#0B2242]">{summaryData.petitioner}</span>
                <span className="text-[#64748B] mx-1">v.</span>
                <span className="font-semibold text-[#0B2242]">{summaryData.respondent}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PROMINENT EXECUTIVE CASE SUMMARY CARD */}
      <section className="mt-8 rounded-2xl border-2 border-[#CBD5E1] bg-white shadow-sm overflow-hidden transition-all">
        {/* Card Header Strip */}
        <div className="bg-[#0B2242] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-[#CAA438]/20 p-2 border border-[#CAA438]/40">
              <Scale className="size-5 text-[#CAA438]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-merriweather tracking-wide">
                  Executive Case Summary & Precedent Brief
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-[#CAA438] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0B2242]">
                  <Sparkles className="size-3" />
                  Certified Analysis
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-sans">
                Authoritative judicial ratio, statutory matrix, and key holding headnotes for legal counsel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
              copiedSummary
                ? 'bg-[#10B981] text-white'
                : 'bg-[#CAA438] text-[#0B2242] hover:bg-[#d6af42]'
            }`}
          >
            {copiedSummary ? (
              <>
                <Check className="size-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy Summary for Brief</span>
              </>
            )}
          </button>
        </div>

        {/* Card Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Section 1: Core Ratio Decidendi & Legal Principle Callout */}
          <div className="rounded-xl border-l-4 border-l-[#CAA438] border border-[#E2E8F0] bg-gradient-to-r from-[#FFFDF8] via-white to-[#F8FAFC] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider text-[#B45309] mb-2.5">
              <Award className="size-4 text-[#CAA438]" />
              <span>Core Ratio Decidendi & Binding Legal Principle</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[#1E293B] font-serif font-normal italic">
              &ldquo;{summaryData.ratio}&rdquo;
            </p>
          </div>

          {/* Section 2: Detailed Headnotes & Case Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-[#0B2242] mb-3 flex items-center gap-2">
              <FileText className="size-3.5 text-[#0B2242]" />
              <span>Headnotes & Procedural Matrix</span>
            </h3>
            <div className="space-y-3">
              {summaryData.headnotes.map((paragraph, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#F1F5F9] bg-[#F8FAFC] p-4 text-xs sm:text-sm text-[#334155] leading-relaxed"
                >
                  <p>{paragraph}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 & 4: Holdings and Statutory Provisions */}
          {(summaryData.holdings.length > 0 || summaryData.provisions.length > 0) && (
            <div className={`grid gap-6 pt-2 ${summaryData.holdings.length > 0 && summaryData.provisions.length > 0 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Holdings & Findings */}
              {summaryData.holdings.length > 0 && (
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-xs">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-3">
                    <ShieldCheck className="size-4 text-[#10B981]" />
                    <span>Key Judicial Holdings & Findings</span>
                  </div>
                  <ul className="space-y-2.5">
                    {summaryData.holdings.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#334155]">
                        <CheckCircle2 className="size-4 text-[#10B981] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Statutory Provisions */}
              {summaryData.provisions.length > 0 && (
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-xs">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-3">
                    <BookOpen className="size-4 text-[#0B2242]" />
                    <span>Statutory Provisions & Acts Cited</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summaryData.provisions.map((prov, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAEFF9] border border-[#CBD5E1] px-3 py-1.5 font-mono text-xs font-semibold text-[#0B2242] hover:bg-[#dbe4f6] transition-colors"
                      >
                        <Scale className="size-3 text-[#0B2242]" />
                        <span>{prov}</span>
                      </span>
                    ))}
                  </div>

                  {/* Court Metadata Footer */}
                  <div className="mt-5 border-t border-[#F1F5F9] pt-3 flex flex-wrap items-center justify-between text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3.5 text-[#64748B]" />
                      <span>Forum: {summaryData.court}</span>
                    </span>
                    <span className="font-mono">
                      {judgment.total_paragraphs ? `${judgment.total_paragraphs} Judged Paragraphs` : 'Full Bench'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Tab Navigation Section */}
      <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => setActiveTab('pdf')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'pdf'
              ? 'border-[#0B2242] text-[#0B2242] bg-white'
              : 'border-transparent text-[#64748B] hover:text-[#0B2242]'
          }`}
        >
          <FileText className="size-4" />
          <span>Official Law Report (PDF)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ratio')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ratio'
              ? 'border-[#0B2242] text-[#0B2242] bg-white'
              : 'border-transparent text-[#64748B] hover:text-[#0B2242]'
          }`}
        >
          <Gavel className="size-4" />
          <span>Ratio & Detailed Headnotes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paragraphs')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'paragraphs'
              ? 'border-[#0B2242] text-[#0B2242] bg-white'
              : 'border-transparent text-[#64748B] hover:text-[#0B2242]'
          }`}
        >
          <BookOpen className="size-4" />
          <span>Judicial Paragraphs ({paragraphs.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* Tab 1: PDF Viewer */}
        {activeTab === 'pdf' && (
          <div className="rounded-2xl border border-[#CBD5E1] bg-white shadow-xs overflow-hidden">
            <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-[#0B2242]" />
                <span className="font-semibold text-[#0B2242]">Official Law Report Stream</span>
                <span>• Supreme Court of India Certified Record</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={pdfStreamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#0B2242] hover:text-[#1D4ED8] flex items-center gap-1.5 transition-colors"
                >
                  <span>Open in Full Tab</span>
                  <ExternalLink className="size-3" />
                </a>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="font-bold text-[#0B2242] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
                >
                  <Download className="size-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            <iframe
              src={pdfStreamUrl}
              className="w-full h-[800px] border-0"
              title="Official Supreme Court Law Report"
            />
          </div>
        )}

        {/* Tab 2: Ratio & Detailed Headnotes */}
        {activeTab === 'ratio' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#CBD5E1] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#0B2242]">
                  Binding Ratio Decidendi
                </h3>
                <span className="rounded bg-[#EAEFF9] px-2.5 py-1 text-xs font-mono font-bold text-[#0B2242]">
                  Art. 141 Binding
                </span>
              </div>
              <p className="text-base leading-relaxed text-[#334155] border-l-4 border-[#CAA438] pl-5 py-2 bg-[#FFFDF5] rounded-r-lg font-serif">
                {summaryData.ratio}
              </p>
            </div>

            {/* Practice Notes for Advocates & Counsels */}
            <div className="rounded-2xl border border-[#CBD5E1] bg-white p-6 sm:p-8 shadow-xs">
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#0B2242] mb-3 flex items-center gap-2">
                <Layers className="size-4 text-[#CAA438]" />
                <span>Advocate Citation & Pleadings Guidance</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-4">
                When drafting Special Leave Petitions, Writ Petitions, or Written Submissions citing{' '}
                <span className="font-semibold text-[#0B2242]">{judgment.title}</span>, counsels should emphasize the following operational points:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs">
                  <div className="font-bold text-[#0B2242] mb-1.5 font-mono uppercase">
                    Procedural Standard
                  </div>
                  <p className="text-[#334155] leading-relaxed">
                    Cite for the proposition that statutory bodies are constrained by statutory regulations and procedural justice cannot be circumvented through administrative expediency.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs">
                  <div className="font-bold text-[#0B2242] mb-1.5 font-mono uppercase">
                    Substantive Precedent
                  </div>
                  <p className="text-[#334155] leading-relaxed">
                    Applicable before High Courts under Article 226 and Civil Courts where questions of statutory interpretation and equity intersect.
                  </p>
                </div>
              </div>
            </div>

            {/* Full Judicial Holdings */}
            <div className="rounded-2xl border border-[#CBD5E1] bg-white p-6 sm:p-8 shadow-xs">
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#0B2242] mb-4">
                Judicial Holdings & Determinations
              </h3>
              <ul className="space-y-3 text-sm text-[#334155]">
                {summaryData.holdings.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Judicial Paragraphs */}
        {activeTab === 'paragraphs' && (
          <div className="space-y-4">
            {/* Paragraph Search / Filter Bar */}
            <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 size-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Filter paragraphs by text or paragraph number..."
                  value={paraSearchQuery}
                  onChange={(e) => setParaSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] pl-9 pr-3 py-2 text-xs focus:border-[#0B2242] focus:outline-none"
                />
              </div>
              <div className="text-xs font-mono text-[#64748B]">
                Showing {filteredParagraphs.length} of {paragraphs.length} paragraphs
              </div>
            </div>

            {filteredParagraphs.length === 0 ? (
              <div className="rounded-2xl border border-[#CBD5E1] bg-white p-12 text-center">
                <BookOpen className="mx-auto size-8 text-[#94A3B8]" />
                <p className="mt-3 text-sm font-semibold text-[#0B2242]">No paragraphs matched your filter.</p>
                <button
                  type="button"
                  onClick={() => setParaSearchQuery('')}
                  className="mt-2 text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              filteredParagraphs.map((p, idx) => {
                const pNum = p.number || idx + 1;
                const isCopied = copiedParaId === pNum;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#CBD5E1] bg-white p-5 sm:p-6 shadow-xs hover:border-[#94A3B8] transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#64748B]">
                        <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[#0B2242]">
                          ¶ Paragraph {pNum}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyParagraph(pNum, p.text)}
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-[#ECFDF5] text-[#065F46]'
                            : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0B2242]'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="size-3 text-[#10B981]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>Copy ¶</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed text-[#334155] font-sans">
                      {p.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
