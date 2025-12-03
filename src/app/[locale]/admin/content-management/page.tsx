"use client";
import React, { useEffect, useState } from "react";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import toast from "react-hot-toast";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import logo from "../../../../public/logo.png";
import imgs from "../../../assets/img1.png"
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import Loader from "@/components/ui/Loader";

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

const contentManagementPage: React.FC = () => {
  const { articles, loading, error } = useArticleListActions();
  const [currentPage, setCurrentPage] = useState(1);

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
      const hasAccess = user.roles.some((r) => r.name !== "user");
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

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const { articleApi } = await import('@/data/services/article-service/article-service');
      await articleApi.deleteArticle(articleId);
      toast.success('Article deleted successfully');
      // Refresh list
      router.refresh(); // or refetch if using hook
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete article');
    }
  };

  const handleEdit = (articleId: string) => {
    // Navigate to edit page (assuming route exists)
    router.push(`/admin/create-content/${articleId}`);
  };

  // Table header addition
  // Insert after Status column
  // (Will be placed in JSX below)

  const startIndex = (currentPage - 1) * ITEM_PER_PAGE;

  const paginatedArticles = loading
    ? []
    : articles.slice(startIndex, startIndex + ITEM_PER_PAGE);

  const totalPages = loading ? 0 : Math.ceil(articles.length / ITEM_PER_PAGE);
  const totalNewsPost = articles.length;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Table header addition: add Rejection Reason column after Status
  // We'll modify the JSX later where the header rows are defined.

  const pendingNewsRequest = articles.filter((a: Article) => a.status === 'pending').length;

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
      <h1 className="text-xl font-poppins text-black font-medium">
        Content Management
      </h1>

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

              {/* <button className="bg-yellow-400 text-white px-5 py-2 rounded-md font-medium hover:bg-yellow-500">
                ⬇ Export CSV
              </button> */}
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
                {loading ? (
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

                        <td className="py-3 px-4 max-w-[150px] truncate">
                          {item.rejectionReason || "N/A"}
                        </td>

                        <td className="py-3 px-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="bg-yellow-500 text-white px-4 py-1 rounded-md text-sm hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 text-white px-4 py-1 rounded-md text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
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
        </main>
      </div>
    </div>
  );
};

export default contentManagementPage;
