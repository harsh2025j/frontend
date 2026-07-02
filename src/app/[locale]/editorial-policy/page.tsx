"use client";

import { Shield, FileText, Users, Mail, AlertCircle, CheckCircle, MapPin, Scale, Search, Edit3 } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";


export default function EditorialPolicy() {
    useDocTitle("Editorial Policy | Sajjad Husain Law Associates");
    const lastUpdated = "July 02, 2026";

    const sections = [
        {
            icon: Scale,
            title: "Accuracy and Objectivity",
            content: [
                {
                    subtitle: "Factual Accuracy",
                    text: "We are committed to providing precise and reliable legal news, judgments, and case updates. All facts are verified against official records before publication."
                },
                {
                    subtitle: "Unbiased Reporting",
                    text: "Our editorial team ensures that all articles and analyses remain impartial, avoiding personal bias or unsupported opinions to maintain the integrity of legal reporting."
                }
            ]
        },
        {
            icon: Search,
            title: "Fact-Checking and Sources",
            content: [
                {
                    subtitle: "Primary Sources",
                    text: "We prioritize primary legal sources, such as official High Court and Supreme Court judgments, legislative documents, and verified government press releases."
                },
                {
                    subtitle: "Rigorous Verification",
                    text: "Our legal experts and editors cross-reference information with multiple credible sources before publishing any legal analysis or news alert."
                }
            ]
        },
        {
            icon: Edit3,
            title: "Corrections and Updates",
            content: [
                {
                    subtitle: "Prompt Corrections",
                    text: "If a factual error is identified in our reporting, we promptly correct the text and add a clear editorial note explaining the nature of the change."
                },
                {
                    subtitle: "Living Documents",
                    text: "As legal cases evolve and new precedent-setting judgments are passed, we actively update relevant past articles to reflect the current legal standing."
                }
            ]
        },
        {
            icon: Shield,
            title: "Editorial Independence",
            content: [
                {
                    subtitle: "No External Influence",
                    text: "Our editorial decisions are made independently of advertisers, sponsors, law firms, or external political pressures."
                },
                {
                    subtitle: "Clear Distinctions",
                    text: "We strictly separate our independent journalistic content from sponsored posts or advertisements, which are always clearly labeled as such."
                }
            ]
        },
        {
            icon: Users,
            title: "Who Writes the Content?",
            content: [
                {
                    subtitle: "Legal Professionals",
                    text: "Our content is authored by experienced advocates, legal researchers, and qualified law professionals who possess a deep understanding of the Indian legal framework."
                },
                {
                    subtitle: "Expert Contributors",
                    text: "We frequently collaborate with subject-matter experts and senior counsels to provide authoritative insights and nuanced interpretations of complex legal matters."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-[#0A2342] text-white py-16  px-4 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="container mx-auto max-w-5xl relative z-10 text-center">
                    {/* <div className="inline-flex items-center justify-center p-3 bg-white/5 backdrop-blur-sm rounded-2xl mb-6 border border-white/10">
                        <FileText className="w-10 h-10 text-[#C9A227]" />
                    </div> */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                        Editorial Policy
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Our commitment to accuracy, integrity, and transparency in delivering India's premier legal news and judgment analysis.
                    </p>
                    <div className="inline-block px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <p className="text-sm text-gray-300">
                            Last Updated: <span className="font-semibold text-[#C9A227]">{lastUpdated}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
                {/* Introduction */}
                <div className="bg-gray-50 rounded-2xl p-8 sm:p-10 mb-12 border border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="flex-shrink-0">
                            <div className="bg-[#0A2342] p-3 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-[#C9A227]" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-[#0A2342] mb-4">Our Commitment</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    At Sajjad Husain Law Associates, our primary mission is to provide the legal community and the general public with accurate, timely, and unbiased legal news and case analyses.
                                </p>
                                <p>
                                    This Editorial Policy outlines the core principles and journalistic standards that govern our content creation, ensuring we maintain the highest level of integrity and trust with our readers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Sections */}
                <div className="grid gap-8">
                    {sections.map((section, index) => {
                        const IconComponent = section.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#C9A227]/30 transition-colors duration-300"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-[#0A2342]/5 p-3 rounded-xl">
                                        <IconComponent className="w-6 h-6 text-[#0A2342]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#0A2342]">{section.title}</h2>
                                </div>

                                <div className="grid sm:grid-cols-1 gap-6">
                                    {section.content.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="group"
                                        >
                                            <h3 className="text-lg font-semibold text-[#0A2342] mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                                                {item.subtitle}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed pl-3.5 border-l border-gray-100 group-hover:border-[#C9A227] transition-colors duration-300">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Contact Section */}
                <div className="mt-16 bg-[#0A2342] rounded-2xl p-8 sm:p-12 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A227] rounded-full blur-3xl opacity-10 transform translate-x-1/3 -translate-y-1/3"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between">
                            <div className="max-w-xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-white/10 p-3 rounded-xl">
                                        <Mail className="w-6 h-6 text-[#C9A227]" />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold">Feedback & Corrections</h2>
                                </div>
                                <p className="text-gray-300 mb-8 leading-relaxed">
                                    We encourage our readers to hold us accountable. If you believe an article contains a factual error or breaches our editorial standards, please contact our editorial team.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 min-w-[300px]">
                                <a
                                    href="mailto:sajjadhusainlawassociates@gmail.com"
                                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                                >
                                    <Mail className="w-5 h-5 text-[#C9A227]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Email Editors</span>
                                        <span className="text-sm font-medium break-all group-hover:text-[#C9A227] transition-colors">
                                            sajjadhusainlawassociates@gmail.com
                                        </span>
                                    </div>
                                </a>
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <MapPin className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Office</span>
                                        <span className="text-sm font-medium leading-relaxed">
                                            Block-C, High Court, Advocates Chamber.515,<br />
                                            Lucknow - Ayodhya Rd, Gomti Nagar,<br />
                                            Lucknow 226010
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
