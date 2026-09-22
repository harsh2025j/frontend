import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";
import {
  CourseReview,
  CourseReviewsResponse,
  MyReviewEligibility,
} from "@/data/features/academy/course/course.types";

export interface CreateReviewPayload {
  rating: number;
  reviewText: string;
  studentAvatar?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  reviewText?: string;
}

export const reviewApi = {
  // Public: Get reviews & rating summary for a course
  getCourseReviews: async (
    courseIdOrSlug: string,
    page = 1,
    limit = 10,
    star?: number,
  ): Promise<CourseReviewsResponse> => {
    const url = API_ENDPOINTS.ACADEMY.REVIEWS.BY_COURSE.replace(
      ":courseId",
      encodeURIComponent(courseIdOrSlug),
    );
    const params: Record<string, any> = { page, limit };
    if (star) params.star = star;
    const res = await apiClient.get<CourseReviewsResponse>(url, { params });
    return res.data;
  },

  // Student: Check review eligibility & fetch their existing review
  getMyReviewEligibility: async (
    courseIdOrSlug: string,
  ): Promise<MyReviewEligibility> => {
    const url = API_ENDPOINTS.ACADEMY.REVIEWS.MY_REVIEW.replace(
      ":courseId",
      encodeURIComponent(courseIdOrSlug),
    );
    const res = await apiClient.get<MyReviewEligibility>(url);
    return res.data;
  },

  // Student: Submit a new review
  createReview: async (
    courseIdOrSlug: string,
    payload: CreateReviewPayload,
  ): Promise<CourseReview> => {
    const url = API_ENDPOINTS.ACADEMY.REVIEWS.ACTION.replace(
      ":courseId",
      encodeURIComponent(courseIdOrSlug),
    );
    const res = await apiClient.post<CourseReview>(url, payload);
    return res.data;
  },

  // Student: Update existing review
  updateReview: async (
    courseIdOrSlug: string,
    reviewId: string,
    payload: UpdateReviewPayload,
  ): Promise<CourseReview> => {
    const url = `${API_ENDPOINTS.ACADEMY.REVIEWS.ACTION.replace(
      ":courseId",
      encodeURIComponent(courseIdOrSlug),
    )}/${encodeURIComponent(reviewId)}`;
    const res = await apiClient.patch<CourseReview>(url, payload);
    return res.data;
  },

  // Student: Delete existing review
  deleteReview: async (
    courseIdOrSlug: string,
    reviewId: string,
  ): Promise<{ message: string }> => {
    const url = `${API_ENDPOINTS.ACADEMY.REVIEWS.ACTION.replace(
      ":courseId",
      encodeURIComponent(courseIdOrSlug),
    )}/${encodeURIComponent(reviewId)}`;
    const res = await apiClient.delete<{ message: string }>(url);
    return res.data;
  },

  // Admin: Get all reviews across courses
  adminGetAllReviews: async (
    page = 1,
    limit = 20,
    courseId?: string,
    rating?: number,
    search?: string,
  ): Promise<{ reviews: CourseReview[]; pagination: any }> => {
    const params: Record<string, any> = { page, limit };
    if (courseId) params.courseId = courseId;
    if (rating) params.rating = rating;
    if (search) params.search = search;
    const res = await apiClient.get<{ reviews: CourseReview[]; pagination: any }>(
      API_ENDPOINTS.ACADEMY.REVIEWS.ADMIN_ALL,
      { params },
    );
    return res.data;
  },

  // Admin: Delete/moderate any review
  adminDeleteReview: async (reviewId: string): Promise<{ message: string }> => {
    const url = API_ENDPOINTS.ACADEMY.REVIEWS.ADMIN_DELETE.replace(
      ":reviewId",
      encodeURIComponent(reviewId),
    );
    const res = await apiClient.delete<{ message: string }>(url);
    return res.data;
  },
};
