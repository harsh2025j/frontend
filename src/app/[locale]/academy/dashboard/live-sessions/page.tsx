"use client";

import React, { useState } from 'react';
import { Video, Calendar, Clock, ExternalLink, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function LiveSessionsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recordings'>('upcoming');

  const sessions = {
    upcoming: [
      { id: 1, title: 'BNS Definitions Discussion', course: 'Core Criminal Law Package', date: 'Oct 14, 2026', time: '6:00 PM', platform: 'Google Meet', link: '#' },
      { id: 2, title: 'Doubt Clearing: Arrest Rules', course: 'Core Criminal Law Package', date: 'Oct 15, 2026', time: '5:00 PM', platform: 'Google Meet', link: '#' },
      { id: 3, title: 'Contract Drafting Live Review', course: 'Contract Drafting 101', date: 'Oct 18, 2026', time: '4:00 PM', platform: 'YouTube Live', link: '#' },
    ],
    recordings: [
      { id: 4, title: 'Introduction to BNSS', course: 'Core Criminal Law Package', date: 'Oct 05, 2026', duration: '1h 25m', thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=300&auto=format&fit=crop' },
      { id: 5, title: 'Practical Contract Negotiations', course: 'Contract Drafting 101', date: 'Sep 28, 2026', duration: '55m', thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=300&auto=format&fit=crop' },
    ]
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#122340] mb-2 tracking-tight">Live Sessions</h1>
          <p className="text-[#122340]/60">Join live interactive classes or watch past recordings.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-[#122340]/5 rounded-xl max-w-sm">
        {['upcoming', 'recordings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg capitalize transition-all ${
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
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#122340]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
        
        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sessions.upcoming.length === 0 ? (
              <div className="col-span-full text-center py-20 text-[#122340]/40 font-medium">No upcoming live sessions.</div>
            ) : (
              sessions.upcoming.map((item, i) => (
                <div key={item.id} className="p-6 rounded-2xl border border-[#122340]/10 hover:border-[#C9A227]/50 transition-all hover:shadow-lg group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-bold border border-red-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                        {item.platform}
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-[#122340]/5 flex flex-col items-center justify-center shrink-0 border border-[#122340]/10">
                        <span className="text-[10px] font-bold text-[#122340]/50 uppercase">{item.date.split(' ')[0]}</span>
                        <span className="text-lg font-extrabold text-[#122340] leading-none">{item.date.split(' ')[1].replace(',', '')}</span>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-[#122340] text-xl mb-2 group-hover:text-[#C9A227] transition-colors">{item.title}</h3>
                    <p className="text-sm font-semibold text-[#122340]/50 mb-6">{item.course}</p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-[#122340]/5 pt-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#122340]">
                      <Clock size={16} className="text-[#C9A227]" /> {item.time}
                    </div>
                    <Link href="/dashboard/learn/criminal-law-package">
                      <button className="bg-[#122340] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0a1628] transition-colors flex items-center gap-2 text-sm shadow-md">
                        Join Link <ExternalLink size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'recordings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.recordings.length === 0 ? (
              <div className="col-span-full text-center py-20 text-[#122340]/40 font-medium">No recordings available yet.</div>
            ) : (
              sessions.recordings.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[#122340]/10 overflow-hidden hover:border-[#C9A227]/50 transition-all group cursor-pointer bg-[#f8f9fa]">
                  <div className="h-40 w-full relative overflow-hidden">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <PlayCircle size={28} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                      {item.duration}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#122340] mb-1 line-clamp-1 group-hover:text-[#C9A227] transition-colors">{item.title}</h3>
                    <p className="text-xs font-semibold text-[#122340]/50 mb-3 line-clamp-1">{item.course}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#122340]/40">
                      <Calendar size={14} /> Recorded: {item.date}
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
