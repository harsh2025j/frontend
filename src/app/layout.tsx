import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientWrapper";
import ReduxProvider from "@/data/redux/providers/ReduxProvider";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@/components/ui/GlobalLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sajjad Husain Law Associates",
  description: "Next-Gen Legal Tech",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <ClientLayout>{children}</ClientLayout>
          {/* <GlobalLoader /> */}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </ReduxProvider>
      </body>
    </html>
  );
}

