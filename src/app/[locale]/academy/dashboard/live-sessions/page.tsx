"use client";

import React, { useState, useEffect } from "react";
import { Video, Calendar, Clock, ExternalLink, PlayCircle, Users, Tv, Loader2, Film, Radio } from "lucide-react";
import Link from "next/link";
import { courseApi } from "@/data/services/academy-service/course.service";
import { formatTime12HourIST } from "@/lib/utils";

export default function LiveSessionsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "recordings">("upcoming");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await courseApi.fetchLiveSessions();
        const data = res.data?.data || res.data || [];
        setSessions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load live sessions:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const upcomingSessions = sessions.filter((s) => {
    const status = s.liveData?.status || "scheduled";
    return status === "live" || status === "scheduled";
  });

  const recordingSessions = sessions.filter((s) => {
    const status = s.liveData?.status || "scheduled";
    return status === "completed" || s.liveData?.recordingUrl || s.fileUrl;
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#122340] mb-2 tracking-tight">Live Classes & Virtual Sessions</h1>
          <p className="text-[#122340]/60">Join live interactive classroom sessions or watch archived recordings.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-[#122340]/5 rounded-xl max-w-sm">
        {(["upcoming", "recordings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-white text-[#122340] shadow-sm"
                : "text-[#122340]/60 hover:text-[#122340] hover:bg-[#122340]/5"
            }`}
          >
            {tab === "upcoming" ? `Upcoming (${upcomingSessions.length})` : `Recordings (${recordingSessions.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#122340]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-[#122340]/40">
            <Loader2 size={36} className="animate-spin text-[#C9A227] mb-3" />
            <p className="text-sm font-bold">Loading live sessions...</p>
          </div>
        ) : activeTab === "upcoming" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingSessions.length === 0 ? (
              <div className="col-span-full text-center py-20 text-[#122340]/40 font-medium">
                <Video size={48} className="mx-auto mb-3 opacity-30 text-[#122340]" />
                <p className="text-base font-bold text-[#122340]">No upcoming live sessions</p>
                <p className="text-xs text-[#122340]/60 mt-1">Check back soon when your instructors schedule new classes.</p>
              </div>
            ) : (
              upcomingSessions.map((item) => {
                const liveData = item.liveData || {};
                const isLive = liveData.status === "live";
                const platform = liveData.platform || item.provider || (item.fileUrl?.includes("meet.google.com") ? "gmeet" : item.fileUrl?.includes("zoom.us") ? "zoom" : item.fileUrl?.includes("youtube") ? "youtube" : "jitsi");
                const meetingUrl = liveData.meetingUrl || (platform === "gmeet" || platform === "zoom" ? item.fileUrl : "");
                const targetUrl = item.course?.slug ? `/dashboard/learn/${item.course.slug}` : "/dashboard/courses";

                return (
                  <div
                    key={item.id}
                    className={`p-6 rounded-2xl border transition-all hover:shadow-lg group flex flex-col justify-between ${
                      isLive ? "border-red-300 bg-red-50/20 shadow-sm" : "border-[#122340]/10 hover:border-[#C9A227]/50"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isLive
                              ? "bg-red-100 text-red-700 border-red-200 animate-pulse"
                              : platform === "gmeet"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : platform === "zoom"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : platform === "youtube"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}
                        >
                          {isLive ? (
                            <Radio size={14} className="text-red-600 animate-ping" />
                          ) : platform === "gmeet" || platform === "zoom" ? (
                            <Video size={14} />
                          ) : platform === "youtube" ? (
                            <Tv size={14} />
                          ) : (
                            <Users size={14} />
                          )}
                          {isLive
                            ? "LIVE NOW"
                            : platform === "gmeet"
                            ? "Google Meet"
                            : platform === "zoom"
                            ? "Zoom Meeting"
                            : platform === "youtube"
                            ? "YouTube Live"
                            : "Jitsi Classroom"}
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-[#122340]/5 flex flex-col items-center justify-center shrink-0 border border-[#122340]/10">
                          <span className="text-[11px] font-extrabold text-[#122340]">
                            {liveData.scheduledDate || "TBD"}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-[#122340] text-xl mb-1.5 group-hover:text-[#C9A227] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm font-semibold text-[#122340]/50 mb-6">
                        {item.course?.title || "Legal Academy Course"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#122340]/5 pt-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#122340]">
                        <Clock size={16} className="text-[#C9A227]" />
                        {formatTime12HourIST(liveData.scheduledTime)} ({liveData.durationMinutes || 60} min)
                      </div>

                      <div className="flex items-center gap-2">
                        {(platform === "gmeet" || platform === "zoom") && meetingUrl ? (
                          <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
                            <button
                              className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs shadow-md cursor-pointer ${
                                platform === "gmeet"
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-sky-600 hover:bg-sky-700 text-white"
                              }`}
                            >
                              Join {platform === "gmeet" ? "Meet" : "Zoom"} (New Tab) <ExternalLink size={14} />
                            </button>
                          </a>
                        ) : null}

                        <Link href={targetUrl}>
                          <button
                            className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs shadow-md cursor-pointer ${
                              isLive
                                ? "bg-red-600 hover:bg-red-700 text-white animate-bounce"
                                : "bg-[#122340] hover:bg-[#0a1628] text-white"
                            }`}
                          >
                            {isLive ? "Enter Class" : "Class Room"} <ExternalLink size={14} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordingSessions.length === 0 ? (
              <div className="col-span-full text-center py-20 text-[#122340]/40 font-medium">
                <Film size={48} className="mx-auto mb-3 opacity-30 text-[#122340]" />
                <p className="text-base font-bold text-[#122340]">No recordings available yet</p>
                <p className="text-xs text-[#122340]/60 mt-1">Concluded class replays will appear here automatically.</p>
              </div>
            ) : (
              recordingSessions.map((item) => {
                const liveData = item.liveData || {};
                const targetUrl = item.course?.slug ? `/dashboard/learn/${item.course.slug}` : "/dashboard/courses";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#122340]/10 overflow-hidden hover:border-[#C9A227]/50 transition-all group cursor-pointer bg-[#f8f9fa] flex flex-col"
                  >
                    <div className="h-44 w-full relative overflow-hidden bg-black flex items-center justify-center">
                      <PlayCircle size={44} className="text-white/80 group-hover:text-[#C9A227] group-hover:scale-110 transition-all duration-300" />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-sm">
                        Class Replay
                      </div>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-mono">
                        {liveData.durationMinutes || 60}m
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-[#122340] text-base mb-1 group-hover:text-[#C9A227] transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#122340]/50 font-semibold mb-4 line-clamp-1">
                          {item.course?.title || "Legal Academy Course"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-200/50 pt-3">
                        <span className="text-[11px] font-medium text-gray-500">
                          {liveData.scheduledDate || "Concluded"}
                        </span>
                        <Link href={targetUrl} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          Watch Replay →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
