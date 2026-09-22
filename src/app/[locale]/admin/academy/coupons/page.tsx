"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Filter, Edit2, Trash2, Tag, Calendar, Check, Copy, AlertCircle, X, Loader2, BookOpen, Users } from "lucide-react";
import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import toast from "react-hot-toast";

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  validFrom: string;
  validUntil?: string | null;
  applicableCourseIds?: string[] | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  createdAt: string;
}

interface CourseOption {
  id: string;
  title: string;
  price: number;
}

export default function AcademyCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);

  // Available courses for course-specific restriction
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderAmount: "",
    maxUses: "",
    maxUsesPerUser: "1",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: "",
    courseScope: "all" as "all" | "specific",
    applicableCourseIds: [] as string[],
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  };

  const [form, setForm] = useState(initialFormState);

  // Fetch Coupons
  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get(API_ENDPOINTS.ACADEMY.COUPONS.BASE, {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });

      const result = res.data || res;
      setCoupons(result.data || []);
      setTotalPages(result.totalPages || 1);
      setTotalCoupons(result.total || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  // Fetch Courses list once for course scoping
  useEffect(() => {
    const fetchCoursesList = async () => {
      try {
        const res: any = await apiClient.get(API_ENDPOINTS.ACADEMY.COURSES);
        const data = res.data || res;
        if (Array.isArray(data)) {
          setCourses(data.map((c: any) => ({ id: c.id, title: c.title, price: c.price })));
        }
      } catch {
        // Non-critical, ignore
      }
    };
    fetchCoursesList();
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setForm(initialFormState);
    setIsCreateOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : "",
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      maxUses: coupon.maxUses ? String(coupon.maxUses) : "",
      maxUsesPerUser: String(coupon.maxUsesPerUser || 1),
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split("T")[0] : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split("T")[0] : "",
      courseScope: coupon.applicableCourseIds && coupon.applicableCourseIds.length > 0 ? "specific" : "all",
      applicableCourseIds: coupon.applicableCourseIds || [],
      status: coupon.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
    });
    setIsEditOpen(true);
  };

  const handleCourseSelectionToggle = (courseId: string) => {
    setForm((prev) => {
      const exists = prev.applicableCourseIds.includes(courseId);
      const updated = exists
        ? prev.applicableCourseIds.filter((id) => id !== courseId)
        : [...prev.applicableCourseIds, courseId];
      return { ...prev, applicableCourseIds: updated };
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    const val = Number(form.discountValue);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid discount amount");
      return;
    }
    if (form.discountType === "PERCENTAGE" && (val <= 0 || val > 100)) {
      toast.error("Percentage discount must be between 1 and 100%");
      return;
    }
    if (form.courseScope === "specific" && form.applicableCourseIds.length === 0) {
      toast.error("Please select at least one course for course-specific discount");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        code: form.code.trim().toUpperCase(),
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: val,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : 1,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
        applicableCourseIds: form.courseScope === "specific" ? form.applicableCourseIds : undefined,
        status: form.status,
      };

      if (isEditOpen && editingCoupon) {
        await apiClient.patch(`${API_ENDPOINTS.ACADEMY.COUPONS.BASE}/${editingCoupon.id}`, payload);
        toast.success("Coupon updated successfully!");
        setIsEditOpen(false);
      } else {
        await apiClient.post(API_ENDPOINTS.ACADEMY.COUPONS.BASE, payload);
        toast.success("Coupon created successfully!");
        setIsCreateOpen(false);
      }

      fetchCoupons();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`${API_ENDPOINTS.ACADEMY.COUPONS.BASE}/${couponToDelete.id}`);
      toast.success(`Coupon "${couponToDelete.code}" deleted successfully.`);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Coupons & Course Discounts</h1>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              {totalCoupons} Total
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Create promotional codes, Diwali/Festival offers, early bird limits (e.g. first 10 students), and course-specific discounts.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by code or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto items-center">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
              <Filter size={16} className="text-gray-400" />
              <select
                className="text-sm bg-transparent focus:outline-none text-gray-700 font-medium"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm text-gray-500">Loading coupon discounts...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Tag size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No coupons found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Create your first promotional discount coupon or limited-seat offer to boost academy enrollments.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              <Plus size={16} /> Create Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Applicable To</th>
                  <th className="p-4">Usage (Used / Limit)</th>
                  <th className="p-4">Validity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const isLimitReached = coupon.maxUses != null && coupon.usedCount >= coupon.maxUses;
                  const usagePct = coupon.maxUses ? Math.min(100, Math.round((coupon.usedCount / coupon.maxUses) * 100)) : 0;
                  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();

                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/60 transition">
                      {/* Code */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 text-sm">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded transition"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{coupon.description}</p>
                        )}
                      </td>

                      {/* Discount */}
                      <td className="p-4">
                        <p className="text-sm font-bold text-emerald-600">
                          {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} Flat OFF`}
                        </p>
                        {coupon.maxDiscountAmount && coupon.discountType === "PERCENTAGE" && (
                          <p className="text-[11px] text-gray-400">Up to ₹{coupon.maxDiscountAmount}</p>
                        )}
                        {coupon.minOrderAmount && (
                          <p className="text-[11px] text-gray-400">Min. order ₹{coupon.minOrderAmount}</p>
                        )}
                      </td>

                      {/* Applicable Courses */}
                      <td className="p-4">
                        {coupon.applicableCourseIds && coupon.applicableCourseIds.length > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <BookOpen size={12} /> {coupon.applicableCourseIds.length} Course{coupon.applicableCourseIds.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            All Courses
                          </span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="p-4">
                        <p className="text-sm text-gray-900 font-semibold">
                          {coupon.usedCount}{" "}
                          <span className="text-gray-400 font-normal">
                            / {coupon.maxUses ? coupon.maxUses : "Unlimited"}
                          </span>
                        </p>
                        {coupon.maxUses ? (
                          <div className="w-full max-w-[110px] h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full ${isLimitReached ? "bg-red-500" : "bg-blue-600"}`}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        ) : null}
                      </td>

                      {/* Validity */}
                      <td className="p-4 text-xs text-gray-600">
                        {coupon.validUntil ? (
                          <div>
                            <p className="font-medium text-gray-800">
                              Until {new Date(coupon.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              From {new Date(coupon.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500">Never expires</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isLimitReached ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                            Limit Reached
                          </span>
                        ) : isExpired || coupon.status === "EXPIRED" ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                            Expired
                          </span>
                        ) : coupon.status === "ACTIVE" ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Coupon"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setCouponToDelete(coupon)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Coupon"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 font-medium"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Tag size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {isEditOpen ? `Edit Coupon: ${editingCoupon?.code}` : "Create Promotional Coupon"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isEditOpen ? "Update discount parameters and limits" : "Define coupon code, discount percentage, limits and course restrictions"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIWALI20"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono font-bold uppercase focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description / Campaign</label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali Festival Early Bird Offer"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%) Off</option>
                    <option value="FIXED">Flat (₹) Amount Off</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {form.discountType === "PERCENTAGE" ? "Discount Percentage (%) *" : "Flat Discount (₹) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                    placeholder={form.discountType === "PERCENTAGE" ? "20" : "500"}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Max Discount Cap (for percentage) */}
                {form.discountType === "PERCENTAGE" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Max Discount Cap (₹) <span className="font-normal text-gray-400">(Optional)</span></label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 1000 (Max ₹1000 off)"
                      value={form.maxDiscountAmount}
                      onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Min Course Fee */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Minimum Course Fee (₹) <span className="font-normal text-gray-400">(Optional)</span></label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 999"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Total Redemptions Limit (e.g. 10 people) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Max Total Redemptions <span className="font-normal text-gray-400">(e.g. First 10 students)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Leave blank for unlimited"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Max Uses Per User */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Uses Per User *</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxUsesPerUser}
                    onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Valid From */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Valid From Date</label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Valid Until Date <span className="font-normal text-gray-400">(Expiry)</span></label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Course Restriction (PhysicsWallah style) */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-2">Course Applicability</label>
                <div className="flex gap-6 mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="courseScope"
                      checked={form.courseScope === "all"}
                      onChange={() => setForm({ ...form, courseScope: "all" })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    All Courses (Global Promo)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="courseScope"
                      checked={form.courseScope === "specific"}
                      onChange={() => setForm({ ...form, courseScope: "specific" })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Specific Courses Only
                  </label>
                </div>

                {form.courseScope === "specific" && (
                  <div className="border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50/50">
                    <p className="text-xs text-gray-500 font-semibold mb-2">Select courses that qualify for this discount:</p>
                    {courses.map((course) => {
                      const isSelected = form.applicableCourseIds.includes(course.id);
                      return (
                        <label
                          key={course.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border text-xs ${isSelected ? "bg-blue-50/80 border-blue-200 text-blue-900 font-medium" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCourseSelectionToggle(course.id)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300"
                            />
                            <span>{course.title}</span>
                          </div>
                          <span className="font-semibold text-gray-500">₹{course.price}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Coupon Active Status</p>
                  <p className="text-xs text-gray-500">Temporarily disable without deleting</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${form.status === "ACTIVE" ? "bg-blue-600 justify-end" : "bg-gray-300 justify-start"
                    }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {isEditOpen ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {couponToDelete && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Delete Coupon?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete coupon <span className="font-mono font-bold text-gray-900">{couponToDelete.code}</span>? Students will no longer be able to apply this discount.
            </p>
            <div className="flex justify-end gap-3">
              <button
                disabled={submitting}
                onClick={() => setCouponToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleDeleteCoupon}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />} Delete Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
