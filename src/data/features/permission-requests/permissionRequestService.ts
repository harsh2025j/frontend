import apiClient from "@/data/services/apiConfig/apiClient";

export interface CreatePermissionRequestPayload {
    requestedPermissionIds: string[];
    requestedRoleIds?: string[];
    dob: string;
    phoneNumber: string;
    state: string;
    city: string;
    designation: string;
    yearsOfExperience?: number;
    specialization: string;
    barRegistrationNumber?: string;
}

export interface UpdatePermissionRequestStatusPayload {
    status: 'accepted' | 'rejected';
    adminNote?: string;
    grantedRoleIds?: string[];
    grantedPermissionIds?: string[];
}

export const permissionRequestService = {
    create: async (payload: CreatePermissionRequestPayload) => {
        const response = await apiClient.post('/permission-requests', payload);
        return response.data?.data || response.data;
    },

    getMyRequests: async () => {
        const response = await apiClient.get('/permission-requests/my');
        return response.data?.data || response.data;
    },

    getAllRequests: async () => {
        const response = await apiClient.get('/permission-requests');
        return response.data?.data || response.data;
    },

    updateStatus: async (id: string, payload: UpdatePermissionRequestStatusPayload) => {
        const response = await apiClient.patch(`/permission-requests/${id}/status`, payload);
        return response.data?.data || response.data;
    }
};
