import apiClient from "../apiConfig/apiClient";
import { CreateMatterTeamDto, UpdateMatterTeamDto, MatterTeamMember, CheckAccessResponse } from "@/data/features/matter-team/matter-team.types";

const BASE_URL = "/matter-team";

const matterTeamApi = {
  /**
   * Create a new matter team member
   */
  createTeamMember: async (data: CreateMatterTeamDto, assignedBy: string): Promise<MatterTeamMember> => {
    const response = await apiClient.post(BASE_URL, { ...data, assignedBy });
    return response.data;
  },

  /**
   * Get all team members for a specific matter
   */
  getTeamByMatter: async (matterId: string): Promise<MatterTeamMember[]> => {
    const response = await apiClient.get(`${BASE_URL}/matter/${matterId}`);
    return response.data;
  },

  /**
   * Get all matters a user is assigned to
   */
  getMattersByUser: async (userId: string): Promise<MatterTeamMember[]> => {
    const response = await apiClient.get(`${BASE_URL}/user/${userId}`);
    return response.data;
  },

  /**
   * Check if a user has access to a specific matter
   */
  checkUserAccess: async (matterId: string, userId: string): Promise<CheckAccessResponse> => {
    const response = await apiClient.get(`${BASE_URL}/check-access`, {
      params: { matterId, userId }
    });
    return response.data;
  },

  /**
   * Get a single team member by ID
   */
  getTeamMemberById: async (id: string): Promise<MatterTeamMember> => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Update a team member's role or access level
   */
  updateTeamMember: async (id: string, data: UpdateMatterTeamDto): Promise<MatterTeamMember> => {
    const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Remove a team member (soft delete)
   */
  removeTeamMember: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Remove a specific user from a specific matter
   */
  removeUserFromMatter: async (matterId: string, userId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/matter/${matterId}/user/${userId}`);
  },
};

export default matterTeamApi;
