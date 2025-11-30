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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-[#122340] via-[#1A73E8] to-[#122340] text-white py-12 sm:py-16 md:py-20 lg:py-24 px-4 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 sm:w-64 sm:h-64 bg-blue-300 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
                        <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl">
                            <Shield className="w-12 h-12 sm:w-16 sm:h-16 animate-pulse" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center sm:text-left">
                            Privacy Policy
                        </h1>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl text-center text-blue-100 mb-3 sm:mb-4 px-4">
                        Your privacy is our priority. We are committed to protecting your personal information.
                    </p>
                    <p className="text-center text-sm sm:text-base text-blue-200">
                        Last Updated: <span className="font-semibold">{lastUpdated}</span>
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                {/* Introduction */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#122340] mb-3 sm:mb-4">Introduction</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">
                                Welcome to Sajjad Husain Law Associates ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                            </p>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                By accessing or using our services, you agree to the terms outlined in this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Sections */}
                <div className="space-y-6 sm:space-y-8">
                    {sections.map((section, index) => {
                        const IconComponent = section.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-[#1A73E8] to-[#122340] p-3 sm:p-4 rounded-xl flex-shrink-0">
                                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#122340]">{section.title}</h2>
                                </div>

                                <div className="space-y-4 sm:space-y-6">
                                    {section.content.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="pl-4 sm:pl-6 border-l-4 border-blue-200 hover:border-blue-400 transition-colors duration-300"
                                        >
                                            <h3 className="text-lg sm:text-xl font-semibold text-[#1A73E8] mb-2">
                                                {item.subtitle}
                                            </h3>
                                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 text-white mt-6 sm:mt-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl flex-shrink-0">
                            <Mail className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Contact Us</h2>
                    </div>
                    <p className="text-sm sm:text-base text-blue-100 leading-relaxed mb-6">
                        If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please don't hesitate to contact us:
                    </p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                            <div className="flex items-center gap-3 sm:min-w-[120px]">
                                <Mail className="w-5 h-5 flex-shrink-0" />
                                <span className="font-semibold text-sm sm:text-base">Email:</span>
                            </div>
                            <a
                                href="mailto:sajjadhusainlawassociates@gmail.com"
                                className="text-sm sm:text-base underline hover:text-blue-200 transition-colors break-all sm:break-normal"
                            >
                                sajjadhusainlawassociates@gmail.com
                            </a>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                            <div className="flex items-center gap-3 sm:min-w-[120px]">
                                <MapPin className="w-5 h-5 flex-shrink-0" />
                                <span className="font-semibold text-sm sm:text-base">Address:</span>
                            </div>
                            <span className="text-sm sm:text-base">Sajjad Husain Law Associates</span>
                        </div>
                    </div>
                </div>

                {/* Changes to Policy */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8 shadow-md">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                            <div className="bg-amber-100 p-2 rounded-lg">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2">Changes to This Privacy Policy</h3>
                            <p className="text-sm sm:text-base text-amber-800 leading-relaxed">
                                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Consent */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8 shadow-md">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-2">Your Consent</h3>
                            <p className="text-sm sm:text-base text-green-800 leading-relaxed">
                                By using our website and services, you consent to our Privacy Policy and agree to its terms. Your continued use of our services following the posting of changes to this policy will be deemed your acceptance of those changes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="bg-[#122340] text-white py-6 sm:py-8 mt-8 sm:mt-12">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xs sm:text-sm md:text-base text-blue-200">
                        © {new Date().getFullYear()} Sajjad Husain Law Associates. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
