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

  const dispatch = useAppDispatch();
  const { courses, isLoading, error } = useAppSelector((state) => state.course);
  const { isInWishlist, toggleWishlist } = useWishlist();

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
    <div className="bg-[#fcfcfa] min-h-screen font-sans pt-10 pb-20">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button */}
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#122340]/60 hover:text-[#C9A227] mb-8 transition-colors group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Toolbar: Category Horizontal List */}
        <div className="mb-10 overflow-x-auto hide-scrollbar whitespace-nowrap flex gap-3 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                  ? 'bg-[#C9A227] text-white shadow-md'
                  : 'bg-white text-[#122340]/70 hover:bg-gray-50 border border-gray-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#C9A227]" size={48} />
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
