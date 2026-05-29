"use client";

import React, { useEffect, useState } from "react";
import { payoutsService } from "@/data/services/payouts-service/payoutsService";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Edit2, Eye, Wallet } from "lucide-react";
import Pagination from "@/components/Pagination";

export default function PayoutsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [newRate, setNewRate] = useState<number | "">(0);
  const [showConfirm, setShowConfirm] = useState(false);

  // Pagination states
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  
  const [currentPage, setCurrentPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [itemsPerPage, setItemsPerPage] = useState(limitParam ? parseInt(limitParam) : 12);
  const [totalPages, setTotalPages] = useState(1);

  // Sync state with URL params if they change externally (e.g. browser back button)
  useEffect(() => {
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    if (page) setCurrentPage(parseInt(page));
    if (limit) setItemsPerPage(parseInt(limit));
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", limit.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchSettings = async () => {
    try {
      const res = await payoutsService.getCommissionRate();
      const rate = res.data?.data?.commissionRate ?? res.data?.commissionRate ?? 0;
      setCommissionRate(rate);
      setNewRate(rate);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdvocates = async () => {
    setIsLoading(true);
    try {
      const res = await payoutsService.getAdvocatesList(currentPage, itemsPerPage);
      const payload = res.data?.data || res.data;
      const list = Array.isArray(payload?.data) ? payload.data : payload;
      setAdvocates(Array.isArray(list) ? list : []);
      if (payload?.totalPages) {
        setTotalPages(payload.totalPages);
      }
    } catch (err) {
      toast.error("Failed to load payouts data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchAdvocates();
  }, [currentPage, itemsPerPage]);

  const handleUpdateClick = () => {
    const rate = Number(newRate);
    if (newRate === "" || isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Commission rate must be between 0 and 100");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await payoutsService.updateCommissionRate(Number(newRate));
      toast.success("Commission rate updated successfully");
      setCommissionRate(Number(newRate));
      setIsEditingCommission(false);
      setShowConfirm(false);
    } catch (err) {
      toast.error("Failed to update commission rate");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-blue-600" />
            Payouts & Settlements
          </h1>
          <p className="text-gray-500 mt-1">Manage global commission and track advocate earnings.</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
          <div>
            <p className="text-sm text-blue-600 font-medium">Platform Commission</p>
            {isEditingCommission ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-20 px-2 py-1 rounded border border-blue-200 text-blue-900"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <span className="text-blue-900 font-bold">%</span>
                <button
                  onClick={handleUpdateClick}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingCommission(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-blue-900">{commissionRate}%</span>
                <button
                  onClick={() => setIsEditingCommission(true)}
                  className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Advocate</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Total Revenue</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Commission Deducted</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Net Payable</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Paid by Admin</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Current Balance</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : advocates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No paid appointments found.</td>
                </tr>
              ) : (
                advocates.map((adv) => (
                  <tr key={adv.advocateId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{adv.advocateName}</td>
                    <td className="p-4 text-gray-600">₹{adv.totalRevenue?.toLocaleString()}</td>
                    <td className="p-4 text-red-500">-₹{adv.totalCommission?.toLocaleString()}</td>
                    <td className="p-4 font-semibold text-gray-900">₹{adv.totalNetPayable?.toLocaleString()}</td>
                    <td className="p-4 text-green-600 font-medium">₹{adv.totalPaidByAdmin?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${adv.currentBalance > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                        ₹{adv.currentBalance?.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/payouts/${adv.advocateId}`)}
                        className="inline-flex items-center gap-1 bg-white border border-gray-200 shadow-sm text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Eye size={16} /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && advocates.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md text-sm px-2 py-1 outline-none focus:border-blue-500 bg-white"
              >
                <option value={10}>10</option>
                <option value={12}>12</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>

            <div className="flex-grow flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
            
            <div className="w-32"></div> {/* Spacer to keep pagination centered if needed */}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Update</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to update the platform commission rate to {newRate}% for appointments?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
