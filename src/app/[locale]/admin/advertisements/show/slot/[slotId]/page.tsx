"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { advertisementApi } from "@/data/services/advertisement-service/advertisement-service";
import {
  Loader2,
  History,
  ArrowLeft,
  Clock,
  Monitor,
  Plus,
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
  const limit = 12;
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
  }, [slotId, page]);

  if (loading && totalHistory === 0) return (
    <div className="flex items-center justify-center h-[60vh] gap-3">
      <Loader2 className="animate-spin text-blue-600" size={22} />
      <span className="text-sm text-gray-500">Loading slot history...</span>
    </div>
  );

  const selectedSlot = AD_SLOTS.find(s => s.id === slotId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20 space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white px-5 py-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/advertisements")}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <code className="text-xs text-gray-400 font-mono">{slotId}</code>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                Empty
              </span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{selectedSlot?.name || "Advertisement Slot"}</h1>
          </div>
        </div>

        <button
          onClick={() => router.push(`/admin/advertisements/create?slotId=${slotId}`)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Configure New Ad
        </button>
      </div>

      {/* Empty Slot Preview */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Monitor size={17} className="text-blue-600" />
            Slot Preview
          </div>
          <span className="text-xs text-gray-400">
            {selectedSlot?.name} · {selectedSlot?.dimensions}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-16 border border-dashed border-gray-200">
          <p className="text-sm font-medium text-gray-500">No active advertisement</p>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs text-center leading-relaxed">
            This slot is empty. Click "Configure New Ad" to publish content and start tracking performance.
          </p>
        </div>
      </section>

      {/* Slot History */}
      <section className="space-y-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <History size={17} className="text-gray-400" />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Slot Performance History</h2>
            <p className="text-xs text-gray-400">{totalHistory} previous campaigns in this placement</p>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((log) => (
              <div key={log._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{log.title}</h4>
                  <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                    <Clock size={11} />
                    {format(new Date(log.archivedAt), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex gap-3 mb-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
                    <img src={log.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {log.description || <span className="italic">No description</span>}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Views</div>
                    <div className="text-sm font-semibold text-gray-900">{log.totalImpressions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Clicks</div>
                    <div className="text-sm font-semibold text-gray-900">{log.totalClicks.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">CTR</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {log.totalImpressions > 0
                        ? ((log.totalClicks / log.totalImpressions) * 100).toFixed(2)
                        : "0.00"}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm font-medium text-gray-500">No history yet</p>
            <p className="text-xs text-gray-400 mt-1">Snapshots are created when you erase slot data to start a new campaign.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pt-4 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </section>
    </div>
  );
}
