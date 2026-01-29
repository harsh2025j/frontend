"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";
import { Link } from "@/i18n/routing";
import { Share2, Facebook, Linkedin, Link2, Check, Printer, Sparkles, X } from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import Loader from "@/components/ui/Loader";
import apiClient from "@/data/services/apiConfig/apiClient";
import { useTranslations, useLocale } from "next-intl";
import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import TypewriterText from "@/components/ui/TypewriterText";
import { formatDate } from "@/utils/dateUtils";
import { getSafeImageUrl } from "@/utils/imageUtils";

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
                const response = await apiClient.get(`ai/summary/${initialArticle.id}`);
                const data = response.data;
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
            tumblr: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
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
                                                {formatDate(initialArticle.createdAt)}
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
                            <div className="relative w-full h-[450px] mb-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <Image
                                    src={getSafeImageUrl(initialArticle.thumbnail)}
                                    alt={translatedData ? translatedData.title : initialArticle.title}
                                    fill
                                    priority
                                    unoptimized
                                    sizes="(max-width: 1024px) 100vw, 800px"
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Tags */}
                        <div className="mb-8 flex flex-wrap items-center gap-2 relative pr-40 min-h-[40px]">
                            {/* Tags */}
                            {initialArticle.tags && initialArticle.tags.length > 0 && (
                                <>
                                    <span className="text-sm font-bold text-gray-900 mr-2">Tags:</span>
                                    {initialArticle.tags.map((tag) => (
                                        <Link
                                            key={tag.id}
                                            href={`/tags/${tag.slug}`}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                        >
                                            {tag.name}
                                        </Link>
                                    ))}
                                </>
                            )}

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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="fill-current" viewBox="0 0 16 16">
                                        <path d="M8 0a8 8 0 0 0-2.915 15.452c-.07-.633-.134-1.606.027-2.297.146-.625.938-4.02.938-4.02s-.239-.479-.239-1.187c0-1.113.645-1.943 1.448-1.943.682 0 1.012.512 1.012 1.127 0 .686-.437 1.712-.663 2.663-.188.796.4 1.446 1.185 1.446 1.422 0 2.515-1.5 2.515-3.664 0-1.915-1.377-3.254-3.342-3.254-2.436 0-3.853 1.84-3.853 3.744 0 .74.284 1.533.64 1.965.07.084.08.156.058.24-.06.255-.192.793-.217.904-.034.137-.109.166-.251.1-1.402-.652-2.277-2.698-2.277-4.343 0-3.53 2.568-6.002 6.907-6.002 3.633 0 6.005 2.652 6.005 6.137 0 3.662-2.306 6.353-5.511 6.353-1.077 0-2.09-.56-2.437-1.218.002-.007.59-2.327.734-2.872.13-.489.206-.757.305-1.055.458.87.893 1.743 1.342 2.613a7.994 7.994 0 0 0 1.259-.062c3.543-.594 6.22-3.67 6.22-7.394C16 3.58 12.42 0 8 0z" />
                                    </svg>
                                </button>

                                {/* Telegram */}
                                <button
                                    onClick={() => handleShare('tumblr')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0088cc] text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                    title={t('shareOn', { platform: 'Telegram' })}
                                >
                                    <FaTelegramPlane size={18} />
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

                        {/* Related Documents */}
                        {initialArticle.documents && initialArticle.documents.length > 0 && (
                            <div className="mb-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    Related Documents
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {initialArticle.documents.map((doc) => {
                                        const isImage = doc.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(doc.fileUrl);
                                        return (
                                            <a
                                                key={doc.id}
                                                href={doc.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#C9A227] hover:shadow-md transition-all duration-300"
                                            >
                                                {isImage ? (
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                                                        <Image
                                                            src={getSafeImageUrl(doc.fileUrl)}
                                                            alt={doc.fileName}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                            unoptimized
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C9A227]/10 transition-colors">
                                                        <svg className="w-8 h-8 text-gray-400 group-hover:text-[#C9A227] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#C9A227] transition-colors">
                                                        {doc.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1.5 mt-0.5">
                                                        <span className="font-semibold text-[#C9A227]">{doc.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                                                        <span>{doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) : '0.00'} MB</span>
                                                    </p>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#C9A227] group-hover:text-white transition-all transform group-hover:translate-x-1 shrink-0">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
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
                                                    src={getSafeImageUrl(rec.thumbnail)}
                                                    alt={rec.title}
                                                    fill
                                                    sizes="96px"
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


