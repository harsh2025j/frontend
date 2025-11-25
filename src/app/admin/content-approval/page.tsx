"use client";
import React, { useEffect, useState } from "react";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { Article } from "@/data/features/article/article.types";
import toast from "react-hot-toast";

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

const ContentApprovalPanel = () => {

  const { articles, loading, error } = useArticleListActions();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const pendingArticles = articles.filter(
    (a: Article) => a.status === "pending"
  );

  // Pagination logic
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedArticles = articles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                    <td className="px-4 py-3">{item.title}</td>
                    <td className="px-4 py-3">{item.category?.name || "No Category"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                          ${
                            item.status === "published"
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
                    <td className="px-4 py-3 flex gap-3">
                      <button className="bg-green-500 text-white px-4 py-1 rounded-md text-sm hover:bg-green-600">
                        Approve
                      </button>
                      <button className="bg-yellow-500 text-white px-4 py-1 rounded-md text-sm hover:bg-yellow-600">
                        Review
                      </button>
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
            className={`px-3 py-1 rounded ${
              currentPage === 1 ? "text-gray-400" : "hover:text-[#0B2149]"
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
                className={`px-3 py-1 border rounded-md ${
                  currentPage === page
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
            className={`px-3 py-1 rounded ${
              currentPage === totalPages ? "text-gray-400" : "hover:text-[#0B2149]"
            }`}
          >
            &gt;
          </button>

        </div>

      </div>
    </div>
  );
};

export default ContentApprovalPanel;
