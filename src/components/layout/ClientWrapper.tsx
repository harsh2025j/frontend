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
import { messaging } from "@/config/firebase";
import { onMessage } from "firebase/messaging";
import toast from "react-hot-toast";
import { Bell, X } from "lucide-react";

export default function ClientLayout({
  children,
  initialCategories = [],
  initialHomeData = {
    latestArticles: [],
    financeArticles: [],
    legalArticles: [],
  },
  isAcademySubdomain = false,
}: {
  children: React.ReactNode;
  initialCategories?: any[];
  initialHomeData?: any;
  isAcademySubdomain?: boolean;
}) {


  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        // console.log("Foreground Message received: ", payload);
        if (payload.notification) {
          toast.dismiss('push-notification');
          toast((t) => (
            <div className="flex items-start gap-3 relative pr-4 w-full max-w-sm">
              <Bell className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <strong className="text-sm font-semibold block truncate">{payload.notification?.title}</strong>
                <p className="text-sm text-gray-600 mt-1 break-all line-clamp-2">{payload.notification?.body}</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="absolute -top-1.5 -right-3 text-gray-400 hover:text-gray-800 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ), {
            id: 'push-notification',
            duration: 5000,
            position: 'top-center',
            style: { minWidth: '300px', maxWidth: '400px' }
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

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
    isAcademySubdomain ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/server-error") ||
    pathname.startsWith("/academy");

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