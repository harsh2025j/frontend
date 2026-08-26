"use client";

import React, { useState } from "react";
import { Search, Plus, Filter, Edit2, Trash2 } from "lucide-react";

export default function AcademyCouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const coupons = [
    { id: 1, code: "WELCOME20", discount: "20%", validUntil: "31 Dec 2026", limit: "100", used: 45, status: "Active" },
    { id: 2, code: "DIWALI500", discount: "₹500 Flat", validUntil: "05 Nov 2026", limit: "Unlimited", used: 120, status: "Active" },
    { id: 3, code: "EARLYBIRD", discount: "15%", validUntil: "01 Aug 2026", limit: "50", used: 50, status: "Expired" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-500 text-sm mt-1">Create promotional codes to boost course enrollments.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by coupon code..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1 bg-white">
              <Filter size={16} className="text-gray-400"/>
              <select className="py-1 text-sm bg-transparent focus:outline-none text-gray-700">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Usage (Used / Limit)</th>
                <th className="p-4">Valid Until</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">{coupon.code}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-emerald-600">{coupon.discount}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900 font-medium">{coupon.used} <span className="text-gray-400">/ {coupon.limit}</span></p>
                    {coupon.limit !== 'Unlimited' && (
                      <div className="w-full max-w-[120px] h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${(coupon.used / parseInt(coupon.limit)) * 100}%` }}></div>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {coupon.validUntil}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      coupon.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
