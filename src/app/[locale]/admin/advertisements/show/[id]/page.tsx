"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { advertisementApi } from "@/data/services/advertisement-service/advertisement-service";
import {
  Loader2,
  Eye,
  MousePointerClick,
  History,
  ArrowLeft,
  Clock,
  TrendingUp,
  Monitor,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { BaseAd } from "@/components/ads/StandardAds";
import { AD_SLOTS } from "@/data/features/advertisement/advertisement.types";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Pagination from "@/components/Pagination";

export default function ShowAdvertisementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ad, setAd] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [totalPages, setTotalPages] = useState(1);
  const [totalHistory, setTotalHistory] = useState(0);

  const fetchData = async () => {
    if (id) {
      try {
        const adRes = await advertisementApi.fetchAdvertisementById(id);
        const adData = adRes.data.data;
        setAd(adData);

        if (adData?.slotId) {
          const historyRes = await advertisementApi.fetchSlotHistory(adData.slotId, page, limit);
          setHistory(historyRes.data.data || []);
          setTotalPages(historyRes.data.meta.lastPage);
          setTotalHistory(historyRes.data.meta.total);
        }
      } catch (err) {
        console.error("Failed to load ad data", err);
        toast.error("Failed to load advertisement details");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, page, limit]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await advertisementApi.deleteAdvertisement(id);
      toast.success("Slot data erased successfully");
      router.push(`/admin/advertisements/show/slot/${ad.slotId}`);
    } catch (error) {
      toast.error("Failed to erase slot data");
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await advertisementApi.toggleAdvertisementStatus(id);
      toast.success("Visibility updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  if (loading && !ad) return (
    <div className="flex items-center justify-center h-[60vh] gap-3">
      <Loader2 className="animate-spin text-blue-600" size={22} />
      <span className="text-sm text-gray-500">Loading advertisement...</span>
    </div>
  );

  if (!ad) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-gray-500">
      <p className="text-sm">Advertisement not found.</p>
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">Go back</button>
    </div>
  );

  const selectedSlot = AD_SLOTS.find(s => s.id === ad.slotId);
  const ctr = ad.totalImpressions > 0
    ? ((ad.totalClicks / ad.totalImpressions) * 100).toFixed(2)
    : "0.00";

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
              <code className="text-xs text-gray-400 font-mono">{ad.slotId}</code>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                ad.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {ad.isActive ? "Live" : "Paused"}
              </span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{ad.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              ad.isActive
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {ad.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {ad.isActive ? "Live" : "Paused"}
          </button>
          <button
            onClick={() => router.push(`/admin/advertisements/edit/${ad._id}`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Erase
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Erase Slot Data"
        message="Are you sure you want to erase all data from this slot? This will move the current stats to history and clear the slot."
        confirmText="Erase Data"
        variant="danger"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Impressions", value: ad.totalImpressions.toLocaleString(), icon: Eye, color: "text-blue-600" },
          { label: "Clicks", value: ad.totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-orange-500" },
          { label: "CTR", value: `${ctr}%`, icon: TrendingUp, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <div className={`flex items-center gap-1.5 text-xs font-medium mb-2 ${color}`}>
              <Icon size={14} />
              {label}
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={12} />
          Refresh stats
        </button>
      </div>

      {/* Preview + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Monitor size={17} className="text-blue-600" />
              Live Preview
            </div>
            <span className="text-xs text-gray-400">
              {selectedSlot?.name} · {selectedSlot?.dimensions}
            </span>
          </div>
          <div className="flex justify-center bg-gray-50 rounded-lg p-6 border border-gray-100 overflow-hidden">
            <BaseAd
              slotId={ad.slotId}
              width="100%"
              height={
                ad.slotId === "HOME_FEED_1" ? "150px" :
                  selectedSlot?.type === "BANNER" || ad.slotId.includes("BANNER") || ad.slotId.includes("FOOTER") ? "90px" :
                    "250px"
              }
              label={ad.title}
              imageUrl={ad.imageUrl}
              className="w-full max-w-2xl"
            />
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-medium text-gray-900">Ad Details</h2>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-1.5">Target URL</div>
            <a
              href={ad.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {ad.link}
              <ExternalLink size={12} className="shrink-0" />
            </a>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-1.5">Description / Notes</div>
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100 min-h-[80px]">
              {ad.description
                ? ad.description
                : <span className="italic text-gray-400">No description provided.</span>
              }
            </div>
          </div>
        </section>
      </div>

      {/* History */}
      <section className="space-y-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <History size={17} className="text-gray-400" />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Performance History</h2>
            <p className="text-xs text-gray-400">{totalHistory} previous campaigns in this slot</p>
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
