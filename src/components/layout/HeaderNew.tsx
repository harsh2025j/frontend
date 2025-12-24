"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "@/i18n/routing";
import {
    Menu, X, ChevronDown, ChevronRight, LogOut, LayoutDashboard,
    User as UserIcon, Search, Bell, Scale, Globe, Mail, Phone,
    Facebook, Twitter, Linkedin, Instagram
} from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo-gold.png";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

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
import SearchWithDropdown from "../ui/SearchWithDropdown";

const SubCategoryItem = ({ item, closeMenu }: { item: NavItem; closeMenu: () => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const pathname = usePathname();
    const hasSubItems = item.children && item.children.length > 0;

    const isSelfActive = useMemo(() => {
        if (!item.href) return false;
        return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }, [pathname, item.href]);

    const isChildActive = useMemo(() => {
        if (!item.children) return false;
        const check = (items: NavItem[]): boolean => {
            return items.some(i => (i.href && (pathname === i.href || pathname.startsWith(`${i.href}/`))) || (i.children && check(i.children)));
        }
        return check(item.children);
    }, [pathname, item.children]);

    return (
        <div
            className="flex flex-col gap-2 break-inside-avoid"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex items-center justify-between group/sub w-full cursor-pointer" onClick={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}>
                <Link
                    href={item.href || "#"}
                    onClick={(e) => { e.stopPropagation(); closeMenu(); }}
                    className={`text-sm hover:text-[#C9A227] transition-colors font-medium ${isSelfActive || isChildActive ? "text-[#C9A227]" : "text-gray-700"}`}
                >
                    {item.label}
                </Link>
                {hasSubItems && (
                    <button
                        className={`p-1 hover:text-[#C9A227] focus:outline-none transition-colors ${isExpanded || isChildActive ? "text-[#C9A227]" : "text-gray-400"}`}
                    >
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                )}
            </div>

            {hasSubItems && (
                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-[#C9A227]/30 pt-1 pb-2">
                            {item.children!.map((subChild, j) => {
                                const isActive = subChild.href && (pathname === subChild.href || pathname.startsWith(`${subChild.href}/`));
                                return (
                                    <Link
                                        key={j}
                                        href={subChild.href || "#"}
                                        onClick={closeMenu}
                                        className={`text-sm hover:text-[#C9A227] transition-colors block py-0.5 ${isActive ? "text-[#C9A227] font-medium" : "text-gray-600"}`}
                                    >
                                        {subChild.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function HeaderNew() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        return user.roles.some((r: any) => ["admin", "superadmin", "creator", "editor", "manager"].includes(r.name));
    }, [user]);

    const t = useTranslations('Navigation');

    // Dynamic Nav Logic
    const navItems = useMemo(() => {
        const mapToNavItem = (cat: Category): NavItem => {
            return {
                label: cat.name,
                href: `/category/${cat.slug}`,
                children: cat.children?.length ? cat.children.map(mapToNavItem) : undefined,
            };
        };

        const DEFAULT_CATEGORIES = [
            "latest news",
            "high court",
            "supreme court",
            "crime",
            "article",
            "hindi news"
        ];

        const dynamicCats = categories.map(mapToNavItem);
        const LIMIT = 6;

        let visible = dynamicCats.slice(0, LIMIT);
        let hidden = dynamicCats.slice(LIMIT);

        const defaultCats = dynamicCats.filter(c =>
            DEFAULT_CATEGORIES.includes(c.label?.toLowerCase())
        );

        defaultCats.forEach(defaultCat => {
            const alreadyInVisible = visible.some(v => v.label === defaultCat.label);

            if (!alreadyInVisible) {
                hidden = hidden.filter(h => h.label !== defaultCat.label);
                visible.push(defaultCat);
            }
        });

        if (visible.length > LIMIT) {
            const excess = visible.length - LIMIT;
            const removable = visible.filter(v =>
                !DEFAULT_CATEGORIES.includes(v.label?.toLowerCase())
            );
            const itemsToMove = removable.slice(0, excess);

            itemsToMove.forEach(item => {
                visible = visible.filter(v => v.label !== item.label);
                hidden.unshift(item);
            });
        }

        hidden = hidden.filter(h =>
            !DEFAULT_CATEGORIES.includes(h.label?.toLowerCase())
        );

        const final: NavItem[] = [
            { label: t("home"), href: "/" },
            ...visible
        ];

        if (hidden.length > 0) {
            final.push({ label: t("more"), children: hidden });
        }

        return final;

    }, [categories, t]);

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

    const MobileMenuItem = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = mobileExpanded[item.label];
        const active = isItemOrChildActive(item);
        const isSelfActive = isLinkActive(item.href);

        return (
            <div className="flex flex-col">
                <div className={`flex items-center justify-between py-2.5 ${depth > 0 ? "pl-4 border-l-2 border-[#C9A227]/20 ml-2" : ""}`}>
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

        const itemRef = useRef<HTMLDivElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const [leftPos, setLeftPos] = useState<number>(0);
        const [isVisible, setIsVisible] = useState(false);

        useEffect(() => {
            if (isOpen && itemRef.current && dropdownRef.current) {
                const itemRect = itemRef.current.getBoundingClientRect();
                const dropdownRect = dropdownRef.current.getBoundingClientRect();
                const windowWidth = window.innerWidth;

                let targetLeft = itemRect.left + (itemRect.width / 2) - (dropdownRect.width / 2);
                targetLeft = Math.max(100, targetLeft);
                targetLeft = Math.min(targetLeft, windowWidth - 100 - dropdownRect.width);

                setLeftPos(targetLeft);
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        }, [isOpen]);

        if (!hasChildren) {
            return (
                <Link
                    href={item.href || "#"}
                    className={`flex items-center h-full px-1 hover:text-[#C9A227] whitespace-nowrap transition-colors relative group ${active ? "text-[#C9A227] font-semibold" : "text-gray-800"}`}
                >
                    {item.label}
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#C9A227] transform origin-left transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
                </Link>
            );
        }

        return (
            <div
                ref={itemRef}
                className="group h-full flex items-center"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <button className={`flex items-center gap-1 px-1 hover:text-[#C9A227] whitespace-nowrap transition-colors relative ${active ? "text-[#C9A227] font-semibold" : "text-gray-800"}`}>
                    {item.label}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#C9A227] transform origin-left transition-transform duration-300 ${active || isOpen ? "scale-x-100" : "scale-x-0"}`}></span>
                </button>
                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className={`absolute top-full mt-0 bg-white border border-gray-200 shadow-xl rounded-lg z-50 max-h-[70vh] overflow-auto w-max max-w-[calc(100vw-200px)] transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                        style={{ left: `${leftPos}px` }}
                    >
                        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                            {item.children!.map((child, i) => (
                                <SubCategoryItem key={i} item={child} closeMenu={() => setIsOpen(false)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <header className={`w-full bg-white z-50 fixed top-0 left-0 transition-shadow duration-300 ${scrolled ? "shadow-md" : "border-b border-gray-200"}`}>
                {/* Top Bar - Premium Gradient */}
                <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
                    {/* Subtle animated background pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex items-center justify-between h-10 text-xs">
                            {/* Left - Contact Info */}
                            <div className="hidden md:flex items-center gap-4">
                                <a href="mailto:info@sajjadhusain.com" className="flex items-center gap-1.5 hover:text-amber-400 transition-all duration-300 hover:scale-105 group">
                                    <Mail size={12} className="group-hover:rotate-12 transition-transform duration-300" />
                                    <span className="font-medium">info@sajjadhusain.com</span>
                                </a>
                                <span className="text-blue-400/50">|</span>
                                <a href="tel:+911234567890" className="flex items-center gap-1.5 hover:text-amber-400 transition-all duration-300 hover:scale-105 group">
                                    <Phone size={12} className="group-hover:rotate-12 transition-transform duration-300" />
                                    <span>+91 123 456 7890</span>
                                </a>
                            </div>

                            {/* Right - Social & Language */}
                            <div className="flex items-center gap-4 ml-auto">
                                <div className="hidden sm:flex items-center gap-2">
                                    <a href="#" className="hover:text-amber-400 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"><Facebook size={14} /></a>
                                    <a href="#" className="hover:text-amber-400 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"><Twitter size={14} /></a>
                                    <a href="#" className="hover:text-amber-400 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"><Linkedin size={14} /></a>
                                    <a href="#" className="hover:text-amber-400 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"><Instagram size={14} /></a>
                                </div>
                                <span className="hidden sm:block text-blue-400/50">|</span>
                                <div className="flex items-center gap-2">
                                    <Globe size={12} className="text-amber-400" />
                                    <button onClick={() => switchLocale("en")} className={`transition-all duration-300 font-semibold ${locale === "en" ? "text-amber-400 scale-110" : "hover:text-amber-400 hover:scale-105"}`}>EN</button>
                                    <span className="text-blue-400/50">/</span>
                                    <button onClick={() => switchLocale("hi")} className={`transition-all duration-300 font-semibold ${locale === "hi" ? "text-amber-400 scale-110" : "hover:text-amber-400 hover:scale-105"}`}>HI</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="border-b border-gray-100">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            {/* Logo & Tagline */}
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative">
                                    <Image src={logo} alt="Sajjad Husain Law Associates" className="object-contain" width={50} height={50} priority />
                                    <div className="absolute -inset-1 bg-[#C9A227]/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold text-gray-900 leading-tight">Sajjad Husain Law Associates</h1>
                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                        <Scale size={12} className="text-[#C9A227]" />
                                        Excellence in Legal Services
                                    </p>
                                </div>
                            </Link>

                            {/* Search & Actions */}
                            <div className="hidden lg:flex items-center gap-3">
                                {/* Search Bar */}
                                <div className="w-64">
                                    <SearchWithDropdown placeholder="Search articles, cases..." />
                                </div>

                                {/* Notifications */}
                                <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Bell size={20} className="text-gray-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* User Profile or Auth Buttons */}
                                {user ? (
                                    <div className="relative" onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
                                        <button className="flex items-center gap-2 focus:outline-none py-2 px-3 hover:bg-gray-50 rounded-full transition-colors">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A227] to-[#b39022] flex items-center justify-center text-sm font-semibold text-white overflow-hidden border-2 border-white shadow-md">
                                                {avatar ? <Image src={avatar} alt="Avatar" width={40} height={40} className="object-cover w-full h-full" /> : (user?.name?.[0] || "U").toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-800 hidden xl:block">{user?.name}</span>
                                            <ChevronDown size={14} className="text-gray-500 hidden xl:block" />
                                        </button>
                                        <div className={`absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl transition-all duration-200 transform origin-top-right z-50 ${isProfileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                            <div className="p-3 border-b border-gray-100">
                                                <p className="font-semibold text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#C9A227] transition-colors">
                                                    <UserIcon size={16} /> {t('profile')}
                                                </Link>
                                                {hasDashboardAccess && (
                                                    <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#C9A227] transition-colors">
                                                        <LayoutDashboard size={16} /> {t('dashboard')}
                                                    </Link>
                                                )}
                                                <div className="h-px bg-gray-100 my-1 mx-2" />
                                                <button onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                    <LogOut size={16} /> {t('logout')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link href="/auth/login">
                                            <button className="px-5 py-2 text-sm font-medium text-[#C9A227] border-2 border-[#C9A227] rounded-full hover:bg-[#C9A227] hover:text-white transition-all">
                                                {t('login')}
                                            </button>
                                        </Link>
                                        <Link href="/subscription">
                                            <button className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#C9A227] to-[#b39022] rounded-full hover:shadow-lg hover:shadow-[#C9A227]/30 transition-all">
                                                Subscribe
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Search & Menu Buttons */}
                            <div className="lg:hidden flex items-center gap-2">
                                {/* Search Toggle Button */}
                                <button
                                    onClick={() => setSearchOpen(!searchOpen)}
                                    className="text-gray-700 hover:text-[#C9A227] p-2 transition-colors"
                                >
                                    {searchOpen ? <X size={24} /> : <Search size={24} />}
                                </button>

                                {/* Menu Toggle Button */}
                                <button
                                    onClick={() => {
                                        setMenuOpen(!menuOpen);
                                        if (!menuOpen) setSearchOpen(false); // Close search when opening menu
                                    }}
                                    className="text-gray-700 hover:text-[#C9A227] p-2 transition-colors"
                                >
                                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                                </button>
                            </div>
                        </div>

                        {/* Mobile/Tablet Search Bar (Toggleable) */}
                        {searchOpen && (
                            <div className="lg:hidden py-3 border-t border-gray-100 animate-slideDown">
                                <SearchWithDropdown placeholder="Search articles, cases..." />
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="hidden lg:block bg-white border-b border-gray-100">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center gap-8 h-14 text-sm font-medium">
                            {navItems.map((item, i) => <DesktopMenuItem key={i} item={item} />)}
                        </nav>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-200 w-full h-[calc(100vh-130px)] overflow-y-auto shadow-xl absolute top-[130px] left-0 z-40">
                        <nav className="flex flex-col p-5 gap-2">
                            {/* Mobile User Section */}
                            <div className="mb-4 border-b border-gray-200 pb-4">
                                {user ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-100">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A227] to-[#b39022] flex items-center justify-center text-sm font-semibold text-white overflow-hidden shadow-md">
                                                {avatar ? <Image src={avatar} alt="Avatar" width={48} height={48} className="object-cover w-full h-full" /> : (user?.name?.[0] || "U").toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                        </div>
                                        <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <UserIcon size={16} /> Profile
                                        </Link>
                                        {hasDashboardAccess && (
                                            <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                                <LayoutDashboard size={16} /> Dashboard
                                            </Link>
                                        )}
                                        <button onClick={() => { setMenuOpen(false); setShowLogoutConfirm(true); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left transition-colors">
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                                            <button className="w-full px-5 py-2.5 text-sm font-medium text-[#C9A227] border-2 border-[#C9A227] rounded-full hover:bg-[#C9A227] hover:text-white transition-all">
                                                Login
                                            </button>
                                        </Link>
                                        <Link href="/subscription" onClick={() => setMenuOpen(false)}>
                                            <button className="w-full px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#C9A227] to-[#b39022] rounded-full hover:shadow-lg transition-all">
                                                Subscribe Premium
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Search */}
                            <div className="mb-4">
                                <SearchWithDropdown placeholder="Search..." />
                            </div>

                            {/* Mobile Navigation Items */}
                            <div className="border-t border-gray-100 pt-4">
                                {navItems.map((item, i) => <MobileMenuItem key={i} item={item} />)}
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={confirmLogout} />
            )}
        </>
    );
}

function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 transform transition-all scale-100">
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <LogOut className="text-red-600" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to logout? You'll need to login again to access your account.
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
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md shadow-red-600/30 transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
