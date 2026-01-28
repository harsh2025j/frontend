"use client";

import { usePathname } from "@/i18n/routing";
import HeaderNew from "@/components/layout/HeaderNew";
// import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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