"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, ShieldAlert, Download, Eye, Settings, X, Save } from "lucide-react";

export default function AcademyCertificatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Settings state
  const [minProgress, setMinProgress] = useState("90");
  const [requireAssignment, setRequireAssignment] = useState(true);
  const [requireTest, setRequireTest] = useState(true);
  const [minTestScore, setMinTestScore] = useState("50");

  const certificates = [
    { id: "SHLA-2026-00129", student: "Ravi Kumar", course: "Legal Research Apprenticeship", issueDate: "12 Aug 2026", status: "Valid" },
    { id: "SHLA-2026-00128", student: "Priya Sharma", course: "Drafting Commercial Contracts", issueDate: "05 Jul 2026", status: "Valid" },
    { id: "SHLA-2026-00127", student: "Amit Patel", course: "Intellectual Property Rights", issueDate: "10 Jun 2026", status: "Revoked" },
  ];

  const handleSaveSettings = () => {
    // Mock save logic
    console.log("Saving cert settings:", { minProgress, requireAssignment, requireTest, minTestScore });
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates Management</h1>
          <p className="text-gray-500 text-sm mt-1">View issued certificates, verify authenticity, and configure generation rules.</p>
        </div>
        <button 
          onClick={() => setIsSettingsModalOpen(true)}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
        >
          <Settings size={18} /> Configure Certificates
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Certificate ID or student name..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Certificate ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <p className="font-bold text-blue-600">{cert.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-gray-900">{cert.student}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{cert.course}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {cert.issueDate}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex w-max items-center gap-1 ${
                      cert.status === 'Valid' ? 'bg-green-100 text-green-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {cert.status === 'Valid' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                      {cert.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Certificate">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition" title="Download PDF">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Modal Overlay */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Certificate Generation Rules</h2>
                <p className="text-sm text-gray-500 mt-1">Configure when a student becomes eligible for a certificate.</p>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Course Progress (%)</label>
                <input 
                  type="number" 
                  max="100" min="0"
                  value={minProgress}
                  onChange={(e) => setMinProgress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
                <p className="text-xs text-gray-500 mt-1">Percentage of videos/lessons that must be completed.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={requireAssignment}
                  onChange={(e) => setRequireAssignment(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5" 
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">Require Assignment Approval</p>
                  <p className="text-xs text-gray-500 mt-0.5">Student must submit all practical assignments and get "Graded/Approved" status.</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-start gap-3 mb-3">
                  <input 
                    type="checkbox" 
                    checked={requireTest}
                    onChange={(e) => setRequireTest(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5" 
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Require Passing Final Assessment</p>
                    <p className="text-xs text-gray-500 mt-0.5">Student must pass the final test to receive a certificate.</p>
                  </div>
                </div>

                {requireTest && (
                  <div className="pl-8">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Test Score (%)</label>
                    <input 
                      type="number" 
                      max="100" min="0"
                      value={minTestScore}
                      onChange={(e) => setMinTestScore(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save size={18} /> Save Settings
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
