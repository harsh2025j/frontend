"use client";

import React, { useState } from 'react';
import { Camera, DownloadCloud, Shield, CreditCard, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
      
      <div>
        <h1 className="text-3xl font-extrabold text-[#122340] mb-2 tracking-tight">Account Settings</h1>
        <p className="text-[#122340]/60">Manage your profile, security, and billing preferences.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-[#fcfcfa] border-r border-[#122340]/5 p-6 shrink-0">
          <nav className="space-y-2">
            {[
              { id: 'profile', label: 'Public Profile', icon: <Camera size={18} /> },
              { id: 'password', label: 'Security & Password', icon: <Shield size={18} /> },
              { id: 'billing', label: 'Billing History', icon: <CreditCard size={18} /> },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-[#122340] to-[#0a1628] text-white shadow-md' 
                    : 'text-[#122340]/60 hover:bg-white hover:shadow-sm hover:text-[#122340] border border-transparent hover:border-[#122340]/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${activeTab === tab.id ? 'text-[#C9A227]' : 'text-[#122340]/40 group-hover:text-[#C9A227]'} transition-colors`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </div>
                <ChevronRight size={16} className={activeTab === tab.id ? 'text-white/50' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all'} />
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 lg:p-12">
          
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-10 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <div className="relative group cursor-pointer">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#C9A227] to-yellow-600 flex items-center justify-center font-black text-4xl text-[#0a1628] shadow-lg overflow-hidden relative border-4 border-white">
                    SK
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <Camera size={24} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                    </div>
                  </div>
                </div>
                <div className="text-center sm:text-left space-y-2 mt-2">
                  <h3 className="font-extrabold text-xl text-[#122340]">Profile Avatar</h3>
                  <p className="text-sm text-[#122340]/50 max-w-sm">We recommend an image of at least 400x400. Accepted files: JPG, PNG, GIF (Max 2MB).</p>
                  <button className="text-sm font-bold text-[#C9A227] hover:underline mt-2 inline-block">Remove Avatar</button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/50">First Name</label>
                    <input type="text" defaultValue="Sajjad" className="w-full bg-[#fcfcfa] border border-[#122340]/10 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-semibold text-[#122340]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/50">Last Name</label>
                    <input type="text" defaultValue="Student" className="w-full bg-[#fcfcfa] border border-[#122340]/10 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-semibold text-[#122340]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/50">Email Address</label>
                  <div className="relative">
                    <input type="email" defaultValue="student@sajjadhusain.com" className="w-full bg-gray-50 border border-[#122340]/10 rounded-xl px-4 py-3.5 outline-none text-[#122340]/50 font-semibold cursor-not-allowed" disabled />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Verified</span>
                  </div>
                  <p className="text-xs text-[#122340]/40 font-medium">To change your primary email, please contact academy support.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#122340]/5 flex justify-end">
                <button className="bg-[#122340] text-white px-10 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgb(18,35,64,0.39)] hover:shadow-[0_6px_20px_rgba(18,35,64,0.23)] hover:-translate-y-0.5 transition-all duration-200">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="max-w-md space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h3 className="font-extrabold text-xl text-[#122340] mb-2">Update Password</h3>
                <p className="text-sm text-[#122340]/50">Ensure your account is using a long, random password to stay secure.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/50">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[#fcfcfa] border border-[#122340]/10 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/50">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[#fcfcfa] border border-[#122340]/10 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/50">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-[#fcfcfa] border border-[#122340]/10 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]" />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#122340]/5 flex justify-end">
                <button className="bg-[#122340] text-white px-10 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgb(18,35,64,0.39)] hover:shadow-[0_6px_20px_rgba(18,35,64,0.23)] hover:-translate-y-0.5 transition-all duration-200">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h3 className="font-extrabold text-xl text-[#122340] mb-2">Billing History</h3>
                <p className="text-sm text-[#122340]/50">View all your previous course purchases and download tax invoices.</p>
              </div>

              <div className="border border-[#122340]/5 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse bg-white">
                  <thead>
                    <tr className="bg-[#fcfcfa] border-b border-[#122340]/5 text-[#122340]/50 text-xs uppercase tracking-widest font-bold">
                      <th className="py-4 px-6">Invoice</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#122340]">
                    {[
                      { id: 'INV-2026-002', date: 'Oct 12, 2026', amount: '₹8,999', status: 'Paid' },
                      { id: 'INV-2026-001', date: 'Sep 05, 2026', amount: '₹5,499', status: 'Paid' },
                    ].map((inv, i) => (
                      <tr key={i} className="border-b border-[#122340]/5 hover:bg-[#fcfcfa] transition-colors group">
                        <td className="py-4 px-6 font-bold">{inv.id}</td>
                        <td className="py-4 px-6 text-[#122340]/60 font-medium">{inv.date}</td>
                        <td className="py-4 px-6 font-extrabold">{inv.amount}</td>
                        <td className="py-4 px-6">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="inline-flex items-center gap-2 text-[#C9A227] font-bold text-xs uppercase tracking-widest hover:bg-[#C9A227]/10 px-3 py-1.5 rounded-lg transition-colors">
                            <DownloadCloud size={14} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
