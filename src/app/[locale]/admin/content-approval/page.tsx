"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { Article } from "@/data/features/article/article.types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { useDocTitle } from "@/hooks/useDocTitle";
import { articleApi } from "@/data/services/article-service/article-service";
import Pagination from "@/components/Pagination";

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

const ContentApprovalPanel = () => {
  useDocTitle("Content Approval | Sajjad Husain Law Associates");
  const router = useRouter();
  const { user } = useProfileActions();


  // ── State ──
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

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

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => setDebouncedQ(searchQuery), 600);
    return () => clearTimeout(h);
  }, [searchQuery]);

  // Reset page on filter/search change
  useEffect(() => { setCurrentPage(1); }, [statusFilter, debouncedQ]);

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
      if (debouncedQ) params.q = debouncedQ;

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
  }, [currentPage, statusFilter, debouncedQ]);

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

        {/* STATUS FILTER TABS */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
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
                  <img
                    src={(item.thumbnail && (item.thumbnail.startsWith("http") || item.thumbnail.startsWith("/"))) ? item.thumbnail : "/placeholder.png"}
                    alt={item.title}
                    className="object-cover w-full h-full"
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

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
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

      {/* PREVIEW MODAL */}
      {showPreview && previewArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#0B2149]">Article Preview</h2>
              <button onClick={() => { setShowPreview(false); setPreviewArticle(null); }} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-6">
              {previewArticle.thumbnail && (
                <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden">
                  <img src={previewArticle.thumbnail} alt={previewArticle.title} className="w-full h-full object-cover" />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{previewArticle.title}</h1>
              {previewArticle.subHeadline && <p className="text-xl text-gray-600 italic">{previewArticle.subHeadline}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2"><span className="font-semibold">Category:</span><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{previewArticle.category?.name || "No Category"}</span></div>
                <div className="flex items-center gap-2"><span className="font-semibold">Status:</span><StatusBadge status={previewArticle.status} /></div>
                {previewArticle.authors && <div className="flex items-center gap-2"><span className="font-semibold">Author:</span><span>{previewArticle.authors}</span></div>}
                {previewArticle.advocates && previewArticle.advocates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Advocates:</span>
                    <div className="flex flex-wrap gap-1">
                      {previewArticle.advocates.map((adv, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs border border-blue-100">
                          {adv.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {previewArticle.status === "rejected" && previewArticle.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  <span className="font-semibold block mb-1">Rejection Reason:</span>
                  <p>{previewArticle.rejectionReason}</p>
                </div>
              )}
              {previewArticle.tags && previewArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="font-semibold text-sm text-gray-600">Tags:</span>
                  {previewArticle.tags.map((tag, i) => <span key={i} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">{tag.name}</span>)}
                </div>
              )}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Content</h3>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: previewArticle.content }} />
              </div>
              {previewArticle.updates && previewArticle.updates.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Developing Story Timeline</h3>
                  <div className="space-y-4">
                    {previewArticle.updates.map((update, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">{update.title || "Update"}</h4>
                          <span className="text-sm text-gray-500">{new Date(update.updateDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: update.content }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => { setShowPreview(false); setPreviewArticle(null); }} className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
              {previewArticle.status === "pending" && (
                <>
                  <button onClick={() => { setShowPreview(false); handleRejectClick(previewArticle.id); }} className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">Decline</button>
                  <button onClick={() => { setShowPreview(false); handleApproveClick(previewArticle.id); }} className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">Approve</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentApprovalPanel;
