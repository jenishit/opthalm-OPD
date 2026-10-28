import { useAuthStore } from "@/stores/authStore";
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
} from "@/types/api-types";

/** POST /auth/login — public. */
export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /auth/refresh — public; rotates the access/refresh pair. */
export function refresh(body: RefreshRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /auth/logout — revokes the refresh token/session. */
export function logout(body: RefreshRequest): Promise<void> {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /signup — public; registers a clinic + admin and signs in. */
export function signup(body: SignupRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /auth/password-reset/request — public. */
export function requestPasswordReset(body: RequestPasswordResetRequest): Promise<void> {
  return apiFetch<void>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /auth/password-reset/confirm — public. */
export function confirmPasswordReset(body: ConfirmPasswordResetRequest): Promise<void> {
  return apiFetch<void>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /auth/email/verify/confirm — public. */
export function confirmEmailVerification(body: ConfirmEmailVerificationRequest): Promise<void> {
  return apiFetch<void>("/auth/email/verify/confirm", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /auth/email/verify/resend — requires a token. */
export function resendEmailVerification(): Promise<void> {
  return apiFetch<void>("/auth/email/verify/resend", { method: "POST" });
}

/**
 * POST /auth/logout helper that also clears the local session, for use by
 * the header/logout controls.
 */
export async function logoutStaffSession(): Promise<void> {
  const { refreshToken, logoutStaff } = useAuthStore.getState();
  try {
    if (refreshToken) {
      try {
        await logout({ refresh_token: refreshToken });
      } catch {
        // Best effort: the server may have already dropped this session
        // (expired refresh token, network). Clearing locally is what matters.
      }
    }
  } finally {
    logoutStaff();
  }
}
