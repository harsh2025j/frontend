"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { Bookmark, Search, ArrowRight, Loader2, Calendar, Scale, FileText, Loader as LoaderIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useAppDispatch } from "@/data/redux/hooks";
import { toggleSavePost } from "@/data/features/profile/profileThunks";
import { articleApi } from "@/data/services/article-service/article-service";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import Image from "next/image";

import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import Loader from "@/components/ui/Loader";

const LIMIT = 10;

export function SavedPostsPageContent() {
    const { user, loading: profileLoading } = useProfileActions();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    // --- Derived from URL ---
    const currentPage = parseInt(searchParams.get("page") || "1");

    const [hydratedItems, setHydratedItems] = useState<any[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [unresolvableCount, setUnresolvableCount] = useState(0);
    const [missingIds, setMissingIds] = useState<string[]>([]);

    const savedPosts = user?.savedPosts || [];
    const totalItems = savedPosts.length;
    const totalPages = Math.ceil(totalItems / LIMIT);

    const updateUrl = (updates: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });
        router.push(`/admin/saved-posts?${params.toString()}`);
    };

    const fetchItems = useCallback(async () => {
        if (savedPosts.length === 0) {
            setHydratedItems([]);
            return;
        }

        const startIndex = (currentPage - 1) * LIMIT;
        const pageIds = savedPosts.slice(startIndex, startIndex + LIMIT);

        setIsLoadingItems(true);
        try {
            const [articlesRes, judgmentsRes] = await Promise.all([
                articleApi.fetchMultipleArticles(pageIds).catch(() => ({ data: { data: [] } })),
                judgmentsService.fetchMultipleJudgments(pageIds).catch(() => ({ data: [] }))
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

            pageIds.forEach(id => {
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
    }, [currentPage, savedPosts]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleRemoveSave = async (e: React.MouseEvent, postId: string) => {
        e.preventDefault(); // Prevent navigating to the article link
        e.stopPropagation();

        try {
            await dispatch(toggleSavePost(postId)).unwrap();
        } catch (error) {
            console.error("Failed to remove saved post", error);
        }
    };

    const handleClearMissing = async () => {
        setIsLoadingItems(true); // show loader during purge
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

    if (profileLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold bg-gray-50 p-6 rounded-lg text-gray-700">Please login to view your saved posts.</h1>
            </div>
        );
    }


    return (
        <div className="max-w-4xl mx-auto px-4 text-center animate-fadeIn">
            {/* <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <Bookmark size={48} strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Saved Posts</h1> */}

            {savedPosts.length === 0 ? (
                <>
                    <p className="text-gray-500 text-lg max-w-md mx-auto mb-10">
                        You haven't bookmarked any articles yet. Save important cases and legal news to view them here later.
                    </p>

                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm inline-block">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Search size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Find something interesting?</h2>
                            <p className="text-sm text-gray-500 mb-6">Explore our library of legal articles and insights.</p>

                            <Link
                                href="/"
                                className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all flex items-center gap-2 group shadow-lg shadow-blue-100"
                            >
                                Browse Latest News
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-left mt-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Bookmark size={20} className="text-blue-600" />
                                {savedPosts.length} saved item(s)
                            </h2>
                        </div>

                        {unresolvableCount > 0 && !isLoadingItems && (
                            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="shrink-0 mt-0.5 text-orange-500" size={18} />
                                    <div>
                                        <p className="font-semibold">Some items are hidden.</p>
                                        <p>{unresolvableCount} of your saved item(s) are no longer available (they may have been deleted or unpublished).</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClearMissing}
                                    className="px-4 py-2 bg-white border border-orange-200 text-orange-700 font-semibold rounded shadow-sm hover:bg-orange-100 transition shrink-0"
                                >
                                    Clear Unavailable
                                </button>
                            </div>
                        )}

                        {isLoadingItems ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 size={32} className="animate-spin text-blue-500" />
                                <span className="ml-3 text-gray-500">Loading your saved content...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {hydratedItems.map((item) => (
                                    <Link key={item.id} href={item.link} className="block group">
                                        <div className="flex flex-col sm:flex-row bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">

                                            {/* Thumbnail Section */}
                                            <div className="sm:w-1/4 h-48 sm:h-auto bg-gray-50 relative shrink-0">
                                                {item.image && item.image !== 'undefined' ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                        {item.type === 'Judgment' ? <Scale size={40} strokeWidth={1} /> : <FileText size={40} strokeWidth={1} />}
                                                    </div>
                                                )}

                                                {/* Badge */}
                                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold rounded shadow-sm text-gray-800">
                                                    {item.type}
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-5 flex flex-col justify-center flex-grow">
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 font-medium">
                                                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.category}</span>
                                                    {item.date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={13} />
                                                            {new Date(item.date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {item.title}
                                                </h3>

                                                <div className="flex justify-between items-end gap-4 mt-auto">
                                                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed flex-grow">
                                                        {item.description || "No description provided."}
                                                    </p>
                                                    <button
                                                        onClick={(e) => handleRemoveSave(e, item.id)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors shrink-0"
                                                        title="Remove from saved"
                                                    >
                                                        <Bookmark size={18} fill="currentColor" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {hydratedItems.length === 0 && !isLoadingItems && (
                                    <div className="text-center py-8 text-gray-500">
                                        Failed to load rich data for these items.
                                    </div>
                                )}
                            </div>
                        )}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => updateUrl({ page })}
                            />
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
);
}

export default function SavedPostsPage() {
    return (
        <Suspense fallback={<Loader />}>
            <SavedPostsPageContent />
        </Suspense>
    );
}
