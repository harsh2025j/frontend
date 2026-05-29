import apiClient from '../apiConfig/apiClient';
import { API_ENDPOINTS } from '../apiConfig/apiContants';

export const payoutsService = {
  getCommissionRate: async () => {
    return apiClient.get(API_ENDPOINTS.PAYOUTS.GET_COMMISSION);
  },
  
  updateCommissionRate: async (rate: number) => {
    return apiClient.patch(API_ENDPOINTS.PAYOUTS.UPDATE_COMMISSION, { rate });
  },
  
  getAdvocatesList: async (page: number = 1, limit: number = 10) => {
    return apiClient.get(API_ENDPOINTS.PAYOUTS.GET_ADVOCATES, {
      params: { page, limit }
    });
  },
  
  getAdvocateDetails: async (id: string) => {
    return apiClient.get(API_ENDPOINTS.PAYOUTS.GET_ADVOCATE_DETAILS.replace(':id', id));
  },
  
  getAdvocateAppointments: async (id: string, page: number = 1, limit: number = 20) => {
    return apiClient.get(API_ENDPOINTS.PAYOUTS.GET_ADVOCATE_APPOINTMENTS.replace(':id', id), {
      params: { page, limit }
    });
  },

  getAdvocateDocuments: async (id: string, page: number = 1, limit: number = 20) => {
    return apiClient.get(API_ENDPOINTS.PAYOUTS.GET_ADVOCATE_DOCUMENTS.replace(':id', id), {
      params: { page, limit }
    });
  },

  getAdvocatePayoutHistory: async (id: string, page: number = 1, limit: number = 20) => {
    return apiClient.get(API_ENDPOINTS.PAYOUTS.GET_ADVOCATE_PAYOUT_HISTORY.replace(':id', id), {
      params: { page, limit }
    });
  },
  
  logPayout: async (id: string, amount: number, adminNote: string) => {
    return apiClient.post(API_ENDPOINTS.PAYOUTS.LOG_PAYOUT.replace(':id', id), { amount, adminNote });
  }
};
