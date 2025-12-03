"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ChevronRight, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";

// Types
import { NavItem } from "@/data/navigation";
import { UserData } from "@/data/features/profile/profile.types";

// Profile & Auth
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { logoutUser } from "@/data/features/auth/authSlice";

// Redux
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchCategories } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const { user: reduxProfileUser } = useProfileActions();
  const checkuser = reduxProfileUser as UserData;
  const avatar = checkuser?.profilePicture || null;

  useEffect(() => {
    if (reduxProfileUser && Object.keys(checkuser).length > 0) {
      setUser(checkuser);
    }
  }, [reduxProfileUser]);

  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);


  const confirmLogout = () => {
    localStorage.clear();
    dispatch(logoutUser());
    setIsProfileOpen(false);
    setShowLogoutConfirm(false);
    setMenuOpen(false);
    router.replace("/auth/login");
  };

  const hasDashboardAccess = useMemo(() => {
    if (!user?.roles) return false;
    return user.roles.some((r: any) => ["admin", "superadmin"].includes(r.name));
  }, [user]);

  const t = useTranslations('Navigation');
  const tCommon = useTranslations('Common');

  // --- Dynamic Nav Logic ---
  // 1. Prepare category names for translation (Recursive)
  const [catNamesToTranslate, setCatNamesToTranslate] = useState<string[]>([]);

  useEffect(() => {
    if (categories.length > 0 && locale !== 'en') {
      const collectNames = (cats: Category[]): string[] => {
        let names: string[] = [];
        cats.forEach(cat => {
          names.push(cat.name);
          if (cat.children && cat.children.length > 0) {
            names = names.concat(collectNames(cat.children));
          }
        });
        return names;
      };
      setCatNamesToTranslate(collectNames(categories));
    }
  }, [categories, locale]);

  // 2. Fetch translations
  const { translatedText: translatedCatNames } = useGoogleTranslate(
    locale !== 'en' && catNamesToTranslate.length > 0 ? catNamesToTranslate : null
  );

  const navItems = useMemo(() => {
    let nameIndex = 0;

    const mapToNavItem = (cat: Category): NavItem => {
      // If we have translations, use them. 
      let label = cat.name;
      if (locale !== 'en' && Array.isArray(translatedCatNames) && translatedCatNames[nameIndex]) {
        label = translatedCatNames[nameIndex];
      }
      nameIndex++;

      return {
        label: label,
        href: `/category/${cat.slug}`,
        children: cat.children?.length ? cat.children.map(mapToNavItem) : undefined,
      };
    };

    const dynamicCats = categories.map(mapToNavItem);
    const LIMIT = 6;
    const visible = dynamicCats.slice(0, LIMIT);
    const hidden = dynamicCats.slice(LIMIT);
    const final: NavItem[] = [{ label: t('home'), href: "/" }, ...visible];
    if (hidden.length > 0) final.push({ label: t('more'), children: hidden });
    return final;
  }, [categories, t, translatedCatNames, locale]);

  // --- Helper Functions ---
  const isLinkActive = (href?: string) => {
    if (!href) return false;
    if (href === "/" && pathname !== "/") return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isItemOrChildActive = (item: NavItem): boolean => {
    if (isLinkActive(item.href)) return true;
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => isItemOrChildActive(child));
    }
    return false;
  };

  const toggleMobileExpand = (label: string) => {
    setMobileExpanded((p) => ({ ...p, [label]: !p[label] }));
  };

  // --- Components ---
  const MobileMenuItem = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = mobileExpanded[item.label];
    const active = isItemOrChildActive(item);
    const isSelfActive = isLinkActive(item.href);

    return (
      <div className="flex flex-col">
        <div className={`flex items-center justify-between py-2 ${depth > 0 ? "pl-4 border-l border-gray-200 ml-2" : ""}`}>
          {hasChildren ? (
            <button onClick={() => toggleMobileExpand(item.label)} className={`flex items-center justify-between w-full hover:text-[#C9A227] ${active ? "text-[#C9A227] font-semibold" : "text-gray-800"}`}>
              <span className={depth === 0 ? "font-medium" : "text-sm"}>{item.label}</span>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <Link href={item.href || "#"} onClick={() => setMenuOpen(false)} className={`hover:text-[#C9A227] block w-full ${depth === 0 ? "font-medium" : "text-sm"} ${isSelfActive ? "text-[#C9A227] font-semibold" : "text-gray-700"}`}>
              {item.label}
            </Link>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="flex flex-col gap-1 mt-1">
            {item.children!.map((child, i) => <MobileMenuItem key={i} item={child} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  const DesktopMenuItem = ({ item }: { item: NavItem }) => {
    const hasChildren = item.children && item.children.length > 0;
    const [isOpen, setIsOpen] = useState(false);
    const active = isItemOrChildActive(item);

    if (!hasChildren) {
      return (
        <Link href={item.href || "#"} className={`hover:text-[#C9A227] whitespace-nowrap transition-colors ${active ? "text-[#C9A227] font-semibold" : "text-gray-700"}`}>
          {item.label}
        </Link>
      );
    }

    return (
      <div className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
        <button className={`flex items-center gap-1 hover:text-[#C9A227] whitespace-nowrap transition-colors ${active ? "text-[#C9A227] font-semibold" : "text-gray-700"}`}>
          {item.label} <ChevronDown size={14} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded-md py-2 min-w-[200px] z-50">
            {item.children!.map((child, i) => (
              <div key={i} className="px-4 py-2 hover:bg-gray-50 relative group/sub">
                {child.children?.length ? (
                  <div className={`flex items-center justify-between w-full cursor-pointer hover:text-[#C9A227] ${isItemOrChildActive(child) ? "text-[#C9A227]" : "text-gray-700"}`}>
                    <span>{child.label}</span>
                    <ChevronRight size={14} />
                    <div className="absolute left-full top-0 bg-white border border-gray-200 shadow-lg rounded-md py-2 min-w-[200px] hidden group-hover/sub:block">
                      {child.children.map((subChild, j) => (
                        <Link key={j} href={subChild.href || "#"} className={`block px-4 py-2 hover:bg-gray-50 text-sm hover:text-[#C9A227] ${isLinkActive(subChild.href) ? "text-[#C9A227] font-semibold" : "text-gray-700"}`}>
                          {subChild.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link href={child.href || "#"} className={`block text-sm hover:text-[#C9A227] ${isLinkActive(child.href) ? "text-[#C9A227] font-semibold" : "text-gray-700"}`}>
                    {child.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="w-full border-b border-gray-200 bg-white z-50 fixed top-0 left-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <Image src={logo} alt="Logo" className="object-contain" width={140} height={40} priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item, i) => <DesktopMenuItem key={i} item={item} />)}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200">
              <Globe size={14} className="text-gray-500" />
              <button
                onClick={() => switchLocale("en")}
                className={`text-xs font-medium transition-colors ${locale === "en" ? "text-[#C9A227] font-bold" : "text-gray-500 hover:text-gray-700"}`}
              >
                EN
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => switchLocale("hi")}
                className={`text-xs font-medium transition-colors ${locale === "hi" ? "text-[#C9A227] font-bold" : "text-gray-500 hover:text-gray-700"}`}
              >
                HI
              </button>
            </div>

            {user ? (
              <div
                className="relative"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button className="flex items-center gap-2 focus:outline-none py-2">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 overflow-hidden border-2 border-[#C9A227]">
                    {avatar ? <Image src={avatar} alt="Avatar" width={40} height={40} className="object-cover w-full h-full" /> : (user?.name?.[0] || "U").toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-800 hover:text-[#C9A227] transition-colors">
                    {user?.name}
                  </span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>


                <div
                  className={`absolute right-0 top-full w-48 bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-200 transform origin-top-right z-50 ${isProfileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                >
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#C9A227]"
                    >
                      <UserIcon size={16} /> {t('profile')}
                    </Link>

                    {hasDashboardAccess && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#C9A227]"
                      >
                        <LayoutDashboard size={16} /> {t('dashboard')}
                      </Link>
                    )}

                    <div className="h-px bg-gray-100 my-1 mx-2" />

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> {t('logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href="/auth/login"><button className="rounded-full bg-[#C9A227] text-white px-5 py-2 hover:bg-[#b39022] text-sm font-medium transition-colors">{t('login').toUpperCase()}</button></Link>
                <Link href="/subscription"><button className="rounded-full border border-[#C9A227] text-[#C9A227] px-5 py-2 hover:bg-[#C9A227] hover:text-white text-sm font-medium transition-colors">{t('subscription').toUpperCase()}</button></Link>
              </>
            )}
          </div>

          <div className="lg:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-700 hover:text-[#C9A227]">
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 w-full h-[calc(100vh-80px)] overflow-y-auto shadow-lg absolute top-20 left-0 z-40 pb-20">
            <nav className="flex flex-col p-5 gap-2">
              <div className="mb-4 border-b border-gray-200 pb-4">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 overflow-hidden">{(user?.name?.[0] || "U").toUpperCase()}</div>
                      <div><p className="font-medium text-gray-800">{user?.name}</p><p className="text-xs text-gray-500">{user?.email}</p></div>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><UserIcon size={16} /> Profile</Link>
                    {hasDashboardAccess && <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><LayoutDashboard size={16} /> Dashboard</Link>}

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Link href="/auth/login" className="flex-1" onClick={() => setMenuOpen(false)}><button className="w-full rounded-full bg-[#C9A227] text-white px-5 py-2 text-sm font-medium">Login</button></Link>
                    <Link href="/subscription" className="flex-1" onClick={() => setMenuOpen(false)}><button className="w-full rounded-full border border-[#C9A227] text-[#C9A227] px-5 py-2 text-sm font-medium hover:bg-[#C9A227] hover:text-white">SUBSCRIPTION</button></Link>
                  </div>
                )}
              </div>

              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-3 mb-4 px-2">
                <span className="text-sm font-medium text-gray-600">Language:</span>
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200">
                  <button
                    onClick={() => { switchLocale("en"); setMenuOpen(false); }}
                    className={`text-xs font-medium transition-colors ${locale === "en" ? "text-[#C9A227] font-bold" : "text-gray-500"}`}
                  >
                    English
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => { switchLocale("hi"); setMenuOpen(false); }}
                    className={`text-xs font-medium transition-colors ${locale === "hi" ? "text-[#C9A227] font-bold" : "text-gray-500"}`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {navItems.map((item, i) => <MobileMenuItem key={i} item={item} />)}
            </nav>
          </div>
        )}
      </header>


      {showLogoutConfirm && (
        <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={confirmLogout} />
      )}
    </>
  );
}

function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onCancel} />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 border border-gray-100 transform transition-all scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <LogOut className="text-red-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Logout?</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Are you sure you want to Logout of your account? You will need to login again to access your profile.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md shadow-red-600/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}