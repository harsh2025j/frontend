"use client";
import React, { useState } from "react";

export default function LatestInformationSection() {
    const [activeTab, setActiveTab] = useState<'updates' | 'judgments' | 'orders' | 'notices'>('updates');

    // Helper function to get content based on active tab
    const getTabContent = (tab: string) => {
        const contentMap: Record<string, Array<{ type: string; text: string; download?: boolean }>> = {
            updates: [
                { type: 'Latest Update', text: 'Helpline numbers of Court Masters and Moderators for 22.12.2025', download: true },
                { type: 'Latest Update', text: 'Notice regarding sitting of Chief Justice\'s Court at 10.30 A.M. on 22.12.2025 (Monday)' },
                { type: 'Latest Update', text: 'Helpline numbers of Court Masters and Moderators for 19.12.2025' },
                { type: 'Latest Update', text: 'Updated court timings for winter session 2025' },
                { type: 'Latest Update', text: 'New e-filing guidelines effective from January 2025' },
                { type: 'Latest Update', text: 'Court holiday list for 2025 published' },
            ],
            judgments: [
                { type: 'Judgment', text: 'KOUSIK PAL VS. BM BIRLA HEART RESEARCH CENTRE - C.A. No. 15066/2025', download: true },
                { type: 'Judgment', text: 'AMIT ARYA VS. KAMLESH KUMARI - C.A. No. 15069/2025', download: true },
                { type: 'Judgment', text: 'SYED SHAHNAWAZ ALI VS. THE STATE OF MADHYA PRADESH - Crl.A. No. 5589-5590/2025', download: true },
                { type: 'Judgment', text: 'MAHESH KUMAR AGARWAL VS. UNION OF INDIA - C.A. No. 15096/2025', download: true },
                { type: 'Judgment', text: 'RAJESH KUMAR VS. STATE OF BIHAR - Criminal Appeal No. 1234/2025', download: true },
            ],
            orders: [
                { type: 'Order', text: 'Order in Civil Appeal No. 12345/2025 dated 20.12.2025', download: true },
                { type: 'Order', text: 'Interim order in Writ Petition No. 6789/2025', download: true },
                { type: 'Order', text: 'Order regarding adjournment in SLP No. 9876/2025' },
                { type: 'Order', text: 'Stay order in Transfer Petition No. 5432/2025', download: true },
                { type: 'Order', text: 'Direction order in Contempt Petition No. 3210/2025' },
            ],
            notices: [
                { type: 'Listing Notice', text: 'Notice regarding cancellation of Court No.10 on 19.12.2025 (Friday)' },
                { type: 'Listing Notice', text: 'List of oral mentioning matters before Hon\'ble Courts on 19.12.25.' },
                { type: 'Listing Notice', text: 'Notice regarding deletion of Chamber matter listed in Court no. 6 on 19.12.2025 (Friday)' },
                { type: 'Listing Notice', text: 'Special sitting notice for urgent matters on 23.12.2025' },
                { type: 'Listing Notice', text: 'Revised cause list for Court No. 1 dated 22.12.2025' },
                { type: 'Listing Notice', text: 'Notice for video conferencing hearing on 24.12.2025' },
            ],
        };
        return contentMap[tab] || contentMap.updates;
    };

    return (
        <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A2342] mb-6">Latest Information</h2>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-[550px]">
                {/* Tab Buttons */}
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b-2 border-gray-200">
                    <button
                        onClick={() => setActiveTab('updates')}
                        className={`px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'updates'
                            ? 'bg-[#0A2342] text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#C9A227] hover:text-[#C9A227]'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        </svg>
                        Updates
                    </button>
                    <button
                        onClick={() => setActiveTab('judgments')}
                        className={`px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'judgments'
                            ? 'bg-[#C9A227] text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#C9A227] hover:text-[#C9A227]'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Judgments
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'orders'
                            ? 'bg-[#0A2342] text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#C9A227] hover:text-[#C9A227]'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('notices')}
                        className={`px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'notices'
                            ? 'bg-[#0A2342] text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#C9A227] hover:text-[#C9A227]'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Listing Notices
                    </button>
                </div>

                {/* Information List - Fixed Height with Scroll */}
                <div className="overflow-y-auto p-5 md:p-6 max-h-[400px]">
                    <div className="space-y-3.5">
                        {getTabContent(activeTab).map((notice, index) => (
                            <div key={index} className="flex items-start gap-2.5 pb-3.5 border-b border-gray-200 last:border-0">
                                <span className="text-[#C9A227] mt-0.5">▸</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className="px-2.5 py-1 bg-[#C9A227] text-white text-xs font-semibold rounded whitespace-nowrap">
                                            {notice.type}
                                        </span>
                                        {notice.download && (
                                            <button className="px-3 py-1 bg-[#0A2342] text-white text-xs font-medium rounded hover:bg-[#1a3a75] transition-colors">
                                                download
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{notice.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
