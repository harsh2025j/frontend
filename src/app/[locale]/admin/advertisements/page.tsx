"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Search,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { advertisementApi } from "@/data/services/advertisement-service/advertisement-service";
import { Advertisement, AD_SLOTS } from "@/data/features/advertisement/advertisement.types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const SLOT_TYPE_STYLES: Record<string, string> = {
  BANNER: "bg-amber-50 text-amber-700 border border-amber-200",
  SIDEBAR: "bg-violet-50 text-violet-700 border border-violet-200",
  POPUP: "bg-rose-50 text-rose-700 border border-rose-200",
};

export default function AdvertisementManagement() {
  const router = useRouter();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adIdToDelete, setAdIdToDelete] = useState<string | null>(null);

  const fetchAds = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await advertisementApi.fetchAdvertisements();
      setAds(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch advertisements");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(true);
  }, []);

  const handleDelete = async () => {
    if (!adIdToDelete) return;
    try {
      await advertisementApi.deleteAdvertisement(adIdToDelete);
      toast.success("Template data removed");
      fetchAds(false);
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
      fetchAds(false);
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const filteredSlots = AD_SLOTS.filter(slot =>
    slot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Advertisements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage ad slots, track performance, and update content</p>
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search slots..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 gap-3">
          <Loader2 className="animate-spin text-blue-600" size={22} />
          <span className="text-sm text-gray-500">Loading slots...</span>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          No slots match <span className="font-medium">"{searchTerm}"</span>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Slot</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Current Ad</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Performance</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSlots.map((slot) => {
                const ad = ads.find(a => a.slotId === slot.id);
                const typeStyle = SLOT_TYPE_STYLES[slot.type] || "bg-gray-100 text-gray-500 border border-gray-200";

                return (
                  <tr
                    key={slot.id}
                    onClick={() => ad ? router.push(`/admin/advertisements/show/${ad._id}`) : router.push(`/admin/advertisements/show/slot/${slot.id}`)}
                    className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{slot.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeStyle}`}>
                            {slot.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <code className="font-mono">{slot.id}</code>
                          <span>·</span>
                          <span>{slot.dimensions}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {ad ? (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{ad.title}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[180px]">{ad.link}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Empty</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {ad ? (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${ad.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ad.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                          {ad.isActive ? "Active" : "Hidden"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {ad ? (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye size={13} className="text-gray-400" />
                            {ad.totalImpressions.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointerClick size={13} className="text-gray-400" />
                            {ad.totalClicks.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {ad ? (
                          <>
                            <button
                              onClick={(e) => handleToggleStatus(e, ad._id)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                              title={ad.isActive ? "Hide ad" : "Show ad"}
                            >
                              {ad.isActive
                                ? <ToggleRight size={20} className="text-green-500" />
                                : <ToggleLeft size={20} />
                              }
                            </button>
                            <button
                              onClick={(e) => openDeleteModal(e, ad._id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/advertisements/show/slot/${slot.id}`);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <Plus size={13} />
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

