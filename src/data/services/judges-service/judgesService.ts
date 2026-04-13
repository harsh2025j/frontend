import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";
import { CreateJudgeRequest, UpdateJudgeRequest } from "./judges.types";

export const judgesService = {
    getAll: async (params?: { q?: string; court?: string; courtType?: string; category?: string; year?: string; page?: number; limit?: number; status?: string }) => {
        return await apiClient.get(API_ENDPOINTS.JUDGES.BASE, { params });
    },
    getById: async (id: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGES.BASE}/${id}`);
    },
    create: async (data: any) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'photo' && value) {
                    // Duck-type check: a File has 'name', 'size', and is a Blob
                    if (value instanceof File || (typeof value === 'object' && 'name' in value && 'size' in value)) {
                        console.log('[SERVICE] Appending photo file:', (value as File).name, (value as File).size);
                        formData.append('photo', value as File);
                    }
                } else if (key === 'specialization' && Array.isArray(value)) {
                    value.forEach(v => formData.append('specialization', v));
                } else if (key === 'dataSource' && typeof value === 'object') {
                    formData.append('dataSource', JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        // IMPORTANT: Delete the default Content-Type so Axios can auto-set
        // 'multipart/form-data; boundary=...' correctly for the file upload.
        // The apiClient has 'application/json' as a global default which blocks this.
        return await apiClient.post(API_ENDPOINTS.JUDGES.BASE, formData, {
            headers: { 'Content-Type': undefined }
        });
    },
    update: async (id: string, data: any) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'photo' && value) {
                    if (value instanceof File || (typeof value === 'object' && 'name' in value && 'size' in value)) {
                        console.log('[SERVICE] Appending photo file:', (value as File).name, (value as File).size);
                        formData.append('photo', value as File);
                    }
                } else if (key === 'specialization' && Array.isArray(value)) {
                    value.forEach(v => formData.append('specialization', v));
                } else if (key === 'dataSource' && typeof value === 'object') {
                    formData.append('dataSource', JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        // IMPORTANT: Delete the default Content-Type so Axios can auto-set
        // 'multipart/form-data; boundary=...' correctly for the file upload.
        return await apiClient.patch(`${API_ENDPOINTS.JUDGES.BASE}/${id}`, formData, {
            headers: { 'Content-Type': undefined }
        });
    },
    delete: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.JUDGES.BASE}/${id}`);
    },
    getActive: async () => {
        return await apiClient.get(API_ENDPOINTS.JUDGES.ACTIVE);
    },
    getByCourt: async (court: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGES.BY_COURT}/${court}`);
    },
    searchJudges: async (q: string, page: number = 1, limit: number = 10, category?: string, courtType?: string, year?: string, court?: string) => {
        return await apiClient.get(API_ENDPOINTS.JUDGES.BASE, {
            params: { q, page, limit, category, courtType, year, court }
        });
    },
    getTopJudges: async (page = 1, limit = 5, court?: string) => {
        return await apiClient.get(API_ENDPOINTS.JUDGES.TOP, {
            params: { page, limit, court }
        });
    },
    getUniqueCourts: async () => {
        return await apiClient.get(API_ENDPOINTS.JUDGES.UNIQUE_COURTS);
    }
};
