export interface Role {
  _id: string;
  name: string;
  slug: string;
  isDeleted: boolean;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  _id: string;
  name: string;
  description: string;
  isDeleted: boolean;
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  preferredLanguage: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  phone?: string; 
  dob?: string;
}

// --- Interfaces for API Requests ---
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  dob?: string;
  avatar?: File | null;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserData; 
}

export interface UserPreferences {
  language: string;
  doNotDisturb: boolean;
  caseStatusAlerts: boolean;
}

export interface ProfileState {
  loading: boolean;
  error: string | null;
  user: UserData | null;
  message: string | null;
}