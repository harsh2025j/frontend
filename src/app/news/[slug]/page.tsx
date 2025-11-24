"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import Link from "next/link";
import { Clock, Share2, Sparkles, X, MessageCircle, Eye, Facebook, Twitter, Linkedin, Link2 } from "lucide-react";
import logo from "../../../../public/logo.png";

export default function ArticleDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { articles, loading } = useArticleListActions();
    const [article, setArticle] = useState<Article | null>(null);
    const [showAISummary, setShowAISummary] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Dummy data
    const viewCount = 1247;
    const commentCount = 23;

    // Dummy recommended articles
    const recommendedArticles = [
        { id: 1, title: "SC Refuses To Entertain PIL Against Appointment Of Special Prosecutors", slug: "sc-refuses-pil", thumbnail: logo },
        { id: 2, title: "Understanding Property Laws in India", slug: "property-laws-india", thumbnail: logo },
        { id: 3, title: "Consumer Rights: A Complete Guide", slug: "consumer-rights-guide", thumbnail: logo },
        { id: 4, title: "How to File a Legal Complaint", slug: "file-legal-complaint", thumbnail: logo },
    ];

    useEffect(() => {
        if (articles.length > 0 && slug) {
            const found = articles.find((a: Article) => a.slug === slug);
            setArticle(found || null);
        }
    }, [articles, slug]);

    const calculateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const text = article?.title || '';

        const shareUrls: { [key: string]: string } = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
            setShowShareModal(false);
        } else {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            setShowShareModal(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!article) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Article not found</h1>
            </div>
        );
    }

    const readTime = calculateReadTime(article.content);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        {/* Header */}
                        <div className="mb-6">
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                                <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {readTime} min read
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {viewCount.toLocaleString()} views
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <MessageCircle size={14} />
                                    {commentCount} comments
                                </span>
                            </div>

                            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                {article.title}
                            </h1>
                        </div>

                        {/* Featured Image */}
                        {article.thumbnail && (
                            <div className="relative w-full h-[450px] mb-8 rounded overflow-hidden">
                                <Image
                                    src={article.thumbnail}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-8 pb-6 border-b border-gray-200">
                            <button
                                onClick={() => setShowAISummary(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                                <Sparkles size={16} />
                                AI Summary
                            </button>
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                            >
                                <Share2 size={16} />
                                Share
                            </button>
                        </div>

                        {/* Article Content */}
                        <div className="article-content mb-12">
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="pt-6 border-t border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h3>
                            <div className="space-y-6">
                                {recommendedArticles.map((rec) => (
                                    <Link
                                        key={rec.id}
                                        href={`/news/${rec.slug}`}
                                        className="block group"
                                    >
                                        <div className="flex gap-4">
                                            <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                                <Image
                                                    src={rec.thumbnail}
                                                    alt={rec.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-gray-900 line-clamp-3 group-hover:text-blue-600 transition-colors leading-snug">
                                                    {rec.title}
                                                </h4>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowShareModal(false)}
                >
                    <div
                        className="bg-white rounded-lg max-w-md w-full shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="border-b px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Share Article</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Facebook size={20} className="text-blue-600" />
                                    <span className="font-medium text-sm">Facebook</span>
                                </button>
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Twitter size={20} className="text-sky-500" />
                                    <span className="font-medium text-sm">Twitter</span>
                                </button>
                                <button
                                    onClick={() => handleShare('linkedin')}
                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Linkedin size={20} className="text-blue-700" />
                                    <span className="font-medium text-sm">LinkedIn</span>
                                </button>
                                <button
                                    onClick={() => handleShare('copy')}
                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Link2 size={20} className="text-gray-600" />
                                    <span className="font-medium text-sm">Copy Link</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Summary Modal */}
            {showAISummary && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAISummary(false)}
                >
                    <div
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-blue-600" size={20} />
                                <h3 className="text-lg font-bold">AI Summary</h3>
                            </div>
                            <button
                                onClick={() => setShowAISummary(false)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <p className="text-gray-800 text-sm leading-relaxed">
                                    This article discusses {article.title.toLowerCase()}. It provides comprehensive information about the legal aspects, procedures, and important considerations.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-gray-900">Key Points:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                    <li>Detailed explanation of legal procedures</li>
                                    <li>Important considerations for implementation</li>
                                    <li>Relevant case laws and precedents</li>
                                </ul>
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                AI-generated summary. Read full article for details.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
