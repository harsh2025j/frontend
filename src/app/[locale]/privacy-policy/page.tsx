"use client";

import { Shield, Lock, Eye, FileText, Users, Mail, AlertCircle, CheckCircle, MapPin } from "lucide-react";

export default function PrivacyPolicy() {
    const lastUpdated = "November 30, 2025";

    const sections = [
        {
            icon: FileText,
            title: "Information We Collect",
            content: [
                {
                    subtitle: "Personal Information",
                    text: "We collect information that you provide directly to us, including but not limited to your name, email address, phone number, and any other information you choose to provide when using our services."
                },
                {
                    subtitle: "Usage Data",
                    text: "We automatically collect certain information about your device and how you interact with our services, including IP address, browser type, pages visited, and time spent on pages."
                },
                {
                    subtitle: "Legal Research Data",
                    text: "Information related to your legal research activities, saved cases, notes, and preferences to enhance your experience on our platform."
                }
            ]
        },
        {
            icon: Eye,
            title: "How We Use Your Information",
            content: [
                {
                    subtitle: "Service Delivery",
                    text: "To provide, maintain, and improve our legal research and AI-powered services, including personalized content and recommendations."
                },
                {
                    subtitle: "Communication",
                    text: "To send you updates, newsletters, and important information about our services, including legal updates and new features."
                },
                {
                    subtitle: "Analytics",
                    text: "To understand how users interact with our platform and improve user experience through data-driven insights."
                },
                {
                    subtitle: "Legal Compliance",
                    text: "To comply with legal obligations, resolve disputes, and enforce our agreements."
                }
            ]
        },
        {
            icon: Lock,
            title: "Data Security",
            content: [
                {
                    subtitle: "Encryption",
                    text: "We use industry-standard encryption protocols to protect your data during transmission and storage."
                },
                {
                    subtitle: "Access Controls",
                    text: "Strict access controls ensure that only authorized personnel can access your personal information."
                },
                {
                    subtitle: "Regular Audits",
                    text: "We conduct regular security audits and assessments to identify and address potential vulnerabilities."
                }
            ]
        },
        {
            icon: Users,
            title: "Information Sharing",
            content: [
                {
                    subtitle: "Third-Party Service Providers",
                    text: "We may share your information with trusted third-party service providers who assist us in operating our platform, conducting business, or serving our users."
                },
                {
                    subtitle: "Legal Requirements",
                    text: "We may disclose your information if required by law or in response to valid requests by public authorities."
                },
                {
                    subtitle: "Business Transfers",
                    text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction."
                }
            ]
        },
        {
            icon: Shield,
            title: "Your Rights",
            content: [
                {
                    subtitle: "Access and Correction",
                    text: "You have the right to access, update, or correct your personal information at any time through your account settings."
                },
                {
                    subtitle: "Data Deletion",
                    text: "You may request deletion of your personal data, subject to certain legal obligations we may have to retain certain information."
                },
                {
                    subtitle: "Opt-Out",
                    text: "You can opt out of receiving promotional communications from us by following the unsubscribe instructions in those communications."
                },
                {
                    subtitle: "Data Portability",
                    text: "You have the right to request a copy of your personal data in a structured, commonly used format."
                }
            ]
        },
        {
            icon: AlertCircle,
            title: "Cookies and Tracking",
            content: [
                {
                    subtitle: "Essential Cookies",
                    text: "We use essential cookies that are necessary for the operation of our website and services."
                },
                {
                    subtitle: "Analytics Cookies",
                    text: "We use analytics cookies to understand how visitors interact with our website and improve user experience."
                },
                {
                    subtitle: "Preference Cookies",
                    text: "These cookies allow our website to remember your preferences and provide enhanced, personalized features."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-[#0A2342] text-white py-16 sm:py-20 md:py-24 px-4 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="container mx-auto max-w-5xl relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 backdrop-blur-sm rounded-2xl mb-6 border border-white/10">
                        <Shield className="w-10 h-10 text-[#C9A227]" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Your privacy is our priority. We are committed to protecting your personal information with the highest standards of security and transparency.
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
                            <h2 className="text-2xl font-bold text-[#0A2342] mb-4">Introduction</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Welcome to Sajjad Husain Law Associates ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                                </p>
                                <p>
                                    By accessing or using our services, you agree to the terms outlined in this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
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
                                    <h2 className="text-2xl sm:text-3xl font-bold">Contact Us</h2>
                                </div>
                                <p className="text-gray-300 mb-8 leading-relaxed">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please don't hesitate to contact us.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 min-w-[300px]">
                                <a
                                    href="mailto:sajjadhusainlawassociates@gmail.com"
                                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                                >
                                    <Mail className="w-5 h-5 text-[#C9A227]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Email Us</span>
                                        <span className="text-sm font-medium break-all group-hover:text-[#C9A227] transition-colors">
                                            sajjadhusainlawassociates@gmail.com
                                        </span>
                                    </div>
                                </a>
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <MapPin className="w-5 h-5 text-[#C9A227]" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Visit Us</span>
                                        <span className="text-sm font-medium">Sajjad Husain Law Associates</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Changes & Consent Grid */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    {/* Changes to Policy */}
                    <div className="bg-[#FFF9E6] border border-[#C9A227]/20 rounded-2xl p-6 sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="bg-[#C9A227]/10 p-2 rounded-lg flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-[#C9A227]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#0A2342] mb-3">Changes to Policy</h3>
                                <p className="text-sm text-[#0A2342]/70 leading-relaxed">
                                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Consent */}
                    <div className="bg-[#F0FDF4] border border-green-200 rounded-2xl p-6 sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#0A2342] mb-3">Your Consent</h3>
                                <p className="text-sm text-[#0A2342]/70 leading-relaxed">
                                    By using our website and services, you consent to our Privacy Policy and agree to its terms. Your continued use of our services implies acceptance of any changes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
