"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";
import { Link } from "@/i18n/routing";
import { Share2, Facebook, Linkedin, Link2, Check, Printer, Sparkles, X } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { useTranslations, useLocale } from "next-intl";
import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import TypewriterText from "@/components/ui/TypewriterText";

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

interface ArticleClientProps {
    initialArticle: Article;
    slug: string;
}

export default function ArticleClient({ initialArticle, slug }: ArticleClientProps) {
    const { articles: allArticles, loading } = useArticleListActions();
    const articles = useMemo(() => allArticles.filter((a: { status: string; }) => a.status === 'published'), [allArticles]);
    const [copied, setCopied] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState<string | null>(initialArticle.aiSummary || null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);

    const handleSummaryClick = async () => {
        const newShowSummary = !showSummary;
        setShowSummary(newShowSummary);

        if (newShowSummary && !summary && !initialArticle.aiSummary) {
            setIsFetchingSummary(true);
            try {
                const response = await fetch(`${API_BASE_URL}ai/summary/${initialArticle.id}`, {
                    // headers: {
                    //     "ngrok-skip-browser-warning": "true",
                    // },
                });
                const data = await response.json();
                if (data.success) {
                    setSummary(data.data.summary);
                }
            } catch (error) {
                console.error("Error fetching AI summary:", error);
            } finally {
                setIsFetchingSummary(false);
            }
        }
    };

    const t = useTranslations('ArticleDetail');
    const locale = useLocale();

    const [translatedData, setTranslatedData] = useState<{ title: string, content: string } | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Translate Related Articles
    const [relatedTitlesToTranslate, setRelatedTitlesToTranslate] = useState<string[]>([]);

    const recommendedArticles = useMemo(() => {
        return getRelatedArticles(slug, articles, 10);
    }, [slug, articles]);

    useEffect(() => {
        if (recommendedArticles.length > 0 && locale !== 'en') {
            setRelatedTitlesToTranslate(recommendedArticles.map(a => a.title));
        }
    }, [recommendedArticles, locale]);

    const { translatedText: translatedRelatedTitles } = useGoogleTranslate(
        locale !== 'en' && relatedTitlesToTranslate.length > 0 ? relatedTitlesToTranslate : null
    );

    const displayRecommended = useMemo(() => {
        if (locale === 'en' || !translatedRelatedTitles || !Array.isArray(translatedRelatedTitles)) {
            return recommendedArticles;
        }
        return recommendedArticles.map((rec, idx) => ({
            ...rec,
            title: translatedRelatedTitles[idx] || rec.title
        }));
    }, [recommendedArticles, translatedRelatedTitles, locale]);

    // Translation Logic
    useEffect(() => {
        if (!initialArticle || locale === 'en') {
            setTranslatedData(null);
            return;
        }

        const translateContent = async () => {
            setIsTranslating(true);
            try {
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: [initialArticle.title, initialArticle.content],
                        targetLang: locale
                    }),
                });

                const data = await response.json();
                if (data.translatedText && data.translatedText.length === 2) {
                    setTranslatedData({
                        title: data.translatedText[0],
                        content: data.translatedText[1]
                    });
                }
            } catch (error) {
                console.error('Failed to translate:', error);
            } finally {
                setIsTranslating(false);
            }
        };

        translateContent();
    }, [initialArticle, locale]);

    const calculateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const text = initialArticle?.title || '';
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
            window.open(shareUrls[platform], '_blank');
        }
    };

    if (loading && !initialArticle) {
        return <div className="flex justify-center items-center min-h-screen">
            <Loader text={t('loading')} size="lg" />
        </div>;
    }

    if (!initialArticle) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">{t('notFound')}</h1>
            </div>
        );
    }

    const readTime = calculateReadTime(initialArticle.content);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="sm:text-4xl text-3xl font-bold text-gray-900 mb-6 leading-tight">
                                {translatedData ? translatedData.title : initialArticle.title}
                            </h1>
                            {/* Metadata */}

                            <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                {/* Avatar */}
                                <div className="h-14 w-14 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-2xl font-bold ring-4 ring-[#C9A227]/20 shadow-sm shrink-0">
                                    {initialArticle.authors?.charAt(0).toUpperCase() || "A"}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg leading-none m-0">
                                            {initialArticle.authors || "Unknown Author"}
                                        </h3>
                                        <span className="px-2 py-0.5 bg-[#0A2342]/10 text-[#0A2342] text-[10px] uppercase font-bold tracking-wider rounded-md">
                                            Author
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5" title="Date Published">
                                            <svg className="w-4 h-4 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="font-medium">
                                                {new Date(initialArticle.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5" title="Read Time">
                                            <svg className="w-4 h-4 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">{readTime} {t('minsRead')}</span>
                                        </div>
                                        {isTranslating && (
                                            <div className="flex items-center gap-1.5 text-[#C9A227] animate-pulse">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                                </svg>
                                                <span className="text-xs font-bold">Translating...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Featured Image */}
                        {initialArticle.thumbnail && (
                            <div className="relative w-full h-[450px] mb-8 rounded overflow-hidden">
                                <Image
                                    src={initialArticle.thumbnail}
                                    alt={translatedData ? translatedData.title : initialArticle.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Tags */}
                        {initialArticle.tags && initialArticle.tags.length > 0 && (
                            <div className="mb-8 flex flex-wrap items-center gap-2 relative pr-40">
                                <span className="text-sm font-bold text-gray-900 mr-2">Tags:</span>
                                {initialArticle.tags.map((tag: any) => (
                                    <Link
                                        key={tag.id}
                                        href={`/tags/${tag.slug}`}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                    >
                                        {tag.name}
                                    </Link>
                                ))}

                                <div className="absolute right-0 top-0">
                                    <button
                                        type="button"
                                        onClick={handleSummaryClick}
                                        className="px-6 py-2 bg-blue-600 text-white text-base font-medium rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <Sparkles size={18} />
                                        <span>AI Summary</span>
                                    </button>

                                    {showSummary && (
                                        <div className="absolute right-0 top-12 sm:right-full sm:top-0 sm:mr-3 w-[85vw] sm:w-[400px] max-w-[400px] bg-[#C9A227] p-4 rounded-xl shadow-2xl border border-gray-200 z-50 text-left">
                                            <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-2">
                                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                    <Sparkles size={16} className="text-blue-600" />
                                                    AI Summary
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSummary(false)}
                                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-900 hover:text-red-500"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div className="text-md text-black leading-relaxed max-h-[300px] overflow-y-auto">
                                                {isFetchingSummary ? (
                                                    <div className="flex justify-center py-6">
                                                        <Loader size="sm" text="Thinking..." />
                                                    </div>
                                                ) : (
                                                    summary ? <TypewriterText text={summary} speed={30} /> : "No summary available."
                                                )}
                                            </div>
                                            {/* Pointer arrow - specific to desktop alignment */}
                                            <div className="hidden sm:block absolute top-4 -right-2 w-4 h-4 bg-[#C9A227] border-t border-r border-gray-200 transform rotate-45"></div>
                                        </div>
                                    )}
                                </div>
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
                                {/* Facebook */}
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A2342] text-white hover:text-[#C9A227] transition-all duration-300"
                                    title={t('shareOn', { platform: 'Facebook' })}
                                >
                                    <Facebook size={18} />
                                </button>

                                {/* X (Twitter) */}
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A2342] text-white hover:text-[#C9A227] transition-all duration-300"
                                    title={t('shareOn', { platform: 'X' })}
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>

                                {/* WhatsApp */}
                                <button
                                    onClick={() => handleShare('whatsapp')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A2342] text-white hover:text-[#C9A227] transition-all duration-300"
                                    title={t('shareOn', { platform: 'WhatsApp' })}
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="fill-current">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </button>

                                {/* LinkedIn */}
                                <button
                                    onClick={() => handleShare('linkedin')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0077b5] text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                    title={t('shareOn', { platform: 'LinkedIn' })}
                                >
                                    <Linkedin size={18} />
                                </button>

                                {/* Pinterest */}
                                <button
                                    onClick={() => handleShare('pinterest')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#bd081c] text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                    title={t('shareOn', { platform: 'Pinterest' })}
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="fill-current">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.173 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
                                    </svg>
                                </button>

                                {/* Tumblr */}
                                <button
                                    onClick={() => handleShare('tumblr')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#35465c] text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                    title={t('shareOn', { platform: 'Tumblr' })}
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="fill-current">
                                        <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.406h-.178l.011.002z" />
                                    </svg>
                                </button>

                                {/* Email */}
                                <button
                                    onClick={() => handleShare('email')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#dd4b39] text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                    title={t('shareOn', { platform: 'Email' })}
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                </button>
                            </div>

                            <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

                            <div className="flex items-center gap-3">
                                {/* Copy Link */}
                                <button
                                    onClick={() => handleShare('copy')}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all duration-300 hover:-translate-y-1`}
                                    title={t('copyLink')}
                                >
                                    {copied ? <Check size={18} /> : <Link2 size={18} />}
                                </button>

                                {/* Print */}
                                <button
                                    onClick={() => handleShare('print')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300"
                                    title={t('print')}
                                >
                                    <Printer size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="article-content mb-12">
                            <div dangerouslySetInnerHTML={{ __html: translatedData ? translatedData.content : initialArticle.content }} />
                        </div>
                        <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                            {/* Avatar */}
                            <div className="h-14 w-14 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-2xl font-bold ring-4 ring-[#C9A227]/20 shadow-sm shrink-0">
                                {initialArticle.advocateName?.charAt(0).toUpperCase() || "A"}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-lg leading-none m-0">
                                        {initialArticle.advocateName || "Unknown Advocate"}
                                    </h3>
                                    <span className="px-2 py-0.5 bg-[#0A2342]/10 text-[#0A2342] text-[10px] uppercase font-bold tracking-wider rounded-md">
                                        Advocate
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('relatedArticles')}</h3>

                            <div className="space-y-6 max-h-[85vh] overflow-y-auto scrollbar-hide pb-10">
                                {displayRecommended.map((rec) => (
                                    <Link
                                        key={rec.id}
                                        href={`/news/${rec.slug}`}
                                        className="block group"
                                    >
                                        <div className="flex gap-4">
                                            <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                                <Image
                                                    src={(rec.thumbnail && (rec.thumbnail.startsWith('http') || rec.thumbnail.startsWith('/'))) ? rec.thumbnail : "https://ibb.co/LD3XGttL"}
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


