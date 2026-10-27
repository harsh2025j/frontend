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
  ShieldAlert,
  ShieldCheck,
  FileText,
  ChevronRight,
  Sparkles,
  Download,
  Trash2,
  FileSpreadsheet,
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded bg-[#0B2242] text-white">
              <FileCheck2 className="size-4 text-[#CAA438]" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B2242]">
              Legal Risk Intelligence · 3-Layer Diagnostic Studio
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-merriweather text-[#0B2242]">
            Legal Document Health Check & 3-Layer Risk Audit
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B] max-w-3xl">
            Spot missing arbitration seats under the Hardy Exploration doctrine, uncapped indemnities, Section 27 void non-compete covenants, and stamp duty compliance traps across Indian legal contracts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#0B2242] bg-[#EAEFF9] border border-[#CBD5E1] px-3.5 py-1.5 rounded-full font-medium">
            <ShieldAlert className="size-4 text-amber-600" />
            <span>Statutory Risk Scanner Active</span>
          </div>
        </div>
      </div>


      {/* Main Grid: Input Form (5 cols) & Results/Progress (7 cols) */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Mutually Exclusive Input Box (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs h-fit space-y-5">
          {/* Header with Mode Toggle Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3.5">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#0B2242] flex items-center gap-1.5">
              <FileText className="size-4 text-[#CAA438]" />
              <span>Document Under Review</span>
            </h2>

            {/* Mutually Exclusive Mode Switcher: Either Text OR File */}
            <div className="inline-flex rounded-lg bg-[#F1F5F9] p-1 border border-[#CBD5E1]">
              <button
                type="button"
                onClick={() => switchMode('text')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inputMode === 'text'
                    ? 'bg-white text-[#0B2242] shadow-2xs font-extrabold'
                    : 'text-[#64748B] hover:text-[#0B2242]'
                }`}
              >
                <FileText className="size-3.5" />
                <span>Paste Text</span>
              </button>
              <button
                type="button"
                onClick={() => switchMode('file')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inputMode === 'file'
                    ? 'bg-white text-[#0B2242] shadow-2xs font-extrabold'
                    : 'text-[#64748B] hover:text-[#0B2242]'
                }`}
              >
                <Upload className="size-3.5" />
                <span>Upload File</span>
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
                className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3.5 font-mono text-xs text-[#0B2242] focus:border-[#0B2242] focus:outline-hidden leading-relaxed disabled:opacity-60"
              />

              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-mono">
                  {inputText.length} characters · {inputText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="text-[11px] text-[#64748B] hover:text-rose-600 cursor-pointer"
                >
                  Clear text
                </button>
              </div>

              <button
                onClick={handleAudit}
                disabled={loading || !inputText.trim()}
                className="w-full mt-2 rounded-lg bg-[#0B2242] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#15345E] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="size-4 animate-spin text-[#CAA438]" />
                ) : (
                  <FileCheck2 className="size-4 text-[#CAA438]" />
                )}
                <span>{loading ? 'Running 3-Layer Diagnostic Audit...' : 'Audit Document Health'}</span>
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
                  className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-[#CBD5E1] rounded-xl hover:border-[#0B2242] hover:bg-[#F8FAFC] transition-all cursor-pointer text-center group bg-[#FBFDFF]"
                >
                  <input
                    ref={fileInputRef}
                    id="health-check-file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt,.md,.doc,.docx,.pdf,image/png,image/jpeg"
                  />
                  <div className="size-14 rounded-full bg-[#EAEFF9] flex items-center justify-center text-[#0B2242] mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="size-6 text-[#0B2242]" />
                  </div>
                  <p className="font-merriweather font-bold text-sm text-[#0B2242]">
                    Choose a document or drag & drop here
                  </p>
                  <p className="text-xs text-[#64748B] mt-1.5 max-w-xs leading-relaxed">
                    Upload your contract in PDF, DOCX, DOC, TXT, or scanned image format (Supports up to 100+ pages).
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0B2242] px-4 py-2 text-xs font-bold text-white shadow-2xs group-hover:bg-[#15345E] transition-colors">
                    <FolderOpen className="size-3.5" />
                    <span>Browse File from Device</span>
                  </span>
                </label>
              ) : (
                /* Uploaded File Inspection Card */
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="size-12 rounded-lg bg-[#0B2242] flex items-center justify-center text-white shrink-0">
                        <FileCheck2 className="size-6 text-[#CAA438]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#0B2242] truncate" title={selectedFile.name}>
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-[#64748B] font-mono mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB ·{' '}
                          {selectedFile.name.split('.').pop()?.toUpperCase() || 'DOCUMENT'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded font-semibold mt-2 border border-emerald-200">
                          <Check className="size-3 text-emerald-700" />
                          <span>File Attached & Ready for Audit</span>
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

                  <div className="flex items-center justify-between border-t border-amber-200/80 pt-3 text-xs text-[#475569]">
                    <span>Document will be audited directly without text pasting.</span>
                    <label className="font-bold text-[#0B2242] hover:underline cursor-pointer">
                      <span>Change File</span>
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
                className="w-full rounded-lg bg-[#0B2242] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#15345E] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="size-4 animate-spin text-[#CAA438]" />
                ) : (
                  <FileCheck2 className="size-4 text-[#CAA438]" />
                )}
                <span>
                  {loading
                    ? 'Running 3-Layer Diagnostic Audit...'
                    : selectedFile
                    ? `Audit Document (${selectedFile.name})`
                    : 'Choose File to Audit'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Loading Console OR Report (7 cols) */}
        <div className="lg:col-span-7">
          {loading ? (
            /* --- LIVE REAL-TIME AUDIT PROCESSING CONSOLE --- */
            <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs space-y-6">
              {/* Top Progress Header */}
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-[#0B2242] flex items-center justify-center text-[#CAA438] shrink-0">
                    <RefreshCw className="size-5 animate-spin text-[#CAA438]" />
                  </div>
                  <div>
                    <h3 className="font-merriweather font-extrabold text-[#0B2242] text-base">
                      Document Health Diagnostic in Progress
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      AI Counsel is actively inspecting clauses across all 3 statutory layers
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-3xl font-black text-[#0B2242]">{progressPercent}%</span>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-[#64748B]">Scan Completed</p>
                </div>
              </div>

              {/* Countdown & Disclaimer Box */}
              <div className="rounded-lg bg-amber-50/80 border border-amber-200 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-bold text-amber-950 flex items-center gap-1.5">
                    <Clock className="size-4 text-amber-700" />
                    <span>
                      {secondsRemaining > 0
                        ? `Estimated Time Remaining: ~${secondsRemaining}s`
                        : 'Finalizing Statutory Diagnostics & Score...'}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded font-semibold border border-amber-200">
                    Estimated Time: ~{estimatedSeconds}s Total
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
                  Note: This is an estimated processing time and may increase or decrease based on document length, statutory clause density, and server load.
                </p>
              </div>

              {/* Live Animated Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0B2242] via-[#1E40AF] to-[#CAA438] transition-all duration-300 ease-out rounded-full"
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
              <div className="text-[11px] text-[#64748B] border-t border-[#F1F5F9] pt-3 flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Isolated Execution Sandbox: No legal agreements or client party details are stored or logged.</span>
              </div>
            </div>
          ) : report ? (
            /* --- DIAGNOSTIC REPORT RESULTS DASHBOARD --- */
            <div className="space-y-6">
              {/* Score & Risk Level Card */}
              <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                      Diagnostic Health Score
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-3xl sm:text-4xl font-extrabold font-merriweather text-[#0B2242]">
                        {report.healthScore}
                      </h3>
                      <span className="text-sm font-mono text-[#64748B]">/ 100</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-4 py-1.5 font-mono text-xs font-bold tracking-wider ${
                        report.riskLevel === 'HIGH RISK'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : report.riskLevel === 'MODERATE RISK'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {report.riskLevel}
                    </span>

                    <button
                      onClick={exportReport}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#0B2242] hover:bg-white transition-all shadow-2xs cursor-pointer"
                      title="Download complete audit memorandum as Markdown"
                    >
                      <Download className="size-3.5" />
                      <span>Export Report</span>
                    </button>
                  </div>
                </div>

                {report.documentSummary && (
                  <p className="text-xs text-[#475569] leading-relaxed border-t border-[#F1F5F9] pt-3">
                    <span className="font-bold text-[#0B2242]">Executive Assessment: </span>
                    {report.documentSummary}
                  </p>
                )}

                {/* Document Metrics & Page Count Banner */}
                {report.documentMetrics && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-[#F1F5F9] pt-3 text-[11px] font-mono text-[#475569]">
                    <span className="inline-flex items-center gap-1 bg-[#F1F5F9] px-2.5 py-1 rounded border border-[#CBD5E1] font-semibold text-[#0B2242]">
                      <FileSpreadsheet className="size-3 text-[#CAA438]" />
                      <span>{report.documentMetrics.estimatedPages} Pages</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#F1F5F9] px-2.5 py-1 rounded border border-[#CBD5E1]">
                      <span>{report.documentMetrics.wordCount?.toLocaleString()} Words</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200 font-semibold">
                      <CheckCircle className="size-3 text-emerald-600" />
                      <span>{report.documentMetrics.coverage || '100% Full Document Audited'}</span>
                    </span>
                    {report.documentMetrics.isLargeDoc && (
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded border border-indigo-200 font-semibold">
                        <span>Large-Scale Agreement Audit (1M Token Window)</span>
                      </span>
                    )}
                  </div>
                )}

                {/* 3-Layer Score Breakdown */}
                {report.layerScores && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#F1F5F9] pt-4 font-mono text-xs">
                    <div className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                      <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                        <span>Layer 1 (Statutory)</span>
                        <span className="font-bold text-[#0B2242]">{report.layerScores.layer1Score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0B2242] rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, report.layerScores.layer1Score))}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                      <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                        <span>Layer 2 (Commercial)</span>
                        <span className="font-bold text-[#0B2242]">{report.layerScores.layer2Score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, report.layerScores.layer2Score))}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                      <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                        <span>Layer 3 (Enforceability)</span>
                        <span className="font-bold text-[#0B2242]">{report.layerScores.layer3Score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
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
            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center space-y-3">
              <FileCheck2 className="mx-auto size-12 text-[#CBD5E1]" />
              <h3 className="font-merriweather font-bold text-[#0B2242] text-lg">
                No Document Audit Performed Yet
              </h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                Choose one of the 4 practice archetypes, paste your agreement text, or switch to &ldquo;Upload File&rdquo; to attach a contract (PDF, DOCX, DOC, TXT, or scan), then click &ldquo;Audit Document Health&rdquo;.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-mono text-[#0B2242] border border-[#CBD5E1]">
                  Layer 1: Statutory Compliance
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-mono text-[#0B2242] border border-[#CBD5E1]">
                  Layer 2: Commercial Gaps
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-mono text-[#0B2242] border border-[#CBD5E1]">
                  Layer 3: Enforceability
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
