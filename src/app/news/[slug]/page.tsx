"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import Link from "next/link";
import { Share2, Sparkles, X, Facebook, Twitter, Linkedin, Link2, Check, Printer } from "lucide-react";
import logo from "../../../../../public/logo.png";
import Loader from "@/components/ui/Loader";
import { useTranslations, useLocale } from "next-intl";

// Helper function to get related articles
export function getRelatedArticles(currentSlug: string, allArticles: Article[], limit: number = 20) {
    const currentArticle = allArticles.find(a => a.slug === currentSlug);
    if (!currentArticle || !currentArticle.category) {
        return [];
    }

    const currentCategorySlug = currentArticle.category.slug;

    const filteredArticles = allArticles.filter((article) => {
        const isSameCategory = article.category?.slug === currentCategorySlug;
        const isNotCurrentArticle = article.slug !== currentSlug;

        return isSameCategory && isNotCurrentArticle;
    });

    const shuffled = [...filteredArticles].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, limit);
}

export default function ArticleDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { articles: allArticles, loading } = useArticleListActions();
    const articles = useMemo(() => allArticles.filter((a: { status: string; }) => a.status === 'published'), [allArticles]);
    const [article, setArticle] = useState<Article | null>(null);
    const [copied, setCopied] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showAISummary, setShowAISummary] = useState(false);
    
    const t = useTranslations('ArticleDetail');
    const locale = useLocale();

    const recommendedArticles = useMemo(() => {
        return getRelatedArticles(slug, articles, 10);
    }, [slug, articles]);

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
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(text);

        if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        if (platform === 'print') {
            window.print();
            return;
        }

        const shareUrls: { [key: string]: string } = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodedText} ${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
            tumblr: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodedUrl}&title=${encodedText}`,
            email: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
        setShowShareModal(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <Loader text={t('loading')} size="lg" />
        </div>;
    }

    if (!article) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">{t('notFound')}</h1>
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
                            <h1 className="sm:text-4xl text-3xl font-bold text-gray-900 mb-6 leading-tight">
                                {article.title}
                            </h1>
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
                                <span>
                                    {t('by')} {article.authors && (
                                        <>
                                            <span className="font-medium text-gray-900">{article.authors}</span>
                                            <span className="mx-2">•</span>
                                        </>
                                    )}
                                    {new Date(article.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {' '}
                                    {new Date(article.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    {' '}
                                    ({readTime} {t('minsRead')})
                                </span>
                            </div>
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

                        {/* Social Share Bar */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 py-3 px-6 bg-white rounded-full border border-gray-200 w-fit mx-auto sm:mx-0">
                            <div className="flex items-center gap-3 text-[#0A2342] font-bold min-w-fit">
                                <Share2 size={20} className="text-[#0A2342]" />
                                <span className="text-sm tracking-wider">{t('shareArticle')}</span>
                            </div>

                            <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

                            <div className="flex items-center gap-3">
                                <button onClick={() => handleShare('facebook')} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A2342] text-white hover:text-[#C9A227] transition-all duration-300">
                                    <Facebook size={18} />
                                </button>
                                <button onClick={() => handleShare('twitter')} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A2342] text-white hover:text-[#C9A227] transition-all duration-300">
                                    <Twitter size={18} />
                                </button>
                                <button onClick={() => handleShare('linkedin')} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0077b5] text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                    <Linkedin size={18} />
                                </button>
                                <button onClick={() => handleShare('copy')} className={`w-10 h-10 flex items-center justify-center rounded-full ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all duration-300 hover:-translate-y-1`}>
                                    {copied ? <Check size={18} /> : <Link2 size={18} />}
                                </button>
                                <button onClick={() => handleShare('print')} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300">
                                    <Printer size={18} />
                                </button>
                            </div>
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
                                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('relatedArticles')}</h3>
                            <div className="space-y-6 max-h-[85vh] overflow-y-auto scrollbar-hide pb-10">
                                {recommendedArticles.map((rec) => (
                                    <Link key={rec.id} href={`/news/${rec.slug}`} className="block group">
                                        <div className="flex gap-4">
                                            <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                                <Image
                                                    src={(rec.thumbnail && (rec.thumbnail.startsWith('http') || rec.thumbnail.startsWith('/'))) ? rec.thumbnail : logo}
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
        </div>
    );
}