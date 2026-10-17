import { useAuthStore } from "@/lib/store/auth-store";
import type { ApiEnvelope, ApiErrorBody, LoginResponse } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages.join(", "));
    this.name = "ApiError";
    this.status = status;
    this.messages = messages;
  }
}

/** HTTP 402 — the clinic's subscription is inactive/expired. */
export class SubscriptionInactiveError extends ApiError {
  constructor(messages: string[]) {
    super(402, messages);
    this.name = "SubscriptionInactiveError";
  }
}

/**
 * A gated call was rejected because the session could not be recovered
 * (refresh token expired/invalid). The caller has already been redirected
 * to the login page — handle this error silently.
 */
export class SessionExpiredError extends ApiError {
  constructor(messages: string[]) {
    super(401, messages);
    this.name = "SessionExpiredError";
  }
}

export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not available yet — the backend endpoint has not been implemented.`);
  }
}

// Endpoints that never need (and must not trigger) a token-refresh retry.
const AUTH_FREE = [
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/auth/password-reset/request",
  "/auth/password-reset/confirm",
  "/auth/email/verify/confirm",
];

function extractMessages(body: ApiErrorBody | null, res: Response): string[] {
  if (body && "messages" in body && Array.isArray(body.messages) && body.messages.length) {
    return body.messages;
  }
  return [`Request failed (${res.status})`];
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * POST /auth/refresh with the persisted refresh token; rotates both tokens
 * and resolves true when a new access token is available for a retry.
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const { refreshToken, setAuthTokens, logoutStaff } = useAuthStore.getState();
    if (!refreshToken) return false;

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const body = (await res.json().catch(() => null)) as ApiEnvelope<LoginResponse> | null;
      if (!res.ok || !body?.data?.access_token) throw new Error("refresh failed");

      setAuthTokens(body.data.access_token, body.data.refresh_token || refreshToken);
      return true;
    } catch {
      // The session is no longer recoverable — drop the staff session and
      // send the user back to sign in (the caller's rejection is expected
      // to surface as SessionExpiredError; ignore it silently).
      logoutStaff();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/staff/login")
      ) {
        window.location.assign("/staff/login");
      }
      return false;
    } finally {
      // Coalesce only same-tick callers; clear so failed sessions can re-run.
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`/api${path}`, { ...init, headers });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | ApiErrorBody | null;

  if (!res.ok) {
    const messages = body && "messages" in body ? body.messages : ["Request failed"];
    throw new ApiError(res.status, messages);
  }

  return (body as ApiEnvelope<T>).data;
}
