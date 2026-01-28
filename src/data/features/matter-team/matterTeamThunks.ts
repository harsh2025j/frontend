import { createAsyncThunk } from "@reduxjs/toolkit";
import matterTeamApi from "@/data/services/matter-team-service/matterTeam.service";
import { CreateMatterTeamDto, UpdateMatterTeamDto } from "./matter-team.types";

interface ApiError {
  message?: string;
}

/**
 * Create a new matter team member
 */
export const createTeamMember = createAsyncThunk(
  "matterTeam/createTeamMember",
  async (
    { data, assignedBy }: { data: CreateMatterTeamDto; assignedBy: string },
    thunkAPI
  ) => {
    try {
      const result = await matterTeamApi.createTeamMember(data, assignedBy);
      return result;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to add team member"
      );
    }
  }
);

/**
 * Fetch all team members for a specific matter
 */
export const fetchTeamByMatter = createAsyncThunk(
  "matterTeam/fetchTeamByMatter",
  async (matterId: string, thunkAPI) => {
    try {
      const result = await matterTeamApi.getTeamByMatter(matterId);
      return result;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to fetch matter team"
      );
    }
  }
);

/**
 * Fetch all matters a user is assigned to
 */
export const fetchMattersByUser = createAsyncThunk(
  "matterTeam/fetchMattersByUser",
  async (userId: string, thunkAPI) => {
    try {
      const result = await matterTeamApi.getMattersByUser(userId);
      return result;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to fetch user matters"
      );
    }
  }
);

/**
 * Check if user has access to a matter
 */
export const checkUserAccess = createAsyncThunk(
  "matterTeam/checkUserAccess",
  async (
    { matterId, userId }: { matterId: string; userId: string },
    thunkAPI
  ) => {
    try {
      const result = await matterTeamApi.checkUserAccess(matterId, userId);
      return result;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to check access"
      );
    }
  }
);

/**
 * Update a team member's role or access level
 */
export const updateTeamMember = createAsyncThunk(
  "matterTeam/updateTeamMember",
  async (
    { id, data }: { id: string; data: UpdateMatterTeamDto },
    thunkAPI
  ) => {
    try {
      const result = await matterTeamApi.updateTeamMember(id, data);
      return result;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to update team member"
      );
    }
  }
);

/**
 * Remove a team member from a matter
 */
export const removeTeamMember = createAsyncThunk(
  "matterTeam/removeTeamMember",
  async (id: string, thunkAPI) => {
    try {
      await matterTeamApi.removeTeamMember(id);
      return id;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to remove team member"
      );
    }
  }
);

/**
 * Remove a specific user from a specific matter
 */
export const removeUserFromMatter = createAsyncThunk(
  "matterTeam/removeUserFromMatter",
  async (
    { matterId, userId }: { matterId: string; userId: string },
    thunkAPI
  ) => {
    try {
      await matterTeamApi.removeUserFromMatter(matterId, userId);
      return { matterId, userId };
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to remove user from matter"
      );
    }
  }
);
