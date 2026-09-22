"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import AcademyNavbar from './AcademyNavbar';
import AcademyFooter from './AcademyFooter';
import WishlistDrawer from './WishlistDrawer';
import { WishlistProvider } from '@/context/WishlistContext';

export default function AcademyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const hideNavigation = pathname.includes('/dashboard') || pathname.includes('/learn') || pathname.includes('/auth');
  const hideFooter = hideNavigation || pathname.includes('/certificates/verify') || pathname.includes('/verify-certificate');

  return (
    <WishlistProvider>
      <div className="ac-root min-h-screen selection:bg-yellow-500/20 flex flex-col" style={{ background: 'var(--ac-bg-base)', color: 'var(--ac-text-primary)', fontFamily: "'Inter', sans-serif" }}>
        {!hideNavigation && <AcademyNavbar />}
        <main className={`flex-grow flex flex-col ${!hideNavigation ? 'pt-16' : ''}`}>
          {children}
        </main>
        {!hideFooter && <AcademyFooter />}
        <WishlistDrawer />
      </div>
    </WishlistProvider>
  );
}
