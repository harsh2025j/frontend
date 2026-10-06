import React from "react";
import AdminLayoutClient from "./AdminLayoutClient";

// The admin panel is auth-gated and user-specific. It must never be
// prerendered or served from the CDN cache.
//
// This has to live in a Server Component: Next.js ignores route segment
// config exported from a file marked "use client", so the previous client
// layout could not opt itself out. The client UI now lives in
// AdminLayoutClient and this thin server wrapper carries the config, which
// applies to every route nested under /[locale]/admin.
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
