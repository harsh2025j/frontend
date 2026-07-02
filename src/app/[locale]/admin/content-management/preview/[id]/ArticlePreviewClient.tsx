"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Advocate, Article } from "@/data/features/article/article.types";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { X } from "lucide-react";
import Loader from "@/components/ui/Loader";
import apiClient from "@/data/services/apiConfig/apiClient";
import { useTranslations, useLocale } from "next-intl";
import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import TypewriterText from "@/components/ui/TypewriterText";
import { formatDate } from "@/utils/dateUtils";
import { getSafeImageUrl } from "@/utils/imageUtils";
import { profileApi } from "@/data/services/profile-service/profile-service";
import { useSelector } from "react-redux";
import { RootState } from "@/data/redux/store";
import PaywallOverlay from "@/components/ui/PaywallOverlay";
import { articleApi } from "@/data/services/article-service/article-service";
import ArticleStats from "@/components/article/ArticleStats";
import CommentSection from "@/components/article/CommentSection";

interface ArticlePreviewClientProps {
    article: Article;
}

function ArticleBodyPreview({ article, locale, t }: { article: Article; locale: string; t: ReturnType<typeof useTranslations> }) {
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState<string | null>(article.aiSummary || null);
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [translatedData, setTranslatedData] = useState<{ title: string; content: string } | null>(null);
    const [authorPhoto, setAuthorPhoto] = useState<string | null>(null);
    const [authorUsername, setAuthorUsername] = useState<string | null>(null);
    const [advocatePhotos, setAdvocatePhotos] = useState<Record<string, string>>({});
    const [advocateUsernames, setAdvocateUsernames] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchPhotos = async () => {
            if (article.authorId && article.authorId !== 'anonymous' && article.authorId !== 'system-auto-bot') {
                try {
                    const res = await profileApi.fetchPublicProfile(article.authorId);
                    if (res.data.success) {
                        if (res.data.data.profilePicture) setAuthorPhoto(res.data.data.profilePicture);
                        if (res.data.data.username) setAuthorUsername(res.data.data.username);
                    }
                } catch (err) { }
            }

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
                        } catch (err) { }
                    }
                }));
                setAdvocatePhotos(photos);
                setAdvocateUsernames(usernames);
            }
        };

        fetchPhotos();
    }, [article.authorId, article.advocates]);

    const [isTranslating, setIsTranslating] = useState(false);

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

    const isPremium = useMemo(() => {
        if (!user) return false;
        if (subscription?.status === 'active') return true;
        const roles = user.roles || [];
        return roles.some((r: any) => {
            const name = typeof r === 'string' ? r : r.name;
            return ['admin', 'superadmin', 'editor'].includes(name.toLowerCase());
        });
    }, [user, subscription]);

    const hasFullAccess = !article.isPaywalled || isPremium;
    const readTime = Math.ceil(article.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200);
    const displayTitle = translatedData?.title || article.title;
    const displayContent = translatedData?.content || article.content;

    return (
        <div className="article-wrapper">
            <div>
                {/* Title */}
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight font-georgia">{displayTitle}</h2>

                    {/* Author metadata */}
                    {(authorUsername || article.authorId) && article.authorId !== 'system-auto-bot' ? (
                        <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 group/author cursor-default pointer-events-none">
                            <div className="h-14 w-14 rounded-full bg-[#0A2342] text-[#C9A227] flex items-center justify-center text-2xl font-bold ring-2 ring-[#C9A227]/80 shadow-sm shrink-0 overflow-hidden relative">
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
                                    <div className="pointer-events-none">
                                        <ArticleStats
                                            articleId={article.id || (article as any)._id}
                                            initialLikes={(article as any).likes || 0}
                                            initialViews={(article as any).views || 0}
                                            hasLikedByCurrentUser={(article as any).hasLikedByCurrentUser}
                                            className="print:hidden"
                                        />
                                    </div>
                                    {isTranslating && (
                                        <div className="flex items-center gap-1.5 text-[#C9A227] animate-pulse">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                            <span className="text-xs font-bold">Translating...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
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
                                    <div className="pointer-events-none">
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
                            priority={true}
                            sizes="(max-width: 1024px) 100vw, 900px"
                            quality={100}
                            className="object-cover"
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
                                    <span key={tag.id} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full cursor-default">
                                        {tag.name}
                                    </span>
                                ))}
                            </>
                        )}
                    </div>
                    <div className="w-full md:w-auto relative flex justify-start md:justify-end">
                        <button type="button" onClick={handleSummaryClick} className="w-full md:w-auto justify-center px-6 py-2 bg-blue-600 text-white text-base font-medium rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                            AI Summary
                        </button>
                        {showSummary && (
                            <div className="absolute right-0 top-12 sm:right-full sm:top-0 sm:mr-3 w-[85vw] sm:w-[450px] max-w-[450px] bg-[#C9A227] p-4 rounded-xl shadow-2xl border border-gray-200 z-10 text-justify">
                                <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-2">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"> AI Summary</h3>
                                    <button type="button" onClick={() => setShowSummary(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-900 hover:text-red-500"><X size={18} /></button>
                                </div>
                                <div className="text-md text-black leading-relaxed max-h-[300px] overflow-y-auto font-georgia pr-4">
                                    {isFetchingSummary ? <div className="flex justify-center py-6"><Loader size="sm" text="Thinking..." /></div>
                                        : summary ? <TypewriterText text={summary} speed={30} /> : "No summary available."}
                                </div>
                                <div className="hidden sm:block absolute top-4 -right-2 w-4 h-4 bg-[#C9A227] border-t border-r border-gray-200 transform rotate-45" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Article Content */}
                <div className="article-content relative mt-6">
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
                    {!hasFullAccess && <PaywallOverlay isLoggedIn={!!user} t={t} />}
                </div>

                {/* Related Documents */}
                {hasFullAccess && article.documents && article.documents.length > 0 && (
                    <div className="mb-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            Related Documents
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {article.documents.map((doc) => {
                                const isImage = doc.fileType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(doc.fileUrl);
                                return (
                                    <div key={doc.id} className="group flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#C9A227] hover:shadow-md transition-all duration-300 cursor-pointer">
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
                                                <span className="font-semibold text-[#C9A227]">{doc.fileType?.split("/")[1]?.toUpperCase() || "FILE"}</span>
                                                <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
                                                <span>{doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) : "0.00"} MB</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Developing Story Timeline */}
                {hasFullAccess && article.updates && article.updates.length > 0 && (
                    <div className="mb-16 mt-12 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
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

                {/* Advocate info */}
                {((article.advocates && article.advocates.length > 0) || article.advocateName) && (
                    <div className="space-y-4 mb-8">
                        {(article.advocates && article.advocates.length > 0 ? article.advocates : ([{ name: article.advocateName }] as Advocate[])).map((adv, idx) => {
                            if (!adv?.name && !article.advocateName) return null;
                            return (
                                <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 cursor-default">
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

                {/* Comments Section */}
                {article.isCommentsEnabled !== false && (
                    <div className="mt-2 print:hidden preview-comments-wrapper">
                        <style>{`
                            /* Disable typing and submitting */
                            .preview-comments-wrapper textarea,
                            .preview-comments-wrapper button[type="submit"] {
                                pointer-events: none !important;
                                opacity: 0.5 !important;
                                cursor: not-allowed !important;
                            }
                            /* Hide action buttons (Reply, Edit, Delete) */
                            .preview-comments-wrapper button[class*="hover:text-blue-600"],
                            .preview-comments-wrapper button[class*="hover:text-yellow-600"],
                            .preview-comments-wrapper button[class*="hover:text-red-600"] {
                                display: none !important;
                            }
                        `}</style>
                        <CommentSection articleId={article.id || (article as any)._id} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ArticlePreviewClient({ article }: ArticlePreviewClientProps) {
    const t = useTranslations("ArticleDetail");
    const locale = useLocale();

    return (
        <div className="bg-white min-h-screen font-georgia border-t border-gray-100">
            <div className="max-w-5xl mx-auto py-8 px-4">
                <ArticleBodyPreview article={article} locale={locale} t={t} />
            </div>
        </div>
    );
}
