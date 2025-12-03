"use client";

import { Scale, BookOpen, FileText, Award } from "lucide-react";

export default function SupremeCourt() {
    const recentCases = [
        {
            title: "Digital Privacy Rights vs. National Security",
            caseNumber: "SLP (C) No. 12345/2025",
            date: "November 30, 2025",
            bench: "5-Judge Constitution Bench",
            status: "Judgment Reserved"
        },
        {
            title: "Environmental Protection in Industrial Zones",
            caseNumber: "Civil Appeal No. 6789/2025",
            date: "November 28, 2025",
            bench: "3-Judge Bench",
            status: "Disposed"
        },
        {
            title: "Fundamental Rights and State Action",
            caseNumber: "Writ Petition (C) No. 3456/2025",
            date: "November 25, 2025",
            bench: "2-Judge Bench",
            status: "Pending"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-[#122340] via-[#1A73E8] to-[#122340] text-white py-20 lg:py-32 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="flex flex-col items-center justify-center gap-6 mb-6">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl animate-pulse">
                            <Scale className="w-16 h-16" />
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center">
                            Supreme Court
                        </h1>
                    </div>
                    <p className="text-xl md:text-2xl text-center text-blue-100 max-w-3xl mx-auto">
                        Latest Judgments, Orders, and Legal Updates from the Supreme Court of India
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
                {/* Introduction */}
                <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-blue-100">
                    <h2 className="text-3xl font-bold text-[#122340] mb-6">About Supreme Court Coverage</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Stay updated with the latest developments from the Supreme Court of India. Our comprehensive coverage includes landmark judgments, constitutional matters, and significant legal precedents that shape the legal landscape of the nation.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        We provide detailed analysis, case summaries, and expert commentary on Supreme Court proceedings to help legal professionals and citizens understand the implications of judicial decisions.
                    </p>
                </div>

                {/* Recent Cases */}
                <h2 className="text-3xl font-bold text-[#122340] mb-8">Recent Cases</h2>
                <div className="space-y-6 mb-12">
                    {recentCases.map((case_, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl hover:border-[#1A73E8] transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-[#122340] mb-2">{case_.title}</h3>
                                    <p className="text-gray-600 mb-2">{case_.caseNumber}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${case_.status === 'Disposed' ? 'bg-green-100 text-green-700' :
                                        case_.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {case_.status}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#1A73E8]" />
                                    <span><strong>Date:</strong> {case_.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-[#1A73E8]" />
                                    <span><strong>Bench:</strong> {case_.bench}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Categories */}
                <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-2xl shadow-xl p-10 text-white">
                    <h2 className="text-3xl font-bold mb-8 text-center">Case Categories</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            "Constitutional Law",
                            "Criminal Law",
                            "Civil Law",
                            "Tax Law",
                            "Corporate Law",
                            "Environmental Law",
                            "Family Law",
                            "Property Law",
                            "Labour Law"
                        ].map((category, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 border border-white/20 text-center">
                                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                                <span className="font-medium">{category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="bg-[#122340] text-white py-8">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm md:text-base text-blue-200">
                        © {new Date().getFullYear()} Sajjad Husain Law Associates. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
