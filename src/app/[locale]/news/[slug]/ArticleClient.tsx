"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Advocate, Article } from "@/data/features/article/article.types";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Share2, Facebook, Linkedin, Link2, Check, Printer, Sparkles, X, ChevronDown, Heart } from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import Loader from "@/components/ui/Loader";
import apiClient from "@/data/services/apiConfig/apiClient";
import { useTranslations, useLocale } from "next-intl";
import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import TypewriterText from "@/components/ui/TypewriterText";
import { formatDate } from "@/utils/dateUtils";
import { getSafeImageUrl } from "@/utils/imageUtils";
import SavePostButton from "@/components/ui/SavePostButton";
import { articleApi } from "@/data/services/article-service/article-service";
import { profileApi } from "@/data/services/profile-service/profile-service";
import { useSelector } from "react-redux";
import { RootState } from "@/data/redux/store";
import PaywallOverlay from "@/components/ui/PaywallOverlay";

import SpeechPlayer from "@/components/ui/SpeechPlayer";
import { InFeedAd, ArticleTopAd, ArticleSidebarTopAd, ArticleSidebarBottomAd, ArticleBottomAd } from "@/components/ads/StandardAds";
import { ViewTracker } from "@/components/article/ViewTracker";
import ArticleStats from "@/components/article/ArticleStats";
import CommentSection from "@/components/article/CommentSection";

interface ArticleClientProps {
    initialArticle: Article;
    slug: string;
}

// ── Per-article body: manages its own translation + AI summary state ──────────
function ArticleBody({ article, locale, t, isPriority = false }: { article: Article; locale: string; t: ReturnType<typeof useTranslations>, isPriority?: boolean }) {
    const [copied, setCopied] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState<string | null>(article.aiSummary || null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [translatedData, setTranslatedData] = useState<{ title: string; content: string } | null>(null);
    const [authorPhoto, setAuthorPhoto] = useState<string | null>(null);
    const [authorUsername, setAuthorUsername] = useState<string | null>(null);
    const [advocatePhotos, setAdvocatePhotos] = useState<Record<string, string>>({});
    const [advocateUsernames, setAdvocateUsernames] = useState<Record<string, string>>({});
    const [isPrinting, setIsPrinting] = useState(false);
    const [showShareSheet, setShowShareSheet] = useState(false);
    const summaryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (summaryRef.current && !summaryRef.current.contains(event.target as Node)) {
                setShowSummary(false);
            }
        };

        if (showSummary) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSummary]);

    useEffect(() => {
        const fetchPhotos = async () => {
            // Fetch Author Photo
            if (article.authorId && article.authorId !== 'anonymous' && article.authorId !== 'system-auto-bot') {
                try {
                    const res = await profileApi.fetchPublicProfile(article.authorId);
                    if (res.data.success) {
                        if (res.data.data.profilePicture) setAuthorPhoto(res.data.data.profilePicture);
                        if (res.data.data.username) setAuthorUsername(res.data.data.username);
                    }
                } catch (err) {
                    // Fail silently for photos
                }
            }

            // Fetch Advocate Photos
            if (article.advocates && article.advocates.length > 0) {
                const photos: Record<string, string> = {};
                const usernames: Record<string, string> = {};
                await Promise.all(article.advocates.map(async (adv) => {
                    if (adv.userId) {
                        try {
                            const res = await profileApi.fetchPublicProfile(adv.userId);
                            if (res.data.success) {
                                if (res.data.data.profilePicture) photos[adv.userId] = res.data.data.profilePicture;
                                if (res.data.data.username) usernames[adv.userId] = res.data.data.username;
                            }
                        } catch (err) {
                            // Fail silently
                        }
                    }
                }));
                setAdvocatePhotos(photos);
                setAdvocateUsernames(usernames);
            }
        };

        fetchPhotos();
    }, [article.authorId, article.advocates]);
    const [isTranslating, setIsTranslating] = useState(false);

    // AI summary
    const handleSummaryClick = async () => {
        const next = !showSummary;
        setShowSummary(next);
        if (next && !summary) {
            setIsFetchingSummary(true);
            try {
                const res = await apiClient.get(`ai/summary/${article.id}`);
                if (res.data.success) setSummary(res.data.data.summary);
            } catch (e) {
                console.error("AI summary failed:", e);
            } finally {
                setIsFetchingSummary(false);
            }
        }
    };

    // Translation
    useEffect(() => {
        if (locale === "en") { setTranslatedData(null); return; }
        const run = async () => {
            setIsTranslating(true);
            try {
                const res = await fetch("/api/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: [article.title, article.content], targetLang: locale }),
                });
                const data = await res.json();
                if (data.translatedText?.length === 2) {
                    setTranslatedData({ title: data.translatedText[0], content: data.translatedText[1] });
                }
            } catch (e) {
                console.error("Translation failed:", e);
            } finally {
                setIsTranslating(false);
            }
        };
        run();
    }, [article, locale]);

    const user = useSelector((state: RootState) => state.auth.user);
    const subscription = useSelector((state: RootState) => state.subscription.currentSubscription);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isPremium = useMemo(() => {
        if (!mounted) return false;
        if (!user) return false;
        if (subscription?.status === 'active') return true;

        // Admin/Editor bypass
        const roles = user.roles || [];
        return roles.some((r: any) => {
            const name = typeof r === 'string' ? r : r.name;
            return ['admin', 'superadmin', 'editor'].includes(name.toLowerCase());
        });
    }, [user, subscription, mounted]);

    const hasFullAccess = !article.isPaywalled || isPremium;

    const readTime = Math.ceil(article.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200);
    const displayTitle = translatedData?.title || article.title;
    const displayContent = translatedData?.content || article.content;

    const handleShare = (platform: string) => {
        const articleUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/news/${article.slug}`;
        const encodedUrl = encodeURIComponent(articleUrl);
        const encodedText = encodeURIComponent(article.title || "");
        if (platform === "copy") { navigator.clipboard.writeText(articleUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); return; }
        if (platform === "print") {
            setIsPrinting(true);
            document.body.classList.add("is-printing");
            // Small delay to allow state change to render before print dialog
            setTimeout(() => {
                window.print();
                setIsPrinting(false);
                document.body.classList.remove("is-printing");
            }, 100);
            return;
        }
        const urls: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(`Sajjad Husain Law Associates\n\n${article.title}\n\n`)}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Sajjad Husain Law Associates\n\n${article.title}\n\nClick to Read Complete News\n${articleUrl}`)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(`Sajjad Husain Law Associates\n\n${article.title}\n\nClick to Read Complete News\n${articleUrl}`)}`,
            email: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
        };
        if (urls[platform]) window.open(urls[platform], "_blank");
    };

    return (
        <div className={`article-wrapper relative ${isPrinting ? 'print-this' : ''}`}>
            <ViewTracker articleId={article.id || (article as any)._id} />
            <div>
                {/* Title */}
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight font-georgia">{displayTitle}</h2>

                    {/* Author metadata */}
                    {(authorUsername || article.authorId) && article.authorId !== 'system-auto-bot' ? (
                        <Link href={`/profile/${authorUsername || article.authorId}`} className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8 p-3 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors group/author">
                            <div className="h-14 w-14 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-2xl font-bold ring-2 ring-[#C9A227]/80 shadow-sm shrink-0 overflow-hidden relative group-hover/author:ring-[#C9A227]/70 transition-all">
                                {authorPhoto ? (
                                    <Image src={authorPhoto} alt={article.authors || "Author"} fill sizes="100px" className="object-cover" quality={90} />
                                ) : (
                                    article.authors?.charAt(0).toUpperCase() || "A"
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-lg leading-none m-0 group-hover/author:text-[#C9A227] transition-colors">{article.authors || "Unknown Author"}</h3>
                                    <span className="px-2 py-0.5 bg-[#0A2342]/10 text-[#0A2342] text-[10px] uppercase font-bold tracking-wider rounded-md">Author</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                                        <span className="font-medium">{formatDate(article.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="font-medium">{readTime} {t("minsRead")}</span>
                                    </div>
                                    <ArticleStats
                                        articleId={article.id || (article as any)._id}
                                        initialLikes={(article as any).likes || 0}
                                        initialViews={(article as any).views || 0}
                                        hasLikedByCurrentUser={(article as any).hasLikedByCurrentUser}
                                        className="print:hidden"
                                    />
                                    {isTranslating && (
                                        <div className="flex items-center gap-1.5 text-[#C9A227] animate-pulse">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                            <span className="text-xs font-bold">Translating...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8 p-3 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                            <div className="h-14 w-14 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-2xl font-bold ring-4 ring-[#C9A227]/20 shadow-sm shrink-0 overflow-hidden relative">
                                {authorPhoto ? (
                                    <Image src={authorPhoto} alt={article.authors || "Author"} fill sizes="100px" className="object-cover" quality={90} />
                                ) : (
                                    article.authors?.charAt(0).toUpperCase() || "A"
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-lg leading-none m-0">{article.authors || "Unknown Author"}</h3>
                                    <span className="px-2 py-0.5 bg-[#0A2342]/10 text-[#0A2342] text-[10px] uppercase font-bold tracking-wider rounded-md">Author</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                                        <span className="font-medium">{formatDate(article.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="font-medium">{readTime} {t("minsRead")}</span>
                                    </div>
                                    <ArticleStats
                                        articleId={article.id || (article as any)._id}
                                        initialLikes={(article as any).likes || 0}
                                        initialViews={(article as any).views || 0}
                                        hasLikedByCurrentUser={(article as any).hasLikedByCurrentUser}
                                        className="print:hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Thumbnail */}
                {article.thumbnail && (
                    <div className="relative w-full aspect-video mb-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                        <Image
                            src={getSafeImageUrl(article.thumbnail)}
                            alt={displayTitle}
                            fill
                            priority={isPriority}
                            sizes="(max-width: 1024px) 100vw, 900px"
                            quality={100}
                            className="object-cover" // className="object-contain" //object-cover
                        />
                    </div>
                )}

                {/* Tags + AI Summary */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative min-h-[40px]">
                    <div className="flex flex-wrap items-center gap-2 flex-1 pr-0 md:pr-4">
                        {article.tags && article.tags.length > 0 && (
                            <>
                                <span className="text-sm font-bold text-gray-900 mr-2">Tags:</span>
                                {article.tags.map((tag) => (
                                    <Link key={tag.id} href={`/tags/${tag.slug}`} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                        {tag.name}
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>
                    <div ref={summaryRef} className="w-full md:w-auto relative flex justify-start md:justify-end">
                        <button type="button" onClick={handleSummaryClick} className="w-full md:w-auto justify-center px-6 py-2 bg-blue-600 text-white text-base font-medium rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                            AI Summary
                        </button>
                        {showSummary && (
                            <div className="absolute right-0 top-12 md:right-full md:top-0 md:mr-3 w-[85vw] md:w-[450px] max-w-[450px] bg-[#C9A227] p-4 rounded-xl shadow-2xl border border-gray-200 z-20 text-justify">
                                <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-2">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"> AI Summary</h3>
                                    <button type="button" onClick={() => setShowSummary(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-900 hover:text-red-500"><X size={18} /></button>
                                </div>
                                <div className="text-md text-black leading-relaxed max-h-[300px] overflow-y-auto font-georgia pr-4">
                                    {isFetchingSummary ? <div className="flex justify-center py-6"><Loader size="sm" text="Thinking..." /></div>
                                        : summary ? <TypewriterText text={summary} speed={30} /> : "No summary available."}
                                </div>
                                <div className="hidden md:block absolute top-4 -right-2 w-4 h-4 bg-[#C9A227] border-t border-r border-gray-200 transform rotate-45" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Social Share */}
                <div className="flex sm:hidden items-center justify-between w-full mb-10 py-2 px-2 bg-white rounded-xl sm:rounded-full border border-gray-200 shadow-sm print:hidden">
                    {(mounted && user) && (
                        <>
                            <SavePostButton postId={article.id || (article as any)._id} showText={true} text="Save Article" className="!bg-transparent hover:!bg-gray-50 border-none !text-gray-700 hover:!text-blue-600 px-2 py-1 flex-1 justify-center" iconSize={18} />
                            <div className="w-px h-6 bg-gray-200" />
                        </>
                    )}

                    <button onClick={() => setShowShareSheet(true)} className="flex flex-1 items-center justify-center gap-2 text-blue-600 font-medium px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors">
                        <Link2 size={18} className="text-blue-600" />
                        <span className="text-sm">Share</span>
                    </button>

                    <div className="w-px h-6 bg-gray-200" />

                    <button onClick={() => handleShare("print")} className="flex flex-1 items-center justify-center gap-2 text-gray-700 font-medium px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors">
                        <Printer size={18} />
                        <span className="text-sm text-gray-700">Print</span>
                    </button>
                </div>

                {/* Desktop & Tablet Social Share */}
                <div className="hidden sm:flex flex-row items-center gap-6 mb-10 py-3 px-6 bg-white rounded-full border border-gray-200 w-fit mx-0 shadow-sm relative print:hidden">
                    <div className="flex items-center gap-3 text-[#0A2342] font-bold min-w-fit">
                        <Share2 size={20} className="text-[#0A2342]" />
                        <span className="text-sm tracking-wider">{t("shareArticle")}</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />

                    <div className="flex flex-wrap items-center gap-3">
                        <SavePostButton postId={article.id || (article as any)._id} className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300" iconSize={20} />
                        <button onClick={() => handleShare("facebook")} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A2342] text-white hover:text-[#C9A227] transition-all duration-300"><Facebook size={18} /></button>
                        <button onClick={() => handleShare("twitter")} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A2342] text-white hover:text-[#C9A227] transition-all duration-300">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </button>
                        <button onClick={() => handleShare("whatsapp")} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A2342] text-white hover:text-[#C9A227] transition-all duration-300">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        </button>
                        <button onClick={() => handleShare("linkedin")} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0077b5] text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"><Linkedin size={18} /></button>
                        <button onClick={() => handleShare("telegram")} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0088cc] text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"><FaTelegramPlane size={18} /></button>
                        <button onClick={() => handleShare("email")} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#dd4b39] text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                        </button>
                    </div>

                    <div className="w-px h-8 bg-gray-200" />

                    <div className="flex items-center gap-3">
                        <button onClick={() => handleShare("copy")} className={`w-10 h-10 flex items-center justify-center rounded-full ${copied ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} transition-all duration-300 hover:-translate-y-1`}>
                            {copied ? <Check size={18} /> : <Link2 size={18} />}
                        </button>
                        <button onClick={() => handleShare("print")} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:-translate-y-1 transition-all duration-300"><Printer size={18} /></button>
                    </div>
                </div>

                {/* Mobile Share Bottom Sheet */}
                {showShareSheet && (
                    <div className="sm:hidden">
                        <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={() => setShowShareSheet(false)} />
                        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform transform translate-y-0 duration-300 ease-out">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold text-center w-full text-gray-900">Share Article</h3>
                            </div>
                            <p className="text-sm text-gray-500 text-center mb-8">Share this article with your friends and colleagues</p>

                            <div className="grid grid-cols-4 gap-y-6 gap-x-2 mb-8">
                                <button onClick={() => handleShare("whatsapp")} className="flex flex-col items-center gap-2 group">
                                    <div className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg></div>
                                    <span className="text-xs text-gray-600 font-medium">WhatsApp</span>
                                </button>
                                <button onClick={() => handleShare("telegram")} className="flex flex-col items-center gap-2 group">
                                    <div className="w-14 h-14 rounded-full bg-[#0088cc] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><FaTelegramPlane size={26} /></div>
                                    <span className="text-xs text-gray-600 font-medium">Telegram</span>
                                </button>
                                <button onClick={() => handleShare("twitter")} className="flex flex-col items-center gap-2 group">
                                    <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></div>
                                    <span className="text-xs text-gray-600 font-medium">X (Twitter)</span>
                                </button>
                                <button onClick={() => handleShare("linkedin")} className="flex flex-col items-center gap-2 group">
                                    <div className="w-14 h-14 rounded-full bg-[#0077b5] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><Linkedin size={24} fill="currentColor" className="text-white" /></div>
                                    <span className="text-xs text-gray-600 font-medium">LinkedIn</span>
                                </button>
                                <button onClick={() => handleShare("facebook")} className="flex flex-col items-center gap-2 group">
                                    <div className="w-14 h-14 rounded-full bg-[#1877F2] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><Facebook size={26} fill="currentColor" className="text-white" /></div>
                                    <span className="text-xs text-gray-600 font-medium">Facebook</span>
                                </button>
                                <button onClick={() => handleShare("email")} className="flex flex-col items-center gap-2 group">
                                    <div className="w-14 h-14 rounded-full bg-[#EA4335] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg></div>
                                    <span className="text-xs text-gray-600 font-medium">Email</span>
                                </button>
                                <button onClick={() => handleShare("copy")} className="flex flex-col items-center gap-2 group">
                                    <div className={`w-14 h-14 rounded-full ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'} flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all`}>
                                        {copied ? <Check size={24} /> : <Link2 size={24} />}
                                    </div>
                                    <span className="text-xs text-gray-600 font-medium">Copy Link</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* if not need then remove this  and also SpeechPlayer.tsx  which is in sre/components/ui/SpeechPlayer.tsx*/}
                {/* Speech Player */}

                {/* <SpeechPlayer article={article} /> */}


                {/* Article Content */}
                <div className="article-content relative">
                    <style>{`
                        .article-content img {
                            max-width: 100% !important;
                            height: auto !important;
                        }
                        .article-content iframe, .article-content video {
                            max-width: 100% !important;
                            aspect-ratio: 16 / 9;
                            height: auto !important;
                        }
                        @media (max-width: 640px) {
                            .article-content h1 { font-size: 1.75rem !important; line-height: 1.3 !important; margin-bottom: 0.75rem !important; }
                            .article-content h2 { font-size: 1.5rem !important; line-height: 1.3 !important; margin-bottom: 0.75rem !important; }
                            .article-content h3 { font-size: 1.25rem !important; line-height: 1.4 !important; margin-bottom: 0.5rem !important; }
                            .article-content h4, .article-content h5, .article-content h6 { font-size: 1.125rem !important; line-height: 1.4 !important; margin-bottom: 0.5rem !important; }
                            .article-content p, .article-content li, .article-content span { font-size: 1rem !important; line-height: 1.6 !important; }
                        }
                    `}</style>
                    <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                    {!hasFullAccess && <PaywallOverlay isLoggedIn={mounted ? !!user : false} t={t} />}
                </div>

                {/* Developing Story Timeline */}
                {hasFullAccess && article.updates && article.updates.length > 0 && (
                    <div className="mb-12 mt-12 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-10 pb-4 border-b font-georgia">Developing Story Timeline</h3>
                        <div className="space-y-12 relative pl-8 border-l-[3px] border-[#2A65A4] ml-2">
                            {[...article.updates].map((update, idx) => {
                                const isLatest = idx === article.updates!.length - 1;
                                return (
                                    <div key={idx} className="relative">
                                        {isLatest ? (
                                            <div className="absolute -left-[41px] top-1 w-4 h-4 z-10">
                                                <div className="absolute inset-0 rounded-full border-[3px] border-[#2A65A4] bg-[#2A65A4] ring-4 ring-white z-10" />
                                                <div className="absolute -inset-1 rounded-full bg-[#2A65A4] animate-ping opacity-75 z-0" />
                                            </div>
                                        ) : (
                                            <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full border-[3px] border-[#2A65A4] bg-white ring-4 ring-white z-10" />
                                        )}
                                        <div className="flex flex-col gap-2 timeline-update-content">
                                            <span className="text-gray-500 text-sm font-semibold tracking-wide uppercase">{formatDate(update.updateDate as string)}</span>
                                            {update.title && <h4 className="font-bold text-[18px] sm:text-[22px] text-[#0A2342] leading-snug">{update.title}</h4>}
                                            <div className="text-gray-700 text-[16px] leading-relaxed prose max-w-none mt-1 font-georgia" dangerouslySetInnerHTML={{ __html: update.content }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Related Documents */}
                {hasFullAccess && article.documents && article.documents.length > 0 && (
                    <div className="mb-16 p-4 sm:p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            Related Documents
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {article.documents.map((doc) => {
                                const isImage = doc.fileType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(doc.fileUrl);
                                return (
                                    <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#C9A227] hover:shadow-md transition-all duration-300">
                                        {isImage ? (
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                                                <Image src={getSafeImageUrl(doc.fileUrl)} alt={doc.fileName} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C9A227]/10 transition-colors">
                                                <svg className="w-8 h-8 text-gray-400 group-hover:text-[#C9A227] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#C9A227] transition-colors">{doc.fileName}</p>
                                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1.5 mt-0.5">
                                                <span className="font-semibold text-[#C9A227] truncate max-w-[100px] sm:max-w-[150px]" title={doc.fileType?.split("/")[1]?.toUpperCase() || "FILE"}>{doc.fileType?.split("/")[1]?.toUpperCase() || "FILE"}</span>
                                                <span className="inline-block w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                                <span className="flex-shrink-0 whitespace-nowrap">{doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) : "0.00"} MB</span>
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#C9A227] group-hover:text-white transition-all transform group-hover:translate-x-1 shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Advocate info */}
                {((article.advocates && article.advocates.length > 0) || article.advocateName) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-8">
                        {(article.advocates && article.advocates.length > 0 ? article.advocates : ([{ name: article.advocateName }] as Advocate[])).map((adv, idx) => {
                            if (!adv?.name && !article.advocateName) return null;
                            const profileId = adv.userId;
                            const targetPath = adv.userId ? (advocateUsernames[adv.userId] || adv.userId) : null;
                            return targetPath ? (
                                <Link key={idx} href={`/profile/${targetPath}`} className="flex items-center gap-3 md:gap-4 p-2 sm:p-2 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors group/advocate">
                                    <div className="h-14 w-14 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-2xl font-bold ring-2 ring-[#C9A227]/80 shadow-sm shrink-0 overflow-hidden relative group-hover/advocate:ring-[#C9A227]/70 transition-all">
                                        {adv?.userId && advocatePhotos[adv.userId] ? (
                                            <Image src={advocatePhotos[adv.userId]} alt={adv.name || "Advocate"} fill sizes="100px" className="object-cover" quality={90} />
                                        ) : (
                                            (adv?.name || article.advocateName)?.charAt(0).toUpperCase() || "A"
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 text-lg leading-none m-0 group-hover/advocate:text-[#C9A227] transition-colors">{adv.name}</h3>
                                            <span className="px-2 py-0.5 bg-[#0A2342]/10 text-[#0A2342] text-[10px] uppercase font-bold tracking-wider rounded-md">Advocate</span>
                                        </div>
                                        {adv?.email && <p className="text-sm text-gray-500">{adv.email}</p>}
                                    </div>
                                </Link>
                            ) : (
                                <div key={idx} className="flex items-center gap-3 md:gap-4 p-2 sm:p-3 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                                    <div className="h-14 w-14 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-2xl font-bold ring-4 ring-[#C9A227]/20 shadow-sm shrink-0 overflow-hidden relative">
                                        {adv?.userId && advocatePhotos[adv.userId] ? (
                                            <Image src={advocatePhotos[adv.userId]} alt={adv.name || "Advocate"} fill sizes="100px" className="object-cover" quality={90} />
                                        ) : (
                                            (adv?.name || article.advocateName)?.charAt(0).toUpperCase() || "A"
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 text-lg leading-none m-0">{adv?.name || article.advocateName || "Unknown Advocate"}</h3>
                                            <span className="px-2 py-0.5 bg-[#0A2342]/10 text-[#0A2342] text-[10px] uppercase font-bold tracking-wider rounded-md">Advocate</span>
                                        </div>
                                        {adv?.email && <p className="text-sm text-gray-500">{adv.email}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Article Bottom Banner */}
                {!isPremium && (
                    <div className="w-full flex justify-center mb-8">
                        <ArticleBottomAd />
                    </div>
                )}

                {/* Comments Section */}
                {article.isCommentsEnabled !== false && (
                    <div className="mt-2 print:hidden">
                        <CommentSection articleId={article.id || (article as any)._id} />
                    </div>
                )}

                {/* Print-only Footer */}
                <div className="print-footer">
                    https://www.sajjadhusainlawassociates.com
                </div>
            </div>
        </div>
    );
}

// ── Root client component ─────────────────────────────────────────────────────
export default function ArticleClient({ initialArticle, slug }: ArticleClientProps) {
    const t = useTranslations("ArticleDetail");
    const locale = useLocale();

    // ── Infinite scroll state ─────────────────────────────────────────────────
    const [articles, setArticles] = useState<Article[]>([initialArticle]);
    const [page, setPage] = useState(1);           // page to fetch next
    const [hasMore, setHasMore] = useState(!!initialArticle.category?.slug);
    const [loadingNext, setLoadingNext] = useState(false);
    const [loadedSlugs] = useState(() => new Set([slug]));
    const sentinelRef = useRef<HTMLDivElement>(null);
    const sidebarContainerRef = useRef<HTMLDivElement>(null);
    const sidebarScrollRef = useRef<HTMLDivElement>(null);
    const isHoveringSidebar = useRef(false);

    // ── SYNCED SCROLLING LOGIC ──
    useEffect(() => {
        const handleGlobalWheel = (e: WheelEvent) => {
            const scroller = sidebarScrollRef.current;
            if (!scroller) return;

            if (isHoveringSidebar.current) {
                const isAtTop = scroller.scrollTop <= 0;
                const isAtBottom = Math.ceil(scroller.scrollTop + scroller.clientHeight) >= scroller.scrollHeight;

                if (e.deltaY > 0 && !isAtBottom) {
                    // Scrolling down and sidebar can scroll
                    scroller.scrollTop += e.deltaY;
                    if (e.cancelable) e.preventDefault();
                } else if (e.deltaY < 0 && !isAtTop) {
                    // Scrolling up and sidebar can scroll
                    scroller.scrollTop += e.deltaY;
                    if (e.cancelable) e.preventDefault();
                }
                // If at boundaries, don't preventDefault -> news side scrolls
            } else {
                // News side scroll -> Sidebar chaining at bottom
                const isPageAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
                if (e.deltaY > 0 && isPageAtBottom) {
                    const isSidebarAtBottom = Math.ceil(scroller.scrollTop + scroller.clientHeight) >= scroller.scrollHeight;
                    if (!isSidebarAtBottom) {
                        scroller.scrollTop += e.deltaY;
                        if (e.cancelable) e.preventDefault();
                    }
                }
            }
        };

        window.addEventListener('wheel', handleGlobalWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleGlobalWheel);
    }, []);
    // ────────────────────────────

    const user = useSelector((state: RootState) => state.auth.user);
    const subscription = useSelector((state: RootState) => state.subscription.currentSubscription);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isPremium = useMemo(() => {
        if (!mounted) return false;
        if (!user) return false;
        if (subscription?.status === 'active') return true;

        // Admin/Editor bypass
        const roles = user.roles || [];
        return roles.some((r: any) => {
            const name = typeof r === 'string' ? r : r.name;
            return ['admin', 'superadmin', 'editor'].includes(name.toLowerCase());
        });
    }, [user, subscription, mounted]);

    // Re-fetch initial article if it was truncated by server-side fetch (which lacks JWT)
    useEffect(() => {
        const checkAndRefetch = async () => {
            const firstArticle = articles[0];
            if (!firstArticle) return;

            const isPremium = subscription?.status === 'active' ||
                user?.roles?.some((r: any) => {
                    const name = typeof r === 'string' ? r : r.name;
                    return ['admin', 'superadmin', 'editor'].includes(name.toLowerCase());
                });

            if (firstArticle.isTruncated && isPremium) {
                try {
                    const res = await articleApi.fetchArticleById(firstArticle.slug);
                    const fullArticle = res.data.data || res.data;
                    if (fullArticle && !fullArticle.isTruncated) {
                        setArticles(prev => [fullArticle, ...prev.slice(1)]);
                    }
                } catch (err) {
                    console.error("Failed to re-fetch full article content", err);
                }
            }
        };

        checkAndRefetch();
    }, [subscription, user, articles[0]?.id, articles[0]?.isTruncated]);

    const loadNextArticle = useCallback(async () => {
        if (loadingNext || !hasMore || !initialArticle.category?.slug) return;
        if (articles.length >= 5) { setHasMore(false); return; }

        setLoadingNext(true);
        try {
            let currentPage = page;
            let foundNext = false;
            let attempts = 0;

            while (!foundNext && attempts < 3) {
                const res = await articleApi.fetchArticles({
                    category: initialArticle.category.slug,
                    page: currentPage,
                    limit: 3, // Fetch more to increase chances of finding a new one
                });
                const raw = res.data as any;
                const fetched: Article[] = raw?.data || [];
                const totalPages: number = raw?.meta?.total_pages || 1;

                const next = fetched.find((a) => !loadedSlugs.has(a.slug));
                if (next) {
                    loadedSlugs.add(next.slug);
                    setArticles((prev) => [...prev, next]);
                    setPage(currentPage + 1);
                    if (currentPage >= totalPages) setHasMore(false);
                    foundNext = true;
                } else {
                    if (currentPage >= totalPages) {
                        setHasMore(false);
                        break;
                    }
                    currentPage++;
                    attempts++;
                }
            }
            if (!foundNext) setPage(currentPage);
        } catch {
            setHasMore(false);
        } finally {
            setLoadingNext(false);
        }
    }, [loadingNext, hasMore, initialArticle.category?.slug, page, loadedSlugs, articles.length]);

    // Wire IntersectionObserver to sentinel div
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadNextArticle(); },
            { rootMargin: "1000px" } // Load much earlier (1 news in advance)
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadNextArticle]);

    // Ensure 1 news in advance is loaded immediately on mount
    useEffect(() => {
        loadNextArticle();
    }, []);

    // ── Sidebar: related articles ─────────────────────────────────────────────
    const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
    const [loadingRecommended, setLoadingRecommended] = useState(true);
    const [relatedTitlesToTranslate, setRelatedTitlesToTranslate] = useState<string[]>([]);

    useEffect(() => {
        const fetch = async () => {
            if (!initialArticle.category?.slug) { setLoadingRecommended(false); return; }
            try {
                const initialRes = await articleApi.fetchArticles({ category: initialArticle.category.slug, limit: 12, page: 1 });
                const data = initialRes.data as any;
                const totalPages = data.meta?.total_pages || 1;
                let items: Article[] = data.data || [];
                if (totalPages > 1) {
                    const rp = Math.floor(Math.random() * totalPages) + 1;
                    if (rp !== 1) {
                        const rRes = await articleApi.fetchArticles({ category: initialArticle.category.slug, limit: 12, page: rp });
                        items = (rRes.data as any).data || [];
                    }
                }
                setRecommendedArticles(items.filter((a: Article) => a.slug !== slug));
            } catch (e) { console.error("Related fetch failed", e); }
            finally { setLoadingRecommended(false); }
        };
        fetch();
    }, [initialArticle.category?.slug, slug]);

    useEffect(() => {
        if (recommendedArticles.length > 0 && locale !== "en") {
            setRelatedTitlesToTranslate(recommendedArticles.map((a) => a.title));
        }
    }, [recommendedArticles, locale]);

    const { translatedText: translatedRelatedTitles } = useGoogleTranslate(
        locale !== "en" && relatedTitlesToTranslate.length > 0 ? relatedTitlesToTranslate : null
    );

    const displayRecommended = useMemo(() => {
        if (locale === "en" || !translatedRelatedTitles || !Array.isArray(translatedRelatedTitles)) return recommendedArticles;
        return recommendedArticles.map((rec, idx) => ({ ...rec, title: translatedRelatedTitles[idx] || rec.title }));
    }, [recommendedArticles, translatedRelatedTitles, locale]);

    if (!initialArticle) {
        return <div className="flex justify-center items-center min-h-screen"><Loader text={t("loading")} size="lg" /></div>;
    }

    return (
        <div className="bg-white min-h-screen font-georgia">
            <div className="max-w-7xl mx-auto py-8 px-4">

                {/* Article Top Banner */}
                {!isPremium && (
                    <div className="mt-1">
                        <ArticleTopAd />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ── Main content column ── */}
                    <div className="lg:col-span-9">
                        {articles.map((article, i) => (
                            <React.Fragment key={article.id}>

                                {/* "Next News" divider between articles */}
                                {i > 0 && (
                                    <>
                                        <div className="relative flex items-center my-16">
                                            <div className="flex-1 border-t-2 border-dashed border-[#0B2149]/20" />
                                            <div className="mx-6 flex items-center gap-3 px-6 py-3 bg-[#0B2149] text-white rounded-full shadow-lg text-sm font-bold tracking-widest uppercase whitespace-nowrap">
                                                <ChevronDown size={15} className="text-[#C9A227]" />
                                                Next News
                                                <ChevronDown size={15} className="text-[#C9A227]" />
                                            </div>
                                            <div className="flex-1 border-t-2 border-dashed border-[#0B2149]/20" />
                                        </div>

                                        {/* In-Feed Ad between articles in infinite scroll */}
                                        <InFeedAd />
                                    </>
                                )}

                                <ArticleBody article={article} locale={locale} t={t} isPriority={i === 0} />
                            </React.Fragment>
                        ))}

                        {/* Invisible sentinel — IntersectionObserver trigger */}
                        {hasMore && <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />}

                        {/* Loading next */}
                        {loadingNext && (
                            <div className="flex justify-center items-center py-12">
                                <Loader size="sm" text="Loading next article..." />
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar (sticky, related articles from category) ── */}
                    <div
                        className="lg:col-span-3 relative z-20 print:hidden"
                        ref={sidebarContainerRef}
                        onMouseEnter={() => { isHoveringSidebar.current = true; }}
                        onMouseLeave={() => { isHoveringSidebar.current = false; }}
                    >
                        <div
                            ref={sidebarScrollRef}
                            className="sticky top-24 max-h-[90vh] overflow-y-auto pr-2 scrollbar-hide pb-10"
                        >
                            {/* Sidebar Top Ad */}
                            {!isPremium && (
                                <div className="mb-6">
                                    <ArticleSidebarTopAd />
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-gray-900 mb-4 font-georgia">{t("relatedArticles")}</h3>
                            <div className="space-y-6">
                                {loadingRecommended ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="flex gap-4 animate-pulse">
                                            <div className="w-24 h-24 bg-gray-200 rounded shrink-0" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-4 bg-gray-200 rounded w-full" />
                                                <div className="h-4 bg-gray-200 rounded w-5/6" />
                                            </div>
                                        </div>
                                    ))
                                ) : displayRecommended.length > 0 ? (
                                    displayRecommended.map((rec) => (
                                        <Link key={rec.id} href={`/news/${rec.slug}`} className="block group">
                                            <div className="flex gap-4">
                                                <div className="relative w-28 aspect-video flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                                    <Image src={getSafeImageUrl(rec.thumbnail)} alt={rec.title} fill sizes="200px" className="object-cover" quality={90} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm text-gray-900 line-clamp-3 group-hover:text-blue-600 transition-colors leading-snug">{rec.title}</h4>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No related articles found.</p>
                                )}
                            </div>

                            {/* Sidebar Bottom Ad */}
                            {!isPremium && (
                                <div className="mt-1">
                                    <ArticleSidebarBottomAd />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
