"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
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
      <Header />
      {/* Add margin-top equal to header height */}
      <div className="mt-20">
        {children}
      </div>
      <Footer />
    </>
  );
}
