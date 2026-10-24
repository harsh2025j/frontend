"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Settings,
  Menu,
  X,
  Video,
  ChevronDown,
  Home,
  Loader2,
  LogOut,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/data/features/auth/useAuthActions';
import { useAppDispatch } from '@/data/redux/hooks';
import { logoutUserAsync } from '@/data/features/auth/authThunks';
import { authApi } from '@/data/services/auth-service/auth-service';
import { restoreSession, updateAuthUser } from '@/data/features/auth/authSlice';
import AcademyNotificationDropdown from '../components/AcademyNotificationDropdown';

const SIDEBAR_NAV = [
  {
    label: 'Learning',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My courses', href: '/dashboard/courses', icon: BookOpen },
      { name: 'Live classes', href: '/dashboard/live-sessions', icon: Video },
    ],
  },
  {
    label: 'Record',
    items: [
      { name: 'Certificates', href: '/dashboard/certificates', icon: Award },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

/** Flat list used to resolve the current page title for the top rail. */
const FLAT_NAV = SIDEBAR_NAV.flatMap((g) => g.items);

function isStudent(u: any): boolean {
  return Boolean(
    u?.roles?.some(
      (r: any) =>
        r?.slug === 'student' ||
        r?.name?.toLowerCase() === 'student' ||
        r?.slug?.toLowerCase() === 'student' ||
        r === 'student' ||
        (typeof r === 'string' && r.toLowerCase() === 'student')
    )
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // 1. Redux already has the user
    if (user && user.roles && user.roles.length > 0) {
      if (!isStudent(user)) {
        router.push('/join');
      }
      return;
    }

    // 2. localStorage has a cached user — restore and check
    if (typeof window !== 'undefined') {
      try {
        const storedStr = localStorage.getItem('user');
        if (storedStr) {
          const storedUser = JSON.parse(storedStr);
          if (storedUser && storedUser.roles && storedUser.roles.length > 0) {
            dispatch(
              restoreSession({
                token,
                refreshToken: localStorage.getItem('refreshToken') || '',
                user: storedUser,
              })
            );
            if (!isStudent(storedUser)) {
              router.push('/join');
            }
            return;
          }
        }
      } catch (err) {
        console.error('Failed to parse cached user', err);
      }
    }

    // 3. Fallback: fetch a fresh profile so the DB state wins
    authApi
      .getProfile()
      .then((res: any) => {
        const fetchedUser = res.data?.user || res.data?.data || res.data;
        if (fetchedUser) {
          dispatch(updateAuthUser(fetchedUser));
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(fetchedUser));
          }
          if (!isStudent(fetchedUser)) {
            router.push('/join');
          }
        } else {
          router.push('/auth/login');
        }
      })
      .catch((err) => {
        console.error('Session verification failed', err);
        if (err?.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          router.push('/auth/login');
        }
      });
  }, [router, user, dispatch]);

  // Close the mobile drawer and the user popover on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Lock background scroll while the drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  // Controlled popover — the previous hover-only menu was unreachable by
  // keyboard and on touch devices.
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logoutUserAsync());
      router.push('/auth/login');
    } finally {
      setIsLoggingOut(false);
      setIsSidebarOpen(false);
      setShowLogoutModal(false);
    }
  };

  const isNavActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/live-sessions') {
      return pathname?.startsWith('/dashboard/live-sessions') || pathname?.startsWith('/dashboard/live-classes');
    }
    return Boolean(pathname?.startsWith(href));
  };

  const currentPage =
    FLAT_NAV.find((i) => i.href !== '/dashboard' && pathname?.startsWith(i.href))?.name ||
    'Overview';

  const initial = user?.name?.charAt(0).toUpperCase();


  const brand = (
    <Link href="/" className="group flex items-center gap-3.5 focus:outline-hidden">
      <Image
        src="/logo-gold.png"
        alt="Sajjad Husain Legal Academy"
        width={46}
        height={46}
        className="shrink-0 object-contain"
        priority
      />
      <span className="flex flex-col leading-tight whitespace-nowrap">
        <span className="ac-display text-[16px] sm:text-[17px] font-bold uppercase tracking-[0.08em] !text-white">
          Sajjad Husain
        </span>
        <span className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
          Legal Academy
        </span>
      </span>
    </Link>
  );

  const navTree = SIDEBAR_NAV.map((group) => (
    <div key={group.label} className="ac-side-group">
      <p className="ac-side-group-label">{group.label}</p>
      <nav className="space-y-0.5">
        {group.items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`ac-side-link ${active ? 'ac-side-link-active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  ));

  const sidebarFooter = (
    <div className="ac-side-foot">
      <Link
        href="/"
        className="ac-side-link mb-1"
        onClick={() => setIsSidebarOpen(false)}
      >
        <Home size={17} strokeWidth={1.8} />
        Academy home
      </Link>
      <button
        type="button"
        onClick={() => setShowLogoutModal(true)}
        className="ac-side-link w-full !text-[color:#F0A9A0] hover:!bg-[rgba(200,50,42,0.14)] hover:!text-[#FFC8C2]"
      >
        <LogOut size={17} strokeWidth={1.8} />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="ac-student relative min-h-screen bg-[color:var(--sa-cream)]">

      {/* ═══════════ Sidebar (desktop) ═══════════ */}
      <aside className="ac-side ac-scroll-dark fixed inset-y-0 left-0 z-30 hidden w-[var(--sa-side-w)] flex-col overflow-y-auto lg:flex">
        <div className="ac-side-brand">{brand}</div>
        <div className="flex flex-1 flex-col py-4">
          {navTree}
          {sidebarFooter}
        </div>
      </aside>

      {/* ═══════════ Drawer (mobile) ═══════════ */}
      {isSidebarOpen && (
        <>
          <div
            className="ac-overlay z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="ac-side ac-scroll-dark fixed inset-y-0 left-0 z-50 flex w-[min(84vw,var(--sa-side-w))] flex-col overflow-y-auto lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
          >
            <div className="ac-side-brand justify-between">
              {brand}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close navigation"
              >
                <X size={19} />
              </button>
            </div>
            <div className="flex flex-1 flex-col py-4">
              {navTree}
              {sidebarFooter}
            </div>
          </aside>
        </>
      )}

      {/* ═══════════ Main column ═══════════ */}
      <div className="flex min-h-screen min-w-0 flex-col lg:ml-[var(--sa-side-w)]">

        {/* Top rail */}
        <header className="ac-rail sticky top-0 z-30 gap-2 sm:gap-3 px-3 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="-ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-[color:var(--sa-ink-2)] transition-colors hover:bg-[color:var(--sa-cream-2)] lg:hidden"
            aria-label="Open navigation"
            aria-expanded={isSidebarOpen}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb — tells you where you are without a second heading */}
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 sm:gap-2 text-[12.5px] sm:text-[13px]">
              <li className="hidden sm:block">
                <span className="text-[color:var(--sa-ink-4)]">Dashboard</span>
              </li>
              <li aria-hidden="true" className="hidden text-[color:var(--sa-ink-5)] sm:block">
                /
              </li>
              <li className="min-w-0 truncate font-semibold text-[color:var(--sa-ink)]">
                {currentPage}
              </li>
            </ol>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <Link href="/courses" className="ac-btn ac-btn-quiet hidden sm:inline-flex">
              <BookOpen size={16} />
              Browse courses
            </Link>

            {user && (user._id || (user as any).id) && (
              <AcademyNotificationDropdown userId={user._id || (user as any).id} />
            )}

            <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-[color:var(--sa-line)] sm:block" />

            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-1.5 sm:gap-2 rounded-[var(--sa-r-pill)] p-1 pr-1.5 transition-colors hover:bg-[color:var(--sa-cream-2)] sm:pr-2"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt=""
                      className="ac-avatar border border-[color:var(--sa-line)] object-cover"
                    />
                  ) : (
                    <span className="ac-avatar">{initial}</span>
                  )}
                  <span className="hidden max-w-[8rem] truncate text-[13px] font-semibold text-[color:var(--sa-ink)] sm:block">
                    {user.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`hidden text-[color:var(--sa-ink-4)] transition-transform sm:block ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div role="menu" className="ac-menu absolute right-0 top-full mt-2 w-60">
                    <div className="ac-menu-head">
                      <p className="truncate text-[13px] font-semibold text-[color:var(--sa-ink)]">
                        {user.name}
                      </p>
                      <p className="ac-mono mt-0.5 truncate text-[color:var(--sa-ink-3)]">
                        {user.email}
                      </p>
                    </div>
                    <div className="ac-menu-list">
                      <Link
                        href="/dashboard/settings"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="ac-menu-item"
                      >
                        <Settings size={15} className="text-[color:var(--sa-ink-4)]" />
                        Account settings
                      </Link>
                      <Link href="/" role="menuitem" onClick={() => setIsUserMenuOpen(false)} className="ac-menu-item">
                        <ExternalLink size={15} className="text-[color:var(--sa-ink-4)]" />
                        Academy home
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="ac-menu-item ac-menu-item-danger"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page body */}
        <main className="sa-shell min-w-0 flex-1">
          <div className="mx-auto min-w-0 max-w-[1320px] px-3.5 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10 pb-16 sm:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* ═══════════ Sign-out confirmation ═══════════ */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="ac-overlay" onClick={() => setShowLogoutModal(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ac-dash-logout-title"
            className="ac-modal z-10 max-w-sm"
          >
            <div className="ac-modal-body text-center">
              <span className="ac-icon-tile ac-icon-tile-clay ac-icon-tile-xl mx-auto !rounded-full">
                <AlertTriangle size={24} />
              </span>
              <h2 id="ac-dash-logout-title" className="ac-display ac-h3 mb-2 mt-4">
                Sign out of the Academy?
              </h2>
              <p className="text-[13.5px] leading-relaxed text-[color:var(--sa-ink-3)]">
                You will need to sign in again to reach your courses. Any saved progress on
                your current lessons remains intact.
              </p>
            </div>
            <div className="ac-modal-foot">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="ac-btn ac-btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="ac-btn ac-btn-danger flex-1"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Signing out…
                  </>
                ) : (
                  'Sign out'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
