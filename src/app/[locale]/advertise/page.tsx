"use client";

import { Megaphone, Target, Users, TrendingUp, Award, BarChart, Mail, Phone } from "lucide-react";

export default function AdvertiseWithUs() {
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
                            <Megaphone className="w-16 h-16" />
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center">
                            Advertise With Us
                        </h1>
                    </div>
                    <p className="text-xl md:text-2xl text-center text-blue-100 max-w-3xl mx-auto">
                        Reach a Targeted Audience of Legal Professionals and Clients
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
                {/* Introduction */}
                <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-blue-100 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            <div className="bg-gradient-to-br from-[#1A73E8] to-[#122340] p-4 rounded-xl">
                                <Target className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-4xl font-bold text-[#122340] mb-6">Why Advertise With Us?</h2>
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                Sajjad Husain Law Associates offers a unique platform to connect with a highly engaged audience of legal professionals, law students, and individuals seeking legal services. Our platform provides exceptional visibility and targeted reach for your brand.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Whether you're looking to promote legal services, educational programs, legal technology, or professional development opportunities, we offer customized advertising solutions to meet your specific needs.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Audience Statistics */}
                <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-2xl shadow-xl p-10 text-white mb-8">
                    <h2 className="text-4xl font-bold mb-8 text-center">Our Reach</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: Users, value: "50K+", label: "Monthly Visitors" },
                            { icon: TrendingUp, value: "85%", label: "Engagement Rate" },
                            { icon: Award, value: "10K+", label: "Legal Professionals" },
                            { icon: BarChart, value: "200K+", label: "Page Views/Month" }
                        ].map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20">
                                    <IconComponent className="w-12 h-12 mx-auto mb-4" />
                                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                                    <div className="text-blue-100">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Advertising Options */}
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#122340] mb-8 text-center">Advertising Options</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Banner Advertisements",
                                description: "Premium placement on high-traffic pages with customizable sizes and formats.",
                                features: ["Header Banners", "Sidebar Ads", "Footer Banners", "Mobile Responsive"]
                            },
                            {
                                title: "Sponsored Content",
                                description: "Native advertising through sponsored articles and featured content.",
                                features: ["Editorial Integration", "SEO Optimized", "Social Media Promotion", "Long-term Visibility"]
                            },
                            {
                                title: "Newsletter Sponsorship",
                                description: "Reach our engaged subscriber base through dedicated newsletter placements.",
                                features: ["Direct Email Access", "Targeted Segments", "Analytics Reports", "High Open Rates"]
                            },
                            {
                                title: "Event Sponsorship",
                                description: "Partner with us for webinars, workshops, and legal events.",
                                features: ["Brand Visibility", "Speaking Opportunities", "Networking Access", "Digital Promotion"]
                            },
                            {
                                title: "Video Advertising",
                                description: "Engage audiences with video content and pre-roll advertisements.",
                                features: ["YouTube Integration", "Social Media Ads", "Website Placement", "Performance Tracking"]
                            },
                            {
                                title: "Custom Packages",
                                description: "Tailored advertising solutions designed for your specific goals.",
                                features: ["Flexible Terms", "Multi-Channel", "Dedicated Support", "ROI Focused"]
                            }
                        ].map((option, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl hover:border-[#1A73E8] transition-all duration-300">
                                <h3 className="text-2xl font-bold text-[#122340] mb-4">{option.title}</h3>
                                <p className="text-gray-700 mb-6 leading-relaxed">{option.description}</p>
                                <ul className="space-y-2">
                                    {option.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-gray-600">
                                            <div className="w-2 h-2 bg-[#1A73E8] rounded-full"></div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-blue-100">
                    <h2 className="text-4xl font-bold text-[#122340] mb-8 text-center">Benefits of Advertising With Us</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Targeted Audience",
                                description: "Reach legal professionals, law students, and individuals actively seeking legal services."
                            },
                            {
                                title: "High Engagement",
                                description: "Our audience is highly engaged with quality content and spends significant time on our platform."
                            },
                            {
                                title: "Brand Credibility",
                                description: "Associate your brand with a trusted legal platform and enhance your credibility."
                            },
                            {
                                title: "Measurable Results",
                                description: "Track your campaign performance with detailed analytics and reporting."
                            },
                            {
                                title: "Flexible Options",
                                description: "Choose from various advertising formats and packages that fit your budget."
                            },
                            {
                                title: "Expert Support",
                                description: "Work with our dedicated team to optimize your advertising campaigns."
                            }
                        ].map((benefit, index) => (
                            <div key={index} className="flex gap-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300 border border-blue-100">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#1A73E8] to-[#122340] rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {index + 1}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-[#122340] mb-2">{benefit.title}</h4>
                                    <p className="text-gray-700">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing Tiers */}
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-[#122340] mb-8 text-center">Pricing Packages</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Starter",
                                price: "₹15,000",
                                period: "/month",
                                features: [
                                    "Banner Ads (2 positions)",
                                    "Basic Analytics",
                                    "Email Support",
                                    "1 Month Commitment"
                                ],
                                popular: false
                            },
                            {
                                name: "Professional",
                                price: "₹35,000",
                                period: "/month",
                                features: [
                                    "Banner Ads (5 positions)",
                                    "Sponsored Content (2/month)",
                                    "Advanced Analytics",
                                    "Priority Support",
                                    "3 Month Commitment"
                                ],
                                popular: true
                            },
                            {
                                name: "Enterprise",
                                price: "Custom",
                                period: "",
                                features: [
                                    "Unlimited Banner Positions",
                                    "Unlimited Sponsored Content",
                                    "Custom Integration",
                                    "Dedicated Account Manager",
                                    "Flexible Terms"
                                ],
                                popular: false
                            }
                        ].map((tier, index) => (
                            <div key={index} className={`bg-white rounded-2xl shadow-lg p-8 border-2 ${tier.popular ? 'border-[#1A73E8] relative' : 'border-blue-100'} hover:shadow-xl transition-all duration-300`}>
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#1A73E8] to-[#122340] text-white px-6 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-[#122340] mb-4 text-center">{tier.name}</h3>
                                <div className="text-center mb-6">
                                    <span className="text-4xl font-bold text-[#1A73E8]">{tier.price}</span>
                                    <span className="text-gray-600">{tier.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${tier.popular ? 'bg-gradient-to-r from-[#1A73E8] to-[#122340] text-white hover:shadow-lg' : 'bg-gray-100 text-[#122340] hover:bg-gray-200'}`}>
                                    Get Started
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-2xl shadow-xl p-10 text-white">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-xl text-blue-100">
                            Contact our advertising team to discuss your requirements and create a custom package.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <a href="mailto:sajjadhusainlawassociates@gmail.com" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center gap-4">
                            <Mail className="w-8 h-8" />
                            <div>
                                <div className="font-semibold mb-1">Email Us</div>
                                <div className="text-sm text-blue-100">sajjadhusainlawassociates@gmail.com</div>
                            </div>
                        </a>
                        <a href="tel:07080909786" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center gap-4">
                            <Phone className="w-8 h-8" />
                            <div>
                                <div className="font-semibold mb-1">Call Us</div>
                                <div className="text-sm text-blue-100">070809 09786</div>
                            </div>
                        </a>
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
