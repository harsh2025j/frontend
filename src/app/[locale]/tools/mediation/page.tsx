'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Gavel,
  Scale,
  Copy,
  Check,
  Download,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Printer,
  Calendar,
} from 'lucide-react';
import { toolsService } from '@/data/services/tools-service/toolsService';
import { SettlementResponse } from '@/data/services/tools-service/types';

export default function MediationPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [termSheet, setTermSheet] = useState<SettlementResponse | null>(null);

  const SAMPLE_MEDIATION_DATA = {
    disputeType: 'Commercial Payment & Service Default Dispute',
    partyA: 'Apex Logistics Pvt. Ltd. (Claimant)',
    partyB: 'Zenith Retail Enterprise (Respondent)',
    claimAmount: 'INR 84,50,000',
    settlementAmount: 'INR 58,00,000',
    disputeSummary:
      'Non-payment of freight and warehouse invoices for Q3/Q4 FY 2024 with counterclaims alleging delivery disruptions.',
    liabilityAllocation:
      '60% Claimant acknowledgment, 40% commercial concession on account of service disruptions',
  };

  const [formData, setFormData] = useState({
    disputeType: '',
    partyA: '',
    partyB: '',
    claimAmount: '',
    settlementAmount: '',
    disputeSummary: '',
    liabilityAllocation: '',
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await toolsService.generateSettlement(formData);
      setTermSheet(res);
    } catch (err: any) {
      alert('Settlement generation error: ' + (err.message || 'Failed to generate term sheet'));
    } finally {
      setLoading(false);
    }
  };

  const getFullText = () => {
    if (!termSheet) return '';
    return (
      `${termSheet.title}\n` +
      `Governing Law: ${termSheet.governingLaw}\n\n` +
      `BETWEEN:\n${termSheet.parties?.partyA}\nAND\n${termSheet.parties?.partyB}\n\n` +
      `Total Claim Value: ${termSheet.claimValue}\n` +
      `Agreed Settlement Value: ${termSheet.agreedSettlementValue}\n\n` +
      (termSheet.sections || [])
        .map((s) => `${s.index}. ${s.heading.toUpperCase()}\n${s.content}\n`)
        .join('\n')
    );
  };

  const handleCopy = () => {
    const text = getFullText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = getFullText();
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Settlement_TermSheet_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded bg-[#0B2242] text-white">
              <Gavel className="size-4 text-[#CAA438]" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B2242]">
              Mediation & ADR Desk · Indian Law
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-merriweather text-[#0B2242]">
            Out-of-Court Settlement & Mediation Studio
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Turn commercial disputes and contested claims into a 5-part balanced term sheet under Order XXIII Rule 3 CPC & Mediation Act 2023.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#0B2242] bg-[#EAEFF9] border border-[#CBD5E1] px-3.5 py-1.5 rounded-full font-medium">
          <ShieldCheck className="size-4 text-[#0B2242]" />
          <span>Statutory Compromise Format</span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Form Panel (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs h-fit">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-[#0B2242]">
              Dispute Parameters & Values
            </h2>
            <button
              type="button"
              onClick={() => setFormData(SAMPLE_MEDIATION_DATA)}
              className="text-xs text-[#0B2242] hover:underline font-semibold cursor-pointer"
            >
              Load Sample Dispute
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-1">
                Dispute Nature
              </label>
              <input
                type="text"
                value={formData.disputeType}
                onChange={(e) => setFormData({ ...formData, disputeType: e.target.value })}
                placeholder="e.g. Commercial Payment & Service Default Dispute"
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs sm:text-sm text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-1">
                Claimant / Party A
              </label>
              <input
                type="text"
                value={formData.partyA}
                onChange={(e) => setFormData({ ...formData, partyA: e.target.value })}
                placeholder="e.g. Apex Logistics Pvt. Ltd. (Claimant)"
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs sm:text-sm text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-1">
                Respondent / Party B
              </label>
              <input
                type="text"
                value={formData.partyB}
                onChange={(e) => setFormData({ ...formData, partyB: e.target.value })}
                placeholder="e.g. Zenith Retail Enterprise (Respondent)"
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs sm:text-sm text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-1">
                  Original Claim
                </label>
                <input
                  type="text"
                  value={formData.claimAmount}
                  onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                  placeholder="e.g. INR 84,50,000"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-1">
                  Settlement Cap
                </label>
                <input
                  type="text"
                  value={formData.settlementAmount}
                  onChange={(e) => setFormData({ ...formData, settlementAmount: e.target.value })}
                  placeholder="e.g. INR 58,00,000"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-1">
                Dispute Facts Summary
              </label>
              <textarea
                rows={3}
                value={formData.disputeSummary}
                onChange={(e) => setFormData({ ...formData, disputeSummary: e.target.value })}
                placeholder="Paste or summarize key commercial facts and dispute background..."
                className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-xs text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B2242] mb-1">
                Commercial Concessions / Liability Allocation
              </label>
              <input
                type="text"
                value={formData.liabilityAllocation}
                onChange={(e) => setFormData({ ...formData, liabilityAllocation: e.target.value })}
                placeholder="e.g. 60% Claimant acknowledgment, 40% commercial concession"
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-4 rounded-lg bg-[#0B2242] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#15345E] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="size-4 animate-spin text-[#CAA438]" />
              ) : (
                <Gavel className="size-4 text-[#CAA438]" />
              )}
              <span>{loading ? 'Synthesizing Term Sheet...' : 'Build 5-Part Term Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Output Panel (7 cols) */}
        <div className="lg:col-span-7">
          {termSheet ? (
            <div className="rounded-xl border border-[#CBD5E1] bg-white shadow-xs overflow-hidden">
              {/* Output Actions Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs">
                <div>
                  <span className="font-mono font-bold text-[#0B2242]">
                    Settlement Agreement (Order XXIII R3 CPC)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2242] hover:bg-[#F1F5F9]"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#0B2242] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#15345E]"
                  >
                    <Download className="size-3.5 text-[#CAA438]" />
                    <span>Download .txt</span>
                  </button>
                </div>
              </div>

              {/* Document Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-merriweather text-lg font-bold text-[#0B2242] uppercase text-center">
                    {termSheet.title}
                  </h2>
                  <p className="mt-1 text-center font-mono text-[11px] text-[#64748B]">
                    Governing Law: {termSheet.governingLaw}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-xs font-mono">
                  <div>
                    <span className="text-[#64748B]">Original Claim: </span>
                    <span className="font-bold text-[#0B2242]">{termSheet.claimValue}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Settlement Value: </span>
                    <span className="font-bold text-emerald-700">{termSheet.agreedSettlementValue}</span>
                  </div>
                </div>

                {/* Sections List */}
                <div className="space-y-4">
                  {termSheet.sections?.map((sec, idx) => (
                    <div key={idx} className="border-t border-[#F1F5F9] pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-[#CAA438]">
                          Clause {sec.index}
                        </span>
                        <h4 className="font-merriweather text-sm font-bold text-[#0B2242]">
                          {sec.heading}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-wrap font-sans">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
              <Gavel className="mx-auto size-10 text-[#CBD5E1]" />
              <h3 className="mt-4 font-merriweather font-bold text-[#0B2242] text-base">
                No Term Sheet Generated Yet
              </h3>
              <p className="mt-2 text-xs text-[#64748B] max-w-md mx-auto">
                Fill in the dispute parameters and click &ldquo;Build 5-Part Term Sheet&rdquo; to generate a judicially enforceable settlement agreement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
