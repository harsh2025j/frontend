import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Search, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import apiClient from '@/data/services/apiConfig/apiClient';
import toast from 'react-hot-toast';

export default function AssignmentsTab({ courseId }: { courseId: string }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  
  // Filter states
  const [filterAssignmentId, setFilterAssignmentId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Grading state
  const [marks, setMarks] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [gradingStatus, setGradingStatus] = useState<'verified' | 'rejected'>('verified');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignmentsList();
  }, [courseId]);

  useEffect(() => {
    fetchSubmissions();
  }, [courseId, filterAssignmentId, filterStatus]);

  const fetchAssignmentsList = async () => {
    try {
      const res = await apiClient.get(`/academy/assignments/course/${courseId}/list`);
      setAssignmentsList(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/academy/assignments/course/${courseId}`, {
        params: {
          assignmentId: filterAssignmentId !== 'all' ? filterAssignmentId : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      });
      setSubmissions(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!selectedSub) return;
    if (gradingStatus === 'verified' && marks === '') {
      return toast.error("Please assign marks to verify");
    }
    if (gradingStatus === 'rejected' && !feedback.trim()) {
      return toast.error("Please provide a reason for rejection");
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.patch(`/academy/assignments/submissions/${selectedSub.id}/grade`, {
        status: gradingStatus,
        marksAwarded: gradingStatus === 'verified' ? Number(marks) : null,
        feedback: feedback
      });
      
      toast.success(`Submission ${gradingStatus} successfully!`);
      
      // Update local state
      setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? res.data : s));
      setSelectedSub(null);
    } catch (error) {
      toast.error("Failed to grade submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'verified': return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle size={12}/> Verified</span>;
      case 'rejected': return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle size={12}/> Rejected</span>;
      case 'resubmitted': return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><RotateCcw size={12}/> Resubmitted</span>;
      default: return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div>
            <h2 className="font-bold text-gray-900">Student Submissions</h2>
            <p className="text-xs text-gray-500 mt-1">
              Total Assignments in Course: <span className="font-bold text-gray-700">{assignmentsList.length}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select 
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white min-w-[200px]"
              value={filterAssignmentId}
              onChange={e => setFilterAssignmentId(e.target.value)}
            >
              <option value="all">All Assignments</option>
              {assignmentsList.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="resubmitted">Resubmitted</option>
            </select>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No submissions yet for this course.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Assignment Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">{sub.studentName}</p>
                      <p className="text-xs text-gray-500">{sub.studentEmail}</p>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      {sub.assignment?.title || 'Unknown Assignment'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {sub.status === 'verified' ? `${sub.marksAwarded} / ${sub.assignment?.assignmentData?.totalMarks || '-'}` : '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedSub(sub);
                          setMarks(sub.marksAwarded || '');
                          setFeedback(sub.feedback || '');
                          setGradingStatus(sub.status === 'rejected' ? 'rejected' : 'verified');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Review Submission</h3>
                <p className="text-sm text-gray-500">{selectedSub.studentName} - {selectedSub.assignment?.title}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full"><XCircle size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* PDF Viewer */}
              <div className="flex-1 bg-gray-900 h-full min-h-[400px]">
                <iframe src={selectedSub.submissionPdfUrl} className="w-full h-full border-0" title="PDF Preview"></iframe>
              </div>
              
              {/* Grading Panel */}
              <div className="w-full md:w-80 border-l border-gray-100 bg-white p-6 overflow-y-auto flex flex-col">
                <h4 className="font-bold text-gray-900 mb-4">Grading Panel</h4>
                
                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Possible Marks</label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium text-sm">
                      {selectedSub.assignment?.assignmentData?.totalMarks || 100} Marks
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Outcome</label>
                    <div className="flex gap-2">
                      <button onClick={() => setGradingStatus('verified')} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition ${gradingStatus === 'verified' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Verify</button>
                      <button onClick={() => setGradingStatus('rejected')} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition ${gradingStatus === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Reject</button>
                    </div>
                  </div>

                  {gradingStatus === 'verified' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Marks Awarded</label>
                      <input 
                        type="number" 
                        value={marks} 
                        onChange={e => setMarks(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 85"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Feedback / Reason</label>
                    <textarea 
                      rows={4}
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      placeholder={gradingStatus === 'rejected' ? "Explain why it was rejected so the student can try again..." : "Optional feedback..."}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none text-sm"
                    />
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-gray-100">
                  <button 
                    onClick={handleGrade}
                    disabled={isSubmitting}
                    className={`w-full py-3 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition disabled:opacity-50 ${gradingStatus === 'verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                    {gradingStatus === 'verified' ? 'Submit Grade' : 'Reject & Notify'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
