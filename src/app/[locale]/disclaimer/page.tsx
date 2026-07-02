"use client";

import { Shield, AlertCircle, Users, Mail, CheckCircle, MapPin, Search, FileText } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";


export default function Disclaimer() {
    useDocTitle("Disclaimer | Sajjad Husain Law Associates");
    const lastUpdated = "July 02, 2026";

    const sections = [
        {
            icon: AlertCircle,
            title: "Not Legal Advice",
            content: [
                {
                    subtitle: "General Information Only",
                    text: "The materials and information available on this website are intended for general informational and educational purposes only. They do not, and are not intended to, constitute legal advice."
                },
                {
                    subtitle: "Seek Professional Counsel",
                    text: "Readers should not act or refrain from acting on the basis of any content included on this site without seeking appropriate legal or other professional advice on the particular facts and circumstances at issue from an advocate or other qualified legal professional."
                }
            ]
        },
        {
            icon: Users,
            title: "No Attorney-Client Relationship",
            content: [
                {
                    subtitle: "No Implied Relationship",
                    text: "Accessing this website, reading our legal news, or contacting Sajjad Husain Law Associates through email, contact forms, or messaging services does not create an attorney-client relationship between you and our firm."
                },
                {
                    subtitle: "Confidentiality Warning",
                    text: "Please do not send us any confidential information until a formal attorney-client relationship has been established through a written agreement. Any information sent to us before such an engagement is not considered confidential or privileged."
                }
            ]
        },
        {
            icon: Search,
            title: "Accuracy of Information",
            content: [
                {
                    subtitle: "Rapidly Changing Laws",
                    text: "While we strive to ensure the accuracy and timeliness of our legal news, case analyses, and updates, the law changes rapidly. We make no guarantees, express or implied, regarding the completeness, accuracy, or adequacy of the information provided."
                },
                {
                    subtitle: "Historical Context",
                    text: "Content published on our platform reflects the legal landscape at the time of publication. Subsequent legislative changes or judicial rulings may render past articles outdated or inaccurate."
                }
            ]
        },
        {
            icon: FileText,
            title: "Legal News and Case Analysis",
            content: [
                {
                    subtitle: "Informational Purpose",
                    text: "Our legal news, judgment summaries, and case analyses are prepared to help readers understand legal developments. They are intended for informational and educational purposes and should not be relied upon as a substitute for professional legal advice."
                }
            ]
        },
        {
            icon: Shield,
            title: "Third-Party Content and Links",
            content: [
                {
                    subtitle: "External Websites",
                    text: "Our platform may contain links to third-party websites or resources for your convenience. We do not endorse, control, monitor, or take responsibility for the content, privacy policies, or practices of any external sites."
                },
                {
                    subtitle: "Assumption of Risk",
                    text: "Your reliance on any third-party information or interaction with third-party platforms accessed through our website is entirely at your own risk."
                }
            ]
        },
        {
            icon: MapPin,
            title: "Jurisdiction",
            content: [
                {
                    subtitle: "Applicable Laws",
                    text: "Unless otherwise stated, the information published on this website relates primarily to the laws of India. Readers accessing this website from other jurisdictions should seek advice regarding the laws applicable in their respective countries or regions."
                }
            ]
        },
        {
            icon: AlertCircle,
            title: "No Warranty",
            content: [
                {
                    subtitle: "Service Availability",
                    text: "We make reasonable efforts to maintain the accuracy and availability of this website. However, we do not guarantee that the website will always be error-free, uninterrupted, or free from technical issues."
                }
            ]
        },
        {
            icon: Shield,
            title: "Limitation of Liability",
            content: [
                {
                    subtitle: "No Liability",
                    text: "Sajjad Husain Law Associates shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from the use of, or reliance upon, the information provided on this website."
                }
            ]
        },
        {
            icon: FileText,
            title: "Copyright",
            content: [
                {
                    subtitle: "Intellectual Property",
                    text: "Unless otherwise stated, all original articles, legal analyses, graphics, and other original content published on this website are the intellectual property of Sajjad Husain Law Associates. Official court judgments, statutes, government notifications, and other public legal documents remain subject to their respective legal status and ownership."
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
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                        Legal Disclaimer
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Important information regarding the use of our legal news platform, case analyses, and resources.
                    </p>
                    <div className="inline-block px-4 py-3 bg-white/5 rounded-2xl border border-white/10 text-left">
                        <p className="text-sm text-gray-300 mb-1">
                            Effective Date: <span className="font-semibold text-[#C9A227]">{lastUpdated}</span>
                        </p>
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
                            <h2 className="text-2xl font-bold text-[#0A2342] mb-4">Terms of Use</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Welcome to Sajjad Husain Law Associates. The following disclaimer governs your use of our website, articles, legal news, and associated digital services.
                                </p>
                                <p>
                                    By accessing, browsing, or utilizing any resources on this platform, you acknowledge that you have read the terms detailed below. By using this website, you acknowledge and agree to the terms of this disclaimer.
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
                                    If you have questions regarding this disclaimer or wish to schedule a legal consultation, please contact our office using the details below.
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
