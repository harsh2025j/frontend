"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Lock,
  FileCheck2,
  CheckCircle2,
  Save,
  Loader2,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Percent,
  Layers,
  GraduationCap
} from "lucide-react";
import { courseApi } from "@/data/services/academy-service/course.service";
import apiClient from "@/data/services/apiConfig/apiClient";
import toast from "react-hot-toast";

interface CourseSettingsTabProps {
  course: any;
  setCourse: (course: any) => void;
  courseId: string;
}

export default function CourseSettingsTab({ course, setCourse, courseId }: CourseSettingsTabProps) {
  // Course tests list
  const [tests, setTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [finalCurriculumItem, setFinalCurriculumItem] = useState<any>(null);

  // Baseline state snapshot to track changes
  const [initialSettings, setInitialSettings] = useState<{
    unlockPct: number;
    requireCourseComplete: boolean;
    minProgressPct: number;
    requireFinalAssessment: boolean;
    passScore: number;
  } | null>(null);

  // Synchronized state
  const [unlockPct, setUnlockPct] = useState<number>(
    course?.finalAssessmentUnlockPct !== undefined && course?.finalAssessmentUnlockPct !== null
      ? course.finalAssessmentUnlockPct
      : 100
  );

  const [requireCourseComplete, setRequireCourseComplete] = useState<boolean>(
    course?.certificateRules?.requireCourseComplete !== false
  );

  const [minProgressPct, setMinProgressPct] = useState<number>(
    course?.certificateRules?.minProgressPct !== undefined && course?.certificateRules?.minProgressPct !== null
      ? course.certificateRules.minProgressPct
      : 100
  );

  const [requireFinalAssessment, setRequireFinalAssessment] = useState<boolean>(
    course?.certificateRules?.requireFinalAssessmentPass !== false
  );

  const [selectedTestId, setSelectedTestId] = useState<string>(
    course?.certificateRules?.finalAssessmentId || ""
  );

  const [passScore, setPassScore] = useState<number>(
    course?.certificateRules?.minAssessmentScorePct !== undefined && course?.certificateRules?.minAssessmentScorePct !== null
      ? course.certificateRules.minAssessmentScorePct
      : 50
  );

  // Sync state when external course changes (e.g. from OverviewTab edits)
  useEffect(() => {
    if (course) {
      if (course.finalAssessmentUnlockPct !== undefined && course.finalAssessmentUnlockPct !== null) {
        setUnlockPct(course.finalAssessmentUnlockPct);
      }
      if (course.certificateRules) {
        setRequireCourseComplete(course.certificateRules.requireCourseComplete !== false);
        if (course.certificateRules.minProgressPct !== undefined && course.certificateRules.minProgressPct !== null) {
          setMinProgressPct(course.certificateRules.minProgressPct);
        }
        setRequireFinalAssessment(course.certificateRules.requireFinalAssessmentPass !== false);
        if (course.certificateRules.finalAssessmentId) {
          setSelectedTestId(course.certificateRules.finalAssessmentId);
        }
        if (course.certificateRules.minAssessmentScorePct !== undefined && course.certificateRules.minAssessmentScorePct !== null) {
          setPassScore(course.certificateRules.minAssessmentScorePct);
        }
      }
    }
  }, [course]);

  // Load course assessments and curriculum items
  useEffect(() => {
    const fetchAssessmentsAndCurriculum = async () => {
      try {
        setLoadingTests(true);
        const [testsRes, courseRes] = await Promise.allSettled([
          apiClient.get("/academy/assessments", { params: { courseId } }),
          courseApi.fetchCourseById(courseId),
        ]);

        let loadedTests: any[] = [];
        if (testsRes.status === "fulfilled") {
          const data = testsRes.value?.data?.data || testsRes.value?.data || [];
          loadedTests = Array.isArray(data) ? [...data] : [];
        }

        // Collect all curriculum items across modules and course-level items
        const courseData = courseRes.status === "fulfilled" ? (courseRes.value?.data || course) : course;
        const allItems: any[] = [];
        if (courseData?.modules && Array.isArray(courseData.modules)) {
          courseData.modules.forEach((mod: any) => {
            if (Array.isArray(mod.items)) allItems.push(...mod.items);
          });
        }
        if (courseData?.items && Array.isArray(courseData.items)) {
          allItems.push(...courseData.items);
        }

        // Filter curriculum items that represent tests or assessments
        const curriculumTestItems = allItems.filter(
          (it: any) => (it.type === "final_assessment" || it.type === "test") && it.assignmentData?.assessmentId
        );

        // If any assessment referenced in curriculum is not in loadedTests, fetch it directly
        for (const itm of curriculumTestItems) {
          const aid = itm.assignmentData.assessmentId;
          if (!loadedTests.some((t) => t.id === aid)) {
            try {
              const singleRes = await apiClient.get(`/academy/assessments/${aid}`);
              const singleData = singleRes.data?.data || singleRes.data;
              if (singleData && singleData.id) {
                loadedTests.push(singleData);
              }
            } catch (err) {
              console.warn("Failed to load curriculum assessment:", aid, err);
            }
          }
        }

        setTests(loadedTests);

        // Determine which test should be active / selected from curriculum
        const finalCurriculumItem = allItems.find((it: any) => it.type === "final_assessment")
          || allItems.find((it: any) => it.type === "test");
        setFinalCurriculumItem(finalCurriculumItem || null);

        let activeTestId = finalCurriculumItem?.assignmentData?.assessmentId || course?.certificateRules?.finalAssessmentId || "";
        if (!activeTestId && loadedTests.length > 0) {
          activeTestId = loadedTests[0].id;
        }

        if (activeTestId && !loadedTests.some((t) => t.id === activeTestId)) {
          try {
            const singleRes = await apiClient.get(`/academy/assessments/${activeTestId}`);
            const singleData = singleRes.data?.data || singleRes.data;
            if (singleData && singleData.id) {
              loadedTests.push(singleData);
            }
          } catch (err) {
            console.warn("Failed to load curriculum assessment:", activeTestId, err);
          }
        }

        setTests(loadedTests);

        if (activeTestId) {
          setSelectedTestId(activeTestId);

          const chosen = loadedTests.find((t) => t.id === activeTestId);
          // Synchronize passing score:
          // 1. If assigned in curriculum with a passingMarks value (e.g. 90%), prioritize it
          // 2. Otherwise the assessment's own passingPercentage (e.g. 90%)
          // 3. Otherwise course certificate rules, fallback to 50%
          let resolvedPass = 50;
          if (finalCurriculumItem?.assignmentData?.passingMarks !== undefined && finalCurriculumItem.assignmentData.passingMarks !== null) {
            resolvedPass = Number(finalCurriculumItem.assignmentData.passingMarks);
          } else if (chosen?.passingPercentage !== undefined && chosen.passingPercentage !== null) {
            resolvedPass = Number(chosen.passingPercentage);
          } else if (
            course?.certificateRules?.minAssessmentScorePct !== undefined &&
            course?.certificateRules?.minAssessmentScorePct !== null
          ) {
            resolvedPass = Number(course.certificateRules.minAssessmentScorePct);
          }
          setPassScore(resolvedPass);

          // Capture baseline snapshot for change tracking
          const currentUnlock = course?.finalAssessmentUnlockPct !== undefined && course?.finalAssessmentUnlockPct !== null
            ? course.finalAssessmentUnlockPct
            : 100;
          const currentReqCourse = course?.certificateRules?.requireCourseComplete !== false;
          const currentMinProg = course?.certificateRules?.minProgressPct !== undefined && course?.certificateRules?.minProgressPct !== null
            ? course.certificateRules.minProgressPct
            : 100;
          const currentReqFinal = course?.certificateRules?.requireFinalAssessmentPass !== false;

          setInitialSettings({
            unlockPct: currentUnlock,
            requireCourseComplete: currentReqCourse,
            minProgressPct: currentMinProg,
            requireFinalAssessment: currentReqFinal,
            passScore: resolvedPass,
          });
        }
      } catch (err) {
        console.error("Failed to load assessments for settings:", err);
      } finally {
        setLoadingTests(false);
      }
    };

    if (courseId) {
      fetchAssessmentsAndCurriculum();
    }
  }, [courseId]);

  // Track whether any setting has been modified
  const hasChanges = React.useMemo(() => {
    if (!initialSettings) return false;
    return (
      unlockPct !== initialSettings.unlockPct ||
      requireCourseComplete !== initialSettings.requireCourseComplete ||
      (requireCourseComplete && minProgressPct !== initialSettings.minProgressPct) ||
      requireFinalAssessment !== initialSettings.requireFinalAssessment ||
      (requireFinalAssessment && passScore !== initialSettings.passScore)
    );
  }, [initialSettings, unlockPct, requireCourseComplete, minProgressPct, requireFinalAssessment, passScore]);

  // When admin switches selected test in dropdown, sync the passing percentage with that test's actual passing score
  const handleTestChange = (newTestId: string) => {
    setSelectedTestId(newTestId);
    const chosen = tests.find((t) => t.id === newTestId);
    if (chosen && chosen.passingPercentage !== undefined) {
      setPassScore(chosen.passingPercentage);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const toastId = toast.loading("Saving certificate & assessment rules...");

      // 1. If a test is assigned, update its passingPercentage in the assessments repository
      if (selectedTestId && passScore !== undefined) {
        try {
          await apiClient.put(`/academy/assessments/${selectedTestId}`, {
            passingPercentage: passScore,
          });
        } catch (testErr) {
          console.error("Could not update assessment passing percentage:", testErr);
        }

        // Also synchronize any curriculum item that references this test
        try {
          const freshCourseRes = await courseApi.fetchCourseById(courseId);
          const cData = freshCourseRes?.data;
          const allCurrItems: any[] = [];
          if (cData?.modules && Array.isArray(cData.modules)) {
            cData.modules.forEach((m: any) => {
              if (Array.isArray(m.items)) allCurrItems.push(...m.items);
            });
          }
          if (cData?.items && Array.isArray(cData.items)) {
            allCurrItems.push(...cData.items);
          }

          const matchingItems = allCurrItems.filter(
            (it: any) => it.assignmentData?.assessmentId === selectedTestId
          );
          for (const mItem of matchingItems) {
            await courseApi.updateCurriculumItem(mItem.id, {
              assignmentData: {
                ...mItem.assignmentData,
                passingMarks: passScore,
              },
            });
          }
        } catch (currErr) {
          console.error("Could not update curriculum item passing score:", currErr);
        }
      }

      // 2. Prepare synchronized course rules payload
      const updatedRules = {
        requireCourseComplete,
        minProgressPct: requireCourseComplete ? minProgressPct : 0,
        requireFinalAssessmentPass: requireFinalAssessment,
        finalAssessmentId: selectedTestId || null,
        minAssessmentScorePct: passScore,
      };

      const payload = {
        finalAssessmentUnlockPct: unlockPct,
        certificateRules: updatedRules,
      };

      // 3. Save to course API
      const res = await courseApi.updateCourse(courseId, payload);
      const updatedCourse = res?.data || {
        ...course,
        ...payload,
        certificateRules: updatedRules,
      };

      // 4. Update parent course state so OverviewTab and all other tabs immediately synchronize
      setCourse(updatedCourse);

      // Refresh tests list to show updated pass %
      setTests((prev) =>
        prev.map((t) => (t.id === selectedTestId ? { ...t, passingPercentage: passScore } : t))
      );

      // Reset baseline snapshot so button returns to disabled
      setInitialSettings({
        unlockPct,
        requireCourseComplete,
        minProgressPct,
        requireFinalAssessment,
        passScore,
      });

      toast.success("Settings & Certificate rules saved successfully!", { id: toastId });
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Failed to save course certificate rules");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTestObj = tests.find((t) => t.id === selectedTestId);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Award size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Course Assessment & Certificate Rules</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Configure prerequisite criteria to unlock the final examination and conditions required for automatic certificate generation. Changes made here synchronize directly with the course Overview and the assigned tests.
          </p>
        </div>
      </div>

      {/* RULE 1: FINAL ASSESSMENT UNLOCK RULE */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Lock size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Final Assessment Unlock Rule</h3>
            <p className="text-xs text-gray-500">Prerequisite course content completion required before taking the final exam.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              Prerequisite Completion Threshold: <span className="font-bold text-blue-600">{unlockPct}%</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={unlockPct}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                  setUnlockPct(val);
                }}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold text-center focus:outline-none focus:border-blue-500"
              />
              <span className="text-sm font-bold text-gray-600">%</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={unlockPct}
            onChange={(e) => setUnlockPct(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
          />

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
            {unlockPct === 100 && (
              <p>Students must complete <strong>100%</strong> of prior lessons, videos, assignments, and quizzes before unlocking the final assessment.</p>
            )}
            {unlockPct === 0 && (
              <p>The final assessment is <strong>immediately unlocked</strong> for students upon enrolling in this course.</p>
            )}
            {unlockPct > 0 && unlockPct < 100 && (
              <p>Students can attempt the final exam once they have completed at least <strong>{unlockPct}%</strong> of the course curriculum.</p>
            )}
          </div>
        </div>
      </div>

      {/* RULE 2: CERTIFICATE ROLLOUT CRITERIA */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Certificate Rollout Requirements</h3>
            <p className="text-xs text-gray-500">Conditions that must be met before a verified course certificate is issued to enrolled students.</p>
          </div>
        </div>

        {/* Condition A: Course Progress */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={requireCourseComplete}
              onChange={(e) => setRequireCourseComplete(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 mt-1 cursor-pointer"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">Require Course Progress / Completion</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Ensure students complete a defined percentage of course material before receiving their completion certificate.
              </p>
            </div>
          </label>

          {requireCourseComplete && (
            <div className="ml-7 pt-2 pb-1 flex items-center gap-4">
              <div className="w-48">
                <label className="block text-xs font-bold text-gray-600 mb-1">Minimum Course Progress (%)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={minProgressPct}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                      setMinProgressPct(val);
                    }}
                    className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-500">% Required</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 max-w-sm">
                Student progress must be greater than or equal to {minProgressPct}% across lessons and curriculum.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Condition B: Final Test Requirement & Dynamic Pass Percentage */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={requireFinalAssessment}
              onChange={(e) => setRequireFinalAssessment(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 mt-1 cursor-pointer"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">Require Final Assessment Passed</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Students must pass the designated final test with the specified score to receive a certificate.
              </p>
            </div>
          </label>

          {requireFinalAssessment && (
            <div className="ml-7 space-y-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
              {/* Final Assessment Status & Details from Curriculum */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-700">Course Final Assessment</label>
                  <span className="text-[11px] font-medium text-blue-600">
                    Configured in Course Curriculum
                  </span>
                </div>

                {loadingTests ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span>Loading final assessment from curriculum...</span>
                  </div>
                ) : !finalCurriculumItem ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">Final Assessment Not Configured</h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          A final assessment lesson has not been added to the course curriculum yet. Please add a Final Assessment lesson in the Curriculum tab to configure certificate examination rules.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/admin/academy/courses/${courseId}?tab=curriculum`}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shrink-0 self-start sm:self-auto shadow-xs"
                    >
                      Go to Curriculum
                    </Link>
                  </div>
                ) : !selectedTestObj ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">No Test Linked to Final Assessment</h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          The curriculum lesson <strong>"{finalCurriculumItem.title}"</strong> is designated as the final assessment, but no test has been linked to it yet.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/admin/academy/courses/${courseId}?tab=curriculum`}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shrink-0 self-start sm:self-auto shadow-xs"
                    >
                      Link Test in Curriculum
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-white border border-gray-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">{selectedTestObj.title}</h4>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">
                              Configured in Curriculum
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-semibold text-gray-700">{selectedTestObj.questions?.length || 0} Questions</span>
                            <span>•</span>
                            <span>Lesson: "{finalCurriculumItem.title}"</span>
                            <span>•</span>
                            <span>Max Retries: {selectedTestObj.maxRetries ?? 50}</span>
                          </p>
                        </div>
                      </div>

                      {/* <Link
                        href={`/admin/academy/tests/${selectedTestObj.id}?returnUrl=${encodeURIComponent(`/admin/academy/courses/${courseId}?tab=settings`)}`}
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-2xs shrink-0"
                      >
                        <ExternalLink size={13} />
                        <span>Modify Questions</span>
                      </Link> */}
                    </div>

                    {/* Alert when questions are not yet assigned in the final assessment */}
                    {(selectedTestObj.questions?.length || 0) === 0 ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-red-800">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={16} className="text-red-600 shrink-0" />
                          <span>
                            <strong>Not configured:</strong> Please assign questions in the final assessment before issuing certificates.
                          </span>
                        </div>
                        <Link
                          href={`/admin/academy/tests/${selectedTestObj.id}?returnUrl=${encodeURIComponent(`/admin/academy/courses/${courseId}?tab=settings`)}`}
                          className="font-bold underline hover:text-red-900 shrink-0"
                        >
                          Assign Questions
                        </Link>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Dynamic Passing Percentage Box */}
              <div className="pt-2 border-t border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800">
                    Final Assessment Passing Score (%)
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedTestObj ? (
                      <>
                        Linked to <strong className="text-gray-700">{selectedTestObj.title}</strong>. Changing this updates the test passing requirement and curriculum.
                      </>
                    ) : (
                      "Set the minimum percentage score a student must achieve on their final exam."
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passScore}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                      setPassScore(val);
                    }}
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-bold text-center bg-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-sm font-bold text-gray-600">% to Pass</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            hasChanges && !isSaving
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
              : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
          }`}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>
            {isSaving
              ? "Saving Settings..."
              : hasChanges
              ? "Save Settings & Synchronize"
              : "No Changes to Save"}
          </span>
        </button>
      </div>
    </div>
  );
}
