"use client";
import React from "react";

interface NewsItem {
  id: number;
  title: string;
  category: string;
  owner: string;
  status: string;
}

const NewsManagementPage: React.FC = () => {
  const newsList: NewsItem[] = [
    {
      id: 1,
      title: "Israeli ministers to discuss Gaza plan that would bring ceasefire and hostage release",
      category: "Judgment",
      owner: "Neha",
      status: "Published",
    },
    {
      id: 2,
      title: "Israeli ministers to discuss Gaza plan that would bring ceasefire and hostage release",
      category: "Judgment",
      owner: "Neha",
      status: "Published",
    },
    {
      id: 3,
      title: "Israeli ministers to discuss Gaza plan that would bring ceasefire and hostage release",
      category: "Judgment",
      owner: "Neha",
      status: "Published",
    },
    {
      id: 4,
      title: "Israeli ministers to discuss Gaza plan that would bring ceasefire and hostage release",
      category: "Judgment",
      owner: "Neha",
      status: "Published",
    },
    {
      id: 5,
      title: "Israeli ministers to discuss Gaza plan that would bring ceasefire and hostage release",
      category: "Judgment",
      owner: "Neha",
      status: "Published",
    },
    {
      id: 6,
      title: "Israeli ministers to discuss Gaza plan that would bring ceasefire and hostage release",
      category: "Judgment",
      owner: "Neha",
      status: "Published",
    },
  ];

  return (
    <div >
      <h1 className="text-xl  font-poppins text-black font-medium">News Management</h1>

    <div className="flex min-h-screen bg-gray-50 text-gray-800">
   
      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-semibold mb-6"></h1>

          {/* Summary Row */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex bg-gray rounded-xl px-6 py-3 flex-wrap items-center gap-6 text-sm md:text-base">
              <span>
                <strong>Total News Post:</strong> 12,450
              </span>
              <span>
                <strong>Pending News Request:</strong> 12
              </span>
            </div>
            <button className="bg-yellow-400 text-white px-5 py-2 rounded-md font-medium hover:bg-yellow-500">
              ⬇ Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto  rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 ">
                <tr>
                  <th className="py-3 px-4  text-sm font-medium">#</th>
                  <th className="py-3 px-4  text-sm font-medium">Title</th>
                  <th className="py-3 px-4  text-sm font-medium">Category</th>
                  <th className="py-3 px-4  text-sm font-medium">Owner</th>
                  <th className="py-3 px-4  text-sm font-medium">Status</th>
                  <th className="py-3 px-4 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {newsList.map((item) => (
                  <tr
                    key={item.id}
                    className=" border-b-1 border-bordercolor hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4  text-sm">{item.id}</td>
                    <td className="py-3 px-4  text-sm leading-snug">
                      {item.title}
                    </td>
                    <td className="py-3 px-4  text-sm">{item.category}</td>
                    <td className="py-3 px-4  text-sm">{item.owner}</td>
                    <td className="py-3 px-4 ">
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
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

          {/* Pagination */}
          <div className="flex justify-center items-center mt-4 space-x-2 text-gray-600 text-sm">
            <button className="px-2 py-1 hover:text-[#0B2149]">&lt;</button>
            <span className="px-3 py-1 border rounded-md bg-gray-100">1</span>
            <button className="px-2 py-1 hover:text-[#0B2149]">&gt;</button>
          </div>
        </div>
      </main>
    </div>
    </div>
  );
};

export default NewsManagementPage;
