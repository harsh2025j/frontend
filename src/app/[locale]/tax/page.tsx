"use client";

import { Calculator, FileText } from "lucide-react";

export default function Tax() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="relative bg-gradient-to-r from-[#122340] via-[#1A73E8] to-[#122340] text-white py-20 lg:py-32 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl"></div>
                </div>
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="flex flex-col items-center justify-center gap-6 mb-6">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl animate-pulse">
                            <Calculator className="w-16 h-16" />
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center">Tax Law</h1>
                    </div>
                    <p className="text-xl md:text-2xl text-center text-blue-100 max-w-3xl mx-auto">
                        Latest Tax Updates, Amendments, and Legal Insights
                    </p>
                </div>
            </div>
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white rounded-2xl shadow-xl p-10 border border-blue-100">
                    <h2 className="text-3xl font-bold text-[#122340] mb-6">Tax Law Updates</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Stay updated with the latest developments in tax law, including GST, income tax, corporate tax, and international taxation. Expert analysis and compliance guidance.
                    </p>
                </div>
            </div>
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
