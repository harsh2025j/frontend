"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Advocate, Article } from "@/data/features/article/article.types";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Share2, Facebook, Linkedin, Link2, Check, Printer, Sparkles, X, ChevronDown, Heart, Mail, ChevronRight, Paperclip, Download } from "lucide-react";
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
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { capitalizeFirstChar, capitalizeFirstCharInHtml } from "@/utils/textUtils";

import SpeechPlayer, { ListenArticleButton } from "@/components/ui/SpeechPlayer";
import { InFeedAd, ArticleTopAd, ArticleSidebarTopAd, ArticleSidebarBottomAd, ArticleBottomAd } from "@/components/ads/StandardAds";
import { ViewTracker } from "@/components/article/ViewTracker";
import ArticleStats from "@/components/article/ArticleStats";
import CommentSection from "@/components/article/CommentSection";

interface DocTypeInfo {
    ext: string;
    badgeClass: string;
    iconBgClass: string;
    iconColorClass: string;
}

const getDocTypeInfo = (fileType?: string, fileName?: string): DocTypeInfo => {
    let ext = "";
    if (fileName && fileName.includes(".")) {
        const parts = fileName.split(".");
        const candidate = parts[parts.length - 1].trim().toUpperCase();
        if (candidate.length >= 1 && candidate.length <= 5 && !candidate.includes("/")) {
            ext = candidate;
        }
    }
    if (!ext && fileType) {
        const lower = fileType.toLowerCase();
        if (lower.includes("wordprocessingml") || lower.includes("msword")) ext = "DOCX";
        else if (lower.includes("spreadsheetml") || lower.includes("ms-excel")) ext = "XLSX";
        else if (lower.includes("presentationml") || lower.includes("ms-powerpoint")) ext = "PPTX";
        else if (lower.includes("pdf")) ext = "PDF";
        else if (lower.startsWith("image/")) ext = lower.split("/")[1]?.toUpperCase() || "IMG";
        else {
            const raw = fileType.split("/")[1]?.toUpperCase() || "DOC";
            ext = raw.length <= 5 ? raw : "DOC";
        }
    }
    if (!ext) ext = "DOC";

    switch (ext) {
        case "PDF":
            return {
                ext,
                badgeClass: "bg-red-50 text-red-700 border-red-200/80",
                iconBgClass: "bg-red-50/70 border-red-100 group-hover:bg-red-50",
                iconColorClass: "text-red-600",
            };
        case "DOC":
        case "DOCX":
            return {
                ext,
                badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80",
                iconBgClass: "bg-blue-50/70 border-blue-100 group-hover:bg-blue-50",
                iconColorClass: "text-blue-600",
            };
        case "XLS":
        case "XLSX":
        case "CSV":
            return {
                ext,
                badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
                iconBgClass: "bg-emerald-50/70 border-emerald-100 group-hover:bg-emerald-50",
                iconColorClass: "text-emerald-600",
            };
        case "PPT":
        case "PPTX":
            return {
                ext,
                badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
                iconBgClass: "bg-amber-50/70 border-amber-100 group-hover:bg-amber-50",
                iconColorClass: "text-amber-600",
            };
        case "ZIP":
        case "RAR":
        case "7Z":
        case "TAR":
            return {
                ext,
                badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
                iconBgClass: "bg-purple-50/70 border-purple-100 group-hover:bg-purple-50",
                iconColorClass: "text-purple-600",
            };
        default:
            return {
                ext,
                badgeClass: "bg-[#FAF7F2] text-[#3E342B] border-[#ECE7DE]",
                iconBgClass: "bg-[#FAF7F2] border-[#ECE7DE] group-hover:bg-[#F4EFE6]",
                iconColorClass: "text-[#C9A227]",
            };
    }
};

const formatDocFileSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return "0 KB";
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

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
    const [authorDesignation, setAuthorDesignation] = useState<string | null>((article as any).authorDesignation || (article as any).designation || null);
    const [advocatePhotos, setAdvocatePhotos] = useState<Record<string, string>>({});
    const [advocateUsernames, setAdvocateUsernames] = useState<Record<string, string>>({});
    const [isPrinting, setIsPrinting] = useState(false);
    const [showShareSheet, setShowShareSheet] = useState(false);
    const desktopSummaryRef = useRef<HTMLDivElement>(null);
    const mobileSummaryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const clickedInsideDesktop = desktopSummaryRef.current?.contains(target);
            const clickedInsideMobile = mobileSummaryRef.current?.contains(target);
            if (!clickedInsideDesktop && !clickedInsideMobile) {
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
            // Fetch Author Photo & Designation
            if (article.authorId && article.authorId !== 'anonymous' && article.authorId !== 'system-auto-bot') {
                try {
                    const res = await profileApi.fetchPublicProfile(article.authorId);
                    if (res.data.success) {
                        if (res.data.data.profilePicture) setAuthorPhoto(res.data.data.profilePicture);
                        if (res.data.data.username) setAuthorUsername(res.data.data.username);
                        if (res.data.data.designation && res.data.data.designation !== "null" && res.data.data.designation !== "NULL") {
                            setAuthorDesignation(res.data.data.designation);
                        }
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
    const displayTitle = capitalizeFirstChar(translatedData?.title || article.title);
    const displayContent = capitalizeFirstCharInHtml(translatedData?.content || article.content);

    const authorSubtitle = useMemo(() => {
        if (authorDesignation && authorDesignation.trim()) {
            return authorDesignation.trim();
        }
        if (article.authorRole) {
            const normalized = article.authorRole.toLowerCase().trim();
            if (!['system', 'system-auto-bot', 'admin', 'superadmin', 'user'].includes(normalized)) {
                return article.authorRole.charAt(0).toUpperCase() + article.authorRole.slice(1);
            }
        }
        return "Article contributor";
    }, [authorDesignation, article.authorRole]);

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
        <div
            className={`article-wrapper relative ${isPrinting ? 'print-this' : ''}`}
            data-article-id={article.id || (article as any)._id}
        >
            <ViewTracker articleId={article.id || (article as any)._id} />
            <div>
                {/* Title */}
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight font-georgia first-letter:uppercase word-justify text-justify [text-align-last:left] [text-justify:inter-word] tracking-tight break-words">{displayTitle}</h2>

                    {/* Mobile Author & Metadata Card */}
                    {/* Mobile Author & Metadata Card */}
                    <div className="block md:hidden mb-3.5 p-2.5 sm:p-3 bg-white rounded-2xl border border-gray-100 shadow-xs">
                        {/* Top Author Row */}
                        <div className="flex items-center justify-between gap-2">
                            {(authorUsername || article.authorId) && article.authorId !== 'system-auto-bot' ? (
                                <Link
                                    href={`/profile/${authorUsername || article.authorId}`}
                                    className="flex items-center gap-2.5 group/author min-w-0 flex-1 cursor-pointer"
                                >
                                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-base sm:text-lg font-bold ring-2 ring-[#C9A227] shadow-xs shrink-0 overflow-hidden relative group-hover/author:ring-[#C9A227]/70 transition-all">
                                        {authorPhoto ? (
                                            <Image src={authorPhoto} alt={article.authors || "Author"} fill sizes="60px" className="object-cover" quality={90} />
                                        ) : (
                                            article.authors?.charAt(0).toUpperCase() || "A"
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug m-0 font-serif tracking-tight truncate group-hover/author:text-[#C9A227] transition-colors">
                                                {article.authors || "Unknown Author"}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-[#EDE8DF] text-[#7A6B5B] text-[9px] uppercase font-bold tracking-wider rounded-full shrink-0">
                                                AUTHOR
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 mt-0.5 font-medium">
                                            <svg className="w-3 h-3 text-[#C9A227] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatDate(article.createdAt)}</span>
                                            {authorSubtitle && authorSubtitle !== "Article contributor" && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-gray-600 truncate">{authorSubtitle}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-base sm:text-lg font-bold ring-2 ring-[#C9A227] shadow-xs shrink-0 overflow-hidden relative">
                                        {authorPhoto ? (
                                            <Image src={authorPhoto} alt={article.authors || "Author"} fill sizes="60px" className="object-cover" quality={90} />
                                        ) : (
                                            article.authors?.charAt(0).toUpperCase() || "A"
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug m-0 font-serif tracking-tight truncate">
                                                {article.authors || "Unknown Author"}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-[#EDE8DF] text-[#7A6B5B] text-[9px] uppercase font-bold tracking-wider rounded-full shrink-0">
                                                AUTHOR
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 mt-0.5 font-medium">
                                            <svg className="w-3 h-3 text-[#C9A227] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatDate(article.createdAt)}</span>
                                            {authorSubtitle && authorSubtitle !== "Article contributor" && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-gray-600 truncate">{authorSubtitle}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-2" />

                        {/* Bottom Metadata & Like Row - Only Like button is a rounded pill */}
                        <ArticleStats
                            articleId={article.id || (article as any)._id}
                            initialLikes={(article as any).likes || 0}
                            initialViews={(article as any).views || 0}
                            hasLikedByCurrentUser={(article as any).hasLikedByCurrentUser}
                            variant="desktop-card"
                            readTimeText={`${readTime} min read`}
                            className="print:hidden"
                        >
                            {isTranslating && (
                                <div className="flex items-center gap-1 text-[#C9A227] animate-pulse text-xs font-bold">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    <span>Translating...</span>
                                </div>
                            )}
                        </ArticleStats>
                    </div>

                    {/* Mobile Listen to Article Button (Full-width pill directly below the author card) */}
                    <div className="block md:hidden mb-4">
                        <ListenArticleButton article={article} variant="mobile" />
                    </div>

                    {/* Desktop & Tablet Author & Metadata Card (Matches uploaded design) */}
                    <div className="hidden md:block mb-6 p-4 sm:p-4.5 bg-[#FCFAF7] rounded-2xl border border-[#ECE7DE] shadow-xs">
                        {/* Top Author Row */}
                        <div className="flex items-center justify-between gap-4">
                            {(authorUsername || article.authorId) && article.authorId !== 'system-auto-bot' ? (
                                <Link href={`/profile/${authorUsername || article.authorId}`} className="flex items-center gap-3.5 group/author w-fit cursor-pointer">
                                    <div className="h-12 w-12 sm:h-13 sm:w-13 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-xl font-bold ring-2 ring-[#C9A227] shadow-sm shrink-0 overflow-hidden relative group-hover/author:ring-[#C9A227]/70 transition-all">
                                        {authorPhoto ? (
                                            <Image src={authorPhoto} alt={article.authors || "Author"} fill sizes="80px" className="object-cover" quality={90} />
                                        ) : (
                                            article.authors?.charAt(0).toUpperCase() || "A"
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl font-serif leading-none m-0 group-hover/author:text-[#C9A227] transition-colors">{article.authors || "Unknown Author"}</h3>
                                            <span className="px-2 py-0.5 bg-[#EDE8DF] text-[#7A6B5B] text-[10px] uppercase font-bold tracking-wider rounded-full">AUTHOR</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-500 font-normal m-0 leading-snug">
                                            {authorSubtitle}
                                        </p>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3.5">
                                    <div className="h-12 w-12 sm:h-13 sm:w-13 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-xl font-bold ring-2 ring-[#C9A227] shadow-sm shrink-0 overflow-hidden relative">
                                        {authorPhoto ? (
                                            <Image src={authorPhoto} alt={article.authors || "Author"} fill sizes="80px" className="object-cover" quality={90} />
                                        ) : (
                                            article.authors?.charAt(0).toUpperCase() || "A"
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl font-serif leading-none m-0">{article.authors || "Unknown Author"}</h3>
                                            <span className="px-2 py-0.5 bg-[#EDE8DF] text-[#7A6B5B] text-[10px] uppercase font-bold tracking-wider rounded-full">AUTHOR</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-500 font-normal m-0 leading-snug">
                                            {authorSubtitle}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Listen to Article button on the right side of Author Card */}
                            <div className="shrink-0">
                                <ListenArticleButton article={article} />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#ECE7DE] my-3" />

                        {/* Bottom Metadata & Like Row */}
                        <ArticleStats
                            articleId={article.id || (article as any)._id}
                            initialLikes={(article as any).likes || 0}
                            initialViews={(article as any).views || 0}
                            hasLikedByCurrentUser={(article as any).hasLikedByCurrentUser}
                            variant="desktop-card"
                            dateText={formatDate(article.createdAt)}
                            readTimeText={`${readTime} min read`}
                            className="print:hidden"
                        >
                            {isTranslating && (
                                <div className="flex items-center gap-1.5 text-[#C9A227] animate-pulse">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    <span className="text-xs font-bold">Translating...</span>
                                </div>
                            )}
                        </ArticleStats>
                    </div>
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

                {/* Desktop & Tablet Unified Tags, AI Summary & Share Card */}
                <div className="hidden sm:block mb-8 bg-[#FAF7F2] rounded-2xl border border-[#ECE7DE] p-4 sm:p-5 shadow-xs print:hidden">
                    {/* Top Row: Tags + AI Summary */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                            {article.tags && article.tags.length > 0 && (
                                <>
                                    <span className="font-serif text-[#1C2A39] font-medium text-sm mr-1 shrink-0">Tags:</span>
                                    {[...article.tags].sort((a, b) => a.name.length - b.name.length).map((tag) => (
                                        <Link
                                            key={tag.id}
                                            href={`/tags/${tag.slug}`}
                                            className="px-3.5 py-1 bg-[#EDE8DF]/75 hover:bg-[#E2DACD] text-[#3E342B] text-xs rounded-full transition-colors truncate max-w-[200px] cursor-pointer"
                                        >
                                            {tag.name}
                                        </Link>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* AI Summary Button */}
                        <div ref={desktopSummaryRef} className="relative shrink-0">
                            <button
                                type="button"
                                onClick={handleSummaryClick}
                                className="px-4 py-2 bg-[#0B2242] hover:bg-[#13325B] text-white text-xs font-semibold rounded-full flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                                <span>AI Summary</span>
                                <ChevronRight
                                    size={14}
                                    className={`text-white/80 transition-transform duration-200 ${showSummary ? "rotate-90" : ""}`}
                                />
                            </button>
                            {showSummary && (
                                <div className="absolute right-0 top-11 w-[85vw] sm:w-[450px] max-w-[450px] bg-[#C9A227] p-4 rounded-xl shadow-2xl border border-gray-200 z-30 text-justify">
                                    {/* Caret arrow pointing up to AI Summary button */}
                                    <div className="absolute -top-2 right-[54px] w-4 h-4 bg-[#C9A227] border-t border-l border-gray-200 transform rotate-45 z-10 pointer-events-none" />
                                    <div className="flex justify-between items-start mb-3 border-b border-black/10 pb-2">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            AI Summary
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowSummary(false)}
                                            className="p-1 hover:bg-black/10 rounded-full transition-colors text-gray-900 cursor-pointer"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="text-sm text-black leading-relaxed max-h-[300px] overflow-y-auto font-georgia pr-3">
                                        {isFetchingSummary ? (
                                            <div className="flex justify-center py-6"><Loader size="sm" text="Thinking..." /></div>
                                        ) : summary ? (
                                            <TypewriterText text={summary} speed={30} />
                                        ) : (
                                            "No summary available."
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hairline Divider */}
                    <div className="border-t border-[#ECE7DE] my-3.5" />

                    {/* Bottom Row: Share article + icons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => handleShare("copy")}
                            title="Click to copy article link"
                            className="flex items-center gap-2 text-[#1C2A39] hover:text-[#0B2242] shrink-0 mr-1 cursor-pointer transition-colors"
                        >
                            <Share2 size={16} className="text-[#A58237]" />
                            <span className="font-serif text-sm font-medium">Share article</span>
                        </button>

                        <div className="w-px h-4 bg-[#DCD4C7] mx-1.5 shrink-0" />

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => handleShare("facebook")}
                                aria-label="Share on Facebook"
                                className="w-8.5 h-8.5 rounded-full bg-[#EDE8DF]/75 hover:bg-[#1877F2] text-[#2C3E50] hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                            >
                                <Facebook size={15} />
                            </button>
                            <button
                                onClick={() => handleShare("twitter")}
                                aria-label="Share on X"
                                className="w-8.5 h-8.5 rounded-full bg-[#EDE8DF]/75 hover:bg-black text-[#2C3E50] hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                            >
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleShare("whatsapp")}
                                aria-label="Share on WhatsApp"
                                className="w-8.5 h-8.5 rounded-full bg-[#EDE8DF]/75 hover:bg-[#25D366] text-[#2C3E50] hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                            >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleShare("linkedin")}
                                aria-label="Share on LinkedIn"
                                className="w-8.5 h-8.5 rounded-full bg-[#EDE8DF]/75 hover:bg-[#0A66C2] text-[#2C3E50] hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                            >
                                <Linkedin size={15} />
                            </button>
                            <button
                                onClick={() => handleShare("telegram")}
                                aria-label="Share on Telegram"
                                className="w-8.5 h-8.5 rounded-full bg-[#EDE8DF]/75 hover:bg-[#0088CC] text-[#2C3E50] hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                            >
                                <FaTelegramPlane size={15} />
                            </button>
                            <button
                                onClick={() => handleShare("email")}
                                aria-label="Share via Email"
                                className="w-8.5 h-8.5 rounded-full bg-[#EDE8DF]/75 hover:bg-[#EA4335] text-[#2C3E50] hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                            >
                                <Mail size={15} />
                            </button>
                            <button
                                onClick={() => handleShare("copy")}
                                aria-label="Copy Link"
                                className={`w-8.5 h-8.5 rounded-full ${copied ? "bg-green-600 text-white" : "bg-[#EDE8DF]/75 hover:bg-[#0A2342] text-[#2C3E50] hover:text-white"} flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer`}
                            >
                                {copied ? <Check size={15} className="text-white" /> : <Link2 size={15} />}
                            </button>
                            <button
                                onClick={() => handleShare("print")}
                                aria-label="Print Article"
                                className="w-8.5 h-8.5 rounded-full bg-[#EDE8DF]/75 hover:bg-[#0A2342] text-[#2C3E50] hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                            >
                                <Printer size={15} />
                            </button>
                            {mounted && user && (
                                <SavePostButton
                                    postId={article.id || (article as any)._id}
                                    className="w-8.5 h-8.5 !p-0 rounded-full !bg-[#EDE8DF]/75 hover:!bg-[#0A2342] !text-[#2C3E50] hover:!text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs shrink-0 cursor-pointer"
                                    iconSize={15}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Mode: Tags, AI Summary & Share Bar */}
                <div className="block sm:hidden mb-8 print:hidden">
                    {/* Tags + AI Summary on Mobile */}
                    <div className="flex flex-col gap-3 mb-4">
                        {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-serif text-[#1C2A39] font-medium text-xs mr-1 shrink-0">Tags:</span>
                                {[...article.tags].sort((a, b) => a.name.length - b.name.length).map((tag) => (
                                    <Link
                                        key={tag.id}
                                        href={`/tags/${tag.slug}`}
                                        className="px-2.5 py-1 bg-[#EDE8DF]/75 text-[#3E342B] text-xs rounded-full cursor-pointer"
                                    >
                                        {tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div ref={mobileSummaryRef} className="relative w-full">
                            <button
                                type="button"
                                onClick={handleSummaryClick}
                                className="w-full py-2 px-4 bg-[#0B2242] text-white text-xs font-semibold rounded-full flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                            >
                                <span>AI Summary</span>
                                <ChevronRight
                                    size={14}
                                    className={`text-white/80 transition-transform duration-200 ${showSummary ? "rotate-90" : ""}`}
                                />
                            </button>
                            {showSummary && (
                                <div className="absolute left-0 right-0 top-11 w-full bg-[#C9A227] p-4 rounded-xl shadow-2xl border border-gray-200 z-30 text-justify">
                                    {/* Caret arrow pointing up to AI Summary button */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#C9A227] border-t border-l border-gray-200 transform rotate-45 z-10 pointer-events-none" />
                                    <div className="flex justify-between items-start mb-3 border-b border-black/10 pb-2">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            AI Summary
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowSummary(false)}
                                            className="p-1 hover:bg-black/10 rounded-full transition-colors text-gray-900 cursor-pointer"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="text-xs text-black leading-relaxed max-h-[250px] overflow-y-auto font-georgia pr-2">
                                        {isFetchingSummary ? (
                                            <div className="flex justify-center py-4"><Loader size="sm" text="Thinking..." /></div>
                                        ) : summary ? (
                                            <TypewriterText text={summary} speed={30} />
                                        ) : (
                                            "No summary available."
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Share Bar: Share (opens bottom sheet) + Print */}
                    <div className="flex items-center justify-between w-full py-2 px-2 bg-white rounded-xl border border-gray-200 shadow-xs">
                        {mounted && user && (
                            <>
                                <SavePostButton
                                    postId={article.id || (article as any)._id}
                                    showText={true}
                                    text="Save"
                                    className="!bg-transparent hover:!bg-gray-50 border-none !text-gray-700 px-2 py-1 flex-1 justify-center text-xs cursor-pointer"
                                    iconSize={16}
                                />
                                <div className="w-px h-5 bg-gray-200" />
                            </>
                        )}

                        <button
                            onClick={() => setShowShareSheet(true)}
                            className="flex flex-1 items-center justify-center gap-2 text-blue-600 font-medium px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors text-xs cursor-pointer"
                        >
                            <Share2 size={16} className="text-blue-600" />
                            <span className="text-sm">Share</span>
                        </button>

                        <div className="w-px h-5 bg-gray-200" />

                        <button
                            onClick={() => handleShare("print")}
                            className="flex flex-1 items-center justify-center gap-2 text-gray-700 font-medium px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors text-xs cursor-pointer"
                        >
                            <Printer size={16} />
                            <span className="text-sm">Print</span>
                        </button>
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
                                <button onClick={() => handleShare("whatsapp")} className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg></div>
                                    <span className="text-xs text-gray-600 font-medium">WhatsApp</span>
                                </button>
                                <button onClick={() => handleShare("telegram")} className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-[#0088cc] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><FaTelegramPlane size={26} /></div>
                                    <span className="text-xs text-gray-600 font-medium">Telegram</span>
                                </button>
                                <button onClick={() => handleShare("twitter")} className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></div>
                                    <span className="text-xs text-gray-600 font-medium">X (Twitter)</span>
                                </button>
                                <button onClick={() => handleShare("linkedin")} className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-[#0077b5] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><Linkedin size={24} fill="currentColor" className="text-white" /></div>
                                    <span className="text-xs text-gray-600 font-medium">LinkedIn</span>
                                </button>
                                <button onClick={() => handleShare("facebook")} className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-[#1877F2] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><Facebook size={26} fill="currentColor" className="text-white" /></div>
                                    <span className="text-xs text-gray-600 font-medium">Facebook</span>
                                </button>
                                <button onClick={() => handleShare("email")} className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full bg-[#EA4335] text-white flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg></div>
                                    <span className="text-xs text-gray-600 font-medium">Email</span>
                                </button>
                                <button onClick={() => handleShare("copy")} className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className={`w-14 h-14 rounded-full ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'} flex items-center justify-center group-hover:-translate-y-1 group-hover:shadow-lg transition-all`}>
                                        {copied ? <Check size={24} /> : <Link2 size={24} />}
                                    </div>
                                    <span className="text-xs text-gray-600 font-medium">Copy Link</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Article Content */}
                <div className="article-content relative">
                    <style>{`
                        /* Remove default quill editor padding to match original layout */
                        .article-content img {
                            max-width: 100% !important;
                            height: auto !important;
                        }
                        .article-content iframe, .article-content video {
                            max-width: 100% !important;
                            aspect-ratio: 16 / 9;
                            height: auto !important;
                        }
                        .article-content .ql-align-center { text-align: center !important; }
                        .article-content .ql-align-right { text-align: right !important; }
                        .article-content .ql-align-justify { text-align: justify !important; text-justify: inter-word !important; text-align-last: left !important; }
                        .article-content .ql-editor { padding: 0 !important; font-family: inherit !important; font-size: inherit !important; line-height: inherit !important; overflow-y: visible !important; }
                        
                        /* Fix massive list gaps caused by absolute positioning in globals.css */
                        .article-content ol, .article-content ul { padding-left: 3em !important; }
                        .article-content li::before {
                            display: inline-block !important;
                            white-space: nowrap !important;
                            width: 1.6em !important;
                            text-align: right !important;
                            margin-left: calc(var(--list-gap, 3em) * -1) !important;
                            margin-right: calc(var(--list-gap, 3em) - 1.6em) !important;
                            position: static !important;
                        }

                        .article-content > :first-child::first-letter { text-transform: uppercase; }
                        @media (max-width: 640px) {
                            .article-content h1 { font-size: 1.75rem !important; line-height: 1.3 !important; margin-bottom: 0.75rem !important; }
                            .article-content h2 { font-size: 1.5rem !important; line-height: 1.3 !important; margin-bottom: 0.75rem !important; }
                            .article-content h3 { font-size: 1.25rem !important; line-height: 1.4 !important; margin-bottom: 0.5rem !important; }
                            .article-content h4, .article-content h5, .article-content h6 { font-size: 1.125rem !important; line-height: 1.4 !important; margin-bottom: 0.5rem !important; }
                            .article-content p, .article-content li, .article-content span { font-size: 1rem !important; line-height: 1.6 !important; }
                        }
                    `}</style>
                    <div
                        className="article-content"
                        suppressHydrationWarning
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(displayContent) }}
                    />

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
                                            <div
                                                className="text-gray-700 text-[16px] leading-relaxed prose max-w-none mt-1 font-georgia"
                                                suppressHydrationWarning
                                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(update.content) }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Related Documents */}
                {hasFullAccess && article.documents && article.documents.length > 0 && (
                    <div className="my-6 p-3.5 sm:p-4 bg-[#FAF7F2] rounded-xl sm:rounded-2xl border border-[#ECE7DE]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm sm:text-base font-bold font-serif text-[#0B2242] flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-[#C9A227] shrink-0" />
                                Related Documents
                            </h3>
                            <span className="text-[11px] font-medium text-[#6E7C87] bg-white border border-[#ECE7DE] px-2 py-0.5 rounded-full shrink-0">
                                {article.documents.length} {article.documents.length === 1 ? "file" : "files"}
                            </span>
                        </div>
                        <div className={`grid gap-2.5 sm:gap-3 ${article.documents.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                            {article.documents.map((doc) => {
                                const isImage = doc.fileType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(doc.fileUrl || doc.fileName || "");
                                const docType = getDocTypeInfo(doc.fileType, doc.fileName);
                                const formattedSize = formatDocFileSize(doc.fileSize);

                                return (
                                    <a
                                        key={doc.id}
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-3 p-2.5 sm:p-3 bg-white border border-[#E8E2D8] hover:border-[#C9A227] rounded-xl hover:shadow-xs transition-all duration-200 cursor-pointer overflow-hidden"
                                    >
                                        {isImage ? (
                                            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-[#ECE7DE] bg-[#FAF7F2]">
                                                <Image
                                                    src={getSafeImageUrl(doc.fileUrl)}
                                                    alt={doc.fileName || "Document"}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${docType.iconBgClass}`}>
                                                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${docType.iconColorClass} transition-transform group-hover:scale-105`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-semibold text-[#0B2242] truncate group-hover:text-[#A58237] transition-colors leading-snug" title={doc.fileName}>
                                                {doc.fileName}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6E7C87] font-medium leading-none">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${docType.badgeClass}`}>
                                                    {docType.ext}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-[#D1C9BE] shrink-0" />
                                                <span className="shrink-0">{formattedSize}</span>
                                            </div>
                                        </div>
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F2] border border-[#ECE7DE] flex items-center justify-center text-[#6E7C87] group-hover:bg-[#0B2242] group-hover:border-[#0B2242] group-hover:text-white transition-all transform group-hover:scale-105 shrink-0 ml-1">
                                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-y-0.5" />
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
    const sidebarContainerRef = useRef<HTMLElement | null>(null);
    const sidebarScrollRef = useRef<HTMLElement | null>(null);
    const isHoveringSidebar = useRef(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

    const renderSidebarContent = (showHideButton = false) => (
        <>
            {/* Header above Related Articles with clean Hide Button */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-[#C9A227] rounded-full inline-block"></span>
                    <h3 className="text-lg font-bold text-gray-900 font-georgia tracking-tight">
                        {t("relatedArticles")}
                    </h3>
                </div>
                {showHideButton && (
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A2342] text-white hover:bg-[#C9A227] hover:text-black rounded-full text-xs font-semibold shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
                        title="Hide Related Articles"
                    >
                        <span className="text-[11px] font-sans text-white group-hover:text-black transition-colors duration-200">Hide</span>
                        <svg className="w-3.5 h-3.5 text-white group-hover:text-black transition-all duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Sidebar Top Ad */}
            {!isPremium && (
                <div className="mb-6">
                    <ArticleSidebarTopAd />
                </div>
            )}
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
                <div className="mt-6">
                    <ArticleSidebarBottomAd />
                </div>
            )}
        </>
    );

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

                {/* ── Floating Toggle Sidebar Button (Closed State) ── */}
                <AnimatePresence>
                    {!isSidebarOpen && (
                        <motion.button
                            key="floating-sidebar-toggle"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => setIsSidebarOpen(true)}
                            className="hidden lg:flex fixed right-0 top-[40vh] bg-[#0A2342] border border-[#0A2342] text-white hover:bg-[#C9A227] hover:border-[#C9A227] hover:text-black rounded-l-xl p-3 pl-4 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.2)] z-50 cursor-pointer group"
                            title="Show Related Articles"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <svg className="w-5 h-5 text-white group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-white group-hover:text-black transition-colors duration-200 whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                    {t("relatedArticles")}
                                </span>
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>

                <div className="flex flex-col lg:flex-row items-start relative">

                    {/* ── Main content column ── */}
                    <div className="w-full flex-1 min-w-0">
                        <div className="max-w-5xl mx-auto">
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

                            {/* ── Mobile Related Articles (visible only on mobile below the article) ── */}
                            <div className="block lg:hidden w-full relative z-20 print:hidden mt-12 pt-8 border-t border-gray-200">
                                {renderSidebarContent(false)}
                            </div>
                        </div>
                    </div>

                    {/* ── Desktop Sidebar (sticky, animated open/close from right) ── */}
                    <AnimatePresence initial={false}>
                        {isSidebarOpen && (
                            <motion.aside
                                key="desktop-related-sidebar"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 340, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{
                                    width: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                                    opacity: { duration: 0.25, ease: "easeInOut" }
                                }}
                                className="hidden lg:block shrink-0 sticky top-[132px] max-h-[calc(100vh-145px)] overflow-y-auto overflow-x-hidden pr-2 scrollbar-hide pb-10 z-20 print:hidden"
                                ref={(el) => {
                                    sidebarContainerRef.current = el;
                                    sidebarScrollRef.current = el;
                                }}
                                onMouseEnter={() => { isHoveringSidebar.current = true; }}
                                onMouseLeave={() => { isHoveringSidebar.current = false; }}
                            >
                                <div className="w-[340px] pl-6">
                                    {renderSidebarContent(true)}
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            {/* Global Singleton Neural Speech Player Controller */}
            <SpeechPlayer initialArticle={initialArticle} />
        </div>
    );
}
