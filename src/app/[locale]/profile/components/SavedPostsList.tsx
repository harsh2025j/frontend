"use client";

import { useEffect, useState } from "react";
import { Bookmark, Loader2, Calendar, Scale, FileText, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useAppDispatch } from "@/data/redux/hooks";
import { toggleSavePost } from "@/data/features/profile/profileThunks";
import { articleApi } from "@/data/services/article-service/article-service";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import Image from "next/image";

export default function SavedPostsList() {
    const { user, loading } = useProfileActions();
    const dispatch = useAppDispatch();
    const [hydratedItems, setHydratedItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [unresolvableCount, setUnresolvableCount] = useState(0);
    const [missingIds, setMissingIds] = useState<string[]>([]);

    const savedPosts = user?.savedPosts || [];
    const savedPostsStr = savedPosts.join(',');

    useEffect(() => {
        if (savedPosts.length === 0) {
            setHydratedItems([]);
            return;
        }

        const fetchItems = async () => {
            setIsLoadingItems(true);
            try {
                const [articlesRes, judgmentsRes] = await Promise.all([
                    articleApi.fetchMultipleArticles(savedPosts).catch(() => ({ data: { data: [] } })),
                    judgmentsService.fetchMultipleJudgments(savedPosts).catch(() => ({ data: [] }))
                ]);

                const articles = Array.isArray(articlesRes?.data) ? articlesRes.data : articlesRes?.data?.data || [];
                const judgments = Array.isArray(judgmentsRes?.data) ? judgmentsRes.data : judgmentsRes?.data?.data || [];

                const combined = [
                    ...articles.map((a: any) => ({
                        id: a.id,
                        type: 'Article',
                        title: a.title,
                        description: a.subHeadline || a.seoDescription || (a.content ? a.content.substring(0, 120).replace(/<[^>]*>?/gm, '') + '...' : ''),
                        image: a.thumbnail,
                        link: `/news/${a.slug || a.id}`,
                        date: a.createdAt,
                        category: a.category?.name || 'News'
                    })),
                    ...judgments.map((j: any) => ({
                        id: j.id,
                        type: 'Judgment',
                        title: j.title || j.case?.title || `Judgment for ${j.case?.caseNumber || 'Unknown Case'}`,
                        description: j.summary || (j.fullText ? j.fullText.substring(0, 120).replace(/<[^>]*>?/gm, '') + '...' : 'No summary available.'),
                        image: null,
                        link: `/judgments/${j.id}`,
                        date: j.judgmentDate || j.createdAt,
                        category: j.judgmentType || 'Judgment'
                    }))
                ];

                const ordered: any[] = [];
                const missing: string[] = [];

                savedPosts.forEach(id => {
                    const match = combined.find(item => item.id === id);
                    if (match) {
                        ordered.push(match);
                    } else {
                        missing.push(id);
                    }
                });

                setHydratedItems(ordered);
                setUnresolvableCount(missing.length);
                setMissingIds(missing);
            } catch (error) {
                console.error("Failed to fetch saved items:", error);
            } finally {
                setIsLoadingItems(false);
            }
        };

        fetchItems();
    }, [savedPostsStr]);

    const handleRemoveSave = async (e: React.MouseEvent, postId: string) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await dispatch(toggleSavePost(postId)).unwrap();
        } catch (error) {
            console.error("Failed to remove saved post", error);
        }
    };

    const handleClearMissing = async () => {
        setIsLoadingItems(true);
        try {
            for (const id of missingIds) {
                await dispatch(toggleSavePost(id)).unwrap();
            }
            setMissingIds([]);
            setUnresolvableCount(0);
        } catch (error) {
            console.error("Failed to clear missing posts", error);
        } finally {
            setIsLoadingItems(false);
        }
    };

    if (loading || isLoadingItems) {
        return (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                <Loader2 size={40} className="animate-spin text-[#0A2342] mb-4" />
                <p className="text-sm font-medium text-gray-400">Curating your collection...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">Please login to view your saved content.</p>
            </div>
        );
    }

    if (savedPosts.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl animate-in fade-in duration-500">
                <Bookmark size={48} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-[#0A2342] mb-2">No Curated Items Yet</h3>
                <p className="text-gray-400 max-w-xs mx-auto mb-8 text-sm">Start saving important cases and editorial insights to build your professional library.</p>
                <Link href="/" className="inline-flex items-center gap-2 text-[#C9A227] font-bold text-xs tracking-widest uppercase hover:underline">
                    Explore Content <ArrowRight size={14} />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {unresolvableCount > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">!</div>
                        <p className="text-xs text-gray-500">
                            <span className="font-bold text-gray-700">{unresolvableCount} item(s)</span> in your collection are no longer available.
                        </p>
                    </div>
                    <button onClick={handleClearMissing} className="text-[10px] font-bold tracking-widest uppercase text-[#C9A227] hover:underline">
                        Clean Collection
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hydratedItems.map((item) => (
                    <Link key={item.id} href={item.link} className="group relative block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#0A2342]/5 transition-all duration-500">
                        <div className="flex h-full">
                            {/* Visual Indicator/Image */}
                            <div className="w-1/3 bg-gray-50 relative overflow-hidden flex items-center justify-center border-r border-gray-50">
                                {item.image && item.image !== 'undefined' ? (
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-gray-300">
                                        {item.type === 'Judgment' ? <Scale size={24} /> : <FileText size={24} />}
                                        <span className="text-[8px] font-bold uppercase tracking-tighter">{item.type}</span>
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-[#0A2342] border border-gray-100">
                                    {item.category.toUpperCase()}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="w-2/3 p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        <Calendar size={10} />
                                        {item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                                    </div>
                                    <h4 className="text-sm font-bold text-[#0A2342] line-clamp-2 leading-snug group-hover:text-[#C9A227] transition-colors mb-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={(e) => handleRemoveSave(e, item.id)}
                                        className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 hover:text-red-400 hover:border-red-100 hover:bg-red-50 transition-all"
                                        title="Remove from curated list"
                                    >
                                        <Bookmark size={14} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
