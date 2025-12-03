"use client";

import { FileText, Scale, Users, AlertCircle, CheckCircle, Shield, BookOpen, Gavel } from "lucide-react";

export default function TermsAndConditions() {
    const lastUpdated = "December 1, 2025";

    const sections = [
        {
            icon: FileText,
            title: "Acceptance of Terms",
            content: [
                {
                    subtitle: "Agreement to Terms",
                    text: "By accessing and using the services provided by Sajjad Husain Law Associates, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services."
                },
                {
                    subtitle: "Modifications",
                    text: "We reserve the right to modify these terms at any time. Your continued use of our services following any changes indicates your acceptance of the new terms."
                }
            ]
        },
        {
            icon: Users,
            title: "User Obligations",
            content: [
                {
                    subtitle: "Account Responsibility",
                    text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use."
                },
                {
                    subtitle: "Accurate Information",
                    text: "You agree to provide accurate, current, and complete information when using our services and to update such information to keep it accurate, current, and complete."
                },
                {
                    subtitle: "Prohibited Activities",
                    text: "You may not use our services for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction while using our services."
                }
            ]
        },
        {
            icon: Scale,
            title: "Legal Services",
            content: [
                {
                    subtitle: "Attorney-Client Relationship",
                    text: "Use of this website does not create an attorney-client relationship. An attorney-client relationship is established only through a formal engagement agreement."
                },
                {
                    subtitle: "No Legal Advice",
                    text: "Information provided on this website is for general informational purposes only and does not constitute legal advice. You should not act upon any information without seeking professional legal counsel."
                },
                {
                    subtitle: "Jurisdiction",
                    text: "Our legal services are primarily focused on matters within the jurisdiction of Indian courts. We may not be able to provide services for matters outside our areas of expertise or jurisdiction."
                }
            ]
        },
        {
            icon: Shield,
            title: "Intellectual Property",
            content: [
                {
                    subtitle: "Ownership",
                    text: "All content on this website, including text, graphics, logos, images, and software, is the property of Sajjad Husain Law Associates or its content suppliers and is protected by intellectual property laws."
                },
                {
                    subtitle: "Limited License",
                    text: "You are granted a limited, non-exclusive, non-transferable license to access and use our website for personal, non-commercial purposes only."
                },
                {
                    subtitle: "Restrictions",
                    text: "You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from our website without our express written permission."
                }
            ]
        },
        {
            icon: AlertCircle,
            title: "Disclaimers and Limitations",
            content: [
                {
                    subtitle: "No Warranties",
                    text: "Our services are provided 'as is' without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement."
                },
                {
                    subtitle: "Limitation of Liability",
                    text: "To the fullest extent permitted by law, Sajjad Husain Law Associates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services."
                },
                {
                    subtitle: "Third-Party Links",
                    text: "Our website may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of these external sites."
                }
            ]
        },
        {
            icon: BookOpen,
            title: "Privacy and Data Protection",
            content: [
                {
                    subtitle: "Privacy Policy",
                    text: "Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information."
                },
                {
                    subtitle: "Data Security",
                    text: "While we implement reasonable security measures to protect your information, we cannot guarantee absolute security of data transmitted over the internet."
                },
                {
                    subtitle: "Confidentiality",
                    text: "We maintain strict confidentiality standards for all client information in accordance with professional legal ethics and applicable laws."
                }
            ]
        },
        {
            icon: Gavel,
            title: "Dispute Resolution",
            content: [
                {
                    subtitle: "Governing Law",
                    text: "These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions."
                },
                {
                    subtitle: "Jurisdiction",
                    text: "Any disputes arising out of or relating to these terms or our services shall be subject to the exclusive jurisdiction of the courts in Lucknow, Uttar Pradesh."
                },
                {
                    subtitle: "Arbitration",
                    text: "Before initiating any legal proceedings, parties agree to attempt to resolve disputes through good faith negotiations and, if necessary, mediation or arbitration."
                }
            ]
        },
        {
            icon: CheckCircle,
            title: "General Provisions",
            content: [
                {
                    subtitle: "Severability",
                    text: "If any provision of these terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the remaining terms remain in full force and effect."
                },
                {
                    subtitle: "Entire Agreement",
                    text: "These terms constitute the entire agreement between you and Sajjad Husain Law Associates regarding the use of our services and supersede all prior agreements."
                },
                {
                    subtitle: "Waiver",
                    text: "No waiver of any term of these terms shall be deemed a further or continuing waiver of such term or any other term, and our failure to assert any right under these terms shall not constitute a waiver of such right."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-[#122340] via-[#1A73E8] to-[#122340] text-white py-20 lg:py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="flex flex-col items-center justify-center gap-6 mb-6">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl animate-pulse">
                            <FileText className="w-16 h-16" />
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center">
                            Terms & Conditions
                        </h1>
                    </div>
                    <p className="text-xl md:text-2xl text-center text-blue-100 max-w-3xl mx-auto mb-4">
                        Please read these terms carefully before using our services
                    </p>
                    <p className="text-center text-base text-blue-200">
                        Last Updated: <span className="font-semibold">{lastUpdated}</span>
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
                {/* Introduction */}
                <div className="bg-white rounded-2xl shadow-lg p-10 mb-8 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-xl">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-[#122340] mb-4">Introduction</h2>
                            <p className="text-base text-gray-700 leading-relaxed mb-4">
                                Welcome to Sajjad Husain Law Associates. These Terms and Conditions ("Terms") govern your access to and use of our website, services, and any related applications (collectively, the "Services").
                            </p>
                            <p className="text-base text-gray-700 leading-relaxed">
                                By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use our Services.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Sections */}
                <div className="space-y-8">
                    {sections.map((section, index) => {
                        const IconComponent = section.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-lg p-10 border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-[#1A73E8] to-[#122340] p-4 rounded-xl flex-shrink-0">
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-bold text-[#122340]">{section.title}</h2>
                                </div>

                                <div className="space-y-6">
                                    {section.content.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="pl-6 border-l-4 border-blue-200 hover:border-blue-400 transition-colors duration-300"
                                        >
                                            <h3 className="text-xl font-semibold text-[#1A73E8] mb-2">
                                                {item.subtitle}
                                            </h3>
                                            <p className="text-base text-gray-700 leading-relaxed">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-2xl shadow-lg p-10 text-white mt-8">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-center">Questions About These Terms?</h2>
                    <p className="text-base text-blue-100 leading-relaxed mb-6 text-center max-w-3xl mx-auto">
                        If you have any questions or concerns about these Terms and Conditions, please don't hesitate to contact us. We're here to help clarify any points and ensure you have a clear understanding of our terms.
                    </p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a
                                    href="mailto:sajjadhusainlawassociates@gmail.com"
                                    className="underline hover:text-blue-200 transition-colors break-all"
                                >
                                    sajjadhusainlawassociates@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href="tel:07080909786" className="hover:text-blue-200 transition-colors">
                                    070809 09786
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acknowledgment */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-xl p-6 mt-8 shadow-md">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="bg-amber-100 p-2 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-amber-900 mb-2">Important Notice</h3>
                            <p className="text-base text-amber-800 leading-relaxed">
                                By using our Services, you acknowledge that you have read these Terms and Conditions in their entirety and agree to be bound by them. These terms are legally binding and enforceable. Please ensure you understand all provisions before proceeding.
                            </p>
                        </div>
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
