"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Save, Video, Link as LinkIcon, FileText, CheckCircle, UploadCloud, Loader2, RefreshCw } from "lucide-react";
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
};

export default function ContentEditorDrawer({
  item,
  isOpen,
  onClose,
  onSave
}: {
  item: CurriculumItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"upload" | "external" | "assignment" | "assessment">("upload");
  const [externalUrl, setExternalUrl] = useState(item?.fileUrl || "");
  const [localFileUrl, setLocalFileUrl] = useState(item?.fileUrl || "");
  const [localProvider, setLocalProvider] = useState(item?.provider || "");
  const [isSaving, setIsSaving] = useState(false);
  
  // Assignment specific state
  const [assignmentData, setAssignmentData] = useState<any>(item?.assignmentData || { totalMarks: 100, passingMarks: 50, instructionsPdfUrl: "", assessmentId: "" });
  const [assessments, setAssessments] = useState<any[]>([]);

  const fetchAssessments = () => {
    apiClient.get(`/academy/assessments?t=${Date.now()}`)
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
    
    if (item?.type === 'assignment') {
      setActiveTab("assignment");
    } else if (item?.type === 'test' || item?.type === 'final_assessment') {
      setActiveTab("assessment");
    } else if (item?.type === 'live') {
      setActiveTab("external");
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
    } else if (item.type === 'video') {
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
          {item.type !== 'assignment' && item.type !== 'test' && item.type !== 'final_assessment' && (
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto no-scrollbar">
              {item.type !== 'live' && (
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 flex min-w-max px-4 items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition ${activeTab === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {item.type === 'document' ? <FileText size={16} /> : <Video size={16} />} Upload from Device
                </button>
              )}
              {item.type !== 'document' && (
                <button
                  onClick={() => setActiveTab("external")}
                  className={`flex-1 flex min-w-max px-4 items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition ${activeTab === 'external' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LinkIcon size={16} /> {item.type === 'live' ? 'Live Session Link' : 'YouTube / Web Link'}
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Assessment</label>
                <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-xs font-medium mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-purple-200">
                  <div className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-purple-600">💡</span>
                    <span>Select an assessment that you have created in the Tests & Assessments section.</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={fetchAssessments} title="Refresh Assessments" className="p-2 text-purple-600 bg-purple-100/50 hover:bg-purple-200 rounded-lg transition shrink-0">
                      <RefreshCw size={18} />
                    </button>
                    <Link href="/admin/academy/tests/create" className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-700 transition shrink-0 text-center shadow-sm whitespace-nowrap">
                      Create New
                    </Link>
                  </div>
                </div>
                
                <select
                  value={assignmentData.assessmentId || ""}
                  onChange={(e) => setAssignmentData((prev: any) => ({ ...prev, assessmentId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition mb-4"
                >
                  <option value="">-- Choose an Assessment --</option>
                  {assessments.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>

                <button
                  onClick={async () => {
                    if(!assignmentData.assessmentId) return toast.error("Please select an assessment");
                    setIsSaving(true);
                    try {
                      await onSave(item.id, { assignmentData: { ...item.assignmentData, assessmentId: assignmentData.assessmentId } });
                      toast.success("Assessment linked successfully!");
                      onClose();
                    } catch(e) {
                      toast.error("Failed to link assessment");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <Save size={18} /> {isSaving ? "Saving..." : "Link Assessment"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
