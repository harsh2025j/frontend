export interface forgotPasswordRequest {
  email: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roles?: string[];
  permissions?: string[];
  createdBy?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}
// export interface ForgotPassword {
//   email: string;
//   otp: string;
// }

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  conformPassword: string;
}
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

export interface Role {
  _id: string;
  name: string;
  slug?: string;
  permissions?: Permission[];
  isDeleted: boolean;
  description?: string | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  assignedBy?: string | null;
  assignedAt?: string | null;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  roles: Role[];
  permissions: Permission[];
  isActive: boolean;
  isVerified: boolean;
  preferredLanguage: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface ForgotPasswordResponse {
  success: string;
  message: string;
}

export interface VerifyOtpResponse {
  token: string;
  user?: AuthUser;
  message?: string;
}

export interface ResetPasswordResponse {
  success: string;
  message: string;
}
export interface ResendOtpResponse {
  success: string;
  message: string;
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
