"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { advertisementApi } from "@/data/services/advertisement-service/advertisement-service";
import {
  Loader2,
  BarChart3,
  Eye,
  MousePointerClick,
  History,
  ArrowLeft,
  Clock,
  TrendingUp,
  Monitor,
  Plus
} from "lucide-react";
import { AD_SLOTS } from "@/data/features/advertisement/advertisement.types";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Pagination from "@/components/Pagination";

export default function ShowSlotHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const slotId = params?.slotId as string;

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHistory, setTotalHistory] = useState(0);

  const fetchData = async () => {
    if (slotId) {
      try {
        const historyRes = await advertisementApi.fetchSlotHistory(slotId, page, limit);
        setHistory(historyRes.data.data || []);
        setTotalPages(historyRes.data.meta.lastPage);
        setTotalHistory(historyRes.data.meta.total);
      } catch (err) {
        console.error("Failed to load slot history", err);
        toast.error("Failed to load slot performance history");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [slotId, page, limit]);

  if (loading && totalHistory === 0) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-500 font-medium animate-pulse">Fetching slot history...</p>
    </div>
  );

  const selectedSlot = AD_SLOTS.find(s => s.id === slotId);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/advertisements")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{slotId}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-400">
                Empty Slot
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{selectedSlot?.name || "Advertisement Slot"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => router.push(`/admin/advertisements/create?slotId=${slotId}`)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus size={18} />
            Configure New Ad
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          {/* Stats Bar (Blank for empty slot) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center px-4 py-6 bg-white rounded-2xl border border-gray-100 shadow-sm opacity-50">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Eye size={20} />
                <span className="text-[12px] font-bold uppercase tracking-wider">Impressions</span>
              </div>
              <span className="text-3xl font-black text-blue-900">0</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-6 bg-white rounded-2xl border border-gray-100 shadow-sm opacity-50">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <MousePointerClick size={20} />
                <span className="text-[12px] font-bold uppercase tracking-wider">Clicks</span>
              </div>
              <span className="text-3xl font-black text-orange-900">0</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-6 bg-white rounded-2xl border border-gray-100 shadow-sm opacity-50">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <TrendingUp size={20} />
                <span className="text-[12px] font-bold uppercase tracking-wider">CTR</span>
              </div>
              <span className="text-3xl font-black text-purple-900">0.00%</span>
            </div>
          </div>

          {/* Empty Preview */}
          <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <Monitor size={22} className="text-blue-600" />
                <h2 className="text-lg">Slot Preview</h2>
              </div>
              <div className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {selectedSlot?.name} ({selectedSlot?.dimensions})
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-50 py-24 rounded-2xl border border-dashed border-gray-200">
              {/* <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Plus size={32} className="text-gray-300" />
              </div> */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Advertisement</h3>
              <p className="text-gray-500 text-sm max-w-xs text-center leading-relaxed">
                This slot is currently empty. Click "Configure New Ad" to upload content and start tracking performance.
              </p>
            </div>
          </section>

          {/* Slot History - Moved to bottom and paginated */}
          <section className="space-y-6 pt-8 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <History size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Slot Performance History</h2>
                  <p className="text-xs text-gray-500 font-medium">{totalHistory} previous campaigns recorded in this placement</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.length > 0 ? (
                history.map((log) => (
                  <div key={log._id} className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                        <Clock size={12} />
                        <span>{format(new Date(log.archivedAt), "MMM dd, yyyy")}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-6 pt-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 shadow-inner">
                        <img src={log.imageUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-md font-bold text-gray-900 truncate mb-1">{log.title}</h4>
                        <p className="text-[11px] text-gray-500 line-clamp-2 italic leading-relaxed">{log.description || "No description provided"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50/50 p-3 rounded-xl flex flex-col items-center group-hover:bg-blue-50 transition-colors">
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Total Views</span>
                        <span className="text-sm font-black text-blue-900">{log.totalImpressions.toLocaleString()}</span>
                      </div>
                      <div className="bg-orange-50/50 p-3 rounded-xl flex flex-col items-center group-hover:bg-orange-50 transition-colors">
                        <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1">Total Clicks</span>
                        <span className="text-sm font-black text-orange-900">{log.totalClicks.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="lg:col-span-3 bg-gray-50 rounded-3xl border border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <History size={40} className="text-gray-200" />
                  </div>
                  <h3 className="text-gray-900 font-bold mb-1">No Historical Data</h3>
                  <p className="text-gray-400 text-xs font-medium italic max-w-xs">
                    Performance snapshots are automatically created whenever you erase slot data to start a new campaign.
                  </p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pt-8 border-t border-gray-50">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
