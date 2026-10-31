import { signOut } from "next-auth/react";
import { useAuthStore } from "@/stores/authStore";
import type { ApiEnvelope, ApiErrorBody } from "@/types/http-types";
import type { LoginResponse } from "@/types/auth-types";

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
let lastRefreshAt = 0;

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
      lastRefreshAt = Date.now();
      return true;
    } catch {
      // The session is no longer recoverable — drop the staff session and
      // send the user back to sign in (the caller's rejection is expected
      // to surface as SessionExpiredError; ignore it silently).
      //
      // Must go through next-auth's signOut() rather than a manual redirect:
      // logoutStaff() only clears the local store, but the NextAuth session
      // cookie is a self-contained 7-day JWT that doesn't know the backend
      // revoked this session. A bare `window.location.assign("/login")`
      // leaves that cookie valid, and the auth route layout treats any
      // signed-in cookie as reason to immediately redirect back to /queue —
      // an infinite redirect loop that never lets the user re-authenticate.
      logoutStaff();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        signOut({ callbackUrl: "/login" });
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
  // Leave FormData bodies alone — the browser sets the multipart boundary
  // itself; overriding it here would break the upload.
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`/api${path}`, { ...init, headers });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | ApiErrorBody | null;

  if (!res.ok) {
    if (res.status === 402) {
      throw new SubscriptionInactiveError(extractMessages(body as ApiErrorBody, res));
    }

    // Expired access token → rotate via the refresh token and retry once.
    if (res.status === 401 && !AUTH_FREE.some((p) => path.startsWith(p))) {
      const messages = extractMessages(body as ApiErrorBody, res);
      // The Go backend answers a role denial with the same 401 status it uses
      // for a dead token and tells the two apart by message: "user is
      // unauthorized to access the resource" (RBAC) vs the token being
      // expired. A denial must surface to the caller — it is not a dead
      // session, so do not refresh, log out or redirect.
      if (messages.some((m) => /unauthorized to access the resource/i.test(m))) {
        throw new ApiError(401, messages);
      }
      if (retried === false) {
        // Another pending 401 may have just rotated the token already; retry
        // with the current token instead of refreshing a second time with a
        // possibly consumed refresh-token pair.
        const current = useAuthStore.getState().accessToken;
        if (current && current !== token && Date.now() - lastRefreshAt < 15000) {
          return apiFetch<T>(path, init, true);
        }
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return apiFetch<T>(path, init, true);
        }
      }
      // Session unrecoverable: the redirect to /login is already in
      // flight; fail with a distinct error so callers can ignore quietly.
      throw new SessionExpiredError(messages);
    }

    throw new ApiError(res.status, extractMessages(body as ApiErrorBody, res));
  }

  return (body as ApiEnvelope<T>).data;
}
