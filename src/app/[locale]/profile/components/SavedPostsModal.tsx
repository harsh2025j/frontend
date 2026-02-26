import { useEffect, useState } from "react";
import { Bookmark, Search, ArrowRight, Loader2, Calendar, Scale, FileText, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useAppDispatch } from "@/data/redux/hooks";
import { toggleSavePost } from "@/data/features/profile/profileThunks";
import { articleApi } from "@/data/services/article-service/article-service";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import Image from "next/image";

interface SavedPostsModalProps {
    onClose: () => void;
}

export default function SavedPostsModal({ onClose }: SavedPostsModalProps) {
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
                // Fetch articles and judgments in parallel
                const [articlesRes, judgmentsRes] = await Promise.all([
                    articleApi.fetchMultipleArticles(savedPosts).catch(() => ({ data: { data: [] } })),
                    judgmentsService.fetchMultipleJudgments(savedPosts).catch(() => ({ data: [] }))
                ]);

                // Adjust based on the actual NestJS response structure (often nested under data.data for paginated endpoints, but here we used raw rep.find)
                const articles = Array.isArray(articlesRes?.data) ? articlesRes.data : articlesRes?.data?.data || [];
                const judgments = Array.isArray(judgmentsRes?.data) ? judgmentsRes.data : judgmentsRes?.data?.data || [];

                // Normalize them into a common structure
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

                // Order by how they appear in the savedPosts array to retain user's chronological save order
                // Any ID that isn't found in 'combined' was likely deleted or unpublished.
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-[80%] h-[90%] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Navbar */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                        <Bookmark size={24} className="text-blue-600" />
                        Your Saved Posts ({savedPosts.length})
                    </h2>
                </div>

                {/* Modal Body / Scrollable Content */}
                <div className="flex-grow p-6 overflow-y-auto bg-gray-50/30 text-left">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 size={48} className="animate-spin text-blue-500" />
                        </div>
                    ) : !user ? (
                        <div className="flex justify-center items-center h-full">
                            <h1 className="text-xl font-bold text-gray-500">Please login to view your saved posts.</h1>
                        </div>
                    ) : savedPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                                <Bookmark size={48} strokeWidth={1.5} />
                            </div>
                            <p className="text-gray-500 text-lg max-w-md mb-8">
                                You haven&apos;t bookmarked any articles yet. Save important cases and legal news to view them here later.
                            </p>
                            <Link
                                href="/"
                                className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all flex items-center gap-2 group shadow-lg shadow-blue-100"
                                onClick={onClose}
                            >
                                Browse Latest News
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {unresolvableCount > 0 && !isLoadingItems && (
                                <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                        <Link key={item.id} href={item.link} className="block group" onClick={onClose}>
                                            <div className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">

                                                {/* Thumbnail Section */}
                                                <div className="sm:w-1/4 h-48 sm:h-auto bg-gray-50 relative shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100">
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
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors shrink-0 z-10 relative"
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
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="flex justify-end p-4 border-t border-gray-100 bg-white shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
