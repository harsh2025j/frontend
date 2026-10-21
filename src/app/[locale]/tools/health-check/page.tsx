'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Upload,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { toolsService } from '@/data/services/tools-service/toolsService';
import { HealthCheckReport } from '@/data/services/tools-service/types';

const SAMPLE_AGREEMENT = `MASTER SERVICE AND VENDOR AGREEMENT
This Agreement is entered into on 12th Day of January 2024 between Alpha Tech Ltd. ("Client") and Zenith Solutions ("Vendor").

1. SERVICES:
Vendor shall provide specialized software engineering and maintenance services described in Exhibit A.

2. COMPENSATION:
Client shall pay Vendor fees of INR 25,00,000 per quarter upon receipt of invoice.

3. TERM AND TERMINATION:
Either party may terminate this agreement immediately at any time by sending an email. No cure period shall be provided.

4. INDEMNIFICATION:
Vendor shall indemnify, defend, and hold harmless Client from any and all damages, liabilities, third-party claims, losses, or legal costs arising out of any breach whatsoever, without any limitation of amount.

5. DISPUTE RESOLUTION:
Any dispute arising under this agreement shall be settled through arbitration. The venue of arbitration shall be New Delhi.`;

export default function DocumentHealthCheckPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<HealthCheckReport | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const res = await toolsService.checkDocumentHealth(inputText, selectedFile || undefined);
      setReport(res);
    } catch (err: any) {
      alert('Audit error: ' + (err.message || 'Failed to complete document audit'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const copyRecommendation = (rec: string, id: string) => {
    navigator.clipboard.writeText(rec);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded bg-[#0B2242] text-white">
              <FileCheck2 className="size-4 text-[#CAA438]" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B2242]">
              Document Intelligence & Review · AI
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-merriweather text-[#0B2242]">
            Legal Document Health Check & 3-Layer Risk Audit
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Spot missing arbitration seats, uncapped indemnities, unilateral terminations, and statutory compliance traps.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#0B2242] bg-[#EAEFF9] border border-[#CBD5E1] px-3.5 py-1.5 rounded-full font-medium">
          <ShieldAlert className="size-4 text-amber-600" />
          <span>Statutory Risk Scanner Active</span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#0B2242]">
              Document Under Review
            </h2>
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2242] hover:text-[#1D4ED8]">
              <Upload className="size-3.5" />
              <span>{selectedFile ? selectedFile.name : 'Upload File'}</span>
              <input type="file" onChange={handleFileChange} className="hidden" accept=".txt,.md,.doc,.docx,.pdf" />
            </label>
          </div>

          <textarea
            rows={14}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste contract, agreement, lease deed, or pleading text here..."
            className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3.5 font-mono text-xs text-[#0B2242] focus:border-[#0B2242] focus:outline-hidden leading-relaxed"
          />

          <div className="mt-4 flex items-center justify-between text-xs text-[#64748B]">
            <span>{inputText.length} characters</span>
            <button
              type="button"
              onClick={() => setInputText(SAMPLE_AGREEMENT)}
              className="text-xs text-[#0B2242] hover:underline"
            >
              Load Sample Contract
            </button>
          </div>

          <button
            onClick={handleAudit}
            disabled={loading || !inputText.trim()}
            className="w-full mt-5 rounded-lg bg-[#0B2242] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#15345E] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="size-4 animate-spin text-[#CAA438]" />
            ) : (
              <FileCheck2 className="size-4 text-[#CAA438]" />
            )}
            <span>{loading ? 'Running 3-Layer Diagnostic...' : 'Audit Document Health'}</span>
          </button>
        </div>

        {/* Right Column: Diagnostic Report (7 cols) */}
        <div className="lg:col-span-7">
          {report ? (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                      Diagnostic Audit Score
                    </span>
                    <h3 className="text-3xl font-extrabold font-merriweather text-[#0B2242] mt-1">
                      {report.healthScore} / 100
                    </h3>
                  </div>

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
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#F1F5F9] pt-4 text-center font-mono text-xs">
                  <div className="rounded bg-rose-50 p-2 border border-rose-100">
                    <p className="font-bold text-rose-700 text-base">{report.findingsBreakdown?.high || 0}</p>
                    <p className="text-[10px] uppercase text-rose-600 font-semibold">High Priority</p>
                  </div>
                  <div className="rounded bg-amber-50 p-2 border border-amber-100">
                    <p className="font-bold text-amber-700 text-base">{report.findingsBreakdown?.medium || 0}</p>
                    <p className="text-[10px] uppercase text-amber-600 font-semibold">Medium</p>
                  </div>
                  <div className="rounded bg-emerald-50 p-2 border border-emerald-100">
                    <p className="font-bold text-emerald-700 text-base">{report.findingsBreakdown?.low || 0}</p>
                    <p className="text-[10px] uppercase text-emerald-600 font-semibold">Low Risk</p>
                  </div>
                </div>
              </div>

              {/* Findings List */}
              <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs space-y-4">
                <h3 className="font-merriweather font-bold text-[#0B2242] text-sm uppercase tracking-wider">
                  Identified Gaps & Vulnerabilities ({report.findings?.length || 0})
                </h3>

                <div className="space-y-4">
                  {report.findings?.map((f) => (
                    <div
                      key={f.id}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#0B2242]">
                          [{f.category}]
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            f.priority === 'HIGH'
                              ? 'bg-rose-100 text-rose-700'
                              : f.priority === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {f.priority} PRIORITY
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-[#0B2242]">{f.issue}</p>

                      <p className="text-xs text-[#475569] leading-relaxed">
                        <span className="font-semibold text-[#0B2242]">Implication: </span>
                        {f.implication}
                      </p>

                      <div className="mt-2 rounded bg-white border border-[#CBD5E1] p-3 text-xs text-[#1E293B]">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-[#0B2242] text-[11px] uppercase tracking-wider font-mono">
                            Recommended Clause Correction:
                          </span>
                          <button
                            onClick={() => copyRecommendation(f.recommendation, f.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B2242] hover:text-[#1D4ED8]"
                          >
                            {copiedId === f.id ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                            <span>{copiedId === f.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="font-mono text-[11px] text-[#334155] leading-relaxed">
                          {f.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revision Checklist */}
              {report.revisionChecklist && report.revisionChecklist.length > 0 && (
                <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs">
                  <h3 className="font-merriweather font-bold text-[#0B2242] text-sm uppercase tracking-wider mb-3">
                    Counsel Revision Checklist
                  </h3>
                  <ul className="space-y-2 text-xs text-[#334155]">
                    {report.revisionChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="size-4 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
              <FileCheck2 className="mx-auto size-10 text-[#CBD5E1]" />
              <h3 className="mt-4 font-merriweather font-bold text-[#0B2242] text-base">
                No Document Audit Performed
              </h3>
              <p className="mt-2 text-xs text-[#64748B] max-w-md mx-auto">
                Paste agreement text or upload a contract on the left and click &ldquo;Audit Document Health&rdquo; to launch the 3-layer risk scan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
