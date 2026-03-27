"use client";

import { usePathname } from "@/i18n/routing";
import { HomeDataProvider } from "@/context/HomeDataContext";
import HeaderNew from "@/components/layout/HeaderNew";

// import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";
import { useAppDispatch } from "@/data/redux/hooks";
import { restoreSession } from "@/data/features/auth/authSlice";
import { getUserSubscription } from "@/data/features/subscription/subscriptionThunks";

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
  }, [dispatch]);

  const isHiddenLayout =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/server-error");

  if (isHiddenLayout) {
    return <>{children}</>;
  }

  const hiddenFooter =
    pathname.startsWith("/subscription") ||
    pathname.startsWith("/profile");

  return (
    <HomeDataProvider data={initialHomeData}>
      <HeaderNew initialCategories={initialCategories} />

      <div className="mt-[100px] lg:mt-[176px]">
        {children}
      </div>
      {!hiddenFooter && <Footer />}
    </HomeDataProvider>

  );
}