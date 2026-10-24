"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Filter,
  Star,
  Heart,
  ArrowLeft,
  ArrowRight,
  User,
  BookOpen,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchAllCourses } from "@/data/features/academy/course/courseThunks";
import { useRouter } from "next/navigation";
import { courseApi } from "@/data/services/academy-service/course.service";
import { useWishlist } from "@/context/WishlistContext";

export default function CoursesPage() {
  const router = useRouter();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { courses, isLoading, error } = useAppSelector((state) => state.course);
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    dispatch(fetchAllCourses());

    const fetchCats = async () => {
      try {
        const res = await courseApi.fetchCategories();
        if (res.data && Array.isArray(res.data)) {
          setCategories(["All Categories", ...res.data.map((c: any) => c.name)]);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, [dispatch]);

  const mappedCourses = courses
    .filter((course) => course.status === "published" && course.slug)
    .map((course) => {
      const p = Number(course.price) || 0;
      const op = course.originalPrice ? Number(course.originalPrice) : null;
      const discountPct = op && op > p ? Math.round(((op - p) / op) * 100) : null;

      return {
        id: (course as any).id || (course as any)._id || course.slug,
        slug: course.slug as string,
        title: course.title,
        instructor: course.instructors?.[0]?.name || "Sajjad Husain Legal Academy",
        price: `₹${course.price}`,
        originalPrice: op ? `₹${op}` : null,
        discountPct,
        image:
          course.thumbnailUrl ||
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop",
        category: course.category || "General",
        averageRating: Number(course.averageRating) || 0,
        totalReviews: Number(course.totalReviews) || 0,
      };
    });

  const filteredCourses = mappedCourses.filter((course) => {
    return (
      selectedCategory === "All Categories" || course.category === selectedCategory
    );
  });

  return (
    <div className="ac-student bg-[color:var(--sa-cream)] min-h-screen font-sans pt-6 sm:pt-8 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/academy"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border-2 border-slate-300 text-xs sm:text-sm font-bold text-[#08172D] hover:border-[#8A6100] hover:text-[#8A6100] shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft
              size={15}
              className="text-[#08172D] group-hover:text-[#8A6100] group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Academy Home</span>
          </Link>

          {/* Mobile Category Dropdown on Right */}
          <div className="relative sm:hidden" ref={dropdownRef}>
            <button
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border-2 border-slate-300 shadow-2xs text-xs font-bold text-[#08172D] hover:border-[#8A6100] transition-all cursor-pointer active:scale-95"
              aria-expanded={isCategoryOpen}
            >
              <Filter size={13} className="text-[#8A6100]" />
              <span className="max-w-[130px] truncate">{selectedCategory}</span>
              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform duration-200 ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCategoryOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Legal Specialization
                </div>
                <div className="max-h-64 overflow-y-auto py-1 hide-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                        selectedCategory === cat
                          ? "bg-[#08172D] text-white font-bold"
                          : "text-[#08172D] hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {selectedCategory === cat && (
                        <span className="w-2 h-2 rounded-full bg-[#E8CD82] shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            CATEGORY FILTER CHIPS (DESKTOP & TABLET)
        ====================================================== */}
        <div className="hidden sm:flex mb-6 overflow-x-auto hide-scrollbar whitespace-nowrap gap-2.5 py-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#08172D] text-white border-2 border-[#08172D] shadow-md ring-2 ring-[#08172D]/20"
                    : "bg-white text-[#08172D] hover:bg-slate-50 border-2 border-slate-300 hover:border-[#08172D] shadow-2xs"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results Counter & Reset Filter Option */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
            Showing{" "}
            <span className="font-extrabold text-[#08172D]">{filteredCourses.length}</span>{" "}
            {filteredCourses.length === 1 ? "Course" : "Courses"}
            {selectedCategory !== "All Categories" && (
              <span className="ml-2 font-normal text-slate-500 normal-case">
                in <strong className="text-[#08172D]">{selectedCategory}</strong>
              </span>
            )}
          </p>

          {selectedCategory !== "All Categories" && (
            <button
              onClick={() => setSelectedCategory("All Categories")}
              className="text-xs font-bold text-[#8A6100] underline decoration-[#B8860B] hover:text-[#6D4C00] cursor-pointer"
            >
              Show all categories
            </button>
          )}
        </div>

        {/* =====================================================
            COURSES GRID / STATES
        ====================================================== */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border-2 border-slate-200 flex flex-col h-full"
              >
                <div className="aspect-video w-full bg-slate-200" />
                <div className="p-5 flex flex-col flex-grow space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-4/5" />
                  <div className="h-4 bg-slate-200 rounded w-3/5" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/4 mt-auto pt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-red-200 p-8 max-w-lg mx-auto shadow-sm">
            <p className="text-red-600 font-bold text-sm mb-4">{error}</p>
            <button
              onClick={() => dispatch(fetchAllCourses())}
              className="px-4 py-2 rounded-xl bg-[#08172D] text-white text-xs font-extrabold hover:bg-[#0B2242] transition-colors cursor-pointer"
            >
              Retry Loading Courses
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF6E2] border border-[#E8CD82] text-[#8A6100] flex items-center justify-center mx-auto mb-4">
              <BookOpen size={26} />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#08172D] mb-2">
              No Courses Found
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
              No published courses currently found in &ldquo;{selectedCategory}&rdquo;.
            </p>
            <button
              onClick={() => setSelectedCategory("All Categories")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#08172D] hover:bg-[#0B2242] text-white font-extrabold text-sm transition-all shadow-md cursor-pointer"
            >
              <span>View All Courses</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <Link
                href={`/courses/${course.slug}`}
                key={course.slug}
                className="group block h-full"
              >
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200/90 hover:border-[#B8860B]  transition-all duration-300 flex flex-col h-full">

                  {/* Image & Badges */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* High-Contrast Category Badge */}
                    <span className="absolute top-2.5 left-2.5 bg-[#08172D]/95 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/20 shadow-md">
                      {course.category}
                    </span>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist({
                          id: String(course.id || course.slug),
                          slug: course.slug,
                          title: course.title,
                          thumbnailUrl: course.image,
                          price: course.price,
                          originalPrice: course.originalPrice,
                          instructor: course.instructor,
                        });
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/95 hover:bg-white border border-slate-200 shadow-md transition-all text-slate-400 hover:text-red-500 z-10 cursor-pointer"
                      aria-label="Wishlist course"
                      title={
                        isInWishlist(course.slug)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        size={15}
                        className={
                          isInWishlist(course.slug)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Course Title */}
                    <h3 className="font-serif font-bold text-base sm:text-[17px] text-[#08172D] group-hover:text-[#8A6100] transition-colors leading-snug line-clamp-2 mb-2">
                      {course.title}
                    </h3>

                    {/* Instructor Row */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2.5">
                      <User size={13} className="text-[#8A6100] shrink-0" />
                      <span className="truncate">{course.instructor}</span>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-1.5 mb-3 text-xs">
                      {course.totalReviews > 0 ? (
                        <>
                          <div className="flex items-center text-[#D97706]">
                            <Star size={13} className="fill-[#D97706]" />
                            <span className="font-black ml-1 text-slate-900">
                              {Number(course.averageRating).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-slate-500 font-medium text-[11px]">
                            ({course.totalReviews}{" "}
                            {course.totalReviews === 1 ? "review" : "reviews"})
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center text-slate-400 text-[11px] font-medium">
                          <Star size={12} className="text-slate-300 mr-1" />
                          <span>New Course</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Action Footer */}
                    <div className="mt-auto pt-3.5 border-t-2 border-slate-100 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[#08172D] font-black text-xl tracking-tight">
                          {course.price}
                        </span>
                        {course.originalPrice && (
                          <span className="text-slate-400 line-through text-xs font-semibold">
                            {course.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {course.discountPct && (
                          <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                            {course.discountPct}% OFF
                          </span>
                        )}
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#08172D] flex items-center justify-center transition-colors">
                          <ArrowRight
                            size={15}
                            className="text-[#08172D] group-hover:text-white transition-transform group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
