import { createSlice } from "@reduxjs/toolkit";
import { MatterTeamState } from "./matter-team.types";
import {
  createTeamMember,
  fetchTeamByMatter,
  fetchMattersByUser,
  checkUserAccess,
  updateTeamMember,
  removeTeamMember,
  removeUserFromMatter,
} from "./matterTeamThunks";

const initialState: MatterTeamState = {
  teamMembers: [],
  loading: false,
  error: null,
  message: null,
};

const matterTeamSlice = createSlice({
  name: "matterTeam",
  initialState,
  reducers: {
    clearMatterTeamMessage: (state) => {
      state.message = null;
      state.error = null;
    },
    clearMatterTeamError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Team Member
    builder
      .addCase(createTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers.push(action.payload);
        state.message = "Team member added successfully";
      })
      .addCase(createTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Team by Matter
    builder
      .addCase(fetchTeamByMatter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamByMatter.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = action.payload;
      })
      .addCase(fetchTeamByMatter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Matters by User
    builder
      .addCase(fetchMattersByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMattersByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = action.payload;
      })
      .addCase(fetchMattersByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Check User Access
    builder
      .addCase(checkUserAccess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkUserAccess.fulfilled, (state) => {
        state.loading = false;
        // This doesn't modify state, just returns access info
      })
      .addCase(checkUserAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Team Member
    builder
      .addCase(updateTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.teamMembers.findIndex(
          (member) => member.id === action.payload.id
        );
        if (index !== -1) {
          state.teamMembers[index] = action.payload;
        }
        state.message = "Team member updated successfully";
      })
      .addCase(updateTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove Team Member
    builder
      .addCase(removeTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = state.teamMembers.filter(
          (member) => member.id !== action.payload
        );
        state.message = "Team member removed successfully";
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove User from Matter
    builder
      .addCase(removeUserFromMatter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUserFromMatter.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = state.teamMembers.filter(
          (member) =>
            !(
              member.matterId === action.payload.matterId &&
              member.userId === action.payload.userId
            )
        );
        state.message = "User removed from matter successfully";
      })
      .addCase(removeUserFromMatter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMatterTeamMessage, clearMatterTeamError } = matterTeamSlice.actions;
export default matterTeamSlice.reducer;
