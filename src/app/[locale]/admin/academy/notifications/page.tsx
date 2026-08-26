"use client";

import React, { useState } from "react";
import { Send, Bell, Search } from "lucide-react";

export default function AcademyNotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const history = [
    { id: 1, title: "Upcoming Live Session Reminder", target: "Course: Legal Research Apprenticeship", date: "12 Aug 2026 10:00 AM", type: "Email + Platform" },
    { id: 2, title: "New Assignment Uploaded", target: "Course: Drafting Commercial Contracts", date: "10 Aug 2026 02:30 PM", type: "Platform Only" },
    { id: 3, title: "Welcome to Sajjad Husain Academy", target: "All Students", date: "01 Aug 2026 09:00 AM", type: "Email" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications & Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">Send targeted alerts or emails to enrolled students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell size={20} className="text-blue-600"/> Compose Notification</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target Audience</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500">
                <option value="all">All Enrolled Students</option>
                <option value="course_1">Course: Legal Research</option>
                <option value="course_2">Course: Drafting Contracts</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notification Title</label>
              <input type="text" placeholder="e.g. Test Results Declared!" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message Content</label>
              <textarea rows={4} placeholder="Type your message here..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Method</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" /> In-Platform
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /> Email
                </label>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-2">
              <Send size={18} /> Send Notification
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Broadcasts</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Message Details</th>
                  <th className="p-4">Target Audience</th>
                  <th className="p-4">Sent On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">{item.type}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {item.target}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
