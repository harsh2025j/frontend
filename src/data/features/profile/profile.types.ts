// ================= Permissions =================
export interface Permission {
  _id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  source?: string;
  grantedBy?: string | null;
  grantedAt?: string | null;
}

// ================= Roles (NO permissions here) =================
export interface Role {
  _id: string;
  name: string;
  slug?: string;

  // Removed:
  // permissions?: Permission[];

  isDeleted?: boolean;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  assignedBy?: string | null;
  assignedAt?: string | null;
}

// ================= User Data =================
export interface UserData {
  _id: string;
  id?: string;
  name: string;
  email: string;
  username: string;
  profilePicture?: string | null;
  roles: Role[];
  permissions: Permission[]; // only here
  isActive: boolean;
  isVerified: boolean;
  preferredLanguage: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  phone?: string;
  dob?: string;
  city?: string;
  state?: string;
  designation?: string;
  yearsOfExperience?: number;
  specialization?: string[];
  barRegistrationNumber?: string;
  court?: string;
  bio?: string;
  workingDays?: string[];
  workingHours?: string;
  appointmentPricing?: string;
  savedPosts?: string[];
  articles?: any[];
  cases?: any[];
  totalArticles?: number;
  totalCases?: number;
}

// ================= Update Profile =================
export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  dob?: string;
  avatar?: File | null;
  city?: string;
  state?: string;
  designation?: string;
  yearsOfExperience?: number;
  specialization?: string[];
  barRegistrationNumber?: string;
  court?: string;
  bio?: string;
  workingDays?: string[];
  workingHours?: string;
  appointmentPricing?: string;
}

// ================= API Response =================
export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserData;
}

// ================= Preferences =================
export interface UserPreferences {
  language: string;
  doNotDisturb: boolean;
  caseStatusAlerts: boolean;
}

// ================= Redux/State =================
export interface ProfileState {
  loading: boolean;
  error: string | null;
  user: UserData | null;
  message: string | null;
}
