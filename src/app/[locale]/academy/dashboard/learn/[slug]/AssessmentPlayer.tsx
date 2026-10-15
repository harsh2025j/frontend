import React, { useState, useEffect } from "react";
import { CheckSquare, Loader2, PlayCircle, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/data/services/apiConfig/apiClient";

type AssessmentPlayerProps = {
  courseId: string;
  itemId: string;
  assessmentId: string; // The ID of the actual assessment in DB
  title: string;
  onComplete: () => void;
};

export default function AssessmentPlayer({ courseId, itemId, assessmentId, title, onComplete }: AssessmentPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);

  // States: 'start' | 'playing' | 'result'
  const [viewState, setViewState] = useState<"start" | "playing" | "result">("start");
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);

  // Playing state
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Result state
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchAssessmentDetails();
  }, [assessmentId]);

  const fetchAssessmentDetails = async () => {
    if (!assessmentId) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.get(`/academy/assessments/${assessmentId}/status`);
      const data = res.data?.data || res.data;
      if (res.status === 200) setAssessment(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async () => {
    setLoading(true);
    try {
      // 1. Fetch Questions
      const qRes = await apiClient.get(`/academy/assessments/${assessmentId}/questions`);
      if (qRes.status === 200) {
        const qData = qRes.data?.data || qRes.data;
        setQuestions(qData);
      } else {
        toast.error("Failed to load questions");
        setLoading(false);
        return;
      }

      // 2. Start Attempt
      const aRes = await apiClient.post(`/academy/assessments/${assessmentId}/start`);
      if (aRes.status === 200 || aRes.status === 201) {
        const aData = aRes.data?.data || aRes.data;
        setCurrentAttempt(aData);
        setViewState("playing");
        setAnswers({});
        setCurrentQuestionIndex(0);
      } else {
        toast.error("Failed to start assessment");
      }
    } catch (e: any) {
      console.error("Start assessment error:", e);
      const message = e?.message || e?.response?.data?.message || "Failed to start assessment";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  const submitAssessment = async () => {
    setSubmitting(true);
    try {
      // Convert answers map to array format expected by backend
      const answersPayload = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex
      }));

      const res = await apiClient.post(`/academy/assessments/${assessmentId}/submit`, {
        attemptId: currentAttempt.id,
        answers: answersPayload
      });

      if (res.status === 200 || res.status === 201) {
        const data = res.data?.data || res.data;
        setResult(data);
        setViewState("result");
        if (data.passed) {
          onComplete(); // Mark course item as completed
        }
      } else {
        toast.error("Failed to submit assessment");
      }
    } catch (e: any) {
      console.error("Submit assessment error:", e);
      const message = e?.message || e?.response?.data?.message || "Failed to submit assessment";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-4 sm:mt-8 mx-auto w-[96%] sm:w-[95%] max-w-5xl bg-[#f8f9fa] border border-[#122340]/10 rounded-2xl p-8 sm:p-20 flex flex-col items-center justify-center shrink-0 shadow-sm min-h-[350px] sm:min-h-[400px]">
        <Loader2 size={40} className="text-[#C9A227] animate-spin mb-4" />
        <p className="text-[#122340]/60 font-medium text-sm sm:text-base">Loading assessment...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="mt-4 sm:mt-8 mx-auto w-[96%] sm:w-[95%] max-w-5xl bg-[#f8f9fa] border border-[#122340]/10 rounded-2xl p-8 sm:p-20 flex flex-col items-center justify-center shrink-0 shadow-sm min-h-[350px] sm:min-h-[400px]">
        <AlertTriangle size={40} className="text-red-500 mb-4" />
        <p className="text-[#122340]/60 font-medium text-center text-sm sm:text-base">Assessment configuration missing.<br />Please contact your instructor.</p>
      </div>
    );
  }

  if (viewState === "start") {
    const hasAttempted = assessment.previousAttempts > 0;
    const hasPassed = assessment.hasPassed;

    return (
      <div className={`mt-4 sm:mt-8 mx-auto w-[96%] sm:w-[95%] max-w-5xl border rounded-2xl p-5 sm:p-10 flex flex-col items-center justify-center shrink-0 shadow-sm min-h-[450px] sm:min-h-[500px] ${hasPassed ? 'bg-green-50 border-green-200' : 'bg-[#f8f9fa] border-[#122340]/10'}`}>
        {hasPassed ? (
          <CheckCircle2 size={48} className="text-green-600 mb-3 sm:mb-4" />
        ) : (
          <CheckSquare size={48} className="text-[#C9A227] mb-4 sm:mb-6" />
        )}
        
        <h2 className={`text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-3 text-center ${hasPassed ? 'text-green-800' : 'text-[#122340]'}`}>
          {hasPassed ? 'Assessment Passed!' : title}
        </h2>

        {hasPassed && (
          <p className="text-green-700 font-medium mb-5 sm:mb-6 text-center text-xs sm:text-sm max-w-md">
            Congratulations! You have already met the passing requirements for this assessment.
          </p>
        )}

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#122340]/10 shadow-sm mb-6 sm:mb-8 w-full max-w-md text-[#122340]">
          {!hasPassed && <p className="text-[#122340]/70 mb-4 text-center text-xs sm:text-sm">{assessment.description}</p>}
          
          <div className="flex justify-between items-center py-2.5 sm:py-3 border-b border-[#122340]/5">
            <span className="font-semibold text-xs sm:text-sm">Total Questions</span>
            <span className="font-bold text-base sm:text-lg">{assessment.questions?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2.5 sm:py-3 border-b border-[#122340]/5">
            <span className="font-semibold text-xs sm:text-sm">Passing Score</span>
            <span className="font-bold text-base sm:text-lg">{assessment.passingPercentage}%</span>
          </div>
          
          {hasAttempted && (
            <div className="flex justify-between items-center py-2.5 sm:py-3 border-b border-[#122340]/5">
              <span className="font-semibold text-xs sm:text-sm">Your Best Score</span>
              <span className={`font-bold text-base sm:text-lg ${hasPassed ? 'text-green-600' : 'text-[#C9A227]'}`}>{assessment.highestScore?.toFixed(1) || 0}%</span>
            </div>
          )}

          <div className="flex justify-between items-center py-2.5 sm:py-3">
            <span className="font-semibold text-xs sm:text-sm">Remaining Retries</span>
            <span className={`font-bold text-base sm:text-lg ${assessment.remainingRetries === 0 ? 'text-red-600' : ''}`}>
              {assessment.remainingRetries !== undefined ? assessment.remainingRetries : assessment.maxRetries}
            </span>
          </div>
        </div>

        {assessment.remainingRetries !== 0 ? (
          <button
            onClick={startAssessment}
            className={`${hasPassed ? 'bg-white text-green-700 border-2 border-green-600 hover:bg-green-50' : 'bg-[#122340] text-white hover:bg-[#0a1628] shadow-lg hover:shadow-xl hover:-translate-y-0.5'} w-full sm:w-auto justify-center px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer`}
          >
            <PlayCircle size={18} /> {hasPassed ? 'Retake Assessment' : 'Start Assessment'}
          </button>
        ) : (
          <div className="bg-red-50 text-red-600 px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-red-100 text-center">
            <AlertTriangle size={18} className="shrink-0" /> You have exhausted all attempts for this assessment.
          </div>
        )}
      </div>
    );
  }

  if (viewState === "playing") {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    return (
      <div className="mt-2 sm:mt-4 mx-auto w-[96%] sm:w-[95%] max-w-5xl bg-white border border-[#122340]/10 rounded-2xl flex flex-col shrink-0 text-[#122340] shadow-sm min-h-[500px] sm:min-h-[550px] overflow-hidden">
        {/* Header */}
        <div className="bg-[#122340] text-white p-3.5 sm:p-4 flex flex-wrap gap-2 justify-between items-center shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base sm:text-lg truncate max-w-md">{title}</h2>
            <p className="text-white/60 text-xs sm:text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-wider">Progress</span>
            <div className="w-24 sm:w-32 bg-white/20 rounded-full h-1.5 sm:h-2 mt-1">
              <div className="bg-[#C9A227] h-full rounded-full transition-all" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <h3 className="text-lg sm:text-2xl font-bold mb-5 sm:mb-8 leading-tight">{question.questionText}</h3>

          <div className="space-y-3 sm:space-y-4">
            {question.options.map((option: string, idx: number) => {
              const isSelected = answers[question.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [question.id]: idx })}
                  className={`w-full text-left py-2.5 sm:py-3 px-3.5 sm:px-5 rounded-xl border-2 transition-all flex items-center gap-3 sm:gap-4 cursor-pointer ${isSelected
                    ? 'border-[#C9A227] bg-[#C9A227]/5'
                    : 'border-[#122340]/10 hover:border-[#122340]/30 hover:bg-[#122340]/[0.02]'
                    }`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#C9A227]' : 'border-[#122340]/30'
                    }`}>
                    {isSelected && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#C9A227] rounded-full"></div>}
                  </div>
                  <span className={`text-sm sm:text-base font-medium leading-snug ${isSelected ? 'text-[#122340]' : 'text-[#122340]/80'}`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-3.5 sm:p-6 border-t border-[#122340]/10 flex justify-between items-center shrink-0 bg-[#f8f9fa] gap-2">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm text-[#122340] bg-white border border-[#122340]/20 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            <ArrowLeft size={15} /> Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={submitAssessment}
              disabled={submitting || Object.keys(answers).length !== questions.length}
              className="bg-[#C9A227] text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm hover:bg-[#b08d20] shadow-md transition-all flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckSquare size={15} />}
              Submit Assessment
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#122340] hover:bg-[#0a1628] transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              Next <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (viewState === "result" && result) {
    const reviewEnabled = true; // Assume review is always available for now

    return (
      <div className="mt-4 sm:mt-8 mx-auto w-[96%] sm:w-[95%] max-w-5xl bg-white border border-[#122340]/10 rounded-2xl flex flex-col shrink-0 text-[#122340] shadow-sm overflow-hidden">

        {/* Result Header */}
        <div className={`p-6 sm:p-10 text-center text-white ${result.passed ? 'bg-green-600' : 'bg-red-600'}`}>
          {result.passed ? (
            <CheckCircle2 size={48} className="mx-auto mb-3 sm:mb-4 sm:w-16 sm:h-16" />
          ) : (
            <XCircle size={48} className="mx-auto mb-3 sm:mb-4 sm:w-16 sm:h-16" />
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-1.5 sm:mb-2">{result.passed ? 'Assessment Passed!' : 'Assessment Failed'}</h2>
          <p className="text-white/80 font-medium text-xs sm:text-sm max-w-md mx-auto">
            {result.passed ? 'Congratulations! You have met the requirements for this assessment.' : 'You did not meet the passing score requirements. Please review the material and try again.'}
          </p>
        </div>

        {/* Score Summary */}
        <div className="p-4 sm:p-8 border-b border-[#122340]/10 bg-[#f8f9fa] grid grid-cols-3 gap-2 sm:gap-8 items-center text-center">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#122340]/50 uppercase tracking-wider mb-1 truncate">Your Score</p>
            <p className={`text-2xl sm:text-4xl font-extrabold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>{result.score.toFixed(1)}%</p>
          </div>
          <div className="border-x border-[#122340]/10 px-1 sm:px-4">
            <p className="text-[10px] sm:text-xs font-bold text-[#122340]/50 uppercase tracking-wider mb-1 truncate">Correct</p>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#122340]">
              {result.marksPerQuestion > 0 ? Math.round(result.rawScore / result.marksPerQuestion) : 0} 
              <span className="text-xs sm:text-xl text-[#122340]/50"> / {result.totalQuestions}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#122340]/50 uppercase tracking-wider mb-1 truncate">Passing</p>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#122340]">{assessment.passingPercentage}%</p>
          </div>
        </div>

        {/* Detailed Review */}
        {reviewEnabled && result.details && (
          <div className="p-4 sm:p-8 md:p-12">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Review Answers</h3>
            <div className="space-y-4 sm:space-y-8">
              {result.details.map((detail: any, idx: number) => {
                const question = detail.question;
                const isCorrect = detail.isCorrect;
                return (
                  <div key={idx} className="border border-[#122340]/10 rounded-xl overflow-hidden">
                    <div className={`p-3.5 sm:p-4 border-b border-[#122340]/10 flex items-start justify-between ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <h4 className="font-bold text-[#122340] text-xs sm:text-sm">
                        <span className="mr-2">{idx + 1}.</span> {question.questionText}
                      </h4>
                      {isCorrect ? (
                        <CheckCircle2 size={18} className="text-green-600 shrink-0 ml-3 sm:ml-4 sm:w-5 sm:h-5" />
                      ) : (
                        <XCircle size={18} className="text-red-600 shrink-0 ml-3 sm:ml-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <div className="p-3 sm:p-4 space-y-2 bg-white">
                      {question.options.map((opt: string, optIdx: number) => {
                        const isStudentAnswer = detail.selectedOptionIndex === optIdx;
                        const isActualCorrect = question.correctOptionIndex === optIdx;

                        let optClass = "border-[#122340]/10 text-[#122340]/70";
                        if (isActualCorrect) optClass = "border-green-500 bg-green-50 text-green-800 font-medium";
                        else if (isStudentAnswer && !isActualCorrect) optClass = "border-red-500 bg-red-50 text-red-800 font-medium";

                        return (
                          <div key={optIdx} className={`p-2.5 sm:p-3 rounded-lg border flex flex-wrap items-center justify-between gap-1.5 text-xs sm:text-sm ${optClass}`}>
                            <span className="break-words flex-1 min-w-[200px]">{opt}</span>
                            {isActualCorrect && <span className="text-[10px] sm:text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">Correct Answer</span>}
                            {isStudentAnswer && !isActualCorrect && <span className="text-[10px] sm:text-xs font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 border-t border-[#122340]/10 bg-[#f8f9fa] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-medium text-[#122340]/70">
            {result.remainingRetries !== undefined ? (
              <span>You have <strong className="text-[#122340] text-sm sm:text-base">{result.remainingRetries}</strong> retries remaining.</span>
            ) : null}
          </div>
          <div>
            {(!result.passed && result.remainingRetries > 0) && (
              <button
                onClick={() => setViewState("start")}
                className="bg-[#122340] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm hover:bg-[#0a1628] transition-colors cursor-pointer"
              >
                Retry Assessment
              </button>
            )}
            {(!result.passed && result.remainingRetries === 0) && (
              <span className="text-red-600 font-bold text-xs sm:text-sm px-2 sm:px-4">No retries left</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
