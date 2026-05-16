"use client";
import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { getBroadcastService } from "@/data/services/broadcast-service/broadcastService";
import { casesService } from "@/data/services/cases-service/casesService";
import { articleApi } from "@/data/services/article-service/article-service";
import Loader from "./Loader";
import Image from "next/image";
import { getSafeImageUrl } from "@/utils/imageUtils";
import { formatDate } from "@/utils/dateUtils";

type TabType = 'cases' | 'judgments' | 'articles' | 'notices';

export default function LatestInformationSection() {
    const [activeTab, setActiveTab] = useState<TabType>('cases');
    const [dataState, setDataState] = useState<{
        cases: any[],
        judgments: any[],
        articles: any[],
        notices: any[]
    }>({
        cases: [],
        judgments: [],
        articles: [],
        notices: []
    });
    const [loading, setLoading] = useState<Record<TabType, boolean>>({
        cases: false,
        judgments: false,
        articles: false,
        notices: false
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading({ cases: true, judgments: true, articles: true, notices: true });

        try {
            // 1. Fetch Cases
            const casesRes = await casesService.getAll({ limit: 6 });
            const casesData = casesRes?.data;
            const cases = casesData?.data?.data || casesData?.data || (Array.isArray(casesData) ? casesData : []);

            // 2. Fetch Judgments
            const judgmentsRes = await judgmentsService.getAll({ page: 1, limit: 6 });
            const jData = judgmentsRes?.data;
            const judgments = jData?.data?.data || jData?.data || (Array.isArray(jData) ? jData : []);

            // 3. Fetch Articles
            const articlesRes = await articleApi.fetchArticles({ limit: 6 });
            const aData = articlesRes?.data;
            // Robust check for article array: could be in .data.data or .data or the response itself
            const articles = aData?.data || (Array.isArray(aData) ? aData : []);

            // 4. Fetch Notices
            const noticesRes = await getBroadcastService.getBroadcast(1, 6, true);
            const nData = noticesRes?.data;
            const notices = nData?.data || (Array.isArray(nData) ? nData : []);

            setDataState({
                cases: Array.isArray(cases) ? cases : [],
                judgments: Array.isArray(judgments) ? judgments : [],
                articles: Array.isArray(articles) ? articles : [],
                notices: Array.isArray(notices) ? notices : []
            });
        } catch (error) {
            console.error("Error fetching latest information:", error);
        } finally {
            setLoading({ cases: false, judgments: false, articles: false, notices: false });
        }
    };

    const handleDownload = (id: string, pdfUrl?: string) => {
        if (pdfUrl) {
            window.open(pdfUrl, "_blank");
        } else {
            window.open(`/judgments/${id}?print=true`, "_blank");
        }
    };

    const renderListItems = (tab: TabType) => {
        const items = dataState[tab];
        if (loading[tab]) {
            return (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0 p-2">
                            <div className="w-3 h-3 bg-gray-200 rounded-full mt-1 shrink-0" />

                            {tab === 'articles' && (
                                <div className="w-14 h-14 bg-gray-200 rounded shrink-0" />
                            )}

                            <div className="flex-1 space-y-2">
                                <div className="flex gap-2">
                                    <div className="h-4 bg-gray-200 w-20 rounded" />
                                    <div className="h-4 bg-gray-100 w-12 rounded" />
                                </div>
                                <div className="h-3 bg-gray-200 w-full rounded" />
                                <div className="h-2 bg-gray-100 w-1/3 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (!items || items.length === 0) {
            return (
                <div className="py-10 text-center text-gray-500 italic">
                    No recent {tab} found.
                </div>
            );
        }

        return items.map((item: any, index: number) => {
            const id = item.id || item._id;

            // Layout logic based on tab
            if (tab === 'articles') {
                return (
                    <Link
                        key={id || index}
                        href={`/news/${item.slug}`}
                        className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0 hover:bg-gray-50/50 transition-all rounded p-2 group"
                    >
                        <span className="text-[#C9A227] mt-1 shrink-0">▸</span>

                        {/* Article Thumbnail */}
                        <div className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden border border-gray-100 shadow-sm">
                            <Image
                                src={getSafeImageUrl(item.thumbnail)}
                                alt={item.title}
                                fill
                                sizes="56px"
                                quality={80}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-[#C9A227] text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                    Recent News
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-[#0A2342] leading-tight line-clamp-1">
                                {item.title}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 font-medium italic">
                                By {item.authors || item.advocateName || "Sajjad Husain Law Associates"}
                            </p>
                        </div>
                    </Link>
                );
            }

            if (tab === 'cases') {
                return (
                    <Link
                        key={id || index}
                        href={`/cases/${id}`}
                        className="flex items-start gap-2.5 pb-3.5 border-b border-gray-200 last:border-0 hover:bg-gray-50/50 transition-colors p-2"
                    >
                        <span className="text-[#C9A227] mt-0.5">▸</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="px-2.5 py-1 bg-[#C9A227] text-white text-[10px] font-bold rounded whitespace-nowrap uppercase tracking-wider">
                                    {item.caseNumber || 'Case'}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-bold text-[#0A2342] bg-gray-100 rounded uppercase">
                                    {item.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed truncate font-medium group-hover:text-[#0A2342]">
                                {item.title}
                            </p>
                        </div>
                    </Link>
                );
            }

            if (tab === 'judgments') {
                const title = `${item.caseTitle || item.case?.title || item.title || 'Judgment'} - ${item.case?.caseNumber || ''}`;
                const pdfUrl = item.pdfUrl;

                return (
                    <div key={id || index} className="flex items-start gap-2.5 pb-3.5 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-50/50 transition-colors group/item p-2">
                        <span className="text-[#C9A227] mt-0.5">▸</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="px-2.5 py-1 bg-[#C9A227] text-white text-[10px] font-bold rounded whitespace-nowrap uppercase tracking-wider">
                                    Judgment
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(id, pdfUrl);
                                    }}
                                    className="px-3 py-1 bg-[#0A2342] text-white text-[10px] font-medium rounded hover:bg-[#1a3a75] transition-colors"
                                >
                                    {pdfUrl ? 'view pdf' : 'download'}
                                </button>
                            </div>
                            <a
                                href={pdfUrl || `/judgments/${id}`}
                                target={pdfUrl ? "_blank" : "_self"}
                                rel={pdfUrl ? "noopener noreferrer" : undefined}
                                className="block"
                            >
                                <p className="text-sm text-gray-700 leading-relaxed truncate group-hover/item:text-[#0A2342] font-medium">
                                    {title}
                                </p>
                            </a>
                        </div>
                    </div>
                );
            }

            // Notices
            const title = item.content?.title || item.title || 'Notification';
            return (
                <div key={id || index} className="flex items-start gap-2.5 pb-3.5 border-b border-gray-200 last:border-0 hover:bg-gray-50/50 transition-colors p-2">
                    <span className="text-[#C9A227] mt-0.5">▸</span>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-1 bg-[#C9A227] text-white text-[10px] font-bold rounded whitespace-nowrap uppercase tracking-wider">
                                Notice
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">{formatDate(item.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed truncate">
                            {title}
                        </p>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A2342] mb-6">Latest Information</h2>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-[550px] shadow-sm">
                {/* Tab Buttons */}
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b-2 border-gray-200">
                    <button
                        onClick={() => setActiveTab('cases')}
                        className={`px-3 py-2 rounded text-xs md:text-sm font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wide ${activeTab === 'cases'
                            ? 'bg-[#0A2342] text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#C9A227] hover:text-[#C9A227]'
                            }`}
                    >
                        Cases
                    </button>
                    <button
                        onClick={() => setActiveTab('judgments')}
                        className={`px-3 py-2 rounded text-xs md:text-sm font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wide ${activeTab === 'judgments'
                            ? 'bg-[#C9A227] text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#C9A227] hover:text-[#C9A227]'
                            }`}
                    >
                        Judgments
                    </button>
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`px-3 py-2 rounded text-xs md:text-sm font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wide ${activeTab === 'articles'
                            ? 'bg-[#0A2342] text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#C9A227] hover:text-[#C9A227]'
                            }`}
                    >
                        Recent Articles
                    </button>
                    <button
                        onClick={() => setActiveTab('notices')}
                        className={`px-3 py-2 rounded text-xs md:text-sm font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wide ${activeTab === 'notices'
                            ? 'bg-[#0A2342] text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#C9A227] hover:text-[#C9A227]'
                            }`}
                    >
                        Notices
                    </button>
                </div>

                {/* Information List - Fixed Height with Scroll */}
                <div className="overflow-y-auto p-5 md:p-6 max-h-[400px] flex-1">
                    <div className="space-y-2">
                        {renderListItems(activeTab)}
                    </div>
                </div>

                {/* Footer Section */}
                {/* <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                    <Link
                        href={`/${activeTab === 'articles' ? 'articles' : activeTab}`}
                        className="text-xs font-bold text-[#C9A227] uppercase tracking-widest hover:text-[#0A2342] transition-colors"
                    >
                        View all {activeTab}
                    </Link>
                </div> */}
            </div>
        </div>
    );
}
