"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Save, Video, Link as LinkIcon, FileText, CheckCircle, UploadCloud, Loader2, RefreshCw, Users, Tv, Mic, Shield, Calendar, Clock, Film, PlayCircle, ExternalLink, Key, Plus } from "lucide-react";
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import Dashboard from '@uppy/react/dashboard';
import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import apiClient from "@/data/services/apiConfig/apiClient";
import toast from "react-hot-toast";
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { uploadToS3 } from "@/lib/uploadToS3";
import { formatTime12HourIST } from "@/lib/utils";
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

type CurriculumItem = {
  id: string;
  type: "video" | "document" | "live" | "assignment" | "test" | "final_assessment";
  title: string;
  orderIndex: number;
  moduleId: string;
  provider?: string;
  fileUrl?: string;
  duration?: number;
  content?: string;
  assignmentData?: { totalMarks?: number; passingMarks?: number; instructionsPdfUrl?: string; assessmentId?: string; };
  liveData?: {
    platform?: 'jitsi' | 'youtube' | 'gmeet' | 'zoom';
    status?: 'scheduled' | 'live' | 'completed';
    scheduledDate?: string;
    scheduledTime?: string;
    durationMinutes?: number;
    jitsiRoomId?: string;
    jitsiPassword?: string;
    youtubeUrl?: string;
    meetingUrl?: string;
    passcode?: string;
    recordingUrl?: string;
    startedAt?: string;
    endedAt?: string;
  };
};

export default function ContentEditorDrawer({
  item,
  courseId,
  isOpen,
  onClose,
  onSave
}: {
  item: CurriculumItem | null;
  courseId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"upload" | "external" | "assignment" | "assessment" | "live" | "recording">("upload");
  const [externalUrl, setExternalUrl] = useState(item?.fileUrl || "");
  const [localFileUrl, setLocalFileUrl] = useState(item?.fileUrl || "");
  const [localProvider, setLocalProvider] = useState(item?.provider || "");
  const [isSaving, setIsSaving] = useState(false);
  const isConcluded = item?.liveData?.status === "completed";
  
  // Live session specific state - strictly empty by default so new items are "not_scheduled"
  const [liveData, setLiveData] = useState<any>({
    platform: "",
    status: "not_scheduled",
    scheduledDate: "",
    scheduledTime: "",
    durationMinutes: 60,
    jitsiRoomId: "",
    jitsiPassword: "",
    youtubeUrl: "",
    meetingUrl: "",
    passcode: "",
    recordingUrl: "",
  });

  // Assignment specific state
  const [assignmentData, setAssignmentData] = useState<any>(item?.assignmentData || { totalMarks: 100, passingMarks: 50, instructionsPdfUrl: "", assessmentId: "" });
  const [assessments, setAssessments] = useState<any[]>([]);

  const fetchAssessments = () => {
    const params: any = { t: Date.now() };
    if (courseId) {
      params.courseId = courseId;
    }
    apiClient.get('/academy/assessments', { params })
    .then(res => {
      console.log('fetchAssessments res.data:', res.data);
      const data = res.data?.data || res.data;
      if(Array.isArray(data)) {
        setAssessments(data);
      } else {
        console.warn('fetchAssessments data is not an array:', data);
      }
    })
    .catch(err => console.error("Failed to fetch assessments", err));
  };

  useEffect(() => {
    if (activeTab === "assessment" && isOpen) {
      fetchAssessments();
    }
  }, [activeTab, isOpen]);

  // Sync external url state when item changes
  useEffect(() => {
    if (item?.fileUrl) {
      setExternalUrl(item.fileUrl);
      setLocalFileUrl(item.fileUrl);
    } else {
      setExternalUrl("");
      setLocalFileUrl("");
    }
    
    if (item?.provider) {
      setLocalProvider(item.provider);
    } else {
      setLocalProvider("");
    }

    if (item?.assignmentData) {
      setAssignmentData(item.assignmentData);
    } else {
      setAssignmentData({ totalMarks: 100, passingMarks: 50, instructionsPdfUrl: "" });
    }

    if (item?.liveData) {
      const hasDateTime = Boolean(item.liveData.scheduledDate && item.liveData.scheduledTime);
      const isConcluded = item.liveData.status === "completed";
      setLiveData({
        platform: item.liveData.platform || "",
        status: isConcluded ? "completed" : hasDateTime ? "scheduled" : "not_scheduled",
        scheduledDate: item.liveData.scheduledDate || "",
        scheduledTime: item.liveData.scheduledTime || "",
        durationMinutes: item.liveData.durationMinutes || 60,
        jitsiRoomId: (item.liveData.jitsiRoomId || `sajjad-husain-legal-academy-live-${(item.id || '').replace(/-/g, '').slice(0, 8)}`).replace(/^legalacademy-live-/, 'sajjad-husain-legal-academy-live-'),
        jitsiPassword: item.liveData.jitsiPassword || "",
        youtubeUrl: item.liveData.youtubeUrl || (item.provider === 'youtube' ? item.fileUrl : "") || "",
        meetingUrl: item.liveData.meetingUrl || (['gmeet', 'zoom'].includes(item.provider || '') ? item.fileUrl : "") || "",
        passcode: item.liveData.passcode || "",
        recordingUrl: item.liveData.recordingUrl || "",
      });
    } else if (item?.type === 'live') {
      const cleanId = (item.id || '').replace(/-/g, '').slice(0, 8);
      setLiveData({
        platform: "",
        status: "not_scheduled",
        scheduledDate: "",
        scheduledTime: "",
        durationMinutes: 60,
        jitsiRoomId: `sajjad-husain-legal-academy-live-${cleanId}-${Math.floor(1000 + Math.random() * 9000)}`,
        jitsiPassword: "",
        youtubeUrl: "",
        meetingUrl: "",
        passcode: "",
        recordingUrl: "",
      });
    }
    
    if (item?.type === 'assignment') {
      setActiveTab("assignment");
    } else if (item?.type === 'test' || item?.type === 'final_assessment') {
      setActiveTab("assessment");
    } else if (item?.type === 'live') {
      setActiveTab(item.liveData?.status === "completed" ? "recording" : "live");
    } else if (item?.provider === 'youtube' || item?.provider === 'gmeet') {
      setActiveTab("external");
    } else {
      setActiveTab("upload");
    }
  }, [item?.id]);

  const [uppy, setUppy] = useState<Uppy | null>(null);

  // Setup Uppy for S3 Multipart (Resumable chunking)
  useEffect(() => {
    if (!item) return;

    let allowedFileTypes: string[] | undefined = undefined;
    if (item.type === 'document' || item.type === 'assignment') {
      allowedFileTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', 'image/*'];
    } else if (item.type === 'video' || item.type === 'live') {
      allowedFileTypes = ['video/*'];
    }

    const u = new Uppy({
      id: 'uppy-s3',
      autoProceed: false,
      restrictions: { 
        maxNumberOfFiles: 1,
        allowedFileTypes 
      },
    });

    u.use(AwsS3, {
      shouldUseMultipart: true,
      limit: 4,
      retryDelays: [0, 1000, 3000, 5000],
      createMultipartUpload: async (file: any) => {
        const res = await apiClient.post('/academy/s3/multipart', {
          filename: file.name,
          type: file.type
        });
        return res.data; // { uploadId, key }
      },
      signPart: async (file: any, partData: any) => {
        const { uploadId, key, partNumber } = partData;
        const res = await apiClient.get(`/academy/s3/multipart/${uploadId}/${partNumber}?key=${encodeURIComponent(key)}`);
        return res.data; // { url }
      },
      listParts: async (file: any, { uploadId, key }: any) => {
        const res = await apiClient.get(`/academy/s3/multipart/${uploadId}?key=${encodeURIComponent(key)}`);
        return res.data; // []
      },
      completeMultipartUpload: async (file: any, { uploadId, key, parts }: any) => {
        const res = await apiClient.post(`/academy/s3/multipart/${uploadId}/complete?key=${encodeURIComponent(key)}`, { parts });
        return res.data; // { location }
      },
      abortMultipartUpload: async (file: any, { uploadId, key }: any) => {
        await apiClient.delete(`/academy/s3/multipart/${uploadId}?key=${encodeURIComponent(key)}`);
      }
    });

    u.on('upload-success', async (file, response) => {
      // Auto-save the item when upload completes
      const s3Url = response.uploadURL || response.body?.location;
      if (s3Url && item) {
        if (item.type === 'assignment') {
          setAssignmentData((prev: any) => ({ ...prev, instructionsPdfUrl: s3Url }));
          toast.promise(
            onSave(item.id, { assignmentData: { ...(item.assignmentData || { totalMarks: 100, passingMarks: 50 }), instructionsPdfUrl: s3Url } }),
            {
              loading: 'Saving assignment...',
              success: 'Assignment saved successfully!',
              error: 'Failed to save assignment'
            }
          );
        } else if (item.type === 'live') {
          setLiveData((prev: any) => ({ ...prev, recordingUrl: s3Url, status: 'completed' }));
          setLocalFileUrl(s3Url);
          setLocalProvider('s3');
          toast.promise(
            onSave(item.id, {
              provider: 's3',
              fileUrl: s3Url,
              liveData: {
                ...(item.liveData || {}),
                recordingUrl: s3Url,
                status: 'completed',
              }
            }),
            {
              loading: 'Saving class recording...',
              success: 'Class recording uploaded and saved successfully!',
              error: 'Failed to save recording'
            }
          );
        } else {
          setLocalFileUrl(s3Url);
          setLocalProvider('s3');
          toast.promise(
            onSave(item.id, { provider: 's3', fileUrl: s3Url }),
            {
              loading: 'Saving content link...',
              success: 'Content saved successfully!',
              error: 'Failed to save content link'
            }
          );
        }
      }
    });

    setUppy(u);

    return () => {
      u.destroy();
    };
  }, [item?.id, onSave]); // Re-init if item changes

  if (!isOpen || !item) return null;

  const handleSaveExternal = async () => {
    if (!externalUrl.trim()) return toast.error("Please enter a valid URL");
    
    let provider = "link";
    if (externalUrl.includes("youtube.com") || externalUrl.includes("youtu.be")) provider = "youtube";
    else if (externalUrl.includes("meet.google.com")) provider = "gmeet";

    if (item.type === 'video' && provider !== 'youtube') {
      return toast.error("Only YouTube links are allowed for external videos.");
    }

    setIsSaving(true);
    try {
      await onSave(item.id, { provider, fileUrl: externalUrl });
      setLocalFileUrl(externalUrl);
      setLocalProvider(provider);
      toast.success("External link saved!");
      onClose();
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLive = async () => {
    if (isConcluded) {
      return toast.error("This class has already been conducted. Schedule and platform cannot be changed.");
    }

    const isScheduled = Boolean(liveData.scheduledDate?.trim() && liveData.scheduledTime?.trim());
    const computedStatus = isScheduled ? "scheduled" : "not_scheduled";

    setIsSaving(true);
    try {
      const fileUrl =
        liveData.platform === "youtube"
          ? liveData.youtubeUrl?.trim()
          : (liveData.platform === "gmeet" || liveData.platform === "zoom")
          ? liveData.meetingUrl?.trim()
          : (liveData.recordingUrl || "");

      const payload = {
        provider: liveData.platform || null,
        fileUrl,
        duration: (liveData.durationMinutes || 60) * 60,
        liveData: {
          ...liveData,
          status: computedStatus,
          meetingUrl: liveData.meetingUrl?.trim() || "",
          passcode: liveData.passcode?.trim() || "",
          jitsiRoomId: (liveData.jitsiRoomId || `sajjad-husain-legal-academy-live-${(item.id || '').replace(/-/g, '').slice(0, 8)}`).replace(/^legalacademy-live-/, 'sajjad-husain-legal-academy-live-'),
          jitsiPassword: liveData.jitsiPassword?.trim() || "",
        }
      };
      await onSave(item.id, payload);
      setLocalProvider(liveData.platform || "");
      setLocalFileUrl(payload.fileUrl || "");
      toast.success(isScheduled ? "Live class scheduled successfully!" : "Live class saved (not scheduled).");
      onClose();
    } catch (e) {
      toast.error("Failed to save live class settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRecording = async () => {
    if (!liveData.recordingUrl?.trim()) {
      return toast.error("Please enter a video URL or upload an MP4 recording");
    }
    setIsSaving(true);
    try {
      const isYT = liveData.platform === "youtube" || liveData.recordingUrl.includes("youtube") || liveData.recordingUrl.includes("youtu.be");
      const provider = isYT ? "youtube" : (liveData.recordingUrl.includes("s3") || liveData.recordingUrl.includes("amazonaws") ? "s3" : "external");
      const payload = {
        provider,
        fileUrl: liveData.recordingUrl.trim(),
        liveData: {
          ...(item?.liveData || {}),
          ...liveData,
          status: "completed",
          recordingUrl: liveData.recordingUrl.trim(),
        }
      };
      await onSave(item.id, payload);
      setLocalProvider(provider);
      setLocalFileUrl(payload.fileUrl);
      toast.success("Class recording saved & published!");
      onClose();
    } catch (e) {
      toast.error("Failed to save recording");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[9000] backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit {item.type}</h2>
            <p className="text-sm text-gray-500 mt-1 truncate max-w-[300px]">{item.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Tabs */}
          {item.type === 'live' ? (
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab("live")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition ${activeTab === 'live' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Video size={16} /> Live Class Setup
              </button>
              <button
                onClick={() => setActiveTab("recording")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition ${activeTab === 'recording' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Film size={16} /> Class Recording
              </button>
            </div>
          ) : item.type !== 'assignment' && item.type !== 'test' && item.type !== 'final_assessment' && (
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 flex min-w-max px-4 items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition ${activeTab === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {item.type === 'document' ? <FileText size={16} /> : <Video size={16} />} Upload from Device
              </button>
              {item.type !== 'document' && (
                <button
                  onClick={() => setActiveTab("external")}
                  className={`flex-1 flex min-w-max px-4 items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition ${activeTab === 'external' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LinkIcon size={16} /> YouTube / Web Link
                </button>
              )}
            </div>
          )}

          {/* Current Saved Info */}
          {localFileUrl && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-green-900">Content already saved</p>
                  <p className="text-xs text-green-700 mt-1 truncate max-w-[380px]">Type: {localProvider === 's3' ? 'Direct Upload' : localProvider}</p>
                </div>
              </div>
              
              {/* Preview */}
              {item.type === 'video' && (localProvider === 'youtube' || localFileUrl.includes('youtube') || localFileUrl.includes('youtu.be')) ? (
                <div className="aspect-video w-full mt-2 rounded-lg overflow-hidden bg-black shadow-sm border border-gray-900/10">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={localFileUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              ) : item.type === 'video' && localProvider === 's3' ? (
                <div className="aspect-video w-full mt-2 rounded-lg overflow-hidden bg-black shadow-sm border border-gray-900/10">
                  <video controls className="w-full h-full">
                    <source src={localFileUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : item.type === 'document' && localFileUrl.toLowerCase().endsWith('.pdf') ? (
                <div className="w-full h-[400px] mt-2 rounded-lg overflow-hidden border border-gray-900/10 bg-gray-100">
                  <object data={localFileUrl} type="application/pdf" width="100%" height="100%">
                    <p className="p-4 text-sm text-gray-500">Preview not available. <a href={localFileUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Download PDF</a></p>
                  </object>
                </div>
              ) : item.type === 'document' && (localFileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) != null) ? (
                 <div className="w-full mt-2 rounded-lg overflow-hidden border border-gray-900/10 bg-gray-100 flex items-center justify-center p-2">
                   <img src={localFileUrl} alt="Document Preview" className="max-w-full max-h-[400px] object-contain" />
                 </div>
              ) : (
                <a href={localFileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-block truncate max-w-[380px]">{localFileUrl}</a>
              )}
            </div>
          )}

          {/* S3 Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {item.type === 'document' ? (
                  <>Upload notes, PDFs, presentations, or image files directly from your device.</>
                ) : (
                  <>Upload large video files securely from your device. This uses <span className="font-semibold">Resumable Chunking</span>—if you lose connection, it will resume exactly where it left off!</>
                )}
              </p>
              {uppy && <Dashboard uppy={uppy} width="100%" height={350} proudlyDisplayPoweredByUppy={false} />}
            </div>
          )}

          {/* External URL Tab */}
          {activeTab === "external" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Paste a YouTube video link, Google Meet invite link, or external form link.
              </p>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL Link</label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={e => setExternalUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://meet.google.com/..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <button
                onClick={handleSaveExternal}
                disabled={isSaving}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
              >
                <Save size={18} /> {isSaving ? "Saving..." : "Save External Link"}
              </button>
            </div>
          )}

          {/* Live Class Setup Tab */}
          {activeTab === "live" && item.type === "live" && (
            <div className="space-y-6">
              {/* Conducted Class Locked Alert */}
              {isConcluded && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Class Conducted (Locked)</h4>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      This live session has already been conducted and concluded. Platform, date, and schedule settings are permanently locked.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("recording")}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                    >
                      <Film size={14} /> Go to Class Recording Tab
                    </button>
                  </div>
                </div>
              )}

              {/* Platform Selector Cards */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Select Live Platform</label>
                <p className="text-xs text-gray-500 mb-4">Choose the hosting platform best suited for your class format:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Jitsi Meet Option */}
                  <div
                    onClick={() => !isConcluded && setLiveData((prev: any) => ({ ...prev, platform: "jitsi" }))}
                    className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isConcluded ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    } ${
                      liveData.platform === "jitsi" 
                        ? "border-blue-600 bg-blue-50/50 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${liveData.platform === "jitsi" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                            <Users size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs">Jitsi Classroom</h4>
                            <span className="text-[10px] font-semibold text-blue-600">In-App Virtual Room</span>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-green-100 text-green-700 rounded-full">In-App</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-tight">
                        Integrated classroom with student webcams, mics, screen sharing & waiting room.
                      </p>
                    </div>
                  </div>

                  {/* Google Meet Option */}
                  <div
                    onClick={() => !isConcluded && setLiveData((prev: any) => ({ ...prev, platform: "gmeet" }))}
                    className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isConcluded ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    } ${
                      liveData.platform === "gmeet" 
                        ? "border-emerald-600 bg-emerald-50/50 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${liveData.platform === "gmeet" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                            <Video size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs">Google Meet</h4>
                            <span className="text-[10px] font-semibold text-emerald-600">Opens in New Tab</span>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded-full">Popular</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-tight">
                        Host on Google Meet. Students open meeting link in a new tab. Works on all devices.
                      </p>
                    </div>
                  </div>

                  {/* Zoom Meeting Option */}
                  <div
                    onClick={() => !isConcluded && setLiveData((prev: any) => ({ ...prev, platform: "zoom" }))}
                    className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isConcluded ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    } ${
                      liveData.platform === "zoom" 
                        ? "border-sky-600 bg-sky-50/50 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${liveData.platform === "zoom" ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                            <Video size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs">Zoom Meeting</h4>
                            <span className="text-[10px] font-semibold text-sky-600">Opens in New Tab</span>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-sky-100 text-sky-700 rounded-full">Direct Link</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-tight">
                        Host on Zoom with optional meeting passcode. Students launch in a new tab.
                      </p>
                    </div>
                  </div>

                  {/* YouTube Live Option */}
                  <div
                    onClick={() => !isConcluded && setLiveData((prev: any) => ({ ...prev, platform: "youtube" }))}
                    className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isConcluded ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    } ${
                      liveData.platform === "youtube" 
                        ? "border-red-600 bg-red-50/50 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${liveData.platform === "youtube" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                            <Tv size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs">YouTube Live</h4>
                            <span className="text-[10px] font-semibold text-red-600">1-Way Broadcast</span>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded-full">Unlimited</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-tight">
                        Webinar broadcast for large audiences. Automatically records replay to YouTube.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" /> Schedule Timing
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Class Date</label>
                    <input
                      type="date"
                      disabled={isConcluded}
                      value={liveData.scheduledDate || ""}
                      onChange={(e) => setLiveData((prev: any) => ({ ...prev, scheduledDate: e.target.value }))}
                      className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 ${isConcluded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-600">Start Time (IST)</label>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {formatTime12HourIST(liveData.scheduledTime)}
                      </span>
                    </div>
                    <input
                      type="time"
                      disabled={isConcluded}
                      value={liveData.scheduledTime || ""}
                      onChange={(e) => setLiveData((prev: any) => ({ ...prev, scheduledTime: e.target.value }))}
                      className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 ${isConcluded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    disabled={isConcluded}
                    value={liveData.durationMinutes || 60}
                    onChange={(e) => setLiveData((prev: any) => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 ${isConcluded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                  />
                </div>

                {/* Automatic Status Indicator (No manual select dropdown) */}
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Session Status (Auto-managed)</label>
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    {isConcluded ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-bold text-emerald-800">Concluded (Conducted)</span>
                      </>
                    ) : liveData.status === "live" ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                        <span className="text-xs font-bold text-red-700">Live Now (In Session)</span>
                      </>
                    ) : (liveData.scheduledDate && liveData.scheduledTime) ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-bold text-blue-800">Scheduled</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="text-xs font-bold text-amber-800">⏳ Not Scheduled</span>
                        <span className="text-[11px] text-gray-400 ml-auto">Pick date & time to schedule</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Platform Specific Inputs */}
              {liveData.platform === "youtube" ? (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-gray-800">YouTube Live Stream URL</label>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Optional during scheduling</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Paste your unlisted YouTube Live stream link now, or provide it when starting the class:
                  </p>
                  <input
                    type="url"
                    disabled={isConcluded}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={liveData.youtubeUrl || ""}
                    onChange={(e) => setLiveData((prev: any) => ({ ...prev, youtubeUrl: e.target.value }))}
                    className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 ${isConcluded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                  />
                </div>
              ) : liveData.platform === "gmeet" ? (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <Video size={16} className="text-emerald-600" /> Google Meet Link
                      </label>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Optional during scheduling</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Paste your Google Meet link now, or enter it when launching the live class:</p>
                    <input
                      type="url"
                      disabled={isConcluded}
                      placeholder="https://meet.google.com/xxx-yyyy-zzz"
                      value={liveData.meetingUrl || ""}
                      onChange={(e) => setLiveData((prev: any) => ({ ...prev, meetingUrl: e.target.value }))}
                      className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 ${isConcluded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Key size={13} className="text-gray-400" /> Meeting PIN / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={isConcluded}
                      placeholder="e.g. 123 456 789#"
                      value={liveData.passcode || ""}
                      onChange={(e) => setLiveData((prev: any) => ({ ...prev, passcode: e.target.value }))}
                      className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 ${isConcluded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] leading-relaxed">
                    💡 <strong>New Tab Experience:</strong> When you start the class, students and host will open Google Meet in a new browser tab for full native audio, webcam, and screen sharing.
                  </div>
                </div>
              ) : liveData.platform === "zoom" ? (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <Video size={16} className="text-sky-600" /> Zoom Meeting Link
                      </label>
                      <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded">Optional during scheduling</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Paste your Zoom meeting invite URL now, or enter it when launching the live class:</p>
                    <input
                      type="url"
                      disabled={isConcluded}
                      placeholder="https://us02web.zoom.us/j/1234567890?pwd=..."
                      value={liveData.meetingUrl || ""}
                      onChange={(e) => setLiveData((prev: any) => ({ ...prev, meetingUrl: e.target.value }))}
                      className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 ${isConcluded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Key size={13} className="text-gray-400" /> Meeting Passcode (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={isConcluded}
                      placeholder="e.g. 123456 or LegalLaw2026"
                      value={liveData.passcode || ""}
                      onChange={(e) => setLiveData((prev: any) => ({ ...prev, passcode: e.target.value }))}
                      className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-sky-500 ${isConcluded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-800 text-[11px] leading-relaxed">
                    💡 <strong>New Tab Experience:</strong> When you start the class, students and host will open Zoom in a new browser tab for full native meeting capabilities.
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4 bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Shield size={14} className="text-green-600" /> Jitsi Secure Room
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Host Gatekeeper Protected</span>
                  </div>
                  <div className="text-xs font-mono bg-white p-2.5 rounded border border-gray-200 text-gray-600 break-all select-all">
                    {(liveData.jitsiRoomId || `sajjad-husain-legal-academy-live-${(item.id || '').replace(/-/g, '').slice(0, 8)}`).replace(/^legalacademy-live-/, 'sajjad-husain-legal-academy-live-')}
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200/60">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        disabled={isConcluded}
                        checked={Boolean(liveData.jitsiPassword)}
                        onChange={(e) =>
                          setLiveData((prev: any) => ({
                            ...prev,
                            jitsiPassword: e.target.checked ? "LegalLive" + Math.floor(100 + Math.random() * 900) : "",
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-xs font-semibold text-gray-700">Require Room Password (Optional)</span>
                    </label>

                    {Boolean(liveData.jitsiPassword) && (
                      <div className="mt-2">
                        <input
                          type="text"
                          disabled={isConcluded}
                          placeholder="Room Password"
                          value={liveData.jitsiPassword || ""}
                          onChange={(e) =>
                            setLiveData((prev: any) => ({
                              ...prev,
                              jitsiPassword: e.target.value,
                            }))
                          }
                          className={`w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white ${isConcluded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                          Only attendees with this password can enter. Leave unchecked for open enrolled access.
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    💡 Students are held in a waiting room and cannot enter until you click <strong>Start Class</strong>. Students have restricted guest toolbars with no kick or mute powers.
                  </p>
                </div>
              )}

              {isConcluded ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center space-y-2">
                  <p className="text-xs font-semibold text-gray-500">This class has been conducted • Re-scheduling locked</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("recording")}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Film size={15} /> Upload / Link Class Recording
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSaveLive}
                  disabled={isSaving}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
                >
                  <Save size={18} /> {isSaving ? "Saving..." : (liveData.scheduledDate && liveData.scheduledTime) ? "Save & Schedule Live Class" : "Save Lesson"}
                </button>
              )}
            </div>
          )}

          {/* Live Recording Tab */}
          {activeTab === "recording" && item.type === "live" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Class Recording (Replay)</label>
                <p className="text-xs text-gray-500 mb-4">
                  {liveData.platform === "youtube" 
                    ? "YouTube Live automatically saves your recording at the same stream URL. You can also paste an alternative replay link below."
                    : "Upload the recorded MP4 file from Google Meet, Zoom, or Jitsi, or paste a video link so students can replay the class."}
                </p>

                {liveData.recordingUrl ? (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-600 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Recording attached successfully</p>
                        <a href={liveData.recordingUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-block mt-1 truncate max-w-[380px]">
                          {liveData.recordingUrl}
                        </a>
                      </div>
                    </div>

                    {/* Video Player Preview */}
                    <div className="aspect-video w-full mt-2 rounded-lg overflow-hidden bg-black shadow-sm border border-gray-900/10">
                      {(liveData.recordingUrl.includes('youtube') || liveData.recordingUrl.includes('youtu.be')) ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={liveData.recordingUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video controls className="w-full h-full">
                          <source src={liveData.recordingUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>

                    <button
                      onClick={() => setLiveData((prev: any) => ({ ...prev, recordingUrl: "" }))}
                      className="text-xs font-bold text-red-600 hover:text-red-700 self-start bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition"
                    >
                      Replace Recording
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Paste Replay / Recording URL</label>
                      <input
                        type="url"
                        placeholder="https://... (YouTube, S3, Vimeo, etc.)"
                        value={liveData.recordingUrl || ""}
                        onChange={(e) => setLiveData((prev: any) => ({ ...prev, recordingUrl: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-3"
                      />
                    </div>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-bold">Or Upload MP4 to S3</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {uppy && <Dashboard uppy={uppy} width="100%" height={300} proudlyDisplayPoweredByUppy={false} />}
                  </div>
                )}

                <button
                  onClick={handleSaveRecording}
                  disabled={isSaving}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
                >
                  <Save size={18} /> {isSaving ? "Saving..." : "Save Recording"}
                </button>
              </div>
            </div>
          )}

          {/* Assignment Tab */}
          {activeTab === "assignment" && (
            <div className="space-y-6">

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Assignment Document (Instructions & Questions)</label>
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs font-medium mb-4 flex items-start gap-2 border border-yellow-200">
                  <span className="mt-0.5 shrink-0 text-yellow-600">💡</span>
                  <span>Make sure your document includes clear instructions on how the student should complete and submit their assignment.</span>
                </div>
                
                {assignmentData.instructionsPdfUrl ? (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-600 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Document uploaded successfully</p>
                        <a href={assignmentData.instructionsPdfUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-block mt-1 truncate max-w-[380px]">
                          {assignmentData.instructionsPdfUrl}
                        </a>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAssignmentData((prev: any) => ({ ...prev, instructionsPdfUrl: "" }))}
                      className="text-xs font-bold text-red-600 hover:text-red-700 self-start bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition"
                    >
                      Replace Document
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uppy && <Dashboard uppy={uppy} width="100%" height={350} proudlyDisplayPoweredByUppy={false} />}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assessment Tab */}
          {activeTab === "assessment" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Course Assessment</label>
                <div className="bg-purple-50 text-purple-800 p-3.5 rounded-xl text-xs font-medium mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-purple-200">
                  <div className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-purple-600">💡</span>
                    <span>Only assessments specifically created for this course are listed below.</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={fetchAssessments} title="Refresh Assessments" className="p-2 text-purple-600 bg-purple-100/50 hover:bg-purple-200 rounded-lg transition shrink-0 cursor-pointer">
                      <RefreshCw size={16} />
                    </button>
                    <Link
                      href={courseId ? `/admin/academy/tests/create?courseId=${courseId}` : "/admin/academy/tests/create"}
                      className="bg-purple-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-purple-700 transition shrink-0 text-center shadow-xs text-xs whitespace-nowrap"
                    >
                      + Create New Test
                    </Link>
                  </div>
                </div>

                {assessments.length === 0 ? (
                  <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                      <Plus size={22} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">No Tests Created for this Course Yet</p>
                    <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
                      Each test belongs to a specific course. Create an assessment for this course first to link it here.
                    </p>
                    <Link
                      href={courseId ? `/admin/academy/tests/create?courseId=${courseId}` : "/admin/academy/tests/create"}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition shadow-sm"
                    >
                      <Plus size={14} />
                      Create Test for this Course
                    </Link>
                  </div>
                ) : (
                  <>
                    <select
                      value={assignmentData.assessmentId || ""}
                      onChange={(e) => setAssignmentData((prev: any) => ({ ...prev, assessmentId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition mb-4 text-sm font-medium bg-white"
                    >
                      <option value="">-- Choose an Assessment for this Course ({assessments.length} available) --</option>
                      {assessments.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.title} ({a.questions?.length ?? 0} Qs • {a.passingPercentage ?? 50}% pass)
                        </option>
                      ))}
                    </select>

                    {/* Show selected assessment preview */}
                    {(() => {
                      const selectedA = assessments.find((a: any) => a.id === assignmentData.assessmentId);
                      if (!selectedA) return null;
                      return (
                        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl mb-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-purple-900">{selectedA.title}</h4>
                            <span className="text-xs px-2.5 py-0.5 bg-purple-200 text-purple-900 rounded-full font-bold">
                              {selectedA.passingPercentage || 50}% Pass Mark
                            </span>
                          </div>
                          {selectedA.description && (
                            <p className="text-xs text-gray-600">{selectedA.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-purple-800 pt-2 border-t border-purple-200/60 font-medium">
                            <span>📝 {selectedA.questions?.length || 0} Questions</span>
                            <span>🔄 Max {selectedA.maxRetries ?? 50} retries</span>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                <button
                  onClick={async () => {
                    if(!assignmentData.assessmentId) return toast.error("Please select an assessment");
                    const selectedA = assessments.find((a: any) => a.id === assignmentData.assessmentId);
                    setIsSaving(true);
                    try {
                      await onSave(item.id, { 
                        assignmentData: { 
                          ...item.assignmentData, 
                          assessmentId: assignmentData.assessmentId,
                          totalMarks: selectedA?.marksPerQuestion ? selectedA.marksPerQuestion * (selectedA.questions?.length || 1) : 100,
                          passingMarks: selectedA?.passingPercentage || 50,
                        } 
                      });
                      toast.success("Assessment linked successfully!");
                      onClose();
                    } catch(e) {
                      toast.error("Failed to link assessment");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || !assignmentData.assessmentId}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save size={18} /> {isSaving ? "Saving..." : "Link Assessment to Lesson"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
