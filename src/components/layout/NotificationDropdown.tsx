"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Trash2, X, ChevronDown } from "lucide-react";
import { notificationService, Notification } from "@/data/services/notification-service/notification.service";
import toast from "react-hot-toast";

interface NotificationDropdownProps {
    userId: string;
}

export default function NotificationDropdown({ userId }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await notificationService.getNotifications(userId);
            // Ensure we have an array
            const data = Array.isArray(response.data) ? response.data : [];
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [userId]);
    // console.log("inheader",notifications)
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

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleReadAll = async () => {
        if (unreadCount === 0) return;

        try {
            await notificationService.markAllRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setShowReadAllConfirm(false);
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all as read", error);
            toast.error("Failed to mark all as read");
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showReadAllConfirm, setShowReadAllConfirm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (expandedId === id) {
            setExpandedId(null);
            setDeleteId(null);
        } else {
            setExpandedId(id);
            setDeleteId(null);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            showReadAllConfirm ? (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
                                    <span className="text-[10px] text-gray-500 font-medium">Mark all?</span>
                                    <button
                                        onClick={handleReadAll}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded bg-white shadow-sm border border-gray-100"
                                        title="Confirm"
                                    >
                                        <CheckCheck size={14} />
                                    </button>
                                    <button
                                        onClick={() => setShowReadAllConfirm(false)}
                                        className="p-1 text-gray-500 hover:bg-gray-50 rounded bg-white shadow-sm border border-gray-100"
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
                            )
                        )}
                    </div>

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
                                        className={`transition-colors ${!notification.read ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                                    >
                                        <div
                                            className="p-4 cursor-pointer"
                                            onClick={(e) => toggleExpand(notification._id, e)}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className={`text-sm ${!notification.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-1 ${!notification.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                                {notification.body}
                                            </p>
                                        </div>

                                        {/* Expanded Actions Area */}
                                        {expandedId === notification._id && (
                                            <div className="px-4 pb-3 pt-0 flex items-center justify-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            notificationService.markRead(notification._id);
                                                            setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
                                                            toast.success("Marked as read");
                                                        }}
                                                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        <CheckCheck size={14} />
                                                        Mark Read
                                                    </button>
                                                )}

                                                {deleteId === notification._id ? (
                                                    <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded">
                                                        <span className="text-[10px] text-red-600 font-medium">Delete?</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                notificationService.deleteNotification(notification._id);
                                                                setNotifications(prev => prev.filter(n => n._id !== notification._id));
                                                                setDeleteId(null);
                                                                toast.success("Notification deleted");
                                                            }}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <CheckCheck size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteId(null);
                                                            }}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteId(notification._id);
                                                        }}
                                                        className="text-xs flex items-center gap-1 text-gray-500 hover:text-red-600 font-medium px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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
