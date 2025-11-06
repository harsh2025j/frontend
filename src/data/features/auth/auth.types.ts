
export interface genOtpRequest{
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
  number?:string;
  state?:string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}
// export interface ForgotPassword {
//   email: string;
//   otp: string;
// }

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

export interface VerifyOtpResponse {
  token: string;
  user?: AuthUser;
  message?: string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  message: string | null;
}
