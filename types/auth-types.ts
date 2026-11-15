// Shapes for the public /auth and /signup endpoints. Mirrors the Go backend
// contract served at ${BACKEND_URL}/swagger/doc.json.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  session_id: string;
  user_id: string;
  user_type: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ConfirmPasswordResetRequest {
  token: string;
  new_password: string;
}

export interface ConfirmEmailVerificationRequest {
  token: string;
}
