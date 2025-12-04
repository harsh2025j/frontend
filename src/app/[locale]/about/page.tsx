"use client";

import { Users, Scale, Award, Target, Heart, Briefcase, Shield, BookOpen } from "lucide-react";
import Image from "next/image";

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-[#122340] via-[#1A73E8] to-[#122340] text-white py-20 lg:py-32 px-4 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="flex flex-col items-center justify-center gap-6 mb-6">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl animate-pulse">
                            <Scale className="w-16 h-16" />
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center">
                            About Us
                        </h1>
                    </div>
                    <p className="text-xl md:text-2xl text-center text-blue-100 max-w-3xl mx-auto">
                        Dedicated to Excellence in Legal Services and Justice
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
                                <Users className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-4xl font-bold text-[#122340] mb-6">Who We Are</h2>
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                Sajjad Husain Law Associates is a premier law firm based in Lucknow, Uttar Pradesh, dedicated to providing exceptional legal services across various practice areas. With our chamber located at Block-C, High Court, we are strategically positioned to serve our clients with the highest level of professionalism and expertise.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Our firm combines traditional legal values with modern technology to deliver innovative solutions to complex legal challenges. We pride ourselves on our commitment to justice, integrity, and client satisfaction.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Our Mission & Vision */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-[#1A73E8] to-[#122340] p-3 rounded-xl">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-[#122340]">Our Mission</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            To provide accessible, reliable, and innovative legal services that empower our clients to navigate the complexities of the legal system with confidence. We strive to uphold the highest standards of legal practice while ensuring justice is served for all.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 border border-purple-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-[#122340]">Our Vision</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            To be recognized as a leading law firm that sets the benchmark for legal excellence, innovation, and client service. We envision a future where legal services are accessible to all, and justice prevails through ethical and professional practice.
                        </p>
                    </div>
                </div>

                {/* Core Values */}
                <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-blue-100">
                    <h2 className="text-4xl font-bold text-[#122340] mb-8 text-center">Our Core Values</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Shield, title: "Integrity", desc: "Upholding the highest ethical standards in all our practices" },
                            { icon: Heart, title: "Compassion", desc: "Understanding and caring for our clients' needs and concerns" },
                            { icon: Award, title: "Excellence", desc: "Delivering superior legal services with attention to detail" },
                            { icon: BookOpen, title: "Knowledge", desc: "Continuous learning and staying updated with legal developments" }
                        ].map((value, index) => {
                            const IconComponent = value.icon;
                            return (
                                <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300 border border-blue-100">
                                    <div className="inline-flex items-center justify-center bg-gradient-to-br from-[#1A73E8] to-[#122340] p-4 rounded-full mb-4">
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-[#122340] mb-2">{value.title}</h4>
                                    <p className="text-sm text-gray-600">{value.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Practice Areas */}
                <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-2xl shadow-xl p-10 text-white mb-8">
                    <h2 className="text-4xl font-bold mb-8 text-center">Our Practice Areas</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            "Supreme Court Litigation",
                            "High Court Litigation",
                            "Tax Law",
                            "Corporate Law",
                            "Criminal Law",
                            "Civil Law",
                            "Family Law",
                            "Property Law",
                            "Constitutional Law"
                        ].map((area, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    <span className="text-lg font-medium">{area}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-white rounded-2xl shadow-xl p-10 border border-blue-100">
                    <h2 className="text-4xl font-bold text-[#122340] mb-8 text-center">Why Choose Us</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "Experienced Team",
                                description: "Our team comprises seasoned legal professionals with extensive experience in various practice areas."
                            },
                            {
                                title: "Client-Centric Approach",
                                description: "We prioritize our clients' needs and work tirelessly to achieve the best possible outcomes."
                            },
                            {
                                title: "Strategic Location",
                                description: "Located at the High Court premises, we offer convenient access and deep court insights."
                            },
                            {
                                title: "Technology-Driven",
                                description: "We leverage modern technology to provide efficient and effective legal solutions."
                            },
                            {
                                title: "Transparent Communication",
                                description: "We maintain clear and open communication throughout the legal process."
                            },
                            {
                                title: "Proven Track Record",
                                description: "Our success stories speak to our commitment to excellence and client satisfaction."
                            }
                        ].map((reason, index) => (
                            <div key={index} className="flex gap-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300 border border-blue-100">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#1A73E8] to-[#122340] rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {index + 1}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-[#122340] mb-2">{reason.title}</h4>
                                    <p className="text-gray-700">{reason.description}</p>
                                </div>
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
