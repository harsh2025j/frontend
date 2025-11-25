import { UserData } from "@/data/features/auth/auth.types"; // <--- IMPORTS UserData

// --- Interfaces for Redux State ---
export interface ProfileState {
  loading: boolean;
  error: string | null;
  user: UserData | null; // References the imported core user type
  message: string | null;
}

// --- Interfaces for API Requests ---
// Fields we expect the user to update on the profile page
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  dob?: string;
}

// --- Interfaces for API Responses ---
export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserData; // References the imported core user type
}

// --- Interfaces for User Preferences/Settings (local state/localStorage only) ---
export interface UserPreferences {
  language: string;
  doNotDisturb: boolean;
  caseStatusAlerts: boolean;
}