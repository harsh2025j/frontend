"use client";

import { Briefcase, TrendingUp, Users, Award, Heart, Lightbulb, GraduationCap, Code } from "lucide-react";

export default function Careers() {
    const openPositions = [
        {
            title: "Senior Legal Associate",
            department: "Litigation",
            location: "Lucknow, Uttar Pradesh",
            type: "Full-time",
            experience: "5-8 years",
            description: "We are seeking an experienced legal associate to join our litigation team. The ideal candidate should have strong courtroom experience and excellent research skills."
        },
        {
            title: "Junior Legal Associate",
            department: "Corporate Law",
            location: "Lucknow, Uttar Pradesh",
            type: "Full-time",
            experience: "1-3 years",
            description: "Looking for a motivated junior associate with a passion for corporate law. Fresh graduates with exceptional academic records are encouraged to apply."
        },
        {
            title: "Legal Research Analyst",
            department: "Research",
            location: "Lucknow, Uttar Pradesh",
            type: "Full-time",
            experience: "2-4 years",
            description: "Join our research team to conduct comprehensive legal research and analysis. Strong analytical and writing skills required."
        },
        {
            title: "Paralegal",
            department: "Support",
            location: "Lucknow, Uttar Pradesh",
            type: "Full-time",
            experience: "1-2 years",
            description: "Assist our legal team with case preparation, document management, and client communication. Detail-oriented individuals preferred."
        },
        {
            title: "Content Writer (Legal)",
            department: "Marketing",
            location: "Remote",
            type: "Full-time/Part-time",
            experience: "2-3 years",
            description: "Create engaging legal content for our website, blog, and social media. Law degree or legal background preferred."
        },
        {
            title: "Legal Intern",
            department: "Various",
            location: "Lucknow, Uttar Pradesh",
            type: "Internship",
            experience: "Law Students",
            description: "Gain hands-on experience in a professional legal environment. Open to law students in their final years."
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
                            <Briefcase className="w-16 h-16" />
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center">
                            Careers
                        </h1>
                    </div>
                    <p className="text-xl md:text-2xl text-center text-blue-100 max-w-3xl mx-auto">
                        Join Our Team of Legal Professionals and Make a Difference
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
                {/* Why Join Us */}
                <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-blue-100 hover:shadow-2xl transition-all duration-300">
                    <h2 className="text-4xl font-bold text-[#122340] mb-8 text-center">Why Join Sajjad Husain Law Associates?</h2>
                    <p className="text-lg text-gray-700 leading-relaxed text-center mb-8 max-w-4xl mx-auto">
                        We believe in nurturing talent and providing opportunities for professional growth. Join a team that values excellence, innovation, and commitment to justice.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: TrendingUp, title: "Career Growth", desc: "Clear pathways for professional advancement" },
                            { icon: Users, title: "Collaborative Culture", desc: "Work with experienced legal professionals" },
                            { icon: Award, title: "Recognition", desc: "Performance-based rewards and recognition" },
                            { icon: Heart, title: "Work-Life Balance", desc: "Flexible working arrangements" }
                        ].map((benefit, index) => {
                            const IconComponent = benefit.icon;
                            return (
                                <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300 border border-blue-100">
                                    <div className="inline-flex items-center justify-center bg-gradient-to-br from-[#1A73E8] to-[#122340] p-4 rounded-full mb-4">
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-[#122340] mb-2">{benefit.title}</h4>
                                    <p className="text-sm text-gray-600">{benefit.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Benefits & Perks */}
                <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-2xl shadow-xl p-10 text-white mb-8">
                    <h2 className="text-4xl font-bold mb-8 text-center">Benefits & Perks</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: GraduationCap, title: "Learning & Development", items: ["CLE Programs", "Skill Workshops", "Mentorship", "Conference Attendance"] },
                            { icon: Heart, title: "Health & Wellness", items: ["Health Insurance", "Wellness Programs", "Mental Health Support", "Gym Membership"] },
                            { icon: Lightbulb, title: "Work Environment", items: ["Modern Office", "Latest Technology", "Library Access", "Collaborative Spaces"] }
                        ].map((category, index) => {
                            const IconComponent = category.icon;
                            return (
                                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <IconComponent className="w-8 h-8" />
                                        <h3 className="text-2xl font-bold">{category.title}</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {category.items.map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Open Positions */}
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#122340] mb-8 text-center">Current Openings</h2>
                    <div className="space-y-6">
                        {openPositions.map((position, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl hover:border-[#1A73E8] transition-all duration-300">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="bg-gradient-to-br from-[#1A73E8] to-[#122340] p-3 rounded-xl flex-shrink-0">
                                                <Briefcase className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-[#122340] mb-2">{position.title}</h3>
                                                <div className="flex flex-wrap gap-3 mb-3">
                                                    <span className="px-3 py-1 bg-blue-100 text-[#1A73E8] rounded-full text-sm font-medium">
                                                        {position.department}
                                                    </span>
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                        {position.type}
                                                    </span>
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                        {position.experience}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-4">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{position.location}</span>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">{position.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="lg:self-start bg-gradient-to-r from-[#1A73E8] to-[#122340] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap">
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Application Process */}
                <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-blue-100">
                    <h2 className="text-4xl font-bold text-[#122340] mb-8 text-center">Application Process</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: "1", title: "Submit Application", desc: "Send your resume and cover letter" },
                            { step: "2", title: "Initial Screening", desc: "Our team reviews your application" },
                            { step: "3", title: "Interview", desc: "Meet with our hiring team" },
                            { step: "4", title: "Offer", desc: "Receive and accept your offer" }
                        ].map((process, index) => (
                            <div key={index} className="relative">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#1A73E8] to-[#122340] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                        {process.step}
                                    </div>
                                    <h4 className="text-xl font-bold text-[#122340] mb-2">{process.title}</h4>
                                    <p className="text-gray-600">{process.desc}</p>
                                </div>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#1A73E8] to-[#122340] -z-10"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact for Careers */}
                <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-2xl shadow-xl p-10 text-white text-center">
                    <h2 className="text-4xl font-bold mb-4">Don't See the Right Position?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
                    </p>
                    <a
                        href="mailto:sajjadhusainlawassociates@gmail.com?subject=Career Inquiry"
                        className="inline-block bg-white text-[#122340] px-8 py-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                        Send Your Resume
                    </a>
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
