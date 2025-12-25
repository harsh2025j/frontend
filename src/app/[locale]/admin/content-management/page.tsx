"use client";
import React, { useEffect, useState } from "react";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import toast from "react-hot-toast";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import logo from "../../../../../public/logo.png";
import imgs from "../../../assets/img1.png"
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";


import { API_BASE_URL, API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import apiClient from "@/data/services/apiConfig/apiClient";

const ITEM_PER_PAGE = 15;

// --- Skeleton component ---
const TableSkeleton = () => {
  return (
    <tbody>
      {[...Array(15)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b">
          <td className="py-3 px-4">
            <div className="h-4 w-6 bg-gray-200 rounded"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </td>
          <td className="py-3 px-4">
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

const RejectionReason = ({ reason }: { reason: string | null }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    // Adjust if close to right edge
    let left = rect.left;
    // Assuming max-width of tooltip is 300px
    if (left + 300 > window.innerWidth) {
      left = window.innerWidth - 320; // 20px padding from right
    }
    setPosition({ top: rect.bottom + 5, left });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    updatePosition(e.currentTarget);
    setShow(true);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    updatePosition(e.currentTarget);
    setShow((prev) => !prev);
  };

  if (!reason) return <span className="text-gray-400">N/A</span>;

  return (
    <>
      <div
        className="truncate max-w-[150px] cursor-pointer hover:text-blue-600"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        onClick={handleClick}
      >
        {reason}
      </div>
      {show && (
        <div
          className="fixed z-[9999] bg-gray-900 text-white text-xs rounded-md p-3 shadow-xl max-w-[300px] whitespace-normal break-words leading-relaxed"
          style={{ top: position.top, left: position.left }}
        >
          {reason}
        </div>
      )}
    </>
  );
};



interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Article</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this article? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const contentManagementPage: React.FC = () => {
  useDocTitle("Content Management  | Sajjad Husain Law Associates");
  const { articles, loading, error, refetch } = useArticleListActions();
  const [currentPage, setCurrentPage] = useState(1);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalSearchItems, setTotalSearchItems] = useState(0);

  // Debounce hook
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Fetch Search Results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearchQuery.length >= 3) {
        setIsSearching(true);
        try {
          const { searchService } = await import("@/data/features/search/searchService");

          // Note: using 'article' as type since this is content management
          const results = await searchService.searchContentWithPagination(
            debouncedSearchQuery,
            currentPage,
            ITEM_PER_PAGE
          );

          console.log("Search Service Results:", results);

          // Map search results to Article type (aligned with Content Approval)
          const mappedResults: any[] = results.data.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category, // Pass full category object
            status: item.status || 'draft',
            authors: item.authors || "Unknown",
            thumbnail: item.thumbnail,
            rejectionReason: null,
            authorId: item.authorId || "",
            createdAt: item.date || new Date().toISOString(), // Ensure createdAt exists
            slug: item.slug || "",
            content: item.description || "",
            subHeadline: item.description || "",
            isPaywalled: false,
            language: "English",
            tags: [], // Default tags
            updatedAt: new Date().toISOString(), // Default updatedAt
          }));

          const filteredResults = mappedResults.filter((article: any) => {
            if (!user?._id) return false;
            return article.authorId === user._id;
          });

          setSearchResults(filteredResults);

          // ROBUST PAGINATION FIX: Check all possible meta fields
          const totalInfo = results.meta?.totalItems || (results.meta as any)?.pagination?.total || (results.meta as any)?.total || (results.meta as any)?.count || 0;
          setTotalSearchItems(totalInfo);

        } catch (error) {
          console.error("Search failed", error);
          // toast.error("Failed to fetch search results");
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setTotalSearchItems(0);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery, currentPage]);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { user: reduxUser } = useProfileActions();
  const user = reduxUser as UserData;
  const [isAuthorized, setIsAuthorized] = useState(false);
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
      const allowedRoles = ["admin", "superadmin", "creator", "editor"];
      const hasAccess = user.roles.some((r) => allowedRoles.includes(r.name));
      if (!hasAccess) {
        router.replace("/auth/login");
      }
      else {
        setIsAuthorized(true)
      }
    }
  }, [user, router]);



  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleDeleteClick = (articleId: string) => {
    setArticleToDelete(articleId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;

    setIsDeleting(true);
    try {
      const { articleApi } = await import('@/data/services/article-service/article-service');
      await articleApi.deleteArticle(articleToDelete);
      toast.success('Article deleted successfully');
      await refetch(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete article');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setArticleToDelete(null);
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNews = async () => {
    setIsGenerating(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.TASKS.TRIGGER_DAILY_NEWS, {});
      if (response.data?.success) {
        toast.success(`${response.data.data?.articleCreates || 0} article created`);
        await refetch(true);
      } else {
        toast.error(response.data?.message || "Failed to generate news");
      }
    } catch (error: any) {
      toast.error(error?.message || "Error generating news");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (articleId: string) => {
    // Navigate to edit page (assuming route exists)
    router.push(`/admin/create-content/${articleId}`);
  };

  // Table header addition
  // Insert after Status column
  // (Will be placed in JSX below)


  // Filter articles by current user

  const userArticles = React.useMemo(() => {
    if (!user?._id) return [];
    return articles.filter((article: any) => article.authorId === user._id);
  }, [articles, user?._id]);

  //this is for all articles means all articles in db show
  // const userArticles = articles

  const isSearchMode = debouncedSearchQuery.length >= 3;

  const startIndex = (currentPage - 1) * ITEM_PER_PAGE;

  const paginatedArticles = isSearchMode
    ? searchResults
    : (loading ? [] : userArticles.slice(startIndex, startIndex + ITEM_PER_PAGE));

  const totalPages = isSearchMode
    ? Math.ceil(totalSearchItems / ITEM_PER_PAGE)
    : (loading ? 0 : Math.ceil(userArticles.length / ITEM_PER_PAGE));

  const totalNewsPost = userArticles.length;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Table header addition: add Rejection Reason column after Status
  // We'll modify the JSX later where the header rows are defined.

  const pendingNewsRequest = userArticles.filter((a: Article) => a.status === 'pending').length;

  // if (!isAuthorized) {
  //   return (
  //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
  //       <Loader size="lg" text="Checking Permissions..." />
  //     </div>
  //   );
  // }

  if (!articles.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Loading content" />
      </div>
    );
  }


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-poppins text-black font-medium">
          Content Management
        </h1>
        <div className="relative w-64 md:w-80">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2149]"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex min-h-screen bg-gray-50 text-gray-800">
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8">

            {/* Stats */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex bg-gray rounded-xl px-6 py-3 items-center gap-6 text-sm md:text-base">
                <span>
                  <strong>Total News Post:</strong> {loading ? "..." : totalNewsPost}
                </span>
                <span>
                  <strong>Pending News Request:</strong> {loading ? "..." : pendingNewsRequest}
                </span>
              </div>

              <div className="flex gap-4">


                {/* <button
                  onClick={handleGenerateNews}
                  disabled={isGenerating}
                  className="bg-[#C9A227] text-white px-5 py-2 rounded-md font-medium hover:bg-[#C9A227]/90 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader size="sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <span>⚡</span> Generate News
                    </>
                  )}
                </button> */}

                <button
                  onClick={() => router.push('/admin/create-content')}
                  className="bg-[#0B2149] text-white px-5 py-2 rounded-md font-medium hover:bg-[#1a3a75] transition-colors flex items-center gap-2"
                >
                  <span>+</span> Create New Article
                </button>
              </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-sm font-medium">#</th>
                    <th className="py-3 px-4 text-sm font-medium">Image</th>
                    <th className="py-3 px-4 text-sm font-medium">Title</th>
                    <th className="py-3 px-4 text-sm font-medium">Category</th>
                    <th className="py-3 px-4 text-sm font-medium">Authors</th>
                    <th className="py-3 px-4 text-sm font-medium">Status</th>
                    <th className="py-3 px-4 text-sm font-medium">Rejection Reason</th>
                    <th className="py-3 px-4 text-sm font-medium">Action</th>
                  </tr>
                </thead>

                {/* --- Skeleton OR Data --- */}
                {loading || isSearching ? (
                  <TableSkeleton />
                ) : (
                  <tbody>
                    {paginatedArticles.map((item: Article, index: any) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{startIndex + index + 1}</td>

                        <td className="py-3 px-4">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            <Image
                              src={(item.thumbnail && (item.thumbnail.startsWith('http') || item.thumbnail.startsWith('/'))) ? item.thumbnail : logo}
                              alt={"not found"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 truncate max-w-[200px]">
                          {item.title}
                        </td>

                        <td className="py-3 px-4">{item.category?.name || "No Category"}</td>

                        <td className="py-3 px-4">{item.authors}</td>

                        <td className="py-3 px-4">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${item.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'draft'
                              ? 'bg-white text-yellow-300'
                              : item.status === 'rejected'
                                ? 'bg-amber-100 text-red-600'
                                : item.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}>
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <RejectionReason reason={item.rejectionReason} />
                        </td>

                        <td className="py-3 px-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="bg-yellow-500 text-white px-4 py-1 rounded-md text-sm hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          {item.status !== 'published' && (
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              className="bg-red-500 text-white px-4 py-1 rounded-md text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}

                {!loading && !isSearching && paginatedArticles.length === 0 && (
                  <tbody>
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No articles found.
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>

            {/* PAGINATION */}
            {!loading && (
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
            )}
          </div>
        </main >
      </div >

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div >
  );
};

export default contentManagementPage;
