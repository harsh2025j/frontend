"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import {
  Search,
  X,
  Calendar,
  Clock,
  BookOpen,
  User,
  Share2,
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { profileApi } from "@/data/services/profile-service/profile-service";
import { articleApi } from "@/data/services/article-service/article-service";
import { UserData } from "@/data/features/profile/profile.types";
import { Article } from "@/data/features/article/article.types";
import { getSafeImageUrl } from "@/utils/imageUtils";
import { useDocTitle } from "@/hooks/useDocTitle";
import Pagination from "@/components/Pagination";
import AuthorLoading from "./loading";

interface AuthorClientProps {
  username: string;
  locale: string;
}

const ITEMS_PER_PAGE = 9;

export default function AuthorClient({ username, locale }: AuthorClientProps) {
  const router = useRouter();

  // Author state
  const [author, setAuthor] = useState<UserData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [authorNotFound, setAuthorNotFound] = useState(false);

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const articlesSectionRef = useRef<HTMLDivElement>(null);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
      setCurrentPage(1); // Reset to first page on search change
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Format display name
  const displayName = useMemo(() => {
    if (author?.name) return author.name;
    // Fallback: format username from slug (e.g. john-doe -> John Doe)
    return username
      .replace(/^[0-9a-fA-F]{24}$/, "Author")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [author, username]);

  // Set document title
  useDocTitle(
    author
      ? `${author.name} | Sajjad Husain Law Associates`
      : `${displayName} — Author | Sajjad Husain Law Associates`
  );

  // 1. Initial Coordinated Load: Author Profile followed by their articles
  useEffect(() => {
    let isMounted = true;

    async function loadAuthorData() {
      setInitialLoading(true);
      setAuthorNotFound(false);

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(username);
      let resolvedAuthor: UserData | null = null;

      // Step A: Load author profile
      try {
        let res;
        if (isMongoId) {
          res = await profileApi.fetchPublicProfile(username);
        } else {
          try {
            res = await profileApi.fetchProfileByUsername(username);
          } catch {
            res = await profileApi.fetchPublicProfile(username);
          }
        }

        if (res?.data?.success && res.data.data) {
          resolvedAuthor = res.data.data;
        }
      } catch {
        resolvedAuthor = null;
      }

      if (!isMounted) return;
      setAuthor(resolvedAuthor);

      // Step B: Load articles using author's real ID (or username as fallback)
      const targetAuthorId = resolvedAuthor?._id || resolvedAuthor?.id || username;

      try {
        const artRes = await articleApi.fetchArticles({
          authorId: targetAuthorId,
          page: 1,
          limit: ITEMS_PER_PAGE,
          status: "published",
          sort_by: "createdAt",
          order: "DESC",
        });

        const responseData = artRes.data as any;
        const items: Article[] = responseData?.data ?? [];
        const meta = responseData?.meta ?? {};

        if (!isMounted) return;

        setArticles(items);
        setTotalPages(meta.total_pages || 1);
        setTotalItems(meta.total_items ?? items.length);

        // Only mark 404 if NEITHER profile exists NOR any articles exist
        if (!resolvedAuthor && items.length === 0) {
          setAuthorNotFound(true);
        } else {
          setAuthorNotFound(false);
        }
      } catch {
        if (!isMounted) return;
        setArticles([]);
        setTotalPages(1);
        setTotalItems(0);
        if (!resolvedAuthor) {
          setAuthorNotFound(true);
        } else {
          setAuthorNotFound(false);
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    }

    loadAuthorData();

    return () => {
      isMounted = false;
    };
  }, [username]);

  // 2. Subsequent Fetch: On page change or search query change (after initial load)
  useEffect(() => {
    if (initialLoading) return;

    let isMounted = true;
    async function loadFilteredArticles() {
      const targetAuthorId = author?._id || author?.id || username;
      setArticlesLoading(true);

      try {
        const artRes = await articleApi.fetchArticles({
          authorId: targetAuthorId,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          q: debouncedQuery || undefined,
          status: "published",
          sort_by: "createdAt",
          order: "DESC",
        });

        const responseData = artRes.data as any;
        const items: Article[] = responseData?.data ?? [];
        const meta = responseData?.meta ?? {};

        if (isMounted) {
          setArticles(items);
          setTotalPages(meta.total_pages || 1);
          setTotalItems(meta.total_items ?? items.length);
        }
      } catch {
        if (isMounted) {
          setArticles([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } finally {
        if (isMounted) {
          setArticlesLoading(false);
        }
      }
    }

    loadFilteredArticles();

    return () => {
      isMounted = false;
    };
  }, [currentPage, debouncedQuery]);

  // Copy Profile Link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Author link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Smooth scroll up to the search & articles header (clearing the fixed navbar)
  const scrollToArticles = () => {
    if (typeof window !== "undefined" && articlesSectionRef.current) {
      const navbarOffset = 90; // Height of the sticky navbar + breathing room
      const elementTop = articlesSectionRef.current.getBoundingClientRect().top;
      const targetY = elementTop + window.scrollY - navbarOffset;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth",
      });
    }
  };

  // Pagination Change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      scrollToArticles();
    }
  };

  // Helper: Format Date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Calculate Reading Time
  const estimateReadingTime = (content?: string) => {
    if (!content) return "3 min read";
    const words = content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  // Author Designation / Byline (Real designation ONLY — no dummy fallback)
  const designation = useMemo(() => {
    if (author?.designation && author.designation !== "null" && author.designation !== "NULL") {
      return author.designation.trim();
    }
    if (author?.roles && author.roles.length > 0) {
      const topRole = author.roles[0]?.name;
      if (topRole && topRole.toLowerCase() !== "user") {
        return topRole.charAt(0).toUpperCase() + topRole.slice(1);
      }
    }
    return null;
  }, [author]);

  // Handle Back Button
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Initial Loading State: Render clean skeleton matching SSR (prevents any momentary popup flash on refresh)
  if (initialLoading) {
    return <AuthorLoading />;
  }

  // 404 State: Author Not Found (Only after initial load is fully resolved)
  if (authorNotFound) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F6] px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-10 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-[#C9A227] flex items-center justify-center mx-auto mb-5 text-[#C9A227]">
            <User size={28} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A2342] mb-2">
            Author Not Found
          </h1>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            We couldn’t find an author profile for <span className="font-semibold text-gray-800">“{username}”</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleGoBack}
              className="px-5 py-2.5 rounded-xl bg-[#0A2342] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#122340] transition-colors cursor-pointer"
            >
              Go Back
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] selection:bg-[#C9A227]/20 selection:text-[#0A2342] pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Navigation Bar: Back Button & Breadcrumbs */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#0A2342] transition-colors py-2 px-3.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 shadow-2xs group cursor-pointer"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1 text-gray-500 group-hover:text-[#0A2342]" />
            <span>Back</span>
          </button>

          <nav aria-label="Breadcrumb" className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-800 font-semibold truncate max-w-[180px] sm:max-w-none">{displayName}</span>
          </nav>
        </div>

        {/* =========================================================
            AUTHOR PROFILE HERO CARD (Minimal, Clean & Direct)
        ========================================================== */}
        <section className="rounded-2xl bg-white border border-gray-200/90 shadow-2xs p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-2 ring-gray-100 p-0.5 bg-white shadow-xs shrink-0 overflow-hidden">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-[#0A2342] flex items-center justify-center text-[#C9A227]">
                {author?.profilePicture ? (
                  <Image
                    src={author.profilePicture}
                    alt={displayName}
                    fill
                    sizes="100px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <span className="font-serif text-2xl sm:text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Author Information */}
            <div className="flex-1 w-full text-center sm:text-left space-y-2">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A2342] leading-tight">
                  {displayName}
                </h1>
                {designation && (
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                    {designation}
                  </p>
                )}
              </div>

              {/* Bio ONLY if real bio exists (no dummy text) */}
              {author?.bio && author.bio.trim() ? (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl pt-0.5">
                  {author.bio.trim()}
                </p>
              ) : null}

              {/* Minimal Badges Row: Article Count & Share */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold">
                  <BookOpen size={13} className="text-[#C9A227]" />
                  <span>{totalItems} Article{totalItems !== 1 ? "s" : ""}</span>
                </span>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label="Share author profile"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-xs font-medium"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
                  <span>{copiedLink ? "Link Copied" : "Share Profile"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ARTICLES SECTION (WITH SEARCH & PAGINATION)
        ========================================================== */}
        <section ref={articlesSectionRef} className="space-y-5 pt-1 scroll-mt-24">
          {/* Section Header & In-Page Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#0A2342] flex items-center gap-2">
              <span>Articles by {displayName.split(" ")[0]}</span>
              <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {totalItems}
              </span>
            </h2>

            {/* In-Author Articles Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`Search ${displayName.split(" ")[0]}'s articles...`}
                className="w-full h-9 pl-9 pr-8 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/15 transition-all shadow-2xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Active Search Filter Badge */}
          {debouncedQuery && (
            <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 rounded-xl px-3.5 py-2 text-xs text-[#0A2342]">
              <div className="flex items-center gap-2">
                <Search size={13} className="text-[#C9A227]" />
                <span>
                  Showing results for: <strong className="text-black">“{debouncedQuery}”</strong>
                  {!articlesLoading && ` (${totalItems} article${totalItems !== 1 ? "s" : ""} found)`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* Articles Feed */}
          {articlesLoading ? (
            /* Loading Horizontal Cards Skeleton */
            <div className="flex flex-col gap-3.5 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs flex flex-col sm:flex-row sm:h-40 lg:h-[160px]"
                >
                  <div className="aspect-video w-full sm:w-auto sm:h-full bg-gray-200 shrink-0" />
                  <div className="p-3.5 sm:p-4 flex-1 space-y-2 justify-between flex flex-col">
                    <div className="space-y-2">
                      <div className="h-3 w-28 bg-gray-200 rounded" />
                      <div className="h-4.5 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-full bg-gray-100 rounded" />
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between">
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                      <div className="h-3 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 sm:p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3 text-[#C9A227]">
                {debouncedQuery ? <Search size={20} /> : <FileText size={20} />}
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#0A2342] mb-1">
                {debouncedQuery
                  ? `No articles match “${debouncedQuery}”`
                  : "No Published Articles Yet"}
              </h3>
              <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed mb-4">
                {debouncedQuery
                  ? "Try checking for typos or searching for a different keyword."
                  : `${displayName} has not published any public articles on our platform yet.`}
              </p>
              {debouncedQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0A2342] text-white text-xs font-semibold hover:bg-[#122340] transition-colors cursor-pointer"
                >
                  Reset Search
                </button>
              ) : null}
            </div>
          ) : (
            /* Slim Horizontal Editorial Article Cards (16:9 Image, Compact Height) */
            <div className="flex flex-col gap-3.5">
              {articles.map((article) => {
                const imageUrl = getSafeImageUrl(article.thumbnail);
                const rawCategory = (article as any).category?.name || "Legal Update";
                // Clean any trailing random numeric ID suffix (e.g. " - 53478322")
                const categoryName = rawCategory.replace(/\s*-\s*\d{5,}$/, "");

                // Clean snippet from subHeadline or rich HTML content
                const cleanContent = (article.content || "")
                  .replace(/<[^>]*>/g, " ")
                  .replace(/&nbsp;/g, " ")
                  .replace(/\s+/g, " ")
                  .trim();
                const snippet = article.subHeadline || cleanContent;

                return (
                  <article
                    key={article.id || (article as any)._id}
                    className="group flex flex-col sm:flex-row sm:h-40 lg:h-[160px] bg-white rounded-xl sm:rounded-2xl border border-gray-200/90 hover:border-[#C9A227]/70 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300"
                  >
                    {/* Thumbnail — Strict 16:9 ratio, slim height */}
                    <Link
                      href={`/news/${article.slug}`}
                      className="relative aspect-video w-full sm:w-auto sm:h-full overflow-hidden bg-gray-100 block shrink-0"
                    >
                      <Image
                        src={imageUrl}
                        alt={article.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 320px"
                        className="object-cover"
                      />
                      {/* High-visibility Category Badge overlay */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0A2342] text-white text-[9.5px] font-extrabold uppercase tracking-wider shadow-md border border-white/20 z-10 pointer-events-none truncate max-w-[160px]">
                        {categoryName}
                      </span>
                    </Link>

                    {/* Content Details — Slim & Well-Balanced */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-1.5 min-w-0 overflow-hidden">
                      <div className="space-y-1">
                        {/* Meta info: Date & Reading Time */}
                        <div className="flex items-center gap-2 text-[10.5px] text-gray-500 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} className="text-[#C9A227]" />
                            {formatDate(article.createdAt)}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={11} className="text-gray-400" />
                            {estimateReadingTime(article.content)}
                          </span>
                        </div>

                        {/* One-Line Title */}
                        <h3 className="font-serif text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#C9A227] transition-colors line-clamp-1 leading-snug">
                          <Link href={`/news/${article.slug}`}>
                            {article.title}
                          </Link>
                        </h3>

                        {/* Content Snippet: neat 2-line preview */}
                        {snippet && (
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {snippet}
                          </p>
                        )}
                      </div>

                      {/* Footer Read Link */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">
                          By {displayName.split(" ")[0]}
                        </span>
                        <Link
                          href={`/news/${article.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0A2342] group-hover:text-[#C9A227] transition-colors shrink-0"
                        >
                          <span>Read Full Article</span>
                          <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* =========================================================
              INBUILT PAGINATION COMPONENT
          ========================================================== */}
          {totalPages > 1 && !articlesLoading && (
            <div className="pt-6 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
