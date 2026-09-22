"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export interface WishlistCourse {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string;
  price?: number | string | null;
  originalPrice?: number | string | null;
  instructor?: string;
  level?: string;
  category?: string;
}

interface WishlistContextType {
  wishlist: WishlistCourse[];
  isInWishlist: (slugOrId: string) => boolean;
  addToWishlist: (course: WishlistCourse) => void;
  removeFromWishlist: (slugOrId: string) => void;
  toggleWishlist: (course: WishlistCourse) => void;
  clearWishlist: () => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "sh_academy_wishlist";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistCourse[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load wishlist from storage:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync to localStorage whenever wishlist changes (after initial load)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to storage:", e);
    }
  }, [wishlist, isInitialized]);

  const isInWishlist = useCallback(
    (slugOrId: string): boolean => {
      if (!slugOrId) return false;
      return wishlist.some(
        (item) => item.slug === slugOrId || item.id === slugOrId
      );
    },
    [wishlist]
  );

  const addToWishlist = useCallback(
    (course: WishlistCourse) => {
      setWishlist((prev) => {
        if (prev.some((item) => item.slug === course.slug || item.id === course.id)) {
          return prev;
        }
        return [...prev, course];
      });

      toast.success(`Added "${course.title}" to Wishlist!`, {
        id: `wishlist-toast-${course.slug || course.id}`,
        duration: 2500,
      });
    },
    []
  );

  const removeFromWishlist = useCallback(
    (slugOrId: string) => {
      setWishlist((prev) =>
        prev.filter((item) => item.slug !== slugOrId && item.id !== slugOrId)
      );

      toast.success("Removed from Wishlist", {
        id: `wishlist-toast-${slugOrId}`,
        duration: 2000,
      });
    },
    []
  );

  const toggleWishlist = useCallback(
    (course: WishlistCourse) => {
      const exists = wishlist.some(
        (item) => item.slug === course.slug || item.id === course.id
      );
      if (exists) {
        removeFromWishlist(course.slug || course.id);
      } else {
        addToWishlist(course);
      }
    },
    [wishlist, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    toast.success("Wishlist cleared");
  }, []);

  const openWishlist = useCallback(() => setIsWishlistOpen(true), []);
  const closeWishlist = useCallback(() => setIsWishlistOpen(false), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        openWishlist,
        closeWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
