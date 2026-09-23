"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, PlayCircle, CheckCircle2, FileText, MessageSquare, Download,
  Play, Pause, Maximize, Volume2, SkipForward, Video, ClipboardList, Award,
  CheckSquare, UploadCloud, Clock, ExternalLink, XCircle, Circle, FileQuestion, GraduationCap,
  Lock, ArrowRight, Star, AlertCircle, ChevronDown, BookOpen
} from 'lucide-react';
import AssessmentPlayer from './AssessmentPlayer';
import LiveClassViewer from '@/components/academy/live/LiveClassViewer';
import { certificateApi, Certificate } from '@/data/services/academy-service/certificate.service';

// COURSE_DATA dynamic mapping happens below

const getItemIcon = (type: string, active: boolean, completed: boolean) => {
  const color = active ? 'text-[#C9A227]' : completed ? 'text-green-500' : 'text-[#122340]/50';
  if (type === 'video') return <PlayCircle size={16} className={color} />;
  if (type === 'live') return <Video size={16} className={color} />;
  if (type === 'assignment') return <ClipboardList size={16} className={color} />;
  if (type === 'test' || type === 'assessment') return <FileQuestion size={16} className={color} />;
  if (type === 'final_assessment') return <GraduationCap size={16} className={color} />;
  if (type === 'certificate') return <Award size={16} className={color} />;
  return <PlayCircle size={16} className={color} />;
};

const formatItemType = (type: string) => {
  if (!type) return '';
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchCourseById } from '@/data/features/academy/course/courseThunks';
import { clearCurrentCourse, updateCourseItemData } from '@/data/features/academy/course/courseSlice';
import { updateCourseProgress, fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';
import { Loader2 } from 'lucide-react';
import { uploadToS3 } from '@/lib/uploadToS3';
import apiClient from '@/data/services/apiConfig/apiClient';
import toast from 'react-hot-toast';
import ReviewModal from '@/components/academy/reviews/ReviewModal';
import CourseReviewMilestonePrompt from '@/components/academy/reviews/CourseReviewMilestonePrompt';
import CourseReviewsSection from '@/components/academy/reviews/CourseReviewsSection';
import { reviewApi } from '@/data/services/academy-service/review.service';
import { CourseReview } from '@/data/features/academy/course/course.types';
import CourseQATab from '@/components/academy/qa/CourseQATab';

export default function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug?.toLowerCase() || '';

  const dispatch = useAppDispatch();
  const { currentCourse, isLoading, error } = useAppSelector((state) => state.course);

  // We can fetch enrollments to get progress, but for now we'll just use a default or calculate from completed items if backend supports it.
  const { myEnrollments, isLoading: isEnrollmentsLoading } = useAppSelector((state) => state.enrollments);
  const { user } = useAppSelector((state) => state.auth);
  const currentEnrollment = React.useMemo(() => {
    return myEnrollments.find(
      e => (e.course?.slug && e.course.slug.toLowerCase() === slug.toLowerCase()) ||
        (currentCourse?.id && (e.courseId === currentCourse.id || e.course?.id === currentCourse.id))
    ) || null;
  }, [myEnrollments, slug, currentCourse?.id]);

  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);

  // Review states inside learn page
  const [activeTab, setActiveTab] = useState<'qa' | 'reviews'>('qa');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [myReview, setMyReview] = useState<CourseReview | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const handleOpenReviewWithRating = (initialRating?: number) => {
    setSelectedRating(initialRating);
    setIsReviewModalOpen(true);
  };

  // Fetch student review status
  useEffect(() => {
    if (!currentCourse?.id || !user) return;
    reviewApi.getMyReviewEligibility(currentCourse.id)
      .then((res) => {
        setCanReview(Boolean(res?.canReview));
        if (res?.hasReviewed && res?.review) {
          setMyReview(res.review);
        } else {
          setMyReview(null);
        }
      })
      .catch(() => { });
  }, [currentCourse?.id, user, reviewRefreshKey]);

  const handleReviewSuccess = (savedReview: CourseReview) => {
    setMyReview(savedReview);
    setIsReviewModalOpen(false);
    setReviewRefreshKey((k) => k + 1);
  };

  const fetchMySubmissions = async () => {
    if (!currentCourse?.id) return;
    const studentId = (user as any)?._id || (user as any)?.id;
    if (!studentId) {
      setStudentSubmissions([]);
      return;
    }
    try {
      const res = await apiClient.get('/academy/assignments/me', {
        params: { studentId: studentId, courseId: currentCourse.id }
      });
      setStudentSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, [(user as any)?._id, (user as any)?.id, currentCourse?.id]);

  const progress = React.useMemo(() => {
    if (!currentCourse || !currentEnrollment) return 0;

    const uniqueItemIds = new Set<string>();

    if (currentCourse.modules) {
      currentCourse.modules.forEach((mod: any) => {
        if (mod.items) {
          mod.items.forEach((item: any) => uniqueItemIds.add(item.id));
        }
        if (mod.submodules) {
          mod.submodules.forEach((sub: any) => {
            if (sub.items) sub.items.forEach((item: any) => uniqueItemIds.add(item.id));
          });
        }
      });
    }
    if ((currentCourse as any).items) {
      (currentCourse as any).items.forEach((item: any) => uniqueItemIds.add(item.id));
    }

    const totalItems = uniqueItemIds.size;
    if (totalItems === 0) return 100; // If no items, consider it 100% complete

    // Filter out rejected items, and inject newly verified items (since enrollments might be stale on client)
    const rawCompletedList = (currentEnrollment.completedItemIds || []).filter(
      (id: string) => typeof id === 'string' && id.trim().length > 0 && uniqueItemIds.has(id)
    );
    const validCompletedItemIds = new Set(rawCompletedList);
    studentSubmissions.forEach(sub => {
      if (uniqueItemIds.has(sub.assignmentId)) {
        if (sub.status === 'verified') {
          validCompletedItemIds.add(sub.assignmentId);
        } else if (sub.status === 'rejected') {
          validCompletedItemIds.delete(sub.assignmentId);
        }
      }
    });

    const completedItems = validCompletedItemIds.size;
    return Math.min(Math.round((completedItems / totalItems) * 100), 100);
  }, [currentCourse, currentEnrollment, studentSubmissions]);
  useEffect(() => {
    if (slug) {
      dispatch(fetchCourseById(slug));
      if (myEnrollments.length === 0) {
        dispatch(fetchMyEnrollments());
      }
    }
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, slug, myEnrollments.length]);

  const [openModule, setOpenModule] = useState<number | null>(0);
  const [activeItem, setActiveItem] = useState<any>(null);
  const hasUserManuallySelected = React.useRef(false);
  const sidebarScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasUserManuallySelected.current = false;
    setActiveItem(null);
  }, [slug]);

  // Automatically scroll syllabus sidebar so the active / last completed item is visible
  useEffect(() => {
    if (!activeItem?.id || !sidebarScrollRef.current) return;

    const timer = setTimeout(() => {
      const container = sidebarScrollRef.current;
      if (!container) return;

      const activeEl = container.querySelector<HTMLElement>(`#syllabus-item-${activeItem.id}`);
      if (activeEl) {
        const containerTop = container.getBoundingClientRect().top;
        const elemTop = activeEl.getBoundingClientRect().top;
        const offset = elemTop - containerTop + container.scrollTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);

        container.scrollTo({
          top: Math.max(0, offset),
          behavior: 'smooth'
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [activeItem?.id, openModule]);

  const activeSubmission = React.useMemo(() => {
    if (!activeItem || activeItem.type !== 'assignment') return null;
    return studentSubmissions.find(s => s.assignmentId === activeItem.id);
  }, [activeItem, studentSubmissions]);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent, url: string, title: string) => {
    e.preventDefault();
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();

      // Extract filename from URL
      let fileName = url.split('/').pop()?.split('?')[0] || 'document.pdf';

      try {
        fileName = decodeURIComponent(fileName);
      } catch (e) {
        // ignore
      }

      // Try to remove the S3 prefix and UUID: e.g. academy_videos_<uuid>-<original>
      const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-?(.*)/i;
      const match = fileName.match(uuidRegex);

      let cleanFileName = fileName;
      if (match && match[1]) {
        cleanFileName = match[1]; // This is the original file name
      } else {
        // Fallback: if no UUID found, just use the item title
        const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
        const extension = extensionMatch ? extensionMatch[1] : 'pdf';
        const cleanTitle = title.replace(/[^a-z0-9 ]/gi, '').trim();
        cleanFileName = `${cleanTitle}.${extension}`;
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, falling back to direct link", error);
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatItemDuration = (duration: any) => {
    if (!duration) return '00:00';
    if (typeof duration === 'string' && duration.includes(':')) return duration;
    const seconds = parseInt(duration, 10);
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Map backend Course entity to the COURSE_DATA format
  const mappedCourseData = React.useMemo(() => {
    if (!currentCourse) return null;

    let modules: any[] = [];
    if (currentCourse.modules?.length) {
      const moduleMap = new Map();

      currentCourse.modules.forEach((m: any) => {
        moduleMap.set(m.id, {
          id: m.id,
          title: m.title,
          parentId: m.parentId,
          orderIndex: m.orderIndex || 0,
          submodules: [],
          items: m.items?.map((item: any) => ({
            ...item,
            id: item.id || Math.random().toString(),
            type: item.type || 'video',
            title: item.title,
            duration: formatItemDuration(item.duration),
            fileUrl: item.type === 'assignment' ? (item.assignmentData?.instructionsPdfUrl || item.fileUrl) : item.fileUrl,
            assessmentId: item.assignmentData?.assessmentId,
            orderIndex: item.orderIndex || 0,
            liveData: item.liveData,
            provider: item.provider,
            content: item.content,
            completed: (currentEnrollment?.completedItemIds?.includes(item.id) || studentSubmissions.find(s => s.assignmentId === item.id)?.status === 'verified') && !(studentSubmissions.find(s => s.assignmentId === item.id)?.status === 'rejected')
          })).sort((a: any, b: any) => a.orderIndex - b.orderIndex) || []
        });
      });

      // Sort the modules by orderIndex so submodules bubble up in the correct sequence
      const sortedModules = [...currentCourse.modules].sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));

      // Bubble up submodules to root modules
      sortedModules.forEach((m: any) => {
        if (m.parentId) {
          const parent = moduleMap.get(m.parentId);
          const child = moduleMap.get(m.id);
          if (parent && child) {
            parent.submodules.push(child);
          }
        }
      });

      // Filter to keep only root modules
      currentCourse.modules.forEach((m: any) => {
        if (!m.parentId) {
          modules.push(moduleMap.get(m.id));
        }
      });
      modules.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    // Fallback if no modules from backend yet
    if (modules.length === 0) {
      modules = [
        {
          title: "Getting Started",
          submodules: [],
          items: [
            { id: '1', type: 'video', title: "Welcome to " + currentCourse.title, duration: "10:00", completed: false }
          ]
        }
      ]
    }

    return {
      title: currentCourse.title,
      image: currentCourse.thumbnailUrl,
      progress: progress,
      modules: modules,
    };
  }, [currentCourse, progress, currentEnrollment?.completedItemIds, studentSubmissions]);

  const [isMarkingComplete, setIsMarkingComplete] = useState(false);


  const handleMarkAsComplete = async (itemId: string) => {
    if (isMarkingComplete || !currentCourse?.id) return;
    setIsMarkingComplete(true);
    try {
      await dispatch(updateCourseProgress({
        courseId: currentCourse.id,
        itemId,
        completed: true
      })).unwrap();
    } catch (err) {
      console.error("Failed to update progress", err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Flatten all items across all modules and submodules
  const allCourseItems = React.useMemo(() => {
    if (!mappedCourseData?.modules?.length) return [];
    const items: any[] = [];
    mappedCourseData.modules.forEach((m: any) => {
      if (m.items) items.push(...m.items);
      if (m.submodules) {
        m.submodules.forEach((sub: any) => {
          if (sub.items) items.push(...sub.items);
        });
      }
    });
    return items;
  }, [mappedCourseData]);

  // Helper to check if an item has content uploaded/configured by instructor
  const isItemContentMissing = React.useCallback((item: any): boolean => {
    if (!item) return false;
    switch (item.type) {
      case 'video':
        return !item.fileUrl || String(item.fileUrl).trim() === '';
      case 'document':
        return (!item.fileUrl || String(item.fileUrl).trim() === '') && (!item.content || String(item.content).trim() === '');
      case 'assignment':
        return (!item.fileUrl || String(item.fileUrl).trim() === '') && (!item.content || String(item.content).trim() === '');
      case 'test':
      case 'assessment':
        return (!item.assessmentId && !item.assignmentData?.assessmentId) && (!item.content || String(item.content).trim() === '');
      case 'final_assessment':
        return (!item.assessmentId && !item.assignmentData?.assessmentId) && (!item.content || String(item.content).trim() === '');
      case 'live':
        return !item.liveData || (!item.liveData.jitsiRoomId && !item.liveData.youtubeUrl && !item.liveData.recordingUrl && !item.fileUrl);
      default:
        return false;
    }
  }, []);

  // Final Assessment Unlock calculation:
  // Requires configured percentage of prerequisite items (videos, documents, assignments, tests) to be completed
  const { isFinalAssessmentUnlocked, totalPrerequisites, completedPrerequisites, firstIncompleteItem, unlockPctRequired, currentProgressPct } = React.useMemo(() => {
    // Only items that have actual content are considered valid course prerequisites
    const prerequisites = allCourseItems.filter((item: any) => item.type !== 'final_assessment' && !isItemContentMissing(item));
    const total = prerequisites.length;
    const completedCount = prerequisites.filter((item: any) => item.completed).length;
    const firstIncomplete = prerequisites.find((item: any) => !item.completed) || null;
    const unlockPct = currentCourse?.finalAssessmentUnlockPct !== undefined && currentCourse?.finalAssessmentUnlockPct !== null
      ? currentCourse.finalAssessmentUnlockPct
      : 100;
    const currentPct = total > 0 ? Math.round((completedCount / total) * 100) : 100;
    const isUnlocked = total === 0 || unlockPct === 0 || currentPct >= unlockPct;

    return {
      isFinalAssessmentUnlocked: isUnlocked,
      totalPrerequisites: total,
      completedPrerequisites: completedCount,
      firstIncompleteItem: firstIncomplete,
      unlockPctRequired: unlockPct,
      currentProgressPct: currentPct,
    };
  }, [allCourseItems, currentCourse?.finalAssessmentUnlockPct, isItemContentMissing]);

  // Determine locked state and human-readable reason / tooltip for any curriculum item
  const getItemLockStatus = React.useCallback((item: any) => {
    if (!item) return { isLocked: false, reason: '', tooltip: '' };

    const contentMissing = isItemContentMissing(item);

    if (item.type === 'final_assessment') {
      if (!isFinalAssessmentUnlocked) {
        return {
          isLocked: true,
          reason: 'prerequisites_not_met',
          tooltip: `Complete ${unlockPctRequired}% of prior lessons to unlock (${currentProgressPct}% completed)`
        };
      }
      if (contentMissing) {
        return {
          isLocked: true,
          reason: 'content_missing',
          tooltip: 'Content not added in this section'
        };
      }
      return { isLocked: false, reason: '', tooltip: '' };
    }

    if (contentMissing) {
      return {
        isLocked: true,
        reason: 'content_missing',
        tooltip: 'Content not added in this section'
      };
    }

    return { isLocked: false, reason: '', tooltip: '' };
  }, [isItemContentMissing, isFinalAssessmentUnlocked, unlockPctRequired, currentProgressPct]);

  // Compute the parent module title for the currently active item
  const activeItemModuleTitle = React.useMemo(() => {
    if (!activeItem || !mappedCourseData?.modules) return '';
    for (const m of mappedCourseData.modules) {
      if (m.items?.some((it: any) => it.id === activeItem.id)) return m.title;
      if (m.submodules) {
        for (const sub of m.submodules) {
          if (sub.items?.some((it: any) => it.id === activeItem.id)) return `${m.title} — ${sub.title}`;
        }
      }
    }
    return '';
  }, [activeItem, mappedCourseData]);

  // Find the next available (unlocked) lesson to skip to
  const nextAvailableItem = React.useMemo(() => {
    if (!activeItem || !allCourseItems.length) return null;
    const currentIndex = allCourseItems.findIndex((it: any) => it.id === activeItem.id);
    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < allCourseItems.length; i++) {
        const candidate = allCourseItems[i];
        if (!getItemLockStatus(candidate).isLocked) {
          return candidate;
        }
      }
    }
    // If not found ahead, find first incomplete and unlocked item
    return allCourseItems.find((it: any) => it.id !== activeItem.id && !getItemLockStatus(it).isLocked && !it.completed) || null;
  }, [activeItem, allCourseItems, getItemLockStatus]);

  useEffect(() => {
    if (mappedCourseData && mappedCourseData.modules.length > 0) {
      if (allCourseItems.length > 0) {
        const completedItems = allCourseItems.filter((item: any) => item.completed);

        // Find the item that was completed last:
        let lastCompletedItem: any = null;

        if (completedItems.length > 0) {
          // Priority 1: Check completedItemIds in reverse (the most recently completed item is at the end)
          if (currentEnrollment?.completedItemIds && Array.isArray(currentEnrollment.completedItemIds)) {
            for (let i = currentEnrollment.completedItemIds.length - 1; i >= 0; i--) {
              const cid = currentEnrollment.completedItemIds[i];
              const found = allCourseItems.find((item: any) => item.id === cid && item.completed);
              if (found) {
                lastCompletedItem = found;
                break;
              }
            }
          }

          // Priority 2: Fallback to the last completed item in course curriculum order
          if (!lastCompletedItem) {
            lastCompletedItem = completedItems[completedItems.length - 1];
          }
        }

        // If at least one item was completed, show the last completed item; if none completed, show the first item
        const targetItem = lastCompletedItem || allCourseItems[0];

        if (!activeItem) {
          setActiveItem(targetItem);
          setIsVideoEnded(false);

          // Automatically expand the parent module of the active item in syllabus
          const parentModuleIndex = mappedCourseData.modules.findIndex((mod: any) => {
            if (mod.items?.some((it: any) => it.id === targetItem.id)) return true;
            if (mod.submodules?.some((sub: any) => sub.items?.some((it: any) => it.id === targetItem.id))) return true;
            return false;
          });
          if (parentModuleIndex !== -1) {
            setOpenModule(parentModuleIndex);
          }
        } else if (!hasUserManuallySelected.current && lastCompletedItem && activeItem.id === allCourseItems[0].id && !activeItem.completed) {
          // If activeItem was initialized to the first item before enrollments finished loading,
          // automatically switch to the last completed item once enrollments arrive
          setActiveItem(lastCompletedItem);
          setIsVideoEnded(false);

          const parentModuleIndex = mappedCourseData.modules.findIndex((mod: any) => {
            if (mod.items?.some((it: any) => it.id === lastCompletedItem.id)) return true;
            if (mod.submodules?.some((sub: any) => sub.items?.some((it: any) => it.id === lastCompletedItem.id))) return true;
            return false;
          });
          if (parentModuleIndex !== -1) {
            setOpenModule(parentModuleIndex);
          }
        } else {
          // Active item already chosen, sync any updated properties (e.g. newly marked complete)
          const latestActiveItem = allCourseItems.find(item => item.id === activeItem.id);
          if (latestActiveItem && (latestActiveItem.completed !== activeItem.completed || JSON.stringify(latestActiveItem.liveData) !== JSON.stringify(activeItem.liveData))) {
            setActiveItem(latestActiveItem);
          }
        }
      } else {
        if (!activeItem) {
          // Fallback if the course has modules but no lessons yet
          setActiveItem({
            id: 'fallback',
            type: 'video',
            title: 'No content available yet',
            duration: '00:00',
            completed: false
          });
          setIsVideoEnded(false);
        }
      }
    }
  }, [mappedCourseData, activeItem, allCourseItems, currentEnrollment?.completedItemIds]);

  if (isLoading || (myEnrollments.length === 0 && isEnrollmentsLoading) || !mappedCourseData) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#C9A227]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error loading course</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/dashboard/courses">
          <button className="bg-[#122340] text-white px-6 py-2.5 rounded-lg font-bold">Go Back</button>
        </Link>
      </div>
    );
  }

  const COURSE_DATA = mappedCourseData;
  if (!activeItem) return null; // Wait for activeItem to be set

  const activeItemLock = getItemLockStatus(activeItem);

  // We use fixed positioning to overlay on top of the global Academy Navbar/Footer 
  // to create a true distraction-free learning environment.
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans animate-in fade-in duration-500">
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .learn-sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .learn-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .learn-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(18,35,64,0.15); border-radius: 999px; }
        .learn-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(18,35,64,0.3); }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="h-16 bg-gradient-to-r from-[#0a1628] via-[#0d1b32] to-[#0a1628] text-white flex items-center justify-between px-4 shrink-0 shadow-[0_2px_16px_-4px_rgba(10,22,40,0.6)] relative border-b border-[#C9A227]/15">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <button className="p-2 hover:bg-white/10 rounded-full transition-all hover:-translate-x-0.5 active:scale-95 cursor-pointer">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div className="hidden sm:block h-6 w-px bg-white/15"></div>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="hidden md:flex w-8 h-8 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/25 items-center justify-center shrink-0">
              <BookOpen size={15} className="text-[#C9A227]" />
            </div>
            <h1 className="font-bold text-sm sm:text-base truncate max-w-md tracking-tight">{COURSE_DATA.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {(progress >= 30 || myReview || canReview) && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A227]/15 hover:bg-[#C9A227]/25 text-[#C9A227] border border-[#C9A227]/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-[0_4px_12px_-2px_rgba(201,162,39,0.35)] hover:-translate-y-0.5"
              title={myReview ? "Edit your review" : "Leave a review"}
            >
              <Star size={13} className="fill-[#C9A227]" />
              <span>{myReview ? "Edit Review" : "Write Review"}</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-3 mr-4 relative group cursor-pointer py-1">
            <span className="text-xs text-white/70 font-semibold uppercase tracking-wider group-hover:text-white transition-colors">
              Your Progress
            </span>
            <div className="w-32 bg-white/10 rounded-full h-2 overflow-hidden relative ring-1 ring-white/5">
              <div
                className="bg-gradient-to-r from-[#C9A227] via-[#e0b93a] to-[#C9A227] h-2 rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-[0_0_8px_rgba(201,162,39,0.5)]"
                style={{ width: `${COURSE_DATA.progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" style={{ animation: 'shimmer 2.5s infinite' }} />
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#C9A227] tabular-nums w-9 text-right">{COURSE_DATA.progress}%</span>

            {/* Hover Tooltip */}
            <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-[#122340] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 flex items-center whitespace-nowrap">
              <span>{COURSE_DATA.progress}% Completed</span>
              <div className="absolute bottom-full right-8 border-4 border-transparent border-b-[#122340]" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e0b93a] to-[#C9A227] flex items-center justify-center font-bold text-sm text-[#0a1628] ring-2 ring-[#C9A227]/40 ring-offset-2 ring-offset-[#0a1628] shadow-md">
            {(() => {
              const u = user as any;
              const fullName = u?.name || u?.firstName || u?.email || '';
              const parts = fullName.trim().split(/\s+/);
              if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
              if (parts[0]?.length >= 2) return parts[0].slice(0, 1).toUpperCase();
              return fullName.slice(0, 1).toUpperCase() || 'U';
            })()}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">

        {/* LEFT COLUMN: Dynamic Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fcfcfa]">

          {/* ── LOCKED SECTION SCREEN ── */}
          {activeItemLock.isLocked ? (
            activeItemLock.reason === 'prerequisites_not_met' ? (
              /* Prerequisites Incomplete (Assessment locked until prior requirements met) */
              <div className="my-6 sm:my-8 mx-auto w-[95%] max-w-4xl bg-white border border-[#E5DDCB] rounded-2xl p-8 sm:p-12 shadow-[0_20px_50px_-20px_rgba(11,18,32,0.08)] flex flex-col items-center text-center shrink-0 relative">
                {/* <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[#B7913A] flex items-center justify-center mb-6 shadow-inner">
                  <Lock size={38} className="animate-pulse" strokeWidth={1.75} />
                </div> */}

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
                  <Lock size={13} className="text-amber-700" />
                  <span>Prerequisites Incomplete · Assessment Locked</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight mb-3 font-serif">
                  {activeItem.title || "Final Course Assessment"}
                </h2>

                <p className="text-sm sm:text-base text-[#4B5468] max-w-xl mx-auto mb-8 leading-relaxed">
                  This assessment is the capstone requirement to complete the course and earn your official verifiable certificate. You must complete at least <strong className="text-[#0B1220]">{unlockPctRequired}%</strong> of prior coursework and requirements before this examination unlocks.
                </p>

                {/* Progress Summary Card */}
                <div className="w-full max-w-lg bg-[#FDFBF5] border border-[#E5DDCB] rounded-2xl p-6 mb-8 text-left shadow-xs">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold text-[#4B5468] uppercase tracking-wider">
                      Curriculum Prerequisites
                    </span>
                    <span className="text-xs font-extrabold text-[#B7913A]">
                      {completedPrerequisites} of {totalPrerequisites} Completed ({currentProgressPct}% / {unlockPctRequired}% required)
                    </span>
                  </div>

                  <div className="w-full bg-[#E5DDCB]/60 h-3 rounded-full overflow-hidden relative">
                    <div
                      className="bg-gradient-to-r from-[#B7913A] to-[#8F6F22] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, currentProgressPct)}%` }}
                    />
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-[#E5DDCB]/60 flex items-start gap-2 text-xs text-[#4B5468]">
                    <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      {Math.max(1, Math.ceil((unlockPctRequired / 100) * totalPrerequisites) - completedPrerequisites)} more required lesson(s) or test(s) must be completed to reach {unlockPctRequired}% and unlock this final assessment.
                    </span>
                  </div>
                </div>

                {/* Resume Learning Action */}
                {firstIncompleteItem ? (
                  <button
                    onClick={() => {
                      hasUserManuallySelected.current = true;
                      setActiveItem(firstIncompleteItem);
                      setIsVideoEnded(false);
                    }}
                    className="bg-[#0B1220] hover:bg-[#141B2E] text-[#F7F3EA] px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <span>Continue Course: {firstIncompleteItem.title}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <p className="text-xs font-semibold text-[#4B5468]">
                    Please review your syllabus on the right for any pending tasks.
                  </p>
                )}
              </div>
            ) : (
              /* Content Missing / Not Uploaded Yet by Faculty */
              <div className="my-6 sm:my-8 mx-auto w-[95%] max-w-4xl bg-white border border-[#E5DDCB] rounded-2xl p-8 sm:p-12 shadow-[0_20px_50px_-20px_rgba(11,18,32,0.08)] flex flex-col items-center text-center shrink-0 relative">
                {/* <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[#B7913A] flex items-center justify-center mb-6 shadow-inner">
                  <Clock size={38} className="animate-pulse" strokeWidth={1.75} />
                </div> */}

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
                  <Lock size={13} className="text-amber-700" />
                  <span>Section Locked · Content Under Preparation</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight mb-3 font-serif">
                  {activeItem.title}
                </h2>

                <p className="text-sm sm:text-base text-[#4B5468] max-w-xl mx-auto mb-6 leading-relaxed">
                  The curriculum material for this section has not been uploaded yet by the instructor. It will automatically unlock and become available as soon as the faculty publishes the content.
                </p>

                {/* Section Meta Card */}
                <div className="w-full max-w-md bg-[#FDFBF5] border border-[#E5DDCB] rounded-2xl p-4 sm:p-5 mb-8 text-left text-xs space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DDCB]/60">
                    <span className="text-[#4B5468] font-medium">Curriculum Section</span>
                    <span className="text-[#0B1220] font-bold truncate max-w-[220px]">{activeItemModuleTitle || COURSE_DATA.title}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DDCB]/60">
                    <span className="text-[#4B5468] font-medium">Content Format</span>
                    <span className="text-[#0B1220] font-bold capitalize">{formatItemType(activeItem.type)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4B5468] font-medium">Availability</span>
                    <span className="text-amber-800 font-bold inline-flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-600" /> Pending instructor upload
                    </span>
                  </div>
                </div>

                {/* Skip to Next Lesson or Resume */}
                {nextAvailableItem ? (
                  <button
                    onClick={() => {
                      hasUserManuallySelected.current = true;
                      setActiveItem(nextAvailableItem);
                      setIsVideoEnded(false);
                    }}
                    className="bg-[#0B1220] hover:bg-[#141B2E] text-[#F7F3EA] px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <span>Skip to Available Lesson: {nextAvailableItem.title}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : firstIncompleteItem ? (
                  <button
                    onClick={() => {
                      hasUserManuallySelected.current = true;
                      setActiveItem(firstIncompleteItem);
                      setIsVideoEnded(false);
                    }}
                    className="bg-[#0B1220] hover:bg-[#141B2E] text-[#F7F3EA] px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <span>Go to Next Uncompleted: {firstIncompleteItem.title}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2">
                    <Lock size={14} className="text-amber-600 shrink-0" />
                    <span>This section will become active once material is uploaded.</span>
                  </div>
                )}
              </div>
            )
          ) : (
            <>
              {/* Dynamic Render based on item type (Only when unlocked) */}
              {activeItem.type === 'video' && (
                <div className="mt-2 sm:mt-4 mx-auto w-[95%] max-w-5xl relative flex flex-col shrink-0 rounded-2xl overflow-hidden shadow-[0_12px_40px_-8px_rgba(10,22,40,0.25)] border border-[#122340]/10 bg-black ring-1 ring-black/5">
                  <div className="bg-gradient-to-b from-white to-[#fafaf7] border-b border-[#122340]/10 p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C9A227]/20 to-[#C9A227]/10 text-[#C9A227] rounded-xl flex items-center justify-center shadow-inner border border-[#C9A227]/20 shrink-0">
                        <Video size={20} />
                      </div>
                      <h2 className="font-bold text-[#122340] text-lg tracking-tight truncate">{activeItem.title}</h2>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {activeItem.completed ? (
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 cursor-default select-none shadow-[0_4px_12px_-2px_rgba(34,197,94,0.4)]">
                          <CheckCircle2 size={16} /> Completed
                        </div>
                      ) : activeItem.fileUrl ? (
                        <button
                          onClick={() => handleMarkAsComplete(activeItem.id)}
                          disabled={isMarkingComplete}
                          className="bg-gradient-to-br from-[#C9A227] to-[#b08d20] text-white px-5 py-2 rounded-xl font-bold text-sm hover:shadow-[0_4px_14px_-2px_rgba(201,162,39,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer shadow-sm"
                        >
                          {isMarkingComplete ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          Mark as Complete
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="w-full max-h-[490px] aspect-video relative group flex shrink-0">
                    {activeItem.fileUrl ? (
                      (activeItem.provider === 'youtube' || activeItem.fileUrl.includes('youtube') || activeItem.fileUrl.includes('youtu.be')) ? (
                        <iframe
                          src={activeItem.fileUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="relative w-full h-full group bg-black">
                          <video
                            ref={videoRef}
                            src={activeItem.fileUrl}
                            controls
                            controlsList="nodownload"
                            className="w-full h-full object-contain"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={(e) => {
                              const video = e.currentTarget;
                              if (!activeItem.completed && video.duration > 0) {
                                if (video.currentTime / video.duration > 0.9) {
                                  handleMarkAsComplete(activeItem.id);
                                }
                              }
                            }}
                            onEnded={() => {
                              setIsVideoEnded(true);
                              if (!activeItem.completed) {
                                handleMarkAsComplete(activeItem.id);
                              }
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                          {!isPlaying && !isVideoEnded && (
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-black/10 to-transparent cursor-pointer group/play"
                              onClick={() => videoRef.current?.play()}
                            >
                              <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-[#C9A227]/40 blur-2xl scale-110 animate-pulse" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-[#e0b93a] to-[#C9A227] rounded-full flex items-center justify-center shadow-2xl transition-all transform group-hover/play:scale-110 ring-4 ring-white/20">
                                  <Play className="text-[#0a1628] ml-2" size={40} fill="currentColor" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full relative">
                        <img
                          src={COURSE_DATA.image || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1200&auto=format&fit=crop"}
                          alt="Video Thumbnail"
                          className="w-full h-full object-contain opacity-60 bg-black"
                        />
                        <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
                          <Video size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="font-bold text-lg">Video is not available right now</p>
                          <p className="text-sm opacity-70">We will upload the video for this lesson in the future.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeItem.type === 'document' && (
                <div className="mt-6 sm:mt-8 mx-auto w-[95%] max-w-5xl bg-[#f8f9fa] max-h-[700px] h-[700px] relative flex flex-col shrink-0 rounded-2xl overflow-hidden shadow-[0_12px_40px_-8px_rgba(10,22,40,0.2)] border border-[#122340]/10 ring-1 ring-black/5">
                  {activeItem.fileUrl ? (
                    <>
                      <div className="bg-gradient-to-b from-white to-[#fafaf7] border-b border-[#122340]/10 p-4 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#C9A227]/20 to-[#C9A227]/10 text-[#C9A227] rounded-xl flex items-center justify-center shadow-inner border border-[#C9A227]/20 shrink-0">
                            <FileText size={20} />
                          </div>
                          <h2 className="font-bold text-[#122340] text-lg tracking-tight truncate">{activeItem.title}</h2>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {activeItem.completed ? (
                            <div
                              className="bg-gradient-to-br from-green-500 to-green-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 cursor-default select-none shadow-[0_4px_12px_-2px_rgba(34,197,94,0.4)]"
                            >
                              <CheckCircle2 size={16} />
                              Completed
                            </div>
                          ) : (
                            <button
                              onClick={() => handleMarkAsComplete(activeItem.id)}
                              disabled={isMarkingComplete}
                              className="bg-gradient-to-br from-[#C9A227] to-[#b08d20] text-white px-5 py-2 rounded-xl font-bold text-sm hover:shadow-[0_4px_14px_-2px_rgba(201,162,39,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer shadow-sm"
                            >
                              {isMarkingComplete ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                              Mark as Complete
                            </button>
                          )}
                          <button
                            onClick={(e) => activeItem.fileUrl && handleDownload(e, activeItem.fileUrl, activeItem.title)}
                            disabled={isDownloading}
                            className="bg-gradient-to-br from-[#122340] to-[#0a1628] text-white px-5 py-2 rounded-xl font-bold text-sm hover:shadow-[0_4px_14px_-2px_rgba(10,22,40,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer shadow-sm"
                          >
                            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            {isDownloading ? 'Downloading...' : 'Download Document'}
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 w-full bg-[#e5e7eb]">
                        <iframe
                          src={activeItem.fileUrl.toLowerCase().includes('.pdf') ? `${activeItem.fileUrl}#toolbar=0` : `https://docs.google.com/viewer?url=${encodeURIComponent(activeItem.fileUrl)}&embedded=true`}
                          className="w-full h-full border-none"
                          title={activeItem.title}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white">
                      <FileText size={64} className="text-[#122340]/20 mb-6" />
                      <h2 className="text-2xl font-extrabold mb-2 text-[#122340]">Document Unavailable</h2>
                      <p className="text-[#122340]/60 mb-8 font-medium max-w-lg">
                        The document for this lesson has not been uploaded yet. Please check back later.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeItem.type === 'live' && (
                <LiveClassViewer
                  item={activeItem}
                  user={user}
                  courseTitle={COURSE_DATA.title}
                  onMarkComplete={handleMarkAsComplete}
                  onStatusChange={(updated) => {
                    setActiveItem((prev: any) => ({ ...prev, ...updated }));
                    if (updated?.id) {
                      dispatch(updateCourseItemData({ itemId: updated.id, liveData: updated.liveData }));
                    }
                  }}
                />
              )}

              {activeItem.type === 'assignment' && (
                <div className="mt-6 sm:mt-8 mx-auto w-[95%] max-w-5xl bg-[#f8f9fa] border border-[#122340]/10 rounded-2xl p-10 flex flex-col items-center justify-center shrink-0 text-[#122340] shadow-sm">
                  <ClipboardList size={48} className="text-[#C9A227] mb-6" />
                  <h2 className="text-2xl font-extrabold mb-2 text-center">{activeItem.title}</h2>
                  <p className="text-[#122340]/60 mb-6 font-medium">Please review the instructions below and upload your completed work.</p>

                  {activeItem.fileUrl && (
                    <button
                      onClick={(e) => handleDownload(e, activeItem.fileUrl, activeItem.title)}
                      disabled={isDownloading}
                      className="mb-8 bg-[#C9A227] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#b08d20] hover:shadow-lg transition-all flex items-center gap-3 shadow-md disabled:opacity-50"
                    >
                      {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                      {isDownloading ? 'Downloading...' : 'Download Assignment Instructions'}
                    </button>
                  )}

                  {!activeItem.fileUrl ? (
                    <div className="w-full max-w-md bg-white border-2 border-dashed border-[#122340]/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-not-allowed mb-8 relative opacity-70">
                      <FileText size={32} className="text-[#122340]/20 mb-4" />
                      <p className="font-bold text-sm mb-1 text-[#122340]/50">Assignment Instructions Unavailable</p>
                      <p className="text-xs text-[#122340]/40">You cannot submit until instructions are provided.</p>
                    </div>
                  ) : (
                    <div
                      className={`w-full max-w-md bg-white border-2 border-dashed ${activeSubmission?.status === 'verified' || activeSubmission?.status === 'pending' || activeSubmission?.status === 'resubmitted' || (activeItem.completed && !activeSubmission)
                        ? 'border-green-400 bg-green-50/50 cursor-default'
                        : activeSubmission?.status === 'rejected'
                          ? 'border-red-400 hover:border-red-500 hover:bg-red-50 cursor-pointer'
                          : 'border-[#122340]/20 hover:border-[#C9A227]/50 hover:bg-[#C9A227]/5 cursor-pointer'
                        } rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors group mb-8 relative`}
                      onClick={() => {
                        const isCompletedButLocked = activeSubmission?.status === 'verified' || activeSubmission?.status === 'pending' || activeSubmission?.status === 'resubmitted' || (activeItem.completed && activeSubmission?.status !== 'rejected');
                        if (!isCompletedButLocked && !isMarkingComplete) {
                          const el = document.getElementById(`file-upload-${activeItem.id}`);
                          if (el) el.click();
                        }
                      }}
                    >
                      <input
                        type="file"
                        id={`file-upload-${activeItem.id}`}
                        className="hidden"
                        accept=".pdf"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                              toast.error("Only PDF files are allowed for assignments.");
                              e.target.value = ''; // Reset input
                              return;
                            }
                            setIsMarkingComplete(true);
                            try {
                              // 1. Upload file to S3
                              const s3Url = await uploadToS3(file);

                              // 2. Submit to backend
                              await apiClient.post(`/academy/assignments/${activeItem.id}/submit`, {
                                submissionPdfUrl: s3Url,
                                studentName: (user as any)?.name || (user as any)?.firstName || 'Student',
                                studentEmail: (user as any)?.email || 'student@example.com',
                                studentId: (user as any)?._id || (user as any)?.id
                              });

                              // We do NOT mark as complete locally until verified by admin
                              // await handleMarkAsComplete(activeItem.id);
                              await fetchMySubmissions();
                              toast.success("Assignment submitted successfully!");
                            } catch (err) {
                              console.error("Assignment upload error:", err);
                              toast.error("Failed to submit assignment. Please try again.");
                            } finally {
                              setIsMarkingComplete(false);
                            }
                          }
                        }}
                      />

                      {isMarkingComplete ? (
                        <>
                          <Loader2 size={32} className="text-[#C9A227] mb-4 animate-spin" />
                          <p className="font-bold text-sm mb-1 text-[#C9A227]">Uploading Document...</p>
                        </>
                      ) : activeSubmission?.status === 'verified' ? (
                        <>
                          <CheckCircle2 size={32} className="text-green-500 mb-4" />
                          <p className="font-bold text-sm mb-1 text-green-700">Assignment Verified</p>
                          {activeSubmission.feedback && <p className="text-xs text-green-600 font-medium bg-green-100/80 px-4 py-2 rounded-lg mt-3 text-left w-full border border-green-200">{activeSubmission.feedback}</p>}
                        </>
                      ) : activeSubmission?.status === 'rejected' ? (
                        <>
                          <XCircle size={32} className="text-red-500 mb-4" />
                          <p className="font-bold text-sm mb-1 text-red-700">Submission Rejected</p>
                          {activeSubmission.feedback && <p className="text-xs text-red-600 font-medium bg-red-100/80 px-4 py-2 rounded-lg mt-3 text-left w-full border border-red-200">{activeSubmission.feedback}</p>}
                          <p className="text-xs text-red-600/70 mt-4 flex items-center justify-center gap-1"><UploadCloud size={14} /> Click to re-upload your assignment</p>
                        </>
                      ) : activeSubmission?.status === 'pending' || activeSubmission?.status === 'resubmitted' || activeItem.completed ? (
                        <>
                          <Clock size={32} className="text-blue-500 mb-4" />
                          <p className="font-bold text-sm mb-1 text-blue-700">Document Uploaded Successfully</p>
                          <p className="text-xs text-blue-600/70">Pending review</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={32} className="text-[#122340]/40 group-hover:text-[#C9A227] mb-4 transition-colors" />
                          <p className="font-bold text-sm mb-1 group-hover:text-[#122340]">Click or drag & drop your PDF here</p>
                          <p className="text-xs text-[#122340]/50">Maximum file size: 10MB</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Test & Assessment Player */}
              {(activeItem.type === 'test' || activeItem.type === 'assessment' || activeItem.type === 'final_assessment') && (() => {
                return (
                  <AssessmentPlayer
                    key={activeItem.id}
                    courseId={currentCourse?.id || ''}
                    itemId={activeItem.id}
                    assessmentId={activeItem.assessmentId}
                    title={activeItem.title}
                    onComplete={() => handleMarkAsComplete(activeItem.id)}
                  />
                );
              })()}

              {activeItem.type === 'certificate' && (
                <div className="mt-6 sm:mt-8 mx-auto w-[95%] max-w-5xl bg-gradient-to-br from-[#122340] to-[#0a1628] border border-[#122340]/10 rounded-2xl p-10 flex flex-col items-center justify-center shrink-0 text-white min-h-[400px] shadow-sm">
                  <Award size={64} className="text-[#C9A227] mb-6" />
                  <h2 className="text-3xl font-extrabold mb-4 text-center">Course Complete!</h2>
                  <p className="text-blue-100/70 mb-8 font-medium text-center max-w-lg">
                    {COURSE_DATA.progress === 100
                      ? "Congratulations! You have completed all requirements, including the final assessment. Your certificate is ready to download."
                      : "Congratulations on reaching this far. Your verifiable certificate is locked until all course requirements and the final assessment are passed."}
                  </p>
                  {COURSE_DATA.progress === 100 ? (
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          const certBtn = document.getElementById('cert-download-btn');
                          if (certBtn) certBtn.click();
                          else window.location.href = '/dashboard/certificates';
                        }}
                        className="bg-[#C9A227] text-[#0a1628] px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Download size={18} /> Download Certificate
                      </button>
                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Star size={18} className="fill-[#C9A227] text-[#C9A227]" />
                        {myReview ? "Edit Your Review" : "Rate & Review Course"}
                      </button>
                    </div>
                  ) : (
                    <button disabled className="bg-[#122340] border border-white/10 text-white/50 px-10 py-4 rounded-xl font-bold transition-all flex items-center gap-2">
                      <Download size={18} /> Certificate Locked
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Content Tabs Below Media Area */}
          <div className="p-6 md:p-10 max-w-4xl w-full mx-auto pb-32">

            {!activeItemLock.isLocked && (
              <h2 className="text-2xl font-bold text-[#122340] mb-6">{activeItem.title}</h2>
            )}

            <div className="flex border-b border-[#122340]/10 mb-8 overflow-x-auto gap-1 relative">
              <button
                onClick={() => setActiveTab('qa')}
                className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer relative -mb-px ${activeTab === 'qa'
                  ? 'border-[#C9A227] text-[#C9A227]'
                  : 'border-transparent text-[#122340]/55 hover:text-[#122340] hover:bg-[#122340]/[0.02]'
                  }`}
              >
                <MessageSquare size={16} /> Q&A
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer relative -mb-px ${activeTab === 'reviews'
                  ? 'border-[#C9A227] text-[#C9A227]'
                  : 'border-transparent text-[#122340]/55 hover:text-[#122340] hover:bg-[#122340]/[0.02]'
                  }`}
              >
                <Star size={16} className={activeTab === 'reviews' ? 'fill-[#C9A227]' : ''} /> Course Reviews
              </button>
            </div>

            {activeTab === 'qa' ? (
              <div>
                {currentCourse?.id ? (
                  <CourseQATab
                    courseId={currentCourse.id}
                    activeItemId={activeItem?.id}
                    activeModuleId={activeItem?.moduleId}
                    activeItemTitle={activeItem?.title}
                    currentUser={
                      user
                        ? {
                          id: (user as any).id || user._id || '',
                          name: user.name || (user as any).fullName || 'Student',
                          avatar: (user as any).avatar || user.profilePicture || undefined,
                        }
                        : null
                    }
                    isAdmin={
                      Boolean(
                        (user as any)?.role === 'admin' ||
                        (user as any)?.role === 'ADMIN' ||
                        user?.roles?.some((r: any) =>
                          typeof r === 'string'
                            ? r.toLowerCase() === 'admin'
                            : r?.name?.toLowerCase() === 'admin'
                        )
                      )
                    }
                  />
                ) : (
                  <p className="text-slate-500 text-sm py-4">Loading Q&A...</p>
                )}
              </div>
            ) : (
              <div>
                {currentCourse?.id ? (
                  <CourseReviewsSection
                    key={reviewRefreshKey}
                    courseId={currentCourse.id}
                    courseTitle={currentCourse.title}
                  />
                ) : (
                  <p className="text-slate-500 text-sm py-4">Loading reviews...</p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Sequential Syllabus Accordion */}
        <div className="w-full lg:w-96 bg-white border-l border-[#122340]/10 h-full flex flex-col shrink-0 relative z-10 shadow-xl lg:shadow-[inset_1px_0_0_rgba(18,35,64,0.05)]">
          <div className="p-4 border-b border-[#122340]/10 bg-gradient-to-b from-[#f9f7f0] to-white relative">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#122340] flex items-center justify-center shadow-sm">
                  <BookOpen size={14} className="text-[#C9A227]" />
                </div>
                <h3 className="font-extrabold text-[#122340] text-sm tracking-tight">Course Syllabus</h3>
              </div>
              <span className="text-[10px] font-bold text-[#122340]/60 uppercase tracking-wider bg-[#122340]/5 px-2 py-0.5 rounded-full">
                {COURSE_DATA.modules.length} {COURSE_DATA.modules.length === 1 ? 'Module' : 'Modules'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#122340]/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C9A227] to-[#e0b93a] rounded-full transition-all duration-700 ease-out shadow-[0_0_6px_rgba(201,162,39,0.5)]"
                  style={{ width: `${COURSE_DATA.progress}%` }}
                />
              </div>
              <span className="text-[11px] font-extrabold text-[#122340] tabular-nums">{COURSE_DATA.progress}%</span>
            </div>
          </div>

          <div ref={sidebarScrollRef} className="learn-sidebar-scroll overflow-y-auto flex-grow pb-20 scroll-smooth">
            {COURSE_DATA.modules.map((mod, i) => {
              const modCompleted = mod.items.filter((item: any) => item.completed).length + mod.submodules.reduce((acc: number, sub: any) => acc + sub.items.filter((item: any) => item.completed).length, 0);
              const modTotal = mod.items.length + mod.submodules.reduce((acc: number, sub: any) => acc + sub.items.length, 0);
              const modPct = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
              const modFullyDone = modTotal > 0 && modCompleted === modTotal;
              const isOpen = openModule === i;
              return (
                <div key={i} className="border-b border-[#122340]/8">
                  <button
                    onClick={() => setOpenModule(openModule === i ? null : i)}
                    className={`w-full p-4 flex justify-between items-start text-left transition-all cursor-pointer ${isOpen ? 'bg-[#122340]/[0.03]' : 'bg-white hover:bg-[#122340]/[0.02]'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 transition-colors ${modFullyDone ? 'bg-green-500 text-white shadow-sm' : isOpen ? 'bg-[#C9A227] text-white shadow-sm' : 'bg-[#122340]/8 text-[#122340]/70'}`}>
                          {modFullyDone ? <CheckCircle2 size={13} /> : (i + 1).toString().padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#122340] text-sm mb-1.5 pr-2 leading-tight">{mod.title}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-[#122340]/8 rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${modFullyDone ? 'bg-green-500' : 'bg-[#C9A227]'}`}
                                style={{ width: `${modPct}%` }}
                              />
                            </div>
                            <p className="text-[11px] font-semibold text-[#122340]/55 tabular-nums">
                              {modCompleted}/{modTotal}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={16} className={`text-[#122340]/40 shrink-0 mt-1 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#C9A227]' : ''}`} />
                  </button>

                  {openModule === i && (
                    <div className="bg-[#122340]/[0.02] py-2">
                      {/* Root Level Items */}
                      {mod.items.map((item: any) => {
                        const isActive = activeItem?.id === item.id;
                        const lockStatus = getItemLockStatus(item);
                        const isItemLocked = lockStatus.isLocked;
                        return (
                          <div
                            key={item.id}
                            id={`syllabus-item-${item.id}`}
                            onClick={() => {
                              hasUserManuallySelected.current = true;
                              setActiveItem(item);
                              setIsVideoEnded(false);
                            }}
                            title={lockStatus.tooltip || undefined}
                            className={`group/item relative flex gap-3 p-3 pl-4 cursor-pointer transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-[#C9A227]/15 via-[#C9A227]/8 to-transparent border-l-4 border-[#C9A227] shadow-[inset_0_0_0_1px_rgba(201,162,39,0.12)]' : 'border-l-4 border-transparent hover:bg-[#122340]/[0.04] hover:border-[#122340]/15'}`}
                          >
                            {/* Floating tooltip on hover when locked */}
                            {lockStatus.isLocked && (
                              <div className="absolute right-3 top-2 hidden group-hover/item:flex items-center gap-1.5 px-2.5 py-1 bg-gray-900/95 text-white text-[10px] font-semibold rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap border border-gray-700/60 animate-in fade-in duration-150">
                                <Lock size={10} className="text-amber-400 shrink-0" />
                                <span>{lockStatus.tooltip}</span>
                              </div>
                            )}

                            <div className="mt-0.5 shrink-0 flex items-center justify-center">
                              {(() => {
                                const submission = item.type === 'assignment' ? studentSubmissions.find(s => s.assignmentId === item.id) : null;
                                if (submission?.status === 'rejected') {
                                  return <XCircle size={16} className="text-red-500" />;
                                }
                                if (submission?.status === 'pending' || submission?.status === 'resubmitted') {
                                  return <Circle size={16} className="text-green-500" />;
                                }
                                if (item.completed) {
                                  return <CheckCircle2 size={16} className="text-green-500" />;
                                }
                                if (isItemLocked) {
                                  return <Lock size={16} className="text-amber-500" />;
                                }
                                return (
                                  <div className="w-4 h-4 rounded-full border-2 border-[#122340]/20 flex items-center justify-center">
                                    {isActive && <div className="w-1.5 h-1.5 bg-[#C9A227] rounded-full"></div>}
                                  </div>
                                );
                              })()}
                            </div>
                            <div>
                              <p className={`text-sm ${isActive ? 'font-bold text-[#122340]' : 'font-medium text-[#122340]/80'}`}>
                                {item.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#122340]/50 mt-1.5">
                                {isItemLocked ? (
                                  // <Lock size={14} className="text-amber-500" />
                                  <></>
                                ) : (
                                  getItemIcon(item.type, isActive, item.completed)
                                )}
                                <span className="uppercase tracking-wider">{formatItemType(item.type)}</span>
                                {item.type === 'live' && item.liveData?.status === 'live' && (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-red-100 text-red-700 font-extrabold rounded-full animate-pulse">LIVE</span>
                                )}
                                {isItemLocked && (
                                  <div className="relative group/badge inline-flex">
                                    <span
                                      className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 font-extrabold rounded flex items-center gap-0.5 cursor-pointer"
                                      title={lockStatus.tooltip}
                                    >
                                      <Lock size={9} /> LOCKED
                                    </span>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/badge:flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-medium rounded-md shadow-xl z-50 pointer-events-none whitespace-nowrap border border-gray-700">
                                      <Lock size={10} className="text-amber-400 shrink-0" />
                                      <span>{lockStatus.tooltip}</span>
                                    </div>
                                  </div>
                                )}
                                {item.type === 'final_assessment' && isFinalAssessmentUnlocked && !item.completed && (
                                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-extrabold rounded">
                                    READY
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Submodules rendering */}
                      {mod.submodules.map((sub: any) => (
                        <div key={sub.id} className="mt-2 mb-1">
                          <div className="px-4 py-2 bg-gradient-to-r from-[#122340]/8 to-[#122340]/4 border-y border-[#122340]/8 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-3.5 bg-[#C9A227] rounded-full"></div>
                              <h5 className="font-extrabold text-[#122340] text-[11px] uppercase tracking-wider">{sub.title}</h5>
                            </div>
                          </div>
                          <div className="bg-white/50">
                            {sub.items.map((item: any) => {
                              const isActive = activeItem?.id === item.id;
                              const lockStatus = getItemLockStatus(item);
                              const isItemLocked = lockStatus.isLocked;
                              return (
                                <div
                                  key={item.id}
                                  id={`syllabus-item-${item.id}`}
                                  onClick={() => {
                                    hasUserManuallySelected.current = true;
                                    setActiveItem(item);
                                    setIsVideoEnded(false);
                                  }}
                                  title={lockStatus.tooltip || undefined}
                                  className={`group/item relative flex gap-3 p-3 pl-6 cursor-pointer transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-[#C9A227]/15 via-[#C9A227]/8 to-transparent border-l-4 border-[#C9A227] shadow-[inset_0_0_0_1px_rgba(201,162,39,0.12)]' : 'border-l-4 border-transparent hover:bg-[#122340]/[0.04] hover:border-[#122340]/15'}`}
                                >
                                  {/* Floating tooltip on hover when locked */}
                                  {lockStatus.isLocked && (
                                    <div className="absolute right-3 top-2 hidden group-hover/item:flex items-center gap-1.5 px-2.5 py-1 bg-gray-900/95 text-white text-[10px] font-semibold rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap border border-gray-700/60 animate-in fade-in duration-150">
                                      <Lock size={10} className="text-amber-400 shrink-0" />
                                      <span>{lockStatus.tooltip}</span>
                                    </div>
                                  )}

                                  <div className="mt-0.5 shrink-0 flex items-center justify-center">
                                    {(() => {
                                      const submission = item.type === 'assignment' ? studentSubmissions.find(s => s.assignmentId === item.id) : null;
                                      if (submission?.status === 'rejected') {
                                        return <XCircle size={16} className="text-red-500" />;
                                      }
                                      if (submission?.status === 'pending' || submission?.status === 'resubmitted') {
                                        return <Circle size={16} className="text-green-500" />;
                                      }
                                      if (item.completed) {
                                        return <CheckCircle2 size={16} className="text-green-500" />;
                                      }
                                      if (isItemLocked) {
                                        return <Lock size={16} className="text-amber-500" />;
                                      }
                                      return (
                                        <div className="w-4 h-4 rounded-full border-2 border-[#122340]/20 flex items-center justify-center">
                                          {isActive && <div className="w-1.5 h-1.5 bg-[#C9A227] rounded-full"></div>}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  <div>
                                    <p className={`text-sm ${isActive ? 'font-bold text-[#122340]' : 'font-medium text-[#122340]/80'}`}>
                                      {item.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#122340]/50 mt-1.5">
                                      {isItemLocked ? (
                                        <Lock size={14} className="text-amber-500" />
                                      ) : (
                                        getItemIcon(item.type, isActive, item.completed)
                                      )}
                                      <span className="uppercase tracking-wider">{formatItemType(item.type)}</span>
                                      {item.type === 'live' && item.liveData?.status === 'live' && (
                                        <span className="px-1.5 py-0.2 text-[9px] bg-red-100 text-red-700 font-extrabold rounded-full animate-pulse">LIVE</span>
                                      )}
                                      {isItemLocked && (
                                        <div className="relative group/badge inline-flex">
                                          <span
                                            className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 font-extrabold rounded flex items-center gap-0.5 cursor-pointer"
                                            title={lockStatus.tooltip}
                                          >
                                            <Lock size={9} /> LOCKED
                                          </span>
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/badge:flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-medium rounded-md shadow-xl z-50 pointer-events-none whitespace-nowrap border border-gray-700">
                                            <Lock size={10} className="text-amber-400 shrink-0" />
                                            <span>{lockStatus.tooltip}</span>
                                          </div>
                                        </div>
                                      )}
                                      {item.type === 'final_assessment' && isFinalAssessmentUnlocked && !item.completed && (
                                        <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-extrabold rounded">
                                          READY
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <CertificateCTA
              courseId={currentCourse?.id}
              progress={progress}
              courseSlug={slug}
              onOpenReview={() => setIsReviewModalOpen(true)}
              hasReviewed={Boolean(myReview)}
            />
          </div>
        </div>

      </div>

      {currentCourse?.id && (
        <>
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => {
              setIsReviewModalOpen(false);
              setSelectedRating(undefined);
            }}
            courseIdOrSlug={currentCourse.id}
            courseTitle={currentCourse.title}
            existingReview={myReview}
            initialRating={selectedRating}
            onSuccess={handleReviewSuccess}
          />
          <CourseReviewMilestonePrompt
            courseId={currentCourse.id}
            courseTitle={currentCourse.title}
            progress={progress}
            hasReviewed={Boolean(myReview)}
            onOpenReview={handleOpenReviewWithRating}
          />
        </>
      )}
    </div>
  );
}

function CertificateCTA({
  courseId,
  progress,
  courseSlug,
  onOpenReview,
  hasReviewed,
}: {
  courseId?: string;
  progress: number;
  courseSlug?: string;
  onOpenReview?: () => void;
  hasReviewed?: boolean;
}) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const loadCert = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res: any = await certificateApi.mine();
      const list: Certificate[] = (res?.data ?? res) || [];
      const found = list.find((c) => c.courseId === courseId && c.status === 'issued') || null;
      setCert(found);
      return found;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // If course looks complete but no cert yet, poll every 5s (max 6 tries)
  useEffect(() => {
    if (cert || progress < 100 || !courseId || polling) return;
    setPolling(true);
    let tries = 0;
    const tick = async () => {
      tries += 1;
      const found = await loadCert();
      if (!found && tries < 6) {
        setTimeout(tick, 5000);
      } else {
        setPolling(false);
      }
    };
    setTimeout(tick, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, cert, courseId]);

  const [downloading, setDownloading] = useState(false);

  const formatFilename = (ext: 'pdf' | 'png' = 'pdf') => {
    const sanitize = (str?: string) =>
      (str || '')
        .trim()
        .replace(/[\/\\:*?"<>|]/g, '')
        .replace(/\s+/g, '_');
    const student = sanitize(cert?.studentName || 'Student');
    const course = sanitize(cert?.courseName || 'Course');
    return `${student}_${course}.${ext}`;
  };

  const handleDownload = async () => {
    if (!cert?.pdfUrl || downloading) return;
    setDownloading(true);
    const filename = formatFilename('pdf');
    try {
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(cert.pdfUrl)}&filename=${encodeURIComponent(filename)}`;
      let res: Response;
      try {
        res = await fetch(cert.pdfUrl, { mode: 'cors' });
        if (!res.ok) throw new Error('Direct fetch failed');
      } catch {
        res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(cert.pdfUrl)}&filename=${encodeURIComponent(filename)}`;
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast('Starting PDF download...', { icon: '📥' });
    } finally {
      setDownloading(false);
    }
  };

  if (!courseId) return null;

  // Case 1: certificate exists → show download/view
  if (cert) {
    return (
      <div className="m-4 p-5 rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1a2f4d] border-2 border-[#C9A227] shadow-lg text-white">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#C9A227]/20 flex items-center justify-center shrink-0">
            <Award size={20} className="text-[#C9A227]" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm text-[#C9A227] uppercase tracking-wider">Certificate Issued</p>
            <p className="text-white/80 text-xs mt-0.5 font-mono truncate">{cert.certificateId}</p>
          </div>
        </div>
        <p className="text-white/70 text-xs leading-relaxed mb-4">
          Congratulations — you have completed this course. Your verified certificate is ready to download and share.
        </p>
        <div className="flex flex-col gap-2">
          <button
            id="cert-download-btn"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-[#C9A227] text-[#122340] py-2.5 rounded-lg text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:brightness-110 transition cursor-pointer disabled:opacity-75"
          >
            {downloading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Downloading...
              </>
            ) : (
              <>
                <Download size={16} /> Download Certificate
              </>
            )}
          </button>
          <Link
            href="/dashboard/certificates"
            className="w-full border border-white/20 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition"
          >
            <ExternalLink size={16} /> View in My Credentials
          </Link>
          {onOpenReview && (
            <button
              onClick={onOpenReview}
              className="w-full border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#C9A227] py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#C9A227]/20 transition cursor-pointer"
            >
              <Star size={16} className="fill-[#C9A227]" /> {hasReviewed ? "Edit Your Review" : "Rate & Review Course"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Case 2: 100% but not yet generated → generating state
  if (progress >= 100) {
    return (
      <div className="m-4 p-5 rounded-2xl bg-[#C9A227]/5 border-2 border-dashed border-[#C9A227]/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#C9A227]/10 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-[#C9A227] animate-pulse" />
          </div>
          <div>
            <p className="font-black text-sm text-[#122340] uppercase tracking-wider">Certificate Generating</p>
            <p className="text-[#122340]/60 text-xs mt-0.5">Should be ready in a few seconds…</p>
          </div>
        </div>
        <p className="text-[#122340]/60 text-xs leading-relaxed">
          We are preparing your verified certificate. This page will update automatically.
        </p>
        <button
          onClick={loadCert}
          disabled={loading}
          className="mt-3 text-xs font-bold text-[#C9A227] hover:underline"
        >
          {loading ? 'Checking…' : 'Refresh now'}
        </button>
      </div>
    );
  }

  // Case 3: still in progress → subtle hint
  return (
    <div className="m-4 p-4 rounded-2xl bg-[#122340]/5 border border-[#122340]/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#122340]/10 flex items-center justify-center shrink-0">
          <Lock size={14} className="text-[#122340]/50" />
        </div>
        <div>
          <p className="font-bold text-xs text-[#122340]">Certificate Locked</p>
          <p className="text-[#122340]/50 text-[11px] mt-0.5">
            Complete the course and pass the final assessment to unlock.
          </p>
        </div>
      </div>
    </div>
  );
}
