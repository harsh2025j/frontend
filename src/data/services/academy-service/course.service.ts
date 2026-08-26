import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";

export interface CreateCourseDto {
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  status?: string;
  language?: string;
  level?: string;
  category?: string;
  requirements?: string[];
  whatYouWillLearn?: string[];
  durationHours?: number;
  duration?: string;
  teachingHours?: string;
  startDate?: string;
  endDate?: string;
  instructorId: string;
  instructorName?: string;
  instructorBio?: string;
  instructorImage?: string;
  targetAudience?: string[];
  features?: string[];
  faqs?: {q: string, a: string}[];
  slug?: string;
}

export const courseApi = {
  fetchCourses: async () => {
    return await apiClient.get<any>(API_ENDPOINTS.ACADEMY.COURSES);
  },

  fetchCourseById: async (id: string) => {
    return await apiClient.get<any>(`${API_ENDPOINTS.ACADEMY.COURSES}/${id}`);
  },

  fetchCategories: async (query?: string) => {
    return await apiClient.get<any>(API_ENDPOINTS.ACADEMY.CATEGORIES, { params: { q: query } });
  },

  createCategory: async (data: { name: string }) => {
    return await apiClient.post<any>(API_ENDPOINTS.ACADEMY.CATEGORIES, data);
  },

  createCourse: async (data: CreateCourseDto) => {
    return await apiClient.post<any>(API_ENDPOINTS.ACADEMY.COURSES, data);
  },

  updateCourse: async (id: string, data: Partial<CreateCourseDto>) => {
    return await apiClient.patch<any>(`${API_ENDPOINTS.ACADEMY.COURSES}/${id}`, data);
  },

  deleteCourse: async (id: string) => {
    return await apiClient.delete<any>(`${API_ENDPOINTS.ACADEMY.COURSES}/${id}`);
  },

  // Modules
  createModule: async (courseId: string, data: { title: string; orderIndex: number; parentId?: string }) => {
    return await apiClient.post<any>(`${API_ENDPOINTS.ACADEMY.COURSES}/${courseId}/modules`, data);
  },
  updateModule: async (courseId: string, moduleId: string, data: any) => {
    return await apiClient.patch<any>(`${API_ENDPOINTS.ACADEMY.COURSES}/${courseId}/modules/${moduleId}`, data);
  },
  deleteModule: async (courseId: string, moduleId: string) => {
    return await apiClient.delete<any>(`${API_ENDPOINTS.ACADEMY.COURSES}/${courseId}/modules/${moduleId}`);
  },

  // Curriculum Items
  createCurriculumItem: async (courseId: string, data: any) => {
    return await apiClient.post<any>(`${API_ENDPOINTS.ACADEMY.COURSES}/${courseId}/curriculum`, data);
  },
  reorderCurriculumItems: async (data: any) => {
    // Expected payload depends on backend ReorderItemsDto, typically { items: [{ id, orderIndex, moduleId }] }
    return await apiClient.post<any>(`/academy/curriculum/reorder`, data); 
  },
  updateCurriculumItem: async (itemId: string, data: any) => {
    return await apiClient.patch<any>(`/academy/curriculum/${itemId}`, data);
  },
  deleteCurriculumItem: async (itemId: string) => {
    return await apiClient.delete<any>(`/academy/curriculum/${itemId}`);
  }
};
