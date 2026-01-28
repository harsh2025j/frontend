import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { CreateCategoryRequest, UpdateCategoryRequest } from "../../features/category/category.types";

export const categoryApi = {
    fetchCategories: async () => {
        return await apiClient.get(API_ENDPOINTS.CATEGORIES.FETCH_ALL_CATEGORY, {
            headers: {
                // "ngrok-skip-browser-warning": "true",
            },
        });
    },
    createCategory: async (data: CreateCategoryRequest) => {
        return await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, data);
    },
    updateCategory: async (data: UpdateCategoryRequest) => {
        const { id, ...body } = data;
        return await apiClient.post(`${API_ENDPOINTS.CATEGORIES.CREATE}/${id}`, body);
    },
    deleteCategory: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.CATEGORIES.CREATE}/${id}`);
    },
};
