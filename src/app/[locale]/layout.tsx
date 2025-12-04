import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ClientLayout from "@/components/layout/ClientWrapper";
import ReduxProvider from "@/data/redux/providers/ReduxProvider";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@/components/ui/GlobalLoader";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  icons: {
    icon: "/logo.png",
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            <ReduxProvider>
              <ClientLayout>{children}</ClientLayout>
              {/* <GlobalLoader /> */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  // Prevent duplicate toasts
                  style: {
                    maxWidth: '500px',
                  },
                }}
              />
            </ReduxProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


