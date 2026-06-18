"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { articleApi } from "@/data/services/article-service/article-service";
import { Article } from "@/data/features/article/article.types";
import ArticlePreviewClient from "./ArticlePreviewClient";
import toast from "react-hot-toast";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { canAccessContentApprovalPage } from "@/utils/permissions";

// ─── Modals ───────────────────────────────────────────────────────────────────

const DeclineModal = ({
    isOpen, onClose, onConfirm, isProcessing,
}: { isOpen: boolean; onClose: () => void; onConfirm: (reason: string) => void; isProcessing: boolean }) => {
    const [reason, setReason] = useState("");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Decline Article</h3>
                <p className="text-gray-600 mb-4">Please provide a reason for rejecting this article.</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full border border-gray-300 rounded-md p-2 mb-6 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                    <button onClick={() => onConfirm(reason)} disabled={isProcessing} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center gap-2 disabled:opacity-50">
                        {isProcessing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</> : "Decline"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ApproveModal = ({
    isOpen, onClose, onConfirm, isProcessing,
}: { isOpen: boolean; onClose: () => void; onConfirm: () => void; isProcessing: boolean }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Approve Article</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to approve this article? It will be published immediately.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                    <button onClick={onConfirm} disabled={isProcessing} className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
                        {isProcessing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</> : "Approve"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

function ArticlePreviewPageContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    const mode = searchParams.get('mode');
    const { user } = useProfileActions();

    const isApprovalMode = mode === 'approval' && canAccessContentApprovalPage(user);

    const [declineModalOpen, setDeclineModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const id = params?.id as string;
                if (!id) return;

                const res = await articleApi.fetchArticleById(id);
                setArticle(res.data.data || res.data);
            } catch (err: any) {
                console.error("Preview fetch error:", err);
                toast.error("Failed to load article preview");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [params?.id]);

    const handleConfirmApprove = async () => {
        if (!article) return;
        setActionLoading(true);
        try {
            await articleApi.approveArticle(article.id);
            toast.success("Article approved successfully!");
            router.push('/admin/content-approval');
        } catch (err: any) {
            toast.error(err?.message || "Failed to approve article");
        } finally {
            setActionLoading(false);
            setApproveModalOpen(false);
        }
    };

    const handleConfirmReject = async (reason: string) => {
        if (!article) return;
        setActionLoading(true);
        try {
            await articleApi.rejectArticle(article.id, reason || undefined);
            toast.success("Article rejected successfully!");
            router.push('/admin/content-approval');
        } catch (err: any) {
            toast.error(err?.message || "Failed to reject article");
        } finally {
            setActionLoading(false);
            setDeclineModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen animate-pulse border-t border-gray-100 font-georgia">
                <div className="max-w-7xl mx-auto mt-4 mb-4 px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="w-32 h-6 bg-gray-200 rounded" />
                    </div>
                    <div className="w-24 h-8 bg-gray-200 rounded-full" />
                </div>
                <div className="max-w-5xl mx-auto py-8 px-4">
                    <div className="article-wrapper">
                        <div className="mb-6">
                            {/* Title */}
                            <div className="h-10 sm:h-12 bg-gray-200 rounded-xl w-full mb-3" />
                            <div className="h-10 sm:h-12 bg-gray-200 rounded-xl w-3/4 mb-6" />
                            
                            {/* Author box */}
                            <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="h-14 w-14 rounded-full bg-gray-200 shrink-0" />
                                <div className="flex-1 space-y-2.5">
                                    <div className="h-5 bg-gray-200 rounded w-40" />
                                    <div className="flex gap-4">
                                        <div className="h-4 bg-gray-200 rounded w-24" />
                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="w-full aspect-video mb-8 rounded-2xl bg-gray-200 border border-gray-100" />

                        {/* Tags / AI Summary row */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex gap-2">
                                <div className="w-16 h-6 bg-gray-200 rounded" />
                                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                                <div className="w-24 h-6 bg-gray-200 rounded-full" />
                            </div>
                            <div className="w-32 h-10 bg-gray-200 rounded-full" />
                        </div>

                        {/* Content Body */}
                        <div className="space-y-4">
                            <div className="h-5 bg-gray-200 rounded w-full" />
                            <div className="h-5 bg-gray-200 rounded w-[95%]" />
                            <div className="h-5 bg-gray-200 rounded w-[98%]" />
                            <div className="h-5 bg-gray-200 rounded w-[90%]" />
                            <div className="h-5 bg-gray-200 rounded w-full mt-8" />
                            <div className="h-5 bg-gray-200 rounded w-[85%]" />
                            <div className="h-5 bg-gray-200 rounded w-[92%]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-gray-500 font-bold">Article not found or access denied.</div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pt-4 pb-4 relative flex flex-col">
            <div className="max-w-7xl mx-auto mb-4 px-4 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(mode === 'approval' ? '/admin/content-approval' : '/admin/content-management')}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100 text-gray-700 transition-colors"
                        title={mode === 'approval' ? "Back to Content Approval" : "Back to Content Management"}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {/* <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span> */}
                        Preview Mode
                    </h1>
                </div>
                <div className={`px-4 py-1.5 font-bold text-sm rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-800' :
                    article.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {article.status ? article.status.charAt(0).toUpperCase() + article.status.slice(1) : 'Draft'} Preview
                </div>
            </div>

            <ArticlePreviewClient article={article} />

            {/* ACTION FOOTER BAR FOR APPROVAL */}
            {isApprovalMode && article.status === "pending" && (
                <div className="sticky bottom-0 mt-auto bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-3 z-50 shadow-[0_-2px_2px_-2px_rgba(0,0,0,0.05)] w-full rounded-t-sm">
                    <div className="flex gap-3 w-full sm:w-auto max-w-3xl">
                        <button
                            onClick={() => router.push('/admin/content-approval')}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setDeclineModalOpen(true)}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-rose-500 rounded-xl hover:bg-rose-600 shadow-sm transition-all active:scale-95"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => setApproveModalOpen(true)}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#0A2342] rounded-xl hover:bg-[#0A2342]/90 shadow-sm transition-all active:scale-95"
                        >
                            Approve & Publish
                        </button>
                    </div>
                </div>
            )}

            {/* MODALS */}
            <ApproveModal
                isOpen={approveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                onConfirm={handleConfirmApprove}
                isProcessing={actionLoading}
            />
            <DeclineModal
                isOpen={declineModalOpen}
                onClose={() => setDeclineModalOpen(false)}
                onConfirm={handleConfirmReject}
                isProcessing={actionLoading}
            />
        </div>
    );
}

export default function ArticlePreviewPage() {
    return (
        <Suspense fallback={
            <div className="bg-white min-h-screen animate-pulse border-t border-gray-100 font-georgia">
                <div className="max-w-7xl mx-auto mt-4 mb-4 px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="w-32 h-6 bg-gray-200 rounded" />
                    </div>
                    <div className="w-24 h-8 bg-gray-200 rounded-full" />
                </div>
                <div className="max-w-5xl mx-auto py-8 px-4">
                    <div className="article-wrapper">
                        <div className="mb-6">
                            {/* Title */}
                            <div className="h-10 sm:h-12 bg-gray-200 rounded-xl w-full mb-3" />
                            <div className="h-10 sm:h-12 bg-gray-200 rounded-xl w-3/4 mb-6" />
                            
                            {/* Author box */}
                            <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="h-14 w-14 rounded-full bg-gray-200 shrink-0" />
                                <div className="flex-1 space-y-2.5">
                                    <div className="h-5 bg-gray-200 rounded w-40" />
                                    <div className="flex gap-4">
                                        <div className="h-4 bg-gray-200 rounded w-24" />
                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="w-full aspect-video mb-8 rounded-2xl bg-gray-200 border border-gray-100" />

                        {/* Tags / AI Summary row */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex gap-2">
                                <div className="w-16 h-6 bg-gray-200 rounded" />
                                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                                <div className="w-24 h-6 bg-gray-200 rounded-full" />
                            </div>
                            <div className="w-32 h-10 bg-gray-200 rounded-full" />
                        </div>

                        {/* Content Body */}
                        <div className="space-y-4">
                            <div className="h-5 bg-gray-200 rounded w-full" />
                            <div className="h-5 bg-gray-200 rounded w-[95%]" />
                            <div className="h-5 bg-gray-200 rounded w-[98%]" />
                            <div className="h-5 bg-gray-200 rounded w-[90%]" />
                            <div className="h-5 bg-gray-200 rounded w-full mt-8" />
                            <div className="h-5 bg-gray-200 rounded w-[85%]" />
                            <div className="h-5 bg-gray-200 rounded w-[92%]" />
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ArticlePreviewPageContent />
        </Suspense>
    );
}
