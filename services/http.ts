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

export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not available yet — the backend endpoint has not been implemented.`);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
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
