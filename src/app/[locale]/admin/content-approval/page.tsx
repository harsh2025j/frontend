"use client";
import React, { useEffect, useState } from "react";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { Article } from "@/data/features/article/article.types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";

const ITEMS_PER_PAGE = 15;

// ✅ YouTube Style Table Skeleton
const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
      {[...Array(10)].map((_, index) => (
        <div
          key={index}
          className="flex items-center border-b py-4 px-4 gap-4"
        >
          <div className="w-6 h-4 bg-gray-300 rounded"></div>
          <div className="flex-1">
            <div className="w-48 h-4 bg-gray-300 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-32 h-4 bg-gray-300 rounded"></div>
          <div className="w-20 h-4 bg-gray-300 rounded"></div>
          <div className="w-32 h-8 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );
};


interface DeclineConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isProcessing: boolean;
}

const DeclineConfirmationModal: React.FC<DeclineConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Decline Article</h3>
        <p className="text-gray-600 mb-4">
          Please provide a reason for rejecting this article.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="w-full border border-gray-300 rounded-md p-2 mb-6 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isProcessing}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Decline"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ApproveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

const ApproveConfirmationModal: React.FC<ApproveConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Approve Article</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to approve this article? It will be published immediately.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Approve"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ContentApprovalPanel = () => {

  const router = useRouter();
  const { user: reduxUser } = useProfileActions();
  const user = reduxUser as UserData;
  useEffect(() => {
    // if (loading) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // 1. No Token? -> Go to Login
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // 2. Role Check
    if (user?.roles?.length) {
      const allowedRoles = ["admin", "superadmin"];
      const hasAccess = user.roles.some((r) => allowedRoles.includes(r.name));
      if (!hasAccess) {
        router.replace("/auth/login");
      }
    }
  }, [user, router]);



  const { articles, loading, error, refetch } = useArticleListActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Decline Modal State
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [articleToDecline, setArticleToDecline] = useState<string | null>(null);

  // Approve Modal State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [articleToApprove, setArticleToApprove] = useState<string | null>(null);

  const handleApproveClick = (articleId: string) => {
    setArticleToApprove(articleId);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!articleToApprove) return;

    setActionLoading(articleToApprove);
    try {
      const { articleApi } = await import("@/data/services/article-service/article-service");
      await articleApi.approveArticle(articleToApprove);
      toast.success("Article approved successfully!");
      setShowPreview(false);
      setPreviewArticle(null);
      refetch(); // Refresh the list
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve article");
    } finally {
      setActionLoading(null);
      setApproveModalOpen(false);
      setArticleToApprove(null);
    }
  };

  const handleRejectClick = (articleId: string) => {
    setArticleToDecline(articleId);
    setDeclineModalOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!articleToDecline) return;

    setActionLoading(articleToDecline);
    try {
      const { articleApi } = await import("@/data/services/article-service/article-service");
      await articleApi.rejectArticle(articleToDecline, reason || undefined);
      toast.success("Article rejected successfully!");
      setShowPreview(false);
      setPreviewArticle(null);
      refetch(); // Refresh the list
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject article");
    } finally {
      setActionLoading(null);
      setDeclineModalOpen(false);
      setArticleToDecline(null);
    }
  };

  const openPreview = (article: Article) => {
    setPreviewArticle(article);
    setShowPreview(true);
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const pendingArticles = articles.filter(
    (a: Article) => a.status === "pending"
  );

  // Filter out draft articles
  const filteredArticles = articles.filter((a: Article) => a.status !== 'draft');

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] px-6 py-10">
      <h1 className="text-xl font-semibold text-[#0B2149] mb-5">
        Content Approval Panel
      </h1>

      <div className="bg-white rounded-2xl shadow-md p-8 max-w-6xl mx-auto">

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-medium text-[#0B2149]">
            Pending Requests: {pendingArticles.length}
          </h2>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search Item"
              className="border border-gray-300 px-4 py-2 rounded-xl outline-none text-sm w-52"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Article/Content Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Content Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton />
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((item: Article, idx: any) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 text-sm transition"
                  >
                    <td className="py-3 px-4 text-sm">{startIndex + idx + 1}</td>
                    <td className="py-3 px-4 truncate max-w-[220px]">{item.title}</td>
                    <td className="px-4 py-3">{item.category?.name || "No Category"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                          ${item.status === "published"
                            ? "bg-green-200 text-green-900"
                            : item.status === "pending"
                              ? "bg-yellow-200 text-yellow-800"
                              : item.status === "rejected"
                                ? "bg-red-200 text-red-800"
                                : "bg-gray-200 text-gray-700"
                          }
                        `}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 flex gap-2">
                      <button
                        onClick={() => openPreview(item)}
                        className="bg-blue-500 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleApproveClick(item.id)}
                        disabled={actionLoading === item.id || item.status === 'rejected' || item.status === 'published'}
                        className={`px-4 py-1 rounded-md text-sm transition-colors ${item.status === 'rejected'
                          ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-200'
                          : item.status === 'published'
                            ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-200'
                            : 'bg-green-500 text-white hover:bg-green-600'
                          } disabled:opacity-50`}
                      >
                        {actionLoading === item.id
                          ? "Processing..."
                          : item.status === 'rejected'
                            ? "Rejected"
                            : item.status === 'published'
                              ? "Approved"
                              : "Approve"}
                      </button>
                      {item.status === 'pending' && (
                        <button
                          onClick={() => handleRejectClick(item.id)}
                          disabled={actionLoading === item.id}
                          className="bg-red-500 text-white px-4 py-1 rounded-md text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading === item.id ? "Processing..." : "Decline"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center mt-5 text-gray-600 text-sm gap-2">

          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1 ? "text-gray-400" : "hover:text-[#0B2149]"
              }`}
          >
            &lt;
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 border rounded-md ${currentPage === page
                  ? "bg-[#0B2149] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages ? "text-gray-400" : "hover:text-[#0B2149]"
              }`}
          >
            &gt;
          </button>

        </div>

      </div>

      {/* Preview Modal */}
      {showPreview && previewArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#0B2149]">Article Preview</h2>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewArticle(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Article Thumbnail */}
              {previewArticle.thumbnail && (
                <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden">
                  <img
                    src={previewArticle.thumbnail}
                    alt={previewArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {previewArticle.title}
              </h1>

              {/* Sub Headline */}
              {previewArticle.subHeadline && (
                <p className="text-xl text-gray-600 italic">
                  {previewArticle.subHeadline}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Category:</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {previewArticle.category?.name || "No Category"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-medium
                      ${previewArticle.status === "published"
                        ? "bg-green-200 text-green-900"
                        : previewArticle.status === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : previewArticle.status === "rejected"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-700"
                      }
                    `}
                  >
                    {previewArticle.status}
                  </span>
                </div>
                {previewArticle.location && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Location:</span>
                    <span>{previewArticle.location}</span>
                  </div>
                )}
                {previewArticle.advocateName && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Advocate:</span>
                    <span>{previewArticle.advocateName}</span>
                  </div>
                )}
                {previewArticle.authors && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Author:</span>
                    <span>{previewArticle.authors}</span>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {previewArticle.status === "rejected" && previewArticle.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  <span className="font-semibold block mb-1">Rejection Reason:</span>
                  <p>{previewArticle.rejectionReason}</p>
                </div>
              )}

              {/* Tags */}
              {previewArticle.tags && previewArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="font-semibold text-sm text-gray-600">Tags:</span>
                  {previewArticle.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Article Content */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Content</h3>
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: previewArticle.content }}
                />
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewArticle(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
              {previewArticle.status === 'pending' && (
                <button
                  onClick={() => handleRejectClick(previewArticle.id)}
                  disabled={actionLoading === previewArticle.id}
                  className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading === previewArticle.id ? "Processing..." : "Decline"}
                </button>
              )}
              <button
                onClick={() => handleApproveClick(previewArticle.id)}
                disabled={actionLoading === previewArticle.id || previewArticle.status === 'rejected' || previewArticle.status === 'published'}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${previewArticle.status === 'rejected'
                  ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-200'
                  : previewArticle.status === 'published'
                    ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-200'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  } disabled:opacity-50`}
              >
                {actionLoading === previewArticle.id
                  ? "Processing..."
                  : previewArticle.status === 'rejected'
                    ? "Rejected"
                    : previewArticle.status === 'published'
                      ? "Approved"
                      : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Decline Confirmation Modal */}
      <DeclineConfirmationModal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        onConfirm={handleConfirmReject}
        isProcessing={!!actionLoading}
      />
      {/* Approve Confirmation Modal */}
      <ApproveConfirmationModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        isProcessing={!!actionLoading}
      />
    </div>
  );
};

export default ContentApprovalPanel;
