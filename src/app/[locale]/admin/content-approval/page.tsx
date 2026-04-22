"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { useDocTitle } from "@/hooks/useDocTitle";
import { articleApi } from "@/data/services/article-service/article-service";
import Pagination from "@/components/Pagination";
import { getSafeImageUrl } from "@/utils/imageUtils";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { Suspense } from "react";
import Loader from "@/components/ui/Loader";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "rejected" | "published";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
  { label: "Approved", value: "published" },
];

const ITEMS_PER_PAGE = 12;

// ─── Sub-Components ───────────────────────────────────────────────────────────

const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center border-b py-4 px-4 gap-4">
        <div className="w-6 h-4 bg-gray-200 rounded" />
        <div className="flex-1">
          <div className="w-48 h-4 bg-gray-200 rounded mb-2" />
          <div className="w-32 h-4 bg-gray-100 rounded" />
        </div>
        <div className="w-28 h-4 bg-gray-200 rounded" />
        <div className="w-20 h-6 bg-gray-200 rounded-full" />
        <div className="w-32 h-8 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

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

// ─── Main Page ────────────────────────────────────────────────────────────────

const ContentApprovalPanelContent = () => {
  useDocTitle("Content Approval | Sajjad Husain Law Associates");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useProfileActions();

  // ── Derived from URL ──
  const statusFilter = (searchParams.get("status") as StatusFilter) || "pending";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const urlQ = searchParams.get("q") || "";

  // ── Local State for Input ──
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const debouncedQ = useDebounce(searchQuery, 600);

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [articleToDecline, setArticleToDecline] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [articleToApprove, setArticleToApprove] = useState<string | null>(null);

  const updateUrl = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    router.push(`/admin/content-approval?${params.toString()}`);
  };

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedQ !== urlQ) {
      updateUrl({ q: debouncedQ, page: 1 });
    }
  }, [debouncedQ]);


  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        type: "approval",
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (urlQ) params.q = urlQ;

      const res = await articleApi.fetchArticles(params);
      const data = res.data as any;
      setArticles(data.data ?? []);
      setTotalPages(data.meta?.total_pages ?? 1);
      setTotalItems(data.meta?.total_items ?? 0);
    } catch {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, urlQ]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Actions ──
  const handleApproveClick = (id: string) => { setArticleToApprove(id); setApproveModalOpen(true); };
  const handleRejectClick = (id: string) => { setArticleToDecline(id); setDeclineModalOpen(true); };

  const handleConfirmApprove = async () => {
    if (!articleToApprove) return;
    setActionLoading(articleToApprove);
    try {
      await articleApi.approveArticle(articleToApprove);
      toast.success("Article approved successfully!");
      setShowPreview(false); setPreviewArticle(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve article");
    } finally {
      setActionLoading(null); setApproveModalOpen(false); setArticleToApprove(null);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!articleToDecline) return;
    setActionLoading(articleToDecline);
    try {
      await articleApi.rejectArticle(articleToDecline, reason || undefined);
      toast.success("Article rejected successfully!");
      setShowPreview(false); setPreviewArticle(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject article");
    } finally {
      setActionLoading(null); setDeclineModalOpen(false); setArticleToDecline(null);
    }
  };

  // ── Render ──
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-10">
      <h1 className="text-xl font-semibold text-[#0B2149] mb-5">Content Approval Panel</h1>

      <div className="bg-white rounded-2xl shadow-md md:p-8 p-4 mx-auto">

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
          <p className="text-sm text-gray-500">
            {totalItems} article{totalItems !== 1 ? "s" : ""} found
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm w-72 transition-all focus:ring-2 focus:ring-[#0B2149]/20 focus:border-[#0B2149] shadow-sm bg-gray-50 hover:bg-white"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateUrl({ status: tab.value, page: 1 })}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${statusFilter === tab.value
                ? "bg-[#0B2149] text-white border-[#0B2149]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#0B2149] hover:text-[#0B2149]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden mb-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-gray-200 rounded flex-1" />
                    <div className="h-8 bg-gray-200 rounded flex-1" />
                  </div>
                </div>
              </div>
            ))
          ) : articles.length > 0 ? (
            articles.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col border border-gray-100">
                <div className="relative h-40 w-full bg-gray-100">
                  <Image
                    src={(item.thumbnail && (item.thumbnail.startsWith("http") || item.thumbnail.startsWith("/"))) ? item.thumbnail : "/placeholder.png"}
                    alt={item.title || "Article"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={90}
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2"><StatusBadge status={item.status} /></div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 truncate mb-2" title={item.title}>{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{item.category?.name || "No Category"}</p>
                  <div className="mt-auto grid grid-cols-1 gap-2">
                    <button onClick={() => { setPreviewArticle(item); setShowPreview(true); }} className="bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">Preview</button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApproveClick(item.id)}
                        disabled={!!actionLoading || item.status === "rejected" || item.status === "published"}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${item.status === "published" ? "bg-green-100 text-green-700 cursor-not-allowed" : item.status === "rejected" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}`}
                      >
                        {item.status === "published" ? "Approved" : "Approve"}
                      </button>
                      {item.status === "pending" && (
                        <button onClick={() => handleRejectClick(item.id)} disabled={!!actionLoading} className="bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50">Decline</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">No articles found</div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><TableSkeleton /></td></tr>
              ) : articles.length > 0 ? (
                articles.map((item, idx) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition text-sm">
                    <td className="py-3 px-4">{startIndex + idx + 1}</td>
                    <td className="py-3 px-4 max-w-[240px] truncate" title={item.title}>{item.title}</td>
                    <td className="py-3 px-4">{item.category?.name || "—"}</td>
                    <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
                    <td className="py-3 px-4 flex gap-2">
                      <button onClick={() => { setPreviewArticle(item); setShowPreview(true); }} className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600 transition-colors">Preview</button>
                      <button
                        onClick={() => handleApproveClick(item.id)}
                        disabled={!!actionLoading || item.status === "rejected" || item.status === "published"}
                        className={`px-3 py-1.5 rounded-md text-sm transition-colors disabled:opacity-50 ${item.status === "published" ? "bg-green-100 text-green-700 cursor-not-allowed" : item.status === "rejected" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}`}
                      >
                        {actionLoading === item.id ? "Processing..." : item.status === "published" ? "Approved" : "Approve"}
                      </button>
                      {item.status === "pending" && (
                        <button onClick={() => handleRejectClick(item.id)} disabled={actionLoading === item.id} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 disabled:opacity-50 transition-colors">
                          {actionLoading === item.id ? "Processing..." : "Decline"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No articles found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => updateUrl({ page })}
        />

      </div>

      {/* MODALS */}
      <ApproveModal
        isOpen={approveModalOpen}
        onClose={() => { setApproveModalOpen(false); setArticleToApprove(null); }}
        onConfirm={handleConfirmApprove}
        isProcessing={!!actionLoading}
      />
      <DeclineModal
        isOpen={declineModalOpen}
        onClose={() => { setDeclineModalOpen(false); setArticleToDecline(null); }}
        onConfirm={handleConfirmReject}
        isProcessing={!!actionLoading}
      />

      {/* PREVIEW MODAL: THE INTELLIGENCE BRIEF */}
      {showPreview && previewArticle && (
        <div className="fixed inset-0 bg-[#0A2342]/40 backdrop-blur-md flex items-center justify-center z-[600] p-4 animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/50"
          >
            {/* STICKY HEADER BRIDGE */}
            {/* STICKY HEADER BRIDGE */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-10 py-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#C9A227]/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.3em] text-[#C9A227] uppercase leading-none mb-1">Intelligence Preview</p>
                  <h2 className="text-xl font-bold text-[#0A2342] leading-none tracking-tight">Preview Article</h2>
                </div>
              </div>
              <button
                onClick={() => { setShowPreview(false); setPreviewArticle(null); }}
                className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#0A2342] transition-all group active:scale-95"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-10 py-12 scrollbar-hide">
              <div className="max-w-4xl mx-auto space-y-12">

                {/* 1. EDITORIAL HEADER & IMAGE */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#0A2342] text-white text-[9px] font-black uppercase tracking-widest leading-none">
                        {previewArticle.category?.name || "Uncategorized"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#C9A227]" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        By {previewArticle.authors || "Staff Expert"}
                      </span>
                    </div>
                    <h1 className="text-4xl font-black text-[#0A2342] leading-tight tracking-tight">
                      {previewArticle.title}
                    </h1>
                    {previewArticle.subHeadline && (
                      <p className="text-xl text-gray-500 font-medium leading-snug">
                        {previewArticle.subHeadline}
                      </p>
                    )}
                  </div>

                  {previewArticle.thumbnail && (
                    <div className="relative group rounded-[32px] overflow-hidden border-4 border-gray-50 shadow-xl aspect-video bg-gray-100">
                      <Image
                        src={getSafeImageUrl(previewArticle.thumbnail)}
                        alt={previewArticle.title}
                        fill
                        sizes="900px"
                        quality={90}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>

                {/* 2. METADATA BRIEFING GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50/50 rounded-[32px] p-8 border border-gray-100">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Article Status</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={previewArticle.status} />
                      </div>
                      {previewArticle.status === "pending" && <span className="text-[10px] font-bold text-[#C9A227] italic">Awaiting Registry Approval</span>}
                      {previewArticle.status === "rejected" && previewArticle.rejectionReason && (
                        <p className="text-[10px] text-rose-500 font-medium leading-tight line-clamp-2" title={previewArticle.rejectionReason}>
                          REASON: {previewArticle.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Market Integrity</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0A2342]">
                          <span className="opacity-30">TAGS:</span> {previewArticle.tags?.length || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0A2342]">
                          <span className="opacity-30">DOCS:</span> {previewArticle.documents?.length || 0}
                        </div>
                      </div>
                      {previewArticle.tags && previewArticle.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {previewArticle.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Collaborators</p>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-[#0A2342]">
                        {previewArticle.advocates?.length || 0} Professional{previewArticle.advocates?.length !== 1 ? "s" : ""} Assigned
                      </p>
                      {previewArticle.advocates && previewArticle.advocates.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {previewArticle.advocates.map((adv, i) => (
                            <div key={i} className="flex items-center gap-2 px-2 py-1 bg-[#C9A227]/5 border border-[#C9A227]/10 rounded-lg">
                              <div className="w-4 h-4 rounded-full bg-[#C9A227] flex items-center justify-center text-[8px] text-white font-black">
                                {adv.name?.[0].toUpperCase()}
                              </div>
                              <span className="text-[9px] font-bold text-[#0A2342] uppercase tracking-tight">{adv.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. CORE INTELLIGENCE CONTENT */}
                <div className="prose prose-xl prose-slate max-w-none text-[#0A2342]/80 font-inter">
                  {/* Custom Prose Overrides - NO SERIF */}
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      .prose h2, .prose h3 { font-weight: 800; color: #0A2342; }
                      .prose p { line-height: 1.7; color: #334155; }
                      .prose blockquote { border-left-color: #C9A227; font-style: italic; color: #0A2342; font-weight: 500; }
                   `}} />
                  <div dangerouslySetInnerHTML={{ __html: previewArticle.content }} />
                </div>

                {/* 4. STORY TIMELINE */}
                {previewArticle.updates && previewArticle.updates.length > 0 && (
                  <div className="pt-12 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-[#0A2342]">Intelligence Timeline</h3>
                    </div>
                    <div className="space-y-6 relative ml-4 pl-8 border-l-2 border-gray-50">
                      {previewArticle.updates.map((update, i) => (
                        <div key={i} className="relative group">
                          <div className="absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white bg-[#C9A227] shadow-sm group-hover:scale-125 transition-transform" />
                          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all timeline-update-content">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-black text-[#0A2342] uppercase tracking-wider">{update.title || "Update Entry"}</h4>
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                {new Date(update.updateDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                            <div className="prose prose-sm text-gray-500" dangerouslySetInnerHTML={{ __html: update.content }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. RELATED DOCUMENTATION */}
                {previewArticle.documents && previewArticle.documents.length > 0 && (
                  <div className="pt-12 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-8 rounded-xl bg-[#0A2342]/5 flex items-center justify-center text-[#0A2342]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-[#0A2342]">Documentary Evidence</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {previewArticle.documents.map((doc) => {
                        const isImage = doc.fileType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(doc.fileUrl);
                        return (
                          <a
                            key={doc.id}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-[28px] hover:border-[#C9A227] hover:shadow-xl hover:shadow-[#C9A227]/5 transition-all duration-500"
                          >
                            {isImage ? (
                              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-50 shrink-0 relative">
                                <Image
                                  src={getSafeImageUrl(doc.fileUrl)}
                                  alt={doc.fileName}
                                  fill
                                  sizes="112px"
                                  quality={90}
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-[#C9A227]/10 transition-colors">
                                <svg className="w-6 h-6 text-gray-400 group-hover:text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-[#0A2342] truncate group-hover:text-[#C9A227] transition-colors">{doc.fileName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                <span className="text-[#C9A227]">{doc.fileType?.split("/")[1]?.toUpperCase() || "FILE"}</span>
                                <span className="mx-1 opacity-20">•</span>
                                <span>{(doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) : "0.00")} MB</span>
                              </p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-[#C9A227] group-hover:text-white group-hover:border-[#C9A227] transition-all transform group-hover:scale-110 shrink-0">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION FOOTER BAR */}
            <div className="sticky bottom-0 bg-gray-50/80 backdrop-blur-md border-t border-gray-100 px-10 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
              <div className="hidden sm:block">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Decision Mandatory</p>
                <p className="text-[11px] font-bold text-[#0A2342]">Verify all documentary evidence before confirming.</p>
              </div>

              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={() => { setShowPreview(false); setPreviewArticle(null); }}
                  className="flex-1 sm:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#0A2342] bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
                >
                  Close View
                </button>
                {previewArticle.status === "pending" && (
                  <>
                    <button
                      onClick={() => { setShowPreview(false); handleRejectClick(previewArticle.id); }}
                      className="flex-1 sm:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-rose-500 rounded-2xl hover:bg-rose-600 shadow-xl shadow-rose-500/20 transition-all active:scale-95"
                    >
                      Decline Registry
                    </button>
                    <button
                      onClick={() => { setShowPreview(false); handleApproveClick(previewArticle.id); }}
                      className="flex-1 sm:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-[#0A2342] rounded-2xl hover:bg-[#0A2342]/90 shadow-xl shadow-[#0A2342]/20 transition-all active:scale-95"
                    >
                      Confirm & Publish
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ContentApprovalPanel = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ContentApprovalPanelContent />
    </Suspense>
  );
};

export default ContentApprovalPanel;
