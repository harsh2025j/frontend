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
    pathname.startsWith("/notes") ||
    pathname.startsWith("/subscription") ||
    pathname.startsWith("/ai-assistant") ||
    pathname.startsWith("/server-error");

  if (isHiddenLayout) {
    return <>{children}</>;
  }

  return (
    <>
      {/* <HeaderNew /> */}
      <HeaderNew />
      {/* Add margin-top equal to new header height (top bar 40px + main header 80px + nav 56px = 176px, using 130px for mobile) */}
      <div className="mt-[130px] lg:mt-[176px]">
        {children}
      </div>
      <Footer />
    </>
  );
}