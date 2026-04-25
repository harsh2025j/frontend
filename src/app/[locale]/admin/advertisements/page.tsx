"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Search,
  Filter,
  Eye,
  MousePointerClick,
  Monitor
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { advertisementApi } from "@/data/services/advertisement-service/advertisement-service";
import { Advertisement, AD_SLOTS } from "@/data/features/advertisement/advertisement.types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function AdvertisementManagement() {
  const router = useRouter();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adIdToDelete, setAdIdToDelete] = useState<string | null>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await advertisementApi.fetchAdvertisements();
      setAds(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async () => {
    if (!adIdToDelete) return;
    try {
      await advertisementApi.deleteAdvertisement(adIdToDelete);
      toast.success("Template data removed");
      fetchAds();
    } catch (error) {
      toast.error("Failed to remove template data");
    } finally {
      setAdIdToDelete(null);
    }
  };

  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAdIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await advertisementApi.toggleAdvertisementStatus(id);
      toast.success("Visibility updated");
      fetchAds();
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const filteredSlots = AD_SLOTS.filter(slot =>
    slot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisement Management</h1>
          <p className="text-gray-500 text-sm">Manage slots, track performance, and update content</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search slots..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-96 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-500 font-medium animate-pulse">Loading templates...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Slot Info</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Current Ad</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSlots.map((slot) => {
                const ad = ads.find(a => a.slotId === slot.id);

                return (
                  <tr
                    key={slot.id}
                    onClick={() => ad ? router.push(`/admin/advertisements/show/${ad._id}`) : router.push(`/admin/advertisements/show/slot/${slot.id}`)}
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{slot.id}</span>
                        <span className="font-bold text-gray-900 text-sm">{slot.name}</span>
                        <span className="text-[11px] text-gray-400">{slot.dimensions} • {slot.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ad ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col max-w-[200px]">
                            <span className="font-semibold text-gray-800 text-sm truncate">{ad.title}</span>
                            <span className="text-[11px] text-gray-500 truncate">{ad.link}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Empty Slot</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {ad ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${ad.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                          {ad.isActive ? "Active" : "Hidden"}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-400">
                          Not Set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {ad ? (
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1.5" title="Impressions">
                            <Eye size={14} className="text-gray-400" />
                            <span className="text-xs font-medium">{ad.totalImpressions.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5" title="Clicks">
                            <MousePointerClick size={14} className="text-gray-400" />
                            <span className="text-xs font-medium">{ad.totalClicks.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                        {ad ? (
                          <>
                            <button
                              onClick={(e) => handleToggleStatus(e, ad._id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title={ad.isActive ? "Hide Ad" : "Show Ad"}
                            >
                              {ad.isActive ? <ToggleRight size={25} className="text-green-500" /> : <ToggleLeft size={20} />}
                            </button>
                            {/* <Link
                              href={`/admin/advertisements/edit/${ad._id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit size={18} />
                            </Link> */}
                            <button
                              onClick={(e) => openDeleteModal(e, ad._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/advertisements/show/slot/${slot.id}`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Plus size={14} />
                            Configure
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredSlots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Monitor size={48} className="mb-4 opacity-20" />
          <p>No advertisement slots found matching your search.</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAdIdToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Erase Slot Data"
        message="Are you sure you want to erase all data from this slot? This will move the current stats to history and clear the slot."
        confirmText="Erase Data"
        variant="danger"
      />
    </div>
  );
}
