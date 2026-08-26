"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import AcademyNavbar from './AcademyNavbar';
import AcademyFooter from './AcademyFooter';

export default function AcademyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const hideNavigation = pathname.includes('/dashboard') || pathname.includes('/learn') || pathname.includes('/auth');

  return (
    <div className="ac-root min-h-screen selection:bg-yellow-500/20 flex flex-col" style={{ background: 'var(--ac-bg-base)', color: 'var(--ac-text-primary)', fontFamily: "'Inter', sans-serif" }}>
      {!hideNavigation && <AcademyNavbar />}
      <main className={`flex-grow flex flex-col ${!hideNavigation ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!hideNavigation && <AcademyFooter />}
    </div>
  );
}
