"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Calendar,
  Video,
  Clock,
  Trash2,
  X,
  Play,
  CheckCircle2,
  Users,
  Tv,
  Film,
  Loader2,
  ExternalLink,
  Shield,
  Save,
  Radio,
  PhoneOff,
  UploadCloud,
  CheckCircle,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import Uppy from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import Dashboard from "@uppy/react/dashboard";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import apiClient from "@/data/services/apiConfig/apiClient";
import { courseApi } from "@/data/services/academy-service/course.service";
import toast from "react-hot-toast";
import Link from "next/link";
import { formatTime12HourIST } from "@/lib/utils";
import JitsiPlayer from "@/components/academy/live/JitsiPlayer";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Pagination from "@/components/Pagination";
import { useAppSelector } from "@/data/redux/hooks";

interface AcademyLiveSessionsPageProps {
  initialCourseId?: string;
  isCourseScoped?: boolean;
}

export default function AcademyLiveSessionsPage({
  initialCourseId,
  isCourseScoped = false,
}: AcademyLiveSessionsPageProps = {}) {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState(
    initialCourseId || "all"
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sessions, setSessions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [allLiveSessions, setAllLiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Host Studio & Teaching States
  const [activeTeachingSession, setActiveTeachingSession] = useState<any | null>(null);
  const [studioElapsedSeconds, setStudioElapsedSeconds] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [selectedSessionForRecording, setSelectedSessionForRecording] = useState<any>(null);
  const [recordingUrlInput, setRecordingUrlInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Confirmation Dialog State
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
    onConfirm: () => { },
  });

  // Form states for scheduling new session
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || "");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [platform, setPlatform] = useState<"jitsi" | "youtube" | "gmeet" | "zoom">("jitsi");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [passcode, setPasscode] = useState("");
  const [requirePassword, setRequirePassword] = useState(false);
  const [customPassword, setCustomPassword] = useState("");

  // Prompt Modal when starting a session without a URL (YouTube / GMeet / Zoom)
  const [startLinkModal, setStartLinkModal] = useState<{
    isOpen: boolean;
    session: any;
    platform: "youtube" | "gmeet" | "zoom" | "";
    url: string;
    passcode: string;
  }>({
    isOpen: false,
    session: null,
    platform: "",
    url: "",
    passcode: "",
  });

  // Uppy instance for S3 Resumable Chunking (Jitsi video recordings)
  const [recordingUppy, setRecordingUppy] = useState<Uppy | null>(null);

  // Initialize Uppy when recording modal opens for a Jitsi session
  useEffect(() => {
    if (!isRecordingModalOpen || !selectedSessionForRecording) {
      if (recordingUppy) {
        try {
          recordingUppy.destroy();
        } catch (e) { }
        setRecordingUppy(null);
      }
      return;
    }

    const isYT =
      selectedSessionForRecording.liveData?.platform === "youtube" ||
      selectedSessionForRecording.provider === "youtube";

    if (isYT) {
      setRecordingUppy(null);
      return;
    }

    const u = new Uppy({
      id: `uppy-recording-${selectedSessionForRecording.id}`,
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ["video/*"],
      },
    });

    u.use(AwsS3, {
      shouldUseMultipart: true,
      limit: 4,
      retryDelays: [0, 1000, 3000, 5000],
      createMultipartUpload: async (file: any) => {
        const res = await apiClient.post("/academy/s3/multipart", {
          filename: file.name,
          type: file.type,
        });
        return res.data;
      },
      signPart: async (file: any, partData: any) => {
        const { uploadId, key, partNumber } = partData;
        const res = await apiClient.get(
          `/academy/s3/multipart/${uploadId}/${partNumber}?key=${encodeURIComponent(key)}`
        );
        return res.data;
      },
      listParts: async (file: any, { uploadId, key }: any) => {
        const res = await apiClient.get(
          `/academy/s3/multipart/${uploadId}?key=${encodeURIComponent(key)}`
        );
        return res.data;
      },
      completeMultipartUpload: async (file: any, { uploadId, key, parts }: any) => {
        const res = await apiClient.post(
          `/academy/s3/multipart/${uploadId}/complete?key=${encodeURIComponent(key)}`,
          { parts }
        );
        return res.data;
      },
      abortMultipartUpload: async (file: any, { uploadId, key }: any) => {
        await apiClient.delete(
          `/academy/s3/multipart/${uploadId}?key=${encodeURIComponent(key)}`
        );
      },
    });

    u.on("upload-success", (file, response) => {
      const s3Url = response.uploadURL || response.body?.location;
      if (s3Url) {
        setRecordingUrlInput(s3Url);
        toast.success("Video uploaded to S3! Click 'Save & Publish Recording' below to confirm.");
      }
    });

    setRecordingUppy(u);

    return () => {
      try {
        u.destroy();
      } catch (e) { }
    };
  }, [isRecordingModalOpen, selectedSessionForRecording?.id]);

  // Elapsed timer for Host Studio session
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTeachingSession) {
      const calcElapsed = () => {
        if (activeTeachingSession.liveData?.startedAt) {
          const startMs = new Date(activeTeachingSession.liveData.startedAt).getTime();
          return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        }
        return 0;
      };
      setStudioElapsedSeconds(calcElapsed());
      timer = setInterval(() => {
        setStudioElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setStudioElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [activeTeachingSession]);

  const formatElapsedTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const extractYouTubeId = (url: string) => {
    if (!url) return "";
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : (url.trim().length === 11 && !url.includes("/") ? url.trim() : url);
  };

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, selectedCourseFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const effectiveCourseId = isCourseScoped && initialCourseId
        ? initialCourseId
        : (selectedCourseFilter !== "all" ? selectedCourseFilter : undefined);

      const [allLiveRes, sessionsRes, coursesRes] = await Promise.all([
        courseApi.fetchLiveSessions(isCourseScoped && initialCourseId ? { courseId: initialCourseId } : undefined),
        courseApi.fetchLiveSessions({
          status: statusFilter !== "all" ? statusFilter : undefined,
          courseId: effectiveCourseId,
          search: debouncedSearch.trim() || undefined,
          page,
          limit,
        }),
        courseApi.fetchCourses(),
      ]);

      const rawAllLive = allLiveRes.data?.data || allLiveRes.data || [];
      const sessionResult = sessionsRes.data;
      const rawSessions = sessionResult?.data || (Array.isArray(sessionResult) ? sessionResult : []);
      const totalCount = sessionResult?.total ?? rawSessions.length;
      const totalPagesCount = sessionResult?.totalPages ?? Math.max(1, Math.ceil(totalCount / limit));
      const rawCourses = coursesRes.data?.data || coursesRes.data || [];

      setAllLiveSessions(Array.isArray(rawAllLive) ? rawAllLive : []);
      setSessions(rawSessions);
      setTotal(totalCount);
      setTotalPages(totalPagesCount);
      setCourses(Array.isArray(rawCourses) ? rawCourses : []);
      if (rawCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(initialCourseId || rawCourses[0].id);
      }
    } catch (e) {
      console.error("Failed to load live sessions:", e);
      toast.error("Failed to fetch live sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, selectedCourseFilter, debouncedSearch, page, limit]);

  const handleStartSession = async (session: any) => {
    const sPlatform = session.liveData?.platform || session.provider || "jitsi";
    const sYoutubeUrl = session.liveData?.youtubeUrl || (sPlatform === "youtube" ? session.fileUrl : "") || "";
    const sMeetingUrl = session.liveData?.meetingUrl || (sPlatform === "gmeet" || sPlatform === "zoom" ? session.fileUrl : "") || "";

    if (sPlatform === "youtube" && !sYoutubeUrl.trim()) {
      setStartLinkModal({
        isOpen: true,
        session,
        platform: "youtube",
        url: "",
        passcode: "",
      });
      return;
    }

    if (sPlatform === "gmeet" && !sMeetingUrl.trim()) {
      setStartLinkModal({
        isOpen: true,
        session,
        platform: "gmeet",
        url: "",
        passcode: session.liveData?.passcode || "",
      });
      return;
    }

    if (sPlatform === "zoom" && !sMeetingUrl.trim()) {
      setStartLinkModal({
        isOpen: true,
        session,
        platform: "zoom",
        url: "",
        passcode: session.liveData?.passcode || "",
      });
      return;
    }

    await executeStartSession(session);
  };

  const executeStartSession = async (session: any, providedUrl?: string, providedPasscode?: string) => {
    try {
      const sPlatform = session.liveData?.platform || session.provider || "jitsi";
      const activeUrl = providedUrl?.trim() || session.liveData?.meetingUrl || session.liveData?.youtubeUrl || session.fileUrl || "";

      // If a URL was provided now at start time, persist it into the curriculum item first
      if (providedUrl?.trim()) {
        const updatedLiveData = {
          ...(session.liveData || {}),
          platform: sPlatform,
          youtubeUrl: sPlatform === "youtube" ? providedUrl.trim() : (session.liveData?.youtubeUrl || ""),
          meetingUrl: (sPlatform === "gmeet" || sPlatform === "zoom") ? providedUrl.trim() : (session.liveData?.meetingUrl || ""),
          passcode: providedPasscode !== undefined ? providedPasscode.trim() : (session.liveData?.passcode || ""),
        };
        await courseApi.updateCurriculumItem(session.id, {
          provider: sPlatform,
          fileUrl: providedUrl.trim(),
          liveData: updatedLiveData,
        });
        session = {
          ...session,
          fileUrl: providedUrl.trim(),
          provider: sPlatform,
          liveData: updatedLiveData,
        };
      }

      const res = await courseApi.updateLiveStatus(session.id, "live");
      const updated = res.data?.data || res.data;
      toast.success("Live class started! Launching session...");
      loadData();
      const updatedSession = updated || {
        ...session,
        liveData: {
          ...session.liveData,
          status: "live",
          startedAt: new Date().toISOString(),
        },
      };
      setActiveTeachingSession(updatedSession);

      if (sPlatform === "gmeet" || sPlatform === "zoom") {
        const link = activeUrl || session.liveData?.meetingUrl || session.fileUrl;
        if (link) {
          window.open(link, "_blank");
        }
      }
    } catch (e) {
      toast.error("Failed to start live session");
    }
  };

  const handleConfirmStartWithLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLinkModal.url.trim()) {
      return toast.error("Please enter a valid link to start the class");
    }
    const session = startLinkModal.session;
    const url = startLinkModal.url.trim();
    const passcode = startLinkModal.passcode.trim();

    if (startLinkModal.platform === "youtube") {
      if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        return toast.error("Please enter a valid YouTube stream URL");
      }
    } else if (startLinkModal.platform === "gmeet") {
      if (!url.includes("meet.google.com")) {
        return toast.error("Please enter a valid Google Meet URL (e.g., https://meet.google.com/xxx-yyyy-zzz)");
      }
    } else if (startLinkModal.platform === "zoom") {
      if (!url.includes("zoom.us")) {
        return toast.error("Please enter a valid Zoom meeting URL (e.g., https://us02web.zoom.us/j/...)");
      }
    }

    setStartLinkModal({ isOpen: false, session: null, platform: "", url: "", passcode: "" });
    await executeStartSession(session, url, passcode);
  };

  const handleEndSession = (session: any) => {
    setConfirmModal({
      isOpen: true,
      title: "End Live Session?",
      message: `Are you sure you want to end "${session.title}" for all students? This will conclude the conference and close the live room.`,
      confirmText: "End Class For All",
      variant: "warning",
      onConfirm: async () => {
        try {
          await courseApi.updateLiveStatus(session.id, "completed");
          toast.success("Live class ended for all students.");
          if (activeTeachingSession?.id === session.id) {
            setActiveTeachingSession(null);
          }
          loadData();
          setSelectedSessionForRecording(session);
          setRecordingUrlInput(session.liveData?.recordingUrl || "");
          setIsRecordingModalOpen(true);
        } catch (e) {
          toast.error("Failed to end live session");
        }
      },
    });
  };

  const handleDeleteSession = (session: any) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Live Class?",
      message: `Delete "${session.title}" permanently? This cannot be undone and will remove it from the course curriculum.`,
      confirmText: "Yes, Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          await courseApi.deleteCurriculumItem(session.id);
          toast.success("Live session deleted");
          setSessions((prev) => prev.filter((s) => s.id !== session.id));
        } catch (e) {
          toast.error("Failed to delete session");
        }
      },
    });
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return toast.error("Please select a course");
    if (!title.trim()) return toast.error("Please enter a session title");

    setIsSubmitting(true);
    try {
      const liveData = {
        platform,
        status: "scheduled",
        scheduledDate: date,
        scheduledTime: time,
        durationMinutes: durationMinutes || 60,
        jitsiRoomId: `sajjad-husain-legal-academy-live-${Math.random().toString(36).substring(2, 10)}`,
        jitsiPassword: requirePassword && customPassword.trim() ? customPassword.trim() : "",
        youtubeUrl: platform === "youtube" ? youtubeUrl.trim() : "",
        meetingUrl: (platform === "gmeet" || platform === "zoom") ? meetingUrl.trim() : "",
        passcode: passcode.trim(),
        recordingUrl: "",
      };

      await courseApi.createCurriculumItem(selectedCourseId, {
        type: "live",
        title: title.trim(),
        duration: (durationMinutes || 60) * 60,
        provider: platform,
        fileUrl: platform === "youtube" ? (youtubeUrl.trim() || "") : ((platform === "gmeet" || platform === "zoom") ? (meetingUrl.trim() || "") : ""),
        liveData,
      });

      toast.success("Live session scheduled successfully!");
      setIsModalOpen(false);
      setTitle("");
      setYoutubeUrl("");
      setMeetingUrl("");
      setPasscode("");
      setRequirePassword(false);
      setCustomPassword("");
      loadData();
    } catch (e) {
      toast.error("Failed to schedule live session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRecording = async () => {
    if (!recordingUrlInput.trim()) return toast.error("Please enter or upload a valid recording URL");
    if (!selectedSessionForRecording) return;
    setIsSubmitting(true);
    try {
      const isYT =
        selectedSessionForRecording.liveData?.platform === "youtube" ||
        selectedSessionForRecording.provider === "youtube";

      await courseApi.updateCurriculumItem(selectedSessionForRecording.id, {
        provider: isYT ? "youtube" : (recordingUrlInput.includes("s3") || recordingUrlInput.includes("amazonaws") ? "s3" : "external"),
        fileUrl: recordingUrlInput.trim(),
        liveData: {
          ...(selectedSessionForRecording.liveData || {}),
          recordingUrl: recordingUrlInput.trim(),
          status: "completed",
        },
      });

      toast.success("Class recording saved & published for students successfully!");
      setIsRecordingModalOpen(false);
      setSelectedSessionForRecording(null);
      setRecordingUrlInput("");
      loadData();
    } catch (e) {
      toast.error("Failed to save recording");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate exact timestamp for chronological sorting (earliest scheduled first)
  const getScheduledTimestamp = (session: any): number => {
    const liveData = session.liveData || {};
    const dateStr = (liveData.scheduledDate || "").trim(); // YYYY-MM-DD
    const timeStr = (liveData.scheduledTime || "").trim(); // HH:mm or "01:00 PM"

    if (!dateStr) {
      return Infinity;
    }

    let hours = 0;
    let minutes = 0;

    if (timeStr) {
      if (timeStr.toUpperCase().includes("AM") || timeStr.toUpperCase().includes("PM")) {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          const isPM = match[3].toUpperCase() === "PM";
          if (isPM && hours < 12) hours += 12;
          if (!isPM && hours === 12) hours = 0;
        }
      } else if (timeStr.includes(":")) {
        const parts = timeStr.split(":");
        hours = parseInt(parts[0], 10) || 0;
        minutes = parseInt(parts[1], 10) || 0;
      }
    }

    const parts = dateStr.split("-").map((n: string) => parseInt(n, 10));
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2], hours, minutes, 0, 0);
      return dateObj.getTime();
    }

    const fallback = new Date(dateStr).getTime();
    return isNaN(fallback) ? Infinity : fallback;
  };

  // Only courses that actually have live sessions
  const liveCourses = useMemo(() => {
    const courseMap = new Map<string, { id: string; title: string }>();
    const sessionList = allLiveSessions.length > 0 ? allLiveSessions : sessions;

    sessionList.forEach((s: any) => {
      if (s.course?.id && s.course?.title) {
        courseMap.set(s.course.id, { id: s.course.id, title: s.course.title });
      } else if (s.courseId) {
        const found = courses.find((c: any) => c.id === s.courseId);
        if (found) {
          courseMap.set(found.id, { id: found.id, title: found.title });
        }
      }
    });

    return Array.from(courseMap.values()).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [allLiveSessions, sessions, courses]);

  // Reset filter to 'all' if selected course is no longer in live courses
  useEffect(() => {
    if (
      !isCourseScoped &&
      selectedCourseFilter !== "all" &&
      liveCourses.length > 0 &&
      !liveCourses.some((c) => c.id === selectedCourseFilter)
    ) {
      setSelectedCourseFilter("all");
    }
  }, [liveCourses, selectedCourseFilter, isCourseScoped]);

  // Filter & Sort Sessions (Server-side paginated & filtered)
  const filteredSessions = [...sessions].sort((a, b) => {
    const statusA = a.liveData?.status || "scheduled";
    const statusB = b.liveData?.status || "scheduled";

    // 1. Actively live sessions always at the top
    if (statusA === "live" && statusB !== "live") return -1;
    if (statusB === "live" && statusA !== "live") return 1;

    // 2. Scheduled sessions before Completed sessions
    if (statusA === "scheduled" && statusB === "completed") return -1;
    if (statusB === "scheduled" && statusA === "completed") return 1;

    const timeA = getScheduledTimestamp(a);
    const timeB = getScheduledTimestamp(b);

    // 3. For scheduled sessions: earliest scheduled first (e.g. today 10 AM before today 2 PM, and today before tomorrow)
    if (statusA === "scheduled" && statusB === "scheduled") {
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createdB - createdA;
    }

    // 4. For completed sessions: most recent first
    if (statusA === "completed" && statusB === "completed") {
      return timeB - timeA;
    }

    return timeA - timeB;
  });

  const ongoingLiveSession = (allLiveSessions.length > 0 ? allLiveSessions : sessions).find((s) => (s.liveData?.status || "scheduled") === "live");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      {!isCourseScoped ? (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Sessions & Virtual Classrooms</h1>
            <p className="text-gray-500 text-sm mt-1">
              Schedule, start, and manage interactive Jitsi classes and YouTube Live broadcasts.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Course Live Sessions</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live sessions and virtual classrooms scheduled specifically for this course.
            </p>
          </div>
          <button
            onClick={() => {
              if (initialCourseId) setSelectedCourseId(initialCourseId);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={16} /> Schedule Live Session
          </button>
        </div>
      )}

      {/* Active Live Session Alert Banner */}
      {ongoingLiveSession && !activeTeachingSession && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-red-400/30 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Radio size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white text-red-700 font-extrabold text-[10px] uppercase tracking-wider">
                  Live Class in Progress
                </span>
                <span className="text-xs text-white/80 font-semibold">{ongoingLiveSession.course?.title}</span>
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">{ongoingLiveSession.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTeachingSession(ongoingLiveSession)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-gray-900 rounded-xl text-xs font-extrabold hover:bg-gray-100 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video size={15} className="text-red-600" /> Enter Host Studio
            </button>
            <button
              onClick={() => handleEndSession(ongoingLiveSession)}
              className="px-4 py-2.5 bg-red-950/40 hover:bg-red-950/60 text-white rounded-xl text-xs font-bold transition border border-white/20 cursor-pointer"
            >
              End Class
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search sessions or courses..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white shadow-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Course Filter Dropdown - Only Courses with Live Sessions (hide when course-scoped) */}
            {!isCourseScoped && (
              <div className="relative sm:w-64">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={15} />
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none cursor-pointer truncate shadow-xs"
                >
                  <option value="all">
                    {liveCourses.length > 0 ? `All Live Courses (${liveCourses.length})` : "All Courses"}
                  </option>
                  {liveCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0 self-start lg:self-auto shadow-xs">
            {["all", "live", "scheduled", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${statusFilter === tab
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                {tab === "live" ? "🔴 Live Now" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium">Loading live sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Video size={48} className="mx-auto mb-3 opacity-40 text-gray-400" />
            <p className="text-base font-bold text-gray-700">No live sessions found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Schedule your first interactive Jitsi classroom or YouTube Live broadcast using the button above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSessions.map((session) => {
              const liveData = session.liveData || {};
              const sessionStatus = liveData.status || "scheduled";
              const sessionPlatform = liveData.platform || session.provider || "";

              return (
                <div
                  key={session.id}
                  className="p-6 hover:bg-gray-50/50 transition flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${sessionStatus === "live"
                        ? "bg-red-50 text-red-600 animate-pulse border border-red-200"
                        : sessionPlatform === "youtube"
                          ? "bg-red-50 text-red-600"
                          : sessionPlatform === "gmeet"
                            ? "bg-emerald-50 text-emerald-600"
                            : sessionPlatform === "zoom"
                              ? "bg-sky-50 text-sky-600"
                              : sessionPlatform === "jitsi"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}
                    >
                      {sessionPlatform === "youtube" ? (
                        <Tv size={22} />
                      ) : sessionPlatform === "gmeet" || sessionPlatform === "zoom" ? (
                        <Video size={22} />
                      ) : sessionPlatform === "jitsi" ? (
                        <Users size={22} />
                      ) : (
                        <Video size={22} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-base">{session.title}</h3>
                        {sessionStatus === "live" ? (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" /> LIVE NOW
                          </span>
                        ) : sessionStatus === "completed" ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={11} /> Concluded
                          </span>
                        ) : (!liveData.scheduledDate || !liveData.scheduledTime || sessionStatus === "not_scheduled") ? (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                            Not Scheduled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                            Scheduled
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-blue-600 mb-2">
                        {session.course?.title || "Legal Academy Course"}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {liveData.scheduledDate || "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> {liveData.scheduledTime ? `${formatTime12HourIST(liveData.scheduledTime)} (${liveData.durationMinutes || 60}m)` : "TBD"}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          {sessionPlatform === "youtube"
                            ? "📺 YouTube Live"
                            : sessionPlatform === "gmeet"
                              ? "🟢 Google Meet"
                              : sessionPlatform === "zoom"
                                ? "🔵 Zoom Meeting"
                                : sessionPlatform === "jitsi"
                                  ? "📹 Jitsi Virtual Classroom"
                                  : "⚪ Platform Not Configured"}
                        </span>
                        {(sessionPlatform === "gmeet" || sessionPlatform === "zoom") && (liveData.meetingUrl || session.fileUrl) && (
                          <a
                            href={liveData.meetingUrl || session.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={12} /> Open Link
                          </a>
                        )}
                        {liveData.recordingUrl && (
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            <Film size={12} /> Recording Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                    {/* Launch / Rejoin Live */}
                    {/* {session.course?.slug && (
                      <Link
                        href={`/academy/dashboard/learn/${session.course.slug}`}
                        target="_blank"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <ExternalLink size={14} /> Open Course
                      </Link>
                    )} */}

                    {sessionStatus === "scheduled" && Boolean(liveData.scheduledDate && liveData.scheduledTime) && (
                      <button
                        onClick={() => handleStartSession(session)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Play size={14} className="fill-current" /> Start Class & Join
                      </button>
                    )}

                    {(!liveData.scheduledDate || !liveData.scheduledTime || sessionStatus === "not_scheduled") && sessionStatus !== "live" && sessionStatus !== "completed" && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-medium border border-gray-200">
                        Not Scheduled
                      </span>
                    )}

                    {sessionStatus === "live" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveTeachingSession(session)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer animate-pulse"
                        >
                          <Video size={14} /> Join Room (Host)
                        </button>
                        <button
                          onClick={() => handleEndSession(session)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          End Class
                        </button>
                      </div>
                    )}

                    {sessionStatus === "completed" && (
                      <button
                        onClick={() => {
                          const isYT = sessionPlatform === "youtube";
                          const ytUrl = liveData.youtubeUrl || session.fileUrl || "";
                          setSelectedSessionForRecording(session);
                          setRecordingUrlInput(liveData.recordingUrl || "");
                          setIsRecordingModalOpen(true);
                        }}
                        className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Film size={14} /> {sessionPlatform === "youtube" ? (liveData.recordingUrl ? "YouTube Replay" : "Link Replay") : (liveData.recordingUrl ? "Edit Replay" : "Upload Replay")}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteSession(session)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Delete Session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/40">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{Math.min(total, (page - 1) * limit + 1)}</span> to{" "}
              <span className="font-bold text-gray-800">{Math.min(total, page * limit)}</span> of{" "}
              <span className="font-bold text-gray-800">{total}</span> live sessions
            </div>
            <div className="-mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SCHEDULE MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Schedule Live Class</h2>
                <p className="text-xs text-gray-500 mt-0.5">Select platform, course, and date.</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setRequirePassword(false);
                  setCustomPassword("");
                }}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSession} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  required
                  disabled={isCourseScoped}
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Session Topic / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Constitutional Law Landmark Judgments Q&A"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Platform Choice */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Select Live Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div
                    onClick={() => setPlatform("jitsi")}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1 ${platform === "jitsi" ? "border-blue-600 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-blue-600" />
                      <span className="font-bold text-xs text-gray-900">Jitsi</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Interactive Classroom
                    </p>
                  </div>

                  <div
                    onClick={() => setPlatform("gmeet")}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1 ${platform === "gmeet" ? "border-emerald-600 bg-emerald-50/50" : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Video size={16} className="text-emerald-600" />
                      <span className="font-bold text-xs text-gray-900">Google Meet</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      External Meet Link
                    </p>
                  </div>

                  <div
                    onClick={() => setPlatform("zoom")}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1 ${platform === "zoom" ? "border-sky-600 bg-sky-50/50" : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Video size={16} className="text-sky-600" />
                      <span className="font-bold text-xs text-gray-900">Zoom</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      External Zoom Meeting
                    </p>
                  </div>

                  <div
                    onClick={() => setPlatform("youtube")}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1 ${platform === "youtube" ? "border-red-600 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Tv size={16} className="text-red-600" />
                      <span className="font-bold text-xs text-gray-900">YouTube</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      1-Way Live Stream
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Specific Inputs */}
              {platform === "jitsi" && (
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-800">In-App Virtual Classroom</span>
                      <p className="text-[11px] text-gray-500">
                        Zero external software. Enrolled students join directly without password.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full">
                      Open to Enrolled
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={requirePassword}
                        onChange={(e) => setRequirePassword(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-gray-700">Require Room Password (Optional)</span>
                    </label>

                    {requirePassword && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Enter room password"
                          value={customPassword}
                          onChange={(e) => setCustomPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                          Only attendees with this password can enter. Leave unchecked for instant password-free access.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {platform === "youtube" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">YouTube Live Stream Link</label>
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Optional during scheduling</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... (Optional)"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    You can leave this blank now and provide it when clicking &quot;Start Class&quot;.
                  </p>
                </div>
              )}

              {platform === "gmeet" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Google Meet Link</label>
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Optional during scheduling</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/abc-defg-hij (Optional)"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Leave blank if not yet created. You can paste it when clicking &quot;Start Class&quot;.
                  </p>
                </div>
              )}

              {platform === "zoom" && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">Zoom Meeting Link</label>
                      <span className="text-[10px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded">Optional during scheduling</span>
                    </div>
                    <input
                      type="url"
                      placeholder="https://zoom.us/j/123456789 (Optional)"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sky-500"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Leave blank if not yet scheduled. You can paste it when clicking &quot;Start Class&quot;.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Passcode (Optional)</label>
                    <input
                      type="text"
                      placeholder="Meeting Passcode (if any)"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Schedule Timing */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Start Time (IST)</label>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {formatTime12HourIST(time)}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setRequirePassword(false);
                    setCustomPassword("");
                  }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          UPLOAD RECORDING MODAL (WITH RESUMABLE CHUNKING & YOUTUBE AUTO-LINK)
      ───────────────────────────────────────────────────────────────────────────── */}
      {isRecordingModalOpen && selectedSessionForRecording && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-in fade-in zoom-in-95 border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Film size={18} />
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-lg">Class Replay & Recording</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Session: <span className="font-semibold text-gray-700">{selectedSessionForRecording.title}</span> •{" "}
                  {selectedSessionForRecording.course?.title || "Course Lesson"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsRecordingModalOpen(false);
                  setSelectedSessionForRecording(null);
                }}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-5">
              {/* CURRENTLY LINKED REPLAY (IF EXISTS) */}
              {(selectedSessionForRecording.liveData?.recordingUrl || selectedSessionForRecording.fileUrl) && (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle className="text-green-600 shrink-0" size={18} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-green-900">Replay Currently Active for Students</p>
                      <p className="text-[11px] text-green-700 font-mono truncate">
                        {selectedSessionForRecording.liveData?.recordingUrl || selectedSessionForRecording.fileUrl}
                      </p>
                    </div>
                  </div>
                  <a
                    href={selectedSessionForRecording.liveData?.recordingUrl || selectedSessionForRecording.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> Test Link
                  </a>
                </div>
              )}

              {/* BRANCH 1: YOUTUBE LIVE SESSIONS */}
              {(selectedSessionForRecording.liveData?.platform === "youtube" || selectedSessionForRecording.provider === "youtube") ? (
                <div className="space-y-4">
                  <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Tv size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-red-900 uppercase tracking-wider">
                        YouTube Live Stream Automatically Archived
                      </h4>
                      <p className="text-xs text-red-800/90 mt-1 leading-relaxed">
                        YouTube automatically processes and saves your live broadcast at the exact same stream link. Students can watch the replay immediately without needing any file upload!
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      YouTube Broadcast Replay Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={recordingUrlInput}
                      onChange={(e) => setRecordingUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 font-mono"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Pre-filled with your broadcast URL. You can also paste an edited version if re-uploaded.
                    </p>
                  </div>

                  {recordingUrlInput && extractYouTubeId(recordingUrlInput) && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-gray-100">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeId(recordingUrlInput)}?rel=0`}
                        className="w-full h-full border-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSaveRecording}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Confirm YouTube Replay for Students
                  </button>
                </div>
              ) : (
                /* BRANCH 2: JITSI SESSIONS - RESUMABLE S3 CHUNKING */
                <div className="space-y-4">
                  <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <UploadCloud size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                          Resumable Chunked S3 Video Upload
                        </h4>
                        <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-md">
                          Auto-Retry & Resume Active
                        </span>
                      </div>
                      <p className="text-xs text-blue-800/90 mt-1 leading-relaxed">
                        Jitsi doesn&apos;t store videos in the cloud automatically. Upload your recorded MP4/WebM file here. If your connection drops at 10%, resuming will continue from 10% without restarting!
                      </p>
                    </div>
                  </div>

                  {/* Uppy Resumable Multipart Dashboard */}
                  {recordingUppy && (
                    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
                      <Dashboard
                        uppy={recordingUppy}
                        width="100%"
                        height={260}
                        proudlyDisplayPoweredByUppy={false}
                        note="MP4, WebM, MKV up to 5GB • Resumable Multipart Upload"
                      />
                    </div>
                  )}

                  {/* Ready to Publish Card with Explicit Save Button */}
                  {recordingUrlInput && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-emerald-900">Recording Ready to Publish</p>
                          <p className="text-[11px] text-emerald-700 font-mono truncate">
                            {recordingUrlInput}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleSaveRecording}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save & Publish Class Recording
                      </button>
                    </div>
                  )}

                  {/* Alternative External Link Option */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-3 text-gray-400 text-[11px] uppercase font-bold">
                      Or Paste External Video Link
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://... (Vimeo, Google Drive, S3, Loom, etc.)"
                      value={recordingUrlInput}
                      onChange={(e) => setRecordingUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />
                    {!recordingUrlInput && (
                      <p className="text-[11px] text-gray-400">
                        Paste a direct URL above or use the S3 uploader above.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setIsRecordingModalOpen(false);
                  setSelectedSessionForRecording(null);
                }}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          INSTRUCTOR LIVE STUDIO (FULL-SCREEN VIRTUAL CLASSROOM)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTeachingSession && (
        <div className="fixed inset-0 z-[99999] bg-[#0a1628] flex flex-col animate-in fade-in duration-200">
          {/* Studio Top Control Bar */}
          <div className="bg-[#122340] border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between text-white shadow-xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider animate-pulse shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                LIVE HOST STUDIO
              </div>
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-lg text-white/80 hidden sm:inline-block">
                ⏱️ {formatElapsedTime(studioElapsedSeconds)}
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 truncate max-w-xs sm:max-w-md">
                  {activeTeachingSession.title}
                </h2>
                <p className="text-[11px] text-blue-300 font-medium truncate max-w-xs sm:max-w-md">
                  {activeTeachingSession.course?.title || "Legal Academy Course"} •{" "}
                  {activeTeachingSession.liveData?.platform === "youtube"
                    ? "YouTube Live Broadcast"
                    : "Jitsi Virtual Classroom (Host Privileges Active)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {activeTeachingSession.liveData?.platform === "youtube" && activeTeachingSession.liveData?.youtubeUrl && (
                <a
                  href={activeTeachingSession.liveData.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ExternalLink size={13} /> Studio Link
                </a>
              )}

              <button
                onClick={() => handleEndSession(activeTeachingSession)}
                className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
              >
                <PhoneOff size={14} /> End Class For All
              </button>

              <button
                onClick={() => setActiveTeachingSession(null)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Minimize Studio (Class remains live for students)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Video Viewport */}
          <div className="flex-1 w-full bg-black relative flex flex-col items-center justify-center overflow-hidden">
            {activeTeachingSession.liveData?.platform === "youtube" ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(activeTeachingSession.liveData?.youtubeUrl || activeTeachingSession.fileUrl)}?autoplay=1&modestbranding=1&rel=0`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <p className="text-white/60 text-xs mt-3 text-center max-w-lg">
                  📺 Streaming via YouTube Live. Students are watching your broadcast. Use your{" "}
                  <a
                    href="https://studio.youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C9A227] underline font-semibold"
                  >
                    YouTube Studio Dashboard
                  </a>{" "}
                  to stream via OBS/RTMP and manage live chat.
                </p>
              </div>
            ) : (activeTeachingSession.liveData?.platform === "gmeet" || activeTeachingSession.liveData?.platform === "zoom") ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 text-center text-white max-w-xl mx-auto">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl ${activeTeachingSession.liveData?.platform === "gmeet"
                  ? "bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400"
                  : "bg-sky-500/20 border-2 border-sky-500/40 text-sky-400"
                  }`}>
                  <Video size={40} />
                </div>
                <h3 className="text-2xl font-extrabold mb-2">
                  {activeTeachingSession.liveData?.platform === "gmeet" ? "Google Meet Classroom Active" : "Zoom Meeting Classroom Active"}
                </h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                  Your live class is in progress. Launch your {activeTeachingSession.liveData?.platform === "gmeet" ? "Google Meet" : "Zoom"} meeting in a new tab to host. When finished, return here to end the session and upload your lecture recording replay for students.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={activeTeachingSession.liveData?.meetingUrl || activeTeachingSession.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`px-6 py-3.5 rounded-xl font-bold text-sm text-white shadow-xl transition flex items-center gap-2 ${activeTeachingSession.liveData?.platform === "gmeet"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-sky-600 hover:bg-sky-700"
                      }`}
                  >
                    <ExternalLink size={16} /> Open {activeTeachingSession.liveData?.platform === "gmeet" ? "Google Meet" : "Zoom"} (New Tab)
                  </a>
                  <button
                    onClick={() => handleEndSession(activeTeachingSession)}
                    className="px-6 py-3.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <PhoneOff size={16} /> End Class & Upload Recording
                  </button>
                </div>
              </div>
            ) : (
              <JitsiPlayer
                roomName={(activeTeachingSession.liveData?.jitsiRoomId || `sajjad-husain-legal-academy-live-${activeTeachingSession.id.slice(0, 8)}`)
                  .replace(/^legalacademy-live-/, "sajjad-husain-legal-academy-live-")}
                subject={activeTeachingSession.course?.title
                  ? `${activeTeachingSession.course.title} - ${activeTeachingSession.title}`
                  : `Sajjad Husain Legal Academy: ${activeTeachingSession.title}`}
                displayName={user?.name ? `${user.name} (Host)` : ((user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ""} (Host)`.trim() : "Instructor (Host)")}
                email={user?.email}
                isInstructor={true}
                password={activeTeachingSession.liveData?.jitsiPassword}
                onMeetingEnd={() => {
                  handleEndSession(activeTeachingSession);
                }}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          START CLASS LINK PROMPT MODAL (FOR YOUTUBE, GMEET, ZOOM)
      ───────────────────────────────────────────────────────────────────────────── */}
      {startLinkModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${startLinkModal.platform === "youtube"
                      ? "bg-red-50 text-red-600"
                      : startLinkModal.platform === "gmeet"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-sky-50 text-sky-600"
                    }`}
                >
                  {startLinkModal.platform === "youtube" ? (
                    <Tv size={24} />
                  ) : (
                    <Video size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {startLinkModal.platform === "youtube"
                      ? "Enter YouTube Live Link"
                      : startLinkModal.platform === "gmeet"
                        ? "Enter Google Meet Link"
                        : "Enter Zoom Meeting Link"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Start &quot;{startLinkModal.session?.title}&quot; &amp; connect your students
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStartLinkModal({ isOpen: false, session: null, platform: "", url: "", passcode: "" })}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmStartWithLink} className="p-6 space-y-4">
              {/* Quick Helper Button */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 flex items-center justify-between gap-3">
                <div className="text-xs text-gray-600 leading-relaxed">
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
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer ${startLinkModal.platform === "youtube"
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
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
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {(startLinkModal.platform === "zoom" || startLinkModal.platform === "gmeet") && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    Meeting Passcode / PIN <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Passcode or PIN for attendees"
                    value={startLinkModal.passcode}
                    onChange={(e) => setStartLinkModal((prev) => ({ ...prev, passcode: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStartLinkModal({ isOpen: false, session: null, platform: "", url: "", passcode: "" })}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer ${startLinkModal.platform === "youtube"
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

      {/* ─────────────────────────────────────────────────────────────────────────────
          CUSTOM CONFIRMATION MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
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
