"use client";

import { TrendingUp, Calendar, User, ArrowRight, Tag, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TopStories() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Supreme Court", "High Court", "Tax", "Constitutional Law", "Criminal Law", "Corporate Law"];

    const featuredStory = {
        id: 1,
        title: "Supreme Court Landmark Judgment on Digital Privacy Rights: A New Era for Data Protection",
        category: "Supreme Court",
        date: "December 1, 2025",
        author: "Legal Team",
        readTime: "8 min read",
        views: "15.2K",
        excerpt: "In a groundbreaking decision that will reshape India's digital landscape, the Supreme Court has expanded the scope of digital privacy rights, setting new precedents for data protection in the digital age. The five-judge Constitution Bench delivered a unanimous verdict emphasizing the fundamental right to privacy in the context of emerging technologies.",
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",
        tags: ["Privacy Rights", "Digital Law", "Constitution Bench"]
    };

    const stories = [
        {
            id: 2,
            title: "High Court Issues Comprehensive Guidelines for Environmental Protection in Industrial Zones",
            category: "High Court",
            date: "November 30, 2025",
            author: "Environmental Law Desk",
            readTime: "6 min read",
            views: "8.5K",
            excerpt: "The High Court has issued comprehensive guidelines for environmental protection, mandating stricter compliance for industrial operations and setting new standards for pollution control.",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
            tags: ["Environment", "Industrial Law"]
        },
        {
            id: 3,
            title: "New Tax Reforms 2025: Complete Analysis of Amendments Affecting Businesses",
            category: "Tax Law",
            date: "November 28, 2025",
            author: "Tax Law Experts",
            readTime: "10 min read",
            views: "12.3K",
            excerpt: "Recent amendments to tax legislation bring significant changes for businesses. Our comprehensive analysis covers GST modifications, corporate tax updates, and compliance requirements.",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
            tags: ["Tax Reform", "GST", "Corporate Tax"]
        },
        {
            id: 4,
            title: "International Trade Agreement: Implications for Cross-Border Commerce",
            category: "International Law",
            date: "November 27, 2025",
            author: "International Law Division",
            readTime: "7 min read",
            views: "6.8K",
            excerpt: "New bilateral trade agreements reshape the landscape of international commerce, affecting businesses across multiple sectors with revised tariff structures and compliance norms.",
            image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
            tags: ["Trade Law", "International"]
        },
        {
            id: 5,
            title: "Constitutional Amendment Debate: Expert Analysis on Proposed Changes to Civil Rights",
            category: "Constitutional Law",
            date: "November 25, 2025",
            author: "Constitutional Law Team",
            readTime: "9 min read",
            views: "10.1K",
            excerpt: "Proposed constitutional amendments could have far-reaching implications for civil rights and fundamental freedoms. Legal experts weigh in on the potential impact.",
            image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
            tags: ["Constitution", "Civil Rights"]
        },
        {
            id: 6,
            title: "Startup Compliance: New Corporate Governance Regulations Explained",
            category: "Corporate Law",
            date: "November 23, 2025",
            author: "Corporate Law Desk",
            readTime: "5 min read",
            views: "7.2K",
            excerpt: "Startups face new compliance requirements under updated corporate governance regulations. Our guide helps you navigate the changes effectively.",
            image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
            tags: ["Startups", "Compliance"]
        }
    ];

    const latestUpdates = [
        { title: "SC Dismisses Plea Against Electoral Bond Scheme Implementation", time: "2 hours ago", category: "Supreme Court" },
        { title: "Delhi HC Directs Immediate Action on Air Quality Measures", time: "4 hours ago", category: "High Court" },
        { title: "CBDT Issues New Guidelines for Tax Assessments", time: "5 hours ago", category: "Tax" },
        { title: "Law Commission Recommends Reforms in Criminal Justice System", time: "7 hours ago", category: "Legal News" },
        { title: "Bar Council Announces New Continuing Legal Education Programs", time: "9 hours ago", category: "Legal Education" }
    ];

    const trendingTopics = [
        "Digital Privacy", "Environmental Law", "Tax Reforms", "Constitutional Rights",
        "Corporate Governance", "Criminal Justice", "International Trade", "Data Protection"
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-[#122340] via-[#1A73E8] to-[#122340] text-white py-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center gap-4 mb-4">
                        <TrendingUp className="w-10 h-10" />
                        <h1 className="text-4xl md:text-5xl font-bold">Top Stories</h1>
                    </div>
                    <p className="text-lg text-blue-100 max-w-3xl">
                        Latest Legal News, Judgments, and Developments from Indian Courts
                    </p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto max-w-7xl px-4 py-4">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedCategory === category
                                    ? "bg-[#1A73E8] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Featured Story */}
                        <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="relative h-96">
                                <img
                                    src={featuredStory.image}
                                    alt={featuredStory.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                                        FEATURED
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-blue-100 text-[#1A73E8] rounded-full text-sm font-semibold">
                                        {featuredStory.category}
                                    </span>
                                    {featuredStory.tags.map((tag, idx) => (
                                        <span key={idx} className="text-gray-500 text-sm flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight hover:text-[#1A73E8] transition-colors">
                                    <Link href={`/news/${featuredStory.id}`}>{featuredStory.title}</Link>
                                </h2>
                                <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                                    {featuredStory.excerpt}
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>{featuredStory.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{featuredStory.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{featuredStory.readTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            <span>{featuredStory.views}</span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/news/${featuredStory.id}`}
                                        className="flex items-center gap-2 text-[#1A73E8] hover:text-[#122340] font-semibold transition-colors group"
                                    >
                                        Read Full Story
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </article>

                        {/* Story Grid */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">Recent Stories</h3>
                            {stories.map((story) => (
                                <article key={story.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all group">
                                    <div className="grid md:grid-cols-3 gap-0">
                                        <div className="h-48 md:h-auto relative overflow-hidden">
                                            <img
                                                src={story.image}
                                                alt={story.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="md:col-span-2 p-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                                    {story.category}
                                                </span>
                                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{story.date}</span>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#1A73E8] transition-colors">
                                                <Link href={`/news/${story.id}`}>{story.title}</Link>
                                            </h3>
                                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                                {story.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {story.author}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {story.readTime}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {story.views}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/news/${story.id}`}
                                                    className="text-[#1A73E8] hover:text-[#122340] text-sm font-semibold flex items-center gap-1"
                                                >
                                                    Read More
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Load More */}
                        <div className="text-center">
                            <button className="bg-gradient-to-r from-[#1A73E8] to-[#122340] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                                Load More Stories
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Latest Updates */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#1A73E8]" />
                                Latest Updates
                            </h3>
                            <div className="space-y-4">
                                {latestUpdates.map((update, index) => (
                                    <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                                        <Link href="#" className="block group">
                                            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-[#1A73E8] transition-colors line-clamp-2">
                                                {update.title}
                                            </h4>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="px-2 py-1 bg-gray-100 rounded">{update.category}</span>
                                                <span>{update.time}</span>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trending Topics */}
                        <div className="bg-gradient-to-br from-[#122340] to-[#1A73E8] rounded-xl shadow-md p-6 text-white">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Trending Topics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {trendingTopics.map((topic, index) => (
                                    <Link
                                        key={index}
                                        href="#"
                                        className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm hover:bg-white/20 transition-all border border-white/20"
                                    >
                                        #{topic}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Stay Updated</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Get the latest legal news delivered to your inbox
                            </p>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                            />
                            <button className="w-full bg-gradient-to-r from-[#1A73E8] to-[#122340] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="bg-[#122340] text-white py-8 mt-12">
                <div className="container mx-auto max-w-7xl px-4 text-center">
                    <p className="text-sm md:text-base text-blue-200">
                        © {new Date().getFullYear()} Sajjad Husain Law Associates. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
