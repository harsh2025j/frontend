"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/data/features/auth/useAuthActions";

export default function MembershipPromotion() {
    const { user, isAuthenticated } = useAuth();

    // Check if user is just a plain 'user'
    const roles = user?.roles?.map((r: any) => r.name.toLowerCase()) || [];
    const isPlainUser = isAuthenticated && roles.length === 1 && roles.includes("user");

    // Only show to newly registered plain users
    if (!isPlainUser) return null;

    const benefits = [
        {
            title: "Professional Visibility",
            description: "Get listed in our premium directory and reach thousands of potential clients looking for legal expertise.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )
        },
        {
            title: "Verified Badge",
            description: "Gain trust with a 'Verified Advocate' badge on your profile after our secure verification process.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            title: "Case Management",
            description: "Upload and manage your judgments, track case statuses, and build a digital portfolio of your successes.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        },
        {
            title: "AI Legal Assistant",
            description: "Access exclusive AI tools to summarize lengthy case files and research precedents in seconds.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        }
    ];

    return (
        <div className="container mx-auto px-4 my-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative overflow-hidden bg-white rounded-3xl border border-[#0A2342]/10 shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#C8A028]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-[#0A2342]/5 rounded-full blur-3xl"></div>

                <div className="relative flex flex-col lg:flex-row items-stretch">
                    {/* Left Side: Call to Action */}
                    <div className="lg:w-2/5 bg-[#0A2342] p-8 md:p-12 text-white flex flex-col justify-center">
                        <div className="inline-block bg-[#C8A028] text-white text-[10px] font-extrabold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6 shadow-lg shadow-[#C8A028]/20">
                            Professional Membership
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
                            Become a <span className="text-[#C8A028]">Verified Advocate</span>
                        </h2>
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
                            Join our elite network of legal professionals. Create a verified profile to reach more clients, manage cases efficiently, and leverage cutting-edge AI tools.
                        </p>

                        <Link href="/admin/membership" className="group">
                            <button className="w-full bg-white text-[#0A2342] font-bold py-4 px-8 rounded-xl shadow-xl hover:bg-[#C8A028] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 active:scale-95">
                                Start Your Membership
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        </Link>

                        <p className="mt-6 text-center text-xs text-gray-400">
                            Quick verification process • Secure professional profile
                        </p>
                    </div>

                    {/* Right Side: Features Grid */}
                    <div className="lg:w-3/5 p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {benefits.map((benefit, idx) => (
                                <div key={idx} className="group p-6 rounded-2xl border border-gray-50 hover:border-[#C8A028]/20 hover:bg-gray-50/50 transition-all duration-300">
                                    <div className="w-12 h-12 bg-[#0A2342]/5 rounded-xl flex items-center justify-center text-[#0A2342] group-hover:bg-[#C8A028] group-hover:text-white transition-all duration-300 mb-4">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0A2342] mb-2 group-hover:text-[#C8A028] transition-colors">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
