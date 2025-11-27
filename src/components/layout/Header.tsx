"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { useRouter } from "next/navigation";
import { navigationData, NavItem } from "@/data/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});

  const router = useRouter();
   const {
      user: reduxProfileUser, 
      loading: profileLoading,
    } = useProfileActions(); 
const checkuser = reduxProfileUser as UserData;
  

  useEffect(() => {
    if (reduxProfileUser && Object.keys(checkuser).length > 0) {
      setUser(checkuser);
    }
  }, [reduxProfileUser]); 

  const toggleMobileExpand = (label: string) => {
    setMobileExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Recursive Mobile Menu Item
  const MobileMenuItem = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = mobileExpanded[item.label];

    return (
      <div className="flex flex-col">
        <div
          className={`flex items-center justify-between py-2 ${depth > 0 ? "pl-4 border-l border-gray-200 ml-2" : ""
            }`}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleMobileExpand(item.label)}
              className="flex items-center justify-between w-full hover:text-black/70 text-left"
            >
              <span className={depth === 0 ? "font-medium" : "text-sm"}>{item.label}</span>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <Link
              href={item.href || "#"}
              onClick={() => setMenuOpen(false)}
              className={`hover:text-black/70 block w-full ${depth === 0 ? "font-medium" : "text-sm"}`}
            >
              {item.label}
            </Link>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="flex flex-col gap-1 mt-1">
            {item.children!.map((child, i) => (
              <MobileMenuItem key={i} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Recursive Desktop Menu Item
  const DesktopMenuItem = ({ item }: { item: NavItem }) => {
    const hasChildren = item.children && item.children.length > 0;
    const [isOpen, setIsOpen] = useState(false);

    if (!hasChildren) {
      return (
        <Link href={item.href || "#"} className="hover:text-black/70 whitespace-nowrap">
          {item.label}
        </Link>
      );
    }

    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button className="flex items-center gap-1 hover:text-black/70 whitespace-nowrap">
          {item.label} <ChevronDown size={14} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded-md py-2 min-w-[200px] z-50">
            {item.children!.map((child, i) => (
              <div key={i} className="px-4 py-2 hover:bg-gray-50 relative group/sub">
                {child.children ? (
                  // Sub-menu (Right side)
                  <div className="flex items-center justify-between w-full cursor-pointer">
                    <span>{child.label}</span>
                    <ChevronRight size={14} />
                    <div className="absolute left-full top-0 bg-white border border-gray-200 shadow-lg rounded-md py-2 min-w-[200px] hidden group-hover/sub:block">
                      {child.children.map((subChild, j) => (
                        <Link key={j} href={subChild.href || "#"} className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                          {subChild.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link href={child.href || "#"} className="block text-sm text-gray-700">
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
    <header className="w-full border-b border-gray-200 bg-white z-50 fixed top-0 left-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src={logo} alt="Logo" className="object-contain" width={140} height={40} priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navigationData.map((item, i) => (
            <DesktopMenuItem key={i} item={item} />
          ))}
        </nav>

        {/* Auth Section Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <Link href="/profile" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 overflow-hidden">
                {(user?.name?.[0] || "U").toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-800 group-hover:underline">{user?.name || "Profile"}</span>
            </Link>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="rounded-full bg-black text-white px-5 py-2 hover:opacity-80 text-sm font-medium">
                  Log in
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="rounded-full border border-black text-black px-5 py-2 hover:bg-black hover:text-white text-sm font-medium">
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 w-full h-[calc(100vh-80px)] overflow-y-auto shadow-lg absolute top-20 left-0 z-40 pb-20">
          <nav className="flex flex-col p-5 gap-2">
            {/* Auth Mobile */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              {user ? (
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 overflow-hidden">
                    {(user?.name?.[0] || "U").toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-800">{user?.name || "Profile"}</span>
                </Link>
              ) : (
                <div className="flex gap-4">
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex-1">
                    <button className="w-full rounded-full bg-black text-white px-5 py-2 text-sm font-medium hover:opacity-90">
                      Login
                    </button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="flex-1">
                    <button className="w-full rounded-full bg-yellow-700 text-white px-5 py-2 text-sm font-medium hover:opacity-90">
                      Sign up
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {navigationData.map((item, i) => (
              <MobileMenuItem key={i} item={item} />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
