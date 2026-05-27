"use client";

import { usePathname } from "@/i18n/routing";
import { HomeDataProvider } from "@/context/HomeDataContext";
import HeaderNew from "@/components/layout/HeaderNew";

// import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";
import { useAppDispatch } from "@/data/redux/hooks";
import { restoreSession } from "@/data/features/auth/authSlice";
import { setArticles } from "@/data/features/article/articleSlice";
import { setCategories } from "@/data/features/category/categorySlice";
import { getUserSubscription } from "@/data/features/subscription/subscriptionThunks";
import { AdPopup } from "../ads/StandardAds";

export default function ClientLayout({
  children,
  initialCategories = [],
  initialHomeData = {
    latestArticles: [],
    financeArticles: [],
    legalArticles: [],
  }
}: {
  children: React.ReactNode;
  initialCategories?: any[];
  initialHomeData?: any;
}) {


  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore Categories from SSR or Cache
    if (initialCategories && initialCategories.length > 0) {
      dispatch(setCategories(initialCategories));
    } else {
      const cached = localStorage.getItem("categories");
      if (cached) {
        try {
          dispatch(setCategories(JSON.parse(cached)));
        } catch (e) { }
      }
    }

    // Restore Articles from Cache
    const cachedArticles = localStorage.getItem("articles_cache");
    if (cachedArticles) {
      try {
        dispatch(setArticles(JSON.parse(cachedArticles)));
      } catch (e) { }
    }

    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(restoreSession({ token, refreshToken, user }));
        (dispatch as any)(getUserSubscription());
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [dispatch, initialCategories]);

  const isHiddenLayout =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/server-error");

  if (isHiddenLayout) {
    return <>{children}</>;
  }

  const hiddenFooter =
    pathname.startsWith("/subscription") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/messages");

  return (
    <HomeDataProvider data={initialHomeData}>
      <HeaderNew initialCategories={initialCategories} />
      <AdPopup slotId="HOME_POPUP" />

      <div>
        {children}
      </div>
      {!hiddenFooter && <Footer />}
    </HomeDataProvider>

  );
}