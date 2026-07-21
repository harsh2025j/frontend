"use client";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import logo from "../../../../../public/logo.png";
// import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import { articleApi } from "@/data/services/article-service/article-service";
import Pagination from "@/components/Pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermissions } from "@/hooks/usePermissions";
import { Suspense } from "react";
import { MessageSquare, MessageSquareOff } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "draft" | "pending" | "rejected" | "published";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
  { label: "Published", value: "published" },
];

const ITEMS_PER_PAGE = 12;

// ─── Sub-Components ───────────────────────────────────────────────────────────

const TableSkeleton = () => (
  <tbody>
    {[...Array(8)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b">
        <td className="py-3 px-4"><div className="h-4 w-6 bg-gray-200 rounded" /></td>
        <td className="py-3 px-4"><div className="h-12 w-12 bg-gray-200 rounded-md" /></td>
        <td className="py-3 px-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
        <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
        <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
        <td className="py-3 px-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
        <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-200 rounded mx-auto" /></td>
        <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-200 rounded mx-auto" /></td>
        <td className="py-3 px-4"><div className="h-6 w-24 bg-gray-200 rounded" /></td>
      </tr>
    ))}
  </tbody>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-600",
    draft: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

const RejectionReason = ({ reason }: { reason: string | null }) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const calcPos = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    let left = r.left;
    if (left + 300 > window.innerWidth) left = window.innerWidth - 320;
    setPos({ top: r.bottom + 5, left });
  };

  if (!reason) return null;
  return (
    <>
      <div
        className="truncate max-w-[150px] cursor-pointer hover:text-blue-600 text-sm"
        onMouseEnter={(e) => { calcPos(e.currentTarget); setShow(true); }}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => { calcPos(e.currentTarget); setShow((p) => !p); }}
      >
        {reason}
      </div>
      {show && (
        <div
          className="fixed z-[9999] bg-gray-900 text-white text-xs rounded-md p-3 shadow-xl max-w-[300px] whitespace-normal break-words leading-relaxed"
          style={{ top: pos.top, left: pos.left }}
        >
          {reason}
        </div>
      )}
    </>
  );
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return (num || 0).toString();
};

const StatBadge = ({ icon, value }: { icon: React.ReactNode, value: number }) => (
  <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium">
    {icon}
    <span>{formatNumber(value)}</span>
  </div>
);

// ─── Sync News Modal ──────────────────────────────────────────────────────────

const SyncNewsModal = ({
  isOpen, onClose, onConfirm, isSyncing,
}: { isOpen: boolean; onClose: () => void; onConfirm: (max: number) => void; isSyncing: boolean }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const numValue = inputValue === "" ? null : parseInt(inputValue, 10);
  const isValid = numValue !== null && !isNaN(numValue) && numValue >= 1 && numValue <= 20;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty or numeric input only
    if (val !== "" && !/^\d+$/.test(val)) return;
    setInputValue(val);

    if (val === "") {
      setError(null);
      return;
    }

    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setError("Please enter a valid number");
    } else if (num < 1) {
      setError("Invalid: minimum is 1");
    } else if (num > 20) {
      setError("Invalid: maximum is 20");
    } else {
      setError(null);
    }
  };

  const handleConfirm = () => {
    if (isValid && numValue) {
      onConfirm(numValue);
      setInputValue("");
      setError(null);
    }
  };

  const handleClose = () => {
    setInputValue("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sync GNews Articles</h3>
        <p className="text-gray-600 mb-4">How many articles would you like to sync? <span className="text-gray-500 text-sm">(Min: 1, Max: 20)</span></p>
        <div className="mb-4">
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter number (1-20)"
            disabled={isSyncing}
            className={`w-full px-4 py-2.5 border-2 rounded-lg text-lg font-medium focus:outline-none transition-colors ${
              error
                ? "border-red-400 focus:border-red-500 bg-red-50 text-red-700"
                : inputValue && isValid
                ? "border-emerald-400 focus:border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-200 focus:border-[#0B2149] text-gray-800"
            }`}
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          {inputValue && isValid && (
            <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Will sync {numValue} article{numValue > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={handleClose} disabled={isSyncing} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || isSyncing}
            className="px-4 py-2 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSyncing ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Syncing...</>
            ) : "Confirm Sync"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

const DeleteConfirmationModal = ({
  isOpen, onClose, onConfirm, isDeleting,
}: { isOpen: boolean; onClose: () => void; onConfirm: () => void; isDeleting: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Article</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this article? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center gap-2 disabled:opacity-50">
            {isDeleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleCommentsConfirmationModal = ({
  isOpen, onClose, onConfirm, isToggling, isEnabling
}: { isOpen: boolean; onClose: () => void; onConfirm: () => void; isToggling: boolean; isEnabling: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isEnabling ? "Enable Comments" : "Disable Comments"}
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {isEnabling ? "enable" : "disable"} comments for this article?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isToggling} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isToggling} className={`px-4 py-2 text-white rounded-md flex items-center gap-2 disabled:opacity-50 transition-colors ${isEnabling ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {isToggling ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</> : (isEnabling ? "Enable" : "Disable")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ContentManagementPageContent: React.FC = () => {
  useDocTitle("Content Management | Sajjad Husain Law Associates");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useProfileActions();
  const { hasPermission } = usePermissions();

  // ── Derived from URL ──
  const statusFilter = (searchParams.get("status") as StatusFilter) || "all";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const urlQ = searchParams.get("q") || "";

  // ── Local State for Input ──
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const debouncedQ = useDebounce(searchQuery, 600);

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [commentToggleModalOpen, setCommentToggleModalOpen] = useState(false);
  const [articleToToggleComments, setArticleToToggleComments] = useState<{id: string, currentStatus: boolean | undefined} | null>(null);
  const [isTogglingComments, setIsTogglingComments] = useState(false);

  const updateUrl = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    router.push(`/admin/content-management?${params.toString()}`);
  };

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedQ !== urlQ) {
      updateUrl({ q: debouncedQ, page: 1 });
    }
  }, [debouncedQ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        type: "my-content",
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
  const handleView = (id: string) => router.push(`/admin/content-management/preview/${id}`);
  const handleEdit = (id: string) => router.push(`/admin/create-content/${id}`);
  const handleDeleteClick = (id: string) => { setArticleToDelete(id); setDeleteModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await articleApi.deleteArticle(articleToDelete);
      toast.success("Article deleted successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete article");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleToggleCommentsClick = (id: string, currentStatus: boolean | undefined) => {
    setArticleToToggleComments({ id, currentStatus });
    setCommentToggleModalOpen(true);
  };

  const handleConfirmToggleComments = async () => {
    if (!articleToToggleComments) return;
    setIsTogglingComments(true);
    const { id, currentStatus } = articleToToggleComments;
    const newStatus = !(currentStatus ?? true); // default to true if undefined

    try {
      // Optimistic update
      setArticles(prev => prev.map(a => a.id === id ? { ...a, isCommentsEnabled: newStatus } : a));
      await articleApi.toggleComments(id);
      toast.success(newStatus ? "Comments enabled" : "Comments disabled");
    } catch (error) {
      // Revert on error
      setArticles(prev => prev.map(a => a.id === id ? { ...a, isCommentsEnabled: currentStatus ?? true } : a));
      toast.error("Failed to toggle comments");
    } finally {
      setIsTogglingComments(false);
      setCommentToggleModalOpen(false);
      setArticleToToggleComments(null);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // ── Render ──
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-poppins text-black font-medium">Content Management</h1>
        <div className="relative w-64 md:w-80">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2149]"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex min-h-screen bg-gray-50 text-gray-800">
        <main className="flex-1">
          <div className="mx-auto bg-white rounded-2xl shadow md:p-6 p-4">

            {/* Stats + Create Button */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
              <p className="text-sm text-gray-500">
                {loading ? "..." : `${totalItems} article${totalItems !== 1 ? "s" : ""}`}
              </p>
              <div className="flex items-center gap-3">
                {hasPermission("manage:g-news:article") && (
                  <button
                    disabled={isTriggering}
                    onClick={() => setSyncModalOpen(true)}
                    className="bg-emerald-600 text-white px-5 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isTriggering ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
                        </svg>
                        Sync GNews
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => router.push("/admin/create-content")}
                  className="bg-[#0B2149] text-white px-5 py-2 rounded-md font-medium hover:bg-[#1a3a75] transition-colors flex items-center gap-2"
                >
                  <span>+</span> Create New Article
                </button>
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
                articles.map((item) => {
                  const showDelete = item.status !== "published";
                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col border border-gray-100">
                      <div className="relative h-40 w-full bg-gray-100">
                        <Image
                          src={(item.thumbnail && (item.thumbnail.startsWith("http") || item.thumbnail.startsWith("/"))) ? item.thumbnail : logo}
                          alt={item.title || "Article"}
                          fill sizes="(max-width: 768px) 100vw, 500px"
                          quality={90}
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2"><StatusBadge status={item.status} /></div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 truncate mb-2" title={item.title}>{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-1">{item.category?.name || "No Category"}</p>
                        <p className="text-sm text-gray-500 mb-3 truncate">{item.authors || "Unknown"}</p>
                        <div className="flex gap-3 mb-3">
                          <StatBadge 
                            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                            value={item.views || 0} 
                          />
                          <StatBadge 
                            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514" /></svg>}
                            value={item.likes || 0} 
                          />
                        </div>
                        {item.rejectionReason && item.status === "rejected" && (
                          <div className="mb-3 text-xs text-red-600 bg-red-50 rounded p-2 border border-red-100">
                            <span className="font-semibold block mb-1">Rejection Reason:</span>
                            {item.rejectionReason}
                          </div>
                        )}
                        <div className={`mt-auto grid ${showDelete ? "grid-cols-4" : "grid-cols-3"} gap-2`}>
                          <button onClick={() => handleView(item.id)} className="bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">View</button>
                          <button onClick={() => handleEdit(item.id)} className="bg-yellow-500 text-white py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors">Edit</button>
                          <button 
                            onClick={() => handleToggleCommentsClick(item.id, item.isCommentsEnabled)} 
                            className={`py-2 rounded-lg text-sm transition-colors flex items-center justify-center ${item.isCommentsEnabled !== false ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                            title={item.isCommentsEnabled !== false ? "Disable Comments" : "Enable Comments"}
                          >
                            {item.isCommentsEnabled !== false ? <MessageSquare size={16} /> : <MessageSquareOff size={16} />}
                          </button>
                          {showDelete && (
                            <button onClick={() => handleDeleteClick(item.id)} className="bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl shadow">No articles found.</div>
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-sm font-medium">#</th>
                    <th className="py-3 px-4 text-sm font-medium">Image</th>
                    <th className="py-3 px-4 text-sm font-medium">Title</th>
                    <th className="py-3 px-4 text-sm font-medium">Category</th>
                    <th className="py-3 px-4 text-sm font-medium">Authors</th>
                    <th className="py-3 px-4 text-sm font-medium">Status</th>
                    <th className="py-3 px-4 text-sm font-medium text-center">Views</th>
                    <th className="py-3 px-4 text-sm font-medium text-center">Likes</th>
                    <th className="py-3 px-4 text-sm font-medium">Actions</th>
                  </tr>
                </thead>

                {loading ? (
                  <TableSkeleton />
                ) : articles.length > 0 ? (
                  <tbody>
                    {articles.map((item, idx) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm">{startIndex + idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            <Image
                              src={(item.thumbnail && (item.thumbnail.startsWith("http") || item.thumbnail.startsWith("/"))) ? item.thumbnail : logo}
                              alt="thumbnail" fill sizes="100px"
                              quality={90}
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 truncate max-w-[200px] text-sm" title={item.title}>{item.title}</td>
                        <td className="py-3 px-4 text-sm">{item.category?.name || "No Category"}</td>
                        <td className="py-3 px-4 text-sm">{item.authors || "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge status={item.status} />
                            {item.status === 'rejected' && (
                              <div className="mt-1">
                                <RejectionReason reason={item.rejectionReason} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-medium text-gray-600">{formatNumber(item.views || 0)}</td>
                        <td className="py-3 px-4 text-center text-sm font-medium text-gray-600">{formatNumber(item.likes || 0)}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <button onClick={() => handleView(item.id)} className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600 transition-colors">View</button>
                          <button onClick={() => handleEdit(item.id)} className="bg-yellow-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-yellow-600 transition-colors">Edit</button>
                          <button 
                            onClick={() => handleToggleCommentsClick(item.id, item.isCommentsEnabled)} 
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-center ${item.isCommentsEnabled !== false ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                            title={item.isCommentsEnabled !== false ? "Disable Comments" : "Enable Comments"}
                          >
                            {item.isCommentsEnabled !== false ? <MessageSquare size={16} /> : <MessageSquareOff size={16} />}
                          </button>
                          {item.status !== "published" && (
                            <button onClick={() => handleDeleteClick(item.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 transition-colors">Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr><td colSpan={9} className="text-center py-12 text-gray-500">No articles found.</td></tr>
                  </tbody>
                )}
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => updateUrl({ page })}
            />

          </div>
        </main>
      </div>

      <SyncNewsModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        isSyncing={isTriggering}
        onConfirm={async (max) => {
          setIsTriggering(true);
          setSyncModalOpen(false);
          const toastId = toast.loading(`Syncing ${max} GNews article${max > 1 ? "s" : ""}...`);
          try {
            const res = await articleApi.triggerDailyNews(max, user?.name);
            const data = res.data;
            if (res.status === 200 || data?.success) {
              toast.success(`GNews sync started for ${max} article${max > 1 ? "s" : ""}! Please refresh the page in a few seconds to see new articles.`, { id: toastId, duration: 6000 });
            } else {
              toast.error(data?.message || "Failed to sync articles.", { id: toastId });
            }
          } catch (err: any) {
            toast.error(err?.message || "Error syncing GNews articles.", { id: toastId });
          } finally {
            setIsTriggering(false);
          }
        }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <ToggleCommentsConfirmationModal
        isOpen={commentToggleModalOpen}
        onClose={() => setCommentToggleModalOpen(false)}
        onConfirm={handleConfirmToggleComments}
        isToggling={isTogglingComments}
        isEnabling={!(articleToToggleComments?.currentStatus ?? true)}
      />
    </div>
  );
};

const ContentManagementSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div className="w-48 h-7 bg-gray-200 rounded" />
      <div className="w-64 md:w-80 h-10 bg-gray-200 rounded-lg" />
    </div>
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <main className="flex-1">
        <div className="mx-auto bg-white rounded-2xl shadow md:p-6 p-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
            <div className="w-32 h-5 bg-gray-200 rounded" />
            <div className="flex items-center gap-3">
              <div className="w-32 h-10 bg-gray-200 rounded-md" />
              <div className="w-40 h-10 bg-gray-200 rounded-md" />
            </div>
          </div>
          <div className="flex gap-2 mb-6 flex-wrap">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-24 h-9 bg-gray-200 rounded-full" />)}
          </div>
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200">
            <div className="bg-gray-50 h-12 w-full border-b" />
            <table className="w-full text-left border-collapse"><TableSkeleton /></table>
          </div>
        </div>
      </main>
    </div>
  </div>
);

const ContentManagementPage: React.FC = () => {
  return (
    <Suspense fallback={<ContentManagementSkeleton />}>
      <ContentManagementPageContent />
    </Suspense>
  );
};

export default ContentManagementPage;
