
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, Trash2, X, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { notificationService } from "@/data/services/notification-service/notification.service";
import type { Notification } from "@/data/services/notification-service/notification.service";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface AcademyNotificationDropdownProps {
  userId: string;
}

// Global timestamp to prevent concurrent double-fetch when desktop + mobile navbars mount together
let lastGlobalAcademyFetchTime = 0;

export default function AcademyNotificationDropdown({
  userId,
}: AcademyNotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showReadAllConfirm, setShowReadAllConfirm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const router = useRouter();

  const LIMIT = 15;

  // Real-time toast alert when a new notification arrives
  const announceNewNotification = useCallback((notif: Notification) => {
    // 1. If tab is in background and desktop notifications supported/granted
    if (
      typeof window !== "undefined" &&
      document.hidden &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const desktopNotif = new window.Notification(
          notif.title || "Sajjad Husain Legal Academy",
          {
            body: notif.body || "You have a new academy update.",
            icon: "/logo-gold.png",
            badge: "/logo-gold.png",
            tag: notif._id,
          }
        );
        desktopNotif.onclick = () => {
          window.focus();
          desktopNotif.close();
        };
      } catch (err) {
        console.warn("Could not fire desktop notification:", err);
      }
    }

    // 2. Foreground alert: Show clean Academy toast
    toast.custom(
      (t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
            setIsOpen(true);
          }}
          className={`max-w-sm w-full bg-[#0b2240] text-white rounded-2xl p-4 shadow-2xl border border-[#C9A227]/40 flex items-start gap-3.5 cursor-pointer hover:border-[#C9A227] transition-all transform duration-300 ${t.visible ? "animate-in fade-in slide-in-from-top-4" : "animate-out fade-out"
            }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center shrink-0">
            <Bell size={18} className="text-[#C9A227] animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] font-bold">
                Academy Alert
              </span>
              <span className="text-[10px] text-white/40">Just now</span>
            </div>
            <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
            <p className="text-[11px] text-white/70 line-clamp-2 mt-0.5 leading-snug">
              {notif.body}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="text-white/40 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ),
      { duration: 5000, position: "top-right" }
    );
  }, []);

  // Fetch notifications with pagination and portal='academy' isolation
  const fetchNotifications = useCallback(
    async (isLoadMore = false) => {
      if (!userId || isFetching.current) return;
      isFetching.current = true;
      lastGlobalAcademyFetchTime = Date.now();

      if (isLoadMore) {
        setIsFetchingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const currentPage = isLoadMore ? page + 1 : 1;
        const response = await notificationService.getNotifications(
          userId,
          currentPage,
          LIMIT,
          "academy"
        );
        const rawData: Notification[] = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // Isolate Academy notifications: ensure only academy/course/certificate items appear
        const data = rawData.filter((n) => {
          if (n.portal === "academy") return true;
          const type = (n.type || "").toLowerCase();
          return (
            type.startsWith("academy") ||
            type.startsWith("certificate") ||
            type.startsWith("course")
          );
        });

        const meta = response.data?.meta;

        // Sync known IDs for deduplication
        data.forEach((n) => knownNotificationIds.current.add(n._id));

        if (isLoadMore) {
          setNotifications((prev) => [...prev, ...data]);
          setPage(currentPage);
        } else {
          setNotifications(data);
          setPage(1);
        }

        if (meta) {
          setHasMore(meta.current_page < meta.total_pages);
        } else {
          setHasMore(false);
        }

        isInitialLoad.current = false;
      } catch (error) {
        console.error("Failed to fetch academy notifications", error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
        isFetching.current = false;
      }
    },
    [userId, page]
  );

  // Load more via infinite scroll
  const loadMore = () => {
    if (!loading && !isFetchingMore && hasMore) {
      fetchNotifications(true);
    }
  };

  const { lastElementRef } = useInfiniteScroll({
    isLoading: loading || isFetchingMore,
    hasMore,
    onLoadMore: loadMore,
  });

  // Initial load: fetch once on page mount (deduplicated so desktop+mobile don't double-call)
  useEffect(() => {
    if (!userId) return;
    if (Date.now() - lastGlobalAcademyFetchTime < 10000) return;
    fetchNotifications(false);
  }, [userId, fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark all as read (strictly for Academy portal)
  const handleReadAll = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllRead(userId, "academy");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setShowReadAllConfirm(false);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read", error);
      toast.error("Failed to mark all as read");
    }
  };

  // Toggle expand card
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Mark single notification read
  const handleMarkSingleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      toast.success("Marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  // Delete single notification
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification", error);
      toast.error("Failed to delete notification");
    }
  };

  // Smart deep-linking when notification is clicked
  const handleNotificationClick = (notification: Notification, e: React.MouseEvent) => {
    toggleExpand(notification._id, e);

    if (!notification.read) {
      notificationService.markRead(notification._id).catch(() => { });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
    }

    const type = (notification.type || "").toLowerCase();
    const title = (notification.title || "").toLowerCase();
    const body = (notification.body || "").toLowerCase();

    // 1. If notification has a courseSlug or direct URL, navigate to that course learn page directly
    if (notification.data?.courseSlug) {
      router.push(`/dashboard/learn/${notification.data.courseSlug}`);
      setIsOpen(false);
      return;
    }

    if (notification.data?.url) {
      router.push(notification.data.url);
      setIsOpen(false);
      return;
    }

    // 2. Fallbacks based on category/type
    if (
      type.includes("certificate") ||
      title.includes("certificate") ||
      body.includes("certificate")
    ) {
      router.push("/dashboard/certificates");
      setIsOpen(false);
    } else if (type.includes("live") || title.includes("live") || body.includes("live class")) {
      router.push("/dashboard/live-sessions");
      setIsOpen(false);
    } else if (
      type.includes("assignment") ||
      title.includes("assignment")
    ) {
      router.push("/dashboard/assignments");
      setIsOpen(false);
    } else {
      router.push("/dashboard/courses");
      setIsOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            // Fetch fresh notifications immediately when user opens the dropdown
            fetchNotifications(false);
          }
        }}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
        aria-label="Academy Notifications"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="fixed left-4 right-4 top-24 min-[400px]:top-24 mt-2 z-50 lg:absolute lg:inset-auto lg:right-0 lg:left-auto lg:top-full lg:mt-2 lg:w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => fetchNotifications(false)}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Refresh notifications"
              >
                <RotateCw size={13} className={loading ? "animate-spin text-[#C9A227]" : ""} />
              </button>
            </div>
            {unreadCount > 0 &&
              (showReadAllConfirm ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
                  <span className="text-[10px] text-gray-500 font-medium">Mark all?</span>
                  <button
                    onClick={handleReadAll}
                    className="p-1 text-green-600 hover:bg-green-50 rounded bg-white shadow-sm border border-gray-100 transition-colors"
                    title="Confirm mark all read"
                  >
                    <CheckCheck size={14} />
                  </button>
                  <button
                    onClick={() => setShowReadAllConfirm(false)}
                    className="p-1 text-gray-500 hover:bg-gray-50 rounded bg-white shadow-sm border border-gray-100 transition-colors"
                    title="Cancel"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowReadAllConfirm(true)}
                  className="text-xs flex items-center gap-1 text-[#C9A227] hover:text-[#b39022] font-medium transition-colors"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              ))}
          </div>

          {/* Notifications Scroll List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <Bell size={24} className="text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`transition-colors ${!notification.read ? "bg-blue-50/30" : "hover:bg-gray-50"
                      }`}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={(e) => handleNotificationClick(notification, e)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4
                          className={`text-sm break-all line-clamp-1 ${!notification.read
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-700"
                            }`}
                        >
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 break-all line-clamp-3 ${!notification.read
                            ? "text-gray-800 font-medium"
                            : "text-gray-500"
                          }`}
                      >
                        {notification.body}
                      </p>
                    </div>

                    {/* Expanded Actions Area */}
                    {expandedId === notification._id && (
                      <div className="px-4 pb-3 pt-0 flex items-center justify-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        {!notification.read && (
                          <button
                            onClick={(e) => handleMarkSingleRead(notification._id, e)}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                          >
                            <CheckCheck size={14} />
                            Mark Read
                          </button>
                        )}

                        <button
                          onClick={(e) => handleDeleteNotification(notification._id, e)}
                          className="text-xs flex items-center gap-1 text-gray-500 hover:text-red-600 font-medium px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isFetchingMore && (
                  <div className="p-4 text-center text-xs text-gray-500 animate-pulse">
                    Loading more...
                  </div>
                )}
                <div ref={lastElementRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
            <button
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
