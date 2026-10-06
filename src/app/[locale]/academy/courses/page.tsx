"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Filter, ChevronLeft, Loader2, Star, Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchAllCourses } from '@/data/features/academy/course/courseThunks';
import { useRouter } from 'next/navigation';
import { courseApi } from '@/data/services/academy-service/course.service';
import { useWishlist } from '@/context/WishlistContext';

// ── Component ───────────────────────────────────────────────
export default function CoursesPage() {
  const router = useRouter();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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
    .filter(course => course.status === 'published' && course.slug)
    .map(course => {
      const p = Number(course.price) || 0;
      const op = course.originalPrice ? Number(course.originalPrice) : null;
      const discountPct = op && op > p ? Math.round(((op - p) / op) * 100) : null;

      return {
        slug: course.slug as string,
        title: course.title,
        instructor: course.instructors?.[0]?.name || "Sajjad Husain Legal Academy",
        price: `₹${course.price}`,
        originalPrice: op ? `₹${op}` : null,
        discountPct,
        image: course.thumbnailUrl || "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop",
        category: course.category || "General",
        averageRating: Number(course.averageRating) || 0,
        totalReviews: Number(course.totalReviews) || 0,
      };
    });

  const filteredCourses = mappedCourses.filter(course =>
    selectedCategory === "All Categories" || course.category === selectedCategory
  );

  return (
    <div className="ac-student bg-[color:var(--sa-cream)] min-h-screen font-sans pt-6 sm:pt-10 pb-20">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Bar: Back Button on Left & Category Dropdown on Right at Same Level in Mobile */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#122340]/70 hover:text-[#C9A227] transition-colors group cursor-pointer"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          {/* Mobile Category Dropdown on Right */}
          <div className="relative sm:hidden" ref={dropdownRef}>
            <button
              onClick={() => setIsCategoryOpen(prev => !prev)}
              className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-gray-200 shadow-xs text-xs font-semibold text-[#122340] hover:border-[#C9A227] transition-all cursor-pointer active:scale-95"
              aria-expanded={isCategoryOpen}
            >
              <Filter size={13} className="text-[#C9A227]" />
              <span className="max-w-[120px] truncate">{selectedCategory}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  Select Category
                </div>
                <div className="max-h-64 overflow-y-auto py-1 hide-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[#C9A227]/10 text-[#C9A227] font-bold'
                          : 'text-[#122340]/80 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {selectedCategory === cat && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar: Category Horizontal List for Desktop / Tablet */}
        <div className="hidden sm:flex mb-10 overflow-x-auto hide-scrollbar whitespace-nowrap gap-3 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C9A227] text-white shadow-md'
                  : 'bg-white text-[#122340]/70 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-xs border border-gray-100 flex flex-col h-full">
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
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-[#122340]/50">
            <p>No courses found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <Link href={`/courses/${course.slug}`} key={course.slug} className="group block">
                <div className="bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgb(0,0,0,0.06)] border border-[#122340]/10 flex flex-col h-full hover:border-[#C9A227] transition-colors duration-300">

                  {/* Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-[#122340]/5">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {course.category === 'Criminal Law' && (
                      <span className="absolute top-2 left-2 bg-[#122340] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        Package
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist({
                          id: String((course as any).id || course.slug),
                          slug: course.slug,
                          title: course.title,
                          thumbnailUrl: course.image,
                          price: course.price,
                          originalPrice: course.originalPrice,
                          instructor: course.instructor,
                        });
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition text-gray-400 hover:text-red-500 z-10"
                      aria-label="Wishlist course"
                      title={isInWishlist(course.slug) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        size={15}
                        className={isInWishlist(course.slug) ? "fill-red-500 text-red-500" : ""}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-[15px] text-[#122340] mb-2 leading-snug line-clamp-3">
                      {course.title}
                    </h3>

                    <p className="text-[#122340]/60 text-xs mb-2">
                      {course.instructor}
                    </p>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-1.5 mb-3 text-xs">
                      {course.totalReviews > 0 ? (
                        <>
                          <div className="flex items-center text-[#C9A227]">
                            <Star size={13} className="fill-[#C9A227]" />
                            <span className="font-bold ml-1 text-slate-800">
                              {Number(course.averageRating).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            ({course.totalReviews} {course.totalReviews === 1 ? "review" : "reviews"})
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center text-slate-400 text-[11px]">
                          <Star size={12} className="text-slate-300 mr-1" />
                          <span>New (0 reviews)</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-[#122340]/5 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[#C9A227] font-bold text-lg">{course.price}</span>
                        {course.originalPrice && (
                          <span className="text-[#122340]/40 line-through text-xs font-medium">
                            {course.originalPrice}
                          </span>
                        )}
                      </div>
                      {course.discountPct && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {course.discountPct}% OFF
                        </span>
                      )}
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
