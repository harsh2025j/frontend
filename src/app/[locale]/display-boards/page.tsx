"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Bell, FileText, Download, Eye, Search, Filter, ChevronRight, Home, Scale, Megaphone, Clock, AlertCircle, Info } from 'lucide-react';

type BoardType = "daily-orders" | "cause-list" | "notices" | "announcements";

interface DisplayItem {
    id: string;
    title: string;
    date: string;
    type: string;
    description?: string;
    fileUrl?: string;
    isNew?: boolean;
}

export default function DisplayBoardsPage() {
    const [activeBoard, setActiveBoard] = useState<BoardType>("daily-orders");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    // Mock data - replace with actual API calls
    const mockData: Record<BoardType, DisplayItem[]> = {
        "daily-orders": [
            {
                id: "1",
                title: "Daily Order List - Civil Cases",
                date: "2024-12-24",
                type: "Civil",
                description: "Orders passed in civil matters today",
                fileUrl: "#",
                isNew: true
            },
            {
                id: "2",
                title: "Daily Order List - Criminal Cases",
                date: "2024-12-24",
                type: "Criminal",
                description: "Orders passed in criminal matters today",
                fileUrl: "#",
                isNew: true
            },
            {
                id: "3",
                title: "Daily Order List - Writ Petitions",
                date: "2024-12-24",
                type: "Writ",
                description: "Orders in writ petitions",
                fileUrl: "#"
            }
        ],
        "cause-list": [
            {
                id: "4",
                title: "Cause List - Court No. 1",
                date: "2024-12-24",
                type: "Court 1",
                description: "Cases listed before Hon'ble Chief Justice",
                fileUrl: "#",
                isNew: true
            },
            {
                id: "5",
                title: "Cause List - Court No. 2",
                date: "2024-12-24",
                type: "Court 2",
                description: "Cases listed before Hon'ble Justice",
                fileUrl: "#",
                isNew: true
            },
            {
                id: "6",
                title: "Supplementary Cause List",
                date: "2024-12-24",
                type: "Supplementary",
                description: "Additional cases listed for today",
                fileUrl: "#"
            }
        ],
        "notices": [
            {
                id: "7",
                title: "Notice - Court Timings During Winter",
                date: "2024-12-20",
                type: "General",
                description: "Revised court timings effective from December 2024",
                isNew: true
            },
            {
                id: "8",
                title: "Notice - E-Filing Guidelines",
                date: "2024-12-18",
                type: "E-Filing",
                description: "Updated guidelines for electronic filing of cases"
            },
            {
                id: "9",
                title: "Notice - Holiday List 2025",
                date: "2024-12-15",
                type: "Holidays",
                description: "List of court holidays for the year 2025"
            }
        ],
        "announcements": [
            {
                id: "10",
                title: "Important Announcement - New Court Complex",
                date: "2024-12-22",
                type: "Infrastructure",
                description: "Information regarding the new court complex inauguration",
                isNew: true
            },
            {
                id: "11",
                title: "Announcement - Bar Association Meeting",
                date: "2024-12-19",
                type: "Meeting",
                description: "Monthly meeting of the Bar Association scheduled"
            }
        ]
    };

    const [displayItems, setDisplayItems] = useState<DisplayItem[]>(mockData["daily-orders"]);

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setDisplayItems(mockData[activeBoard]);
            setLoading(false);
        }, 300);
    }, [activeBoard]);

    const filteredItems = displayItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getBoardIcon = (board: BoardType) => {
        switch (board) {
            case "daily-orders": return <FileText size={20} />;
            case "cause-list": return <Calendar size={20} />;
            case "notices": return <Bell size={20} />;
            case "announcements": return <Megaphone size={20} />;
        }
    };

    const getBoardTitle = (board: BoardType) => {
        switch (board) {
            case "daily-orders": return "Daily Orders";
            case "cause-list": return "Cause List";
            case "notices": return "Notices";
            case "announcements": return "Announcements";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-100">
            {/* Top Header Bar */}
            <div className="bg-gradient-to-r from-[#0A2342] via-[#1a3a75] to-[#0A2342] text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <Scale className="w-12 h-12 text-[#C9A227]" />
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Sajjad Husain Law Associates
                            </h1>
                            <p className="text-blue-200 mt-2 text-sm md:text-base">
                                Display Boards & Notices Portal
                            </p>
                        </div>
                        <Megaphone className="w-12 h-12 text-[#C9A227]" />
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-500" />
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Display Boards</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page Title & Info */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-3">
                        Display Boards
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Access daily orders, cause lists, notices, and important announcements from the court.
                        All information is updated regularly for your convenience.
                    </p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Quick Information:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>Daily orders and cause lists are updated every morning</li>
                            <li>Notices and announcements are posted as they are issued</li>
                            <li>Use the search bar to quickly find specific items</li>
                        </ul>
                    </div>
                </div>

                {/* Board Selection Tabs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => setActiveBoard("daily-orders")}
                        className={`p-6 rounded-xl border-2 transition-all ${activeBoard === "daily-orders"
                                ? 'bg-gradient-to-br from-[#0A2342] to-[#1a3a75] text-white border-[#C9A227]'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#C9A227] hover:shadow-md'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${activeBoard === "daily-orders" ? 'bg-[#C9A227]' : 'bg-gray-100'
                                }`}>
                                <FileText size={24} className={activeBoard === "daily-orders" ? 'text-white' : 'text-gray-600'} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Daily Orders</h3>
                                <p className={`text-sm mt-1 ${activeBoard === "daily-orders" ? 'text-blue-200' : 'text-gray-500'}`}>
                                    Today's orders
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveBoard("cause-list")}
                        className={`p-6 rounded-xl border-2 transition-all ${activeBoard === "cause-list"
                                ? 'bg-gradient-to-br from-[#0A2342] to-[#1a3a75] text-white border-[#C9A227]'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#C9A227] hover:shadow-md'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${activeBoard === "cause-list" ? 'bg-[#C9A227]' : 'bg-gray-100'
                                }`}>
                                <Calendar size={24} className={activeBoard === "cause-list" ? 'text-white' : 'text-gray-600'} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Cause List</h3>
                                <p className={`text-sm mt-1 ${activeBoard === "cause-list" ? 'text-blue-200' : 'text-gray-500'}`}>
                                    Cases listed
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveBoard("notices")}
                        className={`p-6 rounded-xl border-2 transition-all ${activeBoard === "notices"
                                ? 'bg-gradient-to-br from-[#0A2342] to-[#1a3a75] text-white border-[#C9A227]'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#C9A227] hover:shadow-md'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${activeBoard === "notices" ? 'bg-[#C9A227]' : 'bg-gray-100'
                                }`}>
                                <Bell size={24} className={activeBoard === "notices" ? 'text-white' : 'text-gray-600'} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Notices</h3>
                                <p className={`text-sm mt-1 ${activeBoard === "notices" ? 'text-blue-200' : 'text-gray-500'}`}>
                                    Official notices
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveBoard("announcements")}
                        className={`p-6 rounded-xl border-2 transition-all ${activeBoard === "announcements"
                                ? 'bg-gradient-to-br from-[#0A2342] to-[#1a3a75] text-white border-[#C9A227]'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#C9A227] hover:shadow-md'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${activeBoard === "announcements" ? 'bg-[#C9A227]' : 'bg-gray-100'
                                }`}>
                                <Megaphone size={24} className={activeBoard === "announcements" ? 'text-white' : 'text-gray-600'} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Announcements</h3>
                                <p className={`text-sm mt-1 ${activeBoard === "announcements" ? 'text-blue-200' : 'text-gray-500'}`}>
                                    Important updates
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search in current board..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="date"
                                    className="pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getBoardIcon(activeBoard)}
                                <div>
                                    <h3 className="text-2xl font-bold">{getBoardTitle(activeBoard)}</h3>
                                    <p className="text-blue-200 text-sm mt-1">
                                        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-white/10 px-4 py-2 rounded-lg">
                                <Clock size={16} />
                                <span>Last updated: Today, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-gray-200">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block w-12 h-12 border-4 border-[#0A2342] border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-gray-600">Loading...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="p-12 text-center">
                                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">No items found</p>
                                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or date filter</p>
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                                                {item.isNew && (
                                                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                                        NEW
                                                    </span>
                                                )}
                                                <span className="px-3 py-1 bg-[#C9A227] text-white text-xs font-semibold rounded-full">
                                                    {item.type}
                                                </span>
                                            </div>
                                            {item.description && (
                                                <p className="text-gray-600 mb-3">{item.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={16} />
                                                    <span>{new Date(item.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {item.fileUrl && (
                                                <>
                                                    <button className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" title="View">
                                                        <Eye size={20} />
                                                    </button>
                                                    <button className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" title="Download">
                                                        <Download size={20} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold mb-2">Need Help?</p>
                            <ul className="list-disc list-inside space-y-1 text-amber-700">
                                <li>Daily orders are published after court hours</li>
                                <li>Cause lists are available one day in advance</li>
                                <li>For certified copies, please contact the court registry</li>
                            </ul>
                            <p className="mt-3 text-amber-900">
                                For technical assistance, contact the IT helpdesk during office hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="text-center text-sm text-gray-600">
                        <p className="mb-2">
                            <strong>Disclaimer:</strong> The information on display boards is for reference purposes only.
                            For official records, please contact the court registry.
                        </p>
                        <p className="text-xs text-gray-500">
                            © 2024 Sajjad Husain Law Associates. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
