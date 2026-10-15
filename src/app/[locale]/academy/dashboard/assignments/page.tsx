"use client";

import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, UploadCloud, FileText } from 'lucide-react';

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'approved'>('pending');

  const assignments = {
    pending: [
      { id: 1, title: 'Case Brief: Kesavananda Bharati', course: 'Legal Research & Litigation', due: 'Tomorrow, 11:59 PM', points: 100 },
      { id: 2, title: 'Drafting a Legal Notice', course: 'Contract Drafting 101', due: 'In 3 days', points: 50 },
    ],
    submitted: [
      { id: 3, title: 'Analysis of BNS Sections 1-10', course: 'Criminal Law Package', date: 'Oct 12, 2026', status: 'In Review' },
    ],
    approved: [
      { id: 4, title: 'Research Memo: Right to Privacy', course: 'Constitutional Law', date: 'Oct 01, 2026', score: 92 },
    ]
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#122340] mb-1.5 sm:mb-2 tracking-tight">Practical Assignments</h1>
          <p className="text-xs sm:text-sm text-[#122340]/60">Complete your practical tasks to qualify for certification.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-[#122340]/5 rounded-xl max-w-md w-full">
        {['pending', 'submitted', 'approved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg capitalize transition-all cursor-pointer ${
              activeTab === tab 
                ? 'bg-white text-[#122340] shadow-sm' 
                : 'text-[#122340]/60 hover:text-[#122340] hover:bg-[#122340]/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 border border-[#122340]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {activeTab === 'pending' && (
          <div className="space-y-4 sm:space-y-6">
            {assignments.pending.length === 0 ? (
              <div className="text-center py-16 sm:py-20 text-[#122340]/40 font-medium text-sm">No pending assignments. Great job!</div>
            ) : (
              assignments.pending.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#122340]/10 hover:border-[#C9A227]/50 transition-colors gap-4 sm:gap-6 group">
                  <div className="flex gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <AlertCircle size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#122340] text-base sm:text-lg mb-0.5 sm:mb-1 truncate">{item.title}</h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#122340]/50 mb-1.5 sm:mb-2 truncate">{item.course}</p>
                      <div className="flex flex-wrap gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-bold text-[#122340]/40">
                        <span className="flex items-center gap-1 text-red-500"><Clock size={13} /> Due: {item.due}</span>
                        <span className="flex items-center gap-1"><CheckCircle2 size={13} /> {item.points} Points</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto shrink-0 bg-[#f0f2f5] hover:bg-[#122340] hover:text-white text-[#122340] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <UploadCloud size={16} /> Submit Work
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'submitted' && (
          <div className="space-y-4 sm:space-y-6">
            {assignments.submitted.length === 0 ? (
              <div className="text-center py-16 sm:py-20 text-[#122340]/40 font-medium text-sm">No assignments currently under review.</div>
            ) : (
              assignments.submitted.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#122340]/10 gap-4 sm:gap-6">
                  <div className="flex gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <FileText size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#122340] text-base sm:text-lg mb-0.5 sm:mb-1 truncate">{item.title}</h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#122340]/50 mb-1.5 sm:mb-2 truncate">{item.course}</p>
                      <div className="flex flex-wrap gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-bold text-[#122340]/40">
                        <span className="flex items-center gap-1"><Clock size={13} /> Submitted: {item.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto text-center shrink-0 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border border-blue-100">
                    {item.status}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="space-y-4 sm:space-y-6">
            {assignments.approved.length === 0 ? (
              <div className="text-center py-16 sm:py-20 text-[#122340]/40 font-medium text-sm">No approved assignments yet.</div>
            ) : (
              assignments.approved.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-200 bg-green-50/30 gap-4 sm:gap-6">
                  <div className="flex gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0 shadow-inner">
                      <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#122340] text-base sm:text-lg mb-0.5 sm:mb-1 truncate">{item.title}</h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#122340]/50 mb-1.5 sm:mb-2 truncate">{item.course}</p>
                      <div className="flex flex-wrap gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-bold text-[#122340]/40">
                        <span className="flex items-center gap-1">Approved on: {item.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-green-200/50">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] sm:text-xs font-bold text-[#122340]/40 uppercase">Score</p>
                      <p className="text-lg sm:text-xl font-black text-green-600">{item.score}/100</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
