"use client";

import { Cookie, Shield, Eye, Settings, Mail, CheckCircle, MapPin, AlertCircle, Layers, CheckSquare, FileText } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";


export default function CookiePolicy() {
    useDocTitle("Cookie Policy | Sajjad Husain Law Associates");
    const lastUpdated = "July 02, 2026";

    const sections = [
        {
            icon: Cookie,
            title: "What Are Cookies & Similar Technologies?",
            content: [
                {
                    subtitle: "Standard Cookies",
                    text: "Cookies are small text files placed on your computer or mobile device when you visit a website. They help the website remember your actions and preferences over time."
                },
                {
                    subtitle: "Similar Technologies",
                    text: "We use cookies and similar technologies, including Local Storage and session storage. We may use Local Storage to store certain information, such as authentication data and user preferences, to improve functionality and security."
                }
            ]
        },
        {
            icon: Layers,
            title: "Types of Cookies We Use",
            content: [
                {
                    subtitle: "Essential Cookies",
                    text: "These are necessary for the operation of our website, including authentication, security, and login sessions. Certain cookies are essential for the operation of our website and cannot be disabled without affecting core website functionality."
                },
                {
                    subtitle: "Functional Cookies",
                    text: "These cookies allow us to remember choices you make, such as user preferences, language selection, and theme settings, to provide a more personalized experience."
                },
                {
                    subtitle: "Analytics Cookies",
                    text: "We may use analytics tools, such as Google Analytics, to measure performance and understand how users interact with our website to improve our services."
                },
                {
                    subtitle: "Advertising Cookies",
                    text: "If Google AdSense or other advertising services are enabled on our website in the future, they may use cookies, including DoubleClick cookies, to display personalized or non-personalized advertisements in accordance with their respective privacy policies."
                }
            ]
        },
        {
            icon: Eye,
            title: "Third-Party Advertising",
            content: [
                {
                    subtitle: "Future Ad Services",
                    text: "Our website may display advertisements through third-party networks. If enabled, these partners may use advertising cookies to serve ads based on your prior visits to our website and other sites across the Internet."
                }
            ]
        },
        {
            icon: CheckSquare,
            title: "Cookie Consent & Management",
            content: [
                {
                    subtitle: "Cookie Banner",
                    text: "Where required by applicable law, we may present visitors with a cookie consent banner that allows them to accept or reject non-essential cookies."
                },
                {
                    subtitle: "Browser Settings",
                    text: "Most web browsers allow you to delete, block, or restrict cookies. Please note that disabling essential cookies or Local Storage may affect certain website features or prevent you from accessing secure areas of the website."
                },
                {
                    subtitle: "Ad Personalization Opt-Out",
                    text: (
                        <>
                            You can opt out of personalized advertising by visiting{" "}
                            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#C9A227] hover:underline font-medium">Google Ads Settings</a>{" "}
                            or by visiting{" "}
                            <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-[#C9A227] hover:underline font-medium">YourAdChoices</a>{" "}
                            to opt out of third-party vendors' use of cookies for personalized advertising.
                        </>
                    )
                }
            ]
        },
        {
            icon: FileText,
            title: "Changes to this Cookie Policy",
            content: [
                {
                    subtitle: "Policy Updates",
                    text: "We may update this Cookie Policy periodically to reflect changes in technology, legal requirements, or our services. Any updates will be published on this page with a revised 'Last Updated' date."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-[#0A2342] text-white py-16 px-4 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="container mx-auto max-w-5xl relative z-10 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                        Cookie Policy
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Understanding how we use cookies, local storage, and third-party tracking to enhance your browsing experience.
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
                            <h2 className="text-2xl font-bold text-[#0A2342] mb-4">Transparency & Privacy</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    At Sajjad Husain Law Associates, we believe in being transparent about how we collect and use data related to you. 
                                </p>
                                <p>
                                    This Cookie Policy explains how we use cookies and similar technologies. Where required by applicable law, we will request your consent before placing non-essential cookies on your device.
                                </p>
                                <p>
                                    This Cookie Policy should be read together with our Privacy Policy, which explains how we collect, use, and protect personal information.
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

                {/* Third Party Note */}
                <div className="bg-[#FFF9E6] border border-[#C9A227]/20 rounded-2xl p-6 sm:p-8 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="bg-[#C9A227]/10 p-2 rounded-lg flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-[#C9A227]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#0A2342] mb-3">Advertising & Compliance</h3>
                            <p className="text-sm text-[#0A2342]/70 leading-relaxed">
                                If Google AdSense or other advertising services are enabled on our website in the future, they may use cookies, including DoubleClick cookies, to display personalized or non-personalized advertisements in accordance with their respective privacy policies. You have full control over your ad personalization and can adjust your settings directly through your Google account.
                            </p>
                        </div>
                    </div>
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
                                    If you have any questions or concerns regarding our use of cookies and local storage, please contact us using the details below.
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
