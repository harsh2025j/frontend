
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

export interface AuthState {
  loading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  message: string | null;
  debugOtp?: string | null;
}

