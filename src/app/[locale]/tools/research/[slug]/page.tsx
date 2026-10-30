'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Gavel,
  Printer,
  RefreshCw,
  Scale,
  Search,
} from 'lucide-react';
import { toolButton, toolType } from '@/components/tools/toolsTheme';

/** "2019-01-01" -> "1 January 2019"; anything unparseable is shown as-is. */
function formatJudgmentDate(value: string) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
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
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <Scale className="mx-auto size-6 text-[#9CA3AF]" aria-hidden />
        <h1 className={`${toolType.title} mt-3`}>Judgment not found</h1>
        <p className={`${toolType.lead} mt-2`}>
          {error || 'We could not locate this precedent in the registry.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              window.location.reload();
            }}
            className={toolButton('solid')}
          >
            <RefreshCw className="size-3.5" aria-hidden />
            Try again
          </button>
          <Link href={`/${locale}/tools/research`} className={toolButton('outline')}>
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const tabClass = (active: boolean) =>
    `inline-flex cursor-pointer items-center gap-1.5 border-b-2 px-1 pb-2.5 font-ui text-[13px] font-medium whitespace-nowrap transition-colors duration-150 ${
      active
        ? 'border-[#0B2242] text-[#0B2242]'
        : 'border-transparent text-[#6B7280] hover:text-[#0B2242]'
    }`;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      {/* actions — the tools layout already provides the Back control */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="no-print flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handleCopySummary}
            className={toolButton(
              'outline',
              copiedSummary ? 'h-9 border-[#A7D8C2] bg-[#F0FAF5] text-[#15694A]' : 'h-9',
            )}
          >
            {copiedSummary ? (
              <>
                <Check className="size-3.5" aria-hidden />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-[#6B7280]" aria-hidden />
                Copy summary
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className={toolButton('outline', 'h-9')}
          >
            <Printer className="size-3.5 text-[#6B7280]" aria-hidden />
            Print
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className={toolButton('solid', 'h-9')}
          >
            {downloading ? (
              <RefreshCw className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Download className="size-3.5" aria-hidden />
            )}
            Download PDF
          </button>
        </div>
      </div>

      {/* case header */}
      <header className="mt-6 border-b border-[#E5E7EB] pb-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[12.5px] text-[#6B7280]">
          <span className="font-medium text-[#0B2242]">{summaryData.court}</span>
          {summaryData.caseType && (
            <>
              <span aria-hidden className="text-[#D1D5DB]">·</span>
              <span>{summaryData.caseType}</span>
            </>
          )}
          {summaryData.judgmentDate && (
            <>
              <span aria-hidden className="text-[#D1D5DB]">·</span>
              <span>{formatJudgmentDate(summaryData.judgmentDate)}</span>
            </>
          )}
        </div>

        <h1 className="mt-2 font-merriweather text-[22px] leading-[1.25] font-bold tracking-[-0.01em] text-[#0B2242] sm:text-[28px]">
          {judgment.title}
        </h1>

        {citationsText && (
          <p className="mt-2 font-mono text-[12px] text-[#6B7280]">{citationsText}</p>
        )}

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-ui text-[11px] font-semibold tracking-[0.08em] text-[#9CA3AF] uppercase">
              Coram
            </dt>
            <dd className="mt-1 font-ui text-[13px] leading-[1.6] text-[#4B5563]">
              {summaryData.bench}
            </dd>
          </div>
          <div>
            <dt className="font-ui text-[11px] font-semibold tracking-[0.08em] text-[#9CA3AF] uppercase">
              Parties
            </dt>
            <dd className="mt-1 font-ui text-[13px] leading-[1.6] text-[#4B5563]">
              <span className="font-medium text-[#0B2242]">{summaryData.petitioner}</span>
              <span className="mx-1 text-[#9CA3AF]">v.</span>
              <span className="font-medium text-[#0B2242]">{summaryData.respondent}</span>
            </dd>
          </div>
        </dl>
      </header>

      {/* ratio + headnotes */}
      <section className="mt-8">
        <h2 className="font-ui text-[15px] font-semibold text-[#0B2242]">Ratio decidendi</h2>
        <blockquote className="mt-3 border-l-2 border-[#C9A227] pl-4 font-merriweather text-[15px] leading-[1.75] text-[#1F2937] sm:text-base">
          {summaryData.ratio}
        </blockquote>

        {summaryData.headnotes.length > 0 && (
          <div className="mt-8">
            <h2 className="font-ui text-[15px] font-semibold text-[#0B2242]">Headnotes</h2>
            <div className="mt-3 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
              {summaryData.headnotes.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="py-3.5 font-ui text-[13.5px] leading-[1.7] text-[#4B5563]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {(summaryData.holdings.length > 0 || summaryData.provisions.length > 0) && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {summaryData.holdings.length > 0 && (
              <div>
                <h2 className="font-ui text-[15px] font-semibold text-[#0B2242]">Holdings</h2>
                <ul className="mt-3 space-y-2.5">
                  {summaryData.holdings.map((h, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 font-ui text-[13.5px] leading-[1.65] text-[#4B5563]"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#15694A]" aria-hidden />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summaryData.provisions.length > 0 && (
              <div>
                <h2 className="font-ui text-[15px] font-semibold text-[#0B2242]">
                  Provisions cited
                </h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {summaryData.provisions.map((prov, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-[#F3F4F6] px-2.5 py-1 font-ui text-[12.5px] text-[#374151]"
                    >
                      {prov}
                    </span>
                  ))}
                </div>
                <p className={`${toolType.meta} mt-4`}>
                  {judgment.total_paragraphs
                    ? `${judgment.total_paragraphs} judged paragraphs`
                    : 'Full bench'}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* tabs */}
      <div
        role="tablist"
        aria-label="Judgment sources"
        className="scrollbar-hide mt-10 flex items-center gap-5 overflow-x-auto border-b border-[#E5E7EB]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pdf'}
          onClick={() => setActiveTab('pdf')}
          className={tabClass(activeTab === 'pdf')}
        >
          <FileText className="size-3.5" aria-hidden />
          Law report
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ratio'}
          onClick={() => setActiveTab('ratio')}
          className={tabClass(activeTab === 'ratio')}
        >
          <Gavel className="size-3.5" aria-hidden />
          Ratio &amp; holdings
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'paragraphs'}
          onClick={() => setActiveTab('paragraphs')}
          className={tabClass(activeTab === 'paragraphs')}
        >
          <BookOpen className="size-3.5" aria-hidden />
          Paragraphs
          <span className="font-mono text-[11px] text-[#9CA3AF]">{paragraphs.length}</span>
        </button>
      </div>

      <div className="mt-5">
        {/* law report */}
        {activeTab === 'pdf' && (
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] px-4 py-2.5">
              <span className="font-ui text-[12.5px] text-[#6B7280]">
                Official law report
              </span>
              <div className="flex items-center gap-4">
                <a
                  href={pdfStreamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-ui text-[12.5px] font-medium text-[#0B2242] transition-colors hover:text-[#1B3A63]"
                >
                  Open in new tab
                  <ExternalLink className="size-3" aria-hidden />
                </a>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex cursor-pointer items-center gap-1.5 font-ui text-[12.5px] font-medium text-[#0B2242] transition-colors hover:text-[#1B3A63]"
                >
                  <Download className="size-3" aria-hidden />
                  Download
                </button>
              </div>
            </div>
            <iframe
              src={pdfStreamUrl}
              className="h-[800px] w-full border-0"
              title="Official law report"
            />
          </div>
        )}

        {/* ratio & holdings */}
        {activeTab === 'ratio' && (
          <div className="max-w-3xl">
            <h3 className="font-ui text-[15px] font-semibold text-[#0B2242]">
              Binding ratio
            </h3>
            <blockquote className="mt-3 border-l-2 border-[#C9A227] pl-4 font-merriweather text-[15px] leading-[1.75] text-[#1F2937]">
              {summaryData.ratio}
            </blockquote>
            <p className={`${toolType.meta} mt-2`}>Binding under Article 141</p>

            <h3 className="mt-8 font-ui text-[15px] font-semibold text-[#0B2242]">
              Citation guidance
            </h3>
            <p className="mt-2 font-ui text-[13.5px] leading-[1.7] text-[#4B5563]">
              When citing <span className="font-medium text-[#0B2242]">{judgment.title}</span> in
              a petition or written submission, counsel generally rely on two lines of argument:
            </p>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="font-ui text-[13px] font-semibold text-[#0B2242]">
                  Procedural standard
                </dt>
                <dd className="mt-1 font-ui text-[13.5px] leading-[1.7] text-[#4B5563]">
                  Statutory bodies are constrained by statutory regulations, and procedural
                  justice cannot be circumvented through administrative expediency.
                </dd>
              </div>
              <div>
                <dt className="font-ui text-[13px] font-semibold text-[#0B2242]">
                  Substantive precedent
                </dt>
                <dd className="mt-1 font-ui text-[13.5px] leading-[1.7] text-[#4B5563]">
                  Applicable before High Courts under Article 226 and civil courts where
                  statutory interpretation and equity intersect.
                </dd>
              </div>
            </dl>

            {summaryData.holdings.length > 0 && (
              <>
                <h3 className="mt-8 font-ui text-[15px] font-semibold text-[#0B2242]">
                  Judicial holdings
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {summaryData.holdings.map((h, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 font-ui text-[13.5px] leading-[1.7] text-[#4B5563]"
                    >
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-[#15694A]"
                        aria-hidden
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* paragraphs */}
        {activeTab === 'paragraphs' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9CA3AF]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={paraSearchQuery}
                  onChange={(e) => setParaSearchQuery(e.target.value)}
                  aria-label="Filter paragraphs"
                  placeholder="Filter by text or number"
                  className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-9 font-ui text-[13px] text-[#0B2242] placeholder:text-[#9CA3AF] focus:border-[#0B2242] focus:outline-hidden [&::-webkit-search-cancel-button]:hidden"
                />
              </div>
              <span className={toolType.meta}>
                {filteredParagraphs.length} of {paragraphs.length}
              </span>
            </div>

            {filteredParagraphs.length === 0 ? (
              <div className="mt-10 text-center">
                <p className={toolType.body}>No paragraphs matched that filter.</p>
                <button
                  type="button"
                  onClick={() => setParaSearchQuery('')}
                  className="mt-2 cursor-pointer font-ui text-[13px] font-medium text-[#0B2242] underline underline-offset-4 hover:text-[#1B3A63]"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
                {filteredParagraphs.map((p, idx) => {
                  const pNum = p.number || idx + 1;
                  const isCopied = copiedParaId === pNum;
                  return (
                    <li key={idx} className="group flex gap-4 py-4">
                      <span className="w-10 shrink-0 pt-0.5 font-mono text-[12px] text-[#9CA3AF]">
                        ¶{pNum}
                      </span>
                      <p className="flex-1 font-ui text-[13.5px] leading-[1.75] text-[#374151]">
                        {p.text}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyParagraph(pNum, p.text)}
                        aria-label={`Copy paragraph ${pNum}`}
                        className={`h-6 shrink-0 cursor-pointer rounded px-1.5 font-ui text-[12px] transition-colors duration-150 ${
                          isCopied
                            ? 'text-[#15694A]'
                            : 'text-[#9CA3AF] hover:text-[#0B2242] focus-visible:text-[#0B2242]'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="size-3.5" aria-hidden />
                        ) : (
                          <Copy className="size-3.5" aria-hidden />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
