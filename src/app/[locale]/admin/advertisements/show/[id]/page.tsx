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
  Calendar,
  Clock,
  TrendingUp,
  Monitor,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
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
  const [limit, setLimit] = useState(12);
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
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-500 font-medium animate-pulse">Fetching ad performance data...</p>
    </div>
  );

  if (!ad) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
      <p>Advertisement not found.</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go Back</button>
    </div>
  );

  const selectedSlot = AD_SLOTS.find(s => s.id === ad.slotId);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/advertisements")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{ad.slotId}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${ad.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {ad.isActive ? "Live" : "Draft"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{ad.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto ">
          <button
            onClick={handleToggleStatus}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${ad.isActive
              ? "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
              : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            title={ad.isActive ? "Hide Advertisement" : "Show Advertisement"}
          >
            {ad.isActive ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} />}
            {ad.isActive ? "Live" : "Hidden"}
          </button>
          <button
            onClick={() => router.push(`/admin/advertisements/edit/${ad._id}`)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm"
          >
            <Edit size={18} />
            Edit Ad Details
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all shadow-sm"
          >
            <Trash2 size={18} />
            Erase Slot Data
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

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center px-4 py-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Eye size={20} />
                <span className="text-[12px] font-bold uppercase tracking-wider">Impressions</span>
              </div>
              <span className="text-3xl font-black text-blue-900">{ad.totalImpressions.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <MousePointerClick size={20} />
                <span className="text-[12px] font-bold uppercase tracking-wider">Clicks</span>
              </div>
              <span className="text-3xl font-black text-orange-900">{ad.totalClicks.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <TrendingUp size={20} />
                <span className="text-[12px] font-bold uppercase tracking-wider">CTR</span>
              </div>
              <span className="text-3xl font-black text-purple-900">
                {ad.totalImpressions > 0 ? ((ad.totalClicks / ad.totalImpressions) * 100).toFixed(2) : "0.00"}%
              </span>
            </div>
          </div>

          <div className="flex justify-end px-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
            >
              <Loader2 className={loading ? "animate-spin" : ""} size={12} />
              Refresh Real-time Stats
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Preview Section */}
            <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <Monitor size={22} className="text-blue-600" />
                  <h2 className="text-lg">Live Frontend Preview</h2>
                </div>
                <div className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                  Slot: {selectedSlot?.name} ({selectedSlot?.dimensions})
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                <div className="flex justify-center bg-white p-8 rounded-2xl border border-gray-100 shadow-xl overflow-hidden ring-1 ring-gray-100">
                  <BaseAd
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
              </div>
            </section>

            {/* Additional Info Section */}
            <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 text-gray-900 font-bold mb-8">
                <BarChart3 size={22} className="text-blue-600" />
                <h2 className="text-lg">Additional Information</h2>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target URL</span>
                  <a href={ad.link} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline truncate bg-blue-50 px-4 py-3 rounded-xl font-medium">
                    {ad.link}
                  </a>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description / Admin Notes</span>
                  <div className="text-sm text-gray-600 italic bg-gray-50 px-4 py-4 rounded-xl border border-gray-100 min-h-[100px]">
                    {ad.description || "No description provided for this advertisement."}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Performance History - Moved to bottom and paginated */}
          <section className="space-y-6 pt-8 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <History size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Performance History</h2>
                  <p className="text-xs text-gray-500 font-medium">{totalHistory} previous campaigns recorded in this slot</p>
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
