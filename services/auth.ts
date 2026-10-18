import { useAuthStore } from "@/lib/store/auth-store";
import { apiFetch } from "./http";
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RequestPasswordResetRequest,
  ConfirmPasswordResetRequest,
  ConfirmEmailVerificationRequest,
  SignupRequest,
  ProfileResponse,
} from "@/types/api";

/** POST /auth/login — public. */
export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getMyProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile/getme");
}
