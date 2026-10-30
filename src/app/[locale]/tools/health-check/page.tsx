'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Upload,
  RefreshCw,
  ShieldCheck,
  FileText,
  ChevronRight,
  Sparkles,
  Download,
  Trash2,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  AlertCircle,
  FolderOpen,
  Search,
} from 'lucide-react';
import { toolsService } from '@/data/services/tools-service/toolsService';
import { HealthCheckReport, HealthCheckFinding } from '@/data/services/tools-service/types';


import { toolButton, toolType } from '@/components/tools/toolsTheme';
const AUDIT_STAGES = [
  {
    step: 1,
    title: 'Document Ingestion & Structural Tokenization',
    desc: 'Extracting recitals, party representations, definitions, and operative covenants from stream...',
  },
  {
    step: 2,
    title: 'Layer 1: Statutory Compliance Scan',
    desc: 'Auditing Indian Contract Act (Sec 27/28), Stamp Act (Sec 35 admissibility), and Registration Act (Sec 17)...',
  },
  {
    step: 3,
    title: 'Layer 2: Commercial Risk & Exposure Evaluation',
    desc: 'Scanning for uncapped indemnities, aggregate liability ceilings, and unilateral termination traps...',
  },
  {
    step: 4,
    title: 'Layer 3: Dispute Resolution & Enforceability',
    desc: 'Validating Arbitration Seat vs. Venue under Hardy Exploration doctrine and Mediation Act 2023...',
  },
  {
    step: 5,
    title: 'Synthesizing Redline Corrections & 100-Point Score',
    desc: 'Drafting court-tested replacement clauses and generating counsel revision checklist...',
  },
];

export default function DocumentHealthCheckPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [copiedSearchId, setCopiedSearchId] = useState<string | null>(null);

  // Mutually Exclusive Mode: 'text' OR 'file'
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<HealthCheckReport | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LAYER1' | 'LAYER2' | 'LAYER3'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [copiedChecklistIdx, setCopiedChecklistIdx] = useState<number | null>(null);
  const [copiedAllChecklist, setCopiedAllChecklist] = useState<boolean>(false);

  // Real-time Progress & Countdown State
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState(12);
  const [secondsRemaining, setSecondsRemaining] = useState(12);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const switchMode = (mode: 'text' | 'file') => {
    setInputMode(mode);
    setReport(null);
    if (mode === 'file') {
      // When switching to file mode: strictly clear text so only file is evaluated
      setInputText('');
    } else {
      // When switching to text mode: strictly clear file so only text is evaluated
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setInputMode('file');
      setInputText(''); // Mutually exclusive: strictly clear text when file is selected
      setReport(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAudit = async () => {
    const isFileMode = inputMode === 'file';

    if (isFileMode && !selectedFile) {
      alert('Please upload a document file (PDF, DOCX, DOC, or TXT) to audit');
      return;
    }
    if (!isFileMode && !inputText.trim()) {
      alert('Please enter or paste legal text to audit');
      return;
    }

    // Mutually exclusive payloads:
    // If file mode: send ONLY file, text is strictly undefined
    // If text mode: send ONLY text, file is strictly undefined
    const textToSend = isFileMode ? undefined : inputText.trim();
    const fileToSend = isFileMode ? selectedFile : undefined;

    // Calculate dynamic estimated processing time
    const charLen = textToSend ? textToSend.length : 0;
    let estSec = 10;
    if (fileToSend && fileToSend.size > 2 * 1024 * 1024) {
      estSec = 28;
    } else if (fileToSend) {
      estSec = 16;
    } else if (charLen > 80000) {
      estSec = 26;
    } else if (charLen > 30000) {
      estSec = 20;
    } else if (charLen > 8000) {
      estSec = 14;
    } else if (charLen > 2000) {
      estSec = 10;
    } else {
      estSec = 7;
    }

    setEstimatedSeconds(estSec);
    setSecondsRemaining(estSec);
    setProgressPercent(4);
    setCurrentStageIndex(0);
    setLoading(true);
    setReport(null);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const elapsedSec = elapsedMs / 1000;

      let pct = 4;
      if (elapsedSec <= estSec) {
        const fraction = elapsedSec / estSec;
        pct = Math.min(92, Math.max(4, Math.round(fraction * 92)));
        setSecondsRemaining(Math.max(1, Math.round(estSec - elapsedSec)));
      } else {
        // If processing takes slightly longer, smoothly creep from 92% to 98%
        const extraSec = elapsedSec - estSec;
        pct = Math.min(98, 92 + Math.round((1 - Math.exp(-extraSec / 6)) * 6));
        setSecondsRemaining(0);
      }
      setProgressPercent(pct);

      if (pct < 20) {
        setCurrentStageIndex(0);
      } else if (pct < 45) {
        setCurrentStageIndex(1);
      } else if (pct < 70) {
        setCurrentStageIndex(2);
      } else if (pct < 88) {
        setCurrentStageIndex(3);
      } else {
        setCurrentStageIndex(4);
      }
    }, 250);

    try {
      const res = await toolsService.checkDocumentHealth(textToSend, fileToSend || undefined);
      if (timerRef.current) clearInterval(timerRef.current);
      setProgressPercent(100);
      setCurrentStageIndex(4);
      setSecondsRemaining(0);

      // Brief 350ms pause so user visually sees 100% completion before report appears
      setTimeout(() => {
        setReport(res);
        setLoading(false);
      }, 350);
    } catch (err: any) {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
      alert('Audit error: ' + (err.message || 'Failed to complete document audit'));
    }
  };

  const copyClause = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const applyClauseReplacement = (finding: HealthCheckFinding) => {
    const replacement = finding.correctedClause || finding.recommendation;
    if (!replacement) return;

    // If currently in file mode, smoothly transition to text editor mode so user can see and edit the corrected text!
    if (inputMode === 'file') {
      const baseText = report?.extractedText || '';
      setInputMode('text');
      setSelectedFile(null);
      if (
        finding.flaggedSnippet &&
        finding.flaggedSnippet !== 'Clause omitted' &&
        finding.flaggedSnippet !== 'Clause omitted from document' &&
        baseText.includes(finding.flaggedSnippet)
      ) {
        setInputText(baseText.replace(finding.flaggedSnippet, replacement));
      } else {
        setInputText(`${baseText.trim()}\n\n/* REPLACED: ${finding.category} */\n${replacement}`);
      }
      setAppliedId(finding.id);
      setTimeout(() => setAppliedId(null), 2500);
      return;
    }

    if (
      finding.flaggedSnippet &&
      finding.flaggedSnippet !== 'Clause omitted' &&
      finding.flaggedSnippet !== 'Clause omitted from document' &&
      inputText.includes(finding.flaggedSnippet)
    ) {
      setInputText((prev) => prev.replace(finding.flaggedSnippet!, replacement));
      setAppliedId(finding.id);
      setTimeout(() => setAppliedId(null), 2500);
    } else {
      setInputText((prev) => `${prev.trim()}\n\n/* REPLACED: ${finding.category} */\n${replacement}`);
      setAppliedId(finding.id);
      setTimeout(() => setAppliedId(null), 2500);
    }
  };

  const copyChecklistItem = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedChecklistIdx(idx);
    setTimeout(() => setCopiedChecklistIdx(null), 2000);
  };

  const copyAllChecklistItems = () => {
    if (!report?.revisionChecklist) return;
    const formatted = report.revisionChecklist.map((item, i) => `${i + 1}. ${item}`).join('\n');
    navigator.clipboard.writeText(formatted);
    setCopiedAllChecklist(true);
    setTimeout(() => setCopiedAllChecklist(false), 2000);
  };

  const copySearchSnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSearchId(id);
    setTimeout(() => setCopiedSearchId(null), 2000);
  };


  const exportReport = () => {
    if (!report) return;

    const lines: string[] = [
      `# LEGAL DOCUMENT HEALTH CHECK REPORT`,
      `Document Title: ${report.documentTitle || 'Legal Document Under Review'}`,
      `Health Score: ${report.healthScore} / 100 (${report.riskLevel})`,
      `Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`,
      ``,
      `## EXECUTIVE ASSESSMENT`,
      report.documentSummary || 'Legal risk and statutory compliance evaluation conducted under Indian law.',
      ``,
      `## 3-LAYER AUDIT BREAKDOWN`,
      `- Layer 1 (Statutory & Procedural Compliance): ${report.layerScores?.layer1Score ?? 'Evaluated'} / 100`,
      `- Layer 2 (Commercial Risk & Liability Exposure): ${report.layerScores?.layer2Score ?? 'Evaluated'} / 100`,
      `- Layer 3 (Dispute Resolution & Enforceability): ${report.layerScores?.layer3Score ?? 'Evaluated'} / 100`,
      ``,
      `## FINDINGS & VULNERABILITY AUDIT (${report.findings?.length || 0})`,
    ];

    report.findings?.forEach((f, i) => {
      lines.push(`### ${i + 1}. [${f.priority} PRIORITY] ${f.category} (${f.clauseReference || 'Document Scope'})`);
      lines.push(`- Issue: ${f.issue}`);
      if (f.flaggedSnippet) lines.push(`- Problematic Clause in Text: "${f.flaggedSnippet}"`);
      lines.push(`- Statutory Consequence: ${f.implication}`);
      lines.push(`- Counsel Recommendation: ${f.recommendation}`);
      if (f.correctedClause) {
        lines.push(`- Court-Tested Replacement Clause: \n  ${f.correctedClause}`);
      }
      lines.push(``);
    });

    if (report.statutoryChecklist && report.statutoryChecklist.length > 0) {
      lines.push(`## STATUTORY COMPLIANCE CHECKLIST`);
      report.statutoryChecklist.forEach((s) => {
        lines.push(`- [${s.compliance}] ${s.statute}: ${s.notes}`);
      });
      lines.push(``);
    }

    if (report.revisionChecklist && report.revisionChecklist.length > 0) {
      lines.push(`## COUNSEL REVISION CHECKLIST`);
      report.revisionChecklist.forEach((item, idx) => {
        lines.push(`- [ ] ${item}`);
      });
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Legal_Health_Check_${(report.documentTitle || 'Report').replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFindings = (report?.findings || []).filter((f) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'HIGH') return f.priority === 'HIGH';
    if (activeFilter === 'MEDIUM') return f.priority === 'MEDIUM';
    if (activeFilter === 'LOW') return f.priority === 'LOW';
    if (activeFilter === 'LAYER1') return f.layer?.includes('Layer 1') || f.category?.includes('Statutory') || f.category?.includes('Restraint');
    if (activeFilter === 'LAYER2') return f.layer?.includes('Layer 2') || f.category?.includes('Liability') || f.category?.includes('Indemnity') || f.category?.includes('Termination');
    if (activeFilter === 'LAYER3') return f.layer?.includes('Layer 3') || f.category?.includes('Dispute') || f.category?.includes('Arbitration') || f.category?.includes('Jurisdiction');
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="border-b border-[#E5E7EB] pb-5">
        <h1 className={toolType.title}>Document health check</h1>
        <p className={`${toolType.lead} mt-1 max-w-2xl`}>
          A three-layer audit for missing arbitration seats, uncapped indemnities, void
          non-compete covenants and stamp-duty traps.
        </p>
      </div>


      {/* Main Grid: Input Form (5 cols) & Results/Progress (7 cols) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Left Column: Mutually Exclusive Input Box (5 cols) */}
        <div className="h-fit space-y-4 rounded-lg border border-[#E5E7EB] bg-white p-5 lg:col-span-5">
          {/* Header with Mode Toggle Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3">
            <h2 className="font-ui text-[14px] font-semibold text-[#0B2242]">
              Document under review
            </h2>

            {/* Mutually Exclusive Mode Switcher: Either Text OR File */}
            <div className="inline-flex rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-0.5">
              <button
                type="button"
                onClick={() => switchMode('text')}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1 font-ui text-[12.5px] font-medium transition-colors duration-150 ${
                  inputMode === 'text'
                    ? 'bg-white text-[#0B2242] shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#0B2242]'
                }`}
              >
                Paste text
              </button>
              <button
                type="button"
                onClick={() => switchMode('file')}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1 font-ui text-[12.5px] font-medium transition-colors duration-150 ${
                  inputMode === 'file'
                    ? 'bg-white text-[#0B2242] shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#0B2242]'
                }`}
              >
                Upload file
              </button>
            </div>
          </div>

          {/* MODE 1: TEXT AREA (Shown ONLY when inputMode === 'text') */}
          {inputMode === 'text' && (
            <div className="space-y-3">
              <textarea
                rows={15}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                placeholder="Paste contract, agreement, lease deed, non-compete clause, or court pleading here..."
                className="w-full rounded-md border border-[#E5E7EB] bg-white p-3 font-ui text-[13px] leading-[1.7] text-[#0B2242] transition-colors duration-150 placeholder:text-[#9CA3AF] focus:border-[#0B2242] focus:outline-hidden disabled:opacity-60"
              />

              <div className="flex items-center justify-between">
                <span className={toolType.meta}>
                  {inputText.length} characters · {inputText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="cursor-pointer font-ui text-[12.5px] text-[#9CA3AF] transition-colors hover:text-[#0B2242]"
                >
                  Clear
                </button>
              </div>

              <button
                onClick={handleAudit}
                disabled={loading || !inputText.trim()}
                className={toolButton('solid', 'mt-1 h-11 w-full')}
              >
                {loading && <RefreshCw className="size-4 animate-spin" aria-hidden />}
                {loading ? 'Running audit…' : 'Audit document'}
              </button>
            </div>
          )}

          {/* MODE 2: FILE UPLOAD ZONE (Shown ONLY when inputMode === 'file') */}
          {inputMode === 'file' && (
            <div className="space-y-4">
              {!selectedFile ? (
                /* Empty Upload Dropzone */
                <label
                  htmlFor="health-check-file-input"
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#D1D5DB] bg-[#FAFBFC] p-8 text-center transition-colors duration-150 hover:border-[#0B2242] hover:bg-[#F9FAFB] sm:p-10"
                >
                  <input
                    ref={fileInputRef}
                    id="health-check-file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt,.md,.doc,.docx,.pdf,image/png,image/jpeg"
                  />
                  <Upload className="size-5 text-[#9CA3AF]" aria-hidden />
                  <p className="mt-3 font-ui text-[14px] font-semibold text-[#0B2242]">
                    Drop a document here
                  </p>
                  <p className="mt-1 max-w-xs font-ui text-[12.5px] leading-[1.6] text-[#6B7280]">
                    PDF, DOCX, DOC, TXT or a scan. Large agreements are fine.
                  </p>
                  <span className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3.5 font-ui text-[12.5px] font-medium text-[#0B2242] transition-colors duration-150 group-hover:border-[#0B2242]">
                    <FolderOpen className="size-3.5" aria-hidden />
                    Browse files
                  </span>
                </label>
              ) : (
                /* Uploaded File Inspection Card */
                <div className="space-y-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#0B2242]">
                        <FileCheck2 className="size-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-ui text-[13.5px] font-semibold text-[#0B2242]" title={selectedFile.name}>
                          {selectedFile.name}
                        </p>
                        <p className={`${toolType.meta} mt-0.5`}>
                          {(selectedFile.size / 1024).toFixed(1)} KB ·{' '}
                          {selectedFile.name.split('.').pop()?.toUpperCase() || 'DOCUMENT'}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 font-ui text-[12px] text-[#15694A]">
                          <Check className="size-3.5" aria-hidden />
                          Ready to audit
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-100/60 transition-colors cursor-pointer shrink-0"
                      title="Remove this file"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3 font-ui text-[12.5px] text-[#6B7280]">
                    <span>Audited directly — no pasting needed.</span>
                    <label className="cursor-pointer font-medium text-[#0B2242] underline underline-offset-4 hover:text-[#1B3A63]">
                      <span>Change</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".txt,.md,.doc,.docx,.pdf,image/png,image/jpeg"
                      />
                    </label>
                  </div>
                </div>
              )}

              <button
                onClick={handleAudit}
                disabled={loading || !selectedFile}
                className={toolButton('solid', 'h-11 w-full')}
              >
                {loading && <RefreshCw className="size-4 animate-spin" aria-hidden />}
                <span className="truncate">
                  {loading
                    ? 'Running audit…'
                    : selectedFile
                    ? 'Audit document'
                    : 'Choose a file first'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Loading Console OR Report (7 cols) */}
        <div className="lg:col-span-7">
          {loading ? (
            /* --- LIVE REAL-TIME AUDIT PROCESSING CONSOLE --- */
            <div className="space-y-5 rounded-lg border border-[#E5E7EB] bg-white p-5">
              {/* Top Progress Header */}
              <div className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] pb-4">
                <div>
                  <h3 className="flex items-center gap-2 font-ui text-[15px] font-semibold text-[#0B2242]">
                    <RefreshCw className="size-4 animate-spin text-[#6B7280]" aria-hidden />
                    Audit in progress
                  </h3>
                  <p className={`${toolType.body} mt-1`}>
                    Checking clauses across all three statutory layers.
                  </p>
                </div>

                <span className="font-merriweather text-2xl font-bold text-[#0B2242] tabular-nums">
                  {progressPercent}%
                </span>
              </div>

              {/* Countdown & Disclaimer Box */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-ui text-[13px] text-[#4B5563]">
                  <Clock className="size-3.5 text-[#9CA3AF]" aria-hidden />
                  {secondsRemaining > 0
                    ? `About ${secondsRemaining}s remaining`
                    : 'Finalising score…'}
                </span>
                <span className={toolType.meta}>~{estimatedSeconds}s estimated</span>
              </div>

              {/* Live Animated Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div
                    className="h-full rounded-full bg-[#0B2242] transition-[width] duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[#64748B]">
                  <span>Scanning text & schedules...</span>
                  <span>{progressPercent < 100 ? 'Synthesizing...' : 'Finalizing Report...'}</span>
                </div>
              </div>

              {/* 5-Stage Live Audit Checklist */}
              <div className="space-y-2.5 pt-2">
                {AUDIT_STAGES.map((stg, idx) => {
                  const isPast = progressPercent >= (idx + 1) * 20 || (idx === 4 && progressPercent === 100);
                  const isCurrent = currentStageIndex === idx && !isPast;
                  return (
                    <div
                      key={stg.step}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-xs transition-all ${
                        isCurrent
                          ? 'border-[#0B2242] bg-[#F8FAFC] shadow-xs'
                          : isPast
                          ? 'border-emerald-200 bg-emerald-50/40 text-[#334155]'
                          : 'border-transparent bg-transparent opacity-45'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isPast ? (
                          <CheckCircle2 className="size-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <RefreshCw className="size-4 text-[#0B2242] animate-spin" />
                        ) : (
                          <Circle className="size-4 text-[#CBD5E1]" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isCurrent ? 'text-[#0B2242]' : isPast ? 'text-emerald-950' : 'text-[#64748B]'
                            }`}
                          >
                            {stg.title}
                          </span>
                          {isCurrent && (
                            <span className="font-mono text-[9px] uppercase tracking-wider bg-[#0B2242] text-white px-1.5 py-0.2 rounded font-semibold">
                              Analyzing
                            </span>
                          )}
                          {isPast && (
                            <span className="font-mono text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B] leading-relaxed">{stg.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Privacy Reassurance Banner */}
              <div className="flex items-center gap-2 border-t border-[#F3F4F6] pt-3">
                <ShieldCheck className="size-3.5 shrink-0 text-[#15694A]" aria-hidden />
                <span className={toolType.meta}>
                  Nothing from this document is stored or logged.
                </span>
              </div>
            </div>
          ) : report ? (
            /* --- DIAGNOSTIC REPORT RESULTS DASHBOARD --- */
            <div className="space-y-6">
              {/* Score & Risk Level Card */}
              <div className="space-y-4 rounded-lg border border-[#E5E7EB] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className={toolType.meta}>Health score</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <h3 className="font-merriweather text-3xl font-bold text-[#0B2242] tabular-nums">
                        {report.healthScore}
                      </h3>
                      <span className="font-ui text-[13px] text-[#9CA3AF]">/ 100</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 font-ui text-[12px] font-semibold ${
                        report.riskLevel === 'HIGH RISK'
                          ? 'bg-[#FEF2F2] text-[#B42318]'
                          : report.riskLevel === 'MODERATE RISK'
                          ? 'bg-[#FFF8EB] text-[#92610A]'
                          : 'bg-[#F0FAF5] text-[#15694A]'
                      }`}
                    >
                      {report.riskLevel}
                    </span>

                    <button
                      onClick={exportReport}
                      className={toolButton('outline', 'h-9')}
                      title="Download the audit as Markdown"
                    >
                      <Download className="size-3.5" aria-hidden />
                      Export
                    </button>
                  </div>
                </div>

                {report.documentSummary && (
                  <p className="border-t border-[#F3F4F6] pt-3 font-ui text-[13.5px] leading-[1.7] text-[#4B5563]">
                    {report.documentSummary}
                  </p>
                )}

                {/* Document Metrics & Page Count Banner */}
                {report.documentMetrics && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#F3F4F6] pt-3 font-ui text-[12.5px] text-[#6B7280]">
                    <span>{report.documentMetrics.estimatedPages} pages</span>
                    <span aria-hidden className="text-[#D1D5DB]">·</span>
                    <span>{report.documentMetrics.wordCount?.toLocaleString()} words</span>
                    <span aria-hidden className="text-[#D1D5DB]">·</span>
                    <span className="inline-flex items-center gap-1 text-[#15694A]">
                      <CheckCircle className="size-3.5" aria-hidden />
                      {report.documentMetrics.coverage || 'Fully audited'}
                    </span>
                  </div>
                )}

                {/* 3-Layer Score Breakdown */}
                {report.layerScores && (
                  <div className="grid grid-cols-1 gap-3 border-t border-[#F3F4F6] pt-4 sm:grid-cols-3">
                    <div className="rounded-md border border-[#F3F4F6] bg-[#FAFBFC] p-3">
                      <div className="mb-1.5 flex items-center justify-between font-ui text-[12px] text-[#6B7280]">
                        <span>Layer 1 (Statutory)</span>
                        <span className="font-semibold text-[#0B2242] tabular-nums">{report.layerScores.layer1Score}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full bg-[#0B2242]"
                          style={{ width: `${Math.min(100, Math.max(5, report.layerScores.layer1Score))}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-md border border-[#F3F4F6] bg-[#FAFBFC] p-3">
                      <div className="mb-1.5 flex items-center justify-between font-ui text-[12px] text-[#6B7280]">
                        <span>Layer 2 (Commercial)</span>
                        <span className="font-semibold text-[#0B2242] tabular-nums">{report.layerScores.layer2Score}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full bg-[#B98900]"
                          style={{ width: `${Math.min(100, Math.max(5, report.layerScores.layer2Score))}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-md border border-[#F3F4F6] bg-[#FAFBFC] p-3">
                      <div className="mb-1.5 flex items-center justify-between font-ui text-[12px] text-[#6B7280]">
                        <span>Layer 3 (Enforceability)</span>
                        <span className="font-semibold text-[#0B2242] tabular-nums">{report.layerScores.layer3Score}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full bg-[#15694A]"
                          style={{ width: `${Math.min(100, Math.max(5, report.layerScores.layer3Score))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Priority Counts */}
                <div className="grid grid-cols-3 gap-3 border-t border-[#F1F5F9] pt-4 text-center font-mono text-xs">
                  <div className="rounded bg-rose-50 p-2.5 border border-rose-100">
                    <p className="font-bold text-rose-700 text-lg">{report.findingsBreakdown?.high || 0}</p>
                    <p className="text-[10px] uppercase text-rose-600 font-bold">High Priority</p>
                  </div>
                  <div className="rounded bg-amber-50 p-2.5 border border-amber-100">
                    <p className="font-bold text-amber-700 text-lg">{report.findingsBreakdown?.medium || 0}</p>
                    <p className="text-[10px] uppercase text-amber-600 font-bold">Medium</p>
                  </div>
                  <div className="rounded bg-emerald-50 p-2.5 border border-emerald-100">
                    <p className="font-bold text-emerald-700 text-lg">{report.findingsBreakdown?.low || 0}</p>
                    <p className="text-[10px] uppercase text-emerald-600 font-bold">Low Risk</p>
                  </div>
                </div>
              </div>

              {/* Statutory Compliance Matrix */}
              {report.statutoryChecklist && report.statutoryChecklist.length > 0 && (
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs space-y-3">
                  <h3 className="font-merriweather font-bold text-[#0B2242] text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-[#CAA438]" />
                    <span>Statutory Compliance Matrix</span>
                  </h3>

                  <div className="space-y-2">
                    {report.statutoryChecklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#0B2242]">{item.statute}</span>
                          <p className="text-[11px] text-[#64748B]">{item.notes}</p>
                        </div>
                        <span
                          className={`self-start sm:self-center shrink-0 rounded px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            item.compliance === 'COMPLIANT'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : item.compliance === 'NON_COMPLIANT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.compliance.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Spotting Guide Banner */}
              <div className="rounded-lg bg-blue-50/80 border border-blue-200 p-3.5 flex items-start gap-2.5 text-xs text-blue-950">
                <AlertCircle className="size-4 text-blue-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-bold">How to Review & Fix Errors: </span>
                  Red callout boxes highlight the exact faulty wording found in your contract. Read the statutory impact, then click <span className="font-bold underline">&ldquo;Apply to Text&rdquo;</span> to instantly update your document in the editor with the court-tested replacement clause.
                </p>
              </div>

              {/* Findings Section with Filter Tabs */}
              <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
                  <h3 className="font-merriweather font-bold text-[#0B2242] text-sm uppercase tracking-wider">
                    Identified Gaps & Vulnerabilities ({report.findings?.length || 0})
                  </h3>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                    <button
                      onClick={() => setActiveFilter('ALL')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        activeFilter === 'ALL'
                          ? 'bg-[#0B2242] text-white font-bold'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0B2242]'
                      }`}
                    >
                      All ({report.findings?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveFilter('HIGH')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        activeFilter === 'HIGH'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      High ({report.findingsBreakdown?.high || 0})
                    </button>
                    <button
                      onClick={() => setActiveFilter('MEDIUM')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        activeFilter === 'MEDIUM'
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      Medium ({report.findingsBreakdown?.medium || 0})
                    </button>
                    <button
                      onClick={() => setActiveFilter('LAYER1')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        activeFilter === 'LAYER1'
                          ? 'bg-[#0B2242] text-white font-bold'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0B2242]'
                      }`}
                    >
                      Statutory
                    </button>
                    <button
                      onClick={() => setActiveFilter('LAYER2')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        activeFilter === 'LAYER2'
                          ? 'bg-[#0B2242] text-white font-bold'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0B2242]'
                      }`}
                    >
                      Commercial
                    </button>
                    <button
                      onClick={() => setActiveFilter('LAYER3')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        activeFilter === 'LAYER3'
                          ? 'bg-[#0B2242] text-white font-bold'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0B2242]'
                      }`}
                    >
                      Dispute
                    </button>
                  </div>
                </div>

                {/* Findings Cards */}
                <div className="space-y-4">
                  {filteredFindings.map((f) => {
                    const isHigh = f.priority === 'HIGH';
                    const isMed = f.priority === 'MEDIUM';
                    return (
                      <div
                        key={f.id}
                        className={`rounded-lg border p-5 space-y-3.5 transition-all ${
                          isHigh
                            ? 'border-rose-200 bg-white shadow-xs ring-1 ring-rose-100'
                            : isMed
                            ? 'border-amber-200 bg-white shadow-xs'
                            : 'border-[#E2E8F0] bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#0B2242]">
                              [{f.category}]
                            </span>
                            {f.clauseReference && (
                              <span className="text-[11px] font-mono text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#CBD5E1] font-semibold">
                                Location: {f.clauseReference}
                              </span>
                            )}
                          </div>

                          <span
                            className={`rounded px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                              isHigh
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isMed
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {f.priority} PRIORITY
                          </span>
                        </div>

                        {/* Issue Title */}
                        <p className="text-xs sm:text-sm font-extrabold text-[#0B2242]">{f.issue}</p>

                        {/* Fault / Problematic Snippet in Text */}
                        {f.flaggedSnippet &&
                        f.flaggedSnippet !== 'Clause omitted' &&
                        f.flaggedSnippet !== 'Clause omitted from document' ? (
                          <div className="rounded-lg bg-rose-50/90 border-l-4 border-l-rose-600 border border-rose-200 p-3 text-xs text-rose-950 font-mono">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                              <span className="font-bold text-[10px] uppercase tracking-wider text-rose-800 flex items-center gap-1">
                                <AlertTriangle className="size-3 text-rose-600" />
                                <span>Fault In Your Document (Search with Ctrl+F in Word):</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => copySearchSnippet(f.flaggedSnippet!, f.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-900 bg-white px-2 py-0.5 rounded border border-rose-300 hover:bg-rose-100 cursor-pointer transition-colors shadow-2xs"
                                title="Copy snippet to find with Ctrl+F in your Word or Google Docs file"
                              >
                                {copiedSearchId === f.id ? (
                                  <>
                                    <Check className="size-2.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied for Ctrl+F</span>
                                  </>
                                ) : (
                                  <>
                                    <Search className="size-2.5 text-rose-700" />
                                    <span>Copy for Ctrl+F Search</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="leading-relaxed font-semibold italic text-rose-900">
                              &ldquo;{f.flaggedSnippet}&rdquo;
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-lg bg-amber-50/80 border-l-4 border-l-amber-600 border border-amber-200 p-2.5 text-xs text-amber-950 font-mono">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800 flex items-center gap-1 mb-1">
                              <AlertCircle className="size-3 text-amber-600" />
                              <span>Missing Clause in Your Document (Statutory Gap to Insert):</span>
                            </span>
                            <p className="text-[11px] text-amber-900 leading-relaxed">
                              This mandatory legal protection is completely absent from your agreement. Copy and paste the court-tested replacement clause below into your General Provisions, Representations & Warranties, or Miscellaneous section.
                            </p>
                          </div>
                        )}

                        {/* Statutory Implication (Kyu Galat Hai) */}
                        <div className="text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                          <span className="font-bold text-[#0B2242] block mb-0.5">
                            Statutory Violation & Legal Hazard:
                          </span>
                          <p>{f.implication}</p>
                        </div>

                        {/* Corrected Clause / Replacement (Kaise Sahi Karein) */}
                        <div className="rounded-lg bg-emerald-50/50 border-l-4 border-l-emerald-600 border border-emerald-200 p-3.5 text-xs text-[#1E293B]">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="font-bold text-emerald-950 text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5">
                              <Sparkles className="size-3.5 text-emerald-700" />
                              <span>Court-Tested Enhancement & Fix (Ready to Use):</span>
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => applyClauseReplacement(f)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B2242] hover:text-[#1D4ED8] bg-white px-2.5 py-1 rounded border border-[#CBD5E1] shadow-2xs cursor-pointer hover:border-[#0B2242] transition-all"
                                title="Swap this enhancement clause directly into your document text in the editor"
                              >
                                {appliedId === f.id ? (
                                  <Check className="size-3 text-emerald-600" />
                                ) : (
                                  <ArrowRight className="size-3 text-emerald-700" />
                                )}
                                <span>{appliedId === f.id ? 'Replaced in Editor!' : 'Apply to Text'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => copyClause(f.correctedClause || f.recommendation, f.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B2242] hover:text-[#1D4ED8] bg-white px-2.5 py-1 rounded border border-[#CBD5E1] shadow-2xs cursor-pointer hover:border-[#0B2242] transition-all"
                              >
                                {copiedId === f.id ? (
                                  <Check className="size-3 text-emerald-600" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                                <span>{copiedId === f.id ? 'Copied' : 'Copy Enhancement'}</span>
                              </button>
                            </div>
                          </div>

                          <p className="font-mono text-[11px] text-[#1E293B] leading-relaxed bg-white p-3 rounded border border-emerald-200/80 shadow-2xs">
                            {f.correctedClause || f.recommendation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Counsel Revision Directives & Action Plan */}
              {report.revisionChecklist && report.revisionChecklist.length > 0 && (
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
                    <div>
                      <h3 className="font-merriweather font-bold text-[#0B2242] text-sm uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-[#CAA438]" />
                        <span>Counsel Revision Directives</span>
                      </h3>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Key contractual redlines and drafting directives prioritized for legal counsel
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyAllChecklistItems}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0B2242] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] transition-colors cursor-pointer w-fit self-start sm:self-auto"
                      title="Copy all directives formatted for counsel"
                    >
                      {copiedAllChecklist ? (
                        <>
                          <Check className="size-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied All</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 text-[#64748B]" />
                          <span>Copy All Directives</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {report.revisionChecklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]/50 hover:bg-white hover:border-[#CBD5E1] transition-all"
                      >
                        <span className="shrink-0 flex items-center justify-center size-6 rounded-md bg-[#0B2242]/5 border border-[#0B2242]/15 text-[#0B2242] font-mono text-[11px] font-bold">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 flex items-start gap-2 pt-0.5">
                          <ArrowRight className="size-3.5 text-[#CAA438] shrink-0 mt-0.5" />
                          <span className="text-xs text-[#1E293B] font-medium leading-relaxed">
                            {item}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyChecklistItem(item, idx)}
                          title="Copy directive"
                          className="shrink-0 p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2242] transition-colors cursor-pointer"
                        >
                          {copiedChecklistIdx === idx ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* --- EMPTY AUDIT PROMPT STATE --- */
            <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white px-6 py-14 text-center">
              <FileCheck2 className="mx-auto size-6 text-[#9CA3AF]" aria-hidden />
              <h3 className="mt-3 font-ui text-[15px] font-semibold text-[#0B2242]">
                No audit run yet
              </h3>
              <p className={`${toolType.body} mx-auto mt-1.5 max-w-sm`}>
                Paste your agreement, or upload a contract, then run the audit.
              </p>
              <ol className="mx-auto mt-5 max-w-xs space-y-1.5 text-left">
                {[
                  'Statutory compliance',
                  'Commercial gaps',
                  'Enforceability',
                ].map((layer, i) => (
                  <li
                    key={layer}
                    className="flex items-center gap-2.5 font-ui text-[13px] text-[#4B5563]"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] font-mono text-[11px] text-[#6B7280]">
                      {i + 1}
                    </span>
                    {layer}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
