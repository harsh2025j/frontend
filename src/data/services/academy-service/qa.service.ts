import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";
import type {
  CourseQuestion,
  CourseAnswer,
  CourseQAPaginatedResponse,
  CourseQAStats,
  QuestionStatus,
} from "@/data/features/academy/course/qa.types";

type QAEndpoints = typeof API_ENDPOINTS.ACADEMY.QA;

const buildUrl = (template: string, params: Record<string, string>) => {
  return Object.entries(params).reduce(
    (url, [key, val]) => url.replace(`:${key}`, encodeURIComponent(val)),
    template
  );
};

export interface GetQuestionsParams {
  itemId?: string;
  moduleId?: string;
  search?: string;
  status?: QuestionStatus;
  filter?: "all" | "unanswered" | "mine";
  sort?: "upvotes" | "recent";
  page?: number;
  limit?: number;
}

export interface PostQuestionPayload {
  title: string;
  content: string;
  itemId?: string;
  moduleId?: string;
  userName?: string;
  userAvatar?: string;
}

export interface PostAnswerPayload {
  content: string;
  userName?: string;
  userAvatar?: string;
}

export const qaApi = {
  /**
   * Get paginated questions for a course, optionally filtered by lesson item
   */
  getQuestions: async (
    courseId: string,
    params: GetQuestionsParams = {}
  ): Promise<CourseQAPaginatedResponse> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.BY_COURSE, { courseId });
    const res = await apiClient.get<CourseQAPaginatedResponse>(url, { params });
    return res.data;
  },

  /**
   * Get Q&A stats for a course (for admin hub)
   */
  getCourseQAStats: async (courseId: string): Promise<CourseQAStats> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.STATS, { courseId });
    const res = await apiClient.get<CourseQAStats>(url);
    return res.data;
  },

  /**
   * Get a single question with all replies
   */
  getQuestionById: async (
    courseId: string,
    questionId: string
  ): Promise<CourseQuestion> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.BY_QUESTION, {
      courseId,
      questionId,
    });
    const res = await apiClient.get<CourseQuestion>(url);
    return res.data;
  },

  /**
   * Post a new question/doubt
   */
  createQuestion: async (
    courseId: string,
    payload: PostQuestionPayload
  ): Promise<CourseQuestion> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.BY_COURSE, { courseId });
    const res = await apiClient.post<CourseQuestion>(url, payload);
    return res.data;
  },

  /**
   * Post an answer (or instructor clarification) to a question
   */
  createAnswer: async (
    courseId: string,
    questionId: string,
    payload: PostAnswerPayload
  ): Promise<CourseAnswer> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.ANSWERS, {
      courseId,
      questionId,
    });
    const res = await apiClient.post<CourseAnswer>(url, payload);
    return res.data;
  },

  /**
   * Toggle "+1 I have this doubt too" upvote
   */
  toggleUpvote: async (
    courseId: string,
    questionId: string
  ): Promise<{ upvoted: boolean; upvotesCount: number }> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.UPVOTE, {
      courseId,
      questionId,
    });
    const res = await apiClient.post<{ upvoted: boolean; upvotesCount: number }>(url);
    return res.data;
  },

  /**
   * Mark a question as resolved during a live session
   */
  markAnsweredLive: async (
    courseId: string,
    questionId: string,
    liveSessionId?: string
  ): Promise<CourseQuestion> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.MARK_ANSWERED_LIVE, {
      courseId,
      questionId,
    });
    const res = await apiClient.patch<CourseQuestion>(url, { liveSessionId });
    return res.data;
  },

  /**
   * Edit a question (author only)
   */
  editQuestion: async (
    courseId: string,
    questionId: string,
    payload: { title?: string; content?: string }
  ): Promise<CourseQuestion> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.EDIT_QUESTION, {
      courseId,
      questionId,
    });
    const res = await apiClient.patch<CourseQuestion>(url, payload);
    return res.data;
  },

  /**
   * Edit an answer (author only)
   */
  editAnswer: async (
    courseId: string,
    questionId: string,
    answerId: string,
    payload: { content: string }
  ): Promise<CourseAnswer> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.EDIT_ANSWER, {
      courseId,
      questionId,
      answerId,
    });
    const res = await apiClient.patch<CourseAnswer>(url, payload);
    return res.data;
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (
    courseId: string,
    questionId: string
  ): Promise<{ success: boolean; message: string }> => {
    const url = buildUrl(API_ENDPOINTS.ACADEMY.QA.BY_QUESTION, {
      courseId,
      questionId,
    });
    const res = await apiClient.delete<{ success: boolean; message: string }>(url);
    return res.data;
  },
};
