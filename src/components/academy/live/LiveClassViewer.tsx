"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Video,
  Users,
  Tv,
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Radio,
  Loader2,
  Film,
  UploadCloud,
  Save,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Key,
  PhoneOff,
  X,
  Trash2,
} from "lucide-react";
import JitsiPlayer from "./JitsiPlayer";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { courseApi } from "@/data/services/academy-service/course.service";
import toast from "react-hot-toast";
import { formatTime12HourIST } from "@/lib/utils";

interface LiveClassViewerProps {
  item: {
    id: string;
    title: string;
    type: string;
    provider?: string;
    fileUrl?: string;
    duration?: number;
    liveData?: any;
    completed?: boolean;
  };
  user: any;
  courseTitle?: string;
  onStatusChange?: (updatedItem: any) => void;
  onMarkComplete?: (itemId: string) => void;
}

export default function LiveClassViewer({
  item,
  user,
  courseTitle = "Legal Academy Course",
  onStatusChange,
  onMarkComplete,
}: LiveClassViewerProps) {
  const isInstructor = useMemo(() => {
    const role = (user?.role || user?.roleName || "").toLowerCase();
    return role === "admin" || role === "instructor" || role === "superadmin";
  }, [user]);

  const [currentLiveData, setCurrentLiveData] = useState<any>(item.liveData || {});
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordingUrlInput, setRecordingUrlInput] = useState(item.liveData?.recordingUrl || "");
  const [isSavingRecording, setIsSavingRecording] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const jitsiApiRef = useRef<any>(null);
  const [hasLeftLocally, setHasLeftLocally] = useState(false);
  const [isCheckingReplay, setIsCheckingReplay] = useState(false);
  const [isCheckingLive, setIsCheckingLive] = useState(false);
  const [showEditRecording, setShowEditRecording] = useState(false);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Prompt Modal when starting a session without a URL (YouTube / GMeet / Zoom)
  const [startLinkModal, setStartLinkModal] = useState<{
    isOpen: boolean;
    platform: "youtube" | "gmeet" | "zoom" | "";
    url: string;
    passcode: string;
  }>({
    isOpen: false,
    platform: "",
    url: "",
    passcode: "",
  });

  // Sync state with props
  useEffect(() => {
    setCurrentLiveData(item.liveData || {});
    setRecordingUrlInput(item.liveData?.recordingUrl || "");
    setHasLeftLocally(false);
    setShowEditRecording(false);
  }, [item.id, item.liveData]);

  const rawStatus = currentLiveData?.status;
  const isConcluded = rawStatus === "completed";
  const isLive = rawStatus === "live";
  const isScheduled = Boolean(currentLiveData?.scheduledDate && currentLiveData?.scheduledTime && rawStatus !== "not_scheduled");
  const status = isLive ? "live" : isConcluded ? "completed" : isScheduled ? "scheduled" : "not_scheduled";
  
  const platform: "jitsi" | "youtube" | "gmeet" | "zoom" | "" = 
    currentLiveData?.platform || 
    (item.provider as any) || 
    (item.fileUrl?.includes("youtube") || item.fileUrl?.includes("youtu.be") ? "youtube" : 
     item.fileUrl?.includes("meet.google.com") ? "gmeet" : 
     item.fileUrl?.includes("zoom.us") ? "zoom" : "");

  const meetingUrl = currentLiveData?.meetingUrl || (platform === "gmeet" || platform === "zoom" ? item.fileUrl : "") || "";
  const passcode = currentLiveData?.passcode || "";

  // Validate if URL is a playable recorded video (not an external meeting join link)
  const isPlayableVideoUrl = (url?: string) => {
    if (!url) return false;
    const trimmed = url.trim();
    if (!trimmed || trimmed.length < 5) return false;
    const lower = trimmed.toLowerCase();
    if (lower.includes("meet.google.com") || lower.includes("zoom.us")) return false;
    return (
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.startsWith("/") ||
      lower.startsWith("blob:") ||
      lower.includes("youtube.com") ||
      lower.includes("youtu.be")
    );
  };

  // Replay video is valid if an explicit recordingUrl is provided,
  // or if item.fileUrl is a playable video and not the old live broadcast stream link or meeting link.
  const rawRecordingUrl = currentLiveData?.recordingUrl?.trim() || "";
  const liveStreamUrl = (currentLiveData?.youtubeUrl || "").trim();
  const replayVideoUrl =
    rawRecordingUrl && isPlayableVideoUrl(rawRecordingUrl)
      ? rawRecordingUrl
      : (status === "completed" && item.fileUrl && isPlayableVideoUrl(item.fileUrl) && item.fileUrl.trim() !== liveStreamUrl)
      ? item.fileUrl.trim()
      : "";

  // Timer for live class - accurately synced with server startedAt reference
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "live") {
      const calculateElapsed = () => {
        if (currentLiveData?.startedAt) {
          const startMs = new Date(currentLiveData.startedAt).getTime();
          const nowMs = Date.now();
          return Math.max(0, Math.floor((nowMs - startMs) / 1000));
        }
        return 0;
      };

      setElapsedSeconds(calculateElapsed());

      timer = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (currentLiveData?.startedAt) {
            return calculateElapsed();
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [status, currentLiveData?.startedAt]);

  // Gentle check for students in scheduled state to auto-detect when instructor starts
  useEffect(() => {
    if (status !== "scheduled" || isInstructor) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await courseApi.fetchLiveSessions({ status: "live" });
        if (!isMounted) return;
        const liveSessions = res.data?.data || res.data || [];
        const match = liveSessions.find((s: any) => s.id === item.id);
        if (match && match.liveData?.status === "live") {
          setCurrentLiveData(match.liveData);
          if (onStatusChange) onStatusChange({ ...item, liveData: match.liveData });
          toast.success("The instructor has started the live class!");
        }
      } catch (e) {
        // Silently ignore poll network glitches
      }
    }, 25000); // 25s gentle check instead of rapid continuous fetching

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [status, isInstructor, item.id, item, onStatusChange]);

  const formatElapsedTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const copyPasscode = () => {
    if (!passcode) return;
    navigator.clipboard.writeText(passcode);
    setCopiedPasscode(true);
    toast.success("Passcode copied to clipboard!");
    setTimeout(() => setCopiedPasscode(false), 2000);
  };

  // Student on-demand check for recording replay without background poll spam
  const handleCheckReplay = async () => {
    setIsCheckingReplay(true);
    try {
      const res = await courseApi.fetchLiveSessions();
      const liveSessions = res.data?.data || res.data || [];
      const match = liveSessions.find((s: any) => s.id === item.id);
      const replayUrl = match?.liveData?.recordingUrl;
      if (replayUrl && isPlayableVideoUrl(replayUrl)) {
        setCurrentLiveData(match.liveData);
        if (onStatusChange) onStatusChange({ ...item, liveData: match.liveData });
        toast.success("Class recording is now available!");
      } else {
        toast("Recording is not yet available. Please check back shortly.", { icon: "⏳" });
      }
    } catch (e) {
      toast.error("Failed to check recording status");
    } finally {
      setIsCheckingReplay(false);
    }
  };

  // Student on-demand check if scheduled class has started
  const handleCheckLiveStatus = async () => {
    setIsCheckingLive(true);
    try {
      const res = await courseApi.fetchLiveSessions({ status: "live" });
      const liveSessions = res.data?.data || res.data || [];
      const match = liveSessions.find((s: any) => s.id === item.id);
      if (match?.liveData?.status === "live") {
        setCurrentLiveData(match.liveData);
        if (onStatusChange) onStatusChange({ ...item, liveData: match.liveData });
        toast.success("The instructor has started the live class!");
      } else {
        toast("Class has not started yet. Please wait.", { icon: "⏳" });
      }
    } catch (e) {
      toast.error("Failed to check class status");
    } finally {
      setIsCheckingLive(false);
    }
  };

  // Action: Leave room individually without terminating the live session for others
  const handleLeaveClassLocally = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand("hangup");
      } catch (_) {}
    }
    setHasLeftLocally(true);
    toast("You left the live room. You can rejoin anytime.", { icon: "👋" });
  };

  // Student handler when Jitsi meeting ends or host terminates room
  const handleStudentMeetingLeft = async () => {
    try {
      const res = await courseApi.fetchLiveSessions();
      const liveSessions = res.data?.data || res.data || [];
      const match = liveSessions.find((s: any) => s.id === item.id);
      if (match && match.liveData?.status === "completed") {
        setCurrentLiveData(match.liveData);
        if (onStatusChange) onStatusChange({ ...item, liveData: match.liveData });
        toast("The live class has concluded.", { icon: "ℹ️" });
        return;
      }
    } catch (e) {
      // Silently ignore
    }

    // If server session is still active, the student simply left the call individually
    setHasLeftLocally(true);
    toast("You left the live class. You can rejoin anytime while it is active.", { icon: "👋" });
  };

  // Instructor action: Start Class
  const handleStartClass = async (providedUrl?: string, providedPasscode?: string) => {
    const sPlatform = platform;
    const effectiveYoutubeUrl = providedUrl || currentLiveData?.youtubeUrl || item.fileUrl || "";
    const effectiveMeetingUrl = providedUrl || meetingUrl || "";

    if (!providedUrl) {
      if (sPlatform === "youtube" && !effectiveYoutubeUrl.trim()) {
        setStartLinkModal({
          isOpen: true,
          platform: "youtube",
          url: "",
          passcode: "",
        });
        return;
      }
      if ((sPlatform === "gmeet" || sPlatform === "zoom") && !effectiveMeetingUrl.trim()) {
        setStartLinkModal({
          isOpen: true,
          platform: sPlatform,
          url: "",
          passcode: passcode || "",
        });
        return;
      }
    }

    setIsUpdatingStatus(true);
    try {
      if (providedUrl?.trim()) {
        const updatedLiveData = {
          ...(currentLiveData || {}),
          platform: sPlatform,
          youtubeUrl: sPlatform === "youtube" ? providedUrl.trim() : (currentLiveData?.youtubeUrl || ""),
          meetingUrl: (sPlatform === "gmeet" || sPlatform === "zoom") ? providedUrl.trim() : (currentLiveData?.meetingUrl || ""),
          passcode: providedPasscode !== undefined ? providedPasscode.trim() : (currentLiveData?.passcode || ""),
        };
        await courseApi.updateCurriculumItem(item.id, {
          provider: sPlatform,
          fileUrl: providedUrl.trim(),
          liveData: updatedLiveData,
        });
        setCurrentLiveData(updatedLiveData);
      }

      const res = await courseApi.updateLiveStatus(item.id, "live");
      const updated = res.data?.data || res.data;
      setCurrentLiveData(updated.liveData || { ...currentLiveData, status: "live" });
      if (onStatusChange) onStatusChange(updated);
      toast.success("Live class started! Students can now join.");

      // For Google Meet and Zoom, automatically launch the host meeting in a new tab
      const finalMeetingUrl = providedUrl?.trim() || meetingUrl;
      if ((sPlatform === "gmeet" || sPlatform === "zoom") && finalMeetingUrl) {
        window.open(finalMeetingUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      toast.error("Failed to start live class. Please check network.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmStartWithLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLinkModal.url.trim()) {
      return toast.error("Please enter a valid link to start the class");
    }
    const url = startLinkModal.url.trim();
    const enteredPasscode = startLinkModal.passcode.trim();

    if (startLinkModal.platform === "youtube") {
      if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        return toast.error("Please enter a valid YouTube stream URL (e.g. https://www.youtube.com/watch?v=...)");
      }
    } else if (startLinkModal.platform === "gmeet") {
      if (!url.includes("meet.google.com")) {
        return toast.error("Please enter a valid Google Meet URL (e.g. https://meet.google.com/xxx-yyyy-zzz)");
      }
    } else if (startLinkModal.platform === "zoom") {
      if (!url.includes("zoom.us")) {
        return toast.error("Please enter a valid Zoom meeting URL (e.g. https://us02web.zoom.us/j/...)");
      }
    }

    setStartLinkModal({ isOpen: false, platform: "", url: "", passcode: "" });
    await handleStartClass(url, enteredPasscode);
  };

  // Instructor action: End Class
  const handleEndClass = () => {
    setConfirmModal({
      isOpen: true,
      title: "End Live Class?",
      message: `Are you sure you want to end "${item.title}" for all students? This will conclude the session and transition it to completed.`,
      confirmText: "End Class For All",
      variant: "warning",
      onConfirm: async () => {
        setIsUpdatingStatus(true);
        try {
          // If in Jitsi, instruct Jitsi to terminate conference for all participants immediately
          if (jitsiApiRef.current) {
            try {
              jitsiApiRef.current.executeCommand("endConference");
            } catch (err) {
              try {
                jitsiApiRef.current.executeCommand("hangup");
              } catch (_) {}
            }
          }

          const res = await courseApi.updateLiveStatus(item.id, "completed");
          const updated = res.data?.data || res.data;
          setCurrentLiveData(updated.liveData || { ...currentLiveData, status: "completed" });
          if (onStatusChange) onStatusChange(updated);
          toast.success("Live class ended for all students.");
        } catch (e) {
          toast.error("Failed to end live class.");
        } finally {
          setIsUpdatingStatus(false);
        }
      },
    });
  };

  // Instructor action: Save Recording
  const handleSaveRecording = async () => {
    if (!recordingUrlInput.trim()) return toast.error("Please enter a valid recording URL");

    setIsSavingRecording(true);
    try {
      const res = await courseApi.updateLiveRecording(item.id, recordingUrlInput.trim());
      const updated = res.data?.data || res.data;
      setCurrentLiveData(updated.liveData || { ...currentLiveData, recordingUrl: recordingUrlInput.trim() });
      if (onStatusChange) onStatusChange(updated);
      toast.success("Class recording saved successfully!");
    } catch (e) {
      toast.error("Failed to save recording URL");
    } finally {
      setIsSavingRecording(false);
    }
  };

  // Instructor action: Remove Recording
  const handleClearRecording = async () => {
    setIsSavingRecording(true);
    try {
      const res = await courseApi.updateLiveRecording(item.id, "");
      const updated = res.data?.data || res.data;
      setCurrentLiveData(updated.liveData || { ...currentLiveData, recordingUrl: "" });
      setRecordingUrlInput("");
      setShowEditRecording(false);
      if (onStatusChange) onStatusChange(updated);
      toast.success("Recording removed. Session reset to awaiting upload.");
    } catch (e) {
      toast.error("Failed to clear recording URL");
    } finally {
      setIsSavingRecording(false);
    }
  };

  // Helper for YouTube embed supporting /watch?v=, youtu.be/, /live/, /embed/, and query parameters
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    const videoId = match && match[1] ? match[1] : (url.trim().length === 11 && !url.includes("/") ? url.trim() : url);
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
  };


  return (
    <div className="w-full flex flex-col items-center">
      {/* ─────────────────────────────────────────────────────────────────────────────
          STATE 0: NOT SCHEDULED
      ───────────────────────────────────────────────────────────────────────────── */}
      {status === "not_scheduled" && (
        <div className="mt-4 sm:mt-6 mx-auto w-[95%] max-w-4xl bg-gradient-to-br from-[#122340] via-[#0d1c33] to-[#0a1628] rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-6">
            <Clock size={14} className="text-amber-400" />
            Class Not Scheduled Yet
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-white max-w-2xl mx-auto">
            {item.title}
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto mb-8">
            {courseTitle}
          </p>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-lg mx-auto mb-8 text-center">
            <p className="text-sm text-white/80 leading-relaxed">
              {isInstructor 
                ? "This live session has not been scheduled with a date and time yet. Please open Course Curriculum to set the platform, date, and start time."
                : "The instructor has not scheduled the timing for this live session yet. Please check back soon for the announcement."}
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          STATE 1: SCHEDULED (Waiting Room / Pre-Class Gatekeeper)
      ───────────────────────────────────────────────────────────────────────────── */}
      {status === "scheduled" && (
        <div className="mt-4 sm:mt-6 mx-auto w-[95%] max-w-4xl bg-gradient-to-br from-[#122340] via-[#0d1c33] to-[#0a1628] rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          {platform === "gmeet" && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-6">
              <Video size={14} className="text-emerald-400 animate-pulse" />
              Scheduled Google Meet Session
            </div>
          )}
          {platform === "zoom" && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30 mb-6">
              <Video size={14} className="text-sky-400 animate-pulse" />
              Scheduled Zoom Meeting
            </div>
          )}
          {platform === "youtube" && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30 mb-6">
              <Tv size={14} className="text-red-400 animate-pulse" />
              Scheduled YouTube Broadcast
            </div>
          )}
          {platform === "jitsi" && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 mb-6">
              <Radio size={14} className="text-blue-400 animate-pulse" />
              Scheduled Virtual Classroom (Jitsi)
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-white max-w-2xl mx-auto">
            {item.title}
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto mb-8">
            {courseTitle}
          </p>

          {/* Schedule Info Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-lg mx-auto mb-8 grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-[#C9A227]">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Date</p>
                <p className="text-sm font-bold text-white mt-0.5">{currentLiveData?.scheduledDate || "Upcoming"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-[#C9A227]">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Start Time (IST)</p>
                <p className="text-sm font-bold text-white mt-0.5">{formatTime12HourIST(currentLiveData?.scheduledTime)}</p>
              </div>
            </div>

            {/* Passcode & Platform Info if GMeet or Zoom */}
            {(platform === "gmeet" || platform === "zoom") && (
              <div className="col-span-2 border-t border-white/10 pt-3 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${platform === "gmeet" ? "bg-emerald-400" : "bg-sky-400"}`}></span>
                  <span className="text-xs text-white/80 font-medium">
                    Platform: <strong className="text-white">{platform === "gmeet" ? "Google Meet" : "Zoom Meeting"}</strong>
                  </span>
                </div>

                {passcode && (
                  <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                    <Key size={12} className="text-[#C9A227]" />
                    <span className="text-xs text-white/60">Passcode:</span>
                    <span className="text-xs font-mono font-bold text-white select-all">{passcode}</span>
                    <button
                      onClick={copyPasscode}
                      title="Copy Passcode"
                      className="text-white/60 hover:text-white p-0.5 ml-1 transition cursor-pointer"
                    >
                      {copiedPasscode ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gatekeeper Actions */}
          {isInstructor ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleStartClass()}
                  disabled={isUpdatingStatus}
                  className="bg-[#C9A227] text-[#0a1628] px-8 py-4 rounded-xl font-extrabold text-base hover:bg-[#b08d20] transition-all transform hover:-translate-y-0.5 shadow-xl flex items-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingStatus ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} className="fill-current" />}
                  Start Class Now (Host)
                </button>

                {(platform === "gmeet" || platform === "zoom") && meetingUrl && (
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-bold text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Preview Meeting Link <ExternalLink size={16} />
                  </a>
                )}
              </div>

              <p className="text-xs text-white/50">
                🛡️ Clicking &quot;Start Class Now&quot; will activate the room for your students {(platform === "gmeet" || platform === "zoom") && "and open your meeting in a new tab"}.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* For Google Meet / Zoom: Students can open directly in new tab */}
              {(platform === "gmeet" || platform === "zoom") && meetingUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-8 py-4 rounded-2xl font-extrabold text-base text-white shadow-2xl flex items-center gap-3 cursor-pointer transform hover:-translate-y-0.5 transition-all ${
                      platform === "gmeet"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-900/40"
                        : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-sky-900/40"
                    }`}
                  >
                    <Video size={20} />
                    Join {platform === "gmeet" ? "Google Meet Class" : "Zoom Meeting"} (New Tab)
                    <ExternalLink size={18} />
                  </a>
                  <p className="text-xs text-white/50 max-w-md">
                    Opens in a new browser tab. Please be ready at the scheduled time ({formatTime12HourIST(currentLiveData?.scheduledTime)} IST).
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold border border-white/15">
                    <Loader2 size={16} className="animate-spin text-[#C9A227]" />
                    Waiting for the instructor to start the class...
                  </div>
                  <button
                    onClick={handleCheckLiveStatus}
                    disabled={isCheckingLive}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer border border-white/10 disabled:opacity-60"
                  >
                    {isCheckingLive ? <Loader2 size={13} className="animate-spin text-[#C9A227]" /> : <RotateCcw size={13} />}
                    Refresh Status
                  </button>
                  <p className="text-xs text-white/40 max-w-sm leading-relaxed">
                    Click &quot;Refresh Status&quot; anytime to check if your instructor has gone live.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          STATE 2: LIVE (In-Progress Classroom / Broadcast)
      ───────────────────────────────────────────────────────────────────────────── */}
      {status === "live" && (
        <div className="mt-2 sm:mt-4 mx-auto w-[95%] max-w-6xl flex flex-col gap-3">
          {/* Top Host & Session Status Bar */}
          <div className="bg-[#0a1628] text-white p-3.5 px-5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-white/10">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold uppercase tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                LIVE NOW
              </div>
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-lg text-white/80">
                ⏱️ {formatElapsedTime(elapsedSeconds)}
              </span>
              <h3 className="font-bold text-sm hidden md:block truncate max-w-xs">{item.title}</h3>
            </div>

            {/* Platform & Host Control */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold hidden sm:flex items-center gap-1.5">
                {platform === "gmeet" && (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Video size={14} /> Google Meet Live
                  </span>
                )}
                {platform === "zoom" && (
                  <span className="text-sky-400 flex items-center gap-1.5">
                    <Video size={14} /> Zoom Meeting Live
                  </span>
                )}
                {platform === "youtube" && (
                  <span className="text-red-400 flex items-center gap-1.5">
                    <Tv size={14} /> YouTube Broadcast
                  </span>
                )}
                {platform === "jitsi" && (
                  <span className="text-[#C9A227] flex items-center gap-1.5">
                    <Users size={14} /> Jitsi Virtual Classroom
                  </span>
                )}
              </span>

              {isInstructor ? (
                <div className="flex items-center gap-2">
                  {!hasLeftLocally && (
                    <button
                      onClick={handleLeaveClassLocally}
                      className="bg-white/10 hover:bg-white/20 text-white/90 px-3 py-1.5 rounded-xl font-bold text-xs transition border border-white/15 flex items-center gap-1.5 cursor-pointer"
                      title="Leave the room temporarily without ending class for students"
                    >
                      <PhoneOff size={13} />
                      Leave Room
                    </button>
                  )}
                  <button
                    onClick={handleEndClass}
                    disabled={isUpdatingStatus}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-xl font-bold text-xs transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingStatus ? <Loader2 size={14} className="animate-spin" /> : "End Class For All"}
                  </button>
                </div>
              ) : (
                !hasLeftLocally && (
                  <button
                    onClick={handleLeaveClassLocally}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    title="Leave the live class"
                  >
                    <PhoneOff size={13} />
                    Leave Class
                  </button>
                )
              )}
            </div>
          </div>

          {/* Embedded Player, Left State, or External Room Portal */}
          {hasLeftLocally ? (
            <div className="w-full min-h-[480px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#122340] via-[#0d1c33] to-[#0a1628] border border-white/10 flex flex-col items-center justify-center p-8 sm:p-12 text-center text-white relative">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#C9A227] mb-4 border border-white/15 shadow-inner">
                <PhoneOff size={30} />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider mb-3 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Live Session In Progress
              </div>
              <h2 className="text-xl sm:text-2xl font-black mb-2">
                {isInstructor ? "You Stepped Out of the Live Room" : "You Left the Live Classroom"}
              </h2>
              <p className="text-xs sm:text-sm text-white/60 max-w-md mb-6 leading-relaxed">
                {isInstructor 
                  ? "The live session is still running for your students. You can rejoin as host at any time, or officially end the class for all attendees."
                  : "The instructor and your classmates are still in session. You can rejoin the live class anytime while it is active."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setHasLeftLocally(false)}
                  className="px-8 py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-[#C9A227] to-[#b08d20] hover:from-[#d8b02e] hover:to-[#be9823] shadow-lg shadow-[#C9A227]/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw size={16} />
                  {isInstructor ? "Rejoin as Host" : "Rejoin Live Class"}
                </button>

                {isInstructor && (
                  <button
                    onClick={handleEndClass}
                    disabled={isUpdatingStatus}
                    className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingStatus ? <Loader2 size={16} className="animate-spin" /> : null}
                    End Class For All
                  </button>
                )}
              </div>
            </div>
          ) : platform === "gmeet" || platform === "zoom" ? (
            <div className={`w-full min-h-[480px] rounded-2xl overflow-hidden shadow-2xl border flex flex-col items-center justify-center p-8 sm:p-12 text-center relative ${
              platform === "gmeet" 
                ? "bg-gradient-to-br from-[#0a1f18] via-[#0d2a21] to-[#071510] border-emerald-500/30 text-white" 
                : "bg-gradient-to-br from-[#0a1c2e] via-[#0d233a] to-[#071422] border-sky-500/30 text-white"
            }`}>
              {/* Background ambient glow */}
              <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
                platform === "gmeet" ? "bg-emerald-500/15" : "bg-sky-500/15"
              }`} />

              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl border ${
                platform === "gmeet" 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                  : "bg-sky-500/20 text-sky-400 border-sky-500/30"
              }`}>
                <Video size={40} className="animate-pulse" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider mb-4 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Live Session In Progress
              </div>

              <h2 className="text-2xl sm:text-3xl font-black max-w-xl mb-2">
                Live Classroom on {platform === "gmeet" ? "Google Meet" : "Zoom"}
              </h2>
              <p className="text-sm text-white/70 max-w-md mb-6">
                The session is happening right now. Click the button below to open and participate in the live room in a new browser tab.
              </p>

              {passcode && (
                <div className="mb-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
                  <Key size={14} className="text-[#C9A227]" />
                  <span className="text-xs text-white/70 font-semibold">Passcode:</span>
                  <span className="text-sm font-mono font-bold text-white select-all">{passcode}</span>
                  <button
                    onClick={copyPasscode}
                    className="p-1 rounded text-white/60 hover:text-white transition cursor-pointer"
                    title="Copy Passcode"
                  >
                    {copiedPasscode ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              )}

              {meetingUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-10 py-4 rounded-2xl font-extrabold text-base text-white shadow-2xl flex items-center gap-3 cursor-pointer transform hover:-translate-y-1 transition-all ${
                      platform === "gmeet"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-900/50"
                        : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-900/50"
                    }`}
                  >
                    <Video size={20} />
                    {isInstructor ? "Open Host Room (New Tab)" : `Join ${platform === "gmeet" ? "Google Meet" : "Zoom"} (New Tab)`}
                    <ExternalLink size={18} />
                  </a>

                  {isInstructor && (
                    <button
                      onClick={handleEndClass}
                      disabled={isUpdatingStatus}
                      className="bg-red-600/90 hover:bg-red-600 text-white px-6 py-4 rounded-2xl font-bold text-sm transition shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingStatus ? <Loader2 size={16} className="animate-spin" /> : null}
                      End Class For All
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-yellow-400 font-semibold">
                  ⚠️ Meeting link is missing. Please contact your instructor.
                </div>
              )}

              <p className="text-[11px] text-white/40 mt-6 max-w-sm">
                💡 Google Meet and Zoom open in a dedicated browser tab for full native audio, camera, and screen sharing performance.
              </p>
            </div>
          ) : (
            <div className="w-full aspect-video min-h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-black border border-gray-800 relative">
              {platform === "youtube" ? (
                <iframe
                  src={getYouTubeEmbedUrl(currentLiveData?.youtubeUrl || item.fileUrl || "")}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <JitsiPlayer
                  roomName={(currentLiveData?.jitsiRoomId || `sajjad-husain-legal-academy-live-${item.id.slice(0, 8)}`)
                    .replace(/^legalacademy-live-/, "sajjad-husain-legal-academy-live-")}
                  subject={item.title ? `${courseTitle} - ${item.title}` : `Sajjad Husain Legal Academy: ${courseTitle}`}
                  displayName={isInstructor 
                    ? (user?.name ? `${user.name} (Host)` : ((user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ""} (Host)`.trim() : "Instructor (Host)"))
                    : (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user?.name || "Student"))}
                  email={user?.email}
                  isInstructor={isInstructor}
                  password={currentLiveData?.jitsiPassword}
                  onApiReady={(api) => {
                    jitsiApiRef.current = api;
                  }}
                  onMeetingEnd={isInstructor ? handleEndClass : handleStudentMeetingLeft}
                  className="w-full h-full"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          STATE 3: COMPLETED (Class Finished & Recording Replay)
      ───────────────────────────────────────────────────────────────────────────── */}
      {status === "completed" && (
        <div className="mt-4 sm:mt-6 mx-auto w-[95%] max-w-5xl flex flex-col gap-6">
          {/* Header Card */}
          <div className="bg-white border border-[#122340]/10 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-1.5">
                <CheckCircle2 size={13} /> Class Concluded
              </div>
              <h2 className="text-xl font-extrabold text-[#122340]">{item.title}</h2>
              <p className="text-xs text-[#122340]/60 mt-0.5">
                {replayVideoUrl ? "Watch the full session replay below." : "Awaiting official session recording upload from instructor."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isInstructor && replayVideoUrl && (
                <>
                  <button
                    onClick={() => setShowEditRecording(!showEditRecording)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Film size={14} /> {showEditRecording ? "Hide Edit" : "Change Replay"}
                  </button>
                  <button
                    onClick={handleClearRecording}
                    disabled={isSavingRecording}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Remove replay and reset to waiting state"
                  >
                    <Trash2 size={14} /> Remove Replay
                  </button>
                </>
              )}

              {item.completed ? (
                <div className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-default select-none shrink-0">
                  <CheckCircle2 size={16} /> Completed
                </div>
              ) : onMarkComplete ? (
                <button
                  onClick={() => onMarkComplete(item.id)}
                  className="bg-[#C9A227] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#b08d20] transition shadow flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <CheckCircle2 size={16} /> Mark Lesson as Complete
                </button>
              ) : null}
            </div>
          </div>

          {/* If Instructor wants to edit/change the existing replay video */}
          {isInstructor && replayVideoUrl && showEditRecording && (
            <div className="w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-left animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Update Class Replay URL (Instructor Only)
              </label>
              <p className="text-[11px] text-gray-500 mb-3">
                Paste a new YouTube recording URL or MP4/S3 video link:
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={recordingUrlInput}
                  onChange={(e) => setRecordingUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={async () => {
                    await handleSaveRecording();
                    setShowEditRecording(false);
                  }}
                  disabled={isSavingRecording}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSavingRecording ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Replay
                </button>
              </div>
            </div>
          )}

          {/* Player or Recording Waiting State */}
          {replayVideoUrl ? (
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-gray-900 relative">
              {replayVideoUrl.includes("youtube") || replayVideoUrl.includes("youtu.be") ? (
                <iframe
                  src={getYouTubeEmbedUrl(replayVideoUrl)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={replayVideoUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                  onTimeUpdate={(e) => {
                    const video = e.currentTarget;
                    if (!item.completed && onMarkComplete && video.duration > 0) {
                      if (video.currentTime / video.duration > 0.9) {
                        onMarkComplete(item.id);
                      }
                    }
                  }}
                  onEnded={() => {
                    if (!item.completed && onMarkComplete) {
                      onMarkComplete(item.id);
                    }
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ) : (
            <div className="bg-[#fcfcfa] border-2 border-dashed border-[#122340]/15 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
              <Film size={48} className="text-[#C9A227] mb-3 opacity-70" />
              <h3 className="text-lg font-bold text-[#122340]">Class Recording Processing</h3>
              <p className="text-xs text-[#122340]/60 max-w-md mt-1 mb-6">
                This live session has concluded. The instructor will upload the official recorded session shortly.
              </p>

              {/* Student On-Demand Replay Check Button */}
              {!isInstructor && (
                <button
                  onClick={handleCheckReplay}
                  disabled={isCheckingReplay}
                  className="px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#122340] rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isCheckingReplay ? <Loader2 size={14} className="animate-spin text-[#C9A227]" /> : <RotateCcw size={14} className="text-gray-500" />}
                  Check for Recording Replay
                </button>
              )}

              {/* If Instructor: Direct Recording Upload / Link Input */}
              {isInstructor && (
                <div className="w-full max-w-md bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-left">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Upload or Paste Class Replay URL (Instructor Only)
                  </label>
                  <p className="text-[11px] text-gray-500 mb-3">
                    Paste the YouTube replay URL or S3 video link so your students can view it:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={recordingUrlInput}
                      onChange={(e) => setRecordingUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSaveRecording}
                      disabled={isSavingRecording}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isSavingRecording ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Replay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          START CLASS LINK PROMPT MODAL (FOR YOUTUBE, GMEET, ZOOM)
      ───────────────────────────────────────────────────────────────────────────── */}
      {startLinkModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] text-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    startLinkModal.platform === "youtube"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : startLinkModal.platform === "gmeet"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  }`}
                >
                  {startLinkModal.platform === "youtube" ? (
                    <Tv size={24} />
                  ) : (
                    <Video size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {startLinkModal.platform === "youtube"
                      ? "Enter YouTube Live Link"
                      : startLinkModal.platform === "gmeet"
                      ? "Enter Google Meet Link"
                      : "Enter Zoom Meeting Link"}
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Start &quot;{item.title}&quot; &amp; connect your students
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStartLinkModal({ isOpen: false, platform: "", url: "", passcode: "" })}
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmStartWithLink} className="p-6 space-y-4">
              {/* Quick Helper Button */}
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                <div className="text-xs text-white/70 leading-relaxed">
                  {startLinkModal.platform === "youtube" && (
                    <span>Don&apos;t have a stream link yet? Open YouTube Studio to go live or copy the broadcast URL:</span>
                  )}
                  {startLinkModal.platform === "gmeet" && (
                    <span>Generate an instant meeting on Google Meet, then paste the URL below:</span>
                  )}
                  {startLinkModal.platform === "zoom" && (
                    <span>Start or schedule your meeting on Zoom, then paste the join link below:</span>
                  )}
                </div>
                <a
                  href={
                    startLinkModal.platform === "youtube"
                      ? "https://studio.youtube.com/channel/live/livestreaming"
                      : startLinkModal.platform === "gmeet"
                      ? "https://meet.google.com/new"
                      : "https://zoom.us/start/videomeeting"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer ${
                    startLinkModal.platform === "youtube"
                      ? "bg-red-600 hover:bg-red-700"
                      : startLinkModal.platform === "gmeet"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  <ExternalLink size={13} />
                  {startLinkModal.platform === "youtube"
                    ? "Open Studio"
                    : startLinkModal.platform === "gmeet"
                    ? "New Meet"
                    : "Open Zoom"}
                </a>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  {startLinkModal.platform === "youtube"
                    ? "YouTube Live Stream URL *"
                    : startLinkModal.platform === "gmeet"
                    ? "Google Meet URL *"
                    : "Zoom Meeting Invite URL *"}
                </label>
                <input
                  type="url"
                  autoFocus
                  required
                  placeholder={
                    startLinkModal.platform === "youtube"
                      ? "https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      : startLinkModal.platform === "gmeet"
                      ? "https://meet.google.com/xxx-yyyy-zzz"
                      : "https://us02web.zoom.us/j/1234567890?pwd=..."
                  }
                  value={startLinkModal.url}
                  onChange={(e) => setStartLinkModal((prev) => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                />
              </div>

              {(startLinkModal.platform === "zoom" || startLinkModal.platform === "gmeet") && (
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5 flex items-center gap-1.5">
                    Meeting Passcode / PIN <span className="text-white/40 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Passcode or PIN for attendees"
                    value={startLinkModal.passcode}
                    onChange={(e) => setStartLinkModal((prev) => ({ ...prev, passcode: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStartLinkModal({ isOpen: false, platform: "", url: "", passcode: "" })}
                  className="px-4 py-2.5 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer ${
                    startLinkModal.platform === "youtube"
                      ? "bg-red-600 hover:bg-red-700"
                      : startLinkModal.platform === "gmeet"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  <Play size={14} className="fill-current" />
                  Save &amp; Start Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
