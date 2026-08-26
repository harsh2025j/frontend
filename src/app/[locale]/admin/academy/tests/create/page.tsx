"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2, Settings, GripVertical, CheckCircle2, Circle } from "lucide-react";

export default function CreateTestPage() {
  const [testTitle, setTestTitle] = useState("");
  const [course, setCourse] = useState("");
  const [duration, setDuration] = useState("");
  const [passPercentage, setPassPercentage] = useState("50");

  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "What is the primary function of a writ of habeas corpus?",
      options: [
        { id: "A", text: "To transfer a case to a higher court" },
        { id: "B", text: "To compel a public official to perform a duty" },
        { id: "C", text: "To bring a prisoner or detainee before the court" },
        { id: "D", text: "To stop a lower court from exceeding its jurisdiction" }
      ],
      correctOptionId: "C",
      marks: 1
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: "",
        options: [
          { id: "A", text: "" },
          { id: "B", text: "" },
          { id: "C", text: "" },
          { id: "D", text: "" }
        ],
        correctOptionId: "A",
        marks: 1
      }
    ]);
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestionText = (id: number, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const updateOptionText = (questionId: number, optionId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(opt => opt.id === optionId ? { ...opt, text } : opt)
        };
      }
      return q;
    }));
  };

  const setCorrectOption = (questionId: number, optionId: string) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, correctOptionId: optionId } : q));
  };

  const handleSave = () => {
    // Mock save
    console.log("Saving test:", { testTitle, course, duration, passPercentage, questions });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/academy/tests" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Assessment</h1>
            <p className="text-gray-500 text-sm mt-1">Build a quiz or final test for a course.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Save as Draft
          </button>
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
            <Save size={18} /> Publish Test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col - Settings */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-100 pb-3">
              <Settings size={18} />
              <h3>Test Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Test Title *</label>
                <input 
                  type="text" 
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Quiz" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Course *</label>
                <select 
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="">Select a course...</option>
                  <option value="course1">Legal Research Apprenticeship</option>
                  <option value="course2">Drafting Commercial Contracts</option>
                  <option value="course3">Intellectual Property Rights</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Minutes)</label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 60" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Passing Percentage (%)</label>
                <input 
                  type="number" 
                  max="100"
                  min="0"
                  value={passPercentage}
                  onChange={(e) => setPassPercentage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-800">
            <p className="font-bold mb-1">Summary</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>{questions.length} Questions</li>
              <li>Total Marks: {questions.reduce((acc, q) => acc + q.marks, 0)}</li>
              <li>Pass: {passPercentage}%</li>
            </ul>
          </div>
        </div>

        {/* Right Col - Question Builder */}
        <div className="md:col-span-2 space-y-6">
          
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Question Header */}
              <div className="flex justify-between items-center bg-gray-50/80 p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-gray-400 cursor-grab active:cursor-grabbing" />
                  <span className="font-bold text-gray-700 text-sm">Question {index + 1}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Marks</span>
                    <input type="number" className="w-16 px-2 py-1 border border-gray-200 rounded-md text-center focus:outline-none" defaultValue={q.marks} />
                  </div>
                  <button onClick={() => handleRemoveQuestion(q.id)} className="text-gray-400 hover:text-red-600 transition p-1" title="Delete Question">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Question Body */}
              <div className="p-5 space-y-5">
                <div>
                  <textarea 
                    rows={2} 
                    value={q.text}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                    placeholder="Type the question here..." 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-medium"
                  ></textarea>
                </div>

                {/* Options */}
                <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                  {q.options.map(opt => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <button 
                        onClick={() => setCorrectOption(q.id, opt.id)}
                        className={`shrink-0 transition ${q.correctOptionId === opt.id ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                        title={q.correctOptionId === opt.id ? "Correct Answer" : "Mark as Correct"}
                      >
                        {q.correctOptionId === opt.id ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 select-none">{opt.id}.</span>
                        <input 
                          type="text" 
                          value={opt.text}
                          onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                          placeholder={`Option ${opt.id}`} 
                          className={`w-full pl-8 pr-4 py-2 border rounded-lg text-sm focus:outline-none transition ${
                            q.correctOptionId === opt.id ? 'border-green-300 bg-green-50/30 text-green-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Add New Question Button */}
          <button 
            onClick={handleAddQuestion}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition"
          >
            <Plus size={18} /> Add Another Question
          </button>
        </div>
      </div>
    </div>
  );
}
