import React from "react";
import { contentData } from "@/lib/dummy";
// const data = [
//   {
//     title: "Bombay HC on Insolency",
//     category: "Criminal Law",
//     status: "Pending",
//   },
//   {
//     title: "Global Markets Weekly",
//     category: "Finance",
//     status: "Pending",
//   },
//   {
//     title: "Sport Law doping case",
//     category: "Legal Article",
//     status: "Pending",
//   },
// ];

export default function ContentApprovalPanel() {
  return (
    <div className="bg-white rounded-2xl  border border-gray-100 p-6 mt-6">
      <h2 className="font-semibold mb-4 text-gray-900">Content Approval Panel</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left pb-2 font-normal">Article/Content Title</th>
            <th className="text-left pb-2 font-normal">Category</th>
            <th className="text-left pb-2 font-normal">Current Status</th>
            <th className="text-left pb-2 font-normal">Current Status</th>
            <th className="text-left pb-2 font-normal">Action</th>
          </tr>
        </thead>
        <tbody>
          {contentData.map(({ title, category, status }, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="py-3">{title}</td>
              <td className="py-3">{category}</td>
              <td className="py-3">{status}</td>
              <td className="py-3">
                <button className="bg-yellow-700 text-white rounded-full px-4 py-1 mr-2 font-medium hover:bg-yellow-800 transition">
                  Approve
                </button>
                <button className="bg-yellow-700 text-white rounded-full px-4 py-1 font-medium hover:bg-yellow-800 transition">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
