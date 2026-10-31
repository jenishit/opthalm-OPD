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
  clinic_name: string;
  registration_no: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_email: string;
  admin_password: string;
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
