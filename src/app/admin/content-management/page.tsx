"use client";
import React, { useEffect, useState } from "react";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import toast from "react-hot-toast";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import logo from "../../../../public/logo.png";


const ITEM_PER_PAGE = 15;
const contentManagementPage: React.FC = () => {
  const { articles, loading, error } = useArticleListActions();
  const [currentPage, setCurrentPage] = useState(1);

  // console.log(articles);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const totalPages = Math.ceil(articles.length / ITEM_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEM_PER_PAGE;
  const paginatedArticles = articles.slice(startIndex, startIndex + ITEM_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totalNewsPost = articles.length;
  const pendingNewsRequest = articles.filter((a: Article) => a.status === 'pending').length;

  // const totalNewsPost = contentData.length;
  // const pendingNewsRequest = contentData.filter((a) => a.status === 'Pending').length;

  return (
    <div >
      <h1 className="text-xl  font-poppins text-black font-medium">Content Management</h1>

      <div className="flex min-h-screen bg-gray-50 text-gray-800">


        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8">
            <h1 className="text-2xl font-semibold mb-6"></h1>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex bg-gray rounded-xl px-6 py-3 flex-wrap items-center gap-6 text-sm md:text-base">
                <span>
                  <strong>Total News Post:</strong> {totalNewsPost}
                </span>
                <span>
                  <strong>Pending News Request:</strong> {pendingNewsRequest}
                </span>
              </div>
              <button className="bg-yellow-400 text-white px-5 py-2 rounded-md font-medium hover:bg-yellow-500">
                ⬇ Export CSV
              </button>
            </div>

            {loading && <p className="text-center text-gray-600">Loading articles...</p>}

            {/* Table */}
            {!loading && (
              <div className="overflow-x-auto  rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-700 ">
                    <tr>
                      <th className="py-3 px-4  text-sm font-medium">#</th>
                      <th className="py-3 px-4  text-sm font-medium">Image</th>
                      <th className="py-3 px-4  text-sm font-medium">Title</th>
                      <th className="py-3 px-4  text-sm font-medium">Category</th>
                      <th className="py-3 px-4  text-sm font-medium">Authors</th>
                      <th className="py-3 px-4  text-sm font-medium">Status</th>
                      <th className="py-3 px-4 text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedArticles.map((item: Article, index: any) => (
                      <tr
                        key={item.id}
                        className=" border-b-1 border-bordercolor hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4  text-sm">{startIndex + index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden">
                            <Image
                              src={(item.thumbnail && (item.thumbnail.startsWith('http') || item.thumbnail.startsWith('/'))) ? item.thumbnail : logo}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4  text-sm leading-snug truncate max-w-[200px]">
                          {item.title}
                        </td>
                        <td className="py-3 px-4  text-sm">{item.category?.name || "No Category"}</td>
                        <td className="py-3 px-4  text-sm">{item.authors}</td>
                        <td className="py-3 px-4 ">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${item.status === 'published' ? 'bg-green-100 text-green-700' :
                            item.status === 'draft' ? "bg-white text-yellow-300" :
                              item.status === "rejected" ? "bg-amber-100 text-red-600" :
                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                            }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <button className="bg-yellow-500 text-white px-4 py-1 rounded-md text-sm hover:bg-yellow-600">
                            Edit
                          </button>
                          <button className="bg-red-500 text-white px-4 py-1 rounded-md text-sm hover:bg-red-600">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION */}
            <div className="flex justify-center items-center mt-5 text-gray-600 text-sm gap-2">

              {/* Previous */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? "text-gray-400" : "hover:text-[#0B2149]"
                  }`}
              >
                &lt;
              </button>

              {/* Page numbers */}
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

              {/* Next */}
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
        </main>
      </div>
    </div>
  );
};

export default contentManagementPage;