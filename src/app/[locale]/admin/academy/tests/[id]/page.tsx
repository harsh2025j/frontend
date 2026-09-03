"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle, Download, Trash2, Edit, X } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import Loader from "@/components/ui/Loader";
import apiClient from "@/data/services/apiConfig/apiClient";

export default function AssessmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CSV Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isMapping, setIsMapping] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Mappings state
  const [mappings, setMappings] = useState({
    questionText: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctOption: "",
  });

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const res = await apiClient.get(`/academy/assessments/${id}`);
      const data = res.data?.data || res.data;
      if (res.status === 200) setAssessment(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length > 0) {
        const extractedHeaders = data[0] as string[];
        // Filter out empty rows
        const rows = data.slice(1).filter((row: any) => row.length > 0);
        
        // Convert to array of objects
        const formattedData = rows.map((row: any) => {
          let obj: any = {};
          extractedHeaders.forEach((header, idx) => {
            obj[header] = row[idx];
          });
          return obj;
        });

        setHeaders(extractedHeaders);
        setFileData(formattedData);
        setIsMapping(true);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadSampleFile = () => {
    const sampleData = [
      ["Question Text", "Option 1", "Option 2", "Option 3", "Option 4", "Correct Answer"],
      ["What is the capital of France?", "Berlin", "Madrid", "Paris", "Rome", "Paris"], // Exact text match
      ["Which planet is known as the Red Planet?", "Mars", "Venus", "Jupiter", "Saturn", "1"], // Number format
      ["What is the largest ocean on Earth?", "Atlantic", "Indian", "Arctic", "Pacific", "Option 4"], // Option Number format
      ["Who wrote 'Romeo and Juliet'?", "Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen", "B"], // Letter format
      ["What is the boiling point of water at sea level?", "90°C", "100°C", "110°C", "120°C", "Option B"], // Option Letter format
      ["Which element has the chemical symbol 'O'?", "Gold", "Oxygen", "Osmium", "Silver", "Option B"],
      ["In which year did the Titanic sink?", "1912", "1905", "1898", "1923", "1"],
      ["What is the hardest natural substance on Earth?", "Gold", "Iron", "Diamond", "Platinum", "Diamond"],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    
    // Auto-size columns slightly
    ws['!cols'] = [ {wch: 40}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15} ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "assessment_sample.xlsx");
  };

  const handleMappingChange = (field: string, value: string) => {
    setMappings(prev => ({ ...prev, [field]: value }));
  };

  const handleBulkUpload = async () => {
    // Validate mappings
    if (!mappings.questionText || !mappings.option1 || !mappings.option2 || !mappings.correctOption) {
      toast.error("Please map the required fields (Question, at least 2 Options, and Correct Option)");
      return;
    }

    setUploading(true);
    
    // Transform data
    const questionsPayload = fileData.map((row) => {
      const options = [];
      if (mappings.option1 && row[mappings.option1]) options.push(String(row[mappings.option1]));
      if (mappings.option2 && row[mappings.option2]) options.push(String(row[mappings.option2]));
      if (mappings.option3 && row[mappings.option3]) options.push(String(row[mappings.option3]));
      if (mappings.option4 && row[mappings.option4]) options.push(String(row[mappings.option4]));

      const correctVal = String(row[mappings.correctOption]).trim();
      const cvLower = correctVal.toLowerCase();
      
      let correctIndex = -1;
      
      // First try to match by exact text (case-insensitive)
      const foundIndex = options.findIndex(opt => String(opt).trim().toLowerCase() === cvLower);
      
      if (foundIndex !== -1) {
        correctIndex = foundIndex;
      } else {
        // Check for formats like "A", "B", "Option A", "Option B"
        if (cvLower === 'a' || cvLower === 'option a') correctIndex = 0;
        else if (cvLower === 'b' || cvLower === 'option b') correctIndex = 1;
        else if (cvLower === 'c' || cvLower === 'option c') correctIndex = 2;
        else if (cvLower === 'd' || cvLower === 'option d') correctIndex = 3;
        else {
          // Fallback: assume correct option might be 1, 2, 3, 4 or "Option 1"
          let numStr = cvLower.replace('option', '').trim();
          const parsedIndex = parseInt(numStr) - 1; 
          if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < options.length) {
            correctIndex = parsedIndex;
          }
        }
      }

      return {
        questionText: String(row[mappings.questionText]),
        options,
        correctOptionIndex: correctIndex === -1 ? 0 : correctIndex, // Fallback to 0 if totally invalid
      };
    });

    try {
      const res = await apiClient.post(`/academy/assessments/${id}/questions/bulk`, questionsPayload);

      if (res.status === 200 || res.status === 201) {
        toast.success("Questions uploaded successfully!");
        setIsMapping(false);
        setFileData([]);
        fetchAssessment();
      } else {
        toast.error("Failed to upload questions");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAll = async () => {
    setActionLoading(true);
    try {
      const res = await apiClient.delete(`/academy/assessments/${id}/questions`);
      if (res.status === 200) {
        toast.success("All questions deleted");
        setDeleteAllModalOpen(false);
        fetchAssessment();
      }
    } catch (e) {
      toast.error("Failed to delete questions");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!questionToDelete) return;
    setActionLoading(true);
    try {
      const res = await apiClient.delete(`/academy/assessments/${id}/questions/${questionToDelete}`);
      if (res.status === 200) {
        toast.success("Question deleted");
        setDeleteModalOpen(false);
        setQuestionToDelete(null);
        fetchAssessment();
      }
    } catch (e) {
      toast.error("Failed to delete question");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        questionText: questionToEdit.questionText,
        options: questionToEdit.options,
        correctOptionIndex: questionToEdit.correctOptionIndex
      };
      const res = await apiClient.put(`/academy/assessments/${id}/questions/${questionToEdit.id}`, payload);
      if (res.status === 200) {
        toast.success("Question updated");
        setEditModalOpen(false);
        setQuestionToEdit(null);
        fetchAssessment();
      }
    } catch (e) {
      toast.error("Failed to update question");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader text="Loading Assessment..." /></div>;
  }

  if (!assessment) {
    return <div className="p-10 text-center text-gray-500">Assessment not found.</div>;
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/academy/tests" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
            <p className="text-sm text-gray-500">{assessment.questions?.length || 0} Questions • {assessment.marksPerQuestion} Marks each</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Upload Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Add Questions</h3>
            <p className="text-sm text-gray-500 mb-6">Upload a CSV or Excel file containing your questions and options.</p>
            
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition cursor-pointer text-blue-600 group"
            >
              <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={24} />
              </div>
              <span className="font-semibold text-sm">Upload CSV / Excel</span>
            </button>

            <button
              onClick={downloadSampleFile}
              className="mt-4 w-full py-3 flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition text-gray-600 font-medium text-sm"
            >
              <Download size={16} /> Download Sample Excel
            </button>
          </div>
        </div>

        {/* Right Side: Mapping UI or Questions List */}
        <div className="md:col-span-2">
          {isMapping ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-blue-50/30">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Upload size={20} className="text-blue-600" />
                  Map Columns
                </h3>
                <p className="text-sm text-gray-500 mt-1">Select which column in your file corresponds to which field.</p>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { label: "Question Text", key: "questionText", required: true },
                  { label: "Option 1", key: "option1", required: true },
                  { label: "Option 2", key: "option2", required: true },
                  { label: "Option 3", key: "option3", required: false },
                  { label: "Option 4", key: "option4", required: false },
                  { label: "Correct Option (1-4)", key: "correctOption", required: true },
                ].map((field) => (
                  <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </span>
                    </div>
                    <select 
                      value={(mappings as any)[field.key]}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="w-full sm:w-64 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">Select Column...</option>
                      {headers.map((h, i) => (
                        <option key={i} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button onClick={() => { setIsMapping(false); setFileData([]); }} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
                <button 
                  onClick={handleBulkUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {uploading ? "Saving..." : "Save Questions"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Questions List</h3>
                <div className="flex items-center gap-3">
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                    {assessment.questions?.length || 0} Total
                  </span>
                  {assessment.questions?.length > 0 && (
                    <button 
                      onClick={() => setDeleteAllModalOpen(true)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition tooltip"
                      title="Clear All Questions"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {assessment.questions?.length > 0 ? (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {assessment.questions.map((q: any, idx: number) => (
                    <div key={q.id} className="p-6 hover:bg-gray-50/50 transition relative group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white shadow-sm border border-gray-100 rounded-lg p-1">
                        <button 
                          onClick={() => { setQuestionToEdit({...q}); setEditModalOpen(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Question"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => { setQuestionToDelete(q.id); setDeleteModalOpen(true); }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Question"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900 mb-3 text-sm pr-16">
                        <span className="text-gray-400 mr-2">{idx + 1}.</span> {q.questionText}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div 
                            key={optIdx} 
                            className={`px-3 py-2 text-sm rounded-lg border ${
                              q.correctOptionIndex === optIdx 
                                ? 'bg-green-50 border-green-200 text-green-700 font-medium'
                                : 'bg-white border-gray-200 text-gray-600'
                            }`}
                          >
                            <span className="mr-2 text-gray-400">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-orange-400 mb-3" />
                  <h4 className="font-bold text-gray-900">No questions yet</h4>
                  <p className="text-sm text-gray-500 mt-1">Upload a file to add questions to this assessment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Delete All Modal */}
      {deleteAllModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete All Questions?</h3>
            <p className="text-sm text-gray-500 mb-6">This will remove all {assessment.questions?.length} questions from this assessment. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button disabled={actionLoading} onClick={() => setDeleteAllModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition">Cancel</button>
              <button disabled={actionLoading} onClick={handleDeleteAll} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center gap-2">
                {actionLoading ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Question?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this question? It will be removed permanently.</p>
            <div className="flex gap-3 justify-end">
              <button disabled={actionLoading} onClick={() => {setDeleteModalOpen(false); setQuestionToDelete(null);}} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition">Cancel</button>
              <button disabled={actionLoading} onClick={handleDeleteSingle} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center gap-2">
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && questionToEdit && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Question</h3>
              <button onClick={() => {setEditModalOpen(false); setQuestionToEdit(null);}} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Question Text</label>
                <textarea 
                  required
                  value={questionToEdit.questionText}
                  onChange={(e) => setQuestionToEdit({...questionToEdit, questionText: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Option {idx + 1}</label>
                    <input 
                      required
                      type="text"
                      value={questionToEdit.options[idx] || ""}
                      onChange={(e) => {
                        const newOptions = [...questionToEdit.options];
                        newOptions[idx] = e.target.value;
                        setQuestionToEdit({...questionToEdit, options: newOptions});
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Correct Option</label>
                <select 
                  value={questionToEdit.correctOptionIndex}
                  onChange={(e) => setQuestionToEdit({...questionToEdit, correctOptionIndex: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {[0, 1, 2, 3].map((idx) => (
                    <option key={idx} value={idx}>Option {idx + 1}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
