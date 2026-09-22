"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Heart, Trash2, ArrowRight, BookOpen } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistDrawer() {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const router = useRouter();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isWishlistOpen]);

  if (!isWishlistOpen) return null;

  const handleCourseClick = (slug: string) => {
    closeWishlist();
    router.push(`/courses/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-[250] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1B3D]/50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={closeWishlist}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-[#C9A227] border border-amber-200/80 flex items-center justify-center">
              <Heart size={18} className="fill-[#C9A227]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">My Wishlist</h2>
              <p className="text-xs text-gray-500">
                {wishlist.length} {wishlist.length === 1 ? "course" : "courses"} saved
              </p>
            </div>
          </div>

          <button
            onClick={closeWishlist}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            aria-label="Close Wishlist"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-gray-100">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mb-4">
                <Heart size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">Your wishlist is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mb-6 leading-relaxed">
                Explore our catalog of professional legal courses and save your favorites here for later.
              </p>
              <button
                onClick={() => {
                  closeWishlist();
                  router.push("/courses");
                }}
                className="inline-flex items-center gap-2 bg-[#0B1B3D] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#152a54] transition shadow-sm"
              >
                <BookOpen size={14} /> Explore Courses
              </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id || item.slug}
                className="pt-4 first:pt-0 flex gap-3 group items-start"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => handleCourseClick(item.slug)}
                  className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 cursor-pointer border border-gray-100 group-hover:opacity-90 transition"
                >
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <BookOpen size={20} />
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="flex-1 min-w-0">
                  <h4
                    onClick={() => handleCourseClick(item.slug)}
                    className="text-xs font-bold text-gray-900 hover:text-[#C9A227] line-clamp-2 leading-snug cursor-pointer transition"
                    title={item.title}
                  >
                    {item.title}
                  </h4>

                  {item.instructor && (
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {item.instructor}
                    </p>
                  )}

                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-xs font-extrabold text-[#C9A227]">
                      {item.price ? (String(item.price).startsWith("₹") ? item.price : `₹${item.price}`) : "Free"}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through font-medium">
                        {String(item.originalPrice).startsWith("₹") ? item.originalPrice : `₹${item.originalPrice}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => removeFromWishlist(item.slug || item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                  </button>

                  <button
                    onClick={() => handleCourseClick(item.slug)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 transition"
                  >
                    View <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-slate-50 space-y-3">
            <div className="text-xs text-gray-500">
              <span>Total saved: <strong className="text-gray-800">{wishlist.length} {wishlist.length === 1 ? "course" : "courses"}</strong></span>
            </div>

            <button
              onClick={() => {
                closeWishlist();
                router.push("/courses");
              }}
              className="w-full bg-[#0B1B3D] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#152a54] transition shadow-sm flex items-center justify-center gap-1.5"
            >
              Explore More Courses <ArrowRight size={13} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
