"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, PlayCircle, CheckCircle2, FileText, MessageSquare, Download,
  Play, Pause, Maximize, Volume2, SkipForward, Video, ClipboardList, Award,
  CheckSquare, UploadCloud, Clock, ExternalLink, XCircle, Circle, FileQuestion, GraduationCap
} from 'lucide-react';
import AssessmentPlayer from './AssessmentPlayer';

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
import { clearCurrentCourse } from '@/data/features/academy/course/courseSlice';
import { updateCourseProgress, fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';
import { Loader2 } from 'lucide-react';
import { uploadToS3 } from '@/lib/uploadToS3';
import apiClient from '@/data/services/apiConfig/apiClient';
import toast from 'react-hot-toast';

export default function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug?.toLowerCase() || '';

  const dispatch = useAppDispatch();
  const { currentCourse, isLoading, error } = useAppSelector((state) => state.course);

  // We can fetch enrollments to get progress, but for now we'll just use a default or calculate from completed items if backend supports it.
  const { myEnrollments } = useAppSelector((state) => state.enrollments);
  const { user } = useAppSelector((state) => state.auth);
  const currentEnrollment = myEnrollments.find(e => e.course?.slug === slug);
  
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);

  const fetchMySubmissions = async () => {
    if (!currentCourse?.id) return;
    try {
      const studentId = (user as any)?.id || 'mock-student-id';
      const res = await apiClient.get('/academy/assignments/me', {
        params: { studentId: studentId, courseId: currentCourse.id }
      });
      setStudentSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, [(user as any)?.id, currentCourse?.id]);

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
    const validCompletedItemIds = new Set(currentEnrollment.completedItemIds || []);
    studentSubmissions.forEach(sub => {
      if (sub.status === 'verified') {
        validCompletedItemIds.add(sub.assignmentId);
      } else if (sub.status === 'rejected') {
        validCompletedItemIds.delete(sub.assignmentId);
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

  const [activeTab, setActiveTab] = useState('qa');
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [activeItem, setActiveItem] = useState<any>(null);

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
            id: item.id || Math.random().toString(),
            type: item.type || 'video',
            title: item.title,
            duration: formatItemDuration(item.duration),
            fileUrl: item.type === 'assignment' ? (item.assignmentData?.instructionsPdfUrl || item.fileUrl) : item.fileUrl,
            assessmentId: item.assignmentData?.assessmentId,
            orderIndex: item.orderIndex || 0,
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

  useEffect(() => {
    if (mappedCourseData && mappedCourseData.modules.length > 0) {
      // Flatten all items to find the correct starting point or update existing
      const allItems: any[] = [];
      mappedCourseData.modules.forEach((m: any) => {
        if (m.items) allItems.push(...m.items);
        if (m.submodules) {
          m.submodules.forEach((sub: any) => {
            if (sub.items) allItems.push(...sub.items);
          });
        }
      });

      if (!activeItem) {
        if (allItems.length > 0) {
          // Find the first uncompleted item
          const firstUncompleted = allItems.find(item => !item.completed);
          
          // Open it, or if everything is completed, open the last item
          setActiveItem(firstUncompleted || allItems[allItems.length - 1]);
          setIsVideoEnded(false);
        } else {
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
      } else {
        // If activeItem already exists, just update it with the latest data from mappedCourseData
        const latestActiveItem = allItems.find(item => item.id === activeItem.id);
        if (latestActiveItem && latestActiveItem.completed !== activeItem.completed) {
          setActiveItem(latestActiveItem);
        }
      }
    }
  }, [mappedCourseData, activeItem]);

  if (isLoading || !mappedCourseData) {
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

  // We use fixed positioning to overlay on top of the global Academy Navbar/Footer 
  // to create a true distraction-free learning environment.
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans animate-in fade-in duration-500">

      {/* ── TOP BAR ── */}
      <div className="h-16 bg-[#0a1628] text-white flex items-center justify-between px-4 shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div className="hidden sm:block h-6 w-px bg-white/20"></div>
          <h1 className="font-bold text-sm sm:text-base truncate max-w-md">{COURSE_DATA.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 mr-4">
            <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">Your Progress</span>
            <div className="w-32 bg-white/20 rounded-full h-2">
              <div className="bg-[#C9A227] h-2 rounded-full" style={{ width: `${COURSE_DATA.progress}%` }}></div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#C9A227] flex items-center justify-center font-bold text-sm text-[#0a1628]">
            SK
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">

        {/* LEFT COLUMN: Dynamic Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fcfcfa]">

          {/* Dynamic Render based on item type */}
          {activeItem.type === 'video' && (
            <div className="mt-2 sm:mt-4 mx-auto w-[95%] max-w-5xl relative flex flex-col shrink-0 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#122340]/10 bg-black">
              <div className="bg-white border-b border-[#122340]/10 p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C9A227]/10 text-[#C9A227] rounded-full flex items-center justify-center">
                    <Video size={20} />
                  </div>
                  <h2 className="font-bold text-[#122340] text-lg">{activeItem.title}</h2>
                </div>
                <div className="flex gap-2">
                  {activeItem.completed ? (
                    <div className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 cursor-default select-none">
                      <CheckCircle2 size={16} /> Completed
                    </div>
                  ) : activeItem.fileUrl ? (
                    <button 
                      onClick={() => handleMarkAsComplete(activeItem.id)}
                      disabled={isMarkingComplete}
                      className="bg-[#C9A227] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#b08d20] hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
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
                          className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer"
                          onClick={() => videoRef.current?.play()}
                        >
                          <div className="w-20 h-20 bg-[#C9A227]/90 rounded-full flex items-center justify-center shadow-2xl transition-transform transform scale-100 hover:scale-110">
                            <Play className="text-[#0a1628] ml-2" size={40} fill="currentColor" />
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
            <div className="mt-6 sm:mt-8 mx-auto w-[95%] max-w-5xl bg-[#f8f9fa] max-h-[700px] h-[700px] relative flex flex-col shrink-0 rounded-2xl overflow-hidden shadow-sm border border-[#122340]/10">
              {activeItem.fileUrl ? (
                <>
                  <div className="bg-white border-b border-[#122340]/10 p-4 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#C9A227]/10 text-[#C9A227] rounded-full flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <h2 className="font-bold text-[#122340] text-lg">{activeItem.title}</h2>
                      </div>
                      <div className="flex gap-2">
                        {activeItem.completed ? (
                          <div 
                            className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 cursor-default select-none"
                          >
                            <CheckCircle2 size={16} /> 
                            Completed
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleMarkAsComplete(activeItem.id)}
                            disabled={isMarkingComplete}
                            className="bg-[#C9A227] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#b08d20] hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {isMarkingComplete ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 
                            Mark as Complete
                          </button>
                        )}
                        <button 
                          onClick={(e) => activeItem.fileUrl && handleDownload(e, activeItem.fileUrl, activeItem.title)}
                          disabled={isDownloading}
                          className="bg-[#122340] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#0a1628] hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-6 sm:mt-8 mx-auto w-[95%] max-w-5xl bg-gradient-to-br from-[#122340] to-[#0a1628] max-h-[500px] aspect-video relative flex flex-col items-center justify-center shrink-0 text-white p-8 text-center rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#122340]/10">
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                Live Session
              </div>
              <Video size={64} className="text-[#C9A227] mb-6 opacity-80" />
              <h2 className="text-3xl font-extrabold mb-2">{activeItem.title}</h2>
              <p className="text-blue-100/70 mb-8 flex items-center justify-center gap-2">
                <Clock size={16} /> Scheduled for {activeItem.duration}
              </p>
              <button className="bg-[#C9A227] text-[#0a1628] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                Join via Google Meet <ExternalLink size={18} />
              </button>
            </div>
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
                  className={`w-full max-w-md bg-white border-2 border-dashed ${
                    activeSubmission?.status === 'verified' || activeSubmission?.status === 'pending' || activeSubmission?.status === 'resubmitted' || (activeItem.completed && !activeSubmission)
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
                      <p className="text-xs text-red-600/70 mt-4 flex items-center justify-center gap-1"><UploadCloud size={14}/> Click to re-upload your assignment</p>
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

          {(activeItem.type === 'test' || activeItem.type === 'final_assessment' || activeItem.type === 'assessment') && (() => {
            console.log('activeItem', activeItem);
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
                <button className="bg-[#C9A227] text-[#0a1628] px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <Download size={18} /> Download Certificate
                </button>
              ) : (
                <button disabled className="bg-[#122340] border border-white/10 text-white/50 px-10 py-4 rounded-xl font-bold transition-all flex items-center gap-2">
                  <Download size={18} /> Certificate Locked
                </button>
              )}
            </div>
          )}

          {/* Content Tabs Below Media Area */}
          <div className="p-6 md:p-10 max-w-4xl w-full mx-auto pb-32">

            <h2 className="text-2xl font-bold text-[#122340] mb-6">{activeItem.title}</h2>

            <div className="flex border-b border-[#122340]/10 mb-8 overflow-x-auto">
              <button
                className="px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 border-[#C9A227] text-[#C9A227]"
              >
                <MessageSquare size={16} /> Q&A
              </button>
            </div>

            <div className="text-[#122340]/80 leading-relaxed">
              <div className="space-y-6">
                <div className="bg-white border border-[#122340]/10 p-4 rounded-lg flex gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-[#122340] shrink-0">JD</div>
                  <div className="w-full">
                    <textarea placeholder="Ask a new question about this specific item..." className="w-full border-none outline-none resize-none bg-transparent" rows={2}></textarea>
                    <div className="flex justify-end border-t border-[#122340]/5 pt-2 mt-2">
                      <button className="bg-[#122340] text-white px-4 py-1.5 rounded text-xs font-bold">Post Question</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Sequential Syllabus Accordion */}
        <div className="w-full lg:w-96 bg-white border-l border-[#122340]/10 h-full flex flex-col shrink-0 relative z-10 shadow-xl lg:shadow-none">
          <div className="p-4 border-b border-[#122340]/10 bg-[#122340]/[0.02]">
            <h3 className="font-bold text-[#122340]">Course Syllabus</h3>
          </div>

          <div className="overflow-y-auto flex-grow pb-20">
            {COURSE_DATA.modules.map((mod, i) => (
              <div key={i} className="border-b border-[#122340]/10">
                <button
                  onClick={() => setOpenModule(openModule === i ? null : i)}
                  className="w-full p-4 flex justify-between items-start text-left bg-white hover:bg-[#122340]/[0.02] transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-[#122340] text-sm mb-1 pr-4 leading-tight">{mod.title}</h4>
                    <p className="text-xs text-[#122340]/50">
                      {mod.items.filter((item: any) => item.completed).length + mod.submodules.reduce((acc: number, sub: any) => acc + sub.items.filter((item: any) => item.completed).length, 0)} / {mod.items.length + mod.submodules.reduce((acc: number, sub: any) => acc + sub.items.length, 0)} Completed
                    </p>
                  </div>
                </button>

                {openModule === i && (
                  <div className="bg-[#122340]/[0.02] py-2">
                    {/* Root Level Items */}
                    {mod.items.map((item: any) => {
                      const isActive = activeItem.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => { setActiveItem(item); setIsVideoEnded(false); }}
                          className={`flex gap-3 p-3 pl-4 cursor-pointer hover:bg-[#122340]/5 transition-colors ${isActive ? 'bg-[#C9A227]/10 border-l-4 border-[#C9A227]' : 'border-l-4 border-transparent'}`}
                        >
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
                                    {getItemIcon(item.type, isActive, item.completed)}
                                    <span className="uppercase tracking-wider">{formatItemType(item.type)}</span>
                                  </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Submodules rendering */}
                    {mod.submodules.map((sub: any) => (
                      <div key={sub.id} className="mt-2 mb-1">
                        <div className="px-4 py-2 bg-[#122340]/5 border-y border-[#122340]/5 flex items-center justify-between">
                          <h5 className="font-bold text-[#122340] text-xs uppercase tracking-wider">{sub.title}</h5>
                        </div>
                        <div className="bg-white/50">
                          {sub.items.map((item: any) => {
                            const isActive = activeItem.id === item.id;
                            return (
                              <div
                                key={item.id}
                                onClick={() => { setActiveItem(item); setIsVideoEnded(false); }}
                                className={`flex gap-3 p-3 pl-6 cursor-pointer hover:bg-[#122340]/5 transition-colors ${isActive ? 'bg-[#C9A227]/10 border-l-4 border-[#C9A227]' : 'border-l-4 border-transparent'}`}
                              >
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
                                    {getItemIcon(item.type, isActive, item.completed)}
                                    <span className="uppercase tracking-wider">{formatItemType(item.type)}</span>
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
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
