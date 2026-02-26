"use client";

import { usePathname } from "@/i18n/routing";
import HeaderNew from "@/components/layout/HeaderNew";
// import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreSession } from "@/data/features/auth/authSlice";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(restoreSession({ token, user }));
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
    <>
      <HeaderNew />
      <div className="mt-[100px] lg:mt-[176px]">
        {children}
      </div>
      {!hiddenFooter && <Footer />}
    </>
  );
}