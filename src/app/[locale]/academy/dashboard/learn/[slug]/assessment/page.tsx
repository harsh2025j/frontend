"use client";

import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const testConfig = {
    title: 'Final Assessment: Criminal Law Package',
    duration: '60:00',
    totalQuestions: 3,
    passingScore: 50,
  };

  const questions = [
    {
      id: 1,
      text: 'Under the Bharatiya Nyaya Sanhita (BNS), 2023, what is the key change regarding the offense of sedition?',
      options: [
        'It has been completely abolished without any replacement.',
        'The term "sedition" is removed, but acts endangering sovereignty are punishable under a new provision.',
        'The punishment has been reduced to a simple fine.',
        'It remains exactly the same as Section 124A of the IPC.'
      ]
    },
    {
      id: 2,
      text: 'Which of the following acts introduces community service as a formal punishment for petty offenses?',
      options: [
        'Indian Penal Code (IPC)',
        'Bharatiya Nyaya Sanhita (BNS)',
        'Bharatiya Nagarik Suraksha Sanhita (BNSS)',
        'Bharatiya Sakshya Adhiniyam (BSA)'
      ]
    },
    {
      id: 3,
      text: 'According to the BNSS, what is the maximum duration for which police custody can be sought during the initial 40 or 60 days of the investigation period (depending on the offense)?',
      options: [
        '14 days',
        '15 days (but can be taken in parts over the initial 40/60 days)',
        '30 days',
        '90 days'
      ]
    }
  ];

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // In a real app, calculate score via backend
    setIsSubmitted(true);
  };

  // Mock score calculation for demo
  const score = 100; 
  const passed = score >= testConfig.passingScore;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] p-6 md:p-10 flex items-center justify-center font-sans">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-[#122340]/5 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className={`p-10 text-center text-white ${passed ? 'bg-gradient-to-br from-green-600 to-green-500' : 'bg-gradient-to-br from-red-600 to-red-500'}`}>
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner backdrop-blur-md">
              {passed ? <CheckCircle2 size={48} className="text-white" /> : <X size={48} className="text-white" />}
            </div>
            <h2 className="text-4xl font-extrabold mb-2 tracking-tight">
              {passed ? 'Assessment Passed!' : 'Assessment Failed'}
            </h2>
            <p className="text-white/80 font-medium text-lg">
              You scored {score}% (Passing is {testConfig.passingScore}%)
            </p>
          </div>
          
          <div className="p-10">
            {passed ? (
              <div className="text-center space-y-6">
                <p className="text-[#122340]/70 font-medium">
                  Congratulations! You have successfully completed the practical assignments and passed the final assessment. Your verifiable certificate has been automatically generated.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Link href="/dashboard/certificates">
                    <button className="bg-[#122340] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                      View Certificate
                    </button>
                  </Link>
                  <Link href="/dashboard">
                    <button className="bg-[#f0f2f5] text-[#122340] px-8 py-3.5 rounded-xl font-bold hover:bg-[#122340]/5 transition-colors">
                      Return to Dashboard
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <p className="text-[#122340]/70 font-medium">
                  Unfortunately, you did not meet the passing criteria. Please review the course materials and try again.
                </p>
                <button 
                  onClick={() => { setIsSubmitted(false); setCurrentQuestion(0); setSelectedAnswers({}); }}
                  className="bg-[#122340] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full md:w-auto"
                >
                  Retake Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">
      {/* Test Header */}
      <div className="bg-white border-b border-[#122340]/10 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="font-extrabold text-[#122340] text-xl">{testConfig.title}</h1>
            <p className="text-xs font-bold text-[#122340]/50 tracking-wider uppercase mt-1">Final Examination</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 font-bold">
              <Clock size={18} />
              <span>{testConfig.duration}</span>
            </div>
            <button className="text-sm font-bold text-[#122340]/50 hover:text-red-500 transition-colors flex items-center gap-1">
              <X size={16} /> Exit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-10">
        
        {/* Main Question Area */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5 relative overflow-hidden">
            
            <div className="flex justify-between items-end mb-8">
              <span className="text-sm font-bold text-[#C9A227] tracking-wider uppercase">Question {currentQuestion + 1} of {questions.length}</span>
              <span className="text-xs font-bold text-[#122340]/40">10 Marks</span>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-[#122340] leading-snug mb-8">
              {questions[currentQuestion].text}
            </h2>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion] === index;
                return (
                  <div 
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected 
                        ? 'border-[#C9A227] bg-[#C9A227]/5' 
                        : 'border-[#122340]/10 hover:border-[#C9A227]/50 bg-white hover:bg-[#f8f9fa]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-[#C9A227] bg-[#C9A227]' : 'border-[#122340]/20'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className={`font-semibold text-sm ${isSelected ? 'text-[#122340]' : 'text-[#122340]/70'}`}>
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#122340]/5">
              <button 
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className="px-6 py-3 rounded-xl font-bold text-[#122340] border border-[#122340]/10 hover:bg-[#122340]/5 disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              
              {currentQuestion === questions.length - 1 ? (
                <button 
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  Submit Assessment
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  className="bg-[#122340] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  Next Question <ArrowRight size={18} />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Sidebar Status Map */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#122340]/5 sticky top-28">
            <h3 className="font-bold text-[#122340] mb-6">Question Map</h3>
            <div className="grid grid-cols-4 gap-3">
              {questions.map((_, i) => {
                const isAnswered = selectedAnswers[i] !== undefined;
                const isCurrent = currentQuestion === i;
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-offset-2 ring-[#C9A227] bg-[#122340] text-white'
                        : isAnswered
                        ? 'bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30'
                        : 'bg-[#f0f2f5] text-[#122340]/40 hover:bg-[#122340]/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#122340]/60">
                <div className="w-3 h-3 rounded bg-[#C9A227]/20 border border-[#C9A227]/30"></div>
                Answered
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#122340]/60">
                <div className="w-3 h-3 rounded bg-[#f0f2f5]"></div>
                Not Answered
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
