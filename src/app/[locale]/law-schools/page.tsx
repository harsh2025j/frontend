"use client";

import { GraduationCap, BookOpen, Users, Award, Calendar, MapPin } from "lucide-react";

export default function LawSchools() {
    const opportunities = [
        {
            title: "National Moot Court Competition 2025",
            institution: "National Law University, Delhi",
            date: "December 15-18, 2025",
            type: "Competition",
            eligibility: "All Law Students"
        },
        {
            title: "Research Assistant Position",
            institution: "Supreme Court Legal Aid Committee",
            date: "Applications Open",
            type: "Internship",
            eligibility: "Final Year Students"
        },
        {
            title: "International Law Conference",
            institution: "Indian Law Institute",
            date: "January 10-12, 2026",
            type: "Conference",
            eligibility: "Students & Professionals"
        },
        {
            title: "Legal Writing Workshop",
            institution: "Bar Council of India",
            date: "December 20, 2025",
            type: "Workshop",
            eligibility: "Law Students"
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
                            <GraduationCap className="w-16 h-16" />
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center">
                            Law Schools Corner
                        </h1>
                    </div>
                    <p className="text-xl md:text-2xl text-center text-blue-100 max-w-3xl mx-auto">
                        Resources, Opportunities, and Updates for Law Students
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
                {/* Introduction */}
                <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-blue-100">
                    <h2 className="text-3xl font-bold text-[#122340] mb-6">Welcome to Law Schools Corner</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Your comprehensive resource hub for law school students. Discover opportunities for competitions, internships, scholarships, and professional development. Stay connected with the latest updates from law schools across India.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    {[
                        { icon: Award, title: "Competitions", link: "/competitions" },
                        { icon: Users, title: "Internships", link: "/internships" },
                        { icon: BookOpen, title: "Scholarships", link: "/scholarships" },
                        { icon: GraduationCap, title: "Admissions", link: "/admissions" }
                    ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <a
                                key={index}
                                href={item.link}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-[#1A73E8] group"
                            >
                                <Icon className="w-12 h-12 mx-auto mb-4 text-[#1A73E8] group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-bold text-[#122340]">{item.title}</h3>
                            </a>
                        );
                    })}
                </div>

                {/* Latest Opportunities */}
                <h2 className="text-3xl font-bold text-[#122340] mb-8">Latest Opportunities</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {opportunities.map((opp, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl hover:border-[#1A73E8] transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-[#122340] flex-1">{opp.title}</h3>
                                <span className="px-3 py-1 bg-blue-100 text-[#1A73E8] rounded-full text-xs font-semibold whitespace-nowrap ml-2">
                                    {opp.type}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#1A73E8]" />
                                    <span>{opp.institution}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#1A73E8]" />
                                    <span>{opp.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#1A73E8]" />
                                    <span>{opp.eligibility}</span>
                                </div>
                            </div>
                            <button className="mt-6 w-full bg-gradient-to-r from-[#1A73E8] to-[#122340] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                                Learn More
                            </button>
                        </div>
                    ))}
                </div>

                {/* Featured Law Schools */}
                <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-2xl shadow-xl p-10 text-white">
                    <h2 className="text-3xl font-bold mb-8 text-center">Featured Law Schools</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            "National Law School of India University, Bangalore",
                            "National Law University, Delhi",
                            "NALSAR University of Law, Hyderabad",
                            "West Bengal National University of Juridical Sciences",
                            "National Law Institute University, Bhopal",
                            "Gujarat National Law University, Gandhinagar"
                        ].map((school, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                                <GraduationCap className="w-8 h-8 mb-3" />
                                <p className="text-sm leading-relaxed">{school}</p>
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
