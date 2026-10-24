"use client";

import { Suspense } from "react";
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Star, Share2, CalendarDays, Clock,
  Users, CheckCircle2, Heart,
  PlayCircle, Award, FileText,
  ChevronDown, MonitorPlay, Loader2,
  Tag, AlertCircle, Infinity, Minus, Plus,
  Search, BookOpen, GraduationCap, ArrowRight, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchCourseById, fetchAllCourses } from '@/data/features/academy/course/courseThunks';
import { clearCurrentCourse } from '@/data/features/academy/course/courseSlice';
import { createCoursePaymentOrder, verifyCoursePayment, fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';
import apiClient from '@/data/services/apiConfig/apiClient';
import { API_ENDPOINTS } from '@/data/services/apiConfig/apiContants';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CourseReviewsSection from '@/components/academy/reviews/CourseReviewsSection';
import { useWishlist } from '@/context/WishlistContext';

// ── Main Video Course Layout ────────────────────────────────────

export function VideoCourseLayout({ course }: { course: any }) {
  const router = useRouter();
  const [openModules, setOpenModules] = useState<number[]>([0]);

  const toggleModule = (index: number) => {
    setOpenModules(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const toggleAllModules = () => {
    if (course.modules && openModules.length === course.modules.length) {
      setOpenModules([]);
    } else {
      setOpenModules(course.modules?.map((_: any, i: number) => i) || []);
    }
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(course.id || course.slug);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { myEnrollments } = useAppSelector(state => state.enrollments);
  const { courses } = useAppSelector(state => state.course);

  const isEnrolled = myEnrollments?.some(e => e.course?.slug === course.slug || e.courseId === course.id);

  // ── Related Courses: Same category first; if not enough, backfill with others; max 3 or 6 courses; NO dummy data
  const relatedCourses = (() => {
    if (!courses || courses.length === 0) return [];
    const otherPublished = courses.filter((c: any) => c.status === 'published' && c.slug && c.slug !== course.slug);

    const getCat = (c: any) => (typeof c?.category === 'string' ? c.category : c?.category?.name || '').trim().toLowerCase();
    const currentCat = getCat(course);

    // 1. Same category courses first
    const sameCategory = currentCat
      ? otherPublished.filter((c: any) => getCat(c) === currentCat)
      : [];

    // 2. Different category courses to backfill if needed
    const diffCategory = otherPublished.filter((c: any) => !currentCat || getCat(c) !== currentCat);

    // 3. Combined with same category prioritized at the front
    const combined = [...sameCategory, ...diffCategory];

    // 4. Max 3 or 6: Show 6 if at least 6 are available (2 full rows of 3); otherwise up to 3 (1 row)
    const limit = combined.length >= 6 ? 6 : Math.min(combined.length, 3);
    return combined.slice(0, limit);
  })();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    if (!course.id) {
      setCouponError("Invalid course");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const res: any = await apiClient.post(API_ENDPOINTS.ACADEMY.COUPONS.VALIDATE, {
        code: couponInput.trim().toUpperCase(),
        courseId: course.id,
        userId: user?._id || (user as any)?.id,
      });

      const data = res.data || res;
      setAppliedCoupon(data);
      toast.success(`Coupon "${data.coupon?.code}" applied! You saved ₹${data.discountAmount}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid coupon code";
      setCouponError(msg);
      toast.error(msg);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
    toast("Coupon removed");
  };

  // Load Razorpay checkout.js script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (!user) {
      toast('Please log in to enroll in a course.');
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (!course.id) {
      toast.error('Invalid course.');
      return;
    }

    setIsPaying(true);
    try {
      const orderArg = appliedCoupon
        ? { courseId: course.id, couponCode: appliedCoupon.coupon?.code }
        : course.id;

      const res = await dispatch(createCoursePaymentOrder(orderArg)).unwrap();
      const orderData = res.data || res;

      // Handle 100% Free Coupon Bypass (no payment gateway needed)
      if (orderData.isFree) {
        toast.success(orderData.message || 'Payment waived! You are now enrolled.');
        await dispatch(fetchMyEnrollments());
        router.push(`/dashboard/learn/${course.slug}`);
        setIsPaying(false);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        setIsPaying(false);
        return;
      }

      const options: any = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Sajjad Husain Legal Academy',
        description: `Enrollment for ${course.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#0B1220' },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            toast.error('Payment cancelled.');
          },
        },
        handler: async (response: any) => {
          try {
            await dispatch(verifyCoursePayment({
              courseId: course.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })).unwrap();

            toast.success('Payment successful! You are now enrolled.');
            await dispatch(fetchMyEnrollments());
            router.push(`/dashboard/learn/${course.slug}`);
          } catch (err: any) {
            toast.error(err || 'Payment verification failed. Please contact support.');
          } finally {
            setIsPaying(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error || 'Failed to initiate payment.');
      setIsPaying(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: course.title, url: window.location.href }).catch(() => { });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  // Live synced rating and review count
  const [liveSummary, setLiveSummary] = useState<{ averageRating: number; totalReviews: number } | null>(null);
  const rating = liveSummary?.averageRating !== undefined ? liveSummary.averageRating : (Number(course.averageRating) || 0);
  const totalReviews = liveSummary?.totalReviews !== undefined ? liveSummary.totalReviews : (Number(course.totalReviews) || 0);

  const instructors = course.instructors || [];
  const numPrice = course.rawPrice !== undefined ? course.rawPrice : (Number(String(course.price || "").replace(/[^0-9.]/g, "")) || 0);
  const numOriginalPrice = course.rawOriginalPrice !== undefined ? course.rawOriginalPrice : (Number(String(course.originalPrice || "").replace(/[^0-9.]/g, "")) || 0);
  const hasDiscount = numOriginalPrice > numPrice;
  const discountPct = hasDiscount ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100) : null;

  return (
    <div className="w-full">
      {/* ── BREADCRUMB ── */}
      <div className="mb-6">
        <Link
          href="/academy/courses"
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border-2 border-slate-300 text-xs sm:text-sm font-bold text-[#08172D] hover:border-[#8A6100] hover:text-[#8A6100] shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      {/* ── TWO-COLUMN EDITORIAL CASE BRIEF GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] gap-8 xl:gap-12 items-start mb-16 w-full">

        {/* ── MAIN ARTICLE COLUMN (min-w-0 prevents grid blowout) ── */}
        <div className="min-w-0 w-full overflow-hidden space-y-10">

          {/* Top Fold / Case Header */}
          <div className="min-w-0 w-full overflow-hidden">
            {(course.category || (course.tags && course.tags.length > 0)) && (
              <span className="inline-block px-3 py-1 rounded-full bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-xs font-black uppercase tracking-wider mb-3">
                {course.category || course.tags[0]}
              </span>
            )}

            <h1 className="ac-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-[color:var(--sa-ink)] leading-tight tracking-tight mb-4 min-w-0 break-words [overflow-wrap:anywhere]">
              {course.title || "Course"}
            </h1>

            {(course.subtitle || course.description) && (
              <p className="text-[color:var(--sa-ink-2)] text-base sm:text-lg leading-relaxed max-w-[62ch] mb-4 min-w-0 break-words [overflow-wrap:anywhere]">
                {course.subtitle || course.description}
              </p>
            )}

            {/* Citation Meta Strip (Rendered ONLY if real data exists — NO dummy data) */}
            {(() => {
              const metaItems: string[] = [];
              if (course.level) metaItems.push(course.level);
              if (course.teachingHours) metaItems.push(course.teachingHours);
              if (course.language) metaItems.push(course.language);
              if (course.hasCertificate) metaItems.push("Verifiable Certificate");

              if (metaItems.length === 0) return null;

              return (
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[color:var(--sa-ink-3)] mb-4">
                  {metaItems.map((item, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-[color:var(--sa-gold)]">·</span>}
                      <span className={item === "Verifiable Certificate" ? "text-emerald-800 font-medium" : ""}>
                        {item}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              );
            })()}

            {/* Plain Inline Rating Row */}
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <a href="#reviews-section" className="inline-flex items-center gap-1.5 text-[color:var(--sa-ink)] hover:text-[color:var(--sa-gold)] transition-colors">
                <Star size={15} className="fill-[color:var(--sa-gold)] text-[color:var(--sa-gold)]" />
                <span className="font-bold text-[color:var(--sa-ink)]">{rating > 0 ? rating.toFixed(1) : "New"}</span>
                <span className="text-[color:var(--sa-ink-3)] underline">
                  ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </a>
              <span className="text-[color:var(--sa-line)]">|</span>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-[color:var(--sa-ink-3)] hover:text-[color:var(--sa-ink)] transition-colors cursor-pointer"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Hero Thumbnail Banner with warm duotone overlay (Rendered ONLY if image exists — NO fake captions) */}
          {course.image && (
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[color:var(--sa-cream-2)] border border-[color:var(--sa-line)] shadow-sm">
              <img
                src={course.image}
                alt={course.title || "Course Cover"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[color:var(--sa-gold)] mix-blend-multiply opacity-10 pointer-events-none" />
            </div>
          )}

          {/* Live Batch Schedule (Rendered ONLY if real schedule exists) */}
          {course.schedule && (course.schedule.startDate || course.schedule.timings || course.schedule.note) && (
            <div className="ac-card bg-[color:var(--sa-paper)] p-6 sm:p-7 border border-[color:var(--sa-line)] rounded-2xl min-w-0 w-full overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={20} className="text-[color:var(--sa-gold)]" />
                <h3 className="ac-display text-xl font-bold text-[color:var(--sa-ink)]">Live Batch Schedule</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm min-w-0">
                {course.schedule.startDate && (
                  <div className="min-w-0">
                    <p className="text-xs text-[color:var(--sa-ink-3)] uppercase tracking-wider mb-1">Timeline</p>
                    <p className="font-semibold text-[color:var(--sa-ink)] min-w-0 break-words [overflow-wrap:anywhere]">
                      {course.schedule.startDate}{course.schedule.endDate ? ` – ${course.schedule.endDate}` : ''}
                    </p>
                  </div>
                )}
                {course.schedule.timings && (
                  <div className="min-w-0">
                    <p className="text-xs text-[color:var(--sa-ink-3)] uppercase tracking-wider mb-1">Live Timings</p>
                    <p className="font-semibold text-[color:var(--sa-ink)] min-w-0 break-words [overflow-wrap:anywhere]">{course.schedule.timings}</p>
                  </div>
                )}
              </div>
              {course.schedule.note && (
                <p className="text-xs text-[color:var(--sa-ink-2)] mt-4 pt-3 border-t border-[color:var(--sa-line)] leading-relaxed min-w-0 break-words [overflow-wrap:anywhere]">
                  {course.schedule.note}
                </p>
              )}
            </div>
          )}

          {/* What You'll Learn / Practice (Rendered ONLY if real items exist — with word-break guard) */}
          {course.whatYouWillLearn?.length > 0 && (
            <div className="min-w-0 w-full overflow-hidden">
              <h2 className="ac-display text-2xl font-bold text-[color:var(--sa-ink)] mb-4">
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
                {course.whatYouWillLearn.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 min-w-0 overflow-hidden">
                    <CheckCircle2 size={16} className="text-[color:var(--sa-gold)] shrink-0 mt-0.5" />
                    <span className="text-sm text-[color:var(--sa-ink)] leading-relaxed min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience / Who Should Enroll (Rendered ONLY if real items exist — with word-break guard) */}
          {course.whoShouldEnrol?.length > 0 && (
            <div className="min-w-0 w-full overflow-hidden">
              <h2 className="ac-display text-2xl font-bold text-[color:var(--sa-ink)] mb-4">
                Who Should Enroll
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                {course.whoShouldEnrol.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 min-w-0 overflow-hidden">
                    <CheckCircle2 size={16} className="text-[color:var(--sa-gold)] shrink-0 mt-0.5" />
                    <span className="text-sm text-[color:var(--sa-ink)] leading-relaxed min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Features (Rendered ONLY if real items exist — with word-break guard) */}
          {course.features?.length > 0 && (
            <div className="min-w-0 w-full overflow-hidden">
              <h2 className="ac-display text-2xl font-bold text-[color:var(--sa-ink)] mb-4">
                Course Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                {course.features.map((feat: any, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 min-w-0 overflow-hidden">
                    <CheckCircle2 size={16} className="text-[color:var(--sa-gold)] shrink-0 mt-0.5" />
                    <span className="text-sm text-[color:var(--sa-ink)] leading-relaxed min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                      {typeof feat === 'string' ? feat : feat.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus & Curriculum (Rendered ONLY if real modules exist — uses real semantic SVG icons & word-break guard) */}
          {course.modules?.length > 0 && (
            <div className="min-w-0 w-full overflow-hidden">
              <div className="flex justify-between items-baseline mb-6 pb-2 border-b border-[color:var(--sa-line)]">
                <div>
                  <h2 className="ac-display text-2xl font-bold text-[color:var(--sa-ink)]">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-[color:var(--sa-ink-3)] mt-0.5">
                    {course.modules.length} {course.modules.length === 1 ? 'Module' : 'Modules'}
                  </p>
                </div>
                <button
                  onClick={toggleAllModules}
                  className="text-xs font-semibold text-[color:var(--sa-ink-2)] hover:text-[color:var(--sa-gold)] transition-colors cursor-pointer shrink-0 ml-4"
                >
                  {openModules.length === course.modules.length ? "Collapse all" : "Expand all"}
                </button>
              </div>

              <div className="space-y-4 min-w-0">
                {course.modules.map((mod: any, i: number) => {
                  const isOpen = openModules.includes(i);
                  const totalItems = (mod.items?.length || 0) + (mod.subModules?.reduce((acc: number, s: any) => acc + (s.items?.length || 0), 0) || 0);

                  return (
                    <div key={i} className="border-b border-[color:var(--sa-line)] pb-4 last:border-b-0 min-w-0">
                      <button
                        onClick={() => toggleModule(i)}
                        className="w-full flex items-center justify-between text-left py-2 group cursor-pointer gap-4"
                      >
                        <div className="pr-4 min-w-0 flex-1">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--sa-gold)] font-bold block mb-0.5">
                            Module {i + 1}
                          </span>
                          <h3 className="ac-display text-lg sm:text-xl font-bold text-[color:var(--sa-ink)] group-hover:text-[color:var(--sa-gold-2)] transition-colors min-w-0 break-words [overflow-wrap:anywhere]">
                            {mod.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[color:var(--sa-ink-3)] font-mono shrink-0">
                          <span>
                            {totalItems} lessons{mod.duration ? ` · ${mod.duration}` : ''}
                          </span>
                          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[color:var(--sa-gold)]' : ''}`} />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mt-3 pl-4 sm:pl-6 border-l-2 border-[color:var(--sa-line)] space-y-2.5 py-1 min-w-0">
                          {/* Submodules */}
                          {mod.subModules?.length > 0 && mod.subModules.map((sub: any, subIdx: number) => (
                            <div key={subIdx} className="mb-3 min-w-0">
                              <h5 className="font-semibold text-xs text-[color:var(--sa-ink)] mb-2 uppercase tracking-wide min-w-0 break-words [overflow-wrap:anywhere]">
                                {sub.title}
                              </h5>
                              <ul className="space-y-2 pl-3 min-w-0">
                                {sub.items?.map((item: any, idx: number) => (
                                  <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[color:var(--sa-ink-2)] min-w-0">
                                    {item.type === 'video' ? (
                                      <PlayCircle size={15} className="text-indigo-500 shrink-0" />
                                    ) : item.type === 'document' || item.type === 'pdf' || item.type === 'doc' ? (
                                      <FileText size={15} className="text-emerald-600 shrink-0" />
                                    ) : item.type === 'live' ? (
                                      <MonitorPlay size={15} className="text-rose-500 shrink-0" />
                                    ) : item.type === 'assignment' || item.type === 'assessment' ? (
                                      <CheckCircle2 size={15} className="text-amber-600 shrink-0" />
                                    ) : (
                                      <PlayCircle size={15} className="text-[color:var(--sa-gold)] shrink-0" />
                                    )}
                                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item.title}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}

                          {/* Direct Items */}
                          {mod.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[color:var(--sa-ink-2)] min-w-0">
                              {item.type === 'video' ? (
                                <PlayCircle size={15} className="text-indigo-500 shrink-0" />
                              ) : item.type === 'document' || item.type === 'pdf' || item.type === 'doc' ? (
                                <FileText size={15} className="text-emerald-600 shrink-0" />
                              ) : item.type === 'live' ? (
                                <MonitorPlay size={15} className="text-rose-500 shrink-0" />
                              ) : item.type === 'assignment' || item.type === 'assessment' ? (
                                <CheckCircle2 size={15} className="text-amber-600 shrink-0" />
                              ) : (
                                <PlayCircle size={15} className="text-[color:var(--sa-gold)] shrink-0" />
                              )}
                              <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item.title}</span>
                            </div>
                          ))}

                          {!mod.items?.length && !mod.subModules?.length && (
                            <p className="text-xs italic text-[color:var(--sa-ink-3)]">No lessons listed in this module.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Appearances & Faculty (Rendered ONLY if real instructors exist — NO fake stats) */}
          {instructors.length > 0 && (
            <div className="min-w-0 w-full overflow-hidden">
              <h2 className="ac-display text-2xl font-bold text-[color:var(--sa-ink)] mb-6">
                Appearances & Faculty
              </h2>
              <div className="space-y-6 min-w-0">
                {instructors.map((inst: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start gap-5 p-6 rounded-2xl bg-[color:var(--sa-paper)] border border-[color:var(--sa-line)] min-w-0 overflow-hidden">
                    {inst.image ? (
                      <img
                        src={inst.image}
                        alt={inst.name || "Instructor"}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[color:var(--sa-gold)] shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[color:var(--sa-cream-2)] border-2 border-[color:var(--sa-gold)] flex items-center justify-center text-[color:var(--sa-gold)] shrink-0">
                        <Users size={32} strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="ac-display text-xl font-bold text-[color:var(--sa-ink)] min-w-0 break-words [overflow-wrap:anywhere]">
                        {inst.name || "Faculty Member"}
                      </h3>
                      {inst.title && (
                        <p className="text-xs font-semibold text-[color:var(--sa-gold)] uppercase tracking-wider mt-0.5 mb-2 min-w-0 break-words [overflow-wrap:anywhere]">
                          {inst.title}
                        </p>
                      )}
                      {inst.bio && (
                        <p className="text-xs sm:text-sm text-[color:var(--sa-ink-2)] leading-relaxed min-w-0 break-words [overflow-wrap:anywhere]">
                          {inst.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Frequently Asked Questions (Rendered ONLY if real FAQs exist) */}
          {course.faqs?.length > 0 && (
            <div className="min-w-0 w-full overflow-hidden">
              <h2 className="ac-display text-2xl font-bold text-[color:var(--sa-ink)] mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3 min-w-0">
                {course.faqs.map((faq: any, i: number) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} className="border-b border-[color:var(--sa-line)] pb-3 min-w-0">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full flex items-center justify-between text-left py-2 font-medium text-sm sm:text-base text-[color:var(--sa-ink)] hover:text-[color:var(--sa-gold)] transition-colors cursor-pointer gap-4"
                      >
                        <span className="min-w-0 break-words [overflow-wrap:anywhere]">{faq.q}</span>
                        {isOpen ? <Minus size={16} className="text-[color:var(--sa-gold)] shrink-0" /> : <Plus size={16} className="text-[color:var(--sa-ink-3)] shrink-0" />}
                      </button>
                      {isOpen && (
                        <p className="text-xs sm:text-sm text-[color:var(--sa-ink-2)] leading-relaxed pt-1 pb-2 min-w-0 break-words [overflow-wrap:anywhere]">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT RAIL (Sticky Purchase & Enrollment Panel) ── */}
        <div className="lg:sticky lg:top-24 space-y-6 w-full max-w-[360px] xl:max-w-[380px] min-w-0 self-start">
          <div className="ac-card bg-[color:var(--sa-paper)] p-6 sm:p-7 border border-[color:var(--sa-line)] shadow-xl rounded-2xl w-full min-w-0 overflow-hidden">

            {/* Price Row */}
            <div className="mb-4 min-w-0">
              <div className="flex items-baseline flex-wrap gap-2.5">
                <span className="font-serif text-3xl sm:text-4xl font-black text-[#08172D] tracking-tight">
                  {appliedCoupon
                    ? (appliedCoupon.isFree ? "FREE" : `₹${appliedCoupon.finalAmount}`)
                    : (course.price || "Free")}
                </span>
                {(hasDiscount || appliedCoupon) && (
                  <span className="text-sm sm:text-base text-[color:var(--sa-ink-3)] line-through font-medium">
                    {appliedCoupon ? (course.price || `₹${numPrice}`) : course.originalPrice}
                  </span>
                )}
                {appliedCoupon ? (
                  <span className="ac-tag ac-tag-sage">
                    Save ₹{appliedCoupon.discountAmount}
                  </span>
                ) : discountPct ? (
                  <span className="ac-tag ac-tag-sage">
                    {discountPct}% OFF
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-[color:var(--sa-ink-3)] mt-2">
                One-time payment · Lifetime access{course.hasCertificate ? " · Verifiable certificate" : ""}
              </p>
            </div>

            {/* Coupon Code Section (Hidden if already enrolled) */}
            {!isEnrolled && (
              <div className="mb-5 p-3 rounded-xl bg-[color:var(--sa-cream)] border border-[color:var(--sa-line)] min-w-0">
                {!appliedCoupon ? (
                  <div>
                    <label className="text-xs font-bold text-[color:var(--sa-ink)] flex items-center gap-1.5 mb-2">
                      <Tag size={13} className="text-[color:var(--sa-gold)]" /> Have a Coupon Code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        value={couponInput}
                        spellCheck={false}
                        autoComplete="off"
                        autoCapitalize="characters"
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""));
                          setCouponError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="w-full bg-white text-[color:var(--sa-ink)] border border-[color:var(--sa-line)] rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:border-[color:var(--sa-gold)] min-w-0"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponInput.trim()}
                        className="ac-btn ac-btn-primary px-4 py-2 text-xs font-bold disabled:opacity-50 shrink-0 cursor-pointer"
                      >
                        {isValidatingCoupon ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-600 mt-1.5 font-medium flex items-center gap-1 min-w-0 break-words [overflow-wrap:anywhere]">
                        <AlertCircle size={12} className="shrink-0" /> {couponError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-800 font-mono tracking-wider">
                          {appliedCoupon.coupon?.code}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          APPLIED
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {appliedCoupon.isFree ? "100% discount applied" : `Saved ₹${appliedCoupon.discountAmount}`}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CTA Actions */}
            <div className="space-y-3 mb-6">
              {isEnrolled ? (
                <button
                  onClick={() => router.push(`/dashboard/learn/${course.slug}`)}
                  className="ac-btn ac-btn-primary w-full py-3.5 text-sm font-bold shadow-md cursor-pointer"
                >
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Go to Classroom
                </button>
              ) : (
                <button
                  onClick={handlePayNow}
                  disabled={isPaying}
                  className="ac-btn ac-btn-primary w-full py-3.5 text-sm font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isPaying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : appliedCoupon?.isFree ? (
                    "Enroll for Free"
                  ) : (
                    "Enroll Now"
                  )}
                </button>
              )}

              {/* Add to Wishlist: ONLY shown if course is NOT purchased/enrolled */}
              {!isEnrolled && (
                <button
                  onClick={() => toggleWishlist(course.id || course.slug)}
                  className={`ac-btn ac-btn-ghost w-full py-2.5 text-xs font-semibold cursor-pointer ${isWishlisted ? "text-rose-600 border-rose-200 bg-rose-50/50" : ""
                    }`}
                >
                  <Heart size={14} className={isWishlisted ? "fill-rose-500 text-rose-500" : ""} />
                  {isWishlisted ? "In Your Wishlist" : "Add to Wishlist"}
                </button>
              )}
            </div>

            {/* Course Inclusions (Rendered ONLY if real data exists — NO fake bullet points) */}
            {(() => {
              const inclusions: { icon: React.ReactNode; text: string }[] = [];
              if (course.teachingHours) {
                inclusions.push({ icon: <Clock size={15} className="text-[color:var(--sa-gold)] shrink-0" />, text: `${course.teachingHours} of course content` });
              }
              if (course.hasCertificate) {
                inclusions.push({ icon: <Award size={15} className="text-[color:var(--sa-gold)] shrink-0" />, text: "Verifiable Certificate of Completion" });
              }
              if (course.hasLifetimeAccess) {
                inclusions.push({ icon: <Infinity size={15} className="text-[color:var(--sa-gold)] shrink-0" />, text: "Full lifetime access with updates" });
              }
              if (course.inclusions?.length > 0) {
                course.inclusions.forEach((inc: string) => {
                  inclusions.push({ icon: <CheckCircle2 size={15} className="text-[color:var(--sa-gold)] shrink-0" />, text: inc });
                });
              }

              if (inclusions.length === 0) return null;

              return (
                <div className="pt-4 border-t border-[color:var(--sa-line)] min-w-0">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--sa-ink-3)] font-semibold mb-3">
                    This Course Includes
                  </p>
                  <ul className="space-y-2.5 text-xs text-[color:var(--sa-ink-2)] min-w-0">
                    {inclusions.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 min-w-0">
                        {item.icon}
                        <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

          </div>
        </div>

      </div>

      {/* ── COURSE REVIEWS & RATINGS (Inside 7xl Container) ── */}
      <div id="reviews-section" className="border-t border-[color:var(--sa-line)] pt-12 mt-12 mb-16 w-full min-w-0 overflow-hidden">
        <CourseReviewsSection
          courseId={course.id || course.slug}
          courseTitle={course.title}
          initialAverageRating={rating}
          initialTotalReviews={totalReviews}
          onSummaryChange={(summary) => {
            setLiveSummary({
              averageRating: summary.averageRating,
              totalReviews: summary.totalReviews,
            });
          }}
        />
      </div>

      {/* ── RELATED COURSES (Category prioritized, max 3 or 6 courses — Inside 7xl Container) ── */}
      {relatedCourses.length > 0 && (
        <div className="border-t border-[color:var(--sa-line)] pt-12 mt-12 w-full min-w-0 overflow-hidden">
          <div className="mb-6">
            <p className="ac-eyebrow mb-1">CONTINUE YOUR TRACK</p>
            <h3 className="ac-display text-2xl font-bold text-[color:var(--sa-ink)]">
              Related Courses
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map((rc: any) => (
              <Link
                key={rc.slug}
                href={`/academy/courses/${rc.slug}`}
                className="group flex flex-col bg-white border-2 border-slate-200/90 rounded-2xl overflow-hidden hover:border-[#B8860B] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  {rc.thumbnailUrl ? (
                    <img
                      src={rc.thumbnailUrl}
                      alt={rc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8A6100]">
                      <PlayCircle size={32} />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 min-w-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[10px] font-black uppercase tracking-wider mb-2 w-fit">
                    {rc.category || "Course"}
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#08172D] group-hover:text-[#8A6100] transition-colors mb-2 line-clamp-2">
                    {rc.title}
                  </h4>
                  <div className="mt-auto pt-3 border-t-2 border-slate-100 flex items-center justify-between">
                    <span className="font-black text-base text-[#08172D]">
                      {rc.price ? `₹${rc.price}` : "Free"}
                    </span>
                    <span className="text-xs text-[#08172D] font-black group-hover:text-[#8A6100] group-hover:translate-x-0.5 transition-all">
                      View Course &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ── Skeleton Loader Component ─────────────────────────────────────

function CourseSkeletonLayout() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-28 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] gap-8 xl:gap-12">
        <div className="space-y-6">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="aspect-[16/9] bg-gray-200 rounded-2xl w-full" />
          <div className="h-32 bg-gray-200 rounded-2xl w-full" />
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

// ── Impressive Course Not Found Component ───────────────────────

function CourseNotFoundView({ slug, error, courses }: { slug: string; error: string | null; courses: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/academy/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/academy/courses");
    }
  };

  const publishedCourses = courses?.filter((c: any) => c.status === "published" && c.slug) || [];
  const featuredCourses = publishedCourses.slice(0, 3);

  const popularCategories = [
    { name: "Criminal Law", count: "Courtroom Defense & IPC" },
    { name: "Civil Litigation", count: "Drafting, CPC & Evidence" },
    { name: "Corporate Practice", count: "Contracts & Compliance" },
    { name: "Constitutional Law", count: "Writs & High Court PIL" },
  ];

  return (
    <div className="ac-student bg-[#FAF7EE] min-h-screen font-sans pt-8 sm:pt-12 pb-24 w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            href="/academy/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2242] hover:text-[#C9A227] transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 group-hover:border-[#C9A227] flex items-center justify-center transition-colors shadow-2xs">
              <ArrowLeft size={16} className="text-[#0B2242] group-hover:text-[#C9A227] transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span>Back to All Courses</span>
          </Link>

          <Link
            href="/academy"
            className="text-xs font-bold text-[#0B2242]/70 hover:text-[#C9A227] transition-colors uppercase tracking-wider"
          >
            Academy Home
          </Link>
        </div>

        {/* Impressive Hero Not Found Card */}
        <div className="relative bg-white rounded-3xl border-2 border-[#122340]/10 shadow-[0_12px_40px_-8px_rgba(11,34,66,0.08)] p-7 sm:p-12 lg:p-14 text-center overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#C9A227]/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#08172D]/5 blur-3xl" />

          {/* Prestigious Academy Badge Icon */}
          <div className="relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#08172D] border-2 border-[#C9A227]/40 shadow-md">
            <GraduationCap size={38} className="text-[#C9A227]" />
          </div>

          {/* Eyebrow */}
          <p className="relative z-10 text-xs font-extrabold uppercase tracking-[0.22em] text-[#C9A227] mb-2">
            SAJJAD HUSAIN LEGAL ACADEMY
          </p>

          {/* Headline */}
          <h1 className="relative z-10 font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#08172D] tracking-tight mb-3">
            Course Not Found
          </h1>

          {/* Contextual Description */}
          <p className="relative z-10 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed mb-6 font-normal">
            We could not find an active curriculum with identifier{" "}
            <span className="font-mono font-bold text-[#08172D] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-xs sm:text-sm">
              {slug}
            </span>
            . It may have concluded, been reorganized into a new module track, or the URL address might be incorrect.
          </p>

          {/* Integrated Search Input */}
          <form onSubmit={handleSearch} className="relative z-10 max-w-md mx-auto mb-7">
            <div className="relative group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C9A227] transition-colors pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, instructor, or subject..."
                className="w-full h-12 pl-11 pr-24 rounded-xl border-2 border-slate-300 bg-slate-50/70 text-sm font-semibold text-[#08172D] placeholder:text-slate-400 focus:outline-none focus:border-[#C9A227] focus:bg-white focus:ring-4 focus:ring-[#C9A227]/15 transition-all shadow-2xs hover:border-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 rounded-lg bg-[#08172D] hover:bg-[#C9A227] text-white hover:text-[#08172D] text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Primary Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/academy/courses"
              className="inline-flex items-center gap-2.5 h-11 px-6 rounded-xl bg-[#08172D] hover:bg-[#07172C] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all"
            >
              <BookOpen size={17} className="text-[#C9A227]" />
              <span>Browse All Courses</span>
            </Link>

            <Link
              href="/academy"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border-2 border-slate-300 bg-white hover:border-[#C9A227] hover:bg-slate-50 text-[#08172D] text-sm font-bold shadow-2xs transition-all"
            >
              <span>Academy Home</span>
            </Link>
          </div>

          {/* Quick Subject Categories */}
          <div className="relative z-10 mt-8 pt-7 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              OR EXPLORE BY SPECIALIZATION
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {popularCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/academy/courses?category=${encodeURIComponent(cat.name)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#08172D] bg-slate-100 hover:bg-[#C9A227]/15 hover:text-[#C9A227] border border-slate-200 hover:border-[#C9A227]/40 transition-colors"
                >
                  <Tag size={12} className="text-[#C9A227]" />
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Courses Section (Dynamic) */}
        {featuredCourses.length > 0 && (
          <div className="mt-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#C9A227] mb-1">
                  CURRENT ENROLLMENTS
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#08172D] tracking-tight">
                  Featured Academy Programs
                </h2>
              </div>
              <Link
                href="/academy/courses"
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#08172D] hover:text-[#C9A227] transition-colors"
              >
                <span>View All Courses</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((c: any) => (
                <Link
                  key={c.slug}
                  href={`/academy/courses/${c.slug}`}
                  className="group flex flex-col bg-white border-2 border-slate-200/80 rounded-2xl overflow-hidden hover:border-[#C9A227] hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    {c.thumbnailUrl ? (
                      <img
                        src={c.thumbnailUrl}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#08172D] text-[#C9A227]">
                        <GraduationCap size={36} />
                      </div>
                    )}
                    {c.category && (
                      <span className="absolute top-2.5 left-2.5 bg-[#08172D]/90 backdrop-blur-xs text-[#C9A227] text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border border-[#C9A227]/30 shadow-xs">
                        {c.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif font-bold text-base text-[#08172D] group-hover:text-[#C9A227] transition-colors line-clamp-2 leading-snug mb-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      {c.instructors?.[0]?.name || "Sajjad Husain Legal Academy"}
                    </p>
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-serif font-bold text-base text-[#08172D]">
                        {c.price ? `₹${c.price}` : "Free"}
                      </span>
                      <span className="text-xs font-bold text-[#C9A227] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        <span>View Syllabus</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Academic Advisory Support Card */}
        <div className="mt-12 bg-white rounded-2xl border-2 border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#08172D] text-[#C9A227] flex items-center justify-center shrink-0 shadow-xs">
              <HelpCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#08172D]">
                Looking for a specific course or batch?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                Our admissions counselors can assist with archived curriculums, batch schedules, courtroom internships, and enrollment queries.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="shrink-0 h-10 px-5 rounded-xl border-2 border-[#08172D] bg-[#08172D] text-white hover:bg-[#C9A227] hover:border-[#C9A227] hover:text-[#08172D] text-xs font-extrabold tracking-wide transition-all shadow-xs inline-flex items-center gap-2"
          >
            <span>Contact Academic Office</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────

function CourseDetailContent({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;
  const dispatch = useAppDispatch();
  const { currentCourse, courses, isLoading, error } = useAppSelector((state) => state.course);
  const { user } = useAppSelector(state => state.auth);
  const { myEnrollments } = useAppSelector(state => state.enrollments);

  useEffect(() => {
    if (slug) {
      dispatch(fetchCourseById(slug));
    }
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (!courses || courses.length === 0) {
      dispatch(fetchAllCourses());
    }
  }, [dispatch, courses]);

  useEffect(() => {
    if (user && (!myEnrollments || myEnrollments.length === 0)) {
      dispatch(fetchMyEnrollments());
    }
  }, [dispatch, user, myEnrollments]);

  if (isLoading || (!currentCourse && !error)) {
    return (
      <div className="ac-student bg-[color:var(--sa-cream)] min-h-screen font-sans pt-10 pb-20 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <CourseSkeletonLayout />
        </div>
      </div>
    );
  }

  if (error || !currentCourse) {
    return <CourseNotFoundView slug={slug} error={error} courses={courses} />;
  }

  // Map backend Course entity to the VideoCourseLayout format
  // Strict condition mapping ensuring no dummy data fallback
  const mappedCourse = {
    id: currentCourse.id,
    slug: currentCourse.slug,
    type: "video",
    title: currentCourse.title || "",
    subtitle: currentCourse.subtitle || null,
    description: currentCourse.description || null,
    category: currentCourse.category || null,
    instructors: (currentCourse.instructors && currentCourse.instructors.length > 0) ? currentCourse.instructors : [],
    price: currentCourse.price ? `₹${currentCourse.price}` : null,
    originalPrice: currentCourse.originalPrice ? `₹${currentCourse.originalPrice}` : null,
    rawPrice: currentCourse.price !== undefined ? Number(currentCourse.price) : 0,
    rawOriginalPrice: currentCourse.originalPrice ? Number(currentCourse.originalPrice) : null,
    image: currentCourse.thumbnailUrl || null,
    tags: currentCourse.tags?.length ? currentCourse.tags : [currentCourse.level, currentCourse.category].filter(Boolean),
    averageRating: Number(currentCourse.averageRating) || 0,
    totalReviews: Number(currentCourse.totalReviews) || 0,
    schedule: (currentCourse.startDate || currentCourse.endDate || currentCourse.timings || currentCourse.scheduleNote) ? {
      startDate: currentCourse.startDate || null,
      endDate: currentCourse.endDate || null,
      timings: currentCourse.timings || null,
      note: currentCourse.scheduleNote || null
    } : null,
    whoShouldEnrol: currentCourse.targetAudience?.length ? currentCourse.targetAudience : [],
    whatYouWillLearn: currentCourse.whatYouWillLearn?.length ? currentCourse.whatYouWillLearn : [],
    modules: (() => {
      if (!currentCourse.modules?.length) return [];

      const moduleMap = new Map();
      currentCourse.modules.forEach((m: any) => {
        moduleMap.set(m.id, {
          ...m,
          subModules: [],
          lectures: m.items?.length || 0,
          duration: m.duration || null,
          items: m.items?.map((item: any) => ({ title: item.title, type: item.type })) || []
        });
      });

      const rootModules: any[] = [];
      currentCourse.modules.forEach((m: any) => {
        const mod = moduleMap.get(m.id);
        if (m.parentId) {
          const parent = moduleMap.get(m.parentId);
          if (parent) {
            parent.subModules.push(mod);
            parent.lectures += mod.lectures;
          } else {
            rootModules.push(mod);
          }
        } else {
          rootModules.push(mod);
        }
      });

      rootModules.forEach(rm => {
        rm.subModules.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
      });
      return rootModules.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    })(),
    features: currentCourse.features?.length ? currentCourse.features : [],
    inclusions: currentCourse.inclusions?.length ? currentCourse.inclusions : [],
    hasCertificate: currentCourse.hasCertificate || false,
    hasLifetimeAccess: currentCourse.hasLifetimeAccess || false,
    teachingHours: currentCourse.teachingHours || currentCourse.duration || null,
    language: currentCourse.language || null,
    level: currentCourse.level || null,
    faqs: currentCourse.faqs || []
  };

  return (
    <div className="ac-student bg-[color:var(--sa-cream)] min-h-screen font-sans pt-6 pb-20 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <VideoCourseLayout course={mappedCourse as any} />
      </div>
    </div>
  );
}
// Reads the query string via useSearchParams, which opts the component out of
// static rendering unless it sits inside a Suspense boundary. Without this the
// whole route falls back to per-request rendering and can never be CDN-cached.
export default function CourseDetail(props: any) {
  return (
    <Suspense fallback={null}>
      <CourseDetailContent {...props} />
    </Suspense>
  );
}
