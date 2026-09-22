"use client";

import React, { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search, Download, Filter, FileText, IndianRupee,
  CheckCircle2, Clock, XCircle, Tag, X, Sparkles,
  CalendarDays, CreditCard, BadgeCheck, Receipt,
  ChevronDown, Check,
} from "lucide-react";
import apiClient from "@/data/services/apiConfig/apiClient";
import { courseApi } from "@/data/services/academy-service/course.service";
import { usersApi } from "@/data/services/users-service/users-service";
import Pagination from "@/components/Pagination";

/* ─────────── Types ─────────── */
interface Payment {
  id: string;
  userId: string;
  referenceId: string;
  amount: number;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  couponCode?: string;
  discountAmount?: number;
  originalAmount?: number;
}

/* ─────────── Constants ─────────── */
const STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  paid:    { label: "Paid",    cls: "bg-green-100 text-green-700 border border-green-200", icon: <CheckCircle2 size={13} /> },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700 border border-amber-200", icon: <Clock size={13} /> },
  failed:  { label: "Failed",  cls: "bg-red-100 text-red-700 border border-red-200",       icon: <XCircle size={13} /> },
};

const PAGE_SIZE = 10;

/* ─────────── Skeleton Components ─────────── */
function SkeletonKpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-3/4" />
            <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonTableRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="p-4">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-40 mb-2" />
            <div className="h-2.5 bg-gray-200 rounded animate-pulse w-28" />
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-28" />
                <div className="h-2.5 bg-gray-200 rounded animate-pulse w-36" />
              </div>
            </div>
          </td>
          <td className="p-4">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-36 mb-1.5" />
            <div className="h-2.5 bg-gray-200 rounded animate-pulse w-24" />
          </td>
          <td className="p-4">
            <div className="bg-gray-100 rounded-lg p-2.5 space-y-2 w-44">
              <div className="h-2.5 bg-gray-200 rounded animate-pulse" />
              <div className="h-2.5 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mt-1" />
            </div>
          </td>
          <td className="p-4">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24 mb-1.5" />
            <div className="h-2.5 bg-gray-200 rounded animate-pulse w-16" />
          </td>
          <td className="p-4">
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
          </td>
          <td className="p-4 text-center">
            <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse mx-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

/* ─────────── Receipt Modal ─────────── */
interface ReceiptModalProps {
  txn: Payment | null;
  courseName: string;
  studentName: string;
  studentEmail: string;
  onClose: () => void;
}

function ReceiptModal({ txn, courseName, studentName, studentEmail, onClose }: ReceiptModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted || !txn) return null;

  const isPaid      = txn.status === "paid" || txn.status === "COMPLETED";
  const hasCoupon   = !!txn.couponCode;
  const hasDiscount = (txn.discountAmount ?? 0) > 0;
  const origAmt     = txn.originalAmount ?? txn.amount;

  const fmtDateTime = (d: string) => {
    try {
      return new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return d;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header Section (Navy Gradient) ── */}
        <div
          className="relative px-6 pt-5 pb-5 text-white"
          style={{ background: "linear-gradient(135deg, #0B2149 0%, #16325c 100%)" }}
        >
          {/* Top Bar: Icon, Title, Close Button */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <Receipt size={17} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-none">
                  Payment Receipt
                </p>
                <h2 className="text-white font-semibold text-sm leading-snug truncate mt-0.5">
                  {courseName || "Course Purchase"}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition rounded-lg hover:bg-white/10 p-1.5 flex-shrink-0 cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Amount & Status Center Display */}
          <div className="text-center py-1">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Paid Amount</p>
            <p className="text-white font-extrabold text-3xl sm:text-4xl tracking-tight mt-0.5">
              &#8377;{Number(txn.amount).toLocaleString("en-IN")}
            </p>
            {hasCoupon && hasDiscount && (
              <p className="text-emerald-300 text-xs mt-1 font-medium inline-flex items-center gap-1">
                <Tag size={12} /> Saved &#8377;{Number(txn.discountAmount).toLocaleString("en-IN")} with coupon{" "}
                <span className="font-semibold underline">{txn.couponCode}</span>
              </p>
            )}

            {/* Status Pill: Cleanly centered inside the header so it is NEVER cut off */}
            <div className="mt-2.5 flex items-center justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isPaid
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                }`}
              >
                {isPaid ? <CheckCircle2 size={13} className="text-emerald-300" /> : <Clock size={13} className="text-amber-300" />}
                {isPaid ? "Paid" : txn.status}
              </span>
            </div>
          </div>
        </div>

        {/* ── Body: Information & Breakdown (No scroll needed, compact single window) ── */}
        <div className="p-5 space-y-3.5 bg-white overflow-y-auto">
          {/* Key Details Cards */}
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {/* Student */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <BadgeCheck size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Student</p>
                  <p className="font-semibold text-gray-900 truncate">{studentName}</p>
                </div>
              </div>
              {studentEmail && (
                <span className="text-[11px] text-gray-500 truncate max-w-[160px] pl-2">{studentEmail}</span>
              )}
            </div>

            {/* Paid Date */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <CalendarDays size={15} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Paid On</p>
                  <p className="font-semibold text-gray-900">{fmtDateTime(txn.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Transaction ID */}
            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                  <CreditCard size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Order ID</p>
                  <p className="font-mono text-xs font-semibold text-gray-800 truncate select-all">
                    {txn.razorpayOrderId || txn.id}
                  </p>
                </div>
              </div>
              {txn.razorpayPaymentId && (
                <div className="pl-9 text-[11px] font-mono text-gray-500 truncate select-all">
                  Payment ID: {txn.razorpayPaymentId}
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown Card */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-2 text-xs">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Payment Breakdown</p>
            {hasCoupon ? (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Course Price</span>
                  <span className="line-through text-gray-400">&#8377;{Number(origAmt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Tag size={11} /> Coupon ({txn.couponCode})
                  </span>
                  <span>&#8722;&#8377;{Number(txn.discountAmount).toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span className="text-base text-emerald-700 font-bold">&#8377;{Number(txn.amount).toLocaleString("en-IN")}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-1">
                <span className="text-xs font-semibold text-gray-600">Standard Price Paid</span>
                <span className="text-base text-gray-900 font-bold">&#8377;{Number(txn.amount).toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Button ── */}
        <div className="p-4 pt-0 bg-white">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 shadow-sm cursor-pointer"
            style={{ background: "linear-gradient(135deg, #0B2149 0%, #16325c 100%)" }}
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────── Custom Filter Dropdown (Max-Height 300px Scrollable) ─────────── */
interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  id?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  options: FilterSelectOption[];
  minWidth?: string;
  align?: "left" | "right";
}

function FilterSelect({
  id,
  icon,
  value,
  onChange,
  options,
  minWidth = "min-w-[160px]",
  align = "left",
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className={`relative ${minWidth}`} ref={ref} id={id}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 w-full border border-gray-200 rounded-lg px-3 py-1.5 bg-white shadow-sm text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B2149]/15 transition-all cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className="truncate text-left font-medium text-xs sm:text-sm text-gray-800">
            {selected?.label || "Select..."}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-gray-700" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-1.5 min-w-full w-max max-w-xs sm:max-w-md bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-y-auto animate-in fade-in zoom-in-95 duration-100`}
          style={{ maxHeight: "300px" }}
          role="listbox"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#0B2149]/5 text-[#0B2149] font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={14} className="text-[#0B2149] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────── Page Component ─────────── */
export default function AcademyPaymentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const urlPage   = Number(searchParams.get("page"))    || 1;
  const urlSearch = searchParams.get("search")          || "";
  const urlStatus = searchParams.get("status")          || "all";
  const urlCourse = searchParams.get("courseId")        || "all";
  const urlCoupon = (searchParams.get("coupon") as "all" | "with_coupon" | "without_coupon") || "all";

  const [payments, setPayments]         = useState<Payment[]>([]);
  const [coursesMap, setCoursesMap]     = useState<Record<string, string>>({});
  const [userNamesMap, setUserNamesMap] = useState<Record<string, { name: string; email: string }>>({});
  const [courses, setCourses]           = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [page, setPage]                 = useState(urlPage);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [searchTerm, setSearchTerm]     = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [courseFilter, setCourseFilter] = useState(urlCourse);
  const [couponFilter, setCouponFilter] = useState<"all" | "with_coupon" | "without_coupon">(urlCoupon);
  const [metrics, setMetrics] = useState({ totalRevenue: 0, totalRecords: 0, couponCount: 0, totalDiscount: 0 });

  // Receipt modal state
  const [receiptTxn, setReceiptTxn] = useState<Payment | null>(null);

  const pushToUrl = useCallback((overrides: Record<string, string | number>) => {
    const params = new URLSearchParams();
    const state = {
      page: String(page), search: debouncedSearch, status: statusFilter,
      courseId: courseFilter, coupon: couponFilter,
      ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])),
    };
    if (state.page !== "1")          params.set("page",     state.page);
    if (state.search)                params.set("search",   state.search);
    if (state.status !== "all")      params.set("status",   state.status);
    if (state.courseId !== "all")    params.set("courseId", state.courseId);
    if (state.coupon !== "all")      params.set("coupon",   state.coupon);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }, [page, debouncedSearch, statusFilter, courseFilter, couponFilter, pathname, router]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm); setPage(1);
      pushToUrl({ search: searchTerm, page: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    const p = Number(searchParams.get("page")) || 1;
    const s = searchParams.get("search") || "";
    const st = searchParams.get("status") || "all";
    const co = searchParams.get("courseId") || "all";
    const cu = (searchParams.get("coupon") as any) || "all";
    setPage(p); setSearchTerm(s); setDebouncedSearch(s);
    setStatusFilter(st); setCourseFilter(co); setCouponFilter(cu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    courseApi.fetchCourses().then((res) => {
      const list = res.data || [];
      setCourses(list);
      const map: Record<string, string> = {};
      list.forEach((c: any) => { map[c.id] = c.title; });
      setCoursesMap(map);
    }).catch(() => {});
  }, []);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { page, limit: PAGE_SIZE };
      if (debouncedSearch)        params.search   = debouncedSearch;
      if (statusFilter !== "all") params.status   = statusFilter;
      if (courseFilter !== "all") params.courseId = courseFilter;

      const res = await apiClient.get("/payments/courses/all", { params });
      const raw = res.data;
      // Support both nested and flat response shapes
      const rawData      = raw?.data ?? raw;
      const rawPayments: any[] = rawData?.data ?? (Array.isArray(rawData) ? rawData : []);
      const tot: number        = rawData?.total       ?? rawPayments.length;
      // Aggregate stats returned by backend (true totals across ALL pages for current filter)
      const backendRevenue: number    = Number(rawData?.totalRevenue   ?? 0);
      const backendPaidCount: number  = Number(rawData?.totalPaidCount ?? 0);


      let redemptions: any[] = [];
      try {
        const redParams: Record<string, any> = {};
        if (courseFilter !== "all") redParams.courseId = courseFilter;
        const redRes = await apiClient.get("/academy/coupons/redemptions", { params: redParams });
        redemptions = Array.isArray(redRes.data) ? redRes.data : [];
      } catch { /* silently ignore */ }

      const redByOrder:      Record<string, any> = {};
      const redByUserCourse: Record<string, any> = {};
      redemptions.forEach((r) => {
        if (r.orderId)              redByOrder[r.orderId] = r;
        if (r.userId && r.courseId) redByUserCourse[`${r.userId}_${r.courseId}`] = r;
      });

      const enriched: Payment[] = rawPayments.map((p) => {
        const r =
          (p.razorpayOrderId && redByOrder[p.razorpayOrderId]) ||
          redByOrder[p.id] ||
          redByUserCourse[`${p.userId}_${p.referenceId}`];
        const couponCode     = r?.coupon?.code || p.couponCode || null;
        const discountAmount = r ? Number(r.discountAmount) : (p.discountAmount ? Number(p.discountAmount) : 0);
        const originalAmount = discountAmount > 0 ? Number(p.amount) + discountAmount : Number(p.amount);
        return { ...p, amount: Number(p.amount), couponCode, discountAmount, originalAmount };
      });

      let displayPayments = enriched;
      if (couponFilter === "with_coupon")        displayPayments = enriched.filter((p) => !!p.couponCode);
      else if (couponFilter === "without_coupon") displayPayments = enriched.filter((p) => !p.couponCode);

      setPayments(displayPayments);
      setTotal(tot);
      setTotalPages(Math.max(1, Math.ceil(tot / PAGE_SIZE)));

      setMetrics({
        // From backend: true aggregate across ALL filter-matching records
        totalRevenue:  backendRevenue,
        totalRecords:  tot,
        // From redemptions endpoint (all redemptions, scoped to courseId filter)
        couponCount:   redemptions.length,
        totalDiscount: redemptions.reduce((a, r) => a + Number(r.discountAmount || 0), 0),
      });


      const userIds = Array.from(new Set(rawPayments.map((p: any) => p.userId).filter(Boolean)));
      userIds.forEach(async (uid: any) => {
        if (!userNamesMap[uid]) {
          try {
            const u = (await usersApi.getUserById(uid))?.data;
            if (u) {
              const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || uid;
              setUserNamesMap((prev) => ({ ...prev, [uid]: { name: fullName, email: u.email || "" } }));
            }
          } catch { /* ignore */ }
        }
      });
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, courseFilter, couponFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleStatusChange = (val: string) => { setStatusFilter(val); setPage(1); pushToUrl({ status: val, page: 1 }); };
  const handleCourseChange = (val: string) => { setCourseFilter(val); setPage(1); pushToUrl({ courseId: val, page: 1 }); };
  const handleCouponChange = (val: string) => { setCouponFilter(val as any); setPage(1); pushToUrl({ coupon: val, page: 1 }); };
  const handlePageChange   = (pg: number)  => { setPage(pg); pushToUrl({ page: pg }); };

  const statusInfo = (s: string) =>
    STATUS_MAP[s] ?? { label: s, cls: "bg-gray-100 text-gray-600 border border-gray-200", icon: null };
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const exportCSV = () => {
    if (!payments.length) return;
    const headers = ["Order ID","Payment ID","Student ID","Student Name","Course","Original Price","Coupon Code","Discount","Paid Amount","Status","Date"];
    const rows = payments.map((p) => [
      p.razorpayOrderId || p.id, p.razorpayPaymentId || "N/A", p.userId,
      userNamesMap[p.userId]?.name || p.userId, coursesMap[p.referenceId] || p.referenceId,
      p.originalAmount || p.amount, p.couponCode || "None", p.discountAmount || 0,
      p.amount, p.status, new Date(p.createdAt).toISOString(),
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.map((x) => `"${x}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = `academy_payments_${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const hasActiveFilters = statusFilter !== "all" || courseFilter !== "all" || couponFilter !== "all" || !!debouncedSearch;

  // Receipt modal helpers
  const receiptStudent = receiptTxn ? userNamesMap[receiptTxn.userId] : null;
  const receiptCourseName = receiptTxn ? (coursesMap[receiptTxn.referenceId] || receiptTxn.referenceId) : "";

  return (
    <div className="space-y-6">
      {/* Receipt Modal */}
      {receiptTxn && (
        <ReceiptModal
          txn={receiptTxn}
          courseName={receiptCourseName}
          studentName={receiptStudent?.name || receiptTxn.userId}
          studentEmail={receiptStudent?.email || ""}
          onClose={() => setReceiptTxn(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments &amp; Revenue</h1>
          <p className="text-gray-500 text-sm mt-1">
            Real transaction records, coupon discount breakdowns, and payment statements per course purchase.
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={payments.length === 0}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Download size={17} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      {isLoading ? <SkeletonKpiCards /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
              <IndianRupee size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue (Paid)</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">&#8377;{metrics.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Purchases</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{metrics.totalRecords}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
              <Tag size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coupons Used</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{metrics.couponCount}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Discounts Saved</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">&#8377;{metrics.totalDiscount.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 rounded-t-xl">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              id="payments-search"
              type="text"
              placeholder="Search by order ID, user, or coupon..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto flex-wrap items-center">
            {/* Course Filter Dropdown (max 300px scroll) */}
            <FilterSelect
              id="payments-course-filter"
              icon={<Filter size={14} />}
              value={courseFilter}
              onChange={handleCourseChange}
              options={[
                { value: "all", label: "All Courses" },
                ...courses.map((c) => ({ value: c.id, label: c.title })),
              ]}
              minWidth="min-w-[170px] max-w-[260px]"
            />

            {/* Status Filter Dropdown (max 300px scroll, only valid DB statuses) */}
            <FilterSelect
              id="payments-status-filter"
              icon={<Filter size={14} />}
              value={statusFilter}
              onChange={handleStatusChange}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
              ]}
              minWidth="min-w-[140px]"
            />

            {/* Coupon / Purchase Filter Dropdown (max 300px scroll) */}
            <FilterSelect
              id="payments-coupon-filter"
              icon={<Tag size={14} />}
              value={couponFilter}
              onChange={handleCouponChange}
              options={[
                { value: "all", label: "All Purchases" },
                { value: "with_coupon", label: "With Coupon" },
                { value: "without_coupon", label: "No Coupon" },
              ]}
              minWidth="min-w-[140px]"
            />
            {hasActiveFilters && (
              <button
                id="payments-clear-filters"
                onClick={() => {
                  setSearchTerm(""); setDebouncedSearch(""); setStatusFilter("all");
                  setCourseFilter("all"); setCouponFilter("all"); setPage(1);
                  startTransition(() => router.replace(pathname, { scroll: false }));
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition cursor-pointer whitespace-nowrap"
              >
                &#x2715; Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Order / Transaction</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Payment Statement</th>
                <th className="p-4">Date &amp; Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <SkeletonTableRows />
              ) : payments.length > 0 ? (
                payments.map((txn) => {
                  const st          = statusInfo(txn.status);
                  const courseName  = coursesMap[txn.referenceId] || txn.referenceId;
                  const studentInfo = userNamesMap[txn.userId];
                  const displayName  = studentInfo?.name  || txn.userId;
                  const displayEmail = studentInfo?.email || "";
                  const hasCoupon    = !!txn.couponCode;
                  const hasDiscount  = (txn.discountAmount ?? 0) > 0;
                  const origAmt      = txn.originalAmount ?? txn.amount;

                  return (
                    <tr key={txn.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-4 align-top">
                        <p className="text-xs font-semibold text-gray-900 font-mono tracking-tight">
                          {txn.razorpayOrderId ? txn.razorpayOrderId : txn.id.substring(0, 18) + "..."}
                        </p>
                        {txn.razorpayPaymentId
                          ? <p className="text-[11px] text-gray-400 mt-1 font-mono">Payment ID: {txn.razorpayPaymentId}</p>
                          : <p className="text-[11px] text-gray-400 mt-1">ID: {txn.id.substring(0, 8)}</p>
                        }
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]" title={displayName}>{displayName}</p>
                            {displayEmail
                              ? <p className="text-xs text-gray-500 truncate max-w-[150px]" title={displayEmail}>{displayEmail}</p>
                              : <p className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">{txn.userId.substring(0, 16)}...</p>
                            }
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 max-w-[180px]" title={courseName}>{courseName}</p>
                      </td>
                      <td className="p-4 align-top">
                        {hasCoupon ? (
                          <div className="bg-gray-50/90 rounded-lg p-2.5 border border-gray-100 max-w-[200px] space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Course Price:</span>
                              <span className="line-through text-gray-400 font-medium">&#8377;{origAmt.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                                <Tag size={10} />{txn.couponCode}
                              </span>
                              {hasDiscount && (
                                <span className="text-emerald-600 font-semibold text-[11px]">
                                  &#8722;&#8377;{Number(txn.discountAmount).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-1.5 border-t border-gray-200/60">
                              <span className="text-xs font-semibold text-gray-700">Paid:</span>
                              <span className="text-sm font-bold text-emerald-700">&#8377;{Number(txn.amount).toLocaleString()}</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-base font-bold text-gray-900">&#8377;{Number(txn.amount).toLocaleString()}</p>
                            <span className="text-[11px] text-gray-400 font-medium">Standard Price</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-top">
                        <p className="text-sm text-gray-900 font-medium">{fmtDate(txn.createdAt)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtTime(txn.createdAt)}</p>
                      </td>
                      <td className="p-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${st.cls}`}>
                          {st.icon}{st.label}
                        </span>
                      </td>
                      <td className="p-4 text-center align-top">
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="View Payment Receipt"
                          disabled={txn.status !== "paid" && txn.status !== "COMPLETED"}
                          onClick={() => setReceiptTxn(txn)}
                        >
                          <FileText size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <FileText size={38} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No payments found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — using shared component */}
        {total > 0 && (
          <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between pt-3">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}&#8211;{Math.min(page * PAGE_SIZE, total)} of {total} records
              </p>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
