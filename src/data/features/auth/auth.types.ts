export interface forgotPasswordRequest{
  email:string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?:string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest{
  email:string;
}
// export interface ForgotPassword {
//   email: string;
//   otp: string;
// }
 
export interface ResetPasswordRequest{
  email:string;
  otp:string;
  newPassword:string;
  conformPassword:string;
}
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  user?: AuthUser;
}

export interface ForgotPasswordResponse{
 success:string;
 message:string;
}

export interface VerifyOtpResponse {
  token: string;
  user?: AuthUser;
  message?: string;
}

export interface ResetPasswordResponse{
  success:string;
  message:string;
}
export interface ResendOtpResponse{
  success:string;
  message:string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  message: string | null;
  debugOtp?: string | null;
}

// ----------------------------------------------------
// DETAILED USER/PROFILE/RBAC TYPES (Source of Truth)
// ----------------------------------------------------

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
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  preferredLanguage: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  phone?: string; // Added optional fields common in profile
  dob?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: UserData;
}